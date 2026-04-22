import { state } from '../state.js';
import { t } from '../i18n.js';

/**
 * renderPackSelector - Show a modal to enable/disable asset packages
 */
export function renderPackSelector(packs) {
    let modal = document.getElementById('pack-selector-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pack-selector-modal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }

    const selectedIds = state.selectedPackIds;

    modal.innerHTML = `
        <div class="modal-content" style="width: 400px; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header">
                <h3>${t('manage_packages') || 'Manage Packages'}</h3>
                <i class="fas fa-times close-modal"></i>
            </div>
            <div class="modal-body" style="padding: 15px;">
                <p style="font-size: 12px; color: #64748b; margin-bottom: 15px;">Select which asset packages to load in your sidebar.</p>
                <div class="pack-list">
                    ${packs.map(p => `
                        <div class="pack-item" style="display: flex; align-items: center; justify-content: space-between; padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-box" style="color: #38bdf8; font-size: 14px;"></i>
                                <span style="font-size: 13px; font-weight: 600;">${p.name || p.id}</span>
                            </div>
                            <input type="checkbox" data-id="${p.id}" ${selectedIds.includes(p.id) ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="modal-footer" style="padding: 15px; border-top: 1px solid rgba(255,255,255,0.05); text-align: right;">
                <button class="btn-primary apply-packs" style="background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; cursor: pointer;">Apply & Refresh</button>
            </div>
        </div>
    `;

    modal.classList.add('active');

    // Close handlers
    modal.querySelector('.close-modal').onclick = () => modal.classList.remove('active');
    modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('active'); };

    // Apply handler
    modal.querySelector('.apply-packs').onclick = () => {
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
        const newSelectedIds = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.dataset.id);
        
        state.selectedPackIds = newSelectedIds;
        localStorage.setItem('selectedPackIds', JSON.stringify(newSelectedIds));
        
        // This is a global refresh to re-init everything with new filters
        // For a more seamless experience, we could re-call initAssets()
        window.location.reload(); 
    };
}
