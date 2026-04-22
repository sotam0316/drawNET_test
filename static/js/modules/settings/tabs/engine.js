import { t } from '../../i18n.js';
import { getSettings, updateSetting } from '../store.js';

export function renderEngine(container) {
    const settings = getSettings();
    container.innerHTML = `
        <h3>${t('engine') || 'Engine'}</h3>
        <div class="setting-row">
            <div class="setting-info">
                <span class="label">${t('auto_load_last')}</span>
                <span class="desc">${t('auto_load_last_desc')}</span>
            </div>
            <div class="setting-ctrl">
                <input type="checkbox" id="auto-load-toggle" ${settings.autoLoadLast ? 'checked' : ''}>
            </div>
        </div>
        <div class="setting-row">
            <div class="setting-info">
                <span class="label">${t('sync_mode')}</span>
                <span class="desc">${t('sync_mode_desc')}</span>
            </div>
            <div class="setting-ctrl">
                <select disabled>
                    <option selected>Manual (Pro)</option>
                    <option>Real-time (Legacy)</option>
                </select>
            </div>
        </div>
        <div class="setting-row">
            <div class="setting-info">
                <span class="label">${t('auto_save')}</span>
                <span class="desc">${t('auto_save_desc')}</span>
            </div>
            <div class="setting-ctrl">
                <input type="checkbox" checked disabled>
            </div>
        </div>
    `;
}

export function bindEngineEvents(container) {
    const autoLoadToggle = container.querySelector('#auto-load-toggle');
    if (autoLoadToggle) {
        autoLoadToggle.addEventListener('change', (e) => {
            updateSetting('autoLoadLast', e.target.checked);
        });
    }
}
