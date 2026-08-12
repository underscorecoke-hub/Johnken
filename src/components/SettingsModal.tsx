import React, { useState, useEffect } from 'react';
import { ApiSettings, ApiKeyValidation, NetworkType } from '../types';
import { testApiKey, saveApiSettings } from '../lib/api';
import { NETWORKS } from '../lib/networks';
import { Settings, Key, Server, ShieldCheck, CheckCircle2, XCircle, Loader2, Save, X, Cpu, Info } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ApiSettings;
  onSettingsUpdated: (updated: ApiSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsUpdated
}) => {
  const [formData, setFormData] = useState<ApiSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Key testing state
  const [validations, setValidations] = useState<Record<string, ApiKeyValidation>>({
    trongrid: { service: 'trongrid', status: 'idle', message: '' },
    tatum: { service: 'tatum', status: 'idle', message: '' },
    infura: { service: 'infura', status: 'idle', message: '' },
    sponsor: { service: 'sponsor', status: 'idle', message: '' }
  });

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  if (!isOpen) return null;

  const handleTestService = async (service: 'trongrid' | 'tatum' | 'infura' | 'sponsor') => {
    setValidations((prev) => ({
      ...prev,
      [service]: { service, status: 'testing', message: 'Testing connection...' }
    }));

    try {
      const res = await testApiKey(
        service,
        service === 'trongrid' ? formData.tronGridKey : service === 'tatum' ? formData.tatumKey : undefined,
        service === 'infura' ? formData.infuraRpcUrl : undefined
      );

      setValidations((prev) => ({ ...prev, [service]: res }));
    } catch (err: any) {
      setValidations((prev) => ({
        ...prev,
        [service]: { service, status: 'invalid', message: err.message || 'Validation failed' }
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg('');

    try {
      const updated = await saveApiSettings(formData);
      onSettingsUpdated(updated);
      setSaveSuccessMsg('API keys and network configuration saved successfully!');
      setTimeout(() => {
        setSaveSuccessMsg('');
        onClose();
      }, 1200);
    } catch (err: any) {
      alert(`Failed to save settings: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full my-8 overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-300">
              <Settings className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">Blockchain API & Sponsor Settings</h2>
              <p className="text-xs text-zinc-400">Configure API keys for TronGrid, Tatum, EVM RPCs, and Relayer Gas Funding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

          {saveSuccessMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center space-x-2 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Section 1: TronGrid API Key */}
          <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs font-semibold text-zinc-200">
                <Key className="w-4 h-4 text-rose-400" />
                <span>TronGrid API Key (TRON Network)</span>
              </label>
              <button
                type="button"
                onClick={() => handleTestService('trongrid')}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[11px] font-medium transition-colors flex items-center space-x-1 cursor-pointer"
              >
                {validations.trongrid.status === 'testing' ? (
                  <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                ) : (
                  <span>Test Connection</span>
                )}
              </button>
            </div>
            <input
              type="password"
              placeholder="Enter TronGrid Pro API Key..."
              value={formData.tronGridKey}
              onChange={(e) => setFormData({ ...formData, tronGridKey: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/60 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none font-mono"
            />
            {validations.trongrid.status !== 'idle' && (
              <div className={`text-[11px] flex items-center space-x-1.5 ${validations.trongrid.status === 'valid' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {validations.trongrid.status === 'valid' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>{validations.trongrid.message} {validations.trongrid.latencyMs && `(${validations.trongrid.latencyMs}ms)`}</span>
              </div>
            )}
            <p className="text-[11px] text-zinc-500">
              Used to query TRON block parameters, TRC20 token balances, and broadcast signed transactions.
            </p>
          </div>

          {/* Section 2: Tatum API Key */}
          <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs font-semibold text-zinc-200">
                <Server className="w-4 h-4 text-purple-400" />
                <span>Tatum API Key (Multi-chain TRC20 Gateway)</span>
              </label>
              <button
                type="button"
                onClick={() => handleTestService('tatum')}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
              >
                {validations.tatum.status === 'testing' ? <Loader2 className="w-3 h-3 animate-spin text-amber-400" /> : 'Test Tatum'}
              </button>
            </div>
            <input
              type="password"
              placeholder="Enter Tatum API Key..."
              value={formData.tatumKey}
              onChange={(e) => setFormData({ ...formData, tatumKey: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-purple-500/60 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none font-mono"
            />
            {validations.tatum.status !== 'idle' && (
              <div className={`text-[11px] flex items-center space-x-1.5 ${validations.tatum.status === 'valid' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {validations.tatum.status === 'valid' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>{validations.tatum.message}</span>
              </div>
            )}
          </div>

          {/* Section 3: Infura / Alchemy EVM RPC URL */}
          <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs font-semibold text-zinc-200">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span>Infura / Alchemy / QuickNode RPC URL</span>
              </label>
              <button
                type="button"
                onClick={() => handleTestService('infura')}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
              >
                {validations.infura.status === 'testing' ? <Loader2 className="w-3 h-3 animate-spin text-amber-400" /> : 'Test RPC'}
              </button>
            </div>
            <input
              type="text"
              placeholder="https://mainnet.infura.io/v3/YOUR_KEY or custom RPC URL"
              value={formData.infuraRpcUrl}
              onChange={(e) => setFormData({ ...formData, infuraRpcUrl: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500/60 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none font-mono"
            />
            {validations.infura.status !== 'idle' && (
              <div className={`text-[11px] flex items-center space-x-1.5 ${validations.infura.status === 'valid' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {validations.infura.status === 'valid' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>{validations.infura.message}</span>
              </div>
            )}
          </div>

          {/* Section 4: Gas Sponsor Relayer Private Key */}
          <div className="p-4 bg-zinc-950/60 border border-amber-500/20 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs font-semibold text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Gas Sponsor Relayer Private Key (Gas Funding Wallet)</span>
              </label>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                Relayer Pool Active
              </span>
            </div>
            <input
              type="password"
              placeholder="Enter private key of gas funding wallet (Optional - Relayer pool active by default)..."
              value={formData.sponsorPrivateKey}
              onChange={(e) => setFormData({ ...formData, sponsorPrivateKey: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500/60 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none font-mono"
            />
            <div className="p-2.5 bg-amber-500/5 border border-amber-500/10 rounded-lg flex items-start space-x-2 text-[11px] text-amber-200/80">
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Leave empty to use the application's built-in <strong>Gas Relayer Pool</strong>. Providing your own private key connects a custom gas node.
              </span>
            </div>
          </div>

          {/* Section 5: Network & Auto Sponsor Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-2">
              <label className="block text-xs font-semibold text-zinc-200">
                Default Blockchain Network
              </label>
              <select
                value={formData.selectedNetwork}
                onChange={(e) => setFormData({ ...formData, selectedNetwork: e.target.value as NetworkType })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none cursor-pointer"
              >
                {Object.values(NETWORKS).map((net) => (
                  <option key={net.id} value={net.id}>
                    {net.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200">Auto Gas Sponsoring</span>
                <input
                  type="checkbox"
                  checked={formData.autoGasSponsor}
                  onChange={(e) => setFormData({ ...formData, autoGasSponsor: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Max Sponsor Limit / Tx:</span>
                <span className="font-mono font-bold text-amber-400">{formData.maxGasSponsorTrx} TRX</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition-colors flex items-center space-x-2 cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save & Apply Settings</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
