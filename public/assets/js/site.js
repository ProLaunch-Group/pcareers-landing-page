/* ProLaunch Careers — shared site behavior (nav, reveal, forms, stats) */
document.addEventListener('DOMContentLoaded', () => {

    // ── Navbar scroll state
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 40);
        }, { passive: true });
    }

    if (hamburger && mobileMenu) {
        const toggleMobileMenu = () => {
            const isOpen = mobileMenu.classList.toggle('open');
            hamburger.classList.toggle('close', isOpen);
            hamburger.setAttribute('aria-expanded', String(isOpen));
        };

        hamburger.addEventListener('click', toggleMobileMenu);
        mobileMenu.addEventListener('click', (e) => {
            if (e.target.closest('a')) {
                mobileMenu.classList.remove('open');
                hamburger.classList.remove('close');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ── Reveal-on-scroll
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        revealEls.forEach(el => io.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('visible'));
    }

    // ── Stat counters
    const statEls = document.querySelectorAll('.stat-num[data-count]');
    if (statEls.length && 'IntersectionObserver' in window) {
        const animateStat = (el) => {
            const target = parseFloat(el.dataset.count);
            const suffix = el.dataset.suffix || '';
            const duration = 1200;
            const start = performance.now();
            const step = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const value = target * eased;
                el.textContent = (target % 1 === 0 ? Math.round(value) : value.toFixed(1)) + suffix;
                if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        };
        const statIo = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStat(entry.target);
                    statIo.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });
        statEls.forEach(el => statIo.observe(el));
    }

    // ── Generic lead / contact forms — posts to the same Zapier webhook as the homepage
    document.querySelectorAll('form[data-lead-form]').forEach((form) => {
        const submitBtn = form.querySelector('button[type="submit"]');
        const responseEl = form.querySelector('.form-response');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const payload = Object.fromEntries(formData.entries());
            payload.source_page = window.location.pathname;
            payload.form_id = form.dataset.leadForm;

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.dataset.originalText = submitBtn.dataset.originalText || submitBtn.textContent;
                submitBtn.textContent = 'Sending...';
            }

            try {
                if (typeof CONFIG !== 'undefined' && CONFIG.ZAPIER_WEBHOOK_URL) {
                    await fetch(CONFIG.ZAPIER_WEBHOOK_URL, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                }
                if (responseEl) {
                    responseEl.textContent = "Thanks — we've received your message and will be in touch shortly.";
                    responseEl.classList.add('success-msg');
                }
                form.reset();
            } catch (err) {
                if (responseEl) {
                    responseEl.textContent = 'Something went wrong. Please try again or email us directly.';
                    responseEl.classList.add('error-msg');
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = submitBtn.dataset.originalText;
                }
            }
        });
    });

});
