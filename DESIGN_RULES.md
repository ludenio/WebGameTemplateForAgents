# Game Design Principles

These principles are used when creating and reviewing `DESIGN.md`. Every design decision must pass through this checklist. If a proposed mechanic or change violates any principle — flag it, explain why it hurts the target player or the game, and propose alternatives.

If a change passes the checklist, explicitly state that the design was checked against `DESIGN_RULES.md` and no design-rule violations were found.

## Target Player Profile
- **Skill level:** Casual-to-midcore. Not a competitive gamer or tactical genius, but has basic gaming experience.
- **Reference experience:** Can successfully play and enjoy games like *Minecraft* or *Don't Starve*. Understands crafting, resource management, basic survival, and progression.
- **Design implication:** Prefer clarity, readable feedback, and learnable depth over hidden complexity that only expert players can decode.

---

## Review Workflow

### Completeness Gate
Before approving or rejecting a design change, check whether the available specification is detailed enough to verify these principles.

If the change affects gameplay systems, UI, UX flows, inventory, player feedback, visual language, screen layouts, entity states, or any other player interaction — and the text alone is not enough to verify the rules below — the design is incomplete.

Depending on the change, request the missing materials before giving a final review:
1. Screenshot of the current and/or target UI or screen, preferably with annotations.
2. UX flow showing the sequence of player actions.
3. State diagram for affected entities or objects, such as `inventory -> placement -> removal -> refund/loss`.
4. Additional visual references if they affect intuition or expectations: icons, slot mockups, button states, hover states, highlights, animations, or feedback states.

If these materials are missing and needed, state clearly:
**"Insufficient data to verify all design principles; please provide UI screenshots, UX diagrams, and/or additional visual materials."**

Do not give final approval until the missing information is supplied.

### Violation Handling
If a proposed design violates any principle:
1. Stop the approval process.
2. Name the specific violated principle.
3. Explain the expected consequence for the target player or the game.
4. Propose 3 different compliant alternatives.
5. Wait for a decision before proceeding.

---

## 0. Documentation Consistency
- **Cross-system sync:** Changes must consistently update all related systems. One part using new rules while another still references old ones is a defect.
- **Remove dead content:** If a change makes part of the design obsolete, that part must be deleted. No orphaned mechanics, no stale references.
- **No documentation garbage:** The document should not accumulate outdated examples, abandoned rules, or mechanics that no longer connect to the current design.

## 1. Intuitive Affordances
- **Real-world affordances:** Objects should suggest how to interact with them based on real life. Wood burns, rocks sink, sharp things cut, heavy things are slow.
- **Gaming conventions:** Use established genre patterns. Red barrels explode, workbenches enable advanced crafting, item border color = rarity.
- **Intuitive use beats explanatory text:** If appearance, context, genre experience, or real-world affordances suggest a specific interaction, players will try that interaction even if tutorial text says otherwise. Text is not enough to fix a conflict between player expectation and actual rules. Change the design, visual language, object category, interaction rules, or feedback so the intuitive use matches gameplay logic.
- **Unified mental model for UI containers:** If different entities appear in the same UI container, panel, inventory, or slot type, players should expect the same basic rules for how they are bought, placed, removed, returned, lost, and compensated. If rules differ, the difference must be clearly visualized, named, and explained before the player acts.
- **Same looks = same works:** Entities with the same selection or placement method must not have hidden differences in cost, refund, ownership, or loss rules. Hidden differences are an intuition failure for a casual-to-midcore player.

## 1.1 Ownership, Cost & Refund Clarity
- If a change touches inventory, building panels, purchases, free items, scrap, blueprints, demolition, removal, moving, cancellation, or refunds, verify the full lifecycle of every affected entity: `acquisition -> storage -> placement -> use -> removal/cancel -> destruction/loss -> refund/compensation`.
- If two entities use the same panel or similar interaction but have different refund, cost, ownership, or free/paid consumption rules, this is a confusion risk and must be called out.
- Mixing free and paid copies of the same entity is allowed only if the player can clearly see which copy will be spent or returned first and why.
- Hidden spending queues such as "free copies first, then paid copies" are prohibited when they affect scrap, value loss, refund expectations, or player ownership.
- Portable entities that look like buildings or appear in a building panel must be clearly defined as one of: inventory item, building, unit, blueprint, or a separate category. A hybrid entity is acceptable only if its lifecycle rules are unified and predictable.
- If the lifecycle cannot be reconstructed from the design documentation, the documentation is incomplete and should not be approved.

## 2. Combinatorial Creativity
- **Emergent gameplay over new entities:** Prefer creating new situations, strategies, and content from combinations of existing mechanics. Fewer entities can create more variety when the rules interact well.
- **New entity test:** Before adding a new mechanic or entity, check whether existing rules can achieve the same experience more elegantly.
- **Automation exception:** New entities that automate previously tedious tasks are acceptable at long intervals, provided they do not fully replace the old approaches. They should free the player from repetitive construction at scale, not remove meaningful choices.

## 3. Balance, Progression & Core Loop
- **Replayable core loop:** The basic gameplay cycle must be fun on its own, even after many repetitions.
- **Easy to learn, hard to master:** Mechanics should be simple to start with, but reveal hidden depth, non-obvious synergies, and mastery potential.
- **Tangible progress:** Every ~X minutes, depending on context, the player must feel measurable progress. A progress step should be noticeable — roughly 10% improvement in a meaningful stat such as damage, speed, capacity, income, range, efficiency, or survivability.
- **Wave-like difficulty:** Difficulty should grow in waves, not as a flat line or exponential wall. Peaks of challenge should alternate with valleys of consolidation, recovery, and mastery.

## 4. Goal Hierarchy
- At any point, the player must have clear, formalized, and achievable goals at different time scales:
  - **Short-term** — collect 5 sticks, defeat this enemy, repair this tool
  - **Mid-term** — build shelter before nightfall, unlock a new area, stabilize production
  - **Long-term** — prepare for winter, defeat the final boss, complete the main objective
- Goals, how to achieve them, and progress toward them must be clearly communicated.
- A player should not spend long periods wondering what to do next unless exploration and uncertainty are intentional, bounded, and supported by feedback.

## 5. Anti-Degenerate Strategies
- Players optimize the fun out of games by choosing the most efficient path. The most efficient strategy must not also be the most boring one.
- Prevent dominant strategies that make other mechanics, tactics, tools, or playstyles irrelevant.
- If a strategy is intentionally powerful, it should require trade-offs, setup cost, risk, execution skill, resource pressure, timing windows, or situational constraints.

## 6. Player Agency
- Player actions and choices must have weight and visible consequences on the game world or game state.
- Avoid autopilot, excessively long non-interactive sequences, and mechanics where outcomes are purely random with no meaningful player decision.
- Randomness is acceptable when players can prepare for it, react to it, mitigate it, or make informed risk/reward choices around it.

## 7. No "Slogan-Only Fun"
- Avoid "design magic" where fun, tension, interest, or epicness exists only as a slogan rather than through concrete player actions, system states, and visible consequences.
- If the design says something is "fun", "tense", "interesting", "satisfying", or "epic", verify what specific mechanics, trade-offs, constraints, and feedback loops create and sustain that experience.
- Reject descriptions that sell an emotion without explaining which player decisions and system reactions produce it.
- The promised experience must be tied to understandable player actions and repeatable system responses, not only author intent or descriptive tone.
- **Bad:** "This system makes combat more fun and intense."
- **Bad:** "The player will enjoy optimizing production."
- **Good:** "The player must choose between blocking, which is safe but slow, and parrying, which is risky but creates a 2-second damage window. Tension comes from the risk/reward timing choice."

## 8. Age Rating (PEGI 7)
- Content must comply with PEGI 7.
- **Prohibited:** realistic violence, detailed gore, profanity, jump scares, gambling themes.
- Conflict must be presented in softened or abstract form. For example, defeated enemies dissolve into particles, run away, become stunned, or otherwise avoid realistic harm.
- Avoid visual, audio, or narrative presentation that makes conflict feel cruel, graphic, or frightening beyond PEGI 7 expectations.

## 9. Multiplayer Compatibility
- The game is primarily single-player unless `DESIGN.md` explicitly states otherwise.
- Single-player feature designs should not create avoidable conflicts with possible multiplayer or co-op support.
- If multiplayer is introduced, systems should not push players into unwanted conflict with each other unless that conflict is explicit, optional, well-communicated, and supported by counterplay.
- Shared systems must clarify ownership, rewards, costs, loss, progression, failure states, and refunds for each player.
- Avoid mechanics that enable griefing, resource theft, blocking progress, or accidental punishment of other players unless those behaviors are part of the intended design and have safeguards.

---

## Review Format
When reviewing a design, structure each issue as:

1. **Problem** — which principle is violated, with a quote from the design where possible.
2. **Impact** — why this is bad for the target player or the game.
3. **Solutions** — 3 different ways to fix it, with references to existing games where useful.

Additional review rules:
- Quote specific wording from the design whenever possible.
- Keep criticism polite, professional, and constructive.
- If the change affects cost, purchase, construction, inventory, demolition, removal, transfer, cancellation, or refund rules, include a separate line:
  **Lifecycle check:** where the entity appears, where it is stored, what is spent, what is returned, and what the player sees.
- If the lifecycle cannot be clearly reconstructed from the documentation, treat that as a documentation problem.
- If no issues are found, explicitly state: **"Checked against `DESIGN_RULES.md`; no design-rule violations found."**
