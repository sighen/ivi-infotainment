// OpenWeatherMap 연동 + 날씨 카드 렌더
// TODO: OpenWeatherMap 5-day forecast 연동 (진행 예정 - weather-main 담당)

window.WeatherModule = (() => {
  const API_URL = 'https://api.openweathermap.org/data/2.5/forecast';
  const DEFAULT_COORDS = { lat: 37.5665, lon: 126.9780 };

  const mockForecastList = [
  { dt_txt: '2026-07-30 09:00:00', main: { temp: 24, humidity: 62 }, wind: {speed:2.1}, weather: [{ description: '맑음', icon: '01d'}] },
  { dt_txt: '2026-07-30 12:00:00', main: { temp: 27, humidity: 62 }, wind: {speed:2.1}, weather: [{ description: '구름 조금', icon: '01d' }] },
  { dt_txt: '2026-07-30 15:00:00', main: { temp: 29, humidity: 62 }, wind: {speed:2.1}, weather: [{ description: '흐림', icon: '01d'}] },
  { dt_txt: '2026-07-30 18:00:00', main: { temp: 26, humidity: 62 }, wind: {speed:2.1}, weather: [{ description: '약한 비', icon: '01d' }] },
  { dt_txt: '2026-07-30 21:00:00', main: { temp: 23, humidity: 62 }, wind: {speed:2.1}, weather: [{ description: '맑음', icon: '01d' }] },
  ];

  let timezoneOffset = 0;
  async function getForecastData() {
    
    const apiKey = window.CONFIG?.OPENWEATHER_API_KEY;
    console.log('apiKey same?', window.CONFIG?.OPENWEATHER_API_KEY);
    try{
      const res = await axios.get(API_URL, {
        params: {
          lat: DEFAULT_COORDS.lat,
          lon: DEFAULT_COORDS.lon,
          appid: apiKey,
          units: 'metric',
          lang: 'kr',
        },
      });

      console.log('Weather API success:', res.data.list.slice(0, 5));
       timezoneOffset = res.data.city.timezone;
      return res.data.list;
    } catch (error) {
      console.warn('Weather API failed:', error.response?.status, error.response?.data || error.message);
      return mockForecastList;
    }
  }

  async function getSummary() {
    const list = await getForecastData();
    const first = list[0];

    return {
      temp: Math.round(first.main.temp),
      icon: '⛅',
    };
  }

function getForecastDate(item) {
  if (item.dt) return new Date(item.dt * 1000);
   return new Date((item.dt + 9 * 60 * 60) * 1000);
}


function formatDateText(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const week = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  return `${month}월 ${day}일 ${week}요일`;
}

function createWeatherCard(item) {
  const date = getForecastDate(item);
  const dateText = formatDateText(date);
  const timeText = `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
  const desc = item.weather[0].description;
  const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
  const temp = Math.round(item.main.temp);
  const humidity = item.main.humidity;
  const wind = item.wind.speed;

  return `
    <article class="weather-card">
      <p class="weather-date">${dateText}</p>
      <p class="weather-time">${timeText}</p>
      <img class="weather-icon" src="${iconUrl}" alt="${desc}" />
      <p class="weather-desc">${desc}</p>
      <p class="weather-temp">${temp}°</p>
      <p class="weather-meta">습도 ${humidity}%</p>
      <p class="weather-meta">바람 ${wind}m/s</p>
    </article>
  `;
}

  
  // function getSummary() {
  //   // TODO: 실제 현재 날씨로 교체
  //   return { temp: '--°', icon: '⛅' };
  // }

  async function renderForecastCards(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    console.log(`[WeatherModule.renderForecastCards] render on #${containerId}`);
    // TODO: 5개 이상 시간대별 예보 카드 렌더 (가로/세로 스크롤, 카드 스타일 다양화)
    const list = await getForecastData();
  const forecastList = list.filter((item) => {
  const date = getForecastDate(item);
  const hour = date.getHours();
  return hour >= 9 || date.getDate() !== getForecastDate(list[0]).getDate();
});

container.innerHTML = forecastList.slice(0, 8).map(createWeatherCard).join('');
  
  }

  return { getSummary, renderForecastCards };
})();
