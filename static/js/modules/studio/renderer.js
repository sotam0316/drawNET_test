import { studioState } from './state.js';
import * as actions from './actions.js';
import { t } from '../i18n.js';

/**
 * Main Studio UI rendering orchestrator
 */
export function renderStudioUI() {
    renderSourceList();
    renderAssetGrid();
    renderPropertyPanel();
}

/**
 * Left Panel: Source File List
 */
function renderSourceList() {
    const list = document.getElementById('source-list');
    const loadArea = document.getElementById('load-package-area');
    if (!list) return;

    // 1. Render Load Area (only once or update if needed)
    if (loadArea && loadArea.innerHTML === "") {
        fetch('/assets').then(res => res.json()).then(data => {
            const packs = data.packs || [];
            loadArea.innerHTML = `
                <div style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(56, 189, 248, 0.03);">
                    <label style="display: block; font-size: 10px; color: #64748b; margin-bottom: 8px;">${t('studio_edit_existing')}</label>
                    <div style="display: flex; gap: 8px;">
                        <select id="exist-pack-select" style="flex: 1; background: #0f172a; border: 1px solid rgba(255,255,255,0.1); color: white; padding: 6px; border-radius: 4px; font-size: 11px;">
                            <option value="">${t('studio_select_package')}</option>
                            ${packs.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                        </select>
                        <button id="load-pack-btn" style="background: #38bdf8; color: #0f172a; border: none; padding: 0 10px; border-radius: 4px; cursor: pointer; font-weight: 800; font-size: 11px;">${t('studio_open')}</button>
                    </div>
                </div>
            `;
            
            document.getElementById('load-pack-btn').onclick = () => {
                const packId = document.getElementById('exist-pack-select').value;
                if (packId && confirm(t('confirm_load_package').replace('{id}', packId))) {
                    actions.loadExistingPack(packId);
                }
            };
        });
    }

    // 2. Render Source List
    list.innerHTML = studioState.sources.map(src => `
        <li class="source-item ${studioState.selectedIds.has(src.id) ? 'active' : ''}" data-id="${src.id}">
            <i class="fas ${src.type === 'svg' ? 'fa-vector-square' : 'fa-image'}"></i>
            <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${src.name}</span>
            <i class="fas fa-times delete-btn" style="font-size: 10px; cursor: pointer;" title="${t('remove')}"></i>
        </li>
    `).join('');

    // Add click listeners
    list.querySelectorAll('.source-item').forEach(item => {
        const id = item.dataset.id;
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                studioState.removeSource(id);
                renderStudioUI();
            } else {
                studioState.toggleSelection(id, e.ctrlKey || e.metaKey);
                renderStudioUI();
            }
        });
    });
}

/**
 * Center Panel: Asset Preview Grid
 */
function renderAssetGrid() {
    const grid = document.getElementById('asset-grid');
    if (!grid) return;

    if (studioState.sources.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: #475569; margin-top: 100px;">
                <i class="fas fa-layer-group" style="font-size: 40px; margin-bottom: 20px; display: block;"></i>
                <p>${t('studio_no_assets')}</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = studioState.sources.map(src => `
        <div class="asset-card ${studioState.selectedIds.has(src.id) ? 'selected' : ''}" data-id="${src.id}">
            <div class="asset-preview">
                <img src="${src.previewUrl}" alt="${src.name}">
            </div>
            <div class="asset-name">${src.label}</div>
            <div style="font-size: 9px; color: #64748b; margin-top: 4px;">${src.choice.toUpperCase()}</div>
        </div>
    `).join('');

    // Add click listeners
    grid.querySelectorAll('.asset-card').forEach(card => {
        card.addEventListener('click', (e) => {
            studioState.toggleSelection(card.dataset.id, e.ctrlKey || e.metaKey);
            renderStudioUI();
        });
    });
}

/**
 * Right Panel: Property Settings & Comparison
 */
function renderPropertyPanel() {
    const panel = document.querySelector('.property-panel .panel-content');
    if (!panel) return;

    const selectedSources = studioState.sources.filter(s => studioState.selectedIds.has(s.id));

    if (selectedSources.length === 0) {
        panel.innerHTML = `
            <div style="text-align: center; color: #475569; margin-top: 50px;">
                <i class="fas fa-info-circle" style="font-size: 30px; margin-bottom: 15px; display: block;"></i>
                <p style="font-size: 13px;">${t('studio_select_prompt')}</p>
            </div>
        `;
        return;
    }

    if (selectedSources.length === 1) {
        const src = selectedSources[0];
        panel.innerHTML = renderSingleAssetUI(src);
        setupSingleAssetListeners(panel, src);
    } else {
        panel.innerHTML = renderBulkEditUI(selectedSources.length);
        setupBulkEditListeners(panel, selectedSources);
    }
}

function renderSingleAssetUI(src) {
    return `
        <div class="settings-group">
            <h3 style="font-size: 13px; color: #38bdf8; margin-bottom: 15px;">${t('studio_asset_detail')}</h3>
            <div style="margin-bottom: 12px;">
                <label style="display: block; font-size: 10px; color: #64748b; margin-bottom: 4px;">${t('display_name_label')}</label>
                <input type="text" id="prop-label" value="${src.label}" style="width: 100%; background: #1e293b; border: 1px solid rgba(255,255,255,0.1); color: white; padding: 8px; border-radius: 4px; font-size: 12px;">
            </div>
            <div style="margin-bottom: 12px;">
                <label style="display: block; font-size: 10px; color: #64748b; margin-bottom: 4px;">${t('category')}</label>
                <div style="display: flex; gap: 8px;">
                    <select id="prop-category" style="flex: 1; background: #1e293b; border: 1px solid rgba(255,255,255,0.1); color: white; padding: 8px; border-radius: 4px; font-size: 12px;">
                        ${studioState.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                    </select>
                    <button id="add-cat-btn" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #38bdf8; width: 32px; border-radius: 4px; cursor: pointer;" title="${t('add_category_tooltip')}">+</button>
                </div>
                <!-- Hidden Add Form -->
                <div id="new-cat-area" style="display: none; margin-top: 8px; gap: 8px; align-items: center;">
                    <input type="text" id="new-cat-name" placeholder="${t('new_category_placeholder')}" style="flex: 1; background: #0f172a; border: 1px solid #38bdf8; color: white; padding: 6px; border-radius: 4px; font-size: 11px;">
                    <button id="save-cat-btn" style="background: #38bdf8; color: #0f172a; border: none; padding: 6px 10px; border-radius: 4px; font-size: 11px; font-weight: 700;">${t('add')}</button>
                </div>
            </div>
            <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <label style="font-size: 10px; color: #64748b;">${t('trace_threshold')}</label>
                    <span id="threshold-val" style="font-size: 10px; color: #38bdf8; font-weight: 800;">${src.threshold || 128}</span>
                </div>
                <input type="range" id="prop-threshold" min="0" max="255" value="${src.threshold || 128}" style="width: 100%; height: 4px; background: #1e293b; border-radius: 2px; cursor: pointer;">
                <p style="font-size: 9px; color: #475569; margin-top: 6px;">${t('trace_hint')}</p>
            </div>
        </div>

        <div class="comparison-view">
            <div class="comp-box">
                <span class="comp-label">${t('original')}</span>
                <div class="comp-preview">
                    <img src="${src.previewUrl}">
                </div>
                <button class="choice-btn ${src.choice === 'png' ? 'active' : ''}" data-choice="png">${t('keep_png')}</button>
            </div>
            <div class="comp-box">
                <span class="comp-label">${t('vector_svg')}</span>
                <div class="comp-preview" id="svg-preview">
                    ${src.svgData ? src.svgData : '<i class="fas fa-magic" style="opacity:0.2"></i>'}
                </div>
                <button class="choice-btn ${src.choice === 'svg' ? 'active' : ''}" 
                        data-choice="svg" 
                        ${!src.svgData ? 'disabled style="opacity:0.3"' : ''}>
                    ${t('use_svg')}
                </button>
            </div>
        </div>
        
        <div style="margin-top: 20px;">
            <button id="convert-btn" class="btn-primary" style="width: 100%; font-size: 11px; background: #6366f1;" ${src.status === 'processing' ? 'disabled' : ''}>
                ${src.status === 'processing' ? `<i class="fas fa-spinner fa-spin"></i> ${t('tracing')}` : t('convert_to_svg')}
            </button>
        </div>
    `;
}

let thresholdTimer = null;
function setupSingleAssetListeners(panel, src) {
    panel.querySelector('#prop-label').oninput = (e) => src.label = e.target.value;
    panel.querySelector('#prop-category').onchange = (e) => src.category = e.target.value;
    panel.querySelector('#prop-category').value = src.category;

    panel.querySelector('#add-cat-btn').onclick = () => {
        const area = panel.querySelector('#new-cat-area');
        area.style.display = area.style.display === 'none' ? 'flex' : 'none';
        if (area.style.display === 'flex') panel.querySelector('#new-cat-name').focus();
    };

    panel.querySelector('#save-cat-btn').onclick = () => {
        const input = panel.querySelector('#new-cat-name');
        const name = input.value.trim();
        if (studioState.addCategory(name)) {
            src.category = name;
            renderStudioUI();
        } else {
            panel.querySelector('#new-cat-area').style.display = 'none';
        }
    };

    const thresholdInput = panel.querySelector('#prop-threshold');
    const thresholdVal = panel.querySelector('#threshold-val');
    
    thresholdInput.oninput = (e) => {
        const val = parseInt(e.target.value);
        src.threshold = val;
        thresholdVal.textContent = val;
        
        // Debounced Auto-retrace
        clearTimeout(thresholdTimer);
        thresholdTimer = setTimeout(() => {
            actions.startVectorization(src.id);
        }, 400);
    };

    panel.querySelectorAll('.choice-btn').forEach(btn => {
        btn.onclick = () => {
            if (btn.disabled) return;
            studioState.setChoice(src.id, btn.dataset.choice);
            renderStudioUI();
        };
    });

    panel.querySelector('#convert-btn').onclick = () => actions.startVectorization(src.id);
}

function renderBulkEditUI(count) {
    return `
        <div class="settings-group">
            <h3 style="font-size: 13px; color: #fbbf24; margin-bottom: 20px;">${t('bulk_edit').replace('{count}', count)}</h3>
            <div style="margin-bottom: 15px;">
                <label style="display: block; font-size: 10px; color: #64748b; margin-bottom: 5px;">${t('common_category')}</label>
                    <select id="bulk-category" style="width: 100%; background: #1e293b; border: 1px solid rgba(255,255,255,0.1); color: white; padding: 8px; border-radius: 4px; font-size: 12px;">
                        <option value="">${t('no_change')}</option>
                        ${studioState.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                    </select>
            </div>
        </div>
        <button id="bulk-apply" class="btn-primary" style="width: 100%; font-size: 11px;">${t('apply_to_selected')}</button>
    `;
}

function setupBulkEditListeners(panel, selectedSources) {
    panel.querySelector('#bulk-apply').onclick = () => {
        const cat = panel.querySelector('#bulk-category').value;
        actions.bulkUpdateProperties(selectedSources, { category: cat });
        renderStudioUI();
    };
}
