import { state } from '../../state.js';
import { t } from '../../i18n.js';

export function getMultiSelectTemplate(count) {
    const t_title = (state.i18n && state.i18n['multi_select_title']) || 'Multiple Selected';
    const t_align = (state.i18n && state.i18n['alignment']) || 'Alignment';
    const t_dist = (state.i18n && state.i18n['distribution']) || 'Distribution';
    
    return `
        <div class="multi-select-header">
            <i class="fas fa-layer-group"></i>
            <span>${count} ${t_title}</span>
        </div>
        
        <div class="prop-group">
            <label>${t_align}</label>
            <div class="alignment-grid">
                <button class="align-btn" data-action="alignTop" title="${t('align_top')} (Shift+1)"><i class="fas fa-align-left fa-rotate-90"></i></button>
                <button class="align-btn" data-action="alignBottom" title="${t('align_bottom')} (Shift+2)"><i class="fas fa-align-right fa-rotate-90"></i></button>
                <button class="align-btn" data-action="alignLeft" title="${t('align_left')} (Shift+3)"><i class="fas fa-align-left"></i></button>
                <button class="align-btn" data-action="alignRight" title="${t('align_right')} (Shift+4)"><i class="fas fa-align-right"></i></button>
                <button class="align-btn" data-action="alignMiddle" title="${t('align_middle')} (Shift+5)"><i class="fas fa-grip-lines"></i></button>
                <button class="align-btn" data-action="alignCenter" title="${t('align_center')} (Shift+6)"><i class="fas fa-grip-lines-vertical"></i></button>
            </div>
        </div>

        <div class="prop-group">
            <label>${t_dist}</label>
            <div class="alignment-grid">
                <button class="align-btn" data-action="distributeHorizontal" title="${t('distribute_horizontal')} (Shift+7)"><i class="fas fa-arrows-alt-h"></i></button>
                <button class="align-btn" data-action="distributeVertical" title="${t('distribute_vertical')} (Shift+8)"><i class="fas fa-arrows-alt-v"></i></button>
            </div>
        </div>

        <div class="toggle-group" style="margin-top: 16px; border-top: 1px solid var(--panel-border); padding-top: 16px;">
            <label class="toggle-switch danger">
                <span style="color: #ef4444; font-weight: 800;"><i class="fas fa-lock"></i> ${t('prop_locked')} (Bulk)</span>
                <input type="checkbox" id="prop-locked" class="prop-input">
                <div class="switch-slider"></div>
            </label>
        </div>

        <div style="margin-top: 20px; padding: 12px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; border: 1px dashed rgba(59, 130, 246, 0.3);">
            <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.4;">
                <i class="fas fa-lightbulb" style="color: #fbbf24; margin-right: 4px;"></i>
                Tip: Use <b>Shift + 1~8</b> to quickly <b>align and distribute</b> selected nodes without opening the sidebar.
            </p>
        </div>
    `;
}
