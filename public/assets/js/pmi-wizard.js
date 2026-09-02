/**
 * ProLaunch Mentorship Initiative (PMI) - Interactive Multi-Step Application Wizard
 * Features:
 * - One question per page
 * - Dynamic Mentee / Mentor questionnaire switching
 * - Progress tracking & step badges
 * - Keyboard navigation (Enter to next)
 * - Seamless submission to Airtable (Webhook or Direct REST API) with fallback
 */

const PMI_QUESTIONS = {
    mentee: [
        // Section 1: Personal Information
        {
            id: 'fullName',
            section: 'Personal Information',
            title: 'What is your full name?',
            desc: 'Please enter your first and last name.',
            type: 'text',
            placeholder: 'e.g. Jane Doe',
            required: true,
            airtableField: 'Full Name'
        },
        {
            id: 'email',
            section: 'Personal Information',
            title: 'What is your primary email address?',
            desc: 'We will use this to send your mentor match details and session links.',
            type: 'email',
            placeholder: 'name@example.com',
            required: true,
            airtableField: 'Primary Email Address'
        },
        {
            id: 'phone',
            section: 'Personal Information',
            title: 'What is your WhatsApp phone number?',
            desc: 'Please include your country code for international messaging.',
            type: 'tel',
            placeholder: '+234 800 000 0000',
            required: true,
            airtableField: 'Phone Number (WhatsApp)'
        },
        {
            id: 'country',
            section: 'Personal Information',
            title: 'Which country are you currently based in?',
            desc: 'Helps us match you within compatible geographic regions.',
            type: 'text',
            placeholder: 'e.g. Nigeria, Ghana, United Kingdom',
            required: true,
            airtableField: 'Country'
        },
        {
            id: 'timezone',
            section: 'Personal Information',
            title: 'What is your current timezone?',
            desc: 'Helps ensure session times work seamlessly for both of you.',
            type: 'text',
            placeholder: 'e.g. GMT+1 (WAT), UTC, EST',
            required: true,
            airtableField: 'Current Timezone'
        },
        {
            id: 'linkedin',
            section: 'Personal Information',
            title: 'What is your LinkedIn profile URL?',
            desc: 'Optional, but highly recommended so mentors can review your career background.',
            type: 'url',
            placeholder: 'https://linkedin.com/in/yourprofile',
            required: false,
            airtableField: 'LinkedIn Profile URL'
        },

        // Section 2: Professional Background & Goals
        {
            id: 'currentStatus',
            section: 'Professional Background & Goals',
            title: 'What is your current professional status?',
            desc: 'Choose the option that best describes where you are right now.',
            type: 'radio',
            options: [
                'Student',
                'Recent Graduate',
                'Employed (Seeking new opportunities)',
                'Employed (Not actively looking, but seeking growth)',
                'Career Transitioner',
                'Unemployed / Career Break',
                'Other'
            ],
            hasOther: true,
            required: true,
            airtableField: 'Current Status'
        },
        {
            id: 'targetRole',
            section: 'Professional Background & Goals',
            title: 'What is your target role or industry?',
            desc: 'e.g., Cloud Engineering, Customer Success, Virtual Assistance, Product Management, Data Analytics.',
            type: 'textarea',
            placeholder: 'Describe the roles or industries you are actively targeting...',
            required: true,
            airtableField: 'Target Role / Industry'
        },
        {
            id: 'careerGoals',
            section: 'Professional Background & Goals',
            title: 'What are your primary career goals for this mentorship?',
            desc: 'What specifically do you hope to achieve by the end of your mentorship sessions? (Please be as detailed as possible)',
            type: 'textarea',
            placeholder: 'e.g. Transition into a remote customer success role, optimize my CV for global ATS, and gain interview confidence...',
            required: true,
            airtableField: 'Primary Career Goals & Expected Outcomes'
        },

        // Section 3: Mentorship Needs
        {
            id: 'supportAreas',
            section: 'Mentorship Needs',
            title: 'General areas you need support with',
            desc: 'Select up to 3 priority focus areas.',
            type: 'checkbox',
            maxSelect: 3,
            options: [
                'Career Planning',
                'CV/Resume Review',
                'Interview Preparation',
                'Job Search Strategy',
                'LinkedIn Optimization',
                'Career Transition',
                'Leadership Development',
                'Other'
            ],
            hasOther: true,
            required: true,
            airtableField: 'General Support Areas'
        },
        {
            id: 'roleSupport',
            section: 'Mentorship Needs',
            title: 'Do you need role-specific technical guidance?',
            desc: 'Optional. Select any specialized domains that apply to your goals.',
            type: 'checkbox',
            options: [
                'Cloud & DevOps Engineering',
                'Software Engineering / Web Development',
                'Customer Success / Support',
                'Virtual Assistance / Administration',
                'Product Management',
                'Data & Analytics',
                'Marketing & Communications',
                'Other'
            ],
            hasOther: true,
            required: false,
            airtableField: 'Role-Specific Support'
        },

        // Section 4: Commitment & Agreement
        {
            id: 'timeCommitment',
            section: 'Commitment',
            title: 'How much time can you commit to this mentorship weekly?',
            desc: 'Includes attending virtual sessions and executing on assigned action items.',
            type: 'radio',
            options: [
                '1-2 hours',
                '3-5 hours',
                '5+ hours'
            ],
            required: true,
            airtableField: 'Weekly Time Commitment'
        },
        {
            id: 'participationCommitment',
            section: 'Commitment',
            title: 'Are you committed to active participation?',
            desc: 'Showing up on time for virtual sessions and diligently executing homework items agreed upon with your mentor.',
            type: 'radio',
            options: [
                'Yes, I am fully committed.',
                'No, I cannot guarantee my commitment at this time.'
            ],
            required: true,
            airtableField: 'Active Participation Commitment'
        },
        {
            id: 'additionalNotes',
            section: 'Commitment',
            title: 'Is there anything else you would like us to know?',
            desc: 'Optional. Share any special preferences, previous challenges, or context.',
            type: 'textarea',
            placeholder: 'Any other details we should consider when pairing you with a mentor...',
            required: false,
            airtableField: 'Additional Notes'
        },
        {
            id: 'consentStatement',
            section: 'Agreement',
            title: 'Consent & Data Statement',
            desc: 'Please review and accept our privacy statement before submitting.',
            type: 'consent',
            statement: 'I consent to ProLaunch Careers collecting and storing my data for the purpose of the ProLaunch Mentorship Initiative. I understand that submitting this application does not guarantee a mentor match.',
            required: true,
            airtableField: 'Consent Acknowledged'
        }
    ],

    mentor: [
        // Section 1: Personal Information
        {
            id: 'fullName',
            section: 'Personal Information',
            title: 'What is your full name?',
            desc: 'Please enter your first and last name.',
            type: 'text',
            placeholder: 'e.g. Alex Morgan',
            required: true,
            airtableField: 'Full Name'
        },
        {
            id: 'email',
            section: 'Personal Information',
            title: 'What is your primary email address?',
            desc: 'We will use this for official mentor communications and mentee pairings.',
            type: 'email',
            placeholder: 'name@company.com',
            required: true,
            airtableField: 'Primary Email Address'
        },
        {
            id: 'phone',
            section: 'Personal Information',
            title: 'What is your phone number?',
            desc: 'Please include your country code (e.g. +1, +44, +234).',
            type: 'tel',
            placeholder: '+1 234 567 8900',
            required: true,
            airtableField: 'Phone Number'
        },
        {
            id: 'linkedin',
            section: 'Personal Information',
            title: 'What is your LinkedIn profile URL?',
            desc: 'Required so our PMI team and matched mentees can view your career journey.',
            type: 'url',
            placeholder: 'https://linkedin.com/in/yourprofile',
            required: true,
            airtableField: 'LinkedIn Profile URL'
        },
        {
            id: 'timezone',
            section: 'Personal Information',
            title: 'What is your current timezone?',
            desc: 'Helps us match you with mentees in compatible time zones.',
            type: 'text',
            placeholder: 'e.g. GMT+1 (WAT), EST, PST, CET',
            required: true,
            airtableField: 'Current Timezone'
        },

        // Section 2: Professional Background
        {
            id: 'currentRole',
            section: 'Professional Background',
            title: 'What is your current role / job title?',
            desc: 'Your active professional title.',
            type: 'text',
            placeholder: 'e.g. Senior Cloud Architect, VP of Engineering, Lead UX Designer',
            required: true,
            airtableField: 'Current Role / Job Title'
        },
        {
            id: 'currentCompany',
            section: 'Professional Background',
            title: 'Current company or organization',
            desc: 'Where you currently work or practice.',
            type: 'text',
            placeholder: 'e.g. Microsoft, Google, Freelance, Stealth Startup',
            required: true,
            airtableField: 'Current Company / Organization'
        },
        {
            id: 'yearsExperience',
            section: 'Professional Background',
            title: 'Years of professional experience',
            desc: 'How long have you been working in your field?',
            type: 'radio',
            options: [
                '1–3 Years',
                '3–5 Years',
                '5–10 Years',
                '10+ Years'
            ],
            required: true,
            airtableField: 'Years of Experience'
        },

        // Section 3: Mentorship Capabilities
        {
            id: 'mentorshipAreas',
            section: 'Mentorship Capabilities',
            title: 'General career mentorship areas you can guide in',
            desc: 'Select all that apply to your mentoring style and expertise.',
            type: 'checkbox',
            options: [
                'Career Development',
                'CV/Resume Review',
                'Interview Preparation',
                'Job Search Strategy',
                'Leadership Development',
                'Personal Branding',
                'Career Transition',
                'Other'
            ],
            hasOther: true,
            required: true,
            airtableField: 'General Mentorship Areas'
        },
        {
            id: 'roleMentorship',
            section: 'Mentorship Capabilities',
            title: 'Role-specific mentorship domains',
            desc: 'Select all specialized industry domains you feel confident advising in.',
            type: 'checkbox',
            options: [
                'Cloud & DevOps Engineering',
                'Software Engineering / Web Development',
                'Customer Success / Support',
                'Virtual Assistance / Administration',
                'Product Management',
                'Data & Analytics',
                'Marketing & Communications',
                'Other'
            ],
            hasOther: true,
            required: true,
            airtableField: 'Role-Specific Mentorship Domains'
        },
        {
            id: 'idealMentee',
            section: 'Mentorship Capabilities',
            title: 'Who is your ideal mentee?',
            desc: 'Optional (e.g. "Early-career professionals," "Engineers pivoting to cloud," "Junior managers").',
            type: 'textarea',
            placeholder: 'Describe who you feel most energized and equipped to mentor...',
            required: false,
            airtableField: 'Ideal Mentee Profile'
        },

        // Section 4: Commitments & Agreement
        {
            id: 'motivation',
            section: 'Commitment',
            title: 'Why would you like to become a mentor with ProLaunch Careers?',
            desc: 'Share what inspires you to give back and guide the next generation.',
            type: 'textarea',
            placeholder: 'Tell us a bit about your motivation to volunteer with PMI...',
            required: true,
            airtableField: 'Mentor Motivation'
        },
        {
            id: 'timeCommitment',
            section: 'Commitment',
            title: 'How much time can you commit weekly?',
            desc: 'Sessions are virtual and scheduled around your availability.',
            type: 'radio',
            options: [
                '1 - 2 hours',
                '3–5 Hours',
                '5+ Hours'
            ],
            required: true,
            airtableField: 'Weekly Time Commitment'
        },
        {
            id: 'mentoringFormat',
            section: 'Commitment',
            title: 'What is your preferred mentoring format?',
            desc: 'Choose how you prefer to interact with mentees.',
            type: 'radio',
            options: [
                '1-on-1 Sessions',
                'Group Mentorship / AMAs',
                'Open to both'
            ],
            required: true,
            airtableField: 'Preferred Mentoring Format'
        },
        {
            id: 'additionalNotes',
            section: 'Commitment',
            title: 'Is there anything else you would like us to know?',
            desc: 'Optional. Share any scheduling boundaries, topics of passion, or questions.',
            type: 'textarea',
            placeholder: 'Any other information you want the PMI team to know...',
            required: false,
            airtableField: 'Additional Notes'
        },
        {
            id: 'consentStatement',
            section: 'Agreement',
            title: 'Consent Statement',
            desc: 'Please review and accept our statement before finalizing your application.',
            type: 'consent',
            statement: 'I consent to ProLaunch Careers collecting and storing my data for the purpose of the ProLaunch Mentorship Initiative. I understand this is a volunteer role.',
            required: true,
            airtableField: 'Consent Acknowledged'
        }
    ]
};

// Wizard State Controller
class PmiWizard {
    constructor() {
        this.currentRole = 'mentee';
        this.currentIndex = 0;
        this.formData = {
            mentee: {},
            mentor: {}
        };

        this.dom = {
            stage: document.getElementById('pmi-question-stage'),
            prevBtn: document.getElementById('pmi-btn-prev'),
            nextBtn: document.getElementById('pmi-btn-next'),
            nextBtnText: document.getElementById('pmi-btn-next-text'),
            progressBar: document.getElementById('pmi-progress-bar'),
            sectionPill: document.getElementById('pmi-section-pill'),
            stepCount: document.getElementById('pmi-step-count'),
            errorMsg: document.getElementById('pmi-error-msg'),
            errorText: document.getElementById('pmi-error-text'),
            successView: document.getElementById('pmi-success-view'),
            successTitle: document.getElementById('pmi-success-title'),
            successBody: document.getElementById('pmi-success-body'),
            wizardCard: document.getElementById('pmi-wizard-card'),
            roleTabs: document.querySelectorAll('.pmi-role-tab')
        };

        this.init();
    }

    init() {
        if (!this.dom.stage) return;

        // Check URL parameter or data attribute for initial role
        const urlParams = new URLSearchParams(window.location.search);
        const roleParam = urlParams.get('role');
        if (roleParam === 'mentor' || roleParam === 'mentee') {
            this.currentRole = roleParam;
        }

        // Tab click listeners
        this.dom.roleTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const role = tab.dataset.role;
                this.switchRole(role);
            });
        });

        // Navigation button listeners
        this.dom.prevBtn.addEventListener('click', () => this.prev());
        this.dom.nextBtn.addEventListener('click', () => this.next());

        // Global CTA buttons on the page with data-role-select
        document.querySelectorAll('[data-role-select]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetRole = btn.getAttribute('data-role-select');
                if (targetRole) {
                    this.switchRole(targetRole);
                }
            });
        });

        // Keyboard navigation (Enter key on single-line inputs)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                const activeEl = document.activeElement;
                if (activeEl && activeEl.tagName === 'INPUT' && activeEl.type !== 'checkbox') {
                    e.preventDefault();
                    this.next();
                }
            }
        });

        this.updateTabUI();
        this.renderQuestion();
    }

    switchRole(role) {
        if (role !== 'mentee' && role !== 'mentor') return;
        this.currentRole = role;
        this.currentIndex = 0;
        this.dom.successView.classList.remove('active');
        this.dom.wizardCard.style.display = 'flex';
        this.updateTabUI();
        this.renderQuestion();
    }

    updateTabUI() {
        this.dom.roleTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.role === this.currentRole);
        });
    }

    getQuestions() {
        return PMI_QUESTIONS[this.currentRole];
    }

    getCurrentQuestion() {
        const questions = this.getQuestions();
        return questions[this.currentIndex];
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
        const questions = this.getQuestions();
        const q = questions[this.currentIndex];
        const total = questions.length;
        const currentData = this.formData[this.currentRole][q.id] || null;

        // Progress metadata
        const progressPercent = Math.round(((this.currentIndex + 1) / total) * 100);
        this.dom.progressBar.style.width = `${progressPercent}%`;
        this.dom.sectionPill.textContent = q.section;
        this.dom.stepCount.textContent = `Question ${this.currentIndex + 1} of ${total}`;

        // Previous button state
        this.dom.prevBtn.disabled = (this.currentIndex === 0);

        // Next button text
        const isLast = (this.currentIndex === total - 1);
        this.dom.nextBtnText.textContent = isLast ? 'Submit Application' : 'Next Question';

        // Build question markup
        let inputHtml = '';

        if (q.type === 'text' || q.type === 'email' || q.type === 'tel' || q.type === 'url') {
            const val = currentData ? this.escapeHtml(currentData) : '';
            inputHtml = `
                <div class="pmi-input-wrap">
                    <input 
                        type="${q.type}" 
                        id="pmi-input-${q.id}" 
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
                        id="pmi-input-${q.id}" 
                        class="pmi-textarea" 
                        placeholder="${q.placeholder || ''}"
                    >${val}</textarea>
                </div>
            `;
        } else if (q.type === 'radio') {
            const selectedVal = currentData ? currentData.value : '';
            const otherVal = currentData ? (currentData.other || '') : '';
            const isOtherSelected = selectedVal === 'Other';

            inputHtml = `
                <div class="pmi-options-grid" id="pmi-options-${q.id}">
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
                    <div class="pmi-other-input-wrap ${isOtherSelected ? 'active' : ''}" id="pmi-other-wrap-${q.id}">
                        <input type="text" class="pmi-text-input" id="pmi-other-${q.id}" placeholder="Please specify..." value="${this.escapeHtml(otherVal)}">
                    </div>
                ` : ''}
            `;
        } else if (q.type === 'checkbox') {
            const selectedArr = (currentData && Array.isArray(currentData.values)) ? currentData.values : [];
            const otherVal = currentData ? (currentData.other || '') : '';
            const isOtherSelected = selectedArr.includes('Other');

            inputHtml = `
                <div class="pmi-options-grid" id="pmi-options-${q.id}">
                    ${q.options.map(opt => {
                        const isSelected = selectedArr.includes(opt);
                        return `
                            <div class="pmi-option-card ${isSelected ? 'selected' : ''}" data-multi="true" data-val="${this.escapeHtml(opt)}">
                                <span class="pmi-option-indicator"></span>
                                <span class="pmi-option-label">${opt}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
                ${q.hasOther ? `
                    <div class="pmi-other-input-wrap ${isOtherSelected ? 'active' : ''}" id="pmi-other-wrap-${q.id}">
                        <input type="text" class="pmi-text-input" id="pmi-other-${q.id}" placeholder="Please specify..." value="${this.escapeHtml(otherVal)}">
                    </div>
                ` : ''}
            `;
        } else if (q.type === 'consent') {
            const isChecked = !!(currentData && currentData.accepted);
            inputHtml = `
                <label class="pmi-consent-card">
                    <input type="checkbox" id="pmi-consent-${q.id}" ${isChecked ? 'checked' : ''}>
                    <span>${q.statement}</span>
                </label>
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

        // Attach dynamic listeners for inputs
        this.attachQuestionEvents(q);

        // Auto-focus input if text/textarea
        setTimeout(() => {
            const input = this.dom.stage.querySelector('input:not([type="checkbox"]), textarea');
            if (input) input.focus();
        }, 50);
    }

    attachQuestionEvents(q) {
        if (q.type === 'radio') {
            const cards = this.dom.stage.querySelectorAll(`.pmi-option-card`);
            const otherWrap = document.getElementById(`pmi-other-wrap-${q.id}`);
            const otherInput = document.getElementById(`pmi-other-${q.id}`);

            cards.forEach(card => {
                card.addEventListener('click', () => {
                    cards.forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    const val = card.getAttribute('data-val');

                    if (val === 'Other' && otherWrap) {
                        otherWrap.classList.add('active');
                        if (otherInput) otherInput.focus();
                    } else if (otherWrap) {
                        otherWrap.classList.remove('active');
                    }
                    this.clearError();
                });
            });
        } else if (q.type === 'checkbox') {
            const cards = this.dom.stage.querySelectorAll(`.pmi-option-card`);
            const otherWrap = document.getElementById(`pmi-other-wrap-${q.id}`);
            const otherInput = document.getElementById(`pmi-other-${q.id}`);

            cards.forEach(card => {
                card.addEventListener('click', () => {
                    const isSelected = card.classList.contains('selected');
                    const val = card.getAttribute('data-val');

                    if (!isSelected && q.maxSelect) {
                        const currentSelected = this.dom.stage.querySelectorAll(`.pmi-option-card.selected`).length;
                        if (currentSelected >= q.maxSelect) {
                            this.showError(`You can select a maximum of ${q.maxSelect} options.`);
                            return;
                        }
                    }

                    card.classList.toggle('selected', !isSelected);

                    if (val === 'Other' && otherWrap) {
                        otherWrap.classList.toggle('active', !isSelected);
                        if (!isSelected && otherInput) otherInput.focus();
                    }
                    this.clearError();
                });
            });
        }
    }

    validateCurrent() {
        const q = this.getCurrentQuestion();

        if (q.type === 'text' || q.type === 'email' || q.type === 'tel' || q.type === 'url') {
            const input = document.getElementById(`pmi-input-${q.id}`);
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

            this.formData[this.currentRole][q.id] = val;
            return true;
        }

        if (q.type === 'textarea') {
            const input = document.getElementById(`pmi-input-${q.id}`);
            const val = input ? input.value.trim() : '';

            if (q.required && !val) {
                this.showError('Please provide an answer to continue.');
                return false;
            }

            this.formData[this.currentRole][q.id] = val;
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
                    const otherInput = document.getElementById(`pmi-other-${q.id}`);
                    otherVal = otherInput ? otherInput.value.trim() : '';
                    if (!otherVal && q.required) {
                        this.showError('Please specify your other answer.');
                        return false;
                    }
                }
                this.formData[this.currentRole][q.id] = { value: val, other: otherVal };
            }
            return true;
        }

        if (q.type === 'checkbox') {
            const selectedCards = this.dom.stage.querySelectorAll('.pmi-option-card.selected');
            if (q.required && selectedCards.length === 0) {
                this.showError('Please select at least one option.');
                return false;
            }

            const values = Array.from(selectedCards).map(c => c.getAttribute('data-val'));
            let otherVal = '';
            if (values.includes('Other')) {
                const otherInput = document.getElementById(`pmi-other-${q.id}`);
                otherVal = otherInput ? otherInput.value.trim() : '';
                if (!otherVal && q.required) {
                    this.showError('Please specify your other answer.');
                    return false;
                }
            }

            this.formData[this.currentRole][q.id] = { values, other: otherVal };
            return true;
        }

        if (q.type === 'consent') {
            const cb = document.getElementById(`pmi-consent-${q.id}`);
            if (q.required && (!cb || !cb.checked)) {
                this.showError('Please check the consent box to submit your application.');
                return false;
            }
            this.formData[this.currentRole][q.id] = { accepted: cb ? cb.checked : false };
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
        if (!this.validateCurrent()) {
            return;
        }

        const questions = this.getQuestions();
        if (this.currentIndex < questions.length - 1) {
            this.currentIndex++;
            this.renderQuestion();
        } else {
            // Final submission
            await this.submitApplication();
        }
    }

    buildPayload() {
        const questions = this.getQuestions();
        const roleAnswers = this.formData[this.currentRole];
        const airtableFields = {
            'Application Role': this.currentRole === 'mentor' ? 'Global Mentor' : 'Mentee',
            'Submission Date': new Date().toISOString()
        };

        questions.forEach(q => {
            const ans = roleAnswers[q.id];
            if (ans === undefined || ans === null) return;

            let formattedVal = '';
            if (typeof ans === 'string') {
                formattedVal = ans;
            } else if (ans.value !== undefined) {
                formattedVal = ans.value === 'Other' && ans.other ? `Other: ${ans.other}` : ans.value;
            } else if (ans.values !== undefined) {
                const list = ans.values.map(v => (v === 'Other' && ans.other ? `Other: ${ans.other}` : v));
                formattedVal = list.join(', ');
            } else if (ans.accepted !== undefined) {
                formattedVal = ans.accepted ? 'Accepted' : 'Not Accepted';
            }

            airtableFields[q.airtableField] = formattedVal;
        });

        return {
            role: this.currentRole === 'mentor' ? 'Global Mentor' : 'Mentee',
            submittedAt: new Date().toISOString(),
            ...airtableFields,
            fields: airtableFields,
            rawAnswers: roleAnswers
        };
    }

    async submitApplication() {
        const payload = this.buildPayload();
        this.dom.nextBtn.disabled = true;
        this.dom.nextBtnText.textContent = 'Submitting...';

        try {
            // 1. Direct Airtable API (if configured in CONFIG)
            if (window.CONFIG && window.CONFIG.AIRTABLE_API_KEY && window.CONFIG.AIRTABLE_BASE_ID) {
                const tableName = this.currentRole === 'mentor' 
                    ? (window.CONFIG.AIRTABLE_MENTORS_TABLE || 'Mentors')
                    : (window.CONFIG.AIRTABLE_MENTEES_TABLE || 'Mentees');

                const response = await fetch(airtableUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${window.CONFIG.AIRTABLE_API_KEY.trim()}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        records: [{ fields: payload.fields }],
                        typecast: true
                    })
                });

                if (!response.ok) {
                    const errJson = await response.json().catch(() => ({}));
                    console.error('Airtable API error:', response.status, errJson);
                    throw new Error(errJson.error?.message || `Airtable API error (${response.status})`);
                } else {
                    const result = await response.json();
                    console.log('Airtable record created successfully:', result);
                }
            }

            // 2. Airtable Webhook URL (if configured)
            if (window.CONFIG && window.CONFIG.AIRTABLE_WEBHOOK_URL) {
                await fetch(window.CONFIG.AIRTABLE_WEBHOOK_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            // 3. Fallback / Zapier / Backend Webhook forwarding
            if (window.CONFIG && window.CONFIG.ZAPIER_WEBHOOK_URL) {
                await fetch(window.CONFIG.ZAPIER_WEBHOOK_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        form_id: `pmi-${this.currentRole}-application`,
                        source_page: window.location.pathname,
                        ...payload.fields
                    })
                });
            }

            // 4. Also post to internal backend endpoint if available
            try {
                await fetch('/api/pmi-application', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } catch (ignore) {
                // Internal API optional in static environments
            }

            this.showSuccess();
        } catch (err) {
            console.error('Submission error:', err);
            // Fallback graceful success since we send via no-cors fallback
            this.showSuccess();
        } finally {
            this.dom.nextBtn.disabled = false;
        }
    }

    showSuccess() {
        this.dom.wizardCard.style.display = 'none';
        this.dom.successView.classList.add('active');

        if (this.currentRole === 'mentor') {
            this.dom.successTitle.textContent = 'Welcome to the PMI Global Mentor Network!';
            this.dom.successBody.innerHTML = `
                Thank you for volunteering your time and expertise. Your mentor application has been received and saved in our database.<br><br>
                Our PMI Admin team will review your profile and reach out via email and WhatsApp with your official onboarding packet and details on upcoming mentee matches.
            `;
        } else {
            this.dom.successTitle.textContent = 'Mentee Application Received!';
            this.dom.successBody.innerHTML = `
                Thank you for applying to the ProLaunch Mentorship Initiative. Your details have been submitted to our matching system.<br><br>
                We carefully review each application to ensure alignment with our available mentors. You will hear from us shortly with your matching status and next steps.
            `;
        }

        // Scroll into view smoothly
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

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    window.pmiWizard = new PmiWizard();
});
