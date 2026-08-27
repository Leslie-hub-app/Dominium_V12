import { GameState } from '../types';
import { 
  ensureInvestmentMarketState as ensureMarketState, 
  simulateMonthlyInvestmentStep, 
  executeStockTrade 
} from './investmentEngine';

export function ensureInvestmentMarketState(state: GameState) {
  const market = ensureMarketState(state);
  state.expansion2Investment = market;
  return {
    ...market,
    availableAssets: market.marketAssets,
    holdings: market.portfolioHoldings
  };
}

export function simulateMonthlyInvestments(state: GameState): void {
  simulateMonthlyInvestmentStep(state);
  ensureInvestmentMarketState(state);
}

export function executeMarketOrder(
  state: GameState, 
  symbol: string, 
  orderType: 'BUY' | 'SELL', 
  shares: number
): { success: boolean; message: string } {
  const result = executeStockTrade(state, symbol, orderType, shares);
  ensureInvestmentMarketState(state);
  return result;
}
