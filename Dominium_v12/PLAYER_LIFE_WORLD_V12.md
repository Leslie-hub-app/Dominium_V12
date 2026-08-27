# DOMINIUM V12 — Personal Life Management, Social World, Justice, Tax & Career

## Personal Asset Management
Players can hire persistent NPC staff for accounting, legal, driving, piloting, vehicle/aircraft maintenance, butler/estate stewardship and residential/rental maintenance. Staff have salary, competence, loyalty and property assignments. Rental maintenance can be fully covered by enough rental-maintenance staff, reducing property maintenance to zero while shifting the economic cost to payroll.

A player can select a primary residence and manage only that home from the Life hub: renovate, improve security, host guests, inspect or sell. The property remains part of the canonical real-estate system.

## Social & Dating World
Online networking actions, NPC follows, private messages, collaborations, events and dating outreach feed the same relationship/NPC systems. Meaningful interactions are persisted in `lifeSystem.socialInteractionHistory` and displayed in the Life Overview Chronicle.

## Tax Authority
The National Revenue & Tax Authority assesses player income from salary, rental income and investment income, tracks tax paid, audit risk and filing state, and accepts payments/reviews through the World hub.

## Justice World
The World hub now exposes fictional law firms, hospitals, accounting firms, law-enforcement agencies and courts. Risky illegal actions can lead to investigation, arrest and incarceration. In prison, the player can write family letters or join a gang with progression. Incarceration can terminate employment and affect reputation/career.

## Career Repair
The corporate interview flow remains three questions. The previous double-increment UI bug was removed: the engine owns the question index and the UI reads the live interview state. Executive interviews now include a third question and adapt prompts to the player's current occupation, reputation and intelligence.

Career ladder fields are foldable and retain their Apply controls.

## World Governor 2.0
The Governor now additionally records player actions, publishes cross-engine messages and performs conflict reconciliation each governed tick. Existing adaptive LOD, event importance scoring, history compression, checkpoints and anomaly recovery remain active.
