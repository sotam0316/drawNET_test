/**
 * graph/styles.js - Main Entry for Graph Styling (Plugin-based)
 */
import { shapeRegistry } from './styles/registry.js';
import { registerNodes } from './styles/node_shapes.js';
import { getX6NodeConfig, getX6EdgeConfig } from './styles/mapping/index.js';
import { getLabelAttributes } from './styles/utils.js';

/**
 * registerCustomShapes - Initializes and registers all shape plugins
 */
export function registerCustomShapes() {
    // 1. Initialize Registry (Load plugins)
    registerNodes();

    // 2. Install to X6
    if (typeof X6 !== 'undefined') {
        shapeRegistry.install(X6);
    }
}

/**
 * Re-exporting functions for compatibility with other modules
 */
export {
    getX6NodeConfig,
    getX6EdgeConfig,
    getLabelAttributes,
    shapeRegistry
};

// Default Theme Update
export function updateGraphTheme() {}
