import { state } from '../../../state.js';
import { logger } from '../../../utils/logger.js';
import { calculateCellZIndex } from '../../layers.js';

/**
 * getX6EdgeConfig - Maps edge data to X6 connecting properties
 */
export function getX6EdgeConfig(data) {
    if (!data || !data.source || !data.target) {
        return {
            source: data?.source,
            target: data?.target,
            router: null,
            attrs: {
                line: {
                    stroke: '#94a3b8',
                    strokeWidth: 2,
                    targetMarker: 'block'
                }
            }
        };
    }


    // 1. Resolve Routing Type (Explicit choice > Adaptive)
    let routingType = data.routing || 'manhattan';
    if (routingType === 'u-shape') routingType = 'manhattan-u';

    // Adaptive Routing: Only force straight if NO explicit choice was made or if it's currently manhattan
    if (state.graph && (routingType === 'manhattan' || !data.routing)) {
        const srcNode = state.graph.getCellById(data.source);
        const dstNode = state.graph.getCellById(data.target);

        if (srcNode && dstNode && srcNode.isNode() && dstNode.isNode()) {
            const b1 = srcNode.getBBox();
            const b2 = dstNode.getBBox();
            const p1 = { x: b1.x + b1.width / 2, y: b1.y + b1.height / 2 };
            const p2 = { x: b2.x + b2.width / 2, y: b2.y + b2.height / 2 };
            const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

            if (dist < 100) {
                routingType = 'straight';
            }
        }
    }

    const isStraight = (routingType === 'straight');
    
    // 2. Resolve Anchors & Router Args
    const srcAnchor = (data.routing === 'u-shape') ? 'top' : (data.source_anchor || 'orth');
    const dstAnchor = (data.routing === 'u-shape') ? 'top' : (data.target_anchor || 'orth');
    
    // Manhattan Router Args (Enhanced for topological diagrams)
    const routerArgs = { 
        padding: 10, 
        step: 5,        // [TWEAK] Increase precision (10 -> 5) to reduce redundant bends
        offset: data.routing_offset || 20,
        exclude(cell) {
            return cell && typeof cell.getData === 'function' && cell.getData()?.is_group;
        }
    };

    // Sync Manhattan directions with manual anchors to force the router to respect the side
    const validSides = ['top', 'bottom', 'left', 'right'];
    if (srcAnchor && validSides.includes(srcAnchor)) {
        routerArgs.startDirections = [srcAnchor];
    }
    if (dstAnchor && validSides.includes(dstAnchor)) {
        routerArgs.endDirections = [dstAnchor];
    }

    if (routingType === 'manhattan-u') {
        routerArgs.startDirections = ['top'];
        routerArgs.endDirections = ['top'];
    }

    // 3. Intelligent Port Matching (Shortest Path)
    // If ports are not explicitly provided (e.g. via Auto-connect Shift+A), 
    // we find the closest port pair to ensure the most direct connection.
    let resolvedSourcePort = data.source_port;
    let resolvedTargetPort = data.target_port;

    if (state.graph && !resolvedSourcePort && !resolvedTargetPort && srcAnchor === 'orth' && dstAnchor === 'orth') {
        const srcNode = state.graph.getCellById(data.source);
        const dstNode = state.graph.getCellById(data.target);
        if (srcNode && dstNode && srcNode.isNode() && dstNode.isNode()) {
            const bestPorts = findClosestPorts(srcNode, dstNode);
            if (bestPorts) {
                resolvedSourcePort = bestPorts.source;
                resolvedTargetPort = bestPorts.target;
            }
        }
    }

    const routerConfigs = {
        manhattan: { name: 'manhattan', args: routerArgs },
        'manhattan-u': { name: 'manhattan', args: routerArgs },
        orthogonal: { name: 'orth' },
        straight: null,
        metro: { name: 'metro' }
    };

    const isStraightFinal = (routingType === 'straight');
    const direction = data.direction || 'none';

    // Resolve source/target configuration
    // Rule: If a port is explicitly provided AND the anchor is set to 'orth' (Auto), 
    // we keep the port. If a manual anchor (top, left, etc.) is set, we clear the port.
    const sourceConfig = {
        cell: data.source,
        connectionPoint: { name: 'boundary', args: { padding: 6 } }
    };
    if (resolvedSourcePort && srcAnchor === 'orth') {
        sourceConfig.port = resolvedSourcePort;
    } else {
        // [FIX] In Straight mode, directional anchors (top, left etc) force a bend.
        // We use 'center' but rely on 'boundary' connection point for a perfect straight diagonal.
        sourceConfig.anchor = isStraight ? { name: 'center' } : { name: srcAnchor };
    }

    const targetConfig = {
        cell: data.target,
        connectionPoint: { name: 'boundary', args: { padding: 6 } }
    };
    if (resolvedTargetPort && dstAnchor === 'orth') {
        targetConfig.port = resolvedTargetPort;
    } else {
        targetConfig.anchor = isStraight ? { name: 'center' } : { name: dstAnchor };
    }

    const config = {
        id: data.id || `e_${data.source}_${data.target}`,
        source: sourceConfig,
        target: targetConfig,
        router: isStraight ? null : (routerConfigs[routingType] || routerConfigs.manhattan),
        connector: isStraight ? { name: 'normal' } : { name: 'jumpover', args: { type: 'arc', size: 6 } },
        attrs: {
            line: {
                stroke: data.is_tunnel ? (data.color || '#ef4444') : (data.color || '#94a3b8'),
                strokeWidth: data.is_tunnel ? 2 : (data.width || (data.style === 'double' ? 4 : 2)),
                strokeDasharray: data.flow ? '5,5' : (data.is_tunnel ? '6,3' : (data.style === 'dashed' ? '5,5' : (data.style === 'dotted' ? '2,2' : '0'))),
                targetMarker: (direction === 'forward' || direction === 'both') ? 'block' : null,
                sourceMarker: (direction === 'backward' || direction === 'both') ? 'block' : null,
                class: data.flow ? 'flow-animation' : '',
            }
        },
        labels: (() => {
            const lbls = [];
            if (data.label) {
                lbls.push({
                    attrs: {
                        text: { text: data.label, fill: data.color || '#64748b', fontSize: 11, fontWeight: '600' },
                        rect: { fill: 'rgba(255,255,255,0.8)', rx: 4, ry: 4, strokeWidth: 0 }
                    }
                });
            }
            if (data.is_tunnel) {
                lbls.push({
                    attrs: {
                        text: { text: 'VPN', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' },
                        rect: { fill: '#ffffff', rx: 3, ry: 3, stroke: '#ef4444', strokeWidth: 1 }
                    },
                    position: { distance: 0.25 }
                });
            }
            return lbls;
        })(),
        zIndex: data.zIndex || calculateCellZIndex(data, 0, false), // Edges default to 30 (Above groups)
        movable: !data.locked,
        deletable: !data.locked,
        data: data
    };
    return config;
}

/**
 * findClosestPorts - Finds the pair of ports with the minimum distance between two nodes.
 */
function findClosestPorts(srcNode, dstNode) {
    const srcPorts = srcNode.getPorts();
    const dstPorts = dstNode.getPorts();
    
    if (srcPorts.length === 0 || dstPorts.length === 0) return null;

    let minParams = null;
    let minDistance = Infinity;

    srcPorts.forEach(sp => {
        dstPorts.forEach(dp => {
            const p1 = srcNode.getPortProp(sp.id, 'args/point') || { x: 0, y: 0 };
            const p2 = dstNode.getPortProp(dp.id, 'args/point') || { x: 0, y: 0 };
            
            // Convert to absolute coordinates
            const pos1 = srcNode.getPosition();
            const pos2 = dstNode.getPosition();
            const abs1 = { x: pos1.x + p1.x, y: pos1.y + p1.y };
            const abs2 = { x: pos2.x + p2.x, y: pos2.y + p2.y };
            
            const dist = Math.sqrt(Math.pow(abs1.x - abs2.x, 2) + Math.pow(abs1.y - abs2.y, 2));
            if (dist < minDistance) {
                minDistance = dist;
                minParams = { source: sp.id, target: dp.id };
            }
        });
    });

    return minParams;
}
