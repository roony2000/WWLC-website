// Smooth animation and click for profile avatar
document.addEventListener('DOMContentLoaded', function() {
    var avatarBtn = document.getElementById('profileAvatarBtn');
    if (avatarBtn) {
        avatarBtn.addEventListener('click', function() {
            avatarBtn.classList.add('clicked');
            setTimeout(function() {
                avatarBtn.classList.remove('clicked');
            }, 350);
            // You can add more actions here if needed
        });
    }
});

// Ensure forgot password link always works
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.auth-forgot').forEach(function(el) {
        el.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            // Find the email input in the modal
            var emailInput = document.querySelector('input[type="email"]');
            var email = emailInput ? emailInput.value.trim() : '';
            if (!email) {
                alert('Please enter your email address first.');
                if (emailInput) emailInput.focus();
                return;
            }
            fetch('send_reset_code.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'email=' + encodeURIComponent(email)
            })
            .then(async res => {
                let text = await res.text();
                let data;
                try {
                    data = JSON.parse(text);
                } catch (err) {
                    console.error('Invalid JSON:', text);
                    alert('Server error.');
                    return;
                }
                console.log('Forgot password response:', data);
                if (data && data.success === true) {
                    window.location.href = 'reset-password.html';
                } else {
                    alert((data && data.error) || 'Server error.');
                }
            })
            .catch(err => {
                console.error('Fetch error:', err);
                alert('Server error.');
            });
        });
    });
});
// Ensure intro video always loops (fallback for browsers that ignore loop)
document.addEventListener('DOMContentLoaded', function() {
    var introVideo = document.getElementById('intro-video');
    if (introVideo) {
        introVideo.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        });
    }
});
let klClockInterval = null;
let lastSunAltitude = null;
let currentDaylightFactor = 0;
let currentMoonPhase = 0;
const ACCOUNT_STATUS_KEY = 'wwlcAccountStatus';

function getAccountStatus(){
    try {
        const raw = localStorage.getItem(ACCOUNT_STATUS_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (error){
        console.warn('Unable to read account status', error);
        return null;
    }
}

function isAccountVerified(){
    const status = getAccountStatus();
    return Boolean(status && status.verified === true);
}

function initExamAccessGate(){
    const gatedLinks = Array.from(document.querySelectorAll('[data-requires-account]'));
    if (!gatedLinks.length) return;
    gatedLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            if (isAccountVerified()) {
                return;
            }
            event.preventDefault();
            window.location.href = 'register.html';
        });
    });
}

function initWhenVisible(selector, init, options = {}) {
    const target = document.querySelector(selector);
    if (!target || typeof init !== 'function') return;

    let started = false;
    const start = () => {
        if (started) return;
        started = true;
        init();
    };

    if (!('IntersectionObserver' in window)) {
        start();
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        const visible = entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0);
        if (!visible) return;
        observer.disconnect();
        start();
    }, {
        rootMargin: options.rootMargin || '180px 0px',
        threshold: options.threshold || 0.01
    });

    observer.observe(target);
}

let homepageVendorScriptsPromise = null;

function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            if (existing.dataset.loaded === 'true') {
                resolve();
                return;
            }
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.defer = true;
        script.addEventListener('load', () => {
            script.dataset.loaded = 'true';
            resolve();
        }, { once: true });
        script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
        document.head.appendChild(script);
    });
}

function ensureHomepageVendorScripts() {
    if (homepageVendorScriptsPromise) return homepageVendorScriptsPromise;
    homepageVendorScriptsPromise = Promise.all([
        loadScriptOnce('scripts/vendor/three.min.js'),
        loadScriptOnce('scripts/vendor/OrbitControls.js')
    ]).catch((error) => {
        homepageVendorScriptsPromise = null;
        throw error;
    });
    return homepageVendorScriptsPromise;
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => document.body.classList.add('is-loaded'), 60);
    // Always scroll to top on page load to show intro video
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    initVideoHandling();
    initLanguageSelector();
    initExamAccessGate();
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => initCourses(), { timeout: 700 });
    } else {
        window.setTimeout(() => initCourses(), 120);
    }
    initWhenVisible('.why-wwlc', initWhyWordsworth);
    initWhenVisible('.trusted-accredited', initTrustedCube);
    initWhenVisible('.whois-wordsworth', initWhoIsWordsworth);
    initWhenVisible('.global-voices', () => {
        ensureHomepageVendorScripts()
            .then(() => {
                initGlobe();
                initMalaysiaClock();
            })
            .catch((error) => {
                console.warn('Unable to load homepage 3D assets', error);
            });
    }, { rootMargin: '220px 0px' });

    // Forgot password link
    document.querySelectorAll('.auth-forgot').forEach(function(el) {
         el.addEventListener('click', function(e) {
             e.preventDefault();
             window.location.href = 'reset_password.html';
         });
     });
});

function initVideoHandling() {
    const video = document.getElementById('intro-video');
    if (!video) return;

    video.controls = false;
    video.loop = true;
    video.muted = true;
    video.autoplay = true;
    video.addEventListener('contextmenu', (event) => event.preventDefault());

    let lastTime = 0;
    video.addEventListener('timeupdate', () => { lastTime = video.currentTime; });
    video.addEventListener('pause', () => { video.play().catch(() => {}); });
    video.addEventListener('ended', () => {
        video.currentTime = 0;
        video.play().catch(() => {});
    });
    video.addEventListener('loadeddata', () => { video.play().catch(() => {}); });
    video.addEventListener('canplay', () => { video.play().catch(() => {}); });
    video.addEventListener('seeking', () => {
        video.currentTime = lastTime;
        video.play().catch(() => {});
    });
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            video.play().catch(() => {});
        }
    });

    window.addEventListener('keydown', (event) => {
        if (document.activeElement === video && (event.code === 'Space' || event.key === ' ')) {
            event.preventDefault();
        }
    });

    video.play().catch(() => {});
}

function initLanguageSelector() {
    const langBtn = document.getElementById('langBtn');
    const langMenu = document.getElementById('langMenu');
    const selector = document.getElementById('langSelector');
    const btnFlag = document.getElementById('langBtnFlag');
    const btnLabel = document.getElementById('langBtnLabel');

    if (!langBtn || !langMenu || !selector) return;

    const setStagger = () => {
        Array.from(langMenu.querySelectorAll('.lang-item')).forEach((item, idx) => {
            item.style.setProperty('--i', idx);
        });
    };

    const openMenu = () => {
        langMenu.classList.add('open');
        selector.classList.add('open');
        langBtn.setAttribute('aria-expanded', 'true');
        langBtn.classList.add('animate');
        setTimeout(() => langBtn.classList.remove('animate'), 260);
    };

    const closeMenu = () => {
        langMenu.classList.remove('open');
        selector.classList.remove('open');
        langBtn.setAttribute('aria-expanded', 'false');
    };

    const toggleMenu = () => {
        if (langMenu.classList.contains('open')) closeMenu();
        else openMenu();
    };

    setStagger();

    langBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleMenu();
    });

    langMenu.querySelectorAll('.lang-item').forEach((btn) => {
        btn.addEventListener('click', () => {
            const code = btn.getAttribute('data-code') || 'EN';
            const flag = btn.getAttribute('data-flag') || '';
            const lang = btn.getAttribute('data-lang') || 'en';
            if (flag && btnFlag) btnFlag.src = flag;
            if (btnLabel) btnLabel.textContent = code.toUpperCase();
            document.documentElement.lang = lang;
            // Set direction for Arabic
            if (lang === 'ar') {
                document.documentElement.dir = 'rtl';
                // Expanded Arabic translations for the whole page
                const translations = {
                    // Register page details
                    'Register for placement tests, track your progress, and access learning resources.': 'سجل لاختبارات تحديد المستوى، وتتبع تقدمك، وادخل إلى موارد التعلم.',
                    'Teacher': 'معلم',
                    'Access and manage student speaking test requests and exam results.': 'إدارة طلبات اختبارات المحادثة ونتائج الامتحانات للطلاب.',
                    'Secure registration': 'تسجيل آمن',
                    'Create your Wordsworth account in minutes': 'أنشئ حسابك في ووردزوورث خلال دقائق',
                    'Sign up with your email address, confirm your identity with a verification code, and access your personalised placement dashboard.': 'سجل باستخدام بريدك الإلكتروني، وأكد هويتك برمز تحقق، وادخل إلى لوحة تحديد المستوى المخصصة لك.',
                    'Verified access': 'وصول موثوق',
                    'Two-step confirmation keeps your progress and placement history safe.': 'تأكيد من خطوتين يحافظ على تقدمك وسجل اختباراتك.',
                    'Progress saved': 'تم حفظ التقدم',
                    'Your exam attempts, writing drafts, and coach feedback sync across devices.': 'محاولاتك في الامتحان ومسودات الكتابة وتعليقات المدرب متزامنة عبر جميع الأجهزة.',
                    'Future ready': 'جاهز للمستقبل',
                    'Once verified, unlock speaking diagnostics, scheduling tools, and payment plans.': 'بعد التحقق، يمكنك فتح أدوات تشخيص المحادثة، وأدوات الجدولة، وخطط الدفع.',
                    'Sign up with your email': 'سجل باستخدام بريدك الإلكتروني',
                    'Provide your details so we can prepare your placement experience.': 'أدخل بياناتك لنعد لك تجربة تحديد المستوى.',
                    'Full name': 'الاسم الكامل',
                    'Email address': 'البريد الإلكتروني',
                    'Mobile number (optional)': 'رقم الجوال (اختياري)',
                    'Password': 'كلمة المرور',
                    'Use 8+ characters with a mix of letters and numbers.': 'استخدم 8 أحرف أو أكثر مع مزيج من الحروف والأرقام.',
                    'Confirm password': 'تأكيد كلمة المرور',
                    'Re-enter your password to confirm.': 'أعد إدخال كلمة المرور للتأكيد.',
                    'Security question': 'سؤال الأمان',
                    'Select a security question': 'اختر سؤال الأمان',
                    "What is your mother's maiden name?": 'ما هو اسم عائلة والدتك قبل الزواج؟',
                    'What was the name of your first pet?': 'ما اسم أول حيوان أليف لديك؟',
                    'What is your favorite book?': 'ما هو كتابك المفضل؟',
                    'What city were you born in?': 'في أي مدينة وُلدت؟',
                    'What is your favorite food?': 'ما هو طعامك المفضل؟',
                    'Your answer': 'إجابتك',
                    'Enter your answer': 'أدخل إجابتك',
                    'I agree to the': 'أوافق على',
                    'Terms of Service': 'شروط الخدمة',
                    'and': 'و',
                    'Privacy Policy': 'سياسة الخصوصية',
                    'Create account': 'إنشاء حساب',
                    'Already have an account?': 'لديك حساب بالفعل؟',
                    'Sign in.': 'تسجيل الدخول.',
                    'Verify your email': 'تحقق من بريدك الإلكتروني',
                    'Enter the six-digit code we sent to your email.': 'أدخل الرمز المكون من ستة أرقام الذي أرسلناه إلى بريدك الإلكتروني.',
                    'Confirm account': 'تأكيد الحساب',
                    'Resend code': 'إعادة إرسال الرمز',
                    'Email verified': 'تم التحقق من البريد الإلكتروني',
                    'Thanks,': 'شكرًا،',
                    'We have linked': 'لقد ربطنا',
                    'to your Wordsworth account.': 'بحسابك في ووردزوورث.',
                    'Finish your placement profile with guardian or billing details.': 'أكمل ملفك ببيانات ولي الأمر أو الفواتير.',
                    'Choose the adult or young learner exam to begin diagnostics.': 'اختر اختبار الكبار أو الصغار لبدء التشخيص.',
                    'Schedule a coach consultation to review your roadmap.': 'حدد موعدًا مع المدرب لمراجعة خطتك.',
                    'Sign In': 'تسجيل الدخول',
                    'What happens after you register?': 'ماذا يحدث بعد التسجيل؟',
                    'We combine automation with coaching, so every learner receives a human-reviewed plan.': 'نمزج بين الأتمتة والإرشاد ليحصل كل متعلم على خطة مراجعة بشرية.',
                    'Complete your profile': 'أكمل ملفك الشخصي',
                    'Upload a profile photo, confirm your preferred class times, and share language goals so your coach can prepare.': 'حمّل صورة شخصية، وحدد أوقات الدروس المفضلة، وشارك أهدافك اللغوية ليتمكن المدرب من التحضير.',
                    'Take the placement exam': 'أجرِ اختبار تحديد المستوى',
                    'Move through adaptive grammar MCQs and a writing sample. Results load instantly for your review.': 'أجب عن أسئلة القواعد التكيفية وعينة كتابة. تظهر النتائج فورًا للمراجعة.',
                    'Meet your coach': 'قابل مدربك',
                    'Book a consultation to finalise level placement, explore course options, and activate tuition plans.': 'احجز استشارة لتثبيت المستوى، واستكشاف الدورات، وتفعيل خطط الدفع.',
                    'Security and compliance': 'الأمان والامتثال',
                    'Your identity data is encrypted at rest and in transit. We align with Malaysian PDPA, GDPR, and Cambridge assessment partner requirements.': 'يتم تشفير بيانات هويتك أثناء النقل والتخزين. نلتزم بمتطلبات PDPA الماليزية وGDPR وشركاء تقييم كامبريدج.',
                    'One-time passcodes on new devices.': 'رموز مرور لمرة واحدة على الأجهزة الجديدة.',
                    'Role-based access for staff and coaches.': 'وصول حسب الدور للموظفين والمدربين.',
                    'Automated deletion after inactivity requests.': 'حذف تلقائي بعد طلبات عدم النشاط.',
                    // Login modal
                    'Welcome back': 'مرحبًا بعودتك',
                    'Sign in to access your placement dashboard and resume your exams.': 'سجّل الدخول للوصول إلى لوحة تحديد المستوى واستئناف اختباراتك.',
                    'Forgot?': 'نسيت؟',
                    'Keep me signed in on this device': 'أبقني مسجلاً على هذا الجهاز',
                    'Reset Password': 'إعادة تعيين كلمة المرور',
                    'New password': 'كلمة مرور جديدة',
                    'Please enter your email above first.': 'يرجى إدخال بريدك الإلكتروني أولاً.',
                    'Please answer the question and enter a new password.': 'يرجى الإجابة على السؤال وإدخال كلمة مرور جديدة.',
                    'Password reset successful! You can now sign in.': 'تمت إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.',
                    'Incorrect answer.': 'إجابة غير صحيحة.',
                    'Could not reset password. Please try again.': 'تعذر إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.',
                    // ...existing translations...
                    // Register page specific
                    'Choose Your Registration Path': 'اختر مسار التسجيل',
                    'Student': 'طالب',
                    'Register as a student': 'سجل كطالب',
                    'Teacher': 'معلم',
                    'Register as a teacher': 'سجل كمعلم',
                    'Back to placement': 'العودة إلى اختبار تحديد المستوى',
                    'My Profile': 'ملفي الشخصي',
                    // Navigation & Buttons (shared)
                    'Wordsworth': 'ووردزوورث',
                    'Courses': 'الدورات',
                    'Placement Test': 'اختبار تحديد المستوى',
                    'Events': 'الفعاليات',
                    'Contact': 'اتصل بنا',
                    'Fee & Calendar': 'الرسوم والتقويم',
                    'Register': 'تسجيل',
                    // ...existing translations...
                    // Trusted/Accredited Section
                    'Teaching you can trust': 'تعليم يمكنك الوثوق به',
                    'We are confirming the official details of the organisations that recognise our centre. Their logos will appear here soon.': 'نعمل حاليًا على تأكيد التفاصيل الرسمية للجهات التي تعترف بمركزنا، وستظهر شعاراتها هنا قريبًا.',
                    'Drag, tap, or use your arrow keys to rotate the cube and reveal every logo.': 'اسحب أو انقر أو استخدم مفاتيح الأسهم لتدوير المكعب وكشف كل شعار.',
                    'Logo coming soon': 'الشعار قريبًا',
                    // ...existing translations...
                    // Navigation & Buttons
                    'Wordsworth': 'ووردزوورث',
                    'Courses': 'الدورات',
                    'Placement Test': 'اختبار تحديد المستوى',
                    'Events': 'الفعاليات',
                    'Contact': 'اتصل بنا',
                    'Fee & Calendar': 'الرسوم والتقويم',
                    'Register': 'تسجيل',
                    'Start Your Journey': 'ابدأ رحلتك',
                    'Start Your Placement Test': 'ابدأ اختبار تحديد المستوى',
                    'Explore courses': 'استكشف الدورات',
                    'Book placement': 'احجز اختبار المستوى',
                    'Meet our learners': 'تعرف على طلابنا',
                    // Hero & Section Titles
                    'English language centre in Kuala Lumpur': 'مركز لتعليم اللغة الإنجليزية في كوالالمبور',
                    'Unlock confident English, for every stage of life.': 'افتح باب الإنجليزية بثقة لكل مرحلة من حياتك.',
                    'From fast-track IELTS bootcamps to lively junior clubs, our supportive teachers help you speak with clarity, fluency, and heart.': 'من معسكرات IELTS السريعة إلى نوادي الأطفال النشطة، يساعدك معلمونا الداعمون على التحدث بوضوح وطلاقة وثقة.',
                    '8:1 average class size': 'متوسط حجم الصف 8:1',
                    'Cambridge-aligned curriculum': 'منهج متوافق مع كامبريدج',
                    'Evening & weekend options': 'خيارات المساء وعطلة نهاية الأسبوع',
                    'What makes us different?': 'ما الذي يجعلنا مختلفين؟',
                    'Personal learning plans tracked weekly': 'خطط تعلم شخصية يتم تتبعها أسبوعياً',
                    'Native-speaking coaches with CELTA & DELTA': 'مدربون ناطقون أصليون مع شهادات CELTA و DELTA',
                    'Community events, clubs, and conversation labs': 'فعاليات مجتمعية، أندية، ومعامل محادثة',
                    // Why WWLC
                    'Why Choose Wordsworth Language Centre?': 'لماذا تختار مركز ووردزوورث للغات؟',
                    'Experience the difference. Discover your potential.': 'اختبر الفرق. اكتشف إمكانياتك.',
                    'Expert Coaches': 'مدربون خبراء',
                    'Learn from certified, passionate educators who turn lessons into life-changing experiences.': 'تعلم من معلمين معتمدين وملهمين يحولون الدروس إلى تجارب تغير الحياة.',
                    'Real-World Confidence': 'ثقة في العالم الحقيقي',
                    'Build skills that go beyond exams - communicate, present, and connect with impact.': 'ابنِ مهارات تتجاوز الامتحانات — تواصل، قدم، وتواصل بفعالية.',
                    'Personalized Pathways': 'مسارات مخصصة',
                    'Your journey is unique. We tailor every step to your goals, strengths, and dreams.': 'رحلتك فريدة. نخصص كل خطوة لأهدافك ونقاط قوتك وأحلامك.',
                    'Global Community': 'مجتمع عالمي',
                    'Join a vibrant, supportive network of learners and alumni from over 20 countries.': 'انضم إلى شبكة نشطة وداعمة من المتعلمين والخريجين من أكثر من 20 دولة.',
                    'Career Advancement': 'تقدم مهني',
                    'Unlock new professional opportunities and accelerate your career growth with our recognized language programs.': 'افتح فرصًا مهنية جديدة وسرّع نموك المهني مع برامجنا المعترف بها.',
                    'Central Location': 'موقع مركزي',
                    'Our institute is perfectly situated in the heart of Kuala Lumpur, making it easily accessible from anywhere in the city.': 'معهدنا يقع في قلب كوالالمبور، مما يجعله سهل الوصول من أي مكان في المدينة.',
                    'Innovative Solutions': 'حلول مبتكرة',
                    'Benefit from our advanced IS systems that streamline your learning experience and provide modern educational resources.': 'استفد من أنظمتنا المتقدمة التي تسهل تجربة التعلم وتوفر موارد تعليمية حديثة.',
                    'Dedicated Support': 'دعم مخصص',
                    'Our team is always ready to assist you, ensuring a smooth and enjoyable learning journey from start to finish.': 'فريقنا جاهز دائماً لمساعدتك لضمان رحلة تعلم سلسة وممتعة من البداية للنهاية.',
                    'Flexible Schedule': 'جدول مرن',
                    'Choose from a variety of class times to fit your busy lifestyle, making learning convenient and effective.': 'اختر من بين أوقات الدروس المتنوعة لتناسب نمط حياتك المزدحم، واجعل التعلم سهلاً وفعالاً.',
                    // Courses Section
                    'Course Pathways': 'مسارات الدورات',
                    'Programs designed for real-world confidence': 'برامج مصممة للثقة في العالم الحقيقي',
                    'Choose the pathway that matches your goals. Each track blends live coaching, guided digital practice, and unforgettable community events.': 'اختر المسار الذي يناسب أهدافك. كل مسار يجمع بين التدريب المباشر والممارسة الرقمية الفعالة وفعاليات مجتمعية لا تُنسى.',
                    'Adults & Professionals': 'البالغون والمحترفون',
                    'Teens & Exams': 'المراهقون والامتحانات',
                    'Young Learners': 'المتعلمون الصغار',
                    'Intensive General English': 'الإنجليزية العامة المكثفة',
                    'University Writing Studio': 'استوديو الكتابة الجامعية',
                    'Boost your English skills quickly with immersive lessons in speaking, listening, reading, and writing for everyday life, work, and travel.': 'عزز مهاراتك في الإنجليزية بسرعة من خلال دروس مكثفة في التحدث والاستماع والقراءة والكتابة للحياة اليومية والعمل والسفر.',
                    'Small-group seminars': 'ندوات مجموعات صغيرة',
                    'Asynchronous writing critiques': 'مراجعات كتابة غير متزامنة',
                    'Partner university sessions': 'جلسات مع جامعات شريكة',
                    'IELTS · Intensive': 'IELTS · مكثف',
                    'IELTS Accelerator (Band 5.5 → 7.0)': 'مسرع IELTS (من 5.5 إلى 7.0)',
                    'Targeted grammar, speaking clinics, and weekly mock tests coached by certified examiners.': 'قواعد مستهدفة، عيادات محادثة، واختبارات تجريبية أسبوعية بإشراف ممتحنين معتمدين.',
                    'Hybrid timetable': 'جدول هجين',
                    'Personal feedback dashboard every Friday': 'لوحة ملاحظات شخصية كل جمعة',
                    'Speaking lab with instant scoring': 'مختبر محادثة مع تقييم فوري',
                    'Business English': 'الإنجليزية للأعمال',
                    'Executive Fluency Lab': 'مختبر الطلاقة التنفيذية',
                    'Boardroom-ready communication skills with negotiation drills, pitch reviews, and networking events.': 'مهارات تواصل جاهزة لغرف الاجتماعات مع تدريبات تفاوض، مراجعات عروض، وفعاليات تواصل.',
                    'Evening schedule': 'جدول مسائي',
                    '1:1 coaching': 'تدريب فردي',
                    'Access to leadership speaker series': 'الوصول إلى سلسلة محاضرات القيادة',
                    // Homepage contact section
                    'Contact Us': 'اتصل بنا',
                    'Questions about courses or the placement test? Send us a message and our team will get back to you.': 'هل لديك أسئلة عن الدورات أو اختبار تحديد المستوى؟ أرسل لنا رسالة وسيتواصل معك فريقنا.',
                    'Prefer to chat?': 'تفضّل المحادثة؟',
                    'Message us on WhatsApp': 'راسلنا عبر واتساب',
                    'Full Name': 'الاسم الكامل',
                    'Email': 'البريد الإلكتروني',
                    'Phone': 'الهاتف',
                    'Course': 'الدورة',
                    'Message': 'الرسالة',
                    'Send Message': 'إرسال الرسالة',
                    // Add more translations for the rest of the page as needed...
                };
                // Update navigation
                document.querySelectorAll('.main-nav a').forEach(a => {
                    if (translations[a.textContent.trim()]) {
                        a.textContent = translations[a.textContent.trim()];
                    }
                });
                // Update Register button
                const regBtn = document.querySelector('.cta');
                if (regBtn && translations['Register']) regBtn.textContent = translations['Register'];
                // Update section titles, subtitles, buttons, and visible text
                document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, button, a, li').forEach(el => {
                    const txt = el.textContent.trim();
                    if (translations[txt]) {
                        el.textContent = translations[txt];
                    }
                });
            } else {
                document.documentElement.dir = 'ltr';
                // Do not reload or change language automatically; remain in the selected language until user chooses another
            }
            closeMenu();
        });

        btn.addEventListener('focus', () => btn.classList.add('focused'));
        btn.addEventListener('blur', () => btn.classList.remove('focused'));
    });

    document.addEventListener('click', (event) => {
        if (!selector.contains(event.target)) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
        if ((event.key === 'Enter' || event.key === ' ') && document.activeElement === langBtn) {
            event.preventDefault();
            toggleMenu();
        }
    });

    langMenu.addEventListener('keydown', (event) => {
        const focusable = Array.from(langMenu.querySelectorAll('.lang-item'));
        if (!focusable.length) return;

        const currentIdx = focusable.indexOf(document.activeElement);
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            focusable[(currentIdx + 1) % focusable.length].focus();
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            const targetIndex = (currentIdx - 1 + focusable.length) % focusable.length;
            focusable[targetIndex].focus();
        }
    });
}

function initCourses() {
    const root = document.querySelector('[data-courses]');
    if (!root) return;

    const pills = Array.from(root.querySelectorAll('[data-course-pill]'));
    const panels = Array.from(root.querySelectorAll('[data-course-panel]'));
    if (!pills.length || !panels.length) return;

    panels.forEach((panel) => {
        if (!panel.hasAttribute('tabindex')) {
            panel.setAttribute('tabindex', '-1');
        }
    });

    const defaultTrack = pills.find((pill) => pill.classList.contains('is-active'))?.dataset.coursePill || panels.find((panel) => panel.classList.contains('is-active'))?.dataset.coursePanel || pills[0].dataset.coursePill;
    let activeTrack = null;

    const activate = (track) => {
        if (!track) {
            return;
        }
        if (track === activeTrack) {
            return;
        }
        pills.forEach((pill) => {
            const match = pill.dataset.coursePill === track;
            pill.classList.toggle('is-active', match);
            pill.setAttribute('aria-selected', String(match));
            pill.setAttribute('tabindex', match ? '0' : '-1');
        });
        panels.forEach((panel) => {
            const match = panel.dataset.coursePanel === track;
            panel.classList.toggle('is-active', match);
            if (match) {
                panel.removeAttribute('hidden');
                panel.setAttribute('aria-hidden', 'false');
            } else {
                panel.setAttribute('hidden', 'hidden');
                panel.setAttribute('aria-hidden', 'true');
            }
        });
        activeTrack = track;
    };

    const focusPill = (index) => {
        const target = pills[index];
        if (!target) {
            return;
        }
        activate(target.dataset.coursePill);
        target.focus();
    };

    pills.forEach((pill, index) => {
        pill.addEventListener('click', () => {
            activate(pill.dataset.coursePill);
        });

        pill.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                event.preventDefault();
                const next = (index + 1) % pills.length;
                focusPill(next);
            } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                event.preventDefault();
                const prev = (index - 1 + pills.length) % pills.length;
                focusPill(prev);
            } else if (event.key === 'Home') {
                event.preventDefault();
                focusPill(0);
            } else if (event.key === 'End') {
                event.preventDefault();
                focusPill(pills.length - 1);
            } else if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                activate(pill.dataset.coursePill);
            }
        });
    });

    activate(defaultTrack);
}

function initTrustedCube() {
    const cube = document.querySelector('[data-trusted-cube]');
    if (!cube) return;

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rotX = -18;
    let rotY = 28;
    let pointerActive = false;
    let pointerId = null;
    let lastX = 0;
    let lastY = 0;
    let autoFrame = null;
    let autoResumeTimeout = null;

    const wrapAngle = (value) => {
        if (!Number.isFinite(value)) return 0;
        if (value > 360 || value < -360) {
            value %= 360;
        }
        return value;
    };

    const applyRotation = () => {
        cube.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        cube.style.setProperty('--cube-rot-x', `${rotX}deg`);
        cube.style.setProperty('--cube-rot-y', `${rotY}deg`);
    };

    applyRotation();

    const autoSpin = () => {
        rotY = wrapAngle(rotY + 0.08);
        applyRotation();
        autoFrame = requestAnimationFrame(autoSpin);
    };

    const startAuto = () => {
        if (prefersReducedMotion) return;
        if (autoFrame !== null) return;
        autoFrame = requestAnimationFrame(autoSpin);
    };

    const clearAutoResume = () => {
        if (autoResumeTimeout !== null) {
            window.clearTimeout(autoResumeTimeout);
            autoResumeTimeout = null;
        }
    };

    const stopAuto = () => {
        if (autoFrame !== null) {
            cancelAnimationFrame(autoFrame);
            autoFrame = null;
        }
        clearAutoResume();
    };

    const resumeAuto = (delay = 1800) => {
        if (prefersReducedMotion) return;
        clearAutoResume();
        autoResumeTimeout = window.setTimeout(() => {
            autoResumeTimeout = null;
            startAuto();
        }, delay);
    };

    if (!prefersReducedMotion) {
        startAuto();
    }

    cube.addEventListener('pointerdown', (event) => {
        cube.setPointerCapture(event.pointerId);
        pointerActive = true;
        pointerId = event.pointerId;
        lastX = event.clientX;
        lastY = event.clientY;
        cube.classList.add('is-grabbing');
        stopAuto();
    });

    cube.addEventListener('pointermove', (event) => {
        if (!pointerActive || event.pointerId !== pointerId) return;
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;
        rotY = wrapAngle(rotY + dx * 0.32);
        rotX = wrapAngle(rotX - dy * 0.32);
        applyRotation();
        lastX = event.clientX;
        lastY = event.clientY;
    });

    const releasePointer = (event) => {
        if (!pointerActive || (event && event.pointerId !== pointerId)) return;
        pointerActive = false;
        cube.classList.remove('is-grabbing');
        try {
            cube.releasePointerCapture(pointerId);
        } catch (error) {
            // ignore release errors
        }
        pointerId = null;
        resumeAuto();
    };

    cube.addEventListener('pointerup', releasePointer);
    cube.addEventListener('pointercancel', releasePointer);
    cube.addEventListener('pointerleave', (event) => {
        if (pointerActive) {
            releasePointer(event);
        }
    });

    cube.addEventListener('keydown', (event) => {
        const increment = event.shiftKey ? 10 : 4;
        let handled = false;

        if (event.key === 'ArrowLeft') {
            rotY = wrapAngle(rotY - increment);
            handled = true;
        } else if (event.key === 'ArrowRight') {
            rotY = wrapAngle(rotY + increment);
            handled = true;
        } else if (event.key === 'ArrowUp') {
            rotX = wrapAngle(rotX - increment);
            handled = true;
        } else if (event.key === 'ArrowDown') {
            rotX = wrapAngle(rotX + increment);
            handled = true;
        }

        if (handled) {
            event.preventDefault();
            stopAuto();
            applyRotation();
            resumeAuto();
        }
    });

    document.addEventListener('visibilitychange', () => {
        if (prefersReducedMotion) return;
        if (document.hidden) {
            stopAuto();
        } else if (!pointerActive) {
            startAuto();
        }
    });

    window.addEventListener('blur', () => {
        if (!prefersReducedMotion) {
            stopAuto();
        }
    });
}

function initWhyWordsworth() {
    const deck = document.querySelector('[data-why-deck]');
    if (!deck) return;

    const tabs = Array.from(deck.querySelectorAll('[data-why-tab]'));
    const cardElements = Array.from(deck.querySelectorAll('[data-why-card]'));
    if (!tabs.length || !cardElements.length) return;

    const cards = new Map();
    cardElements.forEach((card) => {
        const id = card.getAttribute('data-why-card');
        if (id) {
            cards.set(id, card);
        }
    });

    const tabOrder = tabs
        .map((tab) => tab.getAttribute('data-why-tab'))
        .filter((id) => Boolean(id) && cards.has(id));

    if (!tabOrder.length) return;

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let activeId = null;
    let autoIndex = 0;
    let autoTimer = null;
    let autoResumeTimeout = null;
    let userPaused = false;

    const progressTargets = new Map();
    deck.querySelectorAll('.why-progress').forEach((bar) => {
        const attr = bar.getAttribute('data-progress');
        const numeric = attr !== null ? Number.parseFloat(attr) : NaN;
        const target = Number.isFinite(numeric) ? `${Math.max(0, Math.min(numeric, 100))}%` : '100%';
        progressTargets.set(bar, target);
        bar.style.setProperty('--progress-current', prefersReducedMotion ? target : '0%');
    });

    const clearAutoResume = () => {
        if (autoResumeTimeout !== null) {
            window.clearTimeout(autoResumeTimeout);
            autoResumeTimeout = null;
        }
    };

    const stopAuto = () => {
        if (autoTimer !== null) {
            window.clearInterval(autoTimer);
            autoTimer = null;
        }
        clearAutoResume();
    };

    const startAuto = () => {
        if (prefersReducedMotion || tabOrder.length <= 1) return;
        if (autoTimer !== null) return;
        autoTimer = window.setInterval(() => {
            autoIndex = (autoIndex + 1) % tabOrder.length;
            const nextId = tabOrder[autoIndex];
            setActive(nextId, { source: 'auto' });
        }, 7000);
    };

    const scheduleAuto = (delay = 7500) => {
        if (prefersReducedMotion || tabOrder.length <= 1) return;
        clearAutoResume();
        autoResumeTimeout = window.setTimeout(() => {
            autoResumeTimeout = null;
            userPaused = false;
            startAuto();
        }, delay);
    };

    const animateProgress = (card) => {
        if (prefersReducedMotion) return;
        const bars = Array.from(card.querySelectorAll('.why-progress'));
        if (!bars.length) return;
        window.requestAnimationFrame(() => {
            bars.forEach((bar) => {
                const target = progressTargets.get(bar) || '100%';
                bar.style.setProperty('--progress-current', '0%');
                window.requestAnimationFrame(() => {
                    bar.style.setProperty('--progress-current', target);
                });
            });
        });
    };

    const setActive = (id, options = {}) => {
        if (!id || !cards.has(id)) return;
        const { source = 'auto', focusTab = false } = options;

        if (activeId === id) {
            if (source === 'click' || source === 'key') {
                userPaused = true;
                stopAuto();
                scheduleAuto(10000);
            }
            return;
        }

        activeId = id;
        autoIndex = tabOrder.indexOf(id);
        if (autoIndex < 0) autoIndex = 0;

        tabs.forEach((tab) => {
            const tabId = tab.getAttribute('data-why-tab');
            const isActive = tabId === id;
            tab.classList.toggle('is-active', isActive);
            tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
            tab.setAttribute('tabindex', isActive ? '0' : '-1');
            if (isActive && focusTab) {
                tab.focus({ preventScroll: true });
            }
        });

        cards.forEach((card, cardId) => {
            const isActive = cardId === id;
            card.classList.toggle('is-active', isActive);
            if (isActive) {
                card.removeAttribute('aria-hidden');
                animateProgress(card);
            } else {
                card.setAttribute('aria-hidden', 'true');
            }
        });

        if (source === 'click' || source === 'key') {
            userPaused = true;
            stopAuto();
            scheduleAuto(10000);
        }
    };

    const activateByOffset = (offset) => {
        if (!tabOrder.length) return;
        const currentIndex = activeId ? tabOrder.indexOf(activeId) : 0;
        const nextIndex = (currentIndex + offset + tabOrder.length) % tabOrder.length;
        setActive(tabOrder[nextIndex], { source: 'key', focusTab: true });
    };

    tabs.forEach((tab) => {
        const id = tab.getAttribute('data-why-tab');
        tab.setAttribute('tabindex', tab.classList.contains('is-active') ? '0' : '-1');

        tab.addEventListener('click', () => {
            if (!id) return;
            setActive(id, { source: 'click' });
        });

        tab.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                event.preventDefault();
                activateByOffset(1);
            } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                event.preventDefault();
                activateByOffset(-1);
            } else if (event.key === 'Home') {
                event.preventDefault();
                setActive(tabOrder[0], { source: 'key', focusTab: true });
            } else if (event.key === 'End') {
                event.preventDefault();
                setActive(tabOrder[tabOrder.length - 1], { source: 'key', focusTab: true });
            }
        });
    });

    deck.addEventListener('mouseenter', () => {
        if (!prefersReducedMotion) {
            stopAuto();
        }
    });

    deck.addEventListener('mouseleave', () => {
        if (prefersReducedMotion) return;
        if (deck.contains(document.activeElement)) return;
        if (userPaused) {
            scheduleAuto(10000);
        } else {
            scheduleAuto();
        }
    });

    deck.addEventListener('focusin', () => {
        stopAuto();
    });

    deck.addEventListener('focusout', () => {
        if (prefersReducedMotion) return;
        window.requestAnimationFrame(() => {
            if (deck.contains(document.activeElement)) return;
            if (userPaused) {
                scheduleAuto(10000);
            } else {
                scheduleAuto();
            }
        });
    });

    document.addEventListener('visibilitychange', () => {
        if (prefersReducedMotion) return;
        if (document.hidden) {
            stopAuto();
        } else if (!deck.matches(':hover') && !deck.contains(document.activeElement)) {
            if (userPaused) {
                scheduleAuto(10000);
            } else {
                startAuto();
            }
        }
    });

    window.addEventListener('blur', () => {
        if (!prefersReducedMotion) {
            stopAuto();
        }
    });

    window.addEventListener('focus', () => {
        if (prefersReducedMotion) return;
        if (deck.matches(':hover') || deck.contains(document.activeElement)) return;
        if (userPaused) {
            scheduleAuto(10000);
        } else {
            startAuto();
        }
    });

    setActive(tabOrder[0], { source: 'init' });
    startAuto();
}

function initWhoIsWordsworth() {
    const section = document.querySelector('.whois-wordsworth');
    if (!section) return;

    const frame = section.querySelector('.whois-frame');
    const cards = Array.from(section.querySelectorAll('.whois-card'));
    if (!frame || !cards.length) return;

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let activeCard = null;
    let animationFrame = null;

    const setTilt = (xDeg, yDeg) => {
        frame.style.setProperty('--whois-tilt-x', `${xDeg}deg`);
        frame.style.setProperty('--whois-tilt-y', `${yDeg}deg`);
    };

    setTilt(0, 0);

    const updateCardAria = (card, expanded) => {
        card.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        const body = card.querySelector('.whois-card-body');
        if (body) {
            body.setAttribute('aria-hidden', expanded ? 'false' : 'true');
        }
    };

    cards.forEach((card) => updateCardAria(card, false));

    const syncFrameActiveState = () => {
        frame.classList.toggle('has-active', Boolean(activeCard));
    };

    syncFrameActiveState();

    const activateCard = (card) => {
        if (activeCard === card) {
            deactivateActive();
            return;
        }

        if (activeCard) {
            activeCard.classList.remove('is-active');
            updateCardAria(activeCard, false);
        }

        activeCard = card;
        activeCard.classList.add('is-active');
        activeCard.style.setProperty('--card-float', '0px');
        updateCardAria(activeCard, true);
        syncFrameActiveState();
    };

    function deactivateActive() {
        if (!activeCard) return;
        const card = activeCard;
        card.classList.remove('is-active');
        card.style.setProperty('--card-float', '0px');
        updateCardAria(card, false);
        activeCard = null;
        syncFrameActiveState();
    }

    const handlePointerMove = (event) => {
        if (prefersReducedMotion || event.pointerType === 'touch') return;
        const rect = frame.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const xRatio = (event.clientX - rect.left) / rect.width - 0.5;
        const yRatio = (event.clientY - rect.top) / rect.height - 0.5;
        const tiltX = Math.max(-10, Math.min(10, (-yRatio) * 18));
        const tiltY = Math.max(-16, Math.min(16, xRatio * 22));
        setTilt(tiltX.toFixed(2), tiltY.toFixed(2));
    };

    const handlePointerLeave = () => {
        if (prefersReducedMotion) return;
        setTilt(0, 0);
    };

    cards.forEach((card) => {
        card.addEventListener('click', () => activateCard(card));
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                activateCard(card);
            } else if (event.key === 'Escape' && card === activeCard) {
                event.preventDefault();
                deactivateActive();
                card.blur();
            }
        });
    });

    frame.addEventListener('pointermove', handlePointerMove);
    frame.addEventListener('pointerleave', handlePointerLeave);
    frame.addEventListener('pointercancel', handlePointerLeave);
    window.addEventListener('resize', handlePointerLeave);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            deactivateActive();
        }
    });

    document.addEventListener('click', (event) => {
        if (activeCard && !frame.contains(event.target)) {
            deactivateActive();
        }
    });

    const floatCards = (time) => {
        cards.forEach((card, index) => {
            if (card === activeCard) {
                card.style.setProperty('--card-float', '0px');
                return;
            }
            const bob = Math.sin(time * 0.0012 + index * 0.85) * 10;
            card.style.setProperty('--card-float', `${bob.toFixed(2)}px`);
        });
        animationFrame = requestAnimationFrame(floatCards);
    };

    const startFloating = () => {
        if (prefersReducedMotion) return;
        if (animationFrame !== null) return;
        animationFrame = requestAnimationFrame(floatCards);
    };

    const stopFloating = () => {
        if (animationFrame === null) return;
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
        cards.forEach((card) => card.style.setProperty('--card-float', '0px'));
    };

    if (!prefersReducedMotion) {
        startFloating();
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopFloating();
            } else {
                startFloating();
            }
        });
    }
}
function initGlobe() {
    const canvas = document.getElementById('globeCanvas');
    const panelEl = document.getElementById('globePanel');
    const watchBtn = document.getElementById('panelWatch');
    const nameEl = document.getElementById('panelName');
    const levelEl = document.getElementById('panelLevel');
    const countryEl = document.getElementById('panelCountry');
    const quoteEl = document.getElementById('panelQuote');
    const photoEl = document.getElementById('panelPhoto');
    const flagEl = document.getElementById('panelFlag');
    const fullscreenBtn = document.getElementById('globeFullscreen');
    const stageEl = canvas ? canvas.parentElement : null;

    const modalEl = document.getElementById('testimonialModal');
    const modalCloseBtn = document.getElementById('testimonialClose');
    const modalVideo = document.getElementById('testimonialVideo');
    const modalNameEl = document.getElementById('testimonialName');
    const modalQuoteEl = document.getElementById('testimonialQuote');

    if (!canvas || !panelEl || !watchBtn || !nameEl || !levelEl || !countryEl || !quoteEl || !photoEl || !flagEl) {
        return;
    }

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.physicallyCorrectLights = true;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 400);
    camera.position.set(0, 0.25, 4.2);
    scene.add(camera);

    const controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 2.2;
    controls.maxDistance = 6;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;

    const clock = new THREE.Clock();

    let pseudoFullscreen = false;
    let pendingTestimonial = null;

    const getNativeFullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;

    const isStageFullscreen = () => {
        const fullscreenElement = getNativeFullscreenElement();
        return fullscreenElement === stageEl || pseudoFullscreen;
    };

    const enterStageFullscreen = () => {
        if (!stageEl) return;
        const request = stageEl.requestFullscreen || stageEl.webkitRequestFullscreen || stageEl.mozRequestFullScreen || stageEl.msRequestFullscreen;
        if (request) {
            try {
                const result = request.call(stageEl);
                if (result && typeof result.then === 'function') {
                    result.catch(() => {
                        pseudoFullscreen = true;
                        stageEl.classList.add('is-fullscreen');
                        document.body.classList.add('globe-fullscreen-active');
                        updateFullscreenState();
                    });
                }
                return;
            } catch (error) {
                // ignore
            }
        }
        pseudoFullscreen = true;
        stageEl.classList.add('is-fullscreen');
        document.body.classList.add('globe-fullscreen-active');
        updateFullscreenState();
    };

    const exitStageFullscreen = () => {
        const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
        if (exit) {
            try {
                const result = exit.call(document);
                if (result && typeof result.then === 'function') {
                    result.catch(() => {
                        pseudoFullscreen = false;
                        stageEl?.classList.remove('is-fullscreen');
                        document.body.classList.remove('globe-fullscreen-active');
                        updateFullscreenState();
                    });
                }
                return;
            } catch (error) {
                // ignore
            }
        }
        pseudoFullscreen = false;
        stageEl?.classList.remove('is-fullscreen');
        document.body.classList.remove('globe-fullscreen-active');
        updateFullscreenState();
    };

    const updateFullscreenState = () => {
        const nativeElement = getNativeFullscreenElement();
        if (nativeElement === stageEl) {
            pseudoFullscreen = false;
        }
        const active = nativeElement === stageEl || pseudoFullscreen;
        if (stageEl) {
            stageEl.classList.toggle('is-fullscreen', active);
        }
        if (fullscreenBtn) {
            fullscreenBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
            fullscreenBtn.setAttribute('aria-label', active ? 'Exit fullscreen globe view' : 'Enter fullscreen globe view');
        }
        document.body.classList.toggle('globe-fullscreen-active', active);
        handleResize();
        requestAnimationFrame(() => handleResize());
        window.setTimeout(() => handleResize(), 160);
        // Only scroll to globe section if actually exiting fullscreen due to user action, not on every state change
        if (!active && document.fullscreenElement !== null && document.fullscreenElement !== undefined) {
            stageEl?.scrollIntoView({ block: 'start', behavior: 'instant' });
            if (pendingTestimonial) {
                openTestimonial(pendingTestimonial.student, pendingTestimonial.priorAutoRotate);
                pendingTestimonial = null;
            }
        }
    };

    if (fullscreenBtn && stageEl) {
        fullscreenBtn.addEventListener('click', () => {
            if (isStageFullscreen()) {
                exitStageFullscreen();
            } else {
                enterStageFullscreen();
            }
        });
    }

    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach((eventName) => {
        document.addEventListener(eventName, updateFullscreenState);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && pseudoFullscreen) {
            pseudoFullscreen = false;
            stageEl?.classList.remove('is-fullscreen');
            document.body.classList.remove('globe-fullscreen-active');
            updateFullscreenState();
        }
    });

    updateFullscreenState();

    const textureLoader = new THREE.TextureLoader();

    const assetUrl = (relativePath) => new URL(relativePath, document.baseURI).href;

    const scriptEl = document.currentScript || document.querySelector('script[src*="scripts/main.js"]');
    const scriptBase = scriptEl ? new URL(scriptEl.getAttribute('src'), window.location.href) : null;
    const scriptDir = scriptBase ? new URL('.', scriptBase) : null;
    const resolveFromScript = (relativePath) => {
        if (scriptDir) {
            return new URL(relativePath, scriptDir).href;
        }
        return assetUrl(relativePath.replace(/^\.\//, ''));
    };

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const markerRoot = new THREE.Group();
    markerRoot.name = 'markerRoot';
    globeGroup.add(markerRoot);

    const sphereGeometry = new THREE.SphereGeometry(1, 128, 128);
    const sphereMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        shininess: 12,
        specular: new THREE.Color(0x333333),
        emissive: new THREE.Color(0x000000),
        emissiveIntensity: 0.32
    });

    const nightUniforms = {
        sunDirection: { value: new THREE.Vector3(1, 0, 0) }
    };

    const nightMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0,
        map: null
    });

    nightMaterial.onBeforeCompile = (shader) => {
        shader.uniforms.sunDirection = nightUniforms.sunDirection;

        shader.vertexShader = shader.vertexShader.replace(
            'void main() {',
            'varying vec3 vWorldNormal;\nvoid main() {'
        );

        shader.vertexShader = shader.vertexShader.replace(
            '#include <defaultnormal_vertex>',
            '#include <defaultnormal_vertex>\n\tvWorldNormal = normalize( mat3( modelMatrix ) * objectNormal );'
        );

        shader.fragmentShader = shader.fragmentShader.replace(
            'void main() {',
            'varying vec3 vWorldNormal;\nuniform vec3 sunDirection;\nvoid main() {'
        );

        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <map_fragment>',
            `#include <map_fragment>
        vec3 lightDir = normalize(sunDirection);
        float sunDot = dot(normalize(vWorldNormal), lightDir);
        float nightFactor = 1.0 - smoothstep(-0.1, 0.05, sunDot);
        nightFactor = clamp(nightFactor, 0.0, 1.0);
        diffuseColor.rgb *= nightFactor;
        diffuseColor.a *= nightFactor;
        `
        );

        nightMaterial.userData.shader = shader;
    };
    nightMaterial.needsUpdate = true;

    const updateNightUniform = (direction) => {
        nightUniforms.sunDirection.value.copy(direction);
        if (nightMaterial.userData.shader) {
            nightMaterial.userData.shader.uniforms.sunDirection.value.copy(direction);
        }
    };
    updateNightUniform(nightUniforms.sunDirection.value);

    const enableCelestialBodies = false;
    const enableMoon = false;

    const earthColorLocal = resolveFromScript('../assets/images/earthmap.jpg');
    const earthColorFallback = 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg';
    const earthBumpLocal = resolveFromScript('../assets/images/earthbump.jpg');
    const earthBumpFallback = 'https://threejs.org/examples/textures/planets/earth_bump.jpg';
    const earthNightPrimaryUrl = 'https://raw.githubusercontent.com/ajaymt/earth-night-texture/main/earth_night_4k.jpg';
    const earthNightFallbackUrl = 'https://threejs.org/examples/textures/planets/earth_lights_2048.png';

    let starfield = null;
    let spaceBackdrop = null;
    let nightMesh = null;
    let focusAnimationId = null;
    let autoRotateTimeout = null;
    let hoveredMarker = null;
    let activeMarker = null;
    let activeStudent = null;
    let hoverAutoRotateActive = false;
    let isPointerDown = false;
    let lastAutoRotateState = true;

    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    const resumeAutoRotate = (delay = 4000) => {
        if (autoRotateTimeout) {
            window.clearTimeout(autoRotateTimeout);
        }
        autoRotateTimeout = window.setTimeout(() => {
            if (!hoverAutoRotateActive && !isPointerDown) {
                controls.autoRotate = true;
            }
            autoRotateTimeout = null;
        }, delay);
    };

    const closeTestimonial = (restoreAutoRotate = true) => {
        if (!modalEl) return;

        modalEl.setAttribute('aria-hidden', 'true');
        modalEl.classList.remove('is-open');
        document.body.classList.remove('modal-open');

        if (modalVideo) {
            modalVideo.pause();
            modalVideo.currentTime = 0;
            modalVideo.removeAttribute('src');
            modalVideo.load();
        }

        if (restoreAutoRotate) {
            hoverAutoRotateActive = false;
            controls.autoRotate = lastAutoRotateState;
            resumeAutoRotate(1800);
        }
    };

    const openTestimonial = (student, priorAutoRotate = true) => {
        if (!modalEl || !student) return;

        lastAutoRotateState = priorAutoRotate;

        if (modalNameEl) modalNameEl.textContent = student.name || 'Learner story';
        if (modalQuoteEl) modalQuoteEl.textContent = student.quote || '';

        if (modalVideo) {
            modalVideo.pause();
            modalVideo.removeAttribute('src');
            modalVideo.load();
            if (student.video) {
                modalVideo.src = student.video;
                modalVideo.load();
                modalVideo.play().catch(() => {});
            }
        }

        modalEl.classList.add('is-open');
        modalEl.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');

        hoverAutoRotateActive = true;
        controls.autoRotate = false;
    };

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => closeTestimonial(true));
    }

    if (modalEl) {
        modalEl.addEventListener('click', (event) => {
            if (event.target === modalEl || (event.target instanceof HTMLElement && event.target.classList.contains('modal-backdrop'))) {
                closeTestimonial(true);
            }
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modalEl && modalEl.classList.contains('is-open')) {
            closeTestimonial(true);
        }
    });

    canvas.style.cursor = 'grab';
    const earthSpecularUrl = 'https://threejs.org/examples/textures/planets/earth_specular_2048.jpg';

    function loadTexture(url, onSuccess, onFailure) {
        textureLoader.load(url, onSuccess, undefined, onFailure);
    }

    function loadTextureWithFallback(primaryUrl, fallbackUrl, onSuccess) {
        loadTexture(primaryUrl, onSuccess, fallbackUrl ? () => {
            loadTexture(fallbackUrl, onSuccess, () => {});
        } : () => {});
    }

    const loadEarthColor = (url, fallback) => {
        loadTexture(url, (texture) => {
            texture.encoding = THREE.sRGBEncoding;
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            sphereMaterial.map = texture;
            sphereMaterial.needsUpdate = true;
        }, () => {
            if (fallback) loadEarthColor(fallback, null);
        });
    };

    const loadEarthBump = (url, fallback) => {
        loadTexture(url, (texture) => {
            sphereMaterial.bumpMap = texture;
            sphereMaterial.bumpScale = 0.015;
            sphereMaterial.needsUpdate = true;
        }, () => {
            if (fallback) loadEarthBump(fallback, null);
        });
    };

    loadEarthColor(earthColorLocal, earthColorFallback);
    loadEarthBump(earthBumpLocal, earthBumpFallback);

    loadTextureWithFallback(earthNightPrimaryUrl, earthNightFallbackUrl, (texture) => {
        texture.encoding = THREE.sRGBEncoding;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        sphereMaterial.emissiveMap = texture;
        sphereMaterial.emissive = new THREE.Color(0xffffff);
        sphereMaterial.emissiveIntensity = 0.38;
        sphereMaterial.needsUpdate = true;

        nightMaterial.map = texture;
        nightMaterial.opacity = 0.78;
        nightMaterial.needsUpdate = true;
        if (nightMesh) nightMesh.visible = true;
    });

    loadTexture(earthSpecularUrl, (texture) => {
        texture.encoding = THREE.sRGBEncoding;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        sphereMaterial.specularMap = texture;
        sphereMaterial.shininess = 12;
        sphereMaterial.needsUpdate = true;
    });

    function createRadialTexture(innerColor, outerColor, size = 256) {
        const canvasEl = document.createElement('canvas');
        canvasEl.width = canvasEl.height = size;
        const ctx = canvasEl.getContext('2d');
        if (!ctx) return null;

        const gradient = ctx.createRadialGradient(size / 2, size / 2, size * 0.1, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, innerColor);
        gradient.addColorStop(1, outerColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        const texture = new THREE.CanvasTexture(canvasEl);
        texture.encoding = THREE.sRGBEncoding;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        return texture;
    }

    function createSolidTexture(color) {
        const canvasEl = document.createElement('canvas');
        canvasEl.width = canvasEl.height = 4;
        const ctx = canvasEl.getContext('2d');
        if (!ctx) return null;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
        const texture = new THREE.CanvasTexture(canvasEl);
        texture.encoding = THREE.sRGBEncoding;
        texture.generateMipmaps = false;
        texture.needsUpdate = true;
        return texture;
    }

    function kelvinToThreeColor(kelvin, target = new THREE.Color()) {
        const temp = THREE.MathUtils.clamp(kelvin, 1000, 40000) / 100;
        let red;
        let green;
        let blue;

        if (temp <= 66) {
            red = 255;
            green = 99.4708025861 * Math.log(temp) - 161.1195681661;
            blue = temp <= 19 ? 0 : 138.5177312231 * Math.log(temp - 10) - 305.0447927307;
        } else {
            red = 329.698727446 * Math.pow(temp - 60, -0.1332047592);
            green = 288.1221695283 * Math.pow(temp - 60, -0.0755148492);
            blue = 255;
        }

        target.setRGB(
            THREE.MathUtils.clamp(red, 0, 255) / 255,
            THREE.MathUtils.clamp(green, 0, 255) / 255,
            THREE.MathUtils.clamp(blue, 0, 255) / 255
        );

        return target;
    }

    function createStarfield(count = 700) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const color = new THREE.Color();

        for (let i = 0; i < count; i++) {
            const radius = THREE.MathUtils.randFloat(24, 46);
            const theta = THREE.MathUtils.randFloat(0, Math.PI);
            const phi = THREE.MathUtils.randFloat(0, Math.PI * 2);

            const sinTheta = Math.sin(theta);
            positions[i * 3] = radius * sinTheta * Math.cos(phi);
            positions[i * 3 + 1] = radius * Math.cos(theta);
            positions[i * 3 + 2] = radius * sinTheta * Math.sin(phi);

            const hue = THREE.MathUtils.randFloat(0.55, 0.72);
            const saturation = THREE.MathUtils.randFloat(0.25, 0.6);
            const lightness = THREE.MathUtils.randFloat(0.55, 0.95);
            color.setHSL(hue, saturation, lightness);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.32,
            sizeAttenuation: true,
            vertexColors: true,
            depthWrite: false,
            transparent: true,
            opacity: 0.92,
            blending: THREE.AdditiveBlending
        });

        const points = new THREE.Points(geometry, material);
        points.name = 'starfield';
        return points;
    }

    function createSpaceBackdrop() {
        const radius = 54;
        const geometry = new THREE.SphereGeometry(radius, 64, 64);
        geometry.scale(-1, 1, 1);

        const canvasEl = document.createElement('canvas');
        canvasEl.width = 2048;
        canvasEl.height = 1024;
        const ctx = canvasEl.getContext('2d');

        if (ctx) {
            const gradient = ctx.createLinearGradient(0, 0, 0, canvasEl.height);
            gradient.addColorStop(0, '#071025');
            gradient.addColorStop(0.5, '#020714');
            gradient.addColorStop(1, '#000209');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

            ctx.globalCompositeOperation = 'lighter';
            const nebulaPalette = ['rgba(73,136,255,0.08)', 'rgba(141,92,255,0.07)', 'rgba(78,227,255,0.05)'];
            for (let i = 0; i < 110; i++) {
                const cx = Math.random() * canvasEl.width;
                const cy = Math.random() * canvasEl.height;
                const radiusPx = Math.random() * 220 + 60;
                const nebulaGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radiusPx);
                const colorIdx = Math.floor(Math.random() * nebulaPalette.length);
                nebulaGradient.addColorStop(0, nebulaPalette[colorIdx]);
                nebulaGradient.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = nebulaGradient;
                ctx.beginPath();
                ctx.arc(cx, cy, radiusPx, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalCompositeOperation = 'source-over';
        }

        const texture = new THREE.CanvasTexture(canvasEl);
        texture.encoding = THREE.sRGBEncoding;
        texture.anisotropy = 4;

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide,
            depthWrite: false,
            transparent: true,
            opacity: 0.96
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = 'spaceBackdrop';
        return mesh;
    }

    const earthMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    globeGroup.add(earthMesh);
    earthMesh.add(markerRoot);

    nightMesh = new THREE.Mesh(sphereGeometry.clone(), nightMaterial);
    nightMesh.name = 'earthNightOverlay';
    nightMesh.scale.setScalar(1.001);
    nightMesh.visible = false;
    earthMesh.add(nightMesh);

    spaceBackdrop = createSpaceBackdrop();
    starfield = createStarfield(900);
    scene.add(spaceBackdrop);
    scene.add(starfield);

    let sunGroup = null;
    let sunCoreMaterial = null;
    let sunCoreMesh = null;
    let sunGlow = null;
    let sunCoronaInner = null;
    let sunCoronaOuter = null;
    let sunLight = null;
    let sunLightTarget = null;
    let moonCoreMaterial = null;
    let moonCoreMesh = null;
    let moonGlow = null;
    let moonHalo = null;
    let moonLight = null;

    if (enableCelestialBodies) {
        sunGroup = new THREE.Group();
        scene.add(sunGroup);

        const sunSurfacePrimaryUrl = 'https://www.solarsystemscope.com/textures/download/4k_sun.jpg';
        const sunSurfaceFallbackUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/r155/examples/textures/planets/sun.jpg';
        const sunNormalUrl = 'https://raw.githubusercontent.com/nicoptere/ashima-noise-webgl/master/img/sun-normal.jpg';
        const sunCoreGeometry = new THREE.SphereGeometry(0.8, 96, 96);
        const sunFallbackTexture = createRadialTexture('rgba(255, 252, 210, 1)', 'rgba(255, 170, 60, 0)');
        sunFallbackTexture.wrapS = sunFallbackTexture.wrapT = THREE.RepeatWrapping;
        sunFallbackTexture.center.set(0.5, 0.5);
        sunCoreMaterial = new THREE.MeshPhysicalMaterial({
            map: sunFallbackTexture,
            color: 0xffffff,
            emissive: new THREE.Color(0xfff7d6),
            emissiveMap: sunFallbackTexture,
            emissiveIntensity: 3.6,
            roughness: 0.12,
            metalness: 0.0,
            clearcoat: 1.0,
            clearcoatRoughness: 0.18
        });

        sunCoreMesh = new THREE.Mesh(sunCoreGeometry, sunCoreMaterial);
        sunGroup.add(sunCoreMesh);

        loadTextureWithFallback(sunSurfacePrimaryUrl, sunSurfaceFallbackUrl, (texture) => {
            texture.encoding = THREE.sRGBEncoding;
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            texture.center.set(0.5, 0.5);
            sunCoreMaterial.map = texture;
            sunCoreMaterial.emissiveMap = texture;
            sunCoreMaterial.needsUpdate = true;
        });

        loadTexture(sunNormalUrl, (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            texture.center.set(0.5, 0.5);
            sunCoreMaterial.normalMap = texture;
            sunCoreMaterial.normalScale = new THREE.Vector2(0.6, 0.6);
            sunCoreMaterial.needsUpdate = true;
        }, () => {});

        const sunGlowGeometry = new THREE.SphereGeometry(2.4, 48, 48);
    const sunGlowTexture = createRadialTexture('rgba(255, 245, 210, 0.75)', 'rgba(255, 190, 90, 0)');
        const sunGlowMaterial = new THREE.MeshBasicMaterial({
            map: sunGlowTexture,
            color: 0xffffff,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });
        sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);

    const sunCoronaInnerTexture = createRadialTexture('rgba(255, 238, 210, 0.5)', 'rgba(255, 208, 120, 0)');
    const sunCoronaOuterTexture = createRadialTexture('rgba(255, 210, 120, 0.18)', 'rgba(255, 170, 60, 0)');
        const sunCoronaInnerMaterial = new THREE.SpriteMaterial({
            map: sunCoronaInnerTexture,
            color: 0xffffff,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: false,
            opacity: 0.48
        });
        const sunCoronaOuterMaterial = new THREE.SpriteMaterial({
            map: sunCoronaOuterTexture,
            color: 0xffffff,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: false,
            opacity: 0.28
        });
        sunCoronaInner = new THREE.Sprite(sunCoronaInnerMaterial);
        sunCoronaInner.scale.set(4.2, 4.2, 1);
        sunCoronaOuter = new THREE.Sprite(sunCoronaOuterMaterial);
        sunCoronaOuter.scale.set(6.4, 6.4, 1);

    sunLight = new THREE.DirectionalLight(0xfff7d0, 2.4);
        sunLightTarget = new THREE.Object3D();

    sunGlow.material.opacity = 0.5;
        sunGroup.add(sunGlow);
        sunGroup.add(sunCoronaOuter);
        sunGroup.add(sunCoronaInner);
        sunGroup.add(sunLight);
        scene.add(sunLightTarget);
        sunLight.target = sunLightTarget;

        if (enableMoon) {
            moonGroup = new THREE.Group();
            scene.add(moonGroup);

            const moonSurfacePrimaryUrl = 'https://www.solarsystemscope.com/textures/download/4k_moon.jpg';
            const moonSurfaceFallbackUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/r155/examples/textures/planets/moon_1024.jpg';
            const moonBumpPrimaryUrl = 'https://www.solarsystemscope.com/textures/download/4k_moon_bump.jpg';
            const moonBumpFallbackUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/r155/examples/textures/planets/moon_bump.jpg';
            const moonNormalPrimaryUrl = 'https://www.solarsystemscope.com/textures/download/4k_moon_normal.jpg';
            const moonNormalFallbackUrl = 'https://raw.githubusercontent.com/mwskwong/space-textures/main/moon_normal_1k.jpg';
            const moonSpecularPrimaryUrl = 'https://www.solarsystemscope.com/textures/download/4k_moon_specular.jpg';
            const moonSpecularFallbackUrl = 'https://raw.githubusercontent.com/mwskwong/space-textures/main/moon_specular_1k.jpg';
            const moonCoreGeometry = new THREE.SphereGeometry(0.27, 64, 64);
            const moonFallbackTexture = createRadialTexture('rgba(230, 230, 224, 1)', 'rgba(150, 150, 150, 0)');
            moonFallbackTexture.wrapS = moonFallbackTexture.wrapT = THREE.RepeatWrapping;
            moonFallbackTexture.center.set(0.5, 0.5);
            moonCoreMaterial = new THREE.MeshStandardMaterial({
                map: moonFallbackTexture,
                color: 0xffffff,
                roughness: 0.9,
                metalness: 0.03,
                emissive: new THREE.Color(0x080808),
                emissiveIntensity: 0.06
            });

            moonCoreMesh = new THREE.Mesh(moonCoreGeometry, moonCoreMaterial);
            moonGroup.add(moonCoreMesh);

            loadTextureWithFallback(moonSurfacePrimaryUrl, moonSurfaceFallbackUrl, (texture) => {
                texture.encoding = THREE.sRGBEncoding;
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
                texture.center.set(0.5, 0.5);
                moonCoreMaterial.map = texture;
                moonCoreMaterial.needsUpdate = true;
            });

            loadTextureWithFallback(moonBumpPrimaryUrl, moonBumpFallbackUrl, (texture) => {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
                moonCoreMaterial.bumpMap = texture;
                moonCoreMaterial.bumpScale = 0.05;
                moonCoreMaterial.needsUpdate = true;
            });

            loadTextureWithFallback(moonNormalPrimaryUrl, moonNormalFallbackUrl, (texture) => {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
                moonCoreMaterial.normalMap = texture;
                moonCoreMaterial.normalScale = new THREE.Vector2(0.34, 0.34);
                moonCoreMaterial.needsUpdate = true;
            });

            loadTextureWithFallback(moonSpecularPrimaryUrl, moonSpecularFallbackUrl, (texture) => {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
                moonCoreMaterial.metalnessMap = texture;
                moonCoreMaterial.roughnessMap = texture;
                moonCoreMaterial.needsUpdate = true;
            });

            const moonGlowGeometry = new THREE.SphereGeometry(0.72, 32, 32);
            const moonGlowTexture = createRadialTexture('rgba(200, 220, 255, 0.28)', 'rgba(150, 170, 200, 0)');
            const moonGlowMaterial = new THREE.MeshBasicMaterial({
                map: moonGlowTexture,
                transparent: true,
                opacity: 0.3,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                side: THREE.DoubleSide
            });

            moonGlow = new THREE.Mesh(moonGlowGeometry, moonGlowMaterial);
            moonGroup.add(moonGlow);

            const moonHaloTexture = createRadialTexture('rgba(170, 200, 255, 0.4)', 'rgba(120, 160, 255, 0)');
            const moonHaloMaterial = new THREE.SpriteMaterial({
                map: moonHaloTexture,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                depthTest: false,
                opacity: 0.25
            });
            moonHalo = new THREE.Sprite(moonHaloMaterial);
            moonHalo.scale.set(1.4, 1.4, 1);
            moonGroup.add(moonHalo);

            moonLight = new THREE.PointLight(0xcceeff, 0.18, 70);
            moonGroup.add(moonLight);
        }
    }

    const ambientLight = new THREE.AmbientLight(0x101828, 0.35);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.6);
    directionalLight.position.set(5, 3, 5);
    const directionalLightTarget = new THREE.Object3D();
    scene.add(directionalLight);
    scene.add(directionalLightTarget);
    directionalLight.target = directionalLightTarget;

    const sunlightColor = new THREE.Color();
    const ambientSkyColor = new THREE.Color();

    const SUN_DISTANCE = 120;
    const MOON_DISTANCE_MIN = 12;
    const MOON_DISTANCE_MAX = 18;
    const SUN_LERP = 0.05;
    const MOON_LERP = 0.08;
    const SUN_ROTATION_SPEED = 0.00022;
    const MOON_ROTATION_SPEED = 0.00035;
    const DEG2RAD = Math.PI / 180;
    const OBSERVER_LAT = 3.139 * DEG2RAD;
    const OBSERVER_LON = 101.6869 * DEG2RAD;

    const observerUp = new THREE.Vector3();
    const observerEast = new THREE.Vector3();
    const observerNorth = new THREE.Vector3();

    (function initializeObserverBasis() {
        const sinLat = Math.sin(OBSERVER_LAT);
        const cosLat = Math.cos(OBSERVER_LAT);
        const sinLon = Math.sin(OBSERVER_LON);
        const cosLon = Math.cos(OBSERVER_LON);

        const upEcef = new THREE.Vector3(cosLat * cosLon, cosLat * sinLon, sinLat);
        const eastEcef = new THREE.Vector3(-sinLon, cosLon, 0);
        const northEcef = new THREE.Vector3(-sinLat * cosLon, -sinLat * sinLon, cosLat);

        observerUp.set(upEcef.x, upEcef.z, -upEcef.y).normalize();
        observerEast.set(eastEcef.x, eastEcef.z, -eastEcef.y).normalize();
        observerNorth.set(northEcef.x, northEcef.z, -northEcef.y).normalize();
    })();

    const levelColors = {
        beginner: 0x3db8ff,
        intermediate: 0xffa500,
        advanced: 0x7c4dff
    };

    const defaultPhoto = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=256&q=80';
    const flagPlaceholderTexture = createSolidTexture('#ffffff');
    const flagTextureCache = new Map();

    function loadCircularFlagTexture(url, size = 256) {
        if (!url) return Promise.resolve(flagPlaceholderTexture);
        if (flagTextureCache.has(url)) return flagTextureCache.get(url);

        const promise = new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.referrerPolicy = 'no-referrer';
            img.onload = () => {
                const canvasEl = document.createElement('canvas');
                canvasEl.width = size;
                canvasEl.height = size;
                const ctx = canvasEl.getContext('2d');
                if (!ctx) {
                    resolve(flagPlaceholderTexture);
                    return;
                }

                ctx.clearRect(0, 0, size, size);
                ctx.save();
                ctx.beginPath();
                ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();

                const minSide = Math.min(img.width, img.height);
                const sx = (img.width - minSide) / 2;
                const sy = (img.height - minSide) / 2;
                ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
                ctx.restore();

                const texture = new THREE.CanvasTexture(canvasEl);
                texture.encoding = THREE.sRGBEncoding;
                texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
                texture.needsUpdate = true;
                resolve(texture);
            };
            img.onerror = () => resolve(flagPlaceholderTexture);
            img.src = url;
        });

        flagTextureCache.set(url, promise);
        return promise;
    }

    const learners = [
        {
            country: 'Malaysia',
            city: 'Kuala Lumpur',
            name: 'Wordsworth English Centre',
            level: '',
            levelKey: '',
            focus: '',
            lat: 3.139,
            lon: 101.6869,
            quote: 'This is the country of our English center. Welcome to Wordsworth Language Centre in Kuala Lumpur!',
            flag: 'https://flagcdn.com/w40/my.png',
            photo: 'assets/images/ss.png',
            video: ''
        },
        {
            country: 'Saudi Arabia',
            city: 'Riyadh',
            name: 'Ahmed Al Rashid',
            level: 'Intermediate',
            levelKey: 'intermediate',
            focus: 'Business English',
            lat: 24.7136,
            lon: 46.6753,
            quote: 'I present to global clients confidently now—my coach made corporate stories click.',
            flag: 'https://flagcdn.com/w40/sa.png',
            photo: 'https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/user.svg',
                video: ''
        },
        {
            country: 'China',
            city: 'Beijing',
            name: 'Li Wei',
            level: 'Advanced',
            levelKey: 'advanced',
            focus: 'MBA Admissions',
            lat: 39.9042,
            lon: 116.4074,
            quote: 'Conversation labs made my storytelling crisp—my MBA interviewers noticed immediately.',
            flag: 'https://flagcdn.com/w40/cn.png',
            photo: 'https://ui-avatars.com/api/?name=Anonymous&background=cccccc&color=555555&size=256&rounded=true&format=png',
                video: ''
        },
        {
            country: 'Russia',
            city: 'Moscow',
            name: 'Elena Petrova',
            level: 'Beginner',
            levelKey: 'beginner',
            focus: 'Travel Fluency',
            lat: 55.7558,
            lon: 37.6173,
            quote: 'The immersive role plays helped me chat with locals on my very first solo trip.',
            flag: 'https://flagcdn.com/w40/ru.png',
            photo: 'https://ui-avatars.com/api/?name=Anonymous&background=cccccc&color=555555&size=256&rounded=true&format=png',
                video: ''
        },
        {
            country: 'South Korea',
            city: 'Busan',
            name: 'Minjun Park',
            level: 'Intermediate',
            levelKey: 'intermediate',
            focus: 'Aviation English',
            lat: 35.1796,
            lon: 129.0756,
            quote: 'Pronunciation labs matched exactly what airline assessors expect—now I brief crews with ease.',
            flag: 'https://flagcdn.com/w40/kr.png',
            photo: 'https://ui-avatars.com/api/?name=Anonymous&background=cccccc&color=555555&size=256&rounded=true&format=png',
                video: ''
        },
        {
            country: 'France',
            city: 'Lyon',
            name: 'Camille Dupont',
            level: 'Advanced',
            levelKey: 'advanced',
            focus: 'Public Speaking',
            lat: 45.7640,
            lon: 4.8357,
            quote: 'From script to stage, my coach guided every nuance—my TEDx talk felt effortless.',
            flag: 'https://flagcdn.com/w40/fr.png',
            photo: 'https://ui-avatars.com/api/?name=Anonymous&background=cccccc&color=555555&size=256&rounded=true&format=png',
            video: ''
        },
        {
            country: 'Republic of Yemen',
            city: 'Sana\'a',
            name: 'Ahmed Saleh',
            level: 'Intermediate',
            levelKey: 'intermediate',
            focus: 'IELTS',
            lat: 15.3694,
            lon: 44.1910,
            quote: 'The lessons helped me improve my speaking skills quickly.',
            flag: 'https://flagcdn.com/w40/ye.png',
            photo: 'https://ui-avatars.com/api/?name=Anonymous&background=cccccc&color=555555&size=256&rounded=true&format=png',
            video: ''
        },
        {
            country: 'Arab Republic of Egypt',
            city: 'Cairo',
            name: 'Mona Hassan',
            level: 'Advanced',
            levelKey: 'advanced',
            focus: 'Business English',
            lat: 30.0444,
            lon: 30.8,
            quote: 'I feel more confident in meetings at work now.',
            flag: 'https://flagcdn.com/w40/eg.png',
            photo: 'https://ui-avatars.com/api/?name=Anonymous&background=cccccc&color=555555&size=256&rounded=true&format=png',
            video: ''
        },
        {
            country: 'Republic of Chad',
            city: 'N\'Djamena',
            name: 'Fatima Mahamat',
            level: 'Beginner',
            levelKey: 'beginner',
            focus: 'General English',
            lat: 12.1348,
            lon: 15.0557,
            quote: 'The teachers are patient and make learning fun.',
            flag: 'https://flagcdn.com/w40/td.png',
            photo: 'https://ui-avatars.com/api/?name=Anonymous&background=cccccc&color=555555&size=256&rounded=true&format=png',
            video: ''
        },
        {
            country: 'State of Libya',
            city: 'Tripoli',
            name: 'Omar El-Masri',
            level: 'Intermediate',
            levelKey: 'intermediate',
            focus: 'Conversation',
            lat: 32.8872,
            lon: 13.1913,
            quote: 'I can finally have conversations with my friends abroad.',
            flag: 'https://flagcdn.com/w40/ly.png',
            photo: 'https://ui-avatars.com/api/?name=Anonymous&background=cccccc&color=555555&size=256&rounded=true&format=png',
            video: ''
        },
        {
            country: 'Kingdom of Morocco',
            city: 'Rabat',
            name: 'Sara Benali',
            level: 'Advanced',
            levelKey: 'advanced',
            focus: 'TOEFL',
            lat: 34.0209,
            lon: -6.8416,
            quote: 'The practice tests really prepared me for my exam.',
            flag: 'https://flagcdn.com/w40/ma.png',
            photo: 'https://ui-avatars.com/api/?name=Anonymous&background=cccccc&color=555555&size=256&rounded=true&format=png',
            video: ''
        },
        {
            country: 'State of Palestine',
            city: 'Ramallah',
            name: 'Yousef Barghouti',
            level: 'Intermediate',
            levelKey: 'intermediate',
            focus: 'Academic English',
            lat: 31.9038,
            lon: 35.7,
            quote: 'Now I can write essays much more easily.',
            flag: 'https://flagcdn.com/w40/ps.png',
            photo: 'https://ui-avatars.com/api/?name=Anonymous&background=cccccc&color=555555&size=256&rounded=true&format=png',
            video: ''
        },
        {
            country: 'Federal Republic of Somalia',
            city: 'Mogadishu',
            name: 'Amina Abdi',
            level: 'Beginner',
            levelKey: 'beginner',
            focus: 'General English',
            lat: 2.0469,
            lon: 45.3182,
            quote: 'I enjoy learning new words every day.',
            flag: 'https://flagcdn.com/w40/so.png',
            photo: 'https://ui-avatars.com/api/?name=Anonymous&background=cccccc&color=555555&size=256&rounded=true&format=png',
            video: ''
        }
    ];

    const markerGeometry = new THREE.SphereGeometry(0.022, 24, 24);
    const flagPlaneGeometry = new THREE.PlaneGeometry(0.22, 0.22);
    const markers = [];

    function latLonToVector(lat, lon, scale = 1) {
        const phi = THREE.MathUtils.degToRad(90 - lat);
        const theta = THREE.MathUtils.degToRad(lon + 180);
        const sinPhi = Math.sin(phi);
        const x = -scale * sinPhi * Math.cos(theta);
        const z = scale * sinPhi * Math.sin(theta);
        const y = scale * Math.cos(phi);
        return new THREE.Vector3(x, y, z);
    }

    function buildMarker(student, index) {
        const levelKey = student.levelKey || 'beginner';
        const color = levelColors[levelKey] || 0xffffff;

        const group = new THREE.Group();
        const baseColor = new THREE.Color(color);
        const pulseMaterial = new THREE.MeshStandardMaterial({
            color: baseColor,
            roughness: 0.35,
            metalness: 0.12,
            emissive: baseColor.clone().multiplyScalar(0.15),
            emissiveIntensity: 1.2,
            transparent: false
        });
        const pulseMesh = new THREE.Mesh(markerGeometry, pulseMaterial);
        group.add(pulseMesh);

        const flagMaterial = new THREE.MeshBasicMaterial({
            map: flagPlaceholderTexture,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide,
            depthWrite: false,
            depthTest: true,
            alphaTest: 0.4
        });
        const baseFlagScale = 0.55;
        const hoverFlagScale = 0.78;
        const flagMesh = new THREE.Mesh(flagPlaneGeometry, flagMaterial);
    flagMesh.position.set(0, 0.06, 0);
    flagMesh.rotation.x = Math.PI / 2;
        flagMesh.scale.setScalar(baseFlagScale);
        group.add(flagMesh);

        if (student.flag) {
            const highResFlag = student.flag.replace(/\/w\d+\//, '/w160/');
            loadCircularFlagTexture(highResFlag).then((texture) => {
                flagMaterial.map = texture;
                flagMaterial.needsUpdate = true;
            });
        }

        const surface = latLonToVector(student.lat, student.lon, 1.02);
        group.position.copy(surface);

        const outward = surface.clone().normalize();
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), outward);
        group.quaternion.copy(quaternion);

        group.userData = {
            student,
            pulseMesh,
            flagMesh,
            flagMaterial,
            pulseMaterial,
            pulseOffset: Math.random() * Math.PI * 2,
            isActive: false,
            color,
            flagBaseScale: baseFlagScale,
            flagHoverScale: hoverFlagScale
        };

        markers.push(group);
        return group;
    }

    learners.forEach((student, index) => {
        const marker = buildMarker(student, index);
        markerRoot.add(marker);
    });

    const targetTemp = new THREE.Vector3();
    const cameraTemp = new THREE.Vector3();
    const worldMarkerPos = new THREE.Vector3();
    const outwardDir = new THREE.Vector3();
    const desiredTargetPos = new THREE.Vector3();
    const desiredCameraPos = new THREE.Vector3();

    function focusOnMarker(marker) {
        if (!marker) return;
        if (focusAnimationId) cancelAnimationFrame(focusAnimationId);

        marker.getWorldPosition(worldMarkerPos);
        outwardDir.copy(worldMarkerPos).normalize();
        desiredTargetPos.copy(outwardDir).multiplyScalar(0.18);
        desiredCameraPos.copy(outwardDir).multiplyScalar(3.1);
        const startTarget = controls.target.clone();
        const startCamera = camera.position.clone();
        let progress = 0;

        function easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        function animateFocus() {
            progress += 0.02;
            const clamped = Math.min(progress, 1);
            const eased = easeOutCubic(clamped);

            targetTemp.copy(startTarget).lerp(desiredTargetPos, eased);
            cameraTemp.copy(startCamera).lerp(desiredCameraPos, eased);

            controls.target.copy(targetTemp);
            camera.position.copy(cameraTemp);

            if (clamped < 1) {
                focusAnimationId = requestAnimationFrame(animateFocus);
            } else {
                focusAnimationId = null;
            }
        }

        focusAnimationId = requestAnimationFrame(animateFocus);
    }

    function updatePanel(student) {
        if (!student) return;

        activeStudent = student;
        nameEl.textContent = student.name || '';
        levelEl.textContent = `${student.level || ''}${student.focus ? ` · ${student.focus}` : ''}`;
        countryEl.textContent = `${student.country}${student.city ? ` • ${student.city}` : ''}`;
        quoteEl.textContent = student.quote ? `“${student.quote}”` : 'Rotate the planet and click a glowing point to hear from our students.';
        photoEl.src = student.photo || defaultPhoto;
        photoEl.alt = `${student.name || 'Learner'} portrait`;
        flagEl.src = student.flag || '';
        flagEl.alt = student.flag ? `${student.country} flag` : 'Country flag';
        flagEl.style.visibility = student.flag ? 'visible' : 'hidden';

        watchBtn.disabled = !student.video;
        watchBtn.textContent = student.video ? 'Watch their journey' : 'Video coming soon';
        if (student.video) {
            watchBtn.setAttribute('aria-label', `Watch ${student.name}'s story`);
        } else {
            watchBtn.removeAttribute('aria-label');
        }
    }

    function setActiveMarker(marker) {
        if (activeMarker && activeMarker !== marker) {
            activeMarker.userData.isActive = false;
        }
        if (marker) {
            marker.userData.isActive = true;
        }
        activeMarker = marker;
    }

    function setHoveredMarker(marker) {
        if (hoveredMarker === marker) return;

        hoveredMarker = marker;
        canvas.style.cursor = marker ? 'pointer' : 'grab';

        if (marker) {
            if (!isPointerDown) {
                hoverAutoRotateActive = true;
                controls.autoRotate = false;
                if (autoRotateTimeout) {
                    clearTimeout(autoRotateTimeout);
                    autoRotateTimeout = null;
                }
            }
            if (marker.userData && marker.userData.student) {
                updatePanel(marker.userData.student);
            }
            return;
        }

        if (!isPointerDown) {
            hoverAutoRotateActive = false;
            resumeAutoRotate(2000);
        }

        if (activeMarker && activeMarker.userData && activeMarker.userData.student) {
            updatePanel(activeMarker.userData.student);
        }
    }

    function handleMarkerSelection(marker) {
        if (!marker) return;
        const student = marker.userData.student;
        const priorAutoRotate = controls.autoRotate;
        setActiveMarker(marker);
        updatePanel(student);
        focusOnMarker(marker);

        controls.autoRotate = false;
        hoverAutoRotateActive = true;
        resumeAutoRotate(8000);

        if (student && student.video) {
            if (isStageFullscreen()) {
                pendingTestimonial = { student, priorAutoRotate };
                exitStageFullscreen();
            } else {
                openTestimonial(student, priorAutoRotate);
            }
        }
    }

    function findMarkerFromIntersection(object) {
        let current = object;
        while (current && current !== markerRoot) {
            if (current.userData && current.userData.student) return current;
            current = current.parent;
        }
        return null;
    }

    function updatePointer(event) {
        const rect = canvas.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
    }

    function onPointerMove(event) {
        updatePointer(event);
        const intersections = raycaster.intersectObjects(markerRoot.children, true);
        if (!intersections.length) {
            setHoveredMarker(null);
            return;
        }
        const marker = findMarkerFromIntersection(intersections[0].object);
        setHoveredMarker(marker);
    }

    function onCanvasClick(event) {
        updatePointer(event);
        const intersections = raycaster.intersectObjects(markerRoot.children, true);
        if (!intersections.length) return;
        const marker = findMarkerFromIntersection(intersections[0].object);
        if (marker) handleMarkerSelection(marker);
    }

    function onPointerDown() {
        isPointerDown = true;
        controls.autoRotate = false;
        hoverAutoRotateActive = true;
        if (autoRotateTimeout) {
            clearTimeout(autoRotateTimeout);
            autoRotateTimeout = null;
        }
        canvas.style.cursor = 'grabbing';
    }

    function onPointerUp() {
        isPointerDown = false;
        if (hoveredMarker) {
            hoverAutoRotateActive = true;
            controls.autoRotate = false;
            if (autoRotateTimeout) {
                clearTimeout(autoRotateTimeout);
                autoRotateTimeout = null;
            }
        } else {
            hoverAutoRotateActive = false;
            resumeAutoRotate(3500);
        }
        canvas.style.cursor = hoveredMarker ? 'pointer' : 'grab';
    }

    function onPointerLeave() {
        isPointerDown = false;
        setHoveredMarker(null);
        hoverAutoRotateActive = false;
        resumeAutoRotate(2000);
    }

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('click', onCanvasClick);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerLeave);

    watchBtn.addEventListener('click', () => {
        if (!activeStudent || !activeStudent.video) return;
        openTestimonial(activeStudent);
    });

    if (panelEl) {
        panelEl.addEventListener('mouseenter', () => {
            controls.autoRotate = false;
            hoverAutoRotateActive = true;
            if (autoRotateTimeout) clearTimeout(autoRotateTimeout);
        });
        panelEl.addEventListener('mouseleave', () => {
            hoverAutoRotateActive = false;
            resumeAutoRotate(2000);
        });
    }

    if (learners.length) {
        const firstMarker = markers[0];
        setActiveMarker(firstMarker);
        updatePanel(learners[0]);
        focusOnMarker(firstMarker);
        resumeAutoRotate(6000);
    }

    const sunTargetPos = new THREE.Vector3();
    const moonTargetPos = new THREE.Vector3();
    const sunDirection = new THREE.Vector3();
    const moonDirection = new THREE.Vector3();

    function getJulianDate(date) {
        return date.getTime() / 86400000 + 2440587.5;
    }

    function getGMST(jd) {
        const T = (jd - 2451545.0) / 36525;
        const theta = 280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T - (T * T * T) / 38710000;
        return THREE.MathUtils.degToRad(((theta % 360) + 360) % 360);
    }

    function normalizeDegrees(deg) {
        return ((deg % 360) + 360) % 360;
    }

    function wrapDegrees180(deg) {
        const wrapped = normalizeDegrees(deg + 180) - 180;
        return wrapped === -180 ? 180 : wrapped;
    }

    function computeSubsolarPosition(jd) {
        const T = (jd - 2451545.0) / 36525;
        const L0 = normalizeDegrees(280.46646 + T * (36000.76983 + 0.0003032 * T));
        const M = normalizeDegrees(357.52911 + T * (35999.05029 - 0.0001537 * T));
        const MRad = THREE.MathUtils.degToRad(M);
        const C = (1.914602 - T * (0.004817 + 0.000014 * T)) * Math.sin(MRad) +
            (0.019993 - 0.000101 * T) * Math.sin(2 * MRad) +
            0.000289 * Math.sin(3 * MRad);
        const trueLong = L0 + C;
        const omega = 125.04 - 1934.136 * T;
        const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(THREE.MathUtils.degToRad(omega));
        const epsilon0 = 23.439291 - 0.0130042 * T;
        const epsilon = epsilon0 + 0.00256 * Math.cos(THREE.MathUtils.degToRad(omega));

        const lambdaRad = THREE.MathUtils.degToRad(lambda);
        const epsilonRad = THREE.MathUtils.degToRad(epsilon);
        const declination = Math.asin(Math.sin(epsilonRad) * Math.sin(lambdaRad));

        const gha = normalizeDegrees(280.46061837 + 360.98564736629 * (jd - 2451545) - lambda);
        const subsolarLonDeg = wrapDegrees180(-gha);

        return {
            latitude: declination,
            longitude: THREE.MathUtils.degToRad(subsolarLonDeg)
        };
    }

    function calculateMoonVector(jd) {
        const T = (jd - 2451545.0) / 36525;
        const L0 = THREE.MathUtils.degToRad((218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841 - T * T * T * T / 65194000) % 360);
        const D = THREE.MathUtils.degToRad((297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868 - T * T * T * T / 113065000) % 360);
        const M = THREE.MathUtils.degToRad((357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T * T * T / 24490000) % 360);
        const Mprime = THREE.MathUtils.degToRad((134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699 - T * T * T * T / 14712000) % 360);
        const F = THREE.MathUtils.degToRad((93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - T * T * T / 3526000 + T * T * T * T / 863310000) % 360);

        const lambda = L0 +
            THREE.MathUtils.degToRad(6.289 * Math.sin(Mprime)) +
            THREE.MathUtils.degToRad(1.274 * Math.sin(2 * D - Mprime)) +
            THREE.MathUtils.degToRad(0.658 * Math.sin(2 * D)) +
            THREE.MathUtils.degToRad(0.214 * Math.sin(2 * Mprime)) +
            THREE.MathUtils.degToRad(0.11 * Math.sin(D));

        const beta = THREE.MathUtils.degToRad(5.128 * Math.sin(F)) +
            THREE.MathUtils.degToRad(0.28 * Math.sin(Mprime + F)) +
            THREE.MathUtils.degToRad(0.277 * Math.sin(Mprime - F)) +
            THREE.MathUtils.degToRad(0.173 * Math.sin(2 * D - F));

        const epsilon = THREE.MathUtils.degToRad(23.439291 - 0.0130042 * T);

        const x = Math.cos(beta) * Math.cos(lambda);
        const y = Math.cos(beta) * Math.sin(lambda);
        const z = Math.sin(beta);

        const xEqu = x;
        const yEqu = y * Math.cos(epsilon) - z * Math.sin(epsilon);
        const zEqu = y * Math.sin(epsilon) + z * Math.cos(epsilon);

        const gmst = getGMST(jd);
        const cosG = Math.cos(gmst);
        const sinG = Math.sin(gmst);
        const xEcef = cosG * xEqu + sinG * yEqu;
        const yEcef = -sinG * xEqu + cosG * yEqu;
        const zEcef = zEqu;

        return new THREE.Vector3(xEcef, zEcef, -yEcef).normalize();
    }

    function computeAltitude(direction) {
        const east = direction.dot(observerEast);
        const north = direction.dot(observerNorth);
        const up = direction.dot(observerUp);
        const horiz = Math.sqrt(east * east + north * north);
        return Math.atan2(up, horiz);
    }

    function updateCelestials(now) {
        const jd = getJulianDate(now);
        const subsolar = computeSubsolarPosition(jd);
        const cosLat = Math.cos(subsolar.latitude);
        const sinLat = Math.sin(subsolar.latitude);
        const cosLon = Math.cos(subsolar.longitude);
        const sinLon = Math.sin(subsolar.longitude);
        sunDirection.set(
            cosLat * cosLon,
            sinLat,
            -cosLat * sinLon
        ).normalize();
        updateNightUniform(sunDirection);
        sunTargetPos.copy(sunDirection).multiplyScalar(SUN_DISTANCE);

        if (enableCelestialBodies && sunGroup && sunLight) {
            sunGroup.position.lerp(sunTargetPos, SUN_LERP);
            sunLight.position.copy(sunGroup.position);
            if (sunLightTarget) {
                sunLightTarget.position.lerp(sunDirection.clone().multiplyScalar(2), 0.1);
            }
        }

        directionalLight.position.copy(sunDirection.clone().multiplyScalar(4));
        if (directionalLightTarget) {
            directionalLightTarget.position.lerp(sunDirection.clone().multiplyScalar(2), 0.1);
            directionalLight.target.updateMatrixWorld();
        }

        const sunAltitude = computeAltitude(sunDirection);
        lastSunAltitude = sunAltitude;

        const twilightAltitude = THREE.MathUtils.degToRad(6);
        const daylightRaw = THREE.MathUtils.clamp((sunAltitude + twilightAltitude) / (Math.PI / 2 + twilightAltitude), 0, 1);
        const daylightFactor = THREE.MathUtils.smootherstep(daylightRaw, 0, 1);
        currentDaylightFactor = daylightFactor;

        if (nightMaterial && nightMaterial.map) {
            const targetNightOpacity = THREE.MathUtils.lerp(0.96, 0.04, daylightFactor);
            nightMaterial.opacity += (targetNightOpacity - nightMaterial.opacity) * 0.08;
        }

        const daylightPower = Math.pow(daylightFactor, 0.85);
        const dirTargetIntensity = THREE.MathUtils.lerp(0.35, 3.4, daylightPower);
        directionalLight.intensity += (dirTargetIntensity - directionalLight.intensity) * 0.08;

        const ambientTarget = THREE.MathUtils.lerp(0.16, 0.52, Math.pow(daylightFactor, 0.7));
        ambientLight.intensity += (ambientTarget - ambientLight.intensity) * 0.08;

        kelvinToThreeColor(THREE.MathUtils.lerp(3000, 6600, daylightPower), sunlightColor);
        directionalLight.color.lerp(sunlightColor, 0.08);

        kelvinToThreeColor(THREE.MathUtils.lerp(15000, 7200, Math.pow(daylightFactor, 0.6)), ambientSkyColor);
        ambientLight.color.lerp(ambientSkyColor, 0.08);

        const targetExposure = THREE.MathUtils.lerp(1.18, 1.42, daylightFactor);
        renderer.toneMappingExposure += (targetExposure - renderer.toneMappingExposure) * 0.05;
        const cityGlowTarget = THREE.MathUtils.lerp(0.62, 0.26, daylightFactor);
        sphereMaterial.emissiveIntensity += (cityGlowTarget - sphereMaterial.emissiveIntensity) * 0.08;

        if (enableCelestialBodies && sunGlow && sunLight) {
            const glowTargetOpacity = 0.22 + 0.32 * daylightFactor;
            sunGlow.material.opacity += (glowTargetOpacity - sunGlow.material.opacity) * 0.08;
            const sunLightTargetIntensity = 1.4 + 2.2 * daylightFactor;
            sunLight.intensity += (sunLightTargetIntensity - sunLight.intensity) * 0.08;
        }

        moonDirection.copy(calculateMoonVector(jd));
        const moonPhase = (1 - sunDirection.dot(moonDirection)) * 0.5;
        currentMoonPhase = moonPhase;

        if (enableCelestialBodies && enableMoon && moonGroup && moonLight && moonGlow) {
            const moonDistance = THREE.MathUtils.lerp(MOON_DISTANCE_MIN, MOON_DISTANCE_MAX, 0.5 + 0.5 * Math.sin(now.getTime() / (1000 * 60 * 60 * 24) * Math.PI));
            moonTargetPos.copy(moonDirection).multiplyScalar(moonDistance);
            moonGroup.position.lerp(moonTargetPos, MOON_LERP);
            moonLight.position.copy(moonGroup.position);
            moonGlow.material.opacity = THREE.MathUtils.lerp(moonGlow.material.opacity, 0.18 + 0.25 * moonPhase, 0.08);
            moonLight.intensity = THREE.MathUtils.lerp(moonLight.intensity, 0.04 + 0.45 * (1 - daylightFactor) * moonPhase, 0.08);
        }
    }

    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const now = new Date();
        const time = now.getTime() * 0.001;

        if (starfield) {
            starfield.rotation.y += 0.0002;
            starfield.rotation.x += 0.0001;
        }

        if (enableCelestialBodies && sunCoreMesh && sunGlow && sunCoronaInner && sunCoronaOuter && sunCoreMaterial) {
            sunCoreMesh.rotation.y += SUN_ROTATION_SPEED;
            sunCoreMesh.rotation.x += SUN_ROTATION_SPEED * 0.3;
            if (sunCoreMaterial.map) {
                sunCoreMaterial.map.rotation += 0.0006;
                if (sunCoreMaterial.emissiveMap) { 
                    sunCoreMaterial.emissiveMap.rotation = sunCoreMaterial.map.rotation;
                }
                if (sunCoreMaterial.normalMap) {
                    sunCoreMaterial.normalMap.rotation = sunCoreMaterial.map.rotation * 0.65;
                }
            }
            const sunPulse = Math.sin(time * 0.75) * 0.1 + 1.05;
            const sunGlowScale = 1.12 + (sunPulse - 1) * 0.85;
            sunGlow.scale.setScalar(sunGlowScale);
            sunCoronaInner.scale.setScalar(4.2 * sunGlowScale);
            sunCoronaOuter.scale.setScalar(6.4 * (0.94 + Math.sin(time * 0.55) * 0.05));
            const coronaOpacityTarget = 0.34 + 0.4 * currentDaylightFactor;
            sunCoronaInner.material.opacity += (coronaOpacityTarget - sunCoronaInner.material.opacity) * 0.08;
            sunCoronaOuter.material.opacity += ((0.22 + 0.28 * currentDaylightFactor) - sunCoronaOuter.material.opacity) * 0.06;
        }

        if (enableCelestialBodies && enableMoon && moonCoreMesh && moonGlow && moonHalo && moonCoreMaterial) {
            moonCoreMesh.rotation.y += MOON_ROTATION_SPEED;
            if (moonCoreMaterial.map) {
                moonCoreMaterial.map.rotation += 0.0002;
                if (moonCoreMaterial.bumpMap) moonCoreMaterial.bumpMap.rotation = moonCoreMaterial.map.rotation;
                if (moonCoreMaterial.normalMap) moonCoreMaterial.normalMap.rotation = moonCoreMaterial.map.rotation;
            }
            const moonPulse = Math.sin(time * 1.2) * 0.06 + 1;
            moonGlow.scale.setScalar(moonPulse);
            moonHalo.scale.setScalar(1.4 * (0.96 + Math.sin(time * 0.9) * 0.06));
            const haloTargetOpacity = 0.12 + 0.45 * (1 - currentDaylightFactor) * (Math.pow(currentMoonPhase, 0.7));
            moonHalo.material.opacity += (haloTargetOpacity - moonHalo.material.opacity) * 0.08;
        }

        if (spaceBackdrop) {
            spaceBackdrop.rotation.y = time * 0.0001;
            spaceBackdrop.rotation.x = Math.sin(time * 0.0003) * 0.05;
        }
        markers.forEach((marker) => {
            const { pulseMesh, flagMesh, pulseOffset, isActive, flagBaseScale, flagHoverScale } = marker.userData;
            const pulse = 1 + Math.sin(time * 2 + pulseOffset) * 0.25;
            pulseMesh.scale.setScalar(pulse);

            const isHovered = marker === hoveredMarker;
            const targetFlagScale = isHovered ? flagHoverScale : flagBaseScale;
            const nextFlagScale = THREE.MathUtils.lerp(flagMesh.scale.x, targetFlagScale, 0.18);
            flagMesh.scale.setScalar(nextFlagScale);

            const targetFlagOpacity = isHovered || isActive ? 1 : 1;
            flagMesh.material.opacity += (targetFlagOpacity - flagMesh.material.opacity) * 0.12;
        });

        controls.update();
        updateCelestials(now);
        renderer.render(scene, camera);
    }

    function handleResize() {
        const parent = canvas.parentElement;
        const width = parent.clientWidth;
        const height = parent.clientHeight;
        const maxDpr = isStageFullscreen() ? 3 : 2;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    animate();
}

function initMalaysiaClock() { 
    const clockEl = document.getElementById('klClock');
    const timeEl = document.getElementById('klClockTime');
    const dateEl = document.getElementById('klClockDate');

    if (!clockEl || !timeEl || !dateEl) return;

    function updateClock() {
        const now = new Date();
        const formatterOptions = { timeZone: 'Asia/Kuala_Lumpur' };

        const malaysiaTime = new Intl.DateTimeFormat('en-US', {
            ...formatterOptions,
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(now);

        const malaysiaDate = new Intl.DateTimeFormat('en-US', {
            ...formatterOptions,
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        }).format(now);

        timeEl.textContent = malaysiaTime;
        dateEl.textContent = malaysiaDate;

        const fallbackHour = parseInt(malaysiaTime.split(':')[0], 10);
        const solarIsDay = lastSunAltitude !== null ? lastSunAltitude > THREE.MathUtils.degToRad(-6) : (fallbackHour >= 6 && fallbackHour < 18);

        clockEl.classList.toggle('is-day', solarIsDay);
        clockEl.classList.toggle('is-night', !solarIsDay);
    }

    updateClock();
    if (klClockInterval) window.clearInterval(klClockInterval);
    klClockInterval = window.setInterval(updateClock, 1000);
}

