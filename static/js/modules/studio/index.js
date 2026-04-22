import { initIngester } from './ingester.js';
import { renderStudioUI } from './renderer.js';
import { buildPackage } from './actions.js';
import { logger } from '../utils/logger.js';

/**
 * Object Studio Main Entry Point
 */
document.addEventListener('DOMContentLoaded', () => {
    initStudio();
});

function initStudio() {
    logger.info("DrawNET Studio Initializing...");
    
    // Initialize file ingestion module
    initIngester();
    
    // Listen for state updates to trigger re-renders
    window.addEventListener('studio-sources-updated', renderStudioUI);
    window.addEventListener('studio-selection-updated', renderStudioUI);

    // Bind Global Actions
    const buildBtn = document.getElementById('build-btn');
    if (buildBtn) buildBtn.onclick = buildPackage;

    // Initial render
    renderStudioUI();
}
