import React, { useState } from 'react';
import { 
  GameState, 
  ExpandedCareerProfile, 
  ProfessionalLicense, 
  OccupationTemplate,
  InterviewState 
} from '../../types';
import { 
  Briefcase, 
  Award, 
  GraduationCap, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign,
  ChevronRight,
  ShieldAlert,
  Zap,
  Target
} from 'lucide-react';
import { 
  ensureExpandedCareerProfile, 
  studyForProfessionalLicense, 
  takeLicenseExam, 
  applyForExpandedJob, 
  answerInterviewQuestion, 
  setWorkHoursPace, 
  negotiateSalaryIncrease 
} from '../../engine/careerEngine';
import { EXPANSION2_LICENSES, EXPANSION2_OCCUPATIONS } from '../../data/expansion2Catalogs';

interface ExpandedCareerSectionProps {
  state: GameState;
  onStateChange?: () => void;
}

export const ExpandedCareerSection: React.FC<ExpandedCareerSectionProps> = ({ 
  state, 
  onStateChange 
}) => {
  const career = ensureExpandedCareerProfile(state);

  const [activeTab, setActiveTab] = useState<'current' | 'licensing' | 'job_market' | 'board_roles'>('current');
  const [feedback, setFeedback] = useState<{ msg: string; isError?: boolean } | null>(null);

  const showToast = (msg: string, isError: boolean = false) => {
    setFeedback({ msg, isError });
    setTimeout(() => setFeedback(null), 5000);
    if (onStateChange) onStateChange();
  };

  const handleStudy = (licenseId: string) => {
    const res = studyForProfessionalLicense(state, licenseId);
    showToast(res.message, !res.success);
  };

  const handleTakeExam = (licenseId: string) => {
    const res = takeLicenseExam(state, licenseId);
    showToast(res.message, !res.success);
  };

  const handleApplyJob = (jobId: string) => {
    const res = applyForExpandedJob(state, jobId);
    showToast(res.message, !res.success);
  };

  const handleAnswerInterview = (answerIdx: number) => {
    const res = answerInterviewQuestion(state, answerIdx);
    showToast(res.message, !res.success);
  };

  const handleSetPace = (hours: number) => {
    const res = setWorkHoursPace(state, hours);
    showToast(res.message, !res.success);
  };

  const handleNegotiate = () => {
    const res = negotiateSalaryIncrease(state);
    showToast(res.message, !res.success);
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {feedback && (
        <div className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-2 ${
          feedback.isError ? 'bg-rose-950/80 border-rose-700/80 text-rose-200' : 'bg-emerald-950/80 border-emerald-700/80 text-emerald-200'
        }`}>
          {feedback.isError ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Active Interview Interstitial */}
      {career.activeInterview && (
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 sm:p-6 rounded-2xl border border-amber-500/50 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Active Executive Interview Panel</span>
              <h3 className="text-base font-black text-zinc-100 mt-0.5">{career.activeInterview.targetJobTitle}</h3>
              <div className="text-xs text-zinc-400">Employer: {career.activeInterview.companyName}</div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Score: {career.activeInterview.accumulatedScore} pts
              </span>
            </div>
          </div>

          <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-3">
            <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
              Question {career.activeInterview.currentQuestionIndex + 1} of {career.activeInterview.questions.length}:
            </div>
            <p className="text-sm font-bold text-zinc-100">
              "{career.activeInterview.questions[career.activeInterview.currentQuestionIndex]?.prompt}"
            </p>
          </div>

          <div className="space-y-2">
            {career.activeInterview.questions[career.activeInterview.currentQuestionIndex]?.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswerInterview(idx)}
                className="w-full text-left p-3.5 rounded-xl bg-zinc-900 hover:bg-amber-500/10 hover:border-amber-500/50 border border-zinc-800 text-xs font-bold text-zinc-200 transition-all flex items-center justify-between group"
              >
                <span>{opt.text}</span>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Top Banner Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 shadow-sm">
          <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Current Occupation</div>
          <div className="text-base sm:text-lg font-black text-zinc-100 mt-0.5 truncate">
            {career.activeJobRecord?.title || state.currentJob?.title || 'Independent / Unemployed'}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">{career.activeJobRecord?.employer || 'Self-Directed'}</div>
        </div>

        <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 shadow-sm">
          <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Monthly Base Salary</div>
          <div className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">
            +${(career.activeJobRecord?.salaryMonthly || state.currentJob?.monthlySalary || 0).toLocaleString()}/mo
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Annual: ${((career.activeJobRecord?.salaryMonthly || state.currentJob?.monthlySalary || 0) * 12).toLocaleString()}</div>
        </div>

        <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 shadow-sm">
          <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Job Performance Rating</div>
          <div className="text-base sm:text-lg font-black text-amber-400 mt-0.5">
            {career.activeJobRecord?.performance || state.currentJob?.performance || 50}%
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Workload: {career.activeJobRecord?.hoursPerWeek || 40} hrs/wk</div>
        </div>

        <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 shadow-sm">
          <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Accredited Licenses</div>
          <div className="text-base sm:text-lg font-black text-purple-400 mt-0.5">
            {career.obtainedLicenses.length} Credentials
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Board Seats: {career.boardDirectorships.length}</div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2 overflow-x-auto scrollbar-none">
        {[
          { key: 'current', label: 'My Career & Performance', icon: <Briefcase className="w-3.5 h-3.5" /> },
          { key: 'licensing', label: `Professional Licenses (${career.obtainedLicenses.length}/${EXPANSION2_LICENSES.length})`, icon: <Award className="w-3.5 h-3.5" /> },
          { key: 'job_market', label: 'Executive Job Market', icon: <GraduationCap className="w-3.5 h-3.5" /> },
          { key: 'board_roles', label: `Corporate Boards (${career.boardDirectorships.length})`, icon: <TrendingUp className="w-3.5 h-3.5" /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: CURRENT CAREER */}
      {activeTab === 'current' && (
        <div className="space-y-4">
          {career.activeJobRecord ? (
            <div className="bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-4">
              <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-zinc-100">{career.activeJobRecord.title}</h3>
                  <div className="text-xs text-zinc-400 mt-0.5">{career.activeJobRecord.employer} &bull; Tier {career.activeJobRecord.tierLevel}</div>
                </div>
                <button
                  onClick={handleNegotiate}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                >
                  Negotiate Salary Raise
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Monthly Comp</div>
                  <div className="text-sm font-black text-emerald-400 mt-0.5">${career.activeJobRecord.salaryMonthly.toLocaleString()}</div>
                </div>
                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Performance</div>
                  <div className="text-sm font-black text-amber-400 mt-0.5">{career.activeJobRecord.performance}%</div>
                </div>
                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Tenure</div>
                  <div className="text-sm font-black text-zinc-200 mt-0.5">{career.activeJobRecord.tenureMonths} Months</div>
                </div>
                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Promotions Won</div>
                  <div className="text-sm font-black text-purple-400 mt-0.5">{career.activeJobRecord.promotionsEarned}</div>
                </div>
              </div>

              {/* Work Hours Allocation */}
              <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-3">
                <div className="text-xs font-black text-zinc-200 flex items-center justify-between">
                  <span>Work Hours & Ambition Pace</span>
                  <span className="text-amber-400">{career.activeJobRecord.hoursPerWeek} Hours / Week</span>
                </div>
                <div className="flex gap-2">
                  {[
                    { hrs: 35, label: 'Work-Life Balance (35h)', desc: 'Low stress, moderate gain' },
                    { hrs: 40, label: 'Standard Corporate (40h)', desc: 'Normal progression' },
                    { hrs: 60, label: 'High-Growth Hustle (60h)', desc: '+Performance, +Stress' },
                    { hrs: 80, label: 'Relentless Partner Track (80h)', desc: 'Max promotion odds, high fatigue' }
                  ].map(item => (
                    <button
                      key={item.hrs}
                      onClick={() => handleSetPace(item.hrs)}
                      className={`flex-1 p-2.5 rounded-xl border text-left transition-all ${
                        career.activeJobRecord?.hoursPerWeek === item.hrs
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900/60 p-8 rounded-2xl border border-zinc-800 text-center space-y-3">
              <Briefcase className="w-10 h-10 text-zinc-600 mx-auto" />
              <div className="text-sm font-bold text-zinc-300">Currently Unemployed in Corporate Sector</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Attain certified professional licenses and apply for top-tier law, investment banking, medical, or tech roles.
              </p>
              <button
                onClick={() => setActiveTab('job_market')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black rounded-xl transition-colors shadow-md"
              >
                Browse Job Market
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LICENSING */}
      {activeTab === 'licensing' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EXPANSION2_LICENSES.map(lic => {
            const isObtained = career.obtainedLicenses.includes(lic.id);
            const studyProgress = career.studyProgress[lic.id] || 0;
            const hasCash = (state.finances?.cash || 0) >= lic.tuitionCost;

            return (
              <div key={lic.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-black text-zinc-100">{lic.name}</h4>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{lic.regulatoryBody} &bull; {lic.field}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    isObtained 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}>
                    {isObtained ? 'ACCREDITED' : `Diff: ${lic.difficultyLevel}/10`}
                  </span>
                </div>

                <p className="text-[11px] text-zinc-400 line-clamp-2">{lic.description}</p>

                <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-500">Study Progress:</span>
                    <span className="font-bold text-amber-400">{studyProgress} / {lic.studyHoursRequired} Hours</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.round((studyProgress / lic.studyHoursRequired) * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-500">Tuition & Exam Fee:</span>
                    <span className="font-bold text-zinc-200">${lic.tuitionCost.toLocaleString()}</span>
                  </div>
                </div>

                {!isObtained && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleStudy(lic.id)}
                      disabled={!hasCash}
                      className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-700 transition-colors"
                    >
                      Study 10 Hours ($2,500)
                    </button>
                    <button
                      onClick={() => handleTakeExam(lic.id)}
                      disabled={studyProgress < Math.round(lic.studyHoursRequired * 0.5)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 text-xs font-black rounded-xl transition-colors shadow-sm"
                    >
                      Sit for Exam
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: JOB MARKET */}
      {activeTab === 'job_market' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {EXPANSION2_OCCUPATIONS.map(occ => {
            const hasLicense = !occ.requiredLicenseId || career.obtainedLicenses.includes(occ.requiredLicenseId);

            return (
              <div key={occ.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-black text-zinc-100">{occ.title}</h4>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{occ.industry} &bull; Tier {occ.tierLevel}</div>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-emerald-400">
                    +${occ.baseSalaryMonthly.toLocaleString()}/mo
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Min Intelligence:</span>
                    <span className="font-bold text-zinc-200">{occ.minIntelligence}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Annual Bonus:</span>
                    <span className="font-bold text-amber-400">+${occ.annualBonusPotential.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Required License:</span>
                    <span className={hasLicense ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {occ.requiredLicenseId || 'None'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleApplyJob(occ.id)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
                >
                  Apply & Interview <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: BOARD ROLES */}
      {activeTab === 'board_roles' && (
        <div className="space-y-3">
          {career.boardDirectorships.length === 0 ? (
            <div className="bg-zinc-900/60 p-8 rounded-2xl border border-zinc-800 text-center space-y-3">
              <TrendingUp className="w-10 h-10 text-zinc-600 mx-auto" />
              <div className="text-sm font-bold text-zinc-300">No Non-Executive Board Directorships</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Ascend to high reputation, executive career tiers, or significant corporate equity stakes to be invited onto Corporate Boards of Directors.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {career.boardDirectorships.map(seat => (
                <div key={seat.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-black text-zinc-100">{seat.corporationName}</h4>
                      <div className="text-[11px] text-zinc-400">{seat.seatType} &bull; Chair of {seat.committeeAssignment}</div>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      +${seat.monthlyRetainer.toLocaleString()}/mo
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
