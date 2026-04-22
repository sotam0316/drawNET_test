import { state } from '../../state.js';
import { logger } from '../../utils/logger.js';

/**
 * handleEdgeUpdate - Synchronizes property sidebar changes to the X6 Edge cell.
 * Ensures data, attributes (markers, colors), anchors, and routers are all updated.
 */
export async function handleEdgeUpdate(cell, data) {
    if (cell.isNode()) return;

    const updates = {
        id: cell.id,
        source: cell.getSource().cell,
        target: cell.getTarget().cell,
        source_port: cell.getSource().port, 
        target_port: cell.getTarget().port,
        
        // Priority: DOM Element > Provided Data (Format Painter) > Default/Old Data
        color: document.getElementById('prop-color')?.value || data?.color,
        style: document.getElementById('prop-style')?.value || data?.style,
        routing: document.getElementById('prop-routing')?.value || data?.routing,
        source_anchor: document.getElementById('prop-src-anchor')?.value || data?.source_anchor || 'orth',
        target_anchor: document.getElementById('prop-dst-anchor')?.value || data?.target_anchor || 'orth',
        direction: document.getElementById('prop-direction')?.value || data?.direction || 'none',
        is_tunnel: document.getElementById('prop-is-tunnel') ? !!document.getElementById('prop-is-tunnel').checked : !!data?.is_tunnel,
        width: document.getElementById('prop-width') ? parseFloat(document.getElementById('prop-width').value) : (parseFloat(data?.width) || 2),
        routing_offset: document.getElementById('prop-routing-offset') ? parseInt(document.getElementById('prop-routing-offset').value) : (parseInt(data?.routing_offset) || 20),
        description: document.getElementById('prop-description') ? document.getElementById('prop-description').value : data?.description,
        tags: document.getElementById('prop-tags') ? document.getElementById('prop-tags').value.split(',').map(t => t.trim()).filter(t => t) : (data?.tags || []),
        label: document.getElementById('prop-label') ? document.getElementById('prop-label').value : data?.label,
        locked: document.getElementById('prop-locked') ? !!document.getElementById('prop-locked').checked : !!data?.locked
    };

    // 1. Update Cell Data (Single Source of Truth)
    const currentData = cell.getData() || {};
    cell.setData({ ...currentData, ...updates });
    
    // 2. Sync Visual Attributes (Arrows, Colors, Styles)
    // We reuse the central mapping logic from styles.js for consistency
    const { getX6EdgeConfig } = await import('/static/js/modules/graph/styles.js');
    const edgeConfig = getX6EdgeConfig(updates);
    
    // Apply Attributes (Markers, Stroke, Dasharray)
    // Note: setAttrs merges by default, but we use it to apply the calculated style object
    if (edgeConfig.attrs) {
        cell.setAttrs(edgeConfig.attrs);
    }
    
    // Apply Labels
    if (edgeConfig.labels) {
        cell.setLabels(edgeConfig.labels);
    }

    // 3. Anchor & Router Updates (Physical Pathing)
    if (edgeConfig.source) cell.setSource(edgeConfig.source);
    if (edgeConfig.target) cell.setTarget(edgeConfig.target);

    // Apply Router and Connector (Physical Pathing)
    // Clear everything first to prevent old state persistence
    cell.setVertices([]);
    cell.setRouter(null);
    cell.setConnector('normal');
    
    if (edgeConfig.router) {
        cell.setRouter(edgeConfig.router);
    }
    
    if (edgeConfig.connector) {
        cell.setConnector(edgeConfig.connector);
    }

    // 4. Mark Project as Dirty and Apply Locking/Selection Tools
    cell.setProp('movable', !updates.locked);
    cell.setProp('deletable', !updates.locked);

    // Selection Tool Preservation: If currently selected, ensure vertices are visible
    const isSelected = state.graph.isSelected(cell);
    if (updates.locked) {
        cell.addTools([{ name: 'boundary', args: { attrs: { stroke: '#ef4444', 'stroke-dasharray': '5,5' } } }]);
    } else {
        cell.removeTools();
        if (isSelected) {
            cell.addTools(['vertices']);
        }
    }

    import('/static/js/modules/persistence.js').then(m => m.markDirty());
}
