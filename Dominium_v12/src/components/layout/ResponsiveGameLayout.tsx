import React, { useState } from 'react';
import { GameState } from '../../types';
import { FloatingStatusBar, StatusBarPosition } from './FloatingStatusBar';
import { Activity, ChevronLeft, ChevronRight, Sliders, X } from 'lucide-react';

interface ResponsiveGameLayoutProps {
  state: GameState;
  statusBarPosition: StatusBarPosition;
  onToggleStatusBarPosition: () => void;
  onOpenStatusDetail: (attrName: string) => void;
  onOpenPowerProfile?: () => void;
  onOpenProgressionProfile?: () => void;
  onOpenDecisionInbox?: () => void;
  onOpenObjectives?: () => void;
  children: React.ReactNode;
}

export const ResponsiveGameLayout: React.FC<ResponsiveGameLayoutProps> = ({
  state,
  statusBarPosition,
  onToggleStatusBarPosition,
  onOpenStatusDetail,
  onOpenPowerProfile,
  onOpenProgressionProfile,
  onOpenDecisionInbox,
  onOpenObjectives,
  children
}) => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState<boolean>(false);

  return (
    <div className="relative min-h-[calc(100vh-120px)] flex w-full max-w-[1600px] mx-auto overflow-hidden">
      {/* Desktop / Tablet Left Docked Status Bar */}
      {statusBarPosition === 'left' && (
        <div className="hidden md:flex shrink-0 sticky top-[98px] sm:top-[104px] h-[calc(100vh-160px)] z-10">
          <FloatingStatusBar
            state={state}
            position="left"
            onTogglePosition={onToggleStatusBarPosition}
            onOpenStatusDetail={onOpenStatusDetail}
            onOpenPowerProfile={onOpenPowerProfile}
            onOpenProgressionProfile={onOpenProgressionProfile}
            onOpenDecisionInbox={onOpenDecisionInbox}
            onOpenObjectives={onOpenObjectives}
            isCollapsed={isDesktopCollapsed}
            onToggleCollapse={() => setIsDesktopCollapsed(prev => !prev)}
          />
        </div>
      )}

      {/* Central Interactive Game Content Area */}
      <main 
        id="central-game-content"
        className="flex-1 min-w-0 px-2 sm:px-4 md:px-6 py-2.5 sm:py-3.5 space-y-3.5 sm:space-y-4 safe-bottom-pad overflow-y-auto transition-all"
      >
        {/* Mobile Quick Floating Status Bar Bar (Visible on mobile screens < 768px) */}
        <div className="flex md:hidden items-center justify-between gap-1.5 p-1.5 rounded-xl bg-[#141418] border border-[rgba(236,236,232,0.08)] shadow-sm">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <button
              onClick={() => onOpenStatusDetail('Health')}
              className="px-2 py-0.5 rounded-lg bg-[#1a1a20] border border-rose-500/20 text-[10px] font-mono font-bold text-rose-400 shrink-0"
            >
              HP {Math.round(state.character.attributes.health)}%
            </button>
            <button
              onClick={() => onOpenStatusDetail('Happiness')}
              className="px-2 py-0.5 rounded-lg bg-[#1a1a20] border border-amber-500/20 text-[10px] font-mono font-bold text-amber-400 shrink-0"
            >
              HAP {Math.round(state.character.attributes.happiness)}%
            </button>
            <button
              onClick={() => onOpenStatusDetail('Reputation')}
              className="px-2 py-0.5 rounded-lg bg-[#1a1a20] border border-emerald-500/20 text-[10px] font-mono font-bold text-emerald-400 shrink-0"
            >
              REP {Math.round(state.character.attributes.reputation)}%
            </button>
            <button
              onClick={() => onOpenStatusDetail('Stress')}
              className="px-2 py-0.5 rounded-lg bg-[#1a1a20] border border-orange-500/20 text-[10px] font-mono font-bold text-orange-400 shrink-0"
            >
              STR {Math.round(state.character.attributes.stress)}%
            </button>
          </div>

          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-amber-400 text-zinc-950 text-[10px] font-mono font-black shrink-0 flex items-center gap-1 cursor-pointer active:scale-95"
            title="Open Full Status HUD"
          >
            <Activity className="w-3 h-3 text-zinc-950" />
            <span>HUD</span>
          </button>
        </div>

        {/* The Selected Game View / Screen */}
        <div className="w-full max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      {/* Desktop / Tablet Right Docked Status Bar */}
      {statusBarPosition === 'right' && (
        <div className="hidden md:flex shrink-0 sticky top-[98px] sm:top-[104px] h-[calc(100vh-160px)] z-10">
          <FloatingStatusBar
            state={state}
            position="right"
            onTogglePosition={onToggleStatusBarPosition}
            onOpenStatusDetail={onOpenStatusDetail}
            onOpenPowerProfile={onOpenPowerProfile}
            onOpenProgressionProfile={onOpenProgressionProfile}
            onOpenDecisionInbox={onOpenDecisionInbox}
            onOpenObjectives={onOpenObjectives}
            isCollapsed={isDesktopCollapsed}
            onToggleCollapse={() => setIsDesktopCollapsed(prev => !prev)}
          />
        </div>
      )}

      {/* Mobile Drawer Modal for Full Status HUD (when opened on small screens) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end md:hidden animate-fade-in">
          <div 
            className={`w-[280px] max-w-[85vw] h-full bg-[#121216] border-l border-zinc-800 shadow-2xl flex flex-col p-3 overflow-y-auto animate-slide-in-right ${
              statusBarPosition === 'left' ? 'self-start mr-auto border-r border-l-0' : 'self-end ml-auto'
            }`}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black uppercase text-zinc-200">Vitals & Status HUD</span>
              </div>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200 flex items-center justify-center cursor-pointer"
                aria-label="Close HUD Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <FloatingStatusBar
              state={state}
              position={statusBarPosition}
              onTogglePosition={onToggleStatusBarPosition}
              onOpenStatusDetail={(attr) => {
                setIsMobileDrawerOpen(false);
                onOpenStatusDetail(attr);
              }}
              onOpenPowerProfile={() => {
                setIsMobileDrawerOpen(false);
                if (onOpenPowerProfile) onOpenPowerProfile();
              }}
              onOpenProgressionProfile={() => {
                setIsMobileDrawerOpen(false);
                if (onOpenProgressionProfile) onOpenProgressionProfile();
              }}
              onOpenDecisionInbox={() => {
                setIsMobileDrawerOpen(false);
                if (onOpenDecisionInbox) onOpenDecisionInbox();
              }}
              onOpenObjectives={() => {
                setIsMobileDrawerOpen(false);
                if (onOpenObjectives) onOpenObjectives();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
