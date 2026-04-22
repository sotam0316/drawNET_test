/**
 * graph/styles/utils.js - Utility functions for graph styling
 */
import { state } from '../../state.js';
import { logger } from '../../utils/logger.js';

/**
 * getLabelAttributes - Returns X6 label attributes based on position and node type
 */
export function getLabelAttributes(pos, nodeType, is_group) {
    const defaultPos = is_group ? 'top' : (['rect', 'circle', 'rounded-rect', 'text-box', 'label', 'browser', 'triangle', 'diamond', 'parallelogram', 'cylinder', 'document', 'manual-input'].includes(nodeType) ? 'center' : 'bottom');
    const actualPos = pos || defaultPos;

    switch (actualPos) {
        case 'top':
            return { refX: 0.5, refY: 0, textAnchor: 'middle', textVerticalAnchor: 'bottom', refY2: -8, refX2: 0 };
        case 'bottom':
            return { refX: 0.5, refY: '100%', textAnchor: 'middle', textVerticalAnchor: 'top', refY2: 8, refX2: 0 };
        case 'left':
            return { refX: 0, refY: 0.5, textAnchor: 'end', textVerticalAnchor: 'middle', refY2: 0, refX2: -12 };
        case 'right':
            return { refX: '100%', refY: 0.5, textAnchor: 'start', textVerticalAnchor: 'middle', refY2: 0, refX2: 12 };
        case 'center':
            return { refX: 0.5, refY: 0.5, textAnchor: 'middle', textVerticalAnchor: 'middle', refY2: 0, refX2: 0 };
        default:
            return { refX: 0.5, refY: '100%', textAnchor: 'middle', textVerticalAnchor: 'top', refY2: 8, refX2: 0 };
    }
}

/**
 * doctorEdge - Debug assistant for checking cell data and attributes
 */
window.doctorEdge = function (id) {
    if (!state.graph) return logger.critical("X6 Graph not initialized.");
    const cell = state.graph.getCellById(id);
    if (!cell) return logger.critical(`Cell [${id}] not found.`);

    logger.info(`--- drawNET STYLE DOCTOR (X6) for [${id}] ---`);
    logger.info("Data Properties:", cell.getData());
    logger.info("Cell Attributes:", cell.getAttrs());
    
    if (cell.isEdge()) {
        logger.info("Router:", cell.getRouter());
        logger.info("Connector:", cell.getConnector());
        logger.info("Source/Target:", {
            source: cell.getSource(),
            target: cell.getTarget()
        });
    }
};

/**
 * Rack의 높이와 슬롯 수에 따라 U-Unit 눈금 패스(SVG Path)를 생성합니다.
 */
export function generateRackUnitsPath(height, slots = 42) {
    let path = '';
    const headerHeight = 30; // node_shapes.js 고정값과 동기화
    const rackBodyHeight = height - headerHeight;
    const unitHeight = rackBodyHeight / slots;
    
    // 단순화된 눈금 (좌우 레일에 작은 선)
    for (let i = 0; i < slots; i++) {
        const y = headerHeight + (i * unitHeight);
        path += `M 5 ${y} L 15 ${y} M 145 ${y} L 155 ${y} `;
    }
    return path;
}

/**
 * renderRichContent - Translates plain text to stylized HTML for the Rich Card
 */
export function renderRichContent(cell, updates) {
    if (!state.graph) return;
    const view = cell.findView(state.graph);
    if (!view) return; // View might not be rendered yet

    const container = view.container;
    const contentDiv = container.querySelector('div[selector="content"]');
    if (!contentDiv) return;

    const data = updates || cell.getData() || {};
    const content = data.content || '';
    const cardType = data.cardType || 'standard';
    const headerColor = data.headerColor || '#3b82f6';
    const contentAlign = data.contentAlign || 'left';

    contentDiv.style.textAlign = contentAlign;

    const lines = content.split('\n').filter(line => line.trim() !== '');
    let html = '';

    if (cardType === 'numbered') {
        html = lines.map((line, idx) => `
            <div style="display: flex; margin-bottom: 8px; align-items: flex-start;">
                <div style="background: ${headerColor}; color: white; width: 18px; height: 18px; 
                            display: flex; align-items: center; justify-content: center; 
                            font-size: 10px; font-weight: bold; border-radius: 2px; margin-right: 8px; flex-shrink: 0;">
                    ${idx + 1}
                </div>
                <div style="font-size: 11px;">${line}</div>
            </div>
        `).join('');
    } else if (cardType === 'bullet') {
        html = lines.map(line => `
            <div style="display: flex; margin-bottom: 5px; align-items: flex-start;">
                <div style="color: ${headerColor}; margin-right: 8px; flex-shrink: 0;">●</div>
                <div style="font-size: 11px;">${line}</div>
            </div>
        `).join('');
    } else if (cardType === 'legend') {
        html = lines.map(line => {
            const match = line.match(/^-\s*\((.*?):(.*?)\)\s*(.*)/);
            if (match) {
                const [, shape, color, text] = match;
                const iconHtml = shape === 'line' 
                    ? `<div style="width: 16px; height: 2px; background: ${color}; margin-top: 8px;"></div>`
                    : `<div style="width: 12px; height: 12px; background: ${color}; border-radius: ${shape === 'circle' ? '50%' : '2px'}; margin-top: 2px;"></div>`;
                
                return `
                    <div style="display: flex; margin-bottom: 8px; align-items: flex-start;">
                        <div style="width: 20px; margin-right: 8px; display: flex; justify-content: center; flex-shrink: 0;">
                            ${iconHtml}
                        </div>
                        <div style="font-size: 11px;">${text}</div>
                    </div>
                `;
            }
            return `<div style="margin-bottom: 5px; font-size: 11px;">${line}</div>`;
        }).join('');
    } else {
        html = lines.map(line => `<div style="margin-bottom: 5px;">${line}</div>`).join('');
    }

    contentDiv.innerHTML = html;
}
