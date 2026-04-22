import { t } from '../i18n.js';

/**
 * help_modal.js - Advanced Tabbed Markdown Guide.
 * Uses marked.js for high-fidelity rendering.
 */

export async function showHelpModal() {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    const existing = document.getElementById('help-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'help-modal';
    overlay.className = 'modal-overlay animate-fade-in active';
    
    overlay.innerHTML = `
        <div class="modal-content glass-panel animate-scale-up" style="max-width: 900px; width: 95%; padding: 0; overflow: hidden; display: flex; flex-direction: column; height: 85vh; max-height: 1000px;">
            <!-- Header -->
            <div class="modal-header" style="padding: 20px 24px; border-bottom: 1px solid var(--panel-border); background: var(--item-bg); display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 42px; height: 42px; background: linear-gradient(135deg, #3b82f6, #6366f1); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                        <span style="font-weight: 900; font-size: 18px;">dN</span>
                    </div>
                    <div>
                        <h2 style="font-size: 18px; font-weight: 900; color: var(--text-color); margin: 0;">${t('help_center') || 'drawNET Help Center'}</h2>
                        <p style="font-size: 11px; color: var(--sub-text); margin: 2px 0 0 0;">Engineering Systems Guide & Documentation</p>
                    </div>
                </div>
                <button class="modal-close" id="close-help" style="background: none; border: none; font-size: 24px; color: var(--sub-text); cursor: pointer; padding: 4px;">&times;</button>
            </div>

            <!-- Tab Navigation Bar -->
            <div id="help-tabs" style="display: flex; background: var(--item-bg); border-bottom: 1px solid var(--panel-border); padding: 0 12px; overflow-x: auto; gap: 4px; scrollbar-width: none;">
                <div style="padding: 15px 20px; color: var(--sub-text); font-size: 12px;">Initializing tabs...</div>
            </div>
            
            <!-- Content Area -->
            <div id="help-modal-body" class="modal-body" style="padding: 32px 48px; overflow-y: auto; flex: 1; scrollbar-width: thin; background: rgba(var(--bg-rgb), 0.2);">
                <div class="loading-state" style="text-align: center; padding: 60px; color: var(--sub-text);">
                    <i class="fas fa-circle-notch fa-spin"></i> Initializing Help System...
                </div>
            </div>
            
            <!-- Footer -->
            <div class="modal-footer" style="padding: 16px 24px; background: var(--item-bg); text-align: right; border-top: 1px solid var(--panel-border);">
                <button class="btn-primary" id="help-confirm" style="padding: 8px 32px; border-radius: 8px; background: var(--accent-color); color: white; border: none; cursor: pointer; font-weight: 700; transition: all 0.2s;">
                    ${t('close_btn') || 'Close Guide'}
                </button>
            </div>
        </div>
    `;

    modalContainer.appendChild(overlay);

    const tabsBar = overlay.querySelector('#help-tabs');
    const contentArea = overlay.querySelector('#help-modal-body');

    async function loadTabContent(fileId, tabElement) {
        // Update tab styles
        tabsBar.querySelectorAll('.help-tab').forEach(t => {
            t.style.borderBottom = '2px solid transparent';
            t.style.color = 'var(--sub-text)';
            t.style.background = 'transparent';
        });
        tabElement.style.borderBottom = '2px solid var(--accent-color)';
        tabElement.style.color = 'var(--accent-color)';
        tabElement.style.background = 'rgba(59, 130, 246, 0.05)';

        contentArea.innerHTML = `
            <div style="text-align: center; padding: 60px; color: var(--sub-text);">
                <i class="fas fa-circle-notch fa-spin"></i> Loading ${fileId}...
            </div>
        `;

        try {
            const response = await fetch(`/manual/${fileId}`);
            if (!response.ok) throw new Error('File not found');
            let markdown = await response.text();

            // Image Path Pre-processing: Fix relative paths for marked.js
            markdown = markdown.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => {
                const finalSrc = (src.startsWith('http') || src.startsWith('/')) ? src : `/manual/${src}`;
                return `![${alt}](${finalSrc})`;
            });

            // Use marked library
            const htmlContent = window.marked.parse(markdown);
            contentArea.innerHTML = `<div class="markdown-body animate-fade-in">${htmlContent}</div>`;
            contentArea.scrollTop = 0;
        } catch (err) {
            contentArea.innerHTML = `<div style="color: #ef4444; padding: 20px; text-align: center;">Error: ${err.message}</div>`;
        }
    }

    // Load Help File List
    try {
        const response = await fetch('/api/help/list');
        const helpFiles = await response.json();
        
        tabsBar.innerHTML = ''; // Clear "Initializing"
        
        helpFiles.forEach((file, index) => {
            const tab = document.createElement('div');
            tab.className = 'help-tab';
            tab.dataset.id = file.id;
            tab.innerText = file.title;
            tab.style.cssText = `
                padding: 14px 20px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 700;
                color: var(--sub-text);
                border-bottom: 2px solid transparent;
                white-space: nowrap;
                transition: all 0.2s;
            `;
            
            tab.addEventListener('mouseenter', () => {
                if (tab.style.borderBottomColor === 'transparent') {
                    tab.style.color = 'var(--text-color)';
                }
            });
            tab.addEventListener('mouseleave', () => {
                if (tab.style.borderBottomColor === 'transparent') {
                    tab.style.color = 'var(--sub-text)';
                }
            });

            tab.onclick = () => loadTabContent(file.id, tab);
            tabsBar.appendChild(tab);
            
            // Auto-load first tab
            if (index === 0) loadTabContent(file.id, tab);
        });

    } catch (err) {
        tabsBar.innerHTML = `<div style="padding: 15px; color: #ef4444;">Failed to load help list.</div>`;
    }

    const closeModal = () => {
        overlay.classList.replace('animate-fade-in', 'animate-fade-out');
        overlay.querySelector('.modal-content').classList.replace('animate-scale-up', 'animate-scale-down');
        setTimeout(() => overlay.remove(), 200);
    };

    overlay.querySelector('#close-help').onclick = closeModal;
    overlay.querySelector('#help-confirm').onclick = closeModal;
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
}
