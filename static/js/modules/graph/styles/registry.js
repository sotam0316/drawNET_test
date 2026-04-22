import { logger } from '../../utils/logger.js';
/**
 * graph/styles/registry.js - Central registry for custom X6 shapes (Plugin System)
 */

class ShapeRegistry {
    constructor() {
        this.shapes = new Map();
    }

    /**
     * Registers a new shape plugin
     * @param {string} type - Node type name (e.g., 'browser', 'triangle')
     * @param {Object} options - Shape configuration
     * @param {string} options.shape - The X6 shape name to register (e.g., 'drawnet-browser')
     * @param {Object} options.definition - The X6 registration object (inherit, markup, attrs, etc.)
     * @param {Object} options.mapping - Custom mapping logic or attribute overrides
     * @param {string} options.icon - Default FontAwesome icon (if applicable)
     */
    register(type, options) {
        this.shapes.set(type.toLowerCase(), {
            type,
            ...options
        });
    }

    get(type) {
        return this.shapes.get(type.toLowerCase());
    }

    getAll() {
        return Array.from(this.shapes.values());
    }

    /**
     * Internal X6 registration helper
     */
    install(X6) {
        if (!X6) return;
        const registeredShapes = new Set();
        this.shapes.forEach((plugin) => {
            if (plugin.shape && plugin.definition && !registeredShapes.has(plugin.shape)) {
                try {
                    X6.Graph.registerNode(plugin.shape, plugin.definition);
                    registeredShapes.add(plugin.shape);
                } catch (e) {
                    logger.high(`Shape [${plugin.shape}] registration failed:`, e);
                }
            }
        });
    }
}

export const shapeRegistry = new ShapeRegistry();
