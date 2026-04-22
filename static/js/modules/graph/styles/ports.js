/**
 * graph/styles/ports.js - Core port configurations for X6 nodes
 */

export const commonPorts = {
    groups: {
        top: { 
            position: 'top', 
            attrs: { circle: { r: 4, magnet: true, stroke: '#31d0c6', strokeWidth: 2, fill: '#fff' } } 
        },
        bottom: { 
            position: 'bottom', 
            attrs: { circle: { r: 4, magnet: true, stroke: '#31d0c6', strokeWidth: 2, fill: '#fff' } } 
        },
        left: { 
            position: 'left', 
            attrs: { circle: { r: 4, magnet: true, stroke: '#31d0c6', strokeWidth: 2, fill: '#fff' } } 
        },
        right: { 
            position: 'right', 
            attrs: { circle: { r: 4, magnet: true, stroke: '#31d0c6', strokeWidth: 2, fill: '#fff' } } 
        },
        center: { 
            position: 'absolute', 
            attrs: { circle: { r: 4, magnet: true, stroke: '#31d0c6', strokeWidth: 2, fill: '#fff' } } 
        }
    },
    items: [
        { id: 'top', group: 'top' },
        { id: 'bottom', group: 'bottom' },
        { id: 'left', group: 'left' },
        { id: 'right', group: 'right' }
    ],
};

export const centerPort = {
    ...commonPorts,
    items: [{ id: 'center', group: 'center' }]
};
