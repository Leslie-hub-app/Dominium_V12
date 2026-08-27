# Dominium Deep Production Layer

This pass adds a canonical `deepGameplay` layer for CAREER, POLITICS, BUSINESS, TYCOON and SPORTS. Each path has repeatable strategic actions, explicit trade-offs, canonical state changes, persistent history, generated events, monthly progression and decision generation.

## Runtime contract
Every action is certified by `npm run test:deep` for existence, action execution, state mutation, event generation and persistent in-state history. `npm run verify` now includes this certification after lint, build and the existing runtime certification.

## Design direction
Career supports mentoring, credentials and pivots; politics supports organizing, fundraising and coalition negotiation; business supports product, market and culture strategies; tycoon play supports acquisitions, holding-company construction and diversification; sports supports academies, marquee signings and rebuilding. These choices are deliberately connected to pressure, relationships, reputation, influence, capital and legacy so success can emerge through different strategies.
