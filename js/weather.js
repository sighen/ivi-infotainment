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
  let forecastList = [];

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
  if (item.dt) return new Date((item.dt + timezoneOffset) * 1000);
  return new Date(item.dt_txt);
}


function formatDateText(date) {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const week = ['일', '월', '화', '수', '목', '금', '토'][date.getUTCDay()];
  return `${month}월 ${day}일 ${week}요일`;
}

function findCurrentForecastIndex(list) {
  const now = Math.floor(Date.now() / 1000);
  let index = 0;

  list.forEach((item, i) => {
    if (item.dt && item.dt <= now) index = i;
  });

  return index;
}

const HUMIDITY_ICON =
  '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69s-5.5 6.16-5.5 10.06a5.5 5.5 0 0 0 11 0C17.5 8.85 12 2.69 12 2.69z"/></svg>';

const WIND_ICON =
  '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round"><path d="M2 8h10a2 2 0 1 0-1.6-3.2"/>' +
  '<path d="M2 12h15a2 2 0 1 1-1.6 3.2"/><path d="M2 16h7"/></svg>';

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
      <div class="weather-header">
        <p class="weather-date">${dateText}</p>
        <p class="weather-time">${timeText}</p>
      </div>
      <img class="weather-icon" src="${iconUrl}" alt="${desc}" />
      <p class="weather-temp">${temp}°</p>
      <p class="weather-desc">${desc}</p>
      <div class="weather-stats">
        <span class="weather-stat">${HUMIDITY_ICON}${humidity}%</span>
        <span class="weather-stat">${WIND_ICON}${wind}m/s</span>
      </div>
    </article>
  `;
}


  
  // function getSummary() {
  //   // TODO: 실제 현재 날씨로 교체
  //   return { temp: '--°', icon: '⛅' };
  // }

function enableDragScroll(container) {
  if (container.dataset.dragBound) return;
  container.dataset.dragBound = 'true';

  let isDragging = false;
  let didDrag = false;
  let startX = 0;
  let startScrollLeft = 0;
  let pressedCard = null;

  container.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return; // 터치는 브라우저 네이티브 스크롤 그대로 사용
    isDragging = true;
    didDrag = false;
    startX = e.clientX;
    startScrollLeft = container.scrollLeft;
    pressedCard = e.target.closest('.weather-card'); // setPointerCapture 전에 실제 대상 저장
    container.classList.add('is-dragging');
    container.setPointerCapture(e.pointerId);
  });

  container.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const delta = e.clientX - startX;
    if (Math.abs(delta) > 5) didDrag = true;
    container.scrollLeft = startScrollLeft - delta;
  });

  function endDrag() {
    isDragging = false;
    container.classList.remove('is-dragging');
  }

  container.addEventListener('pointerup', () => {
    endDrag();
    if (!didDrag && pressedCard) {
      pressedCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    pressedCard = null;
  });
  container.addEventListener('pointercancel', endDrag);
  container.addEventListener('pointerleave', endDrag);

  container.addEventListener(
    'wheel',
    (e) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    },
    { passive: false }
  );
}

function updateCardScale(container) {
  const containerRect = container.getBoundingClientRect();
  const containerCenter = containerRect.left + containerRect.width / 2;
  const maxDistance = containerRect.width / 2;

  container.querySelectorAll('.weather-card').forEach((card) => {
    const rect = card.getBoundingClientRect();
    const cardCenter = rect.left + rect.width / 2;
    const ratio = Math.min(Math.abs(cardCenter - containerCenter) / maxDistance, 1);
    const scale = 1.08 - ratio * 0.18;
    card.style.transform = `scale(${scale.toFixed(3)})`;
    card.style.zIndex = String(Math.round((1 - ratio) * 10));
  });
}

function enableCenterScaling(container) {
  if (container.dataset.scaleBound) return;
  container.dataset.scaleBound = 'true';

  let rafId = null;
  container.addEventListener(
    'scroll',
    () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        updateCardScale(container);
        rafId = null;
      });
    },
    { passive: true }
  );
}

async function renderForecastCards(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  forecastList = await getForecastData();
  const edgePadding = '<div class="weather-card-placeholder"></div>'.repeat(2);
  container.innerHTML = edgePadding + forecastList.map((item) => createWeatherCard(item)).join('');
  enableDragScroll(container);
  enableCenterScaling(container);
  updateCardScale(container);
}




  return { getSummary, renderForecastCards };
})();
