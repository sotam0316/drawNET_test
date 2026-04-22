import { state } from '../../state.js';
import { logger } from '../../utils/logger.js';
import { t } from '../../i18n.js';
import { showToast } from '../../ui/toast.js';

/**
 * 전역 내보내기 로딩 오버레이 표시/숨김
 */
function showLoading() {
    const overlay = document.createElement('div');
    overlay.id = 'export-loading-overlay';
    overlay.className = 'export-overlay';
    overlay.innerHTML = `
        <div class="export-spinner"></div>
        <div class="export-text">${t('export_preparing')}</div>
    `;
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('export-loading-overlay');
    if (overlay) overlay.remove();
}

/**
 * 이미지를 Base64 Data URL로 변환 (캐시 및 재시도 적용)
 */
const assetCache = new Map();
async function toDataURL(url, retries = 2) {
    if (!url || typeof url !== 'string') return url;
    if (assetCache.has(url)) return assetCache.get(url);
    
    const origin = window.location.origin;
    const absoluteUrl = url.startsWith('http') ? url : 
                       (url.startsWith('/') ? `${origin}${url}` : `${origin}/${url}`);

    for (let i = 0; i <= retries; i++) {
        try {
            const response = await fetch(absoluteUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const blob = await response.blob();
            const dataUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
            assetCache.set(url, dataUrl);
            return dataUrl;
        } catch (e) {
            if (i === retries) {
                logger.critical(`Base64 conversion failed after ${retries} retries for: ${url}`, e);
                return url;
            }
            await new Promise(r => setTimeout(r, 100 * (i + 1))); // 지수 백오프 대기
        }
    }
}

/**
 * 내보내기 전 모든 노드의 이미지 속성을 Base64로 일괄 변환 (상속된 속성 포함)
 */
export async function prepareExport() {
    if (!state.graph) return null;
    
    const backupNodes = [];
    const nodes = state.graph.getNodes();

    const promises = nodes.map(async (node) => {
        const imageAttrs = [];
        const attrs = node.getAttrs();
        
        // 1. 노드의 모든 속성을 재귀적으로 탐색하여 이미지 경로처럼 보이는 문자열 식별
        const selectors = Object.keys(attrs);
        // 기본 'image' 선택자 외에도 커스텀 선택자가 있을 수 있으므로 모두 확인
        const targetSelectors = new Set(['image', 'icon', 'body', ...selectors]);

        for (const selector of targetSelectors) {
            // xlink:href와 href 두 가지 모두 명시적으로 점검
            const keys = ['xlink:href', 'href', 'src'];
            for (const key of keys) {
                const path = `${selector}/${key}`;
                const val = node.attr(path);

                if (val && typeof val === 'string' && !val.startsWith('data:')) {
                    const trimmedVal = val.trim();
                    if (trimmedVal.includes('.') || trimmedVal.startsWith('/') || trimmedVal.startsWith('http')) {
                        const base64Data = await toDataURL(trimmedVal);
                        
                        if (base64Data && base64Data !== trimmedVal) {
                            imageAttrs.push({ path, originalValue: val });
                            
                            // 중요: 한 쪽에서만 발견되어도 호환성을 위해 두 가지 속성 모두 업데이트
                            const pairKey = key === 'xlink:href' ? 'href' : (key === 'href' ? 'xlink:href' : null);
                            node.attr(path, base64Data);
                            if (pairKey) {
                                const pairPath = `${selector}/${pairKey}`;
                                imageAttrs.push({ path: pairPath, originalValue: node.attr(pairPath) });
                                node.attr(pairPath, base64Data);
                            }
                        }
                    }
                }
            }
        }

        if (imageAttrs.length > 0) {
            backupNodes.push({ node, imageAttrs });
        }
    });

    await Promise.all(promises);
    
    // PC 사양에 따른 DOM 동기화 안정성을 위해 1초 대기 (사용자 요청 반영)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return backupNodes;
}

/**
 * 내보내기 후 원래 속성으로 복구
 */
export function cleanupExport(backup) {
    if (!backup) return;
    try {
        backup.forEach(item => {
            item.imageAttrs.forEach(attr => {
                item.node.attr(attr.path, attr.originalValue);
            });
        });
    } catch (e) {
        console.error("Cleanup export failed", e);
    }
}

/**
 * exportToPNG - PNG 이미지 내보내기
 */
export async function exportToPNG() {
    if (!state.graph) return;
    
    showLoading();
    showToast(t('msg_export_start').replace('{format}', 'PNG'), 'info', 2000);
    const backup = await prepareExport();
    try {
        const bbox = state.graph.getCellsBBox(state.graph.getCells());
        const padding = 100;

        state.graph.toPNG((dataUri) => {
            const link = document.createElement('a');
            link.download = `drawNET_Topology_${Date.now()}.png`;
            link.href = dataUri;
            link.click();
            cleanupExport(backup);
            hideLoading();
            showToast(t('msg_export_success').replace('{format}', 'PNG'), 'success');
            logger.high("Exported to PNG successfully.");
        }, {
            padding,
            backgroundColor: '#ffffff',
            width: (bbox.width + padding * 2) * 2,
            height: (bbox.height + padding * 2) * 2,
            stylesheet: '.x6-port { display: none !important; } .x6-edge-selected path { filter: none !important; }'
        });
    } catch (err) {
        if (backup) cleanupExport(backup);
        hideLoading();
        showToast(t('msg_export_failed').replace('{format}', 'PNG'), 'error');
        logger.critical("PNG Export failed", err);
    }
}

/**
 * exportToSVG - SVG 벡터 내보내기 
 */
export async function exportToSVG() {
    if (!state.graph) return;
    
    showLoading();
    const backup = await prepareExport();
    try {
        // 실제 셀들의 정확한 좌표 영역 계산 (줌/이동 무관한 절대 영역)
        const bbox = state.graph.getCellsBBox(state.graph.getCells());
        const padding = 120;
        
        // 여백을 포함한 최종 영역 설정
        const exportArea = {
            x: bbox.x - padding,
            y: bbox.y - padding,
            width: bbox.width + padding * 2,
            height: bbox.height + padding * 2
        };

        state.graph.toSVG((svg) => {
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `drawNET_Topology_${Date.now()}.svg`;
            link.href = url;
            link.click();
            cleanupExport(backup);
            hideLoading();
            showToast(t('msg_export_success').replace('{format}', 'SVG'), 'success');
            URL.revokeObjectURL(url);
            logger.high("Exported to SVG successfully.");
        }, {
            // 명시적 viewBox 지정으로 짤림 방지
            viewBox: exportArea,
            width: exportArea.width,
            height: exportArea.height,
            backgroundColor: '#ffffff',
            stylesheet: '.x6-port { display: none !important; } .x6-edge-selected path { filter: none !important; }'
        });
    } catch (err) {
        if (backup) cleanupExport(backup);
        hideLoading();
        showToast(t('msg_export_failed').replace('{format}', 'SVG'), 'error');
        logger.critical("SVG Export failed", err);
    }
}

/**
 * exportToPDF - PDF 문서 내보내기
 */
export async function exportToPDF() {
    if (!state.graph) return;
    
    showLoading();
    const backup = await prepareExport();
    try {
        const { jsPDF } = window.jspdf;
        const bbox = state.graph.getCellsBBox(state.graph.getCells());
        const padding = 120;
        const totalW = bbox.width + padding * 2;
        const totalH = bbox.height + padding * 2;

        state.graph.toPNG((dataUri) => {
            const orientation = totalW > totalH ? 'l' : 'p';
            const pdf = new jsPDF(orientation, 'px', [totalW, totalH]);
            pdf.addImage(dataUri, 'PNG', padding, padding, bbox.width, bbox.height);
            pdf.save(`drawNET_Topology_${Date.now()}.pdf`);
            cleanupExport(backup);
            hideLoading();
            showToast(t('msg_export_success').replace('{format}', 'PDF'), 'success');
            logger.high("Exported to PDF successfully.");
        }, {
            padding,
            backgroundColor: '#ffffff',
            width: totalW * 2,
            height: totalH * 2,
            stylesheet: '.x6-port { display: none !important; } .x6-edge-selected path { filter: none !important; }'
        });
    } catch (err) {
        if (backup) cleanupExport(backup);
        hideLoading();
        showToast(t('msg_export_failed').replace('{format}', 'PDF'), 'error');
        logger.critical("PDF Export failed", err);
    }
}
