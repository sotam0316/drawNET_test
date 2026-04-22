/**
 * settings/ui.js - Professional Settings Panel UI (Modular)
 */
import { getSettings } from './store.js';
import { renderGeneral, bindGeneralEvents } from './tabs/general.js';
import { renderWorkspace, bindWorkspaceEvents } from './tabs/workspace.js';
import { renderEngine, bindEngineEvents } from './tabs/engine.js';
import { renderAbout } from './tabs/about.js';

let activeTab = 'general';

export function initSettings() {
    const settingsBtn = document.getElementById('settings-btn');
    const closeBtn = document.getElementById('close-settings-btn');
    const panel = document.getElementById('settings-panel');
    const tabs = document.querySelectorAll('.settings-tab');

    if (settingsBtn && panel) {
        settingsBtn.addEventListener('click', () => {
            panel.classList.toggle('active');
            if (panel.classList.contains('active')) renderTabContent(activeTab);
        });
    }

    if (closeBtn && panel) {
        closeBtn.addEventListener('click', () => panel.classList.remove('active'));
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeTab = tab.getAttribute('data-tab');
            renderTabContent(activeTab);
        });
    });

    document.addEventListener('mousedown', (e) => {
        if (panel?.classList.contains('active')) {
            if (!panel.contains(e.target) && !settingsBtn.contains(e.target)) {
                panel.classList.remove('active');
            }
        }
    });
}

function renderTabContent(tabName) {
    const body = document.getElementById('settings-body');
    if (!body) return;

    const settings = getSettings();
    body.innerHTML = '';
    const section = document.createElement('div');
    section.className = 'settings-section';

    switch (tabName) {
        case 'general':
            renderGeneral(section);
            bindGeneralEvents(section);
            break;
        case 'workspace':
            renderWorkspace(section, settings);
            bindWorkspaceEvents(section);
            break;
        case 'engine':
            renderEngine(section);
            bindEngineEvents(section);
            break;
        case 'about':
            renderAbout(section);
            break;
    }

    body.appendChild(section);
}
