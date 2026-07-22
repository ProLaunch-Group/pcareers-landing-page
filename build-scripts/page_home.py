from make_page import render_page, write

BODY = """
        <!-- HERO -->
        <header class="hero" id="home">
            <div class="hero-text-wrap">
                <span class="hero-badge reveal"><span class="badge-dot"></span> Cohort 06 Enrolling Now</span>
                <h1 class="reveal reveal-delay-1">Your Remote Career <em>Starts Here.</em></h1>
                <p class="hero-sub reveal reveal-delay-2">Equipping skilled-but-stuck African professionals with the clarity, tools, and strategic positioning to land competitive remote jobs locally and globally.</p>
                <div class="page-hero-cta-row reveal reveal-delay-3" style="justify-content: flex-start;">
                    <a href="career-grooming-camp.html" class="cta-btn">Explore Our Programs <svg class="icon"><use href="#icon-arrow"></use></svg></a>
                    <a href="cv-optimizer.html" class="btn-teal">Try the Free CV Optimizer</a>
                </div>
                <div class="hero-stats reveal reveal-delay-4">
                    <div class="stat-item"><span class="stat-num" data-count="2000" data-suffix="+">0</span><span class="stat-label">Alumni Coached</span></div>
                    <div class="stat-item"><span class="stat-num" data-count="70" data-suffix="+">0</span><span class="stat-label">CVs Optimized</span></div>
                    <div class="stat-item"><span class="stat-num" data-count="4.7" data-suffix="&#9733;">0</span><span class="stat-label">Programme Rating</span></div>
                    <div class="stat-item"><span class="stat-num" data-count="30" data-suffix="+">0</span><span class="stat-label">Interview Preps</span></div>
                    <div class="stat-item"><span class="stat-num" data-count="20" data-suffix="+">0</span><span class="stat-label">LinkedIn Rebranded</span></div>
                    <div class="stat-item"><span class="stat-num" data-count="5" data-suffix="+">0</span><span class="stat-label">Active CGC Cohorts</span></div>
                </div>
            </div>
            <div class="hero-visual reveal reveal-delay-2">
                <img src="assets/images/ceo-2.webp" alt="Coach MQ, Founder of ProLaunch Careers" loading="eager">
            </div>
        </header>

        <!-- ABOUT -->
        <section class="pillars-section" id="about-us">
            <div class="pillars-inner">
                <div class="section-header reveal">
                    <span class="section-tag">Our Mission</span>
                    <h2>We don't just teach skills&mdash;we launch careers.</h2>
                    <p>ProLaunch Careers is a career grooming organisation dedicated to bridging the gap between talent and opportunity. We believe that the biggest barrier most early-career professionals face is not ability&mdash;it is access. Every programme, tool, and touchpoint we offer is designed to take you from where you are to where you deserve to be.</p>
                </div>
                <div class="pillars-grid">
                    <div class="pillar-card reveal">
                        <div class="pillar-icon"><svg class="icon"><use href="#icon-target"></use></svg></div>
                        <h4>Empowerment</h4>
                        <p>We believe in our clients before they believe in themselves &mdash; equipping, not creating dependency.</p>
                    </div>
                    <div class="pillar-card reveal reveal-delay-1">
                        <div class="pillar-icon"><svg class="icon"><use href="#icon-check"></use></svg></div>
                        <h4>Honesty</h4>
                        <p>We name what isn't working and fix it. No vague feedback, no empty encouragement.</p>
                    </div>
                    <div class="pillar-card reveal reveal-delay-2">
                        <div class="pillar-icon"><svg class="icon"><use href="#icon-briefcase"></use></svg></div>
                        <h4>Results</h4>
                        <p>Every service is measured against one standard: did the client get closer to their goal?</p>
                    </div>
                    <div class="pillar-card reveal reveal-delay-3">
                        <div class="pillar-icon"><svg class="icon"><use href="#icon-earth"></use></svg></div>
                        <h4>African Excellence</h4>
                        <p>We celebrate the talent, resilience, and potential of African professionals unapologetically.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- SERVICES -->
        <section class="services-section" id="services">
            <div class="services-container">
                <div class="section-header reveal">
                    <span class="section-tag" style="color: var(--green);">What We Do</span>
                    <h2>Everything You Need to Land the Role</h2>
                </div>
                <div class="services-grid">
                    <div class="service-card reveal">
                        <div class="service-icon"><svg class="icon"><use href="#icon-grad"></use></svg></div>
                        <h4>Career Grooming Camp</h4>
                        <p>Our flagship 14-day live cohort covering interview grooming, professional identity, and the STAR technique.</p>
                        <a href="career-grooming-camp.html">View Camp Details &rarr;</a>
                    </div>
                    <div class="service-card reveal reveal-delay-1">
                        <div class="service-icon"><svg class="icon"><use href="#icon-user"></use></svg></div>
                        <h4>ProLaunch Mentorship Initiative (PMI)</h4>
                        <p>Free, high-impact mentorship sessions designed to diagnose your career gaps and provide actionable clarity.</p>
                        <a href="mentorship.html">Meet a Mentor &rarr;</a>
                    </div>
                    <div class="service-card reveal reveal-delay-2">
                        <div class="service-icon"><svg class="icon"><use href="#icon-file"></use></svg></div>
                        <h4>Expert CV Rewrite (Human-Led)</h4>
                        <p>Professional CV rewrites aligned to ATS systems and global hiring standards, making you visible to the right recruiters.</p>
                        <a href="contact.html">Get a Professional Makeover &rarr;</a>
                    </div>
                    <div class="service-card reveal">
                        <div class="service-icon"><svg class="icon"><use href="#icon-robot"></use></svg></div>
                        <h4>AI CV Optimizer (LaunchIQ)</h4>
                        <p>Our proprietary web tool that analyzes your CV against job descriptions to deliver instant ATS positioning scores.</p>
                        <a href="cv-optimizer.html">Optimize My CV &rarr;</a>
                    </div>
                    <div class="service-card reveal reveal-delay-1">
                        <div class="service-icon"><svg class="icon"><use href="#icon-target"></use></svg></div>
                        <h4>LinkedIn Optimization</h4>
                        <p>Strategic profile rewrites built for visibility and recruiter attraction in the competitive remote job market.</p>
                        <a href="contact.html">Optimize My Profile &rarr;</a>
                    </div>
                    <div class="service-card reveal reveal-delay-2">
                        <div class="service-icon"><svg class="icon"><use href="#icon-folder"></use></svg></div>
                        <h4>Portfolio Building</h4>
                        <p>Guided creation of professional portfolios tailored for non-technical remote workers seeking global opportunities.</p>
                        <a href="contact.html">Build Portfolio &rarr;</a>
                    </div>
                </div>
            </div>
        </section>

        <!-- LEADERSHIP -->
        <section class="ceo-section" id="ceo">
            <div class="ceo-inner">
                <div class="ceo-visual reveal">
                    <div class="ceo-img-container">
                        <img src="assets/images/ceo-2.webp" width="372" height="567" alt="Mary-Queen Uchechukwu, Coach MQ" class="ceo-image">
                        <div class="ceo-name-tag">
                            <h4>Mary-Queen Uchechukwu</h4>
                            <span>Coach MQ &middot; Founder</span>
                        </div>
                    </div>
                </div>
                <div class="ceo-content reveal reveal-delay-1">
                    <span class="section-tag" style="color: var(--green);">Leadership</span>
                    <h2>Meet the Visionary Behind Your Career Launch</h2>
                    <p>Mary-Queen Uchechukwu (Coach MQ) is a Career Development Coach and Senior Business Operations Professional who brings a rare combination of technical depth and people-first coaching. As a practicing Cloud &amp; DevOps Engineer, she understands the real, unfiltered demands of the modern remote workplace. Coach MQ doesn't just offer generic advice; she leverages her boardroom-to-bootcamp perspective to deliver structured, high-impact programmes that equip African professionals with the exact tools needed to compete globally.</p>
                    <div class="ceo-quote">
                        <svg class="icon" style="position: absolute; top: -15px; left: 20px; font-size: 2rem; color: var(--green-light); opacity: 0.5;"><use href="#icon-quote"></use></svg>
                        <p>Coach MQ doesn't just teach careers, she builds them.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- SUCCESS STORIES -->
        <section class="testimonials-section" id="testimonials" aria-label="Testimonials">
            <div class="testimonials-inner">
                <div class="section-header reveal">
                    <span class="section-tag">Alumni Results</span>
                    <h2>What Our Community Is Saying</h2>
                </div>
                <div class="testimonials-grid">
                    <div class="testimonial-card reveal" style="grid-column: 1 / -1;">
                        <span class="quote-mark"><svg class="icon"><use href="#icon-quote"></use></svg></span>
                        <p class="testimonial-text">Before joining ProLaunch Career Grooming Camp, I thought being a generalist was the real deal... I realized I had no clear professional identity. Now I have a clear professional identity and I'm intentional and strategic in my approach.</p>
                        <div class="testimonial-author">
                            <span class="author-avatar">ME</span>
                            <div>
                                <span class="author-name">Michael Ekanem</span>
                                <span class="author-role">Executive Virtual Assistant &middot; Cohort 01</span>
                            </div>
                        </div>
                    </div>
                    <div class="testimonial-card reveal reveal-delay-1">
                        <span class="quote-mark"><svg class="icon"><use href="#icon-quote"></use></svg></span>
                        <p class="testimonial-text">The CV rebuild alone changed how recruiters responded to me. I went from silence to interviews in weeks.</p>
                        <div class="testimonial-author">
                            <span class="author-avatar">R</span>
                            <div><span class="author-name">Rebecca</span><span class="author-role">Cohort Alumna</span></div>
                        </div>
                    </div>
                    <div class="testimonial-card reveal reveal-delay-2">
                        <span class="quote-mark"><svg class="icon"><use href="#icon-quote"></use></svg></span>
                        <p class="testimonial-text">I finally understood why my applications weren't landing. The positioning work was the missing piece.</p>
                        <div class="testimonial-author">
                            <span class="author-avatar">N</span>
                            <div><span class="author-name">Nana</span><span class="author-role">Cohort Alumna</span></div>
                        </div>
                    </div>
                    <div class="testimonial-card reveal reveal-delay-3">
                        <span class="quote-mark"><svg class="icon"><use href="#icon-quote"></use></svg></span>
                        <p class="testimonial-text">The STAR method training gave me the structure I needed to actually tell my story in interviews.</p>
                        <div class="testimonial-author">
                            <span class="author-avatar">I</span>
                            <div><span class="author-name">Ijeoma</span><span class="author-role">Cohort Alumna</span></div>
                        </div>
                    </div>
                </div>
                <div style="text-align:center; margin-top: 2.5rem;">
                    <a href="resources.html" class="btn-text">Read More Success Stories &rarr;</a>
                </div>
            </div>
        </section>

        <!-- CONTACT / CTA -->
        <section class="cta-section" id="signup">
            <div class="cta-inner">
                <span class="section-tag">Ready to Launch?</span>
                <h2>Have Questions About Which Path Is Right for You?</h2>
                <p>Reach out to our team &mdash; we'll help you find the right next step.</p>
                <a href="contact.html" class="cta-btn">Contact Us <svg class="icon"><use href="#icon-arrow"></use></svg></a>
            </div>
        </section>
"""

write("index.html", render_page(
    slug="index.html",
    title="ProLaunch Careers | Land Your Remote Career",
    description="ProLaunch Careers helps early-career African professionals land competitive remote jobs through expert coaching, CV optimization, and structured career programmes.",
    active_nav="index.html",
    body_html=BODY,
))
