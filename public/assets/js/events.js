/* Events page — full webinar listing (mirrors the WEBINARS source of truth in app.js).
   To add a new webinar each month, add an object here AND in app.js. */
const EVENTS_WEBINARS = [
    {
        id: "Stop Applying Blindly",
        title: "Stop Applying Blindly: Where to Actually Find Jobs That Match Your Skills",
        date: "2026-07-18",
        status: "past",
        image: "assets/images/event-5.webp",
        description: "Discover how to identify opportunities that match your skills and experience, where to find quality job openings, what recruiters actually look for, and practical strategies to increase your chances of landing interviews.",
        formUrl: "https://forms.gle/q1f5BXfxeBYx2k2s9"
    },
    {
        id: "volunteer-edge",
        title: "The Volunteer Edge",
        date: "2026-05-30",
        status: "past",
        image: "assets/images/event-4.webp",
        description: "Accelerate your career growth through strategic service and learn how to position your volunteer experience as job-ready value employers will notice.",
        formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfizpQrQN4YucHd-eQkoMPcfjcb7p2t04IzpiX6r-6_5V2LwA/viewform"
    },
    {
        id: "remote-interview",
        title: "Mastering the Remote Interview",
        date: "2026-04-15",
        status: "past",
        image: "assets/images/event-3.webp",
        description: "Confidently pass remote interview stages — learn to answer screening questions, present your experience, and communicate your value.",
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
    const grid = document.querySelector('.events-grid');
    if (!grid) return;

    const sorted = [...EVENTS_WEBINARS].sort((a, b) => new Date(b.date) - new Date(a.date));
    const dateFmt = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    grid.innerHTML = sorted.map((w, i) => `
        <div class="event-card reveal reveal-delay-${(i % 5) + 1}">
            <div class="event-header">
                <span class="event-badge ${w.status}">${w.status === 'upcoming' ? 'Upcoming' : 'Past Webinar'}</span>
                <img src="${w.image}" loading="lazy" alt="${w.title}" class="event-img">
            </div>
            <div class="event-body">
                <div class="event-date">${dateFmt(w.date)}</div>
                <h4>${w.title}</h4>
                <p>${w.description}</p>
                <a class="event-cta" href="${w.formUrl}" target="_blank" rel="noopener" aria-label="${w.status === 'upcoming' ? 'Reserve your spot for ' + w.title : 'Access replay of ' + w.title}">
                    ${w.status === 'upcoming' ? 'Reserve My Spot' : 'Access Replay'}
                    <svg class="icon"><use href="#icon-arrow"></use></svg>
                </a>
            </div>
        </div>
    `).join('');

    // Re-run reveal observer for the newly injected cards
    const revealEls = grid.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
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
});
