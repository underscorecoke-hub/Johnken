import { ApiSettings, WalletState, GasEstimation, TransactionRecord, SponsorPoolInfo, ApiKeyValidation, NetworkType, MarketPrices } from '../types';

/**
 * Helper to execute fetch calls safely without crashing on non-OK HTML responses (e.g. 404, 500 error pages).
 * Checks response.ok / response.status and reads text first before attempting JSON parsing.
 */
async function safeFetchJson<T = any>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (err: any) {
    console.error(`Network fetch failure for ${url}:`, err);
    throw new Error(`Network error: ${err.message || 'Unable to reach backend service'}`);
  }

  // Read response as plain text first to prevent JSON syntax crash on HTML error pages
  let responseText = '';
  try {
    responseText = await response.text();
  } catch (err: any) {
    console.error(`Failed to read response body from ${url}:`, err);
    throw new Error(`Response read error (Status ${response.status}): ${err.message}`);
  }

  // Attempt JSON parsing safely
  let data: any = null;
  let isJson = false;

  if (responseText && responseText.trim()) {
    try {
      data = JSON.parse(responseText);
      isJson = true;
    } catch (parseErr) {
      isJson = false;
    }
  }

  // Handle non-2xx HTTP status codes safely
  if (!response.ok) {
    const status = response.status;
    const statusText = response.statusText || 'Error';

    if (isJson && data) {
      const errorMessage = data.error || data.message || `Server error (${status}): ${statusText}`;
      console.error(`API endpoint ${url} returned error status ${status}:`, data);
      throw new Error(errorMessage);
    }

    // Response is non-JSON HTML error page or raw text (e.g., 404 or 500 starting with "The page could not be found...")
    const cleanSnippet = responseText
      ? responseText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 150)
      : statusText;

    console.error(`API endpoint ${url} returned non-OK status ${status} (${statusText}). Raw response text:`, responseText);
    throw new Error(`Server returned status error (${status} ${statusText}): ${cleanSnippet || 'Invalid endpoint response'}`);
  }

  // If status is OK (200-299) but response could not be parsed as valid JSON
  if (!isJson) {
    const cleanSnippet = responseText
      ? responseText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 150)
      : 'empty body';

    console.error(`API endpoint ${url} returned HTTP ${response.status} but response body is not valid JSON. Raw text:`, responseText);
    throw new Error(`Unexpected non-JSON response from server (${response.status}): ${cleanSnippet}`);
  }

  return data as T;
}

export async function getMarketPrices(): Promise<MarketPrices> {
  const data = await safeFetchJson<{ success: boolean; prices: MarketPrices }>('/api/prices');
  if (!data.success) throw new Error('Failed to fetch market prices');
  return data.prices;
}

export async function getApiSettings(): Promise<ApiSettings> {
  const data = await safeFetchJson<{ success: boolean; settings: ApiSettings; error?: string }>('/api/settings');
  if (!data.success) throw new Error(data.error || 'Failed to fetch settings');
  return data.settings;
}

export async function saveApiSettings(settings: Partial<ApiSettings>): Promise<ApiSettings> {
  const data = await safeFetchJson<{ success: boolean; settings: ApiSettings; error?: string }>('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  if (!data.success) throw new Error(data.error || 'Failed to save settings');
  return data.settings;
}

export async function testApiKey(service: 'trongrid' | 'tatum' | 'infura' | 'sponsor', apiKey?: string, rpcUrl?: string): Promise<ApiKeyValidation> {
  try {
    const data = await safeFetchJson<{ status: 'valid' | 'invalid'; message: string; latencyMs: number }>('/api/test-api-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service, apiKey, rpcUrl })
    });
    return {
      service,
      status: data.status,
      message: data.message,
      latencyMs: data.latencyMs
    };
  } catch (err: any) {
    return {
      service,
      status: 'invalid',
      message: err.message || 'API connection test failed',
      latencyMs: 0
    };
  }
}

export async function checkWalletBalance(address: string, network: NetworkType = 'tron-mainnet'): Promise<WalletState> {
  const data = await safeFetchJson<any>('/api/check-balance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, network })
  });
  if (!data.success) throw new Error(data.error || 'Failed to check balance');
  return {
    address: data.address,
    walletType: 'manual',
    connected: true,
    trxBalance: data.trxBalance,
    usdtBalance: data.usdtBalance,
    energyAvailable: data.energyAvailable,
    bandwidthAvailable: data.bandwidthAvailable,
    nativeGasSymbol: data.nativeGasSymbol,
    nativeGasBalance: data.nativeGasBalance,
    isStuck: data.isStuck,
    lastUpdated: data.lastUpdated
  };
}

export async function estimateGasFees(fromAddress: string, toAddress: string, amount: number, network: NetworkType): Promise<GasEstimation> {
  const data = await safeFetchJson<GasEstimation>('/api/estimate-gas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromAddress, toAddress, amount, network })
  });
  if (!data.success) throw new Error((data as any).error || 'Failed to estimate gas');
  return data;
}

export async function sponsorGasFee(targetAddress: string, requiredTrx: number, network: NetworkType) {
  const data = await safeFetchJson<any>('/api/sponsor-gas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetAddress, requiredTrx, network })
  });
  if (!data.success) throw new Error(data.error || 'Gas fee sponsorship failed');
  return data;
}

export async function broadcastWithdrawal(fromAddress: string, toAddress: string, amount: number, token: string, network: NetworkType, isGasSponsored: boolean = true) {
  const data = await safeFetchJson<any>('/api/broadcast-tx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromAddress, toAddress, amount, token, network, isGasSponsored })
  });
  if (!data.success) throw new Error(data.error || 'Withdrawal transaction failed');
  return data;
}

export async function getSponsorPoolInfo(): Promise<SponsorPoolInfo> {
  const data = await safeFetchJson<any>('/api/sponsor-pool');
  if (!data.success) throw new Error('Failed to fetch sponsor pool info');
  return data.sponsorPool;
}

export async function getTransactionHistory(): Promise<TransactionRecord[]> {
  const data = await safeFetchJson<any>('/api/tx-history');
  if (!data.success) throw new Error('Failed to fetch transaction history');
  return data.history;
}

export async function clearTransactionHistory(): Promise<void> {
  await safeFetchJson('/api/clear-tx-history', { method: 'POST' });
}

