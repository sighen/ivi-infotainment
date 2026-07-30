// 장소 검색 + 자동완성

(() => {
  const input = document.getElementById('search-input');
  const list = document.getElementById('search-result-list');

  if (!input || !list) return;

  const HISTORY_KEY = 'ivi_recent_searches';
  const HISTORY_LIMIT = 8;

  let places = null;

  function getPlaces() {
    if (!places) {
      places = new kakao.maps.services.Places();
    }
    return places;
  }

  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch {
      return [];
    }
  }

  function addToHistory(keyword) {
    const history = getHistory().filter((k) => k !== keyword);
    history.unshift(keyword);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, HISTORY_LIMIT)));
  }

  function renderHistory() {
    const history = getHistory();
    list.innerHTML = '';
    history.forEach((keyword) => {
      const li = document.createElement('li');
      li.className = 'history-item';
      li.textContent = `🕒 ${keyword}`;
      li.addEventListener('click', () => {
        input.value = keyword;
        handleSearch(keyword);
      });
      list.appendChild(li);
    });
  }

  function renderResults(items) {
    list.innerHTML = '';
    if (!items || items.length === 0) {
      const li = document.createElement('li');
      li.className = 'no-result';
      li.textContent = '검색 결과가 없습니다.';
      list.appendChild(li);
      return;
    }
    items.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item.name;
      li.addEventListener('click', () => {
        window.MapModule.moveMarker(item.lat, item.lng);
        window.MapModule.showRoute(item.lat, item.lng);
        input.value = item.name;
        list.innerHTML = '';
      });
      list.appendChild(li);
    });
  }

  const handleSearch = window.Utils.debounce((keyword) => {
    if (!keyword.trim()) {
      renderHistory();
      return;
    }

    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      console.error('[search] Kakao Maps SDK가 아직 로드되지 않았습니다.');
      return;
    }

    getPlaces().keywordSearch(keyword, (data, status) => {
      if (status !== kakao.maps.services.Status.OK) {
        renderResults([]);
        return;
      }
      addToHistory(keyword);
      renderResults(
        data.map((place) => ({
          name: place.place_name,
          lat: parseFloat(place.y),
          lng: parseFloat(place.x),
        }))
      );
    });
  }, 300);

  input.addEventListener('input', (e) => handleSearch(e.target.value));
  input.addEventListener('focus', () => {
    if (!input.value.trim()) renderHistory();
  });
})();
