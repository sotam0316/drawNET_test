import { state } from '../../state.js';

export const uiHandlers = {
    toggleInventory: () => {
        import('../../graph/analysis.js').then(m => m.toggleInventory());
    },
    toggleProperties: () => {
        import('../../properties_sidebar/index.js').then(m => m.toggleSidebar());
    },
    toggleLayers: () => {
        import('../../ui/layer_panel.js').then(m => m.toggleLayerPanel());
    },
    editLabel: () => {
        if (!state.graph) return;
        const selected = state.graph.getSelectedCells();
        if (selected.length === 0) return;

        import('../../properties_sidebar/index.js').then(m => {
            m.toggleSidebar(true);
            setTimeout(() => {
                const labelInput = document.getElementById('prop-label');
                if (labelInput) {
                    labelInput.focus();
                    labelInput.select();
                }
            }, 50);
        });
    },
    cancel: () => {
        if (!state.graph) return;
        state.graph.cleanSelection();
        import('../../properties_sidebar/index.js').then(m => m.toggleSidebar(false));
    }
};
