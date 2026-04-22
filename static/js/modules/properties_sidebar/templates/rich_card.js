import { t } from '../../i18n.js';

export function getRichCardTemplate(cell) {
    const data = cell.getData() || {};
    const headerText = data.headerText || 'TITLE';
    const content = data.content || '';
    const cardType = data.cardType || 'standard';
    const headerColor = data.headerColor || '#3b82f6';
    const headerAlign = data.headerAlign || 'left';
    const contentAlign = data.contentAlign || 'left';

    return `
        <div class="prop-section">
            <h4 class="section-title"><i class="fas fa-file-alt"></i> ${t('rich_card')}</h4>
            
            <div class="prop-group">
                <label>${t('prop_header_text')}</label>
                <div class="input-with-color">
                    <input type="text" id="prop-header-text" class="prop-input" value="${headerText}">
                    <input type="color" id="prop-header-color" class="prop-input" value="${headerColor}">
                </div>
            </div>

            <div class="prop-row">
                <div class="prop-group horizontal">
                    <label>${t('prop_header_align')}</label>
                    <select id="prop-header-align" class="prop-input">
                        <option value="left" ${headerAlign === 'left' ? 'selected' : ''}>${t('left')}</option>
                        <option value="center" ${headerAlign === 'center' ? 'selected' : ''}>${t('center')}</option>
                        <option value="right" ${headerAlign === 'right' ? 'selected' : ''}>${t('right')}</option>
                    </select>
                </div>
            </div>

            <div class="prop-row">
                <div class="prop-group horizontal">
                    <label>${t('prop_card_type')}</label>
                    <select id="prop-card-type" class="prop-input">
                        <option value="standard" ${cardType === 'standard' ? 'selected' : ''}>${t('standard')}</option>
                        <option value="numbered" ${cardType === 'numbered' ? 'selected' : ''}>${t('numbered')}</option>
                        <option value="bullet" ${cardType === 'bullet' ? 'selected' : ''}>${t('bullet')}</option>
                        <option value="legend" ${cardType === 'legend' ? 'selected' : ''}>${t('legend')}</option>
                    </select>
                </div>
            </div>

            <div class="prop-row">
                <div class="prop-group horizontal">
                    <label>${t('prop_content_align')}</label>
                    <select id="prop-content-align" class="prop-input">
                        <option value="left" ${contentAlign === 'left' ? 'selected' : ''}>${t('left')}</option>
                        <option value="center" ${contentAlign === 'center' ? 'selected' : ''}>${t('center')}</option>
                        <option value="right" ${contentAlign === 'right' ? 'selected' : ''}>${t('right')}</option>
                    </select>
                </div>
            </div>

            <div class="prop-group">
                <label>${t('prop_card_content')}</label>
                <textarea id="prop-card-content" class="prop-input" rows="8" style="resize: vertical; min-height: 120px; font-size: 13px;" placeholder="Enter list items...">${content}</textarea>
            </div>

            <div class="prop-row" style="margin-top: 10px;">
                <div class="toggle-group" style="padding: 0; flex: 1;">
                    <label class="toggle-switch danger" style="padding: 10px 14px;">
                        <span style="font-size: 12px;"><i class="fas fa-lock" style="margin-right: 4px;"></i>${t('prop_locked')}</span>
                        <input type="checkbox" id="prop-locked" class="prop-input" ${data.locked ? 'checked' : ''}>
                        <div class="switch-slider"></div>
                    </label>
                </div>
            </div>
        </div>
    `;
}
