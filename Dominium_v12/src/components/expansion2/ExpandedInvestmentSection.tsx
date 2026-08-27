import React, { useState } from 'react';
import { GameState, MarketAsset, PortfolioHolding } from '../../types';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight, 
  Percent, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  ensureInvestmentMarketState, 
  buyMarketAsset, 
  sellMarketAsset 
} from '../../engine/investmentEngine';

interface ExpandedInvestmentSectionProps {
  state: GameState;
  onStateChange?: () => void;
}

export const ExpandedInvestmentSection: React.FC<ExpandedInvestmentSectionProps> = ({ 
  state, 
  onStateChange 
}) => {
  const market = ensureInvestmentMarketState(state);

  const [activeTab, setActiveTab] = useState<'market' | 'portfolio'>('market');
  const [selectedAssetId, setSelectedAssetId] = useState<string>(market.marketAssets[0]?.id || 'asset_nvix');
  const [tradeShares, setTradeShares] = useState<number>(10);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [feedback, setFeedback] = useState<{ msg: string; isError?: boolean } | null>(null);

  const selectedAsset = market.marketAssets.find(a => a.id === selectedAssetId) || market.marketAssets[0];
  const userHolding = market.portfolioHoldings.find(h => h.assetId === selectedAssetId);

  const showToast = (msg: string, isError: boolean = false) => {
    setFeedback({ msg, isError });
    setTimeout(() => setFeedback(null), 5000);
    if (onStateChange) onStateChange();
  };

  const handleBuy = () => {
    if (!selectedAsset) return;
    const res = buyMarketAsset(state, selectedAsset.id, tradeShares);
    showToast(res.message, !res.success);
  };

  const handleSell = (sharesToSell?: number) => {
    if (!selectedAsset) return;
    const res = sellMarketAsset(state, selectedAsset.id, sharesToSell || tradeShares);
    showToast(res.message, !res.success);
  };

  const filteredAssets = market.marketAssets.filter(a => {
    if (selectedCategory === 'ALL') return true;
    return a.category === selectedCategory;
  });

  return (
    <div className="space-y-4">
      {/* Toast */}
      {feedback && (
        <div className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-2 ${
          feedback.isError ? 'bg-rose-950/80 border-rose-700/80 text-rose-200' : 'bg-emerald-950/80 border-emerald-700/80 text-emerald-200'
        }`}>
          {feedback.isError ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Top Portfolio Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 shadow-sm">
          <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Portfolio Market Value</div>
          <div className="text-base sm:text-lg font-black text-zinc-100 mt-0.5">
            ${(market.totalPortfolioValue || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Cost Basis: ${(market.totalCostBasis || 0).toLocaleString()}</div>
        </div>

        <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 shadow-sm">
          <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Unrealized P&L</div>
          <div className={`text-base sm:text-lg font-black mt-0.5 ${(market.totalUnrealizedPnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {(market.totalUnrealizedPnl || 0) >= 0 ? '+' : ''}${(market.totalUnrealizedPnl || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">
            {market.totalCostBasis > 0 ? `${Math.round((market.totalUnrealizedPnl / market.totalCostBasis) * 10000) / 100}%` : '0%'}
          </div>
        </div>

        <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 shadow-sm">
          <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Monthly Dividends</div>
          <div className="text-base sm:text-lg font-black text-amber-400 mt-0.5">
            +${(market.monthlyDividendIncome || 0).toLocaleString()}/mo
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Distributed to cash</div>
        </div>

        <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 shadow-sm">
          <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Lifetime Realized Gain</div>
          <div className={`text-base sm:text-lg font-black mt-0.5 ${(market.totalRealizedPnlLifetime || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {(market.totalRealizedPnlLifetime || 0) >= 0 ? '+' : ''}${(market.totalRealizedPnlLifetime || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Harvested profits</div>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('market')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'market'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Market Exchange ({market.marketAssets.length})
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'portfolio'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" /> My Holdings ({market.portfolioHoldings.length})
          </button>
        </div>

        {activeTab === 'market' && (
          <div className="hidden sm:flex items-center gap-1 text-xs">
            {['ALL', 'Tech', 'BlueChip', 'Bond', 'Commodity', 'Crypto', 'ETF'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                  selectedCategory === cat ? 'bg-zinc-800 text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1: MARKET EXCHANGE */}
      {activeTab === 'market' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Asset List */}
          <div className="lg:col-span-2 space-y-2 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredAssets.map(asset => {
              const isSelected = selectedAssetId === asset.id;
              const holding = market.portfolioHoldings.find(h => h.assetId === asset.id);
              const priceHistory = asset.priceHistory || [asset.currentPrice];
              const prevPrice = priceHistory[Math.max(0, priceHistory.length - 2)] || asset.currentPrice;
              const priceChange = asset.currentPrice - prevPrice;
              const priceChangePercent = prevPrice > 0 ? (priceChange / prevPrice) * 100 : 0;

              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAssetId(asset.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-zinc-900 border-amber-500/80 shadow-md ring-1 ring-amber-500/50'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-black text-xs text-amber-400">
                      {asset.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-zinc-100">{asset.name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {asset.symbol}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          {asset.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-3">
                        <span>Vol: {asset.volatilityRating}</span>
                        {asset.annualDividendYield > 0 && (
                          <span className="text-emerald-400 font-bold">{asset.annualDividendYield}% Yield</span>
                        )}
                        {holding && (
                          <span className="text-amber-400 font-bold">Owned: {holding.sharesOwned} shs</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-zinc-100">
                      ${asset.currentPrice.toLocaleString()}
                    </div>
                    <div className={`text-[11px] font-bold flex items-center justify-end gap-0.5 ${
                      priceChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {priceChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trade Order Terminal */}
          {selectedAsset && (
            <div className="bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-4 h-fit">
              <div className="border-b border-zinc-800 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Order Terminal</span>
                  <span className="text-xs font-black text-zinc-400">{selectedAsset.symbol}</span>
                </div>
                <h3 className="text-sm font-black text-zinc-100 mt-0.5">{selectedAsset.name}</h3>
                <div className="text-lg font-black text-zinc-100 mt-1">
                  ${selectedAsset.currentPrice.toLocaleString()}
                </div>
              </div>

              {/* 52-Week Range */}
              <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 text-[11px] space-y-1.5">
                <div className="flex justify-between text-zinc-400">
                  <span>52-Wk Low: <strong className="text-zinc-200">${selectedAsset.low52Week.toLocaleString()}</strong></span>
                  <span>52-Wk High: <strong className="text-zinc-200">${selectedAsset.high52Week.toLocaleString()}</strong></span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Dividend Yield: <strong className="text-emerald-400">{selectedAsset.annualDividendYield}%</strong></span>
                  <span>Volatility: <strong className="text-zinc-200">{selectedAsset.volatilityRating}</strong></span>
                </div>
              </div>

              {/* Current Position */}
              <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 text-[11px] space-y-1">
                <div className="text-zinc-500 font-bold uppercase text-[10px]">Your Position</div>
                <div className="flex justify-between text-zinc-200 font-bold">
                  <span>Shares Owned:</span>
                  <span>{userHolding?.sharesOwned || 0}</span>
                </div>
                <div className="flex justify-between text-zinc-200 font-bold">
                  <span>Market Value:</span>
                  <span>${(userHolding?.currentValue || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Trade Controls */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-zinc-400 mb-1">
                    <span>Shares Quantity</span>
                    <span>Total Cost: <strong className="text-zinc-100 font-mono">${(Math.round(tradeShares * selectedAsset.currentPrice * 100) / 100).toLocaleString()}</strong></span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={tradeShares}
                    onChange={(e) => setTradeShares(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-100 font-mono font-bold"
                  />
                </div>

                <div className="flex gap-2">
                  {[5, 10, 50, 100, 500].map(qty => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setTradeShares(qty)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                        tradeShares === qty ? 'bg-zinc-800 text-amber-300 border-zinc-700' : 'bg-zinc-950 text-zinc-500 border-zinc-850'
                      }`}
                    >
                      {qty}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={handleBuy}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
                  >
                    <ArrowDownRight className="w-3.5 h-3.5" /> Buy {selectedAsset.symbol}
                  </button>
                  <button
                    onClick={() => handleSell()}
                    disabled={!userHolding || userHolding.sharesOwned <= 0}
                    className="py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" /> Sell {selectedAsset.symbol}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PORTFOLIO HOLDINGS */}
      {activeTab === 'portfolio' && (
        <div className="space-y-3">
          {market.portfolioHoldings.length === 0 ? (
            <div className="bg-zinc-900/60 p-8 rounded-2xl border border-zinc-800 text-center space-y-3">
              <PieChart className="w-10 h-10 text-zinc-600 mx-auto" />
              <div className="text-sm font-bold text-zinc-300">No Asset Holdings in Brokerage</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Explore the Market Exchange tab to allocate capital into tech equities, sovereign bonds, commodities, or global ETFs.
              </p>
              <button
                onClick={() => setActiveTab('market')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black rounded-xl transition-colors shadow-md"
              >
                Browse Market Assets
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {market.portfolioHoldings.map(holding => {
                const asset = market.marketAssets.find(a => a.id === holding.assetId);

                return (
                  <div key={holding.assetId} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-zinc-100">{holding.name}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400">
                            {holding.symbol}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{holding.sharesOwned} Shares Owned</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        {holding.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs">
                      <div>
                        <div className="text-[10px] text-zinc-500">Current Market Value</div>
                        <div className="font-black text-zinc-100">${holding.currentValue.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500">Cost Basis</div>
                        <div className="text-zinc-300 font-mono">${holding.totalCostBasis.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500">Unrealized P&L</div>
                        <div className={`font-black ${holding.unrealizedGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {holding.unrealizedGainLoss >= 0 ? '+' : ''}${holding.unrealizedGainLoss.toLocaleString()} ({holding.unrealizedGainLossPercent}%)
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500">Lifetime Dividends</div>
                        <div className="font-black text-amber-400">+${holding.dividendsEarnedLifetime.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          setSelectedAssetId(holding.assetId);
                          setActiveTab('market');
                        }}
                        className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-700 transition-colors"
                      >
                        Trade / Add Shares
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAssetId(holding.assetId);
                          handleSell(holding.sharesOwned);
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-colors"
                      >
                        Sell All
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
