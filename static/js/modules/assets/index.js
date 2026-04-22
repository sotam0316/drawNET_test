import { state } from '../state.js';
import { t } from '../i18n.js';
import { fetchAssets } from './api.js';
import { renderLibrary, createAssetElement, renderFlyout } from './renderer.js';
import { renderPackSelector } from './selector.js';
import { initSearch } from './search.js';
import { renderFixedSection } from './fixed_objects.js';
import { logger } from '../utils/logger.js';

/**
 * initAssets - Main initialization for the asset library sidebar
 */
export async function initAssets() {
    try {
        const data = await fetchAssets();
        const library = document.querySelector('.asset-library');
        if (!library) return;

        // 1. Initial Header & Global UI
        library.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin: 24px 16px 12px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">
                <h3 style="margin:0; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--sub-text); font-weight: 800;">
                    ${t('asset_library') || 'Asset Library'}
                </h3>
                <button id="manage-packs-btn" style="background:none; border:none; color: var(--sub-text); cursor:pointer; font-size: 12px; transition: color 0.2s;" title="Manage Packages">
                    <i class="fas fa-filter"></i>
                </button>
            </div>
        `;

        // 2. Setup Manage Packs Button
        document.getElementById('manage-packs-btn').onclick = (e) => {
            e.stopPropagation();
            renderPackSelector(data.packs || []);
        };

        // 3. Initialize selection if empty
        if (state.selectedPackIds.length === 0 && data.packs && data.packs.length > 0) {
            state.selectedPackIds = data.packs.map(p => p.id);
            localStorage.setItem('selectedPackIds', JSON.stringify(state.selectedPackIds));
        }

        // 4. Render Sections
        renderFixedSection(library);
        renderLibrary({ ...data, state }, library, renderPackSelector);

        // 5. Handle Flyouts for Fixed/Custom Sections via Event
        document.addEventListener('render-fixed-flyout', (e) => {
            const { container, assets, meta } = e.detail;
            renderFlyout(container, assets, meta);
        });

        initSearch();

    } catch (e) {
        logger.critical("Asset Initialization Error:", e);
    }
}

export { createAssetElement, renderFlyout, renderPackSelector };
