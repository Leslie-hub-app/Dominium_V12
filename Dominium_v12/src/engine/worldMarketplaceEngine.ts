import { GameState, MarketplaceAssetItem, MarketplaceCategory } from '../types';

const STORE_DEFS=[
 {id:'store_everyday',name:'Harbor Street Department Store',tier:'ORDINARY' as const,categories:['Fashion','Tech & Gadgets','Collectibles']},
 {id:'store_family_auto',name:'Metroline Motors',tier:'ORDINARY' as const,categories:['Vehicles']},
 {id:'store_home_style',name:'Hearth & Home Gallery',tier:'PREMIUM' as const,categories:['Fashion','Tech & Gadgets','Collectibles']},
 {id:'store_executive',name:'Crownline Executive Motors',tier:'PREMIUM' as const,categories:['Vehicles']},
 {id:'store_marine',name:'Bluewater Marine Exchange',tier:'PREMIUM' as const,categories:['Vehicles']},
 {id:'store_aviation',name:'Apex Aviation House',tier:'LUXURY' as const,categories:['Vehicles']},
 {id:'store_luxury',name:'Maison Aurelia',tier:'LUXURY' as const,categories:['Fashion','Watches & Jewellery','Collectibles']},
 {id:'store_tech',name:'Vertex Technology Hall',tier:'PREMIUM' as const,categories:['Tech & Gadgets']},
 {id:'store_horology',name:'Meridian Horology Salon',tier:'ULTRA_LUXURY' as const,categories:['Watches & Jewellery']},
 {id:'store_exotics',name:'Veyra Exotic Motor Gallery',tier:'ULTRA_LUXURY' as const,categories:['Vehicles']},
 {id:'store_jetset',name:'Skylane Private Aviation',tier:'ULTRA_LUXURY' as const,categories:['Vehicles']},
 {id:'store_collectors',name:'Grand Arc Collectors',tier:'LUXURY' as const,categories:['Collectibles']}
];
const BRANDS=['Aurevon','Veltrix','Novara','Kestrel','Orvane','Solvane','Montara','Elynd','Cavaro','Zenithra','Virelli','Asteron','Ravelle','Quantis','Bellara','Novera','Caldris','Marovelle','Tavren','Ophira'];
const rng=(state:GameState,salt:string)=>{let x=2166136261;for(const c of `${state.character.id}|${state.simulationTick}|${salt}`){x^=c.charCodeAt(0);x=Math.imul(x,16777619)}return()=>{x|=0;x=Math.imul(x+0x6D2B79F5,1)|0;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}};
const cap=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
function tierMultiplier(t:'ORDINARY'|'PREMIUM'|'LUXURY'|'ULTRA_LUXURY'){return t==='ORDINARY'?1:t==='PREMIUM'?1.8:t==='LUXURY'?4.5:12;}
function makeTemplate(category:MarketplaceCategory,index:number,tier:'ORDINARY'|'PREMIUM'|'LUXURY'|'ULTRA_LUXURY',r:()=>number):MarketplaceAssetItem{
 const mult=tierMultiplier(tier), brand=BRANDS[(index*7+Math.floor(r()*BRANDS.length))%BRANDS.length];
 const families:Record<MarketplaceCategory,string[]>={
  Vehicles:['City Hatch','Executive Sedan','Performance Coupe','Grand SUV','Electric Touring Sedan','Off-Road Utility','Sports Roadster','Grand Touring Coupe','Supercar','Hypercar','Motor Yacht','Explorer Yacht','Sailing Yacht','Coastal Cruiser','Private Turboprop','Business Jet','Long-Range Jet','VIP Helicopter'],
  Fashion:['Cashmere Capsule','Tailored Suit','Evening Ensemble','Leather Travel Set','Executive Outerwear','Handcrafted Footwear','Weekend Wardrobe','Silk Collection'],
  'Watches & Jewellery':['Automatic Chronometer','Diver Chronometer','Annual Calendar Watch','Perpetual Calendar Watch','Tourbillon Watch','Gemstone Dress Watch','Heritage Chronograph','Diamond Bracelet'],
  'Tech & Gadgets':['Creator Laptop','Executive Tablet','Workstation Tower','Studio Display','Cinema Sound System','Smart Home Suite','Mobile Work Kit','Secure Communications Suite','Gaming Rig','Photography System'],
  Collectibles:['Limited Art Print','Sculptural Artwork','Rare Mechanical Model','Collector Camera','Heritage Instrument','Signed Sports Memorabilia','Rare Book Set','Design Object'],
  Homes:['Urban Residence'] ,'Experiences & Travel':['Private Retreat Package']
 };
 const base=families[category][index%families[category].length]; const price=Math.round((category==='Vehicles'?22000:category==='Fashion'?900:category==='Watches & Jewellery'?1800:category==='Tech & Gadgets'?700:category==='Collectibles'?500:1000)*mult*(1+(index%9)*0.16));
 const vehicle=category==='Vehicles'; const plane=/Jet|Turboprop|Helicopter/.test(base); const boat=/Yacht|Cruiser/.test(base); const effects=vehicle?(plane?{happiness:5,stress:-4,social:7}:{happiness:4,stress:-3,reputation:Math.round(mult*2)}):category==='Fashion'?{happiness:3,reputation:Math.round(mult*2)}:category==='Watches & Jewellery'?{happiness:2,reputation:Math.round(mult*3)}:category==='Tech & Gadgets'?{intelligence:2,happiness:2}:{happiness:2,reputation:Math.round(mult)};
 return {id:`offer_template_${category}_${index}`,category,subcategory:base,name:`${brand} ${base} ${String.fromCharCode(65+(index%26))}${1+(index%9)}`,brand,description:`A fictional ${tier.toLowerCase()}-tier ${base.toLowerCase()} designed for the living marketplace.`,purchasePrice:price,monthlyMaintenance:Math.round(price*(vehicle?0.004:0.0015)),depreciationAnnualRate:vehicle?8+Math.round(r()*8):category==='Watches & Jewellery'?-1:12,resaleValue:Math.round(price*0.88),prestigeScore:cap(Math.round(10*mult+r()*20),1,100),qualityScore:cap(Math.round(65+mult*5+r()*20),1,100),rarity:tier==='ULTRA_LUXURY'?'Ultra Rare':tier==='LUXURY'?'Exclusive':tier==='PREMIUM'?'Uncommon':'Common',specs:vehicle?{Power:vehicle?`${Math.round(140+mult*70+r()*500)} HP`:'N/A',Range:plane?`${Math.round(2500+mult*600+r()*5000)} km`:boat?'Coastal / offshore':'Urban / touring'}:undefined,imageOrIcon:plane?'Plane':boat?'Ship':category==='Fashion'?'Shirt':category==='Watches & Jewellery'?'Watch':category==='Tech & Gadgets'?'Laptop':'Sparkles',purchased:false,useActions:vehicle?(plane?['Take Flight','Travel With Guests','Charter to Another NPC']:boat?['Go Cruising','Host Guests','Travel to a Port']:['Take a Ride','Drive With Guests','Travel to Another City']):category==='Fashion'?['Wear Item','Attend Event']:category==='Watches & Jewellery'?['Wear Watch','Attend Event']:category==='Tech & Gadgets'?['Use Device','Work Session']:['Display Collection','Inspect Item'],effectProfile:effects,passengerCapacity:plane?8:boat?10:vehicle?4:undefined,condition:100};
}

export function getMarketplaceStores(){return STORE_DEFS;}
export function refreshWorldMarketplace(state:GameState){
 const life=state.lifeSystem; if(!life) throw new Error('Life system is not initialized.'); const owned=life.marketplaceInventory.filter(i=>i.purchased); const r=rng(state,'market-refresh'); const offers:MarketplaceAssetItem[]=[];
 for(const store of STORE_DEFS){for(let slot=0;slot<10;slot++){const category=store.categories[slot%store.categories.length] as MarketplaceCategory; const template=makeTemplate(category,state.simulationTick*37+slot+store.id.length,store.tier,r); const offer={...template,id:`offer_${state.simulationTick}_${store.id}_${slot}`,storeId:store.id,storeName:store.name,storeTier:store.tier,offerTick:state.simulationTick,location:`${state.character.residenceCity || 'Metropolis'} Grand Mall`,purchased:false}; offers.push(offer);}}
 life.marketplaceInventory=[...owned,...offers];
 return offers;
}

export function ensureWorldMarketplace(state:GameState){
 const life=state.lifeSystem; if(!life) throw new Error('Life system is not initialized.');
 const owned=life.marketplaceInventory.filter(i=>i.purchased);
 owned.forEach((item,index)=>{ if(!BRANDS.includes(item.brand)){ const brand=BRANDS[index%BRANDS.length]; item.brand=brand; item.name=`${brand} ${item.category==='Vehicles'?'Heritage Vehicle':item.category==='Fashion'?'Signature Wardrobe':item.category==='Watches & Jewellery'?'Precision Timepiece':item.category==='Tech & Gadgets'?'Smart Device':'Collector Piece'}`; item.description='A fictional branded possession in the Dominium living economy.'; } });
 const hasOffers=life.marketplaceInventory.some(i=>!i.purchased&&i.offerTick!==undefined); if(!hasOffers) refreshWorldMarketplace(state);
 return life.marketplaceInventory;
}

export function purchaseWorldMarketplaceItem(state:GameState,itemId:string){
 const life=state.lifeSystem; if(!life) throw new Error('Life system is not initialized.'); const item=life.marketplaceInventory.find(i=>i.id===itemId&&!i.purchased); if(!item)return {success:false,message:'This marketplace offer is no longer available.'}; if(state.finances.cash<item.purchasePrice)return {success:false,message:`Insufficient funds for ${item.name}.`};
 state.finances.cash-=item.purchasePrice; item.purchased=true; item.purchasedMonth=state.currentMonth; item.purchasedYear=state.currentYear; item.ownershipId=`pos_${Date.now()}_${Math.random().toString(36).slice(2,8)}`; item.isEquippedOrActive=true; state.character.possessions.vehicles=[...state.character.possessions.vehicles,...(item.category==='Vehicles'?[item.name]:[])]; if(item.category!=='Vehicles')state.character.possessions.luxuries=[...state.character.possessions.luxuries,item.name];
 state.character.attributes.happiness=cap(state.character.attributes.happiness+(item.effectProfile?.happiness||4),0,100); state.character.attributes.reputation=cap(state.character.attributes.reputation+(item.effectProfile?.reputation||0),0,100);
 return {success:true,message:`Purchased ${item.name} from ${item.storeName || 'the marketplace'} for $${item.purchasePrice.toLocaleString()}.`};
}
export function sellWorldMarketplaceItem(state:GameState,itemId:string){const life=state.lifeSystem; if(!life) throw new Error('Life system is not initialized.');const item=life.marketplaceInventory.find(i=>i.id===itemId&&i.purchased);if(!item)return{success:false,message:'You do not own this possession.',cashReceived:0};const cash=Math.max(1,Math.round(item.resaleValue*(item.condition||100)/100));state.finances.cash+=cash;item.purchased=false;item.isEquippedOrActive=false;state.character.possessions.vehicles=state.character.possessions.vehicles.filter(x=>x!==item.name);state.character.possessions.luxuries=state.character.possessions.luxuries.filter(x=>x!==item.name);return{success:true,message:`Sold ${item.name} for $${cash.toLocaleString()}.`,cashReceived:cash};}
export function useWorldPossession(state:GameState,itemId:string,action:string,guestCount=0,destination='a local destination'){const life=state.lifeSystem; if(!life) throw new Error('Life system is not initialized.');const item=life.marketplaceInventory.find(i=>i.id===itemId&&i.purchased);if(!item)return{success:false,message:'Possession not found.'};if(!item.useActions?.includes(action))return{success:false,message:'That action is not available for this possession.'};const plane=(item.specs?.Range&&item.imageOrIcon==='Plane');const boat=item.imageOrIcon==='Ship';const required=plane||boat?Math.max(0,Math.min(item.passengerCapacity||0,guestCount)):0;item.usageHours=(item.usageHours||0)+(plane?8:boat?5:2);item.condition=cap((item.condition||100)-(plane||boat?2:1),20,100);let cashCost=plane?Math.round(item.purchasePrice*0.0015):boat?Math.round(item.purchasePrice*0.0008):Math.round(item.purchasePrice*0.0002);state.finances.cash=Math.max(0,state.finances.cash-cashCost);const e=item.effectProfile||{};state.character.attributes.happiness=cap(state.character.attributes.happiness+(e.happiness||5),0,100);state.character.attributes.stress=cap(state.character.attributes.stress+(e.stress||-2),0,100);state.character.attributes.health=cap(state.character.attributes.health+(e.health||0),0,100);state.character.attributes.intelligence=cap(state.character.attributes.intelligence+(e.intelligence||0),0,100);state.character.attributes.reputation=cap(state.character.attributes.reputation+(e.reputation||0),0,100);return{success:true,message:action==='Take Flight'?`Flight completed to ${destination} with ${required} guest${required===1?'':'s'}.`:action==='Go Cruising'?`Cruise completed toward ${destination} with ${required} guest${required===1?'':'s'}.`:`Used ${item.name}: ${action}.`};}
