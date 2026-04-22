import { state } from '../state.js';

export function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const footer = document.querySelector('.sidebar-footer');

    if (sidebarToggle && sidebar) {
        const toggleSidebar = () => {
            sidebar.classList.toggle('collapsed');
            if (footer) {
                footer.style.display = sidebar.classList.contains('collapsed') ? 'none' : 'block';
            }
            setTimeout(() => {
                if (state.graph) state.graph.zoomToFit({ padding: 50 });
            }, 350);
        };
        
        sidebarToggle.addEventListener('click', toggleSidebar);
        
        const searchIcon = document.querySelector('.search-container i');
        if (searchIcon) {
            searchIcon.addEventListener('click', () => {
                if (sidebar.classList.contains('collapsed')) {
                    toggleSidebar();
                    document.getElementById('asset-search').focus();
                }
            });
        }
    }
}
