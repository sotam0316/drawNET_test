/**
 * settings/tabs/general.js - General Settings Tab
 */
import { setTheme, getSettings } from '../store.js';
import { t } from '../../i18n.js';

export function renderGeneral(container) {
    container.innerHTML = `
        <h3>${t('identity') || 'Identity'}</h3>
        <div class="setting-row">
            <div class="setting-info">
                <span class="label">${t('dark_mode')}</span>
                <span class="desc">${t('dark_mode_desc')}</span>
            </div>
            <div class="setting-ctrl">
                <label class="toggle-switch">
                    <input type="checkbox" id="dark-mode-toggle" ${document.documentElement.getAttribute('data-theme') === 'dark' ? 'checked' : ''}>
                    <div class="switch-slider"></div>
                </label>
            </div>
        </div>
        
        <h3 style="margin-top: 24px;">${t('editor_behavior') || 'Editor Behavior'}</h3>
        <div class="setting-row">
            <div class="setting-info">
                <span class="label">${t('confirm_ungroup') || 'Confirm before Un-grouping'}</span>
                <span class="desc">${t('confirm_ungroup_desc') || 'Show a confirmation dialog when removing an object from a group.'}</span>
            </div>
            <div class="setting-ctrl">
                <label class="toggle-switch">
                    <input type="checkbox" id="confirm-ungroup-toggle" ${getSettings().confirmUngroup !== false ? 'checked' : ''}>
                    <div class="switch-slider"></div>
                </label>
            </div>
        </div>

        <h3 style="margin-top: 24px;">${t('language') || 'Language'}</h3>
        <div class="setting-row">
            <div class="setting-info">
                <span class="label">${t('language')}</span>
                <span class="desc">${t('select_lang_desc')}</span>
            </div>
            <div class="setting-ctrl">
                <select id="lang-select" class="prop-input" style="width: 120px;">
                    <option value="ko" ${localStorage.getItem('drawNET_lang') === 'ko' ? 'selected' : ''}>한국어</option>
                    <option value="en" ${localStorage.getItem('drawNET_lang') === 'en' ? 'selected' : ''}>English</option>
                </select>
            </div>
        </div>
    `;
}

export function bindGeneralEvents(container) {
    const darkModeToggle = container.querySelector('#dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', (e) => setTheme(e.target.checked ? 'dark' : 'light'));
    }

    const ungroupToggle = container.querySelector('#confirm-ungroup-toggle');
    if (ungroupToggle) {
        ungroupToggle.addEventListener('change', (e) => {
            import('../store.js').then(m => m.updateSetting('confirmUngroup', e.target.checked));
        });
    }

    const langSelect = container.querySelector('#lang-select');
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            localStorage.setItem('drawNET_lang', e.target.value);
            location.reload();
        });
    }
}
