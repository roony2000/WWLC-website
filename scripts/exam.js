    // Submits grammar_score and writing_text to exam_submit.php
    async function submitExamResults() {
        // Prepare answers as q1, q2, ...
        let formData = new URLSearchParams();
        if (Array.isArray(responses)) {
            responses.forEach((val, idx) => {
                formData.append('q' + (idx + 1), val || '');
            });
        }
        // Get writing prompt and response
        let writing_prompt = '';
        let writing_response = '';
        if (typeof WRITING_PROMPTS === 'object' && activePrompt && WRITING_PROMPTS[activePrompt]) {
            writing_prompt = WRITING_PROMPTS[activePrompt].prompt || '';
        } else if (activePrompt) {
            writing_prompt = activePrompt;
        }
        if (typeof writingDrafts === 'object' && activePrompt) {
            writing_response = writingDrafts[activePrompt] || '';
        }
        formData.append('writing_prompt', writing_prompt);
        formData.append('writing_response', writing_response);
        try {
            const resp = await fetch('exam_submit.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });
            const data = await resp.text();
            console.log('exam_submit.php response:', data);
        } catch (e) {
            console.error('Error submitting exam results:', e);
        }
    }

(function(){
    const search = new URLSearchParams(window.location.search);
    const track = search.get('track') || 'adult';
    const ACCOUNT_STATUS_KEY = 'wwlcAccountStatus';

    function isAccountVerified(){
        try {
            const raw = localStorage.getItem(ACCOUNT_STATUS_KEY);
            if (!raw) return false;
            const parsed = JSON.parse(raw);
            return Boolean(parsed && parsed.verified === true);
        } catch (error){
            console.warn('Unable to read account verification status', error);
            return false;
        }
    }

    // Always block access if not verified, even if user navigates directly
    if (!isAccountVerified()) {
        alert('You must create an account and be logged in to take the exam.');
        const nextTarget = `exam.html${window.location.search || ''}`;
        const redirectUrl = `register.html?next=${encodeURIComponent(nextTarget)}`;
        window.location.replace(redirectUrl);
        return;
    }

    const STORAGE_KEYS = {
        profile: 'wwlcExamProfile',
        pledge: 'wwlcExamPledge',
        speakingPassport: 'wwlcExamSpeakingPassport',
        timerDeadline: 'wwlcExamTimerDeadline',
        timerPosition: 'wwlcExamTimerPosition'
    };

    const TRACK_STORAGE_KEYS = {
        profile: `${STORAGE_KEYS.profile}:${track}`,
        pledge: `${STORAGE_KEYS.pledge}:${track}`,
        timerDeadline: `${STORAGE_KEYS.timerDeadline}:${track}`,
        timerPosition: `${STORAGE_KEYS.timerPosition}:${track}`
    };

    const QUESTIONS = {
        adult: {
            sectionLabel: 'Adult · Section A',
            questions: [
                { text: 'Did you ___ anywhere interesting last weekend?', options: ['go', 'going', 'was', 'went'], answers: ['a'] },
                { text: 'I work as a teacher and my wife ____ too.', options: ['do', 'is', 'work', 'does'], answers: ['d'] },
                { text: 'I think ___ taxi driver.', options: ['her job is', "she's a", 'her job is an', "she's"], answers: ['b'] },
                { text: 'What is your home town ____?', options: ['situated', 'age', 'like', 'located'], answers: ['c'] },
                { text: "I'm afraid I ____ here for your birthday party.", options: ['have not to be', 'am not being', 'will be not', "can't be"], answers: ['d'] },
                { text: 'How ___ are you?', options: ['high', 'wide', 'long', 'heavy'], answers: ['d'] },
                { text: 'How long ___ married?', options: ['have you been', 'are you', 'have you', 'been'], answers: ['a'] },
                { text: 'Would you like ___ help?', options: ['a', 'some', 'me', 'I'], answers: ['b'] },
                { text: 'They ___ go to the cinema', options: ['tomorrow', 'much', 'rare', 'seldom'], answers: ['d'] },
                { text: "He hasn't played since he ___ the accident.", options: ['had', 'has had', 'has', 'had had'], answers: ['a'] },
                { text: "This is the best tea I've ___ tasted.", options: ['never', 'ever', 'already', 'still'], answers: ['b'] },
                { text: "I'm looking ___ the summer holidays.", options: ['before', 'forward', 'for', 'forward to'], answers: ['b'] },
                { text: 'My girlfriend ___ born on the 2nd of September 1974.', options: ['is', 'was', 'had', 'has been'], answers: ['b'] },
                { text: 'This beer tastes ___.', options: ['badly', 'lovely', 'well', 'normally'], answers: ['b'] },
                { text: "In life ___ can make a mistake; we're all human.", options: ['anyone', 'some people', 'not anybody', 'someone'], answers: ['a'] },
                { text: 'She knows that she ___ to pay now.', options: ['had better', "needn't", 'should', 'ought'], answers: ['d'] },
                { text: "If he ___ about it, I'm sure he'd help.", options: ['had know', 'knew', 'has known', 'knows'], answers: ['b'] },
                { text: "I'll return the newspaper when I ___ through it.", options: ['will have looked', 'looked', 'have looked', 'look'], answers: ['c'] },
                { text: "They said they ___ come, but they didn't.", options: ['can', 'will', 'may', 'might'], answers: ['d', 'b'] },
                { text: 'They were ___ hard questions that I had no chance.', options: ['so', 'some', 'such', 'quite'], answers: ['c'] },
                { text: "I don't have a cent to give you. I ___ bought a new computer.", options: ['just buy', 'had just bought', "I've just", 'soon will'], answers: ['c'] },
                { text: 'Mum gave ___ her job when I was born.', options: ['in', 'up', 'off', 'away'], answers: ['b'] },
                { text: "It's all right, we ___ hurry. We have plenty of time.", options: ["mustn't", "shouldn't", "can't", "needn't"], answers: ['d'] },
                { text: 'You have a terrible fever! ___ call a doctor?', options: ['Shall I', 'Do I', 'Must I', 'Will I'], answers: ['a'] },
                { text: 'Joanna looks ___ in her new dress.', options: ['nice', 'nicely', 'like nice', 'such nice'], answers: ['a'] },
                { text: 'Mr. Haines wants ___ to his office.', options: ['that you come', 'you come to', 'you come', 'to come'], answers: ['d'] },
                { text: 'There are ___ around to start a cricket team.', options: ['enough young boys', 'boys enough young', 'young boys enough', 'enough youngest boys'], answers: ['a'] },
                { text: 'These bottles ___ of plastic.', options: ['are making', 'are make', 'are made', 'made are'], answers: ['c'] },
                { text: 'Do you know where ___?', options: ['did I put the keys', 'put I the keys', 'I put the keys', 'I the keys put'], answers: ['a', 'c'] },
                { text: 'Magda knows a lot about badgers, but she ___ a live one.', options: ["doesn't ever see", "hasn't ever seen", "hasn't ever saw", "didn't ever see"], answers: ['b'] },
                { text: 'We wash the curtains ___ year.', options: ['three times a', 'once', 'three every', 'every couple'], answers: ['a'] },
                { text: "The loudspeakers won't work unless you ___ those cables.", options: ['connected', 'connect', "don't connect", "can't connect"], answers: ['b'] },
                { text: 'You should give ___.', options: ['to your mother this letter', 'this letter your mother', 'letter this to your mother', 'this letter to your mother'], answers: ['d'] },
                { text: 'Marian has ___ old books.', options: ['very much', 'a lot of', 'lots', 'a very lot'], answers: ['b'] },
                { text: 'Hania has got two children, ___?', options: ["hasn't she", 'has she got', 'has she', "haven't she"], answers: ['a'] },
                { text: "Let's think ___ something nice.", options: ['after', 'about', 'for', 'to'], answers: ['b'] },
                { text: 'A Jaguar is ___ than a Fiat.', options: ['more expensive', 'expensiver', 'much expensive', 'expensive'], answers: ['a'] },
                { text: "The TV's too loud. Please, ___.", options: ['it turn down', 'turn it up', 'turn it down', 'turn down it'], answers: ['c'] },
                { text: "It's a pity you ___ here last night.", options: ["weren't", "aren't", "'ll not be", "'d not be"], answers: ['a'] },
                { text: 'What about ___ for a walk?', options: ['to go', 'I going', 'going', 'go'], answers: ['c'] },
                { text: 'I made one or two mistakes, but ___ of my answers were correct.', options: ['much', 'most', 'more', 'few'], answers: ['b'] },
                { text: "You can't cross the road when the light ___ red.", options: ["'ll be", 'was', 'were', 'is'], answers: ['d'] },
                { text: 'I have a problem. ___ help me please?', options: ['Could you', 'Should you', 'Were you able to', 'Will you able to'], answers: ['a'] },
                { text: 'Our neighbour is ___ to Ireland.', options: ['going travel', 'going to travelling', 'go', 'going to travel'], answers: ['d'] },
                { text: 'Do penguins fly? No, they ___.', options: ["aren't", "haven't", "don't", "won't"], answers: ['c'] },
                { text: '___ train are you taking, the express to Poznan or to Skwierzyna?', options: ['Which', 'How', 'Whose', 'Who'], answers: ['a'] },
                { text: 'This is ___ story.', options: ['a very interesting', 'very an interesting', 'very interesting', 'very interested'], answers: ['a'] },
                { text: 'Marta takes the dog for a walk ___ the evening.', options: ['in', 'at', 'on', 'to'], answers: ['a'] },
                { text: "We haven't got ___ Polish friends.", options: ['no', 'any', 'none', 'some'], answers: ['b'] },
                { text: "Simon can't ___ to you now. He's busy.", options: ['talked', 'to talk', 'talking', 'talk'], answers: ['d'] }
            ]
        },
        kids: {
            sectionLabel: 'Kids · Section A',
            heading: 'Section A · Choose the correct answer',
            sublead: 'Choose the correct answer for each question. You can move around before you finish.',
            summaryPill: 'Next · Section B',
            summaryTail: ' questions. Your responses unlock Section B.',
            nextButtonLabel: 'Start Section B',
            nextButtonHref: '#examStage',
            submitButtonLabel: 'Submit Section A',
            questions: [
                {
                    text: 'Which picture shows the number five?',
                    options: [
                        { image: 'assets/images/question1a.png' },
                        { image: 'assets/images/question1b.png' },
                        { image: 'assets/images/question1c.png' }
                    ],
                    answers: ['b']
                },
                {
                    text: 'Which picture shows a pencil?',
                    options: [
                        { image: 'assets/images/question2a.png' },
                        { image: 'assets/images/question2b.png' },
                        { image: 'assets/images/question2c.png' }
                    ],
                    answers: ['a']
                },
                {
                    text: 'Which picture shows a ball?',
                    options: [
                        { image: 'assets/images/question3a.png' },
                        { image: 'assets/images/question3b.png' },
                        { image: 'assets/images/question3c.png' }
                    ],
                    answers: ['c']
                },
                {
                    text: 'Where is the big dog?',
                    options: [
                        { image: 'assets/images/question4a.png' },
                        { image: 'assets/images/question4b.png' },
                        { image: 'assets/images/question4c.png' }
                    ],
                    answers: ['c']
                },
                {
                    text: 'Which picture shows eyes?',
                    options: [
                        { image: 'assets/images/question5a.png' },
                        { image: 'assets/images/question5b.png' },
                        { image: 'assets/images/question5c.png' }
                    ],
                    answers: ['a']
                },
                {
                    text: 'Which picture matches “I’ve got a long tail”?',
                    options: [
                        { image: 'assets/images/question6a.png' },
                        { image: 'assets/images/question6b.png' },
                        { image: 'assets/images/question6c.png' }
                    ],
                    answers: ['b']
                },
                {
                    text: 'Which picture shows socks?',
                    options: [
                        { image: 'assets/images/question7a.png' },
                        { image: 'assets/images/question7b.png' },
                        { image: 'assets/images/question7c.png' }
                    ],
                    answers: ['c']
                },
                {
                    text: 'Which picture matches “I can’t ride a bike”?',
                    options: [
                        { image: 'assets/images/question8a.png' },
                        { image: 'assets/images/question8b.png' },
                        { image: 'assets/images/question8c.png' }
                    ],
                    answers: ['a']
                },
                {
                    text: 'Which picture shows a bedroom?',
                    options: [
                        { image: 'assets/images/question9a.png' },
                        { image: 'assets/images/question9b.png' },
                        { image: 'assets/images/question9c.png' }
                    ],
                    answers: ['b']
                },
                {
                    text: 'Which picture matches “I like ice cream”?',
                    options: [
                        { image: 'assets/images/question10a.png' },
                        { image: 'assets/images/question10b.png' },
                        { image: 'assets/images/question10c.png' }
                    ],
                    answers: ['c']
                },
                {
                    text: 'Which picture shows the number eighteen?',
                    options: [
                        { image: 'assets/images/question11a.png' },
                        { image: 'assets/images/question11b.png' },
                        { image: 'assets/images/question11c.png' }
                    ],
                    answers: ['b']
                },
                {
                    text: 'Which picture matches “These are kites”?',
                    options: [
                        { image: 'assets/images/question12a.png' },
                        { image: 'assets/images/question12b.png' },
                        { image: 'assets/images/question12c.png' }
                    ],
                    answers: ['b']
                },
                {
                    text: 'Which picture shows a lamp?',
                    options: [
                        { image: 'assets/images/question13a.png' },
                        { image: 'assets/images/question13b.png' },
                        { image: 'assets/images/question13c.png' }
                    ],
                    answers: ['a']
                },
                {
                    text: 'Which picture matches “They’re eating fruit”?',
                    options: [
                        { image: 'assets/images/question14a.png' },
                        { image: 'assets/images/question14b.png' },
                        { image: 'assets/images/question14c.png' }
                    ],
                    answers: ['b']
                },
                {
                    text: 'Which picture shows juice?',
                    options: [
                        { image: 'assets/images/question15a.png' },
                        { image: 'assets/images/question15b.png' },
                        { image: 'assets/images/question15c.png' }
                    ],
                    answers: ['a']
                },
                {
                    text: 'Which picture matches “It can swim and jump”?',
                    options: [
                        { image: 'assets/images/question16a.png' },
                        { image: 'assets/images/question16b.png' },
                        { image: 'assets/images/question16c.png' }
                    ],
                    answers: ['c']
                },
                {
                    text: 'Which picture shows badminton?',
                    options: [
                        { image: 'assets/images/question17a.png' },
                        { image: 'assets/images/question17b.png' },
                        { image: 'assets/images/question17c.png' }
                    ],
                    answers: ['a']
                },
                {
                    text: 'Which picture matches “There is a shop between the hospital and café”?',
                    options: [
                        { image: 'assets/images/question18a.png' },
                        { image: 'assets/images/question18b.png' },
                        { image: 'assets/images/question18c.png' }
                    ],
                    answers: ['c']
                },
                {
                    text: 'Which picture shows grandparents?',
                    options: [
                        { image: 'assets/images/question19a.png' },
                        { image: 'assets/images/question19b.png' },
                        { image: 'assets/images/question19c.png' }
                    ],
                    answers: ['b']
                },
                {
                    text: 'Which picture matches “She’s getting dressed”?',
                    options: [
                        { image: 'assets/images/question20a.png' },
                        { image: 'assets/images/question20b.png' },
                        { image: 'assets/images/question20c.png' }
                    ],
                    answers: ['b']
                },
                {
                    text: 'Which picture shows the number fifty?',
                    options: [
                        { image: 'assets/images/question21a.png' },
                        { image: 'assets/images/question21b.png' },
                        { image: 'assets/images/question21c.png' }
                    ],
                    answers: ['c']
                },
                {
                    text: 'Which picture matches “He works on a farm”?',
                    options: [
                        { image: 'assets/images/question22a.png' },
                        { image: 'assets/images/question22b.png' },
                        { image: 'assets/images/question22c.png' }
                    ],
                    answers: ['c']
                },
                {
                    text: 'Which picture shows backache?',
                    options: [
                        { image: 'assets/images/question23a.png' },
                        { image: 'assets/images/question23b.png' },
                        { image: 'assets/images/question23c.png' }
                    ],
                    answers: ['a']
                },
                {
                    text: 'Which picture matches “He’s very strong”?',
                    options: [
                        { image: 'assets/images/question24a.png' },
                        { image: 'assets/images/question24b.png' },
                        { image: 'assets/images/question24c.png' }
                    ],
                    answers: ['b']
                },
                {
                    text: 'Which picture shows snow?',
                    options: [
                        { image: 'assets/images/question25a.png' },
                        { image: 'assets/images/question25b.png' },
                        { image: 'assets/images/question25c.png' }
                    ],
                    answers: ['a']
                }
            ],
            nextSection: {
                sectionLabel: 'Kids · Section B',
                heading: 'Section B · Choose the correct description',
                sublead: 'Look at each picture and pick the sentence that matches.',
                summaryPill: 'Placement exam complete',
                summaryTail: ' questions. Your responses are saved for our academic team.',
                nextButtonLabel: 'Submit placement exam',
                nextButtonHref: '#examComplete',
                submitButtonLabel: 'Submit Section B',
                questions: [
                    {
                        text: 'Which sentence describes the picture?',
                        promptImage: { src: 'assets/images/question26.png', alt: 'Illustration for question 26' },
                        options: [
                            { text: "She's exciting" },
                            { text: "She's difficult" },
                            { text: "She's busy" }
                        ],
                        answers: ['c']
                    },
                    {
                        text: 'Which sentence describes the picture?',
                        promptImage: { src: 'assets/images/question27.png', alt: 'Illustration for question 27' },
                        options: [
                            { text: "He's running quickly" },
                            { text: "He's running good" },
                            { text: "He's running quick" }
                        ],
                        answers: ['a']
                    },
                    {
                        text: 'Which sentence describes the picture?',
                        promptImage: { src: 'assets/images/question28.png', alt: 'Illustration for question 28' },
                        options: [
                            { text: "She go to the doctor's yesterday" },
                            { text: "She goed to the doctor's yesterday" },
                            { text: "She went to the doctor's yesterday" }
                        ],
                        answers: ['c']
                    },
                    {
                        text: 'Which sentence describes the picture?',
                        promptImage: { src: 'assets/images/question29.png', alt: 'Illustration for question 29' },
                        options: [
                            { text: 'Twelve' },
                            { text: 'Twelfth' },
                            { text: 'Twelveth' }
                        ],
                        answers: ['b']
                    },
                    {
                        text: 'Which sentence describes the picture?',
                        promptImage: { src: 'assets/images/question30.png', alt: 'Illustration for question 30' },
                        options: [
                            { text: 'I could read when I was six' },
                            { text: "I couldn't read when I am six" },
                            { text: 'I can read when I was six' }
                        ],
                        answers: ['a']
                    },
                    {
                        text: 'Which sentence describes the picture?',
                        promptImage: { src: 'assets/images/question31.png', alt: 'Illustration for question 31' },
                        options: [
                            { text: 'The horse is thirsty than the dog' },
                            { text: 'The horse is thirstier than the dog' },
                            { text: 'The horse is thirstier then the dog' }
                        ],
                        answers: ['b']
                    },
                    {
                        text: 'Which sentence describes the picture?',
                        promptImage: { src: 'assets/images/question32.png', alt: 'Illustration for question 32' },
                        options: [
                            { text: 'Giraffes are the taller animals in the world' },
                            { text: 'Giraffes are the talles animals in the world' },
                            { text: 'Giraffes are talles than animals in the world' }
                        ],
                        answers: ['b']
                    },
                    {
                        text: 'Which sentence describes the picture?',
                        promptImage: { src: 'assets/images/question33.png', alt: 'Illustration for question 33' },
                        options: [
                            { text: "He didn't ate sandwiches for dinner" },
                            { text: 'He not eat sandwiches for dinner' },
                            { text: "He didn't eat sandwiches for dinner" }
                        ],
                        answers: ['c']
                    },
                    {
                        text: 'Which sentence describes the picture?',
                        promptImage: { src: 'assets/images/question34.png', alt: 'Illustration for question 34' },
                        options: [
                            { text: 'The man walked in the library' },
                            { text: 'The man walked into the library' },
                            { text: 'The man walked on the library' }
                        ],
                        answers: ['b']
                    },
                    {
                        text: 'Which sentence describes the picture?',
                        promptImage: { src: 'assets/images/question35.png', alt: 'Illustration for question 35' },
                        options: [
                            { text: "It's half past two" },
                            { text: "It's quarter past two" },
                            { text: "It's quarter to two" }
                        ],
                        answers: ['c']
                    },
                    {
                        text: 'Which sentence describes the picture?',
                        promptImage: { src: 'assets/images/question36.png', alt: 'Illustration for question 36' },
                        options: [
                            { text: "They're going to catch the bus" },
                            { text: 'They going to catch the bus' },
                            { text: 'They go to catch the bus' }
                        ],
                        answers: ['a']
                    },
                    {
                        text: 'Which sentence describes the picture?',
                        promptImage: { src: 'assets/images/question37.png', alt: 'Illustration for question 37' },
                        options: [
                            { text: 'This is the room which you brush your teeth' },
                            { text: 'This is the room where you brush your teeth' },
                            { text: 'This is the room who you brush your teeth' }
                        ],
                        answers: ['b']
                    },
                    {
                        text: 'Which sentence describes the picture?',
                        promptImage: { src: 'assets/images/question38.png', alt: 'Illustration for question 38' },
                        options: [
                            { text: "He was eat dinner at 8 o'clock" },
                            { text: "He was ate dinner at 8 o'clock" },
                            { text: "He was eating dinner at 8 o'clock" }
                        ],
                        answers: ['c']
                    },
                    {
                        text: 'Which sentence describes the picture?',
                        promptImage: { src: 'assets/images/question39.png', alt: 'Illustration for question 39' },
                        options: [
                            { text: 'The first month of the year is January' },
                            { text: 'The first month of the year is July' },
                            { text: 'The first month of the year is June' }
                        ],
                        answers: ['a']
                    },
                    {
                        text: 'Which sentence describes the picture?',
                        promptImage: { src: 'assets/images/question40.png', alt: 'Illustration for question 40' },
                        options: [
                            { text: 'Is paper made to wood?' },
                            { text: 'Is paper made of wood?' },
                            { text: 'Is paper made in wood?' }
                        ],
                        answers: ['b']
                    },
                    {
                        text: 'Which sentence describes the picture?',
                        promptImage: { src: 'assets/images/question41.png', alt: 'Illustration for question 41' },
                        options: [
                            { text: 'The tea looks like hot' },
                            { text: 'The tea look hot' },
                            { text: 'The tea looks hot' }
                        ],
                        answers: ['c']
                    },
                    {
                        text: 'Which sentence describes the picture?',
                        promptImage: { src: 'assets/images/question42.png', alt: 'Illustration for question 42' },
                        options: [
                            { text: "You shouldn't to carry heavy bags" },
                            { text: "You shouldn't carried heavy bags" },
                            { text: "You shouldn't carry heavy bags" }
                        ],
                        answers: ['c']
                    },
                    {
                        text: 'Which sentence describes the picture?',
                        promptImage: { src: 'assets/images/question43.png', alt: 'Illustration for question 43' },
                        options: [
                            { text: 'She win the match' },
                            { text: "She's won the match" },
                            { text: "She's winned the match" }
                        ],
                        answers: ['b']
                    },
                    {
                        text: 'Which sentence describes the picture?',
                        promptImage: { src: 'assets/images/question44.png', alt: 'Illustration for question 44' },
                        options: [
                            { text: 'Will the rocket go to the moon?' },
                            { text: 'Will the rocket goes to the moon?' },
                            { text: 'Will the rocket going to the moon?' }
                        ],
                        answers: ['a']
                    },
                    {
                        text: 'Which sentence describes the picture?',
                        promptImage: { src: 'assets/images/question45.png', alt: 'Illustration for question 45' },
                        options: [
                            { text: 'They were walked in the forest when they seeing an owl' },
                            { text: "They're walking in the forest when they're seeing an owl" },
                            { text: 'They were walking in the forest when they saw an owl' }
                        ],
                        answers: ['c']
                    },
                    {
                        text: 'Which sentence describes the picture?',
                        promptImage: { src: 'assets/images/question46.png', alt: 'Illustration for question 46' },
                        options: [
                            { text: 'There are enough foods to eat' },
                            { text: 'There is enough food to eat' },
                            { text: 'There are enough food to eat' }
                        ],
                        answers: ['b']
                    },
                    {
                        text: 'Which sentence describes the picture?',
                        promptImage: { src: 'assets/images/question47.png', alt: 'Illustration for question 47' },
                        options: [
                            { text: 'The door bell rang out but no-one was at the door' },
                            { text: 'The door bell rang but anyone was at the door' },
                            { text: 'The door bell rang but everyone was at the door' }
                        ],
                        answers: ['a']
                    },
                    {
                        text: 'Which sentence describes the picture?',
                        promptImage: { src: 'assets/images/question48.png', alt: 'Illustration for question 48' },
                        options: [
                            { text: 'They might need their coats' },
                            { text: 'The door bell rang but anyone was at the door' },
                            { text: 'The door bell rang but everyone was at the door' }
                        ],
                        answers: ['a']
                    },
                    {
                        text: 'Which sentence describes the picture?',
                        promptImage: { src: 'assets/images/question49.png', alt: 'Illustration for question 49' },
                        options: [
                            { text: "He's exited" },
                            { text: "He's afraid" },
                            { text: "He's brave" }
                        ],
                        answers: ['b']
                    },
                    {
                        text: 'Which sentence describes the picture?',
                        promptImage: { src: 'assets/images/question50.png', alt: 'Illustration for question 50' },
                        options: [
                            { text: "I'm never eating Italian food before" },
                            { text: 'I never eat Italian food before' },
                            { text: "I've never eaten Italian food before" }
                        ],
                        answers: ['c']
                    }
                ]
            }
        }
    };

    const isKidsTrack = track === 'kids';
    const kidsSectionAConfig = isKidsTrack ? QUESTIONS.kids : null;
    const kidsSectionBConfig = isKidsTrack ? kidsSectionAConfig?.nextSection || null : null;
    let sectionConfig = isKidsTrack ? kidsSectionAConfig : QUESTIONS.adult;
    let totalQuestions = sectionConfig && Array.isArray(sectionConfig.questions) ? sectionConfig.questions.length : 0;
    let currentSectionKey = 'A';

    const elements = {
        trackLabel: document.getElementById('trackLabel'),
        questionNumber: document.getElementById('questionNumber'),
        questionText: document.getElementById('questionText'),
        optionsForm: document.getElementById('optionsForm'),
        prevBtn: document.getElementById('prevBtn'),
        nextBtn: document.getElementById('nextBtn'),
        markForReview: document.getElementById('markForReview'),
        examProgressFill: document.getElementById('examProgressFill'),
        examCurrent: document.getElementById('examCurrent'),
        examTotal: document.getElementById('examTotal'),
        examGrid: document.getElementById('examGrid'),
        completedCount: document.getElementById('completedCount'),
        toggleReview: document.getElementById('toggleReview'),
        examStage: document.getElementById('examStage'),
        examSummary: document.getElementById('examSummary'),
        examSummaryAnswered: document.getElementById('summaryAnswered'),
        examSummaryTotal: document.getElementById('summaryTotal'),
        examShell: document.querySelector('.exam-shell'),
        questionCard: document.getElementById('questionCard'),
        continueToWriting: document.getElementById('continueToWriting'),
        writingSection: document.getElementById('writing'),
            intakeSection: document.getElementById('examIntake'),
            intakeForm: document.getElementById('examIntakeForm'),
            intakeAlert: document.getElementById('examIntakeAlert'),
            intakeFields: {
                name: document.getElementById('intakeName'),
                email: document.getElementById('intakeEmail'),
                location: document.getElementById('intakeLocation'),
                address: document.getElementById('intakeAddress')
            },
        writingResponse: document.getElementById('writingResponse'),
        wordCount: document.getElementById('wordCount'),
        writingCountLabel: document.getElementById('writingCountLabel'),
        writingAlert: document.getElementById('writingAlert'),
        submitWriting: document.getElementById('submitWriting'),
        examComplete: document.getElementById('examComplete'),
        examSummarySection: document.getElementById('examSummary'),
        writingChoiceButtons: document.querySelectorAll('.writing-choice-btn'),
        writingPromptCards: document.querySelectorAll('.writing-prompt-card'),
        writingResponseHint: document.getElementById('writingResponseHint'),
        writingResponseLabel: document.getElementById('writingResponseLabel'),
        clearWriting: document.getElementById('clearWriting'),
        writingResponseWrapper: document.querySelector('.writing-response'),
        pledgeModal: document.getElementById('examPledgeModal'),
        pledgeCheckbox: document.getElementById('pledgeAgree'),
        pledgeConfirm: document.getElementById('pledgeConfirm'),
        pledgeCancel: document.getElementById('pledgeCancel'),
        pledgeBackdrop: document.getElementById('examPledgeBackdrop'),
        speakingConfirm: document.getElementById('speakingConfirm'),
        speakingConfirmBtn: document.getElementById('speakingConfirmBtn'),
        speakingForm: document.getElementById('speakingConfirmForm'),
        speakingPassport: document.getElementById('speakingPassport'),
        speakingAlert: document.getElementById('speakingAlert'),
        speakingSuccess: document.getElementById('speakingSuccess'),
        examSectionPill: document.querySelector('.exam-section-pill'),
        sectionHeading: document.querySelector('.exam-stage-head h1'),
        examSublead: document.querySelector('.exam-sublead'),
        summaryPill: document.querySelector('.exam-summary-pill'),
        summaryDescription: document.querySelector('.exam-summary-content p'),
        timeoutModal: document.getElementById('examTimeoutModal'),
        timeoutBackdrop: document.getElementById('examTimeoutBackdrop'),
        timeoutClose: document.getElementById('examTimeoutClose'),
        timeoutAck: document.getElementById('examTimeoutAcknowledge'),
        timeoutSupport: document.getElementById('examTimeoutSupport')
    };

    const hasIntakeStep = Boolean(elements.intakeForm);

    const defaultExamSectionPill = elements.examSectionPill ? elements.examSectionPill.textContent : '';
    const defaultSectionHeading = elements.sectionHeading ? elements.sectionHeading.textContent : '';
    const defaultExamSublead = elements.examSublead ? elements.examSublead.textContent : '';
    const defaultSummaryPillText = elements.summaryPill ? elements.summaryPill.textContent : '';
    const defaultContinueLabel = elements.continueToWriting ? elements.continueToWriting.textContent : '';
    const defaultContinueHref = elements.continueToWriting ? elements.continueToWriting.getAttribute('href') || '#writing' : '#writing';

    let summaryTailNode = null;
    let defaultSummaryTail = '';
    if (elements.summaryDescription) {
        const nodes = Array.from(elements.summaryDescription.childNodes).reverse();
        summaryTailNode = nodes.find((node) => node.nodeType === Node.TEXT_NODE) || null;
        if (summaryTailNode) {
            defaultSummaryTail = summaryTailNode.textContent;
        }
    }

    const TIMER_DURATION_MS = 60 * 60 * 1000;
    let examTimerInstance = null;
    let timerExpired = false;
    let examClosed = false;

    // Draggable countdown timer displayed during the exam journey.
    class FloatingExamTimer {
        constructor(options = {}) {
            this.durationMs = options.durationMs || TIMER_DURATION_MS;
            this.initialDeadline = typeof options.initialDeadline === 'number' ? options.initialDeadline : null;
            this.onExpire = typeof options.onExpire === 'function' ? options.onExpire : null;
            this.onPositionChange = typeof options.onPositionChange === 'function' ? options.onPositionChange : null;
            this.initialPosition = options.initialPosition || null;
            this.root = this.createRoot();
            this.timeLabel = this.root.querySelector('[data-role="exam-timer-time"]');
            this.progressBar = this.root.querySelector('[data-role="exam-timer-progress"]');
            this.statusLabel = this.root.querySelector('[data-role="exam-timer-status"]');
            this.handleRegion = this.root.querySelector('[data-role="exam-timer-handle"]') || this.root;
            this.dragging = false;
            this.dragOffset = { x: 0, y: 0 };
            this.dragPointerId = null;
            this.endTime = null;
            this.intervalId = null;
            this.remainingMs = this.durationMs;
            this.expired = false;
            this.state = 'idle';
            this.bindEvents();
            this.applyInitialPosition();
            this.updateDisplay(this.durationMs);
        }

        createRoot() {
            const wrapper = document.createElement('div');
            wrapper.className = 'exam-timer';
            wrapper.setAttribute('role', 'timer');
            wrapper.setAttribute('aria-live', 'polite');
            wrapper.setAttribute('aria-atomic', 'true');
            wrapper.tabIndex = 0;

            const header = document.createElement('div');
            header.className = 'exam-timer__header';
            header.dataset.role = 'exam-timer-handle';

            const label = document.createElement('div');
            label.className = 'exam-timer__label';

            const title = document.createElement('p');
            title.className = 'exam-timer__title';
            title.textContent = 'Time Left';

            const subtitle = document.createElement('p');
            subtitle.className = 'exam-timer__subtitle';
            subtitle.textContent = 'Placement exam';

            label.append(title, subtitle);

            const drag = document.createElement('span');
            drag.className = 'exam-timer__drag';
            drag.dataset.role = 'exam-timer-drag';
            drag.setAttribute('aria-hidden', 'true');

            header.append(label, drag);

            const time = document.createElement('p');
            time.className = 'exam-timer__time';
            time.dataset.role = 'exam-timer-time';
            time.textContent = '60:00';

            const progress = document.createElement('div');
            progress.className = 'exam-timer__progress';

            const progressBar = document.createElement('span');
            progressBar.className = 'exam-timer__progress-bar';
            progressBar.dataset.role = 'exam-timer-progress';
            progress.append(progressBar);

            const footer = document.createElement('div');
            footer.className = 'exam-timer__footer';

            const badge = document.createElement('span');
            badge.className = 'exam-timer__badge';
            badge.textContent = '1 hour';

            const status = document.createElement('span');
            status.className = 'exam-timer__status';
            status.dataset.role = 'exam-timer-status';
            status.textContent = 'Ready';

            footer.append(badge, status);

            wrapper.append(header, time, progress, footer);
            return wrapper;
        }

        bindEvents() {
            this.handlePointerDown = (event) => {
                if (!event.isPrimary) {
                    return;
                }
                if (event.pointerType === 'mouse' && typeof event.button === 'number' && event.button !== 0) {
                    return;
                }
                this.dragging = true;
                this.root.classList.add('is-dragging');
                this.dragPointerId = event.pointerId;
                const rect = this.root.getBoundingClientRect();
                this.dragOffset = {
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top
                };
                this.root.style.right = 'auto';
                this.root.style.bottom = 'auto';
                if (typeof this.handleRegion.setPointerCapture === 'function') {
                    this.handleRegion.setPointerCapture(event.pointerId);
                }
                window.addEventListener('pointermove', this.handlePointerMove);
                window.addEventListener('pointerup', this.handlePointerUp);
                window.addEventListener('pointercancel', this.handlePointerUp);
                event.preventDefault();
            };
            this.handlePointerMove = (event) => {
                if (!this.dragging || event.pointerId !== this.dragPointerId) {
                    return;
                }
                const nextLeft = event.clientX - this.dragOffset.x;
                const nextTop = event.clientY - this.dragOffset.y;
                const clamped = this.clampWithinViewport(nextLeft, nextTop);
                this.setPosition(clamped.left, clamped.top);
            };
            this.handlePointerUp = (event) => {
                if (!this.dragging || event.pointerId !== this.dragPointerId) {
                    return;
                }
                this.dragging = false;
                this.root.classList.remove('is-dragging');
                if (typeof this.handleRegion.releasePointerCapture === 'function') {
                    try {
                        this.handleRegion.releasePointerCapture(this.dragPointerId);
                    } catch (error) {
                        /* no-op when capture is not set */
                    }
                }
                window.removeEventListener('pointermove', this.handlePointerMove);
                window.removeEventListener('pointerup', this.handlePointerUp);
                window.removeEventListener('pointercancel', this.handlePointerUp);
                const rect = this.root.getBoundingClientRect();
                const clamped = this.clampWithinViewport(rect.left, rect.top);
                this.setPosition(clamped.left, clamped.top);
                if (this.onPositionChange) {
                    this.onPositionChange({
                        left: Math.round(clamped.left),
                        top: Math.round(clamped.top)
                    });
                }
            };
            this.handleResize = () => {
                if (!this.root.isConnected || this.dragging) {
                    return;
                }
                if (this.root.style.left || this.root.style.top) {
                    const rect = this.root.getBoundingClientRect();
                    const clamped = this.clampWithinViewport(rect.left, rect.top);
                    this.setPosition(clamped.left, clamped.top);
                }
            };
            this.handleRegion.addEventListener('pointerdown', this.handlePointerDown);
            window.addEventListener('resize', this.handleResize);
        }

        unbindEvents() {
            this.handleRegion.removeEventListener('pointerdown', this.handlePointerDown);
            window.removeEventListener('pointermove', this.handlePointerMove);
            window.removeEventListener('pointerup', this.handlePointerUp);
            window.removeEventListener('pointercancel', this.handlePointerUp);
            window.removeEventListener('resize', this.handleResize);
        }

        applyInitialPosition() {
            if (!this.initialPosition) {
                return;
            }
            const { left, top } = this.initialPosition;
            if (typeof left === 'number' && typeof top === 'number') {
                this.setPosition(left, top);
            }
        }

        clampWithinViewport(left, top) {
            const padding = 12;
            const width = this.root.offsetWidth || 220;
            const height = this.root.offsetHeight || 120;
            const maxLeft = Math.max(padding, window.innerWidth - width - padding);
            const maxTop = Math.max(padding, window.innerHeight - height - padding);
            return {
                left: Math.min(Math.max(padding, left), maxLeft),
                top: Math.min(Math.max(padding, top), maxTop)
            };
        }

        setPosition(left, top) {
            this.root.style.left = `${left}px`;
            this.root.style.top = `${top}px`;
            this.root.style.right = 'auto';
            this.root.style.bottom = 'auto';
        }

        mount(parent) {
            if (parent && !this.root.isConnected) {
                parent.appendChild(this.root);
            }
        }

        start() {
            if (this.intervalId) {
                return this.endTime;
            }
            const now = Date.now();
            if (!this.endTime) {
                if (this.initialDeadline && this.initialDeadline > 0) {
                    this.endTime = this.initialDeadline;
                } else {
                    this.endTime = now + this.durationMs;
                }
            }
            this.expired = false;
            this.state = 'running';
            this.setStatus('Running');
            this.updateTime();
            if (this.remainingMs > 0) {
                this.intervalId = window.setInterval(() => this.updateTime(), 1000);
            }
            return this.endTime;
        }

        updateTime() {
            if (!this.endTime) {
                return;
            }
            const now = Date.now();
            this.remainingMs = Math.max(0, this.endTime - now);
            this.updateDisplay(this.remainingMs);
            if (this.remainingMs <= 0) {
                this.stopInterval();
                this.handleExpire();
            }
        }

        updateDisplay(remainingMs) {
            if (this.timeLabel) {
                this.timeLabel.textContent = this.formatTime(remainingMs);
            }
            if (this.progressBar) {
                const ratio = this.durationMs ? Math.max(0, remainingMs / this.durationMs) : 0;
                this.progressBar.style.transform = `scaleX(${ratio})`;
            }
            this.root.setAttribute('aria-valuetext', `${this.formatTime(remainingMs)} remaining`);
        }

        formatTime(value) {
            const totalSeconds = Math.max(0, Math.ceil(value / 1000));
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            if (hours > 0) {
                return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
            return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }

        handleExpire() {
            if (this.expired) {
                return;
            }
            this.expired = true;
            this.state = 'expired';
            this.setStatus('Time up');
            this.updateDisplay(0);
            if (this.onExpire) {
                this.onExpire();
            }
        }

        stop(statusText) {
            this.stopInterval();
            this.state = 'finished';
            if (statusText) {
                this.setStatus(statusText);
            }
        }

        setStatus(value) {
            if (this.statusLabel) {
                this.statusLabel.textContent = value;
            }
        }

        stopInterval() {
            if (this.intervalId) {
                window.clearInterval(this.intervalId);
                this.intervalId = null;
            }
        }

        destroy() {
            this.stopInterval();
            this.unbindEvents();
            if (this.root.isConnected) {
                this.root.remove();
            }
        }
    }

    function getStoredTimerDeadline() {
        try {
            const raw = sessionStorage.getItem(TRACK_STORAGE_KEYS.timerDeadline);
            if (!raw) {
                return null;
            }
            const value = Number(raw);
            return Number.isFinite(value) ? value : null;
        } catch (error) {
            console.warn('Unable to restore exam timer deadline', error);
            return null;
        }
    }

    function setStoredTimerDeadline(deadline) {
        if (!deadline) {
            return;
        }
        try {
            sessionStorage.setItem(TRACK_STORAGE_KEYS.timerDeadline, String(deadline));
        } catch (error) {
            console.warn('Unable to persist exam timer deadline', error);
        }
    }

    function clearStoredTimerDeadline() {
        try {
            sessionStorage.removeItem(TRACK_STORAGE_KEYS.timerDeadline);
        } catch (error) {
            console.warn('Unable to clear exam timer deadline', error);
        }
    }

    function getStoredTimerPosition() {
        try {
            const raw = sessionStorage.getItem(TRACK_STORAGE_KEYS.timerPosition);
            if (!raw) {
                return null;
            }
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed.left === 'number' && typeof parsed.top === 'number') {
                return parsed;
            }
        } catch (error) {
            console.warn('Unable to restore timer position', error);
        }
        return null;
    }

    function setStoredTimerPosition(position) {
        if (!position || typeof position.left !== 'number' || typeof position.top !== 'number') {
            return;
        }
        try {
            const payload = JSON.stringify(position);
            sessionStorage.setItem(TRACK_STORAGE_KEYS.timerPosition, payload);
        } catch (error) {
            console.warn('Unable to persist timer position', error);
        }
    }

    function clearStoredTimerPosition() {
        try {
            sessionStorage.removeItem(TRACK_STORAGE_KEYS.timerPosition);
        } catch (error) {
            console.warn('Unable to clear timer position', error);
        }
    }

    function ensureExamTimer() {
        if (examTimerInstance) {
            return examTimerInstance;
        }
        const initialDeadline = getStoredTimerDeadline();
        const initialPosition = getStoredTimerPosition();
        examTimerInstance = new FloatingExamTimer({
            durationMs: TIMER_DURATION_MS,
            initialDeadline,
            initialPosition,
            onExpire: handleTimerExpired,
            onPositionChange: setStoredTimerPosition
        });
        examTimerInstance.mount(document.body);
        const deadline = examTimerInstance.start();
        if (deadline) {
            setStoredTimerDeadline(deadline);
        } else {
            clearStoredTimerDeadline();
        }
        timerExpired = false;
        return examTimerInstance;
    }

    function stopExamTimer(options = {}) {
        const preserveElement = Boolean(options.preserveElement);
        const preserveStorage = Boolean(options.preserveStorage);
        const wasExpired = timerExpired;
        if (!examTimerInstance) {
            if (!preserveStorage) {
                clearStoredTimerDeadline();
                clearStoredTimerPosition();
            }
            timerExpired = false;
            return;
        }
        const statusText = typeof options.statusText === 'string' ? options.statusText : wasExpired ? null : 'Submitted';
        examTimerInstance.stop(statusText);
        if (!preserveElement) {
            examTimerInstance.destroy();
            examTimerInstance = null;
        }
        if (!preserveStorage) {
            clearStoredTimerDeadline();
            clearStoredTimerPosition();
        }
        timerExpired = false;
    }

    function appendTimerExpiryNotice() {
        if (!elements.examComplete) {
            return;
        }
        let note = elements.examComplete.querySelector('[data-role="timer-expired-note"]');
        if (!note) {
            note = document.createElement('p');
            note.className = 'exam-timer-expired-note';
            note.dataset.role = 'timer-expired-note';
            const heading = elements.examComplete.querySelector('h2');
            if (heading) {
                heading.insertAdjacentElement('afterend', note);
            } else {
                elements.examComplete.prepend(note);
            }
        }
        note.textContent = 'Your one-hour timer finished, so we saved your progress and submitted automatically.';
    }

    function clearTimerExpiryNotice() {
        if (!elements.examComplete) {
            return;
        }
        const note = elements.examComplete.querySelector('[data-role="timer-expired-note"]');
        if (note) {
            note.remove();
        }
    }

    function focusExamComplete() {
        if (!elements.examComplete) {
            return;
        }
        if (!elements.examComplete.hasAttribute('tabindex')) {
            elements.examComplete.setAttribute('tabindex', '-1');
        }
        elements.examComplete.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.setTimeout(() => {
            elements.examComplete?.focus({ preventScroll: true });
        }, 120);
    }

    function openTimeoutModal() {
        if (!elements.timeoutModal) {
            focusExamComplete();
            return;
        }
        elements.timeoutModal.removeAttribute('hidden');
        elements.timeoutModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        window.setTimeout(() => {
            elements.timeoutAck?.focus();
        }, 0);
    }

    function closeTimeoutModal(options = {}) {
        if (!elements.timeoutModal) {
            return;
        }
        elements.timeoutModal.setAttribute('hidden', 'hidden');
        elements.timeoutModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        if (options.restoreFocus) {
            focusExamComplete();
        }
    }

    function handleTimerExpired() {
        timerExpired = true;
        clearStoredTimerDeadline();
        appendTimerExpiryNotice();
        if (elements.examStage) {
            elements.examStage.setAttribute('hidden', 'hidden');
        }
        if (elements.examSummary) {
            elements.examSummary.setAttribute('hidden', 'hidden');
        }
        if (elements.writingSection) {
            elements.writingSection.setAttribute('hidden', 'hidden');
        }
        completeExam({ trigger: 'timer' });
        openTimeoutModal();
    }

    const WRITING_PROMPTS = {
        a: {
            key: 'a',
            label: 'Prompt A response',
            shortLabel: 'Prompt A',
            hint: 'Up to 50 words',
            placeholder: 'Write up to 50 words describing your chosen topic...',
            minWords: 0,
            maxWords: 50
        },
        b: {
            key: 'b',
            label: 'Prompt B response',
            shortLabel: 'Prompt B',
            hint: 'Aim for 120-180 words',
            placeholder: 'Write an email to a friend describing your two-week holiday, covering the journey, stay, activities, and people you met.',
            minWords: 80,
            maxWords: 220
        }
    };

    const trackLabel = isKidsTrack ? 'Kids Placement' : 'Adults or 10+ Placement';
    if (elements.trackLabel) {
        elements.trackLabel.textContent = trackLabel;
    }

    if (!sectionConfig || !sectionConfig.questions || !sectionConfig.questions.length) {
        elements.questionText.textContent = 'Question bank coming soon.';
        elements.optionsForm.innerHTML = '';
        elements.examTotal.textContent = '0';
        elements.prevBtn.disabled = true;
        elements.nextBtn.disabled = true;
        return;
    }
    let currentIndex = 0;
    let responses = new Array(totalQuestions).fill(null);
    let reviewFlags = new Array(totalQuestions).fill(false);
    const applyStageContent = () => {
        if (elements.examSectionPill) {
            const pillText = sectionConfig?.sectionLabel || defaultExamSectionPill;
            elements.examSectionPill.textContent = pillText;
        }
        if (elements.sectionHeading) {
            if (sectionConfig?.heading) {
                elements.sectionHeading.textContent = sectionConfig.heading;
            } else if (defaultSectionHeading) {
                elements.sectionHeading.textContent = defaultSectionHeading;
            }
        }
        if (elements.examSublead) {
            if (sectionConfig?.sublead) {
                elements.examSublead.textContent = sectionConfig.sublead;
            } else if (defaultExamSublead) {
                elements.examSublead.textContent = defaultExamSublead;
            }
        }
        if (elements.examTotal) {
            elements.examTotal.textContent = String(totalQuestions);
        }
    };

    const applySummaryContent = () => {
        if (elements.summaryPill) {
            const pillText = sectionConfig?.summaryPill || defaultSummaryPillText;
            elements.summaryPill.textContent = pillText;
        }
        if (elements.continueToWriting) {
            const buttonLabel = sectionConfig?.nextButtonLabel || defaultContinueLabel;
            const buttonHref = sectionConfig?.nextButtonHref || defaultContinueHref;
            elements.continueToWriting.textContent = buttonLabel;
            elements.continueToWriting.setAttribute('href', buttonHref);
        }
        if (summaryTailNode) {
            const tailText = sectionConfig?.summaryTail || defaultSummaryTail;
            summaryTailNode.textContent = tailText;
        }
    };
    const writingDrafts = { a: '', b: '' };
    let activePrompt = 'a';
    let storedProfile = null;
    let storedPledge = null;
    let pendingProfile = null;
    let pledgeAccepted = false;
    let storedSpeakingPassport = null;
    try {
        storedProfile = sessionStorage.getItem(TRACK_STORAGE_KEYS.profile);
        if (!storedProfile) {
            const legacyProfile = sessionStorage.getItem(STORAGE_KEYS.profile);
            if (legacyProfile) {
                sessionStorage.setItem(TRACK_STORAGE_KEYS.profile, legacyProfile);
                sessionStorage.removeItem(STORAGE_KEYS.profile);
                storedProfile = legacyProfile;
            }
        }
        storedPledge = sessionStorage.getItem(TRACK_STORAGE_KEYS.pledge);
        if (!storedPledge) {
            const legacyPledge = sessionStorage.getItem(STORAGE_KEYS.pledge);
            if (legacyPledge) {
                sessionStorage.setItem(TRACK_STORAGE_KEYS.pledge, legacyPledge);
                sessionStorage.removeItem(STORAGE_KEYS.pledge);
                storedPledge = legacyPledge;
            }
        }
        pledgeAccepted = storedPledge === 'true';
        storedSpeakingPassport = sessionStorage.getItem(STORAGE_KEYS.speakingPassport);
    } catch (error) {
        console.warn('Session storage is unavailable', error);
    }

    function updateProgress() {
        const answered = responses.filter((value) => value !== null).length;
        elements.completedCount.textContent = `${answered} answered`;
        const percentage = totalQuestions ? ((currentIndex + 1) / totalQuestions) * 100 : 0;
        elements.examProgressFill.style.width = `${percentage}%`;
        elements.examCurrent.textContent = String(currentIndex + 1);

        Array.from(elements.examGrid.children).forEach((button, index) => {
            button.classList.toggle('is-active', index === currentIndex);
            button.classList.toggle('is-answered', responses[index] !== null);
            button.classList.toggle('is-review', reviewFlags[index]);
        });
    }

    function renderQuestion() {
        const question = sectionConfig.questions[currentIndex];
        elements.questionNumber.textContent = `Question ${currentIndex + 1}`;
        elements.questionText.textContent = question.text;
        if (elements.questionCard) {
            const existingFigure = elements.questionCard.querySelector('.exam-question-figure');
            if (existingFigure) {
                existingFigure.remove();
            }
            if (question.promptImage && elements.optionsForm) {
                const promptFigure = document.createElement('figure');
                promptFigure.className = 'exam-question-figure';

                const promptImg = document.createElement('img');
                promptImg.src = question.promptImage.src;
                promptImg.loading = 'lazy';
                promptImg.alt = question.promptImage.alt || question.text;
                promptFigure.appendChild(promptImg);

                if (question.promptImage.caption) {
                    const promptCaption = document.createElement('figcaption');
                    promptCaption.className = 'exam-question-caption';
                    promptCaption.textContent = question.promptImage.caption;
                    promptFigure.appendChild(promptCaption);
                }

                elements.questionCard.insertBefore(promptFigure, elements.optionsForm);
            }
        }
        elements.optionsForm.innerHTML = '';

        const hasIllustrations = question.options.some((option) => option && typeof option === 'object' && option.image);
        elements.optionsForm.classList.toggle('has-illustrations', hasIllustrations);

        question.options.forEach((option, optionIndex) => {
            const optionData = option && typeof option === 'object' ? option : { text: option };
            const optionId = `q${currentIndex}-o${optionIndex}`;
            const optionWrapper = document.createElement('label');
            optionWrapper.className = 'exam-option';

            if (optionData.image) {
                optionWrapper.classList.add('has-illustration');
            }

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `question-${currentIndex}`;
            const choiceLetter = String.fromCharCode(97 + optionIndex);
            input.value = choiceLetter;
            input.id = optionId;

            const labelBadge = document.createElement('span');
            labelBadge.className = 'exam-option-label';
            labelBadge.textContent = choiceLetter.toUpperCase();

            optionWrapper.appendChild(input);
            optionWrapper.appendChild(labelBadge);

            if (optionData.image) {
                const figure = document.createElement('figure');
                figure.className = 'exam-option-figure';

                const img = document.createElement('img');
                img.src = optionData.image;
                img.loading = 'lazy';
                img.alt = optionData.alt || `Choice ${choiceLetter.toUpperCase()} for ${question.text}`;
                figure.appendChild(img);

                const captionText = optionData.caption || optionData.text || '';
                if (captionText) {
                    const caption = document.createElement('figcaption');
                    caption.className = 'exam-option-caption';
                    caption.textContent = captionText;
                    figure.appendChild(caption);
                }

                optionWrapper.appendChild(figure);
            } else if (optionData.text) {
                const text = document.createElement('span');
                text.className = 'exam-option-text';
                text.textContent = optionData.text;
                optionWrapper.appendChild(text);
            }

            elements.optionsForm.appendChild(optionWrapper);

            if (responses[currentIndex] === input.value) {
                input.checked = true;
                optionWrapper.classList.add('is-selected');
            }

            input.addEventListener('change', () => {
                if (examClosed) {
                    return;
                }
                responses[currentIndex] = input.value;
                Array.from(elements.optionsForm.querySelectorAll('.exam-option')).forEach((node) => node.classList.remove('is-selected'));
                optionWrapper.classList.add('is-selected');
                updateProgress();
            });
        });

        elements.markForReview.checked = reviewFlags[currentIndex];
        updateProgress();
        updateButtons();
    }

    function updateButtons() {
        elements.prevBtn.disabled = currentIndex === 0;
        const isLast = currentIndex === totalQuestions - 1;
        if (isLast) {
            const submitLabel = sectionConfig?.submitButtonLabel || (currentSectionKey === 'B' ? 'Submit Section B' : 'Submit Section A');
            elements.nextBtn.textContent = submitLabel;
        } else {
            elements.nextBtn.textContent = 'Next';
        }
    }

    function buildGrid() {
        elements.examGrid.innerHTML = '';
        sectionConfig.questions.forEach((_, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = String(index + 1);
            button.setAttribute('role', 'listitem');
            button.addEventListener('click', () => {
                if (examClosed) {
                    return;
                }
                currentIndex = index;
                renderQuestion();
            });
            elements.examGrid.appendChild(button);
        });
    }

    elements.prevBtn.addEventListener('click', () => {
        if (examClosed) {
            return;
        }
        if (currentIndex === 0) return;
        currentIndex -= 1;
        renderQuestion();
    });

    elements.nextBtn.addEventListener('click', () => {
        if (examClosed) {
            return;
        }
        if (currentIndex === totalQuestions - 1) {
            const unanswered = responses.map((value, index) => value === null ? index + 1 : null).filter(Boolean);
            if (unanswered.length) {
                const message = `You still have ${unanswered.length} unanswered question${unanswered.length > 1 ? 's' : ''}. Submit anyway?`;
                if (!window.confirm(message)) {
                    return;
                }
            }
            showSummary();
            return;
        }
        currentIndex += 1;
        renderQuestion();
    });

    elements.markForReview.addEventListener('change', (event) => {
        if (examClosed) {
            event.target.checked = reviewFlags[currentIndex] || false;
            return;
        }
        reviewFlags[currentIndex] = event.target.checked;
        updateProgress();
    });

    elements.toggleReview.addEventListener('click', () => {
        if (examClosed) {
            return;
        }
        const firstUnanswered = responses.findIndex((value) => value === null);
        if (firstUnanswered >= 0) {
            currentIndex = firstUnanswered;
            renderQuestion();
        }
    });

    function showSummary() {
        if (examClosed) {
            return;
        }
        applySummaryContent();
        elements.examSummary.removeAttribute('hidden');
        elements.examStage.setAttribute('hidden', 'hidden');
        const answered = responses.filter((value) => value !== null).length;
        elements.examSummaryAnswered.textContent = answered;
        if (elements.examSummaryTotal) {
            elements.examSummaryTotal.textContent = String(totalQuestions);
        }
    }

    function startSection(newConfig, sectionKey) {
        if (!newConfig || !Array.isArray(newConfig.questions) || !newConfig.questions.length) {
            return false;
        }
        examClosed = false;
        sectionConfig = newConfig;
        currentSectionKey = sectionKey;
        totalQuestions = newConfig.questions.length;
        responses = new Array(totalQuestions).fill(null);
        reviewFlags = new Array(totalQuestions).fill(false);
        currentIndex = 0;
        applyStageContent();
        buildGrid();
        renderQuestion();
        return true;
    }

    function completeExam(options = {}) {
        const trigger = options.trigger || 'manual';
        examClosed = true;
        if (elements.examStage) {
            elements.examStage.setAttribute('hidden', 'hidden');
        }
        if (elements.writingSection) {
            elements.writingSection.setAttribute('hidden', 'hidden');
        }
        if (elements.examSummary) {
            elements.examSummary.setAttribute('hidden', 'hidden');
        }
        if (elements.examComplete) {
            elements.examComplete.removeAttribute('hidden');
            focusExamComplete();
        }
        if (trigger !== 'timer') {
            clearTimerExpiryNotice();
        }
        const statusText = trigger === 'timer' ? null : 'Submitted';
        stopExamTimer({ statusText });
        timerExpired = trigger === 'timer';
    }

    elements.continueToWriting.addEventListener('click', (event) => {
        event.preventDefault();
        if (isKidsTrack) {
            if (currentSectionKey === 'A' && kidsSectionBConfig) {
                const started = startSection(kidsSectionBConfig, 'B');
                if (started) {
                    elements.examSummary.setAttribute('hidden', 'hidden');
                    elements.examStage.removeAttribute('hidden');
                    elements.examStage.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    return;
                }
            }
            completeExam();
            return;
        }
        elements.examSummary.setAttribute('hidden', 'hidden');
        elements.writingSection.removeAttribute('hidden');
        elements.writingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    function countWords(value) {
        return value.trim().length ? value.trim().split(/\s+/).filter(Boolean).length : 0;
    }

    function updateWritingAlert(message) {
        if (!elements.writingAlert) return;
        if (message) {
            elements.writingAlert.textContent = message;
            elements.writingAlert.removeAttribute('hidden');
        } else {
            elements.writingAlert.textContent = '';
            elements.writingAlert.setAttribute('hidden', 'hidden');
        }
    }

    function updateIntakeAlert(message) {
        if (!elements.intakeAlert) return;
        if (message) {
            elements.intakeAlert.textContent = message;
            elements.intakeAlert.removeAttribute('hidden');
        } else {
            elements.intakeAlert.textContent = '';
            elements.intakeAlert.setAttribute('hidden', 'hidden');
        }
    }

    function updateSpeakingAlert(message) {
        if (!elements.speakingAlert) return;
        if (message) {
            elements.speakingAlert.textContent = message;
            elements.speakingAlert.removeAttribute('hidden');
        } else {
            elements.speakingAlert.textContent = '';
            elements.speakingAlert.setAttribute('hidden', 'hidden');
        }
    }

    function hideSpeakingSuccess() {
        if (!elements.speakingSuccess) return;
        elements.speakingSuccess.setAttribute('hidden', 'hidden');
    }

    function showSpeakingSuccess() {
        if (!elements.speakingSuccess) return;
        elements.speakingSuccess.removeAttribute('hidden');
    }

    function persistProfile(profile) {
        if (!profile || typeof profile !== 'object') {
            return;
        }
        try {
            const payload = JSON.stringify(profile);
            sessionStorage.setItem(TRACK_STORAGE_KEYS.profile, payload);
            storedProfile = payload;
        } catch (error) {
            console.warn('Unable to cache placement profile', error);
        }
    }

    function persistSpeakingPassport(passportNumber) {
        try {
            if (!passportNumber) {
                sessionStorage.removeItem(STORAGE_KEYS.speakingPassport);
                storedSpeakingPassport = null;
                return;
            }
            sessionStorage.setItem(STORAGE_KEYS.speakingPassport, passportNumber);
            storedSpeakingPassport = passportNumber;
        } catch (error) {
            console.warn('Unable to cache speaking passport', error);
        }
    }

    function revealSpeakingForm() {
        if (elements.speakingForm && elements.speakingForm.hasAttribute('hidden')) {
            elements.speakingForm.removeAttribute('hidden');
            elements.speakingForm.classList.add('is-open');
        }
        if (elements.speakingConfirmBtn && !elements.speakingConfirmBtn.hasAttribute('hidden')) {
            elements.speakingConfirmBtn.setAttribute('hidden', 'hidden');
        }
    }

    function restoreSpeakingConfirmation() {
        if (!storedSpeakingPassport || !elements.speakingPassport) {
            return;
        }
        revealSpeakingForm();
        elements.speakingForm?.classList.add('is-open');
        elements.speakingPassport.value = storedSpeakingPassport;
        updateSpeakingAlert('');
        showSpeakingSuccess();
    }

    function markPledgeAccepted(value) {
        pledgeAccepted = Boolean(value);
        try {
            if (pledgeAccepted) {
                sessionStorage.setItem(TRACK_STORAGE_KEYS.pledge, 'true');
            } else {
                sessionStorage.removeItem(TRACK_STORAGE_KEYS.pledge);
            }
        } catch (error) {
            console.warn('Unable to persist pledge acceptance', error);
        }
    }

    function openPledgeModal() {
        if (!elements.pledgeModal) {
            markPledgeAccepted(true);
            if (pendingProfile) {
                persistProfile(pendingProfile);
            }
            unlockExam();
            elements.nextBtn?.focus();
            return;
        }

        elements.pledgeModal.removeAttribute('hidden');
        elements.pledgeModal.dataset.open = 'true';
        elements.pledgeModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');

        if (elements.pledgeCheckbox) {
            elements.pledgeCheckbox.checked = false;
            window.setTimeout(() => {
                elements.pledgeCheckbox?.focus();
            }, 0);
        }

        if (elements.pledgeConfirm) {
            elements.pledgeConfirm.disabled = true;
        }
    }

    function closePledgeModal(options = {}) {
        if (!elements.pledgeModal) {
            return;
        }
        elements.pledgeModal.dataset.open = 'false';
        elements.pledgeModal.setAttribute('aria-hidden', 'true');
        elements.pledgeModal.setAttribute('hidden', 'hidden');
        document.body.classList.remove('modal-open');

        if (options.restoreFocus) {
            const focusTarget = elements.intakeFields.name || elements.prevBtn || elements.nextBtn;
            focusTarget?.focus();
        }
    }

    function unlockExam() {
        if (elements.intakeSection) {
            elements.intakeSection.setAttribute('hidden', 'hidden');
        }
        if (elements.examStage) {
            elements.examStage.removeAttribute('hidden');
            elements.examStage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        ensureExamTimer();
    }

    function handleStoredProfile() {
        try {
            if (!storedProfile) return;
            const parsed = JSON.parse(storedProfile);
            if (!parsed || typeof parsed !== 'object') return;
            if (!pledgeAccepted) {
                pendingProfile = parsed;
                openPledgeModal();
                return;
            }
            unlockExam();
        } catch (error) {
            console.warn('Failed to restore placement profile', error);
            try {
                sessionStorage.removeItem(TRACK_STORAGE_KEYS.profile);
                sessionStorage.removeItem(TRACK_STORAGE_KEYS.pledge);
            } catch (storageError) {
                console.warn('Unable to clear cached placement profile', storageError);
            }
        }
    }

    function updateWordCount() {
        if (!elements.writingResponse || !elements.wordCount) return;
        const total = countWords(elements.writingResponse.value);
        elements.wordCount.textContent = String(total);
        const config = WRITING_PROMPTS[activePrompt];
        if (elements.writingCountLabel && config) {
            const overLimit = typeof config.maxWords === 'number' && total > config.maxWords;
            elements.writingCountLabel.classList.toggle('is-over', overLimit);
        }
        if (!elements.writingAlert?.hasAttribute('hidden')) {
            updateWritingAlert('');
        }
    }

    function applyPromptState(promptKey) {
        if (!WRITING_PROMPTS[promptKey]) {
            return;
        }

        if (elements.writingResponse) {
            writingDrafts[activePrompt] = elements.writingResponse.value;
        }

        activePrompt = promptKey;
        const config = WRITING_PROMPTS[promptKey];

        if (elements.writingChoiceButtons && elements.writingChoiceButtons.length) {
            Array.from(elements.writingChoiceButtons).forEach((button) => {
                const isActive = button.dataset.prompt === promptKey;
                button.classList.toggle('is-active', isActive);
                button.setAttribute('aria-pressed', String(isActive));
            });
        }

        if (elements.writingPromptCards && elements.writingPromptCards.length) {
            Array.from(elements.writingPromptCards).forEach((card) => {
                const isActive = card.dataset.prompt === promptKey;
                card.classList.toggle('is-active', isActive);
                if (isActive) {
                    card.removeAttribute('aria-hidden');
                } else {
                    card.setAttribute('aria-hidden', 'true');
                }
            });
        }

        if (elements.writingResponseWrapper) {
            elements.writingResponseWrapper.setAttribute('data-active-prompt', promptKey);
        }

        if (elements.writingResponse) {
            elements.writingResponse.setAttribute('data-active-prompt', promptKey);
            elements.writingResponse.placeholder = config.placeholder;
            elements.writingResponse.value = writingDrafts[promptKey] || '';
        }

        if (elements.writingResponseLabel) {
            elements.writingResponseLabel.textContent = config.label;
        }

        if (elements.writingResponseHint) {
            elements.writingResponseHint.textContent = config.hint;
        }

        updateWritingAlert('');
        updateWordCount();
    }

    if (elements.intakeForm) {
        elements.intakeForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const profile = {
                name: elements.intakeFields.name ? elements.intakeFields.name.value.trim() : '',
                email: elements.intakeFields.email ? elements.intakeFields.email.value.trim() : '',
                location: elements.intakeFields.location ? elements.intakeFields.location.value.trim() : '',
                address: elements.intakeFields.address ? elements.intakeFields.address.value.trim() : ''
            };

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!profile.name) {
                updateIntakeAlert('Please enter your full name to continue.');
                elements.intakeFields.name?.focus();
                return;
            }

            if (!emailPattern.test(profile.email)) {
                updateIntakeAlert('Please provide a valid email address.');
                elements.intakeFields.email?.focus();
                return;
            }

            if (!profile.location) {
                updateIntakeAlert('Let us know where you are joining from.');
                elements.intakeFields.location?.focus();
                return;
            }

            if (!profile.address || profile.address.length < 6) {
                updateIntakeAlert('Please include your current address (at least 6 characters).');
                elements.intakeFields.address?.focus();
                return;
            }

            updateIntakeAlert('');
            pendingProfile = profile;

            if (pledgeAccepted) {
                persistProfile(profile);
                unlockExam();
                elements.nextBtn?.focus();
                return;
            }

            openPledgeModal();
        });
    }

    if (elements.speakingConfirmBtn) {
        elements.speakingConfirmBtn.addEventListener('click', () => {
            revealSpeakingForm();
            hideSpeakingSuccess();
            updateSpeakingAlert('');
            elements.speakingPassport?.focus();
        });
    }

    if (elements.speakingPassport) {
        elements.speakingPassport.addEventListener('input', () => {
            hideSpeakingSuccess();
            updateSpeakingAlert('');
        });
    }

    if (elements.speakingForm) {
        elements.speakingForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!elements.speakingPassport) return;
            const passportEntry = elements.speakingPassport.value.trim();
            if (passportEntry.length < 5) {
                updateSpeakingAlert('Enter the passport number you will show during the speaking call (minimum 5 characters).');
                elements.speakingPassport.focus();
                return;
            }
            updateSpeakingAlert('');
            persistSpeakingPassport(passportEntry);

            // Store passport number in DB via speaking_confirm.php
            try {
                const resp = await fetch('speaking_confirm.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        passport_number: passportEntry
                    })
                });
                const data = await resp.json();
                if (data.success) {
                    showSpeakingSuccess();
                    updateSpeakingAlert('Passport confirmed and saved!');
                } else {
                    updateSpeakingAlert('Failed to confirm passport: ' + (data.message || 'Unknown error'));
                }
            } catch (e) {
                updateSpeakingAlert('Network error. Please try again.');
            }

            // (Optional) You can still submit exam data here if needed
        });
    }

    if (elements.pledgeCheckbox && elements.pledgeConfirm) {
        elements.pledgeCheckbox.addEventListener('change', () => {
            elements.pledgeConfirm.disabled = !elements.pledgeCheckbox.checked;
        });
    }

    function resolvePendingProfile() {
        if (pendingProfile) {
            return pendingProfile;
        }
        if (!storedProfile) {
            return null;
        }
        try {
            const parsed = JSON.parse(storedProfile);
            if (parsed && typeof parsed === 'object') {
                pendingProfile = parsed;
                return pendingProfile;
            }
        } catch (error) {
            console.warn('Unable to parse cached profile for pledge confirmation', error);
        }
        return null;
    }

    if (elements.pledgeConfirm) {
        elements.pledgeConfirm.addEventListener('click', () => {
            if (elements.pledgeConfirm.disabled || !elements.pledgeCheckbox?.checked) {
                return;
            }

            markPledgeAccepted(true);
            const profile = resolvePendingProfile();
            if (profile) {
                persistProfile(profile);
            }
            closePledgeModal();
            unlockExam();
            pendingProfile = null;
            elements.nextBtn?.focus();
        });
    }

    const cancelPledge = () => {
        pendingProfile = null;
        closePledgeModal({ restoreFocus: true });
    };

    if (hasIntakeStep) {
        elements.pledgeCancel?.addEventListener('click', cancelPledge);
        elements.pledgeBackdrop?.addEventListener('click', cancelPledge);
    } else {
        elements.pledgeCancel?.addEventListener('click', () => {
            window.location.href = 'register.html';
        });
    }

    window.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') {
            return;
        }
        let handled = false;
        if (elements.timeoutModal && elements.timeoutModal.getAttribute('aria-hidden') === 'false') {
            closeTimeoutModal({ restoreFocus: true });
            handled = true;
        }
        if (elements.pledgeModal && elements.pledgeModal.dataset.open === 'true') {
            if (hasIntakeStep) {
                cancelPledge();
            }
            handled = true;
        }
        if (handled) {
            event.preventDefault();
        }
    });

    if (hasIntakeStep) {
        if (storedProfile) {
            handleStoredProfile();
        }
    } else if (pledgeAccepted) {
        unlockExam();
    } else {
        openPledgeModal();
    }

    if (elements.writingChoiceButtons && elements.writingChoiceButtons.length) {
        Array.from(elements.writingChoiceButtons).forEach((button) => {
            button.addEventListener('click', () => {
                const promptKey = button.dataset.prompt;
                if (!promptKey || promptKey === activePrompt) return;
                applyPromptState(promptKey);
                elements.writingResponse?.focus();
            });
        });
    }

    elements.writingResponse?.addEventListener('input', () => {
        writingDrafts[activePrompt] = elements.writingResponse.value;
        updateWordCount();
    });

    elements.clearWriting?.addEventListener('click', () => {
        if (!elements.writingResponse) return;
        elements.writingResponse.value = '';
        writingDrafts[activePrompt] = '';
        updateWordCount();
        elements.writingResponse.focus();
    });

    elements.submitWriting.addEventListener('click', async () => {
        if (!elements.writingResponse) return;

        const config = WRITING_PROMPTS[activePrompt];
        const response = elements.writingResponse.value.trim();
        const words = countWords(response);

        if (!response || words === 0) {
            updateWritingAlert(`Please complete ${config.shortLabel} before submitting.`);
            elements.writingResponse.focus();
            return;
        }

        if (typeof config.minWords === 'number' && config.minWords > 0 && words < config.minWords) {
            updateWritingAlert(`${config.shortLabel} works best with at least ${config.minWords} words. You currently have ${words}.`);
            elements.writingResponse.focus();
            return;
        }

        if (typeof config.maxWords === 'number' && words > config.maxWords) {
            updateWritingAlert(`${config.shortLabel} has a ${config.maxWords}-word limit. You currently have ${words} words.`);
            elements.writingResponse.focus();
            return;
        }

        updateWritingAlert('');
        // Call submitExamResults to POST grammar_score and writing_text to exam_submit.php
        await submitExamResults();
        completeExam({ trigger: 'manual' });
    });

    elements.timeoutAck?.addEventListener('click', () => {
        closeTimeoutModal({ restoreFocus: true });
    });

    elements.timeoutClose?.addEventListener('click', () => {
        closeTimeoutModal({ restoreFocus: true });
    });

    elements.timeoutBackdrop?.addEventListener('click', () => {
        closeTimeoutModal({ restoreFocus: true });
    });

    elements.timeoutSupport?.addEventListener('click', () => {
        closeTimeoutModal({ restoreFocus: true });
    });

    restoreSpeakingConfirmation();

    applyPromptState(activePrompt);

    startSection(sectionConfig, currentSectionKey);

    // Expose key variables to global scope for submitExamResults
    window.responses = responses;
    window.writingDrafts = writingDrafts;
    window.activePrompt = activePrompt;
})();

