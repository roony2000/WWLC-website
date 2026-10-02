(function () {
    const accountStage = document.getElementById('registerStageAccount');
    const verifyStage = document.getElementById('registerStageVerify');
    const completeStage = document.getElementById('registerStageComplete');
    const progressMarkers = Array.from(document.querySelectorAll('[data-step-marker]'));

    const accountForm = document.getElementById('registerForm');
    const registerMessage = document.getElementById('registerMessage');

    const verifyForm = document.getElementById('verifyForm') || document.getElementById('verifyFormPHP');
    const verifyMessage = document.getElementById('verifyMessage');
    const verifyEmailInput = document.getElementById('verifyEmail');
    const codeInput = document.getElementById('verificationCode') || document.getElementById('verifyCode');
    const resendBtn = document.getElementById('resendCode') || document.getElementById('resendCodeBtn');
    const resendCountdown = document.getElementById('resendCountdown') || document.getElementById('expiryTimer');

    const verificationHint = document.getElementById('verificationHint');
    const successName = document.getElementById('registrationName');
    const successEmail = document.getElementById('registrationEmail');

    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    const strengthHint = document.getElementById('passwordStrength');

    const loginTrigger = document.getElementById('loginTrigger');
    const openLoginAfterRegister = document.getElementById('openLoginAfterRegister');
    const loginModal = document.getElementById('loginModal');
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');

    const ACCOUNT_STATUS_KEY = 'wwlcAccountStatus';

    let closeLoginTimer = null;
    let lastFocus = null;
    let resendTimer = null;
    let countdownValue = 0;
    let accountData = { fullName: '', email: '' };

    function markAccountVerified(details = {}) {
        const payload = {
            verified: true,
            verifiedAt: new Date().toISOString(),
            fullName: typeof details.fullName === 'string' ? details.fullName : '',
            email: typeof details.email === 'string' ? details.email : ''
        };
        try {
            localStorage.setItem(ACCOUNT_STATUS_KEY, JSON.stringify(payload));
        } catch (error) {
            console.warn('Unable to persist account verification status', error);
        }
    }

    function showStage(stageNumber) {
        [accountStage, verifyStage, completeStage].forEach((section) => {
            if (!section) return;
            const sectionStage = Number(section.getAttribute('data-stage'));
            const isCurrent = sectionStage === stageNumber;
            if (isCurrent) {
                section.removeAttribute('hidden');
                section.classList.add('is-active');
            } else {
                section.setAttribute('hidden', 'hidden');
                section.classList.remove('is-active');
            }
        });

        progressMarkers.forEach((marker) => {
            const markerStage = Number(marker.getAttribute('data-step'));
            marker.classList.toggle('is-active', markerStage === stageNumber);
            marker.classList.toggle('is-complete', markerStage < stageNumber);
        });
    }

    function showMessage(target, text, variant) {
        if (!target) return;
        target.textContent = text;
        target.dataset.variant = variant || 'info';
        target.style.color = '';
        target.removeAttribute('hidden');
    }

    function clearMessage(target) {
        if (!target) return;
        target.textContent = '';
        target.setAttribute('hidden', 'hidden');
        delete target.dataset.variant;
        target.style.color = '';
    }

    function updateStrength(value) {
        if (!strengthHint) return;

        const hasLength = value.length >= 8;
        const hasUpper = /[A-Z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSymbol = /[^A-Za-z0-9]/.test(value);

        let score = 0;
        if (hasLength) score += 1;
        if (hasUpper) score += 1;
        if (hasNumber) score += 1;
        if (hasSymbol) score += 1;

        let label = 'Use 8+ characters with a mix of letters and numbers.';
        let variant = 'muted';

        if (value.length === 0) {
            label = 'Use 8+ characters with a mix of letters and numbers.';
            variant = 'muted';
        } else if (score <= 1) {
            label = 'Strength: weak. Add numbers and capital letters.';
            variant = 'error';
        } else if (score === 2) {
            label = 'Strength: fair. Add symbols for extra security.';
            variant = 'warning';
        } else if (score === 3) {
            label = 'Strength: strong. Consider adding a symbol.';
            variant = 'success';
        } else {
            label = 'Strength: very strong. Great password!';
            variant = 'success';
        }

        strengthHint.textContent = label;
        strengthHint.dataset.variant = variant;
    }

    function stopCountdown() {
        if (resendTimer) {
            window.clearInterval(resendTimer);
            resendTimer = null;
        }
    }

    function startCountdown(seconds) {
        if (!resendBtn || !resendCountdown) return;

        stopCountdown();
        countdownValue = seconds;
        resendBtn.disabled = true;

        const render = () => {
            if (resendCountdown.id === 'expiryTimer') {
                resendCountdown.textContent = countdownValue > 0
                    ? `Code expires in ${countdownValue} seconds.`
                    : 'Code expired. Please resend to get a new code.';
            } else {
                resendCountdown.textContent = String(Math.max(0, countdownValue));
            }
        };

        render();

        resendTimer = window.setInterval(() => {
            countdownValue -= 1;
            render();
            if (countdownValue <= 0) {
                stopCountdown();
                resendBtn.disabled = false;
            }
        }, 1000);
    }

    function setVerificationContext(email, fullName) {
        accountData.email = email || '';
        accountData.fullName = fullName || '';

        if (verifyEmailInput) {
            verifyEmailInput.value = accountData.email;
        }

        if (verificationHint && accountData.email) {
            verificationHint.innerHTML = `We sent a 6-digit code to <strong>${accountData.email}</strong>. Enter it below to confirm your account.`;
        }

        if (successName) {
            successName.textContent = accountData.fullName || 'learner';
        }

        if (successEmail) {
            successEmail.textContent = accountData.email || 'your email';
        }
    }

    async function parseJsonResponse(response) {
        const raw = await response.text();
        try {
            return JSON.parse(raw);
        } catch (error) {
            const plain = String(raw || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            if (plain) {
                return { success: false, message: plain };
            }
            return { success: false, message: 'Unexpected server response. Please try again.' };
        }
    }

    async function postWithEndpointFallback(scriptName, buildRequestInit) {
        const targets = [`/${scriptName}`, `/api/${scriptName}`];
        let lastResponse = null;

        for (const target of targets) {
            const response = await fetch(target, buildRequestInit());
            lastResponse = response;
            if (response.status !== 404) {
                return response;
            }
        }

        return lastResponse;
    }

    function toggleLoginMessage(text, variant) {
        if (!loginMessage) return;
        if (!text) {
            loginMessage.textContent = '';
            loginMessage.setAttribute('hidden', 'hidden');
            delete loginMessage.dataset.variant;
            loginMessage.style.color = '';
            return;
        }
        loginMessage.textContent = text;
        loginMessage.dataset.variant = variant || 'info';
        loginMessage.style.color = '';
        loginMessage.removeAttribute('hidden');
    }

    function handleEscape(event) {
        if (event.key === 'Escape' && loginModal && !loginModal.hidden) {
            event.preventDefault();
            closeLoginModal();
        }
    }

    function openLoginModal(prefillEmail = '') {
        if (!loginModal) return;
        window.clearTimeout(closeLoginTimer);
        lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        loginForm?.reset();
        toggleLoginMessage('', '');

        if (prefillEmail && loginEmail) {
            loginEmail.value = prefillEmail;
        }

        loginModal.hidden = false;
        requestAnimationFrame(() => {
            loginModal.classList.add('is-visible');
        });
        document.addEventListener('keydown', handleEscape, true);

        window.setTimeout(() => {
            if (prefillEmail) {
                loginPassword?.focus();
            } else {
                loginEmail?.focus();
            }
        }, 120);
    }

    function closeLoginModal() {
        if (!loginModal) return;
        loginModal.classList.remove('is-visible');
        document.removeEventListener('keydown', handleEscape, true);
        closeLoginTimer = window.setTimeout(() => {
            loginModal.hidden = true;
        }, 220);

        if (lastFocus && typeof lastFocus.focus === 'function') {
            window.setTimeout(() => lastFocus.focus(), 230);
        }
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            updateStrength(passwordInput.value);
        });
    }

    if (confirmInput) {
        confirmInput.addEventListener('input', () => {
            if (!passwordInput) return;
            if (confirmInput.value && confirmInput.value !== passwordInput.value) {
                confirmInput.setCustomValidity('Passwords do not match.');
            } else {
                confirmInput.setCustomValidity('');
            }
        });
    }

    if (accountForm) {
        accountForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            clearMessage(registerMessage);

            const formData = new FormData(accountForm);
            const fullName = String(formData.get('fullName') || '').trim();
            const email = String(formData.get('email') || '').trim();

            try {
                const response = await postWithEndpointFallback('register.php', () => ({
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: new FormData(accountForm)
                }));

                const data = await parseJsonResponse(response);
                if (!data.success) {
                    showMessage(registerMessage, data.error || data.message || 'Registration failed.', 'error');
                    return;
                }

                setVerificationContext(email, fullName);
                showStage(2);
                clearMessage(verifyMessage);
                if (codeInput) {
                    codeInput.value = '';
                }

                if (data.emailSent === false) {
                    showMessage(verifyMessage, data.message || 'Account created, but code email has not arrived yet. Please use resend.', 'warning');
                } else {
                    showMessage(verifyMessage, 'Account created. Please check your inbox for the verification code.', 'success');
                }

                startCountdown(60);
                verifyEmailInput?.focus();
            } catch (_error) {
                showMessage(registerMessage, 'Server error. Please try again.', 'error');
            }
        }, true);
    }

    if (verifyForm) {
        verifyForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            clearMessage(verifyMessage);

            const email = (verifyEmailInput ? verifyEmailInput.value : accountData.email || '').trim();
            const codeValue = codeInput ? codeInput.value.trim() : '';

            if (!email || !codeValue) {
                showMessage(verifyMessage, 'Please enter your email and verification code.', 'error');
                return;
            }

            if (!/^\d{6}$/.test(codeValue)) {
                showMessage(verifyMessage, 'Enter the 6-digit code from your inbox.', 'error');
                return;
            }

            showMessage(verifyMessage, 'Verifying...', 'info');

            try {
                const response = await postWithEndpointFallback('verify_code.php', () => ({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: new URLSearchParams({ email, code: codeValue }).toString()
                }));

                const data = await parseJsonResponse(response);
                if (!data.success) {
                    showMessage(verifyMessage, data.message || data.error || 'Verification failed.', 'error');
                    return;
                }

                stopCountdown();
                setVerificationContext(email, accountData.fullName);
                markAccountVerified({ fullName: accountData.fullName, email });
                showMessage(verifyMessage, data.message || 'Email verified successfully.', 'success');
                showStage(3);
            } catch (_error) {
                showMessage(verifyMessage, 'Network error. Please try again.', 'error');
            }
        }, true);
    }

    resendBtn?.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        clearMessage(verifyMessage);
        const email = (verifyEmailInput ? verifyEmailInput.value : accountData.email || '').trim();

        if (!email) {
            showMessage(verifyMessage, 'Please enter your email address first.', 'error');
            verifyEmailInput?.focus();
            return;
        }

        resendBtn.disabled = true;
        const oldLabel = resendBtn.textContent;
        resendBtn.textContent = 'Sending...';

        try {
            const response = await postWithEndpointFallback('verify_code.php', () => ({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: new URLSearchParams({ resend: '1', email }).toString()
            }));

            const data = await parseJsonResponse(response);
            if (!data.success) {
                showMessage(verifyMessage, data.message || 'Could not resend code.', 'error');
                resendBtn.disabled = false;
                return;
            }

            showMessage(verifyMessage, data.message || 'Verification code resent. Please check your email.', 'success');
            startCountdown(60);
        } catch (_error) {
            showMessage(verifyMessage, 'Network error. Please try again.', 'error');
            resendBtn.disabled = false;
        } finally {
            resendBtn.textContent = oldLabel || 'Resend code';
        }
    }, true);

    loginTrigger?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        openLoginModal('');
    }, true);

    openLoginAfterRegister?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        openLoginModal(accountData.email || (verifyEmailInput ? verifyEmailInput.value.trim() : ''));
    }, true);

    loginModal?.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        if (target.hasAttribute('data-auth-close') || target.closest('[data-auth-close]')) {
            event.preventDefault();
            event.stopImmediatePropagation();
            closeLoginModal();
        }
    }, true);

    loginForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        if (!loginEmail || !loginPassword) return;
        toggleLoginMessage('', '');

        const emailValue = loginEmail.value.trim().toLowerCase();
        const passwordValue = loginPassword.value;

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailValue)) {
            toggleLoginMessage('Enter a valid email to continue.', 'error');
            loginEmail.focus();
            return;
        }

        if (!passwordValue.trim()) {
            toggleLoginMessage('Please enter your password.', 'error');
            loginPassword.focus();
            return;
        }

        try {
            const response = await postWithEndpointFallback('loginn.php', () => ({
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: new URLSearchParams({
                    loginEmail: emailValue,
                    loginPassword: passwordValue
                }).toString()
            }));

            const data = await parseJsonResponse(response);
            if (!data.success) {
                toggleLoginMessage(data.message || 'Sorry, login failed. Please check your details and try again.', 'error');
                return;
            }

            markAccountVerified({
                fullName: data.name || accountData.fullName || '',
                email: data.email || emailValue
            });

            toggleLoginMessage(data.message || 'Login successful. Redirecting...', 'success');
            window.setTimeout(() => {
                closeLoginModal();
                window.location.href = 'placement.php';
            }, 700);
        } catch (_error) {
            toggleLoginMessage('Network error. Please try again.', 'error');
        }
    }, true);

    // URL-driven helpers
    try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('verify') === '1') {
            showStage(2);
            const email = params.get('email') || '';
            if (email) {
                setVerificationContext(email, accountData.fullName);
            }
        }

        if (params.get('showLogin') === '1') {
            openLoginModal('');
        }
    } catch (_error) {
        // no-op
    }
})();
