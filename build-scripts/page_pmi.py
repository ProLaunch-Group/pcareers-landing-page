from make_page import render_page, write

BODY = """
        <!-- HERO -->
        <section class="page-hero" id="pmi-hero">
            <div class="page-hero-inner">
                <span class="hero-badge reveal"><span class="badge-dot"></span> Free &middot; Community-Powered</span>
                <h1 class="reveal reveal-delay-1">The ProLaunch <em>Mentorship</em> Initiative.</h1>
                <p class="page-hero-sub reveal reveal-delay-2">Free, high-impact mentorship sessions that bridge the gap between talent and opportunity. Get honest, experienced guidance on exactly where your career is stuck &mdash; and what to do next.</p>
                <div class="page-hero-cta-row reveal reveal-delay-3">
                    <a href="#request" class="cta-btn">Request a Mentor <svg class="icon"><use href="#icon-arrow"></use></svg></a>
                </div>
            </div>
        </section>

        <!-- MISSION -->
        <section class="section-cream" id="pmi-mission">
            <div class="section-inner-narrow">
                <div class="section-header reveal">
                    <span class="section-tag">Our Mission</span>
                    <h2>Access, Not Just Advice.</h2>
                    <p>PMI exists to bridge the gap between talent and opportunity. We believe the biggest barrier most early-career professionals face is not ability &mdash; it is access. Access to honest feedback. Access to experienced voices. Access to a roadmap. PMI provides that access for free.</p>
                </div>
                <div class="audience-grid" style="grid-template-columns: repeat(3, 1fr);">
                    <div class="pain-card reveal">
                        <h4>Generosity &amp; Clarity</h4>
                        <p>We give freely from our experience, and help mentees see what they cannot see alone.</p>
                    </div>
                    <div class="pain-card reveal reveal-delay-1">
                        <h4>Accountability &amp; Integrity</h4>
                        <p>We hold mentees to a higher standard of themselves &mdash; and we're honest, even when it's uncomfortable.</p>
                    </div>
                    <div class="pain-card reveal reveal-delay-2">
                        <h4>Impact</h4>
                        <p>Every interaction is an opportunity to change a trajectory.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- THE 5-GAP AUDIT -->
        <section class="section-forest" id="pmi-diagnosis">
            <div class="section-inner">
                <div class="section-header reveal">
                    <span class="section-tag" style="color: var(--green);">How Mentorship Works</span>
                    <h2 style="color: var(--cream);">The 5-Gap Career Audit</h2>
                    <p style="color: rgba(255,255,255,0.65);">Before you can move forward, you need to know exactly where you're stuck. Every PMI session starts with a short, honest audit across five areas.</p>
                </div>
                <div class="gap-grid">
                    <div class="gap-card reveal">
                        <span>Gap 1</span>
                        <h4>Identity &amp; Clarity</h4>
                        <p>Do you have a defined career direction and a clear professional identity &mdash; or are you applying broadly and hoping something sticks?</p>
                    </div>
                    <div class="gap-card reveal reveal-delay-1">
                        <span>Gap 2</span>
                        <h4>CV &amp; Document Readiness</h4>
                        <p>Is your CV current, tailored, and built to pass ATS filters &mdash; or is it quietly costing you interviews?</p>
                    </div>
                    <div class="gap-card reveal reveal-delay-2">
                        <span>Gap 3</span>
                        <h4>Online Presence &amp; Personal Brand</h4>
                        <p>Is your LinkedIn active and working for you, or neutral and invisible to recruiters?</p>
                    </div>
                    <div class="gap-card reveal reveal-delay-3">
                        <span>Gap 4</span>
                        <h4>Interview Readiness</h4>
                        <p>Can you tell compelling, structured stories about your experience under pressure?</p>
                    </div>
                    <div class="gap-card reveal">
                        <span>Gap 5</span>
                        <h4>Job Search Strategy &amp; Execution</h4>
                        <p>Are you working from a real 90-day plan, or applying broadly with no system or pipeline?</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- WHAT TO EXPECT -->
        <section class="section-cream" id="pmi-process">
            <div class="section-inner">
                <div class="section-header reveal">
                    <span class="section-tag">What To Expect</span>
                    <h2>A Session Built Around You</h2>
                    <p>Mentors are guides, not doers &mdash; they diagnose gaps, provide direction, and equip you to execute. Here's how a typical mentorship relationship unfolds.</p>
                </div>
                <div class="steps-row">
                    <div class="step-card reveal">
                        <div class="step-circle">1</div>
                        <h4>Request a Mentor</h4>
                        <p>Tell us where you're stuck and what you're working toward.</p>
                    </div>
                    <div class="step-card reveal reveal-delay-1">
                        <div class="step-circle">2</div>
                        <h4>Get Matched</h4>
                        <p>We pair you with a mentor suited to your industry and goals.</p>
                    </div>
                    <div class="step-card reveal reveal-delay-2">
                        <div class="step-circle">3</div>
                        <h4>Run the Audit</h4>
                        <p>Your mentor diagnoses your specific career gaps in your first session.</p>
                    </div>
                    <div class="step-card reveal reveal-delay-3">
                        <div class="step-circle">4</div>
                        <h4>Leave With a Plan</h4>
                        <p>Every session ends with one clear, actionable next step.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- BRIDGE TO CAMP -->
        <section class="cta-section">
            <div class="cta-inner">
                <span class="section-tag">When You Need More Than a Conversation</span>
                <h2>Two or More Critical Gaps? That's a Signal.</h2>
                <p>Mentorship gives you clarity and direction. When a gap needs structured, hands-on execution &mdash; a real CV rebuild, a rebuilt LinkedIn profile, practiced interview delivery &mdash; the Career Grooming Camp is the next step.</p>
                <a href="career-grooming-camp.html" class="cta-btn">Explore the Career Grooming Camp <svg class="icon"><use href="#icon-arrow"></use></svg></a>
            </div>
        </section>

        <!-- REQUEST FORM -->
        <section class="section-white" id="request">
            <div class="section-inner-narrow">
                <div class="contact-form-card reveal">
                    <span class="cohort-badge" style="position: static; display: inline-block; margin-bottom: 1rem;">Free &middot; No Cost</span>
                    <h3>Request a Mentor</h3>
                    <p>Tell us a bit about where you are, and we'll match you with a mentor.</p>
                    <form data-lead-form="pmi-request" novalidate>
                        <div class="form-row">
                            <input type="text" name="full_name" placeholder="Full Name" required class="form-input">
                            <input type="email" name="email" placeholder="Email Address" required class="form-input">
                        </div>
                        <div class="form-group">
                            <input type="tel" name="whatsapp" placeholder="WhatsApp Number" required class="form-input">
                        </div>
                        <div class="form-group">
                            <select name="biggest_blocker" class="form-input" required>
                                <option value="" disabled selected>Biggest blocker right now</option>
                                <option value="CV">CV</option>
                                <option value="LinkedIn">LinkedIn</option>
                                <option value="Interview">Interview</option>
                                <option value="Job Search Strategy">Job Search Strategy</option>
                                <option value="Career Clarity">Career Clarity</option>
                            </select>
                        </div>
                        <button type="submit" class="submit-btn">Request a Mentor</button>
                        <div class="form-response form-note" style="margin-top: 0.75rem;"></div>
                    </form>
                </div>
            </div>
        </section>
"""

write("mentorship.html", render_page(
    slug="mentorship.html",
    title="ProLaunch Mentorship Initiative (PMI) | ProLaunch Careers",
    description="Free, high-impact mentorship sessions that diagnose your career gaps and give you a clear roadmap forward. Request a mentor today.",
    active_nav="mentorship.html",
    body_html=BODY,
))
