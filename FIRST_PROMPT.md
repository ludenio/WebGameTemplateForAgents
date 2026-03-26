# First Prompt

Copy everything between the `---` lines below and paste it into your first message to the AI agent. Replace the placeholder with your game concept.

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

## Post work .gitignore

Create or update the `.gitignore` file so that only project files are committed to the Git repository, without temporary test files, logs, debug symbols, etc.

---
