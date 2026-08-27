# Dominium Corporate Simulation — Capital Markets & Political Economy Layer v3

This layer extends the existing Corporate Simulation Engine into a persistent corporate political economy. It is designed to produce emergent histories through interacting state rather than isolated player commands.

## Implemented systems

1. Institutional shareholder politics and mandate-driven voting.
2. Annual general meetings with shareholder vote aggregation, board support, CEO evaluation and persistent AGM records.
3. CEO compensation packages with base salary, target bonus and vesting equity options.
4. Activist campaigns progressing from private engagement to public campaign, proxy solicitation and settlement.
5. Corporate debt instruments with coupon rates, maturity and credit-pressure consequences.
6. IPO and secondary equity offerings.
7. Financial distress, restructuring, creditor pressure and liquidation risk.
8. Cross-border M&A with jurisdiction, trade/treaty friction, antitrust and political-risk inputs.
9. Antitrust investigations and competition-risk records.
10. Government procurement bids and contract performance.
11. Company-funded lawful government-relations/lobbying programs.
12. Persistent corporate history events for emergent narratives.

## Monthly causal order

Global macro → institutional flows → operating results → governance → regulation → M&A → shareholder politics → capital markets → contracts → lobbying → distress/restructuring → historical record.

## Design rules

- Player action is never the sole determinant of company outcomes.
- Company fundamentals, management, workforce, industry, macroeconomics, regulation, competition and capital markets interact.
- Corporate actions create delayed consequences and persistent history.
- Public-company ownership remains represented through the canonical shareholder ledger.
- AGM voting is based on voting power rather than simply the number of board seats.
- Cross-border transactions carry additional political, trade and antitrust friction.
- Government contracts create revenue but also ongoing performance obligations.
- Lobbying changes regulatory relationships modestly; it does not bypass compliance or legal constraints.
- Distress does not automatically equal bankruptcy: the company progresses through restructuring states and can recover.
