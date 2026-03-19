# Game Design Principles

These principles are used when creating and reviewing `DESIGN.md`. Every design decision must pass through this checklist. If a proposed mechanic or change violates any principle — flag it, explain why, and propose alternatives.

## Target Player Profile
- **Skill level:** Casual-to-midcore. Not a competitive gamer, but has basic gaming experience.
- **Reference:** Can successfully play and enjoy games like *Minecraft* or *Don't Starve*. Understands crafting, resource management, and basic progression.

---

## 0. Documentation Consistency
- **Cross-system sync:** Changes must consistently update all related systems. One part using new rules while another still references old ones is a defect.
- **Remove dead content:** If a change makes part of the design obsolete, that part must be deleted. No orphaned mechanics, no stale references.

## 1. Intuitive Affordances
- **Real-world affordances:** Objects should suggest how to interact with them based on real life. Wood burns, rocks sink, sharp things cut, heavy things are slow.
- **Gaming conventions:** Use established genre patterns. Red barrels explode, workbenches enable advanced crafting, item border color = rarity.

## 2. Combinatorial Creativity
- **Emergent gameplay over new entities:** Prefer creating new situations from combinations of existing mechanics. Fewer entities = more variety.
- **New entity test:** Before adding a new mechanic or entity, check whether existing rules can achieve the same experience more elegantly.
- **Automation exception:** New entities that automate previously tedious tasks are acceptable at long intervals, provided they don't fully replace the old approaches — they free the player from repetitive construction at scale.

## 3. Balance, Progression & Core Loop
- **Replayable core loop:** The basic gameplay cycle must be fun on its own, even after many repetitions.
- **Easy to learn, hard to master:** Mechanics should be simple to start with, but reveal hidden depth, non-obvious synergies, and mastery potential.
- **Tangible progress:** Every ~X minutes (context-dependent), the player must feel measurable progress — at least ~10% improvement in a meaningful stat (damage, speed, capacity, etc.).
- **Wave-like difficulty:** Difficulty grows in waves, not linearly. Peaks of challenge alternate with valleys of consolidation.

## 4. Goal Hierarchy
- At any point, the player must have clear, achievable goals at different time scales:
  - **Short-term** — collect 5 sticks, defeat this enemy
  - **Mid-term** — build shelter before nightfall, unlock a new area
  - **Long-term** — prepare for winter, defeat the final boss
- Goals, how to achieve them, and progress toward them must be clearly communicated.

## 5. Anti-Degenerate Strategies
- Players optimize the fun out of games by choosing the most efficient path. The most efficient strategy must NOT be the most boring one.
- Prevent dominant strategies that make all other mechanics, tactics, and tools irrelevant.

## 6. Player Agency
- Player actions and choices must have weight and visible consequences on the game world.
- Avoid autopilot, excessively long non-interactive sequences, and mechanics where outcomes are purely random with no player decision.

## 7. No "Slogan-Only Fun"
- If the design says something is "fun", "tense", "interesting", or "epic" — verify what specific mechanics, trade-offs, and feedback loops create and sustain that experience.
- Reject descriptions that sell an emotion without explaining which player decisions and system reactions produce it.
- **Bad:** "This system makes combat more fun and intense."
- **Good:** "The player must choose between blocking (safe but slow) and parrying (risky but creates a 2-second damage window), creating tension from risk/reward trade-offs."

## 8. Age Rating (PEGI 7)
- Content must comply with PEGI 7.
- **Prohibited:** realistic violence, detailed gore, profanity, jump scares, gambling themes.
- Conflict must be presented in softened or abstract form (defeated enemies dissolve into particles, run away, etc.).

---

## Review Format
When reviewing a design, structure each issue as:
1. **Problem** — which principle is violated, with a quote from the design
2. **Impact** — why this is bad for the target player
3. **Solutions** — 3 different ways to fix it, with references to existing games where possible
