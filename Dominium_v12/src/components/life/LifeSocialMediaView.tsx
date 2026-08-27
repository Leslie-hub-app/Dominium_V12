import React, { useState } from 'react';
import { GameState, SocialPlatformType } from '../../types';
import { ensureLifeSystemState, publishSocialMediaPost } from '../../engine/lifeEngine';
import { performSocialAction } from '../../engine/socialWorldEngine';
import { 
  Share2, 
  Send, 
  Sparkles, 
  ThumbsUp, 
  Repeat, 
  MessageSquare, 
  CheckCircle2, 
  DollarSign, 
  Flame, 
  Award,
  Globe,
  Radio,
  Zap
} from 'lucide-react';

interface LifeSocialMediaViewProps {
  state: GameState;
  onUpdateState?: (state: GameState) => void;
}

export const LifeSocialMediaView: React.FC<LifeSocialMediaViewProps> = ({
  state, onUpdateState
}) => {
  const life = ensureLifeSystemState(state);
  const accounts = life.socialAccounts;
  const posts = life.socialPosts || [];

  const [activePlatform, setActivePlatform] = useState<SocialPlatformType>('PULSE');
  const [selectedTopic, setSelectedTopic] = useState('Thought Leadership');
  const [postContent, setPostContent] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const platforms: Array<{ key: SocialPlatformType; name: string; icon: string; desc: string }> = [
    { key: 'PULSE', name: 'Pulse', icon: '⚡', desc: 'Real-time microblogging & breaking commentary' },
    { key: 'VISTA', name: 'Vista', icon: '📸', desc: 'Visual lifestyle, luxury & aesthetic curation' },
    { key: 'LINKUP', name: 'LinkUp', icon: '💼', desc: 'Executive thought leadership & industry network' },
    { key: 'STREAM', name: 'Stream', icon: '🎙️', desc: 'Live broadcasts, podcasts & creator audience' },
    { key: 'CIRCLE', name: 'Circle', icon: '🔒', desc: 'Exclusive gated patron & investor circle' }
  ];

  const currentAccount = accounts[activePlatform];

  const topics = [
    'Thought Leadership',
    'Luxury Lifestyle & Travel',
    'Financial Wisdom & Strategy',
    'Fitness & Discipline',
    'Disruptive Tech Trends',
    'Controversial Hot Take'
  ];

  const sampleCaptions: Record<string, string[]> = {
    'Thought Leadership': [
      'The single greatest competitive advantage in business is relentless long-term focus.',
      'Capital flows where intelligence and discipline meet execution.',
      'True wealth is freedom of time, autonomy of purpose, and peace of mind.'
    ],
    'Luxury Lifestyle & Travel': [
      'Golden hour reflections. Grateful for the journey and the miles ahead.',
      'Designing a life where work and luxury exist in effortless harmony.',
      'Weekend recharge in the hills before an ambitious week of M&A.'
    ],
    'Financial Wisdom & Strategy': [
      'Never confuse short-term market noise with generational value creation.',
      'Cash flow is oxygen; compound interest is the engine of empires.',
      'Asset allocation dictates your survival; conviction dictates your upside.'
    ],
    'Fitness & Discipline': [
      '05:30 AM routine. You cannot negotiate with physical discipline.',
      'A sharp mind requires an unbreakable physical vessel.',
      'Consistency compounds in the gym exactly like capital in the markets.'
    ],
    'Disruptive Tech Trends': [
      'Autonomous systems and AI infrastructure will redefine human productivity.',
      'The next trillion-dollar market is being quietly built right now.',
      'Legacy institutions that refuse to adapt will be displaced within 36 months.'
    ],
    'Controversial Hot Take': [
      'Most networking events are a complete waste of time. Build real value instead.',
      'Work-life balance is a myth during hyper-growth phases—choose your season wisely.',
      'Degrees open doors, but relentless competence is what buys the building.'
    ]
  };

  const handlePublish = () => {
    if (!postContent.trim()) {
      showFeedback('Please write or select a caption before publishing.');
      return;
    }

    const result = publishSocialMediaPost(state, activePlatform, postContent.trim(), selectedTopic);
    if (result.success) {
      setPostContent('');
      if (result.isViral) {
        showFeedback(`🔥 VIRAL HIT! Your post caught fire, gaining ${result.likes.toLocaleString()} likes and +${result.followersGain.toLocaleString()} new followers!`);
      } else {
        showFeedback(`Published! Gained ${result.likes.toLocaleString()} likes and +${result.followersGain.toLocaleString()} followers.`);
      }
    }
  };

  return (
    <div className="space-y-4">
      {feedback && (
        <div className="p-3 bg-zinc-900 border border-amber-400/40 rounded-xl text-xs font-bold text-amber-300 shadow-lg flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 1. PLATFORMS SELECTOR BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {platforms.map(p => {
          const acc = accounts[p.key];
          const isSelected = activePlatform === p.key;

          return (
            <div
              key={p.key}
              onClick={() => setActivePlatform(p.key)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                  : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-base">{p.icon}</span>
                {acc.verified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                )}
              </div>
              <div>
                <div className="font-black text-xs text-zinc-100">{p.name}</div>
                <div className="text-[10px] font-mono font-bold text-amber-400">
                  {(acc.followers || 0).toLocaleString()} Followers
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. ACTIVE PLATFORM DOSSIER & POST CREATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Account Details */}
        <div className="lg:col-span-1 bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">{currentAccount.platform} Account</span>
              <h3 className="font-black text-base text-zinc-100">{currentAccount.handle}</h3>
            </div>
            {currentAccount.monetized && (
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                Monetized
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80">
              <span className="text-zinc-400">Engagement Rate</span>
              <span className="font-black text-zinc-100">{currentAccount.engagementRate}%</span>
            </div>
            <div className="flex items-center justify-between bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80">
              <span className="text-zinc-400">Monthly Ad Income</span>
              <span className="font-black text-emerald-400">${(currentAccount.monthlyAdRevenue || 0).toLocaleString()}/mo</span>
            </div>
            <div className="flex items-center justify-between bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80">
              <span className="text-zinc-400">Audience Tier</span>
              <span className="font-bold text-zinc-200">
                {(currentAccount.followers || 0) > 500000 ? 'Mega Influencer' :
                 (currentAccount.followers || 0) > 50000 ? 'Prominent Creator' :
                 (currentAccount.followers || 0) > 5000 ? 'Micro Influencer' : 'Emerging Voice'}
              </span>
            </div>
          </div>
        </div>

        {/* Post Creator Box */}
        <div className="lg:col-span-2 bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h4 className="font-black text-sm text-zinc-100 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-amber-400" />
              Publish Content to {currentAccount.platform}
            </h4>
            <span className="text-xs text-zinc-400">
              Charisma Boost: +{Math.round(state.character.attributes.charm)}%
            </span>
          </div>

          {/* Topic Pills */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Select Content Angle / Topic</label>
            <div className="flex flex-wrap gap-1.5">
              {topics.map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTopic(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedTopic === t
                      ? 'bg-amber-400 text-zinc-950 font-black'
                      : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Caption Suggestions */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Suggested High-Engagement Drafts</label>
            <div className="space-y-1">
              {(sampleCaptions[selectedTopic] || []).map((cap, idx) => (
                <div
                  key={idx}
                  onClick={() => setPostContent(cap)}
                  className="p-2 bg-zinc-950/70 hover:bg-zinc-800/80 rounded-lg border border-zinc-800/80 text-xs text-zinc-300 cursor-pointer transition-all truncate"
                >
                  "{cap}"
                </div>
              ))}
            </div>
          </div>

          {/* Textarea & Submit */}
          <div className="space-y-2">
            <textarea
              rows={3}
              placeholder="Craft your high-impact broadcast..."
              value={postContent}
              onChange={e => setPostContent(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />

            <button
              onClick={handlePublish}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast to {(currentAccount.followers || 0).toLocaleString()} Followers</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. ONLINE LIFE & NPC NETWORK */}
      <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4 shadow-xl">
        <div><h4 className="text-sm font-black text-zinc-100">Online Life & Living-Wold Network</h4><p className="text-[10px] text-zinc-500 mt-1">Your online identity now feeds relationships, networking, reputation and romance in the living world.</p></div>
        <div className="flex flex-wrap gap-2">
          {['NETWORK','HOST_EVENT','COLLABORATE'].map(action => <button key={action} onClick={()=>{const r=performSocialAction(state,action as any);showFeedback(r.message);onUpdateState?.({...state});}} className="px-3 py-2 rounded-xl bg-zinc-800 text-[10px] font-bold hover:bg-zinc-700">{action.replace('_',' ')}</button>)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {(state.relationships||[]).slice(0,9).map(npc => <div key={npc.id} className="p-3 bg-zinc-950 rounded-xl border border-zinc-800"><div className="text-xs font-black">{npc.name}</div><div className="text-[10px] text-zinc-500">{npc.occupation} · Trust {npc.trust}% · Love {npc.love}%</div><div className="flex flex-wrap gap-1.5 mt-2"><button onClick={()=>{const r=performSocialAction(state,'FOLLOW_NPC',npc.id);showFeedback(r.message);onUpdateState?.({...state});}} className="px-2 py-1 bg-zinc-800 rounded-lg text-[9px]">Follow</button><button onClick={()=>{const r=performSocialAction(state,'MESSAGE_NPC',npc.id);showFeedback(r.message);onUpdateState?.({...state});}} className="px-2 py-1 bg-zinc-800 rounded-lg text-[9px]">Message</button><button onClick={()=>{const r=performSocialAction(state,'ASK_ON_DATE',npc.id);showFeedback(r.message);onUpdateState?.({...state});}} className="px-2 py-1 bg-rose-950/70 text-rose-300 rounded-lg text-[9px]">Ask on Date</button></div></div>)}
        </div>
        {(life.socialInteractionHistory||[]).length>0&&<div className="border-t border-zinc-800 pt-3"><div className="text-[10px] uppercase font-black text-zinc-500 mb-2">Online interaction history</div><div className="space-y-1 max-h-32 overflow-y-auto">{life.socialInteractionHistory.slice(0,10).map((h:any,i:number)=><div key={i} className="text-[10px] text-zinc-400">Tick {h.tick}: {h.summary}</div>)}</div></div>}
      </div>

      {/* 4. RECENT POSTS FEED */}
      {posts.length > 0 && (
        <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-3.5 shadow-xl">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Broadcast History ({posts.length})
          </h4>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {posts.map(post => (
              <div key={post.id} className="p-3.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-amber-400">[{post.platform}]</span>
                    <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-bold">
                      {post.topic}
                    </span>
                    {post.isViral && (
                      <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <Flame className="w-3 h-3" /> Viral Hit
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Month {post.month}, {post.year}
                  </span>
                </div>

                <p className="text-xs text-zinc-200 leading-relaxed">"{post.content}"</p>

                <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-400 pt-1 border-t border-zinc-800/60">
                  <span className="flex items-center gap-1 text-rose-400 font-bold">
                    <ThumbsUp className="w-3 h-3" /> {(post.likes || 0).toLocaleString()} Likes
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <Repeat className="w-3 h-3" /> {(post.shares || 0).toLocaleString()} Shares
                  </span>
                  <span className="flex items-center gap-1 text-sky-400">
                    <MessageSquare className="w-3 h-3" /> {post.commentsCount || 0} Comments
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
