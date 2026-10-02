// register-verify.js
// Handles auto-advancing to the final step if ?verified=1 is present in the URL

document.addEventListener('DOMContentLoaded', function() {
    // Only run on register.html
    if (!window.location.pathname.endsWith('register.html')) return;

    const urlParams = new URLSearchParams(window.location.search);
    const verified = urlParams.get('verified');
    const verify = urlParams.get('verify');
    const email = urlParams.get('email');

    // Step elements
    const stageAccount = document.getElementById('registerStageAccount');
    const stageVerify = document.getElementById('registerStageVerify');
    const stageComplete = document.getElementById('registerStageComplete');
    const progressSteps = document.querySelectorAll('.progress-step');

    // If redirected after registration, show verify step and pre-fill email
    if (verify === '1') {
        if (stageAccount) stageAccount.hidden = true;
        if (stageComplete) stageComplete.hidden = true;
        if (stageVerify) {
            stageVerify.hidden = false;
            // Pre-fill email if available
            var emailInput = document.getElementById('verifyEmail');
            if (emailInput && email) emailInput.value = email;
            // Progress bar
            if (progressSteps[0]) progressSteps[0].classList.remove('is-active');
            if (progressSteps[1]) progressSteps[1].classList.add('is-active');
            if (progressSteps[2]) progressSteps[2].classList.remove('is-active');
        }
        return;
    }

    if (verified === '1') {
        // Hide other steps, show complete
        if (stageAccount) stageAccount.hidden = true;
        if (stageVerify) stageVerify.hidden = true;
        if (stageComplete) {
            stageComplete.hidden = false;
            // Optionally, update the progress bar
            if (progressSteps[0]) progressSteps[0].classList.remove('is-active');
            if (progressSteps[1]) progressSteps[1].classList.remove('is-active');
            if (progressSteps[2]) progressSteps[2].classList.add('is-active');
        }
    } else if (verified === '0') {
        // Optionally, show an error message on the verify step
        if (stageAccount) stageAccount.hidden = true;
        if (stageComplete) stageComplete.hidden = true;
        if (stageVerify) {
            stageVerify.hidden = false;
            // Show error message
            var msg = document.getElementById('verifyMessage');
            if (msg) {
                msg.textContent = 'Verification failed. Please check your email and code.';
                msg.hidden = false;
                msg.style.color = '#e74c3c';
            }
            // Optionally, update the progress bar
            if (progressSteps[0]) progressSteps[0].classList.remove('is-active');
            if (progressSteps[1]) progressSteps[1].classList.add('is-active');
            if (progressSteps[2]) progressSteps[2].classList.remove('is-active');
        }
    }
});

