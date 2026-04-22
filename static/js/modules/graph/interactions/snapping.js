import { state } from '../../state.js';

/**
 * initSnapping - Sets up snapping and grouping interactions during movement
 */
export function initSnapping() {
    // 1. Rack Snapping Logic
    state.graph.on('node:moving', ({ node }) => {
        const parent = node.getParent();
        if (parent && parent.shape === 'drawnet-rack') {
            const rackBBox = parent.getBBox();
            const nodeSize = node.size();
            const pos = node.getPosition();
            
            const headerHeight = 30;
            const rackBodyHeight = rackBBox.height - headerHeight;
            const unitCount = parent.getData()?.slots || 42;
            const unitHeight = rackBodyHeight / unitCount;

            const centerX = rackBBox.x + (rackBBox.width - nodeSize.width) / 2;
            const relativeY = pos.y - rackBBox.y - headerHeight;
            const snapY = rackBBox.y + headerHeight + Math.round(relativeY / unitHeight) * unitHeight;

            node.setPosition(centerX, snapY, { silent: true });
        }
    });

    // 2. Parent-Child Relationship Update on Move End
    state.graph.on('node:moved', ({ node }) => {
        if (node.getData()?.is_group) return;

        let parent = node.getParent();
        
        if (!parent) {
            const pos = node.getPosition();
            const center = { x: pos.x + node.size().width / 2, y: pos.y + node.size().height / 2 };
            parent = state.graph.getNodes().find(n => {
                if (n.id === node.id || !n.getData()?.is_group) return false;
                const bbox = n.getBBox();
                return bbox.containsPoint(center);
            });
        }

        if (parent && node.getParent()?.id !== parent.id) {
            parent.addChild(node);
        }
    });
}
