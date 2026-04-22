import { state } from '../state.js';
import { t } from '../i18n.js';
import { logger } from '../utils/logger.js';

/**
 * handleNewProject - Clears the current graph and resets project meta
 */
export function handleNewProject() {
    if (!state.graph) return;
    
    if (confirm(t('confirm_new_project') || "Are you sure you want to start a new project?")) {
        state.graph.clearCells();
        
        // Reset Project Metadata in UI
        const projectTitle = document.getElementById('project-title');
        if (projectTitle) projectTitle.innerText = "Untitled_Project";
        
        // Reset state
        state.layers = [
            { id: 'l1', name: 'Main Layer', visible: true, locked: false, color: '#3b82f6' }
        ];
        state.activeLayerId = 'l1';
        state.selectionOrder = [];
        
        // Clear Persistence (Optional: could trigger immediate save of empty state)
        import('../persistence.js').then(m => {
            if (m.clearLastState) m.clearLastState();
            m.markDirty();
        });

        logger.high("New project created. Canvas cleared.");
    }
}

export function initSystemMenu() {
    const systemBtn = document.getElementById('system-menu-btn');
    const systemFlyout = document.getElementById('system-flyout');
    const studioBtn = document.getElementById('studio-btn');
    const newProjectBtn = document.getElementById('new-project');

    if (systemBtn && systemFlyout) {
        // Toggle Flyout
        systemBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = systemFlyout.style.display === 'flex';
            systemFlyout.style.display = isVisible ? 'none' : 'flex';
            systemBtn.classList.toggle('active', !isVisible);
        });

        // "New Project" Handler
        if (newProjectBtn) {
            newProjectBtn.addEventListener('click', () => {
                handleNewProject();
                systemFlyout.style.display = 'none';
                systemBtn.classList.remove('active');
            });
        }

        // "Object Studio" Handler
        if (studioBtn) {
            studioBtn.addEventListener('click', () => {
                window.open('/studio', '_blank');
                systemFlyout.style.display = 'none';
                systemBtn.classList.remove('active');
            });
        }

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!systemFlyout.contains(e.target) && e.target !== systemBtn) {
                systemFlyout.style.display = 'none';
                systemBtn.classList.remove('active');
            }
        });
    }
}

// initUndoRedo is removed from UI as requested (Hotkeys still work via actionHandlers)
