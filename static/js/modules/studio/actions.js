import { studioState } from './state.js';
import * as processor from './processor.js';
import { renderStudioUI } from './renderer.js';
import { logger } from '../utils/logger.js';
import { t } from '../i18n.js';

/**
 * Handle individual asset vectorization
 */
export async function startVectorization(id) {
    const src = studioState.sources.find(s => s.id === id);
    if (!src || src.status === 'processing') return;

    src.status = 'processing';
    renderStudioUI();

    try {
        const img = new Image();
        img.src = src.previewUrl;
        await new Promise(r => img.onload = r);

        const pathData = await processor.traceImage(img, { 
            threshold: src.threshold || 128,
            turdsize: 2
        });
        const svgData = processor.wrapAsSVG(pathData);
        
        studioState.updateSource(id, {
            svgData,
            status: 'done',
            choice: 'svg'
        });
    } catch (err) {
        logger.critical("Trace Error:", err);
        src.status = 'error';
    }
    renderStudioUI();
}

/**
 * Bulk update properties for selected assets
 */
export function bulkUpdateProperties(sources, updates) {
    sources.forEach(src => {
        if (updates.category) src.category = updates.category;
        if (updates.vendor) src.vendor = updates.vendor;
    });
}

/**
 * Final Build and Publish to Server
 */
export async function buildPackage() {
    const packIdElement = document.getElementById('pack-id');
    const packNameElement = document.getElementById('pack-name');
    
    if (!packIdElement) return;

    const packId = packIdElement.value.trim();
    const packName = packNameElement ? packNameElement.value.trim() : packId;

    if (!packId || studioState.sources.length === 0) {
        alert(t('please_enter_pack_id'));
        return;
    }

    const buildBtn = document.getElementById('build-btn');
    const originalText = buildBtn.innerHTML;
    buildBtn.disabled = true;
    buildBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${t('building')}`;

    try {
        const formData = new FormData();
        formData.append('packId', packId);
        formData.append('packName', packName);
        
        const assetsMetadata = studioState.sources.map(src => ({
            id: src.id,
            label: src.label,
            category: src.category,
            choice: src.choice,
            svgData: src.choice === 'svg' ? src.svgData : null
        }));
        formData.append('assets', JSON.stringify(assetsMetadata));

        studioState.sources.forEach(src => {
            if (src.choice === 'png' || (src.type === 'svg' && src.choice === 'svg' && !src.svgData)) {
                formData.append(`file_${src.id}`, src.file);
            }
        });

        const response = await fetch('/api/studio/save-pack', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (result.success) {
            alert(result.message || t('build_success'));
            window.location.href = '/';
        } else {
            throw new Error(result.message || t('build_failed').replace('{message}', ''));
        }
    } catch (err) {
        alert(t('build_failed').replace('{message}', err.message));
        buildBtn.disabled = false;
        buildBtn.innerHTML = originalText;
    }
}

/**
 * Load an existing package from the server
 */
export async function loadExistingPack(packId) {
    if (!packId) return;
    
    try {
        const response = await fetch(`/api/studio/load-pack/${packId}`);
        const result = await response.json();
        
        if (result.success) {
            studioState.loadFromMetadata(result.data);
            
            // UI에 Pack ID와 Name 입력값 동기화
            const packIdInput = document.getElementById('pack-id');
            const packNameInput = document.getElementById('pack-name');
            const vendorInput = document.getElementById('pack-vendor');
            
            if (packIdInput) packIdInput.value = studioState.packInfo.id;
            if (packNameInput) packNameInput.value = studioState.packInfo.name;
            if (vendorInput) vendorInput.value = studioState.packInfo.vendor;
            
            renderStudioUI();
            logger.info(`drawNET Studio: Package "${packId}" loaded.`);
        } else {
            alert(t('load_failed').replace('{message}', result.message));
        }
    } catch (err) {
        alert(t('load_error').replace('{message}', err.message));
    }
}
