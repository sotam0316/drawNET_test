# drawNET Maintenance Guide (AI 개발자 필독)

이 문서는 drawNET 프로젝트의 연속성을 유지하기 위한 **핵심 기술 규칙 및 유지보수 지침**을 담고 있습니다. 새로운 세션의 AI 개발자는 작업을 시작하기 전 본 문서를 반드시 숙지하여 기존의 설계 철학이 깨지지 않도록 해야 합니다.

---



## ⌨️ 3. 단축키 시스템 (Hotkeys)

- **규칙**:
    1. `static/hotkeys.json`에서 `undo`와 `redo` 액션은 반드시 **`"alwaysEnabled": true`** 속성을 가져야 합니다.
    2. `static/js/modules/hotkeys.js`는 `isTyping` 상태(텍스트 입력 중)일지라도 `alwaysEnabled`가 참인 단축키는 차단하지 않고 실행해야 합니다.
    3. **이유**: 예기치 않게 특정 입력창에 포커스가 머물러 있더라도 그래프의 Undo/Redo 기능은 항상 작동해야 하기 때문입니다.

## 🎨 4. 오브젝트 스튜디오 (Studio)

- **규칙**:
    1. **ID 고유성**: `static/js/modules/studio/state.js`의 `addSource(file)` 함수는 파일명이 중복될 경우(예: `icon.png`, `icon.png`) `id` 뒤에 `_1`, `_2` 등의 접미사를 붙여 반드시 고유한 ID를 생성해야 합니다.
    2. **ID 생성 방식**: 소문자 영문과 숫자 위주로 변환하며, 공백이나 특수문자는 언더바(`_`)로 치환합니다.

## 📂 5. 에셋 라이브러리 (Asset Library)

- **구조**: `Pack (Package) -> Category -> Object` 3단계 계층 구조를 유지합니다.
- **필터링**: 사용자가 사이드바의 **'Filter' 아이콘**을 통해 원하는 패키지만 선택적으로 로드할 수 있어야 하며, 이 설정은 `localStorage`의 `selectedPackIds`에 저장됩니다.
- **Composite ID (중요)**: 에셋의 `id`가 패키지 간에 중복될 수 있으므로, `state.assetMap`의 키와 드래그 앤 드롭 통신에는 반드시 **`${pack_id}|${asset.id}`** 형식의 조합 키를 사용해야 합니다.

## 🧼 6. 오브젝트 데이터 정합성 (Object Data Purity)

- **규칙**:
    1. **그룹 및 기본 도형(Primitives)**: `group`, `rect`, `circle`, `rounded-rect`, `text-box`, `label` 등 시각적 도형 객체는 에셋 이미지 경로(`assetPath`)를 가져서는 안 됩니다.
    2. **ID 매칭 주의**: `static/js/modules/graph/styles/mapping.js`의 `getX6NodeConfig` 함수는 객체 타입이 그룹이거나 기본 도형 목록에 포함될 경우 에셋 검색 및 할당 로직을 반드시 건너뛰어야 합니다.
    3. **라벨 데이터-시각 속성 동기화**: `data.label`은 사이드바와 비즈니스 로직의 원본 소스(SSoT)입니다. `json_handler.js` 및 `handleNodeUpdate`는 항상 `data.label`의 값을 `attrs.label.text`에 강제로 동기화하여 시각적 불일치를 방지해야 합니다.
    4. **이유**: 그룹 이름이나 도형 라벨이 기존 에셋 명칭을 포함할 경우(예: "Switch Group"), 시스템이 이를 에셋으로 오판하여 잘못된 아이콘을 렌더링하거나 404 에러를 유발할 수 있기 때문입니다.

## 🔄 7. 부모 그룹 선택 가변 로직 (Parent Selection Heuristic)

- **원칙**: 노드가 중첩되거나 겹쳐 있는 여러 그룹 영역에 드롭/이동될 경우, 시스템은 항상 **가장 구체적인(Innermost)** 부모를 선택해야 합니다.
- **판단 알고리즘**:
    1. **면적 기반 우선순위**: 드롭 포인트를 포함하는 모든 그룹 후보 중 Bounding Box의 **면적(Area)이 가장 작은 그룹**을 최종 부모로 선택합니다.
    2. **계층 기반 보완**: 만약 후보 그룹들의 면적이 동일한 경우(예: 기본 사이즈로 중첩된 경우), `getAncestors()`를 확인하여 다른 그룹의 **자손(Descendant)인 그룹**을 우선적으로 선택합니다.
- **적용 위치**: `static/js/modules/graph/config.js` (`embedding.findParent`) 및 `static/js/modules/graph/interactions/drop.js`.

## 🧩 8. 모듈화 및 리팩토링 규칙 (Refactoring & Import Integrity)

- **규칙**:
    1. **상대 경로 재계산**: 파일을 하위 디렉토리로 이동(예: `events.js` → `events/index.js`)할 경우, 해당 파일 내의 모든 상대 경로 임포트(`import ... from '../../state.js'`)는 반드시 새로운 디렉토리 깊이에 맞춰 업데이트해야 합니다.
    2. **공통 참조 체크리스트**:
        - `state.js`, `constants.js` (보통 `modules/` 최상위)
        - `graph/styles/utils.js` 등 공용 유틸리티
        - `ui/`, `persistence.js` 등 외부 모듈 의존성
    3. **검증 절차**: 모듈화 작업 직후에는 반드시 `grep`이나 IDE 기능을 사용하여 **"지정된 파일을 찾을 수 없습니다"** 또는 **"404 Not Found"** 오류가 없는지 전수 검사해야 합니다.
- **이유**: 파일 구조가 깊어짐에 따라 기존의 `./` 또는 `../` 경로가 깨지면서 런타임 오류를 유발하고 개발 흐름을 방해하기 때문입니다.

## 11. 사이드바 및 실시간 동기화 (Sidebar & Sync)

- **규칙**:
    1. **세이프 렌더(Safe Render)**: 사이드바의 `input` 또는 `textarea`에 포커스가 있는 동안에는 그래프 이벤트에 의한 전체 리렌더링을 차단해야 합니다. (`index.js` 내 `safeRender` 함수 참조)
    2. **비동기 렌더링 튜닝**: X6의 데이터 변경 이벤트(`cell:change:data`) 발생 직후 렌더링할 때는 반드시 `setTimeout(..., 0)`을 사용하여 엔진 내부의 데이터 확정이 완료된 후 UI를 그려야 합니다.
    3. **명시적 저장(Explicit Apply)**: 라벨, 자산 정보 등 텍스트 기반 속성은 `Enter` 키 또는 **[적용]** 버튼을 통해서만 저장되도록 하여, 입력 중 데이터 유실이나 포커스 탈취를 원천 차단합니다.
    4. **재귀적 전파(Recursive Poke)**: 그룹의 이름이나 레이아웃 정보를 변경할 경우, 반드시 모든 하위 객체(`getDescendants`)에 `_parent_updated`와 같은 더미 타임스탬프를 `setData`로 주입하여 하위 객체들의 사이드바가 즉각 최신 부모 정보를 반영하게 해야 합니다.
- **이유**: 실시간 협업 및 복잡한 계층 구조에서 데이터 정합성과 사용자 입력의 연속성을 동시에 보장하기 위한 필수 장치입니다.

## 12. 레이어 격리 및 선택 필터링 (Layer Isolation)

- **규칙**:
    1. **선택 격리(Selection Filter)**: `plugins.js`의 `Selection` 플러그인 설정에서는 반드시 현재 활성 레이어(`state.activeLayerId`)에 속한 셀만 선택 가능하도록 필터링해야 합니다.
    2. **상호작용 차단**: 활성 레이어가 아닌 객체에 대한 더블 클릭(더 하위 계층으로 진입 등)은 `nodes.js` 이벤트 핸들러에서 명시적으로 차단 가드를 두어야 합니다.
    3. **정적 필터링**: `pointer-events: none`과 같은 CSS 기반 차단 대신, 플러그인 레벨의 필터링을 우선하여 고스트 스냅(Ghost Snapping) 등 보조 기능은 유지되도록 관리합니다.
- **이유**: 사용자가 편집 중이지 않은 레이어의 객체를 실수로 조작하여 데이터가 오염되는 것을 방지하기 위함입니다.

## 9. 오브젝트 적층 및 잠금 관리 (Stacking & Locking)

- **Z-Index 규칙 (2026-03-21 개정)**:
    - **계층 구조**: `Group/Rack (1~19) < Edge (30) < Node (50)`
    - 그룹은 하단에, 연결선(Edge)은 그룹 위에, 일반 노드는 최상단에 배치하여 가시성 및 클릭 편의성을 보장합니다.
    - 사용자 조작(`[`, `]`)에 의한 동적 변경 시에도 이 기본 계층 범위를 크게 벗어나지 않도록 주의합니다.
- **잠금(Lock)의 물리적 강제**:
    - 단순히 `data.locked` 필드만 변경하는 것이 아니라, `cell.setProp`을 통해 `movable`, `deletable`, `rotatable` 속성을 동기화해야 합니다.
    - `static/js/modules/graph/config.js`의 `interacting` 블록은 반드시 함수형으로 작성되어 각 셀의 `movable` 속성을 실시간으로 체크해야 합니다.

## 10. 정밀 공간 쿼리 (Spatial Query Integrity)

- **규칙**:
    - 특정 좌표(`x, y`)에서 오브젝트를 검색할 때, AntV X6 v2의 실험적/변동성이 큰 API(`findModelsAtPoint` 등)에 의존하지 않습니다.
    - 대신 `graph.getCells().filter(cell => cell.getBBox().containsPoint(local))`와 같은 **수동 기하학 필터링** 방식을 유지하여 버전 업데이트에 따른 오작동을 방지합니다.
- **좌표 변환**: 반드시 브라우저의 클라이언트 좌표를 `graph.clientToLocal(e.clientX, e.clientY)`를 통해 그래프 로컬 좌표로 먼저 변환한 후 계산에 사용해야 합니다.

---
*마지막 업데이트: 2026-03-20*
