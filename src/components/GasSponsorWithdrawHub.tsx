import React, { useState, useEffect } from 'react';
import { WalletState, NetworkType, SponsorPoolInfo } from '../types';
import { sponsorGasFee, broadcastWithdrawal, estimateGasFees, checkWalletBalance } from '../lib/api';
import { isValidAddressForNetwork, NETWORKS } from '../lib/networks';
import { truncateAddress } from '../lib/wallet';
import { 
  Zap, 
  Wallet, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink, 
  Loader2, 
  Copy, 
  Check, 
  Coins, 
  Fuel, 
  Send, 
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';

interface GasSponsorWithdrawHubProps {
  wallet: WalletState;
  network: NetworkType;
  sponsorPool: SponsorPoolInfo;
  onWalletUpdated: (updated: WalletState) => void;
  onRefreshSponsorPool: () => void;
  onOpenWalletModal: () => void;
  onTxCompleted: () => void;
}

export const GasSponsorWithdrawHub: React.FC<GasSponsorWithdrawHubProps> = ({
  wallet,
  network,
  sponsorPool,
  onWalletUpdated,
  onRefreshSponsorPool,
  onOpenWalletModal,
  onTxCompleted
}) => {
  // Destination address state
  const [destinationAddress, setDestinationAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [copiedTx, setCopiedTx] = useState(false);

  // Gas & Sponsorship states
  const [isSponsoring, setIsSponsoring] = useState(false);
  const [sponsorStep, setSponsorStep] = useState<string>('');
  const [gasSponsoredSuccess, setGasSponsoredSuccess] = useState(false);

  // Transfer execution states
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferStep, setTransferStep] = useState<string>('');
  const [lastTxReceipt, setLastTxReceipt] = useState<{
    txHash: string;
    explorerUrl: string;
    amount: number;
    toAddress: string;
  } | null>(null);

  const [errorMsg, setErrorMsg] = useState('');

  // Required gas calculation
  const requiredTrxGas = 14.8;
  const netConfig = NETWORKS[network];

  // Auto set withdrawal amount when wallet balance loads
  useEffect(() => {
    if (wallet.usdtBalance > 0 && withdrawAmount === 0) {
      setWithdrawAmount(wallet.usdtBalance);
    }
  }, [wallet.usdtBalance]);

  // Handle Gas Sponsorship
  const handleSponsorGas = async () => {
    if (!wallet.address) {
      onOpenWalletModal();
      return;
    }

    setIsSponsoring(true);
    setErrorMsg('');
    setSponsorStep('Contacting Gas Relayer Node...');

    try {
      await new Promise((r) => setTimeout(r, 600));
      setSponsorStep(`Reserving ${requiredTrxGas} TRX Energy from Gas Pool...`);

      await new Promise((r) => setTimeout(r, 800));
      setSponsorStep(`Broadcasting Energy Deposit to ${truncateAddress(wallet.address)}...`);

      const res = await sponsorGasFee(wallet.address, requiredTrxGas, network);

      await new Promise((r) => setTimeout(r, 600));

      // Refresh wallet state to reflect funded gas
      const updatedWallet = await checkWalletBalance(wallet.address, network);
      onWalletUpdated({
        ...updatedWallet,
        trxBalance: updatedWallet.trxBalance + requiredTrxGas,
        isStuck: false
      });

      setGasSponsoredSuccess(true);
      setSponsorStep('✅ Gas Fee Funded Successfully!');
      onRefreshSponsorPool();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sponsor gas fee');
    } finally {
      setIsSponsoring(false);
    }
  };

  // Handle Withdrawal Execution
  const handleExecuteWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.address) {
      setErrorMsg('Please connect your stuck wallet first');
      return;
    }

    if (!destinationAddress) {
      setErrorMsg('Please enter destination TRC20 wallet address');
      return;
    }

    if (!isValidAddressForNetwork(destinationAddress, network)) {
      setErrorMsg(`Invalid address for ${netConfig.name}. Please enter a valid address.`);
      return;
    }

    if (destinationAddress.trim().toLowerCase() === wallet.address.trim().toLowerCase()) {
      setErrorMsg('Destination address cannot be the same as the source address');
      return;
    }

    if (withdrawAmount <= 0) {
      setErrorMsg('Please specify amount to withdraw');
      return;
    }

    setIsTransferring(true);
    setErrorMsg('');
    setTransferStep('Preparing TRC20 Smart Contract Transfer...');

    try {
      await new Promise((r) => setTimeout(r, 800));
      setTransferStep('Signing transaction payload with funded gas fee...');

      await new Promise((r) => setTimeout(r, 900));
      setTransferStep(`Broadcasting ${withdrawAmount} USDT to TRON blockchain...`);

      const res = await broadcastWithdrawal(
        wallet.address,
        destinationAddress.trim(),
        withdrawAmount,
        'USDT (TRC20)',
        network,
        true
      );

      await new Promise((r) => setTimeout(r, 600));

      setLastTxReceipt({
        txHash: res.txHash,
        explorerUrl: res.explorerUrl,
        amount: withdrawAmount,
        toAddress: destinationAddress.trim()
      });

      // Update wallet state after transfer
      const remainingUsdt = Math.max(0, wallet.usdtBalance - withdrawAmount);
      onWalletUpdated({
        ...wallet,
        usdtBalance: remainingUsdt
      });

      onTxCompleted();
    } catch (err: any) {
      setErrorMsg(err.message || 'Transaction broadcast failed');
    } finally {
      setIsTransferring(false);
    }
  };

  const handleCopyTx = (tx: string) => {
    navigator.clipboard.writeText(tx);
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  const handleSampleDestination = () => {
    if (netConfig.isEvm) {
      setDestinationAddress('0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5');
    } else {
      setDestinationAddress('TDestinationWalletAddress998877665544332211');
    }
  };

  return (
    <div className="space-y-6">

      {/* Hero Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-semibold text-amber-400">
              <Zap className="w-3.5 h-3.5" />
              <span>Metamask & TRC20 Gas Sponsorship Engine</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-zinc-100 tracking-tight">
              Withdraw Stuck TRC20 Tokens
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
              Have USDT or TRX stuck in MetaMask without TRX gas fees? Connect your wallet, sponsor the network fees via our Relayer Pool, and safely transfer your funds to your destination wallet.
            </p>
          </div>

          {/* Quick Wallet Action */}
          <div className="bg-zinc-950/80 border border-zinc-800 p-4 rounded-2xl flex flex-col items-center justify-center space-y-3 min-w-[220px]">
            {wallet.connected ? (
              <>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-zinc-200">Connected Wallet</span>
                </div>
                <div className="text-sm font-mono text-amber-400 font-semibold bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800">
                  {truncateAddress(wallet.address)}
                </div>
                <button
                  onClick={onOpenWalletModal}
                  className="text-[11px] text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                >
                  Switch Wallet
                </button>
              </>
            ) : (
              <>
                <Wallet className="w-8 h-8 text-amber-400 animate-bounce" />
                <button
                  onClick={onOpenWalletModal}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-900/30 cursor-pointer"
                >
                  Connect Wallet Now
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Wallet Status & Gas Sponsoring */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Wallet Balance & Gas Fee Deficit Detector (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Wallet Balance Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <Coins className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-zinc-200">Wallet Balances</h3>
              </div>
              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">
                {netConfig.name}
              </span>
            </div>

            {/* Tokens Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* USDT Balance */}
              <div className="p-4 bg-zinc-950/70 border border-zinc-800/80 rounded-xl space-y-1">
                <div className="text-[11px] text-zinc-400 font-medium">Stuck USDT (TRC20)</div>
                <div className="text-lg font-black text-emerald-400 font-mono">
                  ${wallet.usdtBalance.toFixed(2)}
                </div>
                <div className="text-[10px] text-zinc-500">Available to transfer</div>
              </div>

              {/* Native Gas Balance */}
              <div className="p-4 bg-zinc-950/70 border border-zinc-800/80 rounded-xl space-y-1">
                <div className="text-[11px] text-zinc-400 font-medium">Native Gas ({wallet.nativeGasSymbol})</div>
                <div className={`text-lg font-black font-mono ${wallet.trxBalance < requiredTrxGas ? 'text-amber-400' : 'text-zinc-100'}`}>
                  {wallet.trxBalance.toFixed(2)} {wallet.nativeGasSymbol}
                </div>
                <div className="text-[10px] text-zinc-500">
                  Req: {requiredTrxGas} {wallet.nativeGasSymbol}
                </div>
              </div>
            </div>

            {/* Energy & Bandwidth Bars (TRON specific) */}
            {!netConfig.isEvm && (
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">TRON Energy</span>
                    <span className="text-zinc-300 font-mono">{wallet.energyAvailable} / 32,000</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                    <div 
                      className="h-full bg-rose-500 transition-all duration-500" 
                      style={{ width: `${Math.min(100, (wallet.energyAvailable / 32000) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">TRON Bandwidth</span>
                    <span className="text-zinc-300 font-mono">{wallet.bandwidthAvailable} / 600</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-500" 
                      style={{ width: `${Math.min(100, (wallet.bandwidthAvailable / 600) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Wallet Stuck Alert Banner */}
            {wallet.connected && (wallet.isStuck || wallet.trxBalance < requiredTrxGas) && !gasSponsoredSuccess && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2 animate-fade-in">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Gas Fee Deficit — Wallet Funds Stuck</span>
                </div>
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  Your wallet holds <strong>${wallet.usdtBalance.toFixed(2)} USDT</strong>, but lacks the <strong>{requiredTrxGas} {wallet.nativeGasSymbol}</strong> required to pay blockchain gas fees. Click below to sponsor gas fees!
                </p>
              </div>
            )}

            {/* Gas Sponsored Success Banner */}
            {gasSponsoredSuccess && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start space-x-3 text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-emerald-400">Gas Fees Successfully Funded!</div>
                  <div>Your wallet has received 15 TRX Energy sponsorship. You can now execute the withdrawal below.</div>
                </div>
              </div>
            )}

            {/* Step 1 Action: Sponsor Gas Button */}
            <div className="pt-2">
              <button
                onClick={handleSponsorGas}
                disabled={isSponsoring || !wallet.connected}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer ${
                  gasSponsoredSuccess
                    ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20'
                }`}
              >
                {isSponsoring ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{sponsorStep || 'Sponsoring Gas Fees...'}</span>
                  </>
                ) : gasSponsoredSuccess ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Gas Fee Sponsored & Ready</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Sponsor Network Gas Fees ({requiredTrxGas} TRX)</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Gas Pool Status Widget */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-zinc-300 font-semibold">
                <Fuel className="w-4 h-4 text-amber-400" />
                <span>Gas Relayer Pool</span>
              </div>
              <span className="text-emerald-400 font-mono text-[11px]">Active</span>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
              <span>Relayer Pool Balance:</span>
              <span className="font-mono text-zinc-200 font-bold">{sponsorPool.trxBalance.toFixed(1)} TRX</span>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Total Transactions Sponsored:</span>
              <span className="font-mono text-zinc-200">{sponsorPool.totalSponsoredCount}</span>
            </div>
          </div>

        </div>

        {/* Right Column: Destination Wallet & Transfer Execution (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-xl">
            
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Withdraw Funds to Destination TRC20 Wallet</h3>
                  <p className="text-xs text-zinc-400">Specify destination TRC20 wallet address and confirm transfer</p>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start space-x-2 text-xs text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleExecuteWithdrawal} className="space-y-5">
              
              {/* Destination Wallet Address Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-200">
                    Destination TRC20 Wallet Address
                  </label>
                  <button
                    type="button"
                    onClick={handleSampleDestination}
                    className="text-[11px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    Paste Test TRC20 Address
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder={netConfig.isEvm ? "e.g. 0x71C...89" : "e.g. TDestinationAddress998877..."}
                    value={destinationAddress}
                    onChange={(e) => setDestinationAddress(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors font-mono"
                  />
                  {destinationAddress && isValidAddressForNetwork(destinationAddress, network) && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3.5 top-3.5" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-500">
                  Must be a valid TRON TRC20 base58 address starting with 'T' (or EVM address for BSC/BTTC network).
                </p>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-200">
                    Withdrawal Amount (USDT TRC20)
                  </label>
                  <span className="text-[11px] text-zinc-400">
                    Max Available: <strong className="text-emerald-400 font-mono">${wallet.usdtBalance.toFixed(2)}</strong>
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={wallet.usdtBalance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none font-mono"
                  />
                  <div className="absolute right-2 top-2 flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(wallet.usdtBalance)}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                    >
                      MAX (100%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(wallet.usdtBalance * 0.5)}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-lg text-[10px] transition-colors cursor-pointer"
                    >
                      50%
                    </button>
                  </div>
                </div>
              </div>

              {/* Summary Box */}
              <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-2.5 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Source Wallet:</span>
                  <span className="font-mono text-zinc-300">{wallet.address ? truncateAddress(wallet.address) : 'Not connected'}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Network Gas Fee:</span>
                  <span className="font-mono text-amber-400 font-bold">14.8 TRX (Sponsored ⚡)</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Est. Execution Time:</span>
                  <span className="text-emerald-400 font-medium">~3 seconds</span>
                </div>
                <div className="border-t border-zinc-800 pt-2 flex justify-between font-bold text-zinc-100">
                  <span>Net Amount Received:</span>
                  <span className="text-emerald-400 font-mono text-sm">${withdrawAmount.toFixed(2)} USDT</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isTransferring || !wallet.connected}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xl shadow-emerald-900/30 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isTransferring ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{transferStep || 'Broadcasting Withdrawal...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Execute TRC20 Withdrawal Transfer Now</span>
                  </>
                )}
              </button>

            </form>

            {/* Receipt Modal Card */}
            {lastTxReceipt && (
              <div className="p-5 bg-zinc-950 border border-emerald-500/30 rounded-2xl space-y-4 animate-fade-in shadow-2xl">
                <div className="flex items-center space-x-2 text-emerald-400 text-sm font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Withdrawal Transaction Broadcasted!</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Transferred Amount:</span>
                    <span className="font-mono font-bold text-emerald-400">${lastTxReceipt.amount.toFixed(2)} USDT</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>To Destination TRC20 Wallet:</span>
                    <span className="font-mono text-zinc-200">{truncateAddress(lastTxReceipt.toAddress)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400 items-center">
                    <span>Transaction Hash:</span>
                    <button
                      onClick={() => handleCopyTx(lastTxReceipt.txHash)}
                      className="font-mono text-[11px] text-amber-400 hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <span>{truncateAddress(lastTxReceipt.txHash, 8, 6)}</span>
                      {copiedTx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <a
                    href={lastTxReceipt.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <span>View on TronScan Explorer</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
