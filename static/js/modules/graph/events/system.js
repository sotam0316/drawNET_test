import { state } from '../../state.js';
import { updateGraphTheme } from '../styles.js';
import { DEFAULTS } from '../../constants.js';

export function initSystemEvents() {
    if (!state.graph) return;

    // Theme changes
    window.addEventListener('themeChanged', () => {
        updateGraphTheme();
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
         state.graph.drawBackground({ color: isDark ? '#1e293b' : '#f8fafc' });
    });

    // Canvas resize event
    window.addEventListener('canvasResize', (e) => {
        const { width, height } = e.detail;
        state.canvasSize = { width, height };
        const container = document.getElementById('graph-container');
        
        if (width === '100%') {
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.boxShadow = 'none';
            container.style.margin = '0';
            state.graph.resize();
        } else {
            container.style.width = `${width}px`;
            container.style.height = `${height}px`;
            container.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
            container.style.margin = '40px auto';
            container.style.backgroundColor = '#fff';
            state.graph.resize(width, height);
        }
    });

    // Grid type change
    window.addEventListener('gridChanged', (e) => {
        state.gridStyle = e.detail.style;
        if (!state.graph) return;

        if (e.detail.style === 'none') {
            state.graph.hideGrid();
            state.isSnapEnabled = false;
        } else {
            state.graph.showGrid();
            state.isSnapEnabled = true;
            
            if (e.detail.showMajor) {
                state.graph.drawGrid({
                    type: 'doubleMesh',
                    args: [
                        { 
                            color: e.detail.majorColor || DEFAULTS.MAJOR_GRID_COLOR, 
                            thickness: (e.detail.thickness || 1) * 1.5,
                            factor: e.detail.majorInterval || DEFAULTS.MAJOR_GRID_INTERVAL
                        },
                        { 
                            color: e.detail.color || DEFAULTS.GRID_COLOR, 
                            thickness: e.detail.thickness || 1 
                        },
                    ],
                });
            } else {
                const gridType = e.detail.style === 'solid' ? 'mesh' : (e.detail.style === 'dashed' ? 'doubleMesh' : 'dot');
                state.graph.drawGrid({
                    type: gridType,
                    args: [
                        { 
                            color: e.detail.color || DEFAULTS.GRID_COLOR, 
                            thickness: e.detail.thickness || 1 
                        },
                    ],
                });
            }
            state.graph.setGridSize(state.gridSpacing || DEFAULTS.GRID_SPACING);
        }
    });

    // Grid spacing change
    window.addEventListener('gridSpacingChanged', (e) => {
        state.gridSpacing = e.detail.spacing;
        if (state.graph) {
            state.graph.setGridSize(state.gridSpacing);
        }
    });

    // Global Data Sanitizer & Enforcer (Ensures all objects have latest schema defaults)
    // This handles all creation paths: Drag-and-Drop, Copy-Paste, Grouping, and programatic addEdge.
    state.graph.on('cell:added', ({ cell }) => {
        const data = cell.getData() || {};
        let updated = false;

        // 1. Common Fields for all Node/Edge objects
        if (data.description === undefined) { data.description = ""; updated = true; }
        if (data.asset_tag === undefined) { data.asset_tag = ""; updated = true; }
        if (!data.tags) { data.tags = []; updated = true; }
        if (data.locked === undefined) { data.locked = false; updated = true; }

        // 2. Ensure label_pos exists to prevent display reset
        if (data.label_pos === undefined) {
            data.label_pos = data.is_group ? 'top' : (['rect', 'circle', 'rounded-rect', 'text-box', 'label'].includes((data.type || '').toLowerCase()) ? 'center' : 'bottom');
            updated = true;
        }

        // 3. Edge Specific Defaults
        if (cell.isEdge()) {
            if (data.routing_offset === undefined) { data.routing_offset = 20; updated = true; }
        }

        if (updated) {
            // Use silent: true to prevent triggering another 'cell:added' if someone is listening to data changes
            cell.setData(data, { silent: true });
        }

        // Keep existing layer logic
        import('../layers.js').then(m => m.applyLayerFilters());
    });
}

export function updateGridBackground() {
    if (!state.graph) return;
    state.graph.setGridSize(state.gridSpacing || DEFAULTS.GRID_SPACING);
    state.graph.showGrid();
}
