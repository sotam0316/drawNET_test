import { state } from '../../state.js';
import { logger } from '../../utils/logger.js';

export async function handleNodeUpdate(cell, data) {
    const isNode = cell.isNode();
    if (!isNode) return;

    const updates = {
        // Priority: DOM Element > Provided Data (Format Painter) > Default/Old Data
        type: document.getElementById('prop-type')?.value || data?.type,
        label: document.getElementById('prop-label') ? document.getElementById('prop-label').value : data?.label,
        is_group: document.getElementById('prop-is-group') ? !!document.getElementById('prop-is-group').checked : !!data?.is_group,
        padding: document.getElementById('prop-padding') ? parseInt(document.getElementById('prop-padding').value) : (data?.padding || undefined),
        slots: document.getElementById('prop-slots') ? parseInt(document.getElementById('prop-slots').value) : (data?.slots || undefined),
        color: document.getElementById('prop-label-color')?.value || data?.color,
        fill: document.getElementById('prop-fill-color')?.value || data?.fill,
        border: document.getElementById('prop-border-color')?.value || data?.border,
        label_pos: document.getElementById('prop-label-pos')?.value || data?.label_pos,
        // PM Standard Attributes
        vendor: document.getElementById('prop-vendor') ? document.getElementById('prop-vendor').value : data?.vendor,
        model: document.getElementById('prop-model') ? document.getElementById('prop-model').value : data?.model,
        ip: document.getElementById('prop-ip') ? document.getElementById('prop-ip').value : data?.ip,
        status: document.getElementById('prop-status')?.value || data?.status,
        project: document.getElementById('prop-project') ? document.getElementById('prop-project').value : data?.project,
        env: document.getElementById('prop-env')?.value || data?.env,
        asset_tag: document.getElementById('prop-asset-tag') ? document.getElementById('prop-asset-tag').value : data?.asset_tag,
        tags: document.getElementById('prop-tags') ? document.getElementById('prop-tags').value.split(',').map(t => t.trim()).filter(t => t) : (data?.tags || []),
        description: document.getElementById('prop-description') ? document.getElementById('prop-description').value : data?.description,
        locked: document.getElementById('prop-locked') ? !!document.getElementById('prop-locked').checked : !!data?.locked
    };
    const pureLabel = updates.label || '';
    cell.attr('label/text', pureLabel);
    
    if (updates.color) cell.attr('label/fill', updates.color);
    
    // Apply Fill and Border to body (for primitives and groups)
    if (updates.fill) {
        cell.attr('body/fill', updates.fill);
        if (updates.is_group) updates.background = updates.fill; // Sync for group logic
    }
    if (updates.border) {
        cell.attr('body/stroke', updates.border);
        if (updates.is_group) updates['border-color'] = updates.border; // Sync for group logic
    }
    
    if (updates.label_pos) {
        const { getLabelAttributes } = await import('/static/js/modules/graph/styles.js');
        const labelAttrs = getLabelAttributes(updates.label_pos, updates.type, updates.is_group);
        Object.keys(labelAttrs).forEach(key => {
            cell.attr(`label/${key}`, labelAttrs[key]);
        });
    }
    
    // Handle group membership via selection (parentId is now a UUID)
    const parentId = document.getElementById('prop-parent')?.value;
    const currentParent = cell.getParent();
    
    // Case 1: Parent added or changed
    if (parentId && (!currentParent || currentParent.id !== parentId)) {
        const parent = state.graph.getCellById(parentId);
        if (parent) {
            parent.addChild(cell);
            updates.parent = parentId;
            saveUpdates();
            return;
        }
    } 
    
    // Case 2: Parent removed (Ungrouping)
    if (!parentId && currentParent) {
        // 부모 해제 시 경고 설정 확인
        const triggerUngroup = async () => {
            const { getSettings } = await import('../../settings/store.js');
            const settings = getSettings();
            
            if (settings.confirmUngroup !== false) {
                const { showConfirmModal } = await import('../../ui/utils.js');
                const { t } = await import('../../i18n.js');
                
                showConfirmModal({
                    title: t('confirm_ungroup_title') || 'Disconnect from Group',
                    message: t('confirm_ungroup_msg') || 'Are you sure you want to remove this object from its parent group?',
                    showDontAskAgain: true,
                    checkboxKey: 'confirmUngroup',
                    onConfirm: () => {
                        currentParent.removeChild(cell);
                        updates.parent = null;
                        saveUpdates();
                    },
                    onCancel: () => {
                        import('../index.js').then(m => m.renderProperties());
                    }
                });
            } else {
                currentParent.removeChild(cell);
                updates.parent = null;
                saveUpdates();
            }
        };
        triggerUngroup();
        return;
    }
    
    // Case 3: Parent unchanged or no parent (Regular update)
    saveUpdates();

    function saveUpdates() {
        // 최종 데이터 병합 및 저장 (id, layerId 등 기존 메타데이터 보존)
        const currentData = cell.getData() || {};
        const finalData = { ...currentData, ...updates };
        
        cell.setData(finalData);

        // [Instance #2245] Recursive Propagation: 
        // If this is a group, "poke" all descendants to trigger their change events,
        // ensuring the sidebar for any selected child reflects the new parent name.
        if (updates.is_group) {
            const descendants = cell.getDescendants();
            descendants.forEach(child => {
                const childData = child.getData() || {};
                const syncTime = Date.now();
                // We add a timestamp to child data to force X6 to fire 'change:data'
                child.setData({ ...childData, _parent_updated: syncTime }, { silent: false });
            });
        }
        // Apply Locking Constraints
        cell.setProp('movable', !updates.locked);
        cell.setProp('deletable', !updates.locked);
        cell.setProp('rotatable', !updates.locked);
        if (updates.locked) {
            cell.addTools([{ name: 'boundary', args: { attrs: { stroke: '#ef4444', 'stroke-dasharray': '5,5' } } }]);
        } else {
            cell.removeTools();
        }
    }
}
