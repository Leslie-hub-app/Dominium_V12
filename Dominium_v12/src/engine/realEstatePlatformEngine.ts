import { GameState, LandParcel, RealEstateListing, RealEstatePlatformState, RealEstateProject, RealEstateDevelopmentType, RealEstateTransaction } from '../types';
import { recordFinancialTransaction } from './financialLedgerEngine';

const LISTING_CATALOG: Omit<RealEstateListing, 'id' | 'status'>[] = [
  { assetType:'House', name:'Suburban Family Home', city:'Cape Town', country:'South Africa', seller:'Private Owner', askingPrice:850000, areaSqm:220, condition:78, rentalYield:5.8, developmentPotential:35 },
  { assetType:'Townhouse', name:'Modern Gated Townhouse', city:'Johannesburg', country:'South Africa', seller:'Developer', askingPrice:1450000, areaSqm:180, condition:92, rentalYield:6.4, developmentPotential:45 },
  { assetType:'Apartment', name:'Central City Apartment Block Unit', city:'London', country:'United Kingdom', seller:'Investment Fund', askingPrice:2200000, areaSqm:95, condition:88, rentalYield:4.7, developmentPotential:30 },
  { assetType:'Office', name:'CBD Office Building', city:'New York', country:'United States', seller:'REIT', askingPrice:12500000, areaSqm:4200, condition:81, rentalYield:7.1, developmentPotential:60 },
  { assetType:'Industrial', name:'Distribution Warehouse', city:'Rotterdam', country:'Netherlands', seller:'Industrial Fund', askingPrice:9200000, areaSqm:11000, condition:86, rentalYield:7.8, developmentPotential:70 },
  { assetType:'Hotel', name:'Boutique Urban Hotel', city:'Dubai', country:'United Arab Emirates', seller:'Hospitality Group', askingPrice:18500000, areaSqm:9800, condition:90, rentalYield:8.2, developmentPotential:65 },
];

export function ensureRealEstatePlatform(state: GameState): RealEstatePlatformState {
  if (!state.realEstatePlatform) state.realEstatePlatform = {
    landParcels: [], listings: LISTING_CATALOG.map((x,i)=>({...x,id:`listing_seed_${i}`,status:'LISTED'})), projects: [], transactions: [],
    marketCycle:'GROWTH', constructionCostIndex:100, averageVacancyRate:7, developmentSentiment:72, totalLandValue:0, totalProjectValue:0, jobsCreated:0, lastMarketUpdateTick:0
  };
  state.realEstatePlatform.landParcels ??= []; state.realEstatePlatform.listings ??= []; state.realEstatePlatform.projects ??= []; state.realEstatePlatform.transactions ??= [];
  return state.realEstatePlatform;
}

function tx(state: GameState, t: Omit<RealEstateTransaction,'id'|'month'|'year'>) {
  const p=ensureRealEstatePlatform(state); const item={...t,id:`re_tx_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,month:state.currentMonth,year:state.currentYear};
  p.transactions.unshift(item); if(p.transactions.length>100) p.transactions.length=100;
}

export function buyRealEstateListing(state: GameState, listingId: string): {success:boolean;message:string} {
  const p=ensureRealEstatePlatform(state); const l=p.listings.find(x=>x.id===listingId && x.status==='LISTED');
  if(!l) return {success:false,message:'Listing is no longer available.'};
  if((state.finances?.cash||0)<l.askingPrice) return {success:false,message:`Insufficient cash. Purchase price: $${l.askingPrice.toLocaleString()}.`};
  state.finances.cash-=l.askingPrice; l.status='SOLD';
  const prop:any={id:`re_asset_${Date.now()}`,name:l.name,type:l.assetType,city:l.city,country:l.country,purchasePrice:l.askingPrice,currentValue:l.askingPrice,monthlyRent:Math.round(l.askingPrice*l.rentalYield/100/12),monthlyMaintenance:Math.round(l.askingPrice*0.012/12),isRented:l.assetType!=='House',tenantQuality:82,condition:l.condition,location:`${l.city}, ${l.country}`};
  state.propertyPortfolio ??= {rentalProperties:[],activeRenovations:[],activeDevelopments:[],totalRealEstateValue:0,totalMonthlyGrossRent:0,totalMonthlyMaintenance:0,averageOccupancyRate:100};
  state.propertyPortfolio.rentalProperties.push(prop);
  recordFinancialTransaction(state,{type:'PROPERTY_PURCHASE',category:'ASSET',amount:l.askingPrice,description:`Real estate platform acquisition: ${l.name}`,sourceAccount:'Liquid Cash',destinationAccount:'Real Estate'});
  tx(state,{type:'PURCHASE',assetName:l.name,amount:l.askingPrice,counterparty:l.seller,description:`Acquired ${l.assetType} through the real estate marketplace.`});
  return {success:true,message:`Acquired ${l.name} for $${l.askingPrice.toLocaleString()}.`};
}

export function buyLandParcel(state: GameState, name:string, city:string, country:string, areaSqm:number, zoning:string, price:number): {success:boolean;message:string;parcel?:LandParcel} {
  if((state.finances?.cash||0)<price) return {success:false,message:`Insufficient cash for land acquisition ($${price.toLocaleString()}).`};
  state.finances.cash-=price; const parcel:LandParcel={id:`land_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,name,city,country,areaSqm,zoning,purchasePrice:price,currentValue:price,infrastructureScore:60,developmentPotential:75,status:'OWNED'};
  const p=ensureRealEstatePlatform(state); p.landParcels.push(parcel); recordFinancialTransaction(state,{type:'PROPERTY_PURCHASE',category:'ASSET',amount:price,description:`Land acquisition: ${name}`,sourceAccount:'Liquid Cash',destinationAccount:'Land Bank'}); tx(state,{type:'LAND_PURCHASE',assetName:name,amount:price,counterparty:'Land Seller',description:`Purchased ${areaSqm.toLocaleString()} sqm of ${zoning} land in ${city}.`}); return {success:true,message:`Acquired ${name}.`,parcel};
}

export function startRealEstateDevelopment(state:GameState, landParcelId:string, name:string, developmentType:RealEstateDevelopmentType, budget:number, durationMonths:number=24): {success:boolean;message:string;project?:RealEstateProject} {
  const p=ensureRealEstatePlatform(state); const land=p.landParcels.find(x=>x.id===landParcelId && x.status==='OWNED'); if(!land) return {success:false,message:'Select an owned land parcel.'};
  const equity=Math.round(budget*0.3); if((state.finances?.cash||0)<equity) return {success:false,message:`You need $${equity.toLocaleString()} equity (30% of project budget).`};
  state.finances.cash-=equity; land.status='UNDER_DEVELOPMENT';
  const intensity = developmentType.includes('Tower')||developmentType.includes('Mall')||developmentType.includes('District')?1.45:1.2;
  const project:RealEstateProject={id:`reproj_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,name,developmentType,landParcelId,city:land.city,country:land.country,phase:'Feasibility',budget,spent:0,financingDebt:budget-equity,equityCommitted:equity,expectedValue:Math.round(budget*intensity),expectedAnnualIncome:Math.round(budget*0.09),expectedUnits:Math.max(1,Math.round(land.areaSqm/110)),monthsTotal:Math.max(12,durationMonths),monthsElapsed:0,progress:0,constructionQuality:78,approvalRisk:25,costOverrunRisk:20,marketRisk:22,contractorQuality:80,jobsCreated:Math.max(10,Math.round(budget/150000)),status:'ACTIVE'};
  p.projects.push(project); recordFinancialTransaction(state,{type:'DEVELOPMENT_EXPENSE',category:'ASSET',amount:equity,description:`Real estate development equity: ${name}`,sourceAccount:'Liquid Cash',destinationAccount:`Development: ${name}`}); tx(state,{type:'DEVELOPMENT',assetName:name,amount:equity,counterparty:'Development SPV',description:`Launched ${developmentType} project with ${Math.round(project.financingDebt).toLocaleString()} financing requirement.`}); return {success:true,message:`Development launched: ${name}.`,project};
}

export function simulateMonthlyRealEstatePlatform(state:GameState, news:string[]=[]):void {
 const p=ensureRealEstatePlatform(state); const cycles=['BOOM','GROWTH','STABLE','SLOWDOWN','RECESSION'] as const;
 if(Math.random()<0.08){ const i=cycles.indexOf(p.marketCycle); p.marketCycle=cycles[Math.max(0,Math.min(cycles.length-1,i+(Math.random()>.5?1:-1)))]; }
 const marketMod=p.marketCycle==='BOOM'?1.05:p.marketCycle==='GROWTH'?1.025:p.marketCycle==='SLOWDOWN'?.98:p.marketCycle==='RECESSION'?.93:1;
 p.constructionCostIndex=Math.max(85,Math.min(145,p.constructionCostIndex*(0.997+Math.random()*0.01)));
 p.averageVacancyRate=Math.max(2,Math.min(18,p.averageVacancyRate+(Math.random()-.5)*0.7));
 for(const project of p.projects){ if(project.status!=='ACTIVE'&&project.status!=='DELAYED') continue; project.monthsElapsed++; let phaseMonths=Math.max(1,Math.round(project.monthsTotal/8)); if(project.monthsElapsed%phaseMonths===0){ const phases:['Feasibility','Due Diligence','Planning & Design','Zoning & Entitlements','Financing','Procurement','Construction','Fit Out','Pre Leasing','Marketing & Sales','Completion','Stabilized'] = ['Feasibility','Due Diligence','Planning & Design','Zoning & Entitlements','Financing','Procurement','Construction','Fit Out','Pre Leasing','Marketing & Sales','Completion','Stabilized']; const idx=phases.indexOf(project.phase as any); if(idx<phases.length-1) project.phase=phases[idx+1]; }
   const delayRisk=(project.approvalRisk+project.costOverrunRisk+project.marketRisk)/300; if(Math.random()<delayRisk*0.12){project.status='DELAYED'; project.costOverrunRisk=Math.min(90,project.costOverrunRisk+5); news.push(`Construction issue delays ${project.name}; the ${p.marketCycle.toLowerCase()} property market increases pressure on the development.`);} else project.status='ACTIVE';
   project.progress=Math.min(100,Math.round((project.monthsElapsed/project.monthsTotal)*100)); project.spent=Math.min(project.budget,Math.round(project.budget*(project.progress/100))); project.expectedValue=Math.round(project.expectedValue*marketMod); if(project.progress>=100){project.status='COMPLETED';project.phase='Stabilized';p.jobsCreated+=project.jobsCreated;news.push(`${project.name} reaches completion and enters the operating real estate market.`);}
 }
 for(const land of p.landParcels){ if(land.status==='OWNED'||land.status==='UNDER_DEVELOPMENT') land.currentValue=Math.round(land.currentValue*(0.995+Math.random()*0.012)*marketMod); }
 p.totalLandValue=p.landParcels.filter(x=>x.status!=='SOLD').reduce((a,x)=>a+x.currentValue,0); p.totalProjectValue=p.projects.reduce((a,x)=>a+x.expectedValue,0); p.lastMarketUpdateTick=state.simulationTick;
}
