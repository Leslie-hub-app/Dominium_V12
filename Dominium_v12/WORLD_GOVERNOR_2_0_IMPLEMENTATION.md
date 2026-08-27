# DOMINIUM World Governor 2.0

## Purpose
The World Governor is the non-player central coordination layer for the living world. It does not expose a bulk-simulation button. It governs normal monthly ticks and long-horizon background runs.

## Engine registry
Tracks canonical engines, dependencies, priority, health, relevance and last processed tick.

## Dependency graph
Economy -> Banking/Credit -> Companies/Real Estate -> NPCs/Households -> Markets/Events -> History. Government and politics participate as high-priority cross-system nodes.

## Adaptive Level of Detail
The Governor selects FULL, BALANCED, ECONOMY or DEEP_BACKGROUND detail according to event pressure and player-interest signals. This controls how much output is retained for the player rather than creating a separate simulation universe.

## Queue governance
Pending decisions are ranked and capped. Ordinary autonomous events are compressed while high-signal events remain visible. This prevents long simulations from flooding the player inbox/feed.

## Player-interest detection
Wealth, career, property, corporate ownership and political/family exposure are scored so autonomous activity closer to the player's actual interests receives higher attention.

## Feedback loops
The Governor records economic-to-property, credit-to-development, corporate-to-household and property-to-wealth feedback signals. Existing canonical engines remain responsible for the underlying state changes.

## Checkpoints and recovery
Known-good checkpoints are stored periodically. Invalid cash/tick/queue states trigger recovery to the latest checkpoint and increment the anomaly counter.

## Long-horizon simulation
The existing governed async runner supports horizons up to 100,000 months internally. It processes cooperative batches and yields between batches. No UI control is added for 20,000+ simulation runs.
