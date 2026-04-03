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
    window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };

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

    // ── FORM SUBMISSION (ZAPIER + SUCCESS REDIRECT)
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // INSTANT FEEDBACK
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Processing...</span>';

            const payloadBase = {
                first_name: document.getElementById('fname').value.trim(),
                last_name: document.getElementById('lname').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('whatsapp').value.trim(),
                niche: document.getElementById('niche').value.trim(),
                interest: document.getElementById('interest').value,
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
});
