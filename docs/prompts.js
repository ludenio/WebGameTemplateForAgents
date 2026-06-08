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
            'Start with Phase 1 — write the game design document.',
            '',
            '## Post work .gitignore',
            '',
            'Create or update the `.gitignore` file so that only project files are committed to the Git repository, without temporary test files, logs, debug symbols, etc.'
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

    var approvalPhrases = {
        design: 'Design approved.',
        plan:   'Plan approved, build it.'
    }

    // Example concept chips that fill the idea field.
    var exampleConcepts = [
        {
            label: 'Coin collector',
            text: 'Top-down view: a small character runs around an island collecting coins before a timer runs out. Coins appear in random spots. Reaching the target score before time ends wins; running out of time loses.'
        },
        {
            label: 'Tiny dungeon crawler',
            text: 'Top-down dungeon made of rooms. The hero walks room to room, fights slow blob enemies that dissolve into sparkles when defeated, picks up keys, and reaches the exit. Touching too many enemies loses; reaching the exit wins.'
        },
        {
            label: 'Falling-fruit catcher',
            text: 'A basket at the bottom of the screen moves left and right. Fruit falls from the top at increasing speed. Catching fruit adds points; missing three fruits ends the game. Goal: reach a high score.'
        },
        {
            label: 'Maze escape',
            text: 'A character must find the exit of a small maze. Walls block movement, glowing tiles speed you up, and a gentle timer adds pressure. Reaching the exit wins; the timer hitting zero loses.'
        }
    ]

    window.prompts = {
        buildFirstPrompt:   buildFirstPrompt,
        buildConcept:       buildConcept,
        buildNextPrompt:    buildNextPrompt,
        buildPublishPrompt: buildPublishPrompt,
        approvalPhrases:    approvalPhrases,
        exampleConcepts:    exampleConcepts
    }

})()
