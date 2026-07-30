// 화면 전환 라우팅

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
    window.location.href = target;
  },
};
