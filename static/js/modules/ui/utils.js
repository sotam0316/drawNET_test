/**
 * ui/utils.js - Shared UI utilities
 */

/**
 * makeDraggable - Helper to make an element draggable by its header or itself
 */
export function makeDraggable(el, headerSelector) {
    const header = headerSelector ? el.querySelector(headerSelector) : el;
    if (!header) return;

    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    header.onmousedown = dragMouseDown;
    header.style.cursor = 'move';

    function dragMouseDown(e) {
        // Don't prevent default on inputs, buttons, or sliders inside
        if (['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
        
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        el.style.top = (el.offsetTop - pos2) + "px";
        el.style.left = (el.offsetLeft - pos1) + "px";
        el.style.bottom = 'auto'; // Break fixed constraints
        el.style.right = 'auto';
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

/**
 * showConfirmModal - Displays a professional confirmation modal
 * @param {Object} options { title, message, onConfirm, showDontAskAgain }
 */
export function showConfirmModal({ title, message, onConfirm, onCancel, showDontAskAgain = false, checkboxKey = '' }) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay glass-panel active';
    overlay.style.zIndex = '10000';
    
    const modal = document.createElement('div');
    modal.className = 'modal-content animate-up';
    modal.style.width = '320px';
    modal.style.padding = '0';
    
    modal.innerHTML = `
        <div class="modal-header" style="padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <h2 style="font-size: 14px; margin:0; color: #f1f5f9;">${title}</h2>
        </div>
        <div class="modal-body" style="padding: 24px 20px;">
            <p style="font-size: 13px; color: #94a3b8; margin: 0; line-height: 1.6;">${message}</p>
            ${showDontAskAgain ? `
                <label style="display:flex; align-items:center; gap:8px; margin-top:20px; cursor:pointer;">
                    <input type="checkbox" id="dont-ask-again" style="width:14px; height:14px; accent-color:#3b82f6;">
                    <span style="font-size:11px; color:#64748b;">Don't show this again</span>
                </label>
            ` : ''}
        </div>
        <div class="modal-footer" style="padding: 16px 20px; display:flex; gap:10px; background: rgba(0,0,0,0.1);">
            <button id="modal-cancel" class="btn-secondary" style="flex:1; height:36px; font-size:12px;">CANCEL</button>
            <button id="modal-confirm" class="btn-primary" style="flex:1; height:36px; font-size:12px; background:#ef4444; border-color:#ef4444;">DISCONNECT</button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    
    modal.querySelector('#modal-cancel').onclick = () => {
        close();
        if (onCancel) onCancel();
    };

    modal.querySelector('#modal-confirm').onclick = () => {
        const dontAsk = modal.querySelector('#dont-ask-again')?.checked;
        if (dontAsk && checkboxKey) {
            import('../settings/store.js').then(m => m.updateSetting(checkboxKey, false));
        }
        close();
        if (onConfirm) onConfirm();
    };

    overlay.onclick = (e) => { if (e.target === overlay) close(); };
}

import { showToast as coreShowToast } from './toast.js';

/**
 * showToast - Compatibility wrapper for modularized toast
 */
export function showToast(message, type = 'info', duration = 3500) {
    coreShowToast(message, type, duration);
}
