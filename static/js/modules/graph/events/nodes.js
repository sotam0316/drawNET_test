import { state } from '../../state.js';
import { generateRackUnitsPath } from '../styles/utils.js';

export function initNodeEvents() {
    if (!state.graph) return;

    // Hover Guides for specific objects
    state.graph.on('node:mouseenter', ({ node }) => {
        if (node.shape === 'drawnet-dot') {
            node.attr('hit/stroke', 'rgba(59, 130, 246, 0.4)');
            node.attr('hit/strokeDasharray', '2,2');
        }
    });

    state.graph.on('node:mouseleave', ({ node }) => {
        if (node.shape === 'drawnet-dot') {
            node.attr('hit/stroke', 'transparent');
            node.attr('hit/strokeDasharray', '0');
        }
    });

    // Rack Drill Down Interaction
    state.graph.on('node:dblclick', ({ node }) => {
        const data = node.getData() || {};
        if (data.layerId !== state.activeLayerId) return; // Guard: Block drills into other layers

        if (node.shape === 'drawnet-rack') {
            state.graph.zoomToCell(node, { 
                padding: { top: 60, bottom: 60, left: 100, right: 100 },
                animation: { duration: 600 } 
            });

            state.graph.getCells().forEach(cell => {
                if (cell.id !== node.id && !node.getDescendants().some(d => d.id === cell.id)) {
                    cell.setAttrs({ body: { opacity: 0.1 }, image: { opacity: 0.1 }, label: { opacity: 0.1 }, line: { opacity: 0.1 } });
                } else {
                    cell.setAttrs({ body: { opacity: 1 }, image: { opacity: 1 }, label: { opacity: 1 }, line: { opacity: 1 } });
                }
            });

            showBackToTopBtn();
        }
    });

    // Parent/Structural Changes
    state.graph.on('node:change:parent', ({ node, current }) => {
        const parentId = current || null;
        const currentData = node.getData() || {};
        node.setData({ ...currentData, parent: parentId });

        import('../layers.js').then(m => m.applyLayerFilters());
        import('/static/js/modules/properties_sidebar/index.js').then(m => m.renderProperties());
        import('/static/js/modules/persistence.js').then(m => m.markDirty());
    });

    // Data Syncing (Rack-specific)
    state.graph.on('node:change:data', ({ node, current }) => {
        if (node.shape === 'drawnet-rack') {
            const slots = current.slots || 42;
            const bbox = node.getBBox();
            node.attr('units/d', generateRackUnitsPath(bbox.height, slots));

            if (!current.label || current.label.startsWith('Rack (')) {
                node.attr('label/text', `Rack (${slots}U)`);
            }
        }

        // Rich Card Content Refresh on Data Change
        if (node.shape === 'drawnet-rich-card') {
            import('../styles/utils.js').then(m => m.renderRichContent(node));
        }
    });
}

function showBackToTopBtn() {
    let btn = document.getElementById('rack-back-btn');
    if (btn) btn.remove();

    btn = document.createElement('div');
    btn.id = 'rack-back-btn';
    btn.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Topology';
    btn.style.cssText = `
        position: absolute; top: 100px; left: 300px; z-index: 1000;
        padding: 10px 20px; background: #3b82f6; color: white;
        border-radius: 8px; cursor: pointer; font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2); transition: all 0.2s;
    `;
    
    btn.onclick = () => {
        state.graph.zoomToFit({ padding: 100, animation: { duration: 500 } });
        state.graph.getCells().forEach(cell => {
            cell.setAttrs({ body: { opacity: 1 }, image: { opacity: 1 }, label: { opacity: 1 }, line: { opacity: 1 } });
        });
        btn.remove();
    };

    document.getElementById('graph-container').parentElement.appendChild(btn);
}
