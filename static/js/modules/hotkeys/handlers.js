import { graphHandlers } from './handlers/graph.js';
import { uiHandlers } from './handlers/ui.js';
import { clipboardHandlers } from './handlers/clipboard.js';
import { ioHandlers } from './handlers/io.js';

/**
 * actionHandlers - 단축키 동작을 기능별 모듈에서 취합하여 제공하는 매니페스트 객체입니다.
 */
export const actionHandlers = {
    ...graphHandlers,
    ...uiHandlers,
    ...clipboardHandlers,
    ...ioHandlers
};
