import React, { useState } from 'react';
import { GameState, EducationRecord, UniversityProgram, UniversityInstitution } from '../../types';
import { UNIVERSITIES_CATALOG } from '../../data/lifeCatalogs';
import { ensureLifeSystemState, applyToUniversity, enrollInAcceptedProgram } from '../../engine/lifeEngine';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  DollarSign, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Star,
  Globe,
  Building
} from 'lucide-react';

interface LifeEducationUniversitiesViewProps {
  state: GameState;
  onEnrollEducation?: (edu: any) => void;
}

export const LifeEducationUniversitiesView: React.FC<LifeEducationUniversitiesViewProps> = ({
  state
}) => {
  const life = ensureLifeSystemState(state);
  const { character, education, finances } = state;
  const activeDegree = education.find(e => !e.completed);
  const completedDegrees = education.filter(e => e.completed);

  const [selectedDegreeLevel, setSelectedDegreeLevel] = useState<string>('All');
  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleApply = (uniId: string, progId: string) => {
    const res = applyToUniversity(state, uniId, progId);
    showFeedback(res.message);
  };

  const handleEnroll = (appId: string) => {
    const res = enrollInAcceptedProgram(state, appId);
    showFeedback(res.message);
  };

  const pendingOrAcceptedApps = life.universityApplications || [];

  return (
    <div className="space-y-4">
      {feedback && (
        <div className="p-3 bg-zinc-900 border border-sky-400/40 rounded-xl text-xs font-bold text-sky-300 shadow-lg flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 1. ACTIVE DEGREE PROGRESS BANNER */}
      <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div>
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Academic Status</span>
            <h3 className="text-lg sm:text-xl font-black text-zinc-100">
              {activeDegree ? `${activeDegree.qualification} in ${activeDegree.field}` : 'Not Currently Matriculated'}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {activeDegree ? activeDegree.institution : 'Explore universities below to apply for undergraduate or graduate degrees.'}
            </p>
          </div>

          {activeDegree && (
            <div className="text-right">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Monthly Tuition</span>
              <div className="text-base font-black text-amber-400">
                ${(activeDegree.tuitionPerMonth || 0).toLocaleString()}/mo
              </div>
            </div>
          )}
        </div>

        {activeDegree ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Progress</span>
                <div className="font-black text-sky-400 text-sm mt-0.5">{activeDegree.monthsCompleted} / {activeDegree.durationMonths} Mos</div>
              </div>
              <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Cumulative GPA</span>
                <div className="font-black text-emerald-400 text-sm mt-0.5">{life.currentDegreeStatus?.gpa || '3.80'} / 4.0</div>
              </div>
              <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Standing</span>
                <div className="font-bold text-zinc-200 text-xs mt-0.5">{life.currentDegreeStatus?.academicStanding || 'Good Standing'}</div>
              </div>
              <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Monthly Study</span>
                <div className="font-black text-amber-400 text-sm mt-0.5">{life.timeAllocation.studyHours}h / month</div>
              </div>
            </div>

            <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800 flex">
              <div 
                className="h-full bg-gradient-to-r from-sky-500 to-sky-300 rounded-full transition-all"
                style={{ width: `${(activeDegree.monthsCompleted / activeDegree.durationMonths) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="text-xs text-zinc-400">
            Higher education accelerates intelligence growth, unlocks executive career ladders, and boosts global prestige.
          </p>
        )}
      </div>

      {/* 2. ADMISSION APPLICATIONS TRACKER */}
      {pendingOrAcceptedApps.length > 0 && (
        <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-xl space-y-3">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Active University Applications ({pendingOrAcceptedApps.length})
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pendingOrAcceptedApps.map(app => {
              const uni = UNIVERSITIES_CATALOG.find(u => u.id === app.universityId);
              const prog = uni?.programs.find(p => p.id === app.programId);
              if (!uni || !prog) return null;

              return (
                <div key={app.id} className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-extrabold text-xs text-zinc-100">{prog.name}</div>
                    <div className="text-[11px] text-zinc-400">{uni.name}</div>
                    <div className="text-[10px] font-mono">
                      {app.status === 'Accepted' && <span className="text-emerald-400 font-bold">Accepted • Ready to Enroll</span>}
                      {app.status === 'Scholarship Offered' && <span className="text-amber-400 font-bold">Accepted + $${app.scholarshipAmountMonthly}/mo Scholarship!</span>}
                      {app.status === 'Pending' && <span className="text-sky-400 font-bold">Under Review by Admissions Committee</span>}
                      {app.status === 'Rejected' && <span className="text-red-400 font-bold">Application Denied</span>}
                    </div>
                  </div>

                  <div>
                    {(app.status === 'Accepted' || app.status === 'Scholarship Offered') && (
                      <button
                        onClick={() => handleEnroll(app.id)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-lg text-xs transition-all cursor-pointer"
                      >
                        Matriculate
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. UNIVERSITIES & DEGREES CATALOG */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Prestigious Academies & Degree Offerings
          </h4>

          <div className="flex items-center gap-1">
            {['All', 'Bachelor', 'Master', 'PhD'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setSelectedDegreeLevel(lvl)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedDegreeLevel === lvl
                    ? 'bg-sky-500 text-zinc-950 font-black'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {UNIVERSITIES_CATALOG.map(uni => {
            const filteredPrograms = selectedDegreeLevel === 'All'
              ? uni.programs
              : uni.programs.filter(p => p.degreeLevel === selectedDegreeLevel);

            return (
              <div key={uni.id} className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4 shadow-md">
                <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-black text-sm text-zinc-100">{uni.name}</h5>
                      <span className="text-[10px] bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full font-bold">
                        Prestige: {uni.prestige}%
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{uni.city}, {uni.country}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80">
                  <div>
                    <span className="text-zinc-400">Quality</span>
                    <div className="font-bold text-zinc-200">{uni.academicQuality}%</div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Networking</span>
                    <div className="font-bold text-zinc-200">{uni.networkingStrength}%</div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Placement</span>
                    <div className="font-bold text-emerald-400">{uni.careerPlacementRate}%</div>
                  </div>
                </div>

                {/* Programs List */}
                <div className="space-y-2">
                  {filteredPrograms.map(prog => {
                    const hasApp = pendingOrAcceptedApps.some(a => a.universityId === uni.id && a.programId === prog.id);
                    const meetsIntel = character.attributes.intelligence >= prog.requiredIntelligence;

                    return (
                      <div key={prog.id} className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="font-extrabold text-xs text-zinc-200">{prog.name}</div>
                          <div className="text-[11px] font-mono text-sky-400 font-bold">
                            ${(prog.tuitionPerMonth || 0).toLocaleString()}/mo • {prog.durationMonths} Mos
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            Required Intellect: ≥{prog.requiredIntelligence} (Yours: {Math.round(character.attributes.intelligence)})
                          </div>
                        </div>

                        <div>
                          {hasApp ? (
                            <span className="text-[11px] font-bold text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-lg">
                              Applied
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApply(uni.id, prog.id)}
                              className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-zinc-950 rounded-lg text-xs font-black transition-all cursor-pointer"
                            >
                              Apply ($150)
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
