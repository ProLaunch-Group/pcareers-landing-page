document.addEventListener('DOMContentLoaded', () => {


    // ── 1. FAST DOM CACHE (Minimized lookups)
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const form = document.getElementById('leadForm');
    const modal = document.getElementById('signupModal');
    const closeBtn = document.getElementById('closeModal');
    const submitBtn = document.getElementById('submitBtn');
    const formResponse = document.getElementById('formResponse');

    // ── GA4 Global Queue (Ensures events aren't lost)
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

    // ── 2. PASSIVE SCROLL (INP FIX)
    let lastScrollY = 0;
    let ticking = false;

    const updateNavbar = () => {
        if (navbar) navbar.classList.toggle('scrolled', lastScrollY > 60);
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;
        if (!ticking) {
            window.requestAnimationFrame(updateNavbar);
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
        // FIX: Snappier trigger (5% visibility, 0px margin)
        threshold: 0.05,
        rootMargin: '0px'
    });

    const initReveal = () => {
        document.querySelectorAll('.reveal').forEach(el => {
            revealObserver.observe(el);
        });
    };

    // ── 3. OPTIMIZED STAT COUNTER (INP FIX)
    const statObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                if (el.hasAttribute('data-animated')) return;

                el.setAttribute('data-animated', 'true');
                const targetText = el.getAttribute('data-target') || el.textContent.trim();
                const num = parseFloat(targetText.replace(/,/g, ''));
                const suffix = targetText.replace(/[0-9.,]/g, '');

                let start = 0;
                const duration = 1500;
                let startTime = null;

                const animate = (currentTime) => {
                    if (!startTime) startTime = currentTime;
                    const progress = Math.min((currentTime - startTime) / duration, 1);
                    const currentNum = Math.floor(progress * num);
                    const nextText = currentNum.toLocaleString() + suffix;

                    if (el.textContent !== nextText) {
                        el.textContent = nextText;
                    }

                    if (progress < 1) {
                        window.requestAnimationFrame(animate);
                    } else {
                        el.textContent = targetText;
                    }
                };
                window.requestAnimationFrame(animate);
            }
        });
    }, { threshold: 0.12 });

    const initStatCounters = () => {
        document.querySelectorAll('.stat-num').forEach(el => {
            const text = el.textContent.trim();
            const num = parseFloat(text.replace(/,/g, ''));
            if (isNaN(num) || num < 2) return;

            const suffix = text.replace(/[0-9.,]/g, '');
            el.setAttribute('data-target', text);
            el.textContent = '0' + suffix;
            statObserver.observe(el);
        });
    };

    // ── DEFERRED INITIALIZATION
    const startLife = () => {
        initReveal();
        initStatCounters();
    };

    if ('requestIdleCallback' in window) {
        requestIdleCallback(startLife);
    } else {
        setTimeout(startLife, 200);
    }

    // ── 4. INSTANT UI MODAL (INP FIX)
    const openModal = () => {
        if (!modal) return;
        modal.style.display = 'flex';
        window.requestAnimationFrame(() => {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    };

    const closeModal = () => {
        if (!modal) return;
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    };

    document.querySelectorAll('.open-signup-btn, .nav-cta, .mobile-cta, .cta-btn, a[href="#signup"]').forEach(btn => {
        btn.addEventListener('pointerdown', (e) => {
            if (btn.classList.contains('mobile-cta') || btn.classList.contains('nav-cta') || btn.getAttribute('href') === '#signup') {
                e.preventDefault();
            }
            openModal();
            const btnText = btn.innerText.trim() || 'CTA Button';
            trackEvent('open_registration_modal', btnText);
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // ── 5. FORM INPUT HELPERS (Cleanup as they type)
    const whatsappInput = document.getElementById('whatsapp');
    if (whatsappInput) {
        whatsappInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\s/g, '');
        });
    }

    // ── FORM SUBMISSION (ZAPIER + SUCCESS REDIRECT)
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 1. DATA COLLECTION
            const first_name = document.getElementById('fname').value.trim();
            const last_name = document.getElementById('lname').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('whatsapp').value.trim().replace(/\s/g, '');
            const niche = document.getElementById('niche').value.trim();
            const interest = document.getElementById('interest').value;

            // 2. VALIDATION LAYER (Fixes empty submissions and junk data)
            let errors = [];

            if (!first_name || !last_name) errors.push("Please enter your full name.");

            // Email Regex (Simple but effective)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailRegex.test(email)) errors.push("Please enter a valid email address.");

            // Phone Regex (Numbers, dashes and optional +) - Spaces already removed above
            const phoneRegex = /^\+?[0-9-]{7,20}$/;
            if (!phone || !phoneRegex.test(phone)) errors.push("Please enter a valid phone number.");

            // Niche/Role Validation (Protects against "enquiry" confusion)
            const junkNiches = ['ry', 'enqiry', 'nil', 'none', 'unknown', 'enq'];
            if (!niche || niche.length < 3) {
                errors.push("Please specify your professional role/field.");
            } else if (junkNiches.includes(niche.toLowerCase())) {
                errors.push("Please enter your career field (e.g. Virtual Assistant).");
            }

            if (!interest) errors.push("Please select what you are interested in.");

            // 3. SHOW ERRORS & STOP
            if (errors.length > 0) {
                if (formResponse) {
                    formResponse.innerHTML = `<p class="error-msg">${errors[0]}</p>`; // Show first error
                    // Scroll into view if needed
                }
                return;
            }

            // 4. PROCEED WITH SUBMISSION
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Processing...</span>';

            const payloadBase = {
                first_name,
                last_name,
                email,
                phone,
                niche,
                interest,
                timestamp: new Date().toLocaleString(),
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

                trackEvent('lead_form_submitted', payloadBase.interest);
                localStorage.setItem('registered_email', payloadBase.email);

                setTimeout(() => {
                    if (typeof CONFIG !== 'undefined' && CONFIG.SUCCESS_PAGE_URL) {
                        window.location.href = CONFIG.SUCCESS_PAGE_URL;
                    }
                }, 200);

            } catch (error) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>Reserve My Access</span>';
                alert("❌ Connection error. Please try again.");
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


    // ── WEBINAR MODAL HELPERS
    const openWebinarModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.style.display = 'flex';
        requestAnimationFrame(() => {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        trackEvent('open_modal', modalId);
    };

    const closeWebinarModal = (modal) => {
        if (!modal) return;
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 350);
    };

    // ── OPEN: any button with [data-modal] attribute
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-modal]');
        if (trigger) openWebinarModal(trigger.dataset.modal);
    });


    document.addEventListener('click', (e) => {
        // Close button inside modal
        if (e.target.closest('[data-close-modal]')) {
            closeWebinarModal(e.target.closest('.webinar-modal-overlay'));
            return;
        }
        // Backdrop click (click directly on the modal overlay)
        if (e.target.classList.contains('webinar-modal-overlay')) {
            closeWebinarModal(e.target);
        }
    });

    // ── FLOATING WEBINAR BANNER ────────────────────────────────────────
    const webinarFloat = document.getElementById('webinarFloat');
    const dismissFloatBtn = document.getElementById('dismissWebinarFloat');

    if (webinarFloat && !sessionStorage.getItem('webinar_float_dismissed')) {
        setTimeout(() => webinarFloat.classList.add('visible'), 2000);

        webinarFloat.addEventListener('click', (e) => {
            if (e.target.closest('#dismissWebinarFloat')) return;
            openWebinarModal('webinarModal');
            webinarFloat.classList.replace('visible', 'dismissed');
        });

        dismissFloatBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            webinarFloat.classList.replace('visible', 'dismissed');
            sessionStorage.setItem('webinar_float_dismissed', '1');
        });
    }

});

// Carousel logic

(function () {
    const slidesEl = document.getElementById('slides');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    const dotsEl = document.getElementById('dots');
    const cards = Array.from(slidesEl.querySelectorAll('.testimonial-card'));

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
        const ds = dotsEl.querySelectorAll('.dot');
        ds.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function getOffset() {
        const card = cards[0];
        const gap = 24;
        return current * (card.offsetWidth + gap);
    }

    function goTo(idx) {
        perView = getPerView();
        current = Math.max(0, Math.min(idx, maxIndex()));
        slidesEl.style.transform = `translateX(-${getOffset()}px)`;
        prevBtn.disabled = current === 0;
        nextBtn.disabled = current >= maxIndex();
        updateDots();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    prevBtn.addEventListener('click', () => { prev(); resetAuto(); });
    nextBtn.addEventListener('click', () => { next(); resetAuto(); });

    function startAuto() {
        autoTimer = setInterval(() => {
            goTo(current >= maxIndex() ? 0 : current + 1);
        }, 4500);
    }

    function resetAuto() {
        clearInterval(autoTimer);
        startAuto();
    }

    let touchStartX = 0;
    slidesEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    slidesEl.addEventListener('touchend', e => {
        const dx = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(dx) > 40) { dx > 0 ? next() : prev(); resetAuto(); }
    }, { passive: true });

    function init() {
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

    init();
})();

 // Testimonial Read More Toggle Function
    const TESTIMONIAL_PREVIEW_LENGTH = 100;

    function setTestimonialState(testimonialCard, isOpen) {
        const textElement = testimonialCard.querySelector('.testimonial-text');
        const button = testimonialCard.querySelector('.testimonial-read-more');
        const fullText = textElement?.getAttribute('data-full-text');

        if (!textElement || !button || !fullText) return;

        if (isOpen) {
            textElement.textContent = fullText;
            button.textContent = 'Read Less';
            button.setAttribute('data-open', 'true');
            testimonialCard.classList.add('expanded');
            testimonialCard.classList.remove('collapsed');
        } else {
            const truncatedText = fullText.length > TESTIMONIAL_PREVIEW_LENGTH
                ? fullText.substring(0, TESTIMONIAL_PREVIEW_LENGTH).trim() + '...'
                : fullText;
            textElement.textContent = truncatedText;
            button.textContent = 'Read More';
            button.setAttribute('data-open', 'false');
            testimonialCard.classList.add('collapsed');
            testimonialCard.classList.remove('expanded');
        }
    }

    function toggleTestimonial(button) {
        const testimonialCard = button.closest('.testimonial-card');
        const isOpen = button.getAttribute('data-open') === 'true';
        setTestimonialState(testimonialCard, !isOpen);
    }

    function initializeTestimonialCards() {
        const testimonialCards = Array.from(document.querySelectorAll('.testimonial-card'));
        testimonialCards.forEach(card => setTestimonialState(card, false));
    }

    initializeTestimonialCards();