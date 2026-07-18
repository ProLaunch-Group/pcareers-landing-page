document.addEventListener('DOMContentLoaded', () => {

    // ── SAFE DOM CACHE
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const form = document.getElementById('leadForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const formResponse = document.getElementById('formResponse');

    // ── NAV SCROLL (PERF)
    let lastScrollY = 0;
    let ticking = false;

    function updateNavbar() {
        if (navbar) {
            navbar.classList.toggle('scrolled', lastScrollY > 60);
        }
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }, { passive: true });

    // ── HAMBURGER
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            mobileMenu.classList.toggle('open');
        });

        mobileMenu.addEventListener('click', (e) => {
            if (e.target.matches('.mobile-link, .mobile-cta')) {
                hamburger.classList.remove('open');
                mobileMenu.classList.remove('open');
            }
        });
    }

    // ── SCROLL REVEAL (SAFE)
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    const initReveal = () => {
        document.querySelectorAll('.reveal').forEach(el => {
            revealObserver.observe(el);
        });
    };

    if ('requestIdleCallback' in window) {
        requestIdleCallback(initReveal);
    } else {
        setTimeout(initReveal, 200);
    }


    // ── FORM SUBMISSION (ZAPIER + SUCCESS REDIRECT)
    if (form) {
        const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/26961179/unyjjmh/";
        const SUCCESS_PAGE_URL = "success.html";

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const fname = document.getElementById('fname').value.trim();
            const lname = document.getElementById('lname').value.trim();
            const email = document.getElementById('email').value.trim();
            const whatsapp = document.getElementById('whatsapp').value.trim();
            const niche = document.getElementById('niche').value.trim();
            const interest = document.getElementById('interest').value;

            // 1. Basic Validation & Duplicate Check
            if (!fname || !lname || !email || !whatsapp || !niche || !interest) {
                showResponse('⚠️ Please fill all fields properly.', 'error');
                return;
            }

            const alreadyRegistered = localStorage.getItem('registered_email');
            if (alreadyRegistered === email) {
                showResponse("⚠️ You've already registered! Check your email for the next step.", 'error');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showResponse('⚠️ Please enter a valid email address.', 'error');
                return;
            }

            // WhatsApp Validation (+countrycode required)
            const phoneRegex = /^\+[1-9]\d{6,14}$/;
            if (!phoneRegex.test(whatsapp)) {
                showResponse('⚠️ WhatsApp must start with + followed by country code (e.g. +234...)', 'error');
                return;
            }

            // 2. Prepare Payload
            const params = new URLSearchParams(window.location.search);
            const payload = {
                first_name: fname,
                last_name: lname,
                email: email,
                phone: whatsapp,
                niche: niche,
                interest: interest,
                timestamp: new Date().toLocaleString(),
                source: params.get('utm_source') || window.location.hostname,
                medium: params.get('utm_medium') || '',
                campaign: params.get('utm_campaign') || ''
            };

            // 3. Submit to Zapier
            try {
                setLoading(true);

                // Simulation / Actual Fetch
                if (!ZAPIER_WEBHOOK_URL || ZAPIER_WEBHOOK_URL.includes('YOUR_ZAPIER')) {
                    console.log('Mock submission:', payload);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                    await fetch(ZAPIER_WEBHOOK_URL, {
                        method: 'POST',
                        mode: 'no-cors',
                        body: JSON.stringify(payload),
                        headers: { 'Content-Type': 'application/json' }
                    });
                }

                // 4. Persistence & Immediate Redirect
                localStorage.setItem('registered_email', email);
                window.location.href = SUCCESS_PAGE_URL;

            } catch (error) {
                console.error('Submission error:', error);
                showResponse('❌ Something went wrong. Please try again.', 'error');
                setLoading(false);
            }
        });

        function showResponse(msg, type) {
            if (formResponse) {
                formResponse.className = type === 'error' ? 'error-msg' : 'success-msg';
                formResponse.textContent = msg;
            }
        }

        function setLoading(isLoading) {
            if (submitBtn) {
                submitBtn.disabled = isLoading;
                const btnText = submitBtn.querySelector('span');
                if (isLoading) {
                    if (btnText) btnText.textContent = 'Processing...';
                    submitBtn.style.opacity = '0.7';
                } else {
                    if (btnText) btnText.textContent = 'Reserve My Access';
                    submitBtn.style.opacity = '1';
                }
            }
        }
    }
});