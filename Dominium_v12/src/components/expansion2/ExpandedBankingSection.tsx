import React, { useState } from 'react';
import { GameState, BankPartner, BankAccountTier, LoanType } from '../../types';
import { 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Lock, 
  Percent, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Clock,
  Coins
} from 'lucide-react';
import { 
  ensureBankingSystemProfile, 
  openBankAccount, 
  depositToBankAccount, 
  withdrawFromBankAccount, 
  liquidateMaturedCertificateOfDeposit 
} from '../../engine/bankingEngine';
import { 
  ensureCreditProfileState, 
  applyForExpandedLoan, 
  makeLoanRepayment, 
  updateCreditProfile 
} from '../../engine/creditEngine';
import { EXPANSION2_BANKS } from '../../data/expansion2Catalogs';

interface ExpandedBankingSectionProps {
  state: GameState;
  onStateChange?: () => void;
  onOpenLedger?: () => void;
}

export const ExpandedBankingSection: React.FC<ExpandedBankingSectionProps> = ({ 
  state, 
  onStateChange,
  onOpenLedger
}) => {
  const banking = ensureBankingSystemProfile(state);
  const credit = ensureCreditProfileState(state);

  const [activeTab, setActiveTab] = useState<'accounts' | 'banks' | 'credit' | 'loans'>('accounts');
  const [actionFeedback, setActionFeedback] = useState<{ msg: string; isError?: boolean } | null>(null);

  // Account creation state
  const [selectedBankId, setSelectedBankId] = useState<string>(EXPANSION2_BANKS[0].id);
  const [selectedAccountType, setSelectedAccountType] = useState<BankAccountTier>('High-Yield Savings');
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'CHF' | 'GBP' | 'JPY'>('USD');
  const [initialDeposit, setInitialDeposit] = useState<number>(5000);
  const [cdTermMonths, setCdTermMonths] = useState<number>(12);

  // Deposit/Withdraw modal/panel state
  const [transferAccountId, setTransferAccountId] = useState<string | null>(null);
  const [transferAmount, setTransferAmount] = useState<number>(1000);

  // Loan application state
  const [loanPrincipal, setLoanPrincipal] = useState<number>(50000);
  const [loanType, setLoanType] = useState<LoanType>('Personal Unsecured');
  const [loanTerm, setLoanTerm] = useState<number>(36);

  const showNotification = (msg: string, isError: boolean = false) => {
    setActionFeedback({ msg, isError });
    setTimeout(() => setActionFeedback(null), 5000);
    if (onStateChange) onStateChange();
  };

  const handleOpenAccount = () => {
    const res = openBankAccount(state, selectedBankId, selectedAccountType, initialDeposit, selectedCurrency, cdTermMonths);
    showNotification(res.message, !res.success);
  };

  const handleDeposit = (accId: string) => {
    const res = depositToBankAccount(state, accId, transferAmount);
    showNotification(res.message, !res.success);
    setTransferAccountId(null);
  };

  const handleWithdraw = (accId: string) => {
    const res = withdrawFromBankAccount(state, accId, transferAmount);
    showNotification(res.message, !res.success);
    setTransferAccountId(null);
  };

  const handleLiquidateCD = (accId: string) => {
    const res = liquidateMaturedCertificateOfDeposit(state, accId);
    showNotification(res.message, !res.success);
  };

  const handleApplyLoan = () => {
    const res = applyForExpandedLoan(state, loanPrincipal, loanType, loanTerm);
    showNotification(res.message, !res.success);
  };

  const handleRepay = (loanId: string, full: boolean = false) => {
    const res = makeLoanRepayment(state, loanId, full);
    showNotification(res.message, !res.success);
  };

  // Credit rating color
  const getScoreColor = (score: number) => {
    if (score >= 780) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 700) return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    if (score >= 640) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="space-y-4">
      {/* Toast Feedback */}
      {actionFeedback && (
        <div className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-2 ${
          actionFeedback.isError 
            ? 'bg-rose-950/80 border-rose-700/80 text-rose-200' 
            : 'bg-emerald-950/80 border-emerald-700/80 text-emerald-200'
        }`}>
          {actionFeedback.isError ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span>{actionFeedback.msg}</span>
        </div>
      )}

      {/* Top Banner Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 shadow-sm">
          <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Total Banking Deposits</div>
          <div className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">
            ${(banking.totalDepositsBalance || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Across {banking.accounts.length} institution accounts</div>
        </div>

        <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 shadow-sm">
          <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Monthly Interest Yield</div>
          <div className="text-base sm:text-lg font-black text-amber-400 mt-0.5">
            +${(banking.monthlyInterestYield || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Compound APY credited monthly</div>
        </div>

        <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 shadow-sm">
          <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Credit Bureau Score</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-base sm:text-lg font-black px-2 py-0.5 rounded-lg border ${getScoreColor(credit.creditScore)}`}>
              {credit.creditScore}
            </span>
            <span className="text-[11px] font-bold text-zinc-300">{credit.creditRating}</span>
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Underwriting Cap: ${credit.maxBorrowingCapacity.toLocaleString()}</div>
        </div>

        <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Total Debt Liabilities</div>
            <div className="text-base sm:text-lg font-black text-rose-400 mt-0.5">
              ${(credit.totalOutstandingDebt || 0).toLocaleString()}
            </div>
          </div>
          {onOpenLedger && (
            <button
              onClick={onOpenLedger}
              className="mt-1 flex items-center justify-center gap-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-[11px] font-bold rounded-lg border border-zinc-700 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" /> View Ledger
            </button>
          )}
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2 overflow-x-auto scrollbar-none">
        {[
          { key: 'accounts', label: `My Bank Accounts (${banking.accounts.length})`, icon: <Building2 className="w-3.5 h-3.5" /> },
          { key: 'banks', label: 'Partner Banks & Open Account', icon: <Plus className="w-3.5 h-3.5" /> },
          { key: 'credit', label: 'Credit Profile & Standing', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
          { key: 'loans', label: `Loans & Credit Lines (${credit.activeLoans.length})`, icon: <CreditCard className="w-3.5 h-3.5" /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: ACCOUNTS LIST */}
      {activeTab === 'accounts' && (
        <div className="space-y-3">
          {banking.accounts.length === 0 ? (
            <div className="bg-zinc-900/60 p-8 rounded-2xl border border-zinc-800 text-center space-y-3">
              <Building2 className="w-10 h-10 text-zinc-600 mx-auto" />
              <div className="text-sm font-bold text-zinc-300">No Active Banking Accounts</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Open a High-Yield Savings, Certificate of Deposit, or Offshore Secret account to protect capital and earn compound yields.
              </p>
              <button
                onClick={() => setActiveTab('banks')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black rounded-xl transition-colors shadow-md"
              >
                Explore Partner Banks
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {banking.accounts.map(acc => (
                <div key={acc.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-zinc-100">{acc.institutionName}</span>
                        {acc.isOffshore && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            OFFSHORE ({acc.secrecyLevel})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{acc.accountType} &bull; #{acc.accountNumber}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                      {acc.currency}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Balance</div>
                      <div className="text-base font-black text-zinc-100">
                        ${acc.balance.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Interest Rate</div>
                      <div className="text-xs font-black text-emerald-400">
                        {acc.interestRateAnnual}% APY
                      </div>
                    </div>
                  </div>

                  {acc.accountType === 'Certificate of Deposit' && (
                    <div className="text-[11px] text-zinc-400 flex items-center justify-between bg-zinc-950/40 p-2 rounded-lg border border-zinc-850">
                      <span>Term: {acc.monthsHeld ?? 0}/{acc.termMonths ?? acc.termMonthsRemaining ?? 12} Months</span>
                      <span className={(acc.monthsHeld ?? 0) >= (acc.termMonths ?? acc.termMonthsRemaining ?? 12) || !acc.isLockedForFixedTerm ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                        {(acc.monthsHeld ?? 0) >= (acc.termMonths ?? acc.termMonthsRemaining ?? 12) || !acc.isLockedForFixedTerm ? 'MATURED' : 'LOCKED'}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setTransferAccountId(transferAccountId === acc.id ? null : acc.id)}
                      className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-700 transition-colors"
                    >
                      Deposit / Withdraw
                    </button>
                    {acc.accountType === 'Certificate of Deposit' && ((acc.monthsHeld ?? 0) >= (acc.termMonths ?? acc.termMonthsRemaining ?? 12) || !acc.isLockedForFixedTerm) && (
                      <button
                        onClick={() => handleLiquidateCD(acc.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors"
                      >
                        Liquidate CD
                      </button>
                    )}
                  </div>

                  {/* Transfer input box if expanded */}
                  {transferAccountId === acc.id && (
                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-750 space-y-2 mt-2">
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span>Transfer Amount ($)</span>
                        <span>Liquid Cash: ${(state.finances?.cash || 0).toLocaleString()}</span>
                      </div>
                      <input
                        type="number"
                        min="1"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-zinc-900 border border-zinc-750 px-3 py-1.5 rounded-lg text-xs text-zinc-100 font-mono"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeposit(acc.id)}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <ArrowDownRight className="w-3.5 h-3.5" /> Deposit
                        </button>
                        <button
                          onClick={() => handleWithdraw(acc.id)}
                          className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" /> Withdraw
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PARTNER BANKS & OPEN ACCOUNT */}
      {activeTab === 'banks' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {EXPANSION2_BANKS.map(bank => {
              const isSelected = selectedBankId === bank.id;
              const hasMinCash = (state.finances?.cash || 0) >= bank.minimumDeposit;

              return (
                <div 
                  key={bank.id}
                  onClick={() => setSelectedBankId(bank.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-zinc-900 border-amber-500/80 shadow-md ring-1 ring-amber-500/50' 
                      : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-black text-zinc-100">{bank.name}</h4>
                      <div className="text-[11px] text-zinc-400">{bank.country} &bull; {bank.jurisdiction}</div>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                      {bank.tier}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-[11px] text-zinc-300">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Savings APY:</span>
                      <span className="font-bold text-emerald-400">{bank.savingsApy}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">12M CD Yield:</span>
                      <span className="font-bold text-amber-400">{bank.cdYield12Month}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Min Deposit:</span>
                      <span className={`font-bold ${hasMinCash ? 'text-zinc-200' : 'text-rose-400'}`}>
                        ${(bank.minimumDeposit ?? bank.minDepositRequired ?? 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-zinc-800 text-[10px] text-zinc-400">
                    Perks: {bank.perks.join(', ')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Account Configuration Form */}
          <div className="bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-4">
            <h4 className="text-xs sm:text-sm font-black text-zinc-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              Configure & Open New Account at Selected Bank
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Account Tier</label>
                <select
                  value={selectedAccountType}
                  onChange={(e) => setSelectedAccountType(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-200 font-bold"
                >
                  <option value="Checking">Checking Account (0.5% APY)</option>
                  <option value="High-Yield Savings">High-Yield Savings</option>
                  <option value="Certificate of Deposit">Certificate of Deposit</option>
                  <option value="Offshore Secret Account">Offshore Secret Account</option>
                  <option value="Multi-Currency Global Treasury">Multi-Currency Global Treasury</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Denomination Currency</label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-200 font-bold"
                >
                  <option value="USD">USD ($ - United States Dollar)</option>
                  <option value="EUR">EUR (€ - Eurozone)</option>
                  <option value="CHF">CHF (₣ - Swiss Franc)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="JPY">JPY (¥ - Japanese Yen)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Initial Deposit ($)</label>
                <input
                  type="number"
                  min="100"
                  value={initialDeposit}
                  onChange={(e) => setInitialDeposit(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-100 font-mono font-bold"
                />
              </div>
            </div>

            {selectedAccountType === 'Certificate of Deposit' && (
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">CD Lock-in Term Duration</label>
                <div className="flex gap-2">
                  {[6, 12, 24, 36].map(months => (
                    <button
                      key={months}
                      type="button"
                      onClick={() => setCdTermMonths(months)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        cdTermMonths === months 
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300' 
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {months} Months
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-zinc-400">
                Available Liquid Cash: <strong className="text-zinc-200">${(state.finances?.cash || 0).toLocaleString()}</strong>
              </div>
              <button
                onClick={handleOpenAccount}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs rounded-xl shadow-md transition-all"
              >
                Confirm Account Opening
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CREDIT PROFILE */}
      {activeTab === 'credit' && (
        <div className="space-y-4">
          <div className="bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-4">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-zinc-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Sovereign & Commercial Credit Standing
                </h3>
                <p className="text-xs text-zinc-400">Global Credit Bureau Underwriting Model</p>
              </div>
              <span className={`text-xs font-black px-2.5 py-1 rounded-xl border ${getScoreColor(credit.creditScore)}`}>
                {credit.creditRating} ({credit.creditScore} / 850)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
                <div className="text-[10px] text-zinc-500 font-bold uppercase">Debt-to-Income</div>
                <div className="text-sm font-black text-zinc-200 mt-0.5">{credit.debtToIncomeRatio}%</div>
                <div className="text-[10px] text-zinc-500">{credit.debtToIncomeRatio < 35 ? 'Healthy' : 'Elevated Risk'}</div>
              </div>

              <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
                <div className="text-[10px] text-zinc-500 font-bold uppercase">On-Time Payment History</div>
                <div className="text-sm font-black text-emerald-400 mt-0.5">{credit.paymentHistoryOnTimePercent ?? 98}%</div>
                <div className="text-[10px] text-zinc-500">{credit.missedPaymentsCount ?? 0} Delinquencies</div>
              </div>

              <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
                <div className="text-[10px] text-zinc-500 font-bold uppercase">Max Borrowing Cap</div>
                <div className="text-sm font-black text-amber-400 mt-0.5">${(credit.maxBorrowingCapacity ?? credit.borrowingCapacityMax ?? 500000).toLocaleString()}</div>
                <div className="text-[10px] text-zinc-500">Pre-approved capacity</div>
              </div>

              <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
                <div className="text-[10px] text-zinc-500 font-bold uppercase">Active Credit Lines</div>
                <div className="text-sm font-black text-zinc-200 mt-0.5">{credit.totalActiveCreditLines ?? credit.activeLoans?.length ?? 0} Accounts</div>
                <div className="text-[10px] text-zinc-500">Installment & revolving</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800 text-xs text-zinc-400 space-y-1">
              <div className="font-bold text-zinc-200">How to elevate your Credit Score:</div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li>Maintain low debt balances and keep Debt-to-Income below 30%.</li>
                <li>Make on-time loan repayments each month without defaulting.</li>
                <li>Accumulate larger liquid savings and diversified business enterprise equity.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LOANS & CREDIT LINES */}
      {activeTab === 'loans' && (
        <div className="space-y-4">
          {/* Active Loans */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-zinc-300 uppercase tracking-wider">Active Borrowing Lines & Debt</h4>
            {credit.activeLoans.length === 0 ? (
              <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 text-center text-xs text-zinc-500">
                No outstanding loan liabilities. Your balance sheet is completely debt-free.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {credit.activeLoans.map(loan => (
                  <div key={loan.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-black text-zinc-100">{loan.lenderName ?? loan.bankName ?? 'Creditor'}</span>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{loan.type ?? loan.productType ?? 'Credit Line'}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {loan.interestRateAnnual}% APR
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs">
                      <div>
                        <div className="text-[10px] text-zinc-500">Remaining Balance</div>
                        <div className="font-black text-rose-400">${loan.remainingBalance.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500">Monthly Payment</div>
                        <div className="font-black text-zinc-200">${loan.monthlyPayment.toLocaleString()}/mo</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500">Term Remaining</div>
                        <div className="text-zinc-300">{loan.termMonthsRemaining} / {loan.termMonthsTotal} Mos</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500">Status</div>
                        <div className="font-bold text-emerald-400">{loan.status}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleRepay(loan.id, false)}
                        className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-700 transition-colors"
                      >
                        Pay Monthly (${loan.monthlyPayment.toLocaleString()})
                      </button>
                      <button
                        onClick={() => handleRepay(loan.id, true)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-colors"
                      >
                        Pay Off Full
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Loan Application Form */}
          <div className="bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-4">
            <h4 className="text-xs sm:text-sm font-black text-zinc-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              Apply for Capital Facility or Structured Loan
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Loan Instrument Type</label>
                <select
                  value={loanType}
                  onChange={(e) => setLoanType(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-200 font-bold"
                >
                  <option value="Personal Unsecured">Personal Unsecured Loan</option>
                  <option value="Commercial Revolving Line">Commercial Revolving Credit Line</option>
                  <option value="Real Estate Mortgage">Real Estate Mortgage</option>
                  <option value="Sovereign Syndicate Facility">Sovereign Syndicate Facility</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Principal Requested ($)</label>
                <input
                  type="number"
                  min="5000"
                  step="5000"
                  value={loanPrincipal}
                  onChange={(e) => setLoanPrincipal(Math.max(1000, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Term Duration</label>
                <select
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-200 font-bold"
                >
                  <option value={12}>12 Months (1 Year)</option>
                  <option value={36}>36 Months (3 Years)</option>
                  <option value={60}>60 Months (5 Years)</option>
                  <option value={120}>120 Months (10 Years)</option>
                  <option value={360}>360 Months (30 Years Mortgage)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-zinc-400">
                Max Underwriting Cap: <strong className="text-amber-400">${(credit.maxBorrowingCapacity ?? credit.borrowingCapacityMax ?? 500000).toLocaleString()}</strong>
              </div>
              <button
                onClick={handleApplyLoan}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition-all"
              >
                Submit Loan Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
