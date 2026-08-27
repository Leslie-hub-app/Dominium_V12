import React, { useState } from 'react';
import { GameState, Relationship } from '../../types';
import { ensureLifeSystemState, recordLifeBiography } from '../../engine/lifeEngine';
import { recordWorldPlayerAction } from '../../engine/worldGovernorCoordinator';
import { 
  Users, 
  Heart, 
  Sparkles, 
  Gift, 
  MessageSquare, 
  Plane, 
  DollarSign, 
  CheckCircle2,
  Smile,
  Shield,
  Award
} from 'lucide-react';

interface LifeRelationshipsViewProps {
  state: GameState;
  onInteractRelationship?: (
    personId: string, 
    actionType: 'spend_time' | 'give_gift' | 'deep_talk' | 'set_heir' | 'fund_tutoring' | 'set_allowance' | 'appoint_executive' | 'family_vacation'
  ) => void;
  onProposeMarriage?: (personId: string) => void;
}

export const LifeRelationshipsView: React.FC<LifeRelationshipsViewProps> = ({
  state,
  onInteractRelationship,
  onProposeMarriage
}) => {
  ensureLifeSystemState(state);
  const relationships = state.relationships || [];
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleAction = (rel: Relationship, action: 'time' | 'gift' | 'talk' | 'vacation' | 'propose') => {
    ensureLifeSystemState(state).socialInteractionHistory = ensureLifeSystemState(state).socialInteractionHistory || [];
    ensureLifeSystemState(state).socialInteractionHistory!.unshift({tick: state.simulationTick, withNpcId: rel.id, action, summary: `Interacted with ${rel.name}: ${action.replace('_',' ')}.`});
    recordWorldPlayerAction(state,'RELATIONSHIP_ACTION',`Interacted with ${rel.name}: ${action.replace('_',' ')}.`,['npc','households','family'],65);
    if (action === 'time') {
      rel.love = Math.min(100, rel.love + 4);
      rel.trust = Math.min(100, rel.trust + 3);
      state.character.attributes.happiness = Math.min(100, state.character.attributes.happiness + 3);
      state.character.attributes.stress = Math.max(0, state.character.attributes.stress - 2);
      showFeedback(`Spent wonderful quality time with ${rel.name}.`);
    } else if (action === 'gift') {
      if (state.finances.cash < 250) {
        showFeedback('Insufficient cash for a luxury gift ($250).');
        return;
      }
      state.finances.cash -= 250;
      rel.love = Math.min(100, rel.love + 8);
      rel.trust = Math.min(100, rel.trust + 5);
      showFeedback(`Presented a thoughtful luxury gift to ${rel.name}! Loved it.`);
    } else if (action === 'talk') {
      rel.trust = Math.min(100, rel.trust + 6);
      rel.respect = Math.min(100, (rel.respect || 60) + 4);
      showFeedback(`Had an inspiring deep conversation with ${rel.name}.`);
    } else if (action === 'vacation') {
      if (state.finances.cash < 2500) {
        showFeedback('Insufficient cash for vacation ($2,500).');
        return;
      }
      state.finances.cash -= 2500;
      rel.love = Math.min(100, rel.love + 15);
      rel.trust = Math.min(100, rel.trust + 10);
      state.character.attributes.happiness = Math.min(100, state.character.attributes.happiness + 10);
      state.character.attributes.stress = Math.max(0, state.character.attributes.stress - 15);
      showFeedback(`Took ${rel.name} on an extraordinary luxury resort getaway!`);
    } else if (action === 'propose') {
      if (onProposeMarriage) {
        onProposeMarriage(rel.id);
      } else {
        if (rel.love >= 75 && rel.trust >= 75) {
          rel.relation = 'Spouse';
          recordLifeBiography(state, {
            category: 'Romance',
            title: `Married ${rel.name}`,
            description: `Celebrated an elegant wedding ceremony.`,
            iconName: 'Heart',
            significance: 'Historic'
          });
          showFeedback(`💍 She said YES! You and ${rel.name} are now married!`);
        } else {
          showFeedback(`Proposal declined: ${rel.name} feels it is too early (needs ≥75% Love & Trust).`);
        }
      }
    }
  };

  const filtered = selectedFilter === 'All'
    ? relationships
    : relationships.filter(r => {
        if (selectedFilter === 'Family') return ['Father', 'Mother', 'Brother', 'Sister', 'Son', 'Daughter'].includes(r.relation);
        if (selectedFilter === 'Romance') return ['Spouse', 'Partner', 'Fiancée', 'Fiancé'].includes(r.relation);
        if (selectedFilter === 'Friends') return ['Friend', 'Mentor', 'Business Partner', 'Advisor'].includes(r.relation);
        return true;
      });

  return (
    <div className="space-y-4">
      {feedback && (
        <div className="p-3 bg-zinc-900 border border-rose-400/40 rounded-xl text-xs font-bold text-rose-300 shadow-lg flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div>
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Inner Circle</span>
            <h3 className="text-lg font-black text-zinc-100">Family, Romance & Social Circle</h3>
          </div>

          <div className="flex items-center gap-1.5">
            {['All', 'Family', 'Romance', 'Friends'].map(f => (
              <button
                key={f}
                onClick={() => setSelectedFilter(f)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedFilter === f
                    ? 'bg-rose-500 text-zinc-950 font-black'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Relationships Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filtered.map(rel => {
          const isPartner = ['Partner', 'Fiancée', 'Fiancé'].includes(rel.relation);
          return (
            <div key={rel.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3 shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-zinc-100">{rel.name}</h4>
                    <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold">
                      {rel.relation}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Age {rel.age} • {rel.occupation || 'Independent'}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black text-rose-400">{rel.love}% Love</div>
                  <div className="text-[10px] font-bold text-sky-400">{rel.trust}% Trust</div>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-1 text-[10px]">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Affection / Love</span>
                  <span>{rel.love}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${rel.love}%` }} />
                </div>
              </div>

              {/* Interaction Buttons */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  onClick={() => handleAction(rel, 'time')}
                  className="py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Smile className="w-3 h-3 text-amber-400" />
                  <span>Quality Time</span>
                </button>
                <button
                  onClick={() => handleAction(rel, 'gift')}
                  className="py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Gift className="w-3 h-3 text-rose-400" />
                  <span>Gift ($250)</span>
                </button>
                <button
                  onClick={() => handleAction(rel, 'talk')}
                  className="py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <MessageSquare className="w-3 h-3 text-sky-400" />
                  <span>Deep Talk</span>
                </button>
              </div>

              {isPartner && (
                <button
                  onClick={() => handleAction(rel, 'propose')}
                  className="w-full py-2 bg-gradient-to-r from-rose-500 to-amber-400 hover:from-rose-400 hover:to-amber-300 text-zinc-950 font-black rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Propose Marriage 💍</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="p-8 text-center text-zinc-400 bg-zinc-900 rounded-2xl border border-zinc-800">
          No relationships found in this category.
        </div>
      )}
    </div>
  );
};
