// Store engine tests — determinism, dispatch, subscriptions, replay.

;(function() {
    'use strict'

    var assert      = TestRunner.assert
    var assertEqual = TestRunner.assertEqual

    // --- resetState ---
    store.clearAll()
    store.resetState(42)
    assertEqual(store.state.seed, 42, 'resetState sets seed')
    assertEqual(store.currentTick, 0, 'resetState resets tick to 0')
    assertEqual(store.history.length, 0, 'resetState clears history')

    // --- register + dispatch ---
    store.clearAll()
    store.resetState(100)
    store.register('SET_VALUE', function(state, payload) {
        state.testValue = payload.value
    }, 'testValue')
    store.dispatch('SET_VALUE', { value: 42 })
    assertEqual(store.state.testValue, 42, 'dispatch executes handler and mutates state')
    assertEqual(store.history.length, 1, 'dispatch logs action to history')
    assertEqual(store.history[0].type, 'SET_VALUE', 'history entry has correct type')

    // --- dispatch unknown type is a no-op ---
    store.clearAll()
    store.resetState(1)
    store.dispatch('UNKNOWN_ACTION', { x: 1 })
    assertEqual(store.history.length, 0, 'dispatch of unregistered type does nothing')

    // --- tick ---
    store.clearAll()
    store.resetState(1)
    assertEqual(store.currentTick, 0, 'tick starts at 0 after reset')
    store.tick()
    assertEqual(store.currentTick, 1, 'tick increments to 1')
    store.tick()
    store.tick()
    assertEqual(store.currentTick, 3, 'tick increments correctly')

    // --- PRNG determinism ---
    store.clearAll()
    store.resetState(42)
    var a1 = store.prng.next(0, 100)
    var a2 = store.prng.next(0, 100)
    var a3 = store.prng.next(0, 100)

    store.resetState(42)
    var b1 = store.prng.next(0, 100)
    var b2 = store.prng.next(0, 100)
    var b3 = store.prng.next(0, 100)

    assertEqual(a1, b1, 'PRNG: same seed produces same 1st value')
    assertEqual(a2, b2, 'PRNG: same seed produces same 2nd value')
    assertEqual(a3, b3, 'PRNG: same seed produces same 3rd value')

    // --- PRNG different seeds produce different values ---
    store.resetState(1)
    var c1 = store.prng.next(0, 1000)
    store.resetState(2)
    var d1 = store.prng.next(0, 1000)
    assert(c1 !== d1, 'PRNG: different seeds produce different values')

    // --- Deterministic replay ---
    store.clearAll()
    store.resetState(99)
    store.register('ADD', function(state, payload) {
        state.counter = (state.counter || 0) + payload.n
    }, 'counter')

    store.dispatch('ADD', { n: 10 })
    store.dispatch('ADD', { n: 5 })
    store.dispatch('ADD', { n: 3 })

    var snapshot = JSON.parse(JSON.stringify(store.state))
    var history  = store.history.slice()

    store.clearAll()
    store.resetState(99)
    store.register('ADD', function(state, payload) {
        state.counter = (state.counter || 0) + payload.n
    }, 'counter')

    for (var i = 0; i < history.length; i++) {
        store.dispatch(history[i].type, history[i].payload)
    }

    assertEqual(store.state.counter, snapshot.counter, 'Replay produces identical state')
    assertEqual(store.state.counter, 18, 'Counter value correct after replay (10+5+3=18)')

    // --- subscribeTo fires on correct slice ---
    store.clearAll()
    store.resetState(1)
    var sliceFired = false
    store.register('SET_HP', function(state, payload) {
        state.player = state.player || {}
        state.player.hp = payload.hp
    }, 'player.hp')
    store.subscribeTo('player.hp', function() { sliceFired = true })
    store.dispatch('SET_HP', { hp: 50 })
    assert(sliceFired, 'subscribeTo fires when its slice changes')

    // --- subscribeTo does NOT fire on other slices ---
    store.clearAll()
    store.resetState(1)
    var wrongFired = false
    store.register('SET_GOLD', function(state, payload) {
        state.inventory = state.inventory || {}
        state.inventory.gold = payload.amount
    }, 'inventory.gold')
    store.subscribeTo('player.hp', function() { wrongFired = true })
    store.dispatch('SET_GOLD', { amount: 100 })
    assert(!wrongFired, 'subscribeTo does NOT fire for unrelated slices')

    // --- global subscribe fires on every action ---
    store.clearAll()
    store.resetState(1)
    var globalCount = 0
    store.register('A', function(state) { state.a = 1 }, 'a')
    store.register('B', function(state) { state.b = 2 }, 'b')
    store.subscribe(function() { globalCount++ })
    store.dispatch('A', {})
    store.dispatch('B', {})
    assertEqual(globalCount, 2, 'Global subscriber fires on every dispatched action')

    // --- unsubscribe stops notifications ---
    store.clearAll()
    store.resetState(1)
    var unsubCount = 0
    store.register('X', function(state) { state.x = 1 }, 'x')
    var unsub = store.subscribe(function() { unsubCount++ })
    store.dispatch('X', {})
    assertEqual(unsubCount, 1, 'Subscriber fires before unsubscribe')
    unsub()
    store.dispatch('X', {})
    assertEqual(unsubCount, 1, 'Subscriber does NOT fire after unsubscribe')

    // --- subscribeTo unsubscribe ---
    store.clearAll()
    store.resetState(1)
    var sliceCount = 0
    store.register('Y', function(state) { state.y = (state.y || 0) + 1 }, 'y')
    var unsubSlice = store.subscribeTo('y', function() { sliceCount++ })
    store.dispatch('Y', {})
    assertEqual(sliceCount, 1, 'Slice subscriber fires before unsubscribe')
    unsubSlice()
    store.dispatch('Y', {})
    assertEqual(sliceCount, 1, 'Slice subscriber does NOT fire after unsubscribe')

    // --- resetState throws without seed ---
    var threw = false
    try { store.resetState() } catch (e) { threw = true }
    assert(threw, 'resetState throws when called without seed')

    // --- clearAll resets everything ---
    store.clearAll()
    store.resetState(50)
    store.register('Z', function(state) { state.z = 1 }, 'z')
    store.dispatch('Z', {})
    store.tick()
    store.clearAll()
    assertEqual(store.history.length, 0, 'clearAll resets history')
    assertEqual(store.currentTick, 0, 'clearAll resets tick')
    assertEqual(Object.keys(store.handlers).length, 0, 'clearAll removes all handlers')

    // --- history records tick number ---
    store.clearAll()
    store.resetState(1)
    store.register('T', function(state) { state.t = 1 }, 't')
    store.tick()
    store.tick()
    store.dispatch('T', {})
    assertEqual(store.history[0].tick, 2, 'History entry records current tick')

})()
