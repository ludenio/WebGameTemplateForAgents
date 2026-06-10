// config/figures.js — tetris figure shape presets + generation constants
// (DESIGN §6.2, concept §18). Shapes are arrays of [dx, dy] cells.

;(function() {
    'use strict'
    window.config = window.config || {}

    window.config.figures = {

        // shape presets with weights; size = cell count
        shapes: {
            I4: { cells: [[0, 0], [1, 0], [2, 0], [3, 0]], weight: 8 },
            O4: { cells: [[0, 0], [1, 0], [0, 1], [1, 1]], weight: 10 },
            L4: { cells: [[0, 0], [0, 1], [0, 2], [1, 2]], weight: 8 },
            T4: { cells: [[0, 0], [1, 0], [2, 0], [1, 1]], weight: 8 },
            S4: { cells: [[1, 0], [2, 0], [0, 1], [1, 1]], weight: 6 },
            I3: { cells: [[0, 0], [1, 0], [2, 0]], weight: 5 },
            V3: { cells: [[0, 0], [0, 1], [1, 1]], weight: 5 },
            P5: { cells: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]], weight: 4 },
            U5: { cells: [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1]], weight: 3 }
        },

        // first figures after hub (concept §18): only size 4, >=2 biomes,
        // exactly 1 non-hole boss, exactly 1 workbench (non-repeating), no shop/blocker
        firstFigure: { size: 4, minBiomes: 2, bosses: 1, workbenches: 1 },

        // small figure escalation: size X < 4 -> next figure at least X+1
        smallFigureMin: 4,

        // blockers / mountains (concept §18)
        blockers: {
            maxFractionOfFigure: 0.5,  // no more than half a figure
            chance: 0.18               // chance a non-special room becomes blocker/mountain
        },

        // hand-authored starting figure around the hub (DESIGN §7 onboarding):
        // offsets relative to hub cell. Rooms: core, spawner room, wood room, workbench room.
        startFigure: [
            { dx: 0, dy: 0, role: 'core' },
            { dx: 1, dy: 0, role: 'spawner' },
            { dx: 2, dy: 0, role: 'wood' },
            { dx: 2, dy: 1, role: 'workbench' }
        ]
    }
})()
