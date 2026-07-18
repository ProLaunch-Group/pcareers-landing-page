from make_page import render_page, write

BODY = """
        <!-- HERO -->
        <section class="page-hero" id="camp-hero">
            <div class="page-hero-inner">
                <span class="hero-badge reveal"><span class="badge-dot"></span> Cohort 06 Enrolling Now &mdash; Limited to 50 Participants</span>
                <h1 class="reveal reveal-delay-1">From Invisible to <em>Undeniable</em> in 14 Days.</h1>
                <p class="page-hero-sub reveal reveal-delay-2">A live, intensive cohort programme that rebuilds your professional identity, CV, and interview strategy &mdash; so you can stop applying blindly and start landing competitive remote roles.</p>
                <div class="page-hero-cta-row reveal reveal-delay-3">
                    <a href="#enroll" class="cta-btn">Secure Your Seat (&#8358;10,000) <svg class="icon"><use href="#icon-arrow"></use></svg></a>
                </div>
            </div>
        </section>

        <!-- DIAGNOSIS -->
        <section class="section-cream" id="diagnosis">
            <div class="section-inner">
                <div class="section-header reveal">
                    <span class="section-tag">Why You Are Here</span>
                    <h2>Are You Skilled, But Completely Stuck?</h2>
                    <p>You have the talent, the drive, and the experience. But the remote job market is ruthlessly competitive, and right now your approach is costing you opportunities. It isn't a lack of ability holding you back &mdash; it's a lack of positioning and access.</p>
                </div>
                <div class="pain-grid">
                    <div class="pain-card reveal">
                        <h4>The Application Black Hole</h4>
                        <p>You're stuck applying to dozens &mdash; maybe hundreds &mdash; of jobs using a "spray-and-pray" method, only to be met with total silence and zero callbacks. Hope is not a strategy.</p>
                    </div>
                    <div class="pain-card reveal reveal-delay-1">
                        <h4>The ATS Wall</h4>
                        <p>Your CV is outdated, lacks the exact keywords employers want, or uses dense formatting. Applicant Tracking Systems are automatically rejecting your application before a human recruiter ever sees it.</p>
                    </div>
                    <div class="pain-card reveal reveal-delay-2">
                        <h4>The Invisible Profile</h4>
                        <p>Your LinkedIn sits neutral, incomplete, or inactive. Because you lack a personal brand and strategic positioning, global recruiters are completely passing you by.</p>
                    </div>
                    <div class="pain-card reveal reveal-delay-3">
                        <h4>Fumbling the Finish Line</h4>
                        <p>You occasionally get your foot in the door for an interview, but a lack of structured preparation leaves you nervous, unable to tell compelling stories, and losing the offer in the room.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- AUDIENCE -->
        <section class="section-forest" id="audience">
            <div class="section-inner">
                <div class="section-header reveal">
                    <span class="section-tag" style="color: var(--green);">Who Should Attend</span>
                    <h2 style="color: var(--cream);">Who We Built This For</h2>
                    <p style="color: rgba(255,255,255,0.65);">This camp is not a generic, surface-level webinar. It is a highly practical, execution-heavy bootcamp built for African professionals ready to compete and win on the world stage.</p>
                </div>
                <div class="audience-grid">
                    <div class="audience-card reveal">
                        <div class="audience-num">01</div>
                        <h4>The Skilled-but-Stuck Professional</h4>
                        <p>You have 0&ndash;5 years of experience and undeniable ability, but lack a clear professional identity and the strategic positioning needed to stand out in a crowded market.</p>
                    </div>
                    <div class="audience-card reveal reveal-delay-1">
                        <div class="audience-num">02</div>
                        <h4>The Remote Work Aspirant</h4>
                        <p>You're actively looking to transition into remote work and earn in foreign currency. Frustrated by local market limits, you need a roadmap to gain global access.</p>
                    </div>
                    <div class="audience-card reveal reveal-delay-2">
                        <div class="audience-num">03</div>
                        <h4>The Career Pivoter</h4>
                        <p>You're transitioning from traditional, on-site employment into a digital or remote role and need a complete, credibility-building overhaul to prove your value in a new space.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- CURRICULUM -->
        <section class="section-forest" id="curriculum" style="background: var(--darkgreen);">
            <div class="section-inner">
                <div class="section-header reveal">
                    <span class="section-tag" style="color: var(--green);">The 14-Day Roadmap</span>
                    <h2 style="color: var(--cream);">Not Just Advice. Real Execution.</h2>
                </div>
                <div class="module-grid">
                    <div class="module-card reveal">
                        <div class="module-num">01</div>
                        <div><h4>Professional Identity Reset &amp; Career Clarity</h4><p>Redefine how you show up professionally. We build your story, your positioning, and your career direction from the ground up.</p></div>
                    </div>
                    <div class="module-card reveal reveal-delay-1">
                        <div class="module-num">02</div>
                        <div><h4>ATS-Friendly CV Rebuild</h4><p>Stop getting filtered out by robots. We strategically restructure and optimise your CV to pass Applicant Tracking Systems and appeal to human recruiters.</p></div>
                    </div>
                    <div class="module-card reveal reveal-delay-2">
                        <div class="module-num">03</div>
                        <div><h4>LinkedIn Optimization &amp; Personal Branding</h4><p>Turn a neutral profile into a recruiter magnet. You'll actually rebuild your profile during the programme &mdash; not just learn what to do.</p></div>
                    </div>
                    <div class="module-card reveal reveal-delay-3">
                        <div class="module-num">04</div>
                        <div><h4>Recruiter Review Insights</h4><p>Get rare, insider feedback on how hiring managers actually perceive your application materials.</p></div>
                    </div>
                    <div class="module-card reveal">
                        <div class="module-num">05</div>
                        <div><h4>Interview Strategy (STAR Method)</h4><p>Learn to execute the STAR method under pressure so you can tell compelling stories about your experience &mdash; and stop losing the offer in the room.</p></div>
                    </div>
                    <div class="module-card reveal reveal-delay-1">
                        <div class="module-num">06</div>
                        <div><h4>Job Search Strategy &amp; Execution Roadmap</h4><p>Stop relying on spray-and-pray applications. Get a step-by-step 90-day plan covering channel activation, networking, and outreach.</p></div>
                    </div>
                    <div class="module-card reveal reveal-delay-2" style="grid-column: 1 / -1;">
                        <div class="module-num">07</div>
                        <div><h4>Professional Communication</h4><p>Master the polish that signals seniority &mdash; the tone, timing, and templates required for emails, recruiter outreach, and interview follow-ups.</p></div>
                    </div>
                </div>
            </div>
        </section>

        <!-- LOGISTICS + ENROLL -->
        <section class="section-cream" id="enroll">
            <div class="section-inner">
                <div class="logistics-wrap">
                    <div class="reveal">
                        <span class="section-tag">Program Logistics &amp; Investment</span>
                        <h2 style="color: var(--forest); font-size: clamp(1.8rem, 3vw, 2.4rem); margin-bottom: 1rem;">The Attention Is Real.</h2>
                        <p style="color: var(--text-muted); line-height: 1.75; margin-bottom: 1.5rem;">To ensure high-impact, hands-on guidance, this programme is strictly capped at 50 participants per cohort.</p>
                        <ul class="logistics-list">
                            <li><span>Duration</span><strong>14 Intensive Days</strong></li>
                            <li><span>Format</span><strong>Live Online Cohort</strong></li>
                            <li><span>Investment</span><strong>&#8358;10,000</strong></li>
                            <li><span>Cohort</span><strong>Cohort 06 &mdash; Now Enrolling</strong></li>
                        </ul>
                    </div>

                    <div class="form-card reveal reveal-delay-1" style="margin-top: 0;">
                        <span class="cohort-badge">Cohort 06 &middot; 50 Seats</span>
                        <h2>Enroll in Cohort 06</h2>
                        <p class="form-subtitle">Secure your seat before enrollment closes.</p>
                        <form data-lead-form="camp-enroll" novalidate>
                            <div class="form-group">
                                <input type="text" name="full_name" placeholder="Full Name" required class="form-input">
                            </div>
                            <div class="form-group">
                                <input type="email" name="email" placeholder="Email Address" required class="form-input">
                            </div>
                            <div class="form-group">
                                <input type="tel" name="whatsapp" placeholder="WhatsApp Number" required class="form-input">
                            </div>
                            <button type="submit" class="submit-btn">Enroll in Cohort 06 Now</button>
                            <div class="form-response form-note" style="margin-top: 0.75rem;"></div>
                        </form>
                    </div>
                </div>
            </div>
        </section>

        <!-- GUARANTEE -->
        <section class="cta-section">
            <div class="cta-inner">
                <span class="section-tag">We Build Careers Together</span>
                <h2>70%+ of Graduates Land New or Better Roles Within 90 Days</h2>
                <p>You leave these 14 days knowing exactly what to do, and in what order.</p>
                <a href="#enroll" class="cta-btn">Secure Your Seat Now <svg class="icon"><use href="#icon-arrow"></use></svg></a>
            </div>
        </section>
"""

write("career-grooming-camp.html", render_page(
    slug="career-grooming-camp.html",
    title="Career Grooming Camp | ProLaunch Careers",
    description="A 14-day live cohort programme that rebuilds your CV, LinkedIn, and interview strategy so you can land competitive remote jobs. Cohort 06 enrolling now.",
    active_nav="career-grooming-camp.html",
    body_html=BODY,
))
