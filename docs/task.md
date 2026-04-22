# drawNET Development Task List (Updated 2026-03-19)

## 📋 현재 상태 요약
- **완료:** AntV X6 엔진 마이그레이션, DSL 동기화 기초, 정밀 배치 도구, UX 고도화.
- **핵심 성과:** **Object Studio(Phase 1-4) 구현 완료**. 이제 독립된 환경에서 자산을 제작하고 패키징하여 도면에 즉시 반영 가능.

## ✅ 완료된 작업 (Object Studio Milestone)

### Phase 1: 자산 인프라 및 멀티 로더
- [x] `package.json` 데이터 규격 정의 (`vendor`, `pack_id`, `views` 등)
- [x] 백엔드 멀티 패키지 스캔 엔진 (`/assets`) 고도화
- [x] 설계영역(Designer) 사이드바의 벤더별 패키지 자동 로딩 구현

### Phase 2: 스튜디오 기반 구축
- [x] 독립된 제작 페이지 (`/studio`) 라우팅 및 전용 레이아웃 (3-Panel)
- [x] 폴더/파일 단위 대량 이미지 인제스천(Ingestion) 기능
- [x] 작업 영역(Grid) 및 실시간 필터링 UI

### Phase 3: 핵심 가공 및 벡터 변환
- [x] Potrace-js 통합을 통한 PNG -> SVG 실시간 벡터라이징
- [x] **Side-by-Side 리뷰 UI**: 원본과 변환본 비교 및 최종 포맷 채택 기능
- [x] 벌크(Bulk) 속성 편집(Category 일괄 적용 등) 기능

### Phase 4: 패키징 및 최종 연동
- [x] **/api/studio/save-pack**: 가공된 에셋 및 `package.json` 서버 저장 API
- [x] 버튼 하나로 빌드부터 설계영역 반영까지 워크플로우 자동화
- [x] **코드 모듈화(Refactoring)**: `Renderer`, `Actions` 모듈 분리로 코드 품질 확보
- [x] **PPTX 내보내기 (Simple Test)**: PptxGenJS 기반 도면 슬라이드 추출 기능 구현 (설계영역)

---

## 🚀 향후 개발 우선순위

### 1단계: 엔터프라이즈 기능 확장
- [ ] **Sub-Graph (Nesting)**: 그룹 내부 진입 및 상세 설계 드릴다운 기능
- [ ] **Rack View 가공**: 스튜디오에서 장비의 U-Height 정보를 기반으로 한 랙 실장 뷰 연동

### 2단계: 분석 및 자동화
- [ ] **Live Status Monitoring**: 실시간 Ping 체크를 통한 장애 가시화
- [ ] **Compliance Audit**: 설계 보안 가이드 준수 여부 자동 분석

### 3단계: AI 어시스턴트
- [ ] LLM 연동을 통한 자연어 기반 토폴로지 자동 생성 및 최적화 제안
