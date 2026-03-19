# Rules for AI Agent

## Read First

Before ANY work, read these files in order:
1. `ARCHITECTURE.md` — code patterns, store API, file structure
2. `DESIGN_RULES.md` — game design quality principles

If they exist, also read:
3. `DESIGN.md` — this game's design (generated per project)
4. `TODO.md` — current task list (generated per project)

## Document Types

| File | Kind | Purpose |
|------|------|---------|
| `AGENTS.md`, `ARCHITECTURE.md`, `DESIGN_RULES.md` | **Rules** (permanent) | How to work, how to code, how to design |
| `DESIGN.md`, `TODO.md` | **Project docs** (generated) | What this specific game is and what to build |

Rules files define standards. Project docs are generated per game. Never confuse them.

---

## Guard Behavior

Before implementing any request, check it against `ARCHITECTURE.md`, `DESIGN_RULES.md`, and `DESIGN.md`.

**If a violation is found:**
1. **STOP** — do not write code
2. **State** which rule is violated and why
3. **Propose** 1–3 compliant alternatives
4. **Wait** for user to confirm before proceeding

---

## Development Workflow

### Phase 1 → DESIGN.md
Read user's concept + `DESIGN_RULES.md`. Write `DESIGN.md` — a complete game design document. Validate against every design principle. Present for approval.

### Phase 2 → TODO.md
Read approved `DESIGN.md` + `ARCHITECTURE.md`. Write `TODO.md` — ordered, atomic tasks with references to design sections and affected files. Foundations first (config → systems → UI → polish). Present for approval.

### Phase 3 → Implementation
Execute `TODO.md` sequentially. Mark each task done. Verify `ARCHITECTURE.md` compliance after each task.

### Phase 4 → Testing
Write tests in `tests/` verifying: feature correctness against `DESIGN.md`, deterministic replay, architecture compliance. Run tests by opening `tests/index.html`. If any test fails — fix code, re-run all tests. Repeat until all pass.

---

## Coding Rules

### 1. file:/// Compatibility (CRITICAL)
Game MUST work when opened via `file:///` in any modern browser:
- **NO ES modules** — `import`/`export` require HTTP server due to CORS. Forbidden.
- **NO build process** — no bundlers, transpilers, or package managers at runtime.
- **NO external dependencies** — all code is self-contained in `src/`.
- Load files via `<script>` tags in `index.html` in dependency order.
- Each `.js` file wraps code in an IIFE and assigns exports to `window`.

### 2. Global Export Pattern
Every source file:
```js
;(function() {
    'use strict'
    // ... implementation ...
    window.myModule = { /* public API */ }
})()
```

Config files:
```js
;(function() {
    'use strict'
    window.config = window.config || {}
    window.config.units = { /* data */ }
})()
```

### 3. Data Flow
- **UI** (`ui/`) — calls `store.dispatch()` and `store.subscribeTo()` only. No game logic, no state writes.
- **Handlers** (`store.register(type, fn)`) — mutate state directly. State is a plain mutable object.
- **Dispatch** only discrete events: inputs, spawns, deaths, pickups.
- **Continuous sim** — lives in `system.update()`, not in handlers.
- **Subscribers** — always store and call the unsubscribe function on cleanup.

### 4. Game Loop
- `store.tick()` — first call in each simulation step, once, in `main.js` only.
- Fixed timestep (`FIXED_DT`) if any system multiplies by `dt`.
- `main.js` orchestrates all `system.update()` calls.
- Inside `update()`, set flags in state; dispatch in the next tick.
- `render()` in `requestAnimationFrame` — no game logic.

Two kinds of state changes — never mix:

| Kind | Mechanism | Logged? | Examples |
|------|-----------|---------|----------|
| Discrete event | `dispatch()` | Yes | button press, death, spawn |
| Continuous sim | `system.update()` | No | movement, physics, AI tick |

### 5. Determinism
- `Math.random()` **forbidden**. Use `store.prng.next()`.
- `Date.now()` only in `main.js` for the session seed.
- `store.resetState(seed)` requires an explicit seed.
- Replay format: `{ seed, history }`.

### 6. Slice Subscriptions
- Prefer `store.subscribeTo(slice, fn)` over `store.subscribe(fn)`.
- Slice = dot-path into state: `"player.hp"` → `state.player.hp`.
- Declare slice in `store.register(type, handler, 'player.hp')`.
- One action = one slice. Mutating two slices → split into two actions.

### 7. Config vs State
- Static balance (HP, damage, prices) → `config/*.js`. Read-only at runtime.
- Changing values → `store.state`.
- Strings → `config/strings.js`.

### 8. File Decomposition
- One file = one state slice. `playerSystem.js` touches only `state.player`.
- Split at ~500 lines.

### 9. State Purity
`store.state` = only plain serializable data: numbers, strings, booleans, plain objects, arrays.
No DOM nodes, class instances, functions.

### 10. Code Simplicity
- Write for a junior developer. If it needs more than one sentence to explain — simplify.
- New action = 3 touch points: config entry + `register()` + `dispatch()`.
- Each action type registered in exactly one place. Each config value in exactly one file.
