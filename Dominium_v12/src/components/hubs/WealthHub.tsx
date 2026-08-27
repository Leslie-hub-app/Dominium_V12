import React, { useState } from 'react';
import { GameState, StockAsset, RealEstateProperty } from '../../types';
import { calculateNetWorth } from '../../engine/simulationEngine';
import { calculateBorrowingCapacity, calculateMonthlyTradeoffsAndOverhead } from '../../engine/balanceEngine';
import { AVAILABLE_PROPERTIES_CATALOG } from '../../data/catalogs';
import { 
  DollarSign, 
  TrendingUp, 
  Building, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Percent, 
  ShieldAlert, 
  Plus, 
  Trash2,
  Trophy,
  ReceiptText
} from 'lucide-react';
import { FinancialLedgerModal } from '../expansion2/FinancialLedgerModal';
import { ExpandedBankingSection } from '../expansion2/ExpandedBankingSection';
import { ExpandedInvestmentSection } from '../expansion2/ExpandedInvestmentSection';
import { ExpandedPropertySection } from '../expansion2/ExpandedPropertySection';
import { LivingWealthPlatformView } from '../expansion2/LivingWealthPlatformView';
import { LivingBankingPanel } from '../expansion2/LivingBankingAndPoliticsPanel';

interface WealthHubProps {
  state: GameState;
  activeSubTab?: 'overview' | 'stocks' | 'properties' | 'banking' | 'living_finance' | 'living_banking' | 'leaderboard';
  onSelectSubTab?: (tab: 'overview' | 'stocks' | 'properties' | 'banking' | 'living_finance' | 'living_banking' | 'leaderboard') => void;
  onTradeStock: (symbol: string, action: 'BUY' | 'SELL', shares: number) => void;
  onBuyProperty: (propTemplate: any, withMortgage: boolean) => void;
  onManageProperty: (propId: string, action: 'RENT' | 'EVICT' | 'RENOVATE' | 'SELL') => void;
  onTakeLoan: (amount: number, termMonths: number) => void;
  onRepayLoan: (loanId: string) => void;
  onTransferBank?: (fromType: string, toType: string, amount: number) => void;
  onStateChange?: () => void;
}

export const WealthHub: React.FC<WealthHubProps> = ({
  state,
  activeSubTab: controlledSubTab,
  onSelectSubTab,
  onTradeStock,
  onBuyProperty,
  onManageProperty,
  onTakeLoan,
  onRepayLoan,
  onStateChange
}) => {
  const [internalSubTab, setInternalSubTab] = useState<'overview' | 'stocks' | 'properties' | 'banking' | 'living_finance' | 'living_banking' | 'leaderboard'>('overview');
  const [showLedgerModal, setShowLedgerModal] = useState<boolean>(false);
  const subTab = controlledSubTab || internalSubTab;
  const setSubTab = (newTab: 'overview' | 'stocks' | 'properties' | 'banking' | 'living_finance' | 'living_banking' | 'leaderboard') => {
    setInternalSubTab(newTab);
    if (onSelectSubTab) onSelectSubTab(newTab);
  };
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string>('NVIX');
  const [tradeSharesCount, setTradeSharesCount] = useState<number>(10);
  const [loanAmount, setLoanAmount] = useState<number>(50000);

  const { finances } = state;
  const netWorth = calculateNetWorth(state) || 0;
  const underwriting = calculateBorrowingCapacity(state, loanAmount);
  const tradeoffs = calculateMonthlyTradeoffsAndOverhead(state, netWorth);

  const selectedStock = finances.stocks?.find(s => s.symbol === selectedStockSymbol) || finances.stocks?.[0];

  // Global wealth leaderboard simulation (Forbes style)
  const billionaireLeaderboard = [
    { rank: 1, name: 'Elon Vance', netWorth: 248000000000, company: 'Aetherion Starship Corp', country: 'United States' },
    { rank: 2, name: 'Bernard Arnault', netWorth: 195000000000, company: 'LVMH Sovereign Luxury', country: 'France' },
    { rank: 3, name: 'Jeff Bezos', netWorth: 180000000000, company: 'Amazon Prime Logistics', country: 'United States' },
    { rank: 4, name: 'Warren Buffett', netWorth: 135000000000, company: 'Berkshire Conglomerate', country: 'United States' },
    { rank: 5, name: `${state.character.firstName} ${state.character.lastName} (You)`, netWorth: netWorth || 0, company: state.companies[0]?.name || 'Private Portfolio', country: state.character.residenceCountry, isPlayer: true }
  ].sort((a, b) => (b.netWorth || 0) - (a.netWorth || 0)).map((item, idx) => ({ ...item, rank: idx + 1 }));

  return (
    <div className="space-y-4">
      {/* Sub navigation */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { key: 'overview', label: 'Financial Overview', icon: <DollarSign className="w-3.5 h-3.5" /> },
            { key: 'banking', label: 'Banking & Credit Engine', icon: <CreditCard className="w-3.5 h-3.5" /> },
            { key: 'living_finance', label: 'Living Wealth Network', icon: <TrendingUp className="w-3.5 h-3.5" /> },
            { key: 'living_banking', label: 'Banks & Accounts', icon: <CreditCard className="w-3.5 h-3.5" /> },
            { key: 'stocks', label: 'Capital Markets & Crypto', icon: <TrendingUp className="w-3.5 h-3.5" /> },
            { key: 'properties', label: 'Real Estate & Development', icon: <Building className="w-3.5 h-3.5" /> },
            { key: 'leaderboard', label: 'Billionaires Ranking', icon: <Trophy className="w-3.5 h-3.5" /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSubTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                subTab === tab.key
                  ? 'bg-zinc-900 text-amber-400 border border-zinc-700/90 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowLedgerModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-750 text-xs font-black transition-all shrink-0 ml-2"
        >
          <ReceiptText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Transaction Ledger</span>
        </button>
      </div>

      {subTab === 'living_banking' && <LivingBankingPanel state={state} onStateChange={onStateChange} />}

      {/* 1. FINANCIAL OVERVIEW */}
      {subTab === 'overview' && (
        <div className="space-y-3.5 sm:space-y-4">
          <div className="bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-800 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Total Personal Net Worth</span>
                <h3 className="text-2xl sm:text-4xl font-black text-zinc-100 tracking-tight">${netWorth.toLocaleString()}</h3>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Liquid Cash Balance</span>
                <div className="text-xl sm:text-2xl font-black text-emerald-400">${finances.cash.toLocaleString()}</div>
              </div>
            </div>

            {/* Asset Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Stock & Market Assets</span>
                <div className="text-base font-extrabold text-zinc-100 mt-1">
                  ${((state.expansion2Investment?.totalPortfolioValue || (state as any).expansion2InvestmentMarket?.totalPortfolioValue || 0) + finances.stocks.reduce((acc, s) => acc + (s.sharesOwned * s.currentPrice), 0)).toLocaleString()}
                </div>
              </div>
              <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Real Estate & Towers</span>
                <div className="text-base font-extrabold text-zinc-100 mt-1">
                  ${((state.expansion2Property?.totalRealEstateValue || (state as any).expansion2PropertySystem?.totalRealEstateValue || 0) + finances.properties.reduce((acc, p) => acc + p.currentValue, 0)).toLocaleString()}
                </div>
              </div>
              <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Corporate Equity</span>
                <div className="text-base font-extrabold text-zinc-100 mt-1">
                  ${state.companies.reduce((acc, c) => acc + ((c.valuation * c.playerOwnershipPercentage) / 100), 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Total Liabilities</span>
                <div className="text-base font-extrabold text-rose-400 mt-1">
                  ${((state.expansion2BankingCredit?.totalLiabilitiesOutstanding || 0) + finances.loans.reduce((acc, l) => acc + l.remainingBalance, 0)).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Monthly Overhead & Systemic Trade-Offs */}
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Monthly Cash Outflows & Trade-Offs</span>
                <span className="text-xs font-black text-rose-400">Total: -${tradeoffs.totalMonthlyExpenses.toLocaleString()}/mo</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400">Living & Homes:</span>
                  <div className="font-bold text-zinc-200 mt-0.5">${tradeoffs.baseLivingCost.toLocaleString()}/mo</div>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400">Security & Family Office:</span>
                  <div className="font-bold text-amber-300 mt-0.5">${(tradeoffs.wealthOverhead + tradeoffs.securityCost).toLocaleString()}/mo</div>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400">Public Office Upkeep:</span>
                  <div className="font-bold text-cyan-300 mt-0.5">${tradeoffs.politicalOfficeUpkeep.toLocaleString()}/mo</div>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400">Debt Service:</span>
                  <div className="font-bold text-rose-300 mt-0.5">${tradeoffs.totalDebtService.toLocaleString()}/mo</div>
                </div>
              </div>

              {tradeoffs.tradeOffNotes.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-zinc-800/80">
                  {tradeoffs.tradeOffNotes.map((note, idx) => (
                    <div key={idx} className="text-[11px] text-zinc-400 flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. BANKING & CREDIT ENGINE */}
      {subTab === 'banking' && (
        <ExpandedBankingSection state={state} onStateChange={onStateChange} />
      )}

      {/* 3. STOCKS & CAPITAL MARKETS */}
      {subTab === 'stocks' && (
        <ExpandedInvestmentSection state={state} onStateChange={onStateChange} />
      )}

      {/* 4. REAL ESTATE & DEVELOPMENTS */}
      {subTab === 'living_finance' && <LivingWealthPlatformView state={state} onStateChange={onStateChange} />}

      {subTab === 'properties' && (
        <ExpandedPropertySection state={state} onStateChange={onStateChange} />
      )}

      {/* 5. BILLIONAIRES LEADERBOARD */}
      {subTab === 'leaderboard' && (
        <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-3.5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Forbes Sovereign Index</span>
              <h3 className="text-base font-black text-zinc-100">Global Wealth Rankings</h3>
            </div>
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>

          <div className="space-y-2">
            {billionaireLeaderboard.map(item => (
              <div 
                key={item.name}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                  item.isPlayer 
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-md' 
                    : 'bg-zinc-950/70 border-zinc-800/80 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                    item.rank === 1 ? 'bg-amber-400 text-zinc-950' : item.rank === 2 ? 'bg-zinc-300 text-zinc-950' : item.rank === 3 ? 'bg-amber-700 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    #{item.rank}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-zinc-100">{item.name}</div>
                    <div className="text-[10px] text-zinc-400">{item.company} • {item.country}</div>
                  </div>
                </div>

                <div className="text-right font-black text-xs sm:text-sm text-emerald-400">
                  ${item.netWorth.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction Audit Ledger Modal */}
      {showLedgerModal && (
        <FinancialLedgerModal state={state} onClose={() => setShowLedgerModal(false)} />
      )}
    </div>
  );
};
