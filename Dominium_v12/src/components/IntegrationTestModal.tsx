import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  Terminal, 
  Layers, 
  TrendingDown, 
  Landmark, 
  Vote, 
  Heart, 
  GitFork, 
  Clock, 
  Crown, 
  Sparkles, 
  Save, 
  ChevronRight, 
  ChevronDown, 
  X,
  AlertTriangle,
  Loader2,
  FileCheck,
  Award,
  Globe,
  Building2,
  Scale,
  Palette
} from 'lucide-react';
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
  runTestK_AuthoritativeMonthlyReportDataFlow,
  runTestL_LifeProgression,
  runTestM_LifeGameplay,
  runTestN_LivingWorldSimulation,
  runTestO_Expansion2FinancialAndCorporate,
  runTestP_Expansion2GovernmentAndLegal,
  runTestQ_IconSystemArchitecture,
  runTestR_MasterFunctionalityAudit,
  IntegrationTestResult, 
  FullIntegrationSuiteReport 
} from '../engine/integrationTestEngine';

interface IntegrationTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TEST_META: Record<string, { title: string; category: string; icon: any; color: string; desc: string }> = {
  TEST_A: {
    title: 'TEST A — BUSINESS CRISIS',
    category: 'Business',
    icon: TrendingDown,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    desc: 'Company creation, revenue decline, diff detection, causal event trigger, decision unlock, consequence mutation, and AI explanation.'
  },
  TEST_B: {
    title: 'TEST B — HIGH DEBT',
    category: 'Finance',
    icon: Landmark,
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    desc: 'Elevated debt liabilities, benchmark rate hikes, cash reduction, balance sheet leverage risk detection, and financial event triggers.'
  },
  TEST_C: {
    title: 'TEST C — POLITICAL CAREER',
    category: 'Politics',
    icon: Vote,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    desc: 'Public office accession, campaign chains, policy enactment, dynamic approval rating tracking, civic news, and political influence.'
  },
  TEST_D: {
    title: 'TEST D — FAMILY DYNAMICS',
    category: 'Family',
    icon: Heart,
    color: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
    desc: 'Career workload trade-offs, stress buildup, domestic relationship strain, dilemma trigger, and consequential relationship recovery.'
  },
  TEST_E: {
    title: 'TEST E — EVENT CHAINS',
    category: 'Narrative',
    icon: GitFork,
    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    desc: 'Multi-stage narrative arc execution, delay intervals, stage 2 and 3 progressions, choice histories, and mid-chain save/load.'
  },
  TEST_F: {
    title: 'TEST F — DELAYED CONSEQUENCES',
    category: 'Engine',
    icon: Clock,
    color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    desc: '6-month delayed effect timer, dormancy verification across month 5, and precise execution on the 6th month.'
  },
  TEST_G: {
    title: 'TEST G — POWER TIERS',
    category: 'Power',
    icon: Crown,
    color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    desc: 'Ultra-high wealth empire scaling, power tier ascension (Powerful/Global), sovereign perk activation, and regulatory scrutiny.'
  },
  TEST_H: {
    title: 'TEST H — DYNASTY & SUCCESSION',
    category: 'Dynasty',
    icon: Layers,
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    desc: 'Heir nomination, legacy scorecard report generation, estate inheritance distribution, and dynasty chronicles archiving.'
  },
  TEST_I: {
    title: 'TEST I — AI ADVISOR GROUNDING',
    category: 'AI',
    icon: Sparkles,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    desc: 'Zero-hallucination fact verification, multi-period quarterly diff citation, and actionable risk recommendations.'
  },
  TEST_J: {
    title: 'TEST J — SAVE & LOAD FIDELITY',
    category: 'System',
    icon: Save,
    color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
    desc: 'State serialization & deserialization preserving pending decisions, active chains, delayed timers, and political state.'
  },
  TEST_K: {
    title: 'TEST K — MONTHLY REPORT & DIFF',
    category: 'Monthly',
    icon: FileCheck,
    color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
    desc: 'Validates authoritative SimulationDiff & snapshot return from advanceOneMonth(), multi-period delta aggregation, and UI data flow integrity.'
  },
  TEST_L: {
    title: 'TEST L — LIFE PROGRESSION & TIERS',
    category: 'Progression',
    icon: Award,
    color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    desc: 'Multi-domain weighted scoring, tier promotions (Novice to Paragon), unlockable privileges, and lifecycle achievements.'
  },
  TEST_M: {
    title: 'TEST M — LIFE GAMEPLAY & PRESSURES',
    category: 'Gameplay',
    icon: Clock,
    color: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    desc: 'Dynamic responsibility derivation, time budget bottlenecks, burnout pressure, strategic archetypes, and emergent decisions.'
  },
  TEST_N: {
    title: 'TEST N — LIVING WORLD SIMULATION',
    category: 'World',
    icon: Globe,
    color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    desc: 'AI competitor turns, macroeconomic cycles, geopolitical crises, market shocks, and systemic causal ripple effects.'
  },
  TEST_O: {
    title: 'TEST O — EXPANSION 2: FINANCE & CORPORATE',
    category: 'Expansion2',
    icon: Building2,
    color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    desc: 'Cash-flow ledger, multi-tier banking (Checking/HYSA/CD), credit underwriting, and corporate M&A acquisition workflows.'
  },
  TEST_P: {
    title: 'TEST P — EXPANSION 2: SOVEREIGN & LEGAL',
    category: 'Expansion2',
    icon: Scale,
    color: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    desc: 'Professional licensing exams, litigation/court hearings with retained legal counsel, sovereign policy management, and strategic assets.'
  },
  TEST_Q: {
    title: 'TEST Q — ICON SYSTEM & TOKENS',
    category: 'DesignSystem',
    icon: Palette,
    color: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
    desc: 'Semantic registry resolution, domain category mappings (career, property, banking, credit, legal, risk, trends), and accessibility.'
  },
  TEST_R: {
    title: 'TEST R — MASTER FUNCTIONALITY & SYSTEM AUDIT',
    category: 'MasterAudit',
    icon: ShieldCheck,
    color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    desc: 'Exhaustive verification of end-to-end player journeys, interactive handlers, forms, simulation locks, save/load persistence, and state invariants.'
  }
};

export const IntegrationTestModal: React.FC<IntegrationTestModalProps> = ({ isOpen, onClose }) => {
  const [report, setReport] = useState<FullIntegrationSuiteReport | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentTestRunning, setCurrentTestRunning] = useState<string | null>(null);
  const [expandedTestId, setExpandedTestId] = useState<string | null>('TEST_A');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'PASSED' | 'FAILED'>('ALL');

  if (!isOpen) return null;

  const handleRunAll = async () => {
    setIsRunning(true);
    setReport(null);
    try {
      const result = await runAllIntegrationTests((testId) => {
        setCurrentTestRunning(testId);
      });
      setReport(result);
    } catch (err) {
      console.error('Integration test suite error:', err);
    } finally {
      setIsRunning(false);
      setCurrentTestRunning(null);
    }
  };

  const handleRunSingleTest = async (testId: string) => {
    setIsRunning(true);
    setCurrentTestRunning(testId);
    try {
      let res: IntegrationTestResult;
      switch (testId) {
        case 'TEST_A': res = await runTestA_BusinessCrisis(); break;
        case 'TEST_B': res = await runTestB_HighDebt(); break;
        case 'TEST_C': res = await runTestC_PoliticalCareer(); break;
        case 'TEST_D': res = await runTestD_Family(); break;
        case 'TEST_E': res = await runTestE_EventChain(); break;
        case 'TEST_F': res = await runTestF_DelayedConsequence(); break;
        case 'TEST_G': res = await runTestG_Power(); break;
        case 'TEST_H': res = await runTestH_Dynasty(); break;
        case 'TEST_I': res = await runTestI_AiConsultation(); break;
        case 'TEST_J': res = await runTestJ_SaveLoad(); break;
        case 'TEST_K': res = await runTestK_AuthoritativeMonthlyReportDataFlow(); break;
        case 'TEST_L': res = await runTestL_LifeProgression(); break;
        case 'TEST_M': res = await runTestM_LifeGameplay(); break;
        case 'TEST_N': res = await runTestN_LivingWorldSimulation(); break;
        case 'TEST_O': res = await runTestO_Expansion2FinancialAndCorporate(); break;
        case 'TEST_P': res = await runTestP_Expansion2GovernmentAndLegal(); break;
        case 'TEST_Q': res = await runTestQ_IconSystemArchitecture(); break;
        case 'TEST_R': res = await runTestR_MasterFunctionalityAudit(); break;
        default: return;
      }

      setReport(prev => {
        const existingResults = prev?.results.filter(r => r.testId !== testId) || [];
        const newResults = [...existingResults, res].sort((a, b) => a.testId.localeCompare(b.testId));
        const passedCount = newResults.filter(r => r.passed).length;
        return {
          timestamp: new Date().toISOString(),
          totalTests: newResults.length,
          passedCount,
          failedCount: newResults.length - passedCount,
          durationMs: (prev?.durationMs || 0) + res.durationMs,
          allPassed: newResults.every(r => r.passed),
          results: newResults
        };
      });
      setExpandedTestId(testId);
    } finally {
      setIsRunning(false);
      setCurrentTestRunning(null);
    }
  };

  const filterResults = report?.results.filter(r => {
    if (selectedFilter === 'PASSED') return r.passed;
    if (selectedFilter === 'FAILED') return !r.passed;
    return true;
  }) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">Full System Integration Test Suite</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Phase 23 Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Executes complete multi-system gameplay chains, snapshot diffs, causal triggers, and consequence verification.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunAll}
              disabled={isRunning}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-lg transition-all ${
                isRunning 
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Testing {currentTestRunning || 'Suite'}...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run All 11 Tests</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Suite Status Bar */}
        {report && (
          <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Total Run:</span>
                <span className="font-semibold text-white">{report.totalTests} / 11 Tests</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{report.passedCount} Passed</span>
              </div>
              {report.failedCount > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{report.failedCount} Failed</span>
                </div>
              )}
              <div className="text-slate-400">
                Duration: <span className="text-slate-200 font-mono">{report.durationMs}ms</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {(['ALL', 'PASSED', 'FAILED'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setSelectedFilter(f)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    selectedFilter === f 
                      ? 'bg-slate-700 text-white font-medium shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!report && !isRunning && (
            <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Integration Engine Ready</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
                Click <span className="text-emerald-400 font-medium">Run All 11 Tests</span> to execute full end-to-end simulation pipelines, consequence verifications, and AI grounding checks.
              </p>
              <button
                onClick={handleRunAll}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-950/40 inline-flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Test Suite
              </button>
            </div>
          )}

          {/* Test Cards List */}
          {Object.keys(TEST_META).map((testId) => {
            const meta = TEST_META[testId];
            const testResult = report?.results.find(r => r.testId === testId);
            const isCurrentlyRunning = currentTestRunning === testId;
            const isExpanded = expandedTestId === testId;
            const Icon = meta.icon;

            if (report && selectedFilter === 'PASSED' && (!testResult || !testResult.passed)) return null;
            if (report && selectedFilter === 'FAILED' && (!testResult || testResult.passed)) return null;

            return (
              <div
                key={testId}
                className={`border rounded-xl transition-all overflow-hidden ${
                  testResult 
                    ? testResult.passed 
                      ? 'border-emerald-500/30 bg-emerald-950/10' 
                      : 'border-rose-500/30 bg-rose-950/10'
                    : isCurrentlyRunning
                      ? 'border-indigo-500/40 bg-indigo-950/20'
                      : 'border-slate-800 bg-slate-950/30 hover:border-slate-700'
                }`}
              >
                {/* Card Header */}
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer select-none"
                  onClick={() => setExpandedTestId(isExpanded ? null : testId)}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2 rounded-lg border ${meta.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{meta.title}</span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {meta.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{meta.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isCurrentlyRunning && (
                      <span className="flex items-center gap-1.5 text-xs text-indigo-400 font-mono animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Running...
                      </span>
                    )}

                    {testResult && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-mono">{testResult.durationMs}ms</span>
                        {testResult.passed ? (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            PASS ({testResult.assertions.filter(a => a.passed).length}/{testResult.assertions.length})
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold">
                            <XCircle className="w-3.5 h-3.5" />
                            FAIL
                          </span>
                        )}
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRunSingleTest(testId);
                      }}
                      disabled={isRunning}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
                    >
                      Run
                    </button>

                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Card Details Body */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 space-y-3 bg-slate-950/40">
                    {testResult ? (
                      <>
                        {/* Summary */}
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                          <FileCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-white">Execution Summary: </span>
                            {testResult.summary}
                          </div>
                        </div>

                        {/* Assertions Table */}
                        <div className="space-y-1.5">
                          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Verified Assertions ({testResult.assertions.length})
                          </h4>
                          <div className="space-y-1">
                            {testResult.assertions.map((a, idx) => (
                              <div 
                                key={idx} 
                                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-4 ${
                                  a.passed 
                                    ? 'bg-slate-900/60 border-slate-800/80 text-slate-200' 
                                    : 'bg-rose-950/30 border-rose-800/50 text-rose-200'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {a.passed ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                  )}
                                  <span className="font-medium text-white">{a.label}</span>
                                </div>

                                <div className="text-right text-[11px] font-mono text-slate-400 truncate max-w-sm">
                                  <span className="text-emerald-400">{a.actual}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Trace Logs */}
                        {testResult.traceLogs && testResult.traceLogs.length > 0 && (
                          <div className="space-y-1">
                            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                              Causal Pipeline Trace Logs
                            </h4>
                            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 max-h-40 overflow-y-auto">
                              {testResult.traceLogs.map((log, lIdx) => (
                                <div key={lIdx} className="text-emerald-300/90">
                                  {log}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="py-4 text-center text-xs text-slate-500 font-mono">
                        Test not yet executed in current session. Click &quot;Run&quot; to test this specific gameplay chain.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Dominium Deterministic Simulation Core • Phase 23 Integration Testing</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
