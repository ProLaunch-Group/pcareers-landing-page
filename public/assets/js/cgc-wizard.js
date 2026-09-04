/**
 * Career Grooming Camp (CGC) - Interactive Expression of Interest Wizard
 * Connected to Google Sheet & Customer Support Follow-up Workflow.
 * 
 * Features:
 * - One question per page
 * - Progress tracking & step pills
 * - Validation on every step
 * - Multi-destination submission:
 *   1. Local backend /api/cgc-interest (records to local JSONL backup & server forwarding)
 *   2. Google Sheet Web App (if configured in CONFIG.CGC_SHEET_WEBHOOK_URL)
 *   3. Zapier Webhook (CONFIG.ZAPIER_WEBHOOK_URL)
 *   4. Google Form formResponse endpoint via background iframe
 * - Clear post-submission guidance: Customer Support WhatsApp follow-up & direct chat
 */

const CGC_QUESTIONS = [
    {
        id: 'fullName',
        section: 'Personal Details',
        title: 'What is your full name?',
        desc: 'Please enter your first and last name for your application record.',
        type: 'text',
        placeholder: 'e.g. Samuel Adeyemi',
        required: true,
        field: 'Full Name',
        sheetColumn: 'Full Name',
        googleEntry: 'entry.1989923886'
    },
    {
        id: 'email',
        section: 'Personal Details',
        title: 'What is your primary email address?',
        desc: 'We will send your cohort orientation schedule and official onboarding pack here.',
        type: 'email',
        placeholder: 'name@example.com',
        required: true,
        field: 'Email Address',
        sheetColumn: 'Email Address',
        googleEntry: 'entry.1328314287'
    },
    {
        id: 'whatsapp',
        section: 'Contact Info',
        title: 'What is your WhatsApp phone number?',
        desc: 'Our Admissions & Customer Support team follows up directly on WhatsApp to answer questions and seal your seat.',
        type: 'tel',
        placeholder: '+234 800 000 0000',
        required: true,
        field: 'Phone Number (Whatsapp)',
        sheetColumn: 'Phone Number (Whatsapp)',
        googleEntry: 'entry.738642673'
    },
    {
        id: 'location',
        section: 'Location',
        title: 'Where are you currently located?',
        desc: 'City & Country (e.g. Lagos, Nigeria / Nairobi, Kenya / London, UK / Canada).',
        type: 'text',
        placeholder: 'e.g. Lagos, Nigeria',
        required: true,
        field: 'Location',
        sheetColumn: 'Location ',
        googleEntry: 'entry.331195417'
    },
    {
        id: 'niche',
        section: 'Career Profile',
        title: 'What is your current niche or target career track?',
        desc: 'Choose your primary field of focus.',
        type: 'radio',
        options: [
            'Virtual Assistance & Executive Support',
            'Customer Support & Client Success',
            'Project Management & Operations',
            'Data Analytics & Business Intelligence',
            'Software Engineering & Tech',
            'Social Media & Content Strategy',
            'Sales, CRM & Business Development',
            'Other'
        ],
        hasOther: true,
        required: true,
        field: 'Current Niche/Field',
        sheetColumn: 'Current Niche/Field',
        googleEntry: 'entry.573662578'
    },
    {
        id: 'experience',
        section: 'Career Profile',
        title: 'What is your current level of experience?',
        desc: 'Helps us tailor live clinic feedback and mock interview scenarios to your level.',
        type: 'radio',
        options: [
            'Beginner (0-1 year)',
            'Intermediate (1-3 years)',
            'Advanced (3-5 years)'
        ],
        required: true,
        field: 'Level of Experience',
        sheetColumn: 'Level of Experience',
        googleEntry: 'entry.1279402356'
    },
    {
        id: 'awareDate',
        section: 'Commitment',
        title: 'Are you aware the Career Grooming Camp starts Sept 7th?',
        desc: 'Sessions run for 14 intensive days with live practical coaching, CV rebuilding, and accountability clinics.',
        type: 'radio',
        options: [
            'Yes',
            'No'
        ],
        required: true,
        field: 'Are you aware the career grooming camp starts Sept 7th?',
        sheetColumn: 'Are you aware the career grooming camp starts Sept 7th?',
        googleEntry: 'entry.930491454'
    },
    {
        id: 'awareCost',
        section: 'Investment',
        title: 'Are you aware the Career Grooming Camp cost is ₦10,000?',
        desc: 'This subsidized fee covers the entire 14-day intensive, review clinics, templates, and lifetime cohort alumni network.',
        type: 'radio',
        options: [
            'Yes',
            'No'
        ],
        required: true,
        field: 'Are you aware the Career Grooming Cost #10,000',
        sheetColumn: 'Are you aware the Career Grooming Cost #10,000',
        googleEntry: 'entry.416279954'
    },
    {
        id: 'readiness',
        section: 'Next Steps',
        title: 'When are you prepared to finalize your payment?',
        desc: 'Our Customer Support team will follow up directly via WhatsApp to assist and confirm your slot.',
        type: 'radio',
        options: [
            'Now',
            'In a week',
            'In two weeks time',
            'In a month time'
        ],
        required: true,
        field: 'Readiness for Payment',
        sheetColumn: 'Readiness for Payment',
        googleEntry: 'entry.29101351'
    }
];

class CgcWizard {
    constructor() {
        this.currentIndex = 0;
        this.hasInteracted = false;
        this.answers = {};

        this.dom = {
            stage: document.getElementById('cgc-question-stage'),
            prevBtn: document.getElementById('cgc-btn-prev'),
            nextBtn: document.getElementById('cgc-btn-next'),
            nextBtnText: document.getElementById('cgc-btn-next-text'),
            progressBar: document.getElementById('cgc-progress-bar'),
            sectionPill: document.getElementById('cgc-section-pill'),
            stepCount: document.getElementById('cgc-step-count'),
            errorMsg: document.getElementById('cgc-error-msg'),
            errorText: document.getElementById('cgc-error-text'),
            successView: document.getElementById('cgc-success-view'),
            wizardCard: document.getElementById('cgc-wizard-card'),
            successText: document.getElementById('cgc-success-text')
        };

        this.init();
    }

    init() {
        if (!this.dom.stage) return;

        this.dom.prevBtn.addEventListener('click', () => this.prev());
        this.dom.nextBtn.addEventListener('click', () => this.next());

        // Keyboard Enter key support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                const activeEl = document.activeElement;
                if (activeEl && activeEl.closest('#cgc-wizard-card') && activeEl.tagName === 'INPUT' && activeEl.type !== 'checkbox') {
                    e.preventDefault();
                    this.next();
                }
            }
        });

        this.renderQuestion();
    }

    clearError() {
        if (this.dom.errorMsg) {
            this.dom.errorMsg.classList.remove('visible');
            this.dom.errorText.textContent = '';
        }
    }

    showError(msg) {
        if (this.dom.errorMsg) {
            this.dom.errorText.textContent = msg;
            this.dom.errorMsg.classList.add('visible');
        }
    }

    renderQuestion() {
        this.clearError();
        const q = CGC_QUESTIONS[this.currentIndex];
        const total = CGC_QUESTIONS.length;
        const currentData = this.answers[q.id] || null;

        // Progress calculation
        const progressPercent = Math.round(((this.currentIndex + 1) / total) * 100);
        this.dom.progressBar.style.width = `${progressPercent}%`;
        this.dom.sectionPill.textContent = q.section;
        this.dom.stepCount.textContent = `Question ${this.currentIndex + 1} of ${total}`;

        // Buttons
        this.dom.prevBtn.disabled = (this.currentIndex === 0);
        const isLast = (this.currentIndex === total - 1);
        this.dom.nextBtnText.textContent = isLast ? 'Submit Expression of Interest' : 'Next Step';

        // Render Input HTML
        let inputHtml = '';
        if (q.type === 'text' || q.type === 'email' || q.type === 'tel') {
            const val = currentData ? this.escapeHtml(currentData) : '';
            inputHtml = `
                <div class="pmi-input-wrap">
                    <input 
                        type="${q.type}" 
                        id="cgc-input-${q.id}" 
                        class="pmi-text-input" 
                        placeholder="${q.placeholder || ''}" 
                        value="${val}" 
                        autocomplete="off"
                    >
                </div>
            `;
        } else if (q.type === 'radio') {
            const selectedVal = currentData ? currentData.value : '';
            const otherVal = (currentData && currentData.otherText) ? this.escapeHtml(currentData.otherText) : '';
            const isOtherSelected = (selectedVal === 'Other');

            inputHtml = `
                <div class="pmi-options-grid" id="cgc-options-${q.id}">
                    ${q.options.map(opt => {
                        const isSelected = selectedVal === opt;
                        return `
                            <div class="pmi-option-card ${isSelected ? 'selected' : ''}" data-val="${this.escapeHtml(opt)}">
                                <span class="pmi-option-indicator"></span>
                                <span class="pmi-option-label">${opt}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
                ${q.hasOther ? `
                    <div class="pmi-other-input-wrap ${isOtherSelected ? 'active' : ''}" id="cgc-other-wrap-${q.id}" style="margin-top: 0.85rem;">
                        <input 
                            type="text" 
                            id="cgc-other-${q.id}" 
                            class="pmi-text-input" 
                            placeholder="Please specify your career track..." 
                            value="${otherVal}"
                        >
                    </div>
                ` : ''}
            `;
        }

        this.dom.stage.innerHTML = `
            <div class="pmi-question-card active">
                <h3 class="pmi-question-title">
                    ${q.title}
                    ${q.required ? '<span class="required-star">*</span>' : ''}
                </h3>
                ${q.desc ? `<p class="pmi-question-desc">${q.desc}</p>` : ''}
                ${inputHtml}
            </div>
        `;

        this.attachEvents(q);

        if (this.hasInteracted) {
            setTimeout(() => {
                const input = this.dom.stage.querySelector('input');
                if (input) input.focus({ preventScroll: true });
            }, 50);
        }
    }

    attachEvents(q) {
        if (q.type === 'radio') {
            const cards = this.dom.stage.querySelectorAll('.pmi-option-card');
            const otherWrap = document.getElementById(`cgc-other-wrap-${q.id}`);
            const otherInput = document.getElementById(`cgc-other-${q.id}`);

            cards.forEach(card => {
                card.addEventListener('click', () => {
                    cards.forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    const val = card.getAttribute('data-val');

                    if (val === 'Other' && otherWrap) {
                        otherWrap.classList.add('active');
                        if (otherInput) otherInput.focus({ preventScroll: true });
                    } else if (otherWrap) {
                        otherWrap.classList.remove('active');
                    }
                    this.hasInteracted = true;
                    this.clearError();
                });
            });
        }
    }

    validateCurrent() {
        const q = CGC_QUESTIONS[this.currentIndex];

        if (q.type === 'text' || q.type === 'email' || q.type === 'tel') {
            const input = document.getElementById(`cgc-input-${q.id}`);
            const val = input ? input.value.trim() : '';

            if (q.required && !val) {
                this.showError('Please provide an answer to continue.');
                return false;
            }

            if (val && q.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(val)) {
                    this.showError('Please enter a valid email address.');
                    return false;
                }
            }

            if (val && q.type === 'tel') {
                if (val.replace(/[^0-9]/g, '').length < 8) {
                    this.showError('Please enter a valid WhatsApp phone number.');
                    return false;
                }
            }

            this.answers[q.id] = val;
            return true;
        }

        if (q.type === 'radio') {
            const selectedCard = this.dom.stage.querySelector('.pmi-option-card.selected');
            if (q.required && !selectedCard) {
                this.showError('Please select an option.');
                return false;
            }

            if (selectedCard) {
                const val = selectedCard.getAttribute('data-val');
                let otherText = '';
                if (val === 'Other' && q.hasOther) {
                    const otherInput = document.getElementById(`cgc-other-${q.id}`);
                    otherText = otherInput ? otherInput.value.trim() : '';
                    if (!otherText) {
                        this.showError('Please specify your track in the text box below.');
                        return false;
                    }
                }
                this.answers[q.id] = {
                    value: val,
                    otherText: otherText
                };
            }
            return true;
        }

        return true;
    }

    prev() {
        this.hasInteracted = true;
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.renderQuestion();
        }
    }

    async next() {
        this.hasInteracted = true;
        if (!this.validateCurrent()) return;

        if (this.currentIndex < CGC_QUESTIONS.length - 1) {
            this.currentIndex++;
            this.renderQuestion();
        } else {
            await this.submit();
        }
    }

    async submit() {
        this.dom.nextBtn.disabled = true;
        this.dom.nextBtnText.textContent = 'Submitting Interest...';

        const fullName = this.answers.fullName || '';
        const email = this.answers.email || '';
        const whatsapp = this.answers.whatsapp || '';
        const location = this.answers.location || '';
        const nicheObj = this.answers.niche || {};
        const niche = (nicheObj.value === 'Other' && nicheObj.otherText) ? nicheObj.otherText : (nicheObj.value || '');
        const experience = (this.answers.experience && this.answers.experience.value) ? this.answers.experience.value : '';
        const awareDate = (this.answers.awareDate && this.answers.awareDate.value) ? this.answers.awareDate.value : 'Yes';
        const awareCost = (this.answers.awareCost && this.answers.awareCost.value) ? this.answers.awareCost.value : 'Yes';
        const readiness = (this.answers.readiness && this.answers.readiness.value) ? this.answers.readiness.value : '';

        // Unified payload
        const payload = {
            full_name: fullName,
            email: email,
            whatsapp: whatsapp,
            location: location,
            niche: niche,
            experience: experience,
            aware_date: awareDate,
            aware_cost: awareCost,
            readiness: readiness,
            source_page: window.location.pathname
        };

        // 1. Submit to Backend /api/cgc-interest (records locally in JSONL and handles server webhooks)
        try {
            await fetch('/api/cgc-interest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (err) {
            console.warn('Backend CGC lead logging notice:', err);
        }

        // 2. Submit to Google Apps Script Web App directly (if configured in CONFIG)
        if (window.CONFIG && window.CONFIG.CGC_SHEET_WEBHOOK_URL) {
            try {
                await fetch(window.CONFIG.CGC_SHEET_WEBHOOK_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        timestamp: new Date().toISOString(),
                        email: email,
                        fullName: fullName,
                        confirmEmail: email,
                        location: location,
                        whatsapp: whatsapp,
                        niche: niche,
                        experience: experience,
                        awareDate: awareDate,
                        awareCost: awareCost,
                        readiness: readiness,
                        status: 'Pending Support Follow-up'
                    })
                });
            } catch (err) {
                console.warn('Google Sheet Webhook post notice:', err);
            }
        }

        // 3. Submit to Zapier Webhook (if configured)
        if (window.CONFIG && window.CONFIG.ZAPIER_WEBHOOK_URL) {
            try {
                await fetch(window.CONFIG.ZAPIER_WEBHOOK_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        form_id: 'cgc-expression-of-interest',
                        ...payload,
                        submittedAt: new Date().toISOString()
                    })
                });
            } catch (err) {
                console.warn('Zapier post notice:', err);
            }
        }

        // 4. Background submission to Google Form endpoint
        this.submitToGoogleFormBackground({
            fullName, email, whatsapp, location, niche, experience, awareDate, awareCost, readiness
        });

        this.showSuccess(fullName, whatsapp);
    }

    submitToGoogleFormBackground(data) {
        if (!window.CONFIG || !window.CONFIG.CGC_GOOGLE_FORM_ACTION || !window.CONFIG.CGC_GOOGLE_FORM_ENTRIES) {
            return;
        }

        try {
            const entries = window.CONFIG.CGC_GOOGLE_FORM_ENTRIES;
            const iframeName = 'gform_sink_' + Date.now();
            const iframe = document.createElement('iframe');
            iframe.name = iframeName;
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            const form = document.createElement('form');
            form.target = iframeName;
            form.method = 'POST';
            form.action = window.CONFIG.CGC_GOOGLE_FORM_ACTION;

            const fields = [
                { name: entries.fullName, val: data.fullName },
                { name: entries.email, val: data.email },
                { name: entries.location, val: data.location },
                { name: entries.whatsapp, val: data.whatsapp },
                { name: entries.niche, val: data.niche },
                { name: entries.experience, val: data.experience },
                { name: entries.awareDate, val: data.awareDate },
                { name: entries.awareCost, val: data.awareCost },
                { name: entries.readiness, val: data.readiness }
            ];

            fields.forEach(f => {
                if (f.name && f.val !== undefined) {
                    const inp = document.createElement('input');
                    inp.type = 'hidden';
                    inp.name = f.name;
                    inp.value = f.val;
                    form.appendChild(inp);
                }
            });

            document.body.appendChild(form);
            form.submit();

            setTimeout(() => {
                try {
                    document.body.removeChild(form);
                    document.body.removeChild(iframe);
                } catch (e) {}
            }, 3000);
        } catch (e) {
            console.warn('Google Form background submit notice:', e);
        }
    }

    showSuccess(fullName, whatsapp) {
        this.dom.wizardCard.style.display = 'none';
        if (this.dom.successText) {
            this.dom.successText.innerHTML = `
                Thank you, <strong>${this.escapeHtml(fullName)}</strong>! We have reserved your provisional seat for Cohort 07.<br><br>
                Our Admissions &amp; Customer Support team will follow up with you directly on WhatsApp (<strong>${this.escapeHtml(whatsapp)}</strong>) within 24&ndash;48 hours to answer any questions and assist you in sealing your &#8358;10,000 subsidized registration.<br><br>
                Once payment is confirmed, your official Cohort Onboarding Pack and community invitation will be dispatched immediately.
            `;
        }
        this.dom.successView.classList.add('active');
        this.dom.successView.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.cgcWizard = new CgcWizard();
});
