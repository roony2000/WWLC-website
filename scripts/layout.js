/* ==========================================================================
   WWLC layout.js — the ONE shared header and footer for every page.

   How to use it on a page: put this tag where the header should appear
   (right after <body> and the floating social icons):

       <script src="scripts/layout.js"></script>
       <noscript> ...plain links... </noscript>

   The script is NOT deferred on purpose: it writes the header in place
   while the page is still loading, so every script that runs later
   (nav.js, main.js and the inline scripts) finds the header ready.
   The footer is added at the end of <body> once the page has loaded.

   Keep these hooks, other scripts depend on them:
   - .navbar, .nav-toggle, .main-nav, .nav-actions  -> scripts/nav.js
   - #mainNav (aria-controls of .nav-toggle)          -> scripts/nav.js
   - #langSelector, #langBtn, #langMenu, #langBtnFlag,
     #langBtnLabel, .lang-item and its data-* attrs    -> scripts/i18n.js
   Translation: every text here has a data-i18n (or data-i18n-attr) key;
   the Arabic for each key is in scripts/i18n-ar.js.
   ========================================================================== */
(function () {
    'use strict';

    var BUSINESS_NAME = 'Wordsworth Language Centre';

    // Main navigation links: [href, label, translation key]
    // Seven links do not fit in one row below 1280px; site.css ("Header:
    // seven menu links") moves them to their own row on those screens.
    var NAV_LINKS = [
        ['courses.html', 'Courses', 'nav.courses'],
        ['placement.php', 'Placement Test', 'nav.placement'],
        ['fee-calendar.html', 'Fee &amp; Calendar', 'nav.fees'],
        ['events.html', 'Events', 'nav.events'],
        ['about.html', 'About', 'nav.about'],
        ['faq.html', 'FAQ', 'nav.faq'],
        ['contact.html', 'Contact', 'nav.contact']
    ];

    // Footer quick links: [href, label, translation key]
    var FOOTER_LINKS = [
        ['index.html', 'Home', 'nav.home'],
        ['courses.html', 'Courses', 'nav.courses'],
        ['placement.php', 'Placement Test', 'nav.placement'],
        ['fee-calendar.html', 'Fee &amp; Calendar', 'nav.fees'],
        ['events.html', 'Events', 'nav.events'],
        ['about.html', 'About', 'nav.about'],
        ['faq.html', 'FAQ', 'nav.faq'],
        ['contact.html', 'Contact', 'nav.contact'],
        ['register.html', 'Register', 'nav.register']
    ];

    // Languages in the selector: [lang, code, native name, English name, flag, flag alt]
    // Native names never change. The English names and flag alts are
    // translated with the keys lang.name.<lang> and lang.flag.<lang>.
    var LANGUAGES = [
        ['en', 'EN', 'English', '', 'gb', 'English (UK)'],
        ['ar', 'AR', '&#1575;&#1604;&#1593;&#1585;&#1576;&#1610;&#1577;', 'Arabic', 'sa', 'Arabic (SA)'],
        ['ru', 'RU', '&#1056;&#1091;&#1089;&#1089;&#1082;&#1080;&#1081;', 'Russian', 'ru', 'Russian'],
        ['zh', 'ZH', '&#20013;&#25991;', 'Chinese', 'cn', 'Chinese'],
        ['ko', 'KO', '&#54620;&#44397;&#50612;', 'Korean', 'kr', 'Korean'],
        ['fr', 'FR', 'Fran&ccedil;ais', 'French', 'fr', 'French']
    ];

    // The file name of the current page, e.g. "contact.html" ("/" counts as index.html)
    function currentPage() {
        var file = window.location.pathname.split('/').pop();
        return file || 'index.html';
    }

    function navLinksHtml() {
        var page = currentPage();
        return NAV_LINKS.map(function (link) {
            var current = link[0] === page ? ' aria-current="page"' : '';
            return '<li><a href="' + link[0] + '"' + current + ' data-i18n="' + link[2] + '">' + link[1] + '</a></li>';
        }).join('');
    }

    function languageItemsHtml() {
        return LANGUAGES.map(function (l) {
            var flag = 'https://flagcdn.com/' + l[4] + '.svg';
            var english = l[3] ? '<span class="lang-translate" data-i18n="lang.name.' + l[0] + '">' + l[3] + '</span>' : '';
            return '<li role="menuitem">' +
                '<button class="lang-item" data-lang="' + l[0] + '" data-code="' + l[1] + '" data-label="' + l[2] + '" data-flag="' + flag + '">' +
                '<img class="flag-img" src="' + flag + '" alt="' + l[5] + '" data-i18n-attr="alt:lang.flag.' + l[0] + '" loading="lazy" decoding="async" />' +
                '<span class="lang-native" translate="no">' + l[2] + '</span>' + english +
                '</button></li>';
        }).join('');
    }

    function headerHtml() {
        return '' +
            '<header class="navbar" role="banner">' +
            '<div class="container nav-inner">' +
            '<a class="logo-link" href="index.html" aria-label="' + BUSINESS_NAME + ' home" data-i18n-attr="aria-label:brand.homeLink">' +
            '<img class="logo-img" src="assets/images/ss.png" alt="' + BUSINESS_NAME + ' logo" data-i18n-attr="alt:brand.logoAlt" />' +
            '</a>' +
            '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="mainNav" aria-label="Open navigation" data-i18n-attr="aria-label:nav.openMenu">' +
            '<span class="nav-toggle-lines" aria-hidden="true">' +
            '<span class="nav-toggle-bar"></span><span class="nav-toggle-bar"></span><span class="nav-toggle-bar"></span>' +
            '</span>' +
            '</button>' +
            '<nav class="main-nav" id="mainNav" role="navigation" aria-label="Main" data-i18n-attr="aria-label:nav.mainLabel">' +
            '<ul>' + navLinksHtml() + '</ul>' +
            '</nav>' +
            '<div class="nav-actions">' +
            '<div class="lang-selector" id="langSelector" aria-haspopup="true">' +
            '<button id="langBtn" class="lang-btn" aria-expanded="false" title="Select language" data-i18n-attr="title:lang.select">' +
            '<img class="flag-img" id="langBtnFlag" src="https://flagcdn.com/gb.svg" alt="English (UK)" />' +
            '<span id="langBtnLabel" class="lang-label" translate="no">EN</span>' +
            '<svg class="chev" width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 10l5 5 5-5z" /></svg>' +
            '</button>' +
            '<ul class="lang-menu" id="langMenu" role="menu" aria-labelledby="langBtn">' + languageItemsHtml() + '</ul>' +
            '</div>' +
            '<a class="ghost nav-signin" href="register.html?showLogin=1" data-i18n="nav.signIn">Sign In</a>' +
            '<a class="cta" href="register.html" data-i18n="nav.register">Register</a>' +
            '</div>' +
            '</div>' +
            '</header>';
    }

    function footerHtml() {
        var year = new Date().getFullYear();
        var quickLinks = FOOTER_LINKS.map(function (link) {
            return '<li><a href="' + link[0] + '" data-i18n="' + link[2] + '">' + link[1] + '</a></li>';
        }).join('');

        return '' +
            '<footer class="wwlc-footer">' +
            '<div class="footer-inner">' +

            // Brand column: logo, tagline, social links
            '<div class="footer-col footer-brand">' +
            '<a href="index.html" aria-label="' + BUSINESS_NAME + ' home" data-i18n-attr="aria-label:brand.homeLink"><img src="assets/images/ss.png" alt="' + BUSINESS_NAME + ' logo" data-i18n-attr="alt:brand.logoAlt" class="footer-logo" /></a>' +
            '<div class="footer-tagline" data-i18n="footer.tagline" data-i18n-html>Empowering <span style="color:#f0a728; font-weight:900; letter-spacing:0.04em;">Language</span>, Inspiring <span style="color:#ffffff; font-weight:900; letter-spacing:0.04em;">Futures</span></div>' +
            '<div class="footer-socials">' +
            '<a href="https://www.instagram.com/wordsworth.language.centre?igsh=eTFvbHB4ZWl4czZx" target="_blank" rel="noopener" aria-label="Instagram" data-i18n-attr="aria-label:social.instagram" class="footer-social">' +
            '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#fff" />' +
            '<path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5Zm4.25 3.25a5.25 5.25 0 1 1 0 10.5a5.25 5.25 0 0 1 0-10.5Zm0 1.5a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5Zm5.25.75a1 1 0 1 1-2 0a1 1 0 0 1 2 0Z" fill="#e1306c" /></svg>' +
            '</a>' +
            '<a href="https://www.tiktok.com/@wwlc_official?_r=1&amp;_t=ZS-93arfYFsky1" target="_blank" rel="noopener" aria-label="TikTok" data-i18n-attr="aria-label:social.tiktok" class="footer-social">' +
            '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#fff" />' +
            '<path d="M16.5 3.5v8.25a3.25 3.25 0 1 1-3.25-3.25" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />' +
            '<path d="M16.5 3.5a3.25 3.25 0 0 0 3.25 3.25" stroke="#25f4ee" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />' +
            '<circle cx="16.5" cy="3.5" r="1.25" fill="#fe2c55" /></svg>' +
            '</a>' +
            '<a href="https://wa.me/60175045565" target="_blank" rel="noopener" aria-label="WhatsApp" data-i18n-attr="aria-label:social.whatsapp" class="footer-social">' +
            '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#fff" />' +
            '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.767.967-.94 1.166-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.173.198-.298.298-.496.099-.198.05-.372-.025-.521-.074-.149-.669-1.612-.916-2.207-.242-.58-.487-.501-.669-.51-.173-.007-.372-.009-.571-.009-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.099 3.205 5.077 4.366.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.007-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#25d366" /></svg>' +
            '</a>' +
            '</div>' +
            '</div>' +

            // Quick links column
            '<div class="footer-col footer-links">' +
            '<h3 data-i18n="footer.quickLinks">Quick Links</h3>' +
            '<ul>' + quickLinks + '</ul>' +
            '</div>' +

            // Contact column (existing details only; do not invent new ones here).
            // The address stays in English (translate="no", dir="ltr") so it works for post and maps.
            '<div class="footer-col footer-contact">' +
            '<h3 data-i18n="footer.contactTitle">Contact</h3>' +
            '<ul>' +
            '<li><span class="footer-icon"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#fff" />' +
            '<path d="M12 21s-6-5.686-6-10A6 6 0 1 1 18 11c0 4.314-6 10-6 10Zm0-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" fill="#f0a728" /></svg></span> ' +
            '<span translate="no" dir="ltr">A-8-4, Megan Avenue, 2, Jalan Yap Kwan Seng,<br>Wilayah Persekutuan, 50450 Kuala Lumpur,<br>Wilayah Persekutuan Kuala Lumpur, Malaysia</span></li>' +
            '<li><span class="footer-icon"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#fff" />' +
            '<rect x="4" y="7" width="16" height="10" rx="2" fill="#050f4f" />' +
            '<path d="M4 7l8 6 8-6" stroke="#ffffff" stroke-width="1.5" /></svg></span> ' +
            '<a href="mailto:info@wordsworth.edu.my">info@wordsworth.edu.my</a></li>' +
            '<li><span class="footer-icon"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#fff" />' +
            '<path d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 0 1 1 1v3.5a1 1 0 0 1-1 1C7.61 22 2 16.39 2 9.5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.35.27 2.67.76 3.88a1 1 0 0 1-.21 1.11l-2.2 2.2Z" fill="#22c55e" /></svg></span> ' +
            '<a href="tel:0175045565">0175045565</a></li>' +
            // TODO: opening hours — add only once confirmed by WWLC.
            '</ul>' +
            '</div>' +

            '</div>' +
            '<div class="footer-bottom">&copy; ' + year + ' <span data-i18n="brand.name">' + BUSINESS_NAME + '</span>. <span data-i18n="footer.rights">All Rights Reserved.</span></div>' +
            '<a href="#top" class="footer-backtotop" aria-label="Back to top" data-i18n-attr="aria-label:footer.backToTop">&#8679;</a>' +
            '</footer>';
    }

    // 1) Header: write it right where this <script> tag sits.
    if (!document.querySelector('header.navbar')) {
        var me = document.currentScript;
        if (me && me.parentNode) {
            me.insertAdjacentHTML('beforebegin', headerHtml());
        } else if (document.body) {
            document.body.insertAdjacentHTML('afterbegin', headerHtml());
        }
    }

    // 2) Footer: add it at the very end of <body> once the page has loaded.
    function addFooter() {
        if (!document.querySelector('footer.wwlc-footer')) {
            document.body.insertAdjacentHTML('beforeend', footerHtml());
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addFooter);
    } else {
        addFooter();
    }
})();
