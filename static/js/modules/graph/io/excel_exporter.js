import { state } from '../../state.js';
import { logger } from '../../utils/logger.js';
import { t } from '../../i18n.js';

/**
 * excel_exporter.js - Exports topology data to a structured CSV format compatible with Excel.
 * Includes all metadata (Parent Group, Tags, Description) for both Nodes and Edges.
 */

export function exportToExcel() {
    if (!state.graph) return;

    const nodes = state.graph.getNodes();
    const edges = state.graph.getEdges();

    if (nodes.length === 0 && edges.length === 0) {
        alert(t('pptx_no_data') || 'No data to export.');
        return;
    }

    // Header Definition (Unified for mapping ease)
    const headers = [
        "Category", 
        "ID", 
        "Label/Name", 
        "Type", 
        "Parent Group", 
        "Source (ID/Label)", 
        "Target (ID/Label)", 
        "Tags", 
        "Description",
        "IP Address",
        "Vendor",
        "Model",
        "Asset Tag"
    ];

    const csvRows = [];

    // Add Nodes
    nodes.forEach(node => {
        const d = node.getData() || {};
        const label = node.attr('label/text') || d.label || '';
        
        // Find Parent Group Name
        let parentName = '';
        const parent = node.getParent();
        if (parent && parent.isNode()) {
            parentName = parent.attr('label/text') || parent.getData()?.label || parent.id;
        }

        csvRows.push([
            "Node",
            node.id,
            label,
            d.type || '',
            parentName,
            "", // Source
            "", // Target
            (d.tags || []).join('; '),
            d.description || '',
            d.ip || '',
            d.vendor || '',
            d.model || '',
            d.asset_tag || ''
        ]);
    });

    // Add Edges
    edges.forEach(edge => {
        const d = edge.getData() || {};
        const label = (edge.getLabels()[0]?.attrs?.label?.text) || d.label || '';
        
        const sourceCell = edge.getSourceCell();
        const targetCell = edge.getTargetCell();
        
        const sourceStr = sourceCell ? (sourceCell.attr('label/text') || sourceCell.id) : (edge.getSource().id || 'Unknown');
        const targetStr = targetCell ? (targetCell.attr('label/text') || targetCell.id) : (edge.getTarget().id || 'Unknown');

        csvRows.push([
            "Edge",
            edge.id,
            label,
            d.type || 'Connection',
            "", // Parent Group (Edges usually not grouped in same way)
            sourceStr,
            targetStr,
            (d.tags || []).join('; '),
            d.description || '',
            "", // IP
            "", // Vendor
            "", // Model
            d.asset_tag || ''
        ]);
    });

    import('../../ui/toast.js').then(m => m.showToast(t('msg_export_start').replace('{format}', 'Excel'), 'info', 2000));

    // Generate CSV Content with UTF-8 BOM
    const csvContent = "\uFEFF" + // UTF-8 BOM for Excel (Required for Korean/Special chars)
        headers.join(',') + "\n" + 
        csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    // Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const projectName = document.getElementById('project-title')?.innerText || "Project";
    
    link.setAttribute("href", url);
    link.setAttribute("download", `drawNET_Inventory_${projectName}_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    import('../../ui/toast.js').then(m => m.showToast(t('msg_export_success').replace('{format}', 'Excel'), 'success'));
    logger.high(`Inventory exported for ${nodes.length} nodes and ${edges.length} edges.`);
}
