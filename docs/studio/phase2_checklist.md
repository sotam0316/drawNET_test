# Phase 2 체크리스트: 스튜디오 기반 구축 (Base Setup)

## 1. 전용 페이지 및 라우팅 설정
- [x] `routes/main_routes.py`에 `/studio` 엔드포인트 추가 완료
- [x] `templates/studio.html` 기본 구조(HTML5, 필요한 CSS/JS 로드) 생성 완료
- [x] 설계영역(Draw)에서 스튜디오로 이동할 수 있는 메뉴/버튼 배치 (예: 상단 툴바)

## 2. 스튜디오 전용 UI/UX 레이아웃 (3-Panel)
- [x] **Source Panel (좌측)**: 업로드된 파일 목록 및 Drag & Drop 영역 구현
- [x] **Workspace (중앙)**: 에셋들을 바둑판식(Grid)으로 보여주는 프리뷰 영역 구현
- [x] **Property Panel (우측)**: 선택된 에셋의 상세 정보(ID, Label) 입력 영역 스켈레톤 생성
- [x] 스튜디오 전용 다크 테마 및 전문 도구 스타일 CSS 적용

## 3. Ingestion(이미지 수집) 엔진 구현
- [x] 브라우저 폴더 선택(`webkitdirectory`) 기능 구현 및 파일 필터링(.svg, .png, .jpg)
- [x] 개별 파일 드래그 앤 드롭(Drag & Drop) 업로드 지원
- [x] 선택된 이미지들을 중앙 Workspace 그리드에 즉시 렌더링 (Memory URL 사용)

## 4. 선택 및 상태 서비스 (State Management)
- [x] 그리드 내 이미지 개별/다중 선택(Ctrl/Shift 클릭) 로직 구현
- [x] 선택된 항목 수 및 파일 정보(해상도, 크기) 하단 상태바 표시
- [x] 업로드된 소스 목록 관리 서비스(`studio_state.js`) 초기화

## 5. 설계영역과의 분리 검증
- [x] `/studio` 페이지 로딩 시 설계영역의 X6 인스턴스가 생성되지 않아 리소스가 낭비되지 않는지 확인
- [x] 뒤로가기 또는 '설계영역으로 돌아가기' 버튼 정상 작동 확인
