import { FloatingWindow } from './ui/window.js';
import { logger } from './utils/logger.js';

class ObjectStudioPlugin {
    constructor() {
        this.win = null;
        this.uploadedPath = '';
    }

    open() {
        if (this.win) {
            this.win.bringToFront();
            return;
        }

        this.win = new FloatingWindow('studio', t('object_studio'), {
            width: 700,
            height: 500,
            icon: 'fas fa-magic'
        });

        const content = `
            <div class="studio-container" style="display: flex; gap: 30px; height: 100%;">
                <!-- Preview Area -->
                <div class="preview-area" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--item-bg); border-radius: 20px; border: 2px dashed var(--panel-border);">
                    <div id="studio-preview-icon" style="width: 120px; height: 120px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-image" style="font-size: 50px; color: var(--sub-text);"></i>
                    </div>
                    <p style="font-size: 11px; color: var(--sub-text); margin-top: 15px;">${t('preview')}</p>
                </div>

                <!-- Form Area -->
                <div class="form-area" style="flex: 1.5; display: flex; flex-direction: column; justify-content: space-between;">
                    <div class="settings-group">
                        <h3 style="margin-bottom: 20px; font-size: 14px; border-bottom: 1px solid var(--panel-border); padding-bottom: 8px;">${t('basic_info')}</h3>
                        <div class="setting-item">
                            <span class="setting-label">${t('id_label')}</span>
                            <input type="text" id="studio-id" placeholder="${t('id_placeholder')}" style="width: 200px;">
                        </div>
                        <div class="setting-item">
                            <span class="setting-label">${t('display_name')}</span>
                            <input type="text" id="studio-label" placeholder="${t('name_placeholder')}" style="width: 200px;">
                        </div>
                        <div class="setting-item">
                            <span class="setting-label">${t('category')}</span>
                            <select id="studio-category" style="width: 200px;">
                                <option value="Network">${t('Network')}</option>
                                <option value="Security">${t('Security')}</option>
                                <option value="Compute">${t('Compute')}</option>
                                <option value="External">${t('External')}</option>
                                <option value="Other">${t('Other')}</option>
                            </select>
                        </div>
                    </div>

                    <div class="settings-group">
                        <h3 style="margin-bottom: 20px; font-size: 14px; border-bottom: 1px solid var(--panel-border); padding-bottom: 8px;">${t('asset_attachment')}</h3>
                        <div class="setting-item" style="flex-direction: column; align-items: flex-start; gap: 10px;">
                            <span class="setting-label">${t('icon_image')}</span>
                            <div style="display: flex; gap: 10px; width: 100%;">
                                <input type="file" id="studio-file" accept=".svg,.png,.jpg,.jpeg" style="font-size: 11px; flex: 1;">
                                <button id="studio-upload-btn" class="btn-secondary" style="padding: 5px 15px; font-size: 10px;">${t('upload') || 'Upload'}</button>
                            </div>
                        </div>
                    </div>

                    <div class="studio-footer" style="margin-top: 30px; display: flex; justify-content: flex-end; gap: 12px;">
                        <button id="studio-cancel" class="btn-secondary">${t('close_btn')}</button>
                        <button id="studio-save" class="btn-primary" style="padding: 10px 40px;">${t('save_device')}</button>
                    </div>
                </div>
            </div>
        `;

        this.win.render(content);
        this.initEventListeners();
    }

    initEventListeners() {
        const el = this.win.element;
        const fileInput = el.querySelector('#studio-file');
        const uploadBtn = el.querySelector('#studio-upload-btn');
        const saveBtn = el.querySelector('#studio-save');
        const cancelBtn = el.querySelector('#studio-cancel');

        cancelBtn.addEventListener('click', () => this.win.destroy());
        this.win.onClose = () => { this.win = null; };

        uploadBtn.addEventListener('click', () => this.handleUpload(fileInput));
        saveBtn.addEventListener('click', () => this.handleSave());
    }

    async handleUpload(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const res = await fetch('/api/studio/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                this.uploadedPath = data.path;
                const preview = this.win.element.querySelector('#studio-preview-icon');
                preview.innerHTML = `<img src="/static/assets/${this.uploadedPath}" style="max-width: 100%; max-height: 100%; transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);">`;
                preview.querySelector('img').style.transform = 'scale(0.8)';
                setTimeout(() => { preview.querySelector('img').style.transform = 'scale(1)'; }, 10);
            }
        } catch (err) { logger.critical(err); }
    }

    async handleSave() {
        const id = document.getElementById('studio-id').value.trim();
        const label = document.getElementById('studio-label').value.trim();
        const category = document.getElementById('studio-category').value;

        if (!id || !label || !this.uploadedPath) {
            alert("Please fill all required fields.");
            return;
        }

        const newAsset = { id, type: label, label, category, path: this.uploadedPath, format: this.uploadedPath.split('.').pop() };

        try {
            const res = await fetch('/api/studio/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAsset)
            });
            const data = await res.json();
            if (data.success) {
                initAssets();
                this.win.destroy();
            }
        } catch (err) { logger.critical(err); }
    }
}

export const studioPlugin = new ObjectStudioPlugin();
export const openStudioModal = () => studioPlugin.open();
