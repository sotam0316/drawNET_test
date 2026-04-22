import { state } from './state.js';
import { getProjectData, restoreProjectData } from './graph/io/index.js';
import { getSettings } from './settings/store.js';
import { STORAGE_KEYS } from './constants.js';
import { logger } from './utils/logger.js';
import { t } from './i18n.js';
import { showToast } from './ui/toast.js';

const AUTOSAVE_KEY = STORAGE_KEYS.AUTOSAVE;
let isDirty = false;

/**
 * initPersistence - 자동 저장 및 세션 복구 초기화
 */
export function initPersistence() {
    // 1. 페이지 이탈 가드
    window.addEventListener('beforeunload', (e) => {
        if (isDirty) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

    // 2. 30초마다 자동 저장 (변경사항 있을 때만)
    setInterval(() => {
        if (isDirty) {
            saveToLocal();
        }
    }, 30000);

    // 3. X6 변경 감지
    if (state.graph) {
        state.graph.on('cell:added cell:removed cell:changed', () => {
            markDirty();
        });
    }

    // 4. 세션 복구 확인
    checkRecovery();
}

export function markDirty() {
    isDirty = true;
}

export function clearDirty() {
    isDirty = false;
}

export function clearLastState() {
    localStorage.removeItem(AUTOSAVE_KEY);
    isDirty = false;
    logger.info("Local auto-save session cleared.");
}

function saveToLocal() {
    const data = getProjectData();
    if (data) {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
        clearDirty();
        showToast(t('msg_autosaved'), 'success', 2000);
        logger.info("Progress auto-saved to local storage (X6).");
    }
}

async function checkRecovery() {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (!saved) return;

    try {
        const data = JSON.parse(saved);

        // v3.0 포맷 확인 (graphJson 필드 존재 여부)
        const isV3 = data.header?.app === "drawNET Premium" && data.graphJson;
        if (!isV3) {
            // 구버전 자동저장 데이터는 무효화하고 삭제
            logger.high("Legacy auto-save format detected. Clearing.");
            localStorage.removeItem(AUTOSAVE_KEY);
            return;
        }

        const nodeCount = (data.graphJson?.cells || []).filter(c => c.shape !== 'edge').length;
        if (nodeCount === 0) return;

        const settings = getSettings();

        setTimeout(() => {
            if (settings.autoLoadLast) {
                logger.high("Auto-loading last session per user settings.");
                showToast(t('msg_restoring'), 'info', 3000);
                restoreProjectData(data);
            } else if (confirm(t('confirm_recovery'))) {
                restoreProjectData(data);
            } else {
                localStorage.removeItem(AUTOSAVE_KEY);
            }
        }, 1200);
    } catch (e) {
        logger.critical("Failed to parse auto-save data.", e);
        localStorage.removeItem(AUTOSAVE_KEY);
    }
}
