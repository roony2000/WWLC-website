/* ==========================================================================
   WWLC i18n.js — the language switcher for every page.

   Load it in <head>, after scripts/i18n-ar.js, both with "defer":

       <script defer src="scripts/i18n-ar.js"></script>
       <script defer src="scripts/i18n.js"></script>

   How a text is found and translated:
   1. Stable keys (preferred). Put a label on the element:
          <h2 data-i18n="why.title">Why Choose ...?</h2>
      The Arabic for "why.title" lives in scripts/i18n-ar.js.
      Add data-i18n-html when the Arabic contains markup (e.g. a <span>).
      Attributes use data-i18n-attr with "attribute:key" pairs, separated
      by ";". Allowed attributes: placeholder, aria-label, alt, title.
          <input data-i18n-attr="placeholder:contactForm.coursePlaceholder" />
   2. Text matching (fallback). Any other text, or text a script writes
      later (messages, button states), is matched by its English wording,
      ignoring extra spaces and line breaks. The English it can match is
      every labelled element on the page plus MESSAGES_EN below.
   Mark text that must stay English with translate="no".

   English is never stored in the dictionary for labelled elements: the
   page HTML is the English. Switching back to English puts the original
   text back without reloading.

   The choice is saved in localStorage under "wwlcLang". A tiny script in
   each page's <head> reads it and sets dir="rtl" before the page draws.

   Console helper: wwlcI18nReport() lists every label with no Arabic yet.

   Hooks it needs from scripts/layout.js: #langSelector, #langBtn,
   #langMenu, #langBtnFlag, #langBtnLabel, .lang-item with data-lang,
   data-code and data-flag.
   ========================================================================== */
(function () {
    'use strict';

    var STORAGE_KEY = 'wwlcLang';
    var LANGS = ['en', 'ar', 'ru', 'zh', 'ko', 'fr'];
    var RTL_LANGS = ['ar'];
    var ATTRS = ['placeholder', 'aria-label', 'alt', 'title'];
    var ARABIC_FONT_URL = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700&display=swap';

    // Languages in the menu that have no translation yet: the page stays in
    // English and shows a small note in that language.
    var COMING_SOON = {
        ru: 'Перевод скоро появится',
        zh: '翻译即将推出',
        ko: '번역 준비 중입니다',
        fr: 'Traduction bientôt disponible'
    };

    // English text that scripts write while the page runs (messages, button
    // states). It has no data-i18n label in the HTML, so it is matched by
    // its wording. The Arabic for each key is in scripts/i18n-ar.js.
    var MESSAGES_EN = {
        // Header (scripts/nav.js)
        'msg.closeNav': 'Close navigation',
        // Contact forms (index.html, contact.html)
        'msg.contactSent': 'Your message has been sent.',
        'msg.contactFailed': 'Unable to send message right now.',
        'msg.networkRetry': 'Network error. Please try again.',
        'msg.network': 'Network error.',
        'msg.serverError': 'Server error.',
        'msg.serverRetry': 'Server error. Please try again.',
        // Homepage globe (scripts/main.js)
        'msg.exitFullscreen': 'Exit fullscreen globe view',
        'msg.videoSoon': 'Video coming soon',
        'msg.learnerStory': 'Learner story',
        // Register page (register.html, scripts/register.js)
        'msg.hidePassword': 'Hide password',
        'msg.passwordHint': 'Use 8+ characters with a mix of letters and numbers.',
        'msg.strengthWeak': 'Strength: weak. Add numbers and capital letters.',
        'msg.strengthFair': 'Strength: fair. Add symbols for extra security.',
        'msg.strengthStrong': 'Strength: strong. Consider adding a symbol.',
        'msg.strengthVeryStrong': 'Strength: very strong. Great password!',
        'msg.verifyHint': 'Enter the six-digit code we sent to your email.',
        'msg.codeSentTo': 'We sent a 6-digit code to',
        'msg.codeSentEnterBelow': '. Enter it below to confirm your account.',
        'msg.learner': 'learner',
        'msg.yourEmail': 'your email',
        'msg.codeExpired': 'Code expired. Please resend to get a new code.',
        'msg.codeExpiredLong': 'Your verification code has expired. Please click "Resend code" to get a new one.',
        'msg.unexpectedResponse': 'Unexpected server response. Please try again.',
        'msg.registrationFailed': 'Registration failed.',
        'msg.accountCreatedNoEmail': 'Account created, but code email has not arrived yet. Please use resend.',
        'msg.accountCreated': 'Account created. Please check your inbox for the verification code.',
        'msg.enterEmailAndVerificationCode': 'Please enter your email and verification code.',
        'msg.enterEmailAndCode': 'Please enter your email and code.',
        'msg.enterSixDigit': 'Enter the 6-digit code from your inbox.',
        'msg.verifying': 'Verifying...',
        'msg.verificationFailed': 'Verification failed.',
        'msg.verificationFailedCheck': 'Verification failed. Please check your email and code.',
        'msg.emailVerified': 'Email verified successfully.',
        'msg.emailVerifiedSignIn': 'Your email has been verified! You can now sign in.',
        'msg.alreadyVerified': 'Your email is already verified. You can sign in.',
        'msg.enterEmailFirst': 'Please enter your email address first.',
        'msg.enterEmailAboveFirst': 'Please enter your email above first.',
        'msg.sending': 'Sending...',
        'msg.resendFailed': 'Could not resend code.',
        'msg.codeResent': 'Verification code resent. Please check your email.',
        'msg.enterValidEmail': 'Enter a valid email to continue.',
        'msg.enterPassword': 'Please enter your password.',
        'msg.loginFailed': 'Sorry, login failed. Please check your details and try again.',
        'msg.loginSuccess': 'Login successful. Redirecting...',
        'msg.loginSuccessBang': 'Login successful! Redirecting...',
        'msg.noSecurityQuestion': 'No security question found.',
        'msg.answerAndNewPassword': 'Please answer the question and enter a new password.',
        'msg.incorrectAnswer': 'Incorrect answer.',
        'msg.resetFailed': 'Could not reset password. Please try again.',
        'msg.accessGranted': 'Access granted! Redirecting...',
        'msg.accessInvalid': 'Invalid access code. Please try again.',
        'msg.needAccount': 'Please sign in to continue to the placement test. If you are new here, create your account first - it only takes a minute.',
        // My profile (my-profile.html)
        'msg.loading': 'Loading...',
        'msg.notLoggedIn': 'Not logged in',
        'msg.newPasswordShort': 'New password must be at least 6 characters.',
        'msg.passwordChanged': 'Password changed successfully!',
        'msg.passwordChangeError': 'Error changing password.'
    };

    // English text with a number inside. "{n}" in the Arabic is replaced
    // with the number.
    var PATTERNS = [
        { re: /^Code expires in (\d+) seconds\.$/, key: 'msg.codeExpiresIn' }
    ];

    var html = document.documentElement;
    var currentLang = 'en';
    var observer = null;

    // English wording (spaces collapsed) -> key, for text matching
    var englishIndex = {};
    // What was changed, so English can be put back:
    var keyedRecs = new Map();   // element -> record (data-i18n)
    var attrRecs = new Map();    // element -> { attribute: record }
    var textRecs = new Map();    // text node -> record

    function normalize(text) {
        return String(text == null ? '' : text).replace(/\s+/g, ' ').trim();
    }

    function addToIndex(text, key) {
        var clean = normalize(text);
        if (clean && !Object.prototype.hasOwnProperty.call(englishIndex, clean)) {
            englishIndex[clean] = key;
        }
    }

    Object.keys(MESSAGES_EN).forEach(function (key) {
        addToIndex(MESSAGES_EN[key], key);
    });

    function dictionaryFor(lang) {
        if (lang === 'ar') return window.WWLC_I18N_AR || null;
        return null;
    }

    function has(dict, key) {
        return Boolean(key) && Object.prototype.hasOwnProperty.call(dict, key);
    }

    // Arabic for an English text, found by its wording
    function lookup(english, dict) {
        var clean = normalize(english);
        if (!clean) return null;
        var key = englishIndex[clean];
        if (has(dict, key)) return dict[key];
        for (var i = 0; i < PATTERNS.length; i++) {
            var match = PATTERNS[i].re.exec(clean);
            if (match && has(dict, PATTERNS[i].key)) {
                return dict[PATTERNS[i].key].replace('{n}', match[1]);
            }
        }
        return null;
    }

    /* A "record" remembers the English (en) and what we wrote (applied).
       If the current value is neither, another script changed it: that new
       text becomes the English and it is matched by wording from now on. */
    function applyRecord(rec, current, dict, write) {
        if (rec.applied !== null && current === rec.applied) return;
        if (current !== rec.en) {
            rec.en = current;
            rec.dynamic = true;
        }
        var value = (!rec.dynamic && has(dict, rec.key)) ? dict[rec.key] : lookup(rec.en, dict);
        rec.applied = value === null ? null : write(value);
    }

    function restoreRecord(rec, current, write) {
        if (rec.applied !== null && current === rec.applied) write(rec.en);
        rec.applied = null;
    }

    // Never touch code, or what a visitor types into a text box. (A text
    // box's placeholder is still translated: attributes skip only "noscript".)
    function isSkipped(el, attributesOnly) {
        var selector = attributesOnly ? 'noscript, [translate="no"]' : 'script, style, noscript, textarea, [translate="no"]';
        return Boolean(el.closest(selector));
    }

    // --- data-i18n elements --------------------------------------------------

    function keyedValue(el, isHtml) {
        return isHtml ? el.innerHTML : el.textContent;
    }

    function keyedWriter(el, isHtml) {
        return function (value) {
            if (isHtml) el.innerHTML = value;
            else el.textContent = value;
            return keyedValue(el, isHtml);
        };
    }

    function keyedRecord(el) {
        var rec = keyedRecs.get(el);
        if (!rec) {
            var isHtml = el.hasAttribute('data-i18n-html');
            rec = { key: el.getAttribute('data-i18n'), html: isHtml, en: keyedValue(el, isHtml), applied: null, dynamic: false };
            keyedRecs.set(el, rec);
            if (!isHtml) addToIndex(rec.en, rec.key);
        }
        return rec;
    }

    // --- attributes ----------------------------------------------------------

    function parseAttrKeys(el) {
        var keys = {};
        (el.getAttribute('data-i18n-attr') || '').split(';').forEach(function (pair) {
            var at = pair.indexOf(':');
            if (at < 0) return;
            var attr = pair.slice(0, at).trim();
            var key = pair.slice(at + 1).trim();
            if (ATTRS.indexOf(attr) !== -1 && key) keys[attr] = key;
        });
        return keys;
    }

    function attrRecord(el, attr) {
        var recs = attrRecs.get(el);
        if (!recs) {
            recs = {};
            attrRecs.set(el, recs);
        }
        if (!recs[attr]) {
            var key = parseAttrKeys(el)[attr] || null;
            recs[attr] = { key: key, en: el.getAttribute(attr), applied: null, dynamic: false };
            if (key) addToIndex(recs[attr].en, key);
        }
        return recs[attr];
    }

    function attrWriter(el, attr) {
        return function (value) {
            el.setAttribute(attr, value);
            return el.getAttribute(attr);
        };
    }

    // --- plain text nodes ----------------------------------------------------

    function textWriter(node, rec) {
        return function (value) {
            var lead = rec.en.match(/^\s*/)[0];
            var trail = rec.en.match(/\s*$/)[0];
            node.nodeValue = lead + value + trail;
            return node.nodeValue;
        };
    }

    // A text node inside a labelled element is left to the label, unless a
    // script has taken that element over and the label no longer applies.
    function ownedByLabel(node) {
        var owner = node.parentElement && node.parentElement.closest('[data-i18n]');
        if (!owner) return false;
        var rec = keyedRecs.get(owner);
        return !rec || !rec.dynamic || rec.applied !== null;
    }

    function textNodesIn(root) {
        var nodes = [];
        if (root.nodeType === 3) {
            nodes.push(root);
            return nodes;
        }
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        var node;
        while ((node = walker.nextNode())) nodes.push(node);
        return nodes;
    }

    // --- apply / restore -----------------------------------------------------

    function elementsIn(root, selector) {
        var list = Array.prototype.slice.call(root.querySelectorAll(selector));
        if (root.matches && root.matches(selector)) list.unshift(root);
        return list;
    }

    function translateWithin(root, dict) {
        if (root.nodeType === 1) {
            // 1) Labelled elements first, so their English joins the index
            var keyed = elementsIn(root, '[data-i18n]').filter(function (el) { return !isSkipped(el); });
            keyed.forEach(keyedRecord);
            keyed.forEach(function (el) {
                var rec = keyedRecs.get(el);
                applyRecord(rec, keyedValue(el, rec.html), dict, keyedWriter(el, rec.html));
            });

            // 2) Attributes: labelled ones by key, all others by wording
            elementsIn(root, '[data-i18n-attr]').forEach(function (el) {
                var keys = parseAttrKeys(el);
                Object.keys(keys).forEach(function (attr) {
                    if (el.hasAttribute(attr)) attrRecord(el, attr);
                });
            });
            var attrSelector = ATTRS.map(function (a) { return '[' + a + ']'; }).join(',');
            elementsIn(root, attrSelector).forEach(function (el) {
                if (isSkipped(el, true)) return;
                ATTRS.forEach(function (attr) {
                    if (!el.hasAttribute(attr)) return;
                    var value = el.getAttribute(attr);
                    var known = (attrRecs.get(el) || {})[attr];
                    // Unlabelled attributes are only tracked once we have Arabic for them
                    if (!known && lookup(value, dict) === null) return;
                    applyRecord(attrRecord(el, attr), value, dict, attrWriter(el, attr));
                });
            });
        }

        // 3) Any other text, matched by its wording
        textNodesIn(root).forEach(function (node) {
            var parent = node.parentElement;
            if (!parent || !normalize(node.nodeValue) || isSkipped(parent) || ownedByLabel(node)) return;
            var rec = textRecs.get(node);
            if (!rec) {
                // Only tracked once we have Arabic for it (keeps e.g. the
                // ticking globe clock from filling memory)
                if (lookup(node.nodeValue, dict) === null) return;
                rec = { key: null, en: node.nodeValue, applied: null, dynamic: false };
                textRecs.set(node, rec);
            }
            applyRecord(rec, node.nodeValue, dict, textWriter(node, rec));
        });
    }

    function restoreAll() {
        keyedRecs.forEach(function (rec, el) {
            restoreRecord(rec, keyedValue(el, rec.html), keyedWriter(el, rec.html));
        });
        attrRecs.forEach(function (recs, el) {
            Object.keys(recs).forEach(function (attr) {
                restoreRecord(recs[attr], el.getAttribute(attr), attrWriter(el, attr));
            });
        });
        textRecs.forEach(function (rec, node) {
            if (!node.isConnected) {
                textRecs.delete(node);
                return;
            }
            restoreRecord(rec, node.nodeValue, textWriter(node, rec));
        });
    }

    // --- watch for text that scripts add later -------------------------------

    function stopWatching() {
        if (observer) observer.disconnect();
    }

    function startWatching() {
        if (!('MutationObserver' in window)) return;
        if (!observer) {
            observer = new MutationObserver(function (mutations) {
                var dict = dictionaryFor(currentLang);
                if (!dict) return;
                stopWatching();
                mutations.forEach(function (m) {
                    if (m.type === 'childList') {
                        // Re-check the element whose children changed: this also
                        // catches a labelled element whose text a script replaced.
                        if (m.addedNodes.length && m.target.nodeType === 1 && m.target.isConnected) {
                            translateWithin(m.target, dict);
                        }
                    } else if (m.target.isConnected) {
                        // characterData: the text node; attributes: the element
                        var target = m.type === 'attributes' ? m.target : m.target.parentElement;
                        if (target) translateWithin(target, dict);
                    }
                });
                observer.takeRecords();
                startWatching();
            });
        }
        observer.observe(html, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ATTRS
        });
    }

    // --- the menu button and the "coming soon" note --------------------------

    function langItems() {
        var menu = document.getElementById('langMenu');
        return menu ? Array.prototype.slice.call(menu.querySelectorAll('.lang-item')) : [];
    }

    function updateButton(lang) {
        var item = langItems().filter(function (btn) { return btn.getAttribute('data-lang') === lang; })[0];
        if (!item) return;
        var flag = document.getElementById('langBtnFlag');
        var label = document.getElementById('langBtnLabel');
        var itemFlag = item.querySelector('img');
        if (flag && item.getAttribute('data-flag')) flag.src = item.getAttribute('data-flag');
        if (flag && itemFlag) flag.alt = itemFlag.getAttribute('alt') || '';
        if (label) label.textContent = (item.getAttribute('data-code') || lang).toUpperCase();
        langItems().forEach(function (btn) {
            btn.classList.toggle('is-selected', btn === item);
        });
    }

    function updateComingSoon(lang) {
        var note = document.getElementById('i18nSoonNote');
        if (!COMING_SOON[lang]) {
            if (note) note.remove();
            return;
        }
        if (!note) {
            note = document.createElement('div');
            note.id = 'i18nSoonNote';
            note.className = 'i18n-soon';
            note.setAttribute('role', 'status');
            note.innerHTML = '<span class="i18n-soon-text"></span>' +
                '<button type="button" class="i18n-soon-close" aria-label="Close">&times;</button>';
            note.querySelector('.i18n-soon-close').addEventListener('click', function () { note.remove(); });
            document.body.appendChild(note);
        }
        note.querySelector('.i18n-soon-text').textContent =
            COMING_SOON[lang] + ' — translation coming soon. Showing English for now.';
    }

    function ensureArabicFont() {
        var links = document.querySelectorAll('link[href*="Noto+Sans+Arabic"]');
        if (links.length) return;
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = ARABIC_FONT_URL;
        document.head.appendChild(link);
    }

    // --- switch language -----------------------------------------------------

    function setLanguage(lang, save) {
        if (LANGS.indexOf(lang) === -1) lang = 'en';
        var dict = dictionaryFor(lang);
        currentLang = lang;

        if (save) {
            try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* private mode */ }
        }

        // Only a translated language changes lang/dir; the others show English
        html.lang = dict ? lang : 'en';
        html.dir = dict && RTL_LANGS.indexOf(lang) !== -1 ? 'rtl' : 'ltr';

        stopWatching();
        if (dict) {
            if (lang === 'ar') ensureArabicFont();
            translateWithin(html, dict);
            if (observer) observer.takeRecords();
            startWatching();
        } else {
            restoreAll();
        }

        updateButton(lang);
        updateComingSoon(lang);
        html.classList.remove('i18n-loading');
    }

    function savedLanguage() {
        try {
            var lang = localStorage.getItem(STORAGE_KEY);
            return LANGS.indexOf(lang) !== -1 ? lang : 'en';
        } catch (e) {
            return 'en';
        }
    }

    // --- menu behaviour (moved here from scripts/main.js) --------------------

    function initMenu() {
        var langBtn = document.getElementById('langBtn');
        var langMenu = document.getElementById('langMenu');
        var selector = document.getElementById('langSelector');
        if (!langBtn || !langMenu || !selector) return;

        langItems().forEach(function (item, idx) {
            item.style.setProperty('--i', idx);
        });

        function openMenu() {
            langMenu.classList.add('open');
            selector.classList.add('open');
            langBtn.setAttribute('aria-expanded', 'true');
            langBtn.classList.add('animate');
            setTimeout(function () { langBtn.classList.remove('animate'); }, 260);
        }

        function closeMenu() {
            langMenu.classList.remove('open');
            selector.classList.remove('open');
            langBtn.setAttribute('aria-expanded', 'false');
        }

        function toggleMenu() {
            if (langMenu.classList.contains('open')) closeMenu();
            else openMenu();
        }

        langBtn.addEventListener('click', function (event) {
            event.stopPropagation();
            toggleMenu();
        });

        langItems().forEach(function (item) {
            item.addEventListener('click', function () {
                setLanguage(item.getAttribute('data-lang') || 'en', true);
                closeMenu();
            });
            item.addEventListener('focus', function () { item.classList.add('focused'); });
            item.addEventListener('blur', function () { item.classList.remove('focused'); });
        });

        document.addEventListener('click', function (event) {
            if (!selector.contains(event.target)) closeMenu();
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') closeMenu();
            if ((event.key === 'Enter' || event.key === ' ') && document.activeElement === langBtn) {
                event.preventDefault();
                toggleMenu();
            }
        });

        langMenu.addEventListener('keydown', function (event) {
            var items = langItems();
            if (!items.length) return;
            var idx = items.indexOf(document.activeElement);
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                items[(idx + 1) % items.length].focus();
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                items[(idx - 1 + items.length) % items.length].focus();
            }
        });
    }

    // --- console helper ------------------------------------------------------

    // Lists every data-i18n / data-i18n-attr label on this page that has no
    // Arabic yet. Type wwlcI18nReport() in the browser console.
    window.wwlcI18nReport = function () {
        var dict = window.WWLC_I18N_AR || {};
        var missing = [];
        var seen = {};
        function check(key, english, where) {
            if (!key || seen[key] || has(dict, key)) return;
            seen[key] = true;
            missing.push({ key: key, english: normalize(english), where: where });
        }
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var rec = keyedRecs.get(el);
            check(el.getAttribute('data-i18n'), rec ? rec.en : el.textContent, el.tagName.toLowerCase());
        });
        document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
            var keys = parseAttrKeys(el);
            Object.keys(keys).forEach(function (attr) {
                var rec = (attrRecs.get(el) || {})[attr];
                check(keys[attr], rec ? rec.en : el.getAttribute(attr), el.tagName.toLowerCase() + '[' + attr + ']');
            });
        });
        if (missing.length) {
            console.table(missing);
        } else {
            console.info('wwlcI18nReport: every label on this page has Arabic.');
        }
        return missing;
    };

    // --- start ---------------------------------------------------------------

    function start() {
        initMenu();
        var lang = savedLanguage();
        if (lang === 'en') {
            updateButton('en');
            html.classList.remove('i18n-loading');
        } else {
            setLanguage(lang, false);
        }
    }

    // This file is deferred, so the page (and the header from layout.js) is
    // already parsed. The footer arrives on DOMContentLoaded and is picked up
    // by the MutationObserver.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
