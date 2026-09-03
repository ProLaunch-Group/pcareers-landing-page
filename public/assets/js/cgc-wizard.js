/**
 * Career Grooming Camp (CGC) - Interactive Multi-Step Registration Wizard
 * Features:
 * - One question per page
 * - Progress tracking & step badges
 * - Keyboard navigation (Enter to next)
 * - Seamless submission to webhook and backend
 */

const CGC_QUESTIONS = [
    {
        id: 'fullName',
        section: 'Personal Details',
        title: 'What is your full name?',
        desc: 'Please enter your first and last name for your cohort badge and certificate.',
        type: 'text',
        placeholder: 'e.g. Samuel Adeyemi',
        required: true,
        field: 'Full Name'
    },
    {
        id: 'email',
        section: 'Personal Details',
        title: 'What is your primary email address?',
        desc: 'We will send your cohort orientation schedule and live session invites here.',
        type: 'email',
        placeholder: 'name@example.com',
        required: true,
        field: 'Email Address'
    },
    {
        id: 'whatsapp',
        section: 'Personal Details',
        title: 'What is your WhatsApp phone number?',
        desc: 'Used for your private Cohort 07 peer group and accountability partner updates.',
        type: 'tel',
        placeholder: '+234 800 000 0000',
        required: true,
        field: 'WhatsApp Number'
    },
    {
        id: 'careerStage',
        section: 'Career Profile',
        title: 'What best describes your current stage?',
        desc: 'Helps us tailor our live feedback and mock interviews to your level.',
        type: 'radio',
        options: [
            'Recent Graduate / National Service',
            'Employed (Actively looking for remote/global roles)',
            'Career Transitioner (Switching to tech or remote)',
            'Unemployed / On a career break'
        ],
        required: true,
        field: 'Current Career Stage'
    },
    {
        id: 'targetTrack',
        section: 'Career Profile',
        title: 'Which career track are you targeting?',
        desc: 'Choose your primary field of focus.',
        type: 'radio',
        options: [
            'Customer Support & Success',
            'Virtual Assistance & Executive Support',
            'Cloud Engineering & DevOps',
            'Product Management',
            'Software Engineering & Web Development',
            'Data Analytics',
            'Marketing & Social Media Management',
            'Other'
        ],
        hasOther: true,
        required: true,
        field: 'Target Career Track'
    },
    {
        id: 'biggestHurdle',
        section: 'Goals & Focus',
        title: 'What is your biggest career hurdle right now?',
        desc: 'Tell us where you need the most intensive transformation during the 14 days.',
        type: 'radio',
        options: [
            'CV/Resume not beating ATS filters or landing interviews',
            'Lack of clarity on my professional positioning & brand',
            'Nervousness in interviews / answering STAR questions',
            'Applying broadly without a structured 90-day pipeline'
        ],
        required: true,
        field: 'Biggest Career Hurdle'
    },
    {
        id: 'commitment',
        section: 'Commitment',
        title: 'Are you ready to commit to the 14 intensive days?',
        desc: 'Daily live sessions, CV reviews, and practical job-search assignments.',
        type: 'radio',
        options: [
            'Yes, I am fully committed to my career breakthrough in Cohort 07!',
            'I have potential scheduling conflicts but want to try.'
        ],
        required: true,
        field: '14-Day Commitment'
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
            wizardCard: document.getElementById('cgc-wizard-card')
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

        // Progress
        const progressPercent = Math.round(((this.currentIndex + 1) / total) * 100);
        this.dom.progressBar.style.width = `${progressPercent}%`;
        this.dom.sectionPill.textContent = q.section;
        this.dom.stepCount.textContent = `Question ${this.currentIndex + 1} of ${total}`;

        this.dom.prevBtn.disabled = (this.currentIndex === 0);
        const isLast = (this.currentIndex === total - 1);
        this.dom.nextBtnText.textContent = isLast ? 'Complete Registration' : 'Next Step';

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
            const otherVal = currentData ? (currentData.other || '') : '';
            const isOtherSelected = selectedVal === 'Other';

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
                    <div class="pmi-other-input-wrap ${isOtherSelected ? 'active' : ''}" id="cgc-other-wrap-${q.id}">
                        <input type="text" class="pmi-text-input" id="cgc-other-${q.id}" placeholder="Please specify..." value="${this.escapeHtml(otherVal)}">
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

            this.answers[q.id] = val;
            return true;
        }

        if (q.type === 'radio') {
            const selectedCard = this.dom.stage.querySelector('.pmi-option-card.selected');
            if (q.required && !selectedCard) {
                this.showError('Please select one of the options.');
                return false;
            }

            if (selectedCard) {
                const val = selectedCard.getAttribute('data-val');
                let otherVal = '';
                if (val === 'Other') {
                    const otherInput = document.getElementById(`cgc-other-${q.id}`);
                    otherVal = otherInput ? otherInput.value.trim() : '';
                    if (!otherVal && q.required) {
                        this.showError('Please specify your other answer.');
                        return false;
                    }
                }
                this.answers[q.id] = { value: val, other: otherVal };
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
        this.dom.nextBtnText.textContent = 'Securing Seat...';

        const payload = {
            form_id: 'camp-enroll-wizard',
            source_page: window.location.pathname,
            cohort: 'Cohort 07',
            submittedAt: new Date().toISOString()
        };

        CGC_QUESTIONS.forEach(q => {
            const ans = this.answers[q.id];
            if (ans === undefined || ans === null) return;
            if (typeof ans === 'string') {
                payload[q.field] = ans;
            } else if (ans.value !== undefined) {
                payload[q.field] = ans.value === 'Other' && ans.other ? `Other: ${ans.other}` : ans.value;
            }
        });

        try {
            if (window.CONFIG && window.CONFIG.ZAPIER_WEBHOOK_URL) {
                await fetch(window.CONFIG.ZAPIER_WEBHOOK_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            try {
                await fetch('/api/community-leads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } catch (ignore) {}

            this.showSuccess();
        } catch (err) {
            console.error('CGC submission error:', err);
            this.showSuccess();
        } finally {
            this.dom.nextBtn.disabled = false;
        }
    }

    showSuccess() {
        this.dom.wizardCard.style.display = 'none';
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
