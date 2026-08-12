import { WalletState, NetworkType } from '../types';
import { NETWORKS } from './networks';

declare global {
  interface Window {
    ethereum?: any;
    tronWeb?: any;
    tronLink?: any;
  }
}

export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
}

export async function connectMetaMask(): Promise<Partial<WalletState>> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask wallet extension not detected in browser. You can also enter your wallet address manually below.');
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts selected in MetaMask');
    }

    const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
    const address = accounts[0];

    return {
      address,
      walletType: 'metamask',
      connected: true,
      chainId: chainIdHex
    };
  } catch (err: any) {
    throw new Error(err.message || 'MetaMask connection rejected');
  }
}

export async function connectTronLink(): Promise<Partial<WalletState>> {
  if (typeof window === 'undefined' || (!window.tronWeb && !window.tronLink)) {
    throw new Error('TronLink wallet extension not detected in browser. You can enter your TRC20 wallet address manually below.');
  }

  try {
    if (window.tronLink && window.tronLink.request) {
      await window.tronLink.request({ method: 'tron_requestAccounts' });
    }

    const tronWeb = window.tronWeb;
    if (tronWeb && tronWeb.defaultAddress && tronWeb.defaultAddress.base58) {
      return {
        address: tronWeb.defaultAddress.base58,
        walletType: 'tronlink',
        connected: true
      };
    }

    throw new Error('TronLink locked or account not authorized');
  } catch (err: any) {
    throw new Error(err.message || 'TronLink connection failed');
  }
}

export async function switchMetaMaskNetwork(network: NetworkType) {
  const netConfig = NETWORKS[network];
  if (!netConfig || !netConfig.isEvm || !netConfig.chainHex) {
    return;
  }

  if (window.ethereum) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: netConfig.chainHex }],
      });
    } catch (switchError: any) {
      // If chain not added, attempt to add chain
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: netConfig.chainHex,
              chainName: netConfig.name,
              rpcUrls: [netConfig.defaultRpc],
              nativeCurrency: {
                name: netConfig.symbol,
                symbol: netConfig.symbol,
                decimals: 18,
              },
              blockExplorerUrls: [netConfig.explorerTxUrl.replace('/tx/', '')],
            },
          ],
        });
      }
    }
  }
}
