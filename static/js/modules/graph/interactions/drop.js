import { state } from '../../state.js';
import { logger } from '../../utils/logger.js';
import { t } from '../../i18n.js';
import { getX6NodeConfig } from '../styles.js';

/**
 * initDropHandling - Sets up drag and drop from the asset library to the graph
 */
export function initDropHandling(container) {
    container.addEventListener('dragover', (e) => e.preventDefault());
    
    container.addEventListener('drop', (e) => {
        e.preventDefault();
        const assetId = e.dataTransfer.getData('assetId');
        const asset = state.assetMap[assetId];
        const pos = state.graph.clientToLocal(e.clientX, e.clientY);
        
        logger.info(`Drop Event at {${pos.x}, ${pos.y}}`, {
            assetId: assetId,
            found: !!asset,
            id: asset?.id,
            path: asset?.path,
            type: asset?.type,
            rawAsset: asset
        });

        if (!asset) {
            logger.high(`Asset [${assetId}] not found in map`);
            return;
        }

        // Logical Layer Guard: Block dropping new nodes
        const activeLayer = state.layers.find(l => l.id === state.activeLayerId);
        if (activeLayer && activeLayer.type === 'logical') {
            import('../../ui/utils.js').then(m => m.showToast(t('err_logical_layer_drop'), 'warning'));
            return;
        }

        const isPrimitive = ['rect', 'rounded-rect', 'circle', 'text-box', 'label'].includes(asset.type);
        const prefix = asset.id === 'fixed-group' ? 'group_' : (asset.type === 'blank' || asset.type === 'dot' ? 'p_' : (isPrimitive ? 'shp_' : 'node_'));
        const id = prefix + Math.random().toString(36).substr(2, 4);
        
        // Use translate keys or asset label first, or fallback to generic name
        let initialLabel = asset.label || t(asset.id) || (asset.id === 'fixed-group' ? 'New Group' : 'New ' + (asset.type || 'Object'));
        if (asset.id === 'fixed-group') initialLabel = t('group') || 'New Group';
        
        // Find if dropped over a group (prefer the smallest/innermost one)
        const candidates = state.graph.getNodes().filter(n => {
            if (!n.getData()?.is_group) return false;
            const bbox = n.getBBox();
            return bbox.containsPoint(pos);
        });

        const parent = candidates.length > 0 
            ? candidates.reduce((smallest, current) => {
                const smallestBBox = smallest.getBBox();
                const currentBBox = current.getBBox();
                const currentArea = currentBBox.width * currentBBox.height;
                const smallestArea = smallestBBox.width * smallestBBox.height;
                
                if (currentArea < smallestArea) return current;
                if (currentArea > smallestArea) return smallest;
                
                // If areas are equal, pick the one that is a descendant of the other
                if (current.getAncestors().some(a => a.id === smallest.id)) return current;
                return smallest;
            })
            : undefined;
        

        // 2. Add to X6 immediately
        const config = getX6NodeConfig({
            id: id,
            label: initialLabel,
            type: asset.type || asset.category || asset.label || 'Unknown',
            assetId: assetId, // Store unique composite ID for lookup
            assetPath: asset.id === 'fixed-group' ? undefined : asset.path,
            is_group: asset.id === 'fixed-group' || asset.is_group === true,
            pos: { x: pos.x, y: pos.y },
            parent: parent ? parent.id : undefined,
            layerId: state.activeLayerId,
            description: "",
            asset_tag: "",
            tags: []
        });

        const newNode = state.graph.addNode(config);
        if (parent) {
            parent.addChild(newNode);
        }

        // Ensure the new node follows the active layer's interaction rules immediately
        import('../layers.js').then(m => m.applyLayerFilters());
    });
}
