import React, { useState } from 'react';
import { GameState, MonthlyTimeAllocation } from '../../types';
import { ensureLifeSystemState } from '../../engine/lifeEngine';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  HeartPulse, 
  Sparkles, 
  Target, 
  Share2, 
  Heart, 
  Clock, 
  ShoppingBag, 
  LayoutDashboard,
  Users
} from 'lucide-react';
import { LifeOverviewView } from '../life/LifeOverviewView';
import { LifeMeProfileView } from '../life/LifeMeProfileView';
import { LifeScheduleView } from '../life/LifeScheduleView';
import { LifeCareerWorkplaceView } from '../life/LifeCareerWorkplaceView';
import { LifeEducationUniversitiesView } from '../life/LifeEducationUniversitiesView';
import { LifeDatingHubView } from '../life/LifeDatingHubView';
import { LifeRelationshipsView } from '../life/LifeRelationshipsView';
import { LifeMarketplaceView } from '../life/LifeMarketplaceView';
import { LifeSocialMediaView } from '../life/LifeSocialMediaView';
import { LifeWellnessView } from '../life/LifeWellnessView';
import { LifeAssetManagementView } from '../life/LifeAssetManagementView';

interface LifeHubProps {
  state: GameState;
  activeSubTab?: LifeSubTab;
  onSelectSubTab?: (tab: LifeSubTab) => void;
  onOpenProgressionProfile?: () => void;
  onApplyJob: (job: any) => void;
  onEnrollEducation: (edu: any) => void;
  onPerformActivity: (activity: { name: string; cost: number; health?: number; happiness?: number; intelligence?: number; stress?: number; charm?: number; attractiveness?: number; desc: string }) => void;
  onToggleGoal: (goalId: string) => void;
  onPostSocialMedia: () => void;
  onInteractRelationship?: (
    personId: string, 
    actionType: 'spend_time' | 'give_gift' | 'deep_talk' | 'set_heir' | 'fund_tutoring' | 'set_allowance' | 'appoint_executive' | 'family_vacation'
  ) => void;
  onProposeMarriage?: (personId: string) => void;
  onUpdateState?: (newState: GameState) => void;
}

export type LifeSubTab = 
  | 'overview' 
  | 'profile' 
  | 'schedule' 
  | 'career' 
  | 'education' 
  | 'dating' 
  | 'relationships' 
  | 'marketplace' 
  | 'social' 
  | 'wellness'
  | 'assets';

export const LifeHub: React.FC<LifeHubProps> = ({
  state,
  activeSubTab: controlledSubTab,
  onSelectSubTab,
  onOpenProgressionProfile,
  onApplyJob,
  onEnrollEducation,
  onPerformActivity,
  onToggleGoal,
  onPostSocialMedia,
  onInteractRelationship,
  onProposeMarriage,
  onUpdateState
}) => {
  const life = ensureLifeSystemState(state);
  const [internalSubTab, setInternalSubTab] = useState<LifeSubTab>('overview');

  const subTab = controlledSubTab || internalSubTab;
  const setSubTab = (newTab: LifeSubTab) => {
    setInternalSubTab(newTab);
    if (onSelectSubTab) onSelectSubTab(newTab);
  };

  const handleUpdateAllocation = (newAlloc: MonthlyTimeAllocation) => {
    life.timeAllocation = newAlloc;
  };

  const navTabs: Array<{ key: LifeSubTab; label: string; icon: React.ReactNode; badge?: string }> = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { key: 'profile', label: 'Me & Timeline', icon: <User className="w-3.5 h-3.5" /> },
    { key: 'schedule', label: 'Schedule', icon: <Clock className="w-3.5 h-3.5" />, badge: `${life.timeAllocation.workHours + life.timeAllocation.overtimeHours}h` },
    { key: 'career', label: 'Career & Jobs', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { key: 'education', label: 'Education', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { key: 'dating', label: 'Dating Hub', icon: <Heart className="w-3.5 h-3.5" /> },
    { key: 'relationships', label: 'Relationships', icon: <Users className="w-3.5 h-3.5" /> },
    { key: 'marketplace', label: 'Marketplace', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { key: 'social', label: 'Social Media', icon: <Share2 className="w-3.5 h-3.5" /> },
    { key: 'wellness', label: 'Wellness', icon: <HeartPulse className="w-3.5 h-3.5" /> },
    { key: 'assets', label: 'My Assets & Staff', icon: <Briefcase className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="space-y-4">
      {/* Horizontal Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-800">
        {navTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setSubTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              subTab === tab.key
                ? 'bg-zinc-800 text-amber-400 border border-zinc-700 shadow-sm font-black'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${
                subTab === tab.key ? 'bg-amber-400/20 text-amber-300' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Render Active View */}
      {subTab === 'overview' && (
        <LifeOverviewView
          state={state}
          onNavigateTab={(tab) => {
            if (tab === 'progression_profile' && onOpenProgressionProfile) {
              onOpenProgressionProfile();
            } else {
              setSubTab(tab as LifeSubTab);
            }
          }}
          onUpdateState={onUpdateState}
        />
      )}

      {subTab === 'profile' && (
        <LifeMeProfileView
          state={state}
        />
      )}

      {subTab === 'schedule' && (
        <LifeScheduleView
          state={state}
          onUpdateAllocation={handleUpdateAllocation}
        />
      )}

      {subTab === 'career' && (
        <LifeCareerWorkplaceView
          state={state}
          onApplyJob={onApplyJob}
          onUpdateState={onUpdateState}
          onResignJob={() => {
            state.currentJob = null;
            if (state.lifeSystem) state.lifeSystem.workplace = undefined;
          }}
        />
      )}

      {subTab === 'education' && (
        <LifeEducationUniversitiesView
          state={state}
          onEnrollEducation={onEnrollEducation}
        />
      )}

      {subTab === 'dating' && (
        <LifeDatingHubView
          state={state}
          onProposeMarriage={onProposeMarriage}
        />
      )}

      {subTab === 'relationships' && (
        <LifeRelationshipsView
          state={state}
          onInteractRelationship={onInteractRelationship}
          onProposeMarriage={onProposeMarriage}
        />
      )}

      {subTab === 'marketplace' && (
        <LifeMarketplaceView
          state={state}
          onUpdateState={onUpdateState}
        />
      )}

      {subTab === 'social' && (
        <LifeSocialMediaView
          state={state}
          onUpdateState={onUpdateState}
        />
      )}

      {subTab === 'wellness' && (
        <LifeWellnessView
          state={state}
        />
      )}

      {subTab === 'assets' && (
        <LifeAssetManagementView state={state} onUpdateState={onUpdateState} />
      )}
    </div>
  );
};
