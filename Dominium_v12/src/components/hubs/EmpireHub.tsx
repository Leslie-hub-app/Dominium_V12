import React, { useState } from 'react';
import { GameState, Company, CorporateBoardMeetingAgenda } from '../../types';
import { Building2, BookOpen, Trophy } from 'lucide-react';
import { BusinessEmpireHub } from './BusinessEmpireHub';
import { ProjectsHub } from './ProjectsHub';
import { SportsHub } from './SportsHub';
import { CorporateExchangeView } from '../expansion2/CorporateExchangeView';

interface EmpireHubProps {
  state: GameState;
  activeSubTab?: 'companies' | 'projects' | 'sports' | 'corporate';
  onSelectSubTab?: (tab: 'companies' | 'projects' | 'sports' | 'corporate') => void;
  onCreateCompany: (companyData: { name: string; industry: string; initialCapital: number; pricingStrategy: any; supplierType: any }) => void;
  onUpdateCompanyStrategy: (companyId: string, updates: Partial<Company>) => void;
  onHireExecutive: (companyId: string, role: any, candidateName: string, salary: number) => void;
  onFireExecutive: (companyId: string, execId: string) => void;
  onHoldBoardMeeting: (companyId: string, agenda: CorporateBoardMeetingAgenda, proposal: string, vote: 'FOR'|'AGAINST'|'ABSTAIN') => void;
  onStartBoardroom: (companyId: string, agenda: CorporateBoardMeetingAgenda, proposal: string) => void;
  onBoardroomReport: (sessionId: string, role: string, report?: string) => void;
  onBoardroomDebate: (sessionId: string, position: 'FOR'|'AGAINST'|'NEUTRAL', argument: string) => void;
  onBoardroomAmend: (sessionId: string, text: string) => void;
  onBoardroomPressure: (sessionId: string, holderId: string, demand: string, response: 'ADDRESSED'|'IGNORED'|'CONCESSION') => void;
  onBoardroomVote: (sessionId: string, vote: 'FOR'|'AGAINST'|'ABSTAIN') => void;
  onBoardroomAdvance: (sessionId: string) => void;
  onLaunchIPO: (companyId: string) => void;
  onStartProject: (template: any, initialFunding: number) => void;
  onFundProject: (projectId: string, amount: number) => void;
  onBuySportsTeam: (teamTemplate: any) => void;
  onHireCoach: (teamId: string, coachName: string) => void;
  onSignStarPlayer: (teamId: string, playerName: string, fee: number) => void;
  onAdjustTicketPrice?: (teamId: string, newPrice: number) => void;
  initialTab?: 'companies' | 'projects' | 'sports' | 'corporate';
}

export const EmpireHub: React.FC<EmpireHubProps> = ({
  state,
  activeSubTab: controlledSubTab,
  onSelectSubTab,
  onCreateCompany,
  onUpdateCompanyStrategy,
  onHireExecutive,
  onFireExecutive,
  onHoldBoardMeeting,
  onStartBoardroom,
  onBoardroomReport,
  onBoardroomDebate,
  onBoardroomAmend,
  onBoardroomPressure,
  onBoardroomVote,
  onBoardroomAdvance,
  onLaunchIPO,
  onStartProject,
  onFundProject,
  onBuySportsTeam,
  onHireCoach,
  onSignStarPlayer,
  onAdjustTicketPrice,
  initialTab = 'companies'
}) => {
  const [internalSubTab, setInternalSubTab] = useState<'companies' | 'projects' | 'sports' | 'corporate'>(initialTab);
  const activeSubTab = controlledSubTab || internalSubTab;
  const setActiveSubTab = (newTab: 'companies' | 'projects' | 'sports' | 'corporate') => {
    setInternalSubTab(newTab);
    if (onSelectSubTab) onSelectSubTab(newTab);
  };

  const activeProjectsCount = (state.projects || (state as any).megaProjects || []).filter((p: any) => p.status === 'In Progress' || p.status === 'Active Construction').length;
  const ownedTeamsCount = (state.sports?.ownedTeams || (state as any).sportsClubs || []).length;
  const companiesCount = (state.companies || []).length;

  const subTabs = [
    {
      id: 'companies' as const,
      label: 'Companies',
      icon: <Building2 className="w-4 h-4" />,
      badge: companiesCount > 0 ? `${companiesCount}` : undefined,
    },
    {
      id: 'projects' as const,
      label: 'Mega-Projects',
      icon: <BookOpen className="w-4 h-4" />,
      badge: activeProjectsCount > 0 ? `${activeProjectsCount}` : undefined,
    },
    {
      id: 'sports' as const,
      label: 'Sports Franchises',
      icon: <Trophy className="w-4 h-4" />,
      badge: ownedTeamsCount > 0 ? `${ownedTeamsCount}` : undefined,
    },
    {
      id: 'corporate' as const,
      label: 'Corporate Exchange',
      icon: <Building2 className="w-4 h-4" />,
      badge: `${state.corporateSystem?.publicCompanyIds?.length || 0}`,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Segmented Switcher for Empire Destination */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#16161a] p-1.5 rounded-2xl border border-[rgba(236,236,232,0.08)] shadow-md">
        {subTabs.map(tab => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`min-h-[44px] py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer touch-manipulation ${
                isActive
                  ? 'bg-amber-400 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              {tab.icon}
              <span className="truncate">{tab.label}</span>
              {tab.badge && (
                <span className={`text-[8.5px] font-mono font-black px-1.5 py-0.2 rounded-full hidden sm:inline ${
                  isActive ? 'bg-zinc-950 text-amber-300' : 'bg-amber-400/20 text-amber-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Render Selected Sub Hub */}
      {activeSubTab === 'companies' && (
        <BusinessEmpireHub
          state={state}
          onCreateCompany={onCreateCompany}
          onUpdateCompanyStrategy={onUpdateCompanyStrategy}
          onHireExecutive={onHireExecutive}
          onFireExecutive={onFireExecutive}
          onHoldBoardMeeting={onHoldBoardMeeting}
          onStartBoardroom={onStartBoardroom}
          onBoardroomReport={onBoardroomReport}
          onBoardroomDebate={onBoardroomDebate}
          onBoardroomAmend={onBoardroomAmend}
          onBoardroomPressure={onBoardroomPressure}
          onBoardroomVote={onBoardroomVote}
          onBoardroomAdvance={onBoardroomAdvance}
          onLaunchIPO={onLaunchIPO}
        />
      )}

      {activeSubTab === 'projects' && (
        <ProjectsHub
          state={state}
          onStartProject={onStartProject}
          onFundProject={onFundProject}
        />
      )}

      {activeSubTab === 'sports' && (
        <SportsHub
          state={state}
          onBuySportsTeam={onBuySportsTeam}
          onHireCoach={onHireCoach}
          onSignStarPlayer={onSignStarPlayer}
          onAdjustTicketPrice={onAdjustTicketPrice || (() => {})}
        />
      )}

      {activeSubTab === 'corporate' && <CorporateExchangeView state={state} onStateChange={() => {}} />}
    </div>
  );
};
