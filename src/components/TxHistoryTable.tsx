import React, { useState } from 'react';
import { TransactionRecord } from '../types';
import { truncateAddress } from '../lib/wallet';
import { clearTransactionHistory } from '../lib/api';
import { NETWORKS } from '../lib/networks';
import { History, ExternalLink, CheckCircle2, Clock, XCircle, Search, Trash2, Zap, ArrowUpRight } from 'lucide-react';

interface TxHistoryTableProps {
  history: TransactionRecord[];
  onRefreshHistory: () => void;
}

export const TxHistoryTable: React.FC<TxHistoryTableProps> = ({
  history,
  onRefreshHistory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to clear transaction history?')) {
      await clearTransactionHistory();
      onRefreshHistory();
    }
  };

  const filteredHistory = history.filter((record) => {
    const matchesSearch = 
      record.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.fromAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.toAddress.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'all') return matchesSearch;
    if (filterType === 'sponsor') return matchesSearch && record.type === 'sponsor_gas';
    if (filterType === 'withdraw') return matchesSearch && record.type === 'trc20_withdraw';
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-zinc-100">Transaction History & Relayer Audit Logs</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Audit history of gas sponsorship deposits and TRC20 token withdrawals broadcasted on-chain.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleClearHistory}
            className="px-3 py-2 bg-zinc-950 hover:bg-rose-500/10 text-rose-400 border border-zinc-800 hover:border-rose-500/30 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search address or Tx Hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none font-mono"
          />
        </div>

        <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${filterType === 'all' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            All Logs ({history.length})
          </button>
          <button
            onClick={() => setFilterType('sponsor')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${filterType === 'sponsor' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Gas Sponsorships
          </button>
          <button
            onClick={() => setFilterType('withdraw')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${filterType === 'withdraw' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            TRC20 Withdrawals
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/60 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="py-3 px-4">Type / Token</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">From → To Address</th>
                <th className="py-3 px-4">Gas Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Explorer Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-xs">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500 text-xs">
                    No matching transaction logs found.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                    
                    {/* Type / Token */}
                    <td className="py-3.5 px-4 font-medium">
                      <div className="flex items-center space-x-2">
                        {item.type === 'sponsor_gas' ? (
                          <span className="p-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
                            <Zap className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <div>
                          <div className="text-zinc-200 font-semibold">{item.token}</div>
                          <div className="text-[10px] text-zinc-500">{item.type === 'sponsor_gas' ? 'Relayer Energy Deposit' : 'Token Transfer'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-200">
                      {item.type === 'sponsor_gas' ? (
                        <span className="text-amber-400">+{item.amount} TRX</span>
                      ) : (
                        <span className="text-emerald-400">${item.amount.toFixed(2)} USDT</span>
                      )}
                    </td>

                    {/* From -> To Address */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400">
                      <div><span className="text-zinc-500">From:</span> {truncateAddress(item.fromAddress)}</div>
                      <div><span className="text-zinc-500">To:</span> {truncateAddress(item.toAddress)}</div>
                    </td>

                    {/* Gas Status */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Gas Sponsored ⚡
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4 text-[11px] text-zinc-400 whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>

                    {/* Explorer Link */}
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={item.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold hover:underline"
                      >
                        <span>TronScan</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
