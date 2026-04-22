# drawNET Bug Report - 2026-03-22 🐞

이 문서는 2026년 3월 22일 발생한 `help_modal.js` 내의 ReferenceError 해결 및 그에 따른 조치 사항을 기록합니다.

---

### [Instance #2300] - ReferenceError: t is not defined in help_modal.js
- **현상**: 도움말 버튼(`help-btn`) 클릭 시 도움말 모달(Help Modal)이 열리지 않고, 브라우저 콘솔에 `Uncaught (in promise) ReferenceError: t is not defined` 에러가 발생하며 인터페이스가 멈추는 현상.
- **원인**: 
    1. 마크다운 렌더러 라이브러리(`marked.js`) 통합을 위한 `help_modal.js` 리팩토링 과정에서 실수로 상단의 `import { t } from '../i18n.js';` 구문을 삭제함.
    2. 모달 템플릿 코드 내에서 다국어 번역 함수인 `${t('help_center')}` 등을 호출할 때 해당 함수가 정의되지 않아 런타임 에러가 발생함.
- **조치**: 
    1. `static/js/modules/ui/help_modal.js` 파일 상단에 누락된 `t` 함수 임포트 구문을 즉시 복구함.
    2. 모달 내의 모든 `t()` 호출부가 정상적으로 바인딩되었는지 검증하고, 모달이 정상적으로 팝업되는 것을 확인함.
    3. 향후 리팩토링 시 필수 의존성(Dependency) 누락 여부를 체크하도록 코드 리뷰 프로세스 보강.
- **관련 이전 이슈**: 없음.

---
*아카이브 관리자: drawNET AI Assistant*
