import { state } from '../../state.js';

export function initSelectionEvents() {
    if (!state.graph) return;

    state.graph.on('cell:selected', ({ cell }) => {
        if (cell.isNode()) {
            if (!state.selectionOrder.includes(cell.id)) {
                state.selectionOrder.push(cell.id);
            }
        } else if (cell.isEdge()) {
            // Add vertices tool for manual routing control (unless locked)
            if (!cell.getData()?.locked) {
                cell.addTools([{ name: 'vertices' }]);
            }

            // ADD S/T labels for clear identification of Start and Target
            const currentLabels = cell.getLabels() || [];
            cell.setLabels([
                ...currentLabels,
                { id: 'selection-source-label', position: { distance: 0.05 }, attrs: { text: { text: 'S', fill: '#10b981', fontSize: 10, fontWeight: 'bold' }, rect: { fill: '#ffffff', stroke: '#10b981', strokeWidth: 1, rx: 2, ry: 2 } } },
                { id: 'selection-target-label', position: { distance: 0.95 }, attrs: { text: { text: 'T', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }, rect: { fill: '#ffffff', stroke: '#ef4444', strokeWidth: 1, rx: 2, ry: 2 } } }
            ]);
        }
    });

    state.graph.on('cell:unselected', ({ cell }) => {
        const isLocked = cell.getData()?.locked;

        if (cell.isEdge()) {
            if (!isLocked) {
                cell.removeTools();
            } else {
                // Keep boundary if locked, but remove selection-only tools if any
                cell.removeTools(['vertices']);
            }

            // Remove selection labels safely
            const labels = cell.getLabels() || [];
            const filteredLabels = labels.filter(l => 
                l.id !== 'selection-source-label' && l.id !== 'selection-target-label'
            );
            cell.setLabels(filteredLabels);
        } else if (cell.isNode()) {
            if (!isLocked) {
                cell.removeTools();
            }
        }
        state.selectionOrder = state.selectionOrder.filter(id => id !== cell.id);
    });

    state.graph.on('blank:click', () => {
        state.selectionOrder = [];
    });
}
