from make_page import render_page, write

REDIRECT_URL = "https://prolaunch-cv-optimizer.vercel.app/"

BODY = f"""
        <section class="section-cream" id="cv-optimizer-redirect" style="min-height: 70vh; display: flex; align-items: center; padding-top: 9rem;">
            <div class="section-inner-narrow">
                <div class="redirect-card reveal">
                    <div class="service-icon" style="width: 64px; height: 64px; font-size: 1.8rem;">
                        <svg class="icon"><use href="#icon-robot"></use></svg>
                    </div>
                    <h2>Taking You to LaunchIQ</h2>
                    <p>The AI CV Optimizer is a free proprietary tool that scores your CV against any job description and shows you exactly what to fix. You're being redirected to LaunchIQ &mdash; if nothing happens, use the button below.</p>
                    <a href="{REDIRECT_URL}" target="_blank" rel="noopener" class="cta-btn" id="cv-opt-manual-link">Open the CV Optimizer <svg class="icon"><use href="#icon-arrow"></use></svg></a>
                    <p class="redirect-countdown" id="cv-opt-countdown">Redirecting in 3 seconds&hellip;</p>
                </div>
            </div>
        </section>
"""

EXTRA_SCRIPT = f"""<script>
        (function () {{
            var target = "{REDIRECT_URL}";
            var seconds = 3;
            var el = document.getElementById('cv-opt-countdown');
            var timer = setInterval(function () {{
                seconds -= 1;
                if (el) el.textContent = seconds > 0 ? ('Redirecting in ' + seconds + ' second' + (seconds === 1 ? '' : 's') + '\\u2026') : 'Redirecting now\\u2026';
                if (seconds <= 0) {{
                    clearInterval(timer);
                    window.location.href = target;
                }}
            }}, 1000);
        }})();
    </script>"""

write("cv-optimizer.html", render_page(
    slug="cv-optimizer.html",
    title="AI CV Optimizer (LaunchIQ) | ProLaunch Careers",
    description="Analyze your CV against any job description and get an instant ATS and positioning score with LaunchIQ, ProLaunch Careers' free AI CV Optimizer.",
    active_nav="cv-optimizer.html",
    body_html=BODY,
    extra_scripts=EXTRA_SCRIPT,
))
