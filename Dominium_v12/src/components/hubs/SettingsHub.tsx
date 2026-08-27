import React, { useState } from 'react';
import { GameState } from '../../types';
import { 
  Settings, 
  Save, 
  Download, 
  Upload, 
  Trophy, 
  HelpCircle, 
  Sparkles, 
  RotateCcw, 
  Check, 
  BrainCircuit, 
  Sliders,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Zap,
  TrendingDown,
  TrendingUp,
  Building2,
  Landmark,
  Heart,
  Users,
  Briefcase,
  AlertTriangle,
  Info,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Play,
  FileCheck,
  XCircle,
  Vote,
  GitFork,
  Clock,
  Crown
} from 'lucide-react';
import { consultAiAdvisor, buildComprehensiveAiAdvisorContext, calculateMultiPeriodDiffs } from '../../engine/aiEngine';
import { 
  saveGameToSlot, 
  loadGameFromSlot, 
  getSavedSlots, 
  deleteSaveSlot, 
  exportGameStateToJSON, 
  importGameStateFromJSON,
  CURRENT_SAVE_VERSION,
  AUTOSAVE_SLOT_ID
} from '../../engine/saveEngine';
import { calculateNetWorth } from '../../engine/simulationEngine';
import { 
  runAllIntegrationTests, 
  runTestA_BusinessCrisis,
  runTestB_HighDebt,
  runTestC_PoliticalCareer,
  runTestD_Family,
  runTestE_EventChain,
  runTestF_DelayedConsequence,
  runTestG_Power,
  runTestH_Dynasty,
  runTestI_AiConsultation,
  runTestJ_SaveLoad,
  IntegrationTestResult,
  FullIntegrationSuiteReport 
} from '../../engine/integrationTestEngine';
import { IntegrationTestModal } from '../IntegrationTestModal';

interface SettingsHubProps {
  state: GameState;
  onUpdateState: (newState: GameState) => void;
  onResetGame: () => void;
  onOpenTestModal?: () => void;
}

type AdvisorRole = 'Senior Strategic Advisor' | 'CFO' | 'Political Strategist' | 'Executive Coach' | 'Investment Banker' | 'Health Specialist';

export const SettingsHub: React.FC<SettingsHubProps> = ({
  state,
  onUpdateState,
  onResetGame,
  onOpenTestModal
}) => {
  const [subTab, setSubTab] = useState<'advisor' | 'saves' | 'tests' | 'achievements' | 'gameplay'>('advisor');
  const [aiQuestion, setAiQuestion] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<AdvisorRole>('Senior Strategic Advisor');
  const [aiResponse, setAiResponse] = useState<any | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [saveStatusMsg, setSaveStatusMsg] = useState<string | null>(null);
  const [showContextInspector, setShowContextInspector] = useState<boolean>(false);
  const [showTestModalInternal, setShowTestModalInternal] = useState<boolean>(false);

  // Test suite inline state
  const [testReport, setTestReport] = useState<FullIntegrationSuiteReport | null>(null);
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);
  const [activeTestRunning, setActiveTestRunning] = useState<string | null>(null);
  const [selectedTestFilter, setSelectedTestFilter] = useState<'ALL' | 'PASSED' | 'FAILED'>('ALL');

  const netWorth = calculateNetWorth(state);
  const diffs = calculateMultiPeriodDiffs(state);
  const powerProfile = state.playerPowerProfile;

  // Preset diagnostic questions
  const presetQueries = [
    { label: 'What changed?', query: 'What changed recently across my empire, wealth, and status?' },
    { label: 'Why did net worth change?', query: 'Why did my net worth change over the last 3 months?' },
    { label: 'What decisions caused this?', query: 'What decisions and consequences caused my recent outcomes?' },
    { label: 'What happened to my company?', query: 'What happened to my company and operating margins?' },
    { label: 'What are my biggest risks?', query: 'What are my biggest strategic and systemic risks right now?' },
    { label: 'What should I focus on?', query: 'What should I focus on next to advance my power and wealth?' },
    { label: 'Why more media attention?', query: 'Why am I receiving more media attention and scrutiny?' },
    { label: 'Why political influence shifted?', query: 'Why has my political influence and approval rating changed?' },
    { label: 'How has family evolved?', query: 'How has my family situation and relationship network changed?' }
  ];

  // Ask AI
  const handleAskAi = async (customQuery?: string) => {
    const q = customQuery || aiQuestion;
    if (!q.trim()) return;

    setIsAiLoading(true);
    try {
      const answer = await consultAiAdvisor(q, selectedRole as any, state);
      setAiResponse(answer);
    } catch (err) {
      setAiResponse({
        answer: `Over the past quarter, net worth changed ${diffs.diff3M.netWorthChangePct >= 0 ? '+' : ''}${diffs.diff3M.netWorthChangePct}%. Liquid reserves stand at $${state.finances.cash.toLocaleString()}. Focus on liquidity maintenance and resolving pending decisions.`,
        recommendations: ["Maintain 6 months cash buffer", "Review Decision Inbox", "Monitor macroeconomic interest rates"],
        riskAssessment: "Prudent Stance",
        sourceRole: selectedRole,
        dataPointsReferenced: [
          `Net Worth: $${netWorth.toLocaleString()}`,
          `3M Delta: ${diffs.diff3M.netWorthChangePct}%`,
          `Power Tier: ${powerProfile?.powerTier || 'UNKNOWN'}`
        ]
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const [savedSlotsList, setSavedSlotsList] = useState(() => getSavedSlots());

  const refreshSlots = () => {
    setSavedSlotsList(getSavedSlots());
  };

  const handleSaveToSlot = (slotNumber: number) => {
    const slotId = `slot_${slotNumber}`;
    saveGameToSlot(state, slotId, `Manual Save #${slotNumber}: ${state.character.firstName} ${state.character.lastName} (Age ${state.character.age})`);
    refreshSlots();
    setSaveStatusMsg(`Game successfully saved to Slot #${slotNumber} (Schema v${CURRENT_SAVE_VERSION})`);
    setTimeout(() => setSaveStatusMsg(null), 3500);
  };

  const handleLoadFromSlot = (slotNumber: number | string) => {
    const slotId = typeof slotNumber === 'number' ? `slot_${slotNumber}` : slotNumber;
    const loadedState = loadGameFromSlot(slotId);
    if (loadedState) {
      onUpdateState(loadedState);
      refreshSlots();
      setSaveStatusMsg(`Game loaded successfully from ${slotId.replace('_', ' ')} (Schema v${loadedState.saveVersion || CURRENT_SAVE_VERSION})`);
      setTimeout(() => setSaveStatusMsg(null), 3500);
    } else {
      setSaveStatusMsg(`No save data found in ${slotId}`);
      setTimeout(() => setSaveStatusMsg(null), 3000);
    }
  };

  const handleDeleteSlot = (slotId: string) => {
    deleteSaveSlot(slotId);
    refreshSlots();
    setSaveStatusMsg(`Save slot ${slotId} deleted.`);
    setTimeout(() => setSaveStatusMsg(null), 3000);
  };

  const handleExportJSON = () => {
    const jsonText = exportGameStateToJSON(state);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonText);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dominium_v${CURRENT_SAVE_VERSION}_${state.character.lastName}_y${state.currentYear}_m${state.currentMonth}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setSaveStatusMsg(`Exported Game State JSON (Schema v${CURRENT_SAVE_VERSION})`);
    setTimeout(() => setSaveStatusMsg(null), 3000);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const rawText = event.target?.result as string;
          const migrated = importGameStateFromJSON(rawText);
          onUpdateState(migrated);
          refreshSlots();
          setSaveStatusMsg(`Save file imported and upgraded to Schema v${CURRENT_SAVE_VERSION} successfully!`);
          setTimeout(() => setSaveStatusMsg(null), 3500);
        } catch (err: any) {
          setSaveStatusMsg(`Import failed: ${err.message || 'Invalid JSON format'}`);
          setTimeout(() => setSaveStatusMsg(null), 3500);
        }
      };
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-800">
        {[
          { key: 'advisor', label: 'Executive AI Advisor', icon: <BrainCircuit className="w-3.5 h-3.5" /> },
          { key: 'saves', label: 'Save & Cloud Data', icon: <Save className="w-3.5 h-3.5" /> },
          { key: 'tests', label: 'Integration Suite (Phase 23)', icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> },
          { key: 'achievements', label: 'Achievements', icon: <Trophy className="w-3.5 h-3.5" /> },
          { key: 'gameplay', label: 'Game Configuration', icon: <Sliders className="w-3.5 h-3.5" /> },
        ].map(tab => (
          <button
            key={tab.key}
            id={`settings-subtab-${tab.key}`}
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

      {saveStatusMsg && (
        <div className="bg-zinc-900 border border-amber-500/40 p-3.5 rounded-xl text-xs text-amber-300 font-bold flex items-center gap-2 shadow-lg">
          <Check className="w-4 h-4 text-amber-400" />
          <span>{saveStatusMsg}</span>
        </div>
      )}

      {/* 1. EXECUTIVE AI ADVISOR */}
      {subTab === 'advisor' && (
        <div className="bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-800 space-y-4 shadow-xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-amber-400 shrink-0">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> Full Simulation Context Engine
                </span>
                <h3 className="text-base sm:text-lg font-black text-zinc-100 mt-0.5">Executive Strategic AI Advisor</h3>
              </div>
            </div>

            {/* Role Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-400 font-medium whitespace-nowrap">Advisor Role:</span>
              <select
                id="ai-advisor-role-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as AdvisorRole)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs rounded-xl px-3 py-1.5 font-bold focus:outline-none focus:border-amber-500/50 cursor-pointer"
              >
                <option value="Senior Strategic Advisor">Senior Strategic Advisor</option>
                <option value="CFO">Chief Financial Officer (CFO)</option>
                <option value="Political Strategist">Chief Political Strategist</option>
                <option value="Investment Banker">Investment Banker & M&A</option>
                <option value="Executive Coach">Executive Coach & Life</option>
                <option value="Health Specialist">Health & Longevity</option>
              </select>
            </div>
          </div>

          {/* Quick Diagnostic Preset Chips */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Diagnostic Inquiries:</span>
              <span className="text-[10px] text-zinc-500 font-medium">Fact-Grounded Simulation Answers</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {presetQueries.map((item, idx) => (
                <button
                  key={idx}
                  id={`ai-preset-query-${idx}`}
                  onClick={() => {
                    setAiQuestion(item.query);
                    handleAskAi(item.query);
                  }}
                  disabled={isAiLoading}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-amber-300 text-[11px] font-semibold transition-all disabled:opacity-50 text-left"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Form */}
          <form onSubmit={(e) => { e.preventDefault(); handleAskAi(); }} className="space-y-2.5">
            <textarea
              id="ai-custom-prompt-input"
              rows={2}
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder="Ask anything... (e.g. 'Why did my net worth change?', 'What decisions caused recent setbacks?', or 'What should I focus on next?')"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 resize-none font-normal"
            />

            <div className="flex items-center justify-between gap-2 flex-wrap">
              {/* Context Inspector Toggle */}
              <button
                type="button"
                id="toggle-ai-context-inspector"
                onClick={() => setShowContextInspector(!showContextInspector)}
                className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-950/50 border border-zinc-800/80"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>{showContextInspector ? 'Hide' : 'Inspect'} AI Context Feed</span>
                {showContextInspector ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <button
                type="submit"
                id="submit-ai-advisor-btn"
                disabled={isAiLoading || !aiQuestion.trim()}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] disabled:bg-zinc-800 disabled:text-zinc-600 font-extrabold text-xs text-zinc-950 border border-amber-400 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                    <span>Analyzing Simulation Diffs...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-zinc-950" />
                    <span>Request Strategic Analysis</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Context Inspector Panel */}
          {showContextInspector && (
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="font-bold text-amber-400 uppercase tracking-widest text-[10px]">Real-Time Feed Transmitted to Advisor</span>
                <span className="text-[10px] text-zinc-500">Grounded in actual records</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
                  <span className="text-zinc-500 font-bold block text-[9px] uppercase">Net Worth</span>
                  <span className="font-bold text-zinc-200">${netWorth.toLocaleString()}</span>
                  <span className={`block text-[9px] font-bold ${diffs.diff3M.netWorthChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {diffs.diff3M.netWorthChangePct >= 0 ? '+' : ''}{diffs.diff3M.netWorthChangePct}% (3M)
                  </span>
                </div>

                <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
                  <span className="text-zinc-500 font-bold block text-[9px] uppercase">Liquid Cash</span>
                  <span className="font-bold text-emerald-400">${state.finances.cash.toLocaleString()}</span>
                  <span className="block text-[9px] text-zinc-500">Debt: ${state.finances.loans.reduce((a, l) => a + l.remainingBalance, 0).toLocaleString()}</span>
                </div>

                <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
                  <span className="text-zinc-500 font-bold block text-[9px] uppercase">Power Profile</span>
                  <span className="font-bold text-amber-400">{powerProfile?.powerTier || 'UNKNOWN'}</span>
                  <span className="block text-[9px] text-zinc-500">{powerProfile?.powerScore || 0} pts</span>
                </div>

                <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
                  <span className="text-zinc-500 font-bold block text-[9px] uppercase">Macro / History</span>
                  <span className="font-bold text-zinc-200">{state.world[state.currentCountryIndex]?.businessCycle || 'Normal'}</span>
                  <span className="block text-[9px] text-zinc-500">{state.decisionHistory?.length || 0} Decs, {state.consequenceHistory?.length || 0} Csqs</span>
                </div>
              </div>
            </div>
          )}

          {/* AI Response Card */}
          {aiResponse && (
            <div className="bg-zinc-950/90 p-4 sm:p-5 rounded-xl border border-amber-500/30 space-y-3.5 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    {aiResponse.sourceRole || 'Advisory Assessment'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 px-2.5 py-1 rounded-md font-bold">
                    Risk: <span className="text-amber-400">{aiResponse.riskAssessment}</span>
                  </span>
                </div>
              </div>

              {/* Data Points Referenced Pills */}
              {aiResponse.dataPointsReferenced && aiResponse.dataPointsReferenced.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {aiResponse.dataPointsReferenced.map((dp: string, idx: number) => (
                    <span key={idx} className="text-[10px] bg-zinc-900/90 text-zinc-300 border border-zinc-800 px-2 py-0.5 rounded font-mono font-medium">
                      📌 {dp}
                    </span>
                  ))}
                </div>
              )}

              {/* Answer Content */}
              <div className="text-xs sm:text-sm text-zinc-100 leading-relaxed font-normal bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/60">
                {aiResponse.answer}
              </div>

              {/* Actionable Recommendations */}
              {aiResponse.recommendations && aiResponse.recommendations.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-zinc-800">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Priority Strategic Recommendations:</span>
                  <div className="space-y-1.5">
                    {aiResponse.recommendations.map((rec: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-zinc-200 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/50">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advisory Disclaimer */}
              <div className="text-[10px] text-zinc-500 text-right italic pt-1">
                Advisory only • Grounded directly in immutable simulation records
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. SAVES & CLOUD DATA */}
      {subTab === 'saves' && (
        <div className="bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-800 space-y-5 shadow-xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> Schema Version {CURRENT_SAVE_VERSION} Persistence Engine
              </span>
              <h3 className="text-base font-black text-zinc-100 mt-0.5">Manual Save Slots & Storage Management</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                Save Format: v{state.saveVersion || CURRENT_SAVE_VERSION}
              </span>
            </div>
          </div>

          {/* Active Autosave Preview */}
          {(() => {
            const autosave = savedSlotsList.find(s => s.slotId === AUTOSAVE_SLOT_ID);
            return (
              <div className="bg-zinc-950/80 p-4 rounded-xl border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-400">⚡ Continuous Auto-Save</span>
                    <span className="text-[10px] bg-amber-400/10 text-amber-300 border border-amber-400/20 px-1.5 py-0.2 rounded font-mono font-bold">
                      Schema v{autosave?.saveVersion || CURRENT_SAVE_VERSION}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-300 font-medium">
                    {autosave ? (
                      <span>{autosave.characterName} • Age {autosave.age} • Net Worth: <strong className="text-amber-400 font-mono">${autosave.netWorth.toLocaleString()}</strong></span>
                    ) : (
                      <span className="text-zinc-500 italic">No auto-save created yet</span>
                    )}
                  </div>
                  {autosave && (
                    <div className="text-[10px] text-zinc-500 font-mono">
                      Last Recorded: {autosave.savedAt}
                    </div>
                  )}
                </div>

                {autosave && (
                  <button
                    onClick={() => handleLoadFromSlot(AUTOSAVE_SLOT_ID)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black transition-all shadow-md shrink-0"
                  >
                    Restore Auto-Save
                  </button>
                )}
              </div>
            );
          })()}

          {/* Manual Save Slots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {[1, 2, 3].map(slotNum => {
              const slotId = `slot_${slotNum}`;
              const existing = savedSlotsList.find(s => s.slotId === slotId);

              return (
                <div key={slotNum} className="bg-zinc-950/90 p-4 rounded-xl border border-zinc-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-2 mb-2.5">
                      <span className="font-black text-xs text-zinc-200">Save Slot #{slotNum}</span>
                      {existing ? (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          v{existing.saveVersion || 20} Occupied
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                          Empty
                        </span>
                      )}
                    </div>

                    {existing ? (
                      <div className="space-y-1 text-left text-xs">
                        <div className="font-bold text-zinc-200 truncate">{existing.characterName} (Age {existing.age})</div>
                        <div className="text-[11px] text-zinc-400 font-mono flex items-center justify-between">
                          <span>NW: <strong className="text-amber-400">${existing.netWorth.toLocaleString()}</strong></span>
                          <span>Cash: <strong className="text-emerald-400">${existing.cash.toLocaleString()}</strong></span>
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate">{existing.careerTitle}</div>
                        <div className="text-[10px] text-zinc-600 font-mono pt-1 border-t border-zinc-900">
                          Saved: {existing.savedAt}
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-center text-xs text-zinc-500 italic">
                        Available slot for manual snapshot
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-zinc-850">
                    <button
                      onClick={() => handleSaveToSlot(slotNum)}
                      className="flex-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-bold border border-zinc-700 transition-colors"
                    >
                      Save
                    </button>
                    {existing ? (
                      <>
                        <button
                          onClick={() => handleLoadFromSlot(slotNum)}
                          className="flex-1 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black transition-colors"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(slotId)}
                          className="px-2 py-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 text-xs font-bold border border-zinc-800 transition-colors"
                          title="Delete slot"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <button
                        disabled
                        className="flex-1 py-1.5 rounded-lg bg-zinc-900 text-zinc-600 text-xs font-bold border border-zinc-800 cursor-not-allowed"
                      >
                        Load
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Persistence Scope & Systems Overview */}
          <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-zinc-800 text-[11px] space-y-1.5">
            <span className="font-bold text-zinc-300 block">💾 Unified Persistence Guarantee (Schema v{CURRENT_SAVE_VERSION}):</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] text-zinc-400 font-mono">
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-400" /> Pending Decisions</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-400" /> Delayed Consequences</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-400" /> Event Chains</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-400" /> Event Cooldowns</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-400" /> Power Profile & Scrutiny</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-400" /> Objectives & Campaigns</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-400" /> Dynasty & Timelines</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-400" /> Legacy Scorecards</span>
            </div>
          </div>

          {/* Export / Import File */}
          <div className="pt-2 border-t border-zinc-800 flex flex-wrap gap-2.5">
            <button
              onClick={handleExportJSON}
              className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-zinc-100 text-xs font-bold border border-zinc-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Export Save JSON (v{CURRENT_SAVE_VERSION})</span>
            </button>

            <label className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-zinc-100 text-xs font-bold border border-zinc-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-zinc-400" />
              <span>Import Any Save JSON</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
          </div>
        </div>
      )}

      {/* 3. SYSTEM INTEGRATION SUITE (PHASE 23) */}
      {subTab === 'tests' && (
        <div className="bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-800 space-y-4 shadow-xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> Deterministic Pipeline Verification
                </span>
                <h3 className="text-base sm:text-lg font-black text-zinc-100 mt-0.5">Phase 23 — Full System Integration Suite</h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  setIsTestRunning(true);
                  setTestReport(null);
                  try {
                    const res = await runAllIntegrationTests((testId) => setActiveTestRunning(testId));
                    setTestReport(res);
                  } finally {
                    setIsTestRunning(false);
                    setActiveTestRunning(null);
                  }
                }}
                disabled={isTestRunning}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition-all ${
                  isTestRunning
                    ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed border border-zinc-700'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40 hover:scale-[1.02]'
                }`}
              >
                {isTestRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Running {activeTestRunning || 'Tests'}...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Execute All 10 Tests</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  if (onOpenTestModal) onOpenTestModal();
                  else setShowTestModalInternal(true);
                }}
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 text-xs font-bold transition-colors"
              >
                Open Full Inspector
              </button>
            </div>
          </div>

          <p className="text-xs text-zinc-400">
            Executes complete end-to-end simulation pipelines across all 10 core subsystems: Business Crises, High Debt, Political Careers, Family Workload Trade-offs, Multi-Stage Narrative Arcs, Delayed Consequence Timers, Sovereign Power Scaling, Dynastic Legacy & Succession, AI Grounding, and Save/Load Persistence.
          </p>

          {/* Test Status Bar if Run */}
          {testReport && (
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{testReport.passedCount} / {testReport.totalTests} Passed</span>
                </div>
                {testReport.failedCount > 0 && (
                  <div className="flex items-center gap-1 text-rose-400 font-bold">
                    <XCircle className="w-4 h-4" />
                    <span>{testReport.failedCount} Failed</span>
                  </div>
                )}
                <span className="text-zinc-500 font-mono">({testReport.durationMs}ms)</span>
              </div>

              <div className="flex items-center gap-1 text-[11px]">
                {(['ALL', 'PASSED', 'FAILED'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setSelectedTestFilter(f)}
                    className={`px-2 py-0.5 rounded ${selectedTestFilter === f ? 'bg-zinc-800 text-amber-400 font-bold' : 'text-zinc-400'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 10 Test Cases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: 'TEST_A', label: 'TEST A — Business Crisis', desc: 'Diff detection, causal triggers, cost cuts & AI explanation.', runner: runTestA_BusinessCrisis, icon: TrendingDown },
              { id: 'TEST_B', label: 'TEST B — High Debt', desc: 'Interest service deduction, balance sheet leverage risk.', runner: runTestB_HighDebt, icon: Landmark },
              { id: 'TEST_C', label: 'TEST C — Political Career', desc: 'Campaign chain, approval tracking, civic news & influence.', runner: runTestC_PoliticalCareer, icon: Vote },
              { id: 'TEST_D', label: 'TEST D — Family Dynamics', desc: 'Workload strain, domestic dilemma, sabbatical recovery.', runner: runTestD_Family, icon: Heart },
              { id: 'TEST_E', label: 'TEST E — Event Chains', desc: 'Stages 1-3 progression, time intervals, save/load chain integrity.', runner: runTestE_EventChain, icon: GitFork },
              { id: 'TEST_F', label: 'TEST F — Delayed Consequence', desc: '6-month countdown, month 5 dormancy, month 6 execution.', runner: runTestF_DelayedConsequence, icon: Clock },
              { id: 'TEST_G', label: 'TEST G — Power Tiers', desc: 'Ultra-high empire net worth, Powerful/Global tier & scrutiny.', runner: runTestG_Power, icon: Crown },
              { id: 'TEST_H', label: 'TEST H — Dynasty & Succession', desc: 'Heir nomination, legacy scorecard, estate tax & chronicles.', runner: runTestH_Dynasty, icon: Layers },
              { id: 'TEST_I', label: 'TEST I — AI Advisor Grounding', desc: 'Multi-period diff citation, zero hallucination verification.', runner: runTestI_AiConsultation, icon: Sparkles },
              { id: 'TEST_J', label: 'TEST J — Save/Load Fidelity', desc: 'Preserves decisions, active chains, delayed timers & politics.', runner: runTestJ_SaveLoad, icon: Save },
            ].map(testItem => {
              const res = testReport?.results.find(r => r.testId === testItem.id);
              const isRunningThis = activeTestRunning === testItem.id;
              const Icon = testItem.icon;

              if (testReport && selectedTestFilter === 'PASSED' && (!res || !res.passed)) return null;
              if (testReport && selectedTestFilter === 'FAILED' && (!res || res.passed)) return null;

              return (
                <div
                  key={testItem.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                    res
                      ? res.passed
                        ? 'bg-emerald-950/15 border-emerald-500/30'
                        : 'bg-rose-950/20 border-rose-500/30'
                      : isRunningThis
                        ? 'bg-indigo-950/20 border-indigo-500/40 animate-pulse'
                        : 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-xs text-zinc-100">{testItem.label}</span>
                      </div>

                      {isRunningThis ? (
                        <span className="text-[10px] text-indigo-400 font-mono flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Testing...
                        </span>
                      ) : res ? (
                        res.passed ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> PASS ({res.durationMs}ms)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> FAIL
                          </span>
                        )
                      ) : null}
                    </div>

                    <p className="text-[11px] text-zinc-400 mb-3">{testItem.desc}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-[10px]">
                    <span className="text-zinc-500 font-mono">
                      {res ? `${res.assertions.filter(a => a.passed).length}/${res.assertions.length} Assertions` : 'Unexecuted'}
                    </span>

                    <button
                      onClick={async () => {
                        setIsTestRunning(true);
                        setActiveTestRunning(testItem.id);
                        try {
                          const singleRes = await testItem.runner();
                          setTestReport(prev => {
                            const existing = prev?.results.filter(r => r.testId !== testItem.id) || [];
                            const combined = [...existing, singleRes].sort((a, b) => a.testId.localeCompare(b.testId));
                            return {
                              timestamp: new Date().toISOString(),
                              totalTests: combined.length,
                              passedCount: combined.filter(r => r.passed).length,
                              failedCount: combined.filter(r => !r.passed).length,
                              durationMs: (prev?.durationMs || 0) + singleRes.durationMs,
                              allPassed: combined.every(r => r.passed),
                              results: combined
                            };
                          });
                        } finally {
                          setIsTestRunning(false);
                          setActiveTestRunning(null);
                        }
                      }}
                      disabled={isTestRunning}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold border border-zinc-700 transition-colors"
                    >
                      Run Test
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {showTestModalInternal && (
            <IntegrationTestModal
              isOpen={showTestModalInternal}
              onClose={() => setShowTestModalInternal(false)}
            />
          )}
        </div>
      )}

      {/* 3. ACHIEVEMENTS */}
      {subTab === 'achievements' && (
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Hall of Greatness</span>
              <h3 className="text-base font-black text-zinc-100 mt-0.5">Dominium Career Achievements</h3>
            </div>
            <span className="text-xs font-black text-amber-400">
              {state.achievements.filter(a => a.unlocked).length} / {state.achievements.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {state.achievements.map(ach => (
              <div 
                key={ach.id}
                className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                  ach.unlocked 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                    : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 opacity-60'
                }`}
              >
                <div className="text-2xl font-bold">{ach.icon === 'Crown' ? '👑' : ach.icon === 'Briefcase' ? '💼' : ach.icon === 'Building2' ? '🏢' : '🏆'}</div>
                <div>
                  <div className="font-bold text-xs text-zinc-100 flex items-center gap-1.5">
                    <span>{ach.title}</span>
                    {ach.unlocked && <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-bold border border-amber-500/30">DONE</span>}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. GAMEPLAY & RESET */}
      {subTab === 'gameplay' && (
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-4 shadow-xl">
          <div className="border-b border-zinc-800 pb-3">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Session Reset</span>
            <h3 className="text-base font-black text-zinc-100 mt-0.5">Restart Life Simulation</h3>
          </div>

          <p className="text-xs text-zinc-400">
            Reset current progress and return to the main character creation suite to embark upon a new destiny.
          </p>

          <button
            onClick={() => {
              if (confirm("Are you sure you want to reset current playthrough? All unsaved data will be cleared.")) {
                onResetGame();
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-rose-950 hover:text-rose-200 text-zinc-200 font-bold text-xs border border-zinc-700 hover:border-rose-700 shadow transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Reset Playthrough & Create New Character</span>
          </button>
        </div>
      )}
    </div>
  );
};
