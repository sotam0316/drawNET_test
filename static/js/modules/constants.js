/**
 * constants.js - Central repository for magic strings and app configuration
 */

// LocalStorage Keys
export const STORAGE_KEYS = {
    SETTINGS: 'drawNET-settings',
    THEME: 'drawNET-theme',
    AUTOSAVE: 'drawNET_autosave',
    LANGUAGE: 'drawNET_lang'
};

// Default Configuration
export const DEFAULTS = {
    GRID_SPACING: 20,
    GRID_COLOR: '#e2e8f0',
    MAJOR_GRID_COLOR: '#cbd5e1',
    MAJOR_GRID_INTERVAL: 5,
    CANVAS_PRESET: 'A4',
    CANVAS_ORIENTATION: 'portrait',
    APP_VERSION: '2.0.0-pro',
    DEFAULT_ICON: 'router.svg'
};

// UI Toggles & States
export const UI_STATES = {
    QUAKE_COLLAPSED_HEIGHT: '40px',
    QUAKE_EXPANDED_HEIGHT: '300px'
};
