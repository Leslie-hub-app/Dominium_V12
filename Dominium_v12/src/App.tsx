import React, { useState, useEffect, useRef } from 'react';
import { GameState, LifeEvent, NewsItem, RelationshipPerson, Consequence, SimulationDiff, SimulationSnapshot, MonthlySimulationResult } from './types';
import { 
  createInitialGameState, 
  advanceOneMonth, 
  calculateNetWorth,
  calculateSimulationDiff,
  createSimulationSnapshot,
  startEventChain,
  createComprehensiveCampaignChain,
  createPartyRecruitmentChain
} from './engine/simulationEngine';
import { 
  recordDecisionHistory, 
  recordConsequenceHistory, 
  recordDecisionWithConsequences 
} from './engine/historyEngine';
import { 
  applyConsequence, 
  applyConsequences, 
  ConsequenceEngine 
} from './engine/consequenceEngine';
import { calculateBorrowingCapacity } from './engine/balanceEngine';
import { ensureGovernmentLivingProfile, passGovernmentBill, allocateGovernmentBudget, launchPublicProject, awardProcurement, setTaxRate, conductDiplomacy, appointCivilServant } from './engine/governmentLivingEngine';
import { scheduleDelayedConsequence } from './engine/delayedConsequenceEngine';
import { advanceEventChain } from './engine/eventChainEngine';
import { resolveDecisionRiskOutcome } from './engine/riskEngine';
import { autoSaveGame, loadGameFromSlot } from './engine/saveEngine';
import { normalizeChild } from './engine/familyEngine';
import { Header } from './components/Header';
import { LifeEventFeed } from './components/LifeEventFeed';
import { BottomNav } from './components/BottomNav';
import { MonthAdvanceModal } from './components/MonthAdvanceModal';
import { StatusDetailModal } from './components/StatusDetailModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { DynastySuccessionModal } from './components/DynastySuccessionModal';
import { PlayerPowerProfileModal } from './components/PlayerPowerProfileModal';
import { LifeProgressionModal } from './components/LifeProgressionModal';
import { LegacyReportModal } from './components/LegacyReportModal';
import { IntegrationTestModal } from './components/IntegrationTestModal';
import { InstallMobileModal } from './components/modals/InstallMobileModal';
import { executeDynastySuccession, updateDynastySuccessionPlan, generateLegacyReport } from './engine/dynastyEngine';
import { DynastySuccessionPlan, CorporateBoardMeetingAgenda } from './types';
import { holdCorporateBoardMeeting, startCorporateBoardroom, presentCorporateExecutiveReport, submitCorporateDirectorDebate, proposeCorporateAmendment, applyCorporateShareholderPressure, callCorporateBoardVote, advanceCorporateBoardroomPhase } from './engine/corporateBoardMeetingEngine';

import { LifeHub } from './components/hubs/LifeHub';
import { FamilyHub } from './components/hubs/FamilyHub';
import { WealthHub } from './components/hubs/WealthHub';
import { BusinessEmpireHub } from './components/hubs/BusinessEmpireHub';
import { PoliticsHub } from './components/hubs/PoliticsHub';
import { EconomyHub } from './components/hubs/EconomyHub';
import { ProjectsHub } from './components/hubs/ProjectsHub';
import { SportsHub } from './components/hubs/SportsHub';
import { NewsHub } from './components/hubs/NewsHub';
import { SettingsHub } from './components/hubs/SettingsHub';
import { DecisionInbox } from './components/hubs/DecisionInbox';
import { ObjectivesHub } from './components/ObjectivesHub';
import { MoreHub } from './components/hubs/MoreHub';
import { WorldHub } from './components/hubs/WorldHub';
import { EmpireHub } from './components/hubs/EmpireHub';
import { LifeAndDynastyHub } from './components/hubs/LifeAndDynastyHub';
import { PrimaryTabType } from './components/navigation/GlobalSecondaryNav';
import { ResponsiveGameLayout } from './components/layout/ResponsiveGameLayout';
import { StatusBarPosition } from './components/layout/FloatingStatusBar';

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(() => {
    try {
      return loadGameFromSlot('autosave_main');
    } catch (err) {
      console.warn('Failed to load initial autosave:', err);
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<
    'feed' | 'inbox' | 'objectives' | 'life' | 'family' | 'wealth' | 'empire' | 'politics' | 'economy' | 'projects' | 'sports' | 'news' | 'settings' | 'more' | 'world'
  >('feed');

  // Sub-navigation state for each primary section
  const [feedSubTab, setFeedSubTab] = useState<string>('chronology');
  useEffect(() => {
    const handler = (e: Event) => { const next = (e as CustomEvent).detail as GameState | undefined; if (next) setGameState(next); };
    window.addEventListener('dominium-government-state-change', handler);
    return () => window.removeEventListener('dominium-government-state-change', handler);
  }, []);

  const [lifeSubTab, setLifeSubTab] = useState<string>('overview');
  const [familySubTab, setFamilySubTab] = useState<string>('household');
  const [wealthSubTab, setWealthSubTab] = useState<string>('overview');
  const [empireSubTab, setEmpireSubTab] = useState<string>('companies');
  const [worldSubTab, setWorldSubTab] = useState<string>('overview');
  const [moreSubTab, setMoreSubTab] = useState<string>('hub_overview');

  // Floatable Status Bar Position (persisted in localStorage)
  const [statusBarPosition, setStatusBarPosition] = useState<StatusBarPosition>(() => {
    try {
      const saved = localStorage.getItem('dominium_status_bar_pos');
      return (saved === 'left' || saved === 'right') ? saved : 'right';
    } catch {
      return 'right';
    }
  });

  const handleToggleStatusBarPosition = () => {
    setStatusBarPosition(prev => {
      const next = prev === 'left' ? 'right' : 'left';
      try {
        localStorage.setItem('dominium_status_bar_pos', next);
      } catch {}
      return next;
    });
  };

  // Derive Normalized Primary Tab
  const getPrimaryTab = (): PrimaryTabType => {
    if (activeTab === 'inbox' || activeTab === 'objectives') return 'feed';
    if (activeTab === 'politics' || activeTab === 'economy' || activeTab === 'news') return 'world';
    if (activeTab === 'projects' || activeTab === 'sports') return 'empire';
    if (activeTab === 'settings') return 'more';
    if (['feed', 'life', 'family', 'wealth', 'empire', 'world', 'more'].includes(activeTab)) {
      return activeTab as PrimaryTabType;
    }
    return 'feed';
  };

  const currentPrimaryTab = getPrimaryTab();

  const getCurrentSubTab = (): string => {
    switch (currentPrimaryTab) {
      case 'feed': {
        if (activeTab === 'inbox') return 'inbox';
        if (activeTab === 'objectives') return 'objectives';
        return feedSubTab;
      }
      case 'life': return lifeSubTab;
      case 'family': return familySubTab;
      case 'wealth': return wealthSubTab;
      case 'empire': {
        if (activeTab === 'projects') return 'projects';
        if (activeTab === 'sports') return 'sports';
        return empireSubTab;
      }
      case 'world': {
        if (activeTab === 'politics') return 'politics';
        if (activeTab === 'economy') return 'economy';
        if (activeTab === 'news') return 'news';
        return worldSubTab;
      }
      case 'more': {
        if (activeTab === 'settings') return 'settings';
        return moreSubTab;
      }
      default: return 'overview';
    }
  };

  const handleSelectSubTab = (subTabId: string) => {
    switch (currentPrimaryTab) {
      case 'feed':
        setFeedSubTab(subTabId);
        setActiveTab('feed');
        break;
      case 'life':
        setLifeSubTab(subTabId);
        setActiveTab('life');
        break;
      case 'family':
        setFamilySubTab(subTabId);
        setActiveTab('family');
        break;
      case 'wealth':
        setWealthSubTab(subTabId);
        setActiveTab('wealth');
        break;
      case 'empire':
        setEmpireSubTab(subTabId);
        setActiveTab('empire');
        break;
      case 'world':
        setWorldSubTab(subTabId);
        setActiveTab('world');
        break;
      case 'more':
        setMoreSubTab(subTabId);
        setActiveTab('more');
        break;
    }
  };

  // Unified destination router for modals and nested buttons
  const handleNavigateDestination = (destination: string) => {
    if (destination === 'inbox') {
      setActiveTab('feed');
      setFeedSubTab('inbox');
    } else if (destination === 'objectives') {
      setActiveTab('feed');
      setFeedSubTab('objectives');
    } else if (destination === 'world' || destination === 'world_intelligence') {
      setActiveTab('world');
      setWorldSubTab('overview');
    } else if (destination === 'competitors') {
      setActiveTab('world');
      setWorldSubTab('competitors');
    } else if (destination === 'history') {
      setActiveTab('world');
      setWorldSubTab('history');
    } else if (destination === 'politics') {
      setActiveTab('world');
      setWorldSubTab('politics');
    } else if (destination === 'economy') {
      setActiveTab('world');
      setWorldSubTab('economy');
    } else if (destination === 'news') {
      setActiveTab('world');
      setWorldSubTab('news');
    } else if (destination === 'projects') {
      setActiveTab('empire');
      setEmpireSubTab('projects');
    } else if (destination === 'sports') {
      setActiveTab('empire');
      setEmpireSubTab('sports');
    } else if (destination === 'companies') {
      setActiveTab('empire');
      setEmpireSubTab('companies');
    } else if (destination === 'settings') {
      setActiveTab('more');
      setMoreSubTab('settings');
    } else if (destination === 'power_profile') {
      setShowPowerProfileModal(true);
    } else if (destination === 'progression_profile') {
      setShowProgressionModal(true);
    } else if (destination === 'dynasty') {
      setActiveTab('family');
      setFamilySubTab('profile');
    } else if (['feed', 'life', 'family', 'wealth', 'empire', 'world', 'more'].includes(destination)) {
      setActiveTab(destination as any);
    }
  };

  const [monthReport, setMonthReport] = useState<{
    events: LifeEvent[];
    news: NewsItem[];
    diff: SimulationDiff;
    snapshotBefore: SimulationSnapshot;
    snapshotAfter: SimulationSnapshot;
  } | null>(null);
  const [activeStatusModal, setActiveStatusModal] = useState<string | null>(null);
  const [showSuccessionModal, setShowSuccessionModal] = useState<boolean>(false);
  const [showPowerProfileModal, setShowPowerProfileModal] = useState<boolean>(false);
  const [showProgressionModal, setShowProgressionModal] = useState<boolean>(false);
  const [showLegacyReportModal, setShowLegacyReportModal] = useState<boolean>(false);
  const [showIntegrationTestModal, setShowIntegrationTestModal] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [advanceStepSpeed, setAdvanceStepSpeed] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [playerActionNotice, setPlayerActionNotice] = useState<string | null>(null);
  const previousActionStateRef = useRef<GameState | null>(null);
  const previousActionSignatureRef = useRef<string | null>(null);

  // Global player-action acknowledgement: any same-tick state mutation is treated as a player interaction.
  // Simulation ticks are intentionally ignored so autonomous world activity never spams the player.
  useEffect(() => {
    if (!gameState) return;
    const signature = JSON.stringify({
      cash: gameState.finances?.cash, accounts: gameState.finances?.accounts?.map(a => [a.id, a.balance]),
      loans: gameState.finances?.loans?.map(l => [l.id, l.remainingBalance ?? l.principal]),
      properties: gameState.finances?.properties?.map(p => [p.id,p.currentValue,p.isRented,p.isPrimaryResidence]), companies: gameState.companies?.map(c => [c.id, c.cash, c.monthlyRevenue, c.playerOwnershipPercentage]),
      job: gameState.currentJob?.id, occupation: gameState.character?.occupation, possessions: gameState.lifeSystem?.marketplaceInventory?.filter(i => i.purchased).map(i => [i.id,i.condition,i.usageHours]),
      followers: gameState.character?.socialFollowers, relationships: gameState.relationships?.map(r => [r.id, r.trust, r.love, r.respect]),
      staff: gameState.personalManagement?.staff?.map(s => [s.id,s.active,s.role]), tax: gameState.taxSystem?.taxPaidYTD, justice: gameState.justiceWorld?.playerStatus,
      decisions: gameState.pendingDecisions?.map(d => d.id), career: gameState.expandedCareer?.activeInterview?.currentQuestionIndex
    });
    const previous = previousActionStateRef.current;
    if (previous && previous.simulationTick === gameState.simulationTick && previousActionSignatureRef.current !== signature) {
      let message = 'Action recorded in the living world.';
      if ((previous.finances?.cash ?? 0) !== (gameState.finances?.cash ?? 0)) message = 'Financial action recorded — your cash position has changed.';
      else if (previous.currentJob?.id !== gameState.currentJob?.id) message = 'Career action recorded — your employment status has changed.';
      else if ((previous.lifeSystem?.marketplaceInventory?.filter(i=>i.purchased).length ?? 0) !== (gameState.lifeSystem?.marketplaceInventory?.filter(i=>i.purchased).length ?? 0)) message = 'Purchase recorded — your possessions and lifestyle have changed.';
      else if ((previous.pendingDecisions?.length ?? 0) !== (gameState.pendingDecisions?.length ?? 0)) message = 'Decision recorded — the world is incorporating your choice.';
      else if ((previous.character?.socialFollowers ?? 0) !== (gameState.character?.socialFollowers ?? 0)) message = 'Social action recorded — your online standing is changing.';
      else if ((previous.personalManagement?.staff?.length ?? 0) !== (gameState.personalManagement?.staff?.length ?? 0)) message = 'Household management action recorded — your personal staff now affects your assets and time.';
      else if (previous.taxSystem?.taxPaidYTD !== gameState.taxSystem?.taxPaidYTD) message = 'Tax affairs updated — the living economy has recorded the transaction.';
      else if (previous.justiceWorld?.playerStatus !== gameState.justiceWorld?.playerStatus) message = 'Justice-system action recorded — your legal status now affects the living world.';
      setPlayerActionNotice(message);
      window.setTimeout(() => setPlayerActionNotice(null), 3000);
    }
    previousActionStateRef.current = gameState;
    previousActionSignatureRef.current = signature;
  }, [gameState]);

  // Auto-save on game state changes
  useEffect(() => {
    if (gameState) {
      autoSaveGame(gameState);
    }
  }, [gameState]);

  // Check death or dynastic succession trigger
  useEffect(() => {
    if (gameState && gameState.character.attributes.health <= 0 && !showSuccessionModal) {
      setShowSuccessionModal(true);
    }
  }, [gameState, showSuccessionModal]);

  if (!gameState) {
    return <WelcomeScreen onStartNewGame={(newGame) => setGameState(newGame)} />;
  }

  // ADVANCE MONTH LOGIC
  const handleAdvanceMonth = (monthsToAdvance: number = 1) => {
    if (isSimulating || !gameState) return;
    setIsSimulating(true);

    try {
      const initialState = gameState;
      const initialBeforeSnapshot = createSimulationSnapshot(initialState);
      let currentState = gameState;
      let accumulatedEvents: LifeEvent[] = [];
      let accumulatedNews: NewsItem[] = [];
      let lastResult: MonthlySimulationResult | null = null;

      for (let i = 0; i < monthsToAdvance; i++) {
        const result = advanceOneMonth(currentState);
        currentState = result.nextState;
        accumulatedEvents = [...accumulatedEvents, ...result.monthlyEvents];
        accumulatedNews = [...accumulatedNews, ...result.monthlyNews];
        lastResult = result;
      }

      if (!lastResult) return;

      setGameState(currentState);
      autoSaveGame(currentState);

      let periodDiff: SimulationDiff;
      let snapshotBefore: SimulationSnapshot;
      let snapshotAfter: SimulationSnapshot;

      if (monthsToAdvance === 1) {
        // Authoritative single-month diff calculated during advanceOneMonth
        periodDiff = lastResult.simulationDiff;
        snapshotBefore = lastResult.beforeSnapshot;
        snapshotAfter = lastResult.afterSnapshot;
      } else {
        // Multi-month advance: Aggregate period diff from initial state to final state across all advanced months
        periodDiff = calculateSimulationDiff(initialState, currentState, accumulatedEvents, accumulatedNews);
        snapshotBefore = initialBeforeSnapshot;
        snapshotAfter = lastResult.afterSnapshot;
        periodDiff.snapshotBefore = snapshotBefore;
        periodDiff.snapshotAfter = snapshotAfter;
      }

      setMonthReport({
        events: accumulatedEvents,
        news: accumulatedNews,
        diff: periodDiff,
        snapshotBefore,
        snapshotAfter
      });
    } catch (err) {
      console.error('Error during advance month simulation:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // DECISION HANDLING VIA CENTRALIZED CONSEQUENCE ENGINE (Phase 4) & RISK ENGINE
  const handleMakeDecision = (decisionId: string, choiceId: string) => {
    const decision = gameState.pendingDecisions.find(d => d.id === decisionId);
    if (!decision) return;

    const choice = decision.options.find(c => c.id === choiceId);
    if (!choice) return;

    const eventId = `ev-dec-${Date.now()}`;
    const importance = decision.urgency === 'Critical' ? 'Critical' : (choice.risk === 'High' ? 'Major' : 'Moderate');
    
    // Evaluate risk outcome using dynamic state attributes, liquidity, morale and power tier
    const riskResolution = resolveDecisionRiskOutcome(gameState, decision, choice);
    const isSuccess = riskResolution.isSuccess;

    // Collect concrete consequences for real game state
    let rawConsequences: Consequence[] = [];

    if (choice.consequences && choice.consequences.length > 0) {
      rawConsequences = choice.consequences.map(c => ({
        ...c,
        source: decision.title,
        decisionId: decision.id,
        eventId
      }));
    } else {
      if (choice.cost && choice.cost > 0) {
        rawConsequences.push(
          ConsequenceEngine.cash('SUBTRACT', choice.cost, {
            description: `Capital outlay for "${choice.label}"`,
            source: decision.title,
            decisionId: decision.id,
            eventId
          })
        );
      }

      // Add dynamic risk consequences computed by the Risk Engine
      if (riskResolution.consequences && riskResolution.consequences.length > 0) {
        rawConsequences.push(...riskResolution.consequences.map(c => ({
          ...c,
          source: decision.title,
          decisionId: decision.id,
          eventId
        })));
      } else if (choice.risk === 'High') {
        if (isSuccess) {
          rawConsequences.push(
            ConsequenceEngine.reputation('ADD', 8, {
              description: `High-risk venture succeeded: Industry reputation surged (+8)`,
              source: decision.title,
              decisionId: decision.id,
              eventId
            }),
            ConsequenceEngine.playerAttribute('happiness', 'ADD', 6, {
              description: `Personal triumph from bold strategic execution (+6)`,
              source: decision.title,
              decisionId: decision.id,
              eventId
            })
          );
        } else {
          rawConsequences.push(
            ConsequenceEngine.stress('ADD', 12, {
              description: `Setbacks during high-risk execution escalated stress (+12)`,
              source: decision.title,
              decisionId: decision.id,
              eventId
            }),
            ConsequenceEngine.playerAttribute('happiness', 'SUBTRACT', 8, {
              description: `Operational friction reduced happiness (-8)`,
              source: decision.title,
              decisionId: decision.id,
              eventId
            })
          );
        }
      } else {
        rawConsequences.push(
          ConsequenceEngine.reputation('ADD', 3, {
            description: `Prudent decision bolstered professional reputation (+3)`,
            source: decision.title,
            decisionId: decision.id,
            eventId
          }),
          ConsequenceEngine.stress('SUBTRACT', 3, {
            description: `Decisive execution provided clarity and reduced stress (-3)`,
            source: decision.title,
            decisionId: decision.id,
            eventId
          })
        );
      }
    }

    // Apply all consequences through the centralized ConsequenceEngine against REAL game state
    const { nextState: stateAfterConsequences, results: consequenceResults } = ConsequenceEngine.applyBatch(
      gameState,
      rawConsequences,
      true // Automatically records into persistent immutable consequence history
    );

    let updatedState = { ...stateAfterConsequences };

    // Format summary details from consequence results
    const consequenceDetails = consequenceResults.map(r => `${r.target} ${r.field}: ${r.change}`);
    const warningsList = consequenceResults.flatMap(r => r.warnings);

    // Record Life Event for feed
    updatedState.eventsFeed = [
      {
        id: eventId,
        timestampMonth: updatedState.currentMonth,
        timestampYear: updatedState.currentYear,
        age: updatedState.character.age,
        category: decision.category === 'Career' ? 'Career' : decision.category === 'Politics' ? 'Politics' : decision.category === 'Investment' ? 'Finance' : 'Business',
        title: decision.title,
        description: `Decision executed: "${choice.label}". ${choice.projectedOutcome}`,
        consequences: {
          details: [...consequenceDetails, ...(warningsList.length > 0 ? warningsList.map(w => `⚠️ ${w}`) : [])]
        }
      },
      ...updatedState.eventsFeed
    ];

    // Schedule any delayed consequences associated with choice (Phase 6)
    if (choice.delayedConsequences && choice.delayedConsequences.length > 0) {
      for (const del of choice.delayedConsequences) {
        const { nextState: stateWithDelayed } = scheduleDelayedConsequence(updatedState, {
          delayMonths: del.delayMonths,
          source: del.source || decision.title,
          description: del.description,
          consequences: del.consequences,
          conditions: del.conditions,
          decisionId: decision.id,
          eventId,
          customTargetDate: del.customTargetDate
        });
        updatedState = stateWithDelayed;
      }
    }

    // Record Decision History Entry (Phase 3)
    const affectedEntities = Array.from(new Set(consequenceResults.map(r => r.targetId || r.target).filter(Boolean))) as string[];
    const { nextState: finalStateWithDecHist } = recordDecisionHistory(updatedState, {
      category: decision.category,
      title: decision.title,
      description: `Selected option "${choice.label}": ${choice.description}. ${choice.projectedOutcome}`,
      decisionId: decision.id,
      optionId: choice.id,
      optionLabel: choice.label,
      risk: choice.risk,
      result: isSuccess ? 'Successfully executed' : 'Encountered execution headwinds',
      success: isSuccess,
      importance,
      immediateConsequences: {
        details: consequenceDetails
      },
      affectedEntities: affectedEntities.length > 0 ? affectedEntities : [updatedState.character.firstName, updatedState.character.lastName],
      relatedEventId: eventId
    });

    updatedState = finalStateWithDecHist;

    // Advance Multi-Stage Event Chain if applicable (Phase 8)
    const matchingChain = (updatedState.activeEventChains || []).find(c => decision.id.startsWith(`dec_chain_${c.id}_`));
    if (matchingChain) {
      const stageId = decision.id.replace(`dec_chain_${matchingChain.id}_`, '');
      const { nextState: stateWithAdvancedChain } = advanceEventChain(updatedState, matchingChain.id, stageId, choice.id);
      updatedState = stateWithAdvancedChain;
    }

    // Remove the resolved pending decision
    updatedState.pendingDecisions = updatedState.pendingDecisions.filter(d => d.id !== decisionId);
    setGameState(updatedState);
  };

  // CAREER & EDUCATION
  const handleApplyJob = (job: any) => {
    let updated = { ...gameState };
    const eventId = `ev-job-${Date.now()}`;
    const isExecutive = job.level === 'Executive' || job.level === 'Industry Leader';

    updated.currentJob = {
      id: `job-${Date.now()}`,
      title: job.title,
      field: job.field,
      level: job.level,
      companyName: job.companyName || 'Metropolitan Enterprises',
      companyId: job.companyId,
      monthlySalary: job.salaryMonthly,
      monthlyBonusPotential: Math.round(job.salaryMonthly * 0.15),
      stressLevel: job.stressLevel,
      workingHoursWeekly: job.workingHoursWeekly,
      reputationRequired: job.reputationRequired,
      intelligenceRequired: job.intelligenceRequired,
      educationRequired: job.educationRequired,
      startAge: updated.character.age,
      performance: 75
    };

    updated.eventsFeed.unshift({
      id: eventId,
      timestampMonth: updated.currentMonth,
      timestampYear: updated.currentYear,
      age: updated.character.age,
      category: 'Career',
      title: `Appointed as ${job.title}`,
      description: `Secured employment as ${job.title} in the ${job.field} sector with a starting compensation of $${job.salaryMonthly.toLocaleString()}/month.`,
      consequences: {
        reputationChange: +2
      }
    });

    // Record decision history
    const { nextState } = recordDecisionWithConsequences(
      updated,
      {
        category: 'Career',
        title: `Career Transition: ${job.title}`,
        description: `Accepted the role of ${job.title} in ${job.field} at ${job.companyName || 'Metropolitan Enterprises'}.`,
        importance: isExecutive ? 'Major' : 'Moderate',
        risk: 'Low',
        success: true,
        result: `Comp: $${job.salaryMonthly.toLocaleString()}/mo`,
        immediateConsequences: { cashChange: job.salaryMonthly },
        affectedEntities: [job.title, job.companyName || 'Metropolitan Enterprises'],
        relatedEventId: eventId
      },
      [
        {
          source: 'Career Appointment',
          category: 'Career',
          description: `Established base monthly income at $${job.salaryMonthly.toLocaleString()}/month.`,
          affectedEntity: job.title,
          valueBefore: gameState.currentJob?.monthlySalary || 0,
          valueAfter: job.salaryMonthly,
          change: `+$${job.salaryMonthly.toLocaleString()}/mo`,
          relatedEventId: eventId
        }
      ]
    );

    setGameState(nextState);
  };

  const handleEnrollEducation = (edu: any) => {
    let updated = { ...gameState };
    const eventId = `ev-edu-${Date.now()}`;

    updated.education.push({
      id: `edu-${Date.now()}`,
      institution: edu.institution,
      qualification: edu.qualification,
      field: edu.field,
      startAge: updated.character.age,
      durationMonths: edu.durationMonths,
      monthsCompleted: 0,
      tuitionPerMonth: edu.tuitionPerMonth,
      completed: false,
      gradeAverage: 85
    });

    updated.eventsFeed.unshift({
      id: eventId,
      timestampMonth: updated.currentMonth,
      timestampYear: updated.currentYear,
      age: updated.character.age,
      category: 'Life',
      title: `Enrolled in ${edu.qualification}`,
      description: `Commenced academic study for ${edu.qualification} in ${edu.field} at ${edu.institution}.`,
      consequences: {}
    });

    const { nextState } = recordDecisionHistory(updated, {
      category: 'Education',
      title: `Academic Enrollment: ${edu.qualification} in ${edu.field}`,
      description: `Committed to ${edu.durationMonths}-month academic degree curriculum at ${edu.institution} ($${edu.tuitionPerMonth.toLocaleString()}/mo tuition).`,
      importance: 'Major',
      risk: 'Low',
      success: true,
      affectedEntities: [edu.institution, edu.field],
      relatedEventId: eventId
    });

    setGameState(nextState);
  };

  const handlePerformActivity = (activity: any) => {
    if (gameState.finances.cash < activity.cost) return;

    let updated = { ...gameState };
    const eventId = `ev-act-${Date.now()}`;

    updated.finances.cash -= activity.cost;
    if (activity.health) updated.character.attributes.health = Math.min(100, updated.character.attributes.health + activity.health);
    if (activity.happiness) updated.character.attributes.happiness = Math.min(100, updated.character.attributes.happiness + activity.happiness);
    if (activity.intelligence) updated.character.attributes.intelligence = Math.min(100, updated.character.attributes.intelligence + activity.intelligence);
    if (activity.stress) updated.character.attributes.stress = Math.max(0, Math.min(100, updated.character.attributes.stress + activity.stress));
    if (activity.charm) updated.character.attributes.charm = Math.min(100, updated.character.attributes.charm + activity.charm);
    if (activity.attractiveness) updated.character.attributes.attractiveness = Math.min(100, updated.character.attributes.attractiveness + activity.attractiveness);

    updated.eventsFeed.unshift({
      id: eventId,
      timestampMonth: updated.currentMonth,
      timestampYear: updated.currentYear,
      age: updated.character.age,
      category: 'Life',
      title: activity.name,
      description: `Engaged in ${activity.name}. ${activity.desc}`,
      consequences: {
        cashChange: activity.cost > 0 ? -activity.cost : undefined
      }
    });

    // Record decision if major activity (high cost or health intervention)
    if (activity.cost >= 1000 || activity.health >= 5 || activity.desc?.toLowerCase().includes('wellness') || activity.name?.toLowerCase().includes('charity')) {
      const isHealth = activity.health && activity.health > 0;
      const isPhilanthropy = activity.name?.toLowerCase().includes('charity') || activity.name?.toLowerCase().includes('donation');
      const { nextState } = recordDecisionHistory(updated, {
        category: isPhilanthropy ? 'Philanthropy' : isHealth ? 'Health' : 'Life',
        title: activity.name,
        description: `${activity.desc} (Capital Outlay: $${activity.cost.toLocaleString()}).`,
        importance: activity.cost >= 5000 ? 'Major' : 'Moderate',
        risk: 'Low',
        success: true,
        immediateConsequences: {
          cashChange: -activity.cost,
          healthChange: activity.health,
          stressChange: activity.stress,
          happinessChange: activity.happiness
        },
        affectedEntities: [updated.character.firstName, updated.character.lastName],
        relatedEventId: eventId
      });
      updated = nextState;
    }

    setGameState(updated);
  };

  const handleTransferBank = (fromType: string, toType: string, amount: number) => {
    if (!gameState || amount <= 0) return;
    setGameState(prev => {
      if (!prev) return prev;
      const cash = prev.finances.cash;
      const accounts = prev.finances.accounts.map(a => ({ ...a }));
      const fromAcc = accounts.find(a => a.type === fromType);
      const toAcc = accounts.find(a => a.type === toType);

      let newCash = cash;
      if (fromType === 'Cash') {
        if (cash < amount || !toAcc) return prev;
        newCash -= amount;
        toAcc.balance += amount;
      } else if (toType === 'Cash') {
        if (!fromAcc || fromAcc.balance < amount) return prev;
        fromAcc.balance -= amount;
        newCash += amount;
      } else {
        if (!fromAcc || !toAcc || fromAcc.balance < amount) return prev;
        fromAcc.balance -= amount;
        toAcc.balance += amount;
      }

      return {
        ...prev,
        finances: {
          ...prev.finances,
          cash: newCash,
          accounts
        }
      };
    });
  };

  const handleAdjustTicketPrice = (teamId: string, newPrice: number) => {
    if (!gameState || newPrice < 0) return;
    setGameState(prev => {
      if (!prev) return prev;
      const ownedTeams = prev.sports.ownedTeams.map(team =>
        team.id === teamId ? { ...team, ticketPrice: newPrice } : team
      );
      return {
        ...prev,
        sports: {
          ...prev.sports,
          ownedTeams
        }
      };
    });
  };

  const handleAppointMinister = (ministryKey: string, candidateIdOrName: string) => {
    if (!gameState) return;
    setGameState(prev => {
      if (!prev) return prev;
      const eventId = `ev-minister-${Date.now()}`;
      const newEvent: LifeEvent = {
        id: eventId,
        timestampMonth: prev.currentMonth,
        timestampYear: prev.currentYear,
        age: prev.character.age,
        category: 'Politics',
        title: `Cabinet Appointment: Ministry of ${ministryKey}`,
        description: `Appointed ${candidateIdOrName} to lead the Ministry of ${ministryKey}.`,
        consequences: { worldInfluenceChange: +4, reputationChange: +2 }
      };

      const updated: GameState = {
        ...prev,
        politics: {
          ...prev.politics,
          currentOffice: {
            ...prev.politics.currentOffice,
            ministryAssigned: ministryKey as any
          }
        },
        eventsFeed: [newEvent, ...prev.eventsFeed]
      };

      const { nextState } = recordDecisionHistory(updated, {
        category: 'Politics',
        title: `Appointed Cabinet Minister: Ministry of ${ministryKey}`,
        description: `Installed ${candidateIdOrName} as head of the Ministry of ${ministryKey}.`,
        importance: 'Major',
        risk: 'Low',
        success: true,
        immediateConsequences: { worldInfluenceChange: 4, reputationChange: 2 },
        affectedEntities: [ministryKey, candidateIdOrName],
        relatedEventId: eventId
      });

      return nextState;
    });
  };

  const handleToggleGoal = (goalId: string) => {
    const updated = { ...gameState };
    const goal = updated.character.lifeGoals.find(g => g.id === goalId);
    if (goal) {
      goal.completed = !goal.completed;
      setGameState(updated);
    }
  };

  const handlePostSocialMedia = () => {
    const updated = { ...gameState };
    const newFollowers = Math.floor(Math.random() * 2500) + 500;
    updated.character.socialFollowers += newFollowers;
    updated.character.attributes.charm = Math.min(100, updated.character.attributes.charm + 1);
    updated.character.attributes.reputation = Math.min(100, updated.character.attributes.reputation + 1);

    updated.eventsFeed.unshift({
      id: `ev-soc-${Date.now()}`,
      timestampMonth: updated.currentMonth,
      timestampYear: updated.currentYear,
      age: updated.character.age,
      category: 'Life',
      title: 'Digital Thought Leadership Post',
      description: `Published strategic commentary on global industries. Gained +${newFollowers.toLocaleString()} active followers.`,
      consequences: {
        reputationChange: +1,
        charmChange: +1
      }
    });

    setGameState(updated);
  };

  // RELATIONSHIPS & FAMILY
  const handleInteractRelationship = (
    personId: string, 
    actionType: 'spend_time' | 'give_gift' | 'deep_talk' | 'set_heir' | 'fund_tutoring' | 'set_allowance' | 'appoint_executive' | 'family_vacation'
  ) => {
    let updated = { ...gameState };
    const person = updated.relationships.find(r => r.id === personId);
    if (!person && actionType !== 'family_vacation') return;

    if (person) {
      person.lastInteractedTick = updated.simulationTick;
    }

    if (actionType === 'spend_time' && person) {
      person.love = Math.min(100, person.love + 8);
      person.trust = Math.min(100, person.trust + 6);
      updated.character.attributes.happiness = Math.min(100, updated.character.attributes.happiness + 5);
      updated.character.attributes.stress = Math.max(0, updated.character.attributes.stress - 4);
    } else if (actionType === 'give_gift' && person) {
      if (updated.finances.cash < 500) return;
      updated.finances.cash -= 500;
      person.love = Math.min(100, person.love + 12);
      person.respect = Math.min(100, person.respect + 6);
    } else if (actionType === 'deep_talk' && person) {
      person.trust = Math.min(100, person.trust + 10);
      person.loyalty = Math.min(100, person.loyalty + 7);
      if (person.skills) {
        person.skills.intellect = Math.min(100, person.skills.intellect + 2);
        person.skills.discipline = Math.min(100, person.skills.discipline + 2);
      }
    } else if (actionType === 'fund_tutoring' && person) {
      if (updated.finances.cash < 3000) return;
      updated.finances.cash -= 3000;
      if (person.skills) {
        person.skills.intellect = Math.min(100, person.skills.intellect + 8);
        person.skills.creativity = Math.min(100, person.skills.creativity + 6);
        person.skills.discipline = Math.min(100, person.skills.discipline + 5);
      }
      person.respect = Math.min(100, person.respect + 10);
      person.loyalty = Math.min(100, person.loyalty + 8);

      const eventId = `ev-tutor-${Date.now()}`;
      const { nextState } = recordDecisionWithConsequences(
        updated,
        {
          category: 'Family',
          title: `Funded Elite Tutoring: ${person.name}`,
          description: `Allocated $3,000 to retain premier academic tutors and mentors for ${person.name}.`,
          importance: 'Moderate',
          risk: 'Low',
          success: true,
          result: `Academic coaching active for ${person.name}`,
          immediateConsequences: { cashChange: -3000 },
          affectedEntities: [person.name],
          relatedEventId: eventId
        },
        [
          {
            source: 'Academic Mentorship',
            category: 'Family',
            description: `Boosted intellectual and creative skill mastery for ${person.name}.`,
            affectedEntity: person.name,
            valueBefore: 'Standard Tutoring',
            valueAfter: 'Elite Coaching',
            change: '+Skills Accelerated',
            relatedEventId: eventId
          }
        ]
      );
      updated = nextState;
    } else if (actionType === 'set_allowance' && person) {
      person.monthlyAllowance = (person.monthlyAllowance || 0) + 1000;
      person.loyalty = Math.min(100, person.loyalty + 12);
      person.love = Math.min(100, person.love + 8);
    } else if (actionType === 'appoint_executive' && person) {
      const primaryCompany = updated.companies[0];
      if (!primaryCompany) return;

      person.career = `VP of Strategic Initiatives (${primaryCompany.name})`;
      person.occupation = `Vice President, ${primaryCompany.name}`;
      person.wealth = (person.wealth || 0) + 25000;
      person.loyalty = 100;
      person.respect = Math.min(100, person.respect + 25);
      if (person.skills) {
        person.skills.leadership = Math.min(100, person.skills.leadership + 15);
      }

      const eventId = `ev-exec-child-${Date.now()}`;
      const { nextState } = recordDecisionWithConsequences(
        updated,
        {
          category: 'Dynasty',
          title: `Appointed Family Executive: ${person.name}`,
          description: `Installed ${person.name} (${person.relation}) into executive leadership at ${primaryCompany.name} to train the next generational dynasty.`,
          importance: 'Major',
          risk: 'Moderate',
          success: true,
          result: `Installed as VP at ${primaryCompany.name}`,
          affectedEntities: [person.name, primaryCompany.name],
          relatedEventId: eventId
        },
        [
          {
            source: 'Corporate Dynastic Succession',
            category: 'Dynasty',
            description: `Brought ${person.name} into direct corporate operating structure.`,
            affectedEntity: primaryCompany.name,
            valueBefore: 'External Citizen',
            valueAfter: 'VP of Strategy',
            change: 'Appointed Executive',
            relatedEventId: eventId
          }
        ]
      );
      updated = nextState;
    } else if (actionType === 'family_vacation') {
      if (updated.finances.cash < 15000) return;
      updated.finances.cash -= 15000;
      updated.character.attributes.stress = Math.max(0, updated.character.attributes.stress - 20);
      updated.character.attributes.happiness = Math.min(100, updated.character.attributes.happiness + 20);

      for (const rel of updated.relationships) {
        rel.love = Math.min(100, rel.love + 18);
        rel.trust = Math.min(100, rel.trust + 14);
        rel.lastInteractedTick = updated.simulationTick;
      }

      const eventId = `ev-vacation-${Date.now()}`;
      const { nextState } = recordDecisionWithConsequences(
        updated,
        {
          category: 'Family',
          title: `Luxury Dynastic Family Retreat`,
          description: `Took the entire household on an exclusive private island retreat, completely resetting domestic friction and deepening relational bonds.`,
          importance: 'Major',
          risk: 'Low',
          success: true,
          result: `Harmony restored across all family lines`,
          immediateConsequences: { cashChange: -15000, happinessChange: 20, stressChange: -20 },
          affectedEntities: [`${updated.character.lastName} Household`],
          relatedEventId: eventId
        },
        [
          {
            source: 'Domestic Rejuvenation',
            category: 'Family',
            description: `Universal love and trust boosts across all immediate and extended family.`,
            affectedEntity: 'Household Harmony',
            valueBefore: 'Strained',
            valueAfter: 'Devoted & Harmonious',
            change: '+18 Love / +14 Trust',
            relatedEventId: eventId
          }
        ]
      );
      updated = nextState;
    } else if (actionType === 'set_heir' && person) {
      updated.dynastyHeirId = person.id;
      person.loyalty = Math.min(100, person.loyalty + 20);
      person.respect = Math.min(100, person.respect + 15);

      const eventId = `ev-heir-${Date.now()}`;
      const { nextState } = recordDecisionWithConsequences(
        updated,
        {
          category: 'Family',
          title: `Designated Dynastic Heir: ${person.name}`,
          description: `Formally named ${person.name} (${person.relation}) as the primary dynastic successor to the family estate and corporate enterprises.`,
          importance: 'Critical',
          risk: 'Moderate',
          success: true,
          result: `Dynastic Heir designated: ${person.name}`,
          affectedEntities: [person.name, `${updated.character.lastName} Dynasty`],
          relatedEventId: eventId
        },
        [
          {
            source: 'Succession Planning',
            category: 'Family',
            description: `Dynastic line secured under ${person.name}.`,
            affectedEntity: person.name,
            valueBefore: 'Unassigned',
            valueAfter: 'Primary Heir',
            change: 'Named Heir',
            relatedEventId: eventId
          }
        ]
      );
      updated = nextState;
    }

    setGameState(updated);
  };

  const handleFindDate = () => {
    const updated = { ...gameState };
    const names = ['Sophia Sterling', 'Claire Beaumont', 'Isabella Hayes', 'Victoria Montgomery', 'Audrey Vance'];
    const randomName = names[Math.floor(Math.random() * names.length)];

    const newPartner: RelationshipPerson = {
      id: `partner-${Date.now()}`,
      name: randomName,
      relation: 'Partner',
      age: updated.character.age + (Math.floor(Math.random() * 5) - 2),
      gender: updated.character.gender === 'Male' ? 'Female' : 'Male',
      wealth: 45000,
      trust: 60,
      love: 65,
      respect: 60,
      loyalty: 70,
      influence: 40,
      occupation: 'Architect & Investor',
      alive: true,
      avatarSeed: `partner_${Date.now()}`
    };

    updated.relationships.push(newPartner);
    updated.eventsFeed.unshift({
      id: `ev-rom-${Date.now()}`,
      timestampMonth: updated.currentMonth,
      timestampYear: updated.currentYear,
      age: updated.character.age,
      category: 'Relationships',
      title: `Began Dating ${randomName}`,
      description: `Met ${randomName} at a private cultural gallery event. Mutual attraction and connection spark a relationship.`,
      consequences: {
        happinessChange: +10
      }
    });

    setGameState(updated);
  };

  const handleProposeMarriage = (personId: string) => {
    let updated = { ...gameState };
    const person = updated.relationships.find(r => r.id === personId);
    if (!person) return;

    person.relation = 'Spouse';
    person.love = 95;
    person.trust = 90;
    person.loyalty = 95;
    updated.character.attributes.happiness = 95;

    const eventId = `ev-marry-${Date.now()}`;
    updated.eventsFeed.unshift({
      id: eventId,
      timestampMonth: updated.currentMonth,
      timestampYear: updated.currentYear,
      age: updated.character.age,
      category: 'Family',
      title: `Celebrated Marriage with ${person.name}`,
      description: `Held a formal wedding ceremony in ${updated.character.residenceCity}. Your marital bond is sealed.`,
      consequences: {
        happinessChange: +25
      }
    });

    // Record decision history
    const { nextState } = recordDecisionWithConsequences(
      updated,
      {
        category: 'Family',
        title: `Marriage to ${person.name}`,
        description: `United families in marriage with ${person.name} in ${updated.character.residenceCity}.`,
        importance: 'Historic',
        risk: 'Low',
        success: true,
        result: `Married ${person.name}`,
        immediateConsequences: { happinessChange: 25 },
        affectedEntities: [person.name, `${updated.character.lastName} Family`],
        relatedEventId: eventId
      },
      [
        {
          source: 'Matrimonial Union',
          category: 'Family',
          description: `Established marital partnership and dynastic family alliance.`,
          affectedEntity: person.name,
          valueBefore: 'Partner',
          valueAfter: 'Spouse',
          change: '+Spouse Status',
          relatedEventId: eventId
        }
      ]
    );

    setGameState(nextState);
  };

  const handleHaveChild = () => {
    let updated = { ...gameState };
    const isSon = Math.random() > 0.5;
    const boyNames = ['Alexander', 'Julian', 'Sebastian', 'Oliver', 'Arthur'];
    const girlNames = ['Eleanor', 'Genevieve', 'Charlotte', 'Beatrice', 'Aurelia'];
    const childName = isSon ? boyNames[Math.floor(Math.random() * boyNames.length)] : girlNames[Math.floor(Math.random() * girlNames.length)];

    const newChild: RelationshipPerson = normalizeChild({
      id: `child-${Date.now()}`,
      name: `${childName} ${updated.character.lastName}`,
      relation: isSon ? 'Son' : 'Daughter',
      age: 0,
      gender: isSon ? 'Male' : 'Female',
      wealth: 0,
      trust: 100,
      love: 100,
      respect: 80,
      loyalty: 100,
      influence: 10,
      occupation: 'Infant / Child',
      alive: true,
      avatarSeed: `child_${Date.now()}`
    }, updated.simulationTick);

    updated.relationships.push(newChild);
    if (!updated.dynastyHeirId) {
      updated.dynastyHeirId = newChild.id;
    }

    const eventId = `ev-child-${Date.now()}`;
    updated.eventsFeed.unshift({
      id: eventId,
      timestampMonth: updated.currentMonth,
      timestampYear: updated.currentYear,
      age: updated.character.age,
      category: 'Family',
      title: `Birth of ${newChild.name}`,
      description: `Welcomed your newborn child, ${newChild.name}, into the dynastic house.`,
      consequences: {
        happinessChange: +30
      }
    });

    // Record decision history
    const { nextState } = recordDecisionWithConsequences(
      updated,
      {
        category: 'Family',
        title: `Birth of Dynastic Child: ${newChild.name}`,
        description: `Welcomed ${newChild.name} (${newChild.relation}) to carry forward the ${updated.character.lastName} family lineage.`,
        importance: 'Historic',
        risk: 'Low',
        success: true,
        result: `Born: ${newChild.name}`,
        immediateConsequences: { happinessChange: 30 },
        affectedEntities: [newChild.name, `${updated.character.lastName} Dynasty`],
        relatedEventId: eventId
      },
      [
        {
          source: 'Childbirth / Family Expansion',
          category: 'Family',
          description: `Dynastic succession line expanded with next generation.`,
          affectedEntity: newChild.name,
          valueBefore: 0,
          valueAfter: 1,
          change: `+1 Dynastic Heir`,
          relatedEventId: eventId
        }
      ]
    );

    setGameState(nextState);
  };

  // WEALTH & TRADING
  const handleTradeStock = (symbol: string, action: 'BUY' | 'SELL', shares: number) => {
    let updated = { ...gameState };
    const stock = updated.finances.stocks.find(s => s.symbol === symbol);
    if (!stock) return;

    const totalCost = stock.currentPrice * shares;
    const eventId = `ev-stock-${Date.now()}`;

    if (action === 'BUY') {
      if (updated.finances.cash < totalCost) return;
      updated.finances.cash -= totalCost;
      stock.sharesOwned += shares;
      updated.eventsFeed.unshift({
        id: eventId,
        timestampMonth: updated.currentMonth,
        timestampYear: updated.currentYear,
        age: updated.character.age,
        category: 'Finance',
        title: `Purchased ${shares} shares of ${stock.symbol}`,
        description: `Executed equity buy order for ${shares} shares at $${stock.currentPrice.toFixed(2)}/share (Total: $${totalCost.toLocaleString()}).`,
        consequences: { cashChange: -totalCost }
      });
    } else if (action === 'SELL') {
      if (stock.sharesOwned < shares) return;
      stock.sharesOwned -= shares;
      updated.finances.cash += totalCost;
      updated.eventsFeed.unshift({
        id: eventId,
        timestampMonth: updated.currentMonth,
        timestampYear: updated.currentYear,
        age: updated.character.age,
        category: 'Finance',
        title: `Sold ${shares} shares of ${stock.symbol}`,
        description: `Liquidated ${shares} shares at $${stock.currentPrice.toFixed(2)}/share (Proceeds: $${totalCost.toLocaleString()}).`,
        consequences: { cashChange: totalCost }
      });
    }

    // Record decision if trade >= $10,000
    if (totalCost >= 10000) {
      const { nextState } = recordDecisionWithConsequences(
        updated,
        {
          category: 'Investment',
          title: `Major Equity Trade: ${action} ${shares.toLocaleString()} ${stock.symbol}`,
          description: `${action === 'BUY' ? 'Invested' : 'Liquidated'} $${totalCost.toLocaleString()} in ${stock.name} (${stock.symbol}) at $${stock.currentPrice.toFixed(2)}/sh.`,
          importance: totalCost >= 100000 ? 'Major' : 'Moderate',
          risk: stock.volatility > 0.35 ? 'High' : 'Moderate',
          success: true,
          result: `Executed ${action} for $${totalCost.toLocaleString()}`,
          immediateConsequences: { cashChange: action === 'BUY' ? -totalCost : totalCost },
          affectedEntities: [stock.name, stock.symbol],
          relatedEventId: eventId
        },
        [
          {
            source: 'Equity Trading Desk',
            category: 'Investment',
            description: `Rebalanced liquid securities portfolio in ${stock.symbol}.`,
            affectedEntity: stock.symbol,
            valueBefore: action === 'BUY' ? stock.sharesOwned - shares : stock.sharesOwned + shares,
            valueAfter: stock.sharesOwned,
            change: `${action === 'BUY' ? '+' : '-'}${shares} shares`,
            relatedEventId: eventId
          }
        ]
      );
      updated = nextState;
    }

    setGameState(updated);
  };

  const handleBuyProperty = (propTemplate: any, withMortgage: boolean) => {
    let updated = { ...gameState };
    const cost = withMortgage ? propTemplate.purchasePrice * 0.2 : propTemplate.purchasePrice;
    if (updated.finances.cash < cost) return;

    const eventId = `ev-prop-${Date.now()}`;
    updated.finances.cash -= cost;
    updated.finances.properties.push({
      id: `prop-${Date.now()}`,
      name: propTemplate.name,
      type: propTemplate.type,
      city: propTemplate.city,
      country: propTemplate.country,
      purchasePrice: propTemplate.purchasePrice,
      currentValue: propTemplate.purchasePrice,
      monthlyRent: propTemplate.monthlyRent,
      monthlyMaintenance: propTemplate.monthlyMaintenance,
      isRented: true,
      tenantQuality: 80,
      condition: 90,
      mortgage: withMortgage ? {
        id: `mortgage-${Date.now()}`,
        title: `Mortgage on ${propTemplate.name}`,
        principal: propTemplate.purchasePrice * 0.8,
        remainingBalance: propTemplate.purchasePrice * 0.8,
        interestRateAnnual: 6.5,
        monthlyPayment: Math.round((propTemplate.purchasePrice * 0.8 * 0.065) / 12),
        termMonthsRemaining: 360
      } : undefined
    });

    if (withMortgage) {
      updated.finances.loans.push({
        id: `mortgage-${Date.now()}`,
        title: `Mortgage on ${propTemplate.name}`,
        principal: propTemplate.purchasePrice * 0.8,
        remainingBalance: propTemplate.purchasePrice * 0.8,
        interestRateAnnual: 6.5,
        monthlyPayment: Math.round((propTemplate.purchasePrice * 0.8 * 0.065) / 12),
        termMonthsRemaining: 360
      });
    }

    updated.eventsFeed.unshift({
      id: eventId,
      timestampMonth: updated.currentMonth,
      timestampYear: updated.currentYear,
      age: updated.character.age,
      category: 'Finance',
      title: `Acquired Real Estate: ${propTemplate.name}`,
      description: `Purchased property in ${propTemplate.city}, ${propTemplate.country} for $${propTemplate.purchasePrice.toLocaleString()}${withMortgage ? ' with 20% down payment mortgage' : ' with full cash'}.`,
      consequences: { cashChange: -cost }
    });

    // Record decision history
    const { nextState } = recordDecisionWithConsequences(
      updated,
      {
        category: 'Real Estate',
        title: `Real Estate Acquisition: ${propTemplate.name}`,
        description: `Acquired ${propTemplate.type} in ${propTemplate.city}, ${propTemplate.country} for $${propTemplate.purchasePrice.toLocaleString()} (${withMortgage ? 'Mortgage Financed' : 'All-Cash'}). Expected Net Yield: +$${(propTemplate.monthlyRent - propTemplate.monthlyMaintenance).toLocaleString()}/mo.`,
        importance: propTemplate.purchasePrice >= 1000000 ? 'Major' : 'Moderate',
        risk: withMortgage ? 'Moderate' : 'Low',
        success: true,
        result: `Added $${propTemplate.purchasePrice.toLocaleString()} property asset`,
        immediateConsequences: { cashChange: -cost },
        affectedEntities: [propTemplate.name, `${propTemplate.city}, ${propTemplate.country}`],
        relatedEventId: eventId
      },
      [
        {
          source: 'Real Estate Acquisition',
          category: 'Real Estate',
          description: `Expanded physical asset base with ${propTemplate.name}.`,
          affectedEntity: propTemplate.name,
          valueBefore: 0,
          valueAfter: propTemplate.purchasePrice,
          change: `+$${propTemplate.purchasePrice.toLocaleString()} Asset Value`,
          relatedEventId: eventId
        }
      ]
    );

    setGameState(nextState);
  };

  const handleManageProperty = (propId: string, action: 'RENT' | 'EVICT' | 'RENOVATE' | 'SELL') => {
    let updated = { ...gameState };
    const prop = updated.finances.properties.find(p => p.id === propId);
    if (!prop) return;

    if (action === 'RENT') {
      prop.isRented = true;
    } else if (action === 'EVICT') {
      prop.isRented = false;
    } else if (action === 'RENOVATE') {
      if (updated.finances.cash < 5000) return;
      updated.finances.cash -= 5000;
      prop.currentValue = Math.round(prop.currentValue * 1.08);
      prop.monthlyRent = Math.round(prop.monthlyRent * 1.1);
      prop.tenantQuality = Math.min(100, prop.tenantQuality + 15);
    } else if (action === 'SELL') {
      const saleProceeds = prop.currentValue;
      const eventId = `ev-propsell-${Date.now()}`;
      updated.finances.cash += saleProceeds;
      updated.finances.properties = updated.finances.properties.filter(p => p.id !== propId);

      // Record real estate liquidation
      const { nextState } = recordDecisionWithConsequences(
        updated,
        {
          category: 'Real Estate',
          title: `Sold Property: ${prop.name}`,
          description: `Liquidated real estate asset ${prop.name} for $${saleProceeds.toLocaleString()} in net proceeds.`,
          importance: 'Major',
          risk: 'Low',
          success: true,
          result: `Proceeds: +$${saleProceeds.toLocaleString()}`,
          immediateConsequences: { cashChange: saleProceeds },
          affectedEntities: [prop.name],
          relatedEventId: eventId
        },
        [
          {
            source: 'Property Liquidation',
            category: 'Real Estate',
            description: `Transferred real estate asset into liquid cash reserves.`,
            affectedEntity: prop.name,
            valueBefore: prop.currentValue,
            valueAfter: 0,
            change: `+$${saleProceeds.toLocaleString()} Cash`,
            relatedEventId: eventId
          }
        ]
      );
      updated = nextState;
    }

    setGameState(updated);
  };

  const handleTakeLoan = (amount: number, termMonths: number) => {
    let updated = { ...gameState };
    const underwriting = calculateBorrowingCapacity(gameState, amount);

    // Reject loan if underwriting covenants are violated
    if (!underwriting.isApproved) {
      const rejectEventId = `ev-loan-rej-${Date.now()}`;
      updated.eventsFeed.unshift({
        id: rejectEventId,
        timestampMonth: updated.currentMonth,
        timestampYear: updated.currentYear,
        age: updated.character.age,
        category: 'Finance',
        title: `Loan Application Rejected ❌`,
        description: `Institutional credit syndicate declined loan request of $${amount.toLocaleString()}. Reason: ${underwriting.rejectionReason || 'Underwriting limits exceeded.'}`,
        consequences: {
          details: [`Borrowing capacity available: $${underwriting.remainingBorrowingCapacity.toLocaleString()}`]
        }
      });
      setGameState(updated);
      return;
    }

    const apr = underwriting.estimatedApr;
    const monthlyPmt = Math.round((amount * (1 + (apr / 100))) / termMonths);
    const eventId = `ev-loan-${Date.now()}`;

    updated.finances.cash += amount;
    updated.finances.loans.push({
      id: `loan-${Date.now()}`,
      title: `Commercial Bank Credit Line (${underwriting.creditTier})`,
      principal: amount,
      remainingBalance: amount,
      interestRateAnnual: apr,
      monthlyPayment: monthlyPmt,
      termMonthsRemaining: termMonths
    });

    updated.eventsFeed.unshift({
      id: eventId,
      timestampMonth: updated.currentMonth,
      timestampYear: updated.currentYear,
      age: updated.character.age,
      category: 'Finance',
      title: `Secured $${amount.toLocaleString()} Debt Facility`,
      description: `Borrowed $${amount.toLocaleString()} from credit syndicate at ${apr}% APR (${termMonths} month term, $${monthlyPmt.toLocaleString()}/mo). Underwriting rating: ${underwriting.creditTier}.`,
      consequences: { cashChange: amount }
    });

    // Record decision history for major debt
    const { nextState } = recordDecisionWithConsequences(
      updated,
      {
        category: 'Debt',
        title: `Secured Debt Facility: $${amount.toLocaleString()}`,
        description: `Assumed commercial debt obligation of $${amount.toLocaleString()} at ${apr}% interest rate with monthly debt service of $${monthlyPmt.toLocaleString()}.`,
        importance: amount >= 100000 ? 'Major' : 'Moderate',
        risk: amount >= 500000 ? 'High' : 'Moderate',
        success: true,
        result: `Funded +$${amount.toLocaleString()} Cash`,
        immediateConsequences: { cashChange: amount },
        affectedEntities: ['Commercial Bank Syndicate', updated.character.lastName],
        relatedEventId: eventId
      },
      [
        {
          source: 'Debt Facility Execution',
          category: 'Debt',
          description: `Increased liquid borrowing leverage and liabilities.`,
          affectedEntity: 'Personal Liabilities',
          valueBefore: gameState.finances.loans.reduce((acc, l) => acc + l.remainingBalance, 0),
          valueAfter: updated.finances.loans.reduce((acc, l) => acc + l.remainingBalance, 0) + amount,
          change: `+$${amount.toLocaleString()} Debt`,
          relatedEventId: eventId
        }
      ]
    );

    setGameState(nextState);
  };

  const handleRepayLoan = (loanId: string) => {
    let updated = { ...gameState };
    const loan = updated.finances.loans.find(l => l.id === loanId);
    if (!loan || updated.finances.cash < loan.remainingBalance) return;

    const repaidAmount = loan.remainingBalance;
    const eventId = `ev-repay-${Date.now()}`;
    updated.finances.cash -= repaidAmount;
    updated.finances.loans = updated.finances.loans.filter(l => l.id !== loanId);

    const { nextState } = recordDecisionHistory(updated, {
      category: 'Debt',
      title: `Fully Repaid Loan: ${loan.title}`,
      description: `Discharged debt obligation of $${repaidAmount.toLocaleString()} in full, eradicating recurring interest expense.`,
      importance: repaidAmount >= 100000 ? 'Major' : 'Moderate',
      risk: 'Low',
      success: true,
      immediateConsequences: { cashChange: -repaidAmount },
      affectedEntities: [loan.title],
      relatedEventId: eventId
    });

    setGameState(nextState);
  };

  // BUSINESS EMPIRE
  const handleCreateCompany = (companyData: any) => {
    if (gameState.finances.cash < companyData.initialCapital) return;

    let updated = { ...gameState };
    const eventId = `ev-comp-${Date.now()}`;
    updated.finances.cash -= companyData.initialCapital;

    const newCompany = {
      id: `comp-${Date.now()}`,
      name: companyData.name,
      industry: companyData.industry,
      country: updated.character.residenceCountry,
      city: updated.character.residenceCity,
      valuation: companyData.initialCapital * 2,
      sharePrice: 20,
      totalShares: (companyData.initialCapital * 2) / 20,
      playerOwnershipPercentage: 100,
      isPublic: false,
      monthlyRevenue: Math.round(companyData.initialCapital * 0.12),
      monthlyExpenses: Math.round(companyData.initialCapital * 0.08),
      monthlyNetProfit: Math.round(companyData.initialCapital * 0.04),
      cashReserve: companyData.initialCapital,
      employeesCount: 6,
      averageEmployeeSalary: 4500,
      employeeMorale: 85,
      employeeProductivity: 80,
      marketShare: 0.5,
      brandReputation: 50,
      productQuality: 60,
      pricingStrategy: companyData.pricingStrategy,
      supplierType: companyData.supplierType,
      supplierCostFactor: 1.0,
      marketingBudgetMonthly: 3000,
      rdBudgetMonthly: 2000,
      capacityMonthlyUnits: 500,
      inventoryUnits: 200,
      unitCost: 15,
      unitPrice: 35,
      dividendPayoutRatio: 0,
      historicalRevenue: [Math.round(companyData.initialCapital * 0.12)],
      historicalProfit: [Math.round(companyData.initialCapital * 0.04)],
      executives: [
        {
          id: `exec-1`,
          name: `${updated.character.firstName} ${updated.character.lastName}`,
          role: 'CEO' as any,
          salaryMonthly: 8000,
          competence: 80,
          loyalty: 100,
          ambition: 90,
          personality: 'Tech Visionary' as any,
          aiOpinion: 'We must scale distribution channels while maintaining lean operating margins.'
        }
      ],
      boardMembers: [
        {
          id: `bm-1`,
          name: `${updated.character.firstName} ${updated.character.lastName}`,
          sharesPercentage: 100,
          agenda: 'R&D Innovation' as any,
          personality: 'Founder Ally',
          supportLevel: 100
        }
      ]
    };

    updated.companies.push(newCompany);
    updated.eventsFeed.unshift({
      id: eventId,
      timestampMonth: updated.currentMonth,
      timestampYear: updated.currentYear,
      age: updated.character.age,
      category: 'Business',
      title: `Founded ${companyData.name}`,
      description: `Incorporate enterprise in the ${companyData.industry} sector with $${companyData.initialCapital.toLocaleString()} founder capital.`,
      consequences: { cashChange: -companyData.initialCapital, reputationChange: +5 }
    });

    // Record decision history (Acquiring/Forming Company)
    const { nextState } = recordDecisionWithConsequences(
      updated,
      {
        category: 'Business',
        title: `Incorporated Company: ${companyData.name}`,
        description: `Established enterprise in the ${companyData.industry} industry with $${companyData.initialCapital.toLocaleString()} seed capitalization. 100% founder ownership.`,
        importance: companyData.initialCapital >= 100000 ? 'Historic' : 'Major',
        risk: 'High',
        success: true,
        result: `Founded ${companyData.name} (Valuation: $${(companyData.initialCapital * 2).toLocaleString()})`,
        immediateConsequences: { cashChange: -companyData.initialCapital, reputationChange: 5 },
        affectedEntities: [companyData.name, companyData.industry],
        relatedEventId: eventId
      },
      [
        {
          source: 'Company Formation',
          category: 'Business',
          description: `Created new corporate asset and operating platform in ${companyData.industry}.`,
          affectedEntity: companyData.name,
          valueBefore: 0,
          valueAfter: companyData.initialCapital * 2,
          change: `+$${(companyData.initialCapital * 2).toLocaleString()} Initial Valuation`,
          relatedEventId: eventId
        }
      ]
    );

    setGameState(nextState);
  };

  const handleUpdateCompanyStrategy = (companyId: string, updates: any) => {
    const updated = { ...gameState };
    const comp = updated.companies.find(c => c.id === companyId);
    if (!comp) return;
    Object.assign(comp, updates);
    setGameState(updated);
  };

  const handleHireExecutive = (companyId: string, role: any, candidateName: string, salary: number) => {
    const updated = { ...gameState };
    const comp = updated.companies.find(c => c.id === companyId);
    if (!comp) return;

    comp.executives.push({
      id: `exec-${Date.now()}`,
      name: candidateName,
      role,
      salaryMonthly: salary,
      competence: 78,
      loyalty: 85,
      ambition: 70,
      personality: 'Pragmatic Builder' as any,
      aiOpinion: 'Operational controls and working capital are optimized for fiscal health.'
    });

    setGameState(updated);
  };

  const handleFireExecutive = (companyId: string, execId: string) => {
    const updated = { ...gameState };
    const comp = updated.companies.find(c => c.id === companyId);
    if (!comp) return;
    comp.executives = comp.executives.filter(e => e.id !== execId);
    setGameState(updated);
  };

  const updateBoardroomState = (fn: (state: any) => any) => {
    const updated = structuredClone(gameState);
    const result = fn(updated);
    if (!result?.success) { console.warn(result?.message); return; }
    setGameState(updated);
  };

  const handleStartBoardroom = (companyId: string, agenda: CorporateBoardMeetingAgenda, proposal: string) => updateBoardroomState(s => startCorporateBoardroom(s, companyId, agenda, proposal));
  const handleBoardroomReport = (sessionId: string, role: string, report?: string) => updateBoardroomState(s => presentCorporateExecutiveReport(s, sessionId, role, report));
  const handleBoardroomDebate = (sessionId: string, position: 'FOR'|'AGAINST'|'NEUTRAL', argument: string) => updateBoardroomState(s => submitCorporateDirectorDebate(s, sessionId, position, argument));
  const handleBoardroomAmend = (sessionId: string, text: string) => updateBoardroomState(s => proposeCorporateAmendment(s, sessionId, text));
  const handleBoardroomPressure = (sessionId: string, holderId: string, demand: string, response: 'ADDRESSED'|'IGNORED'|'CONCESSION') => updateBoardroomState(s => applyCorporateShareholderPressure(s, sessionId, holderId, demand, response));
  const handleBoardroomVote = (sessionId: string, vote: 'FOR'|'AGAINST'|'ABSTAIN') => updateBoardroomState(s => callCorporateBoardVote(s, sessionId, vote));
  const handleBoardroomAdvance = (sessionId: string) => updateBoardroomState(s => advanceCorporateBoardroomPhase(s, sessionId));

  const handleHoldBoardMeeting = (companyId: string, agenda: CorporateBoardMeetingAgenda, proposal: string, vote: 'FOR'|'AGAINST'|'ABSTAIN') => {
    const updated = structuredClone(gameState);
    const result = holdCorporateBoardMeeting(updated, companyId, agenda, proposal, vote);
    if (!result.success) { console.warn(result.message); return; }
    setGameState(updated);
  };

  const handleLaunchIPO = (companyId: string) => {
    let updated = { ...gameState };
    const comp = updated.companies.find(c => c.id === companyId);
    if (!comp || comp.isPublic) return;

    comp.isPublic = true;
    const ipoCapital = comp.valuation * 0.3; // Raise 30% of valuation in public capital
    comp.cashReserve += ipoCapital;
    const founderCashout = ipoCapital * 0.2;
    updated.finances.cash += founderCashout;

    const eventId = `ev-ipo-${Date.now()}`;
    updated.eventsFeed.unshift({
      id: eventId,
      timestampMonth: updated.currentMonth,
      timestampYear: updated.currentYear,
      age: updated.character.age,
      category: 'Business',
      title: `INITIAL PUBLIC OFFERING: ${comp.name} Rings the Bell`,
      description: `Successfully launched IPO, raising $${ipoCapital.toLocaleString()} in fresh public equity at a valuation of $${comp.valuation.toLocaleString()}.`,
      consequences: { cashChange: founderCashout, reputationChange: +25, worldInfluenceChange: +10 }
    });

    // Record decision history (Selling/IPO Company)
    const { nextState } = recordDecisionWithConsequences(
      updated,
      {
        category: 'Business',
        title: `IPO Public Listing: ${comp.name}`,
        description: `Floated ${comp.name} on the public securities exchange, raising $${ipoCapital.toLocaleString()} in equity capital. Founder dividend realized: $${founderCashout.toLocaleString()}.`,
        importance: 'Historic',
        risk: 'Moderate',
        success: true,
        result: `Public listing successful. Raised $${ipoCapital.toLocaleString()}`,
        immediateConsequences: { cashChange: founderCashout, reputationChange: 25, worldInfluenceChange: 10 },
        affectedEntities: [comp.name, 'Public Stock Market'],
        relatedEventId: eventId
      },
      [
        {
          source: 'Initial Public Offering',
          category: 'Business',
          description: `Converted private enterprise to publicly traded corporation.`,
          affectedEntity: comp.name,
          valueBefore: 'Private Entity',
          valueAfter: 'Publicly Traded Corp',
          change: `+$${ipoCapital.toLocaleString()} Public Equity Raised`,
          relatedEventId: eventId
        }
      ]
    );

    setGameState(nextState);
  };

  // POLITICS
  const handleJoinParty = (partyId: string) => {
    let updated = { ...gameState };
    const eventId = `ev-party-${Date.now()}`;
    updated.politics.selectedPartyId = partyId;
    updated.politics.currentOffice.title = 'Party Member';

    const { nextState } = recordDecisionHistory(updated, {
      category: 'Politics',
      title: `Entered Political Arena: Joined ${partyId}`,
      description: `Officially affiliated with political faction ${partyId} to build party standing and campaign machinery.`,
      importance: 'Major',
      risk: 'Moderate',
      success: true,
      affectedEntities: [partyId, updated.character.residenceCountry],
      relatedEventId: eventId
    });

    setGameState(nextState);
  };

  const handleRunCampaign = (targetOffice: any, budget: number) => {
    if (gameState.finances.cash < budget) return;

    let updated = { ...gameState };
    updated.finances.cash -= budget;

    const party = updated.politics.parties.find(p => p.id === updated.politics.selectedPartyId) || updated.politics.parties[0];
    const partyId = party?.id || 'party_centrist';
    const partyName = party?.name || 'National Progress Alliance';

    const campaignChain = createComprehensiveCampaignChain(
      targetOffice,
      partyId,
      partyName,
      updated.currentMonth,
      updated.currentYear,
      updated
    );

    const { nextState } = startEventChain(updated, campaignChain);
    updated = nextState;

    const eventId = `ev-campaign-launch-${Date.now()}`;
    const { nextState: recordedState } = recordDecisionWithConsequences(
      updated,
      {
        category: 'Politics',
        title: `Electoral Campaign Launched: ${targetOffice}`,
        description: `Officially launched campaign for ${targetOffice} backed by ${partyName} with $${budget.toLocaleString()} campaign allocation. Initiated 7-stage campaign journey (Strategy -> Fundraising -> Media -> Polling -> Debate -> Election Day -> Result).`,
        importance: 'Historic',
        risk: 'High',
        success: true,
        result: `Campaign Active: ${targetOffice}`,
        immediateConsequences: {
          cashChange: -budget,
          worldInfluenceChange: 5
        },
        affectedEntities: [targetOffice, partyName, updated.character.residenceCountry],
        relatedEventId: eventId
      },
      [
        {
          source: 'Electoral Campaign Launch',
          category: 'Politics',
          description: `Entered race for public office (${targetOffice}).`,
          affectedEntity: targetOffice,
          valueBefore: 'Candidate Exploring',
          valueAfter: 'Official Nominee',
          change: 'Nomination Certified',
          relatedEventId: eventId
        }
      ]
    );

    setGameState(recordedState);
    setActiveTab('inbox');
  };

  const handleEnactPolicy = (policyKey: string, value: string) => {
    let updated = { ...gameState };
    (updated.politics.nationalPolicies as any)[policyKey] = value;
    updated.politics.currentOffice.politicalCapital = Math.max(0, updated.politics.currentOffice.politicalCapital - 10);
    const eventId = `ev-pol-${Date.now()}`;

    updated.eventsFeed.unshift({
      id: eventId,
      timestampMonth: updated.currentMonth,
      timestampYear: updated.currentYear,
      age: updated.character.age,
      category: 'Politics',
      title: `Executive Decree: ${policyKey}`,
      description: `Enacted reform: ${policyKey} set to ${value}.`,
      consequences: { worldInfluenceChange: +3 }
    });

    const { nextState } = recordDecisionHistory(updated, {
      category: 'Politics',
      title: `Enacted Policy Decree: ${policyKey}`,
      description: `Ratified national reform policy '${policyKey}' set to '${value}'. Expended 10 political capital.`,
      importance: 'Major',
      risk: 'Moderate',
      success: true,
      immediateConsequences: { worldInfluenceChange: 3 },
      affectedEntities: [policyKey, updated.character.residenceCountry],
      relatedEventId: eventId
    });

    setGameState(nextState);
  };

  const handleLaunchInteractiveCampaign = (targetOffice: string) => {
    let updated = { ...gameState };
    const party = updated.politics.parties.find(p => p.id === updated.politics.selectedPartyId) || {
      id: 'party_independent',
      name: 'National Reform Coalition'
    };

    const chain = createComprehensiveCampaignChain(
      targetOffice,
      party.id,
      party.name,
      updated.currentMonth,
      updated.currentYear,
      updated
    );

    const { nextState } = startEventChain(updated, chain);
    setGameState(nextState);
    setActiveTab('inbox');
  };

  // RELOCATE CITY
  const handleRelocateCity = (countryName: string, cityName: string) => {
    if (gameState.finances.cash < 2500) return;

    let updated = { ...gameState };
    const eventId = `ev-move-${Date.now()}`;
    updated.finances.cash -= 2500;
    updated.character.residenceCountry = countryName;
    updated.character.residenceCity = cityName;

    const cIdx = updated.world.findIndex(c => c.name === countryName);
    if (cIdx !== -1) updated.currentCountryIndex = cIdx;

    updated.eventsFeed.unshift({
      id: eventId,
      timestampMonth: updated.currentMonth,
      timestampYear: updated.currentYear,
      age: updated.character.age,
      category: 'Life',
      title: `Relocated to ${cityName}, ${countryName}`,
      description: `Established new personal residence and regional headquarters in ${cityName}.`,
      consequences: { cashChange: -2500 }
    });

    const { nextState } = recordDecisionHistory(updated, {
      category: 'Life',
      title: `Global Relocation: ${cityName}, ${countryName}`,
      description: `Relocated headquarters and personal domicile from former residence to ${cityName}, ${countryName}.`,
      importance: 'Major',
      risk: 'Low',
      success: true,
      immediateConsequences: { cashChange: -2500 },
      affectedEntities: [cityName, countryName],
      relatedEventId: eventId
    });

    setGameState(nextState);
  };

  // PROJECTS & SPORTS
  const handleStartProject = (template: any, initialFunding: number) => {
    if (gameState.finances.cash < initialFunding) return;

    let updated = { ...gameState };
    const eventId = `ev-proj-${Date.now()}`;
    updated.finances.cash -= initialFunding;
    updated.projects.push({
      id: `proj-${Date.now()}`,
      name: template.name,
      type: template.type,
      durationMonths: template.durationMonths,
      monthsProgress: 0,
      totalBudgetRequired: template.totalBudgetRequired,
      capitalInvested: initialFunding,
      status: 'Active Construction',
      completed: false,
      riskFactor: template.riskFactor,
      expectedMonthlyIncomeBoost: template.expectedMonthlyIncomeBoost,
      expectedReputationBoost: template.expectedReputationBoost,
      expectedInfluenceBoost: template.expectedInfluenceBoost
    });

    updated.eventsFeed.unshift({
      id: eventId,
      timestampMonth: updated.currentMonth,
      timestampYear: updated.currentYear,
      age: updated.character.age,
      category: 'Business',
      title: `Groundbreaking: ${template.name}`,
      description: `Commenced landmark construction on ${template.name} with an initial capital allocation of $${initialFunding.toLocaleString()}.`,
      consequences: { cashChange: -initialFunding, reputationChange: +10 }
    });

    // Record decision history (Major Project / Philanthropy)
    const isPhilanthropy = template.type?.toLowerCase().includes('philanthropy') || template.type?.toLowerCase().includes('civic');
    const { nextState } = recordDecisionWithConsequences(
      updated,
      {
        category: isPhilanthropy ? 'Philanthropy' : 'Projects',
        title: `Launched Landmark Project: ${template.name}`,
        description: `Commissioned development of ${template.name} ($${template.totalBudgetRequired.toLocaleString()} total commitment, funded $${initialFunding.toLocaleString()} upfront).`,
        importance: template.totalBudgetRequired >= 1000000 ? 'Historic' : 'Major',
        risk: template.riskFactor > 0.3 ? 'High' : 'Moderate',
        success: true,
        result: `Broke ground on ${template.name}`,
        immediateConsequences: { cashChange: -initialFunding, reputationChange: 10 },
        affectedEntities: [template.name, template.type],
        relatedEventId: eventId
      },
      [
        {
          source: 'Infrastructure & Megaprojects',
          category: 'Projects',
          description: `Initiated landmark development in ${template.name}.`,
          affectedEntity: template.name,
          valueBefore: 0,
          valueAfter: initialFunding,
          change: `+$${initialFunding.toLocaleString()} Invested`,
          relatedEventId: eventId
        }
      ]
    );

    setGameState(nextState);
  };

  const handleFundProject = (projectId: string, additionalCapital: number) => {
    if (gameState.finances.cash < additionalCapital) return;

    const updated = { ...gameState };
    const proj = updated.projects.find(p => p.id === projectId);
    if (!proj) return;

    updated.finances.cash -= additionalCapital;
    proj.capitalInvested += additionalCapital;
    setGameState(updated);
  };

  const handleBuySportsTeam = (teamTemplate: any) => {
    if (gameState.finances.cash < teamTemplate.valuation) return;

    let updated = { ...gameState };
    const eventId = `ev-sports-${Date.now()}`;
    updated.finances.cash -= teamTemplate.valuation;

    updated.sports.ownedTeams.push({
      id: `team-${Date.now()}`,
      name: teamTemplate.name,
      sport: teamTemplate.sport,
      city: teamTemplate.city,
      valuation: teamTemplate.valuation,
      playerOwnershipPercentage: 100,
      monthlyNetIncome: teamTemplate.monthlyNetIncome,
      stadiumCapacity: 60000,
      ticketPrice: 65,
      monthlySponsorship: 50000,
      monthlyPlayerWages: 35000,
      fanBaseThousands: teamTemplate.fanBaseThousands,
      teamPerformanceScore: 75,
      headCoachName: 'Jose Mancini',
      starPlayerName: 'Julian Morales',
      leaguePosition: 3,
      totalTeamsInLeague: 20,
      matchesWon: 14,
      matchesDrawn: 4,
      matchesLost: 3,
      recentMatchResult: 'Won 3-1 against league rivals'
    });

    updated.eventsFeed.unshift({
      id: eventId,
      timestampMonth: updated.currentMonth,
      timestampYear: updated.currentYear,
      age: updated.character.age,
      category: 'Sports',
      title: `Acquired Sports Franchise: ${teamTemplate.name}`,
      description: `Completed 100% takeover of ${teamTemplate.name} for $${teamTemplate.valuation.toLocaleString()}.`,
      consequences: { cashChange: -teamTemplate.valuation, reputationChange: +15 }
    });

    // Record decision history (Acquiring Sports Franchise)
    const { nextState } = recordDecisionWithConsequences(
      updated,
      {
        category: 'Sports',
        title: `Sports Franchise Takeover: ${teamTemplate.name}`,
        description: `Acquired 100% majority ownership of ${teamTemplate.name} (${teamTemplate.sport}) for $${teamTemplate.valuation.toLocaleString()}.`,
        importance: 'Historic',
        risk: 'Moderate',
        success: true,
        result: `Acquired ${teamTemplate.name}`,
        immediateConsequences: { cashChange: -teamTemplate.valuation, reputationChange: 15 },
        affectedEntities: [teamTemplate.name, teamTemplate.sport],
        relatedEventId: eventId
      },
      [
        {
          source: 'Franchise Acquisition',
          category: 'Sports',
          description: `Integrated sports entertainment franchise into family portfolio.`,
          affectedEntity: teamTemplate.name,
          valueBefore: 0,
          valueAfter: teamTemplate.valuation,
          change: `+$${teamTemplate.valuation.toLocaleString()} Franchise Value`,
          relatedEventId: eventId
        }
      ]
    );

    setGameState(nextState);
  };

  const handleHireCoach = (teamId: string, coachName: string) => {
    const updated = { ...gameState };
    const team = updated.sports.ownedTeams.find(t => t.id === teamId);
    if (!team) return;
    team.headCoachName = coachName;
    team.teamPerformanceScore = Math.min(100, team.teamPerformanceScore + 8);
    setGameState(updated);
  };

  const handleSignStarPlayer = (teamId: string, playerName: string, fee: number) => {
    if (gameState.finances.cash < fee) return;
    let updated = { ...gameState };
    const team = updated.sports.ownedTeams.find(t => t.id === teamId);
    if (!team) return;

    const eventId = `ev-sign-${Date.now()}`;
    updated.finances.cash -= fee;
    team.starPlayerName = playerName;
    team.teamPerformanceScore = Math.min(100, team.teamPerformanceScore + 12);
    team.valuation = Math.round(team.valuation * 1.15);

    updated.eventsFeed.unshift({
      id: eventId,
      timestampMonth: updated.currentMonth,
      timestampYear: updated.currentYear,
      age: updated.character.age,
      category: 'Sports',
      title: `Signed Star Athlete: ${playerName}`,
      description: `${team.name} completed the landmark signing of ${playerName} for $${fee.toLocaleString()}.`,
      consequences: { cashChange: -fee, reputationChange: +5 }
    });

    if (fee >= 1000000) {
      const { nextState } = recordDecisionHistory(updated, {
        category: 'Sports',
        title: `Signed Marquee Athlete: ${playerName}`,
        description: `Committed transfer capital of $${fee.toLocaleString()} to sign star player ${playerName} for ${team.name}.`,
        importance: fee >= 10000000 ? 'Historic' : 'Major',
        risk: 'Moderate',
        success: true,
        immediateConsequences: { cashChange: -fee, reputationChange: 5 },
        affectedEntities: [playerName, team.name],
        relatedEventId: eventId
      });
      updated = nextState;
    }

    setGameState(updated);
  };

  // SUCCESSION & DYNASTY ENGINE
  const handleContinueAsHeir = () => {
    if (!gameState) return;
    const { nextState } = executeDynastySuccession(gameState, gameState.dynastyProfile?.successionPlan);
    setShowSuccessionModal(false);
    setGameState(nextState);
  };

  const handleUpdateSuccessionPlan = (plan: DynastySuccessionPlan) => {
    if (!gameState) return;
    const nextState = updateDynastySuccessionPlan(gameState, plan);
    setGameState(nextState);
  };

  const handleExecuteDynastySuccession = (plan?: DynastySuccessionPlan) => {
    if (!gameState) return;
    const { nextState } = executeDynastySuccession(gameState, plan || gameState.dynastyProfile?.successionPlan);
    setShowSuccessionModal(false);
    setGameState(nextState);
  };

  const handleOpenLegacyReport = () => {
    if (!gameState) return;
    const report = generateLegacyReport(gameState);
    setGameState({
      ...gameState,
      activeLegacyReport: report
    });
    setShowLegacyReportModal(true);
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-[#ececec] flex flex-col font-sans">
      {/* Top HUD Header */}
      <Header
        state={gameState}
        onSave={() => {
          autoSaveGame(gameState);
        }}
        onAdvanceMonth={handleAdvanceMonth}
        isSimulating={isSimulating}
        onOpenStatusDetail={(type) => setActiveStatusModal(type)}
        onOpenPowerProfile={() => setShowPowerProfileModal(true)}
        onOpenProgressionProfile={() => setShowProgressionModal(true)}
        onOpenDecisionInbox={() => handleNavigateDestination('inbox')}
        onOpenObjectives={() => handleNavigateDestination('objectives')}
        onOpenInstallModal={() => setShowInstallModal(true)}
        pendingDecisionsCount={gameState.pendingDecisions.length}
        advanceSpeed={advanceStepSpeed}
        onSetAdvanceSpeed={(speed) => setAdvanceStepSpeed(speed)}
      />

      {playerActionNotice && (
        <div className="fixed top-[72px] sm:top-[82px] left-1/2 -translate-x-1/2 z-[70] pointer-events-none w-[min(92vw,620px)]">
          <div className="mx-auto px-4 py-3 rounded-xl border border-amber-400/30 bg-zinc-950/95 backdrop-blur-md shadow-2xl text-xs sm:text-sm font-bold text-zinc-100 flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />{playerActionNotice}
          </div>
        </div>
      )}

      {/* Responsive Game Layout with Floatable Left/Right Status HUD */}
      <ResponsiveGameLayout
        state={gameState}
        statusBarPosition={statusBarPosition}
        onToggleStatusBarPosition={handleToggleStatusBarPosition}
        onOpenStatusDetail={(type) => setActiveStatusModal(type)}
        onOpenPowerProfile={() => setShowPowerProfileModal(true)}
        onOpenProgressionProfile={() => setShowProgressionModal(true)}
        onOpenDecisionInbox={() => handleNavigateDestination('inbox')}
        onOpenObjectives={() => handleNavigateDestination('objectives')}
      >
        {/* 1. FEED & CHRONOLOGY HUB */}
        {currentPrimaryTab === 'feed' && (
          <>
            {getCurrentSubTab() === 'inbox' ? (
              <DecisionInbox
                state={gameState}
                onMakeDecision={handleMakeDecision}
                onUpdateState={(newState) => setGameState(newState)}
                onNavigateToTab={handleNavigateDestination}
                onClose={() => { setActiveTab('feed'); setFeedSubTab('chronology'); }}
              />
            ) : getCurrentSubTab() === 'objectives' ? (
              <ObjectivesHub
                state={gameState}
                onUpdateState={(newState) => setGameState(newState)}
                onOpenModule={handleNavigateDestination}
              />
            ) : (
              <LifeEventFeed
                state={gameState}
                events={gameState.eventsFeed}
                pendingDecisions={gameState.pendingDecisions}
                activeFeedMode={getCurrentSubTab() as any}
                onSelectFeedMode={(mode) => setFeedSubTab(mode)}
                onMakeDecision={handleMakeDecision}
                onOpenModule={handleNavigateDestination}
                onUpdateState={(newState) => setGameState(newState)}
                onAdvanceMonth={handleAdvanceMonth}
                isSimulating={isSimulating}
              />
            )}
          </>
        )}

        {/* 2. LIFE HUB */}
        {currentPrimaryTab === 'life' && (
          <LifeHub
            state={gameState}
            activeSubTab={lifeSubTab as any}
            onSelectSubTab={(tab) => setLifeSubTab(tab)}
            onOpenProgressionProfile={() => setShowProgressionModal(true)}
            onApplyJob={handleApplyJob}
            onEnrollEducation={handleEnrollEducation}
            onPerformActivity={handlePerformActivity}
            onToggleGoal={handleToggleGoal}
            onPostSocialMedia={handlePostSocialMedia}
            onInteractRelationship={handleInteractRelationship}
            onProposeMarriage={handleProposeMarriage}
            onUpdateState={(newState) => setGameState(newState)}
          />
        )}

        {/* 3. FAMILY & DYNASTY HUB */}
        {currentPrimaryTab === 'family' && (
          <FamilyHub
            state={gameState}
            activeSubTab={familySubTab as any}
            onSelectSubTab={(tab) => setFamilySubTab(tab)}
            onInteractRelationship={handleInteractRelationship}
            onFindDate={handleFindDate}
            onProposeMarriage={handleProposeMarriage}
            onHaveChild={handleHaveChild}
            onUpdateSuccessionPlan={handleUpdateSuccessionPlan}
            onExecuteSuccession={handleExecuteDynastySuccession}
            onOpenLegacyReport={handleOpenLegacyReport}
          />
        )}

        {/* 4. WEALTH & MARKETS HUB */}
        {currentPrimaryTab === 'wealth' && (
          <WealthHub
            state={gameState}
            activeSubTab={wealthSubTab as any}
            onSelectSubTab={(tab) => setWealthSubTab(tab)}
            onTradeStock={handleTradeStock}
            onBuyProperty={handleBuyProperty}
            onManageProperty={handleManageProperty}
            onTakeLoan={handleTakeLoan}
            onRepayLoan={handleRepayLoan}
            onTransferBank={handleTransferBank}
          />
        )}

        {/* 5. EMPIRE & VENTURES HUB */}
        {currentPrimaryTab === 'empire' && (
          <EmpireHub
            state={gameState}
            activeSubTab={empireSubTab as any}
            onSelectSubTab={(tab) => setEmpireSubTab(tab)}
            onCreateCompany={handleCreateCompany}
            onUpdateCompanyStrategy={handleUpdateCompanyStrategy}
            onHireExecutive={handleHireExecutive}
            onFireExecutive={handleFireExecutive}
            onHoldBoardMeeting={handleHoldBoardMeeting}
            onStartBoardroom={handleStartBoardroom}
            onBoardroomReport={handleBoardroomReport}
            onBoardroomDebate={handleBoardroomDebate}
            onBoardroomAmend={handleBoardroomAmend}
            onBoardroomPressure={handleBoardroomPressure}
            onBoardroomVote={handleBoardroomVote}
            onBoardroomAdvance={handleBoardroomAdvance}
            onLaunchIPO={handleLaunchIPO}
            onStartProject={handleStartProject}
            onFundProject={handleFundProject}
            onBuySportsTeam={handleBuySportsTeam}
            onHireCoach={handleHireCoach}
            onSignStarPlayer={handleSignStarPlayer}
            onAdjustTicketPrice={handleAdjustTicketPrice}
            initialTab={empireSubTab as any}
          />
        )}

        {/* 6. WORLD, POLITICS & NEWS HUB */}
        {currentPrimaryTab === 'world' && (
          <WorldHub
            state={gameState}
            activeSubTab={worldSubTab as any}
            onSelectSubTab={(tab) => setWorldSubTab(tab)}
            onJoinParty={handleJoinParty}
            onRunCampaign={handleRunCampaign}
            onLaunchInteractiveCampaign={handleLaunchInteractiveCampaign}
            onEnactPolicy={handleEnactPolicy}
            onAppointMinister={handleAppointMinister}
            onNavigateToInbox={() => {
              setActiveTab('feed');
              setFeedSubTab('inbox');
            }}
            onRelocateCity={handleRelocateCity}
            onUpdateState={(newState) => setGameState(newState)}
            initialTab={worldSubTab as any}
          />
        )}

        {/* 7. MORE & SYSTEM HUB */}
        {currentPrimaryTab === 'more' && (
          <>
            {getCurrentSubTab() === 'inbox' ? (
              <DecisionInbox
                state={gameState}
                onMakeDecision={handleMakeDecision}
                onUpdateState={(newState) => setGameState(newState)}
                onNavigateToTab={handleNavigateDestination}
                onClose={() => { setActiveTab('feed'); setFeedSubTab('chronology'); }}
              />
            ) : getCurrentSubTab() === 'objectives' ? (
              <ObjectivesHub
                state={gameState}
                onUpdateState={(newState) => setGameState(newState)}
                onOpenModule={handleNavigateDestination}
              />
            ) : getCurrentSubTab() === 'settings' || getCurrentSubTab() === 'tests' ? (
              <SettingsHub
                state={gameState}
                onUpdateState={(ns) => setGameState(ns)}
                onResetGame={() => setGameState(null)}
                onOpenTestModal={() => setShowIntegrationTestModal(true)}
              />
            ) : (
              <MoreHub
                state={gameState}
                onNavigateTab={handleNavigateDestination}
                onOpenDecisionInbox={() => {
                  setActiveTab('feed');
                  setFeedSubTab('inbox');
                }}
                onOpenObjectives={() => {
                  setActiveTab('feed');
                  setFeedSubTab('objectives');
                }}
                onOpenPowerProfile={() => setShowPowerProfileModal(true)}
                onOpenProgressionProfile={() => setShowProgressionModal(true)}
                onOpenDynastySuccession={() => setShowSuccessionModal(true)}
                onOpenTestModal={() => setShowIntegrationTestModal(true)}
                onSave={() => autoSaveGame(gameState)}
              />
            )}
          </>
        )}
      </ResponsiveGameLayout>

      {/* Persistent Bottom Nav */}
      <BottomNav
        activeTab={currentPrimaryTab}
        onChangeTab={(tab) => {
          setActiveTab(tab as any);
        }}
        onAdvanceMonth={handleAdvanceMonth}
        isSimulating={isSimulating}
        pendingDecisionsCount={gameState.pendingDecisions.length}
      />

      {/* Month Advance Recap Modal */}
      {monthReport && (
        <MonthAdvanceModal
          isOpen={Boolean(monthReport)}
          state={gameState}
          events={monthReport.events}
          news={monthReport.news}
          diff={monthReport.diff}
          snapshotBefore={monthReport.snapshotBefore}
          snapshotAfter={monthReport.snapshotAfter}
          onClose={() => setMonthReport(null)}
          onOpenDecisionInbox={() => {
            setMonthReport(null);
            setActiveTab('feed');
            setFeedSubTab('inbox');
          }}
        />
      )}

      {/* Status Attribute Detail Modal */}
      {activeStatusModal && (
        <StatusDetailModal
          type={activeStatusModal}
          state={gameState}
          onClose={() => setActiveStatusModal(null)}
        />
      )}

      {/* Dynastic Succession Modal */}
      {showSuccessionModal && (
        <DynastySuccessionModal
          state={gameState}
          onContinueAsHeir={handleContinueAsHeir}
        />
      )}

      {/* Player Power Profile & Hierarchy Modal (Phase 10) */}
      {showPowerProfileModal && (
        <PlayerPowerProfileModal
          state={gameState}
          onClose={() => setShowPowerProfileModal(false)}
        />
      )}

      {/* Life Progression & Tier Modal (Expansion 1A) */}
      {showProgressionModal && (
        <LifeProgressionModal
          state={gameState}
          onClose={() => setShowProgressionModal(false)}
        />
      )}

      {/* Dynastic Legacy Report Modal (Phase 18) */}
      {showLegacyReportModal && gameState.activeLegacyReport && (
        <LegacyReportModal
          state={gameState}
          report={gameState.activeLegacyReport}
          onClose={() => setShowLegacyReportModal(false)}
          onInitiateSuccession={() => {
            setShowLegacyReportModal(false);
            handleExecuteDynastySuccession();
          }}
        />
      )}

      {/* System Integration Test Suite Modal (Phase 23) */}
      {showIntegrationTestModal && (
        <IntegrationTestModal
          isOpen={showIntegrationTestModal}
          onClose={() => setShowIntegrationTestModal(false)}
        />
      )}

      {/* Play on Phone / Install Mobile App Modal */}
      {showInstallModal && (
        <InstallMobileModal
          isOpen={showInstallModal}
          onClose={() => setShowInstallModal(false)}
        />
      )}
    </div>
  );
}
