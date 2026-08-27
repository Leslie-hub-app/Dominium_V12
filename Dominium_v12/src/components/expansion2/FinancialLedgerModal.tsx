import React, { useState } from 'react';
import { GameState, FinancialLedgerEntry, FinancialTransactionType } from '../../types';
import { 
  DollarSign, 
  X, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Download, 
  CheckCircle2,
  Calendar,
  Layers,
  PieChart
} from 'lucide-react';
import { ensureFinancialLedger } from '../../engine/financialLedgerEngine';

interface FinancialLedgerModalProps {
  state: GameState;
  onClose: () => void;
}

export const FinancialLedgerModal: React.FC<FinancialLedgerModalProps> = ({ state, onClose }) => {
  const ledger = ensureFinancialLedger(state);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const allEntries = ledger.entries || ledger.transactions || [];

  const filteredEntries = allEntries.filter(entry => {
    if (!entry) return false;
    if (selectedCategory !== 'ALL' && entry.category !== selectedCategory) return false;
    if (selectedType !== 'ALL' && entry.type !== selectedType) return false;
    return true;
  });

  const grossIncome = ledger.monthlyGrossIncome ?? 
    allEntries.filter(e => e.category === 'INCOME').reduce((acc, e) => acc + (e.amount || 0), 0);
  const totalExpenses = ledger.monthlyTotalExpenses ?? 
    allEntries.filter(e => e.category === 'EXPENSE' || (e.category as string) === 'TAX').reduce((acc, e) => acc + (e.amount || 0), 0);
  const netCashflow = ledger.monthlyNetCashflow ?? (grossIncome - totalExpenses);
  const lifetimeEarned = ledger.cumulativeEarnedLifetime ?? ledger.totalLifetimeEarned ?? grossIncome;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-zinc-100 flex items-center gap-2">
                Executive Financial Ledger & Audit Trail
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {allEntries.length} Records
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Double-entry transaction records, income streams, expenses, and asset movements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-zinc-900/90 border-b border-zinc-800 text-xs">
          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
            <div className="text-zinc-400 text-[11px]">Monthly Gross Income</div>
            <div className="text-sm sm:text-base font-bold text-emerald-400">
              +${grossIncome.toLocaleString()}
            </div>
          </div>
          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
            <div className="text-zinc-400 text-[11px]">Monthly Total Expenses</div>
            <div className="text-sm sm:text-base font-bold text-rose-400">
              -${totalExpenses.toLocaleString()}
            </div>
          </div>
          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
            <div className="text-zinc-400 text-[11px]">Monthly Net Cashflow</div>
            <div className={`text-sm sm:text-base font-bold ${netCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {netCashflow >= 0 ? '+' : ''}${netCashflow.toLocaleString()}
            </div>
          </div>
          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
            <div className="text-zinc-400 text-[11px]">Cumulative Lifetime Earned</div>
            <div className="text-sm sm:text-base font-bold text-amber-400">
              ${lifetimeEarned.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-3 bg-zinc-950/40 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-zinc-400 font-bold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            {['ALL', 'INCOME', 'EXPENSE', 'ASSET', 'LIABILITY', 'TAX'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                    : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-zinc-400 text-[11px]">
            Showing <strong className="text-zinc-200">{filteredEntries.length}</strong> of {allEntries.length} items
          </div>
        </div>

        {/* Ledger Entries List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs">
              No financial ledger records found matching this filter criteria.
            </div>
          ) : (
            filteredEntries.map(entry => {
              const isIncome = entry.category === 'INCOME';
              const isExpense = entry.category === 'EXPENSE' || (entry.category as string) === 'TAX';

              return (
                <div 
                  key={entry.id}
                  className="bg-zinc-950/60 hover:bg-zinc-850/60 p-3 rounded-xl border border-zinc-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg mt-0.5 ${
                      isIncome 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : isExpense
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-100">{entry.description}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                          {entry.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-3">
                        <span>Year {entry.year}, Month {entry.month}</span>
                        {entry.sourceAccount && <span>From: {entry.sourceAccount}</span>}
                        {entry.destinationAccount && <span>To: {entry.destinationAccount}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="text-right sm:self-center pl-11 sm:pl-0">
                    <div className={`text-sm font-black ${
                      isIncome ? 'text-emerald-400' : isExpense ? 'text-rose-400' : 'text-zinc-200'
                    }`}>
                      {isIncome ? '+' : isExpense ? '-' : ''}${entry.amount.toLocaleString()}
                    </div>
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      {entry.category}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-zinc-950/80 border-t border-zinc-800 flex items-center justify-between text-xs">
          <div className="text-zinc-400 text-[11px]">
            System ledger synchronized with central bank double-entry standard
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl transition-colors"
          >
            Close Ledger
          </button>
        </div>

      </div>
    </div>
  );
};
