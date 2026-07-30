// 장소 검색 + 자동완성
// TODO: Kakao 키워드 검색 연동, localStorage 기반 최근 검색 기록, 디바운싱 (진행 예정 - map-nav 담당)

(() => {
  const input = document.getElementById('search-input');
  const list = document.getElementById('search-result-list');

  if (!input || !list) return;

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
      });
      list.appendChild(li);
    });
  }

  const handleSearch = window.Utils.debounce((keyword) => {
    console.log(`[search] mock search: ${keyword}`);
    // TODO: Kakao 키워드 검색 API 호출 후 renderResults(results) 호출
    renderResults([]);
  }, 300);

  input.addEventListener('input', (e) => handleSearch(e.target.value));
})();
