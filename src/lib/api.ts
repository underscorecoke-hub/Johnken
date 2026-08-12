import { ApiSettings, WalletState, GasEstimation, TransactionRecord, SponsorPoolInfo, ApiKeyValidation, NetworkType } from '../types';

export async function getApiSettings(): Promise<ApiSettings> {
  const res = await fetch('/api/settings');
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch settings');
  return data.settings;
}

export async function saveApiSettings(settings: Partial<ApiSettings>): Promise<ApiSettings> {
  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to save settings');
  return data.settings;
}

export async function testApiKey(service: 'trongrid' | 'tatum' | 'infura' | 'sponsor', apiKey?: string, rpcUrl?: string): Promise<ApiKeyValidation> {
  const res = await fetch('/api/test-api-key', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ service, apiKey, rpcUrl })
  });
  const data = await res.json();
  return {
    service,
    status: data.status,
    message: data.message,
    latencyMs: data.latencyMs
  };
}

export async function checkWalletBalance(address: string, network: NetworkType = 'tron-mainnet'): Promise<WalletState> {
  const res = await fetch('/api/check-balance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, network })
  });
  const data = await res.json();
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
  const res = await fetch('/api/estimate-gas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromAddress, toAddress, amount, network })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to estimate gas');
  return data;
}

export async function sponsorGasFee(targetAddress: string, requiredTrx: number, network: NetworkType) {
  const res = await fetch('/api/sponsor-gas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetAddress, requiredTrx, network })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Gas fee sponsorship failed');
  return data;
}

export async function broadcastWithdrawal(fromAddress: string, toAddress: string, amount: number, token: string, network: NetworkType, isGasSponsored: boolean = true) {
  const res = await fetch('/api/broadcast-tx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromAddress, toAddress, amount, token, network, isGasSponsored })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Withdrawal transaction failed');
  return data;
}

export async function getSponsorPoolInfo(): Promise<SponsorPoolInfo> {
  const res = await fetch('/api/sponsor-pool');
  const data = await res.json();
  if (!data.success) throw new Error('Failed to fetch sponsor pool info');
  return data.sponsorPool;
}

export async function getTransactionHistory(): Promise<TransactionRecord[]> {
  const res = await fetch('/api/tx-history');
  const data = await res.json();
  if (!data.success) throw new Error('Failed to fetch transaction history');
  return data.history;
}

export async function clearTransactionHistory(): Promise<void> {
  await fetch('/api/clear-tx-history', { method: 'POST' });
}
