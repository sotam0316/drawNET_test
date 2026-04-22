import { state } from '../../state.js';
import { getProjectData, restoreProjectData } from './json_handler.js';
import { exportToPPTX } from './pptx_exporter.js';
import { logger } from '../../utils/logger.js';

/**
 * initGraphIO - 그래프 관련 I/O 이벤트 리스너 초기화
 */
export function initGraphIO() {
    // Export JSON (.dnet)
    const exportBtn = document.getElementById('export-json');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const projectData = getProjectData();
            if (!projectData) return;

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData, null, 2));
            const dlAnchorElem = document.createElement('a');
            dlAnchorElem.setAttribute("href", dataStr);
            dlAnchorElem.setAttribute("download", `project_${Date.now()}.dnet`);
            dlAnchorElem.click();
            logger.high("Project exported (.dnet v3.0).");
        });
    }

    // Export PPTX
    const exportPptxBtn = document.getElementById('export-pptx');
    if (exportPptxBtn) {
        exportPptxBtn.addEventListener('click', () => exportToPPTX());
    }

    // Export Excel
    const exportExcelBtn = document.getElementById('export-excel');
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', () => {
             import('./excel_exporter.js').then(m => m.exportToExcel());
        });
    }

    // Export PNG
    const exportPngBtn = document.getElementById('export-png');
    if (exportPngBtn) {
        import('./image_exporter.js').then(m => {
            exportPngBtn.addEventListener('click', () => m.exportToPNG());
        });
    }

    // Export SVG
    const exportSvgBtn = document.getElementById('export-svg');
    if (exportSvgBtn) {
        import('./image_exporter.js').then(m => {
            exportSvgBtn.addEventListener('click', () => m.exportToSVG());
        });
    }

    // Export PDF
    const exportPdfBtn = document.getElementById('export-pdf');
    if (exportPdfBtn) {
        import('./image_exporter.js').then(m => {
            exportPdfBtn.addEventListener('click', () => m.exportToPDF());
        });
    }

    // Import
    const importInput = document.getElementById('import-json-input');
    if (importInput) {
        importInput.setAttribute('accept', '.dnet,.json');
    }
    const importBtn = document.getElementById('import-json');
    if (importBtn && importInput) {
        importBtn.addEventListener('click', () => importInput.click());
        importInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (!state.graph) return;

                    const isDrawNET = data.header?.app === "drawNET Premium";
                    if (!isDrawNET) {
                        alert("지원하지 않는 파일 형식입니다.");
                        return;
                    }

                    if (data.graphJson) {
                        const ok = restoreProjectData(data);
                        if (ok) {
                            logger.high("Import complete (v3.0 JSON).");
                        }
                    } else {
                        alert("이 파일은 구버전(v2.x) 형식입니다. 현재 버전에서는 지원되지 않습니다.\n새로 작성 후 저장해 주세요.");
                    }
                } catch (err) {
                    logger.critical("Failed to parse project file.", err);
                    alert("프로젝트 파일을 읽을 수 없습니다.");
                }
            };
            reader.readAsText(file);
            e.target.value = '';
        });
    }
}

// Re-export for compatibility
export { getProjectData, restoreProjectData, exportToPPTX };
