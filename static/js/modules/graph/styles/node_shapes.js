/**
 * graph/styles/node_shapes.js - Registration of individual shape plugins
 */
import { shapeRegistry } from './registry.js';
import { commonPorts } from './ports.js';
import { generateRackUnitsPath, getLabelAttributes } from './utils.js';
import { DEFAULTS } from '../../constants.js';

/**
 * Initialize all shape plugins into the registry
 */
export function registerNodes() {
    // 1. Default Node
    shapeRegistry.register('default', {
        shape: 'drawnet-node',
        definition: {
            inherit: 'rect',
            width: 60, height: 60,
            attrs: {
                body: { strokeWidth: 0, fill: 'transparent', rx: 4, ry: 4 },
                image: { 'xlink:href': `/static/assets/${DEFAULTS.DEFAULT_ICON || 'router.svg'}`, width: 48, height: 48, refX: 6, refY: 6 },
                label: {
                    text: '', fill: '#64748b', fontSize: 12, fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold', textVerticalAnchor: 'top', refX: 0.5, refY: '100%', refY2: 10,
                },
            },
            markup: [
                { tagName: 'rect', selector: 'body' },
                { tagName: 'image', selector: 'image' },
                { tagName: 'text', selector: 'label' },
            ],
            ports: { ...commonPorts }
        }
    });

    // 2. Group Node
    shapeRegistry.register('group', {
        shape: 'drawnet-group',
        definition: {
            inherit: 'rect',
            width: 200, height: 200,
            attrs: {
                body: { strokeWidth: 2, stroke: '#3b82f6', fill: '#f1f5f9', fillOpacity: 0.2, rx: 8, ry: 8 },
                label: {
                    text: '', fill: '#1e293b', fontSize: 14, fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold', textVerticalAnchor: 'bottom', refX: 0.5, refY: -15,
                },
            },
            ports: { ...commonPorts }
        }
    });

    // 3. Dummy/Blank Node
    shapeRegistry.register('dummy', {
        shape: 'drawnet-dummy',
        definition: {
            inherit: 'circle',
            width: 8, height: 8,
            attrs: {
                body: { strokeWidth: 1, stroke: 'rgba(148, 163, 184, 0.2)', fill: 'rgba(255, 255, 255, 0.1)' },
            },
            ports: {
                groups: { ...commonPorts.groups, center: { position: 'absolute', attrs: { circle: { r: 4, magnet: true, stroke: '#31d0c6', strokeWidth: 2, fill: '#fff' } } } },
                items: [{ id: 'center', group: 'center' }],
            }
        }
    });

    // 4. Dot Node
    shapeRegistry.register('dot', {
        shape: 'drawnet-dot',
        definition: {
            inherit: 'circle',
            width: 6, height: 6,
            attrs: {
                body: { strokeWidth: 1, stroke: '#64748b', fill: '#64748b' },
            },
            ports: {
                groups: { ...commonPorts.groups, center: { position: 'absolute', attrs: { circle: { r: 3, magnet: true, stroke: '#31d0c6', strokeWidth: 1, fill: '#fff' } } } },
                items: [{ id: 'center', group: 'center' }],
            }
        }
    });

    // 5. Basic Shapes (Primitives)
    const basicAttrs = {
        body: { strokeWidth: 2, stroke: '#94a3b8', fill: '#ffffff' },
        label: { text: '', fill: '#64748b', fontSize: 12, refX: 0.5, refY: 0.5, textAnchor: 'middle', textVerticalAnchor: 'middle' }
    };

    shapeRegistry.register('rect', {
        shape: 'drawnet-rect',
        definition: { inherit: 'rect', width: 100, height: 60, attrs: basicAttrs, ports: commonPorts }
    });

    shapeRegistry.register('rounded-rect', {
        shape: 'drawnet-rounded-rect',
        definition: {
            inherit: 'rect', width: 100, height: 60,
            attrs: { ...basicAttrs, body: { ...basicAttrs.body, rx: 12, ry: 12 } },
            ports: commonPorts
        }
    });

    shapeRegistry.register('circle', {
        shape: 'drawnet-circle',
        definition: { inherit: 'circle', width: 60, height: 60, attrs: basicAttrs, ports: commonPorts }
    });

    shapeRegistry.register('ellipse', {
        shape: 'drawnet-ellipse',
        definition: { inherit: 'ellipse', width: 80, height: 50, attrs: basicAttrs, ports: commonPorts }
    });

    shapeRegistry.register('text-box', {
        shape: 'drawnet-text',
        definition: {
            inherit: 'rect', width: 100, height: 40,
            attrs: { body: { strokeWidth: 0, fill: 'transparent' }, label: { ...basicAttrs.label, text: 'Text', fill: '#1e293b', fontSize: 14 } }
        }
    });

    shapeRegistry.register('label', {
        shape: 'drawnet-label',
        definition: {
            inherit: 'rect', width: 80, height: 30,
            attrs: { 
                ...basicAttrs, 
                body: { ...basicAttrs.body, rx: 4, ry: 4, strokeWidth: 1 }, 
                label: { ...basicAttrs.label, fontSize: 13, fill: '#1e293b' } 
            },
            ports: commonPorts
        }
    });

    // 6. Practical Shapes
    shapeRegistry.register('browser', {
        shape: 'drawnet-browser',
        definition: {
            inherit: 'rect', width: 120, height: 80,
            markup: [
                { tagName: 'rect', selector: 'body' },
                { tagName: 'rect', selector: 'header' },
                { tagName: 'circle', selector: 'btn1' },
                { tagName: 'circle', selector: 'btn2' },
                { tagName: 'text', selector: 'label' }
            ],
            attrs: {
                body: { strokeWidth: 2, stroke: '#94a3b8', fill: '#ffffff', rx: 4, ry: 4 },
                header: { strokeWidth: 2, stroke: '#94a3b8', fill: '#f1f5f9', height: 18, refWidth: '100%', rx: 4, ry: 4 },
                btn1: { r: 3, fill: '#cbd5e1', refX: 10, refY: 9 },
                btn2: { r: 3, fill: '#cbd5e1', refX: 20, refY: 9 },
                label: { text: '', fill: '#64748b', fontSize: 12, refX: 0.5, refY: 0.6, textAnchor: 'middle', textVerticalAnchor: 'middle' }
            },
            ports: commonPorts
        }
    });

    shapeRegistry.register('triangle', {
        shape: 'drawnet-triangle',
        definition: {
            inherit: 'polygon', width: 60, height: 60,
            attrs: {
                body: { refPoints: '0,10 5,0 10,10', strokeWidth: 2, stroke: '#94a3b8', fill: '#ffffff' },
                label: { ...basicAttrs.label, refY: 0.7 }
            },
            ports: commonPorts
        }
    });

    shapeRegistry.register('diamond', {
        shape: 'drawnet-diamond',
        definition: {
            inherit: 'polygon', width: 80, height: 80,
            attrs: { body: { refPoints: '0,5 5,0 10,5 5,10', strokeWidth: 2, stroke: '#94a3b8', fill: '#ffffff' }, label: basicAttrs.label },
            ports: commonPorts
        }
    });

    shapeRegistry.register('parallelogram', {
        shape: 'drawnet-parallelogram',
        definition: {
            inherit: 'polygon', width: 100, height: 60,
            attrs: { body: { refPoints: '2,0 10,0 8,10 0,10', strokeWidth: 2, stroke: '#94a3b8', fill: '#ffffff' }, label: basicAttrs.label },
            ports: commonPorts
        }
    });

    shapeRegistry.register('cylinder', {
        shape: 'drawnet-cylinder',
        definition: {
            inherit: 'rect', width: 60, height: 80,
            markup: [
                { tagName: 'path', selector: 'body' },
                { tagName: 'path', selector: 'top' },
                { tagName: 'text', selector: 'label' }
            ],
            attrs: {
                body: { d: 'M 0 10 L 0 70 C 0 80 60 80 60 70 L 60 10', strokeWidth: 2, stroke: '#94a3b8', fill: '#ffffff' },
                top: { d: 'M 0 10 C 0 0 60 0 60 10 C 60 20 0 20 0 10 Z', strokeWidth: 2, stroke: '#94a3b8', fill: '#e2e8f0' },
                label: basicAttrs.label
            },
            ports: commonPorts
        }
    });

    shapeRegistry.register('document', {
        shape: 'drawnet-document',
        definition: {
            inherit: 'rect', width: 60, height: 80,
            markup: [
                { tagName: 'path', selector: 'body' },
                { tagName: 'path', selector: 'fold' },
                { tagName: 'text', selector: 'label' }
            ],
            attrs: {
                body: { d: 'M 0 0 L 45 0 L 60 15 L 60 80 L 0 80 Z', strokeWidth: 2, stroke: '#94a3b8', fill: '#ffffff' },
                fold: { d: 'M 45 0 L 45 15 L 60 15', strokeWidth: 2, stroke: '#94a3b8', fill: '#e2e8f0' },
                label: basicAttrs.label
            },
            ports: commonPorts
        }
    });

    shapeRegistry.register('manual-input', {
        shape: 'drawnet-manual-input',
        definition: {
            inherit: 'polygon', width: 100, height: 60,
            attrs: { body: { refPoints: '0,3 10,0 10,10 0,10', strokeWidth: 2, stroke: '#94a3b8', fill: '#ffffff' }, label: basicAttrs.label },
            ports: commonPorts
        }
    });

    shapeRegistry.register('table', {
        // ... (previous table registration)
    });

    // --- 랙(Rack) 컨테이너 플러그인 ---
    shapeRegistry.register('rack', {
        shape: 'drawnet-rack',
        definition: {
            inherit: 'rect',
            width: 160, height: 600,
            markup: [
                { tagName: 'rect', selector: 'body' },
                { tagName: 'rect', selector: 'header' },
                { tagName: 'path', selector: 'units' },
                { tagName: 'text', selector: 'label' }
            ],
            attrs: {
                body: { strokeWidth: 3, stroke: '#334155', fill: '#f8fafc', rx: 4, ry: 4 },
                header: { refWidth: '100%', height: 30, fill: '#1e293b', stroke: '#334155', strokeWidth: 2, rx: 4, ry: 4 },
                units: {
                    d: generateRackUnitsPath(600, 42),
                    stroke: '#94a3b8', strokeWidth: 1
                },
                label: {
                    text: 'Rack', fill: '#ffffff', fontSize: 14, fontWeight: 'bold',
                    refX: 0.5, refY: 15, textAnchor: 'middle', textVerticalAnchor: 'middle'
                }
            },
            ports: commonPorts
        }
    });

    // 8. Rich Text Card (Header + Listing)
    shapeRegistry.register('rich-card', {
        shape: 'drawnet-rich-card',
        definition: {
            inherit: 'rect',
            width: 280, height: 180,
            markup: [
                { tagName: 'rect', selector: 'body' },
                { tagName: 'rect', selector: 'header' },
                { tagName: 'text', selector: 'headerLabel' },
                {
                    tagName: 'foreignObject',
                    selector: 'fo',
                    children: [
                        {
                            tagName: 'div',
                            ns: 'http://www.w3.org/1999/xhtml',
                            selector: 'content',
                            style: {
                                width: '100%',
                                height: '100%',
                                padding: '10px',
                                fontSize: '12px',
                                color: '#334155',
                                overflow: 'hidden',
                                boxSizing: 'border-box',
                                lineHeight: '1.4'
                            }
                        }
                    ]
                }
            ],
            attrs: {
                body: { fill: '#ffffff', stroke: '#3b82f6', strokeWidth: 1, rx: 4, ry: 4 },
                header: { refWidth: '100%', height: 32, fill: '#3b82f6', rx: 4, ry: 4 },
                headerLabel: {
                    text: 'TITLE', fill: '#ffffff', fontSize: 13, fontWeight: 'bold',
                    refX: 10, refY: 16, textVerticalAnchor: 'middle'
                },
                fo: { refX: 0, refY: 32, refWidth: '100%', refHeight: 'calc(100% - 32)' }
            },
            ports: commonPorts
        }
    });

    // 7. Dynamic Icon-based Plugins
    const icons = {
        'user': '\uf007', 'admin': '\uf505', 'hourglass': '\uf252',
        'table': '\uf0ce', 'tag': '\uf02b', 'polyline': '\uf201',
        'arrow-up': '\uf062', 'arrow-down': '\uf063', 'arrow-left': '\uf060', 'arrow-right': '\uf061'
    };

    Object.keys(icons).forEach(type => {
        shapeRegistry.register(type, {
            shape: 'drawnet-icon',
            icon: icons[type],
            definition: {
                inherit: 'rect', width: 60, height: 60,
                markup: [
                    { tagName: 'rect', selector: 'body' },
                    { tagName: 'text', selector: 'icon' },
                    { tagName: 'text', selector: 'label' }
                ],
                attrs: {
                    body: { strokeWidth: 0, fill: 'transparent' },
                    icon: { text: icons[type], fontFamily: 'FontAwesome', fontSize: 40, fill: '#64748b', refX: 0.5, refY: 0.5, textAnchor: 'middle', textVerticalAnchor: 'middle' },
                    label: { text: '', fill: '#64748b', fontSize: 12, refX: 0.5, refY: '100%', refY2: 12, textAnchor: 'middle', textVerticalAnchor: 'top' }
                },
                ports: commonPorts
            }
        });
    });
}
