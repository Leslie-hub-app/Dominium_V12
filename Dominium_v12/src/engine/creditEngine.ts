import { 
  GameState, 
  PlayerCreditProfileState, 
  LoanAgreement, 
  CreditProductType, 
  DebtCollectionNotice 
} from '../types';
import { EXPANSION2_BANKS } from '../data/expansion2Catalogs';
import { recordFinancialTransaction } from './financialLedgerEngine';

export function initializeCreditProfileState(): PlayerCreditProfileState {
  return {
    creditScore: 720,
    creditRating: 'GOOD',
    debtToIncomeRatio: 15,
    debtServiceRatio: 10,
    borrowingCapacityMax: 500000,
    activeLoans: [],
    collectionNotices: [],
    creditHistoryEvents: []
  };
}

export function ensureCreditProfileState(state: GameState): PlayerCreditProfileState {
  if (!state.creditProfileState) {
    state.creditProfileState = initializeCreditProfileState();
  }
  if (!Array.isArray(state.creditProfileState.activeLoans)) {
    state.creditProfileState.activeLoans = [];
  }
  if (!Array.isArray(state.creditProfileState.collectionNotices)) {
    state.creditProfileState.collectionNotices = [];
  }
  if (!Array.isArray(state.creditProfileState.creditHistoryEvents)) {
    state.creditProfileState.creditHistoryEvents = [];
  }

  const activeLoans = state.creditProfileState.activeLoans.filter(l => l.status === 'ACTIVE' || l.status === 'RESTRUCTURED');
  state.creditProfileState.totalOutstandingDebt = activeLoans.reduce((acc, l) => acc + (l.remainingBalance || 0), 0);
  state.creditProfileState.maxBorrowingCapacity = state.creditProfileState.borrowingCapacityMax;
  state.creditProfileState.totalActiveCreditLines = activeLoans.length;
  state.creditProfileState.paymentHistoryOnTimePercent = state.creditProfileState.paymentHistoryOnTimePercent ?? 98;
  state.creditProfileState.missedPaymentsCount = activeLoans.reduce((acc, l) => acc + (l.missedPaymentsCount || 0), 0);

  return state.creditProfileState;
}

export function updateCreditAssessment(state: GameState): PlayerCreditProfileState {
  const profile = ensureCreditProfileState(state);
  const monthlyIncome = (state.currentJob?.monthlySalary || state.currentJob?.salary || 0) + ((state.finances as any)?.monthlyIncome || 0);
  const monthlyDebtService = profile.activeLoans
    .filter(l => l.status === 'ACTIVE' || l.status === 'RESTRUCTURED')
    .reduce((acc, l) => acc + l.monthlyPayment, 0);

  const totalOutstandingDebt = profile.activeLoans
    .filter(l => l.status === 'ACTIVE' || l.status === 'RESTRUCTURED')
    .reduce((acc, l) => acc + l.remainingBalance, 0);

  // Calculate DTI & DSR
  profile.debtServiceRatio = monthlyIncome > 0 ? Math.round((monthlyDebtService / monthlyIncome) * 100) : 100;
  profile.debtToIncomeRatio = monthlyIncome > 0 ? Math.round((totalOutstandingDebt / (monthlyIncome * 12)) * 100) : 100;

  // Derive score rating
  if (profile.creditScore >= 800) profile.creditRating = 'PRIME';
  else if (profile.creditScore >= 740) profile.creditRating = 'EXCELLENT';
  else if (profile.creditScore >= 670) profile.creditRating = 'GOOD';
  else if (profile.creditScore >= 580) profile.creditRating = 'FAIR';
  else profile.creditRating = 'POOR';

  // Calculate Borrowing Capacity based on income, score, and net worth
  const incomeMultiplier = profile.creditScore > 750 ? 60 : (profile.creditScore > 650 ? 40 : 20);
  const netWorthBonus = Math.max(0, (state.finances?.cash || 0) * 0.5);
  profile.borrowingCapacityMax = Math.max(10000, Math.round((monthlyIncome * incomeMultiplier) + netWorthBonus - totalOutstandingDebt));

  return profile;
}

export function applyForLoan(
  state: GameState,
  bankId: string,
  productType: CreditProductType,
  principal: number,
  termMonths: number,
  collateralAssetId?: string
): { success: boolean; message: string; loan?: LoanAgreement } {
  const profile = updateCreditAssessment(state);
  const bank = EXPANSION2_BANKS.find(b => b.id === bankId) || EXPANSION2_BANKS[0];

  if (principal > profile.borrowingCapacityMax && !collateralAssetId) {
    return { 
      success: false, 
      message: `Requested loan ($${principal.toLocaleString()}) exceeds maximum uncollateralized credit capacity ($${profile.borrowingCapacityMax.toLocaleString()}).` 
    };
  }

  if (profile.creditScore < 550 && productType !== 'SECURED_LOAN') {
    return {
      success: false,
      message: 'Loan application declined due to adverse credit score (< 550).'
    };
  }

  // Calculate interest rate based on credit rating and bank margins
  const baseRate = state.livingWorld?.economy?.benchmarkInterestRate ?? (state.livingWorld?.economy as any)?.centralBankRate ?? 4.5;
  const scoreDiscount = profile.creditScore >= 800 ? -1.0 : (profile.creditScore >= 720 ? 0 : 2.5);
  const annualRate = Math.max(2.5, baseRate + bank.lendingRateMargin + scoreDiscount);

  // Amortization formula
  const monthlyRate = (annualRate / 100) / 12;
  const monthlyPayment = Math.round(
    principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1)
  );

  const newLoan: LoanAgreement = {
    id: `loan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    bankId: bank.id,
    bankName: bank.name,
    productType,
    title: `${bank.name} ${productType.replace(/_/g, ' ')}`,
    principal,
    remainingBalance: principal,
    monthlyPayment,
    interestRateAnnual: Math.round(annualRate * 10) / 10,
    termMonthsTotal: termMonths,
    termMonthsRemaining: termMonths,
    collateralAssetId,
    missedPaymentsCount: 0,
    inArrears: false,
    arrearsAmount: 0,
    status: 'ACTIVE'
  };

  profile.activeLoans.push(newLoan);
  state.finances.cash += principal;

  recordFinancialTransaction(state, {
    type: 'MISCELLANEOUS',
    category: 'INCOME',
    amount: principal,
    description: `Loan disbursement: ${newLoan.title}`,
    destinationAccount: 'Liquid Cash'
  });

  return {
    success: true,
    message: `Loan approved! $${principal.toLocaleString()} disbursed at ${newLoan.interestRateAnnual}% APR ($${monthlyPayment.toLocaleString()}/month).`,
    loan: newLoan
  };
}

export function repayLoanPrincipal(
  state: GameState,
  loanId: string,
  amount: number
): { success: boolean; message: string } {
  if (amount <= 0) return { success: false, message: 'Repayment amount must be positive.' };
  if ((state.finances?.cash || 0) < amount) return { success: false, message: 'Insufficient cash for principal repayment.' };

  const profile = ensureCreditProfileState(state);
  const loan = profile.activeLoans.find(l => l.id === loanId);
  if (!loan || loan.status === 'PAID_OFF') return { success: false, message: 'Active loan not found.' };

  const payAmount = Math.min(amount, loan.remainingBalance + loan.arrearsAmount);
  state.finances.cash -= payAmount;

  if (loan.arrearsAmount > 0) {
    const arrearsPaid = Math.min(payAmount, loan.arrearsAmount);
    loan.arrearsAmount -= arrearsPaid;
    if (loan.arrearsAmount === 0) loan.inArrears = false;
  }

  loan.remainingBalance -= (payAmount - (loan.arrearsAmount || 0));
  if (loan.remainingBalance <= 0) {
    loan.remainingBalance = 0;
    loan.status = 'PAID_OFF';
    profile.creditScore = Math.min(850, profile.creditScore + 15);
  }

  recordFinancialTransaction(state, {
    type: 'LOAN_PRINCIPAL',
    category: 'EXPENSE',
    amount: payAmount,
    description: `Early principal paydown on ${loan.title}`,
    sourceAccount: 'Liquid Cash'
  });

  updateCreditAssessment(state);

  return {
    success: true,
    message: `Paid $${payAmount.toLocaleString()} towards ${loan.title}. Remaining balance: $${loan.remainingBalance.toLocaleString()}.`
  };
}

export function simulateMonthlyCreditStep(state: GameState): void {
  const profile = ensureCreditProfileState(state);

  profile.activeLoans.forEach(loan => {
    if (loan.status !== 'ACTIVE' && loan.status !== 'RESTRUCTURED') return;

    const monthlyInterest = Math.round(loan.remainingBalance * ((loan.interestRateAnnual / 100) / 12));
    const monthlyPrincipal = Math.max(0, loan.monthlyPayment - monthlyInterest);

    if ((state.finances?.cash || 0) >= loan.monthlyPayment) {
      // Successful automatic debt service
      state.finances.cash -= loan.monthlyPayment;
      loan.remainingBalance = Math.max(0, loan.remainingBalance - monthlyPrincipal);
      loan.termMonthsRemaining = Math.max(0, loan.termMonthsRemaining - 1);

      recordFinancialTransaction(state, {
        type: 'DEBT_INTEREST',
        category: 'EXPENSE',
        amount: monthlyInterest,
        description: `Monthly interest on ${loan.title}`,
        sourceAccount: 'Liquid Cash'
      });

      recordFinancialTransaction(state, {
        type: 'LOAN_PRINCIPAL',
        category: 'EXPENSE',
        amount: monthlyPrincipal,
        description: `Monthly principal on ${loan.title}`,
        sourceAccount: 'Liquid Cash'
      });

      if (loan.remainingBalance === 0 || loan.termMonthsRemaining === 0) {
        loan.status = 'PAID_OFF';
        profile.creditScore = Math.min(850, profile.creditScore + 10);
      }
    } else {
      // Missed payment
      loan.missedPaymentsCount += 1;
      loan.inArrears = true;
      loan.arrearsAmount += loan.monthlyPayment;
      profile.creditScore = Math.max(300, profile.creditScore - 25);

      // Issue escalation notices
      if (loan.missedPaymentsCount === 1) {
        profile.collectionNotices.push({
          id: `notice_${Date.now()}`,
          loanId: loan.id,
          bankName: loan.bankName,
          stage: 'NOTICE_1',
          issuedTick: (state.time?.year || 2026) * 12 + (state.time?.month || 1),
          demandedAmount: loan.arrearsAmount,
          deadlineTick: (state.time?.year || 2026) * 12 + (state.time?.month || 1) + 1,
          resolved: false
        });
      } else if (loan.missedPaymentsCount >= 3) {
        loan.status = 'DEFAULTED';
        profile.creditScore = Math.max(300, profile.creditScore - 60);
      }
    }
  });

  updateCreditAssessment(state);
}

export function applyForCreditProduct(
  state: GameState,
  bankId: string,
  productType: string,
  amount: number,
  termMonths: number = 60,
  collateralAssetId?: string
): { approved: boolean; success: boolean; message: string; loan?: LoanAgreement } {
  const normType = (productType === 'MORTGAGE' ? 'MORTGAGE' : (productType === 'PRIME_MORTGAGE' ? 'MORTGAGE' : (productType === 'LINE_OF_CREDIT' ? 'LINE_OF_CREDIT' : 'BUSINESS_LOAN'))) as CreditProductType;
  const res = applyForLoan(state, bankId, normType, amount, termMonths, collateralAssetId);
  return {
    approved: res.success,
    ...res
  };
}

export function repayCreditProduct(
  state: GameState,
  loanId: string,
  amount: number
): { success: boolean; message: string } {
  return repayLoanPrincipal(state, loanId, amount);
}

export function applyForExpandedLoan(
  state: GameState,
  principal: number,
  loanTypeStr: string,
  termMonths: number = 36
): { success: boolean; message: string; loan?: LoanAgreement } {
  let mappedType: CreditProductType = 'PERSONAL_LOAN';
  if (loanTypeStr.includes('Mortgage')) mappedType = 'MORTGAGE';
  else if (loanTypeStr.includes('Auto') || loanTypeStr.includes('Vehicle')) mappedType = 'VEHICLE_FINANCE';
  else if (loanTypeStr.includes('Business')) mappedType = 'BUSINESS_LOAN';
  else if (loanTypeStr.includes('Line')) mappedType = 'LINE_OF_CREDIT';
  else if (loanTypeStr.includes('Secured')) mappedType = 'SECURED_LOAN';

  const bank = EXPANSION2_BANKS[0];
  const res = applyForLoan(state, bank.id, mappedType, principal, termMonths);
  if (res.success && res.loan) {
    res.loan.lenderName = bank.name;
    res.loan.type = loanTypeStr;
  }
  return res;
}

export function makeLoanRepayment(
  state: GameState,
  loanId: string,
  payInFull: boolean = false
): { success: boolean; message: string } {
  const profile = ensureCreditProfileState(state);
  const loan = profile.activeLoans.find(l => l.id === loanId);
  if (!loan) return { success: false, message: 'Loan not found.' };

  const amountToPay = payInFull ? loan.remainingBalance : loan.monthlyPayment;
  return repayLoanPrincipal(state, loanId, amountToPay);
}

export const updateCreditProfile = updateCreditAssessment;
