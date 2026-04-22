import { state } from '../../state.js';
import { logger } from '../../utils/logger.js';
import { t } from '../../i18n.js';
import { applyLayerFilters } from '../layers.js';
import { prepareExport, cleanupExport } from './image_exporter.js';

/**
 * PPTX로 내보내기 (PptxGenJS 활용)
 * 단순 캡처가 아닌 개별 이미지 배치 및 선 객체 생성을 통한 고도화된 리포트 생성
 */
export async function exportToPPTX() {
    if (!state.graph) return;
    if (typeof PptxGenJS === 'undefined') {
        alert(t('pptx_lib_error'));
        return;
    }

    try {
        const pptx = new PptxGenJS();
        import('../../ui/toast.js').then(m => m.showToast(t('msg_export_start').replace('{format}', 'PPTX'), 'info', 3000));
        pptx.layout = 'LAYOUT_16x9';

        const projectTitle = document.getElementById('project-title')?.innerText || "drawNET Topology";
        const allCells = state.graph.getCells();
        if (allCells.length === 0) {
            alert(t('pptx_no_data'));
            return;
        }

        // --- 1. 슬라이드 1: 요약 정보 ---
        const summarySlide = pptx.addSlide();
        summarySlide.addText(t('pptx_report_title').replace('{title}', projectTitle), {
            x: 0.5, y: 0.3, w: '90%', h: 0.6, fontSize: 24, color: '363636', bold: true
        });

        const stats = {};
        allCells.filter(c => c.isNode()).forEach(node => {
            const type = node.getData()?.type || 'Unknown';
            stats[type] = (stats[type] || 0) + 1;
        });

        const summaryRows = [[t('pptx_obj_type'), t('pptx_quantity')]];
        Object.entries(stats).sort().forEach(([type, count]) => {
            summaryRows.push([type, count.toString()]);
        });

        summarySlide.addTable(summaryRows, {
            x: 0.5, y: 1.2, w: 4.0, colW: [2.5, 1.5],
            border: { pt: 1, color: 'E2E8F0' }, fill: { color: 'F8FAFC' },
            fontSize: 11, align: 'center'
        });

        summarySlide.addText(t('pptx_generated_at').replace('{date}', new Date().toLocaleString()), {
            x: 6.0, y: 5.2, w: 3.5, h: 0.3, fontSize: 9, color: '999999', align: 'right'
        });

        // --- 좌표 변환 헬퍼 (Inches) ---
        const MARGIN = 0.5;
        const SLIDE_W = 10 - (MARGIN * 2);
        const SLIDE_H = 5.625 - (MARGIN * 2);

        const addGraphToSlide = (slide, cells, title) => {
            if (cells.length === 0) return;
            
            if (title) {
                slide.addText(title, { x: 0.5, y: 0.2, w: 5.0, h: 0.4, fontSize: 14, bold: true, color: '4B5563' });
            }

            // High-Fidelity Hybrid: Capture topology as PNG
            // Since toPNG is asynchronous with a callback, we use a different approach for batching or just use the current canvas state
            // But for PPTX report, we want to ensure it's high quality.
            // X6 toPNG is usually sync if no external images, but here we have SVGs.
            
            // To keep it simple and stable, we'll use a placeholder or wait for the user to confirm.
            // Actually, we can use the plugin's sync return if possible, or just export the whole thing.
            
            return new Promise(async (resolve) => {
                const backup = await prepareExport();
                const bbox = state.graph.getContentBBox();
                const ratio = bbox.width / bbox.height;
                const maxW = 8.0;
                const maxH = 4.5;
                
                let imgW = maxW;
                let imgH = imgW / ratio;
                
                if (imgH > maxH) {
                    imgH = maxH;
                    imgW = imgH * ratio;
                }
                
                const imgX = 1.0 + (maxW - imgW) / 2;
                const imgY = 0.8 + (maxH - imgH) / 2;

                state.graph.toPNG((dataUri) => {
                    slide.addImage({ data: dataUri, x: imgX, y: imgY, w: imgW, h: imgH });
                    cleanupExport(backup);
                    resolve();
                }, {
                    padding: 10,
                    backgroundColor: '#ffffff',
                    width: bbox.width * 2,
                    height: bbox.height * 2,
                    stylesheet: '.x6-port { display: none !important; } .x6-edge-selected path { filter: none !important; }'
                });
            });
        };

        // --- 2. 슬라이드 2: 전체 조감도 ---
        const mainDiagSlide = pptx.addSlide();
        // Backup visibility
        const originalVisibility = state.layers.map(l => ({ id: l.id, visible: l.visible }));
        
        // Show everything for overall view
        state.layers.forEach(l => l.visible = true);
        await applyLayerFilters();
        await addGraphToSlide(mainDiagSlide, allCells, t('pptx_overall_topo'));

        // --- 3. 슬라이드 3~: 레이어별 상세도 ---
        if (state.layers && state.layers.length > 1) {
            for (const layer of state.layers) {
                // Only show this layer
                state.layers.forEach(l => l.visible = (l.id === layer.id));
                await applyLayerFilters();
                
                const layerCells = allCells.filter(c => (c.getData()?.layerId || 'l1') === layer.id);
                if (layerCells.length > 0) {
                    const layerSlide = pptx.addSlide();
                    await addGraphToSlide(layerSlide, layerCells, t('pptx_layer_title').replace('{name}', layer.name));
                }
            }
        }

        // Restore original visibility
        originalVisibility.forEach(orig => {
            const l = state.layers.find(ly => ly.id === orig.id);
            if (l) l.visible = orig.visible;
        });
        await applyLayerFilters();

        // --- 4. 슬라이드 마지막: 상세 인벤토리 테이블 ---
        const nodes = allCells.filter(c => c.isNode());
        if (nodes.length > 0) {
            const tableSlide = pptx.addSlide();
            tableSlide.addText(t('pptx_inv_title'), { x: 0.5, y: 0.3, w: 5.0, h: 0.5, fontSize: 18, bold: true });

            const tableRows = [[t('prop_label'), t('prop_type'), t('prop_parent'), t('prop_model'), t('prop_ip'), t('prop_status')]];
            nodes.forEach(node => {
                const d = node.getData() || {};
                const parent = node.getParent();
                const parentLabel = parent ? (parent.getData()?.label || parent.attr('label/text') || parent.id) : '-';
                
                tableRows.push([
                    d.label || node.attr('label/text') || '',
                    d.type || '',
                    parentLabel,
                    d.model || '',
                    d.ip || '',
                    d.status || ''
                ]);
            });

            tableSlide.addTable(tableRows, {
                x: 0.5, y: 1.0, w: 9.0,
                colW: [1.5, 1.2, 1.5, 1.6, 1.6, 1.6],
                border: { pt: 0.5, color: 'CCCCCC' },
                fontSize: 8,
                autoPage: true
            });
        }

        // --- 5. 슬라이드: 객체별 상세 설명 (Label & Description) ---
        const descObjects = allCells.filter(c => {
            const d = c.getData() || {};
            if (c.isNode()) {
                // Include all standard nodes, but only include groups if they have a description
                return !d.is_group || !!d.description;
            }
            // Include edges only if they have a user-defined label or description
            return !!(d.label || d.description);
        });

        if (descObjects.length > 0) {
            const descSlide = pptx.addSlide();
            descSlide.addText(t('pptx_desc_table_title') || 'Object Details & Descriptions', { 
                x: 0.5, y: 0.3, w: 8.0, h: 0.5, fontSize: 18, bold: true, color: '2D3748' 
            });

            const descRows = [[t('prop_label'), t('prop_type'), t('prop_tags'), t('prop_description')]];
            descObjects.forEach(cell => {
                const d = cell.getData() || {};
                let label = '';
                
                if (cell.isNode()) {
                    label = d.label || cell.attr('label/text') || `Node (${cell.id.substring(0,8)})`;
                } else {
                    // Optimized Edge Label: Use d.label if available, else Source -> Target name
                    if (d.label) {
                        label = d.label;
                    } else {
                        const src = state.graph.getCellById(cell.getSource().cell);
                        const dst = state.graph.getCellById(cell.getTarget().cell);
                        const srcName = src?.getData()?.label || src?.attr('label/text') || 'Unknown';
                        const dstName = dst?.getData()?.label || dst?.attr('label/text') || 'Unknown';
                        label = `${srcName} -> ${dstName}`;
                    }
                }
                
                const type = cell.isNode() ? (d.type || 'Node') : `Edge (${d.routing || 'manhattan'})`;
                const tags = (d.tags || []).join(', ');
                
                descRows.push([
                    label,
                    type,
                    tags || '-',
                    d.description || '-'
                ]);
            });

            descSlide.addTable(descRows, {
                x: 0.5, y: 1.0, w: 9.0,
                colW: [1.5, 1.2, 1.8, 4.5],
                border: { pt: 0.5, color: 'CCCCCC' },
                fill: { color: 'FFFFFF' },
                fontSize: 9,
                autoPage: true,
                newSlideProps: { margin: [0.5, 0.5, 0.5, 0.5] }
            });
        }

        pptx.writeFile({ fileName: `drawNET_Report_${Date.now()}.pptx` });
        import('../../ui/toast.js').then(m => m.showToast(t('msg_export_success').replace('{format}', 'PPTX'), 'success'));
    } catch (err) {
        import('../../ui/toast.js').then(m => m.showToast(t('msg_export_failed').replace('{format}', 'PPTX'), 'error'));
        logger.critical("PPTX export failed.", err);
        alert(t('pptx_export_error').replace('{message}', err.message));
    }
}
