import { state } from '../state.js';
import { applyLayerFilters } from '../graph/layers.js';
import { makeDraggable, showConfirmModal, showToast } from './utils.js';
import { markDirty } from '../persistence.js';
import { t } from '../i18n.js';

/**
 * Updates the floating active layer indicator in the top-right corner
 */
export function updateActiveLayerIndicator() {
    const activeLayer = state.layers.find(l => l.id === state.activeLayerId);
    const indicator = document.getElementById('current-layer-name');
    const badge = document.getElementById('active-layer-indicator');
    
    if (activeLayer && indicator && badge) {
        indicator.innerText = activeLayer.name.toUpperCase();
        indicator.style.color = activeLayer.color || '#3b82f6';
        
        // Add a small pop animation
        badge.classList.remove('badge-pop');
        void badge.offsetWidth; // trigger reflow
        badge.classList.add('badge-pop');
    }
}

/**
 * initLayerPanel - Initializes the Layer Management Panel
 */
export function initLayerPanel() {
    const container = document.getElementById('layer-panel');
    if (!container) return;

    renderLayerPanel(container);
    updateActiveLayerIndicator(); // Sync on load
    
    // Refresh UI on project load/recovery
    if (state.graph) {
        state.graph.on('project:restored', () => {
            renderLayerPanel(container);
            applyLayerFilters();
            updateActiveLayerIndicator();
        });
    }
}

/**
 * toggleLayerPanel - Shows/Hides the layer panel
 */
export function toggleLayerPanel() {
    const container = document.getElementById('layer-panel');
    if (!container) return;
    
    if (container.style.display === 'none' || container.style.display === '') {
        container.style.display = 'flex';
        renderLayerPanel(container); // Refresh state
    } else {
        container.style.display = 'none';
    }
}

/**
 * renderLayerPanel - Renders the internal content of the Layer Panel
 */
export function renderLayerPanel(container) {
    container.innerHTML = `
        <div class="panel-header">
            <i class="fas fa-layer-group"></i> <span>Layers</span>
            <button id="add-layer-btn" title="Add Layer"><i class="fas fa-plus"></i></button>
        </div>
        <div id="layer-list" class="layer-list">
            ${state.layers.map(layer => `
                <div class="layer-item ${state.activeLayerId === layer.id ? 'active' : ''}" data-id="${layer.id}" draggable="true">
                    <i class="fas fa-grip-vertical drag-handle"></i>
                    <div class="layer-type-toggle" data-id="${layer.id}" title="${layer.type === 'logical' ? 'Logical (Edge Only)' : 'Standard (All)'}">
                        <i class="fas ${layer.type === 'logical' ? 'fa-project-diagram' : 'fa-desktop'}" style="color: ${layer.type === 'logical' ? '#10b981' : '#64748b'}; font-size: 11px;"></i>
                    </div>
                    <div class="layer-color" style="background: ${layer.color}"></div>
                    <span class="layer-name" data-id="${layer.id}">${layer.name}</span>
                    <div class="layer-actions">
                        <button class="toggle-lock" data-id="${layer.id}" title="${layer.locked ? 'Unlock Layer' : 'Lock Layer'}">
                            <i class="fas ${layer.locked ? 'fa-lock' : 'fa-lock-open'}" style="color: ${layer.locked ? '#ef4444' : '#64748b'}; font-size: 11px;"></i>
                        </button>
                        <button class="rename-layer" data-id="${layer.id}" title="Rename Layer" ${layer.locked ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''}>
                            <i class="fas fa-pen" style="font-size: 10px;"></i>
                        </button>
                        <button class="toggle-vis" data-id="${layer.id}">
                            <i class="fas ${layer.visible ? 'fa-eye' : 'fa-eye-slash'}"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="layer-footer">
            <div class="opacity-control">
                <i class="fas fa-ghost" title="Inactive Layer Opacity"></i>
                <input type="range" id="layer-opacity-slider" min="0" max="1" step="0.1" value="${state.inactiveLayerOpacity}">
                <span id="opacity-val">${Math.round(state.inactiveLayerOpacity * 100)}%</span>
            </div>
            <div id="layer-trash" class="layer-trash" title="Drag layer here to delete">
                <i class="fas fa-trash-alt"></i>
                <span>Discard Layer</span>
            </div>
        </div>
    `;

    // Drag and Drop reordering logic
    const layerList = container.querySelector('#layer-list');
    if (layerList) {
        layerList.addEventListener('dragstart', (e) => {
            const item = e.target.closest('.layer-item');
            if (item) {
                e.dataTransfer.setData('text/plain', item.dataset.id);
                item.classList.add('dragging');
            }
        });

        layerList.addEventListener('dragend', (e) => {
            const item = e.target.closest('.layer-item');
            if (item) item.classList.remove('dragging');
        });

        layerList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingItem = layerList.querySelector('.dragging');
            const targetItem = e.target.closest('.layer-item');
            if (targetItem && targetItem !== draggingItem) {
                const rect = targetItem.getBoundingClientRect();
                const next = (e.clientY - rect.top) > (rect.height / 2);
                layerList.insertBefore(draggingItem, next ? targetItem.nextSibling : targetItem);
            }
        });

        layerList.addEventListener('drop', (e) => {
            e.preventDefault();
            const newOrderIds = Array.from(layerList.querySelectorAll('.layer-item')).map(el => el.dataset.id);
            const newLayers = newOrderIds.map(id => state.layers.find(l => l.id === id));
            state.layers = newLayers;
            
            markDirty();
            applyLayerFilters();
            renderLayerPanel(container);
        });
    }

    // Trash Drop Handling
    const trash = container.querySelector('#layer-trash');
    if (trash) {
        trash.ondragover = (e) => {
            e.preventDefault();
            trash.classList.add('drag-over');
        };
        trash.ondragleave = () => trash.classList.remove('drag-over');
        trash.ondrop = (e) => {
            e.preventDefault();
            trash.classList.remove('drag-over');
            const id = e.dataTransfer.getData('text/plain');
            if (id) deleteLayer(id);
        };
    }

    // Events
    const slider = document.getElementById('layer-opacity-slider');
    const opacityVal = document.getElementById('opacity-val');
    if (slider) {
        slider.oninput = (e) => {
            const val = parseFloat(e.target.value);
            state.inactiveLayerOpacity = val;
            if (opacityVal) opacityVal.innerText = `${Math.round(val * 100)}%`;
            applyLayerFilters();
        };
    }

    const startRename = (id, nameSpan) => {
        const layer = state.layers.find(l => l.id === id);
        if (!layer) return;
        if (layer.locked) {
            showToast(t('err_layer_locked'), 'warning');
            return;
        }

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'layer-rename-input';
        input.value = layer.name;
        
        nameSpan.replaceWith(input);
        input.focus();
        input.select();

        const finishRename = () => {
            const newName = input.value.trim();
            if (newName && newName !== layer.name) {
                layer.name = newName;
                markDirty();
                updateActiveLayerIndicator();
            }
            renderLayerPanel(container);
        };

        input.onblur = finishRename;
        input.onkeydown = (e) => {
            if (e.key === 'Enter') finishRename();
            if (e.key === 'Escape') renderLayerPanel(container);
        };
    };

    container.querySelectorAll('.layer-name').forEach(nameSpan => {
        nameSpan.ondblclick = (e) => {
            e.stopPropagation();
            startRename(nameSpan.dataset.id, nameSpan);
        };
    });

    container.querySelectorAll('.rename-layer').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const nameSpan = container.querySelector(`.layer-name[data-id="${id}"]`);
            if (nameSpan) startRename(id, nameSpan);
        };
    });

    container.querySelectorAll('.layer-item').forEach(item => {
        item.onclick = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.closest('.layer-actions')) return; 
            const id = item.dataset.id;
            const layer = state.layers.find(l => l.id === id);
            
            state.activeLayerId = id;
            renderLayerPanel(container);
            updateActiveLayerIndicator();
            applyLayerFilters();
        };
    });

    container.querySelectorAll('.toggle-vis').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const layer = state.layers.find(l => l.id === id);
            if (layer) {
                layer.visible = !layer.visible;
                renderLayerPanel(container);
                applyLayerFilters();
            }
        };
    });

    container.querySelectorAll('.toggle-lock').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const layer = state.layers.find(l => l.id === id);
            if (layer) {
                layer.locked = !layer.locked;
                markDirty();
                renderLayerPanel(container);
            }
        };
    });

    container.querySelectorAll('.layer-type-toggle').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const layer = state.layers.find(l => l.id === id);
            if (layer) {
                // Clear nudge if active
                btn.classList.remove('pulse-nudge');
                const tooltip = btn.querySelector('.nudge-tooltip');
                if (tooltip) tooltip.remove();

                layer.type = (layer.type === 'logical') ? 'standard' : 'logical';
                markDirty();
                renderLayerPanel(container);
                updateActiveLayerIndicator();
            }
        };
    });

    const addBtn = document.getElementById('add-layer-btn');

    if (addBtn) {
        addBtn.onclick = () => {
            const nextIndex = state.layers.length + 1;
            const newId = `l${Date.now()}`;
            state.layers.push({
                id: newId,
                name: `Layer ${nextIndex}`,
                visible: true,
                locked: false,
                type: 'standard', // Explicitly standard
                color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`
            });
            state.activeLayerId = newId;
            renderLayerPanel(container);
            updateActiveLayerIndicator();
            applyLayerFilters();

            // Apply Nudge & Guide Toast
            setTimeout(() => {
                const newToggle = container.querySelector(`.layer-type-toggle[data-id="${newId}"]`);
                if (newToggle) {
                    newToggle.classList.add('pulse-nudge');
                    
                    // Add mini tooltip
                    const tooltip = document.createElement('div');
                    tooltip.className = 'nudge-tooltip';
                    tooltip.innerText = t('nudge_logical_hint');
                    newToggle.appendChild(tooltip);

                    // Show breadcrumb toast
                    showToast(t('nudge_new_layer'), 'info', 4000);

                    // Auto-cleanup nudge
                    setTimeout(() => {
                        newToggle.classList.remove('pulse-nudge');
                        tooltip.style.animation = 'tooltipFadeOut 0.4s ease-in forwards';
                        setTimeout(() => tooltip.remove(), 400);
                    }, 5000);
                }
            }, 100);
        };
    }

    // Delete Logic
    function deleteLayer(id) {
        if (state.layers.length <= 1) {
            showToast(t('err_last_layer'), 'warning');
            return;
        }

        const layer = state.layers.find(l => l.id === id);
        if (!layer) return;

        if (layer.locked) {
            showToast(t('err_layer_locked'), 'warning');
            return;
        }

        const cellsOnLayer = state.graph ? state.graph.getCells().filter(cell => {
            const data = cell.getData() || {};
            return data.layerId === id;
        }) : [];

        const finalizeDeletion = () => {
            if (state.graph) {
                state.graph.removeCells(cellsOnLayer);
            }
            state.layers = state.layers.filter(l => l.id !== id);
            if (state.activeLayerId === id) {
                state.activeLayerId = state.layers[0].id;
            }
            markDirty();
            applyLayerFilters();
            renderLayerPanel(container);
            updateActiveLayerIndicator();
        };

        if (cellsOnLayer.length > 0) {
            // Phase 1: Object count warning
            showConfirmModal({
                title: t('warning') || 'Warning',
                message: t('layer_contains_objects').replace('{name}', layer.name).replace('{count}', cellsOnLayer.length),
                onConfirm: () => {
                    // Phase 2: IRREVERSIBLE final warning
                    setTimeout(() => {
                        showConfirmModal({
                            title: t('confirm_delete_layer_final')?.split(':')[0] || 'Final Confirmation',
                            message: t('confirm_delete_layer_final').replace('{name}', layer.name),
                            onConfirm: finalizeDeletion
                        });
                    }, 300); // Small delay for smooth transition
                }
            });
        } else {
            // Clean layer: Single confirm
            showConfirmModal({
                title: t('remove'),
                message: t('confirm_delete_layer').replace('{name}', layer.name),
                onConfirm: finalizeDeletion
            });
        }
    }

    // Keyboard selection handling (optional: could keep for activating layers, but currently not needed as click handles it)
    container.querySelectorAll('.layer-item').forEach(item => {
        item.setAttribute('tabindex', '0'); // Make focusable for accessibility
    });

    // Re-bind draggability after the structural render
    makeDraggable(container, '.panel-header');
}
