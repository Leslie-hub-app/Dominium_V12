import React, { useState } from 'react';
import { GameState } from '../types';
import { createInitialGameState } from '../engine/simulationEngine';
import { loadGameFromSlot } from '../engine/saveEngine';
import { getAllCampaigns } from '../engine/objectiveEngine';
import { 
  Crown, 
  Sparkles, 
  Globe, 
  User, 
  Briefcase, 
  ShieldCheck, 
  ArrowRight, 
  Play, 
  Save, 
  Zap,
  Target,
  Compass,
  Heart,
  Building2,
  Layers,
  Landmark
} from 'lucide-react';

interface WelcomeScreenProps {
  onStartNewGame: (gameState: GameState) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartNewGame }) => {
  const [activeTab, setActiveTab] = useState<'custom' | 'campaigns'>('custom');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('camp_sandbox');
  const [firstName, setFirstName] = useState<string>('Marcus');
  const [lastName, setLastName] = useState<string>('Sterling');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Non-binary'>('Male');
  const [selectedCountry, setSelectedCountry] = useState<string>('United States');
  const [selectedCity, setSelectedCity] = useState<string>('New York');
  const [background, setBackground] = useState<'Working Class' | 'Middle Class' | 'Affluent Old Money' | 'Political Dynasty'>('Middle Class');
  const [trait, setTrait] = useState<string>('Tech Savant');
  const [difficulty, setDifficulty] = useState<'Relaxed' | 'Realistic' | 'Hard' | 'Extreme'>('Realistic');

  const campaigns = getAllCampaigns();

  const countryCityMap: Record<string, string[]> = {
    'United States': ['New York', 'San Francisco', 'Austin'],
    'United Kingdom': ['London', 'Manchester'],
    'South Africa': ['Johannesburg', 'Cape Town'],
    'Germany': ['Berlin', 'Munich'],
    'Japan': ['Tokyo'],
    'Singapore': ['Singapore City'],
  };

  const handleCountryChange = (c: string) => {
    setSelectedCountry(c);
    setSelectedCity(countryCityMap[c][0]);
  };

  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    const newGame = createInitialGameState(
      firstName || 'Marcus',
      lastName || 'Sterling',
      gender,
      selectedCountry,
      selectedCity,
      'Life Mode',
      difficulty,
      selectedCampaignId === 'camp_sandbox' ? undefined : selectedCampaignId
    );
    if (background === 'Affluent Old Money') {
      newGame.finances.cash += 150000;
      newGame.character.attributes.reputation += 15;
    } else if (background === 'Political Dynasty') {
      newGame.finances.cash += 75000;
      newGame.character.attributes.worldInfluence += 15;
    } else if (background === 'Middle Class') {
      newGame.finances.cash += 15000;
    }
    onStartNewGame(newGame);
  };

  const handleLaunchCampaign = (campId: string) => {
    const campaign = campaigns.find(c => c.id === campId);
    const newGame = createInitialGameState(
      firstName || 'Marcus',
      lastName || 'Sterling',
      gender,
      selectedCountry,
      selectedCity,
      'Life Mode',
      campaign ? campaign.difficulty : difficulty,
      campId
    );
    onStartNewGame(newGame);
  };

  const [slotFeedback, setSlotFeedback] = useState<string | null>(null);

  const handleLoadSlot = (slot: number) => {
    try {
      const loaded = loadGameFromSlot(`slot_${slot}`);
      if (loaded) {
        onStartNewGame(loaded);
      } else {
        setSlotFeedback(`No saved game found in Slot #${slot}`);
        setTimeout(() => setSlotFeedback(null), 3000);
      }
    } catch (e) {
      setSlotFeedback(`Failed to load save from Slot #${slot}`);
      setTimeout(() => setSlotFeedback(null), 3000);
    }
  };

  const getCampaignIcon = (iconName: string) => {
    switch (iconName) {
      case 'DollarSign': return <Zap className="w-4 h-4 text-emerald-400" />;
      case 'Building2': return <Building2 className="w-4 h-4 text-blue-400" />;
      case 'Layers': return <Layers className="w-4 h-4 text-amber-400" />;
      case 'Landmark': return <Landmark className="w-4 h-4 text-purple-400" />;
      case 'Globe': return <Globe className="w-4 h-4 text-cyan-400" />;
      case 'Heart': return <Heart className="w-4 h-4 text-rose-400" />;
      case 'Crown': return <Crown className="w-4 h-4 text-amber-300" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-yellow-300" />;
      default: return <Compass className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 flex flex-col justify-center items-center p-4 sm:p-6 select-none font-sans">
      <div className="w-full max-w-2xl space-y-5">
        {/* Title Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-amber-400 text-[11px] font-bold uppercase tracking-widest shadow-sm">
            <Crown className="w-3.5 h-3.5 text-amber-400" /> Life • Business • Objectives & Sovereign Power
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-100 font-serif">
            DOMINIUM
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            A comprehensive living-world simulation of macroeconomics, corporate empires, dynastic succession, and sovereign power.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'custom'
                ? 'bg-amber-400 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Custom Character & Sandbox</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('campaigns')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'campaigns'
                ? 'bg-amber-400 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Campaigns & Career Paths</span>
          </button>
        </div>

        {/* 1. CAMPAIGNS TAB */}
        {activeTab === 'campaigns' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
              {campaigns.map(camp => (
                <div
                  key={camp.id}
                  onClick={() => handleLaunchCampaign(camp.id)}
                  className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-400/50 p-4 rounded-2xl cursor-pointer transition-all space-y-2 group shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-8 h-8 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center group-hover:border-amber-400/50 transition-colors">
                      {getCampaignIcon(camp.iconName)}
                    </div>
                    <span className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-950 text-amber-400 border border-zinc-800">
                      {camp.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-zinc-100 group-hover:text-amber-300 transition-colors">
                      {camp.title}
                    </h4>
                    <span className="text-[10px] text-zinc-500 font-medium block">{camp.subtitle}</span>
                  </div>

                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {camp.description}
                  </p>

                  <div className="pt-1.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500">
                    <span>Diff: <b className="text-zinc-300">{camp.difficulty}</b></span>
                    <span className="text-amber-400 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Launch <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. CUSTOM CHARACTER CREATION */}
        {activeTab === 'custom' && (
          <form onSubmit={handleStartGame} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl">
            <h3 className="font-black text-xs text-zinc-200 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-800 pb-3">
              <User className="w-4 h-4 text-amber-400" />
              Character Creation & Mode Configuration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-bold mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-zinc-100 font-medium focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Last Name / Dynastic House</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-zinc-100 font-medium focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-zinc-100 font-medium focus:outline-none focus:border-zinc-700"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Starting Campaign or Sandbox</label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-amber-400 font-bold focus:outline-none focus:border-zinc-700"
                >
                  <option value="camp_sandbox">🌟 Sandbox Mode (Unconstrained Free Play)</option>
                  <option value="camp_entrepreneur">💼 The Entrepreneur ($100M Goal)</option>
                  <option value="camp_tycoon">🏢 The Tycoon (10 Companies Goal)</option>
                  <option value="camp_industrialist">🏗️ The Industrialist (5 Projects Goal)</option>
                  <option value="camp_politician">🏛️ The Politician (Elected Office Goal)</option>
                  <option value="camp_globalist">🌐 The Globalist (3+ Nations Goal)</option>
                  <option value="camp_philanthropist">❤️ The Philanthropist ($50M Goal)</option>
                  <option value="camp_dynasty">👑 The Dynasty (4 Generations Goal)</option>
                  <option value="camp_balanced">✨ The Balanced Life (Harmony Goal)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Social Upbringing</label>
                <select
                  value={background}
                  onChange={(e) => setBackground(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-zinc-100 font-medium focus:outline-none focus:border-zinc-700"
                >
                  <option value="Working Class">Working Class (+$2k Cash • Resilient)</option>
                  <option value="Middle Class">Middle Class (+$15k Cash • Balanced)</option>
                  <option value="Affluent Old Money">Affluent Old Money (+$150k Cash • +Rep)</option>
                  <option value="Political Dynasty">Political Dynasty (+$75k Cash • +Influence)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Birth Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-zinc-100 font-medium focus:outline-none focus:border-zinc-700"
                >
                  {Object.keys(countryCityMap).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Birth City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-zinc-100 font-medium focus:outline-none focus:border-zinc-700"
                >
                  {countryCityMap[selectedCountry]?.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Aptitude Trait</label>
                <select
                  value={trait}
                  onChange={(e) => setTrait(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-zinc-100 font-medium focus:outline-none focus:border-zinc-700"
                >
                  <option value="Tech Savant">Tech Savant (+Intelligence, R&D boost)</option>
                  <option value="Wall Street Prodigy">Wall Street Prodigy (+Finances, Trading)</option>
                  <option value="Charismatic Orator">Charismatic Orator (+Charm, Election polling)</option>
                  <option value="Natural Athlete">Natural Athlete (+Health, Sports affinity)</option>
                  <option value="Tenacious Workaholic">Tenacious Workaholic (+Productivity, Stress resilience)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Simulation Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-zinc-100 font-medium focus:outline-none focus:border-zinc-700"
                >
                  <option value="Relaxed">Relaxed (Generous cash flow, low risk)</option>
                  <option value="Realistic">Realistic (Realistic macro-cycles)</option>
                  <option value="Hard">Hard (High bankruptcy risk)</option>
                  <option value="Extreme">Extreme (Unforgiving economic shocks)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-[0.99] font-black text-sm text-zinc-950 shadow-xl transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <span>Begin Dominium Simulation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Load saved game footer */}
        <div className="space-y-2">
          {slotFeedback && (
            <div className="bg-zinc-900 border border-amber-500/40 p-2.5 rounded-xl text-center text-xs text-amber-300 font-bold">
              {slotFeedback}
            </div>
          )}
          <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
            <span>Or load existing save:</span>
            {[1, 2, 3].map(slot => (
              <button
                key={slot}
                onClick={() => handleLoadSlot(slot)}
                className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-bold transition-all cursor-pointer"
              >
                Slot #{slot}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

