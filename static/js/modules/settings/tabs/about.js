import { t } from '../../i18n.js';

export function renderAbout(container) {
    container.innerHTML = `
        <h3>${t('about')} drawNET</h3>
        <div class="setting-row">
            <div class="setting-info">
                <span class="label">Version</span>
                <span class="desc">Premium Edition v2.1.0</span>
            </div>
        </div>
        <div class="setting-row">
            <div class="setting-info">
                <span class="label">Engine</span>
                <span class="desc">AntV X6 + drawNET Proprietary Parser</span>
            </div>
        </div>
        <div class="setting-row">
            <div class="setting-info">
                <span class="label">${t('identity')}</span>
                <span class="desc">Developed for High-Stakes Engineering</span>
            </div>
        </div>
    `;
}
