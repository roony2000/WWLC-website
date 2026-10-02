// save_results_hook.js
// Plan B: Standalone hook for exam completion POST

document.addEventListener('DOMContentLoaded', function () {
    var finishBtn = document.getElementById('submitWriting');
    if (!finishBtn) {
        console.warn('Exam completion button not found!');
        return;
    }
    finishBtn.addEventListener('click', function (e) {
        var formData = new URLSearchParams();
        // Send all answers as q1, q2, ..., q50 (try DOM first, fallback to window.responses)
        var answerInputs = document.querySelectorAll('[name^="question-"]:checked');
        if (answerInputs.length > 0) {
            answerInputs.forEach(function(input, idx) {
                formData.append('q' + (idx + 1), input.value || '');
            });
        } else if (window.responses && Array.isArray(window.responses)) {
            for (var i = 0; i < window.responses.length; i++) {
                formData.append('q' + (i + 1), window.responses[i] || '');
            }
        }
        // Send writing_prompt and writing_response (try DOM first, fallback to window)
        var writingPromptEl = document.querySelector('[data-prompt], .writing-prompt, #writingPrompt');
        var writingResponseEl = document.querySelector('textarea, input[type="text"]');
        var writing_prompt = '';
        var writing_response = '';
        if (writingPromptEl) {
            writing_prompt = writingPromptEl.value || writingPromptEl.innerText || '';
        } else if (window.activePrompt) {
            writing_prompt = window.activePrompt;
        }
        if (writingResponseEl) {
            writing_response = writingResponseEl.value || '';
        } else if (window.writingDrafts && window.activePrompt) {
            writing_response = window.writingDrafts[window.activePrompt] || '';
        }
        formData.append('writing_prompt', writing_prompt);
        formData.append('writing_response', writing_response);

        // fetch('exam_submit.php', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/x-www-form-urlencoded',
        //     },
        //     body: formData
        // })
        // .then(function (resp) { return resp.text(); })
        // .then(function (data) {
        //     console.log('[save_results_hook] exam_submit.php response:', data);
        // })
        // .catch(function (err) {
        //     console.error('[save_results_hook] Error submitting exam results:', err);
        // });
    });
});

