# First Prompt

Write your idea in normal language. The agent will turn it into a design, a task plan, code, and tests.

**Copy everything between the `---` lines below** and paste it into your first message to the AI agent. Replace the placeholder with your game concept.

> Prefer a form you can click instead of editing this file? Open the **[Workshop Console](https://ludenio.github.io/WebGameTemplateForAgents/)** — the **New game prompt** tab assembles and copies this exact prompt for you.

## Concept Quality Checklist

Before sending, check that your concept answers these five questions:

- [ ] **What does the player do moment-to-moment?** (move, jump, collect, aim, dodge...)
- [ ] **How does the player win?** (reach a score, find the exit, survive N waves...)
- [ ] **How does the player lose?** (timer runs out, health hits zero, three misses...)
- [ ] **What does it look like?** (top-down, side view; bright shapes, dungeon tiles...)
- [ ] **What makes it fun?** (speed, risk, exploration, mastery...)

**Weak concept** (the agent will have to guess almost everything):

> A game about a wizard. It should be fun and have magic.

**Good concept** (specific enough to design from):

> Top-down arcade. A wizard runs around a small arena and collects mana crystals while slow ghosts chase him. Picking up 10 crystals wins the round; getting touched by a ghost three times loses. Each crystal collected makes ghosts slightly faster. Bright, simple shapes, glowing effects on crystals.

---

Read the following project files before doing anything:
1. `AGENTS.md`
2. `ARCHITECTURE.md`
3. `DESIGN_RULES.md`

Confirm that you understand the rules, then proceed with the workflow described in `AGENTS.md`.

## My Game Concept

<!-- ============================================= -->
<!-- REPLACE THIS BLOCK WITH YOUR GAME IDEA        -->
<!-- ============================================= -->

[Describe your game here. What genre is it? What is the core mechanic? What is the setting? What makes it fun? What does the player do moment-to-moment? How does the player win or lose?

The more detail you provide, the better the design document will be.
Minimum: 2-3 sentences. Recommended: a full paragraph or more.]

<!-- ============================================= -->
<!-- END OF GAME CONCEPT                           -->
<!-- ============================================= -->

## Instructions

Follow the development workflow from `AGENTS.md`:
1. Write `DESIGN.md` based on my concept (validate against `DESIGN_RULES.md`)
2. After I approve the design, write `TODO.md` (plan per `ARCHITECTURE.md`)
3. After I approve the plan, implement all tasks from `TODO.md` sequentially
4. Write and run tests — fix any failures, re-run until all pass

Start with Phase 1 — write the game design document.

---
