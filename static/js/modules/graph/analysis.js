import { state } from '../state.js';
import { logger } from '../utils/logger.js';
import { t } from '../i18n.js';
import { makeDraggable } from '../ui/utils.js';

/**
 * initInventory - Initializes the real-time inventory counting panel
 */
export function initInventory() {
    const inventoryPanel = document.getElementById('inventory-panel');
    const inventoryList = document.getElementById('inventory-list');
    if (!inventoryPanel || !inventoryList) return;

    // Make Draggable
    makeDraggable(inventoryPanel, '.inventory-header');

    // Initial update
    updateInventory(inventoryList);
    
    // Listen for graph changes
    if (state.graph) {
        state.graph.on('node:added', () => updateInventory(inventoryList));
        state.graph.on('node:removed', () => updateInventory(inventoryList));
        state.graph.on('cell:changed', ({ cell }) => {
            if (cell.isNode()) updateInventory(inventoryList);
        });

        // project:restored 이벤트 수신 (복구 시점)
        state.graph.on('project:restored', () => {
            logger.info("Project restored. Updating inventory.");
            updateInventory(inventoryList);
        });
    }
}

/**
 * toggleInventory - Toggles the visibility of the inventory panel
 */
export function toggleInventory() {
    const panel = document.getElementById('inventory-panel');
    if (!panel) return;
    
    // Use getComputedStyle for more reliable check
    const currentDisplay = window.getComputedStyle(panel).display;
    
    if (currentDisplay === 'none') {
        panel.style.display = 'flex';
        panel.classList.add('animate-up');
    } else {
        panel.style.display = 'none';
    }
}

/**
 * updateInventory - Aggregates node counts by type and updates the UI
 */
export function updateInventory(container) {
    if (!state.graph) return;

    // Use default container if not provided
    if (!container) {
        container = document.getElementById('inventory-list');
    }
    if (!container) return;

    const nodes = state.graph.getNodes();
    const counts = {};

    nodes.forEach(node => {
        const data = node.getData() || {};
        const type = data.type || 'Unknown';
        counts[type] = (counts[type] || 0) + 1;
    });

    // Render list
    container.innerHTML = '';
    
    const sortedTypes = Object.keys(counts).sort();
    
    if (sortedTypes.length === 0) {
        container.innerHTML = `<div style="font-size: 10px; color: #94a3b8; text-align: center; margin-top: 10px;">${t('no_objects_found') || 'No objects found'}</div>`;
        return;
    }

    sortedTypes.forEach(type => {
        const item = document.createElement('div');
        item.className = 'inventory-item';
        const displayType = t(type.toLowerCase()) || type;
        item.innerHTML = `
            <span class="lbl">${displayType}</span>
            <span class="val">${counts[type]}</span>
        `;
        container.appendChild(item);
    });

    // BOM 내보내기 버튼 추가 (푸터)
    let footer = document.querySelector('.inventory-footer');
    if (!footer) {
        footer = document.createElement('div');
        footer.className = 'inventory-footer';
    }
    footer.innerHTML = `
        <button id="btn-export-bom" class="btn-export-bom">
            <i class="fas fa-file-excel"></i>
            <span>${t('export_bom') || 'Export BOM (Excel)'}</span>
        </button>
    `;
    container.appendChild(footer);

    const btn = document.getElementById('btn-export-bom');
    if (btn) btn.onclick = downloadBOM;
}

/**
 * downloadBOM - 가시화된 모든 노드 정보를 엑셀/CSV 형태로 추출
 */
function downloadBOM() {
    if (!state.graph) return;

    const nodes = state.graph.getNodes();
    if (nodes.length === 0) return;

    // 헤더 정의
    const headers = [
        t('prop_id'), t('display_name'), t('prop_type'), 
        t('prop_vendor'), t('prop_model'), t('prop_ip'), 
        t('prop_status'), t('prop_asset_tag'), t('prop_project'), t('prop_env')
    ];

    // 데이터 행 생성
    const rows = nodes.map(node => {
        const data = node.getData() || {};
        const label = node.attr('label/text') || '';
        return [
            node.id,
            label,
            data.type || '',
            data.vendor || '',
            data.model || '',
            data.ip || '',
            data.status || '',
            data.asset_tag || '',
            data.project || '',
            data.env || ''
        ].map(val => `"${String(val).replace(/"/g, '""')}"`); // CSV 이스케이프
    });

    // CSV 문자열 합치기
    const csvContent = "\uFEFF" + // UTF-8 BOM for Excel kor
        headers.join(',') + "\n" + 
        rows.map(r => r.join(',')).join('\n');

    // 다운로드 트리거
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `drawNET_BOM_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logger.info("BOM exported successfully.");
}
