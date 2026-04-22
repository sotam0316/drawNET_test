import { state } from '../state.js';
import { actionHandlers } from './handlers.js';
import { logger } from '../utils/logger.js';

/**
 * initHotkeys - Initializes the keyboard shortcut system.
 */
export async function initHotkeys() {
    if (window.__drawNET_Hotkeys_Initialized) {
        logger.high("Hotkeys already initialized. Skipping.");
        return;
    }
    window.__drawNET_Hotkeys_Initialized = true;

    try {
        const response = await fetch('/static/hotkeys.json');
        const config = await response.json();
        const hotkeys = config.hotkeys;

        window.addEventListener('keydown', (e) => {
            if (e.repeat) return;

            const editableElements = ['TEXTAREA', 'INPUT'];
            const isTyping = editableElements.includes(e.target.tagName) && e.target.id !== 'dark-mode-toggle';
            
            const keyPressed = e.key.toLowerCase();
            const keyCode = e.code;

            for (const hk of hotkeys) {
                // Match by physical code (preferred) or key string
                const matchCode = hk.code && hk.code === keyCode;
                const matchKey = hk.key && hk.key.toLowerCase() === keyPressed;
                
                if (!(matchCode || matchKey)) continue;

                // Match modifiers strictly
                const matchCtrl = !!hk.ctrl === e.ctrlKey;
                const matchAlt = !!hk.alt === e.altKey;
                const matchShift = !!hk.shift === e.shiftKey;

                if (matchCtrl && matchAlt && matchShift) {
                    const allowWhileTyping = hk.alwaysEnabled === true;
                    if (isTyping && !allowWhileTyping) break;

                    logger.info(`Hotkey Match - ${hk.action} (${hk.key})`);
                    
                    if (allowWhileTyping || !isTyping) {
                        e.preventDefault();
                    }
                    const handler = actionHandlers[hk.action];
                    if (handler) {
                        handler();
                    }
                    return;
                }
            }
        });

        logger.high("Hotkeys module initialized (X6).");
    } catch (err) {
        logger.critical("Failed to load hotkeys configuration (X6).", err);
    }

    // Ctrl + Wheel: Zoom handling
    window.addEventListener('wheel', (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            if (!state.graph) return;
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            state.graph.zoom(delta, { center: { x: e.clientX, y: e.clientY } });
        }
    }, { passive: false });

    // Global Key State Tracking (for Ctrl+Drag copy)
    // Extra guard: Check e.ctrlKey/metaKey on mouse events to auto-heal mismatched state
    const syncCtrlState = (e) => {
        const isModifier = e.ctrlKey || e.metaKey;
        if (state.isCtrlPressed !== isModifier) {
            state.isCtrlPressed = isModifier;
        }
    };
    window.addEventListener('mousedown', syncCtrlState, true);
    window.addEventListener('mousemove', syncCtrlState, true);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Control' || e.key === 'Meta') state.isCtrlPressed = true;
    }, true);
    window.addEventListener('keyup', (e) => {
        if (e.key === 'Control' || e.key === 'Meta') state.isCtrlPressed = false;
    }, true);
    window.addEventListener('blur', () => {
        state.isCtrlPressed = false; // Reset on window blur to avoid stuck state
    });
}
