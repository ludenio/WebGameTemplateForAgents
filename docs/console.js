// docs/console.js
// Workshop Console logic: tab switching, live prompt assembly, copy buttons,
// example chips, and a localStorage-backed workshop checklist.
//
// Loaded via a plain <script> tag after prompts.js. No ES modules, no build,
// no external dependencies, no Math.random(). Works via file:/// and Pages.
;(function() {
    'use strict'

    var STORAGE_KEY = 'workshopConsole.checklist.v1'

    var checklistItems = [
        { id: 'concept', text: 'Understand how an agent differs from a plain chat' },
        { id: 'account', text: 'Create a GitHub account' },
        { id: 'desktop', text: 'Install GitHub Desktop' },
        { id: 'agent-app', text: 'Install an AI agent app (e.g. Cursor)' },
        { id: 'clone',   text: 'Make your own copy of the template and clone it' },
        { id: 'open-agent', text: 'Open the cloned game folder in your agent app' },
        { id: 'idea',    text: 'Write your game idea' },
        { id: 'send',    text: 'Send the first prompt to the agent' },
        { id: 'design',  text: 'Review and approve the design (DESIGN.md)' },
        { id: 'plan',    text: 'Approve the task plan (TODO.md)' },
        { id: 'play',    text: 'Open the game and play it' },
        { id: 'iterate', text: 'Make a change with the "Change a game" prompt' },
        { id: 'publish', text: 'Publish the game online and share the link' }
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

    function initTabs() {
        var buttons = document.querySelectorAll('.tab-btn')
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('click', function() {
                switchToTab(this.getAttribute('data-tab'))
            })
        }
    }

    // ----- First-game builder --------------------------------------------

    function firstFields() {
        return {
            genre:   $('f-genre').value,
            action:  $('f-action').value,
            goal:    $('f-goal').value,
            style:   $('f-style').value,
            winLose: $('f-winlose').value,
            idea:    $('f-idea').value
        }
    }

    function renderFirst() {
        var concept = window.prompts.buildConcept(firstFields())
        $('preview-first').textContent = window.prompts.buildFirstPrompt(concept)
    }

    function initFirst() {
        var ids = ['f-genre', 'f-action', 'f-goal', 'f-style', 'f-winlose', 'f-idea']
        for (var i = 0; i < ids.length; i++) {
            $(ids[i]).addEventListener('input', renderFirst)
        }

        var chipBox = $('example-chips')
        var examples = window.prompts.exampleConcepts
        for (var e = 0; e < examples.length; e++) {
            (function(example) {
                var chip = document.createElement('button')
                chip.type = 'button'
                chip.className = 'chip'
                chip.textContent = example.label
                chip.addEventListener('click', function() {
                    $('f-idea').value = example.text
                    renderFirst()
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

    function renderNext() {
        $('preview-next').textContent = window.prompts.buildNextPrompt($('n-change').value)
    }

    function initNext() {
        $('n-change').addEventListener('input', renderNext)
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

        $('copy-approve-continue').addEventListener('click', function() {
            copyText(window.prompts.approvalPhrases.continue, this)
        })
        $('copy-approve-run').addEventListener('click', function() {
            copyText(window.prompts.approvalPhrases.run, this)
        })
    }

    // ----- Platform Hopper workshop story (tab 0) -------------------------
    //
    // One fictional game across four locked steps (unlock in order):
    //   1. Plain chat — ask to build the game; chat only describes an idea
    //   2. Agent — creates 4 project files (fixed count, then locks)
    //   3. Agent — runs tests/index.html
    //   4. Agent — play-tests src/index.html against DESIGN.md

    var storyFlow = { unlockedMax: 1, done: {} }
    var storyStepControls = {}
    var storyRestore = { agent: null, command: null, playtest: null }

    var WORKSHOP_GAME = {
        name: 'Platform Hopper',
        sparksGoal: 3,
        firstPrompt: 'Build me Platform Hopper — a browser game: hop moving platforms, avoid pits, reach the exit',
        chatReply: 'I can\'t build games or create files in your project — chat only. Idea: Platform Hopper, a side-scrolling factory platformer (moving platforms, pits, sparks, exit).',
        testRunPrompt: 'Write tests and run them',
        testExplain: 'As an agent I work with programs that print text — I don\'t see the game on screen the way you do. For me it\'s lines of output. So I run technical tests first: they report pass or fail, and that\'s how I know the game works before we open it in a browser.',
        testApprovePrompt: 'I approve, continue.',
        playtestPrompt: 'Play it and tell me if everything looks right',
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
        agentSteps: [
            {
                file: 'game-idea.txt',
                icon: 'fe-i-txt',
                prompt: 'Make me a game idea',
                tool: 'Create  game-idea.txt',
                ai: 'I came up with Platform Hopper — a factory platformer — and saved the idea to game-idea.txt.',
                lines: null
            },
            {
                special: 'design-and-plan',
                prompt: 'Let\'s make the game',
                mdFile: 'DESIGN.md',
                mdIcon: 'fe-i-md',
                mdLines: [
                    '# Platform Hopper — design',
                    '',
                    '## Core loop',
                    'Cross 3 factory zones; platforms speed up each zone.',
                    '',
                    '## Player verbs',
                    '- run  - jump',
                    '',
                    '## Collectibles',
                    '3 factory sparks per zone before the exit platform unlocks',
                    '',
                    '## Failure',
                    'Pit = restart at last checkpoint'
                ],
                todoFile: 'TODO.md',
                todoIcon: 'fe-i-md',
                todoLines: [
                    '# TODO — Platform Hopper',
                    '',
                    '1. config/player.js — speed, jump, gravity',
                    '2. store + playerSystem — movement, pits, checkpoints',
                    '3. platformSystem — moving platforms per zone',
                    '4. collectibles — 3 sparks, exit gate',
                    '5. tests — deterministic movement + spark pickup replay'
                ],
                aiExplain: 'For agents, Markdown files work better than plain .txt — clearer structure and easier to update. I\'ll turn your idea into DESIGN.md, remove the notes file, and add a to-do list so we can track what\'s done.',
                aiDone: 'DESIGN.md and TODO.md are ready — we can start building.',
                deleteFile: 'game-idea.txt'
            },
            {
                file: 'src/config/player.js',
                icon: 'fe-i-js',
                prompt: 'Let\'s start building',
                tool: 'Create  src/config/player.js',
                ai: 'First step done — I added player movement settings in src/config/player.js.',
                lines: [
                    ';(function() {',
                    "  'use strict'",
                    '  window.config = window.config || {}',
                    '  window.config.player = {',
                    '    speed: 4,',
                    '    jumpForce: 12,',
                    '    gravity: 0.55',
                    '  }',
                    '})()'
                ]
            },
            {
                special: 'approval-gate',
                prompt: 'Check if the game really working',
                aiAsk: 'We could write tests and check — that way I\'d know for sure the game works. Approve?',
                approvePrompt: 'I approve, continue.',
                aiOk: 'Approved.'
            }
        ]
    }
    WORKSHOP_GAME.agentSteps[0].lines = WORKSHOP_GAME.ideaLines

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
        if (n === 4) {
            showTutorialComplete(false)
        } else {
            unlockStoryStep(n + 1)
        }
    }

    function unlockStoryStep(n) {
        if (n < 1 || n > 4) return
        var ctrl = storyStepControls[n]
        if (ctrl && ctrl.enable) ctrl.enable()
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

    function goToChecklistTab() {
        switchToTab('steps')
        var section = document.querySelector('.tab-section[data-tab="steps"]')
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    function showTutorialComplete(quiet) {
        var panel = $('tutorial-celebrate')
        if (!panel) return
        panel.hidden = false
        if (!quiet) burstConfetti($('tutorial-confetti'))
    }

    function showStepsCelebrate(quiet) {
        var panel = $('steps-celebrate')
        if (!panel) return
        panel.hidden = false
        if (!quiet) burstConfetti($('steps-confetti'))
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
        storyFlow.unlockedMax = 1
        storyFlow.done = {}

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
            enable: function() {
                if (!isStoryDone(1)) {
                    input.disabled = false
                    guided.setInputLocked(false)
                    guided.refreshSend()
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
            }
        }
    }

    // ----- Step 2: agent creates project files (4 sends, then locks) -------
    function initAgentFilesDemo() {
        var steps = WORKSHOP_GAME.agentSteps
        var chat = $('ag-chat')
        var fm = $('ag-fm')
        var treeList = $('ag-tree-list')
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
        var approvalRound = 0

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
            for (var i = 0; i < agentFiles.length; i++) {
                (function(idx) {
                    var f = agentFiles[idx]
                    var li = document.createElement('li')
                    li.className = 'fe-node fe-file fe-agent-file'
                    li.setAttribute('role', 'treeitem')
                    if (idx === activeIndex) li.classList.add('is-active')
                    if (f.isNew) li.classList.add('is-new')
                    var icon = document.createElement('span')
                    icon.className = 'fe-icon ' + (f.icon || 'fe-i-txt')
                    icon.setAttribute('aria-hidden', 'true')
                    var name = document.createElement('span')
                    name.className = 'fe-name'
                    name.textContent = f.name
                    li.appendChild(icon)
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
            for (var i = 0; i < agentFiles.length; i++) agentFiles[i].isNew = false
            var f = agentFiles[index]
            if (tabName) tabName.textContent = f.name
            if (tabIcon) tabIcon.className = 'fe-icon ' + (f.icon || 'fe-i-txt')
            renderTree()
            renderLines(fileEl, f.lines, highlightAll ? 'all' : undefined)
            fileEl.scrollTop = 0
        }

        var guided = attachGuidedTyping(input, sendBtn)
        guided.setTarget(steps[0].prompt)

        function finishAgentStep() {
            input.disabled = true
            sendBtn.disabled = true
            showResult(result, 'ok', '')
            completeStoryStep(2)
        }

        function afterAgentRound() {
            updateProgress()
            if (sendCount >= steps.length) {
                finishAgentStep()
                busy = false
                return
            }
            var next = steps[sendCount]
            if (next.special === 'approval-gate') {
                showResult(result, 'ok', '')
                guided.setTarget(next.prompt)
                input.disabled = false
                guided.setInputLocked(false)
                guided.refreshSend()
                busy = false
                return
            }
            showResult(result, 'ok', '')
            guided.setTarget(next.prompt)
            input.disabled = false
            guided.setInputLocked(false)
            guided.refreshSend()
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

        function removeAgentFile(name) {
            var removed = -1
            for (var i = 0; i < agentFiles.length; i++) {
                if (agentFiles[i].name === name) removed = i
            }
            if (removed < 0) return
            agentFiles.splice(removed, 1)
            if (activeIndex >= agentFiles.length) {
                activeIndex = agentFiles.length - 1
            }
            renderTree()
            if (agentFiles.length > 0) {
                selectFile(activeIndex < 0 ? 0 : activeIndex, false)
            } else {
                renderLines(fileEl, [])
                if (tabName) tabName.textContent = ''
            }
        }

        function runDesignAndPlan(step, done) {
            var ideaIdx = -1
            for (var k = 0; k < agentFiles.length; k++) {
                if (agentFiles[k].name === 'game-idea.txt') ideaIdx = k
            }
            if (ideaIdx >= 0) selectFile(ideaIdx, false)

            typeBubble(chat, 'tool', 'Read  game-idea.txt', function() {
                typeBubble(chat, 'ai', step.aiExplain, function() {
                    typeBubble(chat, 'tool', 'Create  ' + step.mdFile + '   (new file)', function() {
                        setTimeout(function() {
                            pushAgentFile(step.mdFile, step.mdLines, step.mdIcon)
                            typeBubble(chat, 'tool', 'Delete  ' + step.deleteFile, function() {
                                setTimeout(function() {
                                    removeAgentFile(step.deleteFile)
                                    typeBubble(chat, 'tool', 'Create  ' + step.todoFile + '   (new file)', function() {
                                        setTimeout(function() {
                                            pushAgentFile(step.todoFile, step.todoLines, step.todoIcon)
                                            selectFile(agentFiles.length - 1, true)
                                            typeBubble(chat, 'ai', step.aiDone, done)
                                        }, 320)
                                    })
                                }, 300)
                            })
                        }, 320)
                    })
                })
            })
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

            if (step.special === 'design-and-plan') {
                sendCount++
                runDesignAndPlan(step, function() {
                    afterAgentRound()
                })
                return
            }

            if (step.special === 'approval-gate') {
                if (approvalRound === 0) {
                    approvalRound = 1
                    typeBubble(chat, 'ai', step.aiAsk, function() {
                        guided.setTarget(step.approvePrompt)
                        input.disabled = false
                        guided.setInputLocked(false)
                        guided.refreshSend()
                        busy = false
                    })
                    return
                }
                approvalRound = 0
                sendCount++
                typeBubble(chat, 'ai', step.aiOk, function() {
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
            enable: function() {
                if (!isStoryDone(2)) {
                    input.disabled = false
                    guided.setInputLocked(false)
                    guided.refreshSend()
                }
            }
        }

        storyRestore.agent = {
            reset: function() {
                busy = false
                sendCount = 0
                approvalRound = 0
                agentFiles = []
                treeList.innerHTML = ''
                fm.classList.remove('has-file')
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

    function appendTermLine(outEl, text, kind) {
        var line = document.createElement('span')
        line.className = 'ft-line' + (kind ? ' ' + kind : '')
        line.textContent = text
        outEl.appendChild(line)
        outEl.appendChild(document.createTextNode('\n'))
        outEl.scrollTop = outEl.scrollHeight
    }

    // ----- Step 3: agent runs commands (tests), then approval — all via chat ----
    function initCommandDemo() {
        var chat = $('c-chat')
        var result = $('c-result')
        var input = $('c-input')
        var sendBtn = $('c-send')
        var outEl = $('c-term-out')
        var busy = false
        var approvePrompt = WORKSHOP_GAME.testApprovePrompt
        var aiAskTests = 'All tests passed. Approve play-test in the browser?'
        var aiOkTests = 'Approved.'
        var testsDone = false

        function resetTerminal() {
            outEl.textContent = ''
            outEl.appendChild(document.createTextNode('$ '))
        }
        resetTerminal()

        var guided = attachGuidedTyping(input, sendBtn)
        guided.setTarget(WORKSHOP_GAME.testRunPrompt)
        input.disabled = true
        guided.refreshSend()

        function runTests() {
            typeBubble(chat, 'ai', WORKSHOP_GAME.testExplain, function() {
                resetTerminal()
                playSteps(chat, [
                    'Run command  cd WebGameTemplateForAgents',
                    'Run command  open tests/index.html'
                ], function() {
                var script = [
                    { t: 0,   k: 'cmd', v: 'open tests/index.html' },
                    { t: 400, k: 'dim', v: 'Platform Hopper — running test suite…' },
                    { t: 900, k: 'ok',  v: '✓ store — dispatch, replay, tick order' },
                    { t: 1400, k: 'ok', v: '✓ player.js — run / jump on platforms' },
                    { t: 1900, k: 'ok', v: '✓ sparks + exit — matches the plan' },
                    { t: 2400, k: 'pass', v: '12 passed, 0 failed' },
                    { t: 2900, k: 'dim', v: 'Next: open the game and try it' }
                ]
                script.forEach(function(item) {
                    setTimeout(function() {
                        if (item.k === 'cmd') appendTermLine(outEl, '$ ' + item.v, 'cmd')
                        else appendTermLine(outEl, item.v, item.k)
                    }, item.t)
                })
                setTimeout(function() {
                    typeBubble(chat, 'ai', 'Tests passed.', function() {
                        typeBubble(chat, 'ai', aiAskTests, function() {
                            testsDone = true
                            guided.setTarget(approvePrompt)
                            input.disabled = false
                            guided.setInputLocked(false)
                            guided.refreshSend()
                            busy = false
                        })
                    })
                }, 3200)
                })
            })
        }

        function send() {
            if (busy || !canUseStoryStep(3) || !guided.isComplete()) return
            var text = guided.getTarget()
            busy = true
            guided.setInputLocked(true)
            input.disabled = true
            sendBtn.disabled = true
            addBubble(chat, 'user', text)
            guided.clearAfterSend()

            if (!testsDone) {
                runTests()
                return
            }

            typeBubble(chat, 'ai', aiOkTests, function() {
                showResult(result, 'ok', '')
                completeStoryStep(3)
                busy = false
            })
        }

        sendBtn.addEventListener('click', send)
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') send()
        })

        storyStepControls[3] = {
            enable: function() {
                if (!isStoryDone(3)) {
                    input.disabled = false
                    guided.setInputLocked(false)
                    guided.refreshSend()
                }
            }
        }

        storyRestore.command = {
            reset: function() {
                busy = false
                testsDone = false
                resetTerminal()
                guided.setInputLocked(false)
                guided.setTarget(WORKSHOP_GAME.testRunPrompt)
                input.disabled = true
                guided.refreshSend()
            }
        }
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
        guided.setTarget(WORKSHOP_GAME.playtestPrompt)
        input.disabled = true
        guided.refreshSend()

        function send() {
            if (busy || !canUseStoryStep(4) || !guided.isComplete()) return
            var text = guided.getTarget()
            busy = true
            guided.setInputLocked(true)
            input.disabled = true
            sendBtn.disabled = true
            resetGame()
            addBubble(chat, 'user', text)
            guided.clearAfterSend()

            playSteps(chat, [
                'Open browser  file:///…/src/index.html',
                'Play  Platform Hopper — collect factory sparks',
                'Check  does the game match the plan?'
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
            enable: function() {
                if (!isStoryDone(4)) {
                    input.disabled = false
                    guided.setInputLocked(false)
                    guided.refreshSend()
                }
            }
        }

        storyRestore.playtest = {
            reset: function() {
                busy = false
                resetGame()
                guided.setInputLocked(false)
                guided.setTarget(WORKSHOP_GAME.playtestPrompt)
                input.disabled = true
                guided.refreshSend()
            }
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
        initDemo()
        applyStoryLocks()
        unlockStoryStep(1)
        initFirst()
        initNext()
        initPublish()
        initChecklist()
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init)
    } else {
        init()
    }

})()
