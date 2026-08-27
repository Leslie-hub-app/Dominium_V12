import React, { useState } from 'react';
import { GameState, DatingCandidate, DatingProfile } from '../../types';
import { DATE_ACTIVITIES_CATALOG } from '../../data/lifeCatalogs';
import { ensureLifeSystemState, recordLifeBiography } from '../../engine/lifeEngine';
import { performSocialAction } from '../../engine/socialWorldEngine';
import { 
  Heart, 
  Sparkles, 
  MessageCircle, 
  Calendar, 
  Send, 
  UserPlus, 
  Award, 
  CheckCircle2, 
  DollarSign, 
  Flame, 
  MapPin, 
  Star,
  Smile
} from 'lucide-react';

interface LifeDatingHubViewProps {
  state: GameState;
  onProposeMarriage?: (personId: string) => void;
}

export const LifeDatingHubView: React.FC<LifeDatingHubViewProps> = ({
  state,
  onProposeMarriage
}) => {
  const life = ensureLifeSystemState(state);
  const { character, relationships, finances } = state;
  const candidates = life.datingCandidates || [];
  const currentPartner = relationships.find(r => ['Spouse', 'Partner', 'Fiancée', 'Fiancé'].includes(r.relation));

  const [activeTab, setActiveTab] = useState<'matches' | 'planner' | 'profile'>('matches');
  const [selectedCandidate, setSelectedCandidate] = useState<DatingCandidate | null>(candidates[0] || null);
  const [messageInput, setMessageInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'player' | 'candidate'; text: string }>>([
    { sender: 'candidate', text: 'Hey there! Loved your profile. How has your week been going?' }
  ]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const logDatingAction = (candidate: DatingCandidate, action: string, summary: string) => {
    life.socialInteractionHistory = life.socialInteractionHistory || [];
    life.socialInteractionHistory.unshift({tick: state.simulationTick, withNpcId: candidate.id, action, summary});
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedCandidate) return;
    const text = messageInput.trim();
    const nextChat = [...chatMessages, { sender: 'player' as const, text }];
    setMessageInput('');
    setChatMessages(nextChat);
    logDatingAction(selectedCandidate, 'MESSAGE', `Messaged ${selectedCandidate.name} through the dating platform.`);

    // Simulated reply
    setTimeout(() => {
      const replies = [
        `That sounds so interesting! I really appreciate people with ambition and passion.`,
        `Haha, totally agree! We should definitely catch up over a proper dinner soon.`,
        `You have great taste. Tell me more about your projects!`,
        `That made me smile! Are you free this weekend?`
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      setChatMessages(prev => [...prev, { sender: 'candidate' as const, text: reply }]);
      selectedCandidate.compatibilityScore = Math.min(100, selectedCandidate.compatibilityScore + 2);
    }, 600);
  };

  const handlePlanDate = (activity: typeof DATE_ACTIVITIES_CATALOG[0]) => {
    if (!selectedCandidate) return;
    if (finances.cash < activity.cost) {
      showFeedback(`Insufficient cash ($${activity.cost} required).`);
      return;
    }

    finances.cash -= activity.cost;
    logDatingAction(selectedCandidate, 'DATE', `Went on a ${activity.name} date with ${selectedCandidate.name}.`);
    const charisma = character.attributes.charm;
    const score = Math.round(activity.romanticImpact * (1 + charisma / 100));

    state.character.attributes.happiness = Math.min(100, state.character.attributes.happiness + 8);
    state.character.attributes.stress = Math.max(0, state.character.attributes.stress - 6);

    // If candidate isn't yet in state.relationships, add them as 'Partner' if score is high
    const existing = relationships.find(r => r.name === selectedCandidate.name);
    if (!existing) {
      state.relationships.push({
        id: `rel_${selectedCandidate.id}`,
        name: selectedCandidate.name,
        relation: 'Partner',
        age: selectedCandidate.age,
        gender: selectedCandidate.gender || 'Female',
        occupation: selectedCandidate.occupation,
        wealth: 25000,
        trust: 60 + Math.round(score * 0.4),
        respect: 65,
        love: 55 + Math.round(score * 0.5),
        loyalty: 70,
        influence: 20,
        alive: true,
        avatarSeed: selectedCandidate.avatarSeed || selectedCandidate.name
      });
      selectedCandidate.matched = true;
      recordLifeBiography(state, {
        category: 'Romance',
        title: `Started Dating ${selectedCandidate.name}`,
        description: `Shared an unforgettable romantic date doing '${activity.name}'.`,
        iconName: 'Heart',
        significance: 'Notable'
      });
      showFeedback(`Romantic date with ${selectedCandidate.name} was a huge success! You are now dating.`);
    } else {
      existing.love = Math.min(100, existing.love + Math.round(score * 0.5));
      existing.trust = Math.min(100, existing.trust + Math.round(score * 0.3));
      showFeedback(`Wonderful date! ${existing.name} loved the experience. Love: ${existing.love}%.`);
    }
  };

  const handlePropose = (candidate: DatingCandidate) => {
    const existing = relationships.find(r => r.name === candidate.name);
    if (onProposeMarriage && existing) {
      onProposeMarriage(existing.id);
      return;
    }

    if (existing && existing.love >= 70 && existing.trust >= 70) {
      existing.relation = 'Spouse';
      recordLifeBiography(state, {
        category: 'Romance',
        title: `Married ${candidate.name}`,
        description: `Held a beautiful ceremony and pledged lifelong fidelity.`,
        iconName: 'Heart',
        significance: 'Historic'
      });
      showFeedback(`💍 ${candidate.name} joyfully accepted your marriage proposal!`);
    } else {
      showFeedback(`Proposal declined: Need higher relationship closeness and trust (≥70%).`);
    }
  };

  return (
    <div className="space-y-4">
      {feedback && (
        <div className="p-3 bg-zinc-900 border border-rose-400/40 rounded-xl text-xs font-bold text-rose-300 shadow-lg flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Active Partner Banner if exists */}
      {currentPartner && (
        <div className="p-4 bg-gradient-to-r from-rose-950/40 to-zinc-900 border border-rose-500/30 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
                Significant Other ({currentPartner.relation})
              </div>
              <h3 className="text-sm font-black text-zinc-100">{currentPartner.name}</h3>
              <div className="text-xs text-zinc-400">
                {currentPartner.occupation} • Love: <span className="text-rose-400 font-bold">{currentPartner.love}%</span> • Trust: <span className="text-sky-400 font-bold">{currentPartner.trust}%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('planner')}
              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-zinc-950 font-black rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1 shadow"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Plan Date</span>
            </button>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('matches')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'matches'
              ? 'bg-rose-500 text-zinc-950 font-black'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Discover Candidates ({candidates.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('planner')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'planner'
              ? 'bg-rose-500 text-zinc-950 font-black'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Romantic Experiences & Dates</span>
        </button>
      </div>

      {/* 1. MATCHES & DISCOVERY TAB */}
      {activeTab === 'matches' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Candidates List */}
          <div className="lg:col-span-1 space-y-2.5">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Compatible Matches
            </h4>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {candidates.map(cand => {
                const isSelected = selectedCandidate?.id === cand.id;
                return (
                  <div
                    key={cand.id}
                    onClick={() => setSelectedCandidate(cand)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-800 border-rose-500/50 shadow-md'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-rose-400/10 border border-rose-400/20 flex items-center justify-center font-bold text-rose-400 text-xs">
                          {cand.name.split(' ')[0][0]}{cand.name.split(' ')[1]?.[0] || ''}
                        </div>
                        <div>
                          <div className="font-extrabold text-xs text-zinc-100">{cand.name}, {cand.age}</div>
                          <div className="text-[10px] text-zinc-400">{cand.occupation}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        {cand.compatibilityScore}% Match
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Candidate Profile & Chat Preview */}
          <div className="lg:col-span-2 space-y-4">
            {selectedCandidate ? (
              <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
                <div className="flex items-start justify-between border-b border-zinc-800 pb-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-zinc-100">{selectedCandidate.name}, {selectedCandidate.age}</h3>
                      <span className="bg-rose-500/20 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {selectedCandidate.compatibilityScore}% Compatibility
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {selectedCandidate.occupation} • {selectedCandidate.location} • {selectedCandidate.education}
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('planner')}
                    className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-400 text-zinc-950 font-black rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Invite on Date</span>
                  </button>
                </div>

                <p className="text-xs text-zinc-300 italic bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
                  "{selectedCandidate.appearanceDescription || selectedCandidate.personality}"
                </p>

                {/* Interests Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.interests.map(int => (
                    <span key={int} className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                      #{int}
                    </span>
                  ))}
                </div>

                {/* Simulated Conversation Box */}
                <div className="space-y-3 pt-2 border-t border-zinc-800">
                  <div className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Direct Messaging</span>
                  </div>

                  <div className="bg-zinc-950/90 p-3.5 rounded-xl border border-zinc-800/80 space-y-2.5 max-h-[160px] overflow-y-auto">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.sender === 'player' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-2.5 rounded-xl text-xs ${
                            msg.sender === 'player'
                              ? 'bg-rose-500 text-zinc-950 font-bold'
                              : 'bg-zinc-800 text-zinc-200'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type a thoughtful message..."
                      value={messageInput}
                      onChange={e => setMessageInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-400"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="p-2 bg-rose-500 hover:bg-rose-400 text-zinc-950 rounded-xl transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-400 bg-zinc-900 rounded-2xl border border-zinc-800">
                Select a match from the left roster to view their profile.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. DATE PLANNER TAB */}
      {activeTab === 'planner' && (
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Curated Romantic Venues & Experiences
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Taking your companion on elevated dates boosts love, trust, happiness, and unlocks marriage milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {DATE_ACTIVITIES_CATALOG.map(act => (
              <div key={act.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3 shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-extrabold text-sm text-zinc-100">{act.name}</h5>
                    <span className="text-[10px] text-zinc-400">{act.type}</span>
                  </div>
                  <span className="text-xs font-black text-amber-400 font-mono">
                    ${act.cost.toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-zinc-400">{act.description}</p>

                <button
                  onClick={() => handlePlanDate(act)}
                  className="w-full py-2 bg-rose-500 hover:bg-rose-400 text-zinc-950 font-black rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>Reserve Date (${act.cost.toLocaleString()})</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
