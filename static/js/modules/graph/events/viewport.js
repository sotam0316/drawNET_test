import { state } from '../../state.js';

let isRightDragging = false;
let startX = 0;
let startY = 0;
const threshold = 5;

/**
 * Handle mousedown on the graph to initialize right-click panning.
 */
const handleGraphMouseDown = ({ e }) => {
    if (e.button === 2) { // Right Click
        isRightDragging = false;
        startX = e.clientX;
        startY = e.clientY;
        state.isRightDragging = false;
    }
};

/**
 * Global event handler for mousemove to support panning.
 * Registered only once on document level.
 */
const onMouseMove = (e) => {
    if (e.buttons === 2 && state.graph) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        // Detect dragging start (beyond threshold)
        if (!isRightDragging && (Math.abs(dx) > threshold || Math.abs(dy) > threshold)) {
            isRightDragging = true;
            state.isRightDragging = true;
            // Sync start positions to current mouse position to avoid the initial jump
            startX = e.clientX;
            startY = e.clientY;
            return;
        }

        if (isRightDragging) {
            state.graph.translateBy(dx, dy);
            startX = e.clientX;
            startY = e.clientY;
        }
    }
};

/**
 * Global event handler for mouseup to finish panning.
 * Registered only once on document level.
 */
const onMouseUp = () => {
    if (isRightDragging) {
        // Reset after a short delay to allow contextmenu event to check the flag
        setTimeout(() => {
            state.isRightDragging = false;
            isRightDragging = false;
        }, 100);
    }
};

/**
 * Initializes viewport-related events for the current graph instance.
 * Should be called whenever a new graph is created.
 */
export function initViewportEvents() {
    if (!state.graph) return;

    // Attach to the specific graph instance, ensuring no duplicates
    state.graph.off('blank:mousedown', handleGraphMouseDown);
    state.graph.on('blank:mousedown', handleGraphMouseDown);
    state.graph.off('cell:mousedown', handleGraphMouseDown);
    state.graph.on('cell:mousedown', handleGraphMouseDown);

    // Register document-level listeners only once per page session
    if (!window._drawNetViewportEventsInitialized) {
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        window._drawNetViewportEventsInitialized = true;
    }
}
