import { studioState } from './state.js';

export function initIngester() {
    const dropZone = document.getElementById('drop-zone');
    const folderInput = document.getElementById('folder-input');
    const fileInput = document.getElementById('file-input');

    if (!dropZone || !folderInput) return;

    // Handle clicks
    dropZone.addEventListener('click', () => folderInput.click());

    // Handle folder selection
    folderInput.addEventListener('change', (e) => handleFiles(e.target.files));
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    // Handle drag & drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#38bdf8';
        dropZone.style.background = 'rgba(56, 189, 248, 0.05)';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        dropZone.style.background = 'transparent';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        dropZone.style.background = 'transparent';
        handleFiles(e.dataTransfer.files);
    });
}

function handleFiles(files) {
    const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
    let addedCount = 0;

    Array.from(files).forEach(file => {
        if (validTypes.includes(file.type)) {
            studioState.addSource(file);
            addedCount++;
        }
    });

    if (addedCount > 0) {
        // Trigger UI update (to be implemented in index.js)
        window.dispatchEvent(new CustomEvent('studio-sources-updated'));
    }
}
