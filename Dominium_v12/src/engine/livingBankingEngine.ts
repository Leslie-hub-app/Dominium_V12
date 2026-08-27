import { GameState, BankDepositAccount, BankInstitution } from '../types';
import { ensureBankingSystemProfile } from './bankingEngine';
import { recordFinancialTransaction } from './financialLedgerEngine';

export type LivingAccountProduct = 'CHECKING'|'SAVINGS'|'HIGH_YIELD'|'MONEY_MARKET'|'CD'|'RETIREMENT'|'OFFSHORE'|'BUSINESS';
export interface LivingBankingProfile {
  version:number;
  accountProducts: Record<string,{annualRate:number; fee:number; liquidity:'INSTANT'|'LIMITED'|'LOCKED'; insuranceLimit:number; notes:string[]}>;
  relationshipScores: Record<string,number>;
  creditLines: Record<string,{limit:number; used:number; rate:number}>;
  monthlyEvents: {tick:number; bankId:string; title:string; narrative:string; severity:'INFO'|'WARNING'|'CRISIS'}[];
  totalInterestReceived:number;
}

const PRODUCTS: Record<LivingAccountProduct,{annualRate:number; fee:number; liquidity:'INSTANT'|'LIMITED'|'LOCKED'; insuranceLimit:number; notes:string[]}> = {
  CHECKING:{annualRate:0.5,fee:8,liquidity:'INSTANT',insuranceLimit:250000,notes:['Debit access','Bill payments','Low yield']},
  SAVINGS:{annualRate:3.25,fee:4,liquidity:'INSTANT',insuranceLimit:250000,notes:['Emergency reserve','Variable rate']},
  HIGH_YIELD:{annualRate:4.75,fee:2,liquidity:'LIMITED',insuranceLimit:250000,notes:['Higher yield','Withdrawal limits may apply']},
  MONEY_MARKET:{annualRate:4.25,fee:10,liquidity:'LIMITED',insuranceLimit:250000,notes:['Cash management','Higher balance expectations']},
  CD:{annualRate:5.15,fee:0,liquidity:'LOCKED',insuranceLimit:250000,notes:['Fixed term','Early withdrawal penalty']},
  RETIREMENT:{annualRate:5.0,fee:3,liquidity:'LOCKED',insuranceLimit:250000,notes:['Long-term wealth','Withdrawal restrictions']},
  OFFSHORE:{annualRate:2.75,fee:35,liquidity:'LIMITED',insuranceLimit:100000,notes:['Cross-border banking','FX and jurisdiction risk']},
  BUSINESS:{annualRate:1.0,fee:15,liquidity:'INSTANT',insuranceLimit:250000,notes:['Operating cash','Business payments']}
};

function tick(state:GameState){ return state.simulationTick || ((state.currentYear||2026)*12+(state.currentMonth||1)); }
export function ensureLivingBankingProfile(state:GameState):LivingBankingProfile{
  if(!state.livingBanking) state.livingBanking={version:1,accountProducts:{...PRODUCTS},relationshipScores:{},creditLines:{},monthlyEvents:[],totalInterestReceived:0};
  if(!state.livingBanking.accountProducts) state.livingBanking.accountProducts={...PRODUCTS};
  if(!state.livingBanking.relationshipScores) state.livingBanking.relationshipScores={};
  if(!state.livingBanking.creditLines) state.livingBanking.creditLines={};
  if(!state.livingBanking.monthlyEvents) state.livingBanking.monthlyEvents=[];
  return state.livingBanking;
}

export function openLivingBankAccount(state:GameState, bankId:string, product:LivingAccountProduct, initialDeposit:number, currency='USD'){
  const bank = ensureBankingSystemProfile(state).institutions.find(b=>b.id===bankId);
  if(!bank) return {success:false,message:'Bank not found.'};
  const p=PRODUCTS[product];
  if(initialDeposit < (bank.minDepositRequired||0)) return {success:false,message:`Minimum opening deposit is $${(bank.minDepositRequired||0).toLocaleString()}.`};
  if((state.finances?.cash||0)<initialDeposit) return {success:false,message:'Insufficient liquid cash.'};
  const profile=ensureLivingBankingProfile(state);
  state.finances.cash-=initialDeposit;
  const rate=Math.max(0.1,(state.livingWorld?.economy?.benchmarkInterestRate||4.5)+(bank.depositRateBonus||0)+(p.annualRate-3.25));
  const account:BankDepositAccount={id:`lba_${tick(state)}_${Math.random().toString(36).slice(2,8)}`,bankId:bank.id,bankName:bank.name,institutionName:bank.name,type: product==='CHECKING'?'TRANSACTION_ACCOUNT':product==='SAVINGS'?'SAVINGS_ACCOUNT':product==='HIGH_YIELD'?'HIGH_INTEREST_SAVINGS':product==='MONEY_MARKET'?'MONEY_MARKET_ACCOUNT':product==='CD'?'FIXED_DEPOSIT':product==='RETIREMENT'?'RETIREMENT_ACCOUNT':product==='BUSINESS'?'BUSINESS_ACCOUNT':'SAVINGS_ACCOUNT',accountType:product,currency,balance:initialDeposit,interestRateAnnual:Math.round(rate*100)/100,monthlyFee:p.fee,openedTick:tick(state),isLockedForFixedTerm:p.liquidity==='LOCKED',termMonthsRemaining:p.liquidity==='LOCKED'?(product==='CD'?12:60):undefined,interestEarnedLifetime:0};
  ensureBankingSystemProfile(state).depositAccounts.push(account);
  profile.relationshipScores[bank.id]=Math.min(100,(profile.relationshipScores[bank.id]||0)+5);
  recordFinancialTransaction(state,{type:'MISCELLANEOUS',category:'TRANSFER',amount:initialDeposit,description:`Opened ${product} account at ${bank.name}`,sourceAccount:'Liquid Cash',destinationAccount:account.id});
  return {success:true,message:`Opened ${product.replace(/_/g,' ')} at ${bank.name} at ${account.interestRateAnnual}% annual yield.`,account};
}

export function buildBankNarrativeEvent(state:GameState, bank:BankInstitution, type:'RATE_CHANGE'|'SERVICE'|'CREDIT'|'RISK'){
  const profile=ensureLivingBankingProfile(state);
  const narratives={
    RATE_CHANGE:[`${bank.name} reprices deposit products after a change in the monetary environment. Savers debate whether to lock in fixed rates.`,`Relationship managers contact selected clients with revised savings and fixed-deposit offers.`],
    SERVICE:[`${bank.name} launches a premium client initiative. Selected customers receive invitations to meet relationship managers.`],
    CREDIT:[`${bank.name}'s credit committee tightens underwriting as economic uncertainty rises. Some borrowers face stricter affordability tests.`],
    RISK:[`Market stress puts pressure on ${bank.name}'s funding and loan book. Depositors receive reassurance while management reviews liquidity buffers.`]
  } as const;
  const text=narratives[type][Math.floor(Math.random()*narratives[type].length)];
  const event={tick:tick(state),bankId:bank.id,title:`Banking Event: ${bank.name}`,narrative:text,severity:type==='RISK'?'WARNING':'INFO' as 'INFO'|'WARNING'|'CRISIS'};
  profile.monthlyEvents.unshift(event); profile.monthlyEvents=profile.monthlyEvents.slice(0,50);
  state.eventsFeed?.unshift({id:`bank_event_${tick(state)}_${Math.random()}`,timestampMonth:state.currentMonth,timestampYear:state.currentYear,age:state.character.age,category:'Financial',title:event.title,description:event.narrative,consequences:{details:[`Bank relationship score: ${profile.relationshipScores[bank.id]||0}/100`]}} as any);
}

export function simulateMonthlyLivingBanking(state:GameState){
  const profile=ensureLivingBankingProfile(state); const banking=ensureBankingSystemProfile(state); let interest=0;
  banking.institutions.forEach(bank=>{
    const r=profile.relationshipScores[bank.id]||0;
    profile.relationshipScores[bank.id]=Math.max(0,Math.min(100,r+(bank.stability>80?0.2:-0.4)));
    if(Math.random()<0.12) buildBankNarrativeEvent(state,bank, bank.stability<65?'RISK': bank.netInterestMargin&&bank.netInterestMargin<2?'CREDIT':Math.random()<0.5?'RATE_CHANGE':'SERVICE');
  });
  banking.depositAccounts.forEach(a=>{ const i=Math.round(a.balance*(a.interestRateAnnual/100)/12*100)/100; interest+=i; });
  profile.totalInterestReceived+=interest;
}
