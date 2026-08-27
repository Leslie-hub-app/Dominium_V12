# DOMINIUM — Corporate Boardroom 2.0

## Purpose
Board meetings are now multi-stage playable governance events rather than instant votes. The boardroom is connected to company fundamentals, NPC directors, executives, shareholders, corporate capital markets, the event feed and the monthly living-world simulation.

## Meeting lifecycle
1. Agenda — player proposes the resolution.
2. Executive Reports — CEO and CFO can present company-specific reports.
3. Director Debate — player argues a position and non-player directors enter positions based on their agendas, support and influence.
4. Amendments — the player can submit an amendment that is independently voted on.
5. Shareholder Pressure — institutional and other shareholders can pressure the board; the player can address, concede to, or ignore demands.
6. Final Vote — voting power is weighted by represented shares.
7. Consequences — company state, board support, CEO confidence and corporate history are updated.

## Governance fallout
Failed or contentious meetings can create persistent consequences:
- CEO confidence crisis
- activist campaign through the existing capital-markets activist engine
- leadership challenge by a director faction
- director resignation
- internal information leak
- public corporate scandal
- automatic emergency board meeting

## Living-world connections
Boardroom decisions feed the same Company, workforce, capital-markets and event systems used elsewhere in Dominium. A restructuring can reduce headcount and morale; debt can increase leverage; CAPEX can increase capacity; dividends reduce liquidity; failed governance can damage CEO confidence and reputation; activism can enter the capital-markets engine.

## Monthly processing
Active unresolved sessions are monitored by the monthly simulation engine. Emergency meetings created by governance fallout remain playable in the Boardroom tab.

## Backward compatibility
`holdCorporateBoardMeeting()` remains available as a compatibility wrapper for existing callers. It now opens the new session, records executive reports and debate, then resolves the vote in one call.
