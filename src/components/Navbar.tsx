import React, { useState, useEffect } from 'react';
import { WalletState, NetworkType, SponsorPoolInfo, MarketPrices } from '../types';
import { NETWORKS } from '../lib/networks';
import { truncateAddress } from '../lib/wallet';
import { getMarketPrices } from '../lib/api';
import { Wallet, Settings, HelpCircle, Shield, RefreshCw, Zap, Cpu, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

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
  const [prices, setPrices] = useState<MarketPrices | null>({
    trx: { usd: 0.2452, change24h: 1.85 },
    usdt: { usd: 1.0001, change24h: 0.02 },
    lastUpdated: new Date().toISOString()
  });
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);

  // Poll real-time market prices
  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchPrices = async () => {
    try {
      setIsUpdatingPrices(true);
      const data = await getMarketPrices();
      setPrices(data);
    } catch (e) {
      console.warn('Failed to fetch market prices:', e);
    } finally {
      setIsUpdatingPrices(false);
    }
  };

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

          {/* Center Real-Time Price Ticker */}
          {prices && (
            <div className="hidden xl:flex items-center space-x-3 bg-zinc-900/90 border border-zinc-800/80 rounded-xl px-3 py-1.5 text-xs">
              <div className="flex items-center space-x-1.5 text-zinc-400 font-medium">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">Live Rates</span>
              </div>

              <div className="h-3.5 w-px bg-zinc-800" />

              {/* TRX Rate */}
              <div className="flex items-center space-x-1.5" title={`TRX USD Price: $${prices.trx.usd}`}>
                <span className="font-bold text-zinc-200">TRX:</span>
                <span className="font-mono font-semibold text-amber-400">${prices.trx.usd.toFixed(4)}</span>
                <span
                  className={`inline-flex items-center text-[10px] font-semibold px-1 py-0.2 rounded ${
                    prices.trx.change24h >= 0
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {prices.trx.change24h >= 0 ? (
                    <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                  ) : (
                    <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
                  )}
                  {prices.trx.change24h >= 0 ? '+' : ''}
                  {prices.trx.change24h.toFixed(2)}%
                </span>
              </div>

              <div className="h-3.5 w-px bg-zinc-800" />

              {/* USDT Rate */}
              <div className="flex items-center space-x-1.5" title={`USDT USD Price: $${prices.usdt.usd}`}>
                <span className="font-bold text-zinc-200">USDT:</span>
                <span className="font-mono font-semibold text-emerald-400">${prices.usdt.usd.toFixed(2)}</span>
                <span className="inline-flex items-center text-[10px] font-semibold px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400">
                  <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                  +{prices.usdt.change24h.toFixed(2)}%
                </span>
              </div>

              {/* Price Manual Refresh Button */}
              <button
                onClick={fetchPrices}
                disabled={isUpdatingPrices}
                title="Refresh Market Prices"
                className="p-1 text-zinc-500 hover:text-zinc-200 transition-colors disabled:opacity-40"
              >
                <RefreshCw className={`w-3 h-3 ${isUpdatingPrices ? 'animate-spin text-amber-400' : ''}`} />
              </button>
            </div>
          )}

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">

            {/* Mobile/Compact Market Ticker for Medium Screens */}
            {prices && (
              <div className="flex xl:hidden items-center space-x-2 bg-zinc-900 border border-zinc-800/80 rounded-lg px-2.5 py-1 text-xs">
                <span className="font-bold text-amber-400 font-mono">TRX ${prices.trx.usd.toFixed(3)}</span>
                <span className="text-zinc-600">|</span>
                <span className="font-bold text-emerald-400 font-mono">USDT $1.00</span>
              </div>
            )}

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

