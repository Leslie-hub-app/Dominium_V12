import React, { useState } from 'react';
import { GameState, CountryState, CityState } from '../../types';
import { 
  TrendingUp, 
  Globe, 
  MapPin, 
  Layers, 
  Percent, 
  Activity, 
  Building2, 
  Plane, 
  ShieldCheck,
  DollarSign,
  Cpu
} from 'lucide-react';
import { ConditionalRulesMonitor } from '../ConditionalRulesMonitor';
import { DelayedConsequencesTracker } from '../DelayedConsequencesTracker';

interface EconomyHubProps {
  state: GameState;
  onRelocateCity: (countryName: string, cityName: string) => void;
}

export const EconomyHub: React.FC<EconomyHubProps> = ({
  state,
  onRelocateCity
}) => {
  const [selectedCountryId, setSelectedCountryId] = useState<string>(state.world[state.currentCountryIndex]?.id || state.world[0].id);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);

  const selectedCountry = state.world.find(c => c.id === selectedCountryId) || state.world[0];
  const selectedCity = selectedCountry.cities.find(ct => ct.id === selectedCityId) || selectedCountry.cities[0];

  const isCurrentLocation = state.character.residenceCountry === selectedCountry.name && state.character.residenceCity === selectedCity.name;

  return (
    <div className="space-y-4">
      {/* Macro Economy Overview Banner */}
      <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selectedCountry.flag}</span>
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">National Macroeconomic Index</span>
              <h3 className="text-xl font-black text-zinc-100 mt-0.5">{selectedCountry.name}</h3>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Business Cycle Phase</span>
            <div className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 inline-block mt-0.5">
              {selectedCountry.businessCycle}
            </div>
          </div>
        </div>

        {/* Macro KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Nominal GDP</span>
            <div className="text-sm sm:text-base font-extrabold text-zinc-100 mt-0.5">${(selectedCountry.gdpBillions / 1000).toFixed(2)}T</div>
            <span className="text-[10px] text-emerald-400 font-medium">+{selectedCountry.gdpGrowthRate}% growth</span>
          </div>

          <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Annual Inflation</span>
            <div className="text-sm sm:text-base font-extrabold text-amber-400 mt-0.5">{selectedCountry.inflationRate}%</div>
            <span className="text-[10px] text-zinc-500">CPI Index</span>
          </div>

          <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Central Bank Interest</span>
            <div className="text-sm sm:text-base font-extrabold text-zinc-200 mt-0.5">{selectedCountry.centralBankInterestRate}%</div>
            <span className="text-[10px] text-zinc-500">Benchmark Repo</span>
          </div>

          <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Corporate Tax Rate</span>
            <div className="text-sm sm:text-base font-extrabold text-zinc-200 mt-0.5">{selectedCountry.corporateTaxRate}%</div>
            <span className="text-[10px] text-zinc-500">Income Tax: {selectedCountry.incomeTaxRate}%</span>
          </div>
        </div>
      </div>

      {/* Interactive World Map & Country Directory */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-amber-400" />
          Global Sovereign States & Territories
        </h4>

        {/* Country selector tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {state.world.map(c => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedCountryId(c.id);
                setSelectedCityId(null);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedCountry.id === c.id
                  ? 'bg-zinc-800 border-zinc-700 shadow-md ring-1 ring-amber-400/30'
                  : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
              }`}
            >
              <div className="text-xl mb-1">{c.flag}</div>
              <div className="font-extrabold text-xs text-zinc-100 truncate">{c.name}</div>
              <div className="text-[10px] text-zinc-400">{c.currencySymbol} {c.currencyName}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Country Cities & Exploration */}
      <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-black text-zinc-100">Cities & Commercial Hubs in {selectedCountry.name}</h4>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {selectedCountry.cities.map(city => {
            const isHere = state.character.residenceCity === city.name;

            return (
              <div 
                key={city.id}
                className={`p-4 rounded-xl border space-y-3 transition-all ${
                  isHere ? 'border-amber-500/40 bg-amber-500/5' : 'bg-zinc-950/70 border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-black text-sm text-zinc-100">{city.name}</h5>
                    <span className="text-[11px] text-zinc-400">Population: {city.population.toLocaleString()}</span>
                  </div>
                  {isHere && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Current Residence
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800/80">
                    <span className="text-zinc-400 font-bold block">Avg Salary</span>
                    <b className="text-zinc-200 mt-0.5 block">${city.averageIncomeMonthly}/mo</b>
                  </div>
                  <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800/80">
                    <span className="text-zinc-400 font-bold block">Property Index</span>
                    <b className="text-amber-400 mt-0.5 block">{city.propertyPriceIndex}/100</b>
                  </div>
                  <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800/80">
                    <span className="text-zinc-400 font-bold block">Opportunity</span>
                    <b className="text-emerald-400 mt-0.5 block">{city.businessOpportunityScore}/100</b>
                  </div>
                </div>

                {!isHere && (
                  <button
                    onClick={() => onRelocateCity(selectedCountry.name, city.name)}
                    disabled={state.finances.cash < 2500}
                    className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 active:scale-[0.99] disabled:bg-zinc-950 disabled:text-zinc-600 text-zinc-200 hover:text-zinc-100 text-xs font-bold border border-zinc-700 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Plane className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Relocate Residence & Headquarters ($2,500)</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Delayed Consequences Scheduler Tracker (Phase 6) */}
      <DelayedConsequencesTracker state={state} />

      {/* Systemic Conditional Consequences Monitor (Phase 5) */}
      <ConditionalRulesMonitor state={state} />
    </div>
  );
};
