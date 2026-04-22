import { potrace, init } from 'https://cdn.jsdelivr.net/npm/esm-potrace-wasm@0.4.1/dist/index.js';
import { logger } from '../utils/logger.js';

let isWasmInitialized = false;

/**
 * Image Tracing using WASM Potrace (High performance & quality)
 * @param {HTMLImageElement} imageElement 
 * @param {Object} options 
 */
export async function traceImage(imageElement, options = {}) {
    if (!isWasmInitialized) {
        await init();
        isWasmInitialized = true;
    }

    // Ensure image is loaded
    if (imageElement instanceof HTMLImageElement && !imageElement.complete) {
        await new Promise(r => imageElement.onload = r);
    }

    // --- Pre-process with Canvas for Thresholding ---
    const canvas = document.createElement('canvas');
    canvas.width = imageElement.naturalWidth || imageElement.width;
    canvas.height = imageElement.naturalHeight || imageElement.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageElement, 0, 0);

    const threshold = options.threshold !== undefined ? options.threshold : 128;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        // Luminance calculation
        const brightness = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        const v = brightness < threshold ? 0 : 255;
        data[i] = data[i+1] = data[i+2] = v;
        // Keep alpha as is or flatten to white?
        // For icons, if alpha is low, treat as white
        if (data[i+3] < 128) {
            data[i] = data[i+1] = data[i+2] = 255;
            data[i+3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);

    // Potrace Options (WASM version)
    const potraceOptions = {
        turdsize: options.turdsize || 2,
        turnpolicy: options.turnpolicy || 4,
        alphamax: options.alphamax !== undefined ? options.alphamax : 1,
        opticurve: options.opticurve !== undefined ? options.opticurve : 1,
        opttolerance: options.opttolerance || 0.2
    };

    try {
        // Pass the thresholded canvas instead of the original image
        const svgStr = await potrace(canvas, potraceOptions);
        return svgStr;
    } catch (err) {
        logger.critical("WASM Potrace Error:", err);
        throw err;
    }
}

/**
 * Creates a clean SVG string from path data
 * (Maintained for API compatibility, though WASM potrace returns full SVG)
 */
export function wrapAsSVG(svgData, width = 64, height = 64) {
    if (typeof svgData === 'string' && svgData.trim().startsWith('<svg')) {
        return svgData;
    }
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    ${svgData}
</svg>`;
}
