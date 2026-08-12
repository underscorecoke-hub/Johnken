import React, { useState } from 'react';
import { WalletState, NetworkType } from '../types';
import { connectMetaMask, connectTronLink } from '../lib/wallet';
import { isValidTronAddress, isValidEvmAddress } from '../lib/networks';
import { X, Wallet, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletState;
  onConnectSuccess: (walletState: Partial<WalletState>) => void;
  network: NetworkType;
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose,
  wallet,
  onConnectSuccess,
  network
}) => {
  const [manualAddress, setManualAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  if (!isOpen) return null;

  const handleMetaMask = async () => {
    setIsConnecting(true);
    setErrorMsg('');
    try {
      const state = await connectMetaMask();
      onConnectSuccess(state);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect MetaMask');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTronLink = async () => {
    setIsConnecting(true);
    setErrorMsg('');
    try {
      const state = await connectTronLink();
      onConnectSuccess(state);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect TronLink');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const trimmed = manualAddress.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a wallet address');
      return;
    }

    if (!isValidTronAddress(trimmed) && !isValidEvmAddress(trimmed)) {
      setErrorMsg('Invalid address format. Enter a TRON address (starts with T) or EVM address (0x...)');
      return;
    }

    onConnectSuccess({
      address: trimmed,
      walletType: 'manual',
      connected: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-zinc-100">Connect Blockchain Wallet</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start space-x-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Option 1: MetaMask */}
          <button
            onClick={handleMetaMask}
            disabled={isConnecting}
            className="w-full flex items-center justify-between p-4 bg-zinc-950/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-amber-500/40 rounded-xl transition-all group cursor-pointer text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                🦊
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors">
                  MetaMask Wallet
                </div>
                <div className="text-xs text-zinc-400">
                  Connect MetaMask (EVM / BSC / BTTC / Wrapped TRC20)
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </button>

          {/* Option 2: TronLink */}
          <button
            onClick={handleTronLink}
            disabled={isConnecting}
            className="w-full flex items-center justify-between p-4 bg-zinc-950/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-rose-500/40 rounded-xl transition-all group cursor-pointer text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-sm">
                ⚡
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-200 group-hover:text-rose-400 transition-colors">
                  TronLink Wallet
                </div>
                <div className="text-xs text-zinc-400">
                  Native TRON TRC20 extension wallet
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-2">
            <div className="border-t border-zinc-800 w-full" />
            <span className="absolute bg-zinc-900 px-3 text-[11px] uppercase tracking-wider text-zinc-500 font-mono">
              or enter address
            </span>
          </div>

          {/* Option 3: Manual Address Input */}
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Stuck Wallet Address (TRON or EVM)
              </label>
              <input
                type="text"
                placeholder="e.g. TJ31x5zK4vBq8n... or 0x71C...89"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-900/20 transition-colors flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Inspect & Connect Address</span>
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
