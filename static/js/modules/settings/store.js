import { STORAGE_KEYS } from '../constants.js';

/**
 * settings/store.js - Persistence logic for app settings
 */
export function getSettings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
}

export function updateSetting(key, value) {
    const settings = getSettings();
    settings[key] = value;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
}

export function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
}

export function applySavedTheme() {
    const theme = getTheme();
    document.documentElement.setAttribute('data-theme', theme);
}

export function applySavedSettings() {
    const settings = getSettings();
    if (settings.bgColor) {
        document.documentElement.style.setProperty('--bg-color', settings.bgColor);
    }
    
    if (settings.gridStyle) {
        window.dispatchEvent(new CustomEvent('gridChanged', { 
            detail: { 
                style: settings.gridStyle,
                color: settings.gridColor,
                thickness: settings.gridThickness,
                showMajor: settings.showMajorGrid,
                majorColor: settings.majorGridColor,
                majorInterval: settings.majorGridInterval
            } 
        }));
    }
    
    if (settings.gridSpacing) {
        document.documentElement.style.setProperty('--grid-size', `${settings.gridSpacing}px`);
        window.dispatchEvent(new CustomEvent('gridSpacingChanged', { detail: { spacing: settings.gridSpacing } }));
    }

    if (settings.canvasPreset) {
        const val = settings.canvasPreset;
        const orient = settings.canvasOrientation || 'portrait';
        let w = '100%', h = '100%';
        
        if (val === 'A4') { 
            w = orient === 'portrait' ? 794 : 1123; 
            h = orient === 'portrait' ? 1123 : 794; 
        } 
        else if (val === 'A3') { 
            w = orient === 'portrait' ? 1123 : 1587; 
            h = orient === 'portrait' ? 1587 : 1123; 
        }
        else if (val === 'custom') {
            w = settings.canvasWidth;
            h = settings.canvasHeight;
        }

        window.dispatchEvent(new CustomEvent('canvasResize', { 
            detail: { width: w, height: h } 
        }));
    }
}
