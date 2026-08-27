import { 
  GameState, 
  BankingSystemProfile, 
  BankDepositAccount, 
  BankAccountType, 
  BankInstitution 
} from '../types';
import { EXPANSION2_BANKS } from '../data/expansion2Catalogs';
import { recordFinancialTransaction } from './financialLedgerEngine';

export function initializeBankingSystemProfile(): BankingSystemProfile {
  return {
    institutions: EXPANSION2_BANKS,
    depositAccounts: [],
    accounts: [],
    totalDepositedCash: 0,
    totalDepositsBalance: 0,
    weightedAverageDepositYield: 3.5,
    monthlyInterestEarned: 0,
    monthlyInterestYield: 0
  };
}

export function ensureBankingSystemProfile(state: GameState): BankingSystemProfile {
  if (!state.bankingProfile) {
    state.bankingProfile = initializeBankingSystemProfile();
  }
  if (!Array.isArray(state.bankingProfile.institutions) || state.bankingProfile.institutions.length === 0) {
    state.bankingProfile.institutions = EXPANSION2_BANKS;
  }
  if (!Array.isArray(state.bankingProfile.depositAccounts)) {
    state.bankingProfile.depositAccounts = [];
  }
  state.bankingProfile.accounts = state.bankingProfile.depositAccounts;
  state.bankingProfile.totalDepositsBalance = state.bankingProfile.depositAccounts.reduce((acc, a) => acc + (a.balance || 0), 0);
  state.bankingProfile.totalDepositedCash = state.bankingProfile.totalDepositsBalance;
  state.bankingProfile.monthlyInterestYield = Math.round(state.bankingProfile.depositAccounts.reduce((acc, a) => acc + (a.balance * ((a.interestRateAnnual || 3) / 100) / 12), 0));
  state.bankingProfile.monthlyInterestEarned = state.bankingProfile.monthlyInterestYield;

  return state.bankingProfile;
}

export function openDepositAccount(
  state: GameState,
  bankId: string,
  accountType: BankAccountType,
  initialDeposit: number
): { success: boolean; message: string; account?: BankDepositAccount } {
  const profile = ensureBankingSystemProfile(state);
  const bank = profile.institutions.find(b => b.id === bankId) || EXPANSION2_BANKS.find(b => b.id === bankId);
  if (!bank) {
    return { success: false, message: 'Invalid banking institution selected.' };
  }

  if (initialDeposit < bank.minDepositRequired) {
    return { success: false, message: `Minimum initial deposit required for ${bank.name} is $${bank.minDepositRequired.toLocaleString()}.` };
  }

  if ((state.finances?.cash || 0) < initialDeposit) {
    return { success: false, message: `Insufficient liquid cash for opening deposit ($${initialDeposit.toLocaleString()}).` };
  }

  // Deduct initial deposit from cash
  state.finances.cash -= initialDeposit;

  const baseRate = state.livingWorld?.economy?.benchmarkInterestRate ?? (state.livingWorld?.economy as any)?.centralBankRate ?? 4.5;
  let interestRate = baseRate + bank.depositRateBonus;
  if (accountType === 'HIGH_INTEREST_SAVINGS') interestRate += 1.0;
  if (accountType === 'FIXED_DEPOSIT') interestRate += 1.8;
  if (accountType === 'TRANSACTION_ACCOUNT') interestRate = 0.5;

  const tick = (state.time?.year || 2026) * 12 + (state.time?.month || 1);
  const newAccount: BankDepositAccount = {
    id: `acct_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    bankId: bank.id,
    bankName: bank.name,
    type: accountType,
    balance: initialDeposit,
    interestRateAnnual: Math.round(interestRate * 10) / 10,
    monthlyFee: bank.monthlyMaintenanceFee,
    openedTick: tick,
    isLockedForFixedTerm: accountType === 'FIXED_DEPOSIT',
    termMonthsRemaining: accountType === 'FIXED_DEPOSIT' ? 12 : undefined,
    interestEarnedLifetime: 0
  };

  profile.depositAccounts.push(newAccount);

  recordFinancialTransaction(state, {
    type: 'MISCELLANEOUS',
    category: 'TRANSFER',
    amount: initialDeposit,
    description: `Opened ${accountType.replace(/_/g, ' ')} at ${bank.name}`,
    sourceAccount: 'Liquid Cash',
    destinationAccount: `${bank.name} (${newAccount.id})`
  });

  return {
    success: true,
    message: `Successfully opened ${accountType.replace(/_/g, ' ')} with ${bank.name} at ${newAccount.interestRateAnnual}% APY.`,
    account: newAccount
  };
}

export function depositToAccount(
  state: GameState,
  accountId: string,
  amount: number
): { success: boolean; message: string } {
  if (amount <= 0) return { success: false, message: 'Deposit amount must be positive.' };
  if ((state.finances?.cash || 0) < amount) return { success: false, message: 'Insufficient liquid cash.' };

  const profile = ensureBankingSystemProfile(state);
  const account = profile.depositAccounts.find(a => a.id === accountId);
  if (!account) return { success: false, message: 'Account not found.' };

  state.finances.cash -= amount;
  account.balance += amount;

  recordFinancialTransaction(state, {
    type: 'MISCELLANEOUS',
    category: 'TRANSFER',
    amount,
    description: `Deposit to ${account.bankName} (${account.type})`,
    sourceAccount: 'Liquid Cash',
    destinationAccount: account.id
  });

  return {
    success: true,
    message: `Deposited $${amount.toLocaleString()} into ${account.bankName} ${account.type.replace(/_/g, ' ')}.`
  };
}

export function withdrawFromAccount(
  state: GameState,
  accountId: string,
  amount: number
): { success: boolean; message: string } {
  if (amount <= 0) return { success: false, message: 'Withdrawal amount must be positive.' };

  const profile = ensureBankingSystemProfile(state);
  const account = profile.depositAccounts.find(a => a.id === accountId);
  if (!account) return { success: false, message: 'Account not found.' };

  if (account.isLockedForFixedTerm && (account.termMonthsRemaining || 0) > 0) {
    return { success: false, message: `Account is locked in a fixed deposit term with ${account.termMonthsRemaining} months remaining.` };
  }

  if (account.balance < amount) {
    return { success: false, message: `Insufficient balance in account ($${account.balance.toLocaleString()} available).` };
  }

  account.balance -= amount;
  state.finances.cash += amount;

  recordFinancialTransaction(state, {
    type: 'MISCELLANEOUS',
    category: 'TRANSFER',
    amount,
    description: `Withdrawal from ${account.bankName} (${account.type})`,
    sourceAccount: account.id,
    destinationAccount: 'Liquid Cash'
  });

  return {
    success: true,
    message: `Withdrew $${amount.toLocaleString()} from ${account.bankName} to liquid cash.`
  };
}

export function simulateMonthlyBankingStep(state: GameState): void {
  const profile = ensureBankingSystemProfile(state);
  let totalInterest = 0;
  let totalDeposits = 0;

  const baseRate = state.livingWorld?.economy?.benchmarkInterestRate ?? (state.livingWorld?.economy as any)?.centralBankRate ?? 4.5;

  profile.depositAccounts.forEach(account => {
    // Dynamic rate adjustment based on central bank benchmark
    const bank = profile.institutions.find(b => b.id === account.bankId);
    if (bank && !account.isLockedForFixedTerm) {
      account.interestRateAnnual = Math.max(0.25, baseRate + bank.depositRateBonus);
    }

    // Monthly interest accrual
    const monthlyRate = (account.interestRateAnnual / 100) / 12;
    const interest = Math.round(account.balance * monthlyRate * 100) / 100;
    if (interest > 0) {
      account.balance += interest;
      account.interestEarnedLifetime += interest;
      totalInterest += interest;

      recordFinancialTransaction(state, {
        type: 'BANK_INTEREST',
        category: 'INCOME',
        amount: interest,
        description: `Interest paid on ${account.bankName} ${account.type.replace(/_/g, ' ')}`,
        destinationAccount: account.id
      });
    }

    // Deduct maintenance fee
    if (account.monthlyFee > 0 && account.balance >= account.monthlyFee) {
      account.balance -= account.monthlyFee;
      recordFinancialTransaction(state, {
        type: 'BANK_FEE',
        category: 'EXPENSE',
        amount: account.monthlyFee,
        description: `Account maintenance fee for ${account.bankName}`,
        sourceAccount: account.id
      });
    }

    // Decrement fixed term
    if (account.isLockedForFixedTerm && account.termMonthsRemaining && account.termMonthsRemaining > 0) {
      account.termMonthsRemaining -= 1;
      if (account.termMonthsRemaining === 0) {
        account.isLockedForFixedTerm = false;
      }
    }

    totalDeposits += account.balance;
  });

  profile.totalDepositedCash = Math.round(totalDeposits);
  profile.monthlyInterestEarned = Math.round(totalInterest * 100) / 100;
}

export function openBankAccount(
  state: GameState,
  bankId: string,
  accountTypeStr: string,
  initialDeposit: number,
  currency: string = 'USD',
  cdTermMonths: number = 12
): { success: boolean; message: string; account?: BankDepositAccount } {
  let mappedType: BankAccountType = 'SAVINGS_ACCOUNT';
  if (accountTypeStr.includes('High-Yield') || accountTypeStr.includes('HIGH_INTEREST')) mappedType = 'HIGH_INTEREST_SAVINGS';
  else if (accountTypeStr.includes('Deposit') || accountTypeStr.includes('FIXED') || accountTypeStr.includes('Certificate')) mappedType = 'FIXED_DEPOSIT';
  else if (accountTypeStr.includes('Checking') || accountTypeStr.includes('TRANSACTION')) mappedType = 'TRANSACTION_ACCOUNT';
  else if (accountTypeStr.includes('Money Market')) mappedType = 'MONEY_MARKET_ACCOUNT';

  const res = openDepositAccount(state, bankId, mappedType, initialDeposit);
  if (res.success && res.account) {
    res.account.currency = currency;
    res.account.institutionName = res.account.bankName;
    res.account.accountType = accountTypeStr;
    res.account.accountNumber = `ACCT-${Math.floor(100000 + Math.random() * 900000)}`;
    if (mappedType === 'FIXED_DEPOSIT') {
      res.account.termMonthsRemaining = cdTermMonths;
    }
  }
  return res;
}

export const depositToBankAccount = depositToAccount;
export const withdrawFromBankAccount = withdrawFromAccount;

export function transferBetweenDepositAccounts(
  state: GameState,
  fromAccountId: string,
  toAccountId: string,
  amount: number
): { success: boolean; message: string } {
  if (amount <= 0) return { success: false, message: 'Transfer amount must be positive.' };
  const profile = ensureBankingSystemProfile(state);
  const fromAcc = profile.depositAccounts.find(a => a.id === fromAccountId || a.type === fromAccountId);
  const toAcc = profile.depositAccounts.find(a => a.id === toAccountId || a.type === toAccountId);
  if (!fromAcc || !toAcc) return { success: false, message: 'Source or destination account not found.' };
  if (fromAcc.balance < amount) return { success: false, message: 'Insufficient funds in source account.' };
  fromAcc.balance -= amount;
  toAcc.balance += amount;
  return { success: true, message: `Transferred $${amount.toLocaleString()} from ${fromAcc.bankName} to ${toAcc.bankName}.` };
}

export function liquidateMaturedCertificateOfDeposit(
  state: GameState,
  accountId: string
): { success: boolean; message: string } {
  const profile = ensureBankingSystemProfile(state);
  const account = profile.depositAccounts.find(a => a.id === accountId);
  if (!account) return { success: false, message: 'Account not found.' };

  const balance = account.balance;
  state.finances.cash += balance;
  profile.depositAccounts = profile.depositAccounts.filter(a => a.id !== accountId);
  ensureBankingSystemProfile(state);

  recordFinancialTransaction(state, {
    type: 'MISCELLANEOUS',
    category: 'TRANSFER',
    amount: balance,
    description: `Liquidated Certificate of Deposit at ${account.bankName}`,
    sourceAccount: account.id,
    destinationAccount: 'Liquid Cash'
  });

  return {
    success: true,
    message: `Certificate of deposit liquidated! $${balance.toLocaleString()} returned to liquid cash balance.`
  };
}

