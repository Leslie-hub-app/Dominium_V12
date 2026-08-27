import React, { useState } from 'react';
import { GameState, MonthlyTimeAllocation } from '../../types';
import { ensureLifeSystemState, calculateMonthlyTimeBudget, DEFAULT_MONTHLY_ALLOCATION, getLifeAllocationTotals } from '../../engine/lifeEngine';
import { Briefcase, GraduationCap, Heart, Users, Share2, Palette, HeartPulse, Clock, CheckCircle2, RotateCcw, Building2 } from 'lucide-react';

interface LifeScheduleViewProps { state: GameState; onUpdateAllocation: (allocation: MonthlyTimeAllocation) => void; }

type CategoryKey = 'careerHours' | 'educationHours' | 'familyHours' | 'partnerHours' | 'friendsHours' | 'wellnessHours' | 'hobbiesHours' | 'socialMediaHours' | 'entrepreneurshipHours';

const CATEGORIES: Array<{ key: CategoryKey; label: string; icon: React.ReactNode; color: string; max: number; description: string }> = [
  { key: 'careerHours', label: 'Career', icon: <Briefcase className="w-4 h-4" />, color: 'amber', max: 400, description: 'Productivity, work performance, experience and promotion readiness.' },
  { key: 'educationHours', label: 'Education', icon: <GraduationCap className="w-4 h-4" />, color: 'sky', max: 260, description: 'Intelligence and academic progress with diminishing returns.' },
  { key: 'familyHours', label: 'Family', icon: <Users className="w-4 h-4" />, color: 'rose', max: 260, description: 'Improves relationships with family NPCs.' },
  { key: 'partnerHours', label: 'Partner', icon: <Heart className="w-4 h-4" />, color: 'pink', max: 240, description: 'Improves love, trust and relationship stability.' },
  { key: 'friendsHours', label: 'Friends', icon: <Users className="w-4 h-4" />, color: 'violet', max: 220, description: 'Improves relationships with friend NPCs.' },
  { key: 'wellnessHours', label: 'Wellness', icon: <HeartPulse className="w-4 h-4" />, color: 'emerald', max: 240, description: 'Improves health and reduces stress.' },
  { key: 'hobbiesHours', label: 'Hobbies', icon: <Palette className="w-4 h-4" />, color: 'orange', max: 220, description: 'Fun activities improve happiness and provide secondary benefits.' },
  { key: 'socialMediaHours', label: 'Social Media', icon: <Share2 className="w-4 h-4" />, color: 'blue', max: 200, description: 'Builds followers; quality, reputation and algorithms also matter.' },
  { key: 'entrepreneurshipHours', label: 'Entrepreneurship', icon: <Building2 className="w-4 h-4" />, color: 'yellow', max: 300, description: 'Improves management contribution to player-controlled companies without determining their performance alone.' }
];

function primaryAllocation(life: ReturnType<typeof ensureLifeSystemState>): Record<CategoryKey, number> {
  const t = getLifeAllocationTotals(life.timeAllocation);
  return { careerHours: t.career, educationHours: t.education, familyHours: t.family, partnerHours: t.partner, friendsHours: t.friends, wellnessHours: t.wellness, hobbiesHours: t.hobbies, socialMediaHours: t.socialMedia, entrepreneurshipHours: t.entrepreneurship };
}

export const LifeScheduleView: React.FC<LifeScheduleViewProps> = ({ state, onUpdateAllocation }) => {
  const life = ensureLifeSystemState(state);
  const [allocation, setAllocation] = useState<Record<CategoryKey, number>>(primaryAllocation(life));
  const [saved, setSaved] = useState(false);
  const total = CATEGORIES.reduce((sum, category) => sum + allocation[category.key], 0);
  const budget = calculateMonthlyTimeBudget({ ...life.timeAllocation, ...allocation, workHours: allocation.careerHours, overtimeHours: 0, educationHours: Math.round(allocation.educationHours * 0.65), studyHours: Math.round(allocation.educationHours * 0.35), datingHours: allocation.partnerHours, fitnessHours: Math.round(allocation.wellnessHours * 0.55), wellnessHours: Math.round(allocation.wellnessHours * 0.45) });

  const commit = (next: Record<CategoryKey, number>) => {
    const career = next.careerHours;
    const edu = next.educationHours;
    const wellness = next.wellnessHours;
    const mapped: MonthlyTimeAllocation = {
      ...life.timeAllocation,
      ...next,
      careerHours: career,
      partnerHours: next.partnerHours,
      entrepreneurshipHours: next.entrepreneurshipHours,
      workHours: Math.min(160, career),
      overtimeHours: Math.max(0, career - 160),
      educationHours: Math.round(edu * 0.65),
      studyHours: edu - Math.round(edu * 0.65),
      datingHours: next.partnerHours,
      fitnessHours: Math.round(wellness * 0.55),
      wellnessHours: wellness - Math.round(wellness * 0.55)
    };
    onUpdateAllocation(mapped);
    setSaved(true); setTimeout(() => setSaved(false), 1600);
  };

  const change = (key: CategoryKey, value: number) => {
    const current = allocation[key];
    const delta = value - current;
    if (delta === 0) return;
    const next = { ...allocation, [key]: value };
    if (delta > 0) {
      let remaining = delta;
      const others = CATEGORIES.map(c => c.key).filter(k => k !== key).sort((a, b) => next[b] - next[a]);
      for (const other of others) {
        const take = Math.min(next[other], remaining);
        next[other] -= take;
        remaining -= take;
        if (remaining <= 0) break;
      }
      if (remaining > 0) next[key] -= remaining;
    }
    setAllocation(next); commit(next);
  };

  const reset = () => { const next = primaryAllocation({ ...life, timeAllocation: DEFAULT_MONTHLY_ALLOCATION }); setAllocation(next); commit(next); };

  return <div className="space-y-4">
    <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div><div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Life Operating System</div><h3 className="text-lg font-black text-zinc-100">720-Hour Monthly Allocation</h3><p className="text-xs text-zinc-400 mt-1">All 720 controllable hours are allocated across nine life domains. Effects are monthly, diminishing and interconnected with the wider simulation.</p></div>
        <div className="flex items-center gap-2"><button onClick={reset} className="px-3 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5"/>Balanced Reset</button></div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800"><span className="text-[10px] text-zinc-500">Allocated</span><div className={`text-lg font-black ${total === 720 ? 'text-emerald-400' : 'text-amber-400'}`}>{total}h</div></div>
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800"><span className="text-[10px] text-zinc-500">Remaining</span><div className={`text-lg font-black ${budget.remainingHours === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>{Math.max(0, budget.remainingHours)}h</div></div>
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800"><span className="text-[10px] text-zinc-500">Status</span><div className="text-sm font-black text-emerald-400 mt-1 flex items-center gap-1">{saved ? <><CheckCircle2 className="w-3.5 h-3.5"/> Saved</> : <><Clock className="w-3.5 h-3.5"/> Monthly</>}</div></div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      {CATEGORIES.map(cat => <div key={cat.key} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3">
        <div className="flex items-start justify-between"><div className="flex items-center gap-2"><span className="text-amber-400">{cat.icon}</span><div><h4 className="text-sm font-black text-zinc-100">{cat.label}</h4><p className="text-[10px] text-zinc-500 mt-0.5">{cat.description}</p></div></div><span className="font-mono text-sm font-black text-amber-400">{allocation[cat.key]}h</span></div>
        <input type="range" min={0} max={cat.max} step={5} value={allocation[cat.key]} onChange={e => change(cat.key, Number(e.target.value))} className="w-full accent-amber-400" />
        <div className="flex justify-between text-[10px] text-zinc-500"><span>0h</span><span>{cat.max}h cap</span></div>
      </div>)}
    </div>
  </div>;
};
