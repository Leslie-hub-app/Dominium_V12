import { 
  GameState, 
  GovernmentOfficeState, 
  GovernmentCabinetMinister, 
  NationalStrategicAsset, 
  InternationalCrisis 
} from '../types';
import { EXPANSION2_NATIONAL_STRATEGIC_ASSETS } from '../data/expansion2Catalogs';
import { recordFinancialTransaction } from './financialLedgerEngine';

export function initializeGovernmentOfficeState(): GovernmentOfficeState {
  return {
    unlocked: false,
    headOfStateTitle: 'President of the Republic',
    nationalTreasuryBillions: 125.5,
    monthlyTaxRevenueBillions: 34.2,
    monthlyExpenditureBillions: 32.8,
    sovereignDebtBillions: 480.0,
    sovereignCreditRating: 'AAA',
    cabinet: [
      { id: 'min_fin', name: 'Alasdair Sterling', ministry: 'Finance', competence: 88, loyalty: 90, approvalRating: 72, corruptionRisk: 5, recentPolicies: ['Targeted corporate tax deductions', 'Fiscal discipline rule'] },
      { id: 'min_fa', name: 'Dr. Elena Rostova', ministry: 'Foreign Affairs', competence: 92, loyalty: 85, approvalRating: 78, corruptionRisk: 8, recentPolicies: ['Bilateral tariff reduction treaty', 'Multilateral security pact'] },
      { id: 'min_def', name: 'General Victor Mercer', ministry: 'Defence', competence: 85, loyalty: 92, approvalRating: 80, corruptionRisk: 10, recentPolicies: ['Next-gen aerospace procurement', 'Cyber defense shielding'] },
      { id: 'min_energy', name: 'Ingrid Vane', ministry: 'Energy', competence: 82, loyalty: 78, approvalRating: 68, corruptionRisk: 12, recentPolicies: ['Modular nuclear commissioning', 'Critical grid resilience'] }
    ],
    strategicAssets: EXPANSION2_NATIONAL_STRATEGIC_ASSETS,
    defenseProfile: {
      defenseBudgetMonthly: 4500000000,
      militaryReadinessScore: 88,
      securityPosture: 'Forward Deterrence',
      alliedTreaties: ['Trans-Continental Defense Pact', 'Global Maritime Freedom Accord'],
      strategicDeterrenceRating: 90
    },
    activeCrises: [
      {
        id: 'crisis_trade_strait',
        title: 'Maritime Trade Strait Blockade Threat',
        opposingNation: 'Federation of Koryo',
        tensionLevel: 'TRADE_SANCTIONS',
        monthsActive: 2,
        diplomaticResolutionProgress: 45,
        consequencesSummary: ['12% increase in shipping insurance tariffs', 'Strategic oil reserve buffer activated']
      }
    ],
    policyDecreeHistory: []
  };
}

export function ensureGovernmentOfficeState(state: GameState): GovernmentOfficeState {
  if (!state.governmentOffice) {
    state.governmentOffice = initializeGovernmentOfficeState();
  }
  if (!Array.isArray(state.governmentOffice.cabinet)) {
    state.governmentOffice.cabinet = [];
  }
  if (!Array.isArray(state.governmentOffice.strategicAssets) || state.governmentOffice.strategicAssets.length === 0) {
    state.governmentOffice.strategicAssets = EXPANSION2_NATIONAL_STRATEGIC_ASSETS;
  }
  if (!Array.isArray(state.governmentOffice.activeCrises)) {
    state.governmentOffice.activeCrises = [];
  }
  if (!Array.isArray(state.governmentOffice.policyDecreeHistory)) {
    state.governmentOffice.policyDecreeHistory = [];
  }

  // Check if player holds top office (President / Prime Minister)
  const polOffice = state.politics?.currentOffice;
  const officeTitle = typeof polOffice === 'string' ? polOffice : (polOffice as any)?.title;
  if (officeTitle === 'President / Prime Minister' || officeTitle === 'President' || officeTitle === 'Prime Minister') {
    state.governmentOffice.unlocked = true;
  }

  return state.governmentOffice;
}

export function enactPresidentialDecree(
  state: GameState,
  category: 'TAXATION' | 'INFRASTRUCTURE' | 'DEFENSE' | 'HEALTHCARE' | 'EDUCATION' | 'DEREGULATION',
  decreeTitle: string,
  impactDescription: string
): { success: boolean; message: string } {
  const gov = ensureGovernmentOfficeState(state);
  const tick = (state.currentYear || 2026) * 12 + (state.currentMonth || 1);

  gov.policyDecreeHistory.unshift({
    tick,
    decree: decreeTitle,
    impact: impactDescription
  });

  if (category === 'TAXATION') {
    gov.monthlyTaxRevenueBillions += 1.5;
    if (state.character?.attributes) {
      state.character.attributes.reputation = Math.min(100, (state.character.attributes.reputation || 50) + 2);
    }
  } else if (category === 'INFRASTRUCTURE') {
    gov.monthlyExpenditureBillions += 1.2;
    gov.nationalTreasuryBillions = Math.max(0, gov.nationalTreasuryBillions - 5.0);
    if (state.character?.attributes) {
      state.character.attributes.reputation = Math.min(100, (state.character.attributes.reputation || 50) + 4);
    }
  } else if (category === 'DEFENSE') {
    gov.defenseProfile.militaryReadinessScore = Math.min(100, gov.defenseProfile.militaryReadinessScore + 5);
    gov.defenseProfile.strategicDeterrenceRating = Math.min(100, gov.defenseProfile.strategicDeterrenceRating + 4);
  }

  return {
    success: true,
    message: `Presidential Decree enacted: "${decreeTitle}". Strategic effect: ${impactDescription}`
  };
}

export function manageStrategicAsset(
  state: GameState,
  assetId: string,
  action: 'EXPAND_CAPEX' | 'PRIVATIZE' | 'MODERNIZE'
): { success: boolean; message: string; proceedsBillions?: number } {
  const gov = ensureGovernmentOfficeState(state);
  const asset = gov.strategicAssets.find(a => a.id === assetId);
  if (!asset) return { success: false, message: 'Strategic asset not found.' };

  if (action === 'PRIVATIZE') {
    const saleProceeds = Math.round((asset.monthlyRevenueGross * 12 * 8) / 1_000_000_000 * 10) / 10; // 8x annual revenue in billions
    asset.ownership = 'PRIVATIZED';
    gov.nationalTreasuryBillions += saleProceeds;

    return {
      success: true,
      message: `Privatized ${asset.name} for $${saleProceeds} Billion sovereign treasury injection.`,
      proceedsBillions: saleProceeds
    };
  } else if (action === 'MODERNIZE') {
    const cost = 2.5; // $2.5B
    if (gov.nationalTreasuryBillions < cost) {
      return { success: false, message: `Insufficient sovereign treasury funds ($${cost}B required).` };
    }
    gov.nationalTreasuryBillions -= cost;
    asset.modernizationLevel = Math.min(100, asset.modernizationLevel + 15);
    asset.monthlyRevenueGross = Math.round(asset.monthlyRevenueGross * 1.2);

    return {
      success: true,
      message: `Modernized ${asset.name}! Efficiency +15%, Monthly Gross Revenue increased to $${(asset.monthlyRevenueGross / 1_000_000).toFixed(1)}M.`
    };
  }

  return { success: true, message: `Completed action on ${asset.name}.` };
}

export function resolveDiplomaticCrisis(
  state: GameState,
  crisisId: string,
  diplomaticMove: 'SANCTION' | 'SUMMIT' | 'MILITARY_PATROL' | 'ACCORD'
): { success: boolean; message: string; resolved?: boolean } {
  const gov = ensureGovernmentOfficeState(state);
  const crisis = gov.activeCrises.find(c => c.id === crisisId);
  if (!crisis) return { success: false, message: 'Crisis not found.' };

  let progressBoost = 20;
  if (diplomaticMove === 'SUMMIT') progressBoost = 35;
  if (diplomaticMove === 'ACCORD') progressBoost = 50;

  crisis.diplomaticResolutionProgress = Math.min(100, crisis.diplomaticResolutionProgress + progressBoost);

  if (crisis.diplomaticResolutionProgress >= 100) {
    gov.activeCrises = gov.activeCrises.filter(c => c.id !== crisisId);
    if (state.character?.attributes) {
      state.character.attributes.reputation = Math.min(100, (state.character.attributes.reputation || 50) + 6);
    }
    return {
      success: true,
      message: `CRISIS RESOLVED: ${crisis.title} peacefully settled through sovereign diplomacy and bilateral accords!`,
      resolved: true
    };
  }

  return {
    success: true,
    message: `Diplomatic initiative executed. Resolution progress: ${crisis.diplomaticResolutionProgress}%.`,
    resolved: false
  };
}

export function simulateMonthlyGovernmentOfficeStep(state: GameState): void {
  const gov = ensureGovernmentOfficeState(state);
  if (!gov.unlocked) return;

  // Monthly net treasury surplus / deficit
  const netMonthlySurplusBillions = gov.monthlyTaxRevenueBillions - gov.monthlyExpenditureBillions;
  gov.nationalTreasuryBillions = Math.round((gov.nationalTreasuryBillions + netMonthlySurplusBillions) * 100) / 100;

  // Sovereign debt service
  const monthlyDebtInterestBillions = Math.round((gov.sovereignDebtBillions * 0.035 / 12) * 100) / 100;
  gov.nationalTreasuryBillions = Math.max(0, Math.round((gov.nationalTreasuryBillions - monthlyDebtInterestBillions) * 100) / 100);

  // Strategic state assets revenue
  let stateAssetsNetMonthly = 0;
  gov.strategicAssets.forEach(asset => {
    if (asset.ownership === 'STATE_OWNED' || asset.ownership === 'PUBLIC_PRIVATE_PARTNERSHIP') {
      const share = asset.ownership === 'STATE_OWNED' ? 1.0 : 0.5;
      const net = (asset.monthlyRevenueGross - asset.monthlyOperatingCost) * share;
      stateAssetsNetMonthly += net;
    }
  });

  const stateAssetsNetBillions = stateAssetsNetMonthly / 1_000_000_000;
  gov.nationalTreasuryBillions = Math.round((gov.nationalTreasuryBillions + stateAssetsNetBillions) * 100) / 100;

  // Sovereign credit rating
  const debtToRevenueRatio = gov.sovereignDebtBillions / (gov.monthlyTaxRevenueBillions * 12);
  if (debtToRevenueRatio < 1.2) gov.sovereignCreditRating = 'AAA';
  else if (debtToRevenueRatio < 1.8) gov.sovereignCreditRating = 'AA+';
  else if (debtToRevenueRatio < 2.5) gov.sovereignCreditRating = 'A';
  else if (debtToRevenueRatio < 3.5) gov.sovereignCreditRating = 'BBB';
  else gov.sovereignCreditRating = 'BB';
}
