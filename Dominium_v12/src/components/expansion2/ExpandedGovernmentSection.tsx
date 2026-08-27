import React, { useState } from 'react';
import { 
  GameState, 
  GovernmentOfficeState, 
  GovernmentCabinetMinister, 
  NationalStrategicAsset, 
  InternationalCrisis 
} from '../../types';
import { 
  Landmark, 
  ShieldCheck, 
  Globe2, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Users, 
  Flame, 
  Flag,
  FileCheck,
  Building2
} from 'lucide-react';
import { 
  ensureGovernmentOfficeState, 
  enactPresidentialDecree, 
  manageStrategicAsset, 
  resolveDiplomaticCrisis 
} from '../../engine/governmentEngine';

interface ExpandedGovernmentSectionProps {
  state: GameState;
  onStateChange?: () => void;
}

export const ExpandedGovernmentSection: React.FC<ExpandedGovernmentSectionProps> = ({ 
  state, 
  onStateChange 
}) => {
  const gov = ensureGovernmentOfficeState(state);

  const [activeTab, setActiveTab] = useState<'treasury' | 'cabinet' | 'strategic_assets' | 'crises' | 'decrees'>('treasury');
  const [toast, setToast] = useState<{ msg: string; isError?: boolean } | null>(null);

  // Decree form
  const [decreeCat, setDecreeCat] = useState<'TAXATION' | 'INFRASTRUCTURE' | 'DEFENSE' | 'HEALTHCARE' | 'EDUCATION' | 'DEREGULATION'>('INFRASTRUCTURE');
  const [decreeTitle, setDecreeTitle] = useState<string>('National Hyperloop & Green Energy Grid Initiative');
  const [decreeImpact, setDecreeImpact] = useState<string>('Capitalizes high-speed transport corridor and strengthens energy self-reliance.');

  const showToast = (msg: string, isError: boolean = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 5000);
    if (onStateChange) onStateChange();
  };

  const handleEnactDecree = () => {
    const res = enactPresidentialDecree(state, decreeCat, decreeTitle, decreeImpact);
    showToast(res.message, !res.success);
  };

  const handleAssetAction = (assetId: string, action: 'MODERNIZE' | 'PRIVATIZE') => {
    const res = manageStrategicAsset(state, assetId, action);
    showToast(res.message, !res.success);
  };

  const handleDiplomaticAction = (crisisId: string, move: 'SANCTION' | 'SUMMIT' | 'MILITARY_PATROL' | 'ACCORD') => {
    const res = resolveDiplomaticCrisis(state, crisisId, move);
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

      {/* Sovereign Top Banner Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 shadow-sm">
          <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">National Treasury Reserve</div>
          <div className="text-base sm:text-lg font-black text-amber-400 mt-0.5">
            ${gov.nationalTreasuryBillions.toFixed(1)} Billion
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Sovereign Credit: {gov.sovereignCreditRating}</div>
        </div>

        <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 shadow-sm">
          <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Monthly Tax Inflow</div>
          <div className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">
            +${gov.monthlyTaxRevenueBillions.toFixed(1)}B / mo
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Outflow: ${gov.monthlyExpenditureBillions.toFixed(1)}B / mo</div>
        </div>

        <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 shadow-sm">
          <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Strategic State Assets</div>
          <div className="text-base sm:text-lg font-black text-blue-400 mt-0.5">
            {gov.strategicAssets.length} Enterprises
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Energy, Ports & Defense</div>
        </div>

        <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 shadow-sm">
          <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Geopolitical Posture</div>
          <div className="text-base sm:text-lg font-black text-zinc-200 mt-0.5 truncate">
            {gov.defenseProfile.securityPosture}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Readiness: {gov.defenseProfile.militaryReadinessScore}%</div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2 overflow-x-auto scrollbar-none">
        {[
          { key: 'treasury', label: 'Sovereign Treasury & Fiscal', icon: <DollarSign className="w-3.5 h-3.5" /> },
          { key: 'cabinet', label: `Cabinet Ministers (${gov.cabinet.length})`, icon: <Users className="w-3.5 h-3.5" /> },
          { key: 'strategic_assets', label: `Strategic Assets (${gov.strategicAssets.length})`, icon: <Building2 className="w-3.5 h-3.5" /> },
          { key: 'crises', label: `Diplomatic Crises (${gov.activeCrises.length})`, icon: <Globe2 className="w-3.5 h-3.5" /> },
          { key: 'decrees', label: 'Presidential Decrees', icon: <FileCheck className="w-3.5 h-3.5" /> },
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

      {/* TAB 1: TREASURY */}
      {activeTab === 'treasury' && (
        <div className="bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-4">
          <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-black text-zinc-100 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-amber-400" />
                Sovereign Fiscal Balance & National Debt
              </h3>
              <p className="text-xs text-zinc-400">Macroeconomic State Budget & Sovereign Rating</p>
            </div>
            <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Rating: {gov.sovereignCreditRating}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 text-xs">
              <div className="text-[10px] text-zinc-500 font-bold uppercase">National Debt</div>
              <div className="font-black text-rose-400 mt-0.5">${gov.sovereignDebtBillions.toFixed(1)} Billion</div>
            </div>
            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 text-xs">
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Monthly Net Balance</div>
              <div className="font-black text-emerald-400 mt-0.5">
                +${(gov.monthlyTaxRevenueBillions - gov.monthlyExpenditureBillions).toFixed(1)}B / mo
              </div>
            </div>
            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 text-xs">
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Monthly Defense Budget</div>
              <div className="font-black text-zinc-200 mt-0.5">${(gov.defenseProfile.defenseBudgetMonthly / 1_000_000_000).toFixed(1)}B / mo</div>
            </div>
            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 text-xs">
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Deterrence Rating</div>
              <div className="font-black text-amber-400 mt-0.5">{gov.defenseProfile.strategicDeterrenceRating} / 100</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CABINET */}
      {activeTab === 'cabinet' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {gov.cabinet.map(min => (
            <div key={min.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-black text-zinc-100">{min.name}</h4>
                  <div className="text-[11px] text-amber-400 font-bold mt-0.5">Minister of {min.ministry}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  Approval: {min.approvalRating}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs">
                <div>
                  <span className="text-zinc-500 text-[10px]">Competence:</span>
                  <div className="font-bold text-emerald-400">{min.competence}%</div>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px]">Loyalty:</span>
                  <div className="font-bold text-blue-400">{min.loyalty}%</div>
                </div>
              </div>

              <div className="text-[10px] text-zinc-400">
                Key Policies: {min.recentPolicies.join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: STRATEGIC ASSETS */}
      {activeTab === 'strategic_assets' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {gov.strategicAssets.map(asset => (
            <div key={asset.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-black text-zinc-100">{asset.name}</h4>
                  <div className="text-[11px] text-zinc-400 mt-0.5">{asset.sector} &bull; {asset.strategicImportance} Importance</div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  asset.ownership === 'STATE_OWNED' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {asset.ownership.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs">
                <div>
                  <div className="text-[10px] text-zinc-500">Gross Monthly Revenue</div>
                  <div className="font-black text-emerald-400">${(asset.monthlyRevenueGross / 1_000_000).toFixed(1)}M/mo</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500">Modernization</div>
                  <div className="font-bold text-amber-400">{asset.modernizationLevel}%</div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleAssetAction(asset.id, 'MODERNIZE')}
                  className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-700 transition-colors"
                >
                  Modernize ($2.5B)
                </button>
                {asset.ownership !== 'PRIVATIZED' && (
                  <button
                    onClick={() => handleAssetAction(asset.id, 'PRIVATIZE')}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black rounded-xl transition-colors shadow-sm"
                  >
                    Privatize Stake
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: CRISES */}
      {activeTab === 'crises' && (
        <div className="space-y-3">
          {gov.activeCrises.length === 0 ? (
            <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 text-center text-xs text-zinc-500">
              No active geopolitical flashpoints or trade disputes.
            </div>
          ) : (
            gov.activeCrises.map(crisis => (
              <div key={crisis.id} className="bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-zinc-100">{crisis.title}</h4>
                    <div className="text-xs text-zinc-400 mt-0.5">Counterparty: {crisis.opposingNation} &bull; Tension: {crisis.tensionLevel}</div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Resolution: {crisis.diplomaticResolutionProgress}%
                  </span>
                </div>

                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${crisis.diplomaticResolutionProgress}%` }}
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => handleDiplomaticAction(crisis.id, 'SUMMIT')}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Host Bilateral Summit
                  </button>
                  <button
                    onClick={() => handleDiplomaticAction(crisis.id, 'ACCORD')}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Sign Trade Accord
                  </button>
                  <button
                    onClick={() => handleDiplomaticAction(crisis.id, 'SANCTION')}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Impose Sanctions
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 5: DECREES */}
      {activeTab === 'decrees' && (
        <div className="bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-4">
          <h4 className="text-xs sm:text-sm font-black text-zinc-100 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-amber-400" />
            Enact Executive & Sovereign Policy Decree
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1">Policy Category</label>
              <select
                value={decreeCat}
                onChange={(e) => setDecreeCat(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-200 font-bold"
              >
                <option value="INFRASTRUCTURE">National Infrastructure & High-Speed Transit</option>
                <option value="TAXATION">Targeted Fiscal Tax Reform</option>
                <option value="DEFENSE">Strategic Defense Readiness & Procurement</option>
                <option value="HEALTHCARE">Universal Bio-Tech Healthcare System</option>
                <option value="EDUCATION">STEM Quantum AI Education Grant</option>
                <option value="DEREGULATION">Enterprise Deregulation & Free Trade</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1">Decree Title</label>
              <input
                type="text"
                value={decreeTitle}
                onChange={(e) => setDecreeTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-100 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 mb-1">Strategic Objective & Impact Statement</label>
            <input
              type="text"
              value={decreeImpact}
              onChange={(e) => setDecreeImpact(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-100 font-bold"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleEnactDecree}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5" /> Enact Decree Into National Law
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
