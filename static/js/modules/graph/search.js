import { state } from '../state.js';

/**
 * initGlobalSearch - Initializes the canvas-wide search and highlight functionality
 */
export function initGlobalSearch() {
    const searchInput = document.getElementById('global-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!state.graph) return;

        const allNodes = state.graph.getNodes();
        
        if (query === '') {
            allNodes.forEach(node => {
                node.attr('body/opacity', 1);
                node.attr('image/opacity', 1);
                node.attr('label/opacity', 1);
                node.removeTools();
            });
            return;
        }

        allNodes.forEach(node => {
            const data = node.getData() || {};
            const label = (node.attr('label/text') || '').toLowerCase();
            const id = node.id.toLowerCase();
            
            // PM 전용 표준 속성 검색 대상 포함
            const searchFields = [
                id, label,
                (data.type || '').toLowerCase(),
                (data.ip || '').toLowerCase(),
                (data.model || '').toLowerCase(),
                (data.vendor || '').toLowerCase(),
                (data.asset_tag || '').toLowerCase(),
                (data.serial || '').toLowerCase(),
                (data.project || '').toLowerCase(),
                (data.tags || []).join(' ').toLowerCase()
            ];

            const isMatch = searchFields.some(field => field.includes(query));

            if (isMatch) {
                node.attr('body/opacity', 1);
                node.attr('image/opacity', 1);
                node.attr('label/opacity', 1);
                
                // 검색 강조 툴 추가
                node.addTools({
                    name: 'boundary',
                    args: {
                        padding: 5,
                        attrs: {
                            fill: 'none',
                            stroke: '#3b82f6',
                            strokeWidth: 3,
                            strokeDasharray: '0',
                        },
                    },
                });
            } else {
                node.attr('body/opacity', 0.1);
                node.attr('image/opacity', 0.1);
                node.attr('label/opacity', 0.1);
                node.removeTools();
            }
        });
    });

    // 엔터 키 입력 시 검색된 첫 번째 항목으로 포커싱
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value.toLowerCase().trim();
            if (!query || !state.graph) return;

            const matches = state.graph.getNodes().filter(node => {
                const data = node.getData() || {};
                const label = (node.attr('label/text') || '').toLowerCase();
                const searchFields = [
                    node.id.toLowerCase(), label,
                    (data.ip || ''), (data.asset_tag || ''), (data.model || '')
                ];
                return searchFields.some(f => f.toLowerCase().includes(query));
            });

            if (matches.length > 0) {
                // 첫 번째 매치된 항목으로 줌인
                state.graph.zoomToCell(matches[0], { 
                    padding: 100, 
                    animation: { duration: 600 } 
                });
                state.graph.select(matches[0]);
            }
        }
    });
}
