// Entry point — seed, system init, game loop.
// This is the only file allowed to call Date.now().

;(function() {
    'use strict'

    function init() {
        var seed = Date.now()
        store.resetState(seed)

        // >>> Initialize your systems here <<<
        // Example: playerSystem.init(store)
    }

    var FIXED_DT    = 1 / 60
    var accumulator = 0
    var lastTime    = 0

    function gameLoop(timestamp) {
        var elapsed = Math.min((timestamp - lastTime) / 1000, 0.1)
        lastTime = timestamp
        accumulator += elapsed

        while (accumulator >= FIXED_DT) {
            store.tick()

            // >>> Update your systems here <<<
            // Example: playerSystem.update(store.state, FIXED_DT)

            accumulator -= FIXED_DT
        }

        render(store.state)
        requestAnimationFrame(gameLoop)
    }

    function render(state) {
        // >>> Visual rendering only — no game logic <<<
    }

    init()
    requestAnimationFrame(gameLoop)

})()
