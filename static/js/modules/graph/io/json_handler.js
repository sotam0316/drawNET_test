/**
 * graph/io/json_handler.js - Project serialization and restoration with auto-repair logic.
 */
import { state } from '../../state.js';
import { logger } from '../../utils/logger.js';

/**
 * getProjectData - 프로젝트 전체를 JSON으로 직렬화 (graph.toJSON 기반)
 */
export function getProjectData() {
    if (!state.graph) return null;
    
    const graphJson = state.graph.toJSON();
    const viewport = state.graph.translate();

    return {
        header: {
            app: "drawNET Premium",
            version: "3.0.0",
            export_time: new Date().toISOString()
        },
        graphJson: graphJson,
        viewport: {
            zoom: state.graph.zoom(),
            tx: viewport.tx,
            ty: viewport.ty
        },
        settings: {
            gridSpacing: state.gridSpacing,
            gridStyle: state.gridStyle,
            isSnapEnabled: state.isSnapEnabled,
            canvasSize: state.canvasSize,
            theme: document.documentElement.getAttribute('data-theme')
        },
        layers: state.layers,
        activeLayerId: state.activeLayerId
    };
}

/**
 * restoreProjectData - JSON 프로젝트 데이터로 그래프 복원
 */
export function restoreProjectData(data) {
    if (!state.graph || !data) return false;

    try {
        if (data.graphJson) {
            state.graph.fromJSON(data.graphJson);
            
            // Migrate old data to new schema (Add defaults if missing)
            state.graph.getCells().forEach(cell => {
                const cellData = cell.getData() || {};
                let updated = false;

                // 1. Recover missing position/size for nodes from data.pos
                if (cell.isNode()) {
                    const pos = cell.getPosition();
                    if ((!pos || (pos.x === 0 && pos.y === 0)) && cellData.pos) {
                        cell.setPosition(cellData.pos.x, cellData.pos.y);
                        logger.info(`Recovered position for ${cell.id} from data.pos`);
                        updated = true;
                    }
                    
                    const size = cell.getSize();
                    if (!size || (size.width === 0 && size.height === 0)) {
                        if (cellData.is_group) cell.setSize(200, 200);
                        else cell.setSize(60, 60);
                        updated = true;
                    }
                }

                // 2. Ensure description exists for all objects
                if (cellData.description === undefined) {
                    cellData.description = "";
                    updated = true;
                }

                // 3. Ensure routing_offset exists for edges
                if (cell.isEdge()) {
                    if (cellData.routing_offset === undefined) {
                        cellData.routing_offset = 20;
                        updated = true;
                    }
                    
                    // [6개월 뒤의 나를 위한 메모]
                    // 하위 호환성 유지 및 데이터 무결성 강화를 위한 자가 치유(Self-healing) 로직.
                    // 기존 도면을 불러올 때 누락된 크로스 레이어 정보를 노드 데이터를 참조하여 실시간 복구함.
                    if (cellData.source_layer === undefined || cellData.target_layer === undefined) {
                        const srcNode = state.graph.getCellById(cellData.source);
                        const dstNode = state.graph.getCellById(cellData.target);
                        
                        // Default to current edge's layer if node is missing (safe fallback)
                        const srcLayer = srcNode?.getData()?.layerId || cellData.layerId || 'l1';
                        const dstLayer = dstNode?.getData()?.layerId || cellData.layerId || 'l1';
                        
                        cellData.source_layer = srcLayer;
                        cellData.target_layer = dstLayer;
                        cellData.is_cross_layer = (srcLayer !== dstLayer);
                        updated = true;
                        logger.info(`Auto-repaired layer metadata for edge ${cell.id}`);
                    }
                }

                // 4. Ensure label consistency (data vs attrs)
                const pureLabel = cellData.label || "";
                const visualLabel = cell.attr('label/text');
                if (visualLabel !== pureLabel) {
                    cell.attr('label/text', pureLabel);
                    updated = true;
                }

                if (updated) {
                    cell.setData(cellData, { silent: true });
                }
            });
        }

        const vp = data.viewport || {};
        if (vp.zoom !== undefined) state.graph.zoomTo(vp.zoom);
        if (vp.tx !== undefined) state.graph.translate(vp.tx, vp.ty || 0);

        const settings = data.settings || {};
        if (settings.gridSpacing) {
            window.dispatchEvent(new CustomEvent('gridSpacingChanged', { detail: { spacing: settings.gridSpacing } }));
        }
        if (settings.gridStyle) {
            window.dispatchEvent(new CustomEvent('gridChanged', { detail: { style: settings.gridStyle } }));
        }
        if (settings.theme) {
            document.documentElement.setAttribute('data-theme', settings.theme);
        }
        
        // Restore Layers
        if (data.layers && Array.isArray(data.layers)) {
            state.layers = data.layers;
            state.activeLayerId = data.activeLayerId || data.layers[0]?.id;
        }

        state.graph.trigger('project:restored');
        return true;
    } catch (e) {
        logger.critical("Failed to restore project data.", e);
        return false;
    }
}
