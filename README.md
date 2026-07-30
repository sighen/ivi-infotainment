# 차량용 인포테인먼트 시스템(IVI) 웹 구현

SSAFY 관통 프로젝트(임베디드 트랙) 1회차. 다크테마 기반 지도·내비게이션·날씨 통합 UI를 구현하는 정적 웹 프로젝트입니다.

## 팀 역할 분담

| 담당 | 영역 |
|---|---|
| 팀원 A | 지도 초기화(`map.js`), 장소 검색(`search.js`), 경로 표시, 마커 이동 |
| 팀원 B | 메인 레이아웃, 상단 시간/날씨, 날씨 화면(`weather.js`), 예보 카드 |

## 화면 구성

- `index.html` : 메인 화면 (지도 + 상태바 + 푸터)
- `nav.html` : 내비게이션 화면 (검색 + 지도 경로 표시)
- `weather.html` : 날씨 화면 (시간대별 예보 카드)

## 실행 방법

1. API 키 설정
   ```
   cp config.example.js config.js
   ```
   `config.js`에 발급받은 Kakao Map / Kakao Mobility / OpenWeatherMap API 키를 채워 넣습니다.
   (`config.js`는 `.gitignore` 처리되어 있어 커밋되지 않습니다. 절대 커밋하지 마세요.)

2. VSCode Live Server 등 정적 서버로 `index.html`을 엽니다. (파일을 직접 여는 `file://` 방식은 CORS 문제로 API 호출이 막힐 수 있습니다.)

## 기술 스택

- HTML5 / CSS3 / Vanilla JavaScript
- Kakao Map API, Kakao Mobility API (길찾기)
- OpenWeatherMap API (5-day forecast)
- Axios

## 브랜치 전략

- `main` : 배포 가능한 안정 브랜치
- `feature/map-nav` : 지도/검색/경로 담당 작업 브랜치
- `feature/weather-main` : 메인/날씨 담당 작업 브랜치

각 feature 브랜치에서 작업 후 `main`으로 PR을 올려 리뷰 후 병합합니다.

## 모듈 간 공통 인터페이스

다른 모듈이 아직 구현되지 않았어도 아래 함수 시그니처로 mock을 먼저 만들어 병행 개발합니다. 이 이름들은 임의로 변경하지 않습니다.

```js
// map.js
window.MapModule.init(containerId)
window.MapModule.setCurrentLocationMarker(lat, lng)
window.MapModule.showRoute(destLat, destLng)
window.MapModule.moveMarker(lat, lng)

// weather.js
window.WeatherModule.getSummary()
window.WeatherModule.renderForecastCards(containerId)

// main.js
window.AppRouter.goTo('main' | 'nav' | 'weather')
```

자세한 요구사항은 `CLAUDE.md` 참고.
