import React, { useState, useEffect } from 'react';
import { WalletState, NetworkType, SponsorPoolInfo, ApiSettings, TransactionRecord } from './types';
import { 
  getApiSettings, 
  getSponsorPoolInfo, 
  checkWalletBalance, 
  getTransactionHistory 
} from './lib/api';
import { Navbar } from './components/Navbar';
import { WalletConnectModal } from './components/WalletConnectModal';
import { SettingsModal } from './components/SettingsModal';
import { HowItWorksModal } from './components/HowItWorksModal';
import { GasSponsorWithdrawHub } from './components/GasSponsorWithdrawHub';
import { GasFeeCalculator } from './components/GasFeeCalculator';
import { TxHistoryTable } from './components/TxHistoryTable';
import { Zap, Calculator, History, Shield, RefreshCw, Layers } from 'lucide-react';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'withdraw' | 'calculator' | 'history'>('withdraw');

  // Core state
  const [network, setNetwork] = useState<NetworkType>('tron-mainnet');
  const [wallet, setWallet] = useState<WalletState>({
    address: 'TJ31x5zK4vBq8n9m2pL7yR6wE5tY4uI3o2', // Default demo stuck wallet for instant preview
    walletType: 'manual',
    connected: true,
    trxBalance: 0.85, // < 14.8 TRX -> STUCK WALLET!
    usdtBalance: 350.75,
    energyAvailable: 0,
    bandwidthAvailable: 345,
    nativeGasSymbol: 'TRX',
    nativeGasBalance: 0.85,
    isStuck: true
  });

  const [sponsorPool, setSponsorPool] = useState<SponsorPoolInfo>({
    poolAddress: 'TGasSponsorRelayerPool1122334455667788',
    trxBalance: 1458.5,
    sponsoringEnabled: true,
    totalSponsoredCount: 24,
    totalTrxSponsored: 412.0,
    maxSponsorPerTx: 50
  });

  const [settings, setSettings] = useState<ApiSettings>({
    tronGridKey: '',
    tatumKey: '',
    infuraRpcUrl: '',
    sponsorPrivateKey: '',
    selectedNetwork: 'tron-mainnet',
    autoGasSponsor: true,
    maxGasSponsorTrx: 50
  });

  const [history, setHistory] = useState<TransactionRecord[]>([]);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Modals state
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Initial load
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const fetchedSettings = await getApiSettings();
      setSettings(fetchedSettings);
      if (fetchedSettings.selectedNetwork) {
        setNetwork(fetchedSettings.selectedNetwork);
      }

      const poolData = await getSponsorPoolInfo();
      setSponsorPool(poolData);

      const txLogs = await getTransactionHistory();
      setHistory(txLogs);
    } catch (e) {
      console.warn('Initial data load warning:', e);
    }
  };

  // Refresh balance for connected wallet
  const handleRefreshBalance = async () => {
    if (!wallet.address) return;
    setIsLoadingBalance(true);
    try {
      const updated = await checkWalletBalance(wallet.address, network);
      setWallet((prev) => ({
        ...prev,
        ...updated
      }));
    } catch (e) {
      console.warn('Failed to refresh balance:', e);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Switch network
  const handleNetworkChange = async (newNet: NetworkType) => {
    setNetwork(newNet);
    if (wallet.address) {
      setIsLoadingBalance(true);
      try {
        const updated = await checkWalletBalance(wallet.address, newNet);
        setWallet((prev) => ({
          ...prev,
          ...updated
        }));
      } catch (e) {
        console.warn('Failed to fetch balance on new network:', e);
      } finally {
        setIsLoadingBalance(false);
      }
    }
  };

  const handleWalletConnected = async (walletPartial: Partial<WalletState>) => {
    if (walletPartial.address) {
      setIsLoadingBalance(true);
      try {
        const updated = await checkWalletBalance(walletPartial.address, network);
        setWallet({
          ...updated,
          ...walletPartial,
          connected: true
        });
      } catch (e) {
        setWallet({
          address: walletPartial.address,
          walletType: walletPartial.walletType || 'manual',
          connected: true,
          trxBalance: 0.85,
          usdtBalance: 350.75,
          energyAvailable: 0,
          bandwidthAvailable: 345,
          nativeGasSymbol: 'TRX',
          nativeGasBalance: 0.85,
          isStuck: true
        });
      } finally {
        setIsLoadingBalance(false);
      }
    }
  };

  const handleTxCompleted = async () => {
    const updatedHistory = await getTransactionHistory();
    setHistory(updatedHistory);
    const poolData = await getSponsorPoolInfo();
    setSponsorPool(poolData);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500 selection:text-zinc-950 flex flex-col antialiased">
      
      {/* Navigation Header */}
      <Navbar
        wallet={wallet}
        network={network}
        onNetworkChange={handleNetworkChange}
        sponsorPool={sponsorPool}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        onRefreshBalance={handleRefreshBalance}
        isLoadingBalance={isLoadingBalance}
      />

      {/* Primary Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Tab Selection Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 p-1.5 rounded-2xl shadow-inner">
            
            {/* Tab 1: Withdrawal Hub */}
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'withdraw'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Withdrawal & Gas Sponsor</span>
            </button>

            {/* Tab 2: Gas Calculator */}
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Gas & Energy Simulator</span>
            </button>

            {/* Tab 3: History & Audit */}
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Audit Logs ({history.length})</span>
            </button>

          </div>

          {/* Connected Address Indicator */}
          <div className="hidden sm:flex items-center space-x-2 text-xs text-zinc-400 bg-zinc-900/50 px-3 py-1.5 rounded-xl border border-zinc-800">
            <span className="text-zinc-500">Inspecting:</span>
            <span className="font-mono text-zinc-200 font-semibold">{wallet.address}</span>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'withdraw' && (
          <GasSponsorWithdrawHub
            wallet={wallet}
            network={network}
            sponsorPool={sponsorPool}
            onWalletUpdated={setWallet}
            onRefreshSponsorPool={async () => {
              const pool = await getSponsorPoolInfo();
              setSponsorPool(pool);
            }}
            onOpenWalletModal={() => setIsWalletModalOpen(true)}
            onTxCompleted={handleTxCompleted}
          />
        )}

        {activeTab === 'calculator' && (
          <GasFeeCalculator
            network={network}
            sponsorPool={sponsorPool}
          />
        )}

        {activeTab === 'history' && (
          <TxHistoryTable
            history={history}
            onRefreshHistory={async () => {
              const txs = await getTransactionHistory();
              setHistory(txs);
            }}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-zinc-400">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>TRC20 Gas Sponsorship & Withdrawal Protocol</span>
          </div>
          <div>
            TRON Grid API &amp; Gas Relayer Active &bull; Non-Custodial Token Sweeper
          </div>
        </div>
      </footer>

      {/* Modals */}
      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        wallet={wallet}
        onConnectSuccess={handleWalletConnected}
        network={network}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSettingsUpdated={setSettings}
      />

      <HowItWorksModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

    </div>
  );
}
