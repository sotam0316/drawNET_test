/**
 * graph.js - Main Entry for AntV X6 Graph Module
 * Modularized version splitting styles, events, interactions, and IO.
 */
import { state } from './state.js';
import { registerCustomShapes } from './graph/styles.js';
import { initGraphEvents } from './graph/events/index.js';
import { initInteractions } from './graph/interactions/index.js';
import { initGraphIO } from './graph/io/index.js';
import { initPropertiesSidebar } from './properties_sidebar/index.js';
import { initContextMenu } from './ui/context_menu/index.js';
import { getGraphConfig } from './graph/config.js';
import { initGraphPlugins } from './graph/plugins.js';
import { logger } from './utils/logger.js';

export function initGraph() {
    const container = document.getElementById('graph-container');
    if (!container) return;

    // 1. Register Custom Shapes
    registerCustomShapes();

    // 2. Initialize AntV X6 Graph Instance
    state.graph = new X6.Graph(getGraphConfig(container));
    
    // 3. Enable Plugins
    initGraphPlugins(state.graph);

    // 4. Initialize Sub-modules
    initGraphEvents();
    initInteractions();

    logger.high("AntV X6 Graph initialized with modules.");
}
