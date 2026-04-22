import { state } from '../../state.js';
import { handleMenuAction } from './handlers.js';
import { generateMenuHTML, generateSelectionMenuHTML, showContextMenu, hideContextMenu } from './renderer.js';

let contextMenuElement = null;

/**
 * initContextMenu - Initializes the context menu module and event listeners
 */
export function initContextMenu() {
    if (contextMenuElement) return;

    // 1. Create and Setup Menu Element
    contextMenuElement = document.createElement('div');
    contextMenuElement.id = 'floating-context-menu';
    contextMenuElement.className = 'floating-menu';
    contextMenuElement.style.display = 'none';
    contextMenuElement.style.position = 'fixed';
    contextMenuElement.style.zIndex = '1000';
    document.body.appendChild(contextMenuElement);

    // 2. Event Listeners for menu items
    contextMenuElement.addEventListener('click', (e) => {
        const item = e.target.closest('[data-action]');
        if (!item) return;

        const action = item.getAttribute('data-action');
        const cellId = item.getAttribute('data-cell-id');
        
        if (action) {
            handleMenuAction(action, cellId);
        }
        hideContextMenu(contextMenuElement);
    });

    // Close menu on click outside
    document.addEventListener('click', (e) => {
        if (contextMenuElement && !contextMenuElement.contains(e.target)) {
            hideContextMenu(contextMenuElement);
        }
    });

    if (state.graph) {
        // Listen for right click on Graph Cells
        state.graph.on('cell:contextmenu', ({ e, cell }) => {
            e.preventDefault();
            if (state.isRightDragging) return;
            
            // Photoshop-style recursive selection if Ctrl is pressed
            if (e.ctrlKey) {
                const local = state.graph.clientToLocal(e.clientX, e.clientY);
                const models = state.graph.getCells().filter(cell => cell.getBBox().containsPoint(local));
                contextMenuElement.innerHTML = generateSelectionMenuHTML(models);
            } else {
                const selected = state.graph.getSelectedCells();
                const nodes = selected.filter(c => c.isNode());
                const isGroupSelected = nodes.length === 1 && nodes[0].getData()?.is_group;
                contextMenuElement.innerHTML = generateMenuHTML(nodes, isGroupSelected);
            }
            
            showContextMenu(contextMenuElement, e.clientX, e.clientY);
        });

        // Blank context menu (Handle Ctrl+RightClick here too)
        state.graph.on('blank:contextmenu', ({ e }) => {
            e.preventDefault();
            if (state.isRightDragging) return;
            
            if (e.ctrlKey) {
                const local = state.graph.clientToLocal(e.clientX, e.clientY);
                const models = state.graph.getCells().filter(cell => cell.getBBox().containsPoint(local));
                contextMenuElement.innerHTML = generateSelectionMenuHTML(models);
                showContextMenu(contextMenuElement, e.clientX, e.clientY);
            } else {
                hideContextMenu(contextMenuElement);
            }
        });
    }
}
