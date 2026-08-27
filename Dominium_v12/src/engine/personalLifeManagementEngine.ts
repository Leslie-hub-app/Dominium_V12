import { GameState, RealEstateProperty } from '../types';
import { recordWorldPlayerAction } from './worldGovernorCoordinator';

export type PersonalStaffRole = 'ACCOUNTANT'|'LAWYER'|'DRIVER'|'PILOT'|'VEHICLE_MECHANIC'|'AIRCRAFT_MECHANIC'|'BUTLER'|'HOME_MAINTENANCE'|'RENTAL_MAINTENANCE';
export interface PersonalStaffMember { id:string; npcId:string; name:string; role:PersonalStaffRole; monthlySalary:number; competence:number; loyalty:number; assignedPropertyIds:string[]; active:boolean; hiredTick:number; }
export interface PersonalManagementState { staff:PersonalStaffMember[]; primaryResidenceId?:string; staffBudgetMonthly:number; maintenanceSavingsMonthly:number; householdServiceLevel:number; managementNotes:string[]; history:{tick:number;type:string;summary:string}[]; }

const ROLE_DEFAULTS:Record<PersonalStaffRole,{salary:number;competence:number;label:string}>={
 ACCOUNTANT:{salary:1800,competence:72,label:'Accountant'}, LAWYER:{salary:2400,competence:75,label:'Private Lawyer'}, DRIVER:{salary:1500,competence:68,label:'Personal Driver'}, PILOT:{salary:3200,competence:80,label:'Personal Pilot'}, VEHICLE_MECHANIC:{salary:1300,competence:72,label:'Vehicle Mechanic'}, AIRCRAFT_MECHANIC:{salary:2600,competence:78,label:'Aircraft Mechanic'}, BUTLER:{salary:1900,competence:70,label:'Butler / Estate Steward'}, HOME_MAINTENANCE:{salary:1400,competence:70,label:'Home Maintenance'}, RENTAL_MAINTENANCE:{salary:1050,competence:67,label:'Rental Maintenance'}
};

function ensure(state:GameState):PersonalManagementState{
 const current=state.personalManagement as PersonalManagementState|undefined;
 if(current?.staff) return current;
 const created:PersonalManagementState={staff:[],staffBudgetMonthly:0,maintenanceSavingsMonthly:0,householdServiceLevel:0,managementNotes:[],history:[]};
 state.personalManagement=created as any; return created;
}
function npcPool(state:GameState){return [...(state.relationships||[]),...(state.livingWorld?.npcs||[] as any[])];}
function makeNpcName(state:GameState, role:PersonalStaffRole){
 const candidates=npcPool(state).filter((n:any)=>n?.alive!==false);
 const picked=candidates[Math.floor(Math.random()*Math.max(1,candidates.length))];
 return {id:picked?.id||`staff_npc_${Date.now()}`,name:picked?.name||`${ROLE_DEFAULTS[role].label} ${Math.floor(Math.random()*900+100)}`};
}
export function ensurePersonalManagement(state:GameState){return ensure(state);}
export function hirePersonalStaff(state:GameState,role:PersonalStaffRole):{success:boolean;message:string;member?:PersonalStaffMember}{
 const p=ensure(state), def=ROLE_DEFAULTS[role];
 if(!def) return {success:false,message:'Staff role unavailable.'};
 if(p.staff.some(s=>s.role===role&&s.active)&&['ACCOUNTANT','LAWYER','DRIVER','PILOT','VEHICLE_MECHANIC','AIRCRAFT_MECHANIC','BUTLER'].includes(role)) return {success:false,message:`You already employ an active ${def.label}.`};
 const npc=makeNpcName(state,role); const member:PersonalStaffMember={id:`staff_${role}_${Date.now()}`,npcId:npc.id,name:npc.name,role,monthlySalary:def.salary,competence:def.competence,loyalty:60,assignedPropertyIds:[],active:true,hiredTick:state.simulationTick};
 p.staff.push(member); p.staffBudgetMonthly+=member.monthlySalary; p.history.unshift({tick:state.simulationTick,type:'HIRED',summary:`Hired ${member.name} as ${def.label}.`}); recordWorldPlayerAction(state,'PERSONAL_STAFF',`Hired ${member.name} as ${def.label}.`,['npc','households','wealth'],55);
 return {success:true,message:`${member.name} joined your household staff as ${def.label}.`,member};
}
export function firePersonalStaff(state:GameState,staffId:string){const p=ensure(state),s=p.staff.find(x=>x.id===staffId);if(!s||!s.active)return {success:false,message:'Staff member not found.'};s.active=false;p.staffBudgetMonthly=Math.max(0,p.staffBudgetMonthly-s.monthlySalary);p.history.unshift({tick:state.simulationTick,type:'TERMINATED',summary:`Ended employment of ${s.name}.`}); recordWorldPlayerAction(state,'PERSONAL_STAFF',`Ended employment of ${s.name}.`,['npc','households','wealth'],50);return {success:true,message:`${s.name} is no longer employed.`};}
export function setPrimaryResidence(state:GameState,propertyId:string){const p=ensure(state);const prop=state.finances.properties.find(x=>x.id===propertyId);if(!prop)return {success:false,message:'Property not found.'};p.primaryResidenceId=propertyId;prop.isRented=false;(prop as any).isPrimaryResidence=true;p.history.unshift({tick:state.simulationTick,type:'RESIDENCE',summary:`Moved into ${prop.name}.`}); recordWorldPlayerAction(state,'RESIDENCE',`Moved into ${prop.name}.`,['real_estate','households','wealth'],65);return {success:true,message:`${prop.name} is now your primary residence.`};}
export function assignStaffToProperty(state:GameState,staffId:string,propertyId:string){const p=ensure(state),s=p.staff.find(x=>x.id===staffId&&x.active),prop=state.finances.properties.find(x=>x.id===propertyId);if(!s||!prop)return {success:false,message:'Staff or property not found.'};if(!s.assignedPropertyIds.includes(propertyId))s.assignedPropertyIds.push(propertyId);return {success:true,message:`${s.name} assigned to ${prop.name}.`};}
export function performPrimaryResidenceAction(state:GameState,action:'RENOVATE'|'SECURE'|'HOST'|'INSPECT'|'SELL'){const p=ensure(state);const prop=state.finances.properties.find(x=>x.id===p.primaryResidenceId);if(!prop)return {success:false,message:'Select a primary residence first.'};if(action==='RENOVATE'){const cost=Math.round(Math.max(5000,prop.currentValue*0.03));if(state.finances.cash<cost)return {success:false,message:`Renovation requires $${cost.toLocaleString()}.`};state.finances.cash-=cost;prop.condition=Math.min(100,prop.condition+15);prop.currentValue=Math.round(prop.currentValue*1.04);return {success:true,message:`Renovation completed at ${prop.name}. Condition and market value increased.`};}if(action==='SECURE'){state.finances.cash=Math.max(0,state.finances.cash-750);(prop as any).securityLevel=Math.min(100,((prop as any).securityLevel||50)+15);return {success:true,message:`Security upgraded at ${prop.name}.`};}if(action==='HOST'){if(state.finances.cash<300)return {success:false,message:'Hosting requires at least $300 for staff, food and services.'};state.finances.cash-=300;state.character.attributes.happiness=Math.min(100,state.character.attributes.happiness+5);state.character.attributes.reputation=Math.min(100,state.character.attributes.reputation+2);return {success:true,message:`You hosted guests at ${prop.name}. Your social reputation improved.`};}if(action==='INSPECT'){prop.condition=Math.min(100,prop.condition+2);return {success:true,message:`Estate inspection completed. Condition is ${prop.condition}%.`};}if(action==='SELL'){if(prop.id!==p.primaryResidenceId)return {success:false,message:'Only your current residence can be managed from this control panel.'};state.finances.cash+=Math.round(prop.currentValue);state.finances.properties=state.finances.properties.filter(x=>x.id!==prop.id);p.primaryResidenceId=undefined;return {success:true,message:`${prop.name} sold. Proceeds added to cash.`};}return {success:false,message:'Unknown residence action.'};}

export function getRentalMaintenanceRequirement(state:GameState){const rentals=state.finances.properties.filter(p=>p.isRented);return Math.max(0,Math.ceil(rentals.length/3));}
export function simulatePersonalManagementMonthly(state:GameState,news:string[]=[]){const p=ensure(state);const rentalWorkers=p.staff.filter(s=>s.active&&s.role==='RENTAL_MAINTENANCE').length;const required=getRentalMaintenanceRequirement(state);const covered=Math.min(1,required===0?1:rentalWorkers/required);p.maintenanceSavingsMonthly=0;for(const prop of state.finances.properties){if(prop.isRented&&covered>=1){p.maintenanceSavingsMonthly+=prop.monthlyMaintenance;prop.monthlyMaintenance=0;}else if(prop.isRented&&covered<1){(prop as any).monthlyMaintenanceBase=(prop as any).monthlyMaintenanceBase||prop.monthlyMaintenance;prop.monthlyMaintenance=Math.round(((prop as any).monthlyMaintenanceBase||prop.monthlyMaintenance)*(1-covered));}}
 const active=p.staff.filter(s=>s.active);p.staffBudgetMonthly=active.reduce((a,s)=>a+s.monthlySalary,0);p.householdServiceLevel=Math.min(100,active.reduce((a,s)=>a+s.competence,0)/Math.max(1,active.length));
 if(required>rentalWorkers)news.push(`Rental portfolio needs ${required-rentalWorkers} additional maintenance worker(s) for full in-house coverage.`);
}
export function getPersonalStaffRoles(){return Object.entries(ROLE_DEFAULTS).map(([id,v])=>({id:id as PersonalStaffRole,...v}));}
