import React from 'react';
import { WalletState, NetworkType, SponsorPoolInfo } from '../types';
import { NETWORKS } from '../lib/networks';
import { truncateAddress } from '../lib/wallet';
import { Wallet, Settings, HelpCircle, Shield, RefreshCw, Zap, Cpu } from 'lucide-react';

interface NavbarProps {
  wallet: WalletState;
  network: NetworkType;
  onNetworkChange: (net: NetworkType) => void;
  sponsorPool: SponsorPoolInfo;
  onOpenWalletModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenHelpModal: () => void;
  onRefreshBalance: () => void;
  isLoadingBalance: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  wallet,
  network,
  onNetworkChange,
  sponsorPool,
  onOpenWalletModal,
  onOpenSettingsModal,
  onOpenHelpModal,
  onRefreshBalance,
  isLoadingBalance
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & App Title */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 flex items-center justify-center shadow-inner">
              <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-zinc-100 tracking-tight">TRC20 Gas Sponsor</h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Shield className="w-3 h-3 mr-1" />
                  Gas Relayer Ready
                </span>
              </div>
              <p className="text-xs text-zinc-400">Withdraw Stuck MetaMask TRX & TRC20 Funds</p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">

            {/* Network Selector */}
            <div className="hidden md:flex items-center space-x-2 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
              <Cpu className="w-4 h-4 text-zinc-400 ml-2" />
              <select
                value={network}
                onChange={(e) => onNetworkChange(e.target.value as NetworkType)}
                className="bg-transparent text-xs text-zinc-200 font-medium py-1 px-2 focus:outline-none cursor-pointer"
              >
                {Object.values(NETWORKS).map((net) => (
                  <option key={net.id} value={net.id} className="bg-zinc-900 text-zinc-200">
                    {net.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Gas Sponsor Relayer Pool Indicator */}
            <div className="hidden lg:flex items-center space-x-2 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-1.5 text-xs">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-zinc-400">Gas Pool:</span>
              <span className="font-semibold text-amber-400">{sponsorPool.trxBalance.toFixed(1)} TRX</span>
            </div>

            {/* Wallet Connect Status Button */}
            {wallet.connected ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenWalletModal}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 rounded-xl text-xs font-medium text-zinc-200 transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full ${wallet.isStuck ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                  <span className="font-mono text-zinc-300">{truncateAddress(wallet.address)}</span>
                  <span className="px-1.5 py-0.5 text-[10px] bg-zinc-800 rounded text-zinc-400 uppercase font-mono">
                    {wallet.walletType}
                  </span>
                </button>

                <button
                  onClick={onRefreshBalance}
                  disabled={isLoadingBalance}
                  title="Refresh Balances"
                  className="p-2 text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingBalance ? 'animate-spin' : ''}`} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenWalletModal}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-900/20 transition-all"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}

            {/* Help / How it Works Button */}
            <button
              onClick={onOpenHelpModal}
              title="How Gas Sponsoring Works"
              className="p-2 text-zinc-400 hover:text-amber-400 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Settings Gear Button */}
            <button
              onClick={onOpenSettingsModal}
              title="API Keys & Settings"
              className="p-2 text-zinc-400 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors relative"
            >
              <Settings className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
