# 차량용 인포테인먼트 시스템(IVI) 웹 구현

다크테마 기반 지도·내비게이션·날씨 통합 UI를 구현하는 정적 웹 프로젝트입니다. 차량 대시보드 배경 위에 태블릿 화면이 놓인 형태로, 실제 차량용 인포테인먼트 화면을 흉내냅니다.

## 화면 구성

| 화면 | 설명 |
|---|---|
| `index.html` (메인) | 차량 대시보드 배경 + 태블릿 프레임, 왼쪽 프로필 영역 / 오른쪽 지도 + 내비게이션·날씨 바로가기 버튼 |
| `nav.html` (내비게이션) | 검색창(자동완성/최근기록) + 검색결과 리스트 + 지도(마커·경로) |
| `weather.html` (날씨) | 시간대별 예보 카드 리스트 (가로 스크롤) |

3개 화면 모두 동일한 상단 상태바(시간/날씨)와 하단 푸터(Home/내비게이션/날씨)를 공유하며, 현재 화면은 푸터에서 강조 표시됩니다. 화면 전환 시 이동 방향(탭 순서 기준)에 따라 좌/우 슬라이드 애니메이션이 재생됩니다.

## 구현된 기능 (요구사항 매핑)

- **F101 메인화면**: 다크테마 지도 UI, 실시간 현재 위치 마커(회전형 차량 아이콘), 상태바 시간/날씨
- **F102 내비게이션 진입**: 버튼 클릭 시 화면 전환 + 슬라이드 애니메이션, 푸터 활성 탭 강조(accent 컬러 필 표시)
- **F103 장소 검색**: Kakao Places 키워드 검색, 결과 없음 예외 처리
- **F104 경로 시각화**: 검색 결과 선택 시 목적지 마커만 표시(지도 확대), "경로 안내" 버튼을 눌러야 실제 경로(Polyline)와 거리/예상시간이 표시됨 (취소 가능), 현재 위치 기준 자동 재중심
- **F105 날씨 정보 표시**: 날씨 버튼으로 화면 전환, 5개 이상 시간대별 예보 카드
- **F106 검색 자동완성**: localStorage 기반 최근 검색 기록(입력 중 실시간 필터링, 항목별 삭제), 입력 디바운싱
- **F107 날씨 카드 UX**: 마우스 드래그/휠/터치 스와이프로 가로 스크롤, 카드 클릭 시 해당 카드가 중앙으로 스크롤, 중앙에 가까운 카드는 크게·멀어질수록 작게 보이는 강조 효과
- **F108 (심화) 지도 UI 커스터마이징**: 출발지(회전형 차량 이미지)/목적지(색상 구분 핀) 마커 스타일링, 경로 폴리라인 색상 커스터마이징, 마커 위 이름/주소 라벨

## 실행 방법

1. API 키 설정
   ```
   cp config.example.js config.js
   ```
   `config.js`에 발급받은 Kakao Map / Kakao Mobility / OpenWeatherMap API 키를 채워 넣습니다.
   (`config.js`는 `.gitignore` 처리되어 있어 커밋되지 않습니다. 절대 커밋하지 마세요.)

2. VSCode Live Server 등 정적 서버로 `index.html`을 엽니다. (파일을 직접 여는 `file://` 방식은 CORS 문제로 API 호출이 막힐 수 있습니다.)

3. Kakao Mobility API(경로 안내)를 브라우저에서 직접 호출하려면 Kakao Developers 콘솔의 해당 앱 **플랫폼 > Web**에 사용 중인 로컬 서버 도메인을 등록해야 합니다.

## 기술 스택

- HTML5 / CSS3 / Vanilla JavaScript
- Kakao Map API, Kakao Mobility API (길찾기), Kakao Geocoder(좌표→주소 변환)
- OpenWeatherMap API (5-day / 3-hour forecast)
- Axios

## 폴더 구조

```
ivi-infotainment/
├── index.html / nav.html / weather.html
├── css/
│   ├── common.css   # 다크테마 변수, 차량 대시보드+태블릿 셸, 공통 헤더/푸터
│   ├── main.css      # 메인 화면(프로필/지도/버튼) 레이아웃
│   ├── nav.css        # 검색 패널 + 지도 레이아웃
│   └── weather.css     # 예보 카드 스타일/스크롤
├── js/
│   ├── common.js        # 상태바 시간/날씨 갱신, 전역 유틸(debounce)
│   ├── map.js             # Kakao Map 초기화/마커/경로/실시간 위치추적
│   ├── search.js           # 장소 검색 + 자동완성 + 경로 안내 UI
│   ├── weather.js           # OpenWeatherMap 연동 + 카드 렌더/스크롤
│   └── main.js                # 화면 전환 라우팅(AppRouter)
├── assets/images/           # 배경/마커 이미지 에셋
├── config.js (gitignore) / config.example.js
└── CLAUDE.md                # 프로젝트 요구사항 명세
```

## 모듈 간 공통 인터페이스

다른 모듈이 아직 구현되지 않았어도 아래 함수 시그니처로 mock을 먼저 만들어 병행 개발합니다. 이 이름들은 임의로 변경하지 않습니다.

```js
// map.js
window.MapModule.init(containerId)
window.MapModule.setCurrentLocationMarker(lat, lng, heading?)
window.MapModule.showRoute(destLat, destLng)          // -> { distance, duration } | null
window.MapModule.moveMarker(lat, lng, label?)
window.MapModule.locateCurrent()                      // 실시간 위치 추적(watchPosition) 시작
window.MapModule.clearRoute()                         // 표시된 경로선 제거

// weather.js
window.WeatherModule.getSummary()                      // -> Promise<{ temp, icon }>
window.WeatherModule.renderForecastCards(containerId)

// main.js
window.AppRouter.goTo('main' | 'nav' | 'weather')
```

## 브랜치 전략

- `main` : 배포 가능한 안정 브랜치
- `feature/map-nav` : 지도/검색/경로 담당 작업 브랜치
- `feature/weather-main` : 날씨 API/카드 담당 작업 브랜치
- `feature/main-layout`, `feature/ui-polish`, `feature/weather-scroll` : 레이아웃/UX 개선 작업 브랜치

각 feature 브랜치에서 작업 후 `main`으로 PR을 올려 리뷰 후 병합합니다.

자세한 요구사항은 `CLAUDE.md` 참고.
