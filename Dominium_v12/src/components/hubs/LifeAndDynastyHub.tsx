import React, { useState } from 'react';
import { GameState, DynastySuccessionPlan } from '../../types';
import { User, Users, Target } from 'lucide-react';
import { LifeHub } from './LifeHub';
import { FamilyHub } from './FamilyHub';
import { ObjectivesHub } from '../ObjectivesHub';
import { evaluateAllObjectives } from '../../engine/objectiveEngine';

interface LifeAndDynastyHubProps {
  state: GameState;
  onApplyJob: (job: any) => void;
  onEnrollEducation: (edu: any) => void;
  onPerformActivity: (activity: { name: string; cost: number; health?: number; happiness?: number; intelligence?: number; stress?: number; charm?: number; attractiveness?: number; desc: string }) => void;
  onToggleGoal: (goalId: string) => void;
  onPostSocialMedia: () => void;
  onInteractRelationship: (
    personId: string, 
    actionType: 'spend_time' | 'give_gift' | 'deep_talk' | 'set_heir' | 'fund_tutoring' | 'set_allowance' | 'appoint_executive' | 'family_vacation'
  ) => void;
  onFindDate: () => void;
  onProposeMarriage: (personId: string) => void;
  onHaveChild: () => void;
  onUpdateSuccessionPlan?: (plan: DynastySuccessionPlan) => void;
  onExecuteSuccession?: (plan?: DynastySuccessionPlan) => void;
  onOpenLegacyReport?: () => void;
  onOpenProgressionProfile?: () => void;
  onUpdateState?: (newState: GameState) => void;
  onOpenModule?: (module: string) => void;
  initialTab?: 'life' | 'family' | 'objectives';
}

export const LifeAndDynastyHub: React.FC<LifeAndDynastyHubProps> = ({
  state,
  onApplyJob,
  onEnrollEducation,
  onPerformActivity,
  onToggleGoal,
  onPostSocialMedia,
  onInteractRelationship,
  onFindDate,
  onProposeMarriage,
  onHaveChild,
  onUpdateSuccessionPlan,
  onExecuteSuccession,
  onOpenLegacyReport,
  onOpenProgressionProfile,
  onUpdateState,
  onOpenModule,
  initialTab = 'life'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'life' | 'family' | 'objectives'>(initialTab);

  const objectives = evaluateAllObjectives(state) || [];
  const completedObjectivesCount = objectives.filter(o => o.status === 'Completed').length;
  const relationshipsCount = (state.relationships || []).length;

  const subTabs = [
    {
      id: 'life' as const,
      label: 'Life & Career',
      icon: <User className="w-4 h-4" />,
      badge: state.currentJob ? state.currentJob.title.split(' ')[0] : undefined,
    },
    {
      id: 'family' as const,
      label: 'Family & Dynasty',
      icon: <Users className="w-4 h-4" />,
      badge: relationshipsCount > 0 ? `${relationshipsCount}` : undefined,
    },
    {
      id: 'objectives' as const,
      label: 'Goals',
      icon: <Target className="w-4 h-4" />,
      badge: `${completedObjectivesCount}/${Math.max(1, objectives.length)}`,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Segmented Switcher for Life Destination */}
      <div className="grid grid-cols-3 gap-1.5 bg-[#16161a] p-1.5 rounded-2xl border border-[rgba(236,236,232,0.08)] shadow-md">
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
      {activeSubTab === 'life' && (
        <LifeHub
          state={state}
          onOpenProgressionProfile={onOpenProgressionProfile}
          onApplyJob={onApplyJob}
          onEnrollEducation={onEnrollEducation}
          onPerformActivity={onPerformActivity}
          onToggleGoal={onToggleGoal}
          onPostSocialMedia={onPostSocialMedia}
          onInteractRelationship={onInteractRelationship}
          onProposeMarriage={onProposeMarriage}
          onUpdateState={onUpdateState}
        />
      )}

      {activeSubTab === 'family' && (
        <FamilyHub
          state={state}
          onInteractRelationship={onInteractRelationship}
          onFindDate={onFindDate}
          onProposeMarriage={onProposeMarriage}
          onHaveChild={onHaveChild}
          onUpdateSuccessionPlan={onUpdateSuccessionPlan}
          onExecuteSuccession={onExecuteSuccession}
          onOpenLegacyReport={onOpenLegacyReport}
        />
      )}

      {activeSubTab === 'objectives' && (
        <ObjectivesHub
          state={state}
          onUpdateState={onUpdateState || (() => {})}
          onOpenModule={onOpenModule || (() => {})}
        />
      )}
    </div>
  );
};
