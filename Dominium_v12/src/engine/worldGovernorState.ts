import { GameState } from '../types';
import { WorldEngineRegistration } from '../types';
export function ensureWorldGovernor(state:GameState){
 if(!state.worldGovernor)state.worldGovernor={version:2,mode:'AUTONOMOUS',processedTicks:0,simulationsRun:0,decisionsSuppressed:0,eventsSuppressed:0,criticalSignals:[],systemHealth:{},lastAuditTick:-1,playerIntent:{riskTolerance:50,preferredIndustries:[],policyPreferences:[],capitalAllocationBias:'BALANCED'},engineRegistry:[],dependencyGraph:{},enginePriorities:{},adaptiveLod:'FULL',activeEngineIds:[],interestSignals:[],importanceQueue:[],compressedHistory:[],checkpoints:[],anomalyCount:0,coordinationVersion:2,feedbackLoops:[]};
 return state.worldGovernor;
}
