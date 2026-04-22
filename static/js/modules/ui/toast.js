/**
 * toast.js - Modularized Notification System for drawNET
 */

let toastContainer = null;

/**
 * Ensures a singleton container for toasts exists in the DOM.
 */
function ensureContainer() {
    if (toastContainer) return toastContainer;
    
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 10000;
        pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
    return toastContainer;
}

/**
 * showToast - Displays a stylish, non-blocking notification
 * @param {string} message - Message to display
 * @param {string} type - 'info', 'success', 'warning', 'error'
 * @param {number} duration - MS to stay visible (default 3500)
 */
export function showToast(message, type = 'info', duration = 3500) {
    const container = ensureContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;
    
    const colors = {
        info: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
    };

    const icons = {
        info: 'fa-info-circle',
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        error: 'fa-times-circle'
    };

    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;

    toast.style.cssText = `
        background: rgba(15, 23, 42, 0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 600;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        gap: 12px;
        border-left: 4px solid ${colors[type]};
        backdrop-filter: blur(8px);
        pointer-events: auto;
        animation: toastIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        min-width: 280px;
    `;

    // Add CSS Keyframes if not present
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.innerHTML = `
            @keyframes toastIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes toastOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(-20px) scale(0.95); }
            }
        `;
        document.head.appendChild(style);
    }

    container.appendChild(toast);

    const dismiss = () => {
        toast.style.animation = 'toastOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    };

    setTimeout(dismiss, duration);
    toast.onclick = dismiss;
}
