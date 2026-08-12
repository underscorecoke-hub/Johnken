import { NetworkConfig, NetworkType } from '../types';

export const NETWORKS: Record<NetworkType, NetworkConfig> = {
  'tron-mainnet': {
    id: 'tron-mainnet',
    name: 'TRON Mainnet',
    symbol: 'TRX',
    tokenType: 'TRC20 / TRX',
    explorerTxUrl: 'https://tronscan.org/#/transaction/',
    explorerAddressUrl: 'https://tronscan.org/#/address/',
    defaultRpc: 'https://api.trongrid.io',
    isEvm: false
  },
  'tron-shasta': {
    id: 'tron-shasta',
    name: 'TRON Shasta Testnet',
    symbol: 'TRX',
    tokenType: 'TRC20 (Testnet)',
    explorerTxUrl: 'https://shasta.tronscan.org/#/transaction/',
    explorerAddressUrl: 'https://shasta.tronscan.org/#/address/',
    defaultRpc: 'https://api.shasta.trongrid.io',
    isEvm: false
  },
  'tron-nile': {
    id: 'tron-nile',
    name: 'TRON Nile Testnet',
    symbol: 'TRX',
    tokenType: 'TRC20 (Nile)',
    explorerTxUrl: 'https://nile.tronscan.org/#/transaction/',
    explorerAddressUrl: 'https://nile.tronscan.org/#/address/',
    defaultRpc: 'https://nile.trongrid.io',
    isEvm: false
  },
  'bsc-mainnet': {
    id: 'bsc-mainnet',
    name: 'BNB Smart Chain (BSC - Wrapped TRX/TRC20)',
    symbol: 'BNB',
    tokenType: 'BEP20 / Wrapped TRX',
    explorerTxUrl: 'https://bscscan.com/tx/',
    explorerAddressUrl: 'https://bscscan.com/address/',
    defaultRpc: 'https://bsc-dataseed.binance.org/',
    chainHex: '0x38',
    isEvm: true
  },
  'bttc-mainnet': {
    id: 'bttc-mainnet',
    name: 'BitTorrent Chain (BTTC TRC20 EVM)',
    symbol: 'BTT',
    tokenType: 'TRC20 / BTTC',
    explorerTxUrl: 'https://bttcscan.com/tx/',
    explorerAddressUrl: 'https://bttcscan.com/address/',
    defaultRpc: 'https://rpc.bittorrentchain.io',
    chainHex: '0xc7',
    isEvm: true
  },
  'eth-mainnet': {
    id: 'eth-mainnet',
    name: 'Ethereum Mainnet (Wrapped TRX)',
    symbol: 'ETH',
    tokenType: 'ERC20 Wrapped TRX',
    explorerTxUrl: 'https://etherscan.io/tx/',
    explorerAddressUrl: 'https://etherscan.io/address/',
    defaultRpc: 'https://cloudflare-eth.com',
    chainHex: '0x1',
    isEvm: true
  }
};

export const USDT_CONTRACTS: Record<NetworkType, string> = {
  'tron-mainnet': 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // Standard TRC20 USDT
  'tron-shasta': 'TG3XXySZAu2nyR2255C155q2233554433', // Shasta testnet USDT sample
  'tron-nile': 'TXYZop815K2211554433221100000000',
  'bsc-mainnet': '0x55d398326f99059ff775485246999027b3197955', // BSC USDT
  'bttc-mainnet': '0xdb287103818567112002f232491a6d713a26a575',
  'eth-mainnet': '0xdac17f958d2ee523a2206206994597c13d831ec7'
};

export function isValidTronAddress(address: string): boolean {
  if (!address) return false;
  const trimmed = address.trim();
  // TRON mainnet/testnet base58 addresses start with 'T' and are 34 characters long
  if (trimmed.startsWith('T') && trimmed.length === 34) {
    return /^[a-km-zA-HJ-NP-Z1-9]{34}$/.test(trimmed);
  }
  return false;
}

export function isValidEvmAddress(address: string): boolean {
  if (!address) return false;
  const trimmed = address.trim();
  return /^0x[a-fA-F0-9]{40}$/.test(trimmed);
}

export function isValidAddressForNetwork(address: string, network: NetworkType): boolean {
  const isEvm = NETWORKS[network]?.isEvm;
  if (isEvm) {
    return isValidEvmAddress(address);
  }
  return isValidTronAddress(address);
}
