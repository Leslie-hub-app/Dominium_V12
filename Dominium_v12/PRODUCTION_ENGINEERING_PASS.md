# Dominium Production Engineering Pass

## Engineering standard
A feature is complete only when its action changes canonical state, participates in the authoritative monthly simulation where relevant, produces consequences/events/history where relevant, persists, and has a verification path. This follows the project technical guide's entity → state → rules → actions → events → relationships → history model.

## Pass performed on this build
1. Preserved the existing authoritative `advanceOneMonth` pipeline.
2. Preserved the existing `livingWorldEngine` and its deterministic RNG; no parallel world loop was introduced.
3. Strengthened Advanced World Engine integrity checks with calendar synchronization and history-retention warnings.
4. Added `productionAuditEngine.ts` for runtime production health checks.
5. Retained the fixed bottom-right `NEXT` footer control, wired to the same guarded monthly pipeline as the other advance controls.
6. Retained existing Life, Wealth, Empire, World, More, Expansion 1/2, NPC, dynasty, narrative, legal, banking, property, corporate and government systems rather than deleting useful functionality.

## Remaining repository-wide acceptance gates
- Every interactive control must be audited for handler → canonical mutation → persistence.
- Every simulation domain must be tested for monthly participation.
- Duplicate visual panels should be consolidated at hub/component level, not hidden with CSS.
- All warning/failure states from runtime integrity checks require regression tests before release.
- Long-run seeded simulation must test state integrity, bounded history and save/load consistency.

## Production architecture
Presentation → gameplay services/commands → canonical domain state → authoritative monthly simulation → world/AI/narrative interpretation → events/news/history → persistence → derived UI.
