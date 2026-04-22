/**
 * graph/plugins.js - X6 Plugin initialization
 */
export function initGraphPlugins(graph) {
    if (window.X6PluginSelection) {
        graph.use(new window.X6PluginSelection.Selection({
            enabled: true,
            multiple: true,
            modifiers: 'shift',
            rubberband: true,
            showNodeSelectionBox: true,
            showEdgeSelectionBox: false,
            pointerEvents: 'none',
            filter: (cell) => {
                const data = cell.getData() || {};
                const cellLayerId = data.layerId || 'l1';
                return cellLayerId === state.activeLayerId;
            }
        }));
    }
    
    if (window.X6PluginSnapline) {
        graph.use(new window.X6PluginSnapline.Snapline({
            enabled: true,
            sharp: true,
        }));
    }
    
    /* Disable X6 Keyboard plugin to prevent interception of global hotkeys */
    /*
    if (window.X6PluginKeyboard) {
        graph.use(new window.X6PluginKeyboard.Keyboard({
            enabled: true,
            global: false,
        }));
    }
    */
    
    if (window.X6PluginClipboard) {
        graph.use(new window.X6PluginClipboard.Clipboard({
            enabled: true,
        }));
    }
    
    if (window.X6PluginHistory) {
        graph.use(new window.X6PluginHistory.History({
            enabled: true,
        }));
    }
    
    if (window.X6PluginTransform) {
        graph.use(new window.X6PluginTransform.Transform({
            resizing: { enabled: true, orthographic: false },
            rotating: { enabled: true },
            // 선(Edge) 제외 및 현재 활성 레이어만 허용
            filter: (cell) => {
                if (!cell.isNode()) return false;
                const data = cell.getData() || {};
                return (data.layerId || 'l1') === state.activeLayerId;
            },
        }));
    }
    
    if (window.X6PluginExport) {
        graph.use(new window.X6PluginExport.Export());
    }
}
