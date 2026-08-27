import React, { useState } from 'react';
import { GameState } from '../types';
import { 
  ShieldCheck, 
  Clock, 
  Layers, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Info,
  ChevronRight,
  Filter
} from 'lucide-react';
import { getRemainingCooldownMonths } from '../engine/eventControlEngine';

interface EventControlMonitorProps {
  state: GameState;
  onUpdateState?: (newState: GameState) => void;
}

export const EventControlMonitor: React.FC<EventControlMonitorProps> = ({ state, onUpdateState }) => {
  const [activeTab, setActiveTab] = useState<'cooldowns' | 'limits' | 'expirations'>('cooldowns');
  const ctrl = state.eventControlState;
  const config = ctrl?.config;

  const activeCooldowns = (ctrl?.cooldowns || []).filter(
    c => state.simulationTick < c.expiresAtTick
  );

  const pendingWithExpirations = (state.pendingDecisions || []).filter(
    d => Boolean(d.expiresAtTick)
  );

  return (
    <div className="bg-[#121216] border border-zinc-800/90 rounded-2xl p-5 shadow-2xl space-y-5 text-[#ececec]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              Event Control & Anti-Spam System
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                ACTIVE
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Cooldowns, duplicate prevention, dynamic expiration & category throttling
            </p>
          </div>
        </div>

        {/* System Stats Overview */}
        <div className="flex items-center gap-2">
          <div className="bg-[#18181d] px-3 py-1.5 rounded-xl border border-zinc-800 text-center">
            <div className="text-[10px] font-mono text-zinc-400">COOLDOWNS</div>
            <div className="text-xs font-mono font-bold text-amber-400">{activeCooldowns.length}</div>
          </div>
          <div className="bg-[#18181d] px-3 py-1.5 rounded-xl border border-zinc-800 text-center">
            <div className="text-[10px] font-mono text-zinc-400">ACTIVE DECISIONS</div>
            <div className="text-xs font-mono font-bold text-blue-400">
              {state.pendingDecisions.length} / {config?.maxActiveDecisions || 5}
            </div>
          </div>
          <div className="bg-[#18181d] px-3 py-1.5 rounded-xl border border-zinc-800 text-center">
            <div className="text-[10px] font-mono text-zinc-400">EXPIRED</div>
            <div className="text-xs font-mono font-bold text-rose-400">{ctrl?.expiredEventsCount || 0}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 bg-[#16161b] p-1 rounded-xl border border-zinc-800/80">
        <button
          onClick={() => setActiveTab('cooldowns')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'cooldowns'
              ? 'bg-amber-400 text-zinc-950 font-extrabold shadow'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Active Cooldowns ({activeCooldowns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('expirations')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'expirations'
              ? 'bg-amber-400 text-zinc-950 font-extrabold shadow'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Expiring Windows ({pendingWithExpirations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('limits')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'limits'
              ? 'bg-amber-400 text-zinc-950 font-extrabold shadow'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Category Quotas & Rules</span>
        </button>
      </div>

      {/* Tab Content: Active Cooldowns */}
      {activeTab === 'cooldowns' && (
        <div className="space-y-3">
          {activeCooldowns.length === 0 ? (
            <div className="p-6 bg-[#16161a] border border-dashed border-zinc-800 rounded-xl text-center text-xs text-zinc-500">
              No entities or event types are currently on cooldown. All systemic triggers are eligible to fire when conditions are satisfied.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeCooldowns.map((cd, idx) => {
                const remaining = Math.max(0, cd.expiresAtTick - state.simulationTick);
                return (
                  <div 
                    key={`${cd.eventType}_${cd.entityId}_${idx}`}
                    className="bg-[#16161b] border border-zinc-800 rounded-xl p-3.5 flex flex-col justify-between gap-2 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-mono text-[10px] uppercase font-bold text-amber-400">
                          {cd.eventType.replace(/_/g, ' ')}
                        </div>
                        <div className="text-xs font-semibold text-zinc-200 mt-0.5">
                          Target: <span className="font-mono text-zinc-400">{cd.entityId}</span>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/80 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {remaining}m left
                      </span>
                    </div>

                    <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-zinc-800">
                      <div 
                        className="bg-amber-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(5, ((cd.cooldownMonths - remaining) / cd.cooldownMonths) * 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span>Triggered: M{cd.lastTriggeredMonth}, Y{cd.lastTriggeredYear}</span>
                      <span>Total Cooldown: {cd.cooldownMonths} mo</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Expiring Windows */}
      {activeTab === 'expirations' && (
        <div className="space-y-3">
          {pendingWithExpirations.length === 0 ? (
            <div className="p-6 bg-[#16161a] border border-dashed border-zinc-800 rounded-xl text-center text-xs text-zinc-500">
              No active pending decisions currently have strict expiration countdowns.
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingWithExpirations.map(dec => {
                const remaining = dec.expiresAtTick ? Math.max(0, dec.expiresAtTick - state.simulationTick) : 0;
                const isUrgent = remaining <= 1;

                return (
                  <div 
                    key={dec.id}
                    className={`bg-[#16161b] border rounded-xl p-3.5 space-y-2 transition-all ${
                      isUrgent ? 'border-rose-500/50 bg-rose-950/10' : 'border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                          {dec.category}
                        </span>
                        <h4 className="text-xs font-bold text-zinc-100">{dec.title}</h4>
                      </div>
                      <span className={`font-mono text-[10px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1 ${
                        isUrgent 
                          ? 'bg-rose-950/90 text-rose-300 border border-rose-700 animate-pulse' 
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                      }`}>
                        <Clock className="w-3 h-3" />
                        Expires in {remaining} month{remaining !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-relaxed">{dec.description}</p>

                    {dec.expirationConsequences && dec.expirationConsequences.length > 0 && (
                      <div className="bg-[#0c0c0e] p-2.5 rounded-lg border border-zinc-800/80 text-[10px] text-rose-300 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Consequence if ignored:</strong> {dec.expirationEventDescription || 'Deal expires and competitor/counterparty claims asset.'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Category Quotas & Anti-Spam Rules */}
      {activeTab === 'limits' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-[#16161b] p-3.5 rounded-xl border border-zinc-800 space-y-2">
              <div className="font-mono text-[11px] uppercase font-bold text-amber-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Anti-Spam Quota Rules
              </div>
              <ul className="space-y-1 text-zinc-400 text-[11px] list-disc list-inside">
                <li>Max active decisions capped at <span className="text-zinc-200 font-mono font-bold">5</span></li>
                <li>Max active decisions per category capped at <span className="text-zinc-200 font-mono font-bold">2</span></li>
                <li>Monthly event feed capped at <span className="text-zinc-200 font-mono font-bold">2 per category</span></li>
                <li>Duplicate event prevention suppresses identical event titles</li>
              </ul>
            </div>

            <div className="bg-[#16161b] p-3.5 rounded-xl border border-zinc-800 space-y-2">
              <div className="font-mono text-[11px] uppercase font-bold text-amber-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Default System Cooldowns
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-mono text-zinc-400">
                <div>Revenue Decline: <span className="text-amber-300">6 mo</span></div>
                <div>Morale Collapse: <span className="text-amber-300">6 mo</span></div>
                <div>Family Strain: <span className="text-amber-300">3 mo</span></div>
                <div>Political Slump: <span className="text-amber-300">12 mo</span></div>
                <div>Property Decay: <span className="text-amber-300">6 mo</span></div>
                <div>Executive Burnout: <span className="text-amber-300">4 mo</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
