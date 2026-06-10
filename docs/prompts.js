// docs/prompts.js
// Single source of the prompt text used by the Workshop Console.
// Loaded via a plain <script> tag (no ES modules) and exported on window.
//
// IMPORTANT: keep these templates in sync with:
//   - FIRST_PROMPT.md            (first-game prompt)
//   - NEXT_ITERATION_PROMPT.md   (change-an-existing-game prompt)
//   - AGENTS_WORKSHOP_GUIDE.md   (Surge publish prompt)
;(function() {
    'use strict'

    // ----- First game -----------------------------------------------------

    // The fixed instructions that always wrap the user's concept.
    // Mirrors the copy block in FIRST_PROMPT.md.
    function buildFirstPrompt(concept) {
        var idea = (concept && concept.trim()) ? concept.trim() : '[Describe your game here.]'
        return [
            'Read the following project files before doing anything:',
            '1. `AGENTS.md`',
            '2. `ARCHITECTURE.md`',
            '3. `DESIGN_RULES.md`',
            '',
            'Confirm that you understand the rules, then proceed with the workflow described in `AGENTS.md`.',
            '',
            '## My Game Concept',
            '',
            idea,
            '',
            '## Instructions',
            '',
            'Follow the development workflow from `AGENTS.md`:',
            '1. Write `DESIGN.md` based on my concept (validate against `DESIGN_RULES.md`)',
            '2. After I approve the design, write `TODO.md` (plan per `ARCHITECTURE.md`)',
            '3. After I approve the plan, implement all tasks from `TODO.md` sequentially',
            '4. Write and run tests — fix any failures, re-run until all pass',
            '',
            'Start with Phase 1 — write the game design document.'
        ].join('\n')
    }

    // Turn the structured form fields into a readable concept paragraph.
    // Any free-text idea is appended so the user's own words are preserved.
    function buildConcept(fields) {
        fields = fields || {}
        var lines = []
        if (fields.genre)   lines.push('Genre: ' + fields.genre + '.')
        if (fields.action)  lines.push('Core action: ' + fields.action + '.')
        if (fields.goal)    lines.push('Goal / how the player wins: ' + fields.goal + '.')
        if (fields.style)   lines.push('Visual style: ' + fields.style + '.')
        if (fields.winLose) lines.push('Win / lose conditions: ' + fields.winLose + '.')

        var idea = (fields.idea && fields.idea.trim()) ? fields.idea.trim() : ''
        if (idea) {
            if (lines.length) lines.push('')
            lines.push(idea)
        }
        return lines.join('\n')
    }

    // ----- Next iteration -------------------------------------------------

    // Mirrors the copy block in NEXT_ITERATION_PROMPT.md.
    function buildNextPrompt(change) {
        var request = (change && change.trim()) ? change.trim() : '[Describe what you want to add, change, or remove.]'
        return [
            'Read the following project files before doing anything:',
            '1. `AGENTS.md`',
            '2. `ARCHITECTURE.md`',
            '3. `DESIGN_RULES.md`',
            '4. `DESIGN.md`',
            '5. `TODO.md`',
            '',
            'Confirm that you understand the rules and the current state of the project, then proceed with the iteration workflow.',
            '',
            '## What I Want to Change',
            '',
            request,
            '',
            '## Instructions',
            '',
            'Follow the iteration workflow from `AGENTS.md`:',
            '',
            '1. **Validate** — check my request against `DESIGN_RULES.md` and `ARCHITECTURE.md`. If it violates any rule, warn me and propose alternatives before proceeding.',
            '2. **Update DESIGN.md** — modify the design document to reflect the change. Do not delete unrelated sections. Validate updated design against `DESIGN_RULES.md`. Show me the diff for approval.',
            '3. **Update TODO.md** — add new tasks for the change. Mark previously completed tasks as done, don\'t remove them. Show me the new tasks for approval.',
            '4. **Implement** — execute the new tasks sequentially.',
            '5. **Test** — update existing tests and write new ones. Run all tests (not just new ones). Fix failures, re-run until all pass.',
            '',
            'Do NOT skip straight to code. Start with step 1.'
        ].join('\n')
    }

    // ----- Publish (Surge) ------------------------------------------------

    // Mirrors the Surge publish prompt in AGENTS_WORKSHOP_GUIDE.md.
    // {email} and {domain} are substituted into the copied text.
    function buildPublishPrompt(opts) {
        opts = opts || {}
        var email    = (opts.email && opts.email.trim())       ? opts.email.trim()    : '{YOUR_EMAIL_OR_SEPARATE_EMAIL}'
        var domain   = (opts.domain && opts.domain.trim())     ? opts.domain.trim()   : '{GAME_NAME}.surge.sh'
        var password = (opts.password && opts.password.trim()) ? opts.password.trim() : ''

        var lines = [
            'Publish my browser game on the web with Surge so I can send a playable link to a friend.',
            '',
            'Important:',
            '- the game is inside the src folder;',
            '- publish only ./src, not the whole project folder;',
            '- use your tools and terminal access to do the publishing for me, not just explain the commands;',
            '- first check whether node and npx are installed;',
            '- if node or npx is missing, help me install the Node.js LTS version for my operating system, then check again;',
            '- when ready, run: npx --yes surge ./src ' + domain + ';',
            '- if my agent app asks me to approve a command, wait for my approval;',
            '- if Surge asks for email or domain, you may enter the values below;'
        ]

        if (password) {
            lines.push('- if Surge asks for a password, you may enter the password below to log in;')
            lines.push('- never write the password into any project file and never commit it to Git.')
        } else {
            lines.push('- if Surge asks for a password, stop and tell me exactly where to type it myself;')
            lines.push('- do not invent a password and do not save the password into project files.')
        }

        lines.push('')
        lines.push('My Surge details:')
        lines.push('- email: ' + email)
        lines.push('- domain: ' + domain)
        if (password) lines.push('- password: ' + password)
        lines.push('')
        lines.push(password
            ? 'Use the password above only to log in to Surge during this publish — do not store it anywhere in the project.'
            : 'I will provide the password myself if Surge asks for it.')
        lines.push('')
        lines.push('After publishing, tell me the final game link.')

        return lines.join('\n')
    }

    // ----- Shared helper text ---------------------------------------------

    // One approval phrase, used everywhere (console checklist and
    // AGENTS_WORKSHOP_GUIDE.md must stay in sync).
    var approvalPhrases = {
        design: 'I approve, continue.',
        plan:   'I approve, continue.'
    }

    // Quick-start presets replace every first-game field atomically (no merge).
    var exampleConcepts = [
        {
            label: 'Coin collector',
            genre: 'Top-down arcade',
            action: 'Run around an island collecting coins as they appear',
            goal: 'Reach the target score before the timer runs out',
            style: 'Bright, simple shapes',
            winLose: 'Win by reaching the target score before time ends; lose when the timer runs out',
            idea: 'Coins appear in random spots across the island.'
        },
        {
            label: 'Tiny dungeon crawler',
            genre: 'Top-down dungeon crawler',
            action: 'Walk room to room, fight blob enemies, pick up keys',
            goal: 'Reach the exit',
            style: 'Simple dungeon tiles, sparkle effects on defeated enemies',
            winLose: 'Win by reaching the exit; lose by touching too many enemies',
            idea: 'Slow blob enemies dissolve into sparkles when defeated.'
        },
        {
            label: 'Falling-fruit catcher',
            genre: 'Arcade reflex game',
            action: 'Move a basket left and right to catch falling fruit',
            goal: 'Reach a high score',
            style: 'Colorful fruit, clean flat shapes',
            winLose: 'Win by chasing a high score; lose after missing three fruits',
            idea: 'Fruit falls from the top at increasing speed.'
        },
        {
            label: 'Maze escape',
            genre: 'Top-down maze',
            action: 'Navigate walls, use glowing speed tiles, beat the timer',
            goal: 'Find and reach the exit',
            style: 'Simple maze tiles with glowing accent tiles',
            winLose: 'Win by reaching the exit; lose when the timer hits zero',
            idea: 'Glowing tiles give a short speed boost.'
        }
    ]

    // Change-prompt presets — worded so they fit any default game idea.
    var exampleChanges = [
        {
            label: 'Speed-up shop',
            text: 'Add a shop where the player can spend collected progress (score, pickups, or currency — whatever the game already uses) on permanent upgrades, starting with a movement speed boost.'
        },
        {
            label: 'Ramp difficulty',
            text: 'The game gets too easy over time — add a difficulty curve that ramps up as the player makes progress (faster hazards, tighter timers, tougher obstacles, or more pressure — pick what fits this game).'
        },
        {
            label: 'Star rating',
            text: 'Replace the current scoring or win tracking with a star-rating system (1–3 stars per run or level, based on how well the player performed).'
        },
        {
            label: 'No timer',
            text: 'Remove any countdown or time-pressure mechanic — the player should not lose just because time ran out.'
        }
    ]

    var CUSTOM_PRESET_LABEL = 'Custom — I\'ll write my own'

    // Normalize a preset object into the six first-game field values.
    function firstPresetFields(preset) {
        preset = preset || {}
        return {
            genre:   preset.genre   || '',
            action:  preset.action  || '',
            goal:    preset.goal    || '',
            style:   preset.style   || '',
            winLose: preset.winLose || '',
            idea:    preset.idea != null ? preset.idea : (preset.text || '')
        }
    }

    window.prompts = {
        buildFirstPrompt:   buildFirstPrompt,
        buildConcept:       buildConcept,
        buildNextPrompt:    buildNextPrompt,
        buildPublishPrompt: buildPublishPrompt,
        approvalPhrases:    approvalPhrases,
        exampleConcepts:    exampleConcepts,
        exampleChanges:     exampleChanges,
        firstPresetFields:  firstPresetFields,
        CUSTOM_PRESET_LABEL: CUSTOM_PRESET_LABEL
    }

})()
