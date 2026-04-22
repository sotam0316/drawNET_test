import { state } from '../../state.js';
import { initDropHandling } from './drop.js';
import { initEdgeHandling } from './edges.js';
import { initSnapping } from './snapping.js';
import { initSpecialShortcuts } from './shortcuts.js';
import { logger } from '../../utils/logger.js';

/**
 * initInteractions - Entry point for all graph interactions
 */
export function initInteractions() {
    if (!state.graph) return;

    const container = state.graph.container;

    // 1. Initialize Sub-modules
    initDropHandling(container);
    initEdgeHandling();
    initSnapping();
    initSpecialShortcuts();

    logger.info("Graph interactions initialized via modules.");
}
