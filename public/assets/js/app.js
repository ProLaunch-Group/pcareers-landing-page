/* =========================================================================
   Single source of truth for all webinars — featured cards + archive.
 
   HOW TO ADD A NEW WEBINAR EACH MONTH:
   Just add a new object to the top of the WEBINARS array below.
   Everything else (which 3 show as cards, which get pushed into the
   "Access Older Webinars" archive list) is handled automatically.
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // ── FORM SUBMISSION (ZAPIER + SUCCESS REDIRECT)
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 1. DATA COLLECTION
            const full_name = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('whatsapp').value.trim().replace(/\s/g, '');
            const blocker = document.getElementById('blocker').value.trim();

            // 2. VALIDATION LAYER
            const errors = [];

            if (!full_name) {
                errors.push('Please enter your full name.');
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailRegex.test(email)) {
                errors.push('Please enter a valid email address.');
            }

            const phoneRegex = /^\+?[0-9-]{7,20}$/;
            if (!phone || !phoneRegex.test(phone)) {
                errors.push('Please enter a valid WhatsApp number.');
            }

            if (!blocker) {
                errors.push('Please select your biggest blocker.');
            }

            // 3. SHOW ERRORS & STOP
            if (errors.length > 0) {
                if (formResponse) {
                    formResponse.innerHTML = `<p class="error-msg">${errors[0]}</p>`;
                }
                return;
            }

            // 4. PROCEED WITH SUBMISSION
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Processing...</span>';
            }

            const payloadBase = {
                full_name,
                email,
                phone,
                blocker,
                cohort: 'Cohort 06',
                seats_limit: 50,
                timestamp: new Date().toISOString(),
                source: window.location.hostname
            };

            try {
                if (typeof CONFIG !== 'undefined' && CONFIG.ZAPIER_WEBHOOK_URL) {
                    await fetch(CONFIG.ZAPIER_WEBHOOK_URL, {
                        method: 'POST',
                        mode: 'no-cors',
                        body: JSON.stringify(payloadBase),
                        headers: { 'Content-Type': 'application/json' }
                    });
                }

                trackEvent('lead_form_submitted', payloadBase.blocker);
                localStorage.setItem('registered_email', payloadBase.email);

                if (formResponse) {
                    formResponse.innerHTML = '<p class="success-msg">Your reservation request has been received. We will contact you shortly.</p>';
                }

                setTimeout(() => {
                    if (typeof CONFIG !== 'undefined' && CONFIG.SUCCESS_PAGE_URL) {
                        window.location.href = CONFIG.SUCCESS_PAGE_URL;
                    }
                }, 200);

            } catch (error) {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<span>Reserve My Spot</span>';
                }
                if (formResponse) {
                    formResponse.innerHTML = '<p class="error-msg">Connection error. Please try again.</p>';
                }
            }
        });
    }

    // ── GA4 EVENT TRACKING
    const trackEvent = (name, label) => {
        if (typeof window.gtag === 'function') {
            window.gtag('event', name, {
                'event_label': label,
                'transport_type': 'beacon'
            });
        }
    };

    // Track AI CV Tool Clicks
    document.querySelectorAll('a[href*="cv-optimizer"]').forEach(link => {
        link.addEventListener('click', () => trackEvent('click_cv_tool', 'Outbound to Analyzer'));
    });

});

// Carousel logic

(function () {
    const slidesEl = document.getElementById('slides');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    const dotsEl = document.getElementById('dots');
    const cards = slidesEl ? Array.from(slidesEl.querySelectorAll('.testimonial-card')) : [];

    let current = 0;
    let perView = 1;
    let autoTimer = null;

    function getPerView() {
        const w = slidesEl.parentElement.offsetWidth;
        if (w <= 700) return 1;
        if (w <= 960) return 2;
        return 3;
    }

    function maxIndex() {
        return Math.max(0, cards.length - perView);
    }

    function buildDots() {
        if (!dotsEl) return;
        dotsEl.innerHTML = '';
        const count = maxIndex() + 1;
        for (let i = 0; i < count; i++) {
            const d = document.createElement('button');
            d.className = 'dot' + (i === current ? ' active' : '');
            d.setAttribute('role', 'tab');
            d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
            d.addEventListener('click', () => goTo(i));
            dotsEl.appendChild(d);
        }
    }

    function updateDots() {
        if (!dotsEl) return;
        const ds = dotsEl.querySelectorAll('.dot');
        ds.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function getOffset() {
        const card = cards[0];
        const gap = 24;
        return current * (card.offsetWidth + gap);
    }

    function goTo(idx) {
        if (!slidesEl) return;
        perView = getPerView();
        current = Math.max(0, Math.min(idx, maxIndex()));
        slidesEl.style.transform = `translateX(-${getOffset()}px)`;
        if (prevBtn) prevBtn.disabled = current === 0;
        if (nextBtn) nextBtn.disabled = current >= maxIndex();
        updateDots();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAuto(); });

    function startAuto() {
        // only auto-rotate when there are more slides than the viewport
        if (maxIndex() <= 0) return;
        clearInterval(autoTimer);
        autoTimer = setInterval(() => {
            goTo(current >= maxIndex() ? 0 : current + 1);
        }, 4500);
    }

    function resetAuto() {
        clearInterval(autoTimer);
        startAuto();
    }

    let touchStartX = 0;
    if (slidesEl) {
        slidesEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
        slidesEl.addEventListener('touchend', e => {
            const dx = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(dx) > 40) { dx > 0 ? next() : prev(); resetAuto(); }
        }, { passive: true });
    }

    function init() {
        // make sure DOM is available and slides exist
        if (!slidesEl || !cards.length) return;
        perView = getPerView();
        current = 0;
        buildDots();
        goTo(0);
        startAuto();
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { init(); }, 120);
    });

    // Ensure carousel initializes when DOM is ready (robust if script order changes)
    function runWhenReady() {
        try { init(); } catch (e) { /* silent */ }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runWhenReady);
    } else {
        runWhenReady();
    }
})();
 