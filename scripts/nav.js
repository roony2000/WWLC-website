document.addEventListener('DOMContentLoaded', function () {
    var mobileMedia = window.matchMedia('(max-width: 980px)');

    document.querySelectorAll('.navbar').forEach(function (navbar) {
        var toggle = navbar.querySelector('.nav-toggle');
        var mainNav = navbar.querySelector('.main-nav');
        var navActions = navbar.querySelector('.nav-actions');

        if (!toggle || !mainNav || !navActions) {
            return;
        }

        function setOpenState(isOpen) {
            navbar.classList.toggle('is-open', isOpen);
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            toggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
        }

        function closeMenu() {
            setOpenState(false);
        }

        toggle.addEventListener('click', function (event) {
            event.stopPropagation();
            setOpenState(!navbar.classList.contains('is-open'));
        });

        document.addEventListener('click', function (event) {
            if (!mobileMedia.matches) {
                return;
            }

            if (!navbar.contains(event.target)) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                closeMenu();
            }
        });

        navbar.querySelectorAll('.main-nav a, .nav-actions a').forEach(function (link) {
            link.addEventListener('click', function () {
                if (mobileMedia.matches) {
                    closeMenu();
                }
            });
        });

        window.addEventListener('resize', function () {
            if (!mobileMedia.matches) {
                closeMenu();
            }
        });

        closeMenu();
    });
});

