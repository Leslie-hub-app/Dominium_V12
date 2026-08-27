import React, { useState } from 'react';
import { 
  GameState, 
  Company, 
  CompanyExecutive, 
  MergerAcquisitionDeal 
} from '../../types';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  Trash2, 
  Briefcase, 
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { 
  hireCompanyExecutive, 
  fireCompanyExecutive, 
  launchCorporateMergerAcquisition, 
  advanceMergerAcquisitionDeal, 
  executeCorporateExit 
} from '../../engine/businessManagementEngine';

interface ExpandedCorporateSectionProps {
  state: GameState;
  onStateChange?: () => void;
}

export const ExpandedCorporateSection: React.FC<ExpandedCorporateSectionProps> = ({ 
  state, 
  onStateChange 
}) => {
  const [activeTab, setActiveTab] = useState<'executives' | 'ma_pipeline' | 'exits'>('executives');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(state.companies[0]?.id || '');
  const [toast, setToast] = useState<{ msg: string; isError?: boolean } | null>(null);

  // Executive hiring form
  const [execName, setExecName] = useState<string>('Victoria Sterling');
  const [execRole, setExecRole] = useState<'CEO' | 'CFO' | 'COO' | 'CTO' | 'CMO' | 'General Counsel'>('CFO');
  const [execSalary, setExecSalary] = useState<number>(35000);
  const [execPersonality, setExecPersonality] = useState<'Aggressive Growth' | 'Conservative Prudent' | 'Tech Visionary' | 'Cost Cutter' | 'Dealmaker'>('Conservative Prudent');

  // M&A form
  const [maTargetName, setMaTargetName] = useState<string>('Solaria Quantum Tech');
  const [maTargetIndustry, setMaTargetIndustry] = useState<string>('Technology & AI');
  const [maTargetValuation, setMaTargetValuation] = useState<number>(15000000);
  const [maFinancing, setMaFinancing] = useState<'ALL_CASH' | 'DEBT_FINANCED' | 'STOCK_SWAP' | 'HYBRID'>('ALL_CASH');

  // Exit form
  const [exitStakePercent, setExitStakePercent] = useState<number>(20);

  const selectedCompany = state.companies.find(c => c.id === selectedCompanyId) || state.companies[0];
  const companyExecutives: CompanyExecutive[] = (selectedCompany as any)?.executives || [];
  const activeMADeals: MergerAcquisitionDeal[] = (selectedCompany as any)?.activeMADeals || [];

  const showToast = (msg: string, isError: boolean = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 5000);
    if (onStateChange) onStateChange();
  };

  const handleHireExec = () => {
    if (!selectedCompany) return;
    const res = hireCompanyExecutive(state, selectedCompany.id, {
      name: execName,
      role: execRole,
      salaryMonthly: execSalary,
      competence: Math.floor(Math.random() * 25) + 75,
      loyalty: Math.floor(Math.random() * 20) + 75,
      personality: execPersonality
    });
    showToast(res.message, !res.success);
  };

  const handleFireExec = (execId: string) => {
    if (!selectedCompany) return;
    const res = fireCompanyExecutive(state, selectedCompany.id, execId);
    showToast(res.message, !res.success);
  };

  const handleLaunchMA = () => {
    if (!selectedCompany) return;
    const res = launchCorporateMergerAcquisition(state, selectedCompany.id, maTargetName, maTargetIndustry, maTargetValuation, maFinancing);
    showToast(res.message, !res.success);
  };

  const handleAdvanceMA = (dealId: string) => {
    if (!selectedCompany) return;
    const res = advanceMergerAcquisitionDeal(state, selectedCompany.id, dealId);
    showToast(res.message, !res.success);
  };

  const handleExitStake = () => {
    if (!selectedCompany) return;
    const res = executeCorporateExit(state, selectedCompany.id, 'SELL_STAKE', exitStakePercent);
    showToast(res.message, !res.success);
  };

  if (state.companies.length === 0) {
    return (
      <div className="bg-zinc-900/60 p-8 rounded-2xl border border-zinc-800 text-center space-y-3">
        <Building2 className="w-10 h-10 text-zinc-600 mx-auto" />
        <div className="text-sm font-bold text-zinc-300">No Operating Corporate Enterprises</div>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          Found or acquire a company in the Empire Hub to manage C-Suite executives, execute strategic M&A takeovers, and monetize equity.
        </p>
      </div>
    );
  }

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

      {/* Company Selector Header */}
      <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Active Enterprise</span>
          <h3 className="text-sm sm:text-base font-black text-zinc-100 mt-0.5">{selectedCompany.name}</h3>
          <div className="text-xs text-zinc-400 mt-0.5">
            Valuation: ${(selectedCompany.valuation || 0).toLocaleString()} &bull; Ownership: {selectedCompany.playerOwnershipPercentage}%
          </div>
        </div>

        <select
          value={selectedCompany.id}
          onChange={(e) => setSelectedCompanyId(e.target.value)}
          className="bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-200 font-bold"
        >
          {state.companies.map(c => (
            <option key={c.id} value={c.id}>{c.name} (${(c.valuation || 0).toLocaleString()})</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2 overflow-x-auto scrollbar-none">
        {[
          { key: 'executives', label: `C-Suite Executives (${companyExecutives.length})`, icon: <Users className="w-3.5 h-3.5" /> },
          { key: 'ma_pipeline', label: `M&A Pipeline (${activeMADeals.length})`, icon: <TrendingUp className="w-3.5 h-3.5" /> },
          { key: 'exits', label: 'Corporate Equity Exits', icon: <ArrowUpRight className="w-3.5 h-3.5" /> },
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

      {/* TAB 1: EXECUTIVES */}
      {activeTab === 'executives' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {companyExecutives.map(exec => (
              <div key={exec.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-black text-zinc-100">{exec.name}</h4>
                    <div className="text-[11px] text-amber-400 font-bold mt-0.5">{exec.role} &bull; {exec.personality}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                    ${exec.salaryMonthly.toLocaleString()}/mo
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs">
                  <div>
                    <span className="text-zinc-500 text-[10px]">Competence:</span>
                    <div className="font-bold text-emerald-400">{exec.competence}%</div>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px]">Loyalty:</span>
                    <div className="font-bold text-blue-400">{exec.loyalty}%</div>
                  </div>
                </div>

                <button
                  onClick={() => handleFireExec(exec.id)}
                  className="w-full py-1.5 bg-zinc-800 hover:bg-rose-950 hover:text-rose-300 text-zinc-400 text-xs font-bold rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Dismiss Executive
                </button>
              </div>
            ))}
          </div>

          {/* Hire Executive Form */}
          <div className="bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-4">
            <h4 className="text-xs sm:text-sm font-black text-zinc-100 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              Appoint C-Suite Executive to {selectedCompany.name}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Executive Name</label>
                <input
                  type="text"
                  value={execName}
                  onChange={(e) => setExecName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Target Role</label>
                <select
                  value={execRole}
                  onChange={(e) => setExecRole(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-200 font-bold"
                >
                  <option value="CEO">Chief Executive Officer (CEO)</option>
                  <option value="CFO">Chief Financial Officer (CFO)</option>
                  <option value="COO">Chief Operating Officer (COO)</option>
                  <option value="CTO">Chief Technology Officer (CTO)</option>
                  <option value="CMO">Chief Marketing Officer (CMO)</option>
                  <option value="General Counsel">General Counsel (Legal)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Monthly Retainer ($)</label>
                <input
                  type="number"
                  step="5000"
                  value={execSalary}
                  onChange={(e) => setExecSalary(Math.max(5000, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Leadership Archetype</label>
                <select
                  value={execPersonality}
                  onChange={(e) => setExecPersonality(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-200 font-bold"
                >
                  <option value="Aggressive Growth">Aggressive Growth</option>
                  <option value="Conservative Prudent">Conservative Prudent</option>
                  <option value="Tech Visionary">Tech Visionary</option>
                  <option value="Cost Cutter">Cost Cutter</option>
                  <option value="Dealmaker">Dealmaker</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleHireExec}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs rounded-xl shadow-md transition-all"
              >
                Appoint Executive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: M&A PIPELINE */}
      {activeTab === 'ma_pipeline' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {activeMADeals.length === 0 ? (
              <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 text-center text-xs text-zinc-500">
                No active M&A transactions. Launch a corporate takeover bid below.
              </div>
            ) : (
              activeMADeals.map(deal => (
                <div key={deal.id} className="bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-3">
                  <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-zinc-100">Acquisition: {deal.targetCompanyName}</h4>
                      <div className="text-xs text-zinc-400 mt-0.5">{deal.targetIndustry} &bull; Offer: ${deal.proposedPurchasePrice.toLocaleString()}</div>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Stage: {deal.stage.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 bg-zinc-950/60 rounded-xl border border-zinc-800">
                      <div className="text-[10px] text-zinc-500">Target Valuation</div>
                      <div className="font-bold text-zinc-200">${deal.targetValuation.toLocaleString()}</div>
                    </div>
                    <div className="p-2.5 bg-zinc-950/60 rounded-xl border border-zinc-800">
                      <div className="text-[10px] text-zinc-500">Annual Synergy</div>
                      <div className="font-bold text-emerald-400">+${deal.synergyPotentialAnnual.toLocaleString()}/yr</div>
                    </div>
                    <div className="p-2.5 bg-zinc-950/60 rounded-xl border border-zinc-800">
                      <div className="text-[10px] text-zinc-500">Financing</div>
                      <div className="font-bold text-amber-400">{deal.financingMethod}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAdvanceMA(deal.id)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Advance Deal Stage ({deal.stage.replace(/_/g, ' ')})
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Launch M&A Form */}
          <div className="bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-4">
            <h4 className="text-xs sm:text-sm font-black text-zinc-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Launch Corporate Acquisition or Takeover
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Target Enterprise Name</label>
                <input
                  type="text"
                  value={maTargetName}
                  onChange={(e) => setMaTargetName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Industry Sector</label>
                <input
                  type="text"
                  value={maTargetIndustry}
                  onChange={(e) => setMaTargetIndustry(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Target Valuation ($)</label>
                <input
                  type="number"
                  step="5000000"
                  value={maTargetValuation}
                  onChange={(e) => setMaTargetValuation(Math.max(1000000, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Financing Structure</label>
                <select
                  value={maFinancing}
                  onChange={(e) => setMaFinancing(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-200 font-bold"
                >
                  <option value="ALL_CASH">All Cash Buyout (Treasury)</option>
                  <option value="DEBT_FINANCED">Debt Financed (Leveraged Buyout)</option>
                  <option value="STOCK_SWAP">Stock Swap (Equity Issuance)</option>
                  <option value="HYBRID">Hybrid 50% Cash / 50% Equity</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleLaunchMA}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md transition-all"
              >
                Submit Acquisition Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CORPORATE EXITS */}
      {activeTab === 'exits' && (
        <div className="bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-4">
          <h4 className="text-xs sm:text-sm font-black text-zinc-100 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Monetize & Sell Corporate Equity Stake
          </h4>

          <div className="p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-400">Total Enterprise Valuation:</span>
              <span className="font-black text-zinc-100">${(selectedCompany.valuation || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Your Current Ownership:</span>
              <span className="font-bold text-amber-400">{selectedCompany.playerOwnershipPercentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Stake Value:</span>
              <span className="font-black text-emerald-400">
                ${Math.round(((selectedCompany.valuation || 0) * selectedCompany.playerOwnershipPercentage) / 100).toLocaleString()}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 mb-1">Ownership Percentage to Sell (%)</label>
            <input
              type="number"
              min="1"
              max={selectedCompany.playerOwnershipPercentage}
              value={exitStakePercent}
              onChange={(e) => setExitStakePercent(Math.max(1, Math.min(selectedCompany.playerOwnershipPercentage, Number(e.target.value))))}
              className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-100 font-mono font-bold"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-zinc-400">
              Estimated Net Cash Proceeds: <strong className="text-emerald-400">${Math.round(((selectedCompany.valuation || 0) * exitStakePercent) / 100).toLocaleString()}</strong>
            </div>
            <button
              onClick={handleExitStake}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition-all"
            >
              Execute Equity Sale
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
