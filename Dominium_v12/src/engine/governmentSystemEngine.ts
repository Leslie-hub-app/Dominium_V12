import { GameState } from '../types';
import { 
  ensureGovernmentOfficeState, 
  simulateMonthlyGovernmentOfficeStep, 
  enactPresidentialDecree 
} from './governmentEngine';

export function ensureGovernmentSystemState(state: GameState) {
  const gov = ensureGovernmentOfficeState(state);
  if (!gov.cabinetMinisters) {
    gov.cabinetMinisters = gov.cabinet || [];
  }
  if (!gov.strategicAssetInvestments) {
    gov.strategicAssetInvestments = gov.strategicAssets || [];
  }
  state.expansion2Government = gov;
  return {
    ...gov,
    cabinetMinisters: gov.cabinetMinisters,
    strategicAssets: gov.strategicAssetInvestments,
    sovereignTreasury: Math.round((gov.nationalTreasuryBillions || 50) * 1_000_000_000)
  };
}

export function simulateMonthlyGovernmentSystem(state: GameState): void {
  simulateMonthlyGovernmentOfficeStep(state);
  ensureGovernmentSystemState(state);
}

export function enactGovernmentPolicy(
  state: GameState, 
  policyId: string = 'SOVEREIGN_WEALTH_FUND', 
  status: string = 'ACTIVE'
) {
  const res = enactPresidentialDecree(state, 'TAXATION', 'Sovereign Wealth Modernization Act', 'Expanded sovereign fiscal reserves');
  ensureGovernmentSystemState(state);
  return res;
}

export function appointMinister(
  state: GameState, 
  portfolio: string = 'DEFENSE', 
  ministerName: string = 'Gen. Jonathan Vance'
) {
  const gov = ensureGovernmentOfficeState(state);
  if (!gov.cabinetMinisters) {
    gov.cabinetMinisters = gov.cabinet || [];
  }
  const existing = gov.cabinetMinisters.find((m: any) => m.portfolio && m.portfolio.toUpperCase() === portfolio.toUpperCase());
  if (existing) {
    existing.name = ministerName;
  } else {
    gov.cabinetMinisters.push({
      id: `min_${portfolio.toLowerCase()}`,
      name: ministerName,
      portfolio: portfolio as any,
      competenceScore: 88,
      loyaltyScore: 92,
      politicalAlignment: 'Technocrat',
      monthlySalary: 35000,
      appointedTick: (state.currentYear || 2026) * 12 + (state.currentMonth || 1)
    });
  }
  ensureGovernmentSystemState(state);
  return true;
}

export function acquireStrategicAsset(
  state: GameState, 
  assetName: string = 'North Sea Deepwater Energy Terminal'
) {
  const gov = ensureGovernmentOfficeState(state);
  if (!gov.strategicAssetInvestments) {
    gov.strategicAssetInvestments = gov.strategicAssets || [];
  }
  gov.strategicAssetInvestments.push({
    id: `asset_${Date.now()}`,
    name: assetName,
    sector: 'ENERGY_GRID',
    equityOwnershipPercent: 65,
    monthlyStrategicYield: 4500000,
    geopoliticalLeverageScore: 85,
    acquisitionCost: 150000000,
    annualMaintenanceCost: 12000000
  });
  ensureGovernmentSystemState(state);
  return true;
}
