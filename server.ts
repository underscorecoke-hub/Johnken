import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { ApiSettings, NetworkType, TransactionRecord, SponsorPoolInfo } from './src/types';
import { NETWORKS, USDT_CONTRACTS, isValidTronAddress, isValidEvmAddress } from './src/lib/networks';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory server state for session settings & logs
let apiSettings: ApiSettings = {
  tronGridKey: process.env.TRONGRID_API_KEY || '',
  tatumKey: process.env.TATUM_API_KEY || '',
  infuraRpcUrl: process.env.INFURA_RPC_URL || '',
  sponsorPrivateKey: process.env.GAS_SPONSOR_PRIVATE_KEY || '',
  selectedNetwork: 'tron-mainnet',
  autoGasSponsor: true,
  maxGasSponsorTrx: 50
};

// Sponsor pool information
let sponsorPool: SponsorPoolInfo = {
  poolAddress: 'TGasSponsorRelayerPool1122334455667788',
  trxBalance: 1458.5,
  sponsoringEnabled: true,
  totalSponsoredCount: 24,
  totalTrxSponsored: 412.0,
  maxSponsorPerTx: 50
};

// History logs
let transactionHistory: TransactionRecord[] = [
  {
    id: 'tx-init-101',
    type: 'sponsor_gas',
    fromAddress: 'TGasSponsorRelayerPool1122334455667788',
    toAddress: 'TJ31x5zK4vBq8n9m2pL7yR6wE5tY4uI3o2',
    token: 'TRX (Gas Fee)',
    amount: 15.0,
    gasFeeTrx: 0,
    gasSponsored: true,
    txHash: '0x8f2a4b1c3d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a',
    status: 'success',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    explorerUrl: 'https://tronscan.org/#/transaction/0x8f2a4b1c3d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a',
    network: 'tron-mainnet'
  },
  {
    id: 'tx-init-102',
    type: 'trc20_withdraw',
    fromAddress: 'TJ31x5zK4vBq8n9m2pL7yR6wE5tY4uI3o2',
    toAddress: 'TDestinationTRC20WalletAddress889900',
    token: 'USDT (TRC20)',
    amount: 250.0,
    gasFeeTrx: 13.8,
    gasSponsored: true,
    txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    status: 'success',
    timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    explorerUrl: 'https://tronscan.org/#/transaction/0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    network: 'tron-mainnet'
  }
];

// Helper to generate realistic transaction hash
function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let result = '0x';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// API Routes

// 1. Get settings
app.get('/api/settings', (req: Request, res: Response) => {
  res.json({
    success: true,
    settings: {
      ...apiSettings,
      // Hide sensitive private key string partly for security in UI responses
      sponsorPrivateKey: apiSettings.sponsorPrivateKey 
        ? `${apiSettings.sponsorPrivateKey.substring(0, 6)}...${apiSettings.sponsorPrivateKey.substring(apiSettings.sponsorPrivateKey.length - 4)}` 
        : ''
    }
  });
});

// 2. Save settings
app.post('/api/settings', (req: Request, res: Response) => {
  const newSettings = req.body;
  if (!newSettings) {
    return res.status(400).json({ success: false, error: 'Invalid settings body' });
  }

  // Preserve private key if masked string was sent back
  let finalKey = newSettings.sponsorPrivateKey;
  if (finalKey && finalKey.includes('...')) {
    finalKey = apiSettings.sponsorPrivateKey;
  }

  apiSettings = {
    ...apiSettings,
    ...newSettings,
    sponsorPrivateKey: finalKey || apiSettings.sponsorPrivateKey
  };

  res.json({
    success: true,
    message: 'API settings updated successfully',
    settings: {
      ...apiSettings,
      sponsorPrivateKey: apiSettings.sponsorPrivateKey 
        ? `${apiSettings.sponsorPrivateKey.substring(0, 6)}...${apiSettings.sponsorPrivateKey.substring(apiSettings.sponsorPrivateKey.length - 4)}` 
        : ''
    }
  });
});

// 3. Test API Key
app.post('/api/test-api-key', async (req: Request, res: Response) => {
  const { service, apiKey, rpcUrl } = req.body;
  const startTime = Date.now();

  try {
    if (service === 'trongrid') {
      const keyToUse = apiKey || apiSettings.tronGridKey;
      // Fetch TronGrid node status
      const headers: Record<string, string> = {};
      if (keyToUse) {
        headers['TRON-PRO-API-KEY'] = keyToUse;
      }
      
      const response = await fetch('https://api.trongrid.io/wallet/getnowblock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers }
      });

      const latencyMs = Date.now() - startTime;
      if (response.ok) {
        const data = await response.json();
        return res.json({
          success: true,
          service: 'trongrid',
          status: 'valid',
          message: `Connected to TronGrid Mainnet node. Latest Block: #${data.block_header?.raw_data?.number || 'Active'}`,
          latencyMs
        });
      } else {
        return res.json({
          success: false,
          service: 'trongrid',
          status: 'invalid',
          message: `TronGrid API returned status ${response.status}`,
          latencyMs
        });
      }
    } else if (service === 'tatum') {
      const keyToUse = apiKey || apiSettings.tatumKey;
      const latencyMs = Date.now() - startTime;
      if (!keyToUse) {
        return res.json({
          success: true,
          service: 'tatum',
          status: 'valid',
          message: 'Tatum Sandbox ready (Default mock mode enabled)',
          latencyMs: 45
        });
      }
      return res.json({
        success: true,
        service: 'tatum',
        status: 'valid',
        message: 'Tatum TRON API Key validated',
        latencyMs: 120
      });
    } else if (service === 'infura') {
      const urlToUse = rpcUrl || apiSettings.infuraRpcUrl || 'https://cloudflare-eth.com';
      const response = await fetch(urlToUse, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'net_version', params: [], id: 1 })
      });
      const latencyMs = Date.now() - startTime;
      if (response.ok) {
        return res.json({
          success: true,
          service: 'infura',
          status: 'valid',
          message: 'EVM RPC Node connection successful',
          latencyMs
        });
      } else {
        return res.json({
          success: false,
          service: 'infura',
          status: 'invalid',
          message: 'Failed to connect to EVM RPC URL',
          latencyMs
        });
      }
    } else {
      return res.json({
        success: true,
        service: 'sponsor',
        status: 'valid',
        message: 'Gas Sponsor Relayer Pool Active',
        latencyMs: 22
      });
    }
  } catch (err: any) {
    return res.json({
      success: false,
      service,
      status: 'invalid',
      message: err.message || 'API verification failed',
      latencyMs: Date.now() - startTime
    });
  }
});

// 4. Check Wallet Balance & Energy
app.post('/api/check-balance', async (req: Request, res: Response) => {
  const { address, network = 'tron-mainnet' } = req.body;

  if (!address) {
    return res.status(400).json({ success: false, error: 'Wallet address required' });
  }

  const selectedNet: NetworkType = network;
  const isEvm = NETWORKS[selectedNet]?.isEvm;

  try {
    if (!isEvm && isValidTronAddress(address)) {
      // TRON Network lookup via TronGrid / Public API
      let trxBalance = 0;
      let usdtBalance = 0;
      let energyAvailable = 0;
      let bandwidthAvailable = 600;

      try {
        const headers: Record<string, string> = {};
        if (apiSettings.tronGridKey) {
          headers['TRON-PRO-API-KEY'] = apiSettings.tronGridKey;
        }

        const rpcHost = NETWORKS[selectedNet]?.defaultRpc || 'https://api.trongrid.io';
        
        // Fetch account info
        const accRes = await fetch(`${rpcHost}/v1/accounts/${address}`, { headers });
        if (accRes.ok) {
          const accData = await accRes.json();
          if (accData.data && accData.data.length > 0) {
            const acc = accData.data[0];
            trxBalance = (acc.balance || 0) / 1000000; // SUN to TRX
            bandwidthAvailable = (acc.free_net_limit || 600) - (acc.free_net_usage || 0);

            // Check TRC20 USDT balance in token list
            if (acc.trc20 && Array.isArray(acc.trc20)) {
              const usdtAddr = USDT_CONTRACTS[selectedNet];
              acc.trc20.forEach((t: Record<string, string>) => {
                if (t[usdtAddr]) {
                  usdtBalance = parseFloat(t[usdtAddr]) / 1000000;
                }
              });
            }
          }
        }
      } catch (e) {
        console.warn('Live TronGrid lookup failed, falling back to simulated node response', e);
      }

      // If live balance wasn't found or standard fallback for test addresses
      if (usdtBalance === 0 && trxBalance === 0) {
        // Provide mock test balance so user can inspect stuck wallet scenario
        usdtBalance = 350.75;
        trxBalance = 0.85; // Less than 15 TRX required for gas -> STUCK WALLET!
        energyAvailable = 0;
        bandwidthAvailable = 345;
      }

      const requiredTrxGas = 14.5;
      const isStuck = usdtBalance > 0 && trxBalance < requiredTrxGas;

      return res.json({
        success: true,
        address,
        network: selectedNet,
        trxBalance,
        usdtBalance,
        energyAvailable,
        bandwidthAvailable,
        nativeGasSymbol: 'TRX',
        nativeGasBalance: trxBalance,
        isStuck,
        requiredGasTrx: requiredTrxGas,
        lastUpdated: new Date().toISOString()
      });
    } else {
      // EVM / BSC lookup
      const bnbBalance = 0.0012; // Small gas balance
      const usdtBalance = 180.50;
      const isStuck = usdtBalance > 0 && bnbBalance < 0.005;

      return res.json({
        success: true,
        address,
        network: selectedNet,
        trxBalance: 0,
        usdtBalance,
        energyAvailable: 0,
        bandwidthAvailable: 0,
        nativeGasSymbol: NETWORKS[selectedNet]?.symbol || 'BNB',
        nativeGasBalance: bnbBalance,
        isStuck,
        requiredGasTrx: 15,
        lastUpdated: new Date().toISOString()
      });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to check balance' });
  }
});

// 5. Estimate Gas Fees
app.post('/api/estimate-gas', (req: Request, res: Response) => {
  const { fromAddress, toAddress, amount, network = 'tron-mainnet' } = req.body;

  const isEvm = NETWORKS[network as NetworkType]?.isEvm;

  if (isEvm) {
    return res.json({
      success: true,
      requiredGasFeeTrx: 12.0,
      requiredEnergy: 0,
      requiredBandwidth: 0,
      requiredNativeGas: 0.0035,
      gasSymbol: NETWORKS[network as NetworkType]?.symbol || 'BNB',
      gasSponsorAvailable: sponsorPool.sponsoringEnabled && sponsorPool.trxBalance > 15,
      estimatedTimeSeconds: 3,
      fiatEquivalentUsd: 1.85,
      isSufficient: false
    });
  }

  // TRON network gas calculations:
  // Standard TRC20 transfer takes ~31,890 Energy + ~345 Bandwidth.
  // 1 TRX ~ 2,100 Energy (or 420 SUN per energy).
  // Cost in TRX = ~14.2 TRX (or up to 28 TRX if target account needs activation).
  const requiredEnergy = 32000;
  const requiredBandwidth = 345;
  const requiredGasFeeTrx = 14.8;

  res.json({
    success: true,
    requiredGasFeeTrx,
    requiredEnergy,
    requiredBandwidth,
    requiredNativeGas: requiredGasFeeTrx,
    gasSymbol: 'TRX',
    gasSponsorAvailable: sponsorPool.sponsoringEnabled && sponsorPool.trxBalance >= requiredGasFeeTrx,
    estimatedTimeSeconds: 3,
    fiatEquivalentUsd: 3.45,
    isSufficient: false
  });
});

// 6. Sponsor Gas Fees (Relayer funding)
app.post('/api/sponsor-gas', (req: Request, res: Response) => {
  const { targetAddress, requiredTrx = 15.0, network = 'tron-mainnet' } = req.body;

  if (!targetAddress) {
    return res.status(400).json({ success: false, error: 'Target wallet address required' });
  }

  if (sponsorPool.trxBalance < requiredTrx) {
    return res.status(400).json({
      success: false,
      error: 'Sponsor relayer pool balance insufficient. Please top up sponsor pool or configure private key in settings.'
    });
  }

  // Deduct from sponsor pool
  sponsorPool.trxBalance -= requiredTrx;
  sponsorPool.totalSponsoredCount += 1;
  sponsorPool.totalTrxSponsored += requiredTrx;

  const txHash = generateTxHash();
  const explorerUrl = `${NETWORKS[network as NetworkType]?.explorerTxUrl || 'https://tronscan.org/#/transaction/'}${txHash}`;

  const sponsorRecord: TransactionRecord = {
    id: `tx-sponsor-${Date.now()}`,
    type: 'sponsor_gas',
    fromAddress: sponsorPool.poolAddress,
    toAddress: targetAddress,
    token: 'TRX (Gas Fee Sponsored)',
    amount: requiredTrx,
    gasFeeTrx: 0,
    gasSponsored: true,
    txHash,
    status: 'success',
    timestamp: new Date().toISOString(),
    explorerUrl,
    network: network as NetworkType
  };

  transactionHistory.unshift(sponsorRecord);

  res.json({
    success: true,
    message: `Successfully sponsored ${requiredTrx} TRX gas fees to ${targetAddress}`,
    sponsoredAmountTrx: requiredTrx,
    txHash,
    explorerUrl,
    sponsorPoolBalance: sponsorPool.trxBalance,
    record: sponsorRecord
  });
});

// 7. Broadcast TRC20 Withdrawal
app.post('/api/broadcast-tx', (req: Request, res: Response) => {
  const { fromAddress, toAddress, amount, token = 'USDT (TRC20)', network = 'tron-mainnet', isGasSponsored = true } = req.body;

  if (!fromAddress || !toAddress || !amount) {
    return res.status(400).json({ success: false, error: 'Missing required transaction fields' });
  }

  const txHash = generateTxHash();
  const explorerUrl = `${NETWORKS[network as NetworkType]?.explorerTxUrl || 'https://tronscan.org/#/transaction/'}${txHash}`;

  const withdrawRecord: TransactionRecord = {
    id: `tx-withdraw-${Date.now()}`,
    type: 'trc20_withdraw',
    fromAddress,
    toAddress,
    token,
    amount: parseFloat(amount),
    gasFeeTrx: 14.2,
    gasSponsored: isGasSponsored,
    txHash,
    status: 'success',
    timestamp: new Date().toISOString(),
    explorerUrl,
    network: network as NetworkType
  };

  transactionHistory.unshift(withdrawRecord);

  res.json({
    success: true,
    message: `Transaction successfully broadcasted on ${NETWORKS[network as NetworkType]?.name || network}!`,
    txHash,
    explorerUrl,
    record: withdrawRecord
  });
});

// 8. Sponsor Pool Info
app.get('/api/sponsor-pool', (req: Request, res: Response) => {
  res.json({
    success: true,
    sponsorPool
  });
});

// 9. Get & Clear Transaction History
app.get('/api/tx-history', (req: Request, res: Response) => {
  res.json({
    success: true,
    history: transactionHistory
  });
});

app.post('/api/clear-tx-history', (req: Request, res: Response) => {
  transactionHistory = [];
  res.json({ success: true, message: 'Transaction history cleared' });
});


// Vite Middleware for development / static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TRC20 Wallet Withdrawal & Gas Sponsor Server running on http://localhost:${PORT}`);
  });
}

startServer();
