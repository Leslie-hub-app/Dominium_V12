import { GameState, FinancialLedgerRecord, FinancialTransaction, FinancialTransactionType } from '../types';

export function initializeFinancialLedger(): FinancialLedgerRecord {
  return {
    transactions: [],
    entries: [],
    totalLifetimeEarned: 0,
    totalLifetimeSpent: 0,
    totalLifetimeTaxes: 0,
    totalLifetimeDividends: 0,
    totalLifetimeDebtService: 0,
    rollingMonthlyNetCashFlow: [],
    monthlyGrossIncome: 0,
    monthlyTotalExpenses: 0,
    monthlyNetCashflow: 0,
    cumulativeEarnedLifetime: 0
  };
}

export function ensureFinancialLedger(state: GameState): FinancialLedgerRecord {
  if (!state.financialLedger) {
    state.financialLedger = initializeFinancialLedger();
  }
  if (!Array.isArray(state.financialLedger.transactions)) {
    state.financialLedger.transactions = [];
  }
  if (!Array.isArray(state.financialLedger.rollingMonthlyNetCashFlow)) {
    state.financialLedger.rollingMonthlyNetCashFlow = [];
  }
  // Sync entries alias for backward and forward compatibility
  state.financialLedger.entries = state.financialLedger.transactions;
  
  if (state.financialLedger.cumulativeEarnedLifetime === undefined) {
    state.financialLedger.cumulativeEarnedLifetime = state.financialLedger.totalLifetimeEarned || 0;
  }
  
  state.expansion2FinancialLedger = state.financialLedger;
  return state.financialLedger;
}

export function recordFinancialTransaction(
  state: GameState,
  params: {
    type: FinancialTransactionType;
    category: 'INCOME' | 'EXPENSE' | 'ASSET' | 'LIABILITY' | 'TRANSFER' | 'EQUITY';
    amount: number;
    description: string;
    sourceAccount?: string;
    destinationAccount?: string;
    entityId?: string;
  }
): FinancialTransaction {
  const ledger = ensureFinancialLedger(state);
  const currentCash = state.finances?.cash || 0;
  const balanceAfter = Math.round((currentCash + (params.category === 'INCOME' ? params.amount : (params.category === 'EXPENSE' ? -params.amount : 0))) * 100) / 100;

  const tx: FinancialTransaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    tick: (state.currentYear || 2026) * 12 + (state.currentMonth || 1),
    month: state.currentMonth || 1,
    year: state.currentYear || 2026,
    type: params.type,
    category: params.category,
    amount: Math.round(params.amount * 100) / 100,
    description: params.description,
    sourceAccount: params.sourceAccount,
    destinationAccount: params.destinationAccount,
    entityId: params.entityId,
    balanceAfter
  };

  // Prepend to transaction list (capped at 500 records for performance)
  ledger.transactions.unshift(tx);
  if (ledger.transactions.length > 500) {
    ledger.transactions.length = 500;
  }

  // Update lifetime totals
  if (params.category === 'INCOME') {
    ledger.totalLifetimeEarned += params.amount;
    if (params.type === 'DIVIDEND') {
      ledger.totalLifetimeDividends += params.amount;
    }
  } else if (params.category === 'EXPENSE') {
    ledger.totalLifetimeSpent += params.amount;
    if (params.type === 'TAX_PAYMENT') {
      ledger.totalLifetimeTaxes += params.amount;
    }
    if (params.type === 'DEBT_INTEREST' || params.type === 'LOAN_PRINCIPAL') {
      ledger.totalLifetimeDebtService += params.amount;
    }
  }

  return tx;
}

export function getRecentTransactions(state: GameState, limit: number = 20): FinancialTransaction[] {
  const ledger = ensureFinancialLedger(state);
  return ledger.transactions.slice(0, limit);
}

export function calculateAuthoritativeNetWorth(state: GameState): {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  breakdown: {
    liquidCash: number;
    bankDeposits: number;
    stocksAndInvestments: number;
    realEstateValue: number;
    businessEquity: number;
    vehiclesAndItems: number;
    outstandingLoans: number;
    creditCardDebt: number;
    legalLiabilities: number;
  };
} {
  const liquidCash = state.finances?.cash || 0;
  
  // Bank deposits from banking profile
  const bankDeposits = (state.bankingProfile?.depositAccounts || []).reduce((acc, a) => acc + (a.balance || 0), 0);

  // Investment market portfolio
  const stocksAndInvestments = (state.investmentMarket?.portfolioHoldings || []).reduce((acc, h) => acc + (h.currentValue || 0), 0)
    + (state.finances?.stocks || []).reduce((acc, s) => acc + ((s.sharesOwned || 0) * (s.currentPrice || 0)), 0);

  // Real estate
  const realEstateValue = (state.finances?.properties || []).reduce((acc, p) => acc + (p.currentValue || 0), 0)
    + (state.propertyPortfolio?.rentalProperties || []).reduce((acc, p) => acc + (p.currentValue || 0), 0);

  // Business equity
  const businessEquity = (state.companies || []).reduce((acc, c) => acc + ((c.valuation * c.playerOwnershipPercentage) / 100), 0);

  // Vehicles & items
  const vehiclesAndItems = (state.character?.possessions?.vehicles || []).length * 45000
    + (state.character?.possessions?.luxuries || []).length * 25000;

  // Outstanding loans
  const outstandingLoans = (state.finances?.loans || []).reduce((acc, l) => acc + (l.remainingBalance || 0), 0)
    + (state.creditProfileState?.activeLoans || []).reduce((acc, l) => acc + (l.remainingBalance || 0), 0);

  const creditCardDebt = (state.creditProfileState?.activeLoans || [])
    .filter(l => l.productType === 'CREDIT_CARD' || l.productType === 'OVERDRAFT')
    .reduce((acc, l) => acc + (l.remainingBalance || 0), 0);

  // Legal dispute contingent liabilities
  const legalLiabilities = (state.legalProfile?.activeCases || [])
    .filter(c => !c.isPlayerPlaintiff && (c.stage === 'HEARING' || c.stage === 'SETTLEMENT_OFFER'))
    .reduce((acc, c) => acc + (c.claimAmount * 0.5), 0);

  const totalAssets = liquidCash + bankDeposits + stocksAndInvestments + realEstateValue + businessEquity + vehiclesAndItems;
  const totalLiabilities = outstandingLoans + legalLiabilities;
  const netWorth = totalAssets - totalLiabilities;

  return {
    totalAssets: Math.round(totalAssets),
    totalLiabilities: Math.round(totalLiabilities),
    netWorth: Math.round(netWorth),
    breakdown: {
      liquidCash: Math.round(liquidCash),
      bankDeposits: Math.round(bankDeposits),
      stocksAndInvestments: Math.round(stocksAndInvestments),
      realEstateValue: Math.round(realEstateValue),
      businessEquity: Math.round(businessEquity),
      vehiclesAndItems: Math.round(vehiclesAndItems),
      outstandingLoans: Math.round(outstandingLoans),
      creditCardDebt: Math.round(creditCardDebt),
      legalLiabilities: Math.round(legalLiabilities)
    }
  };
}

export function calculateLedgerSummary(state: GameState): {
  totalInflows: number;
  totalOutflows: number;
  netFlow: number;
} {
  const ledger = ensureFinancialLedger(state);
  let totalInflows = 0;
  let totalOutflows = 0;

  for (const tx of ledger.transactions) {
    if (tx.category === 'INCOME' || (tx.type as any) === 'INCOME' || (tx.amount > 0 && tx.category !== 'EXPENSE')) {
      totalInflows += Math.abs(tx.amount);
    } else if (tx.category === 'EXPENSE' || (tx.type as any) === 'EXPENSE' || tx.amount < 0) {
      totalOutflows += Math.abs(tx.amount);
    }
  }

  return {
    totalInflows,
    totalOutflows,
    netFlow: totalInflows - totalOutflows
  };
}

export const recordLedgerTransaction = (state: GameState, params: any) => {
  const type = params.type || (params.amount >= 0 ? 'INCOME' : 'EXPENSE');
  const category = params.category === 'INCOME' || params.category === 'BUSINESS_INCOME' ? 'INCOME' : 'EXPENSE';
  return recordFinancialTransaction(state, {
    type: (params.category || type) as FinancialTransactionType,
    category,
    amount: Math.abs(params.amount),
    description: params.title || params.description || 'Transaction',
    sourceAccount: params.source,
    destinationAccount: params.destination
  });
};
