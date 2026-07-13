/* =========================================================================
   Single source of truth for all webinars — featured cards + archive.
 
   HOW TO ADD A NEW WEBINAR EACH MONTH:
   Just add a new object to the top of the WEBINARS array below.
   Everything else (which 3 show as cards, which get pushed into the
   "Access Older Webinars" archive list) is handled automatically.
   ========================================================================= */
const WEBINARS = [
     {
        id: "Stop Applying Blindly",
        title: "Stop Applying Blindly: Where to Actually Find Jobs That Match Your Skills Webinar Registration.",
        date: "2026-07-18",             
        status: "upcoming",                  
        image: "assets/images/event-5.webp",
        description: 'In this session, you\'ll discover how to identify opportunities that match your skills and experience, where to find quality job openings, what recruiters actually look for in candidates, and practical strategies to increase your chances of landing interviews.',
        formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSez0aBGAJoUPej3LNFr3QaJUOTBEdMeyrdtUqbr6NoiYKHDeQ/viewform"
    },
    {
        id: "volunteer-edge",
        title: "The Volunteer Edge",
        date: "2026-05-30",             
        status: "past",                  
        image: "assets/images/event-4.webp",
        description: "A free webinar to help you accelerate your career growth through strategic service and learn how to position your volunteer experience as job-ready value employers will notice.",
        formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfizpQrQN4YucHd-eQkoMPcfjcb7p2t04IzpiX6r-6_5V2LwA/viewform"
    },
    {
        id: "remote-interview",
        title: "Mastering the Remote Interview",
        date: "2026-04-15",
        status: "past",
        image: "assets/images/event-3.webp",
        description: "A free live webinar to help you confidently pass remote interview stages — learn to answer screening questions, present your experience, and communicate your value.",
        formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdZIdk1M8vn6hEULfjALkyQHPKP7bd1VpSrVDyAkhmEaGPuEA/viewform"
    },
    {
        id: "ats-cv",
        title: "How To Draft ATS Friendly CVs + Personal Branding & Packaging",
        date: "2026-03-10",
        status: "past",
        image: "assets/images/event-2.webp",
        description: "A deep dive into crafting CVs that beat the bots and branding yourself for premium global roles.",
        formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdvrioK9KzQ-tbh4LlaGBDiYfGzAvmp0nvZsXJUM0YQIggmIQ/viewform"
    },
    {
        id: "linkedin-secrets",
        title: "How Your LinkedIn Is Costing You Opportunities",
        date: "2026-02-05",
        status: "past",
        image: "assets/images/event-1.webp",
        description: "Learn the exact LinkedIn mistakes that keep you invisible to global recruiters and how to fix them.",
        formUrl: "https://docs.google.com/forms/d/e/1FAIpQLScfinuIn-J4Fp7aPmHxice5A-c6eblwb9hY9CXUrOFqtH-X0A/viewform"
    }
];

document.addEventListener('DOMContentLoaded', () => {


    // ── 1. FAST DOM CACHE (Minimized lookups)
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const heroFormCard = document.getElementById('hero-signup-form');
    const form = document.getElementById('heroLeadForm');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
    const formResponse = form ? form.querySelector('#formResponse') : null;

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

    // ── 4. HERO FORM SCROLL/FOCUS (PRIMARY FLOW)
    const openHeroForm = (label = 'CTA Button') => {
        if (!heroFormCard || !form) return;
        heroFormCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        requestAnimationFrame(() => {
            const firstInput = form.querySelector('input, select');
            firstInput?.focus({ preventScroll: true });
        });
        trackEvent('open_registration_form', label);
    };

    document.querySelectorAll('.open-signup-btn, .nav-cta, .mobile-cta, .cta-btn, a[href="#signup"]').forEach(btn => {
        btn.addEventListener('pointerdown', (e) => {
            if (btn.classList.contains('mobile-cta') || btn.classList.contains('nav-cta') || btn.getAttribute('href') === '#signup') {
                e.preventDefault();
            }
            openHeroForm(btn.innerText.trim() || 'CTA Button');
        });
    });

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


    const MAX_FEATURED_CARDS = 3;

    // ── WEBINAR MODAL HELPERS
    const renderArchiveModalContent = (modal) => {
        const title = modal.querySelector('.webinar-modal-header h3');
        const badge = modal.querySelector('.webinar-modal-badge');
        const formWrap = modal.querySelector('.webinar-modal-form');
        if (!title || !badge || !formWrap) return;

        title.textContent = 'Older Webinars';
        badge.innerHTML = '<span class="badge-dot"></span> Webinar Archive';
        formWrap.classList.add('webinar-modal-form--list');
        formWrap.innerHTML = `
            <ul class="archive-list">
                ${[...WEBINARS]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(MAX_FEATURED_CARDS)
                    .map(w => `
                        <li class="archive-item">
                            <a href="${w.formUrl}" target="_blank" rel="noopener" class="archive-link">
                                <span class="archive-link-title">${w.title}</span>
                                <span class="archive-link-date">${formatDate(w.date)}</span>
                            </a>
                        </li>
                    `)
                    .join('')}
            </ul>
        `;
    };

    const renderWebinarModalContent = (modal, webinar) => {
        const title = modal.querySelector('.webinar-modal-header h3');
        const badge = modal.querySelector('.webinar-modal-badge');
        const formWrap = modal.querySelector('.webinar-modal-form');
        if (!title || !badge || !formWrap) return;

        title.textContent = webinar.title;
        badge.innerHTML = `<span class="badge-dot"></span> ${webinar.status === 'upcoming' ? 'Upcoming' : 'Past Webinar'}`;
        formWrap.classList.remove('webinar-modal-form--list');
        formWrap.innerHTML = `<iframe src="${webinar.formUrl}" title="${webinar.title} Replay" loading="lazy">Loading…</iframe>`;
    };

    const openWebinarModal = (modalId, options = {}) => {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        if (options.type === 'archive') {
            renderArchiveModalContent(modal);
        } else if (options.webinar) {
            renderWebinarModalContent(modal, options.webinar);
        }

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
        if (trigger) {
            const modalId = trigger.dataset.modal;
            const isArchive = trigger.dataset.archive === 'true';
            openWebinarModal(modalId, isArchive ? { type: 'archive' } : {});
        }
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

    /* =========================================================================
       RENDER: Featured event cards (top 3 by date)
       ========================================================================= */
    function renderEventCards(webinars) {
        const grid = document.querySelector(".events-grid");
        if (!grid) return;

        const featured = [...webinars]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, MAX_FEATURED_CARDS);

        grid.innerHTML = featured.map((w, i) => `
        <div class="event-card reveal reveal-delay-${i + 1}">
            <div class="event-header">
                <span class="event-badge ${w.status}">${w.status === "upcoming" ? "Upcoming" : "Past Webinar"}</span>
                <img src="${w.image}" loading="lazy" alt="${w.title}" class="event-img">
            </div>
            <div class="event-body">
                <div class="event-date">Live Masterclass Replay</div>
                <h4>${w.title}</h4>
                <p>${w.description}</p>
                <button class="event-cta" data-webinar-modal="${w.id}" aria-label="Access ${w.title} Replay">
                    ${w.status === "upcoming" ? "Reserve My Spot" : "Access Replay"}
                    <svg class="icon"><use href="#icon-arrow"></use></svg>
                </button>
            </div>
        </div>
    `).join("");
    }

    /* =========================================================================
       RENDER: Archive list (everything past the featured 3), stacked links
       ========================================================================= */
    function renderArchiveList(webinars) {
        const list = document.querySelector(".archive-list");
        if (!list) return;

        const archived = [...webinars]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(MAX_FEATURED_CARDS);

        if (archived.length === 0) {
            list.innerHTML = `<li class="archive-empty">No older webinars yet — check back next month.</li>`;
            return;
        }

        list.innerHTML = archived.map(w => `
        <li class="archive-item">
            <a href="${w.formUrl}" target="_blank" rel="noopener" class="archive-link">
                <span class="archive-link-title">${w.title}</span>
                <span class="archive-link-date">${formatDate(w.date)}</span>
            </a>
        </li>
    `).join("");
    }

    function formatDate(isoDate) {
        return new Date(isoDate).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
        });
    }


    function openFeaturedWebinarModal(webinarId) {
        const webinar = WEBINARS.find(w => w.id === webinarId);
        if (!webinar) return;

        const modal = document.getElementById("webinarModal");
        if (!modal) return;

        renderWebinarModalContent(modal, webinar);
        openWebinarModal("webinarModal");
    }

    /* =========================================================================
       INIT — call this once on DOMContentLoaded
       ========================================================================= */
    function initWebinars() {
        renderEventCards(WEBINARS);
        renderArchiveList(WEBINARS);
    }

    initWebinars();

    // Featured card CTA clicks 
    document.addEventListener("click", (e) => {
        const trigger = e.target.closest("[data-webinar-modal]");
        if (trigger) {
            openFeaturedWebinarModal(trigger.dataset.webinarModal);
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