// Test framework. Loaded via <script> tag — exports to window.TestRunner.

;(function(root) {
    'use strict'

    var results = []

    var TestRunner = {
        results: results,

        assert: function(condition, message) {
            results.push({ pass: !!condition, message: message })
            if (!condition) console.error('FAIL:', message)
        },

        assertEqual: function(actual, expected, message) {
            var pass = actual === expected
            var detail = pass ? '' : ' (expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual) + ')'
            TestRunner.assert(pass, message + detail)
        },

        assertDeepEqual: function(actual, expected, message) {
            var a = JSON.stringify(actual)
            var b = JSON.stringify(expected)
            var pass = a === b
            var detail = pass ? '' : '\n  expected: ' + b + '\n  got:      ' + a
            TestRunner.assert(pass, message + detail)
        },

        printResults: function() {
            var el = document.getElementById('results')
            var passed = 0
            var failed = 0
            var html = ''

            for (var i = 0; i < results.length; i++) {
                var r = results[i]
                if (r.pass) {
                    passed++
                    html += '<div class="pass">\u2713 ' + r.message + '</div>'
                } else {
                    failed++
                    html += '<div class="fail">\u2717 ' + r.message + '</div>'
                }
            }

            var summary = passed + ' passed, ' + failed + ' failed'
            html = '<div class="summary ' + (failed ? 'fail' : 'pass') + '">' + summary + '</div>' + html

            if (el) el.innerHTML = html
            document.title = (failed ? '\u2717 FAIL' : '\u2713 PASS') + ' \u2014 ' + summary
            console.log(summary)
        }
    }

    root.TestRunner = TestRunner

})(typeof window !== 'undefined' ? window : globalThis)
