import React from 'react';
import { HelpCircle, X, Zap, Wallet, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-xl w-full my-8 overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">How TRC20 Gas Sponsoring Works</h2>
              <p className="text-xs text-zinc-400">Step-by-step guide to rescue stuck MetaMask TRX / TRC20 funds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs text-zinc-300">

          {/* Problem Overview */}
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2">
            <h3 className="font-bold text-rose-400 text-sm flex items-center space-x-2">
              <span>⚠️ The Problem: Why Funds Get Stuck</span>
            </h3>
            <p className="leading-relaxed text-rose-200/90">
              TRC20 USDT transfers require approximately <strong>14.8 TRX (~32,000 Energy)</strong> for smart contract execution fees on the TRON network. If your wallet holds USDT but 0 TRX, MetaMask and TRON wallets refuse to sign or broadcast the transaction because of missing gas fees.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <h3 className="font-bold text-zinc-100 text-sm">3 Simple Steps to Withdraw Your Funds:</h3>

            {/* Step 1 */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-start space-x-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">
                1
              </div>
              <div className="space-y-1">
                <div className="font-bold text-zinc-100">Connect Your Wallet</div>
                <p className="text-zinc-400 leading-relaxed">
                  Connect your MetaMask extension (`window.ethereum`), TronLink extension (`window.tronWeb`), or enter your stuck wallet address manually.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-start space-x-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">
                2
              </div>
              <div className="space-y-1">
                <div className="font-bold text-zinc-100">Click "Sponsor Network Gas Fees"</div>
                <p className="text-zinc-400 leading-relaxed">
                  Our application's <strong>Gas Relayer Pool</strong> instantly deposits 15 TRX Energy directly into your stuck wallet address. You don't need to buy or transfer TRX yourself!
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-start space-x-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                3
              </div>
              <div className="space-y-1">
                <div className="font-bold text-zinc-100">Execute Withdrawal to Destination TRC20 Wallet</div>
                <p className="text-zinc-400 leading-relaxed">
                  Input your clean target TRC20 wallet address and click <strong>"Execute TRC20 Withdrawal"</strong>. The app uses the sponsored energy to broadcast the transfer to the TRON blockchain in ~3 seconds.
                </p>
              </div>
            </div>

          </div>

          {/* Settings note */}
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between">
            <div>
              <div className="font-bold text-zinc-200">Custom API Keys Support</div>
              <p className="text-zinc-400 text-[11px]">
                You can configure your own TronGrid API Key, Tatum API Key, or custom Gas Relayer Key via the Settings menu at any time.
              </p>
            </div>
            <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0 ml-3" />
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Got it, Let's Start!
          </button>

        </div>

      </div>
    </div>
  );
};
