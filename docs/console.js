// docs/console.js
// Workshop Console logic: tab switching, live prompt assembly, copy buttons,
// example chips, and localStorage-backed story + checklist progress.
//
// Loaded via a plain <script> tag after prompts.js. No ES modules, no build,
// no external dependencies, no Math.random(). Works via file:/// and Pages.
;(function() {
    'use strict'

    var STORAGE_KEY = 'workshopConsole.checklist.v1'
    var STORY_STORAGE_KEY = 'workshopConsole.story.v1'

    var tabSections = {
        intro:   'Chat vs agent',
        first:   'New game prompt',
        next:    'Change prompt',
        publish: 'Publish prompt',
        steps:   'Checklist'
    }

    var SOURCE_ZIP_URL = 'https://github.com/ludenio/WebGameTemplateForAgents/archive/refs/heads/main.zip'

    var checklistItems = [
        { id: 'download', text: 'Download the project sources (ZIP archive)', links: [
            { href: SOURCE_ZIP_URL, label: 'Download sources' }
        ] },
        { id: 'extract', text: 'Extract the ZIP into a folder on your computer — do not edit files inside the archive' },
        { id: 'concept', text: 'Understand how an agent differs from a plain chat', tab: 'intro' },
        { id: 'agent-account', text: 'Create an AI agent app account (e.g. Cursor)', links: [
            { href: 'https://cursor.com/referral?code=2Z6ITGMBUZ2B', label: 'Sign up for Cursor' }
        ] },
        { id: 'agent-app', text: 'Install an AI agent app (e.g. Cursor)', links: [
            { href: 'https://cursor.com/referral?code=2Z6ITGMBUZ2B', label: 'Download Cursor' }
        ] },
        { id: 'open-agent', text: 'Open the extracted project folder in your agent app' },
        { id: 'first-prompt', text: 'Write and send your new game prompt to the agent', tab: 'first' },
        { id: 'design',  text: 'Review and approve the design (DESIGN.md)', copy: { label: 'Copy: "I approve, continue."', phrase: 'design' } },
        { id: 'plan',    text: 'Approve the task plan (TODO.md)', copy: { label: 'Copy: "I approve, continue."', phrase: 'plan' } },
        { id: 'play',    text: 'Open the game and play it — double-click src/index.html in your project folder', links: [
            // Relative link only resolves when the console itself is opened
            // from the extracted project folder, not from the hosted site.
            { href: '..' + '/' + 'src' + '/' + 'index.html', label: 'Open the game', localOnly: true }
        ] },
        { id: 'iterate', text: 'Send a change prompt to the agent', tab: 'next' },
        { id: 'publish', text: 'Publish your game online', tab: 'publish' },
        { id: 'share',   text: 'Share your game online' }
    ]

    function $(id) { return document.getElementById(id) }

    // ----- Clipboard ------------------------------------------------------

    function copyText(text, button) {
        // Give instant feedback on click — don't wait for the async clipboard
        // promise, which can lag (e.g. on file:/// or when the doc isn't
        // focused) and leave the button looking unresponsive in the meantime.
        flashCopied(button)
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).catch(function() {
                fallbackCopy(text)
            })
        } else {
            fallbackCopy(text)
        }
    }

    function fallbackCopy(text) {
        var ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.focus()
        ta.select()
        try { document.execCommand('copy') } catch (e) {}
        document.body.removeChild(ta)
    }

    function flashCopied(button) {
        if (!button) return
        var original = button.getAttribute('data-label') || button.textContent
        button.setAttribute('data-label', original)
        button.textContent = 'Copied!'
        button.classList.add('copied')
        setTimeout(function() {
            button.textContent = original
            button.classList.remove('copied')
        }, 1500)
    }

    // ----- Tabs -----------------------------------------------------------

    function switchToTab(tabId) {
        var buttons = document.querySelectorAll('.tab-btn')
        var sections = document.querySelectorAll('.tab-section')
        for (var b = 0; b < buttons.length; b++) {
            buttons[b].classList.toggle('active', buttons[b].getAttribute('data-tab') === tabId)
        }
        for (var s = 0; s < sections.length; s++) {
            sections[s].classList.toggle('active', sections[s].getAttribute('data-tab') === tabId)
        }
    }

    function tabSectionLabel(tabId) {
        return tabSections[tabId] || tabId
    }

    function goToTabSection(tabId) {
        switchToTab(tabId)
        requestAnimationFrame(function() {
            var nav = $('tabs')
            if (nav) nav.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
    }

    function initTabLabels() {
        var buttons = document.querySelectorAll('.tab-btn')
        for (var i = 0; i < buttons.length; i++) {
            var tabId = buttons[i].getAttribute('data-tab')
            if (tabSections[tabId]) buttons[i].textContent = tabSections[tabId]
        }
    }

    function initTabs() {
        initTabLabels()
        var buttons = document.querySelectorAll('.tab-btn')
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('click', function() {
                switchToTab(this.getAttribute('data-tab'))
            })
        }
    }

    // ----- First-game builder --------------------------------------------

    var FIRST_FIELD_IDS = ['f-genre', 'f-action', 'f-goal', 'f-style', 'f-winlose', 'f-idea']
    var firstApplySeq = 0

    function readFirstFields() {
        return {
            genre:   $('f-genre').value,
            action:  $('f-action').value,
            goal:    $('f-goal').value,
            style:   $('f-style').value,
            winLose: $('f-winlose').value,
            idea:    $('f-idea').value
        }
    }

    // Replace every first-game input from one preset — never merge with old values.
    function setFirstFields(preset) {
        var fields = window.prompts.firstPresetFields(preset)
        $('f-genre').value = fields.genre
        $('f-action').value = fields.action
        $('f-goal').value = fields.goal
        $('f-style').value = fields.style
        $('f-winlose').value = fields.winLose
        $('f-idea').value = fields.idea
    }

    function renderFirst(applySeq) {
        if (applySeq !== undefined && applySeq !== firstApplySeq) return
        var concept = window.prompts.buildConcept(readFirstFields())
        $('preview-first').textContent = window.prompts.buildFirstPrompt(concept)
    }

    function setChipActive(chipBoxId, activeChip) {
        var chips = document.querySelectorAll('#' + chipBoxId + ' .chip')
        for (var i = 0; i < chips.length; i++) {
            chips[i].classList.toggle('active', chips[i] === activeChip)
        }
    }

    function applyFirstPreset(preset, activeChip) {
        var seq = ++firstApplySeq
        setFirstFields(preset)
        setChipActive('example-chips', activeChip)
        renderFirst(seq)
    }

    function addPresetChip(chipBox, label, className, onClick) {
        var chip = document.createElement('button')
        chip.type = 'button'
        chip.className = 'chip' + (className ? ' ' + className : '')
        chip.textContent = label
        chip.addEventListener('click', function() {
            onClick(chip)
        })
        chipBox.appendChild(chip)
        return chip
    }

    function initFirst() {
        for (var i = 0; i < FIRST_FIELD_IDS.length; i++) {
            $(FIRST_FIELD_IDS[i]).addEventListener('input', function() {
                firstApplySeq++
                setChipActive('example-chips', null)
                renderFirst()
            })
        }

        var chipBox = $('example-chips')
        addPresetChip(chipBox, window.prompts.CUSTOM_PRESET_LABEL, 'chip-reset', function(chip) {
            applyFirstPreset({}, chip)
        })

        var examples = window.prompts.exampleConcepts
        for (var e = 0; e < examples.length; e++) {
            (function(example) {
                var chip = document.createElement('button')
                chip.type = 'button'
                chip.className = 'chip'
                chip.textContent = example.label
                chip.addEventListener('click', function() {
                    applyFirstPreset(example, chip)
                })
                chipBox.appendChild(chip)
            })(examples[e])
        }

        $('copy-first').addEventListener('click', function() {
            copyText($('preview-first').textContent, this)
        })
        renderFirst()
    }

    // ----- Next-iteration builder ----------------------------------------

    var nextApplySeq = 0

    function renderNext(applySeq) {
        if (applySeq !== undefined && applySeq !== nextApplySeq) return
        $('preview-next').textContent = window.prompts.buildNextPrompt($('n-change').value)
    }

    function applyChangePreset(preset, activeChip) {
        var seq = ++nextApplySeq
        $('n-change').value = preset.text || ''
        setChipActive('change-chips', activeChip)
        renderNext(seq)
    }

    function initNext() {
        $('n-change').addEventListener('input', function() {
            nextApplySeq++
            setChipActive('change-chips', null)
            renderNext()
        })

        var chipBox = $('change-chips')
        var examples = window.prompts.exampleChanges
        if (chipBox && examples) {
            addPresetChip(chipBox, window.prompts.CUSTOM_PRESET_LABEL, 'chip-reset', function(chip) {
                applyChangePreset({ text: '' }, chip)
            })

            for (var e = 0; e < examples.length; e++) {
                (function(example) {
                    var chip = document.createElement('button')
                    chip.type = 'button'
                    chip.className = 'chip'
                    chip.textContent = example.label
                    chip.addEventListener('click', function() {
                        applyChangePreset(example, chip)
                    })
                    chipBox.appendChild(chip)
                })(examples[e])
            }
        }

        $('copy-next').addEventListener('click', function() {
            copyText($('preview-next').textContent, this)
        })
        renderNext()
    }

    // ----- Publish builder -----------------------------------------------

    function renderPublish() {
        var name = $('p-name').value.trim()
        // The .surge.sh suffix is fixed in the UI; only the name in front is editable.
        var domain = name ? name + '.surge.sh' : ''
        $('preview-publish').textContent = window.prompts.buildPublishPrompt({
            email:    $('p-email').value,
            domain:   domain,
            password: $('p-pass').value
        })
    }

    // ----- Surge address availability ------------------------------------
    //
    // A free Surge name answers with HTTP 404 and Surge's "project not found"
    // page; a taken one answers with 200 and the published site. The catch:
    // Surge static sites send no CORS headers, so a browser fetch() to the
    // domain is blocked and can't read the status — and <script>/<img>/<link>
    // probes are gated by MIME/CORS too, so they can't tell 404 from 200
    // either. The only reliable browser-side route is a lightweight public
    // CORS proxy: we fetch the page through it and look for Surge's 404 page
    // signature ("project not found"). Any network/proxy failure degrades to a
    // neutral "couldn't check" message, so the page still works offline-ish.

    var PROXY = 'https://api.codetabs.com/v1/proxy?quest='
    var nameSeq = 0          // bumps on every check; guards out-of-order results
    var nameDebounce = null

    // Surge subdomains follow DNS label rules: 1–63 chars, lowercase letters,
    // digits and hyphens, no leading/trailing hyphen.
    function isValidName(name) {
        return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(name)
    }

    function setNameStatus(cls, text) {
        var el = $('p-name-status')
        el.className = 'domain-status show ' + cls
        el.textContent = text
    }

    function clearNameStatus() {
        var el = $('p-name-status')
        el.className = 'domain-status'
        el.textContent = ''
    }

    // Ask Surge (through the proxy) about one domain.
    // Calls back with 'free', 'taken' or 'error'.
    function probeSurge(domain, onResult) {
        var url = PROXY + encodeURIComponent('https://' + domain + '/')
        fetch(url).then(function(res) {
            return res.text()
        }).then(function(body) {
            // Surge's unclaimed-name page always carries this exact title.
            var free = body.toLowerCase().indexOf('<title>project not found</title>') >= 0
            onResult(free ? 'free' : 'taken')
        }).catch(function() {
            onResult('error')
        })
    }

    function checkName() {
        var name = $('p-name').value.trim().toLowerCase()
        var seq = ++nameSeq

        if (!name) { clearNameStatus(); return }
        if (!isValidName(name)) {
            setNameStatus('invalid', 'Use 1–63 characters: lowercase letters, numbers and hyphens — no spaces, and no hyphen at the start or end.')
            return
        }
        if (navigator.onLine === false) {
            setNameStatus('error', 'You appear to be offline — connect to the internet to check the address.')
            return
        }

        var domain = name + '.surge.sh'
        setNameStatus('checking', 'Checking ' + domain + ' …')
        probeSurge(domain, function(result) {
            if (seq !== nameSeq) return // a newer check started; ignore this one
            if (result === 'free') {
                setNameStatus('free', '\u2713 ' + domain + ' is free — you can use this address.')
            } else if (result === 'taken') {
                setNameStatus('taken', '\u2717 ' + domain + ' is already taken — choose a different name.')
            } else {
                setNameStatus('error', 'Could not check ' + domain + ' right now. Try again, or just run the publish command — Surge will reject the name if it is taken.')
            }
        })
    }

    function initPublish() {
        $('p-email').addEventListener('input', renderPublish)
        $('p-name').addEventListener('input', function() {
            renderPublish()
            clearNameStatus()
            if (nameDebounce) clearTimeout(nameDebounce)
            nameDebounce = setTimeout(checkName, 700)
        })
        $('p-pass').addEventListener('input', renderPublish)
        $('check-name').addEventListener('click', function() {
            if (nameDebounce) clearTimeout(nameDebounce)
            checkName()
        })
        $('copy-publish').addEventListener('click', function() {
            copyText($('preview-publish').textContent, this)
        })
        renderPublish()
    }

    // ----- Checklist ------------------------------------------------------

    function loadChecklistState() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY)
            var state = raw ? JSON.parse(raw) : {}
            if (state.tools) {
                state.desktop = true
                state['agent-app'] = true
                delete state.tools
                saveChecklistState(state)
            }
            if (state.publish && !Object.prototype.hasOwnProperty.call(state, 'share')) {
                state.share = true
                saveChecklistState(state)
            }
            if (state.idea || state.send) {
                state['first-prompt'] = !!(state.idea || state.send)
                delete state.idea
                delete state.send
                saveChecklistState(state)
            }
            if (state.account || state.desktop || state.clone) {
                state.download = state.download || true
                if (state.clone) {
                    state.extract = state.extract || true
                }
                delete state.account
                delete state.desktop
                delete state.clone
                saveChecklistState(state)
            }
            return state
        } catch (e) {
            return {}
        }
    }

    function saveChecklistState(state) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch (e) {}
    }

    function markChecklistDone(id) {
        var cb = $('chk-' + id)
        if (!cb || cb.checked) return
        cb.checked = true
        if (cb.parentNode) cb.parentNode.classList.add('done')
        var state = loadChecklistState()
        state[id] = true
        saveChecklistState(state)
        updateProgress(state)
    }

    function uncheckChecklistItem(id) {
        var cb = $('chk-' + id)
        if (!cb || !cb.checked) return
        cb.checked = false
        if (cb.parentNode) cb.parentNode.classList.remove('done')
        var state = loadChecklistState()
        state[id] = false
        saveChecklistState(state)
        updateProgress(state)
        refreshStepsCelebrate(state)
    }

    function updateProgress(state) {
        var done = 0
        for (var i = 0; i < checklistItems.length; i++) {
            if (state[checklistItems[i].id]) done++
        }
        var pct = Math.round((done / checklistItems.length) * 100)
        $('progress-bar').style.width = pct + '%'
    }

    function initChecklist() {
        var state = loadChecklistState()
        var list = $('checklist')

        for (var i = 0; i < checklistItems.length; i++) {
            (function(item) {
                var li = document.createElement('li')
                var cb = document.createElement('input')
                cb.type = 'checkbox'
                cb.id = 'chk-' + item.id
                cb.checked = !!state[item.id]
                li.classList.toggle('done', cb.checked)

                var label = document.createElement('label')
                label.setAttribute('for', cb.id)
                label.textContent = item.text

                cb.addEventListener('change', function() {
                    state[item.id] = cb.checked
                    li.classList.toggle('done', cb.checked)
                    saveChecklistState(state)
                    updateProgress(state)
                    refreshStepsCelebrate(state)
                })

                li.appendChild(cb)
                li.appendChild(label)

                var hasTab = !!item.tab
                var visibleLinks = []
                if (item.links) {
                    for (var j = 0; j < item.links.length; j++) {
                        if (item.links[j].localOnly && window.location.protocol !== 'file:') continue
                        visibleLinks.push(item.links[j])
                    }
                }
                var hasLinks = visibleLinks.length > 0
                var hasCopy = !!(item.copy && item.copy.label && item.copy.phrase)
                if (hasTab || hasLinks || hasCopy) {
                    var actions = document.createElement('div')
                    actions.className = 'checklist-actions'

                    if (hasTab) {
                        var tabBtn = document.createElement('button')
                        tabBtn.type = 'button'
                        tabBtn.className = 'checklist-tab-btn'
                        tabBtn.textContent = 'Open: ' + tabSectionLabel(item.tab)
                        tabBtn.addEventListener('click', function() {
                            goToTabSection(item.tab)
                        })
                        actions.appendChild(tabBtn)
                    }

                    if (hasCopy) {
                        var copyBtn = document.createElement('button')
                        copyBtn.type = 'button'
                        copyBtn.className = 'checklist-tab-btn'
                        copyBtn.textContent = item.copy.label
                        copyBtn.addEventListener('click', function() {
                            var phrase = window.prompts.approvalPhrases[item.copy.phrase]
                            if (phrase) copyText(phrase, copyBtn)
                        })
                        actions.appendChild(copyBtn)
                    }

                    if (hasLinks) {
                        for (var k = 0; k < visibleLinks.length; k++) {
                            var link = visibleLinks[k]
                            var a = document.createElement('a')
                            a.className = 'checklist-tab-btn checklist-link-btn'
                            a.href = link.href
                            a.target = '_blank'
                            a.rel = 'noopener noreferrer'
                            a.textContent = link.label
                            actions.appendChild(a)
                        }
                    }

                    li.appendChild(actions)
                }

                list.appendChild(li)
            })(checklistItems[i])
        }

        updateProgress(state)

        $('reset-checklist').addEventListener('click', function() {
            state = {}
            saveChecklistState(state)
            var boxes = list.querySelectorAll('input[type="checkbox"]')
            for (var b = 0; b < boxes.length; b++) {
                boxes[b].checked = false
                boxes[b].parentNode.classList.remove('done')
            }
            updateProgress(state)
            var stepsPanel = $('steps-celebrate')
            if (stepsPanel) stepsPanel.hidden = true
        })

        refreshStepsCelebrate(state)
    }

    // ----- Platform Hopper workshop story (tab 0) -------------------------
    //
    // One fictional game across four locked steps (unlock in order):
    //   1. Plain chat — ask to build the game; chat only describes an idea
    //   2. Agent — creates project files; user wants to play → agent explains build
    //   3. User asks to build → agent writes tests → runs tests → builds
    //   4. Built game is shown; user asks to play → agent play-tests it

    var storyFlow = { unlockedMax: 1, done: {}, demos: {} }
    var storyStepControls = {}
    var storyRestore = { agent: null, command: null, playtest: null }

    function normalizeStoryFlow(raw) {
        if (!raw || typeof raw !== 'object') {
            return { unlockedMax: 1, done: {}, demos: {} }
        }
        var done = raw.done && typeof raw.done === 'object' ? raw.done : {}
        var cleanDone = {}
        var maxDone = 0
        var n
        for (n = 1; n <= 4; n++) {
            if (done[n] || done[String(n)]) {
                cleanDone[n] = true
                maxDone = n
            }
        }
        var unlockedMax = parseInt(raw.unlockedMax, 10)
        if (isNaN(unlockedMax)) unlockedMax = 1
        unlockedMax = Math.max(1, Math.min(4, unlockedMax))
        if (maxDone < 4) unlockedMax = Math.max(unlockedMax, maxDone + 1)
        else unlockedMax = 4

        var demos = {}
        if (raw.demos && typeof raw.demos === 'object') {
            if (raw.demos.agent) {
                var sc = parseInt(raw.demos.agent.sendCount, 10)
                if (!isNaN(sc) && sc > 0) demos.agent = { sendCount: sc }
            }
            if (raw.demos.command) {
                var rd = parseInt(raw.demos.command.round, 10)
                if (!isNaN(rd) && rd > 0) demos.command = { round: rd }
            }
        }

        return { unlockedMax: unlockedMax, done: cleanDone, demos: demos }
    }

    function loadStoryState() {
        try {
            var raw = localStorage.getItem(STORY_STORAGE_KEY)
            return normalizeStoryFlow(raw ? JSON.parse(raw) : null)
        } catch (e) {
            return { unlockedMax: 1, done: {}, demos: {} }
        }
    }

    function saveStoryState() {
        try {
            localStorage.setItem(STORY_STORAGE_KEY, JSON.stringify(storyFlow))
        } catch (e) {}
    }

    var WORKSHOP_GAME = {
        name: 'Platform Hopper',
        sparksGoal: 3,
        firstPrompt: 'Build me a game, please.',
        chatReply: 'I can\'t build games or create files — chat only. If you want, I can describe an idea for a game, but you should build it yourself. For example, your game may be: Platform Hopper, a side-scrolling factory platformer (moving platforms, pits, sparks, exit).',
        buildRequestPrompt: 'Let\'s build the game.',
        buildPitch: 'I can build a playable version. First, tests — I read text well, but I\'m bad at understanding the screen, so I verify through test text output.',
        writeTestsPrompt: 'Good idea, let\'s create auto-tests.',
        testsWritten: 'Automated tests are written — ready to run them.',
        runTestsPrompt: 'Run the auto-tests.',
        testsPass: 'All tests passed — everything works. Ready to build.',
        buildAndPlayPrompt: 'Yes, let\'s build the game.',
        buildDone: 'Build complete — you can play now.',
        playtestPrompt: 'Let\'s play the game.',
        ideaLines: [
            'Game: Platform Hopper',
            '',
            'Genre: side-scrolling platformer',
            'Moment-to-moment: run, time jumps, land on moving platforms',
            'Win: touch the exit flag after collecting factory sparks',
            'Lose: fall into a pit (restart at last checkpoint)',
            '',
            'Fantasy: a springy maintenance robot crossing a factory at night'
        ],
        todoLines: [
            '# TODO — Platform Hopper',
            '',
            '1. code.js — speed, jump, gravity',
            '2. store + playerSystem — movement, pits, checkpoints',
            '3. platformSystem — moving platforms per zone',
            '4. collectibles — 3 sparks, exit gate',
            '5. tests — deterministic movement + spark pickup replay'
        ],
        agentSteps: [
            {
                file: 'DESIGN.md',
                icon: 'fe-i-md',
                prompt: 'Build me a game, please.',
                tool: 'Create  DESIGN.md',
                ai: 'Sure, let\'s create the game design document. I like reading text files in Markdown format, which is why the files you\'ll see are named DESIGN.md, where .md means Markdown. Do you want me to create an implementation plan?',
                lines: null
            },
            {
                file: 'TODO.md',
                icon: 'fe-i-md',
                prompt: 'Yes, create a plan',
                tool: 'Create  TODO.md',
                ai: 'I turned that into a concrete to-do list.',
                lines: null
            },
            {
                file: 'code.js',
                icon: 'fe-i-js',
                prompt: 'Let\'s start building',
                tool: 'Create  code.js',
                ai: 'Done — I replaced the placeholder with a real `code.js` module and added movement, collisions, collectibles, and checkpoint logic.',
                lines: [
                    '/* code.js */',
                    '',
                    ';(function() {',
                    "  'use strict'",
                    '',
                    '  var world = {',
                    '    gravity: 0.55,',
                    '    terminalX: 1200,',
                    '    terminalY: 420,',
                    '    lastRespawnX: 90,',
                    '    lastRespawnY: 280,',
                    '    checkpoints: [',
                    '      [140, 280],',
                    '      [460, 240],',
                    '      [790, 190]',
                    '    ]',
                    '  }',
                    '',
                    '  window.config = window.config || {}',
                    '  window.config.player = {',
                    '    speed: 4.2,',
                    '    acceleration: 0.45,',
                    '    friction: 0.75,',
                    '    jumpImpulse: 12,',
                    '    maxJumps: 2,',
                    '    terminalX: world.terminalX,',
                    '    terminalY: world.terminalY',
                    '  }',
                    '',
                    '  function clamp(v, min, max) {',
                    '    return Math.min(Math.max(v, min), max)',
                    '  }',
                    '',
                    '  var playerState = {',
                    '    x: 120,',
                    '    y: 260,',
                    '    vx: 0,',
                    '    vy: 0,',
                    '    facing: 1,',
                    '    isGrounded: true,',
                    '    isAlive: true,',
                    '    jumpsLeft: 2,',
                    '    collected: 0',
                    '  }',
                    '',
                    '  var worldTiles = [',
                    '    { kind: \"platform\", x1: 0, y1: 340, x2: 220, y2: 360 },',
                    '    { kind: \"platform\", x1: 260, y1: 300, x2: 420, y2: 314 },',
                    '    { kind: \"platform\", x1: 470, y1: 250, x2: 610, y2: 268 },',
                    '    { kind: \"hazard\",   x1: 640, y1: 340, x2: 820, y2: 360 }',
                    '  ]',
                    '',
                    '  function collideWithPlatforms() {',
                    '    var i',
                    '    var oldY = playerState.y',
                    '    var onGround = false',
                    '',
                    '    for (i = 0; i < worldTiles.length; i++) {',
                    '      var p = worldTiles[i]',
                    '      if (p.kind !== \"platform\") continue',
                    '      if (playerState.x >= p.x1 && playerState.x <= p.x2) {',
                    '        if (oldY <= p.y1 && playerState.y + playerState.vy >= p.y1) {',
                    '          playerState.y = p.y1',
                    '          playerState.vy = 0',
                    '          onGround = true',
                    '          playerState.jumpsLeft = config.player.maxJumps',
                    '        }',
                    '      }',
                    '    }',
                    '',
                    '    playerState.isGrounded = onGround',
                    '    if (!onGround && playerState.vy > 3) {',
                    '      playerState.vy = clamp(playerState.vy, -12, 12)',
                    '    }',
                    '  }',
                    '',
                    '  function isOutOfBounds() {',
                    '    return playerState.y > 360 || playerState.x < 0 || playerState.x > world.terminalX',
                    '  }',
                    '',
                    '  function nearestCheckpoint() {',
                    '    var best = world.checkpoints[0]',
                    '    var i',
                    '    for (i = 0; i < world.checkpoints.length; i++) {',
                    '      var c = world.checkpoints[i]',
                    '      if (playerState.x >= c[0]) best = c',
                    '    }',
                    '    return best',
                    '  }',
                    '',
                    '  function dieAndRespawn() {',
                    '    var p = nearestCheckpoint()',
                    '    playerState.x = p[0] + 16',
                    '    playerState.y = p[1] - 24',
                    '    playerState.vx = 0',
                    '    playerState.vy = 0',
                    '    playerState.isAlive = false',
                    '    setTimeout(function() {',
                    '      playerState.isAlive = true',
                    '    }, 500)',
                    '  }',
                    '',
                    '  function inputTick(input) {',
                    '    if (!input.left && !input.right) {',
                    '      playerState.vx *= world.friction || config.player.friction',
                    '    }',
                    '    if (input.left) {',
                    '      playerState.vx -= config.player.acceleration',
                    '      playerState.facing = -1',
                    '    }',
                    '    if (input.right) {',
                    '      playerState.vx += config.player.acceleration',
                    '      playerState.facing = 1',
                    '    }',
                    '    if (input.jump && playerState.jumpsLeft > 0) {',
                    '      playerState.vy = -config.player.jumpImpulse',
                    '      playerState.jumpsLeft--',
                    '      input.jump = false',
                    '    }',
                    '    playerState.vx = clamp(playerState.vx, -config.player.speed, config.player.speed)',
                    '    playerState.vy += world.gravity',
                    '',
                    '    playerState.x += playerState.vx',
                    '    playerState.y += playerState.vy',
                    '',
                    '    collideWithPlatforms()',
                    '    if (isOutOfBounds()) dieAndRespawn()',
                    '  }',
                    '',
                    '  function collect(collectibles) {',
                    '    var i',
                    '    var count = 0',
                    '    for (i = 0; i < collectibles.length; i++) {',
                    '      var c = collectibles[i]',
                    '      if (!c || c.collected) continue',
                    '      if (Math.abs(playerState.x - c.x) < 20 && Math.abs(playerState.y - c.y) < 20) {',
                    '        c.collected = true',
                    '        count++',
                    '      }',
                    '    }',
                    '    if (count) {',
                    '      playerState.collected += count',
                    '      return count',
                    '    }',
                    '    return 0',
                    '  }',
                    '',
                    '  window.gameCode = {',
                    '    playerState: playerState,',
                    '    inputTick: inputTick,',
                    '    collect: collect,',
                    '    hasWon: function() { return playerState.x >= config.player.terminalX && playerState.y <= config.player.terminalY }',
                    '  }',
                    '})()'
                ]
            },
            {
                special: 'want-to-play',
                prompt: 'Let\'s play!',
                ai: 'The game code is ready, but you can\'t play it yet — we still need a build. That\'s the step where files are bundled into something you can open in a browser and actually play.'
            }
        ]
    }
    WORKSHOP_GAME.agentSteps[0].lines = WORKSHOP_GAME.ideaLines
    WORKSHOP_GAME.agentSteps[1].lines = WORKSHOP_GAME.todoLines

    function reconcileStoryDemos() {
        var demos = storyFlow.demos || {}
        if (demos.agent && demos.agent.sendCount > 0) {
            storyFlow.done[1] = true
            storyFlow.unlockedMax = Math.max(storyFlow.unlockedMax, 2)
            if (demos.agent.sendCount >= WORKSHOP_GAME.agentSteps.length) {
                storyFlow.done[2] = true
                storyFlow.unlockedMax = Math.max(storyFlow.unlockedMax, 3)
            }
        }
        if (demos.command && demos.command.round > 0) {
            storyFlow.done[1] = true
            storyFlow.done[2] = true
            storyFlow.unlockedMax = Math.max(storyFlow.unlockedMax, 3)
            if (demos.command.round >= 4) {
                storyFlow.done[3] = true
                storyFlow.unlockedMax = Math.max(storyFlow.unlockedMax, 4)
            }
        }
    }

    var COMMAND_TEST_SCRIPT = [
        { k: 'cmd', v: 'open tests/index.html' },
        { k: 'dim', v: 'Platform Hopper — running test suite…' },
        { k: 'ok',  v: '✓ store — dispatch, replay, tick order' },
        { k: 'ok',  v: '✓ code.js — run / jump on platforms' },
        { k: 'ok',  v: '✓ sparks + exit — matches the plan' },
        { k: 'pass', v: '12 passed, 0 failed' }
    ]

    var COMMAND_BUILD_SCRIPT = [
        { k: 'cmd', v: 'npm run build' },
        { k: 'dim', v: 'Platform Hopper — building playable package…' },
        { k: 'ok',  v: '✓ config linked' },
        { k: 'ok',  v: '✓ systems bundled' },
        { k: 'ok',  v: '✓ assets ready' },
        { k: 'pass', v: 'Build complete — index.html is playable' }
    ]

    function buildAgentChatMessages(steps, sendCount) {
        var messages = []
        var i
        for (i = 0; i < sendCount; i++) {
            var step = steps[i]
            messages.push({ who: 'user', text: step.prompt })
            if (step.special === 'want-to-play') {
                messages.push({ who: 'ai', text: step.ai })
            } else {
                messages.push({ who: 'tool', text: step.tool + '   (new file)' })
                messages.push({ who: 'ai', text: step.ai })
            }
        }
        return messages
    }

    function buildAgentFilesAtSendCount(steps, sendCount) {
        var files = []
        var i
        for (i = 0; i < sendCount; i++) {
            var step = steps[i]
            if (step.file) {
                files.push({
                    name: step.file,
                    lines: (step.lines || []).slice(),
                    icon: step.icon,
                    isNew: false
                })
            }
        }
        return files
    }

    function buildCommandChatMessages(round) {
        var g = WORKSHOP_GAME
        var messages = []
        if (round >= 1) {
            messages.push({ who: 'user', text: g.buildRequestPrompt })
            messages.push({ who: 'ai', text: g.buildPitch })
        }
        if (round >= 2) {
            messages.push({ who: 'user', text: g.writeTestsPrompt })
            messages.push({ who: 'tool', text: 'Create  tests/store.test.js   (new file)' })
            messages.push({ who: 'tool', text: 'Create  tests/player.test.js   (new file)' })
            messages.push({ who: 'ai', text: g.testsWritten })
        }
        if (round >= 3) {
            messages.push({ who: 'user', text: g.runTestsPrompt })
            messages.push({ who: 'tool', text: 'Run command  open tests/index.html' })
            messages.push({ who: 'ai', text: g.testsPass })
        }
        if (round >= 4) {
            messages.push({ who: 'user', text: g.buildAndPlayPrompt })
            messages.push({ who: 'tool', text: 'Run command  cd WebGameTemplateForAgents' })
            messages.push({ who: 'tool', text: 'Run command  npm run build' })
            messages.push({ who: 'ai', text: g.buildDone })
        }
        return messages
    }

    function appendTermLine(outEl, text, kind) {
        var line = document.createElement('span')
        line.className = 'ft-line' + (kind ? ' ' + kind : '')
        line.textContent = text
        outEl.appendChild(line)
        outEl.appendChild(document.createTextNode('\n'))
        outEl.scrollTop = outEl.scrollHeight
    }

    function renderTermScript(outEl, script) {
        for (var i = 0; i < script.length; i++) {
            var item = script[i]
            if (item.k === 'cmd') appendTermLine(outEl, '$ ' + item.v, 'cmd')
            else appendTermLine(outEl, item.v, item.k)
        }
    }

    function fileBasename(path) {
        var i = path.lastIndexOf('/')
        return i >= 0 ? path.slice(i + 1) : path
    }

    function renderLines(el, lines, highlight) {
        // highlight: undefined | a line index | the string 'all'
        el.innerHTML = ''
        for (var i = 0; i < lines.length; i++) {
            var row = document.createElement('span')
            var hot = (highlight === 'all') || (highlight === i)
            row.className = hot ? 'file-line added' : 'file-line'
            row.textContent = lines[i]
            el.appendChild(row)
            el.appendChild(document.createTextNode('\n'))
        }
    }

    function addBubble(logEl, who, text) {
        var b = document.createElement('div')
        b.className = 'bubble ' + who
        b.textContent = text
        logEl.appendChild(b)
        logEl.scrollTop = logEl.scrollHeight
        return b
    }

    // Type ai/tool bubbles character-by-character; user bubbles stay instant.
    function typeBubble(logEl, who, text, onDone, msPerChar) {
        var b = document.createElement('div')
        b.className = 'bubble ' + who + ' is-typing'
        logEl.appendChild(b)
        var delay = msPerChar || (who === 'tool' ? 12 : 20)
        var i = 0
        var timer = setInterval(function() {
            i++
            b.textContent = text.slice(0, i)
            logEl.scrollTop = logEl.scrollHeight
            if (i >= text.length) {
                clearInterval(timer)
                b.classList.remove('is-typing')
                if (onDone) onDone()
            }
        }, delay)
        return b
    }

    function showResult(el, cls, text) {
        if (!text) {
            el.className = 'demo-result'
            el.textContent = ''
            return
        }
        el.className = 'demo-result show ' + cls
        el.textContent = text
    }

    // Guided typing: any keypress reveals the next character of a fixed script.
    function attachGuidedTyping(input, sendBtn) {
        var target = ''
        var pos = 0
        var inputLocked = false

        function isComplete() {
            return pos >= target.length && target.length > 0
        }

        function syncValue() {
            input.value = target.slice(0, pos)
            // Programmatic value changes don't auto-scroll the field, so on
            // narrow screens (mobile, portrait) the latest characters slide
            // out of view. Pin the caret to the end and force the horizontal
            // scroll so the last typed character is always visible.
            var end = input.value.length
            try { input.setSelectionRange(end, end) } catch (e) {}
            input.scrollLeft = input.scrollWidth
        }

        function refreshSend() {
            if (!sendBtn) return
            sendBtn.disabled = input.disabled || inputLocked || !isComplete()
        }

        function setTarget(text) {
            target = text || ''
            pos = 0
            syncValue()
            refreshSend()
        }

        function fillAll() {
            pos = target.length
            syncValue()
            refreshSend()
        }

        function retreat() {
            if (pos > 0) {
                pos--
                syncValue()
                refreshSend()
            }
        }

        function advance() {
            if (pos < target.length) {
                pos++
                syncValue()
                refreshSend()
            }
        }

        function shouldIgnoreKey(key) {
            return key === 'Tab' || key === 'Enter' || key === 'Escape' ||
                key === 'Shift' || key === 'Control' || key === 'Alt' || key === 'Meta' ||
                key === 'CapsLock'
        }

        input.addEventListener('keydown', function(e) {
            if (input.disabled || inputLocked) return
            if (e.key === 'Backspace' || e.key === 'Delete') {
                e.preventDefault()
                retreat()
                return
            }
            if (shouldIgnoreKey(e.key)) return
            e.preventDefault()
            advance()
        })

        input.addEventListener('paste', function(e) { e.preventDefault() })
        input.addEventListener('drop', function(e) { e.preventDefault() })
        input.addEventListener('input', function() {
            syncValue()
        })

        input.classList.add('guided-input')

        function clearAfterSend() {
            pos = 0
            input.value = ''
            refreshSend()
        }

        return {
            setTarget: setTarget,
            getTarget: function() { return target },
            isComplete: isComplete,
            fillAll: fillAll,
            refreshSend: refreshSend,
            clearAfterSend: clearAfterSend,
            setInputLocked: function(locked) {
                inputLocked = locked
                refreshSend()
            }
        }
    }

    function storyStage(n) {
        return document.querySelector('.intro-panel .demo-stage[data-story-step="' + n + '"]')
    }

    function disableStepInteractives(stageEl) {
        var nodes = stageEl.querySelectorAll('input, button')
        for (var i = 0; i < nodes.length; i++) nodes[i].disabled = true
    }

    function needsScrollIntoView(el, margin) {
        if (!el) return false
        margin = margin == null ? 20 : margin
        var rect = el.getBoundingClientRect()
        var vh = window.innerHeight || document.documentElement.clientHeight
        var vw = window.innerWidth || document.documentElement.clientWidth
        return rect.top < margin ||
            rect.left < margin ||
            rect.bottom > vh - margin ||
            rect.right > vw - margin
    }

    function scrollIntoViewSmooth(el, block) {
        if (!el) return
        el.scrollIntoView({ behavior: 'smooth', block: block || 'center' })
    }

    // Focus the story input as soon as it becomes editable so the user can
    // type without clicking. If the field is off-screen, scroll it into view
    // after focusing (preventScroll keeps the browser from jumping abruptly).
    function focusStoryInput(input, delayMs) {
        if (!input) return
        setTimeout(function() {
            if (input.disabled) return
            try {
                input.focus({ preventScroll: true })
            } catch (e) {
                try { input.focus() } catch (e2) {}
            }
            if (needsScrollIntoView(input)) {
                scrollIntoViewSmooth(input, 'center')
            }
        }, delayMs || 0)
    }

    function isStoryDone(n) {
        return !!storyFlow.done[n] || !!storyFlow.done[String(n)]
    }

    function setStoryDone(n) {
        storyFlow.done[n] = true
    }

    function completeStoryStep(n) {
        if (isStoryDone(n)) return
        setStoryDone(n)
        var el = storyStage(n)
        if (el) {
            el.classList.add('demo-stage-done')
            disableStepInteractives(el)
        }
        if (n < 4) {
            storyFlow.unlockedMax = Math.max(storyFlow.unlockedMax, n + 1)
            var next = storyStage(n + 1)
            if (next) {
                next.classList.remove('demo-stage-locked')
                setTimeout(function() {
                    next.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                }, 320)
            }
        }
        if (!storyFlow.demos) storyFlow.demos = {}
        if (n === 2) {
            storyFlow.demos.agent = { sendCount: WORKSHOP_GAME.agentSteps.length }
        }
        if (n === 3) {
            storyFlow.demos.command = { round: 4 }
        }
        if (n === 4) {
            showTutorialComplete(false)
            markChecklistDone('concept')
        } else {
            unlockStoryStep(n + 1)
        }
        saveStoryState()
    }

    function unlockStoryStep(n, shouldFocus) {
        if (n < 1 || n > 4) return
        if (shouldFocus === undefined) shouldFocus = true
        var ctrl = storyStepControls[n]
        if (ctrl && ctrl.enable) ctrl.enable(shouldFocus)
    }

    function skipStoryStep(n) {
        if (!canUseStoryStep(n)) return
        completeStoryStep(n)
    }

    function initStorySkip() {
        var buttons = document.querySelectorAll('.demo-skip[data-skip-step]')
        for (var i = 0; i < buttons.length; i++) {
            (function(btn) {
                btn.addEventListener('click', function() {
                    var step = parseInt(btn.getAttribute('data-skip-step'), 10)
                    if (!isNaN(step)) skipStoryStep(step)
                })
            })(buttons[i])
        }
    }

    function burstConfetti(host) {
        if (!host) return
        host.innerHTML = ''
        var colors = ['#6e8bff', '#4ade80', '#f5b945', '#9a7bff', '#ff7eb3', '#38bdf8']
        var i
        for (i = 0; i < 56; i++) {
            (function(idx) {
                var piece = document.createElement('span')
                piece.className = 'confetti-piece'
                piece.style.left = (8 + (idx * 17) % 84) + '%'
                piece.style.background = colors[idx % colors.length]
                piece.style.animationDelay = (idx * 0.03) + 's'
                piece.style.setProperty('--drift', ((idx % 7) - 3) * 14 + 'px')
                host.appendChild(piece)
                setTimeout(function() {
                    if (piece.parentNode) piece.parentNode.removeChild(piece)
                }, 3200)
            })(i)
        }
    }

    function spawnFireworkBurst(host, leftPct, topPct, colors) {
        var burst = document.createElement('div')
        burst.className = 'firework-burst'
        burst.style.left = leftPct + '%'
        burst.style.top = topPct + '%'

        var flash = document.createElement('span')
        flash.className = 'firework-flash'
        flash.style.background = 'radial-gradient(circle, ' + colors[0] + ' 0%, rgba(255,255,255,0.7) 35%, transparent 70%)'
        burst.appendChild(flash)

        var count = 36
        var i
        for (i = 0; i < count; i++) {
            var angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.2
            var dist = 48 + Math.random() * 52
            var tx = Math.cos(angle) * dist
            var ty = Math.sin(angle) * dist
            var fall = 28 + Math.random() * 48
            var particle = document.createElement('span')
            particle.className = 'firework-particle'
            particle.style.background = colors[i % colors.length]
            particle.style.color = colors[i % colors.length]
            particle.style.setProperty('--tx', tx.toFixed(1) + 'px')
            particle.style.setProperty('--ty', ty.toFixed(1) + 'px')
            particle.style.setProperty('--fall', fall.toFixed(1) + 'px')
            particle.style.animationDelay = (Math.random() * 0.06) + 's'
            burst.appendChild(particle)
        }

        host.appendChild(burst)
        setTimeout(function() {
            if (burst.parentNode) burst.parentNode.removeChild(burst)
        }, 2400)
    }

    function burstFireworks(host) {
        if (!host) return
        host.innerHTML = ''
        var palette = [
            ['#6e8bff', '#9ab4ff', '#ffffff'],
            ['#4ade80', '#86efac', '#ffffff'],
            ['#f5b945', '#fcd34d', '#ffffff'],
            ['#ff7eb3', '#fda4c9', '#ffffff'],
            ['#38bdf8', '#7dd3fc', '#ffffff'],
            ['#9a7bff', '#c4b5fd', '#ffffff']
        ]
        var bursts = [
            { left: 16, top: 24 },
            { left: 82, top: 18 },
            { left: 48, top: 14 },
            { left: 28, top: 42 },
            { left: 72, top: 36 },
            { left: 54, top: 28 }
        ]
        var bi
        for (bi = 0; bi < bursts.length; bi++) {
            (function(idx) {
                setTimeout(function() {
                    spawnFireworkBurst(host, bursts[idx].left, bursts[idx].top, palette[idx % palette.length])
                }, idx * 420)
            })(bi)
        }
    }

    function goToChecklistTab() {
        goToTabSection('steps')
    }

    function showTutorialComplete(quiet) {
        var panel = $('tutorial-celebrate')
        if (!panel) return
        panel.hidden = false
        if (!quiet) burstFireworks($('tutorial-confetti'))
        // Wait for layout after hidden=false so scroll targets the real position.
        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                scrollIntoViewSmooth(panel, 'center')
            })
        })
    }

    function showStepsCelebrate(quiet) {
        var panel = $('steps-celebrate')
        if (!panel) return
        panel.hidden = false
        if (!quiet) burstFireworks($('steps-confetti'))
    }

    function allChecklistDone(state) {
        for (var i = 0; i < checklistItems.length; i++) {
            if (!state[checklistItems[i].id]) return false
        }
        return true
    }

    function refreshStepsCelebrate(state) {
        var panel = $('steps-celebrate')
        if (!panel) return
        if (allChecklistDone(state)) {
            var quiet = !!state._stepsCelebrateShown
            showStepsCelebrate(quiet)
            if (!state._stepsCelebrateShown) {
                state._stepsCelebrateShown = true
                saveChecklistState(state)
            }
        } else {
            panel.hidden = true
        }
    }

    function clearDemoResult(id) {
        var el = $(id)
        if (el) showResult(el, '', '')
    }

    function resetStoryTutorial() {
        storyFlow = { unlockedMax: 1, done: {}, demos: {} }
        saveStoryState()

        var celebrate = $('tutorial-celebrate')
        if (celebrate) celebrate.hidden = true
        var confetti = $('tutorial-confetti')
        if (confetti) confetti.innerHTML = ''

        var chatIds = ['ch-chat', 'ag-chat', 'c-chat', 'p-chat']
        var c
        for (c = 0; c < chatIds.length; c++) {
            var chatEl = $(chatIds[c])
            if (chatEl) chatEl.innerHTML = ''
        }
        clearDemoResult('ch-result')
        clearDemoResult('ag-result')
        clearDemoResult('c-result')
        clearDemoResult('p-result')

        var n
        for (n = 1; n <= 4; n++) {
            var stage = storyStage(n)
            if (stage) stage.classList.remove('demo-stage-done')
        }
        applyStoryLocks()

        if (storyRestore.chat) storyRestore.chat.reset()
        if (storyRestore.agent) storyRestore.agent.reset()
        if (storyRestore.command) storyRestore.command.reset()
        if (storyRestore.playtest) storyRestore.playtest.reset()

        var step1 = storyStage(1)
        if (step1) step1.scrollIntoView({ behavior: 'smooth', block: 'start' })
        uncheckChecklistItem('concept')
        unlockStoryStep(1, false)
    }

    function restoreStoryUI() {
        applyStoryLocks()
        if (isStoryDone(4)) return
        var n
        for (n = 1; n <= 4; n++) {
            if (storyFlow.unlockedMax >= n && !isStoryDone(n)) {
                unlockStoryStep(n, false)
                return
            }
        }
        unlockStoryStep(1, false)
    }

    function syncStoryChecklist() {
        if (!isStoryDone(4)) return
        markChecklistDone('concept')
        showTutorialComplete(true)
    }

    function initTutorialCelebrate() {
        var btn = $('tutorial-continue-btn')
        if (btn) btn.addEventListener('click', goToChecklistTab)
        var resetBtn = $('reset-story')
        if (resetBtn) resetBtn.addEventListener('click', resetStoryTutorial)
    }

    function applyStoryLocks() {
        var n
        for (n = 1; n <= 4; n++) {
            var stage = storyStage(n)
            if (!stage) continue
            if (n > storyFlow.unlockedMax) stage.classList.add('demo-stage-locked')
            else stage.classList.remove('demo-stage-locked')
            if (isStoryDone(n)) {
                stage.classList.add('demo-stage-done')
                disableStepInteractives(stage)
            }
        }
    }

    function canUseStoryStep(n) {
        return storyFlow.unlockedMax >= n && !isStoryDone(n)
    }

    // ----- Step 1: plain chat (cannot build the game) ----------------------
    function initChatDemo() {
        var chat = $('ch-chat')
        var result = $('ch-result')
        var input = $('ch-input')
        var sendBtn = $('ch-send')
        var busy = false
        var guided = attachGuidedTyping(input, sendBtn)

        guided.setTarget(WORKSHOP_GAME.firstPrompt)

        function send() {
            if (busy || !canUseStoryStep(1) || !guided.isComplete()) return
            var text = guided.getTarget()
            busy = true
            guided.setInputLocked(true)
            input.disabled = true
            sendBtn.disabled = true
            addBubble(chat, 'user', text)
            guided.clearAfterSend()
            setTimeout(function() {
                typeBubble(chat, 'ai', WORKSHOP_GAME.chatReply, function() {
                    showResult(result, 'warn', '')
                    completeStoryStep(1)
                    busy = false
                })
            }, 280)
        }

        sendBtn.addEventListener('click', send)
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') send()
        })

        storyStepControls[1] = {
            enable: function(shouldFocus) {
                if (!isStoryDone(1)) {
                    input.disabled = false
                    guided.setInputLocked(false)
                    guided.refreshSend()
                    if (shouldFocus !== false) focusStoryInput(input, 350)
                }
            }
        }

        storyRestore.chat = {
            reset: function() {
                busy = false
                guided.setInputLocked(false)
                guided.setTarget(WORKSHOP_GAME.firstPrompt)
                input.disabled = false
                guided.refreshSend()
                focusStoryInput(input)
            }
        }

        if (isStoryDone(1)) {
            chat.innerHTML = ''
            addBubble(chat, 'user', WORKSHOP_GAME.firstPrompt)
            addBubble(chat, 'ai', WORKSHOP_GAME.chatReply)
            showResult(result, 'warn', '')
            input.disabled = true
            sendBtn.disabled = true
        }
    }

    // ----- Step 2: agent creates project files (4 sends, then locks) -------
    function initAgentFilesDemo() {
        var steps = WORKSHOP_GAME.agentSteps
        var chat = $('ag-chat')
        var fm = $('ag-fm')
        var treeList = $('ag-tree-list')
        var emptyHint = $('ag-fm-empty')
        var openPanel = $('ag-open')
        var fileEl = $('ag-file')
        var tabName = $('ag-tab-name')
        var tabIcon = $('ag-tab') ? $('ag-tab').querySelector('.fe-icon') : null
        var result = $('ag-result')
        var progress = $('ag-progress')
        var input = $('ag-input')
        var sendBtn = $('ag-send')
        var busy = false
        var agentFiles = []
        var activeIndex = -1
        var sendCount = 0

        function updateProgress() {
            if (!progress) return
            if (sendCount >= steps.length) {
                progress.textContent = steps.length + ' / ' + steps.length
                return
            }
            progress.textContent = (sendCount + 1) + ' / ' + steps.length
        }
        updateProgress()

        input.disabled = true
        sendBtn.disabled = true

        function renderTree() {
            treeList.innerHTML = ''
            if (emptyHint) emptyHint.hidden = agentFiles.length > 0
            for (var i = 0; i < agentFiles.length; i++) {
                (function(idx) {
                    var f = agentFiles[idx]
                    var li = document.createElement('li')
                    li.className = 'fe-grid-item fe-agent-file'
                    li.setAttribute('role', 'listitem')
                    li.title = f.name
                    if (idx === activeIndex) li.classList.add('is-active')
                    if (f.isNew) {
                        li.classList.add('is-new')
                        li.classList.add('is-appearing')
                    }
                    var iconWrap = document.createElement('span')
                    iconWrap.className = 'fe-icon-wrap'
                    var icon = document.createElement('span')
                    icon.className = 'fe-icon ' + (f.icon || 'fe-i-txt')
                    icon.setAttribute('aria-hidden', 'true')
                    iconWrap.appendChild(icon)
                    var name = document.createElement('span')
                    name.className = 'fe-label'
                    name.textContent = fileBasename(f.name)
                    li.appendChild(iconWrap)
                    li.appendChild(name)
                    li.addEventListener('click', function() {
                        if (busy) return
                        selectFile(idx, false)
                    })
                    treeList.appendChild(li)
                })(i)
            }
        }

        function selectFile(index, highlightAll) {
            if (index < 0 || index >= agentFiles.length) return
            activeIndex = index
            if (!highlightAll) {
                for (var i = 0; i < agentFiles.length; i++) agentFiles[i].isNew = false
            }
            var f = agentFiles[index]
            if (tabName) tabName.textContent = f.name
            if (tabIcon) tabIcon.className = 'fe-icon ' + (f.icon || 'fe-i-txt')
            renderTree()
            if (openPanel) openPanel.hidden = false
            renderLines(fileEl, f.lines, highlightAll ? 'all' : undefined)
            fileEl.scrollTop = 0
            if (highlightAll) {
                setTimeout(function() {
                    if (!agentFiles[index]) return
                    agentFiles[index].isNew = false
                    renderTree()
                }, 1200)
            }
        }

        var guided = attachGuidedTyping(input, sendBtn)
        guided.setTarget(steps[0].prompt)

        function persistAgentProgress() {
            if (!storyFlow.demos) storyFlow.demos = {}
            storyFlow.demos.agent = { sendCount: sendCount }
            saveStoryState()
        }

        function finishAgentStep() {
            input.disabled = true
            sendBtn.disabled = true
            showResult(result, 'ok', '')
            completeStoryStep(2)
        }

        function restoreAgentProgress(count) {
            count = Math.max(0, Math.min(steps.length, count))
            sendCount = count
            chat.innerHTML = ''
            var messages = buildAgentChatMessages(steps, count)
            var m
            for (m = 0; m < messages.length; m++) {
                addBubble(chat, messages[m].who, messages[m].text)
            }
            agentFiles = buildAgentFilesAtSendCount(steps, count)
            activeIndex = agentFiles.length > 0 ? agentFiles.length - 1 : -1
            if (agentFiles.length > 0) {
                fm.classList.add('has-file')
                if (emptyHint) emptyHint.hidden = true
                var f = agentFiles[activeIndex]
                if (tabName) tabName.textContent = f.name
                if (tabIcon) tabIcon.className = 'fe-icon ' + (f.icon || 'fe-i-txt')
                if (openPanel) openPanel.hidden = false
                renderTree()
                renderLines(fileEl, f.lines)
            } else {
                fm.classList.remove('has-file')
                treeList.innerHTML = ''
                if (emptyHint) emptyHint.hidden = false
                if (openPanel) openPanel.hidden = true
                renderLines(fileEl, [])
                if (tabName) tabName.textContent = ''
                if (tabIcon) tabIcon.className = 'fe-icon fe-i-txt'
            }
            updateProgress()
            if (isStoryDone(2) || count >= steps.length) {
                input.disabled = true
                sendBtn.disabled = true
                showResult(result, 'ok', '')
                return
            }
            if (canUseStoryStep(2)) {
                guided.setTarget(steps[count].prompt)
                input.disabled = false
                guided.setInputLocked(false)
                guided.refreshSend()
            } else {
                input.disabled = true
                sendBtn.disabled = true
            }
        }

        function afterAgentRound() {
            persistAgentProgress()
            updateProgress()
            if (sendCount >= steps.length) {
                finishAgentStep()
                busy = false
                return
            }
            var next = steps[sendCount]
            showResult(result, 'ok', '')
            guided.setTarget(next.prompt)
            input.disabled = false
            guided.setInputLocked(false)
            guided.refreshSend()
            focusStoryInput(input)
            busy = false
        }

        function pushAgentFile(name, lines, icon) {
            agentFiles.push({
                name: name,
                lines: lines.slice(),
                icon: icon,
                isNew: true
            })
            fm.classList.add('has-file')
            selectFile(agentFiles.length - 1, true)
        }

        function removeAgentFile(name, done) {
            var removed = -1
            for (var i = 0; i < agentFiles.length; i++) {
                if (agentFiles[i].name === name) removed = i
            }
            if (removed < 0) {
                if (done) done()
                return
            }

            var el = treeList.children[removed]
            function finishRemove() {
                agentFiles.splice(removed, 1)
                if (activeIndex >= agentFiles.length) {
                    activeIndex = agentFiles.length - 1
                }
                if (agentFiles.length > 0) {
                    fm.classList.add('has-file')
                    selectFile(activeIndex < 0 ? 0 : activeIndex, false)
                } else {
                    fm.classList.remove('has-file')
                    renderTree()
                    renderLines(fileEl, [])
                    if (tabName) tabName.textContent = ''
                    if (openPanel) openPanel.hidden = true
                }
                if (done) done()
            }

            if (!el) {
                finishRemove()
                return
            }

            el.classList.add('is-removing')
            setTimeout(finishRemove, 280)
        }

        function send() {
            if (busy || !canUseStoryStep(2) || !guided.isComplete()) return
            var step = steps[sendCount]
            if (!step) return
            var text = guided.getTarget()
            busy = true
            guided.setInputLocked(true)
            sendBtn.disabled = true
            input.disabled = true
            addBubble(chat, 'user', text)
            guided.clearAfterSend()

            if (step.special === 'want-to-play') {
                sendCount++
                persistAgentProgress()
                typeBubble(chat, 'ai', step.ai, function() {
                    finishAgentStep()
                    busy = false
                })
                return
            }

            sendCount++

            typeBubble(chat, 'tool', step.tool + '   (new file)', function() {
                setTimeout(function() {
                    pushAgentFile(step.file, step.lines, step.icon)
                    typeBubble(chat, 'ai', step.ai, function() {
                        afterAgentRound()
                    })
                }, 320)
            })
        }

        sendBtn.addEventListener('click', send)
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') send()
        })

        storyStepControls[2] = {
            enable: function(shouldFocus) {
                if (!isStoryDone(2)) {
                    input.disabled = false
                    guided.setInputLocked(false)
                    guided.refreshSend()
                    if (shouldFocus !== false) focusStoryInput(input, 350)
                }
            }
        }

        storyRestore.agent = {
            reset: function() {
                busy = false
                sendCount = 0
                agentFiles = []
                treeList.innerHTML = ''
                fm.classList.remove('has-file')
                if (emptyHint) emptyHint.hidden = false
                if (openPanel) openPanel.hidden = true
                renderLines(fileEl, [])
                if (tabName) tabName.textContent = ''
                if (tabIcon) tabIcon.className = 'fe-icon fe-i-txt'
                guided.setInputLocked(false)
                guided.setTarget(steps[0].prompt)
                input.disabled = true
                guided.refreshSend()
                updateProgress()
            }
        }

        var savedAgentCount = 0
        if (isStoryDone(2)) savedAgentCount = steps.length
        else if (storyFlow.demos && storyFlow.demos.agent) savedAgentCount = storyFlow.demos.agent.sendCount || 0
        if (savedAgentCount > 0) restoreAgentProgress(savedAgentCount)
    }

    function playSteps(logEl, steps, finish) {
        var i = 0
        function next() {
            if (i >= steps.length) {
                setTimeout(finish, 200)
                return
            }
            typeBubble(logEl, 'tool', steps[i], function() {
                i++
                setTimeout(next, 220)
            })
        }
        next()
    }

    // ----- Step 3: user asks to build → tests (write, run) → build --------
    function initCommandDemo() {
        var chat = $('c-chat')
        var result = $('c-result')
        var input = $('c-input')
        var sendBtn = $('c-send')
        var outEl = $('c-term-out')
        var busy = false
        var round = 0

        function resetTerminal() {
            outEl.textContent = ''
            outEl.appendChild(document.createTextNode('$ '))
        }
        resetTerminal()

        var guided = attachGuidedTyping(input, sendBtn)
        guided.setTarget('')
        input.disabled = true
        guided.refreshSend()

        var commandPrompts = [
            WORKSHOP_GAME.buildRequestPrompt,
            WORKSHOP_GAME.writeTestsPrompt,
            WORKSHOP_GAME.runTestsPrompt,
            WORKSHOP_GAME.buildAndPlayPrompt
        ]

        function unlockInput(target, shouldFocus) {
            guided.setTarget(target)
            input.disabled = false
            sendBtn.disabled = false
            guided.setInputLocked(false)
            guided.refreshSend()
            if (shouldFocus !== false) focusStoryInput(input)
        }

        function persistCommandProgress() {
            if (!storyFlow.demos) storyFlow.demos = {}
            storyFlow.demos.command = { round: round }
            saveStoryState()
        }

        function restoreCommandProgress(savedRound) {
            round = Math.max(0, Math.min(4, savedRound))
            chat.innerHTML = ''
            var messages = buildCommandChatMessages(round)
            var m
            for (m = 0; m < messages.length; m++) {
                addBubble(chat, messages[m].who, messages[m].text)
            }
            resetTerminal()
            if (round >= 3) renderTermScript(outEl, COMMAND_TEST_SCRIPT)
            if (round >= 4) renderTermScript(outEl, COMMAND_BUILD_SCRIPT)
            if (isStoryDone(3) || round >= 4) {
                showResult(result, 'ok', '')
                input.disabled = true
                sendBtn.disabled = true
                return
            }
            if (canUseStoryStep(3) && round < commandPrompts.length) {
                unlockInput(commandPrompts[round], false)
            } else {
                input.disabled = true
                sendBtn.disabled = true
            }
        }

        function runTermScript(script, onDone) {
            script.forEach(function(item) {
                setTimeout(function() {
                    if (item.k === 'cmd') appendTermLine(outEl, '$ ' + item.v, 'cmd')
                    else appendTermLine(outEl, item.v, item.k)
                }, item.t)
            })
            var last = script[script.length - 1]
            setTimeout(onDone, last.t + 400)
        }

        function writeTests(done) {
            playSteps(chat, [
                'Create  tests/store.test.js   (new file)',
                'Create  tests/player.test.js   (new file)'
            ], function() {
                typeBubble(chat, 'ai', WORKSHOP_GAME.testsWritten, done)
            })
        }

        function runTestsOnly(done) {
            resetTerminal()
            playSteps(chat, [
                'Run command  open tests/index.html'
            ], function() {
                var script = [
                    { t: 0,   k: 'cmd', v: 'open tests/index.html' },
                    { t: 400, k: 'dim', v: 'Platform Hopper — running test suite…' },
                    { t: 900, k: 'ok',  v: '✓ store — dispatch, replay, tick order' },
                    { t: 1400, k: 'ok', v: '✓ code.js — run / jump on platforms' },
                    { t: 1900, k: 'ok', v: '✓ sparks + exit — matches the plan' },
                    { t: 2400, k: 'pass', v: '12 passed, 0 failed' }
                ]
                runTermScript(script, function() {
                    typeBubble(chat, 'ai', WORKSHOP_GAME.testsPass, done)
                })
            })
        }

        function runBuild(done) {
            playSteps(chat, [
                'Run command  cd WebGameTemplateForAgents',
                'Run command  npm run build'
            ], function() {
                var script = [
                    { t: 0,   k: 'cmd', v: 'npm run build' },
                    { t: 400, k: 'dim', v: 'Platform Hopper — building playable package…' },
                    { t: 900, k: 'ok',  v: '✓ config linked' },
                    { t: 1400, k: 'ok', v: '✓ systems bundled' },
                    { t: 1900, k: 'ok', v: '✓ assets ready' },
                    { t: 2400, k: 'pass', v: 'Build complete — index.html is playable' }
                ]
                runTermScript(script, done)
            })
        }

        function send() {
            if (busy || !canUseStoryStep(3) || !guided.isComplete()) return
            busy = true
            guided.setInputLocked(true)
            input.disabled = true
            sendBtn.disabled = true
            addBubble(chat, 'user', guided.getTarget())
            guided.clearAfterSend()

            if (round === 0) {
                round = 1
                persistCommandProgress()
                typeBubble(chat, 'ai', WORKSHOP_GAME.buildPitch, function() {
                    unlockInput(WORKSHOP_GAME.writeTestsPrompt)
                    busy = false
                })
                return
            }

            if (round === 1) {
                round = 2
                persistCommandProgress()
                writeTests(function() {
                    unlockInput(WORKSHOP_GAME.runTestsPrompt)
                    busy = false
                })
                return
            }

            if (round === 2) {
                round = 3
                persistCommandProgress()
                runTestsOnly(function() {
                    unlockInput(WORKSHOP_GAME.buildAndPlayPrompt)
                    busy = false
                })
                return
            }

            if (round === 3) {
                round = 4
                persistCommandProgress()
                runBuild(function() {
                    typeBubble(chat, 'ai', WORKSHOP_GAME.buildDone, function() {
                        showResult(result, 'ok', '')
                        completeStoryStep(3)
                        busy = false
                    })
                })
            }
        }

        sendBtn.addEventListener('click', send)
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') send()
        })

        storyStepControls[3] = {
            enable: function(shouldFocus) {
                if (isStoryDone(3) || round >= commandPrompts.length) return
                unlockInput(commandPrompts[round], shouldFocus)
            }
        }

        storyRestore.command = {
            reset: function() {
                busy = false
                round = 0
                resetTerminal()
                guided.setInputLocked(false)
                guided.setTarget('')
                input.disabled = true
                sendBtn.disabled = true
                guided.refreshSend()
            }
        }

        var savedCommandRound = 0
        if (isStoryDone(3)) savedCommandRound = 4
        else if (storyFlow.demos && storyFlow.demos.command) savedCommandRound = storyFlow.demos.command.round || 0
        if (savedCommandRound > 0) restoreCommandProgress(savedCommandRound)
    }

    // ----- Step 4: play-test — controlled via chat --------------------------
    function initPlaytestDemo() {
        var chat = $('p-chat')
        var result = $('p-result')
        var input = $('p-input')
        var sendBtn = $('p-send')
        var busy = false
        var player = $('p-player')
        var scoreEl = $('p-score')
        var actualEl = $('p-actual')
        var matchEl = $('p-match')
        var actualRow = $('p-actual-row')
        var coins = [$('p-coin-0'), $('p-coin-1'), $('p-coin-2')]
        var coinPos = [
            { left: 58, top: 52 },
            { left: 128, top: 88 },
            { left: 198, top: 44 }
        ]
        var startPos = { left: 14, top: 72 }
        var score = 0
        var goal = WORKSHOP_GAME.sparksGoal

        function resetGame() {
            score = 0
            scoreEl.textContent = '0'
            player.style.left = startPos.left + 'px'
            player.style.top = startPos.top + 'px'
            player.classList.remove('moving')
            for (var c = 0; c < coins.length; c++) {
                coins[c].classList.remove('collected')
            }
            actualEl.textContent = 'Sparks = 0, exit not reached'
            actualRow.classList.remove('match', 'fail')
            matchEl.hidden = true
        }
        resetGame()

        function movePlayerTo(pos, cb) {
            player.classList.add('moving')
            player.style.left = pos.left + 'px'
            player.style.top = pos.top + 'px'
            setTimeout(function() {
                player.classList.remove('moving')
                if (cb) cb()
            }, 520)
        }

        function collectCoin(index, cb) {
            movePlayerTo(coinPos[index], function() {
                coins[index].classList.add('collected')
                score++
                scoreEl.textContent = String(score)
                actualEl.textContent = 'Sparks = ' + score + (score >= goal ? ', exit reached' : ', exit not reached')
                setTimeout(cb, 200)
            })
        }

        var guided = attachGuidedTyping(input, sendBtn)
        guided.setTarget('')
        input.disabled = true
        guided.refreshSend()

        function unlockPlayInput(shouldFocus) {
            guided.setTarget(WORKSHOP_GAME.playtestPrompt)
            input.disabled = false
            sendBtn.disabled = false
            guided.setInputLocked(false)
            guided.refreshSend()
            if (shouldFocus !== false) focusStoryInput(input)
        }

        function send() {
            if (busy || !canUseStoryStep(4) || !guided.isComplete()) return
            busy = true
            guided.setInputLocked(true)
            input.disabled = true
            sendBtn.disabled = true
            resetGame()
            addBubble(chat, 'user', guided.getTarget())
            guided.clearAfterSend()

            playSteps(chat, [
                'Open browser  file:///…/index.html — built game',
                'Play  Platform Hopper — collect factory sparks',
                'Check  does the built game match DESIGN.md?'
            ], function() {
                collectCoin(0, function() {
                    collectCoin(1, function() {
                        collectCoin(2, function() {
                            actualRow.classList.add('match')
                            matchEl.hidden = false
                            typeBubble(chat, 'ai', 'Looks good — 3 sparks collected and you reached the exit.', function() {
                                showResult(result, 'ok', '')
                                completeStoryStep(4)
                                busy = false
                            })
                        })
                    })
                })
            })
        }

        sendBtn.addEventListener('click', send)
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') send()
        })

        storyStepControls[4] = {
            enable: function(shouldFocus) {
                if (!isStoryDone(4)) unlockPlayInput(shouldFocus)
            }
        }

        storyRestore.playtest = {
            reset: function() {
                busy = false
                resetGame()
                guided.setInputLocked(false)
                guided.setTarget('')
                input.disabled = true
                sendBtn.disabled = true
                guided.refreshSend()
            }
        }

        if (isStoryDone(4)) {
            chat.innerHTML = ''
            addBubble(chat, 'user', WORKSHOP_GAME.playtestPrompt)
            addBubble(chat, 'tool', 'Open browser  file:///…/index.html — built game')
            addBubble(chat, 'tool', 'Play  Platform Hopper — collect factory sparks')
            addBubble(chat, 'tool', 'Check  does the built game match DESIGN.md?')
            addBubble(chat, 'ai', 'Looks good — 3 sparks collected and you reached the exit.')
            showResult(result, 'ok', '')
            score = goal
            scoreEl.textContent = String(goal)
            player.style.left = coinPos[2].left + 'px'
            player.style.top = coinPos[2].top + 'px'
            for (var pc = 0; pc < coins.length; pc++) coins[pc].classList.add('collected')
            actualEl.textContent = 'Sparks = ' + goal + ', exit reached'
            actualRow.classList.add('match')
            matchEl.hidden = false
            input.disabled = true
            sendBtn.disabled = true
        }
    }

    function initDemo() {
        initChatDemo()
        initAgentFilesDemo()
        initCommandDemo()
        initPlaytestDemo()
    }

    // ----- Boot -----------------------------------------------------------

    function init() {
        initTabs()
        initTutorialCelebrate()
        initStorySkip()
        storyFlow = loadStoryState()
        reconcileStoryDemos()
        initDemo()
        restoreStoryUI()
        initFirst()
        initNext()
        initPublish()
        initChecklist()
        syncStoryChecklist()
        if (isStoryDone(4)) switchToTab('steps')
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init)
    } else {
        init()
    }

})()
