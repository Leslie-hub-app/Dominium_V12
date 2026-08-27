import React, { useState } from 'react';
import { 
  GameState, 
  LegalCase, 
  LegalRepresentationTier, 
  LegalClaimType, 
  CourtJurisdiction 
} from '../../types';
import { 
  Scale, 
  ShieldAlert, 
  FileText, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Gavel,
  Users,
  ChevronRight
} from 'lucide-react';
import { 
  ensureLegalSystemProfile, 
  initiatePlayerLawsuit, 
  retainLegalCounsel, 
  respondToSettlementOffer 
} from '../../engine/legalEngine';

interface ExpandedLegalSectionProps {
  state: GameState;
  onStateChange?: () => void;
}

export const ExpandedLegalSection: React.FC<ExpandedLegalSectionProps> = ({ 
  state, 
  onStateChange 
}) => {
  const legal = ensureLegalSystemProfile(state);

  const [activeTab, setActiveTab] = useState<'active_cases' | 'file_suit' | 'history'>('active_cases');
  const [toast, setToast] = useState<{ msg: string; isError?: boolean } | null>(null);

  // Lawsuit filing state
  const [defendantName, setDefendantName] = useState<string>('Apex Strategic Holdings Ltd.');
  const [claimType, setClaimType] = useState<LegalClaimType>('BREACH_OF_CONTRACT');
  const [claimAmount, setClaimAmount] = useState<number>(1500000);
  const [jurisdiction, setJurisdiction] = useState<CourtJurisdiction>('COMMERCIAL');

  const showToast = (msg: string, isError: boolean = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 5000);
    if (onStateChange) onStateChange();
  };

  const handleFileSuit = () => {
    const res = initiatePlayerLawsuit(state, defendantName, claimType, claimAmount, jurisdiction);
    showToast(res.message, !res.success);
    if (res.success) setActiveTab('active_cases');
  };

  const handleRetainCounsel = (caseId: string, tier: LegalRepresentationTier) => {
    const res = retainLegalCounsel(state, caseId, tier);
    showToast(res.message, !res.success);
  };

  const handleSettlement = (caseId: string, accept: boolean) => {
    const res = respondToSettlementOffer(state, caseId, accept);
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

      {/* Top Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 shadow-sm">
          <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Active Lawsuits</div>
          <div className="text-base sm:text-lg font-black text-amber-400 mt-0.5">
            {legal.activeCases.length} Pending
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">In Commercial & Civil Courts</div>
        </div>

        <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 shadow-sm">
          <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Historical Cases</div>
          <div className="text-base sm:text-lg font-black text-zinc-200 mt-0.5">
            {legal.caseHistory.length} Resolved
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Judgments & Settlements</div>
        </div>

        <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 shadow-sm">
          <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Lifetime Legal Spend</div>
          <div className="text-base sm:text-lg font-black text-rose-400 mt-0.5">
            ${(legal.totalLegalFeesSpentLifetime || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Attorney retainers & filing</div>
        </div>

        <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 shadow-sm">
          <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Insolvency Status</div>
          <div className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">
            {legal.insolvencyStatus}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Solvent & legally cleared</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2 overflow-x-auto scrollbar-none">
        {[
          { key: 'active_cases', label: `Active Litigation (${legal.activeCases.length})`, icon: <Scale className="w-3.5 h-3.5" /> },
          { key: 'file_suit', label: 'File Court Lawsuit', icon: <Plus className="w-3.5 h-3.5" /> },
          { key: 'history', label: `Docket History (${legal.caseHistory.length})`, icon: <FileText className="w-3.5 h-3.5" /> },
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

      {/* TAB 1: ACTIVE CASES */}
      {activeTab === 'active_cases' && (
        <div className="space-y-3">
          {legal.activeCases.length === 0 ? (
            <div className="bg-zinc-900/60 p-8 rounded-2xl border border-zinc-800 text-center space-y-3">
              <Gavel className="w-10 h-10 text-zinc-600 mx-auto" />
              <div className="text-sm font-bold text-zinc-300">No Active Lawsuits on Docket</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                You currently have no pending legal battles. File a lawsuit against competitor entities or corporate bad actors in the File Court Lawsuit tab.
              </p>
              <button
                onClick={() => setActiveTab('file_suit')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black rounded-xl transition-colors shadow-md"
              >
                File Lawsuit
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {legal.activeCases.map(c => (
                <div key={c.id} className="bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-zinc-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-zinc-100">{c.title}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {c.caseNumber}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        Jurisdiction: {c.jurisdiction} &bull; Claim: {c.claimType.replace(/_/g, ' ')}
                      </div>
                    </div>
                    <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 w-fit">
                      Stage: {c.stage.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 text-xs">
                      <div className="text-[10px] text-zinc-500 font-bold uppercase">Claim Amount</div>
                      <div className="font-black text-zinc-100 mt-0.5">${c.claimAmount.toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 text-xs">
                      <div className="text-[10px] text-zinc-500 font-bold uppercase">Your Evidence</div>
                      <div className="font-black text-emerald-400 mt-0.5">{c.evidenceStrengthPlayer}%</div>
                    </div>
                    <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 text-xs">
                      <div className="text-[10px] text-zinc-500 font-bold uppercase">Opponent Evidence</div>
                      <div className="font-black text-rose-400 mt-0.5">{c.evidenceStrengthOpponent}%</div>
                    </div>
                    <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 text-xs">
                      <div className="text-[10px] text-zinc-500 font-bold uppercase">Monthly Retainer</div>
                      <div className="font-black text-amber-400 mt-0.5">${c.monthlyLegalFees.toLocaleString()}/mo</div>
                    </div>
                  </div>

                  {/* Settlement Offer Banner if active */}
                  {c.settlementOffer && c.settlementOffer.status === 'PENDING' && (
                    <div className="p-3.5 bg-gradient-to-r from-amber-500/10 to-zinc-950 rounded-xl border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-black text-amber-300">
                          Settlement Proposal Tendered: ${c.settlementOffer.amount.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{c.settlementOffer.terms}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSettlement(c.id, true)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors"
                        >
                          Accept Settlement
                        </button>
                        <button
                          onClick={() => handleSettlement(c.id, false)}
                          className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl transition-colors"
                        >
                          Reject & Go to Trial
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Upgrade Counsel Controls */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="text-zinc-500 font-bold">Retain Counsel:</span>
                    {(['SELF_REPRESENTED', 'STANDARD_COUNSEL', 'SENIOR_LITIGATOR', 'ELITE_DEFENSE_FIRM'] as LegalRepresentationTier[]).map(tier => (
                      <button
                        key={tier}
                        onClick={() => handleRetainCounsel(c.id, tier)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                          c.playerRepresentation === tier 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500' 
                            : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-700'
                        }`}
                      >
                        {tier.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FILE LAWSUIT */}
      {activeTab === 'file_suit' && (
        <div className="bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-4">
          <h4 className="text-xs sm:text-sm font-black text-zinc-100 flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-400" />
            File Commercial Claim & Docket Legal Suit
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1">Defendant Organization / Entity</label>
              <input
                type="text"
                value={defendantName}
                onChange={(e) => setDefendantName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-100 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1">Legal Claim Classification</label>
              <select
                value={claimType}
                onChange={(e) => setClaimType(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-200 font-bold"
              >
                <option value="BREACH_OF_CONTRACT">Breach of Commercial Contract</option>
                <option value="INTELLECTUAL_PROPERTY_THEFT">IP Theft & Patent Infringement</option>
                <option value="COMMERCIAL_FRAUD">Corporate Fraud & Embezzlement</option>
                <option value="DEFAMATION_SLANDER">Defamation & Trade Slander</option>
                <option value="ANTITRUST_MONOPOLY">Antitrust & Anti-Competitive Practice</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1">Court Jurisdiction</label>
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-200 font-bold"
              >
                <option value="COMMERCIAL">Commercial Division Court</option>
                <option value="CIVIL">Civil High Court</option>
                <option value="FEDERAL_APPELLATE">Federal Appellate Court</option>
                <option value="SUPREME_COURT">Supreme Constitutional Court</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1">Claimed Damages ($)</label>
              <input
                type="number"
                step="250000"
                value={claimAmount}
                onChange={(e) => setClaimAmount(Math.max(10000, Number(e.target.value)))}
                className="w-full bg-zinc-950 border border-zinc-750 px-3 py-2 rounded-xl text-xs text-zinc-100 font-mono font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-zinc-400">
              Statutory Filing Fee: <strong className="text-amber-400">${Math.max(1500, Math.round(claimAmount * 0.02)).toLocaleString()}</strong>
            </div>
            <button
              onClick={handleFileSuit}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1"
            >
              <Gavel className="w-3.5 h-3.5" /> File Legal Action
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: DOCKET HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {legal.caseHistory.length === 0 ? (
            <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 text-center text-xs text-zinc-500">
              No historical case judgments recorded.
            </div>
          ) : (
            legal.caseHistory.map(c => (
              <div key={c.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black text-zinc-100">{c.title}</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">{c.caseNumber} &bull; Claim: ${c.claimAmount.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                    c.judgmentVerdict === 'WON' || c.judgmentVerdict === 'SETTLED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}>
                    {c.judgmentVerdict}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
