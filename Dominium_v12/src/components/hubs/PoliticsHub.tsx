import React, { useState } from 'react';
import { GameState, PoliticalParty, EventChain } from '../../types';
import { 
  Landmark, 
  Crown, 
  Users, 
  TrendingUp, 
  Vote, 
  ShieldCheck, 
  Award, 
  DollarSign, 
  CheckCircle,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight,
  Flame,
  Scale,
  Building,
  Tv,
  FileText,
  Activity,
  Globe2,
  Gavel
} from 'lucide-react';
import { ExpandedGovernmentSection } from '../expansion2/ExpandedGovernmentSection';
import { ExpandedLegalSection } from '../expansion2/ExpandedLegalSection';
import { PoliticalGovernancePanel } from '../expansion2/LivingBankingAndPoliticsPanel';
import { LivingGovernmentCommandCenter } from '../government/LivingGovernmentCommandCenter';

interface PoliticsHubProps {
  state: GameState;
  onJoinParty: (partyId: string) => void;
  onRunCampaign: (targetOffice: any, budget: number) => void;
  onLaunchInteractiveCampaign?: (targetOffice: string) => void;
  onEnactPolicy: (policyKey: string, value: string) => void;
  onAppointMinister: (ministry: string, ministerName: string) => void;
  onNavigateToInbox?: () => void;
}

export const PoliticsHub: React.FC<PoliticsHubProps> = ({
  state,
  onJoinParty,
  onRunCampaign,
  onLaunchInteractiveCampaign,
  onEnactPolicy,
  onAppointMinister,
  onNavigateToInbox
}) => {
  const [subTab, setSubTab] = useState<'career' | 'chains' | 'campaign' | 'parties' | 'governance' | 'sovereign' | 'legal' | 'factors' | 'administration' | 'state'>('career');
  const [campaignBudget, setCampaignBudget] = useState<number>(25000);
  const [selectedCampaignOffice, setSelectedCampaignOffice] = useState<string>('Mayor');
  const [campaignMode, setCampaignMode] = useState<'interactive' | 'quick'>('interactive');

  const { politics, character, finances, world, currentCountryIndex, playerPowerProfile, activeEventChains } = state;
  const currentOffice = politics.currentOffice;
  const activeParty = politics.parties.find(p => p.id === politics.selectedPartyId);
  const country = world[currentCountryIndex];
  const netWorth = finances.cash + state.companies.reduce((acc, c) => acc + (c.valuation * c.playerOwnershipPercentage) / 100, 0);

  // Active political chains
  const activePolChains = (activeEventChains || []).filter(c => 
    c.category === 'POLITICS' || 
    c.id.includes('pol_') || 
    c.id.includes('campaign') || 
    c.id.includes('recruit') ||
    c.id.includes('policy') ||
    c.id.includes('lobby') ||
    c.id.includes('scandal')
  );

  const officesLadder = [
    { title: 'Citizen', reqRep: 0, reqInfluence: 0, salaryMonthly: 0, desc: 'Private citizen with voting rights and civic agency.' },
    { title: 'Party Member', reqRep: 25, reqInfluence: 5, salaryMonthly: 0, desc: 'Active delegate eligible for internal committee appointments.' },
    { title: 'City Councillor', reqRep: 40, reqInfluence: 15, salaryMonthly: 4500, desc: 'Municipal legislative authority overseeing zoning & local ordinances.' },
    { title: 'Mayor', reqRep: 55, reqInfluence: 25, salaryMonthly: 12000, desc: 'Chief metropolitan executive commanding city budgets and civil services.' },
    { title: 'Member of Parliament / Senator', reqRep: 68, reqInfluence: 45, salaryMonthly: 24000, desc: 'National lawmaker voting on statutory bills, fiscal budgets, and foreign treaties.' },
    { title: 'Cabinet Minister', reqRep: 78, reqInfluence: 65, salaryMonthly: 45000, desc: 'Executive department secretary shaping trade, treasury, health, or defence.' },
    { title: 'President / Prime Minister', reqRep: 88, reqInfluence: 80, salaryMonthly: 85000, desc: 'Head of State & Government with sweeping constitutional decree power.' },
  ];

  // Check if recruitment invitation exists
  const hasRecruitmentChain = activePolChains.some(c => c.id.includes('pol_recruit'));

  return (
    <div className="space-y-4">
      {/* Sub navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-800">
        {[
          { key: 'career', label: 'Offices & Career', icon: <Landmark className="w-3.5 h-3.5" /> },
          { 
            key: 'chains', 
            label: `Political Event Chains ${activePolChains.length > 0 ? `(${activePolChains.length})` : ''}`, 
            icon: <Flame className="w-3.5 h-3.5 text-amber-400" /> 
          },
          { key: 'campaign', label: 'Electoral Campaigns', icon: <Vote className="w-3.5 h-3.5" /> },
          { key: 'parties', label: 'Parties & Polling', icon: <Users className="w-3.5 h-3.5" /> },
          { key: 'governance', label: 'Policy Decrees', icon: <Crown className="w-3.5 h-3.5" /> },
          { key: 'sovereign', label: 'Sovereign Strategy & Cabinet', icon: <Globe2 className="w-3.5 h-3.5 text-cyan-400" /> },
          { key: 'legal', label: 'Legal & Court System', icon: <Gavel className="w-3.5 h-3.5 text-amber-400" /> },
          { key: 'factors', label: 'Multi-Variate Factors', icon: <Activity className="w-3.5 h-3.5" /> },
          { key: 'administration', label: 'Public Administration', icon: <Landmark className="w-3.5 h-3.5" /> },
          { key: 'state', label: 'Living Government', icon: <Building className="w-3.5 h-3.5" /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSubTab(tab.key as any)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              subTab === tab.key
                ? 'bg-zinc-900 text-amber-400 border border-zinc-700/90 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* RECRUITMENT BANNER ALERT IF ACTIVE */}
      {hasRecruitmentChain && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">Active Political Overture</span>
              <h4 className="font-black text-sm text-zinc-100">Party Recruitment Delegation Awaiting Your Decision</h4>
              <p className="text-xs text-zinc-400">A major national party is courting your commercial influence and public reputation.</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (onNavigateToInbox) onNavigateToInbox();
              else setSubTab('chains');
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap"
          >
            Respond in Decision Inbox →
          </button>
        </div>
      )}

      {subTab === 'administration' && <PoliticalGovernancePanel state={state} onStateChange={() => window.dispatchEvent(new Event('dominium-state-change'))} />}
      {subTab === 'state' && <LivingGovernmentCommandCenter state={state} onStateChange={(next) => { window.dispatchEvent(new CustomEvent('dominium-government-state-change', { detail: next })); }} />}

      {/* 1. POLITICAL CAREER */}
      {subTab === 'career' && (
        <div className="space-y-4">
          {/* Current Office Card */}
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Current Political Status</span>
                <h3 className="text-xl font-black text-zinc-100 mt-0.5">{currentOffice.title}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Jurisdiction: {currentOffice.cityOrNation}</p>
              </div>

              {currentOffice.inOffice && (
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold">Public Approval</span>
                  <div className="text-2xl font-black text-emerald-400">{currentOffice.approvalRating}%</div>
                  {currentOffice.termMonthsRemaining !== undefined && (
                    <span className="text-[10px] text-zinc-500 font-bold block">{currentOffice.termMonthsRemaining} mo left in term</span>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Affiliated Party</span>
                <div className="font-extrabold text-zinc-200 mt-0.5 truncate">{activeParty ? activeParty.name : 'Independent'}</div>
              </div>
              <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Political Capital</span>
                <div className="font-extrabold text-amber-400 mt-0.5">{currentOffice.politicalCapital}/100</div>
              </div>
              <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">World Influence</span>
                <div className="font-extrabold text-amber-300 mt-0.5">{character.attributes.worldInfluence}/100</div>
              </div>
              <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Office Stipend</span>
                <div className="font-extrabold text-emerald-400 mt-0.5">${(currentOffice.salaryMonthly || 0).toLocaleString()}/mo</div>
              </div>
            </div>
          </div>

          {/* Ladder Progression */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Constitutional Offices of State
            </h4>

            <div className="space-y-2">
              {officesLadder.map(tier => {
                const isCurrent = currentOffice.title === tier.title;
                const hasRep = character.attributes.reputation >= tier.reqRep;
                const hasInfluence = character.attributes.worldInfluence >= tier.reqInfluence;
                const isEligible = hasRep && hasInfluence;

                return (
                  <div 
                    key={tier.title}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      isCurrent 
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-md' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-zinc-100">{tier.title}</span>
                        {isCurrent && <span className="text-[10px] bg-amber-500 text-zinc-950 px-2 py-0.5 rounded font-black">ACTIVE OFFICE</span>}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{tier.desc}</p>
                      <div className="text-[11px] text-zinc-400 mt-1 flex flex-wrap gap-2">
                        <span>Req Rep: <b className="text-zinc-200">{tier.reqRep}</b></span>
                        <span>•</span>
                        <span>Req Influence: <b className="text-zinc-200">{tier.reqInfluence}</b></span>
                        <span>•</span>
                        <span>Stipend: <b className="text-emerald-400">${tier.salaryMonthly.toLocaleString()}/mo</b></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isCurrent && tier.title !== 'Citizen' && (
                        <button
                          onClick={() => {
                            setSelectedCampaignOffice(tier.title);
                            setSubTab('campaign');
                          }}
                          disabled={!isEligible}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                            isEligible
                              ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 shadow-sm active:scale-95'
                              : 'bg-zinc-950 text-zinc-600 border border-zinc-900 cursor-not-allowed'
                          }`}
                        >
                          {isEligible ? 'Launch Campaign →' : 'Locked (Rep/Influence)'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. POLITICAL EVENT CHAINS & CRISES */}
      {subTab === 'chains' && (
        <div className="space-y-4">
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Multi-Stage Event Engine</span>
              <h3 className="text-lg font-black text-zinc-100 mt-0.5">Active Political Event Chains & Inquiries</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Political governance, legislative battles, media scandals, and election campaigns evolve through sequential, state-dependent event chains.
              </p>
            </div>

            {activePolChains.length === 0 ? (
              <div className="text-center py-10 bg-zinc-950/60 rounded-2xl border border-zinc-800/80 space-y-2">
                <CheckCircle className="w-8 h-8 text-zinc-600 mx-auto" />
                <h4 className="text-sm font-bold text-zinc-300">No Active Political Crises or Inquiries</h4>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  Your administration is currently operating steadily. Event chains trigger automatically during elections, economic shifts, party overtures, or parliamentary investigations.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activePolChains.map(chain => (
                  <div key={chain.id} className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {chain.category || 'POLITICS'}
                          </span>
                          <span className="text-xs font-black text-zinc-200">{chain.name}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1">
                          Current Stage: <b className="text-zinc-200">{chain.currentStage}</b> (Started {chain.startedMonth}/{chain.startedYear})
                        </p>
                      </div>

                      <button
                        onClick={onNavigateToInbox}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-bold rounded-xl border border-zinc-700 transition-all flex items-center gap-1 active:scale-95"
                      >
                        <span>Resolve in Inbox</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Chain History */}
                    {chain.history && chain.history.length > 0 && (
                      <div className="bg-zinc-900/80 p-3 rounded-lg border border-zinc-800/60 text-xs space-y-1.5">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Stage Progression History:</span>
                        {chain.history.map((h, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] text-zinc-300">
                            <span>Stage {h.stageSequence}: <b>{h.stageTitle}</b></span>
                            <span className="text-amber-400 font-medium">{h.choiceLabel}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. ELECTION CAMPAIGN */}
      {subTab === 'campaign' && (
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-5 shadow-xl">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Electoral Process</span>
            <h3 className="text-lg font-black text-zinc-100 mt-0.5">Launch Election Campaign</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Assemble campaign warchests, navigate 7-stage national campaigns (Strategy, Fundraising, Media Inquest, Polling, Televised Debate, Election Day & Inauguration).
            </p>
          </div>

          {/* Campaign Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 text-xs font-bold">
            <button
              onClick={() => setCampaignMode('interactive')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                campaignMode === 'interactive' 
                  ? 'bg-zinc-800 text-amber-400 shadow-sm border border-zinc-700' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>7-Stage Interactive Journey (Event Chain)</span>
            </button>
            <button
              onClick={() => setCampaignMode('quick')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                campaignMode === 'quick' 
                  ? 'bg-zinc-800 text-amber-400 shadow-sm border border-zinc-700' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Vote className="w-3.5 h-3.5" />
              <span>Instant Polling Ballot</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-zinc-400 font-bold uppercase text-[10px] mb-1">Target Office</label>
              <select
                value={selectedCampaignOffice}
                onChange={(e) => setSelectedCampaignOffice(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-zinc-100 font-bold focus:outline-none"
              >
                <option value="City Councillor">City Councillor (District Wards)</option>
                <option value="Mayor">Mayor (Metropolitan Chief Executive)</option>
                <option value="Member of Parliament / Senator">Member of Parliament / Senator (National Legislature)</option>
                <option value="President / Prime Minister">President / Prime Minister (Head of State & Government)</option>
              </select>
            </div>

            {campaignMode === 'quick' && (
              <div>
                <label className="block text-zinc-400 font-bold uppercase text-[10px] mb-1">Campaign Warchest Budget ($)</label>
                <input
                  type="number"
                  step="5000"
                  value={campaignBudget}
                  onChange={(e) => setCampaignBudget(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-zinc-100 font-bold focus:outline-none"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Available Liquid Cash: ${finances.cash.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {campaignMode === 'interactive' ? (
            <button
              onClick={() => {
                if (onLaunchInteractiveCampaign) {
                  onLaunchInteractiveCampaign(selectedCampaignOffice);
                } else {
                  onRunCampaign(selectedCampaignOffice, campaignBudget);
                }
              }}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] font-black text-xs sm:text-sm text-zinc-950 shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch 7-Stage Interactive Campaign Journey 🗳️</span>
            </button>
          ) : (
            <button
              onClick={() => onRunCampaign(selectedCampaignOffice, campaignBudget)}
              disabled={finances.cash < campaignBudget}
              className="w-full py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-950 disabled:text-zinc-600 active:scale-[0.99] font-black text-xs sm:text-sm text-zinc-100 border border-zinc-700 shadow-md transition-all"
            >
              Hold Instant General Election Ballot 🗳️
            </button>
          )}
        </div>
      )}

      {/* 4. PARTIES & POLLING */}
      {subTab === 'parties' && (
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              National Political Parties & Electorate Polling
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {politics.parties.map(party => {
                const isMember = politics.selectedPartyId === party.id;

                return (
                  <div key={party.id} className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-3.5 shadow-md">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                      <div>
                        <h5 className="font-black text-sm text-zinc-100">{party.name}</h5>
                        <span className="text-[11px] text-amber-400 font-bold">{party.ideology}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold">National Polling</span>
                        <div className="text-base font-black text-amber-400">{party.pollingPercentage}%</div>
                      </div>
                    </div>

                    <div className="text-xs text-zinc-400 space-y-1">
                      <div>Party Leader: <b className="text-zinc-200">{party.partyLeader}</b></div>
                      <div>Campaign War Chest: <b className="text-emerald-400">${(party.partyFunds / 1000000).toFixed(1)}M</b></div>
                    </div>

                    <div className="pt-1">
                      {isMember ? (
                        <div className="text-center py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs">
                          Active Member & Caucus Delegate
                        </div>
                      ) : (
                        <button
                          onClick={() => onJoinParty(party.id)}
                          className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 active:scale-[0.99] text-zinc-200 hover:text-zinc-100 text-xs font-bold border border-zinc-700 transition-all"
                        >
                          Join Party Organization
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. GOVERNANCE & POLICY */}
      {subTab === 'governance' && (
        <div className="space-y-4">
          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-4 shadow-xl">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Executive Power</span>
              <h3 className="text-lg font-black text-zinc-100 mt-0.5">National Policy Decrees & Budget</h3>
              <p className="text-xs text-zinc-400 mt-1">
                {currentOffice.inOffice 
                  ? 'Your statutory authority allows you to alter national fiscal, healthcare, and infrastructure mandates.'
                  : 'Requires holding executive political office (Mayor, Minister, or President).'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800 space-y-2">
                <span className="font-bold text-zinc-300">Corporate & Income Tax Structure</span>
                <select
                  disabled={!currentOffice.inOffice}
                  value={politics.nationalPolicies.taxBracket}
                  onChange={(e) => onEnactPolicy('taxBracket', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl p-2.5 text-zinc-200 focus:outline-none"
                >
                  <option value="Low Enterprise">Low Enterprise (15% Tax • Stimulates GDP & Business)</option>
                  <option value="Balanced Moderate">Balanced Moderate (25% Tax • Stable State Revenue)</option>
                  <option value="High Social Support">High Social Support (38% Tax • Funds Social Programs)</option>
                </select>
              </div>

              <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800 space-y-2">
                <span className="font-bold text-zinc-300">Healthcare Spending Mandate</span>
                <select
                  disabled={!currentOffice.inOffice}
                  value={politics.nationalPolicies.healthcareSpending}
                  onChange={(e) => onEnactPolicy('healthcareSpending', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl p-2.5 text-zinc-200 focus:outline-none"
                >
                  <option value="Budget">Budget Austerity (Lower National Debt)</option>
                  <option value="Universal">Universal Public Clinics (+Health Score)</option>
                  <option value="Advanced Medical Tech">Advanced Medical & BioTech Subsidies</option>
                </select>
              </div>

              <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800 space-y-2">
                <span className="font-bold text-zinc-300">Infrastructure Focus</span>
                <select
                  disabled={!currentOffice.inOffice}
                  value={politics.nationalPolicies.infrastructureFocus}
                  onChange={(e) => onEnactPolicy('infrastructureFocus', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl p-2.5 text-zinc-200 focus:outline-none"
                >
                  <option value="Smart Cities">High-Speed Transit & Smart Cities (+Productivity)</option>
                  <option value="Green Energy">Renewable Grid & Nuclear Power</option>
                  <option value="Transport & Rail">Freight Ports & Highways</option>
                </select>
              </div>

              <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800 space-y-2">
                <span className="font-bold text-zinc-300">Defence & Geopolitics</span>
                <select
                  disabled={!currentOffice.inOffice}
                  value={politics.nationalPolicies.defenceLevel}
                  onChange={(e) => onEnactPolicy('defenceLevel', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl p-2.5 text-zinc-200 focus:outline-none"
                >
                  <option value="Peacekeeping">Diplomatic Peacekeeping (Lower Cost)</option>
                  <option value="Standard">Standard Modern Readiness</option>
                  <option value="Global Superpower">Global Superpower (+World Influence / High Cost)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. SOVEREIGN STRATEGY & CABINET */}
      {subTab === 'sovereign' && (
        <ExpandedGovernmentSection state={state} />
      )}

      {/* 7. LEGAL & COURT SYSTEM */}
      {subTab === 'legal' && (
        <ExpandedLegalSection state={state} />
      )}

      {/* 8. MULTI-VARIATE FACTORS */}
      {subTab === 'factors' && (
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-5 shadow-xl">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Systemic Simulation</span>
            <h3 className="text-lg font-black text-zinc-100 mt-0.5">Political Multi-Variate Factor Engine</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Political events, elections, parliamentary inquiries, and approval ratings are causally derived from your combined power profile.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-500 font-bold uppercase">Public Approval Rating</span>
              <div className="text-xl font-black text-emerald-400">{currentOffice.approvalRating}%</div>
              <p className="text-[11px] text-zinc-400">Impacted by economic cycle, inflation, tax policy, and ethics disclosures.</p>
            </div>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-500 font-bold uppercase">World Influence Score</span>
              <div className="text-xl font-black text-amber-400">{character.attributes.worldInfluence}/100</div>
              <p className="text-[11px] text-zinc-400">Unlocks higher constitutional offices, international summits, and caucus power.</p>
            </div>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-500 font-bold uppercase">Public Reputation</span>
              <div className="text-xl font-black text-amber-300">{character.attributes.reputation}/100</div>
              <p className="text-[11px] text-zinc-400">Determines debate outcomes, editorial endorsements, and voter trust.</p>
            </div>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-500 font-bold uppercase">Net Worth & PAC Clout</span>
              <div className="text-xl font-black text-zinc-100">${netWorth.toLocaleString()}</div>
              <p className="text-[11px] text-zinc-400">Enables self-funded campaign advertising dominance and attracts major party overtures.</p>
            </div>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-500 font-bold uppercase">Media Scrutiny Index</span>
              <div className="text-xl font-black text-rose-400">{playerPowerProfile?.scrutiny || 25}/100</div>
              <p className="text-[11px] text-zinc-400">High scrutiny accelerates investigative leaks, ethics probes, and conflict inquiries.</p>
            </div>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-500 font-bold uppercase">National Economic Climate</span>
              <div className="text-xl font-black text-cyan-400">{country?.businessCycle || 'Expansion'}</div>
              <p className="text-[11px] text-zinc-400">GDP: +{country?.gdpGrowthRate !== undefined ? country.gdpGrowthRate.toFixed(1) : '2.0'}% • Inflation: {country?.inflationRate !== undefined ? country.inflationRate.toFixed(1) : '2.5'}%.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
