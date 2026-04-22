import { state } from '../state.js';

/**
 * logger.js - Integrated Logging System for drawNET
 * Supports filtering based on config.json [log_level: info | high | critical]
 */

const LEVELS = {
    info: 0,
    high: 1,
    critical: 2
};

function getLogLevel() {
    const level = state.appConfig?.log_level || 'info';
    return LEVELS[level.toLowerCase()] ?? LEVELS.info;
}

export const logger = {
    /**
     * info - General progress, initialization, data loading (Level: info)
     */
    info: (msg, ...args) => {
        if (getLogLevel() <= LEVELS.info) {
            console.log(`%c[drawNET:INFO]%c ${msg}`, 'color: #38bdf8; font-weight: bold;', 'color: inherit;', ...args);
        }
    },
    
    /**
     * debug - Temporary debugging logs (Alias for info)
     */
    debug: (msg, ...args) => {
        if (getLogLevel() <= LEVELS.info) {
            console.log(`%c[drawNET:DEBUG]%c ${msg}`, 'color: #94a3b8; font-style: italic;', 'color: inherit;', ...args);
        }
    },

    /**
     * high - Important events, user actions, validation warnings (Level: high)
     */
    high: (msg, ...args) => {
        if (getLogLevel() <= LEVELS.high) {
            console.info(`%c[drawNET:HIGH]%c ${msg}`, 'color: #f59e0b; font-weight: bold;', 'color: inherit;', ...args);
        }
    },

    /**
     * critical - System failures, data corruption, critical exceptions (Level: critical)
     */
    critical: (msg, ...args) => {
        if (getLogLevel() <= LEVELS.critical) {
            console.error(`%c[drawNET:CRITICAL]%c ${msg}`, 'background: #ef4444; color: white; padding: 2px 4px; border-radius: 4px; font-weight: bold;', 'color: #ef4444;', ...args);
        }
    },

    /**
     * warn - Standard warnings that should be visible in 'high' level
     */
    warn: (msg, ...args) => {
        if (getLogLevel() <= LEVELS.high) {
            console.warn(`[drawNET:WARN] ${msg}`, ...args);
        }
    }
};
