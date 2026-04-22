# drawNET Bug Report - 2026-03-22 🐞

이 문서는 2026년 3월 22일 발생한 오브젝트 스튜디오 404 에러 해결 및 그에 따른 조치 사항을 기록합니다.

---

### [Instance #2310] - 404 Resource Not Found in Object Studio
- **현상**: 오브젝트 스튜디오(Object Studio) 접속 시 다국어 파일(`i18n.js`)과 파비콘(`favicon.ico`)을 찾을 수 없다는 404 에러와 함께 UI의 버튼 글자가 번역되지 않은 상태(Raw Key)로 노출됨.
- **원인**: 
    1. **경로 오표기**: `static/js/modules/studio/` 디렉토리 내의 `renderer.js`와 `actions.js`에서 `../../i18n.js` 경로를 사용함. 실제 파일은 `../i18n.js`(`static/js/modules/i18n.js`)에 위치해 있어 상대 경로 계산 오류 발생.
    2. **파비콘 링크 누락**: `studio.html` 파일에 명시적인 파비콘 링크가 없어 브라우저가 기본값인 `/favicon.ico`를 호출함.
- **조치**: 
    1. `renderer.js` 및 `actions.js`의 임포트 경로를 `../i18n.js`로 일괄 수정하여 다국어 모듈 로딩 정상화.
    2. `studio.html` 상단에 통합 로고(`logo.svg`)를 파비콘으로 사용하는 링크 태그 추가.
    3. 스튜디오 전체 리소스 로딩 상태를 재점검하여 누락된 정적 파일이 없음을 확인.
- **관련 이전 이슈**: Instance #2300 (유사한 Import 문제)

---
*아카이브 관리자: drawNET AI Assistant*
