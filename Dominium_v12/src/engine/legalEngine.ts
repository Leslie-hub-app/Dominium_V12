import { 
  GameState, 
  LegalSystemProfile, 
  LegalCase, 
  LegalRepresentationTier, 
  LegalClaimType, 
  CourtJurisdiction 
} from '../types';
import { recordFinancialTransaction } from './financialLedgerEngine';

export function initializeLegalSystemProfile(): LegalSystemProfile {
  return {
    activeCases: [],
    caseHistory: [],
    totalLegalFeesSpentLifetime: 0,
    insolvencyStatus: 'SOLVENT'
  };
}

export function ensureLegalSystemProfile(state: GameState): LegalSystemProfile {
  if (!state.legalProfile) {
    state.legalProfile = initializeLegalSystemProfile();
  }
  if (!Array.isArray(state.legalProfile.activeCases)) {
    state.legalProfile.activeCases = [];
  }
  if (!Array.isArray(state.legalProfile.caseHistory)) {
    state.legalProfile.caseHistory = [];
  }
  return state.legalProfile;
}

export function initiatePlayerLawsuit(
  state: GameState,
  defendantName: string,
  claimType: LegalClaimType,
  claimAmount: number,
  jurisdiction: CourtJurisdiction = 'COMMERCIAL'
): { success: boolean; message: string; legalCase?: LegalCase } {
  if (claimAmount <= 0) {
    return { success: false, message: 'Claim amount must be greater than zero.' };
  }

  const filingFee = Math.max(1500, Math.round(claimAmount * 0.02));
  if ((state.finances?.cash || 0) < filingFee) {
    return { success: false, message: `Insufficient cash for statutory court filing fee ($${filingFee.toLocaleString()}).` };
  }

  state.finances.cash -= filingFee;
  recordFinancialTransaction(state, {
    type: 'LEGAL_FEE',
    category: 'EXPENSE',
    amount: filingFee,
    description: `Court filing & docket registration fee vs ${defendantName}`
  });

  const profile = ensureLegalSystemProfile(state);
  const tick = (state.currentYear || 2026) * 12 + (state.currentMonth || 1);
  const caseNumber = `CV-${state.currentYear || 2026}-${Math.floor(Math.random() * 89999 + 10000)}`;
  const playerName = `${state.character?.firstName || 'Player'} ${state.character?.lastName || ''}`.trim();

  const newCase: LegalCase = {
    id: `case_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: `${playerName} v. ${defendantName}`,
    caseNumber,
    jurisdiction,
    claimType,
    stage: 'FILED',
    plaintiffName: playerName,
    defendantName,
    isPlayerPlaintiff: true,
    claimAmount,
    evidenceStrengthPlayer: Math.floor(Math.random() * 35) + 55, // 55-90%
    evidenceStrengthOpponent: Math.floor(Math.random() * 40) + 30, // 30-70%
    playerRepresentation: 'STANDARD_COUNSEL',
    monthlyLegalFees: 3500,
    caseSummaryHistory: [`Case formally docketed under jurisdiction: ${jurisdiction}.`],
    filedTick: tick
  };

  profile.activeCases.push(newCase);

  return {
    success: true,
    message: `Lawsuit filed against ${defendantName} for $${claimAmount.toLocaleString()} in ${jurisdiction} Court (Filing Fee: $${filingFee.toLocaleString()}).`,
    legalCase: newCase
  };
}

export function retainLegalCounsel(
  state: GameState,
  caseIdOrTier: string,
  tier?: LegalRepresentationTier
): { success: boolean; message: string } {
  const profile = ensureLegalSystemProfile(state);
  if (!tier) {
    // General retained counsel tier
    const counselTier = caseIdOrTier;
    profile.retainedCounselTier = counselTier;
    profile.retainedCounselMonthlyRetainer = counselTier === 'ELITE_WHITE_COLLAR' || counselTier === 'ELITE_DEFENSE_FIRM' ? 25000 : 5000;
    if (profile.activeCases.length > 0) {
      profile.activeCases.forEach(c => {
        c.playerRepresentation = (counselTier === 'ELITE_WHITE_COLLAR' ? 'ELITE_DEFENSE_FIRM' : counselTier) as any;
        c.evidenceStrengthPlayer = Math.min(99, c.evidenceStrengthPlayer + 20);
      });
    }
    return {
      success: true,
      message: `Retained ${counselTier.replace(/_/g, ' ')} as standing legal counsel.`
    };
  }

  const legalCase = profile.activeCases.find(c => c.id === caseIdOrTier);
  if (!legalCase) return { success: false, message: 'Legal case not found.' };

  const feeMap: Record<LegalRepresentationTier, { monthlyFee: number; evidenceBoost: number }> = {
    'SELF_REPRESENTED': { monthlyFee: 0, evidenceBoost: -20 },
    'PUBLIC_DEFENDER': { monthlyFee: 500, evidenceBoost: -5 },
    'STANDARD_COUNSEL': { monthlyFee: 3500, evidenceBoost: 10 },
    'SENIOR_LITIGATOR': { monthlyFee: 9500, evidenceBoost: 25 },
    'ELITE_DEFENSE_FIRM': { monthlyFee: 25000, evidenceBoost: 40 },
    'ELITE_WHITE_COLLAR': { monthlyFee: 30000, evidenceBoost: 45 }
  };

  const selectedTier = ((tier as string) === 'ELITE_WHITE_COLLAR' ? 'ELITE_DEFENSE_FIRM' : tier) as LegalRepresentationTier;
  legalCase.playerRepresentation = selectedTier;
  legalCase.monthlyLegalFees = feeMap[selectedTier]?.monthlyFee ?? 3500;
  legalCase.evidenceStrengthPlayer = Math.min(99, Math.max(10, legalCase.evidenceStrengthPlayer + (feeMap[selectedTier]?.evidenceBoost ?? 10)));
  legalCase.caseSummaryHistory.push(`Retained ${selectedTier.replace(/_/g, ' ')} with monthly retainer of $${legalCase.monthlyLegalFees.toLocaleString()}.`);

  return {
    success: true,
    message: `Counsel upgraded to ${selectedTier.replace(/_/g, ' ')}. Evidence strength adjusted to ${legalCase.evidenceStrengthPlayer}%.`
  };
}

export function fileNewLawsuit(
  state: GameState,
  defendantName: string = 'Corporate Counterparty',
  claimType: any = 'CONTRACT_BREACH',
  jurisdiction: any = 'COMMERCIAL',
  claimAmount: number = 250000
) {
  const normClaimType = claimType === 'CORPORATE_BREACH' || claimType === 'PATENT_INFRINGEMENT' ? 'CONTRACT_BREACH' : (claimType || 'CONTRACT_BREACH');
  const normJurisdiction = jurisdiction === 'FEDERAL_CIRCUIT' ? 'COMMERCIAL' : (jurisdiction || 'COMMERCIAL');
  return initiatePlayerLawsuit(state, defendantName, normClaimType as any, claimAmount, normJurisdiction as any);
}

export function respondToSettlementOffer(
  state: GameState,
  caseId: string,
  accept: boolean
): { success: boolean; message: string } {
  const profile = ensureLegalSystemProfile(state);
  const legalCase = profile.activeCases.find(c => c.id === caseId);
  if (!legalCase || !legalCase.settlementOffer || legalCase.settlementOffer.status !== 'PENDING') {
    return { success: false, message: 'No pending settlement offer found for this case.' };
  }

  const offer = legalCase.settlementOffer;

  if (accept) {
    offer.status = 'ACCEPTED';
    legalCase.stage = 'CLOSED';
    legalCase.judgmentVerdict = 'SETTLED';

    if (legalCase.isPlayerPlaintiff) {
      // Player receives settlement payment
      state.finances.cash += offer.amount;
      recordFinancialTransaction(state, {
        type: 'LEGAL_JUDGMENT',
        category: 'INCOME',
        amount: offer.amount,
        description: `Settlement payout in ${legalCase.title}`
      });
    } else {
      // Player pays settlement
      state.finances.cash = Math.max(0, state.finances.cash - offer.amount);
      recordFinancialTransaction(state, {
        type: 'LEGAL_JUDGMENT',
        category: 'EXPENSE',
        amount: offer.amount,
        description: `Settlement payment in ${legalCase.title}`
      });
    }

    // Move to history
    profile.activeCases = profile.activeCases.filter(c => c.id !== caseId);
    profile.caseHistory.unshift(legalCase);

    return {
      success: true,
      message: `Settlement accepted for $${offer.amount.toLocaleString()}. Case successfully resolved out of court.`
    };
  } else {
    offer.status = 'REJECTED';
    legalCase.stage = 'HEARING';
    legalCase.caseSummaryHistory.push('Settlement offer rejected. Case scheduled for formal trial hearing.');
    return {
      success: true,
      message: 'Settlement offer rejected. Proceedings advancing to judicial trial.'
    };
  }
}

export function simulateMonthlyLegalStep(state: GameState): void {
  const profile = ensureLegalSystemProfile(state);
  const tick = (state.currentYear || 2026) * 12 + (state.currentMonth || 1);

  profile.activeCases.forEach(legalCase => {
    // Deduct legal counsel fees
    if (legalCase.monthlyLegalFees > 0) {
      const fee = legalCase.monthlyLegalFees;
      state.finances.cash = Math.max(0, state.finances.cash - fee);
      profile.totalLegalFeesSpentLifetime += fee;

      recordFinancialTransaction(state, {
        type: 'LEGAL_FEE',
        category: 'EXPENSE',
        amount: fee,
        description: `Legal counsel retainer for ${legalCase.title}`
      });
    }

    // Step progression
    if (legalCase.stage === 'FILED') {
      legalCase.stage = 'DISCOVERY';
      legalCase.caseSummaryHistory.push('Discovery phase initiated. Depositions and document subpoenas exchanged.');
    } else if (legalCase.stage === 'DISCOVERY') {
      if (Math.random() > 0.4) {
        legalCase.stage = 'SETTLEMENT_OFFER';
        const settlementVal = Math.round(legalCase.claimAmount * (legalCase.evidenceStrengthPlayer / 100) * 0.7);
        legalCase.settlementOffer = {
          id: `offer_${Date.now()}`,
          offeredBy: legalCase.isPlayerPlaintiff ? 'DEFENDANT' : 'PLAINTIFF',
          amount: settlementVal,
          terms: 'Full and final discharge of all claims without admission of liability.',
          expiresTick: tick + 2,
          status: 'PENDING'
        };
        legalCase.caseSummaryHistory.push(`Formal settlement proposal tendered: $${settlementVal.toLocaleString()}.`);
      } else {
        legalCase.stage = 'HEARING';
        legalCase.caseSummaryHistory.push('No settlement reached. Trial hearing opened before presiding judge.');
      }
    } else if (legalCase.stage === 'HEARING') {
      legalCase.stage = 'JUDGMENT_RENDERED';
      const playerWinChance = legalCase.evidenceStrengthPlayer / (legalCase.evidenceStrengthPlayer + legalCase.evidenceStrengthOpponent);
      const playerWon = Math.random() < playerWinChance;

      if (playerWon) {
        legalCase.judgmentVerdict = 'WON';
        legalCase.awardedDamages = legalCase.claimAmount;

        if (legalCase.isPlayerPlaintiff) {
          state.finances.cash += legalCase.claimAmount;
          recordFinancialTransaction(state, {
            type: 'LEGAL_JUDGMENT',
            category: 'INCOME',
            amount: legalCase.claimAmount,
            description: `Trial judgment verdict won in ${legalCase.title}`
          });
        }
        legalCase.caseSummaryHistory.push(`JUDGMENT: Verdict in favor of ${legalCase.plaintiffName}. Awarded $${legalCase.claimAmount.toLocaleString()}.`);
      } else {
        legalCase.judgmentVerdict = 'LOST';
        legalCase.awardedDamages = 0;

        if (!legalCase.isPlayerPlaintiff) {
          state.finances.cash = Math.max(0, state.finances.cash - legalCase.claimAmount);
          recordFinancialTransaction(state, {
            type: 'LEGAL_JUDGMENT',
            category: 'EXPENSE',
            amount: legalCase.claimAmount,
            description: `Trial judgment damages assessed in ${legalCase.title}`
          });
        }
        legalCase.caseSummaryHistory.push(`JUDGMENT: Verdict against ${legalCase.plaintiffName}. Claims dismissed.`);
      }
    }
  });

  // Archive closed cases
  const resolved = profile.activeCases.filter(c => c.stage === 'JUDGMENT_RENDERED' || c.stage === 'CLOSED');
  resolved.forEach(c => {
    profile.caseHistory.unshift(c);
  });
  profile.activeCases = profile.activeCases.filter(c => c.stage !== 'JUDGMENT_RENDERED' && c.stage !== 'CLOSED');

  if (profile.caseHistory.length > 50) {
    profile.caseHistory.length = 50;
  }
}
