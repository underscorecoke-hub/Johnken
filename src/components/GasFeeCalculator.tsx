import React, { useState } from 'react';
import { NetworkType, SponsorPoolInfo } from '../types';
import { NETWORKS } from '../lib/networks';
import { Fuel, Cpu, Calculator, Zap, Shield, HelpCircle, ArrowRight } from 'lucide-react';

interface GasFeeCalculatorProps {
  network: NetworkType;
  sponsorPool: SponsorPoolInfo;
}

export const GasFeeCalculator: React.FC<GasFeeCalculatorProps> = ({
  network,
  sponsorPool
}) => {
  const [testAmountUsdt, setTestAmountUsdt] = useState<number>(500);
  const [recipientNewAccount, setRecipientNewAccount] = useState<boolean>(false);

  const netConfig = NETWORKS[network];

  // TRON energy calculations:
  // Standard transfer: 32,000 Energy
  // New recipient account activation: 65,000 Energy
  // Bandwidth: 345 SUN
  // 1 TRX ~ 2,100 Energy (or 420 SUN per energy fee)
  const baseEnergy = recipientNewAccount ? 65000 : 32000;
  const trxGasRequired = recipientNewAccount ? 28.5 : 14.8;
  const fiatGasUsd = (trxGasRequired * 0.23).toFixed(2); // ~ $0.23 / TRX

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-zinc-100">TRON Energy & Gas Fee Simulator</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Calculate exact TRON Energy, Bandwidth, and TRX gas costs for transferring TRC20 tokens on {netConfig.name}.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs">
          <Fuel className="w-4 h-4 text-amber-400" />
          <span className="text-zinc-400">Gas Relayer Rate:</span>
          <span className="font-mono font-bold text-emerald-400">100% Sponsored Fee</span>
        </div>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Form Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-bold text-zinc-200 border-b border-zinc-800 pb-3">
            Simulation Parameters
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">
              USDT (TRC20) Amount to Transfer
            </label>
            <div className="relative">
              <input
                type="number"
                value={testAmountUsdt}
                onChange={(e) => setTestAmountUsdt(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-zinc-100 font-mono focus:outline-none"
              />
              <span className="absolute right-3 top-2.5 text-xs text-zinc-500 font-bold">
                USDT
              </span>
            </div>
          </div>

          <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-300">Is Recipient Address New / Inactive?</span>
              <input
                type="checkbox"
                checked={recipientNewAccount}
                onChange={(e) => setRecipientNewAccount(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-zinc-500">
              TRON smart contracts consume extra Energy (~65,000) when creating a new USDT token balance on an unactivated TRC20 address.
            </p>
          </div>

          <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
              <Zap className="w-4 h-4" />
              <span>Sponsor Relayer Auto-Funding</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              When using our Gas Sponsor Relayer, you do not need to acquire TRX. The relayer automatically stakes TRX energy to fund your withdrawal transaction.
            </p>
          </div>
        </div>

        {/* Simulation Output Cards (7 cols) */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-sm font-bold text-zinc-200 border-b border-zinc-800 pb-3">
            Estimated Resource Breakdown
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
              <span className="text-[11px] text-zinc-400">Required Energy</span>
              <div className="text-lg font-mono font-bold text-rose-400">
                {baseEnergy.toLocaleString()}
              </div>
              <span className="text-[10px] text-zinc-500">Contract Execution</span>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
              <span className="text-[11px] text-zinc-400">Required Bandwidth</span>
              <div className="text-lg font-mono font-bold text-blue-400">
                345 Bytes
              </div>
              <span className="text-[10px] text-zinc-500">Tx Header Broadcasting</span>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
              <span className="text-[11px] text-zinc-400">Gas Cost in TRX</span>
              <div className="text-lg font-mono font-bold text-amber-400">
                ~{trxGasRequired} TRX
              </div>
              <span className="text-[10px] text-zinc-500">~${fiatGasUsd} USD</span>
            </div>

          </div>

          {/* Explanation Box */}
          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-zinc-200 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>How TRON Gas Fees Work</span>
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Unlike Ethereum gas which burns ETH directly on every transaction, TRON uses a dual-resource model of <strong>Energy</strong> (for smart contract execution like TRC20 USDT transfers) and <strong>Bandwidth</strong> (for transaction size).
            </p>
            <p className="text-xs text-zinc-400 leading-relaxed">
              When a wallet has 0 TRX, TRC20 transfers fail with <i>"OUT_OF_ENERGY"</i> or <i>"INSUFFICIENT_BALANCE"</i>. Our Gas Sponsor Relayer sends the necessary Energy directly into your stuck wallet before broadcasting.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
