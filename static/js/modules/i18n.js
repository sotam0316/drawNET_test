import { state } from './state.js';
import { logger } from './utils/logger.js';

export async function initI18n() {
    const lang = state.language;

    try {
        const response = await fetch(`/static/locales/${lang}.json`);
        const translations = await response.json();
        const enResponse = await fetch('/static/locales/en.json');
        const enTranslations = await enResponse.json();

        state.i18n = { ...enTranslations, ...translations };
        applyTranslations();
        logger.high(`i18n initialized for [${lang}]`);
    } catch (err) {
        logger.critical("Failed to load locales", err);
    }
}

export function t(key) {
    return (state.i18n && state.i18n[key]) || key;
}

export function applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = t(key);
        
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = translation;
        } else if (el.title) {
            el.title = translation;
        } else {
            el.innerText = translation;
        }
    });

    // Handle Title specifically if needed
    const searchInput = document.getElementById('asset-search');
    if (searchInput) searchInput.placeholder = t('search_placeholder');
}
