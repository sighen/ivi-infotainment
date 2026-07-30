// 전역 유틸 + 상태바 시간 갱신 (모든 화면 공통)

window.Utils = {
  debounce(fn, delay = 300) {
    let timer = null;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },
};

function updateStatusbarTime() {
  const el = document.getElementById('statusbar-time');
  if (!el) return;
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  el.textContent = `${hh}:${mm}`;
}

async function updateStatusbarWeather() {
  const el = document.getElementById('statusbar-weather');
  if (!el || !window.WeatherModule?.getSummary) return;
  try {
      const { temp, icon } = await window.WeatherModule.getSummary();
      el.textContent = `${icon} ${temp}°`;
  } catch (error) {
      console.error(error);
      el.textContent = '-- --°';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateStatusbarTime();
  updateStatusbarWeather();
  setInterval(updateStatusbarTime, 1000 * 10);
});
