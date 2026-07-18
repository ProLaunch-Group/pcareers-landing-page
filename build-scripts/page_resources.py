from make_page import render_page, write

BODY = """
        <!-- HERO -->
        <section class="page-hero" id="resources-hero">
            <div class="page-hero-inner">
                <span class="hero-badge reveal"><span class="badge-dot"></span> Career Tips &amp; Insights</span>
                <h1 class="reveal reveal-delay-1">Resources for the <em>Remote-Ready.</em></h1>
                <p class="page-hero-sub reveal reveal-delay-2">Practical, direct guidance on CVs, LinkedIn, interviews, and job search strategy &mdash; written for African professionals building global careers.</p>
            </div>
        </section>

        <!-- ARTICLES -->
        <section class="section-cream" id="articles">
            <div class="section-inner">
                <div class="section-header reveal">
                    <span class="section-tag">From the Blog</span>
                    <h2>Straight-Talk Career Guidance</h2>
                </div>
                <div class="resources-grid">
                    <div class="article-card reveal">
                        <div class="article-card-body">
                            <span class="article-tag">CV &amp; ATS</span>
                            <h4>Why Your CV Isn't Reaching a Human Recruiter</h4>
                            <p>The ATS filters most job seekers never see &mdash; and the fixes that get you past them.</p>
                            <a href="career-grooming-camp.html" class="btn-text">Read More &rarr;</a>
                        </div>
                    </div>
                    <div class="article-card reveal reveal-delay-1">
                        <div class="article-card-body">
                            <span class="article-tag">LinkedIn</span>
                            <h4>The LinkedIn Mistakes Keeping You Invisible</h4>
                            <p>Small profile gaps that quietly tell recruiters to keep scrolling &mdash; and how to close them.</p>
                            <a href="career-grooming-camp.html" class="btn-text">Read More &rarr;</a>
                        </div>
                    </div>
                    <div class="article-card reveal reveal-delay-2">
                        <div class="article-card-body">
                            <span class="article-tag">Interviews</span>
                            <h4>The STAR Method, Actually Explained</h4>
                            <p>Most candidates know STAR exists. Very few can execute it under pressure. Here's how.</p>
                            <a href="career-grooming-camp.html" class="btn-text">Read More &rarr;</a>
                        </div>
                    </div>
                    <div class="article-card reveal">
                        <div class="article-card-body">
                            <span class="article-tag">Job Search Strategy</span>
                            <h4>Stop Applying to 100 Jobs a Week</h4>
                            <p>Why "spray and pray" fails &mdash; and what a real 90-day execution plan looks like instead.</p>
                            <a href="career-grooming-camp.html" class="btn-text">Read More &rarr;</a>
                        </div>
                    </div>
                    <div class="article-card reveal reveal-delay-1">
                        <div class="article-card-body">
                            <span class="article-tag">Remote Work</span>
                            <h4>Earning in Foreign Currency: What It Actually Takes</h4>
                            <p>A realistic look at what separates candidates who land global remote roles from those who don't.</p>
                            <a href="career-grooming-camp.html" class="btn-text">Read More &rarr;</a>
                        </div>
                    </div>
                    <div class="article-card reveal reveal-delay-2">
                        <div class="article-card-body">
                            <span class="article-tag">Personal Brand</span>
                            <h4>Your Experience Is Your Portfolio</h4>
                            <p>A guide for non-technical professionals who feel like they have nothing to show recruiters.</p>
                            <a href="career-grooming-camp.html" class="btn-text">Read More &rarr;</a>
                        </div>
                    </div>
                </div>

                <div class="notify-banner reveal">
                    <h3>New Articles Every Month</h3>
                    <p>Get the next career tip straight to your inbox &mdash; no spam, ever.</p>
                    <form class="notify-form" data-lead-form="resources-notify" novalidate>
                        <input type="email" name="email" placeholder="Email Address" required>
                        <button type="submit" class="btn-green">Notify Me</button>
                    </form>
                    <div class="form-response form-note" style="margin-top: 0.75rem; color: rgba(255,255,255,0.7);"></div>
                </div>
            </div>
        </section>
"""

write("resources.html", render_page(
    slug="resources.html",
    title="Resources | ProLaunch Careers",
    description="Career tips, CV and LinkedIn guidance, interview prep, and job search strategy for African professionals building remote careers.",
    active_nav="resources.html",
    body_html=BODY,
))
