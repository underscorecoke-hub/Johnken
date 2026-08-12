export type NetworkType = 
  | 'tron-mainnet' 
  | 'tron-shasta' 
  | 'tron-nile' 
  | 'bsc-mainnet' 
  | 'eth-mainnet' 
  | 'bttc-mainnet';

export interface ApiSettings {
  tronGridKey: string;
  tatumKey: string;
  infuraRpcUrl: string;
  sponsorPrivateKey: string;
  selectedNetwork: NetworkType;
  autoGasSponsor: boolean;
  maxGasSponsorTrx: number;
}

export interface WalletState {
  address: string;
  walletType: 'metamask' | 'tronlink' | 'manual' | 'none';
  connected: boolean;
  chainId?: string | number;
  trxBalance: number;
  usdtBalance: number;
  energyAvailable: number;
  bandwidthAvailable: number;
  nativeGasSymbol: string;
  nativeGasBalance: number;
  isStuck: boolean;
  lastUpdated?: string;
}

export interface GasEstimation {
  requiredGasFeeTrx: number;
  requiredEnergy: number;
  requiredBandwidth: number;
  requiredNativeGas: number;
  gasSymbol: string;
  gasSponsorAvailable: boolean;
  estimatedTimeSeconds: number;
  fiatEquivalentUsd: number;
  isSufficient: boolean;
}

export interface TransactionRecord {
  id: string;
  type: 'sponsor_gas' | 'trc20_withdraw' | 'trx_sweep' | 'gas_deposit';
  fromAddress: string;
  toAddress: string;
  token: string;
  amount: number;
  gasFeeTrx: number;
  gasSponsored: boolean;
  txHash: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: string;
  explorerUrl: string;
  network: NetworkType;
  errorMessage?: string;
}

export interface SponsorPoolInfo {
  poolAddress: string;
  trxBalance: number;
  sponsoringEnabled: boolean;
  totalSponsoredCount: number;
  totalTrxSponsored: number;
  maxSponsorPerTx: number;
}

export interface ApiKeyValidation {
  service: 'trongrid' | 'tatum' | 'infura' | 'sponsor';
  status: 'idle' | 'testing' | 'valid' | 'invalid';
  message: string;
  latencyMs?: number;
}

export interface NetworkConfig {
  id: NetworkType;
  name: string;
  symbol: string;
  tokenType: string;
  explorerTxUrl: string;
  explorerAddressUrl: string;
  defaultRpc: string;
  chainHex?: string;
  isEvm: boolean;
}

export interface TokenPriceInfo {
  usd: number;
  change24h: number;
}

export interface MarketPrices {
  trx: TokenPriceInfo;
  usdt: TokenPriceInfo;
  lastUpdated: string;
}
