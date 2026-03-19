# Architecture: Mutable UDF + Deterministic Lockstep

## Core Idea

One mutable state object. All changes go through a store. Discrete events are logged for replay. Continuous simulation runs every tick without logging.

```
View → store.dispatch(type, payload)
     → logged in store.history
     → handler mutates store.state
     → subscribers notified
```

---

## file:/// Compatibility

This project runs by opening `src/index.html` directly in a browser — no server, no build step.

**Constraints:**
- NO `import`/`export` — ES modules require HTTP due to CORS.
- NO bundlers (webpack, vite, rollup) — no build process.
- NO CDN or npm dependencies — all code is local.
- Files are loaded via `<script>` tags in `index.html` in dependency order.
- Each `.js` file wraps its code in an IIFE and exports via `window`.

```html
<!-- src/index.html — load order matters -->
<script src="store/store.js"></script>
<script src="config/units.js"></script>
<script src="config/balance.js"></script>
<script src="systems/playerSystem.js"></script>
<script src="systems/combatSystem.js"></script>
<script src="ui/inputHandler.js"></script>
<script src="ui/hpBar.js"></script>
<script src="main.js"></script>
```

---

## Global Export Pattern

Every source file follows this structure:

```js
// systems/playerSystem.js
;(function() {
    'use strict'

    var playerSystem = {
        init: function(store) {
            store.state.player = { hp: 100, x: 0, y: 0, isDead: false }

            store.register('PLAYER_HEAL', function(state, payload) {
                state.player.hp = Math.min(config.units.hero.baseHp, state.player.hp + payload.amount)
            }, 'player.hp')
        },
        update: function(state, dt) {
            // continuous simulation
        }
    }

    window.playerSystem = playerSystem
})()
```

Config files:

```js
// config/units.js
;(function() {
    'use strict'
    window.config = window.config || {}
    window.config.units = {
        hero:   { baseHp: 100, speed: 5,  damage: 10 },
        goblin: { baseHp: 30,  speed: 8,  damage: 5  },
    }
})()
```

---

## Store API

```
store.state                         single mutable object, plain data only
store.history                       array of { tick, type, payload }
store.prng                          seeded PRNG bound to store.state.seed
store.currentTick                   current simulation tick number

store.register(type, handler, slice?)   bind handler to action type; declare which slice it changes
store.dispatch(type, payload)           log + execute + notify
store.subscribe(fn(state, type))        called on every action
store.subscribeTo(slice, fn(state))     called only when declared slice changes
store.tick()                            advance tick counter; once per simulation step
store.resetState(seed)                  reset to initial state with explicit seed
store.clearAll()                        full reset: state + handlers + subscribers (for tests)
```

Source: `src/store/store.js` — do not modify without explicit instruction.

---

## Game Loop

Two kinds of state changes — never mix them:

| Kind | Mechanism | Logged? | Examples |
|------|-----------|---------|----------|
| Discrete event | `dispatch()` | Yes | button press, death, pickup, spawn |
| Continuous sim | `system.update(state, dt)` | No | movement, physics, AI tick |

```js
// main.js — entry point (inside IIFE)
function init() {
    var seed = Date.now()       // only place allowed to call Date.now()
    store.resetState(seed)

    playerSystem.init(store)    // registers handlers + sets initial state
    combatSystem.init(store)
}

var FIXED_DT    = 1 / 60
var accumulator = 0
var lastTime    = 0

function gameLoop(timestamp) {
    var elapsed = Math.min((timestamp - lastTime) / 1000, 0.1)
    lastTime = timestamp
    accumulator += elapsed

    while (accumulator >= FIXED_DT) {
        store.tick()                                // first — always
        playerSystem.update(store.state, FIXED_DT)
        combatSystem.update(store.state, FIXED_DT)
        accumulator -= FIXED_DT
    }

    render(store.state)                             // visual only, no game logic
    requestAnimationFrame(gameLoop)
}

init()
requestAnimationFrame(gameLoop)
```

Rules:
- `store.tick()` is the first call in the simulation step, before any system.
- One simulation method per project — fixed or variable, not both.
- Only `main.js` orchestrates `system.update()` calls.
- Inside `system.update()`, do NOT call `dispatch()` — set a flag in state instead; react next tick.

---

## Fixed vs Variable Timestep

Use a fixed `dt` constant (e.g. `1/60`) if any system multiplies by `dt`. Variable `dt` from `requestAnimationFrame` makes physics non-deterministic.

```js
// Option A: simple games without physics (variable dt ok)
function gameLoop(timestamp) {
    var dt = (timestamp - lastTime) / 1000
    lastTime = timestamp
    store.tick()
    playerSystem.update(store.state, dt)
}

// Option B: physics / determinism required (recommended)
var FIXED_DT = 1 / 60
var accumulator = 0

function gameLoop(timestamp) {
    accumulator += Math.min((timestamp - lastTime) / 1000, 0.1)
    lastTime = timestamp

    while (accumulator >= FIXED_DT) {
        store.tick()
        playerSystem.update(store.state, FIXED_DT)
        accumulator -= FIXED_DT
    }

    render(store.state)
    requestAnimationFrame(gameLoop)
}
```

Rule: if any system multiplies something by `dt` — use Option B.

---

## Handlers

Each system's `init()` method registers handlers and sets up initial state for its slice:

```js
// systems/combatSystem.js
;(function() {
    'use strict'

    var combatSystem = {
        init: function(store) {
            store.state.combat = { enemies: [] }

            store.register('SPAWN_ENEMY', function(state, payload) {
                var cfg = config.units[payload.unitType]
                var x = store.prng.next(0, 800)
                state.combat.enemies.push({
                    id: payload.id, type: payload.unitType, hp: cfg.baseHp, x: x
                })
            }, 'combat.enemies')

            store.register('ENEMY_DIE', function(state, payload) {
                state.combat.enemies = state.combat.enemies.filter(function(e) {
                    return e.id !== payload.id
                })
            }, 'combat.enemies')
        },

        update: function(state, dt) {
            for (var i = 0; i < state.combat.enemies.length; i++) {
                var enemy = state.combat.enemies[i]
                enemy.x += (enemy.speed || 1) * dt
            }
        }
    }

    window.combatSystem = combatSystem
})()
```

---

## Subscribers (View Layer)

```js
// ui/hpBar.js
;(function() {
    'use strict'

    var unsubscribeHp = null

    var hpBar = {
        mount: function(containerEl) {
            var bar   = containerEl.querySelector('#hp-fill')
            var label = containerEl.querySelector('#hp-label')

            unsubscribeHp = store.subscribeTo('player.hp', function(state) {
                var pct = state.player.hp / config.units.hero.baseHp
                bar.style.width = (pct * 100) + '%'
                label.textContent = String(state.player.hp)
            })
        },

        unmount: function() {
            if (unsubscribeHp) {
                unsubscribeHp()
                unsubscribeHp = null
            }
        }
    }

    window.hpBar = hpBar
})()
```

- Views call `dispatch()` and `subscribeTo()` only — no game logic, no state mutation.
- Prefer `subscribeTo(slice, fn)` over `subscribe(fn)` — fires only when that slice changes.
- Slice name = dot-path into state: `"player.hp"` maps to `state.player.hp`.
- Always call the returned unsubscribe when the view is destroyed.

---

## Replays

```js
// Save
var replay = { seed: store.state.seed, history: store.history }
localStorage.setItem('replay', JSON.stringify(replay))

// Load
var data = JSON.parse(localStorage.getItem('replay'))
store.resetState(data.seed)
playerSystem.init(store)
combatSystem.init(store)

for (var i = 0; i < data.history.length; i++) {
    store.dispatch(data.history[i].type, data.history[i].payload)
}
```

Replay works because:
1. Continuous simulation is deterministic — same seed, same outcome.
2. Discrete events are fully logged with tick timestamps.

---

## Randomness

Never use `Math.random()` — it breaks replays.
Always use `store.prng.next(min, max)`. It is seeded from `store.state.seed` and resets with `resetState()`.

```js
store.register('SPAWN_LOOT', function(state, payload) {
    var x = store.prng.next(0, 800)
    var y = store.prng.next(0, 600)
    state.loot.push({ id: payload.id, x: x, y: y })
}, 'loot')
```

---

## Config vs State

`store.state` holds only values that change during a session.
Static balance data lives in config files — handlers read config, write state.

```js
store.state.player.hp = 75                  // current value (changes in combat)
config.units.hero.baseHp = 100              // starting value (set by designer, constant)
```

| Goes in config | Goes in state |
|----------------|---------------|
| base HP, damage, speed | current HP, position, status |
| item prices, XP multipliers | inventory contents, gold amount |
| wave spawn settings | active enemies list |
| UI strings, animation IDs | flags, timers, counters |

---

## Slice Subscriptions (`subscribeTo`)

`store.subscribe(cb)` fires on every action. `store.subscribeTo(slice, cb)` fires only when the declared slice changes.

Handler declares the slice as a third argument:

```js
store.register('PLAYER_TAKE_DAMAGE', handler, 'player.hp')
store.register('ENEMY_MOVE',         handler, 'combat.enemies')
```

Slice name = dot-path into `store.state`:

| Slice | Maps to | Notifies |
|-------|---------|----------|
| `"player"` | `state.player` | Any player change |
| `"player.hp"` | `state.player.hp` | HP bar only |
| `"combat.enemies"` | `state.combat.enemies` | Minimap, AI |
| `"inventory.gold"` | `state.inventory.gold` | Gold counter |

Invalid slice names: `"heroData"`, `"enemyList"`, `"uiStuff"` — must be a real dot-path into state.

---

## File Structure

```
project/
├── AGENTS.md              # Rules: AI agent workflow and coding standards
├── ARCHITECTURE.md         # Rules: code architecture (this file)
├── DESIGN_RULES.md         # Rules: game design principles
├── FIRST_PROMPT.md         # Template: user's first message to AI agent
├── DESIGN.md               # Generated: game design document
├── TODO.md                 # Generated: implementation task list
├── src/
│   ├── index.html          # Entry point — loads all scripts via <script> tags
│   ├── main.js             # Game loop, init, system orchestration
│   ├── store/
│   │   └── store.js        # Store engine — do not modify
│   ├── config/             # Designer data — read-only at runtime
│   │   ├── units.js        #   window.config.units
│   │   ├── items.js        #   window.config.items
│   │   ├── balance.js      #   window.config.balance
│   │   └── strings.js      #   window.config.strings
│   ├── systems/            # One file = one state slice
│   │   ├── playerSystem.js #   only touches state.player
│   │   ├── combatSystem.js #   only touches state.combat
│   │   └── ...
│   └── ui/                 # View layer — dispatch and subscribeTo only
│       ├── hpBar.js
│       ├── inputHandler.js
│       └── ...
└── tests/
    ├── index.html          # Test runner — open in browser
    ├── helpers.js           # TestRunner: assert, assertEqual, printResults
    └── test-*.js            # Test suites
```

Rules:
- `playerSystem.js` touches only `state.player`. If it touches two slices — split the action.
- If a system file exceeds ~500 lines — split it into two domains.
- Each action type is registered in exactly one place.
- `store.state` holds only plain serializable data. No DOM refs, no class instances, no functions.

---

## Adding a New Feature (3 touch points)

1. **Config** — add balance data (if needed): `config/units.js` or `config/balance.js`
2. **System** — one `register()` call with handler: `systems/mySystem.js`
3. **Call site** — one `dispatch()` call: `ui/` or `main.js`

Then add a `<script>` tag to `index.html` (and `tests/index.html` if testing that file).

---

## Testing

Tests live in `tests/` and run by opening `tests/index.html` in a browser (works via `file:///`).

```html
<!-- tests/index.html -->
<script src="../src/store/store.js"></script>
<script src="../src/config/units.js"></script>
<script src="../src/systems/combatSystem.js"></script>
<script src="helpers.js"></script>
<script src="test-combat.js"></script>
<script>TestRunner.printResults()</script>
```

Test pattern (deterministic replay):

```js
;(function() {
    store.clearAll()
    store.resetState(42)
    combatSystem.init(store)

    store.dispatch('SPAWN_ENEMY', { id: 'e1', unitType: 'goblin' })
    store.dispatch('SPAWN_ENEMY', { id: 'e2', unitType: 'goblin' })

    var snapshot = JSON.parse(JSON.stringify(store.state))
    var history  = store.history.slice()

    store.clearAll()
    store.resetState(42)
    combatSystem.init(store)

    for (var i = 0; i < history.length; i++) {
        store.dispatch(history[i].type, history[i].payload)
    }

    TestRunner.assertDeepEqual(store.state, snapshot, 'Combat replay produces identical state')
})()
```

---

## Scaling

| Signal | Solution |
|--------|----------|
| Session > 15 min or > 5000 actions | Snapshotting: save full state every N ticks, replay from nearest checkpoint |
| More than 5–7 top-level state keys | Subsystems: explicit slice ownership per file |
| Need logging, network, validation | Middleware: wrap `dispatch()` in a chain |

Middleware intercepts but never mutates state directly — that is the handler's job.
