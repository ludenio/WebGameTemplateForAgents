# Web Game Template for Coding Agent-Assisted Development

A project template for building browser games with the help of a coding agent (Cursor Agent, Codex, Claude Code, etc.). You describe the game — the agent writes the design doc, plans the tasks, implements the code, and tests it, all within strict architecture and design rules baked into the repo.

## How It Works

1. Clone this repo
2. Open in an IDE with a coding agent (Cursor, VS Code + Copilot, etc.)
3. Open `FIRST_PROMPT.md`, write your game concept in the placeholder
4. Copy the prompt into the agent chat
5. The coding agent reads the rules and follows a 4-phase workflow:

| Phase | What happens | Output |
|-------|-------------|--------|
| 1. Design | Agent writes a game design document | `DESIGN.md` |
| 2. Planning | Agent creates an ordered task list | `TODO.md` |
| 3. Implementation | Agent builds the game task by task | `src/` |
| 4. Testing | Agent writes tests, fixes failures until all pass | `tests/` |

The coding agent checks every change against the architecture and design rules. If your request would violate a rule, it warns you and proposes alternatives before writing any code.

## What's Inside

```
├── AGENTS.md           # AI agent rules: workflow, guard behavior, coding standards
├── ARCHITECTURE.md      # Code architecture: store API, patterns, file structure
├── DESIGN_RULES.md      # Game design principles: balance, UX, progression, etc.
├── FIRST_PROMPT.md      # Template for your first message to the AI agent
├── src/
│   ├── index.html       # Entry point — open in browser (works via file:///)
│   ├── main.js          # Game loop skeleton
│   └── store/
│       └── store.js     # State management engine (don't modify)
└── tests/
    ├── index.html       # Test runner — open in browser
    ├── helpers.js        # Minimal test framework (assert, assertEqual)
    └── test-store.js     # Store engine tests (28 tests)
```

**Rules** (permanent, define standards):
- `AGENTS.md` — how the coding agent should work: 4-phase workflow, guard behavior that blocks rule-violating changes, coding conventions
- `ARCHITECTURE.md` — Mutable UDF + Deterministic Lockstep: one mutable state object, dispatched events logged for replay, continuous simulation on every tick
- `DESIGN_RULES.md` — 9 game design principles: intuitive affordances, emergent gameplay, wave-like difficulty, player agency, PEGI 7 compliance, etc.

**Generated per game** (created by the agent):
- `DESIGN.md` — game design document for your specific game
- `TODO.md` — implementation task list

## Key Constraints

- **No server required.** The game runs by opening `src/index.html` directly via `file:///` in any modern browser. No build tools, no npm, no bundlers.
- **No ES modules.** Files use IIFEs and `window` globals instead of `import`/`export` (ES modules require an HTTP server due to CORS).
- **Deterministic replay.** All randomness goes through a seeded PRNG (`store.prng.next()`). `Math.random()` is forbidden. Game sessions can be saved and replayed identically.
- **Pure state.** `store.state` contains only plain serializable data (numbers, strings, booleans, objects, arrays). No DOM refs, no class instances.

## Architecture at a Glance

```
User Input → store.dispatch(type, payload)
           → logged in store.history
           → handler mutates store.state
           → subscribers notified → UI updates
```

Two kinds of state changes, kept strictly separate:

| Kind | How | Logged? | Use for |
|------|-----|---------|---------|
| Discrete events | `store.dispatch()` | Yes | inputs, spawns, deaths |
| Continuous simulation | `system.update(state, dt)` | No | movement, physics, AI |

## Running Tests

Open `tests/index.html` in a browser (works via `file:///`). All results display on the page.

Or run via Node.js:

```bash
node -e "
globalThis.window = globalThis;
globalThis.document = { getElementById: function() { return null }, title: '' };
require('./src/store/store.js');
require('./tests/helpers.js');
require('./tests/test-store.js');
var r = TestRunner.results, p = 0, f = 0;
r.forEach(function(t) { t.pass ? p++ : (f++, console.log('FAIL:', t.message)); });
console.log(p + ' passed, ' + f + ' failed');
process.exit(f);
"
```

## License

MIT
