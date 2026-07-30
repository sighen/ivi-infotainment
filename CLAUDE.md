# 프로젝트: 차량용 인포테인먼트 시스템(IVI) 웹 구현

## 개요
SSAFY 관통 프로젝트(임베디드 트랙) 1회차 "차량용 인포테인먼트 시스템 제작 PJT".
HTML5/CSS3/JavaScript 기반 정적 웹으로, 차량 대시보드에 탑재된 태블릿 UI를 모사한다.
2인 팀, GitHub 협업. 다크테마 기반 지도·내비게이션·날씨 통합 UI를 구현하는 것이 목표.

## 화면 구조 (3개)
1. **메인 화면 (index.html)**: 다크테마 지도 UI + 현재 위치 마커 + 상단 상태바(시간/날씨) + 하단 푸터(Home/내비게이션/날씨)
2. **내비게이션 화면 (nav.html)**: 헤더(시계/날씨) + 검색창 + 검색결과 리스트 + 지도(경로 표시) + 푸터
3. **날씨 화면 (weather.html)**: 헤더(공통) + 시간대별 예보 카드(5개 이상, 가로/세로 스크롤) + 푸터

푸터의 Home/내비게이션/날씨 3개 아이콘은 모든 화면에서 동일하게 유지, 현재 화면은 활성 상태 표시.

## 기술 스택 / 필수 라이브러리
- HTML5, CSS3, JavaScript (Vanilla)
- **Kakao Map API**: 지도 렌더링, 마커
- **Kakao Mobility API**: 출발지-도착지 길찾기, 경로는 Polyline으로 지도에 표시
- **OpenWeatherMap API** (5-day forecast): 시간대별 날씨 데이터
- **Axios**: 외부 API 비동기 통신
- 참고 문서:
  - https://apis.map.kakao.com/web/sample/
  - https://developers.kakaomobility.com/docs/navi-api/directions/
  - https://openweathermap.org/forecast5

## 파일 구조
```
ivi-project/
├── index.html
├── nav.html
├── weather.html
├── css/
│   ├── common.css      # 다크테마 변수, 공통 레이아웃(헤더/푸터)
│   ├── main.css
│   ├── nav.css
│   └── weather.css
├── js/
│   ├── common.js        # 상태바 시간 갱신, 전역 유틸
│   ├── map.js            # Kakao Map 초기화/마커/경로 (지도&내비 담당)
│   ├── search.js         # 장소 검색 + 자동완성 (지도&내비 담당)
│   ├── weather.js        # 날씨 API 연동 + 카드 렌더 (메인&날씨 담당)
│   └── main.js            # 화면 전환, 메인 진입 로직 (메인&날씨 담당)
├── config.js              # API 키 (반드시 .gitignore 처리, 절대 커밋 금지)
├── config.example.js       # 키 없는 샘플
├── .gitignore
└── README.md
```

## 모듈 간 공통 인터페이스 (반드시 이 이름/시그니처 유지)

**HTML id/class**
- `#statusbar-time`, `#statusbar-weather` : 상단 상태바
- `#map-container` : 지도 div
- `#nav-btn`, `#weather-btn` : 화면 전환 버튼
- `.menu-active` : 활성 메뉴/푸터 아이콘 공통 클래스
- `#search-input`, `#search-result-list` : 검색 관련
- `#weather-card-list` : 날씨 카드 컨테이너

**전역 함수 시그니처**
```js
// map.js
window.MapModule.init(containerId)
window.MapModule.setCurrentLocationMarker(lat, lng)
window.MapModule.showRoute(destLat, destLng)   // Kakao Mobility 길찾기 → Polyline 표시
window.MapModule.moveMarker(lat, lng)

// weather.js
window.WeatherModule.getSummary()               // { temp, icon } — statusbar용
window.WeatherModule.renderForecastCards(containerId)  // 5개 이상 카드 렌더

// main.js
window.AppRouter.goTo('main' | 'nav' | 'weather')
```
다른 모듈이 구현 중이어도 이 함수 이름으로 mock을 먼저 만들어 개발을 병행할 것.

## 필수 요구사항 (반드시 구현, 수정 불가)
| 번호 | 이름 | 상세 |
|---|---|---|
| F101 | 메인화면 구성 | 다크테마 지도 UI, 현재 위치 마커, 상태바 시간/날씨 |
| F102 | 내비게이션 진입 | 버튼 클릭 시 지도 화면 전환, 활성 메뉴 표시 |
| F103 | 장소 검색 | 키워드 입력 → 결과 리스트, 결과 없음 예외처리 |
| F104 | 경로 시각화 | 결과 클릭 → 지도에 경로(Polyline) + 마커 이동 + 중심점/레벨 조정 |
| F105 | 날씨 정보 표시 | 날씨 버튼 → 화면 전환, 시간대별 예보 카드 5개 이상 |
| F106 | 검색 자동완성 | localStorage 기반 이전 검색 기록, 입력에 디바운싱 적용 |
| F107 | 날씨 카드 UX | 스크롤 방향(가로/세로) 전환, 카드 스타일 다양화 |
| F108 (심화) | 지도 UI 커스터마이징 | 마커/경로 스타일을 차량용 스타일로 커스터마이징 |

## 작업 방식 (중요)
- 완성된 코드를 한 번에 길게 만들지 말 것. 파일/함수 단위로 작게 쪼개서 작업 → 매 단계 확인 후 다음 단계 진행.
- 새 기능은 위 공통 인터페이스(id/class/함수 시그니처)를 절대 임의로 바꾸지 말 것. 바꿔야 한다면 먼저 이유를 설명하고 확인받을 것.
- API 키(Kakao, OpenWeatherMap)는 반드시 `config.js`에서만 참조하고 하드코딩 금지. `.gitignore`에 `config.js` 포함 여부를 매번 확인할 것.
- 커밋은 기능 단위로 작게, 브랜치는 `feature/map-nav`, `feature/weather-main` 사용 후 `develop`으로 PR.

## 최종 제출 형식
- README.md 또는 워드/PPT 문서 + 소스코드를 GitLab에 업로드
- 압축파일명: `임베디드_웹_관통PJT1_지역_반_성명1_성명2.zip`