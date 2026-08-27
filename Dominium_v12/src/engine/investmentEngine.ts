import { 
  GameState, 
  InvestmentMarketState, 
  MarketAsset, 
  PortfolioHolding 
} from '../types';
import { EXPANSION2_MARKET_ASSETS } from '../data/expansion2Catalogs';
import { recordFinancialTransaction } from './financialLedgerEngine';

export function initializeInvestmentMarketState(): InvestmentMarketState {
  return {
    marketAssets: EXPANSION2_MARKET_ASSETS,
    portfolioHoldings: [],
    totalPortfolioValue: 0,
    totalCostBasis: 0,
    totalUnrealizedPnl: 0,
    totalRealizedPnlLifetime: 0,
    monthlyDividendIncome: 0
  };
}

export function ensureInvestmentMarketState(state: GameState): InvestmentMarketState {
  if (!state.investmentMarket) {
    state.investmentMarket = initializeInvestmentMarketState();
  }
  if (!Array.isArray(state.investmentMarket.marketAssets) || state.investmentMarket.marketAssets.length === 0) {
    state.investmentMarket.marketAssets = EXPANSION2_MARKET_ASSETS;
  }
  if (!Array.isArray(state.investmentMarket.portfolioHoldings)) {
    state.investmentMarket.portfolioHoldings = [];
  }
  return state.investmentMarket;
}

export function buyMarketAsset(
  state: GameState,
  assetId: string,
  shares: number
): { success: boolean; message: string; holding?: PortfolioHolding } {
  if (shares <= 0) return { success: false, message: 'Shares count must be greater than zero.' };

  const market = ensureInvestmentMarketState(state);
  const asset = market.marketAssets.find(a => a.id === assetId);
  if (!asset) return { success: false, message: 'Market asset not found.' };

  const totalCost = Math.round(asset.currentPrice * shares * 100) / 100;
  if ((state.finances?.cash || 0) < totalCost) {
    return { success: false, message: `Insufficient cash to purchase ${shares} shares of ${asset.symbol} ($${totalCost.toLocaleString()}).` };
  }

  // Deduct cash
  state.finances.cash -= totalCost;

  let holding = market.portfolioHoldings.find(h => h.assetId === assetId);
  if (!holding) {
    holding = {
      assetId: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      category: asset.category,
      sharesOwned: shares,
      avgPurchasePrice: asset.currentPrice,
      currentValue: totalCost,
      totalCostBasis: totalCost,
      unrealizedGainLoss: 0,
      unrealizedGainLossPercent: 0,
      dividendsEarnedLifetime: 0
    };
    market.portfolioHoldings.push(holding);
  } else {
    const newTotalCostBasis = holding.totalCostBasis + totalCost;
    const newShares = holding.sharesOwned + shares;
    holding.avgPurchasePrice = Math.round((newTotalCostBasis / newShares) * 100) / 100;
    holding.sharesOwned = newShares;
    holding.totalCostBasis = newTotalCostBasis;
    holding.currentValue = Math.round(newShares * asset.currentPrice * 100) / 100;
    holding.unrealizedGainLoss = holding.currentValue - holding.totalCostBasis;
    holding.unrealizedGainLossPercent = Math.round((holding.unrealizedGainLoss / holding.totalCostBasis) * 10000) / 100;
  }

  recordFinancialTransaction(state, {
    type: 'STOCK_PURCHASE',
    category: 'ASSET',
    amount: totalCost,
    description: `Purchased ${shares} shares of ${asset.symbol} @ $${asset.currentPrice.toLocaleString()}`,
    sourceAccount: 'Liquid Cash',
    destinationAccount: `Brokerage Portfolio (${asset.symbol})`
  });

  updatePortfolioSummary(state);

  return {
    success: true,
    message: `Bought ${shares} shares of ${asset.symbol} for $${totalCost.toLocaleString()}.`,
    holding
  };
}

export function sellMarketAsset(
  state: GameState,
  assetId: string,
  shares: number
): { success: boolean; message: string; realizedPnl: number } {
  if (shares <= 0) return { success: false, message: 'Shares count must be greater than zero.', realizedPnl: 0 };

  const market = ensureInvestmentMarketState(state);
  const holding = market.portfolioHoldings.find(h => h.assetId === assetId);
  const asset = market.marketAssets.find(a => a.id === assetId);

  if (!holding || holding.sharesOwned <= 0 || !asset) {
    return { success: false, message: 'No shares held for this asset.', realizedPnl: 0 };
  }

  const sharesToSell = Math.min(shares, holding.sharesOwned);
  const grossProceeds = Math.round(sharesToSell * asset.currentPrice * 100) / 100;
  const costBasisPortion = Math.round(sharesToSell * holding.avgPurchasePrice * 100) / 100;
  const realizedPnl = Math.round((grossProceeds - costBasisPortion) * 100) / 100;

  holding.sharesOwned -= sharesToSell;
  holding.totalCostBasis -= costBasisPortion;

  if (holding.sharesOwned <= 0) {
    market.portfolioHoldings = market.portfolioHoldings.filter(h => h.assetId !== assetId);
  } else {
    holding.currentValue = Math.round(holding.sharesOwned * asset.currentPrice * 100) / 100;
    holding.unrealizedGainLoss = holding.currentValue - holding.totalCostBasis;
    holding.unrealizedGainLossPercent = Math.round((holding.unrealizedGainLoss / holding.totalCostBasis) * 10000) / 100;
  }

  state.finances.cash += grossProceeds;
  market.totalRealizedPnlLifetime += realizedPnl;

  recordFinancialTransaction(state, {
    type: 'STOCK_SALE',
    category: 'ASSET',
    amount: grossProceeds,
    description: `Sold ${sharesToSell} shares of ${asset.symbol} @ $${asset.currentPrice.toLocaleString()} (P&L: ${realizedPnl >= 0 ? '+' : ''}$${realizedPnl.toLocaleString()})`,
    sourceAccount: `Brokerage Portfolio (${asset.symbol})`,
    destinationAccount: 'Liquid Cash'
  });

  updatePortfolioSummary(state);

  return {
    success: true,
    message: `Sold ${sharesToSell} shares of ${asset.symbol} for $${grossProceeds.toLocaleString()} (${realizedPnl >= 0 ? `+$${realizedPnl.toLocaleString()} gain` : `-$${Math.abs(realizedPnl).toLocaleString()} loss`}).`,
    realizedPnl
  };
}

export function updatePortfolioSummary(state: GameState): void {
  const market = ensureInvestmentMarketState(state);
  let totalVal = 0;
  let totalCost = 0;

  market.portfolioHoldings.forEach(holding => {
    const asset = market.marketAssets.find(a => a.id === holding.assetId);
    if (asset) {
      holding.currentValue = Math.round(holding.sharesOwned * asset.currentPrice * 100) / 100;
      holding.unrealizedGainLoss = Math.round((holding.currentValue - holding.totalCostBasis) * 100) / 100;
      holding.unrealizedGainLossPercent = holding.totalCostBasis > 0 ? Math.round((holding.unrealizedGainLoss / holding.totalCostBasis) * 10000) / 100 : 0;
    }
    totalVal += holding.currentValue;
    totalCost += holding.totalCostBasis;
  });

  market.totalPortfolioValue = Math.round(totalVal * 100) / 100;
  market.totalCostBasis = Math.round(totalCost * 100) / 100;
  market.totalUnrealizedPnl = Math.round((totalVal - totalCost) * 100) / 100;
}

export function simulateMonthlyInvestmentStep(state: GameState): void {
  const market = ensureInvestmentMarketState(state);
  const macroGdpGrowth = state.world?.[state.currentCountryIndex || 0]?.gdpGrowthRate || 2.2;
  let monthlyDividend = 0;

  market.marketAssets.forEach(asset => {
    // Public-company securities are priced by the Corporate Simulation Engine from
    // financial fundamentals, valuation, macro conditions and supply/demand. Do not
    // apply a second random drift here.
    if (asset.underlyingCompanyId) {
      const company = state.companies.find(c => c.id === asset.underlyingCompanyId);
      if (company && company.isPublic) {
        asset.currentPrice = company.sharePrice;
        asset.high52Week = Math.max(asset.high52Week || asset.currentPrice, asset.currentPrice);
        asset.low52Week = Math.min(asset.low52Week || asset.currentPrice, asset.currentPrice);
        asset.marketCapBillions = company.valuation / 1_000_000_000;
        asset.annualDividendYield = company.dividendYield || 0;
        asset.priceHistory.push(asset.currentPrice);
        if (asset.priceHistory.length > 36) asset.priceHistory.shift();
        return;
      }
    }

    // Determine monthly drift and volatility for legacy/non-corporate market assets.
    let vol = 0.03;
    if (asset.volatilityRating === 'Moderate') vol = 0.06;
    if (asset.volatilityRating === 'High') vol = 0.12;
    if (asset.volatilityRating === 'Speculative') vol = 0.22;

    const drift = (macroGdpGrowth / 100) / 12;
    const randomShock = (Math.random() - 0.48) * vol;
    const returnFactor = 1 + drift + randomShock;

    const newPrice = Math.max(1, Math.round(asset.currentPrice * returnFactor * 100) / 100);
    asset.currentPrice = newPrice;

    if (!Array.isArray(asset.priceHistory)) {
      asset.priceHistory = [newPrice];
    }
    asset.priceHistory.push(newPrice);
    if (asset.priceHistory.length > 36) {
      asset.priceHistory.shift();
    }

    asset.high52Week = Math.max(asset.high52Week || newPrice, newPrice);
    asset.low52Week = Math.min(asset.low52Week || newPrice, newPrice);
  });

  // Calculate portfolio dividends
  market.portfolioHoldings.forEach(holding => {
    const asset = market.marketAssets.find(a => a.id === holding.assetId);
    if (asset && asset.annualDividendYield > 0) {
      const monthlyDivYield = (asset.annualDividendYield / 100) / 12;
      const payout = Math.round(holding.currentValue * monthlyDivYield * 100) / 100;
      if (payout > 0) {
        state.finances.cash += payout;
        holding.dividendsEarnedLifetime += payout;
        monthlyDividend += payout;

        recordFinancialTransaction(state, {
          type: 'DIVIDEND',
          category: 'INCOME',
          amount: payout,
          description: `Dividend distribution from ${holding.symbol} (${asset.annualDividendYield}% yield)`,
          destinationAccount: 'Liquid Cash'
        });
      }
    }
  });

  market.monthlyDividendIncome = Math.round(monthlyDividend * 100) / 100;
  updatePortfolioSummary(state);
}

export function executeStockTrade(
  state: GameState,
  symbolOrId: string,
  orderType: 'BUY' | 'SELL',
  shares: number
): { success: boolean; message: string } {
  const market = ensureInvestmentMarketState(state);
  const asset = market.marketAssets.find(a => a.id === symbolOrId || a.symbol.toUpperCase() === symbolOrId.toUpperCase());
  if (!asset) return { success: false, message: `Market asset '${symbolOrId}' not found.` };
  
  if (orderType === 'BUY') {
    const res = buyMarketAsset(state, asset.id, shares);
    return { success: res.success, message: res.message };
  } else {
    const res = sellMarketAsset(state, asset.id, shares);
    return { success: res.success, message: res.message };
  }
}

