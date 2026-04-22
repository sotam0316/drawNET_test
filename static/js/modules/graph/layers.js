import { state } from '../state.js';

/**
 * calculateCellZIndex - Logic to determine the Z-Index of a cell based on its layer and type.
 * Hierarchy: Nodes(50) > Edges(30) > Groups(1).
 */
export function calculateCellZIndex(data, ancestorsCount, isNode) {
    const layerId = data.layerId || 'l1';
    const layerIndex = state.layers.findIndex(l => l.id === layerId);
    const layerOffset = layerIndex !== -1 ? (state.layers.length - layerIndex) * 100 : 0;
    
    let baseZ = 0;
    if (isNode) {
        if (data.is_group) {
            baseZ = 1 + ancestorsCount;
        } else {
            baseZ = 50 + ancestorsCount;
        }
    } else {
        baseZ = 30; // Edges: Always above groups
    }
    
    return layerOffset + baseZ;
}

/**
 * applyLayerFilters - Updates the visibility of all cells in the graph based on their layer.
 * Also enforces a strict Z-Index hierarchy: Nodes(50) > Edges(30) > Groups(1).
 * Auto-Repairs existing edges to the latest styling standards.
 */
export async function applyLayerFilters() {
    if (!state.graph) return;

    // Pre-import style mapping for efficiency
    const { getX6EdgeConfig, getLabelAttributes } = await import('./styles.js');

    const cells = state.graph.getCells();
    const visibleLayerIds = new Set(
        state.layers
            .filter(l => l.visible)
            .map(l => l.id)
    );

    state.graph.batchUpdate(() => {
        cells.forEach(cell => {
            const data = cell.getData() || {};
            const cellLayerId = data.layerId || 'l1';
            const isActive = (cellLayerId === state.activeLayerId);
            
            const ancestorsCount = cell.getAncestors().length;
            const zIndex = calculateCellZIndex(data, ancestorsCount, cell.isNode());
            cell.setZIndex(zIndex);

            const isVisible = visibleLayerIds.has(cellLayerId);
            if (isVisible) {
                cell.show();
                
                const opacity = isActive ? 1 : (state.inactiveLayerOpacity || 0.3);
                cell.attr('body/opacity', opacity);
                cell.attr('image/opacity', opacity);
                cell.attr('label/opacity', opacity);
                cell.attr('line/opacity', opacity);

                // Re-enable pointer events to allow "Ghost Snapping" (Connecting to other layers)
                // We rely on Selection Plugin Filter and interacting rules for isolation.
                cell.attr('root/style/pointer-events', 'auto');

                const isManuallyLocked = data.locked === true;
                const shouldBeInteractable = isActive && !isManuallyLocked;

                cell.setProp('movable', shouldBeInteractable);
                cell.setProp('deletable', shouldBeInteractable);
                if (cell.isNode()) cell.setProp('rotatable', shouldBeInteractable);
                
            } else {
                cell.hide();
            }
        });
    });
}
