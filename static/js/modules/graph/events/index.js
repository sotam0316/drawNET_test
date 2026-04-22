import { initSystemEvents } from './system.js';
import { initViewportEvents } from './viewport.js';
import { initSelectionEvents } from './selection.js';
import { initNodeEvents } from './nodes.js';
import { initRoutingEvents } from './routing.js';

export { updateGridBackground } from './system.js';

/**
 * initGraphEvents - Orchestrates the initialization of all specialized event modules.
 */
export function initGraphEvents() {
    initSystemEvents();
    initViewportEvents();
    initSelectionEvents();
    initNodeEvents();
    initRoutingEvents();
}
