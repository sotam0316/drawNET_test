/**
 * renderer.js - UI Generation and Positioning for Context Menu
 */
export function generateMenuHTML(nodes, isGroupSelected) {
    let html = '';

    // 1. Connection Group
    html += `
        <div class="menu-label">Connection</div>
        <div class="menu-item" data-action="connect-solid"><i class="fas fa-link" style="margin-right:8px; opacity:0.6;"></i> Connect (Solid)</div>
        <div class="menu-item" data-action="connect-straight"><i class="fas fa-slash" style="margin-right:8px; opacity:0.6; transform: rotate(-45deg);"></i> Connect (Straight)</div>
        <div class="menu-item" data-action="connect-dashed"><i class="fas fa-ellipsis-h" style="margin-right:8px; opacity:0.6;"></i> Connect (Dashed)</div>
        <div class="menu-item" data-action="disconnect"><i class="fas fa-unlink" style="margin-right:8px; opacity:0.6;"></i> Disconnect</div>
    `;

    // 2. Node Management Group
    if (nodes.length >= 2 || isGroupSelected) {
        html += `<div class="menu-divider"></div><div class="menu-label">Nodes</div>`;
        if (nodes.length >= 2) {
            html += `<div class="menu-item" data-action="group"><i class="fas fa-object-group" style="margin-right:8px; opacity:0.6;"></i> Group Selected</div>`;
        }
        if (isGroupSelected) {
            html += `<div class="menu-item" data-action="ungroup"><i class="fas fa-object-ungroup" style="margin-right:8px; opacity:0.6;"></i> Ungroup</div>`;
        }
    }

    // 3. Alignment Group
    if (nodes.length >= 2) {
        html += `
            <div class="menu-divider"></div>
            <div class="menu-label">Align & Distribute</div>
            <div class="menu-icon-row">
                <div class="icon-btn" data-action="align-top" title="Align Top (Shift+1)"><i class="fas fa-align-left fa-rotate-90"></i></div>
                <div class="icon-btn" data-action="align-bottom" title="Align Bottom (Shift+2)"><i class="fas fa-align-right fa-rotate-90"></i></div>
                <div class="icon-btn" data-action="align-left" title="Align Left (Shift+3)"><i class="fas fa-align-left"></i></div>
                <div class="icon-btn" data-action="align-right" title="Align Right (Shift+4)"><i class="fas fa-align-right"></i></div>
                <div class="icon-btn" data-action="align-middle" title="Align Middle (Shift+5)"><i class="fas fa-align-center fa-rotate-90"></i></div>
                <div class="icon-btn" data-action="align-center" title="Align Center (Shift+6)"><i class="fas fa-align-center"></i></div>
            </div>
        `;
        if (nodes.length >= 3) {
            html += `
                <div class="menu-icon-row" style="border-top: 1px solid rgba(255,255,255,0.05); margin-top:4px;">
                    <div class="icon-btn" data-action="distribute-h" title="Distribute Horizontal"><i class="fas fa-arrows-alt-h"></i></div>
                    <div class="icon-btn" style="opacity:0.2; cursor:default;"><i class="fas fa-arrows-alt-v"></i></div>
                </div>
            `;
        }
    }

    // 4. Other Group
    html += `
        <div class="menu-divider"></div>
        <div class="menu-item" data-action="properties"><i class="fas fa-cog" style="margin-right:8px; opacity:0.6;"></i> Properties...</div>
    `;

    return html;
}

export function generateSelectionMenuHTML(models) {
    let html = '<div class="menu-label">Select Object</div>';
    
    if (models.length === 0) {
        html += '<div class="menu-item disabled">No objects here</div>';
        return html;
    }

    models.forEach(model => {
        const data = model.getData() || {};
        const type = (data.type || model.shape || 'Unknown').toUpperCase();
        const label = data.label || model.id.substring(0, 8);
        const iconClass = model.isNode() ? (data.is_group ? 'fa-object-group' : 'fa-microchip') : 'fa-link';
        
        html += `
            <div class="menu-item" data-action="select-cell" data-cell-id="${model.id}">
                <i class="fas ${iconClass}" style="margin-right:8px; width:14px; opacity:0.6;"></i>
                <span style="font-size:10px; opacity:0.5; margin-right:4px;">[${type}]</span>
                <span>${label}</span>
            </div>
        `;
    });

    return html;
}

/**
 * showContextMenu - Positions and displays the menu
 */
export function showContextMenu(el, x, y) {
    if (!el) return;

    el.style.opacity = '0';
    el.style.display = 'block';
    
    const menuWidth = el.offsetWidth;
    const menuHeight = el.offsetHeight;
    const padding = 10;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let left = x;
    if (x + menuWidth + padding > windowWidth) {
        left = windowWidth - menuWidth - padding;
    }

    let top = y;
    if (y + menuHeight + padding > windowHeight) {
        top = windowHeight - menuHeight - padding;
    }

    el.style.left = `${Math.max(padding, left)}px`;
    el.style.top = `${Math.max(padding, top)}px`;
    el.style.opacity = '1';
}

/**
 * hideContextMenu - Hides the menu
 */
export function hideContextMenu(el) {
    if (el) el.style.display = 'none';
}
