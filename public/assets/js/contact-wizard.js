/**
 * Contact Page - Interactive Multi-Step Inquiry Wizard
 * Features:
 * - One question per page
 * - Progress tracking & step badges
 * - Keyboard navigation (Enter to next)
 * - Seamless submission to webhook
 */

const CONTACT_QUESTIONS = [
    {
        id: 'fullName',
        section: 'Contact Info',
        title: 'What is your full name?',
        desc: 'Please enter your first and last name.',
        type: 'text',
        placeholder: 'e.g. Michael Chukwu',
        required: true,
        field: 'Full Name'
    },
    {
        id: 'email',
        section: 'Contact Info',
        title: 'What is your email address?',
        desc: 'We will reply to your message here within 48 hours.',
        type: 'email',
        placeholder: 'name@example.com',
        required: true,
        field: 'Email Address'
    },
    {
        id: 'whatsapp',
        section: 'Contact Info',
        title: 'What is your WhatsApp number?',
        desc: 'Optional, if you prefer a quick message or call back.',
        type: 'tel',
        placeholder: '+234 800 000 0000',
        required: false,
        field: 'WhatsApp Number'
    },
    {
        id: 'topic',
        section: 'Topic of Inquiry',
        title: 'What are you reaching out about?',
        desc: 'Select the service or question you would like guidance on.',
        type: 'radio',
        options: [
            'Career Grooming Camp (Cohort Enrollment)',
            'ProLaunch Mentorship Initiative (PMI)',
            'Expert CV Rewrite (Human-Led)',
            'LinkedIn Optimization & Branding',
            'Portfolio Building',
            'Partnership / Other'
        ],
        required: true,
        field: 'Inquiry Topic'
    },
    {
        id: 'message',
        section: 'Your Message',
        title: 'Tell us a bit about what you need',
        desc: 'Share your background, current blocker, or specific questions for our team.',
        type: 'textarea',
        placeholder: 'Write your message here...',
        required: true,
        field: 'Message'
    }
];

class ContactWizard {
    constructor() {
        this.currentIndex = 0;
        this.answers = {};

        this.dom = {
            stage: document.getElementById('contact-question-stage'),
            prevBtn: document.getElementById('contact-btn-prev'),
            nextBtn: document.getElementById('contact-btn-next'),
            nextBtnText: document.getElementById('contact-btn-next-text'),
            progressBar: document.getElementById('contact-progress-bar'),
            sectionPill: document.getElementById('contact-section-pill'),
            stepCount: document.getElementById('contact-step-count'),
            errorMsg: document.getElementById('contact-error-msg'),
            errorText: document.getElementById('contact-error-text'),
            successView: document.getElementById('contact-success-view'),
            wizardCard: document.getElementById('contact-wizard-card')
        };

        this.init();
    }

    init() {
        if (!this.dom.stage) return;

        this.dom.prevBtn.addEventListener('click', () => this.prev());
        this.dom.nextBtn.addEventListener('click', () => this.next());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                const activeEl = document.activeElement;
                if (activeEl && activeEl.closest('#contact-wizard-card') && activeEl.tagName === 'INPUT') {
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
        const q = CONTACT_QUESTIONS[this.currentIndex];
        const total = CONTACT_QUESTIONS.length;
        const currentData = this.answers[q.id] || null;

        const progressPercent = Math.round(((this.currentIndex + 1) / total) * 100);
        this.dom.progressBar.style.width = `${progressPercent}%`;
        this.dom.sectionPill.textContent = q.section;
        this.dom.stepCount.textContent = `Step ${this.currentIndex + 1} of ${total}`;

        this.dom.prevBtn.disabled = (this.currentIndex === 0);
        const isLast = (this.currentIndex === total - 1);
        this.dom.nextBtnText.textContent = isLast ? 'Send Message' : 'Next Step';

        let inputHtml = '';
        if (q.type === 'text' || q.type === 'email' || q.type === 'tel') {
            const val = currentData ? this.escapeHtml(currentData) : '';
            inputHtml = `
                <div class="pmi-input-wrap">
                    <input 
                        type="${q.type}" 
                        id="contact-input-${q.id}" 
                        class="pmi-text-input" 
                        placeholder="${q.placeholder || ''}" 
                        value="${val}" 
                        autocomplete="off"
                    >
                </div>
            `;
        } else if (q.type === 'textarea') {
            const val = currentData ? this.escapeHtml(currentData) : '';
            inputHtml = `
                <div class="pmi-input-wrap">
                    <textarea 
                        id="contact-input-${q.id}" 
                        class="pmi-textarea" 
                        placeholder="${q.placeholder || ''}"
                    >${val}</textarea>
                </div>
            `;
        } else if (q.type === 'radio') {
            const selectedVal = currentData ? currentData.value : '';
            inputHtml = `
                <div class="pmi-options-grid" id="contact-options-${q.id}">
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

        setTimeout(() => {
            const input = this.dom.stage.querySelector('input, textarea');
            if (input) input.focus();
        }, 50);
    }

    attachEvents(q) {
        if (q.type === 'radio') {
            const cards = this.dom.stage.querySelectorAll('.pmi-option-card');
            cards.forEach(card => {
                card.addEventListener('click', () => {
                    cards.forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    this.clearError();
                });
            });
        }
    }

    validateCurrent() {
        const q = CONTACT_QUESTIONS[this.currentIndex];

        if (q.type === 'text' || q.type === 'email' || q.type === 'tel') {
            const input = document.getElementById(`contact-input-${q.id}`);
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

        if (q.type === 'textarea') {
            const input = document.getElementById(`contact-input-${q.id}`);
            const val = input ? input.value.trim() : '';

            if (q.required && !val) {
                this.showError('Please enter your message to continue.');
                return false;
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
                this.answers[q.id] = { value: selectedCard.getAttribute('data-val') };
            }
            return true;
        }

        return true;
    }

    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.renderQuestion();
        }
    }

    async next() {
        if (!this.validateCurrent()) return;

        if (this.currentIndex < CONTACT_QUESTIONS.length - 1) {
            this.currentIndex++;
            this.renderQuestion();
        } else {
            await this.submit();
        }
    }

    async submit() {
        this.dom.nextBtn.disabled = true;
        this.dom.nextBtnText.textContent = 'Sending Message...';

        const payload = {
            form_id: 'contact-page-wizard',
            source_page: window.location.pathname,
            submittedAt: new Date().toISOString()
        };

        CONTACT_QUESTIONS.forEach(q => {
            const ans = this.answers[q.id];
            if (ans === undefined || ans === null) return;
            if (typeof ans === 'string') {
                payload[q.field] = ans;
            } else if (ans.value !== undefined) {
                payload[q.field] = ans.value;
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

            this.showSuccess();
        } catch (err) {
            console.error('Contact submission error:', err);
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
    window.contactWizard = new ContactWizard();
});
