# Dominium Advanced World Engine – Production Integration

## Authoritative rule
Dominium has one monthly simulation pipeline. UI controls never mutate the world directly.

`Advance Month` → `advanceOneMonth()` → canonical state → world/life/wealth/business/politics/NPC processors → consequences → events/news/history → persistence.

## Implemented repository integration
- Existing `livingWorldEngine.ts` remains the canonical world simulation.
- `advancedWorldEngine.ts` is an adapter/validation layer, not a duplicate simulation.
- Living-world randomness is deterministic per player identity and simulation date.
- `BottomNav.tsx` now exposes a bottom-right `NEXT` simulation control connected to the same authoritative callback and locked while simulation is active.
- World integrity validation checks calendar, macro state and duplicate NPC identities.

## Required expansion direction
1. Replace remaining uncontrolled randomness in non-world engines with seeded streams.
2. Keep canonical entities separate from derived UI summaries.
3. Route meaningful actions through command/service boundaries.
4. Require every feature to pass: EXISTS, UI CONNECTED, SIMULATION CONNECTED, PERSISTENT, TESTED, WORKING.
5. Extend existing engines rather than creating parallel stores or monthly loops.
