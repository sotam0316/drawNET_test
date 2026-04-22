import { initSidebar } from './ui/sidebar.js';
import { logger } from './utils/logger.js';
import { initSystemMenu } from './ui/system_menu.js';
import { initGraphIO } from './graph/io/index.js';

export function initUIToggles() {
    initSidebar();
    initSystemMenu();
    
    logger.info("UI modules initialized.");
}
