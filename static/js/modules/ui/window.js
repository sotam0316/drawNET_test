/**
 * window.js - Reusable Draggable Floating Window System
 */
export class FloatingWindow {
    constructor(id, title, options = {}) {
        this.id = id;
        this.title = title;
        this.options = {
            width: options.width || 400,
            height: options.height || 300,
            x: options.x || (window.innerWidth / 2 - (options.width || 400) / 2),
            y: options.y || (window.innerHeight / 2 - (options.height || 300) / 2),
            resizable: options.resizable !== false,
            ...options
        };
        this.element = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
    }

    render(contentHtml) {
        if (this.element) return this.element;

        this.element = document.createElement('div');
        this.element.id = `win-${this.id}`;
        this.element.className = 'floating-window';
        this.element.style.width = `${this.options.width}px`;
        this.element.style.height = `${this.options.height}px`;
        this.element.style.left = `${this.options.x}px`;
        this.element.style.top = `${this.options.y}px`;
        this.element.style.zIndex = '1000';

        this.element.innerHTML = `
            <div class="win-header">
                <div class="win-title"><i class="${this.options.icon || 'fas fa-window-maximize'}"></i> ${this.title}</div>
                <div class="win-controls">
                    <button class="win-btn win-minimize"><i class="fas fa-minus"></i></button>
                    <button class="win-btn win-close"><i class="fas fa-times"></i></button>
                </div>
            </div>
            <div class="win-body">
                ${contentHtml}
            </div>
        `;

        document.body.appendChild(this.element);
        this.initEvents();
        return this.element;
    }

    initEvents() {
        const header = this.element.querySelector('.win-header');
        const closeBtn = this.element.querySelector('.win-close');
        const minBtn = this.element.querySelector('.win-minimize');

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.win-controls')) return;
            this.isDragging = true;
            this.dragOffset.x = e.clientX - this.element.offsetLeft;
            this.dragOffset.y = e.clientY - this.element.offsetTop;
            this.bringToFront();
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            this.element.style.left = `${e.clientX - this.dragOffset.x}px`;
            this.element.style.top = `${e.clientY - this.dragOffset.y}px`;
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        closeBtn.addEventListener('click', () => this.destroy());
        
        minBtn.addEventListener('click', () => {
            this.element.classList.toggle('minimized');
            if (this.element.classList.contains('minimized')) {
                this.element.style.height = '48px';
            } else {
                this.element.style.height = `${this.options.height}px`;
            }
        });

        this.element.addEventListener('mousedown', () => this.bringToFront());
    }

    bringToFront() {
        const allWins = document.querySelectorAll('.floating-window');
        let maxZ = 1000;
        allWins.forEach(win => {
            const z = parseInt(win.style.zIndex);
            if (z > maxZ) maxZ = z;
        });
        this.element.style.zIndex = maxZ + 1;
    }

    destroy() {
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
        if (this.onClose) this.onClose();
    }
}
