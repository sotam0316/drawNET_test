import { DEFAULTS } from './constants.js';

// Shared state across modules
export const state = {
    assetMap: {},
    assetsData: [],
    graph: null,
    // Grid & Interaction State
    gridSpacing: DEFAULTS.GRID_SPACING,
    gridStyle: 'none', // 'none', 'solid', or 'dashed'
    isSnapEnabled: false,
    canvasSize: { width: '100%', height: '100%' },
    // Attribute Copy/Paste Clipboard
    clipboardNodeData: null,
    clipboardNodeAttrs: null,
    clipboardEdgeData: null,
    // Layer Management
    layers: [
        { id: 'l1', name: 'Main Layer', visible: true, locked: false, color: '#3b82f6', type: 'standard' }
    ],
    activeLayerId: 'l1',
    inactiveLayerOpacity: 0.3,
    // Interaction State
    isRightDragging: false,
    isCtrlPressed: false, // Global tracking for Ctrl+Drag copy
    // Selection Order Tracking
    selectionOrder: [],
    // Asset Management
    selectedPackIds: JSON.parse(localStorage.getItem('selectedPackIds') || '[]'),
    language: localStorage.getItem('drawNET_lang') || (navigator.language.startsWith('ko') ? 'ko' : 'en'),
    // Global Application Config (from config.json)
    appConfig: {}
};

// Expose to window for browser debugging
if (typeof window !== 'undefined') {
    window.state = state;
}

// For browser console debugging
window.state = state;
