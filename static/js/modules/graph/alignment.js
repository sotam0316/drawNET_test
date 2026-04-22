import { state } from '../state.js';
import { logger } from '../utils/logger.js';

/**
 * Alignment and Distribution tools for drawNET (X6 version).
 */

/**
 * alignNodes - Aligns selected nodes based on the FIRST selected node
 * @param {'top'|'bottom'|'left'|'right'|'middle'|'center'} type 
 */
export function alignNodes(type) {
    if (!state.graph) return;
    const selected = state.graph.getSelectedCells().filter(c => c.isNode());
    if (selected.length < 2) return;

    // First selected object is the reference per user request
    const reference = selected[0];
    const refPos = reference.getPosition();
    const refSize = reference.getSize();

    selected.slice(1).forEach(node => {
        const pos = node.getPosition();
        const size = node.getSize();
        
        switch (type) {
            case 'top':
                node.setPosition(pos.x, refPos.y);
                break;
            case 'bottom':
                node.setPosition(pos.x, refPos.y + refSize.height - size.height);
                break;
            case 'left':
                node.setPosition(refPos.x, pos.y);
                break;
            case 'right':
                node.setPosition(refPos.x + refSize.width - size.width, pos.y);
                break;
            case 'middle':
                node.setPosition(pos.x, refPos.y + (refSize.height / 2) - (size.height / 2));
                break;
            case 'center':
                node.setPosition(refPos.x + (refSize.width / 2) - (size.width / 2), pos.y);
                break;
        }
    });

    notifyChanges();
    logger.info(`drawNET: Aligned ${selected.length} nodes (${type}).`);
}

/**
 * moveNodes - Moves selected nodes by dx, dy
 */
export function moveNodes(dx, dy) {
    if (!state.graph) return;
    const selected = state.graph.getSelectedCells().filter(c => c.isNode());
    if (selected.length === 0) return;

    selected.forEach(node => {
        const pos = node.getPosition();
        node.setPosition(pos.x + dx, pos.y + dy);
    });
    
    // Sync with persistence after move (with debounce)
    clearTimeout(state.moveSyncTimer);
    state.moveSyncTimer = setTimeout(() => {
        notifyChanges();
    }, 500);
}

export function distributeNodes(type) {
    if (!state.graph) return;
    const selected = state.graph.getSelectedCells().filter(c => c.isNode());
    if (selected.length < 3) return;

    const bboxes = selected.map(node => ({
        node,
        bbox: node.getBBox()
    }));

    if (type === 'horizontal') {
        // Sort nodes from left to right
        bboxes.sort((a, b) => a.bbox.x - b.bbox.x);
        
        const first = bboxes[0];
        const last = bboxes[bboxes.length - 1];
        
        // Calculate Total Span (Right edge of last - Left edge of first)
        const totalSpan = (last.bbox.x + last.bbox.width) - first.bbox.x;
        
        // Calculate Sum of Node Widths
        const sumWidths = bboxes.reduce((sum, b) => sum + b.bbox.width, 0);
        
        // Total Gap Space
        const totalGapSpace = totalSpan - sumWidths;
        if (totalGapSpace < 0) return; // Overlapping too much? Skip for now

        const gapSize = totalGapSpace / (bboxes.length - 1);

        let currentX = first.bbox.x;
        bboxes.forEach((b, i) => {
            if (i > 0) {
                currentX += bboxes[i-1].bbox.width + gapSize;
                b.node.setPosition(currentX, b.bbox.y);
            }
        });
    } else if (type === 'vertical') {
        // Sort nodes from top to bottom
        bboxes.sort((a, b) => a.bbox.y - b.bbox.y);
        
        const first = bboxes[0];
        const last = bboxes[bboxes.length - 1];
        
        const totalSpan = (last.bbox.y + last.bbox.height) - first.bbox.y;
        const sumHeights = bboxes.reduce((sum, b) => sum + b.bbox.height, 0);
        const totalGapSpace = totalSpan - sumHeights;
        if (totalGapSpace < 0) return;

        const gapSize = totalGapSpace / (bboxes.length - 1);

        let currentY = first.bbox.y;
        bboxes.forEach((b, i) => {
            if (i > 0) {
                currentY += bboxes[i-1].bbox.height + gapSize;
                b.node.setPosition(b.bbox.x, currentY);
            }
        });
    }

    notifyChanges();
}

/**
 * notifyChanges - Marks dirty for persistence
 */
function notifyChanges() {
    import('/static/js/modules/persistence.js').then(m => m.markDirty());
}
