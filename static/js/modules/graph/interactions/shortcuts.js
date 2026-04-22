import { state } from '../../state.js';
import { logger } from '../../utils/logger.js';

/**
 * initSpecialShortcuts - Sets up specialized mouse/keyboard combined gestures
 */
export function initSpecialShortcuts() {
    if (!state.graph) return;

    let dragStartData = null;

    // Ctrl + Drag to Copy: Improved Ghost Logic
    state.graph.on('node:mousedown', ({ e, node }) => {
        // Support both Ctrl (Windows) and Cmd (Mac)
        const isModifier = e.ctrlKey || e.metaKey;
        if (isModifier && e.button === 0) {
            const selected = state.graph.getSelectedCells();
            const targets = selected.includes(node) ? selected : [node];
            
            // 1. Initial State for tracking
            const mouseStart = state.graph.clientToLocal(e.clientX, e.clientY);
            dragStartData = {
                targets: targets,
                mouseStart: mouseStart,
                initialNodesPos: targets.map(t => ({ ...t.position() })),
                ghost: null
            };

            const onMouseMove = (moveEvt) => {
                if (!dragStartData) return;
                
                const mouseNow = state.graph.clientToLocal(moveEvt.clientX, moveEvt.clientY);
                const dx = mouseNow.x - dragStartData.mouseStart.x;
                const dy = mouseNow.y - dragStartData.mouseStart.y;

                // Create Ghost on movement
                if (!dragStartData.ghost && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
                    const cellsBBox = state.graph.getCellsBBox(dragStartData.targets);
                    dragStartData.ghost = state.graph.addNode({
                        shape: 'rect',
                        x: cellsBBox.x,
                        y: cellsBBox.y,
                        width: cellsBBox.width,
                        height: cellsBBox.height,
                        attrs: {
                            body: {
                                fill: 'rgba(59, 130, 246, 0.1)',
                                stroke: '#3b82f6',
                                strokeWidth: 2,
                                strokeDasharray: '5,5',
                                pointerEvents: 'none'
                            }
                        },
                        zIndex: 1000
                    });
                    dragStartData.initialGhostPos = { x: cellsBBox.x, y: cellsBBox.y };
                }

                if (dragStartData.ghost) {
                    dragStartData.ghost.position(
                        dragStartData.initialGhostPos.x + dx,
                        dragStartData.initialGhostPos.y + dy
                    );
                }
            };

            const onMouseUp = (upEvt) => {
                cleanup(upEvt.button === 0);
            };

            const onKeyDown = (keyEvt) => {
                if (keyEvt.key === 'Escape') {
                    cleanup(false); // Cancel on ESC
                }
            };

            function cleanup(doPaste) {
                if (dragStartData) {
                    if (doPaste && dragStartData.ghost) {
                        const finalPos = dragStartData.ghost.position();
                        const dx = finalPos.x - dragStartData.initialGhostPos.x;
                        const dy = finalPos.y - dragStartData.initialGhostPos.y;

                        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                            state.graph.copy(dragStartData.targets, { deep: true });
                            let clones = state.graph.paste({ offset: { dx, dy }, select: true });
                            
                            // Logical Layer Guard: Filter out nodes if target layer is logical
                            const activeLayer = state.layers.find(l => l.id === state.activeLayerId);
                            if (activeLayer && activeLayer.type === 'logical') {
                                clones.forEach(clone => {
                                    if (clone.isNode()) clone.remove();
                                });
                                clones = clones.filter(c => !c.isNode());
                                if (clones.length === 0) {
                                    import('/static/js/modules/ui/utils.js').then(m => m.showToast(t('err_logical_layer_drop'), 'warning'));
                                }
                            }

                            clones.forEach(clone => {
                                if (clone.isNode()) {
                                    const d = clone.getData() || {};
                                    clone.setData({ ...d, id: clone.id }, { silent: true });
                                }
                            });
                            import('/static/js/modules/persistence.js').then(m => m.markDirty());
                        }
                    }

                    if (dragStartData.ghost) dragStartData.ghost.remove();
                }
                dragStartData = null;
                window.removeEventListener('mousemove', onMouseMove, true);
                window.removeEventListener('mouseup', onMouseUp, true);
                window.removeEventListener('keydown', onKeyDown, true);
            }

            window.addEventListener('mousemove', onMouseMove, true);
            window.addEventListener('mouseup', onMouseUp, true);
            window.addEventListener('keydown', onKeyDown, true);
        }
    });

    logger.info("initSpecialShortcuts (Ctrl+Drag with ESC Failsafe) initialized.");
}
