import { state } from '../../state.js';
import { toggleSidebar } from '../../properties_sidebar/index.js';

/**
 * handleMenuAction - Executes the logic for a clicked context menu item
 * Direct X6 API version (Replaces legacy DSL-based handler)
 */
export function handleMenuAction(action, cellId) {
    if (!state.graph) return;
    
    // Recursive Selection Focus
    if (action === 'select-cell' && cellId) {
        const target = state.graph.getCellById(cellId);
        if (target) {
            state.graph.cleanSelection();
            state.graph.select(target);
            toggleSidebar(true);
        }
        return;
    }

    const selectedCells = state.graph.getSelectedCells();
    const selectedNodes = selectedCells.filter(c => c.isNode());
    
    if (action === 'properties') {
        if (cellId) {
            const target = state.graph.getCellById(cellId);
            if (target) {
                state.graph.cleanSelection();
                state.graph.select(target);
            }
        }
        toggleSidebar(true);
        return;
    }

    // Alignment & Distribution Actions
    const isAlignmentAction = action.startsWith('align') || action.startsWith('distribute');
    const isZOrderAction = action === 'to-front' || action === 'to-back';

    if (isAlignmentAction || isZOrderAction) {
        if (action === 'to-front') { selectedCells.forEach(c => c.toFront({ deep: true })); return; }
        if (action === 'to-back') { selectedCells.forEach(c => c.toBack({ deep: true })); return; }

        import('/static/js/modules/graph/alignment.js').then(m => {
            const alignMap = {
                'alignLeft': 'left', 'align-left': 'left',
                'alignRight': 'right', 'align-right': 'right',
                'alignTop': 'top', 'align-top': 'top',
                'alignBottom': 'bottom', 'align-bottom': 'bottom',
                'alignCenter': 'center', 'align-center': 'center',
                'alignMiddle': 'middle', 'align-middle': 'middle'
            };
            const distMap = {
                'distributeHorizontal': 'horizontal', 'distribute-h': 'horizontal',
                'distributeVertical': 'vertical', 'distribute-v': 'vertical'
            };

            if (alignMap[action]) m.alignNodes(alignMap[action]);
            else if (distMap[action]) m.distributeNodes(distMap[action]);
        });
        return;
    }

    // --- Group Management (X6 API directly) ---
    if (action === 'group') {
        if (selectedNodes.length < 2) return;
        const groupLabel = 'group_' + Math.random().toString(36).substr(2, 4);
        
        // Calculate BBox of selected nodes
        const bbox = state.graph.getCellsBBox(selectedNodes);
        const padding = 40;

        const groupNode = state.graph.addNode({
            shape: 'drawnet-node',
            x: bbox.x - padding,
            y: bbox.y - padding,
            width: bbox.width + padding * 2,
            height: bbox.height + padding * 2,
            zIndex: 1,
            data: {
                label: groupLabel,
                is_group: true,
                background: '#e0f2fe',
                description: "",
                asset_tag: "",
                tags: []
            },
            attrs: {
                label: { text: groupLabel },
                body: { fill: '#e0f2fe', stroke: '#3b82f6' }
            }
        });

        // Set child nodes
        selectedNodes.forEach(n => groupNode.addChild(n));
        state.graph.cleanSelection();
        state.graph.select(groupNode);

        import('/static/js/modules/persistence.js').then(m => m.markDirty());
        return;
    }

    if (action === 'ungroup') {
        if (selectedNodes.length === 0) return;
        const group = selectedNodes[0];
        if (!group.getData()?.is_group) return;

        // Separate child nodes
        const children = group.getChildren() || [];
        children.forEach(child => group.removeChild(child));
        state.graph.removeNode(group);

        import('/static/js/modules/persistence.js').then(m => m.markDirty());
        return;
    }

    // --- Disconnect (X6 API directly) ---
    if (action === 'disconnect') {
        if (selectedNodes.length < 2) return;
        const nodeIds = new Set(selectedNodes.map(n => n.id));
        const edgesToRemove = state.graph.getEdges().filter(e => {
            return nodeIds.has(e.getSourceCellId()) && nodeIds.has(e.getTargetCellId());
        });
        edgesToRemove.forEach(e => state.graph.removeEdge(e));

        import('/static/js/modules/persistence.js').then(m => m.markDirty());
        return;
    }

    // --- Connect / Line Style Update actions ---
    const selectedEdges = selectedCells.filter(c => c.isEdge());
    
    const styleMap = {
        'connect-solid': { routing: 'manhattan' },
        'connect-straight': { routing: 'straight' },
        'connect-dashed': { style: 'dashed' }
    };

    if (selectedEdges.length > 0 && styleMap[action]) {
        const edgeData = styleMap[action];
        selectedEdges.forEach(async (edge) => {
            const currentData = edge.getData() || {};
            const newData = { ...currentData, ...edgeData };
            const { handleEdgeUpdate } = await import('../../properties_sidebar/handlers/edge.js');
            await handleEdgeUpdate(edge, newData);
        });
        return;
    }

    const connectableNodes = selectedCells.filter(c => c.isNode());
    if (connectableNodes.length < 2) return;

    // Sort by selection order if available
    const sortedNodes = [...connectableNodes].sort((a, b) => {
        const idxA = state.selectionOrder.indexOf(a.id);
        const idxB = state.selectionOrder.indexOf(b.id);
        if (idxA === -1 || idxB === -1) return 0;
        return idxA - idxB;
    });

    const edgeData = styleMap[action] || {};

    // Chain connection logic (1 -> 2, 2 -> 3, ...)
    for (let i = 0; i < sortedNodes.length - 1; i++) {
        const src = sortedNodes[i];
        const dst = sortedNodes[i+1];

        // Prevent duplicate connections (bi-directional check)
        const exists = state.graph.getEdges().some(e =>
            (e.getSourceCellId() === src.id && e.getTargetCellId() === dst.id) ||
            (e.getSourceCellId() === dst.id && e.getTargetCellId() === src.id)
        );
        if (exists) continue;

        import('/static/js/modules/graph/styles.js').then(({ getX6EdgeConfig }) => {
            const config = getX6EdgeConfig({
                id: `e_${src.id}_${dst.id}_${Date.now()}`,
                source: src.id,
                target: dst.id,
                description: "",
                asset_tag: "",
                routing_offset: 20,
                ...edgeData
            });
            state.graph.addEdge(config);
        });
    }

    import('/static/js/modules/persistence.js').then(m => m.markDirty());
}
