import { state } from '../../state.js';
import { logger } from '../../utils/logger.js';

const generateShortId = () => Math.random().toString(36).substring(2, 6);

export const clipboardHandlers = {
    copyAttributes: () => {
        if (!state.graph) return;
        const selected = state.graph.getSelectedCells();
        if (selected.length === 0) return;

        const cell = selected[0];
        const data = cell.getData() || {};

        if (cell.isNode()) {
            const whitelistedData = {};
            const dataKeys = ['vendor', 'model', 'status', 'project', 'env', 'tags', 'color', 'asset_path'];
            dataKeys.forEach(key => {
                if (data[key] !== undefined) whitelistedData[key] = data[key];
            });

            const whitelistedAttrs = {
                label: {
                    fill: cell.attr('label/fill'),
                    fontSize: cell.attr('label/fontSize'),
                },
                body: {
                    fill: cell.attr('body/fill'),
                    stroke: cell.attr('body/stroke'),
                    strokeWidth: cell.attr('body/strokeWidth'),
                }
            };

            state.clipboardNodeData = whitelistedData;
            state.clipboardNodeAttrs = whitelistedAttrs;
            state.clipboardEdgeData = null; // Clear edge clipboard
            logger.info(`Node attributes copied from ${cell.id}`);
        } else if (cell.isEdge()) {
            const edgeKeys = [
                'color', 'routing', 'style', 'source_anchor', 'target_anchor', 
                'direction', 'is_tunnel', 'routing_offset', 'width', 'flow'
            ];
            const edgeData = {};
            edgeKeys.forEach(key => {
                if (data[key] !== undefined) edgeData[key] = data[key];
            });

            state.clipboardEdgeData = edgeData;
            state.clipboardNodeData = null; // Clear node clipboard
            logger.info(`Edge attributes (Style) copied from ${cell.id}`);
        }
    },

    pasteAttributes: async () => {
        if (!state.graph) return;
        const selected = state.graph.getSelectedCells();
        if (selected.length === 0) return;

        const hasNodeData = !!state.clipboardNodeData;
        const hasEdgeData = !!state.clipboardEdgeData;

        if (!hasNodeData && !hasEdgeData) return;

        const { handleEdgeUpdate } = await import('../../properties_sidebar/handlers/edge.js');

        state.graph.batchUpdate(async () => {
            for (const cell of selected) {
                if (cell.isNode() && hasNodeData) {
                    const currentData = cell.getData() || {};
                    cell.setData({ ...currentData, ...state.clipboardNodeData });

                    if (state.clipboardNodeAttrs) {
                        const attrs = state.clipboardNodeAttrs;
                        if (attrs.label) {
                            if (attrs.label.fill) cell.attr('label/fill', attrs.label.fill);
                            if (attrs.label.fontSize) cell.attr('label/fontSize', attrs.label.fontSize);
                        }
                        if (attrs.body) {
                            if (attrs.body.fill) cell.attr('body/fill', attrs.body.fill);
                            if (attrs.body.stroke) cell.attr('body/stroke', attrs.body.stroke);
                            if (attrs.body.strokeWidth) cell.attr('body/strokeWidth', attrs.body.strokeWidth);
                        }
                    }
                } else if (cell.isEdge() && hasEdgeData) {
                    // Apply Edge Formatting
                    // We use handleEdgeUpdate to ensure physical routers/anchors are updated
                    await handleEdgeUpdate(cell, state.clipboardEdgeData);
                }
            }
        });

        logger.high(`Format Painter applied to ${selected.length} elements.`);
        import('../../persistence.js').then(m => m.markDirty());
    },

    copyNodes: () => {
        if (!state.graph) return;
        const selected = state.graph.getSelectedCells();
        if (selected.length === 0) return;
        
        state.graph.copy(selected);
        logger.high("Nodes copied to clipboard (X6).");
    },

    pasteNodes: () => {
        if (!state.graph || state.graph.isClipboardEmpty()) return;
        
        // Logical Layer Guard: Filter out nodes if target layer is logical
        const activeLayer = state.layers.find(l => l.id === state.activeLayerId);
        const isLogical = activeLayer && activeLayer.type === 'logical';

        let pasted = state.graph.paste({ offset: 20 });
        if (pasted && pasted.length > 0) {
            if (isLogical) {
                pasted.forEach(cell => { if (cell.isNode()) cell.remove(); });
                pasted = pasted.filter(c => !c.isNode());
                if (pasted.length === 0) {
                    import('/static/js/modules/i18n.js').then(({ t }) => {
                        import('../../ui/utils.js').then(m => m.showToast(t('err_logical_layer_drop'), 'warning'));
                    });
                }
            }

            state.graph.batchUpdate(() => {
                pasted.forEach(cell => {
                    if (cell.isNode()) {
                        const currentData = cell.getData() || {};
                        const currentLabel = currentData.label || cell.attr('label/text');
                        if (currentLabel) {
                            const newLabel = `${currentLabel}_${generateShortId()}`;
                            cell.setData({ ...currentData, label: newLabel, id: cell.id });
                            cell.attr('label/text', newLabel);
                        } else {
                            cell.setData({ ...currentData, id: cell.id });
                        }
                    }
                });
            });
            state.graph.cleanSelection();
            state.graph.select(pasted);
        }
        logger.high("Nodes pasted and randomized (Logical Filter applied).");
        import('../../persistence.js').then(m => m.markDirty());
    },

    duplicateNodes: () => {
        if (!state.graph) return;
        const selected = state.graph.getSelectedCells();
        if (selected.length === 0) return;
        
        state.graph.copy(selected);

        // Logical Layer Guard: Filter out nodes if target layer is logical
        const activeLayer = state.layers.find(l => l.id === state.activeLayerId);
        const isLogical = activeLayer && activeLayer.type === 'logical';

        let cloned = state.graph.paste({ offset: 30 });
        if (cloned && cloned.length > 0) {
            if (isLogical) {
                cloned.forEach(cell => { if (cell.isNode()) cell.remove(); });
                cloned = cloned.filter(c => !c.isNode());
                if (cloned.length === 0) {
                    import('/static/js/modules/i18n.js').then(({ t }) => {
                        import('../../ui/utils.js').then(m => m.showToast(t('err_logical_layer_drop'), 'warning'));
                    });
                }
            }

            state.graph.batchUpdate(() => {
                cloned.forEach(cell => {
                    if (cell.isNode()) {
                        const currentData = cell.getData() || {};
                        const currentLabel = currentData.label || cell.attr('label/text');
                        if (currentLabel) {
                            const newLabel = `${currentLabel}_${generateShortId()}`;
                            cell.setData({ ...currentData, label: newLabel, id: cell.id });
                            cell.attr('label/text', newLabel);
                        } else {
                            cell.setData({ ...currentData, id: cell.id });
                        }
                    }
                });
            });
            state.graph.cleanSelection();
            state.graph.select(cloned);
        }
        logger.high("Nodes duplicated and randomized (Logical Filter applied).");
        import('../../persistence.js').then(m => m.markDirty());
    }
};
