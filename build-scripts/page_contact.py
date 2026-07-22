from make_page import render_page, write

BODY = """
        <!-- HERO -->
        <section class="page-hero" id="contact-hero">
            <div class="page-hero-inner">
                <span class="hero-badge reveal"><span class="badge-dot"></span> We Reply Within 48 Hours</span>
                <h1 class="reveal reveal-delay-1">Ready to <em>Launch?</em></h1>
                <p class="page-hero-sub reveal reveal-delay-2">Have questions about which path is right for you? Reach out to our team &mdash; we're here to help.</p>
            </div>
        </section>

        <!-- CONTACT GRID -->
        <section class="section-cream" id="contact-main">
            <div class="section-inner">
                <div class="contact-grid">
                    <div class="reveal">
                        <span class="section-tag">Get In Touch</span>
                        <h2 style="color: var(--forest); font-size: clamp(1.8rem, 3vw, 2.4rem); margin-bottom: 0.75rem;">Talk to Our Team</h2>
                        <p style="color: var(--text-muted); line-height: 1.75;">Whether you're deciding between the Career Grooming Camp, free mentorship, or a CV rewrite &mdash; tell us where you're stuck and we'll point you the right way.</p>

                        <div class="contact-info-list">
                            <div class="contact-info-item">
                                <div class="contact-info-icon"><svg class="icon"><use href="#icon-mail"></use></svg></div>
                                <div>
                                    <h4>Email</h4>
                                    <a href="mailto:careers@prolaunchgroup.org">careers@prolaunchgroup.org</a>
                                </div>
                            </div>
                            <div class="contact-info-item">
                                <div class="contact-info-icon"><svg class="icon"><use href="#icon-whatsapp"></use></svg></div>
                                <div>
                                    <h4>WhatsApp Community</h4>
                                    <a href="https://whatsapp.com/channel/0029VbBQHJw3WHTYHeJK5I0s" target="_blank" rel="noopener">Join the channel</a>
                                </div>
                            </div>
                            <div class="contact-info-item">
                                <div class="contact-info-icon"><svg class="icon"><use href="#icon-earth"></use></svg></div>
                                <div>
                                    <h4>Online</h4>
                                    <p>careers.prolaunchgroup.org</p>
                                </div>
                            </div>
                        </div>

                        <div class="contact-socials-row">
                            <a href="https://www.linkedin.com/company/prolaunch-careers/" target="_blank" rel="noopener" aria-label="LinkedIn"><svg class="icon"><use href="#icon-linkedin"></use></svg></a>
                            <a href="https://whatsapp.com/channel/0029VbBQHJw3WHTYHeJK5I0s" target="_blank" rel="noopener" aria-label="WhatsApp"><svg class="icon"><use href="#icon-whatsapp"></use></svg></a>
                            <a href="https://web.facebook.com/prolaunch.careers" target="_blank" rel="noopener" aria-label="Facebook"><svg class="icon"><use href="#icon-facebook"></use></svg></a>
                            <a href="https://www.tiktok.com/@prolaunch_careers" target="_blank" rel="noopener" aria-label="TikTok"><svg class="icon"><use href="#icon-tiktok"></use></svg></a>
                            <a href="https://www.instagram.com/prolaunch_careers" target="_blank" rel="noopener" aria-label="Instagram"><svg class="icon"><use href="#icon-instagram"></use></svg></a>
                        </div>
                    </div>

                    <div class="contact-form-card reveal reveal-delay-1">
                        <h3>Send a Message</h3>
                        <p>We'll get back to you within 48 hours.</p>
                        <form data-lead-form="contact-page" novalidate>
                            <div class="form-row">
                                <input type="text" name="full_name" placeholder="Full Name" required class="form-input">
                                <input type="email" name="email" placeholder="Email Address" required class="form-input">
                            </div>
                            <div class="form-group">
                                <input type="tel" name="whatsapp" placeholder="WhatsApp Number" class="form-input">
                            </div>
                            <div class="form-group">
                                <select name="topic" class="form-input" required>
                                    <option value="" disabled selected>What are you reaching out about?</option>
                                    <option value="Career Grooming Camp">Career Grooming Camp</option>
                                    <option value="Mentorship (PMI)">Mentorship (PMI)</option>
                                    <option value="CV Rewrite">Expert CV Rewrite</option>
                                    <option value="LinkedIn Optimization">LinkedIn Optimization</option>
                                    <option value="Portfolio Building">Portfolio Building</option>
                                    <option value="Partnership">Partnership / Other</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <textarea name="message" placeholder="Tell us a bit about what you need" required class="form-input"></textarea>
                            </div>
                            <button type="submit" class="submit-btn">Send Message</button>
                            <div class="form-response form-note" style="margin-top: 0.75rem;"></div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
"""

write("contact.html", render_page(
    slug="contact.html",
    title="Contact Us | ProLaunch Careers",
    description="Get in touch with the ProLaunch Careers team about the Career Grooming Camp, free mentorship, CV rewrites, or LinkedIn optimization.",
    active_nav="contact.html",
    body_html=BODY,
))
