// 화면 전환 라우팅

const PAGE_ORDER = ['main', 'nav', 'weather'];
const NAV_DIRECTION_KEY = 'ivi_nav_direction';

window.AppRouter = {
  goTo(page) {
    const routes = {
      main: 'index.html',
      nav: 'nav.html',
      weather: 'weather.html',
    };
    const target = routes[page];
    if (!target) {
      console.warn(`[AppRouter] unknown page: ${page}`);
      return;
    }

    const currentIndex = PAGE_ORDER.indexOf(document.body.dataset.page);
    const targetIndex = PAGE_ORDER.indexOf(page);
    const direction = targetIndex >= currentIndex ? 'forward' : 'backward';
    try {
      sessionStorage.setItem(NAV_DIRECTION_KEY, direction);
    } catch (e) {
      // sessionStorage 사용 불가 시 방향 없이 기본 애니메이션으로 진행
    }

    window.location.href = target;
  },
};
