export function getEdgeConfig(data) {
    let routingType = data.routing || 'manhattan';
    if (routingType === 'u-shape') routingType = 'manhattan-u';
    
    const srcAnchor = (data.routing === 'u-shape') ? 'top' : (data.source_anchor || 'orth');
    const dstAnchor = (data.routing === 'u-shape') ? 'top' : (data.target_anchor || 'orth');

    const routerArgs = { 
        step: 5, // Finer step for better pathfinding
        padding: 10, // Reduced padding to avoid "unreachable" errors in tight spaces
    };
    const directions = ['top', 'bottom', 'left', 'right'];
    
    if (directions.includes(srcAnchor)) routerArgs.startDirections = [srcAnchor];
    if (directions.includes(dstAnchor)) routerArgs.endDirections = [dstAnchor];
    
    // For U-shape, we need a bit more padding but not too much to fail
    if (data.routing === 'u-shape') routerArgs.padding = 15;

    const routerConfigs = {
        manhattan: { name: 'manhattan', args: routerArgs },
        'manhattan-u': { name: 'manhattan', args: routerArgs },
        orthogonal: { name: 'orth' },
        straight: null,
        metro: { name: 'metro' }
    };

    return {
        id: data.id || `e_${data.source}_${data.target}`,
        source: { cell: data.source, anchor: srcAnchor, connectionPoint: 'boundary' },
        target: { cell: data.target, anchor: dstAnchor, connectionPoint: 'boundary' },
        router: routerConfigs[routingType] || routerConfigs.manhattan,
        connector: { name: 'jumpover', args: { type: 'arc', size: 5, radius: 12 } },
        attrs: {
            line: {
                stroke: data.is_tunnel ? (data.color || '#ef4444') : (data.color || '#94a3b8'),
                strokeWidth: data.is_tunnel ? 2 : (data.width || 2),
                strokeDasharray: data.flow ? '5,5' : (data.is_tunnel ? '6,3' : (data.style === 'dashed' ? '5,5' : '0')),
                targetMarker: (data.direction === 'forward' || data.direction === 'both') ? 'block' : null,
                sourceMarker: (data.direction === 'backward' || data.direction === 'both') ? 'block' : null,
                class: data.flow ? 'flow-animation' : '',
            }
        },
        labels: data.is_tunnel ? [{
            attrs: {
                text: { text: 'VPN', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' },
                rect: { fill: '#ffffff', rx: 4, ry: 4 }
            }
        }] : [],
        data: data
    };
}
