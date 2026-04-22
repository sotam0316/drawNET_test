import { initAssets } from './modules/assets/index.js';
import { initGraph } from './modules/graph.js';
import { initUIToggles } from './modules/ui.js';
import { initSettings } from './modules/settings/ui.js';
import { applySavedSettings, applySavedTheme } from './modules/settings/store.js';
import { initHotkeys } from './modules/hotkeys/index.js';
import { initGlobalSearch } from './modules/graph/search.js';
import { initInventory } from './modules/graph/analysis.js';
import { initLayerPanel } from './modules/ui/layer_panel.js';
import { applyLayerFilters } from './modules/graph/layers.js';
import { initI18n } from './modules/i18n.js';
import { initPropertiesSidebar } from './modules/properties_sidebar/index.js';
import { initPersistence } from './modules/persistence.js';
import { initGraphIO } from './modules/graph/io/index.js';
import { initContextMenu } from './modules/ui/context_menu/index.js';
import { logger } from './modules/utils/logger.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 0. Initialize i18n (Language first)
    await initI18n();

    // 1. Apply Saved Theme immediately (prevent flash)
    applySavedTheme();

    // 2. Load Assets & Sidebar
    await initAssets();
    
    // 2.5 Load Global Config
    try {
        const configRes = await fetch('/api/config');
        if (configRes.ok) {
            const configData = await configRes.json();
            const { state } = await import('./modules/state.js');
            state.appConfig = configData;
            logger.info("Global configuration loaded from server.");
        }
    } catch (err) {
        logger.high("Failed to load global config, using defaults.");
    }

    // 3. Initialize X6 Graph
    initGraph();
    
    // 4. Initialize UI Toggles
    initUIToggles();

    // 5. Initialize Settings Modal Logic
    initSettings();
    
    // 6. Apply Saved Visual Settings (Grid, Size)
    applySavedSettings();
    
    // 7. Initialize Keyboard Hotkeys
    initHotkeys();

    // 8. Initialize UI Components & Persistence
    initPropertiesSidebar();
    initContextMenu();
    initGraphIO();
    initGlobalSearch();
    initInventory();
    initLayerPanel();
    applyLayerFilters();
    initPersistence();

    // Help Button
    const helpBtn = document.getElementById('help-btn');
    if (helpBtn) {
        helpBtn.addEventListener('click', async () => {
            const { showHelpModal } = await import('./modules/ui/help_modal.js');
            showHelpModal();
        });
    }

    logger.high("drawNET Premium initialized successfully.");
});
