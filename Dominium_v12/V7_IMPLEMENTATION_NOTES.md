# DOMINIUM V7 IMPLEMENTATION

Implemented against the supplied `dominium_corp_next` source tree.

## Government machinery
- Cabinet meetings
- Ministry policy proposal workflow
- Parliamentary committees
- Party whips
- Line-item budget voting
- Taxation by category
- Government debt issuance
- Competitive procurement tenders linked to the existing company universe
- Corporate lobbying records
- Government investigations
- Constitutional court cases
- Constitutional constraints
- Political crisis escalation
- Treaty negotiation and ratification
- Monthly machinery simulation

## Corporate Workforce & Management 2.0
- Persistent NPC employee roster
- Department-level workforce organization
- NPC recruitment tied to Living World NPCs
- Salary, skills, performance, potential, morale and engagement
- Performance reviews
- Promotions and department transfers
- Terminations and career record updates
- Labor relations, dispute and strike risk
- Executive succession candidate evaluation
- Monthly workforce simulation

## Integration
The new engines are called from the existing monthly simulation loop, so they participate in the same simulation tick rather than operating as isolated UI mechanics.

Files added:
- `src/engine/governmentMachineryEngine.ts`
- `src/engine/corporateWorkforceEngine.ts`
- `GOVERNMENT_MACHINERY_V7.md`
- `CORPORATE_WORKFORCE_MANAGEMENT_V2.md`

Files extended:
- `src/types.ts`
- `src/engine/simulationEngine.ts`
- `src/components/government/LivingGovernmentCommandCenter.tsx`
- `src/components/expansion2/CorporateCommandCenterView.tsx`

## Verification
TypeScript compilation was checked. The newly added engine files produced no TypeScript errors. Full repository compilation could not be certified in this environment because the supplied archive does not contain installed `node_modules`, so existing dependency-resolution errors remain for React, Express, Vite, Lucide and related packages.
