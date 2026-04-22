import { state } from '../state.js';
import { t } from '../i18n.js';

export const FIXED_ASSETS = [
    { id: 'fixed-group', type: 'group', label: 'Group Container', icon: 'group.png', is_img: true },
    { id: 'fixed-rect', type: 'rect', label: 'Rectangle', icon: 'far fa-square', is_img: false },
    { id: 'fixed-rounded-rect', type: 'rounded-rect', label: 'Rounded Rectangle', icon: 'fas fa-vector-square', is_img: false },
    { id: 'fixed-circle', type: 'circle', label: 'Circle', icon: 'far fa-circle', is_img: false },
    { id: 'fixed-text', type: 'text-box', label: 'Text Box', icon: 'fas fa-font', is_img: false },
    { id: 'fixed-label', type: 'label', label: 'Label', icon: 'fas fa-tag', is_img: false },
    { id: 'fixed-blank', type: 'blank', label: 'Blank Point (Invisible)', icon: 'fas fa-crosshairs', is_img: false, extra_style: 'opacity: 0.5;' },
    { id: 'fixed-dot', type: 'dot', label: 'Dot (Small visible point)', icon: 'fas fa-circle', is_img: false, extra_style: 'font-size: 6px;' },
    { id: 'fixed-ellipse', type: 'ellipse', label: 'Ellipse', icon: 'fas fa-egg', is_img: false, extra_style: 'transform: rotate(-45deg);' },
    { id: 'fixed-polyline', type: 'polyline', label: 'Polyline', icon: 'fas fa-chart-line', is_img: false },
    { id: 'fixed-browser', type: 'browser', label: 'Browser', icon: 'fas fa-window-maximize', is_img: false },
    { id: 'fixed-user', type: 'user', label: 'User', icon: 'fas fa-user', is_img: false },
    { id: 'fixed-admin', type: 'admin', label: 'Admin', icon: 'fas fa-user-shield', is_img: false },
    { id: 'fixed-triangle', type: 'triangle', label: 'Triangle', icon: 'fas fa-caret-up', is_img: false, extra_style: 'font-size: 22px; margin-top: -2px;' },
    { id: 'fixed-diamond', type: 'diamond', label: 'Diamond', icon: 'fas fa-square', is_img: false, extra_style: 'transform: rotate(45deg) scale(0.8);' },
    { id: 'fixed-parallelogram', type: 'parallelogram', label: 'Parallelogram', icon: 'fas fa-square', is_img: false, extra_style: 'transform: skewX(-20deg) scaleX(1.2);' },
    { id: 'fixed-cylinder', type: 'cylinder', label: 'Cylinder', icon: 'fas fa-database', is_img: false },
    { id: 'fixed-document', type: 'document', label: 'Document', icon: 'fas fa-file-alt', is_img: false },
    { id: 'fixed-manual-input', type: 'manual-input', label: 'Manual Input', icon: 'fas fa-keyboard', is_img: false },
    { id: 'fixed-table', type: 'table', label: 'Table', icon: 'fas fa-table', is_img: false },
    { id: 'fixed-rack', type: 'rack', label: 'Rack', icon: 'fas fa-columns', is_img: false },
    { id: 'fixed-hourglass', type: 'hourglass', label: 'Hourglass', icon: 'fas fa-hourglass-half', is_img: false },
    { id: 'fixed-arrow-up', type: 'arrow-up', label: 'Arrow Up', icon: 'fas fa-arrow-up', is_img: false },
    { id: 'fixed-arrow-down', type: 'arrow-down', label: 'Arrow Down', icon: 'fas fa-arrow-down', is_img: false },
    { id: 'fixed-arrow-left', type: 'arrow-left', label: 'Arrow Left', icon: 'fas fa-arrow-left', is_img: false },
    { id: 'fixed-arrow-right', type: 'arrow-right', label: 'Arrow Right', icon: 'fas fa-arrow-right', is_img: false },
    { id: 'fixed-rich-card', type: 'rich-card', label: t('rich_card') || 'Rich Text Card', icon: 'fas fa-address-card', is_img: false }
];

export function renderFixedSection(container) {
    const fixedSection = document.createElement('div');
    fixedSection.className = 'asset-category fixed-category';
    
    const title = t('fixed_objects') || 'Fixed Objects';
    
    fixedSection.innerHTML = `
        <div class="category-header">
            <span data-i18n="fixed_objects">${title}</span>
            <i class="fas fa-chevron-down"></i>
        </div>
        <div class="category-collapsed-icon" title="${title}">
            <i class="fas fa-layer-group" style="font-size: 20px; color: #64748b;"></i>
        </div>
        <div class="category-content">
            <div class="asset-grid"></div>
        </div>
        <div class="category-divider" style="height: 1px; background: rgba(255,255,255,0.1); margin: 15px 10px;"></div>
    `;
    
    // Toggle Logic
    const header = fixedSection.querySelector('.category-header');
    header.addEventListener('click', () => {
        if (!document.getElementById('sidebar').classList.contains('collapsed')) {
            fixedSection.classList.toggle('active');
        }
    });

    // Handle Sidebar Collapsed State (Flyout)
    const collapsedIcon = fixedSection.querySelector('.category-collapsed-icon');
    collapsedIcon.addEventListener('click', (e) => {
        if (document.getElementById('sidebar').classList.contains('collapsed')) {
            e.stopPropagation();
            // Since we don't want to import renderFlyout here to avoid circular dependencies
            // we'll dispatch a custom event or check if it's available globally (though not recommended)
            // or just let assets.js handle it if we restructure.
            // For now, let's trigger a click on a hidden flyout handler or use state.
            const event = new CustomEvent('render-fixed-flyout', { 
                detail: { 
                    container: fixedSection, 
                    assets: FIXED_ASSETS,
                    meta: { id: 'fixed_objects', label: title }
                } 
            });
            document.dispatchEvent(event);
        }
    });
    
    const grid = fixedSection.querySelector('.asset-grid');
    FIXED_ASSETS.forEach(asset => {
        const item = document.createElement('div');
        item.className = 'asset-item';
        item.draggable = true;
        item.dataset.type = asset.type;
        item.dataset.assetId = asset.id;
        item.title = asset.label;
        
        if (asset.is_img) {
            item.innerHTML = `<img src="/static/assets/${asset.icon}" width="22" height="22" loading="lazy">`;
        } else {
            item.innerHTML = `<i class="${asset.icon}" style="font-size: 18px; color: #64748b; ${asset.extra_style || ''}"></i>`;
        }

        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('assetId', asset.id);
            state.assetMap[asset.id] = { 
                id: asset.id, 
                type: asset.type, 
                path: asset.is_img ? asset.icon : '', 
                label: asset.label 
            };
        });
        grid.appendChild(item);
    });

    container.appendChild(fixedSection);
}
