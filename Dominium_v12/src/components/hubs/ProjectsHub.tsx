import React, { useState } from 'react';
import { GameState, MajorProject } from '../../types';
import { MAJOR_PROJECTS_TEMPLATES } from '../../data/catalogs';
import { 
  Layers, 
  Plus, 
  Building, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  DollarSign,
  TrendingUp
} from 'lucide-react';

interface ProjectsHubProps {
  state: GameState;
  onStartProject: (template: any, initialFunding: number) => void;
  onFundProject: (projectId: string, additionalCapital: number) => void;
}

export const ProjectsHub: React.FC<ProjectsHubProps> = ({
  state,
  onStartProject,
  onFundProject
}) => {
  const { projects, finances } = state;
  const [fundingAmount, setFundingAmount] = useState<number>(5000000);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Megaprojects & Infrastructure
          </span>
          <h3 className="text-xl font-black text-zinc-100 mt-0.5">
            {projects.filter(p => !p.completed).length} Active Construction Initiative{projects.filter(p => !p.completed).length === 1 ? '' : 's'}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Construct monumental headquarters, luxury commercial complexes, and scientific research institutes.
          </p>
        </div>
      </div>

      {/* Active Projects List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Under Development ({projects.length})
        </h4>

        {projects.length === 0 ? (
          <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 text-center text-xs text-zinc-400">
            No active megaprojects commissioned. Select an initiative below to break ground.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projects.map(proj => {
              const progressPct = Math.min(100, Math.round((proj.monthsProgress / proj.durationMonths) * 100));

              return (
                <div key={proj.id} className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-3.5 shadow-md">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                    <div>
                      <h5 className="font-black text-sm text-zinc-100">{proj.name}</h5>
                      <span className="text-[11px] text-amber-400 font-bold">{proj.type} • Risk: {proj.riskFactor}</span>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      proj.completed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {proj.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-zinc-300">
                      <span>Timeline: {proj.monthsProgress} / {proj.durationMonths} months</span>
                      <span className="text-amber-400">{progressPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80">
                      <span className="text-zinc-400 font-bold block">Total Budget</span>
                      <b className="text-zinc-200 mt-0.5 block">${(proj.totalBudgetRequired / 1000000).toFixed(1)}M</b>
                    </div>
                    <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80">
                      <span className="text-zinc-400 font-bold block">Reputation</span>
                      <b className="text-amber-400 mt-0.5 block">+{proj.expectedReputationBoost}</b>
                    </div>
                    <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80">
                      <span className="text-zinc-400 font-bold block">Influence</span>
                      <b className="text-amber-300 mt-0.5 block">+{proj.expectedInfluenceBoost}</b>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Megaprojects to Launch */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Commission New Landmark Projects
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MAJOR_PROJECTS_TEMPLATES.map(template => {
            const isAlreadyActive = projects.some(p => p.name === template.name && !p.completed);
            const canAfford = finances.cash >= template.totalBudgetRequired * 0.1; // 10% seed capital required

            return (
              <div key={template.name} className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-3.5 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-black text-sm text-zinc-100">{template.name}</h5>
                    <span className="text-[11px] text-amber-400 font-bold">{template.type}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold">Total Capital</span>
                    <div className="text-sm font-black text-amber-300">
                      ${(template.totalBudgetRequired / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>

                <div className="text-xs text-zinc-300 bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80 flex justify-between">
                  <span>Duration: <b className="text-zinc-100 font-bold">{template.durationMonths} months</b></span>
                  <span>Projected Yield: <b className="text-emerald-400 font-bold">+${(template.expectedMonthlyIncomeBoost / 1000).toFixed(0)}k/mo</b></span>
                </div>

                <button
                  onClick={() => onStartProject(template, template.totalBudgetRequired * 0.1)}
                  disabled={isAlreadyActive || !canAfford}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    !isAlreadyActive && canAfford
                      ? 'bg-zinc-800 hover:bg-zinc-750 active:scale-[0.99] text-zinc-100 border border-zinc-700'
                      : 'bg-zinc-950 text-zinc-600 border border-zinc-900 cursor-not-allowed'
                  }`}
                >
                  {isAlreadyActive ? 'Currently Under Construction' : canAfford ? `Break Ground (10% Initial Seed: $${(template.totalBudgetRequired * 0.1).toLocaleString()})` : 'Insufficient Capital'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
