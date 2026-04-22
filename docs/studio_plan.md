# DrawNET Object Studio 설계서 (Phase 1)

**Object Studio**는 단순한 이미지 업로드를 넘어, 인프라 설계에 필요한 전문적인 **에셋 관리 시스템(Asset Management System)**을 지향합니다.

## 1. 개요
*   **목적**: 복잡한 인프라 소자(Cisco, Fortinet 등)를 패키지 단위로 관리하고, 전/후면 뷰 및 메타데이터를 정밀하게 가공하여 도면 제작 효율을 극대화함.
*   **접근 주소**: `/studio` (독립형 페이지)

---

## 2. 주요 워크플로우

### [Ingestion: 소스 로드]
1.  **벌크 로드**: 사용자가 로컬 폴더를 지정(`webkitdirectory`)하거나 여러 파일을 드래그 앤 드롭하여 소스 목록에 추가.
2.  **프리뷰 그리드**: 업로드된 이미지들을 썸네일 형태로 시각화하여 확인.

### [Processing: 에셋 가공 및 속성 정의]
1.  **개별/벌크 편집**: 
    *   선택된 오브젝트의 이름 변경, 속성 지정(아이콘 타입, 유형 등), 카테고리 매칭.
    *   다중 선택 시 '제조사(Vendor)', '모델 시리즈', '환경' 등 공통 정보를 일괄 적용.
2.  **PNG to SVG 하이브리드 변환**:
    *   PNG 소스를 벡터화(SVG Trace)하여 변환 결과 프리뷰 제공.
    *   사용자가 **[원본 PNG 유지]** 또는 **[벡터 SVG 채택]** 중 선택. (SVG 채택 시 고해상도 무한 확대 및 색상 커스터마이징 가능)

### [Packaging: 내보내기 및 등록]
1.  **패키지(Pack) 생성**: 가공 완료된 에셋들을 하나의 논리적 팩(예: `Cisco_Nexus_9000_Pack`)으로 묶음.
2.  **뷰 매칭 (Front/Back)**: 랙 배치를 고려하여 동일 모델의 전면 아이콘과 후면 아이콘을 하나의 에셋 데이터로 바인딩.
3.  **최종 발행**: 서버 저장소(`static/assets/packs/`)에 저장하고 메인 에디터의 에셋 라이브러리에 패키지 정보 업데이트.

---

## 3. 화면 UI/UX 설계 (안)

### 레이아웃 구조
*   **좌측 (Source Panel)**: 업로드된 원본 파일 목록 및 Drag & Drop 영역.
*   **중앙 (Workspace)**: 바둑판식(Grid) 에셋 프리뷰 영역 및 선택 도구.
*   **우측 (Property Panel)**: 선택된 에셋(들)의 속성 입력창 (명칭, 제조사, 카테고리 등) 및 SVG 변환 비교 뷰.

### 주요 기능 버튼
*   `[Load Folder]`: 폴더 단위 소스 로드.
*   `[Batch Edit]`: 선택 항목 일괄 속성 적용.
*   `[Vectorize]`: 벡터 변환 및 품질 검수 모드 진입.
*   `[Build Pack]`: 최종 패키지 추출 및 서버 등록.

---

## 4. 데이터 모델 확장 (Draft)

```json
{
  "pack_id": "cisco_sw_pack",
  "vendor": "Cisco",
  "version": "1.0.0",
  "assets": [
    {
      "id": "c9300L_24T",
      "label": "Catalyst 9300L 24T",
      "category": "Switch",
      "views": {
        "front": "packs/cisco/9300l_f.svg",
        "back": "packs/cisco/9300l_b.svg"
      },
      "specs": {
        "u_height": 1,
        "depth": "350mm"
      }
    }
  ]
}
```

---

## 6. 구현 단계별 로드맵 (Roadmap)

안정적인 연동과 품질 관리를 위해 다음 순서로 개발을 진행합니다.

### Phase 1: 설계영역 수용성 및 인프라 구축 (Infrastructure)
*   **목표**: 스튜디오에서 만든 패키지를 설계영역에서 즉시 읽어 들일 수 있는 기반 마련.
*   **주요 작업**:
    *   `package.json` 데이터 규격 확정.
    *   설계영역 에셋 라이브러리의 '멀티 패키지 로더' 구현.
    *   샘플 패키지(`Cisco_Sample`)를 통한 연동 테스트.
*   **체크리스트**: `/docs/studio/phase1_checklist.md`

### Phase 2: 스튜디오 기반 구축 (Base Setup)
*   **목표**: 스튜디오 독립 페이지 및 이미지 Ingestion 엔진 구현.
*   **주요 작업**:
    *   `/studio` 라운팅 및 전용 HTML/CSS 레이아웃 생성.
    *   폴더 선택 및 드래그 앤 드롭 업로드 구현.
    *   에셋 프리뷰 그리드 UI 최적화.
*   **체크리스트**: `/docs/studio/phase2_checklist.md`

### Phase 3: 스튜디오 핵심 가공 기능 (Core Processing)
*   **목표**: PNG to SVG 변환 및 벌크 속성 편집 기능 구현.
*   **주요 작업**:
    *   벡터라이징(Trace) 엔진 탑재 및 변환 전/후 비교 UI.
    *   다중 선택 기반 일괄 속성(Vendor, Category 등) 편집기.
*   **체크리스트**: `/docs/studio/phase3_checklist.md`

*   **체크리스트**: `/docs/studio/phase4_checklist.md` [v] **Completed**

---

## 7. 최종 구현 사양 (Final Implementation)

### 아키텍처 (Architecture)
- **프론트엔드 모듈화**: 코드 복잡도를 제어하기 위해 관심사별로 모듈을 분리함.
    - `index.js`: 엔트리 포인트 및 이벤트 바인딩.
    - `renderer.js`: 모든 DOM 생성 및 UI 업데이트 담당.
    - `actions.js`: 빌드, 변환, 벌크 수정 등 비즈니스 로직.
    - `state.js` / `ingester.js` / `processor.js`: 상태 관리 및 데이터 처리 전담.
- **백엔드**: Flask (`api_routes.py`) 기반의 멀티 패키지 스캔 및 저장 엔진 구축.

### 주요 기술 스택
- **Potrace-js**: 클라이언트 사이드 고속 벡터화.
- **Flask FormData**: 대용량 이미지 및 메타데이터 일괄 전송.
- **X6 Data Integration**: `package.json` 규격을 통한 설계 영역과의 심리스한 연동.
