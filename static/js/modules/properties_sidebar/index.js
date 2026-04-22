import { state } from '../state.js';
import { logger } from '../utils/logger.js';
import { getNodeTemplate, getEdgeTemplate, getMultiSelectTemplate } from './templates.js';
import { getRichCardTemplate } from './templates/rich_card.js';
import { handleNodeUpdate } from './handlers/node.js';
import { handleEdgeUpdate } from './handlers/edge.js';
import { handleRichCardUpdate } from './handlers/rich_card.js';

// --- Utility: Simple Debounce to prevent excessive updates ---
function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

let sidebarElement = null;

export function initPropertiesSidebar() {
    sidebarElement = document.getElementById('properties-sidebar');
    if (!sidebarElement) return;

    const closeBtn = sidebarElement.querySelector('.close-sidebar');
    const footerBtn = sidebarElement.querySelector('#sidebar-apply');
    const content = sidebarElement.querySelector('.sidebar-content');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            unhighlight();
            toggleSidebar(false);
        });
    }
    if (footerBtn) {
        footerBtn.addEventListener('click', () => {
            unhighlight();
            applyChangesGlobal();
            toggleSidebar(false);
        });
    }

    // Event Delegation: Register once at initialization to prevent memory leaks and redundant listeners
    if (content) {
        content.addEventListener('input', (e) => {
            const input = e.target;
            if (!input.classList.contains('prop-input')) return;
        });

        content.addEventListener('change', (e) => {
            const input = e.target;
            if (!input.classList.contains('prop-input')) return;
            
            const isText = (input.type === 'text' || input.tagName === 'TEXTAREA' || input.type === 'number');
            if (!isText) {
                applyChangesGlobal();
            }
        });

        content.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                applyChangesGlobal();
                toggleSidebar(false);
            }
        });
    }

    if (state.graph) {
        state.graph.on('selection:changed', ({ selected }) => {
            unhighlight();
            renderProperties();
            if (selected && selected.length > 0) toggleSidebar(true);
        });

        const safeRender = () => {
            const active = document.activeElement;
            const isEditing = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
            
            if (sidebarElement && sidebarElement.contains(active) && isEditing) {
                return;
            }
            // Use setTimeout to ensure X6 data sync is complete before re-rendering
            setTimeout(() => renderProperties(), 0);
        };

        state.graph.on('cell:change:data', ({ options }) => {
            if (options && options.silent) return;
            safeRender();
        });
        state.graph.on('cell:change:attrs', ({ options }) => {
            if (options && options.silent) return;
            safeRender();
        });
    }
}

const applyChangesGlobal = async () => {
    if (!state.graph) return;
    const selected = state.graph.getSelectedCells();
    if (selected.length !== 1) return;

    const cell = selected[0];
    const data = cell.getData() || {};

    if (cell.shape === 'drawnet-rich-card') {
        await handleRichCardUpdate(cell, data);
    } else if (cell.isNode()) {
        await handleNodeUpdate(cell, data);
    } else {
        await handleEdgeUpdate(cell, data);
    }
    
    import('/static/js/modules/persistence.js').then(m => m.markDirty());
};

const debouncedApplyGlobal = debounce(applyChangesGlobal, 300);

export function toggleSidebar(open) {
    if (!sidebarElement) return;
    if (open === undefined) {
        sidebarElement.classList.toggle('open');
    } else if (open) {
        sidebarElement.classList.add('open');
    } else {
        sidebarElement.classList.remove('open');
    }
}

export function renderProperties() {
    if (!state.graph || !sidebarElement) return;
    
    const selected = state.graph.getSelectedCells();
    const content = sidebarElement.querySelector('.sidebar-content');
    if (!content) return;

    logger.info(`[Sidebar] renderProperties start`, {
        selectedCount: selected.length,
        firstId: selected[0]?.id
    });

    if (!selected || selected.length === 0) {
        content.innerHTML = `<div style="color: #64748b; text-align: center; margin-top: 40px;">Select an object to edit properties</div>`;
        return;
    }

    if (selected.length > 1) {
        content.innerHTML = getMultiSelectTemplate(selected.length);
        
        content.querySelectorAll('.align-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                if (action) import('/static/js/modules/ui/context_menu/handlers.js').then(m => m.handleMenuAction(action));
            });
        });

        const lockToggle = content.querySelector('#prop-locked');
        if (lockToggle) {
            lockToggle.addEventListener('change', () => {
                const isLocked = lockToggle.checked;
                selected.forEach(cell => {
                    const data = cell.getData() || {};
                    cell.setData({ ...data, locked: isLocked });
                    cell.setProp('movable', !isLocked);
                    cell.setProp('deletable', !isLocked);
                    if (cell.isNode()) cell.setProp('rotatable', !isLocked);

                    if (isLocked) {
                        cell.addTools([{ name: 'boundary', args: { attrs: { stroke: '#ef4444', 'stroke-dasharray': '5,5' } } }]);
                    } else {
                        cell.removeTools();
                    }
                });
                import('/static/js/modules/persistence.js').then(m => m.markDirty());
            });
        }
        return;
    }

    const cell = selected[0];
    const data = cell.getData() || {};
    const isNode = cell.isNode();

    if (isNode) {
        const allGroups = state.graph.getNodes().filter(n => n.getData()?.is_group && n.id !== cell.id);
        const liveParent = cell.getParent();
        const uiData = { ...data, id: cell.id, parent: liveParent ? liveParent.id : null };
        
        if (cell.shape === 'drawnet-rich-card') {
            content.innerHTML = getRichCardTemplate(cell);
        } else {
            content.innerHTML = getNodeTemplate(uiData, allGroups);
        }
    } else {
        content.innerHTML = getEdgeTemplate({ ...data, id: cell.id });
    }

    if (!isNode) {
        initAnchorHighlighting(cell, content);
    }
}

function unhighlight() {
    if (!state.graph) return;
    state.graph.getNodes().forEach(node => {
        const data = node.getData() || {};
        if (data._isHighlighting) {
            node.attr('body/stroke', data._oldStroke, { silent: true });
            node.attr('body/strokeWidth', data._oldWidth, { silent: true });
            node.setData({ ...data, _isHighlighting: false }, { silent: true });
        }
    });
}

function initAnchorHighlighting(cell, container) {
    const srcSelect = container.querySelector('#prop-src-anchor');
    const dstSelect = container.querySelector('#prop-dst-anchor');

    const highlight = (isSource) => {
        const endpoint = isSource ? cell.getSource() : cell.getTarget();
        if (endpoint && endpoint.cell) {
            const targetCell = state.graph.getCellById(endpoint.cell);
            if (targetCell && !targetCell.getData()?._isHighlighting) {
                targetCell.setData({ 
                    _oldStroke: targetCell.attr('body/stroke'), 
                    _oldWidth: targetCell.attr('body/strokeWidth'),
                    _isHighlighting: true 
                }, { silent: true });
                targetCell.attr('body/stroke', isSource ? '#10b981' : '#ef4444', { silent: true });
                targetCell.attr('body/strokeWidth', 6, { silent: true });
            }
        }
    };

    srcSelect?.addEventListener('mouseenter', () => highlight(true));
    srcSelect?.addEventListener('mouseleave', unhighlight);
    dstSelect?.addEventListener('mouseenter', () => highlight(false));
    dstSelect?.addEventListener('mouseleave', unhighlight);
}
