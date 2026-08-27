import { runRuntimeCertification } from '../src/engine/runtimeCertificationEngine';
const report = await runRuntimeCertification();
console.log(JSON.stringify(report, null, 2));
process.exit(report.status === 'FAIL' ? 1 : 0);
