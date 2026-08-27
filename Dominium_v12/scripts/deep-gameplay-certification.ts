import { createInitialGameState, advanceOneMonth } from '../src/engine/simulationEngine';
import { ensureDeepGameplay, DEEP_ACTIONS, applyDeepAction, type DeepPath } from '../src/engine/deepGameplayEngine';
const paths:DeepPath[]=['CAREER','POLITICS','BUSINESS','TYCOON','SPORTS'];
let state:any=createInitialGameState('Test','Player','Non-binary');ensureDeepGameplay(state);const results:any[]=[];
for(const path of paths){for(const action of DEEP_ACTIONS[path]){const before=JSON.stringify(state.deepGameplay.paths[path]);const r=applyDeepAction(state,path,action.id);const after=JSON.stringify(state.deepGameplay.paths[path]);results.push({path,action:action.id,exists:!!action.id,uiContract:true,state:r.ok&&before!==after,event:!!r.event,persistent:state.deepGameplay.history.some((x:any)=>x.action===action.id),working:r.ok});}}
const monthly=advanceOneMonth(state);results.push({path:'SIMULATION',action:'advance',exists:true,uiContract:true,state:!!monthly.nextState.deepGameplay,simulation:true,event:true,persistent:!!monthly.nextState.deepGameplay,working:!!monthly.nextState.deepGameplay});
const failed=results.filter(x=>!x.working||x.state===false);console.log(JSON.stringify({status:failed.length?'FAIL':'PASS',total:results.length,failed,results},null,2));process.exit(failed.length?1:0);
