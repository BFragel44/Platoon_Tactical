# M0 rules and manual playtest guide

## Run the prototype

Run `npm install` once, then `npm run dev` and open the local URL printed by Vite.
Choose **Known defender** or **Uncertain contact**, enter a seed, and click **Restart exercise**.
Orders resolve immediately. **End Turn** resolves the remaining simulation work.
Select teams in the roster or on the map. Diagnostics are optional and contain only player-visible events.

The platoon has three four-soldier teams and an additional leader attached to Alpha.
Secure Stone House with an effective team, then hold it through the following complete turn.
Leaving the objective interrupts progress. Enemy occupants prevent completion.
No effective friendly soldiers, or failure to secure the objective by turn 24, means defeat.
**Abort mission** ends immediately with an aborted outcome. Terminal missions show an AAR.

## Commands and leadership

Each turn provides 2–4 seeded commands, plus at most two unused commands carried forward.
Orders normally cost one command; Assault costs two. Teams more than one movement link
from the attached leader pay one additional command. Leader incapacity reduces the new
allowance by one, with a minimum of one, and removes the proximity benefit.

| Order | Effect and restriction |
| --- | --- |
| Move | Cross one movement link; become exposed until cleanup. Known hostile positions require Assault. Discovering a hidden defender halts the move and reveals the position. |
| Observe | Make an additional deliberate spotting attempt without moving. |
| Direct fire | Select a suspected or spotted hostile Location in firing range; gain concentrated fire this turn. |
| Seek cover | Discover and occupy additional protection, or occupy an already discovered position. |
| Rally | Attempt to reduce suppression by 40. |
| Assault | Attempt to dislodge defenders from an adjacent hostile Location and enter it. |
| Transfer leader | Transfer to another co-located team; select the team carrying the leader. |

A team has one movement action per turn, shared by Move and Assault, and one attempt
of each other order. Leader transfer is additionally limited to once per turn.
Failed attempts spend commands; invalid orders do not. Pinned teams cannot move or assault.
Maintaining fire and holding position require no repeated orders.

## Combat rules and provisional tuning

Movement links and reciprocal firing lanes are authored separately. Active fire targets a
Location and affects opposing occupants individually. Friendly occupation masks supporting
fire into that Location. Fire continues automatically while eligible.

- Effective riflemen contribute 1 fire strength, automatic weapons 2.5, and grenadiers 1.5.
  Wounded or killed soldiers contribute nothing. Suppressed teams retain 45% of fire strength;
  pinned teams retain 10%. Direct Fire multiplies strength by 1.3 for its issuing turn.
- Suppression is bounded at 90. Effective is below 30; suppressed is 30–59; pinned is 60–90.
- Pressure is `5 × incoming strength + exposure + crossfire − protection`, floored at zero.
  Exposure adds 8, multiple incoming Locations add 8, and each terrain/cover protection point
  subtracts 6. Without incoming strength, pressure is zero.
- Recovery removes 25 suppression when pressure is below 5, otherwise 10. Combat then adds
  pressure multiplied by a seeded factor between 0.75 and 1.25, rounded to an integer.
  Recovery and combat each calculate their outcomes from a common snapshot before committing.
- Pressure above 18 can cause a casualty: probability is `(pressure − 18) × 0.004`, capped
  at 18%. A casualty removes a randomly selected effective soldier or attached leader;
  30% are killed, otherwise wounded. Neither condition recovers during M0.
- Ordinary protection is always present: Orchard Edge/Farmyard/Stone House 2, Sunken Lane/
  Low Ridge 1, Crossroads 0. Each Location can contain one shared additional-cover position
  granting 2 protection. Discovery chances respectively are 80%, 80%, 65%, 70%, 60%, 40%.
- Rally succeeds automatically below 5 pressure. Otherwise its chance is 65%, plus 20
  percentage points when in command, minus 20 if the team has lost its effective team leader.
- Assault benefits from effective personnel, a surviving grenadier, defender suppression
  and other supporting teams. Attacker suppression and defender cover reduce its chance.
  Success causes a defender casualty, withdraws defenders from the encounter and moves the
  attacker in. Failure adds 30 suppression and has a 30% attacker-casualty chance.

The numerical implementation resides in `src/sim/rules.js`, `fire.js`, `suppression.js`,
and `commands.js`. These values are original prototype tuning, not Fields of Fire tables.

## Uncertainty and turn sequence

An unresolved contact checks entry into Crossroads, Farmyard or Stone House during End Turn.
The current profile gives equal weight to no contact, a rifle team, an automatic-weapons team,
and a reinforced rifle team. Generated defenders occupy Stone House, overlooking the approach.
The known-defender exercise starts with an identified automatic-weapons team there instead.

Passive observation gives each stationary or moving observer one 30% attempt per target per
turn; Observe gives an additional 80% attempt. Enemy acquisition is simplified: defenders
can fire on friendly Locations in their firing lanes. Unidentified incoming fire reveals
the firing Location, not composition. Contact resolution does not promise an area is clear.

End Turn resolves enemy activity, contact/observation, recovery, mutual effects, cleanup and
objective checks, then refreshes commands. Enemy priorities are rally when pinned, seek cover
under fire, respond to another incoming direction, otherwise maintain fire. Enemy rally has
a 60% chance to remove 25 suppression. All outcomes are seeded and reproducible.

## Manual exercises

### Support and maneuver — Known defender, seed `spot-3`

1. Turn 1: move Alpha to Sunken Lane; move Bravo there. Leave Charlie in reserve. End Turn.
2. Turn 2: move Alpha to Crossroads, then Bravo to Farmyard. Both open fire automatically.
   Notice Bravo's increased command cost after separating from the leader. End Turn.
3. Turn 3: inspect the pinned defender. Select Bravo and Assault Stone House. End Turn.
4. Hold through turn 4 and End Turn. Confirm success, five recorded orders and no friendly
   casualties. Review the recorded assault, enemy withdrawal and objective events.

This exact sequence was completed through the browser before the interruption. Subsequent
presentation fixes prioritize assault feedback, separate friendly casualty totals, compact
team markers and add a route diagram; those last visual changes still need a final human look.

### Compare alternatives

Restart with the same scenario and seed for each approach:

- **Direct:** advance Alpha alone through Sunken Lane and Crossroads; assault as soon as legal.
  Rally at suppression 30 or higher before attempting further movement.
- **Support:** move Alpha through Crossroads and Bravo through Farmyard. On later turns,
  rally degraded teams, direct Alpha's fire when affordable, and assault with Bravo.
- **Recovery first:** advance Alpha through Crossroads, seek additional cover before assault,
  and rally at suppression 30 or higher. Failed searches may delay the assault.

Repeat with `spot-2`, then with **Uncertain contact** and `spot-1`. Record the commands in order:
extra searches or orders change RNG consumption, so a seed alone does not guarantee a transcript.
Check that stationary Observe and directing fire at suspected sources work without diagnostics.
Also transfer the leader between co-located teams, abort a run, and let an idle run reach turn 24.

After each run, answer: Who was firing? Why was movement dangerous? What did the last order
change? When did Charlie or the leader matter? Record confusing reports and dominant tactics.

## Verification record and remaining acceptance

Verified on 2026-09-15: **50 tests across 10 files pass**, and `npm run build` succeeds.
`npm run playtest` runs 30 deterministic policy comparisons through the public simulation API:
two scenarios, five seeds, three policies. These are scripted comparisons, not 30 browser tests.
All 30 currently finish successfully; defeat, abort and no-contact completion also have tests.

| Known defender / `spot-2` | Turns | Friendly casualties | Friendly pin events |
| --- | ---: | ---: | ---: |
| Direct | 14 | 1 | 11 |
| Support | 4 | 0 | 0 |
| Recovery first | 7 | 0 | 0 |

Support improves some encounters but is not always faster. This is a working small encounter,
not established balance: the single defender often allows Alpha to win alone, and Charlie is
not consistently needed. The remaining acceptance work is human comparison of the three
approaches and final visual review. Tune from that feedback before expanding campaign scope.

Reference basis: Basic Training pp. 15–33, Sequence of Play, Action Menus, and Enemy Activity
Check Hierarchy in `reference/`. Preserve their leadership/support/maneuver principles, not
their detailed tables or company-level bookkeeping.
