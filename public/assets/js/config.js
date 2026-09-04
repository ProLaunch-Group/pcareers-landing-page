const CONFIG = {
    ZAPIER_WEBHOOK_URL: 'https://hooks.zapier.com/hooks/catch/26961179/unyjjmh/',
    SUCCESS_PAGE_URL: 'success.html',

    // ── Career Grooming Camp (CGC) Google Sheet & Form Integration
    CGC_SHEET_URL: 'https://docs.google.com/spreadsheets/d/1Tr9X7LGV8QDG4tjfhCN8Yj_Flm_uAwrTGQbcSxgAWtg/edit?usp=sharing',
    // Set this URL after deploying the Google Apps Script Web App on the sheet (instructions provided)
    CGC_SHEET_WEBHOOK_URL: 'https://script.google.com/macros/s/AKfycbxCcI4wX35a25QOl1TudyB9jRbvg7OGa_5_7gBb9TqyreZmXW-F5hrfoZd7RPlFOQmopQ/exec',
    CGC_GOOGLE_FORM_ACTION: 'https://docs.google.com/forms/d/e/1FAIpQLSd-YyqggYuxb3J7yUu0luiWAZEGAf75CczAZ_m3YVtQdutdeA/formResponse',
    CGC_GOOGLE_FORM_ENTRIES: {
        fullName: 'entry.1989923886',
        email: 'entry.1328314287',
        location: 'entry.331195417',
        whatsapp: 'entry.738642673',
        niche: 'entry.573662578',
        experience: 'entry.1279402356',
        awareDate: 'entry.930491454',
        awareCost: 'entry.416279954',
        readiness: 'entry.29101351'
    },

    // ── Airtable Integration Options (PMI)
    // Handled securely via backend /api/pmi-application or server environment variables.
    AIRTABLE_BASE_ID: 'appblPsnT3qBzA9yR',
    AIRTABLE_MENTEES_TABLE: 'Mentees',
    AIRTABLE_MENTORS_TABLE: 'Mentors'
};
