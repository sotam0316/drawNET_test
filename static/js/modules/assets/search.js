import { state } from '../state.js';

/**
 * initSearch - Initializes the asset search input listener
 */
export function initSearch() {
    const searchInput = document.getElementById('asset-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const categories = document.querySelectorAll('.asset-category');
        
        categories.forEach(cat => {
            const items = cat.querySelectorAll('.asset-item');
            let hasVisibleItem = false;
            
            items.forEach(item => {
                const assetId = item.dataset.assetId;
                const asset = state.assetMap[assetId];
                if (!asset) return;

                const matches = (asset.type && asset.type.toLowerCase().includes(query)) || 
                               (asset.label && asset.label.toLowerCase().includes(query)) || 
                               (asset.vendor && asset.vendor.toLowerCase().includes(query));
                
                item.style.display = matches ? 'flex' : 'none';
                if (matches) hasVisibleItem = true;
            });

            cat.style.display = (hasVisibleItem || query === '') ? 'block' : 'none';
            if (query !== '' && hasVisibleItem) cat.classList.add('active');
        });
    });
}
