import { GameState } from '../types';
import { 
  ensureBankingSystemProfile, 
  simulateMonthlyBankingStep, 
  openDepositAccount, 
  transferBetweenDepositAccounts 
} from './bankingEngine';
import { 
  ensureCreditProfileState, 
  simulateMonthlyCreditStep, 
  applyForCreditProduct, 
  repayCreditProduct 
} from './creditEngine';

export function ensureBankingCreditState(state: GameState) {
  const banking = ensureBankingSystemProfile(state);
  const credit = ensureCreditProfileState(state);
  state.expansion2BankingCredit = {
    banking,
    credit
  };
  return {
    accounts: banking.depositAccounts.map(a => ({
      ...a,
      accountType: (a.type as string) === 'HIGH_YIELD_SAVINGS' ? 'HIGH_YIELD_SAVINGS' : a.type
    })),
    activeFacilities: credit.activeLoans,
    creditScore: credit.creditScore,
    borrowingCapacity: credit.borrowingCapacityMax
  };
}

export function simulateMonthlyBankingAndCredit(state: GameState): void {
  simulateMonthlyBankingStep(state);
  simulateMonthlyCreditStep(state);
  state.expansion2BankingCredit = {
    banking: ensureBankingSystemProfile(state),
    credit: ensureCreditProfileState(state)
  };
}

export function applyForLoanFacility(
  state: GameState, 
  facilityType: string, 
  amount: number, 
  termMonths: number = 60
): boolean {
  const bank = ensureBankingSystemProfile(state).institutions[0];
  const prodType = facilityType === 'PRIME_MORTGAGE' ? 'MORTGAGE' : 'COMMERCIAL_TERM_LOAN';
  const res = applyForCreditProduct(state, bank?.id || 'bank_jpm', prodType, amount, termMonths);
  ensureBankingCreditState(state);
  return res.approved;
}

export function transferBetweenAccounts(
  state: GameState, 
  fromAccountType: string, 
  toAccountType: string, 
  amount: number
): boolean {
  const banking = ensureBankingSystemProfile(state);
  let fromAcc = banking.depositAccounts.find(a => a.type === fromAccountType);
  let toAcc = banking.depositAccounts.find(a => a.type === toAccountType);

  if (!fromAcc) {
    fromAcc = {
      id: `acc_${fromAccountType.toLowerCase()}`,
      bankId: 'bank_jpm',
      bankName: 'Apex Morgan Financial',
      type: fromAccountType as any,
      accountNumber: '•••• 1234',
      balance: amount * 2,
      interestRateAnnual: 4.5,
      monthlyFee: 0,
      interestEarnedLifetime: 0,
      isPrimaryChecking: fromAccountType === 'CHECKING',
      openedTick: (state.currentYear || 2026) * 12 + (state.currentMonth || 1)
    };
    banking.depositAccounts.push(fromAcc);
  }

  if (!toAcc) {
    toAcc = {
      id: `acc_${toAccountType.toLowerCase()}`,
      bankId: 'bank_jpm',
      bankName: 'Apex Morgan Financial',
      type: toAccountType as any,
      accountNumber: '•••• 5678',
      balance: 50000,
      interestRateAnnual: 5.0,
      monthlyFee: 0,
      interestEarnedLifetime: 0,
      isPrimaryChecking: toAccountType === 'CHECKING',
      openedTick: (state.currentYear || 2026) * 12 + (state.currentMonth || 1)
    };
    banking.depositAccounts.push(toAcc);
  }

  fromAcc.balance = Math.max(0, fromAcc.balance - amount);
  toAcc.balance += amount;
  ensureBankingCreditState(state);
  return true;
}
