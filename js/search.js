// 장소 검색 + 자동완성

(() => {
  const input = document.getElementById('search-input');
  const list = document.getElementById('search-result-list');
  const selectedBox = document.getElementById('selected-destination');
  const selectedName = selectedBox ? selectedBox.querySelector('.selected-name') : null;
  const selectedAddress = selectedBox ? selectedBox.querySelector('.selected-address') : null;
  const routeInfo = document.getElementById('route-info');
  const routeGuideBtn = document.getElementById('route-guide-btn');
  const routeCancelBtn = document.getElementById('route-cancel-btn');
  const clearBtn = document.getElementById('search-clear-btn');
  const submitBtn = document.getElementById('search-submit-btn');
  const backBtn = document.getElementById('destination-back-btn');

  if (!input || !list) return;

  let selectedItem = null;
  let lastRenderArgs = { historyMatches: [], placeItems: [] };

  function setInputValue(value) {
    input.value = value;
    if (clearBtn) clearBtn.classList.toggle('hidden', !value);
  }

  function formatDuration(distanceMeters, durationSeconds) {
    const km = (distanceMeters / 1000).toFixed(1);
    const minutes = Math.round(durationSeconds / 60);
    return `${km}km · 약 ${minutes}분`;
  }

  function createClockIcon() {
    const span = document.createElement('span');
    span.className = 'history-icon';
    span.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" /></svg>';
    return span;
  }

  function showSelectedDestination(item) {
    if (!selectedBox) return;
    selectedItem = item;
    selectedName.textContent = item.name;
    selectedAddress.textContent = item.address || '';

    window.MapModule.clearRoute();
    if (routeInfo) {
      routeInfo.textContent = '';
      routeInfo.classList.add('hidden');
    }
    if (routeGuideBtn) routeGuideBtn.classList.remove('hidden');
    if (routeCancelBtn) routeCancelBtn.classList.add('hidden');

    selectedBox.classList.remove('hidden');
  }

  function hideSelectedDestination() {
    if (!selectedBox) return;
    selectedItem = null;
    selectedBox.classList.add('hidden');

    window.MapModule.clearRoute();
    if (routeInfo) {
      routeInfo.textContent = '';
      routeInfo.classList.add('hidden');
    }
    if (routeGuideBtn) routeGuideBtn.classList.remove('hidden');
    if (routeCancelBtn) routeCancelBtn.classList.add('hidden');
  }

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

  function removeFromHistory(keyword) {
    const history = getHistory().filter((k) => k !== keyword);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  function renderList(historyMatches, placeItems) {
    lastRenderArgs = { historyMatches, placeItems };
    list.innerHTML = '';

    historyMatches.forEach((keyword) => {
      const li = document.createElement('li');
      li.className = 'history-item';

      const text = document.createElement('span');
      text.className = 'history-text';
      text.appendChild(createClockIcon());
      text.appendChild(document.createTextNode(keyword));
      text.addEventListener('click', () => {
        setInputValue(keyword);
        handleSearch(keyword);
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'history-delete';
      deleteBtn.setAttribute('aria-label', '검색 기록 삭제');
      deleteBtn.textContent = '×';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeFromHistory(keyword);
        li.remove();
      });

      li.appendChild(text);
      li.appendChild(deleteBtn);
      list.appendChild(li);
    });

    if (placeItems && placeItems.length > 0) {
      placeItems.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item.name;
        li.addEventListener('click', () => {
          window.MapModule.moveMarker(item.lat, item.lng, item.name);
          setInputValue(item.name);
          list.innerHTML = '';
          showSelectedDestination(item);
        });
        list.appendChild(li);
      });
      return;
    }

    if (historyMatches.length === 0) {
      const li = document.createElement('li');
      li.className = 'no-result';
      li.textContent = '검색 결과가 없습니다.';
      list.appendChild(li);
    }
  }

  function runSearch(keyword) {
    const trimmed = keyword.trim();

    if (!trimmed) {
      hideSelectedDestination();
      renderList(getHistory(), []);
      return;
    }

    const historyMatches = getHistory().filter((k) => k.includes(trimmed));

    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      console.error('[search] Kakao Maps SDK가 아직 로드되지 않았습니다.');
      renderList(historyMatches, []);
      return;
    }

    getPlaces().keywordSearch(trimmed, (data, status) => {
      if (status !== kakao.maps.services.Status.OK) {
        renderList(historyMatches, []);
        return;
      }
      addToHistory(trimmed);
      renderList(
        historyMatches,
        data.map((place) => ({
          name: place.place_name,
          address: place.road_address_name || place.address_name,
          lat: parseFloat(place.y),
          lng: parseFloat(place.x),
        }))
      );
    });
  }

  const handleSearch = window.Utils.debounce(runSearch, 300);

  input.addEventListener('input', (e) => {
    if (clearBtn) clearBtn.classList.toggle('hidden', !e.target.value);
    handleSearch(e.target.value);
  });

  input.addEventListener('focus', () => {
    if (!input.value.trim()) renderList(getHistory(), []);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runSearch(input.value);
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      setInputValue('');
      input.focus();
      runSearch('');
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', () => runSearch(input.value));
  }

  if (routeGuideBtn) {
    routeGuideBtn.addEventListener('click', async () => {
      if (!selectedItem) return;
      routeGuideBtn.disabled = true;
      const summary = await window.MapModule.showRoute(selectedItem.lat, selectedItem.lng);
      routeGuideBtn.disabled = false;

      if (!routeInfo) return;
      if (summary) {
        routeInfo.textContent = formatDuration(summary.distance, summary.duration);
        routeInfo.classList.remove('hidden');
        routeGuideBtn.classList.add('hidden');
        if (routeCancelBtn) routeCancelBtn.classList.remove('hidden');
      } else {
        routeInfo.textContent = '경로를 찾을 수 없습니다.';
        routeInfo.classList.remove('hidden');
      }
    });
  }

  if (routeCancelBtn) {
    routeCancelBtn.addEventListener('click', () => {
      window.MapModule.clearRoute();
      if (routeInfo) {
        routeInfo.textContent = '';
        routeInfo.classList.add('hidden');
      }
      routeCancelBtn.classList.add('hidden');
      if (routeGuideBtn) routeGuideBtn.classList.remove('hidden');
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (selectedBox) selectedBox.classList.add('hidden');
      renderList(lastRenderArgs.historyMatches, lastRenderArgs.placeItems);
    });
  }
})();
