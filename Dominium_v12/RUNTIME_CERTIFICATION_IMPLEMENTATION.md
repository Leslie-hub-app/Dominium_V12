# Dominium Runtime Certification Pass

## Certification rule
A feature is not marked `WORKING` because a component or handler exists. Certification requires executable evidence across the applicable chain:

`UI -> command/handler -> canonical state -> monthly simulation -> consequences/events/history -> persistence -> reload -> regression test`.

## Added executable gate
`src/engine/runtimeCertificationEngine.ts` runs against a fresh game state and verifies:

1. Advanced World / production integrity invariants.
2. Two consecutive calls to the single authoritative `advanceOneMonth()` pipeline.
3. Monthly result snapshots, events and news contracts.
4. Autosave and reload identity/calendar fidelity.
5. The existing master functionality audit.
6. The existing full integration suite.

The gate intentionally fails closed when an executable suite throws or reports failed assertions.

## Commands
- `npm run lint`
- `npm run build`
- `npm run test:runtime`
- `npm run verify`

## Duplicate-panel consolidation rule
No duplicate hub is deleted until its controls and destinations have been traced. Canonical primary destinations remain Home/Feed, Life, Wealth, Empire, World and More; secondary surfaces are routed through their owning primary hub rather than rendered as competing duplicate dashboards.

## Repair included
The Month Advance recap's Decision Inbox destination is routed back to the canonical Feed/Inbox state pair instead of assigning the legacy `inbox` active tab without synchronizing the feed subtab.
