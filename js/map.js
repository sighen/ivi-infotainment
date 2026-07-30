// Kakao Map 초기화 / 마커 / 경로 표시
// TODO: Kakao Map SDK, Kakao Mobility 길찾기 연동 (진행 예정 - map-nav 담당)

window.MapModule = (() => {
  let map = null;
  let currentMarker = null;

  function init(containerId) {
    console.log(`[MapModule.init] mock init on #${containerId}`);
    // TODO: window.CONFIG.KAKAO_MAP_APP_KEY 로 SDK 동적 로드 후 kakao.maps.Map 생성
  }

  function setCurrentLocationMarker(lat, lng) {
    console.log(`[MapModule.setCurrentLocationMarker] mock (${lat}, ${lng})`);
    // TODO: 현재 위치 마커 표시
  }

  function showRoute(destLat, destLng) {
    console.log(`[MapModule.showRoute] mock -> (${destLat}, ${destLng})`);
    // TODO: Kakao Mobility 길찾기 호출 -> Polyline 표시, 중심점/레벨 조정
  }

  function moveMarker(lat, lng) {
    console.log(`[MapModule.moveMarker] mock (${lat}, ${lng})`);
    // TODO: 마커 위치 이동
  }

  return { init, setCurrentLocationMarker, showRoute, moveMarker };
})();
