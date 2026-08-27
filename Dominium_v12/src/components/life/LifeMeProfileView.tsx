import React, { useState } from 'react';
import { GameState, CharacterPersonality } from '../../types';
import { ensureLifeSystemState } from '../../engine/lifeEngine';
import { 
  User, 
  Sparkles, 
  Calendar, 
  Award, 
  Sliders, 
  Heart, 
  Smile, 
  Flame, 
  Brain, 
  Shield, 
  Globe, 
  Zap,
  Tag,
  Star
} from 'lucide-react';

interface LifeMeProfileViewProps {
  state: GameState;
  onUpdatePersonality?: (personality: CharacterPersonality) => void;
}

export const LifeMeProfileView: React.FC<LifeMeProfileViewProps> = ({
  state
}) => {
  const life = ensureLifeSystemState(state);
  const { character } = state;
  const [activeSection, setActiveSection] = useState<'profile' | 'personality' | 'biography'>('profile');

  const personality = life.personality;
  const biography = life.biography || [];

  return (
    <div className="space-y-4">
      {/* Sub navigation buttons */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveSection('profile')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSection === 'profile'
              ? 'bg-zinc-800 text-amber-400 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Identity & Attributes</span>
        </button>

        <button
          onClick={() => setActiveSection('personality')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSection === 'personality'
              ? 'bg-zinc-800 text-amber-400 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Personality Matrix</span>
        </button>

        <button
          onClick={() => setActiveSection('biography')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSection === 'biography'
              ? 'bg-zinc-800 text-amber-400 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Chronological Timeline ({biography.length})</span>
        </button>
      </div>

      {/* 1. IDENTITY & ATTRIBUTES SECTION */}
      {activeSection === 'profile' && (
        <div className="space-y-4">
          {/* Identity Card */}
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Character Dossier</span>
                <h3 className="text-xl font-black text-zinc-100">{character.firstName} {character.lastName}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Born {character.birthMonth}/{character.birthYear} in {character.birthCity}, {character.birthCountry}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold border border-zinc-700">
                  Credit Score: <strong className="text-amber-400 font-black">{character.creditScore || 720}</strong>
                </span>
                <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold border border-zinc-700">
                  Followers: <strong className="text-zinc-100 font-black">{(character.socialFollowers || 0).toLocaleString()}</strong>
                </span>
              </div>
            </div>

            {/* Core 8 Attributes Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Health', value: character.attributes.health, icon: <Heart className="w-4 h-4 text-rose-400" />, color: 'bg-rose-500' },
                { label: 'Happiness', value: character.attributes.happiness, icon: <Smile className="w-4 h-4 text-amber-400" />, color: 'bg-amber-400' },
                { label: 'Intelligence', value: character.attributes.intelligence, icon: <Brain className="w-4 h-4 text-sky-400" />, color: 'bg-sky-400' },
                { label: 'Stress', value: character.attributes.stress, icon: <Flame className="w-4 h-4 text-orange-400" />, color: 'bg-orange-500', inverted: true },
                { label: 'Charm', value: character.attributes.charm, icon: <Sparkles className="w-4 h-4 text-pink-400" />, color: 'bg-pink-400' },
                { label: 'Attractiveness', value: character.attributes.attractiveness, icon: <Star className="w-4 h-4 text-purple-400" />, color: 'bg-purple-400' },
                { label: 'Reputation', value: character.attributes.reputation, icon: <Shield className="w-4 h-4 text-emerald-400" />, color: 'bg-emerald-400' },
                { label: 'World Influence', value: character.attributes.worldInfluence, icon: <Globe className="w-4 h-4 text-blue-400" />, color: 'bg-blue-400' },
              ].map(attr => (
                <div key={attr.label} className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      {attr.icon}
                      {attr.label}
                    </span>
                    <span className="text-xs font-black text-zinc-100">{Math.round(attr.value)}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full ${attr.color} rounded-full`} style={{ width: `${Math.min(100, Math.max(0, attr.value))}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. PERSONALITY MATRIX */}
      {activeSection === 'personality' && (
        <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-black text-zinc-100">Personality & Behavioral Profile</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              These fundamental traits shape career promotions, risk decisions, relationship compatibility, and entrepreneurial effectiveness.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              { label: 'Ambition & Drive', value: personality.ambition, desc: 'High drive accelerates promotions and empire expansion.' },
              { label: 'Executive Discipline', value: personality.discipline, desc: 'Enables consistent study habits and prevents schedule burnout.' },
              { label: 'Sociability & Extroversion', value: personality.sociability, desc: 'Boosts networking impact and dating compatibility.' },
              { label: 'Creative Vision', value: personality.creativity, desc: 'Unlocks innovative business solutions and cultural prestige.' },
              { label: 'Empathy & EQ', value: personality.empathy, desc: 'Deepens family bonds and boosts team morale.' },
              { label: 'Leadership Authority', value: personality.leadership, desc: 'Inspires subordinate loyalty and executive boardroom support.' },
              { label: 'Patience & Composure', value: personality.patience, desc: 'Reduces volatility impact and aids negotiations.' },
              { label: 'Risk Tolerance', value: personality.riskTolerance, desc: 'Governs appetite for aggressive corporate M&A and venture stakes.' },
            ].map(trait => (
              <div key={trait.label} className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-zinc-200">{trait.label}</span>
                  <span className="font-mono font-black text-xs text-amber-400">{trait.value}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full" style={{ width: `${trait.value}%` }} />
                </div>
                <p className="text-[10px] text-zinc-400 leading-tight">{trait.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CHRONOLOGICAL LIFE BIOGRAPHY & TIMELINE */}
      {activeSection === 'biography' && (
        <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-base font-black text-zinc-100">Chronological Life Chronicles</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Every pivotal milestone, promotion, relationship event, and achievement recorded by Year and Month.
              </p>
            </div>
            <span className="text-xs font-bold text-zinc-400">
              Current: Month {state.currentMonth}, {state.currentYear}
            </span>
          </div>

          <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-zinc-800">
            {biography.map((entry) => (
              <div key={entry.id} className="relative flex items-start gap-4 pl-1">
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs shrink-0 z-10 ${
                  entry.significance === 'Historic' ? 'bg-amber-400 text-zinc-950 border-amber-300 font-black' :
                  entry.significance === 'Major' ? 'bg-sky-500 text-zinc-950 border-sky-400 font-bold' :
                  'bg-zinc-800 text-zinc-300 border-zinc-700'
                }`}>
                  •
                </div>
                <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800/80 flex-1 space-y-1 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="font-extrabold text-xs text-zinc-100">{entry.title}</span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Age {entry.ageYears}y {entry.ageMonths}m • M{entry.month}/{entry.year}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{entry.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
