import { t } from '../../i18n.js';

/**
 * Generates the HTML for edge properties.
 */
export function getEdgeTemplate(data) {
    return `
        <div class="prop-group horizontal">
            <label>${t('prop_id')}</label>
            <input type="text" class="prop-input" value="${data.id}" readonly style="opacity: 0.5; font-size: 11px;">
        </div>
        <div class="prop-group">
            <label>${t('prop_label')}</label>
            <input type="text" class="prop-input" id="prop-label" value="${data.label || ''}">
        </div>
        <div class="prop-group">
            <label>${t('prop_tags')}</label>
            <input type="text" class="prop-input" id="prop-tags" value="${(data.tags || []).join(', ')}">
        </div>
        
        <div class="prop-row">
            <div class="prop-group">
                <label>${t('prop_color')}</label>
                <input type="color" class="prop-input" id="prop-color" value="${data.color || '#94a3b8'}" style="height: 34px; padding: 2px;">
            </div>
            <div class="prop-group">
                <label>${t('prop_style')}</label>
                <select class="prop-input" id="prop-style">
                    <option value="solid" ${data.style === 'solid' ? 'selected' : ''}>${t('solid')}</option>
                    <option value="dashed" ${data.style === 'dashed' ? 'selected' : ''}>${t('dashed')}</option>
                    <option value="dotted" ${data.style === 'dotted' ? 'selected' : ''}>${t('dotted')}</option>
                    <option value="double" ${data.style === 'double' ? 'selected' : ''}>${t('double')}</option>
                </select>
            </div>
        </div>

        <div class="prop-group horizontal">
            <label>${t('prop_width') || 'Width'}</label>
            <input type="number" class="prop-input" id="prop-width" value="${data.width || 2}" min="1" max="10" step="0.5">
        </div>

        <div class="prop-group">
            <label>${t('prop_routing')}</label>
            <select class="prop-input" id="prop-routing">
                <option value="manhattan" ${data.routing === 'manhattan' || !data.routing ? 'selected' : ''}>${t('manhattan')}</option>
                <option value="u-shape" ${data.routing === 'u-shape' ? 'selected' : ''}>${t('u_shape')}</option>
                <option value="orthogonal" ${data.routing === 'orthogonal' ? 'selected' : ''}>${t('orthogonal')}</option>
                <option value="straight" ${data.routing === 'straight' ? 'selected' : ''}>${t('straight')}</option>
                <option value="metro" ${data.routing === 'metro' ? 'selected' : ''}>${t('metro')}</option>
            </select>
        </div>

        <div class="prop-row">
            <div class="prop-group">
                <label style="color: #10b981; font-weight: bold;">● START</label>
                <select class="prop-input" id="prop-src-anchor" style="border-left: 3px solid #10b981;">
                    <option value="orth" ${data.source_anchor === 'orth' || !data.source_anchor ? 'selected' : ''}>${t('orth')}</option>
                    <option value="center" ${data.source_anchor === 'center' ? 'selected' : ''}>${t('center')}</option>
                    <option value="left" ${data.source_anchor === 'left' ? 'selected' : ''}>${t('left')}</option>
                    <option value="right" ${data.source_anchor === 'right' ? 'selected' : ''}>${t('right')}</option>
                    <option value="top" ${data.source_anchor === 'top' ? 'selected' : ''}>${t('top')}</option>
                    <option value="bottom" ${data.source_anchor === 'bottom' ? 'selected' : ''}>${t('bottom')}</option>
                </select>
            </div>
            <div class="prop-group">
                <label style="color: #ef4444; font-weight: bold;">● TARGET</label>
                <select class="prop-input" id="prop-dst-anchor" style="border-left: 3px solid #ef4444;">
                    <option value="orth" ${data.target_anchor === 'orth' || !data.target_anchor ? 'selected' : ''}>${t('orth')}</option>
                    <option value="center" ${data.target_anchor === 'center' ? 'selected' : ''}>${t('center')}</option>
                    <option value="left" ${data.target_anchor === 'left' ? 'selected' : ''}>${t('left')}</option>
                    <option value="right" ${data.target_anchor === 'right' ? 'selected' : ''}>${t('right')}</option>
                    <option value="top" ${data.target_anchor === 'top' ? 'selected' : ''}>${t('top')}</option>
                    <option value="bottom" ${data.target_anchor === 'bottom' ? 'selected' : ''}>${t('bottom')}</option>
                </select>
            </div>
        </div>

        <div class="prop-group horizontal">
            <label>${t('prop_direction')}</label>
            <select class="prop-input" id="prop-direction">
                <option value="forward" ${data.direction === 'forward' ? 'selected' : ''}>${t('forward')}</option>
                <option value="backward" ${data.direction === 'backward' ? 'selected' : ''}>${t('backward')}</option>
                <option value="both" ${data.direction === 'both' ? 'selected' : ''}>${t('both')}</option>
                <option value="none" ${data.direction === 'none' || !data.direction ? 'selected' : ''}>${t('none')}</option>
            </select>
        </div>

        <div class="prop-row">
            <div class="toggle-group" style="margin-bottom: 0; flex: 1;">
                <label class="toggle-switch" style="padding: 10px;">
                    <span style="font-size: 11px;">TUNNEL</span>
                    <input type="checkbox" id="prop-is-tunnel" class="prop-input" ${data.is_tunnel ? 'checked' : ''}>
                    <div class="switch-slider"></div>
                </label>
            </div>
            <div class="toggle-group" style="margin-bottom: 0; flex: 1;">
                <label class="toggle-switch danger" style="padding: 10px;">
                    <span style="color: #ef4444; font-size: 11px;"><i class="fas fa-lock"></i> LOCK</span>
                    <input type="checkbox" id="prop-locked" class="prop-input" ${data.locked ? 'checked' : ''}>
                    <div class="switch-slider"></div>
                </label>
            </div>
        </div>

        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--panel-border);">
            <div class="prop-group horizontal">
                <label>${t('prop_routing_offset')}</label>
                <input type="number" class="prop-input" id="prop-routing-offset" value="${data.routing_offset || 20}" min="0" max="200" step="5">
            </div>
            <div class="prop-group">
                <label>${t('prop_description')}</label>
                <textarea class="prop-input" id="prop-description" rows="2" style="resize: vertical; min-height: 48px; font-size: 12px;">${data.description || ''}</textarea>
            </div>
        </div>
    `;
}
