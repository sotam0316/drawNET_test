import { t } from '../../i18n.js';

/**
 * Generates the HTML for node properties.
 */
export function getNodeTemplate(data, allGroups) {
    return `
        <div class="prop-group horizontal">
            <label>${t('prop_id')}</label>
            <input type="text" class="prop-input" value="${data.id}" readonly style="opacity: 0.5; font-size: 11px;">
        </div>
        <div class="prop-group">
            <label>${t('prop_label')}</label>
            <input type="text" class="prop-input" id="prop-label" value="${data.label || ''}">
        </div>
        <div class="prop-row">
            <div class="prop-group">
                <label>${t('prop_type')}</label>
                <input type="text" class="prop-input" id="prop-type" value="${data.type || ''}">
            </div>
            <div class="prop-group">
                <label>${t('prop_parent')}</label>
                <select class="prop-input" id="prop-parent">
                    <option value="">${t('none')}</option>
                    ${allGroups.map(g => {
                        const gData = g.getData() || {};
                        const label = gData.label || g.id;
                        // Debug log to confirm what the template sees
                        // console.log(`[Template:Node] Parent Option: ID=${g.id}, Label=${label}`); 
                        return `<option value="${g.id}" ${data.parent === g.id ? 'selected' : ''}>${label}</option>`;
                    }).join('')}
                </select>
            </div>
        </div>
        <div class="prop-row" style="margin-bottom: 8px;">
            <div class="toggle-group" style="margin-bottom: 0; flex: 1;">
                <label class="toggle-switch" style="padding: 10px;">
                    <span style="font-size: 11px;">GROUP</span>
                    <input type="checkbox" id="prop-is-group" class="prop-input" ${data.is_group ? 'checked' : ''}>
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
        <div class="prop-row">
            <div class="prop-group">
                <label>${t('prop_label_color')}</label>
                <input type="color" class="prop-input" id="prop-label-color" value="${data.color || data['text-color'] || '#64748b'}" style="height: 34px; padding: 2px;">
            </div>
            <div class="prop-group">
                <label>${t('prop_label_pos')}</label>
                <select class="prop-input" id="prop-label-pos">
                    ${(() => {
                        const nodeType = (data.type || '').toLowerCase();
                        const defaultPos = data.is_group ? 'top' : (['rect', 'circle', 'rounded-rect', 'text-box', 'label'].includes(nodeType) ? 'center' : 'bottom');
                        const currentPos = data.label_pos || defaultPos;
                        return `
                            <option value="top" ${currentPos === 'top' ? 'selected' : ''}>${t('top')}</option>
                            <option value="bottom" ${currentPos === 'bottom' ? 'selected' : ''}>${t('bottom')}</option>
                            <option value="left" ${currentPos === 'left' ? 'selected' : ''}>${t('left')}</option>
                            <option value="right" ${currentPos === 'right' ? 'selected' : ''}>${t('right')}</option>
                            <option value="center" ${currentPos === 'center' ? 'selected' : ''}>${t('center')}</option>
                        `;
                    })()}
                </select>
            </div>
        </div>

        ${(() => {
            const nodeType = (data.type || '').toLowerCase();
            const primitives = ['rect', 'circle', 'rounded-rect', 'text-box', 'label', 'triangle', 'diamond', 'parallelogram', 'cylinder', 'document', 'manual-input', 'rack'];
            if (data.is_group || primitives.includes(nodeType)) {
                return `
                    <div class="prop-row">
                        <div class="prop-group">
                            <label>${t('prop_fill_color')}</label>
                            <input type="color" class="prop-input" id="prop-fill-color" value="${data.fill || data.background || '#ffffff'}" style="height: 34px; padding: 2px;">
                        </div>
                        <div class="prop-group">
                            <label>${t('prop_border_color')}</label>
                            <input type="color" class="prop-input" id="prop-border-color" value="${data.border || data['border-color'] || '#94a3b8'}" style="height: 34px; padding: 2px;">
                        </div>
                    </div>
                `;
            }
            return '';
        })()}

        <div class="prop-row">
            ${data.is_group ? `
            <div class="prop-group">
                <label>${t('prop_padding')}</label>
                <input type="number" class="prop-input" id="prop-padding" value="${data.padding || 40}" min="0" max="200">
            </div>
            ` : ''}
            ${data.type === 'rack' ? `
            <div class="prop-group">
                <label>${t('prop_slots')}</label>
                <input type="number" class="prop-input" id="prop-slots" value="${data.slots || 42}" min="1" max="100">
            </div>
            ` : ''}
        </div>
        
        <!-- PM Standard Attributes Section -->
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--panel-border);">
            <div class="prop-row">
                <div class="prop-group">
                    <label>${t('prop_vendor')}</label>
                    <input type="text" class="prop-input" id="prop-vendor" value="${data.vendor || ''}" placeholder="Cisco">
                </div>
                <div class="prop-group">
                    <label>${t('prop_model')}</label>
                    <input type="text" class="prop-input" id="prop-model" value="${data.model || ''}" placeholder="C9300">
                </div>
            </div>

            <div class="prop-row">
                <div class="prop-group">
                    <label>${t('prop_ip')}</label>
                    <input type="text" class="prop-input" id="prop-ip" value="${data.ip || ''}" placeholder="192.168.1.1">
                </div>
                <div class="prop-group">
                    <label>${t('prop_status')}</label>
                    <select class="prop-input" id="prop-status">
                        <option value="planning" ${data.status === 'planning' ? 'selected' : ''}>Plan</option>
                        <option value="installed" ${data.status === 'installed' ? 'selected' : ''}>Live</option>
                        <option value="retired" ${data.status === 'retired' ? 'selected' : ''}>None</option>
                    </select>
                </div>
            </div>

            <div class="prop-row">
                <div class="prop-group">
                    <label>${t('prop_project')}</label>
                    <input type="text" class="prop-input" id="prop-project" value="${data.project || ''}">
                </div>
                <div class="prop-group">
                    <label>${t('prop_env')}</label>
                    <select class="prop-input" id="prop-env">
                        <option value="prod" ${data.env === 'prod' ? 'selected' : ''}>PROD</option>
                        <option value="staging" ${data.env === 'staging' ? 'selected' : ''}>STG</option>
                        <option value="dev" ${data.env === 'dev' ? 'selected' : ''}>DEV</option>
                    </select>
                </div>
            </div>

            <div class="prop-group">
                <label>${t('prop_tags')}</label>
                <input type="text" class="prop-input" id="prop-tags" value="${(data.tags || []).join(', ')}">
            </div>
            <div class="prop-group">
                <label>${t('prop_description')}</label>
                <textarea class="prop-input" id="prop-description" rows="2" style="resize: vertical; min-height: 48px; font-size: 12px;">${data.description || ''}</textarea>
            </div>
        </div>
    `;
}
