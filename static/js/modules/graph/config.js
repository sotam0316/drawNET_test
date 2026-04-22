import { DEFAULTS } from '../constants.js';
import { state } from '../state.js';
import { calculateCellZIndex } from './layers.js';

/**
 * graph/config.js - X6 Graph configuration options
 */
export const getGraphConfig = (container) => ({
    // ... (rest of the top part)
    container: container,
    autoResize: true,
    background: { color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e293b' : '#f8fafc' },
    grid: {
        visible: true,
        type: 'dot',
        size: DEFAULTS.GRID_SPACING,
        args: { color: DEFAULTS.GRID_COLOR, thickness: 1 },
    },
    panning: {
        enabled: true,
        modifiers: 'space',
    },
    history: {
        enabled: true,
    },
    mousewheel: {
        enabled: true,
        modifiers: ['ctrl', 'meta'],
        factor: state.appConfig?.mousewheel?.factor || 1.05,
        minScale: state.appConfig?.mousewheel?.minScale || 0.1,
        maxScale: state.appConfig?.mousewheel?.maxScale || 10,
    },
    connecting: {
        router: null,
        connector: { name: 'jumpover', args: { type: 'arc', size: 6 } },
        anchor: 'orth',
        connectionPoint: 'boundary',
        allowNode: false,
        allowBlank: false,
        snap: { radius: 20 },
        createEdge() {
            const edgeData = {
                layerId: state.activeLayerId || 'l1',
                routing_offset: 20,
                direction: 'none',
                description: "",
                asset_tag: ""
            };

            return new X6.Shape.Edge({
                attrs: {
                    line: {
                        stroke: '#94a3b8',
                        strokeWidth: 2,
                        targetMarker: null
                    },
                },
                zIndex: calculateCellZIndex(edgeData, 0, false),
                data: edgeData
            })
        },
        validateConnection({ sourceMagnet, targetMagnet }) {
            return !!sourceMagnet && !!targetMagnet;
        },
        highlight: true,
    },
    embedding: {
        enabled: true,
        findParent({ node }) {
            const bbox = node.getBBox();
            const candidates = this.getNodes().filter((n) => {
                const data = n.getData();
                if (data && data.is_group && n.id !== node.id) {
                    const targetBBox = n.getBBox();
                    return targetBBox.containsRect(bbox);
                }
                return false;
            });

            if (candidates.length === 0) return [];
            if (candidates.length === 1) return [candidates[0]];

            // Return the one with the smallest area (the innermost one)
            const bestParent = candidates.reduce((smallest, current) => {
                const smallestBBox = smallest.getBBox();
                const currentBBox = current.getBBox();
                const currentArea = currentBBox.width * currentBBox.height;
                const smallestArea = smallestBBox.width * smallestBBox.height;

                if (currentArea < smallestArea) return current;
                if (currentArea > smallestArea) return smallest;

                // If areas are equal, pick the one that is a descendant of the other
                if (current.getAncestors().some(a => a.id === smallest.id)) return current;
                return smallest;
            });

            return [bestParent];

        },
        validate({ child, parent }) {
            return parent.getData()?.is_group;
        },
    },
    interacting: {
        nodeMovable: (view) => {
            if (state.isCtrlPressed) return false; // Block default move during Ctrl+Drag
            return view.cell.getProp('movable') !== false;
        },
        edgeMovable: (view) => {
            if (state.isCtrlPressed) return false;
            return view.cell.getProp('movable') !== false;
        },
        edgeLabelMovable: (view) => view.cell.getProp('movable') !== false,
        arrowheadMovable: (view) => view.cell.getProp('movable') !== false,
        vertexMovable: (view) => view.cell.getProp('movable') !== false,
        vertexAddable: (view) => {
            if (view.cell.getProp('movable') === false) return false;
            // Only allow adding vertices if the edge is ALREADY selected.
            // This prevents accidental addition on the first click (which selects the edge).
            return view.graph.isSelected(view.cell);
        },
        vertexDeletable: (view) => view.cell.getProp('movable') !== false,
    },
});
