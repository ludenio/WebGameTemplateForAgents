// Store engine. Do not modify without explicit instruction.
// Loaded via <script> tag — exports to window.store.

;(function(root) {
    'use strict'

    function createPrng(seed) {
        var s = seed >>> 0
        return {
            next: function(min, max) {
                s = (Math.imul(s, 1103515245) + 12345) >>> 0
                var rand = s / 0x100000000
                if (min !== undefined && max !== undefined) {
                    return Math.floor(min + rand * (max - min + 1))
                }
                return rand
            }
        }
    }

    function createInitialState() {
        return { seed: 0 }
    }

    var store = {
        state:            createInitialState(),
        history:          [],
        handlers:         {},
        subscribers:      [],
        sliceSubscribers: {},
        currentTick:      0,
        prng:             createPrng(0),

        resetState: function(seed) {
            if (seed === undefined || seed === null) {
                throw new Error('[store] resetState requires an explicit seed')
            }
            this.state       = createInitialState()
            this.state.seed  = seed
            this.history     = []
            this.currentTick = 0
            this.prng        = createPrng(seed >>> 0)
        },

        register: function(type, handler, slice) {
            this.handlers[type] = { fn: handler, slice: slice || null }
        },

        dispatch: function(type, payload) {
            var entry = this.handlers[type]
            if (!entry) return

            this.history.push({ tick: this.currentTick, type: type, payload: payload })
            entry.fn(this.state, payload)

            for (var i = 0; i < this.subscribers.length; i++) {
                this.subscribers[i](this.state, type, payload)
            }

            if (entry.slice && this.sliceSubscribers[entry.slice]) {
                var list = this.sliceSubscribers[entry.slice]
                for (var j = 0; j < list.length; j++) {
                    list[j](this.state)
                }
            }
        },

        subscribe: function(callback) {
            this.subscribers.push(callback)
            var subs = this.subscribers
            return function() {
                var i = subs.indexOf(callback)
                if (i !== -1) subs.splice(i, 1)
            }
        },

        subscribeTo: function(slice, callback) {
            if (!this.sliceSubscribers[slice]) {
                this.sliceSubscribers[slice] = []
            }
            this.sliceSubscribers[slice].push(callback)
            var list = this.sliceSubscribers[slice]
            return function() {
                var i = list.indexOf(callback)
                if (i !== -1) list.splice(i, 1)
            }
        },

        tick: function() {
            this.currentTick++
        },

        clearAll: function() {
            this.state            = createInitialState()
            this.history          = []
            this.handlers         = {}
            this.subscribers      = []
            this.sliceSubscribers = {}
            this.currentTick      = 0
            this.prng             = createPrng(0)
        }
    }

    root.store = store

})(typeof window !== 'undefined' ? window : globalThis)
