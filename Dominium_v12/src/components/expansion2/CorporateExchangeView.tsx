import React, { useMemo, useState } from 'react';
import { GameState } from '../../types';
import { ensureCorporateSystemState, inspectCorporateCompany, buyCorporateShares, sellCorporateShares, launchCorporateTakeover, advanceCorporateTakeover, executeCorporateCommand, launchCorporateProxyBattle, executeCorporateSqueezeOut, proposeCorporateResolution } from '../../engine/corporateSimulationEngine';
import { ensureCorporateDeepSimulationState, inspectInstitutionalInvestors, inspectCorporateDeepGovernance, launchCompanyMABid } from '../../engine/corporateDeepSimulationEngine';
import { Building2, Search, TrendingUp, Users, Shield, Gavel, DollarSign, Globe2, Landmark, Scale, Crown } from 'lucide-react';
import { CorporateCapitalMarketsView } from './CorporateCapitalMarketsView';

export const CorporateExchangeView: React.FC<{ state: GameState; onStateChange?: () => void }> = ({ state, onStateChange }) => {
  const corp = ensureCorporateSystemState(state);
  const deep = ensureCorporateDeepSimulationState(state);
  const companies = useMemo(() => state.companies.filter(c => corp.publicCompanyIds.includes(c.id)), [state.companies, corp.publicCompanyIds]);
  const [selectedId, setSelectedId] = useState(companies[0]?.id || '');
  const [quantity, setQuantity] = useState(100);
  const [premium, setPremium] = useState(25);
  const [maTargetId, setMaTargetId] = useState('');
  const [commandValue, setCommandValue] = useState(5000);
  const [toast, setToast] = useState('');
  const selected = inspectCorporateCompany(state, selectedId) || companies[0];
  const deepInfo = selected ? inspectCorporateDeepGovernance(state, selected.id) : { governance: undefined, regulatory: undefined, institutional: [] };
  const institutions = inspectInstitutionalInvestors(state);
  const maTarget = inspectCorporateCompany(state, maTargetId) || companies.find(c => c.id !== selected?.id);
  const board = selected ? corp.boardSeats[selected.id] || [] : [];
  const holdings = selected ? ((state.investmentMarket?.portfolioHoldings || []).find(h => h.symbol === selected.ticker)?.sharesOwned || 0) : 0;
  const notify = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); onStateChange?.(); };

  if (!selected) return <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 text-zinc-400">Corporate exchange is initializing.</div>;

  return <div className="space-y-4">
    {toast && <div className="p-3 rounded-xl bg-zinc-900 border border-amber-400/30 text-xs font-bold text-amber-300">{toast}</div>}
    <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex flex-col lg:flex-row gap-3 lg:items-center">
      <div className="flex items-center gap-2"><Building2 className="w-5 h-5 text-amber-400"/><div><div className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">{corp.exchangeName} ({corp.exchangeSymbol})</div><div className="text-lg font-black text-zinc-100">Corporate Exchange & Ownership</div></div></div>
      <div className="lg:ml-auto flex items-center gap-2"><Search className="w-4 h-4 text-zinc-500"/><select value={selected.id} onChange={e => setSelectedId(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-200 min-w-[250px]">{companies.map(c => <option key={c.id} value={c.id}>{c.ticker} — {c.name}</option>)}</select></div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
      {[['Share Price', `$${selected.sharePrice.toLocaleString()}`], ['Market Cap', `$${(selected.valuation / 1e9).toFixed(2)}B`], ['Revenue', `$${(selected.monthlyRevenue / 1e6).toFixed(1)}M/mo`], ['Net Income', `$${(selected.monthlyNetProfit / 1e6).toFixed(1)}M/mo`], ['Employees', selected.employeesCount.toLocaleString()]].map(([label, value]) => <div key={label} className="bg-zinc-900 p-3 rounded-xl border border-zinc-800"><div className="text-[10px] text-zinc-500 uppercase">{label}</div><div className="text-sm font-black text-zinc-100 mt-1">{value}</div></div>)}
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2 bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between"><div><h3 className="font-black text-zinc-100">{selected.name} <span className="text-amber-400">({selected.ticker})</span></h3><p className="text-[11px] text-zinc-500">{selected.industry} • {selected.headquarters}</p></div><span className="text-xs font-bold text-emerald-400">Ownership {selected.playerOwnershipPercentage.toFixed(2)}%</span></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800"><div className="text-[10px] text-zinc-500">Cash</div><b>${(selected.cashReserve || 0).toLocaleString()}</b></div>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800"><div className="text-[10px] text-zinc-500">Debt</div><b>${(selected.debt || 0).toLocaleString()}</b></div>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800"><div className="text-[10px] text-zinc-500">P/E</div><b>{selected.peRatio?.toFixed(1) || '—'}</b></div>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800"><div className="text-[10px] text-zinc-500">Dividend Yield</div><b>{(selected.dividendYield || 0).toFixed(2)}%</b></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2"><h4 className="text-xs font-black text-zinc-200 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-emerald-400"/> Trade</h4><input type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs"/><div className="grid grid-cols-2 gap-2"><button onClick={() => notify(buyCorporateShares(state, selected.ticker!, quantity).message)} className="py-2 rounded-lg bg-emerald-500 text-zinc-950 text-xs font-black">Buy</button><button onClick={() => notify(sellCorporateShares(state, selected.ticker!, quantity).message)} className="py-2 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-black">Sell</button></div><div className="text-[10px] text-zinc-500">Your shares: {holdings.toLocaleString()}</div></div>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2"><h4 className="text-xs font-black text-zinc-200 flex items-center gap-1"><Gavel className="w-3.5 h-3.5 text-amber-400"/> Takeover</h4><input type="number" min="20" max="45" value={premium} onChange={e => setPremium(Number(e.target.value))} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs"/><button onClick={() => notify(launchCorporateTakeover(state, selected.id, premium, true).message)} className="w-full py-2 rounded-lg bg-amber-400 text-zinc-950 text-xs font-black">Launch Hostile Tender Offer</button><div className="grid grid-cols-2 gap-2"><button onClick={() => notify(launchCorporateProxyBattle(state, selected.id).message)} className="py-2 rounded-lg bg-zinc-800 text-zinc-200 text-[10px] font-black">Proxy Battle</button><button onClick={() => notify(executeCorporateSqueezeOut(state, selected.id).message)} className="py-2 rounded-lg bg-zinc-800 text-zinc-200 text-[10px] font-black">90% Squeeze-Out</button></div><div className="text-[10px] text-zinc-500">Offer value is market cap plus an acquisition premium; financing, board and regulatory stages follow.</div></div>
        </div>
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2"><h4 className="text-xs font-black text-zinc-200 mb-2">Board resolutions</h4><button onClick={() => notify(proposeCorporateResolution(state, selected.id, 'DIVIDEND', 'Increase shareholder distribution', 'Increase the dividend payout ratio by 10 percentage points.').message)} className="w-full py-2 rounded-lg bg-zinc-800 text-zinc-200 text-[10px] font-black">Propose Dividend Resolution</button></div><div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800"><h4 className="text-xs font-black text-zinc-200 mb-2">Corporate control</h4><div className="grid grid-cols-2 md:grid-cols-4 gap-2"><input type="number" value={commandValue} onChange={e => setCommandValue(Number(e.target.value))} className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-2 text-xs"/><button onClick={() => notify(executeCorporateCommand(state, selected.id, 'SET_WAGE', commandValue).message)} className="py-2 rounded-lg bg-zinc-800 text-xs font-bold">Set Wage</button><button onClick={() => notify(executeCorporateCommand(state, selected.id, 'HIRE', commandValue).message)} className="py-2 rounded-lg bg-zinc-800 text-xs font-bold">Hire</button><button onClick={() => notify(executeCorporateCommand(state, selected.id, 'RESTRUCTURE', commandValue).message)} className="py-2 rounded-lg bg-zinc-800 text-xs font-bold">Restructure</button></div></div>
      </div>

      <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3"><h3 className="font-black text-zinc-100 flex items-center gap-2"><Shield className="w-4 h-4 text-amber-400"/> 7-Seat Board</h3><p className="text-[10px] text-zinc-500">Voting power is tied to represented shares. Ownership thresholds unlock progressively stronger corporate rights.</p>{board.map(seat => <div key={seat.id} className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800"><div className="flex justify-between gap-2"><span className="text-xs font-bold text-zinc-200">{seat.holderName}</span><span className="text-[10px] text-amber-400">{seat.representedOwnershipPercent.toFixed(1)}%</span></div><div className="text-[10px] text-zinc-500 mt-1">{seat.agenda.replaceAll('_', ' ')} • support {seat.supportLevel}%</div></div>)}<div className="pt-2 border-t border-zinc-800 text-[10px] text-zinc-500">0% Investor → 1% significant → 5% board seat → 10% resolutions → 25% blocking → 50% control → 75% supermajority → 90% squeeze-out → 100% private.</div></div>
    </div>

    <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800"><h3 className="font-black text-zinc-100 flex items-center gap-2"><Users className="w-4 h-4 text-blue-400"/> Ownership & governance</h3><div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3 text-xs"><div><span className="text-zinc-500">Public float</span><div className="font-bold">{(selected.publicFloatShares || 0).toLocaleString()}</div></div><div><span className="text-zinc-500">Institutional</span><div className="font-bold">{(selected.institutionalShares || 0).toLocaleString()}</div></div><div><span className="text-zinc-500">Insider</span><div className="font-bold">{(selected.insiderShares || 0).toLocaleString()}</div></div><div><span className="text-zinc-500">Credit</span><div className="font-bold">{selected.creditRating || '—'}</div></div><div><span className="text-zinc-500">CEO approval</span><div className="font-bold">{selected.ceoApprovalRating || 0}%</div></div></div></div>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
        <h3 className="font-black text-zinc-100 flex items-center gap-2"><Globe2 className="w-4 h-4 text-amber-400"/> Global Corporate Cycle</h3>
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div className="p-2 bg-zinc-950 rounded-lg"><span className="text-zinc-500">Phase</span><div className="font-black">{deep.macroPhase}</div></div>
          <div className="p-2 bg-zinc-950 rounded-lg"><span className="text-zinc-500">GDP growth</span><div className="font-black">{deep.globalGDPGrowth.toFixed(1)}%</div></div>
          <div className="p-2 bg-zinc-950 rounded-lg"><span className="text-zinc-500">Inflation</span><div className="font-black">{deep.inflationRate.toFixed(1)}%</div></div>
          <div className="p-2 bg-zinc-950 rounded-lg"><span className="text-zinc-500">Policy rate</span><div className="font-black">{deep.policyRate.toFixed(2)}%</div></div>
          <div className="p-2 bg-zinc-950 rounded-lg"><span className="text-zinc-500">Credit spread</span><div className="font-black">{deep.creditSpread.toFixed(2)}%</div></div>
          <div className="p-2 bg-zinc-950 rounded-lg"><span className="text-zinc-500">Liquidity</span><div className="font-black">{deep.marketLiquidity.toFixed(0)}%</div></div>
        </div>
      </div>
      <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
        <h3 className="font-black text-zinc-100 flex items-center gap-2"><Landmark className="w-4 h-4 text-blue-400"/> Institutional Investors</h3>
        <div className="space-y-2 mt-3 max-h-48 overflow-auto">{institutions.map(i => <div key={i.id} className="flex justify-between p-2 bg-zinc-950 rounded-lg text-[10px]"><span><b className="text-zinc-200">{i.name}</b><span className="text-zinc-500 ml-2">{i.mandate}</span></span><span className="text-zinc-400">${(i.assetsUnderManagement/1e12).toFixed(1)}T AUM</span></div>)}</div>
      </div>
      <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
        <h3 className="font-black text-zinc-100 flex items-center gap-2"><Scale className="w-4 h-4 text-amber-400"/> Political & Regulatory Risk</h3>
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div><span className="text-zinc-500">Political attention</span><div className="font-black">{deepInfo.regulatory?.politicalAttention?.toFixed(0) ?? '—'}%</div></div>
          <div><span className="text-zinc-500">Antitrust</span><div className="font-black">{deepInfo.regulatory?.antitrustExposure?.toFixed(0) ?? '—'}%</div></div>
          <div><span className="text-zinc-500">Compliance</span><div className="font-black">{deepInfo.regulatory?.complianceScore?.toFixed(0) ?? '—'}%</div></div>
          <div><span className="text-zinc-500">Board confidence</span><div className="font-black">{deepInfo.governance?.boardConfidence?.toFixed(0) ?? '—'}%</div></div>
        </div>
      </div>
    </div>

    <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
      <h3 className="font-black text-zinc-100 flex items-center gap-2"><Crown className="w-4 h-4 text-amber-400"/> Corporate M&A Market</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
        <div className="text-xs p-3 bg-zinc-950 rounded-xl"><div className="text-zinc-500">Selected bidder</div><b>{selected.name}</b></div>
        <select value={maTargetId || maTarget?.id || ''} onChange={e => setMaTargetId(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs">{companies.filter(c=>c.id!==selected.id).slice(0,80).map(c=><option key={c.id} value={c.id}>{c.ticker} — {c.name}</option>)}</select>
        <button disabled={!maTarget} onClick={() => notify(launchCompanyMABid(state, selected.id, maTarget!.id, premium).message)} className="py-2 rounded-xl bg-amber-400 text-zinc-950 text-xs font-black disabled:opacity-40">Launch Corporate Acquisition</button>
      </div>
      <div className="text-[10px] text-zinc-500 mt-2">Corporate-to-corporate acquisitions now move through due diligence, board review, antitrust/public-interest review, financing and shareholder approval before closing.</div>
      {deep.maBids.length>0 && <div className="grid md:grid-cols-2 gap-2 mt-3">{deep.maBids.slice(-6).map(b=><div key={b.id} className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs"><div className="font-black">{b.bidderName} → {b.targetName}</div><div className="text-[10px] text-zinc-500 mt-1">{b.stage} • {b.premiumPercent}% premium • support {b.shareholderSupport.toFixed(0)}% • antitrust {b.antitrustRisk.toFixed(0)}%</div></div>)}</div>}
    </div>

    <CorporateCapitalMarketsView state={state} companyId={selected.id} onStateChange={onStateChange} />

    {corp.takeoverDeals.length > 0 && <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800"><h3 className="font-black text-zinc-100 flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-400"/> Active Takeovers</h3><div className="space-y-2 mt-3">{corp.takeoverDeals.slice(-8).map(deal => <div key={deal.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 bg-zinc-950 rounded-xl border border-zinc-800"><div><div className="text-xs font-black">{deal.targetCompanyName}</div><div className="text-[10px] text-zinc-500">{deal.stage.replaceAll('_',' ')} • {deal.acquisitionPremiumPercent}% premium • ${deal.offerValue.toLocaleString()}</div></div>{deal.stage !== 'COMPLETED' && deal.stage !== 'REJECTED' && <button onClick={() => notify(advanceCorporateTakeover(state, deal.id).message)} className="px-3 py-2 bg-amber-400 text-zinc-950 rounded-lg text-[10px] font-black">Advance Deal</button>}</div>)}</div></div>}
  </div>;
};
