# DOMINIUM World Governor

The World Governor is a non-player orchestration and control layer. It is not exposed as a player button. Its purpose is to keep the simulation coherent over very long horizons while protecting the player-facing experience.

## Responsibilities
- Monitor engine health and cross-system state.
- Preserve the player's intent profile as simulation context.
- Use the canonical monthly engine so existing systems remain authoritative.
- Compress ordinary events/news/decisions during autonomous long-horizon simulation.
- Preserve high-severity signals, major news and critical consequences.
- Cap active player decisions through the existing event-control layer.
- Audit the ecosystem periodically.
- Support asynchronous batches so long simulations yield to the UI instead of blocking the browser.

## Long-horizon capability
The governor supports targets up to 100,000 months internally. The game UI does not expose a "simulate 20,000" control. Long runs are processed in small cooperative batches by `runGovernedSimulationAsync`, while the canonical `advanceOneMonth` function remains the source of truth for state transitions.
