import { t } from '../i18n.js';
import { DEFAULTS } from '../constants.js';

/**
 * createAssetElement - Creates a single asset item DOM element
 * @param {Object} asset 
 * @returns {HTMLElement}
 */
export function createAssetElement(asset, compositeId = null) {
    const item = document.createElement('div');
    item.className = 'asset-item';
    item.draggable = true;
    item.dataset.type = asset.type || asset.id;
    item.dataset.assetId = compositeId || asset.id;
    item.title = asset.label;
    
    // Support legacy 'path', new 'views.icon' or FontAwesome icon class
    const isFontAwesome = asset.is_img === false || (!asset.path && !asset.views && asset.icon && asset.icon.includes('fa-'));
    
    if (isFontAwesome) {
        item.innerHTML = `
            <i class="${asset.icon}" style="font-size: 18px; color: #64748b; ${asset.extra_style || ''}"></i>
            <span>${t(asset.id) || asset.label || asset.id}</span>
        `;
    } else {
        const iconPath = (asset.views && asset.views.icon) ? asset.views.icon : (asset.path || DEFAULTS.DEFAULT_ICON);
        item.innerHTML = `
            <img src="/static/assets/${iconPath}" width="24" height="24" loading="lazy">
            <span>${t(asset.id) || asset.label || asset.id}</span>
        `;
    }
    item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('assetId', item.dataset.assetId);
    });
    return item;
}

/**
 * renderFlyout - Renders the floating category window when sidebar is collapsed
 * @param {HTMLElement} container 
 * @param {Array} assets 
 * @param {Object} meta 
 */
export function renderFlyout(container, assets, meta) {
    document.querySelectorAll('.category-flyout').forEach(f => f.remove());

    const flyout = document.createElement('div');
    flyout.className = 'category-flyout glass-panel active';
    
    const rect = container.getBoundingClientRect();
    flyout.style.top = `${Math.max(10, Math.min(window.innerHeight - 400, rect.top))}px`;
    flyout.style.left = '90px';

    flyout.innerHTML = `
        <div class="flyout-header">
            <strong>${t(meta.id) || meta.name || meta.label}</strong>
            <small>${assets.length} items</small>
        </div>
        <div class="flyout-content" style="max-height: 400px; overflow-y: auto;"></div>
    `;
    const content = flyout.querySelector('.flyout-content');
    
    // Group by category for flyout as well
    const groups = assets.reduce((acc, a) => {
        const cat = a.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(a);
        return acc;
    }, {});

    Object.keys(groups).sort().forEach(catName => {
        if (Object.keys(groups).length > 1 || catName !== 'Other') {
            const label = document.createElement('div');
            label.className = 'asset-group-label';
            label.textContent = catName;
            content.appendChild(label);
        }
        
        const grid = document.createElement('div');
        grid.className = 'asset-grid flyout-grid';
        groups[catName].forEach(asset => grid.appendChild(createAssetElement(asset)));
        content.appendChild(grid);
    });
    
    document.body.appendChild(flyout);
    
    const closeFlyout = (e) => {
        if (!flyout.contains(e.target)) {
            flyout.remove();
            document.removeEventListener('click', closeFlyout);
        }
    };
    setTimeout(() => document.addEventListener('click', closeFlyout), 10);
}

/**
 * renderLibrary - The main loop that renders the entire asset library
 */
export function renderLibrary(data, library, renderPackSelector) {
    const { state } = data; // We expect state to be passed or accessible
    const packs = data.packs || [];
    const filteredPacks = packs.filter(p => state.selectedPackIds.includes(p.id));
    
    // 1. Clear Library (except fixed categories and header)
    const dynamicPacks = library.querySelectorAll('.asset-category:not(.fixed-category)');
    dynamicPacks.forEach(p => p.remove());

    // 2. Group Custom Assets by Pack -> Category
    const packGroups = state.assetsData.reduce((acc, asset) => {
        const packId = asset.pack_id || 'legacy';
        if (packId !== 'legacy' && !state.selectedPackIds.includes(packId)) return acc;
        
        const category = asset.category || 'Other';
        if (!acc[packId]) acc[packId] = {};
        if (!acc[packId][category]) acc[packId][category] = [];
        
        acc[packId][category].push(asset);
        return acc;
    }, {});

    // 3. Render each visible Pack
    Object.keys(packGroups).forEach((packId, index) => {
        const packMeta = packs.find(p => p.id === packId) || { id: packId, name: (packId === 'legacy' ? t('other_assets') : packId) };
        const categories = packGroups[packId];
        
        const allAssetsInPack = Object.values(categories).flat();
        
        // Ensure proper path is set for pack-based assets
        if (packId !== 'legacy') {
            allAssetsInPack.forEach(asset => {
                if (asset.views && asset.views.icon) {
                    const icon = asset.views.icon;
                    // Only prepend packs/ if not already present
                    if (!icon.startsWith('packs/')) {
                        asset.path = `packs/${packId}/${icon}`;
                    } else {
                        asset.path = icon;
                    }
                }
            });
        }

        const firstAsset = allAssetsInPack[0] || {};
        const iconPath = (firstAsset.views && firstAsset.views.icon) ? firstAsset.views.icon : (firstAsset.path || DEFAULTS.DEFAULT_ICON);
        
        const catContainer = document.createElement('div');
        catContainer.className = `asset-category shadow-sm`;
        
        const header = document.createElement('div');
        header.className = 'category-header';
        header.innerHTML = `<span>${packMeta.name || packMeta.id}</span><i class="fas fa-chevron-down"></i>`;
        header.onclick = () => {
            if (!document.getElementById('sidebar').classList.contains('collapsed')) {
                catContainer.classList.toggle('active');
            }
        };

        const collapsedIcon = document.createElement('div');
        collapsedIcon.className = 'category-collapsed-icon';
        collapsedIcon.title = packMeta.name || packMeta.id;
        collapsedIcon.innerHTML = `<img src="/static/assets/${iconPath}" width="28" height="28">`;
        collapsedIcon.onclick = (e) => {
            if (document.getElementById('sidebar').classList.contains('collapsed')) {
                e.stopPropagation();
                renderFlyout(catContainer, allAssetsInPack, packMeta);
            }
        };

        const content = document.createElement('div');
        content.className = 'category-content';
        
        // Render each Category within the Pack
        Object.keys(categories).sort().forEach(catName => {
            const assets = categories[catName];
            
            if (Object.keys(categories).length > 1 || catName !== 'Other') {
                const subHeader = document.createElement('div');
                subHeader.className = 'asset-group-label';
                subHeader.textContent = catName;
                content.appendChild(subHeader);
            }

            const itemGrid = document.createElement('div');
            itemGrid.className = 'asset-grid';
            assets.forEach(asset => {
                const compositeId = `${packId}|${asset.id}`;
                state.assetMap[compositeId] = asset;
                itemGrid.appendChild(createAssetElement(asset, compositeId));
            });
            content.appendChild(itemGrid);
        });

        catContainer.append(header, collapsedIcon, content);
        library.appendChild(catContainer);
    });
}

