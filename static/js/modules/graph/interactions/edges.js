/**
 * graph/interactions/edges.js - Handles edge connection logic and metadata assignment.
 */
import { state } from '../../state.js';

/**
 * initEdgeHandling - Sets up edge connection events
 */
export function initEdgeHandling() {
    state.graph.on('edge:connected', ({ edge }) => {
        const sourceId = edge.getSourceCellId();
        const targetId = edge.getTargetCellId();
        if (!sourceId || !targetId) return;
        
        // Assign to current active layer and apply standard styling
        import('/static/js/modules/graph/styles.js').then(({ getX6EdgeConfig }) => {
            // [6개월 뒤의 나를 위한 메모]
            // 단순 유추가 아닌 명시적 기록을 통해, 도면 전체를 전송하지 않고도 연결선 단독으로 
            // 크로스 레이어 여부를 파악할수 있게 하여 외부 도구/AI 연동 안정성을 높임.
            const sourceNode = state.graph.getCellById(sourceId);
            const targetNode = state.graph.getCellById(targetId);
            const sourceLayer = sourceNode?.getData()?.layerId || state.activeLayerId;
            const targetLayer = targetNode?.getData()?.layerId || state.activeLayerId;
            const isCrossLayer = (sourceLayer !== targetLayer);

            const edgeData = { 
                source: sourceId, 
                target: targetId, 
                layerId: state.activeLayerId,
                source_layer: sourceLayer,
                target_layer: targetLayer,
                is_cross_layer: isCrossLayer,
                ...edge.getData() 
            };
            
            const config = getX6EdgeConfig(edgeData);
            
            // Apply standardized config to the new edge
            edge.setData(edgeData, { silent: true });
            if (config.router) edge.setRouter(config.router);
            else edge.setRouter(null);
            
            if (config.connector) edge.setConnector(config.connector);
            edge.setAttrs(config.attrs);
        });
    });
}
