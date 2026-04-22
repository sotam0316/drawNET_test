import { state } from '../state.js';
import { logger } from '../utils/logger.js';

/**
 * fetchAssets - Fetches the complete asset and pack list from the server
 */
export async function fetchAssets() {
    try {
        const response = await fetch('/assets');
        const data = await response.json();
        state.assetsData = data.assets || [];
        return data;
    } catch (e) {
        logger.critical("Failed to fetch assets:", e);
        return { assets: [], packs: [] };
    }
}
