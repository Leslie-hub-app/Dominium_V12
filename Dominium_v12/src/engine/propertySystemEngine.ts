import { GameState } from '../types';
import { 
  ensurePropertySystemState as ensurePropState, 
  simulateMonthlyPropertyStep, 
  buyRentalProperty, 
  startPropertyRenovation 
} from './propertyEngine';

export function ensurePropertySystemState(state: GameState) {
  const prop = ensurePropState(state);
  state.expansion2Property = prop;
  return {
    ...prop,
    properties: prop.rentalProperties.map(p => ({
      ...p,
      currentValuation: p.currentValue,
      renovationInvestment: 15000
    }))
  };
}

export function simulateMonthlyPropertySystem(state: GameState): void {
  simulateMonthlyPropertyStep(state);
  ensurePropertySystemState(state);
}

export function acquirePropertyInvestment(
  state: GameState, 
  name: string = 'Manhattan Luxury Penthouse', 
  withMortgage: boolean = true
) {
  const propState = ensurePropState(state);
  const availableCash = state.finances?.cash || 0;
  const targetValue = Math.min(850000, Math.max(50000, Math.floor(availableCash * 0.5)));
  const result = buyRentalProperty(state, {
    name,
    type: 'Luxury Villa',
    marketValue: targetValue,
    monthlyRent: Math.round(targetValue * 0.007),
    monthlyExpenses: Math.round(targetValue * 0.0015),
    location: 'New York, USA'
  });

  const created = result.property || propState.rentalProperties[propState.rentalProperties.length - 1];
  ensurePropertySystemState(state);

  if (!created) return null;

  return {
    ...created,
    currentValuation: created.currentValue || targetValue,
    renovationInvestment: 25000
  };
}

export function renovateProperty(
  state: GameState, 
  propertyId: string, 
  type: any = 'LUXURY_FINISHES'
) {
  return startPropertyRenovation(state, propertyId, 'LUXURY_FINISHES', 'Premium Master Builders');
}
