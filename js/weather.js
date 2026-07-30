// OpenWeatherMap 연동 + 날씨 카드 렌더
// TODO: OpenWeatherMap 5-day forecast 연동 (진행 예정 - weather-main 담당)

window.WeatherModule = (() => {
  function getSummary() {
    // TODO: 실제 현재 날씨로 교체
    return { temp: '--°', icon: '⛅' };
  }

  function renderForecastCards(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    console.log(`[WeatherModule.renderForecastCards] mock render on #${containerId}`);
    // TODO: 5개 이상 시간대별 예보 카드 렌더 (가로/세로 스크롤, 카드 스타일 다양화)
  }

  return { getSummary, renderForecastCards };
})();
