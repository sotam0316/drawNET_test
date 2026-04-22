/**
 * settings/tabs/workspace.js - Workspace (Canvas/Grid) Settings Tab
 */
import { updateSetting } from '../store.js';
import { t } from '../../i18n.js';

export function renderWorkspace(container, settings) {
    container.innerHTML = `
        <h3>${t('canvas_background') || 'Workspace'}</h3>
        <div class="setting-row">
            <div class="setting-info">
                <span class="label">${t('grid_style')}</span>
                <span class="desc">${t('grid_style_desc')}</span>
            </div>
            <div class="setting-ctrl">
                <select id="grid-style-select">
                    <option value="none" ${settings.gridStyle === 'none' ? 'selected' : ''}>${t('grid_none')}</option>
                    <option value="solid" ${settings.gridStyle === 'solid' ? 'selected' : ''}>${t('grid_solid')}</option>
                    <option value="dashed" ${settings.gridStyle === 'dashed' ? 'selected' : ''}>${t('grid_dashed')}</option>
                </select>
            </div>
        </div>
        <div class="setting-row">
            <div class="setting-info">
                <span class="label">${t('grid_spacing')}</span>
                <span class="desc">${t('grid_spacing_desc')}</span>
            </div>
            <div class="setting-ctrl">
                <input type="number" id="grid-spacing-input" value="${settings.gridSpacing || 20}" min="10" max="100" step="5">
            </div>
        </div>
        <div class="setting-row">
            <div class="setting-info">
                <span class="label">${t('bg_color')}</span>
                <span class="desc">${t('bg_color_desc')}</span>
            </div>
            <div class="setting-ctrl">
                <input type="color" id="bg-color-picker" value="${settings.bgColor || '#f8fafc'}">
            </div>
        </div>
        <div class="setting-row">
            <div class="setting-info">
                <span class="label">${t('grid_color')}</span>
                <span class="desc">${t('grid_color_desc')}</span>
            </div>
            <div class="setting-ctrl">
                <input type="color" id="grid-color-picker" value="${settings.gridColor || '#e2e8f0'}">
            </div>
        </div>
        <div class="setting-row">
            <div class="setting-info">
                <span class="label">${t('grid_thickness')}</span>
                <span class="desc">${t('grid_thickness_desc')}</span>
            </div>
            <div class="setting-ctrl">
                <input type="number" id="grid-thickness-input" value="${settings.gridThickness || 1}" min="0.5" max="5" step="0.5">
            </div>
        </div>
        <div class="setting-row">
            <div class="setting-info">
                <span class="label">${t('show_major_grid')}</span>
                <span class="desc">${t('show_major_grid_desc')}</span>
            </div>
            <div class="setting-ctrl">
                <input type="checkbox" id="major-grid-toggle" ${settings.showMajorGrid ? 'checked' : ''}>
            </div>
        </div>
        <div id="major-grid-options" style="display: ${settings.showMajorGrid ? 'block' : 'none'}">
            <div class="setting-row">
                <div class="setting-info">
                    <span class="label">${t('major_grid_color')}</span>
                    <span class="desc">${t('major_grid_color_desc')}</span>
                </div>
                <div class="setting-ctrl">
                    <input type="color" id="major-grid-color-picker" value="${settings.majorGridColor || '#cbd5e1'}">
                </div>
            </div>
            <div class="setting-row">
                <div class="setting-info">
                    <span class="label">${t('major_grid_interval')}</span>
                    <span class="desc">${t('major_grid_interval_desc')}</span>
                </div>
                <div class="setting-ctrl">
                    <input type="number" id="major-grid-interval-input" value="${settings.majorGridInterval || 5}" min="2" max="20">
                </div>
            </div>
        </div>
        <div class="setting-row">
            <div class="setting-info">
                <span class="label">${t('canvas_preset')}</span>
                <span class="desc">${t('canvas_preset_desc')}</span>
            </div>
            <div class="setting-ctrl">
                <select id="canvas-preset">
                    <option value="full" ${settings.canvasPreset === 'full' ? 'selected' : ''}>${t('canvas_full')}</option>
                    <option value="A4" ${settings.canvasPreset === 'A4' ? 'selected' : ''}>A4</option>
                    <option value="A3" ${settings.canvasPreset === 'A3' ? 'selected' : ''}>A3</option>
                    <option value="custom" ${settings.canvasPreset === 'custom' ? 'selected' : ''}>Custom</option>
                </select>
            </div>
        </div>
        <div id="orientation-container" class="setting-row" style="display: ${settings.canvasPreset === 'full' ? 'none' : 'flex'}">
            <div class="setting-info">
                <span class="label">${t('orientation')}</span>
                <span class="desc">${t('orientation_desc')}</span>
            </div>
            <div class="setting-ctrl">
                <select id="canvas-orientation">
                    <option value="portrait" ${settings.canvasOrientation === 'portrait' ? 'selected' : ''}>${t('portrait')}</option>
                    <option value="landscape" ${settings.canvasOrientation === 'landscape' ? 'selected' : ''}>${t('landscape')}</option>
                </select>
            </div>
        </div>
        <div id="custom-size-inputs" class="setting-row" style="display: ${settings.canvasPreset === 'custom' ? 'flex' : 'none'}; gap: 10px;">
            <input type="number" id="canvas-width" value="${settings.canvasWidth || 800}" placeholder="W" style="width: 70px;">
            <input type="number" id="canvas-height" value="${settings.canvasHeight || 600}" placeholder="H" style="width: 70px;">
            <button id="apply-custom-size" class="footer-btn mini">${t('apply')}</button>
        </div>
    `;
}

export function bindWorkspaceEvents(container) {
    const getGridParams = () => ({
        style: container.querySelector('#grid-style-select').value,
        color: container.querySelector('#grid-color-picker').value,
        thickness: parseFloat(container.querySelector('#grid-thickness-input').value) || 1,
        showMajor: container.querySelector('#major-grid-toggle').checked,
        majorColor: container.querySelector('#major-grid-color-picker').value,
        majorInterval: parseInt(container.querySelector('#major-grid-interval-input').value) || 5
    });

    const dispatchGridUpdate = () => {
        const params = getGridParams();
        updateSetting('gridStyle', params.style);
        updateSetting('gridColor', params.color);
        updateSetting('gridThickness', params.thickness);
        updateSetting('showMajorGrid', params.showMajor);
        updateSetting('majorGridColor', params.majorColor);
        updateSetting('majorGridInterval', params.majorInterval);

        const majorOpts = container.querySelector('#major-grid-options');
        if (majorOpts) majorOpts.style.display = params.showMajor ? 'block' : 'none';

        window.dispatchEvent(new CustomEvent('gridChanged', { detail: params }));
    };

    const gridStyleSelect = container.querySelector('#grid-style-select');
    gridStyleSelect.addEventListener('change', dispatchGridUpdate);

    const gridColorPicker = container.querySelector('#grid-color-picker');
    gridColorPicker.addEventListener('input', dispatchGridUpdate);

    const gridThicknessInput = container.querySelector('#grid-thickness-input');
    gridThicknessInput.addEventListener('input', dispatchGridUpdate);

    const majorGridToggle = container.querySelector('#major-grid-toggle');
    majorGridToggle.addEventListener('change', dispatchGridUpdate);

    const majorGridColorPicker = container.querySelector('#major-grid-color-picker');
    majorGridColorPicker.addEventListener('input', dispatchGridUpdate);

    const majorGridIntervalInput = container.querySelector('#major-grid-interval-input');
    majorGridIntervalInput.addEventListener('input', dispatchGridUpdate);

    const gridSpacingInput = container.querySelector('#grid-spacing-input');
    gridSpacingInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value) || 20;
        updateSetting('gridSpacing', val);
        document.documentElement.style.setProperty('--grid-size', `${val}px`);
        window.dispatchEvent(new CustomEvent('gridSpacingChanged', { detail: { spacing: val } }));
    });

    const bgColorPicker = container.querySelector('#bg-color-picker');
    bgColorPicker.addEventListener('input', (e) => {
        updateSetting('bgColor', e.target.value);
        document.documentElement.style.setProperty('--bg-color', e.target.value);
    });

    const canvasPreset = container.querySelector('#canvas-preset');
    const orientationContainer = container.querySelector('#orientation-container');
    const customSizeDiv = container.querySelector('#custom-size-inputs');

    const updateCanvas = () => {
        const val = canvasPreset.value;
        const orientationSelect = container.querySelector('#canvas-orientation');
        const orient = orientationSelect ? orientationSelect.value : 'portrait';
        
        updateSetting('canvasPreset', val);
        updateSetting('canvasOrientation', orient);
        
        if (customSizeDiv) customSizeDiv.style.display = val === 'custom' ? 'flex' : 'none';
        if (orientationContainer) orientationContainer.style.display = val === 'full' ? 'none' : 'flex';
        
        let w = '100%', h = '100%';
        if (val === 'A4') {
            w = orient === 'portrait' ? 794 : 1123;
            h = orient === 'portrait' ? 1123 : 794;
        } else if (val === 'A3') {
            w = orient === 'portrait' ? 1123 : 1587;
            h = orient === 'portrait' ? 1587 : 1123;
        } else if (val === 'custom') {
            w = parseInt(container.querySelector('#canvas-width').value) || 800;
            h = parseInt(container.querySelector('#canvas-height').value) || 600;
            updateSetting('canvasWidth', w);
            updateSetting('canvasHeight', h);
        }

        window.dispatchEvent(new CustomEvent('canvasResize', { 
            detail: { width: w, height: h } 
        }));
    };

    canvasPreset.addEventListener('change', updateCanvas);
    
    const orientationSelect = container.querySelector('#canvas-orientation');
    if (orientationSelect) orientationSelect.addEventListener('change', updateCanvas);

    const applyCustomBtn = container.querySelector('#apply-custom-size');
    if (applyCustomBtn) applyCustomBtn.addEventListener('click', updateCanvas);
}
