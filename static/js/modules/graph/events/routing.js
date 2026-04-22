import { state } from '../../state.js';
import { logger } from '../../utils/logger.js';

export function initRoutingEvents() {
    if (!state.graph) return;

    // Re-evaluate routing when nodes are moved to handle adaptive fallback (Phase 1.18)
    state.graph.on('node:change:position', ({ node }) => {
        const edges = state.graph.getConnectedEdges(node);
        if (edges.length === 0) return;

        import('/static/js/modules/graph/styles.js').then(({ getX6EdgeConfig }) => {
            edges.forEach(edge => {
                const data = edge.getData() || {};
                const config = getX6EdgeConfig({
                    source: edge.getSource().cell,
                    target: edge.getTarget().cell,
                    ...data
                });

                if (config.router !== edge.getRouter()) {
                     edge.setRouter(config.router || null);
                     logger.info(`drawNET: Dynamic Routing Update for ${edge.id}`);
                }
                if (config.connector !== edge.getConnector()) {
                     edge.setConnector(config.connector);
                }
                // Sync physical connections during move (especially for manual anchors)
                if (config.source) edge.setSource(config.source);
                if (config.target) edge.setTarget(config.target);
            });
        });
    });
    
    // Unify styling when an edge is newly connected via mouse (Phase 1.19)
    state.graph.on('edge:connected', ({ edge }) => {
        if (!edge || !edge.isEdge()) return;
        
        import('/static/js/modules/graph/styles.js').then(({ getX6EdgeConfig }) => {
            const data = edge.getData() || {};
            const config = getX6EdgeConfig({
                source: edge.getSource().cell,
                target: edge.getTarget().cell,
                ...data
            });
            
            // Apply official style & configuration
            if (config.source) edge.setSource(config.source);
            if (config.target) edge.setTarget(config.target);
            edge.setRouter(config.router || null);
            edge.setConnector(config.connector);
            edge.setZIndex(config.zIndex || 5);
            
            if (config.attrs) {
                edge.setAttrs(config.attrs);
            }
            logger.info(`drawNET: Unified Style applied to new edge ${edge.id}`);
        });
    });
}
