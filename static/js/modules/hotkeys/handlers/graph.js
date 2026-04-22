import { state } from '../../state.js';
import { logger } from '../../utils/logger.js';
import { alignNodes, moveNodes, distributeNodes } from '../../graph/alignment.js';
import { handleMenuAction } from '../../ui/context_menu/handlers.js';

export const graphHandlers = {
    // ... cleanup ...
    deleteSelected: () => {
        if (!state.graph) return;
        const selected = state.graph.getSelectedCells();
        if (selected.length === 0) return;

        state.graph.removeCells(selected);
        import('../../persistence.js').then(m => m.markDirty());
    },
    fitScreen: () => {
        if (state.graph) {
            state.graph.zoomToFit({ padding: 50 });
            logger.high("Graph fit to screen (X6).");
        }
    },
    zoomIn: () => state.graph?.zoom(0.2),
    zoomOut: () => state.graph?.zoom(-0.2),
    connectNodes: () => handleMenuAction('connect-solid'),
    connectStraight: () => handleMenuAction('connect-straight'),
    disconnectNodes: () => handleMenuAction('disconnect'),
    undo: () => {
        if (!state.graph) return;
        try {
            if (typeof state.graph.undo === 'function') {
                state.graph.undo();
                logger.info("Undo performed via graph.undo()");
            } else {
                const history = state.graph.getPlugin('history');
                if (history) history.undo();
                logger.info("Undo performed via history plugin");
            }
        } catch (e) {
            logger.critical("Undo failed", e);
        }
    },
    redo: () => {
        if (!state.graph) return;
        try {
            if (typeof state.graph.redo === 'function') {
                state.graph.redo();
                logger.info("Redo performed via graph.redo()");
            } else {
                const history = state.graph.getPlugin('history');
                if (history) history.redo();
                logger.info("Redo performed via history plugin");
            }
        } catch (e) {
            logger.critical("Redo failed", e);
        }
    },
    arrangeLayout: () => {
        logger.high("Auto-layout is currently disabled (Refactoring).");
    },
    bringToFront: () => {
        if (!state.graph) return;
        const selected = state.graph.getSelectedCells();
        selected.forEach(cell => cell.toFront({ deep: true }));
        import('../../persistence.js').then(m => m.markDirty());
    },
    sendToBack: () => {
        if (!state.graph) return;
        const selected = state.graph.getSelectedCells();
        selected.forEach(cell => cell.toBack({ deep: true }));
        import('../../persistence.js').then(m => m.markDirty());
    },
    toggleLock: () => {
        if (!state.graph) return;
        const selected = state.graph.getSelectedCells();
        if (selected.length === 0) return;

        selected.forEach(cell => {
            const data = cell.getData() || {};
            const isLocked = !data.locked;
            cell.setData({ ...data, locked: isLocked });
            cell.setProp('movable', !isLocked);
            cell.setProp('deletable', !isLocked);
            cell.setProp('rotatable', !isLocked);
            
            if (isLocked) {
                cell.addTools([{ name: 'boundary', args: { attrs: { stroke: '#ef4444', 'stroke-dasharray': '5,5' } } }]);
            } else {
                cell.removeTools();
            }
        });
        import('../../persistence.js').then(m => m.markDirty());
        logger.high(`Toggled lock for ${selected.length} elements.`);
    },
    alignTop: () => alignNodes('top'),
    alignBottom: () => alignNodes('bottom'),
    alignLeft: () => alignNodes('left'),
    alignRight: () => alignNodes('right'),
    alignMiddle: () => alignNodes('middle'),
    alignCenter: () => alignNodes('center'),
    distributeHorizontal: () => distributeNodes('horizontal'),
    distributeVertical: () => distributeNodes('vertical'),
    groupNodes: () => handleMenuAction('group'),
    moveUp: () => moveNodes(0, -5),
    moveDown: () => moveNodes(0, 5),
    moveLeft: () => moveNodes(-5, 0),
    moveRight: () => moveNodes(5, 0),
    moveUpLarge: () => moveNodes(0, -(state.gridSpacing || 20)),
    moveDownLarge: () => moveNodes(0, (state.gridSpacing || 20)),
    moveLeftLarge: () => moveNodes(-(state.gridSpacing || 20), 0),
    moveRightLarge: () => moveNodes((state.gridSpacing || 20), 0)
};
