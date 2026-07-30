// 장소 검색 + 자동완성

(() => {
  const input = document.getElementById('search-input');
  const list = document.getElementById('search-result-list');
  const selectedBox = document.getElementById('selected-destination');
  const selectedName = selectedBox ? selectedBox.querySelector('.selected-name') : null;
  const selectedAddress = selectedBox ? selectedBox.querySelector('.selected-address') : null;

  if (!input || !list) return;

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
    selectedName.textContent = item.name;
    selectedAddress.textContent = item.address || '';
    selectedBox.classList.remove('hidden');
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
    list.innerHTML = '';

    historyMatches.forEach((keyword) => {
      const li = document.createElement('li');
      li.className = 'history-item';

      const text = document.createElement('span');
      text.className = 'history-text';
      text.appendChild(createClockIcon());
      text.appendChild(document.createTextNode(keyword));
      text.addEventListener('click', () => {
        input.value = keyword;
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
          window.MapModule.showRoute(item.lat, item.lng);
          input.value = item.name;
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

  const clearBtn = document.getElementById('search-clear-btn');
  const submitBtn = document.getElementById('search-submit-btn');

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
      input.value = '';
      clearBtn.classList.add('hidden');
      input.focus();
      runSearch('');
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', () => runSearch(input.value));
  }
})();
