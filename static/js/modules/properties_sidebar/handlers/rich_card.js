import { state } from '../../state.js';
import { renderRichContent } from '../../graph/styles/utils.js';

export async function handleRichCardUpdate(cell, data) {
    const isNode = cell.isNode();
    if (!isNode) return;

    const updates = {
        headerText: document.getElementById('prop-header-text')?.value,
        headerColor: document.getElementById('prop-header-color')?.value,
        headerAlign: document.getElementById('prop-header-align')?.value || 'left',
        cardType: document.getElementById('prop-card-type')?.value,
        contentAlign: document.getElementById('prop-content-align')?.value || 'left',
        content: document.getElementById('prop-card-content')?.value,
        locked: !!document.getElementById('prop-locked')?.checked
    };

    // 1. Sync to X6 Attributes
    cell.attr('headerLabel/text', updates.headerText);
    cell.attr('header/fill', updates.headerColor);
    cell.attr('body/stroke', updates.headerColor);

    // Apply header alignment
    const anchor = updates.headerAlign === 'center' ? 'middle' : (updates.headerAlign === 'right' ? 'end' : 'start');
    const x = updates.headerAlign === 'center' ? 0.5 : (updates.headerAlign === 'right' ? '100%' : 10);
    const x2 = updates.headerAlign === 'right' ? -10 : 0;
    
    cell.attr('headerLabel/textAnchor', anchor);
    cell.attr('headerLabel/refX', x);
    cell.attr('headerLabel/refX2', x2);

    // 2. Render Content via HTML inside ForeignObject
    renderRichContent(cell, updates);

    // 3. Update Cell Data
    const currentData = cell.getData() || {};
    cell.setData({ ...currentData, ...updates });

    // 4. Handle Lock State
    cell.setProp('movable', !updates.locked);
    cell.setProp('deletable', !updates.locked);
    
    if (updates.locked) {
        cell.addTools([{ name: 'boundary', args: { attrs: { stroke: '#ef4444', 'stroke-dasharray': '5,5' } } }]);
    } else {
        cell.removeTools();
    }

    import('/static/js/modules/persistence.js').then(m => m.markDirty());
}
