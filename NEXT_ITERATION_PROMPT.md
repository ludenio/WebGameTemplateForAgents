# Next Iteration Prompt

Use this template when you want to change, add, or remove something in a game that has already been through the first development cycle (i.e. `DESIGN.md`, `TODO.md`, and working code already exist).

Copy everything between the `---` lines below and paste it into your message to the coding agent. Replace the placeholder with your change request.

---

Read the following project files before doing anything:
1. `AGENTS.md`
2. `ARCHITECTURE.md`
3. `DESIGN_RULES.md`
4. `DESIGN.md`
5. `TODO.md`

Confirm that you understand the rules and the current state of the project, then proceed with the iteration workflow.

## What I Want to Change

<!-- ============================================= -->
<!-- DESCRIBE YOUR CHANGE HERE                     -->
<!-- ============================================= -->

[Describe what you want to add, change, or remove. Examples:
- "Add an inventory system where the player can collect and use items"
- "Enemies are too easy, I want a difficulty curve that scales with wave number"
- "Replace the current scoring with a star-rating system (1-3 stars per level)"
- "Remove the timer mechanic, it feels stressful and unfun"]

<!-- ============================================= -->
<!-- END OF CHANGE REQUEST                         -->
<!-- ============================================= -->

## Instructions

Follow the iteration workflow from `AGENTS.md`:

1. **Validate** — check my request against `DESIGN_RULES.md` and `ARCHITECTURE.md`. If it violates any rule, warn me and propose alternatives before proceeding.
2. **Update DESIGN.md** — modify the design document to reflect the change. Do not delete unrelated sections. Validate updated design against `DESIGN_RULES.md`. Show me the diff for approval.
3. **Update TODO.md** — add new tasks for the change. Mark previously completed tasks as done, don't remove them. Show me the new tasks for approval.
4. **Implement** — execute the new tasks sequentially.
5. **Test** — update existing tests and write new ones. Run all tests (not just new ones). Fix failures, re-run until all pass.

Do NOT skip straight to code. Start with step 1.

---
