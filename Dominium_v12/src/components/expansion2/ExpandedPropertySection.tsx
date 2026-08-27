import React, { useState } from 'react';
import { 
  GameState, 
  RealEstateProperty, 
  RenovationProject, 
  RenovationType, 
  LandDevelopmentProject, 
  LandDevelopmentType 
} from '../../types';
import { 
  Building, 
  Home, 
  Hammer, 
  HardHat, 
  Plus, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  TrendingUp,
  Clock,
  Layers
} from 'lucide-react';
import { RealEstatePlatformView } from './RealEstatePlatformView';
import { 
  ensurePropertySystemState, 
  buyRentalProperty, 
  startPropertyRenovation, 
  startLandDevelopmentProject 
} from '../../engine/propertyEngine';

interface ExpandedPropertySectionProps {
  state: GameState;
  onStateChange?: () => void;
}

export const ExpandedPropertySection: React.FC<ExpandedPropertySectionProps> = ({ 
  state, 
  onStateChange 
}) => {
  const portfolio = ensurePropertySystemState(state);

  const [activeTab, setActiveTab] = useState<'portfolio' | 'marketplace' | 'renovations' | 'developments' | 'platform'>('platform');
  const [toast, setToast] = useState<{ msg: string; isError?: boolean } | null>(null);

  // Renovation form
  const [renovationPropId, setRenovationPropId] = useState<string>('');
  const [renovationType, setRenovationType] = useState<RenovationType>('FULL_GUT_RENOVATION');
  const [contractorQuality, setContractorQuality] = useState<'Economy' | 'Standard' | 'Premium Master Builders'>('Standard');

  // Development form
  const [devTitle, setDevTitle] = useState<string>('Aetherion Horizon Tower');
  const [devType, setDevType] = useState<LandDevelopmentType>('RESIDENTIAL_TOWER');
  const [devCost, setDevCost] = useState<number>(25000000);

  const showToast = (msg: string, isError: boolean = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 5000);
    if (onStateChange) onStateChange();
  };

  const marketListings = [
    { name: 'SoHo Luxury Loft Suite', type: 'Penthouse' as const, marketValue: 2400000, monthlyRent: 14500, monthlyExpenses: 2800, location: 'New York, USA' },
    { name: 'Mayfair Victorian Townhouse', type: 'House' as const, marketValue: 5800000, monthlyRent: 26000, monthlyExpenses: 4200, location: 'London, UK' },
    { name: 'Roppongi Modern Commercial Tower', type: 'Commercial' as const, marketValue: 18500000, monthlyRent: 110000, monthlyExpenses: 18000, location: 'Tokyo, Japan' },
    { name: 'Lake Geneva Waterfront Villa', type: 'Mansion' as const, marketValue: 12000000, monthlyRent: 65000, monthlyExpenses: 9500, location: 'Geneva, Switzerland' },
    { name: 'Berlin Mitte Tech Hub Office', type: 'Commercial' as const, marketValue: 8500000, monthlyRent: 48000, monthlyExpenses: 7200, location: 'Berlin, Germany' },
  ];

  const handleBuyListing = (listing: typeof marketListings[0]) => {
    const res = buyRentalProperty(state, listing);
    showToast(res.message, !res.success);
  };

  const handleStartRenovation = () => {
    if (!renovationPropId) {
      showToast('Please select a property to renovate.', true);
      return;
    }
    const res = startPropertyRenovation(state, renovationPropId, renovationType, contractorQuality);
    showToast(res.message, !res.success);
  };

  const handleStartDevelopment = () => {
    const res = startLandDevelopmentProject(
      state, 
      devTitle, 
      devType, 
      state.character.residenceCity || 'New York', 
      state.character.residenceCountry || 'United States', 
      devCost
    );
    showToast(res.message, !res.success);
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-2 ${
          toast.isError ? 'bg-rose-950/80 border-rose-700/80 text-rose-200' : 'bg-emerald-950/80 border-emerald-700/80 text-emerald-200'
        }`}>
          {toast.isError ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Top Banner Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 shadow-sm">
          <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Real Estate Portfolio Value</div>
          <div className="text-base sm:text-lg font-black text-zinc-100 mt-0.5">
            ${(portfolio.totalRealEstateValue || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">{portfolio.rentalProperties.length} Properties Owned</div>
        </div>

        <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 shadow-sm">
          <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Monthly Gross Rent</div>
          <div className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">
            +${(portfolio.totalMonthlyGrossRent || 0).toLocaleString()}/mo
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Occupancy Rate: {portfolio.averageOccupancyRate}%</div>
        </div>

        <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 shadow-sm">
          <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Active Renovations</div>
          <div className="text-base sm:text-lg font-black text-amber-400 mt-0.5">
            {portfolio.activeRenovations.filter(r => r.status === 'IN_PROGRESS').length} In Progress
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Value enhancement projects</div>
        </div>

        <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 shadow-sm">
          <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Land Developments</div>
          <div className="text-base sm:text-lg font-black text-blue-400 mt-0.5">
            {portfolio.activeDevelopments.length} Active Sites
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Commercial & residential towers</div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2 overflow-x-auto scrollbar-none">
        {[
          { key: 'platform', label: 'Real Estate Platform', icon: <Building className="w-3.5 h-3.5" /> },
          { key: 'portfolio', label: `My Properties (${portfolio.rentalProperties.length})`, icon: <Home className="w-3.5 h-3.5" /> },
          { key: 'marketplace', label: 'Prime Real Estate Market', icon: <Plus className="w-3.5 h-3.5" /> },
          { key: 'renovations', label: `Renovations (${portfolio.activeRenovations.length})`, icon: <Hammer className="w-3.5 h-3.5" /> },
          { key: 'developments', label: `Land Developments (${portfolio.activeDevelopments.length})`, icon: <HardHat className="w-3.5 h-3.5" /> },
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

      {activeTab === 'platform' && <RealEstatePlatformView state={state} onStateChange={onStateChange} />}

      {/* TAB 1: MY PROPERTIES */}
      {activeTab === 'portfolio' && (
        <div className="space-y-3">
          {portfolio.rentalProperties.length === 0 ? (
            <div className="bg-zinc-900/60 p-8 rounded-2xl border border-zinc-800 text-center space-y-3">
              <Building className="w-10 h-10 text-zinc-600 mx-auto" />
              <div className="text-sm font-bold text-zinc-300">No Rental Real Estate Assets</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Acquire income-producing residential townhouses, penthouses, or commercial towers in the Marketplace tab.
              </p>
              <button
                onClick={() => setActiveTab('marketplace')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black rounded-xl transition-colors shadow-md"
              >
                Browse Marketplace Listings
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {portfolio.rentalProperties.map(prop => (
                <div key={prop.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-zinc-100">{prop.name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {prop.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-500" /> {prop.location}
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      prop.isRented 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {prop.isRented ? 'OCCUPIED' : 'VACANT'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs">
                    <div>
                      <div className="text-[10px] text-zinc-500">Market Valuation</div>
                      <div className="font-black text-zinc-100">${(prop.marketValue || 0).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500">Monthly Rent</div>
                      <div className="font-black text-emerald-400">+${(prop.monthlyRent || 0).toLocaleString()}/mo</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500">Operating Expenses</div>
                      <div className="text-rose-400 font-mono">-${(prop.monthlyExpenses || 0).toLocaleString()}/mo</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500">Building Condition</div>
                      <div className="font-bold text-zinc-200">{prop.condition || 100}%</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        setRenovationPropId(prop.id);
                        setActiveTab('renovations');
                      }}
                      className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <Hammer className="w-3.5 h-3.5 text-amber-400" /> Renovate & Upgrade
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MARKETPLACE LISTINGS */}
      {activeTab === 'marketplace' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {marketListings.map(listing => {
            const hasCash = (state.finances?.cash || 0) >= listing.marketValue;

            return (
              <div key={listing.name} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-black text-zinc-100">{listing.name}</h4>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-zinc-500" /> {listing.location}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400">
                    {listing.type}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Purchase Price:</span>
                    <span className="font-black text-zinc-100">${listing.marketValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Projected Rent:</span>
                    <span className="font-bold text-emerald-400">+${listing.monthlyRent.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Expenses & Tax:</span>
                    <span className="text-rose-400">-${listing.monthlyExpenses.toLocaleString()}/mo</span>
                  </div>
                </div>

                <button
                  onClick={() => handleBuyListing(listing)}
                  disabled={!hasCash}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Acquire Real Estate
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: RENOVATIONS */}
      {activeTab === 'renovations' && (
        <div className="space-y-4">
          {/* Active Renovations */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-zinc-300 uppercase tracking-wider">Active Renovation Projects</h4>
            {portfolio.activeRenovations.length === 0 ? (
              <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 text-center text-xs text-zinc-500">
                No active renovation projects. Select a property below to commission architectural improvements.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {portfolio.activeRenovations.map(reno => (
                  <div key={reno.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-black text-zinc-100">{reno.title}</span>
                        <div className="text-[11px] text-zinc-400 mt-0.5">Contractor: {reno.contractorQuality}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        reno.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {reno.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs">
                      <div>
                        <div className="text-[10px] text-zinc-500">Progress Duration</div>
                        <div className="font-bold text-zinc-200">{reno.monthsCompleted} / {reno.durationMonths} Mos</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500">Total Capital Spent</div>
                        <div className="font-black text-amber-400">${reno.totalCost.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500">Valuation Lift</div>
                        <div className="font-bold text-emerald-400">+${reno.projectedValueIncrease.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500">Rent Increase</div>
                        <div className="font-bold text-emerald-400">+${reno.projectedRentIncreaseMonthly.toLocaleString()}/mo</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* New Renovation Form */}
          <div className="bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-4">
            <h4 className="text-xs sm:text-sm font-black text-zinc-100 flex items-center gap-2">
              <Hammer className="w-4 h-4 text-amber-400" />
              Commission Property Renovation & Value Expansion
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Target Property</label>
                <select
                  value={renovationPropId}
                  onChange={(e) => setRenovationPropId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-200 font-bold"
                >
                  <option value="">-- Select Property --</option>
                  {portfolio.rentalProperties.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (${(p.marketValue || 0).toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Renovation Scope</label>
                <select
                  value={renovationType}
                  onChange={(e) => setRenovationType(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-200 font-bold"
                >
                  <option value="COSMETIC_REFURBISHMENT">Cosmetic Refurbishment</option>
                  <option value="FULL_GUT_RENOVATION">Full Gut Renovation</option>
                  <option value="LUXURY_FINISHES_UPGRADE">Luxury Finishes & Smart Home</option>
                  <option value="STRUCTURAL_EXPANSION">Structural Expansion & Additions</option>
                  <option value="ENERGY_EFFICIENCY_GREEN">Energy Efficiency & Solar Retrofit</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Contractor Tier</label>
                <select
                  value={contractorQuality}
                  onChange={(e) => setContractorQuality(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-200 font-bold"
                >
                  <option value="Economy">Economy Builders (Cheap, High Delay Risk)</option>
                  <option value="Standard">Standard Licensed Contractors</option>
                  <option value="Premium Master Builders">Premium Master Builders (Fast, Max ROI)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-zinc-400">
                Liquid Cash: <strong className="text-zinc-200">${(state.finances?.cash || 0).toLocaleString()}</strong>
              </div>
              <button
                onClick={handleStartRenovation}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs rounded-xl shadow-md transition-all"
              >
                Commence Renovation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LAND DEVELOPMENTS */}
      {activeTab === 'developments' && (
        <div className="space-y-4">
          {/* Active Developments */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-zinc-300 uppercase tracking-wider">Active Land Development Projects</h4>
            {portfolio.activeDevelopments.length === 0 ? (
              <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 text-center text-xs text-zinc-500">
                No active development sites. Break ground on a major tower or commercial hub below.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {portfolio.activeDevelopments.map(dev => (
                  <div key={dev.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-black text-zinc-100">{dev.title}</span>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{dev.city}, {dev.country} &bull; {dev.type}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {dev.stage.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs">
                      <div>
                        <div className="text-[10px] text-zinc-500">Estimated Total Cost</div>
                        <div className="font-black text-zinc-200">${dev.totalEstimatedCost.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500">Completed Valuation</div>
                        <div className="font-black text-emerald-400">${dev.completedValueProjected.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500">Equity Committed</div>
                        <div className="font-bold text-amber-400">${dev.capitalCommitted.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500">Projected Annual NOI</div>
                        <div className="font-bold text-emerald-400">+${dev.annualOperatingIncomeProjected.toLocaleString()}/yr</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Groundbreaking Development Form */}
          <div className="bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-4">
            <h4 className="text-xs sm:text-sm font-black text-zinc-100 flex items-center gap-2">
              <HardHat className="w-4 h-4 text-blue-400" />
              Break Ground on Landmark Development Project
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Project Title</label>
                <input
                  type="text"
                  value={devTitle}
                  onChange={(e) => setDevTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Development Type</label>
                <select
                  value={devType}
                  onChange={(e) => setDevType(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-200 font-bold"
                >
                  <option value="RESIDENTIAL_TOWER">Residential Luxury Tower ($25M)</option>
                  <option value="COMMERCIAL_MALL">Commercial Mega-Mall ($45M)</option>
                  <option value="LOGISTICS_HUB">Autonomous Logistics & Industrial Hub ($18M)</option>
                  <option value="LUXURY_RESORT">5-Star Coastal Luxury Resort ($60M)</option>
                  <option value="INDUSTRIAL_PARK">Green Tech Advanced Manufacturing Park ($35M)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Total CapEx Budget ($)</label>
                <input
                  type="number"
                  step="5000000"
                  value={devCost}
                  onChange={(e) => setDevCost(Math.max(5000000, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-100 font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-zinc-400">
                25% Equity Required: <strong className="text-amber-400">${Math.round(devCost * 0.25).toLocaleString()}</strong>
              </div>
              <button
                onClick={handleStartDevelopment}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md transition-all"
              >
                Break Ground on Site
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
