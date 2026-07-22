from make_page import render_page, write

BODY = """
        <!-- HERO -->
        <section class="page-hero" id="events-hero">
            <div class="page-hero-inner">
                <span class="hero-badge reveal"><span class="badge-dot"></span> Community &amp; Learning</span>
                <h1 class="reveal reveal-delay-1">Events &amp; <em>Webinars.</em></h1>
                <p class="page-hero-sub reveal reveal-delay-2">Join our live sessions or catch up on past masterclasses designed to keep you ahead in the remote job market.</p>
            </div>
        </section>

        <!-- EVENTS GRID (populated by events.js) -->
        <section class="section-cream" id="events">
            <div class="section-inner">
                <div class="events-grid"></div>
            </div>
        </section>

        <!-- COMMUNITY CTA -->
        <section class="cta-section">
            <div class="cta-inner">
                <span class="section-tag">Stay In The Loop</span>
                <h2>Never Miss a Live Session</h2>
                <p>Join our WhatsApp community for early access to registration links and event reminders.</p>
                <a href="https://whatsapp.com/channel/0029VbBQHJw3WHTYHeJK5I0s" target="_blank" rel="noopener" class="cta-btn">Join the WhatsApp Community <svg class="icon"><use href="#icon-arrow"></use></svg></a>
            </div>
        </section>
"""

write("events.html", render_page(
    slug="events.html",
    title="Events & Webinars | ProLaunch Careers",
    description="Join ProLaunch Careers' live webinars and masterclasses, or catch up on past sessions covering CVs, LinkedIn, interviews, and job search strategy.",
    active_nav="events.html",
    body_html=BODY,
    extra_scripts='<script src="assets/js/events.js"></script>',
))
