## 1. 패키지 메타데이터 입력 UI
- [x] 상단 툴바에 패키지 ID(영문/숫자/언더바), 이름, 버전 입력 필드 추가
- [x] 패키지 전용 벤더(Vendor) 및 아이콘 지정 기능 구현
- [x] 필수 값 입력 여부 유효성 검사 로직 추가

## 2. 서버 측 저장 API (Backend)
- [x] `api_routes.py`에 `/api/studio/save-pack` POST 엔드포인트 구현
- [x] 서버의 `static/assets/packs/[pack_id]/` 디렉토리를 자동 생성하고 이미지 파일 저장
- [x] 가공된 에셋 정보를 바탕으로 최종 `package.json` 파일 생성 및 저장

## 3. Build & Publish 워크플로우
- [x] `[Build Package]` 버튼 클릭 시 가공된 모든 에셋(SVG/PNG 선택본)을 수집하여 서버로 전송
- [x] 진행 상태 표시(Progress Bar) 및 성공/실패 알림 모달 구현
- [x] 성공 시 생성된 패키지 요약 정보(에셋 개수, 용량 등) 표시

## 4. 설계영역(Designer) 즉시 반영
- [x] 패키지 저장 후 설계영역으로 이동 시 신규 패키지가 라이브러리에 자동 로드되는지 확인
- [x] 라이브러리 내 카테고리가 `package.json`의 정의대로 올바르게 그룹화되는지 검증
- [x] 새로 추가된 에셋을 캔버스에 드랍했을 때 이미지 경로가 정상적으로 해석되는지 최종 확인

## 5. 데이터 모델 확장 및 검증 (Future Proof)
- [x] 향후 Rack 배치를 고려한 `Front/Back View` 정보가 `package.json`에 포함될 수 있는 구조인지 재확인
- [x] 패키지 삭제 또는 덮어쓰기(Overwrite) 시의 안정성 확보
