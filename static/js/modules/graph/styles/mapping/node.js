import { state } from '../../../state.js';
import { shapeRegistry } from '../registry.js';
import { getLabelAttributes, generateRackUnitsPath } from '../utils.js';
import { DEFAULTS } from '../../../constants.js';
import { calculateCellZIndex } from '../../layers.js';

/**
 * getX6NodeConfig - Maps data properties to X6 node attributes using ShapeRegistry
 */
export function getX6NodeConfig(data) {
    const nodeType = (data.type || '').toLowerCase();
    
    // 1. Find the plugin in the registry
    let plugin = shapeRegistry.get(nodeType);
    
    // Fallback for generic types if not found by direct name
    if (!plugin) {
        if (nodeType === 'rectangle') plugin = shapeRegistry.get('rect');
        else if (nodeType === 'blank') plugin = shapeRegistry.get('dummy');
    }

    // Default to 'default' plugin if still not found
    if (!plugin) plugin = shapeRegistry.get('default');

    // 2. Resolve asset path (Skip for groups and primitives!)
    const primitives = ['rect', 'circle', 'ellipse', 'rounded-rect', 'text-box', 'label', 'dot', 'dummy', 'rack', 'triangle', 'diamond', 'parallelogram', 'cylinder', 'document', 'manual-input', 'table', 'user', 'admin', 'hourglass', 'polyline'];
    let assetPath = `/static/assets/${DEFAULTS.DEFAULT_ICON}`;
    
    if (data.is_group || primitives.includes(nodeType)) {
        assetPath = undefined;
    } else if (plugin.shape === 'drawnet-node' || plugin.type === 'default' || !plugin.icon) {
        const currentPath = data.assetPath || data.asset_path;
        if (currentPath) {
            assetPath = currentPath.startsWith('/static/assets/') ? currentPath : `/static/assets/${currentPath}`;
        } else {
            const matchedAsset = state.assetsData?.find(a => {
                const searchType = (a.type || '').toLowerCase();
                const searchId = (a.id || '').toLowerCase();
                return nodeType === searchType || nodeType === searchId ||
                    nodeType.includes(searchType) || nodeType.includes(searchId);
            });
            
            if (matchedAsset) {
                const iconFileName = matchedAsset.path || (matchedAsset.views && matchedAsset.views.icon) || DEFAULTS.DEFAULT_ICON;
                assetPath = `/static/assets/${iconFileName}`;
                data.assetPath = iconFileName;
            }
        }
    }

    // 3. Build Base Configuration
    let config = {
        id: data.id,
        shape: plugin.shape,
        position: data.pos ? { x: data.pos.x, y: data.pos.y } : { x: 100, y: 100 },
        zIndex: data.zIndex || calculateCellZIndex(data, 0, true),
        movable: !data.locked,
        deletable: !data.locked,
        data: data,
        attrs: {
            label: {
                text: data.label || '',
                fill: data.color || data['text-color'] || '#64748b',
                ...getLabelAttributes(data.label_pos || data['label-pos'], nodeType, data.is_group)
            }
        }
    };

    // 4. Plugin Specific Overrides
    if (data.is_group) {
        config.attrs.body = { 
            fill: data.background || '#f1f5f9', 
            stroke: data['border-color'] || '#3b82f6' 
        };
    } else if (plugin.shape === 'drawnet-icon' && plugin.icon) {
        config.attrs.icon = { 
            text: plugin.icon, 
            fill: data.color || '#64748b' 
        };
    } else if (plugin.shape === 'drawnet-node') {
        config.attrs.image = { 'xlink:href': assetPath };
    }

    // 5. Primitive Styling Persistence
    if (primitives.includes(nodeType)) {
        if (!config.attrs.body) config.attrs.body = {};
        if (data.fill) config.attrs.body.fill = data.fill;
        if (data.border) config.attrs.body.stroke = data.border;
    }

    // Rack specific handling
    if (nodeType === 'rack') {
        const slots = data.slots || 42;
        const height = data.height || 600;
        config.data.is_group = true;
        config.attrs = {
            ...config.attrs,
            units: { d: generateRackUnitsPath(height, slots) },
            label: { text: data.label || `Rack (${slots}U)` }
        };
    }

    // Rich Card specific handling
    if (nodeType === 'rich-card' || plugin.shape === 'drawnet-rich-card') {
        config.data.headerText = data.headerText || data.label || 'RICH INFO CARD';
        config.data.content = data.content || '1. Content goes here...\n2. Support multiple lines';
        config.data.cardType = data.cardType || 'numbered';
        config.data.headerColor = data.headerColor || '#3b82f6';
        config.data.headerAlign = data.headerAlign || 'left';
        config.data.contentAlign = data.contentAlign || 'left';

        const hAnchor = config.data.headerAlign === 'center' ? 'middle' : (config.data.headerAlign === 'right' ? 'end' : 'start');
        const hX = config.data.headerAlign === 'center' ? 0.5 : (config.data.headerAlign === 'right' ? '100%' : 10);
        const hX2 = config.data.headerAlign === 'right' ? -10 : 0;

        config.attrs = {
            ...config.attrs,
            headerLabel: { 
                text: config.data.headerText,
                textAnchor: hAnchor,
                refX: hX,
                refX2: hX2
            },
            header: { fill: config.data.headerColor },
            body: { stroke: config.data.headerColor }
        };
        
        // Initial render trigger (Hack: X6 might not be ready, so we defer)
        setTimeout(() => {
            const cell = state.graph.getCellById(config.id);
            if (cell) {
                import('../utils.js').then(m => m.renderRichContent(cell));
            }
        }, 50);
    }

    return config;
}
