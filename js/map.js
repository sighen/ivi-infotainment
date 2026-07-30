// Kakao Map 초기화 / 마커 / 경로 표시
// TODO: Kakao Map SDK, Kakao Mobility 길찾기 연동 (진행 예정 - map-nav 담당)

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.9780 }; // 서울시청 (fallback)
const ORIGIN_COLOR = '#3ea6ff';
const DESTINATION_COLOR = '#ff5a5a';

window.MapModule = (() => {
  let map = null;
  let currentMarker = null;
  let currentHeadingEl = null;
  let originLabel = null;
  let destinationMarker = null;
  let destinationLabel = null;
  let routeLine = null;
  let hasCenteredOnCurrent = false;
  let originAddressResolved = false;
  let lastHeading = null;

  function computeBearing(lat1, lng1, lat2, lng2) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const toDeg = (rad) => (rad * 180) / Math.PI;
    const dLng = toRad(lng2 - lng1);
    const y = Math.sin(dLng) * Math.cos(toRad(lat2));
    const x =
      Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
      Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  }

  function updateHeadingRotation() {
    if (!currentHeadingEl || !currentMarker) return;

    let angle = lastHeading;
    if ((angle === null || angle === undefined) && destinationMarker) {
      const from = currentMarker.getPosition();
      const to = destinationMarker.getPosition();
      angle = computeBearing(from.getLat(), from.getLng(), to.getLat(), to.getLng());
    }

    if (typeof angle === 'number' && !Number.isNaN(angle)) {
      currentHeadingEl.style.transform = `rotate(${angle}deg)`;
    }
  }

  function createLabelElement(text) {
    const div = document.createElement('div');
    div.textContent = text;
    div.style.cssText =
      'padding:4px 8px;background:#16191d;border:1px solid #2a2e34;border-radius:6px;' +
      'color:#eaecef;font-size:12px;white-space:nowrap;transform:translateY(-42px);';
    return div;
  }

  function createHeadingArrowElement() {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'width:28px;height:28px;transition:transform 0.3s ease;transform:rotate(0deg);';
    wrapper.innerHTML =
      '<svg width="28" height="28" viewBox="0 0 24 24">' +
      `<path d="M12 1.5 L19.5 21 L12 16.8 L4.5 21 Z" fill="${ORIGIN_COLOR}" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="round" />` +
      '</svg>';
    return wrapper;
  }

  function createMarkerImage(color) {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">' +
      `<path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24s16-13 16-24C32 7.163 24.837 0 16 0z" fill="${color}"/>` +
      '<circle cx="16" cy="16" r="6" fill="#ffffff"/>' +
      '</svg>';
    const src = `data:image/svg+xml;base64,${btoa(svg)}`;
    return new kakao.maps.MarkerImage(src, new kakao.maps.Size(32, 40), {
      offset: new kakao.maps.Point(16, 40),
    });
  }

  function reverseGeocode(lat, lng, callback) {
    if (!kakao.maps.services) {
      callback(null);
      return;
    }
    new kakao.maps.services.Geocoder().coord2Address(lng, lat, (result, status) => {
      if (status === kakao.maps.services.Status.OK && result[0]) {
        const addr = result[0].road_address
          ? result[0].road_address.address_name
          : result[0].address.address_name;
        callback(addr);
      } else {
        callback(null);
      }
    });
  }

  function loadKakaoSdk(appKey) {
    return new Promise((resolve, reject) => {
      if (window.kakao && window.kakao.maps) {
        resolve(window.kakao);
        return;
      }
      const script = document.createElement('script');
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`;
      script.onload = () => window.kakao.maps.load(() => resolve(window.kakao));
      script.onerror = () => reject(new Error('Kakao Map SDK 로드 실패'));
      document.head.appendChild(script);
    });
  }

  async function init(containerId) {
    const appKey = window.CONFIG && window.CONFIG.KAKAO_MAP_APP_KEY;
    if (!appKey) {
      console.error('[MapModule.init] CONFIG.KAKAO_MAP_APP_KEY가 비어있습니다. config.js를 확인하세요.');
      return;
    }

    await loadKakaoSdk(appKey);

    const container = document.getElementById(containerId);
    const center = new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
    map = new kakao.maps.Map(container, {
      center,
      level: 4,
    });
  }

  function setCurrentLocationMarker(lat, lng, heading) {
    if (!map) {
      console.error('[MapModule.setCurrentLocationMarker] map이 초기화되지 않았습니다. init() 먼저 호출하세요.');
      return;
    }

    const position = new kakao.maps.LatLng(lat, lng);

    if (currentMarker) {
      currentMarker.setPosition(position);
    } else {
      currentHeadingEl = createHeadingArrowElement();
      currentMarker = new kakao.maps.CustomOverlay({
        position,
        content: currentHeadingEl,
        xAnchor: 0.5,
        yAnchor: 0.5,
        zIndex: 10,
      });
      currentMarker.setMap(map);
    }

    if (typeof heading === 'number' && !Number.isNaN(heading)) {
      lastHeading = heading;
    }
    updateHeadingRotation();

    if (originLabel) {
      originLabel.setPosition(position);
    } else {
      originLabel = new kakao.maps.CustomOverlay({
        position,
        content: createLabelElement('출발지'),
        yAnchor: 1,
      });
      originLabel.setMap(map);
    }

    if (!hasCenteredOnCurrent) {
      map.setCenter(position);
      hasCenteredOnCurrent = true;
    }

    if (!originAddressResolved) {
      reverseGeocode(lat, lng, (address) => {
        if (address && originLabel) {
          originLabel.setContent(createLabelElement(address));
          originAddressResolved = true;
        }
      });
    }
  }

  async function showRoute(destLat, destLng) {
    if (!map || !currentMarker) {
      console.error('[MapModule.showRoute] 출발지(현재 위치 마커)가 없습니다. setCurrentLocationMarker를 먼저 호출하세요.');
      return null;
    }

    const restKey = window.CONFIG && window.CONFIG.KAKAO_MOBILITY_REST_KEY;
    if (!restKey) {
      console.error('[MapModule.showRoute] CONFIG.KAKAO_MOBILITY_REST_KEY가 비어있습니다. config.js를 확인하세요.');
      return null;
    }

    const origin = currentMarker.getPosition();

    try {
      const { data } = await axios.get('https://apis-navi.kakaomobility.com/v1/directions', {
        params: {
          origin: `${origin.getLng()},${origin.getLat()}`,
          destination: `${destLng},${destLat}`,
        },
        headers: { Authorization: `KakaoAK ${restKey}` },
      });

      const linePath = [];
      data.routes[0].sections.forEach((section) => {
        section.roads.forEach((road) => {
          for (let i = 0; i < road.vertexes.length; i += 2) {
            linePath.push(new kakao.maps.LatLng(road.vertexes[i + 1], road.vertexes[i]));
          }
        });
      });

      if (routeLine) {
        routeLine.setMap(null);
      }
      routeLine = new kakao.maps.Polyline({
        path: linePath,
        strokeWeight: 5,
        strokeColor: '#22c55e',
        strokeOpacity: 0.9,
        strokeStyle: 'solid',
      });
      routeLine.setMap(map);

      const bounds = new kakao.maps.LatLngBounds();
      linePath.forEach((point) => bounds.extend(point));
      map.setBounds(bounds, 35, 35, 35, 35);

      const summary = data.routes[0].summary;
      return { distance: summary.distance, duration: summary.duration };
    } catch (err) {
      console.error('[MapModule.showRoute] 경로 조회 실패', err);
      return null;
    }
  }

  function moveMarker(lat, lng, label) {
    if (!map) {
      console.error('[MapModule.moveMarker] map이 초기화되지 않았습니다. init() 먼저 호출하세요.');
      return;
    }

    const position = new kakao.maps.LatLng(lat, lng);

    if (destinationMarker) {
      destinationMarker.setPosition(position);
    } else {
      destinationMarker = new kakao.maps.Marker({ position, map, image: createMarkerImage(DESTINATION_COLOR) });
    }

    if (label) {
      if (destinationLabel) {
        destinationLabel.setPosition(position);
        destinationLabel.setContent(createLabelElement(label));
      } else {
        destinationLabel = new kakao.maps.CustomOverlay({
          position,
          content: createLabelElement(label),
          yAnchor: 1,
        });
        destinationLabel.setMap(map);
      }
    } else if (destinationLabel) {
      destinationLabel.setMap(null);
      destinationLabel = null;
    }

    map.setCenter(position);
    map.setLevel(3);

    updateHeadingRotation();
  }

  function locateCurrent() {
    if (!navigator.geolocation) {
      setCurrentLocationMarker(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
      return;
    }

    // watchPosition으로 실시간 추적: 이동 중 위치/진행방향(heading)이 갱신되면 마커도 계속 따라 움직임
    navigator.geolocation.watchPosition(
      (pos) => setCurrentLocationMarker(pos.coords.latitude, pos.coords.longitude, pos.coords.heading),
      (err) => {
        console.warn('[MapModule.locateCurrent] 위치 정보를 가져오지 못했습니다. 기본 위치로 대체합니다.', err.message);
        setCurrentLocationMarker(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  }

  function clearRoute() {
    if (routeLine) {
      routeLine.setMap(null);
      routeLine = null;
    }
  }

  return { init, setCurrentLocationMarker, showRoute, moveMarker, locateCurrent, clearRoute, DEFAULT_CENTER };
})();
