import { 
  GameState, 
  PropertySystemState, 
  RealEstateProperty, 
  RenovationProject, 
  RenovationType, 
  LandDevelopmentProject, 
  LandDevelopmentType, 
  DevelopmentStage 
} from '../types';
import { recordFinancialTransaction } from './financialLedgerEngine';

export function initializePropertySystemState(): PropertySystemState {
  return {
    rentalProperties: [],
    activeRenovations: [],
    activeDevelopments: [],
    totalRealEstateValue: 0,
    totalMonthlyGrossRent: 0,
    totalMonthlyMaintenance: 0,
    averageOccupancyRate: 100
  };
}

export function ensurePropertySystemState(state: GameState): PropertySystemState {
  if (!state.propertyPortfolio) {
    state.propertyPortfolio = initializePropertySystemState();
  }
  if (!Array.isArray(state.propertyPortfolio.rentalProperties)) {
    state.propertyPortfolio.rentalProperties = [];
  }
  if (!Array.isArray(state.propertyPortfolio.activeRenovations)) {
    state.propertyPortfolio.activeRenovations = [];
  }
  if (!Array.isArray(state.propertyPortfolio.activeDevelopments)) {
    state.propertyPortfolio.activeDevelopments = [];
  }
  return state.propertyPortfolio;
}

export function buyRentalProperty(
  state: GameState,
  prop: {
    name: string;
    type: any;
    marketValue: number;
    monthlyRent: number;
    monthlyExpenses: number;
    location: string;
  }
): { success: boolean; message: string; property?: RealEstateProperty } {
  if ((state.finances?.cash || 0) < prop.marketValue) {
    return { success: false, message: `Insufficient cash to purchase ${prop.name} for $${prop.marketValue.toLocaleString()}.` };
  }

  state.finances.cash -= prop.marketValue;

  const locParts = prop.location.split(',');
  const city = locParts[0]?.trim() || 'Capital City';
  const country = locParts[1]?.trim() || state.character?.residenceCountry || 'United States';

  const property: RealEstateProperty = {
    id: `prop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: prop.name,
    type: prop.type,
    purchasePrice: prop.marketValue,
    currentValue: prop.marketValue,
    monthlyRent: prop.monthlyRent,
    monthlyMaintenance: prop.monthlyExpenses,
    isRented: true,
    condition: 100,
    tenantQuality: 85,
    city,
    country
  };

  const portfolio = ensurePropertySystemState(state);
  portfolio.rentalProperties.push(property);

  recordFinancialTransaction(state, {
    type: 'PROPERTY_PURCHASE',
    category: 'ASSET',
    amount: prop.marketValue,
    description: `Acquired real estate property: ${prop.name} (${prop.location})`,
    sourceAccount: 'Liquid Cash',
    destinationAccount: `Real Estate Portfolio (${prop.name})`
  });

  updatePropertyPortfolioTotals(state);

  return {
    success: true,
    message: `Purchased ${prop.name} for $${prop.marketValue.toLocaleString()}. Generating $${prop.monthlyRent.toLocaleString()}/month in rental revenue.`,
    property
  };
}

export function startPropertyRenovation(
  state: GameState,
  propertyId: string,
  type: RenovationType,
  contractorQuality: 'Economy' | 'Standard' | 'Premium Master Builders'
): { success: boolean; message: string; project?: RenovationProject } {
  const portfolio = ensurePropertySystemState(state);
  const property = portfolio.rentalProperties.find(p => p.id === propertyId) 
    || (state.finances?.properties || []).find(p => p.id === propertyId);

  if (!property) return { success: false, message: 'Property not found.' };

  const existingRenovation = portfolio.activeRenovations.find(r => r.propertyId === propertyId && r.status === 'IN_PROGRESS');
  if (existingRenovation) {
    return { success: false, message: 'This property is already undergoing an active renovation.' };
  }

  const baseCost = Math.round((property.currentValue || 500000) * 0.08);
  const qualityMultiplier = contractorQuality === 'Economy' ? 0.7 : (contractorQuality === 'Premium Master Builders' ? 1.5 : 1.0);
  const totalCost = Math.round(baseCost * qualityMultiplier);

  if ((state.finances?.cash || 0) < totalCost) {
    return { success: false, message: `Insufficient cash for renovation project ($${totalCost.toLocaleString()}).` };
  }

  state.finances.cash -= totalCost;

  const durationMonths = contractorQuality === 'Economy' ? 4 : (contractorQuality === 'Premium Master Builders' ? 2 : 3);
  const valueIncrease = Math.round(totalCost * (contractorQuality === 'Premium Master Builders' ? 1.6 : 1.25));
  const rentIncrease = Math.round(valueIncrease * 0.007);

  const project: RenovationProject = {
    id: `reno_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    propertyId: property.id,
    type,
    title: `${contractorQuality} ${type.replace(/_/g, ' ')} on ${property.name}`,
    totalCost,
    costPaid: totalCost,
    durationMonths,
    monthsCompleted: 0,
    contractorQuality,
    riskOfDelayOrOverrun: contractorQuality === 'Economy' ? 35 : 10,
    projectedValueIncrease: valueIncrease,
    projectedRentIncreaseMonthly: rentIncrease,
    status: 'IN_PROGRESS'
  };

  portfolio.activeRenovations.push(project);

  recordFinancialTransaction(state, {
    type: 'RENOVATION_COST',
    category: 'EXPENSE',
    amount: totalCost,
    description: `Initiated renovation: ${project.title}`,
    sourceAccount: 'Liquid Cash'
  });

  return {
    success: true,
    message: `Renovation started on ${property.name}! Expected duration: ${durationMonths} months. Projected valuation uplift: +$${valueIncrease.toLocaleString()}.`,
    project
  };
}

export function startLandDevelopmentProject(
  state: GameState,
  title: string,
  type: LandDevelopmentType,
  city: string,
  country: string,
  totalEstimatedCost: number
): { success: boolean; message: string; project?: LandDevelopmentProject } {
  const initialCapital = Math.round(totalEstimatedCost * 0.25); // 25% down
  if ((state.finances?.cash || 0) < initialCapital) {
    return { success: false, message: `Insufficient cash for 25% equity capital commitment ($${initialCapital.toLocaleString()}).` };
  }

  state.finances.cash -= initialCapital;

  const project: LandDevelopmentProject = {
    id: `dev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title,
    type,
    city,
    country,
    stage: 'FEASIBILITY_STUDY',
    totalEstimatedCost,
    capitalCommitted: initialCapital,
    monthsInStage: 0,
    totalDurationMonths: 18,
    completedValueProjected: Math.round(totalEstimatedCost * 1.5),
    annualOperatingIncomeProjected: Math.round(totalEstimatedCost * 0.12),
    status: 'ON_SCHEDULE'
  };

  const portfolio = ensurePropertySystemState(state);
  portfolio.activeDevelopments.push(project);

  recordFinancialTransaction(state, {
    type: 'DEVELOPMENT_EXPENSE',
    category: 'ASSET',
    amount: initialCapital,
    description: `Committed capital to land development: ${title}`,
    sourceAccount: 'Liquid Cash',
    destinationAccount: `Development Capital (${title})`
  });

  return {
    success: true,
    message: `Land development project [${title}] initiated! Committed $${initialCapital.toLocaleString()} equity.`,
    project
  };
}

export function updatePropertyPortfolioTotals(state: GameState): void {
  const portfolio = ensurePropertySystemState(state);
  let totalVal = 0;
  let totalRent = 0;
  let totalMaint = 0;

  portfolio.rentalProperties.forEach(p => {
    totalVal += (p.currentValue || 0);
    if (p.isRented) {
      totalRent += (p.monthlyRent || 0);
    }
    totalMaint += (p.monthlyMaintenance || 0);
  });

  portfolio.totalRealEstateValue = totalVal;
  portfolio.totalMonthlyGrossRent = totalRent;
  portfolio.totalMonthlyMaintenance = totalMaint;
  portfolio.averageOccupancyRate = portfolio.rentalProperties.length > 0
    ? Math.round((portfolio.rentalProperties.filter(p => p.isRented).length / portfolio.rentalProperties.length) * 100)
    : 100;
}

export function simulateMonthlyPropertyStep(state: GameState): void {
  const portfolio = ensurePropertySystemState(state);

  // 1. Process rental revenue and maintenance expenses
  portfolio.rentalProperties.forEach(prop => {
    if (prop.isRented && (prop.monthlyRent || 0) > 0) {
      state.finances.cash += prop.monthlyRent;
      recordFinancialTransaction(state, {
        type: 'RENT_INCOME',
        category: 'INCOME',
        amount: prop.monthlyRent,
        description: `Rental income from ${prop.name}`,
        destinationAccount: 'Liquid Cash'
      });
    }

    if ((prop.monthlyMaintenance || 0) > 0) {
      state.finances.cash = Math.max(0, state.finances.cash - prop.monthlyMaintenance);
      recordFinancialTransaction(state, {
        type: 'LIVING_EXPENSE',
        category: 'EXPENSE',
        amount: prop.monthlyMaintenance,
        description: `Property maintenance & tax for ${prop.name}`,
        sourceAccount: 'Liquid Cash'
      });
    }

    // Occasional tenant turnover
    if (Math.random() < 0.03) {
      prop.isRented = false;
    } else if (!prop.isRented && Math.random() < 0.4) {
      prop.isRented = true;
    }
  });

  // 2. Advance active renovations
  portfolio.activeRenovations.forEach(reno => {
    if (reno.status !== 'IN_PROGRESS') return;

    reno.monthsCompleted += 1;
    if (reno.monthsCompleted >= reno.durationMonths) {
      reno.status = 'COMPLETED';

      const prop = portfolio.rentalProperties.find(p => p.id === reno.propertyId)
        || (state.finances?.properties || []).find(p => p.id === reno.propertyId);

      if (prop) {
        prop.currentValue += reno.projectedValueIncrease;
        prop.monthlyRent += reno.projectedRentIncreaseMonthly;
        prop.condition = 100;
      }
    }
  });

  // 3. Advance land developments
  const stageOrder: DevelopmentStage[] = [
    'LAND_ACQUISITION',
    'FEASIBILITY_STUDY',
    'PROJECT_FINANCING',
    'ZONING_AND_PERMITS',
    'EXCAVATION_AND_FOUNDATION',
    'CORE_CONSTRUCTION',
    'INTERIOR_FITOUT',
    'COMPLETED_OPERATIONAL'
  ];

  portfolio.activeDevelopments.forEach(dev => {
    if (dev.status === 'COMPLETED') return;

    dev.monthsInStage += 1;
    if (dev.monthsInStage >= 3) {
      dev.monthsInStage = 0;
      const curIdx = stageOrder.indexOf(dev.stage);
      if (curIdx >= 0 && curIdx < stageOrder.length - 1) {
        dev.stage = stageOrder[curIdx + 1];
        if (dev.stage === 'COMPLETED_OPERATIONAL') {
          dev.status = 'COMPLETED';

          // Convert into operational commercial real estate property
          const newRealProp: RealEstateProperty = {
            id: `dev_completed_${Date.now()}`,
            name: `${dev.title} (Developed)`,
            type: 'Office Tower',
            purchasePrice: dev.totalEstimatedCost,
            currentValue: dev.completedValueProjected,
            monthlyRent: Math.round(dev.annualOperatingIncomeProjected / 12),
            monthlyMaintenance: Math.round((dev.annualOperatingIncomeProjected / 12) * 0.2),
            isRented: true,
            condition: 100,
            tenantQuality: 90,
            city: dev.city,
            country: dev.country
          };
          portfolio.rentalProperties.push(newRealProp);
        }
      }
    }
  });

  updatePropertyPortfolioTotals(state);
}
