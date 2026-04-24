/**
 * 날씨 연동 안전 팁 서비스 (Weather-linked Safety Tips)
 *
 * 기획서 4-6: 매일 아침 현재 날씨에 맞는 안전 팁을 자동 제공
 * - OpenWeatherMap API 연동
 * - localStorage 캐싱 (1시간 유효)
 * - API 실패 시 정적 팁 폴백
 */

const WEATHER_CACHE_KEY = 'safety_quest_weather_cache';
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1시간

// 기본 위치 (서울)
const DEFAULT_LOCATION = { lat: 37.5665, lng: 126.978 };

// OpenWeatherMap API 키 (환경변수)
const getWeatherApiKey = () => import.meta.env?.['VITE_OPENWEATHER_API_KEY'] || '';

/**
 * 날씨 조건별 안전 팁 매핑 테이블
 */
const WEATHER_SAFETY_TIPS = {
    rain: {
        icon: '🌧️',
        label: '비',
        tips: [
            '미끄럼방지 안전화를 꼭 착용하세요!',
            '작업장 바닥 물기를 수시로 제거하세요.',
            '우천 시 전기 장비 사용에 각별히 주의하세요.',
            '빗길 미끄러짐 사고에 주의하세요. 안전화 착용 필수!',
            '비 오는 날 고소작업 시 추락 위험이 높아집니다.'
        ]
    },
    snow: {
        icon: '🌨️',
        label: '눈/한파',
        tips: [
            '보온 장갑을 착용하고, 철골 구조물 결빙에 주의하세요.',
            '한파 시 보온 장비를 반드시 착용하세요.',
            '눈길 미끄러짐 사고에 주의! 미끄럼방지 안전화 필수.',
            '동파 위험 설비를 사전 점검하세요.',
            '한랭질환 예방을 위해 충분한 방한 조치를 하세요.'
        ]
    },
    heat: {
        icon: '🌡️',
        label: '폭염',
        tips: [
            '매 시간 10분 그늘 휴식, 물 충분히 섭취하세요!',
            '폭염 시 14시~17시 옥외 작업을 자제하세요.',
            '온열질환 초기 증상(어지러움, 두통)에 주의하세요.',
            '시원한 물을 자주 마시고 그늘에서 휴식하세요.',
            '고온 환경에서는 작업 강도를 낮추세요.'
        ]
    },
    wind: {
        icon: '💨',
        label: '강풍',
        tips: [
            '고소작업 중단을 검토하고, 가설구조물 고정을 확인하세요.',
            '강풍 시 크레인 작업을 중지하세요.',
            '낙하물 위험에 주의! 안전모를 반드시 착용하세요.',
            '강풍 시 가설 울타리, 비계 등의 고정 상태를 점검하세요.',
            '바람이 강한 날 자재 적치 상태를 확인하세요.'
        ]
    },
    fog: {
        icon: '🌫️',
        label: '안개/황사',
        tips: [
            '방진마스크를 착용하고, 시야 확보 후 중장비를 운행하세요.',
            '안개 시 차량 서행 및 전조등 점등을 확인하세요.',
            '황사 시 실외 작업을 최소화하세요.',
            '시야가 불량한 날 유도원을 반드시 배치하세요.',
            '미세먼지가 높은 날 방진마스크 착용은 필수입니다.'
        ]
    },
    clear: {
        icon: '☀️',
        label: '맑음',
        tips: [
            '3점 지지 원칙을 잊지 마세요!',
            '안전모는 작업 시작 전 항상 점검하세요.',
            '사다리 작업 시 4:1 각도를 유지하세요.',
            '밀폐 공간 작업 전 산소 농도를 확인하세요.',
            '중장비 작업 시 신호수의 신호를 반드시 확인하세요.',
            '작업 전 TBM(Tool Box Meeting)에 반드시 참여하세요.',
            '안전대는 추락 위험 2m 이상에서 반드시 착용하세요.',
            '전기 작업 시 검전기로 무전압을 확인하세요.'
        ]
    }
};

/**
 * 날씨 데이터로부터 안전 팁 카테고리 결정
 */
const getWeatherCategory = (weatherData) => {
    if (!weatherData) return 'clear';

    const { main, weather, wind } = weatherData;
    const temp = main?.temp;
    const windSpeed = wind?.speed;
    const weatherId = weather?.[0]?.id;
    const weatherMain = weather?.[0]?.main?.toLowerCase();

    // 강풍 (10m/s 이상)
    if (windSpeed >= 10) return 'wind';

    // 폭염 (33°C 이상)
    if (temp >= 33) return 'heat';

    // 비
    if (weatherMain === 'rain' || weatherMain === 'drizzle' || weatherMain === 'thunderstorm') return 'rain';

    // 눈/한파
    if (weatherMain === 'snow' || temp < 0) return 'snow';

    // 안개/황사
    if (weatherMain === 'mist' || weatherMain === 'fog' || weatherMain === 'haze' || weatherMain === 'dust' || weatherMain === 'smoke') return 'fog';

    return 'clear';
};

/**
 * 오늘 날짜 기반 팁 인덱스 (같은 날 같은 팁 보여주기)
 */
const getTodayTipIndex = (tipsLength) => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    return dayOfYear % tipsLength;
};

/**
 * 캐시에서 날씨 데이터 가져오기
 */
const getCachedWeather = () => {
    try {
        const cached = localStorage.getItem(WEATHER_CACHE_KEY);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp > CACHE_DURATION_MS) {
            localStorage.removeItem(WEATHER_CACHE_KEY);
            return null;
        }
        return data;
    } catch {
        return null;
    }
};

/**
 * 날씨 데이터 캐시에 저장
 */
const setCachedWeather = (data) => {
    try {
        localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch {
        // 캐시 저장 실패는 무시
    }
};

/**
 * 사용자 위치 가져오기 (Geolocation API)
 */
const getUserLocation = () => {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(DEFAULT_LOCATION);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            () => {
                resolve(DEFAULT_LOCATION);
            },
            { timeout: 5000, maximumAge: 600000 }
        );
    });
};

/**
 * OpenWeatherMap API로 날씨 데이터 가져오기
 */
const fetchWeatherFromAPI = async (lat, lng) => {
    const apiKey = getWeatherApiKey();

    if (!apiKey) return null;

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&lang=kr`
        );

        if (!response.ok) return null;

        return await response.json();
    } catch {
        return null;
    }
};

/**
 * 캐시 확인 후 날씨 데이터 가져오기 (메인 함수)
 */
export const getCachedOrFetchWeather = async () => {
    // 1. 캐시 확인
    const cached = getCachedWeather();
    if (cached) return cached;

    // 2. API 키가 없으면 null (폴백 팁 사용)
    if (!getWeatherApiKey()) return null;

    // 3. 위치 가져오기
    const location = await getUserLocation();

    // 4. API 호출
    const weatherData = await fetchWeatherFromAPI(location.lat, location.lng);

    // 5. 캐시 저장
    if (weatherData) {
        setCachedWeather(weatherData);
    }

    return weatherData;
};

/**
 * 날씨 데이터 기반 안전 팁 가져오기
 */
export const getWeatherSafetyTip = (weatherData) => {
    const category = getWeatherCategory(weatherData);
    const tipGroup = WEATHER_SAFETY_TIPS[category];
    const tipIndex = getTodayTipIndex(tipGroup.tips.length);

    return {
        icon: tipGroup.icon,
        label: tipGroup.label,
        tip: tipGroup.tips[tipIndex],
        temperature: weatherData?.main?.temp ? Math.round(weatherData.main.temp) : null,
        category
    };
};

/**
 * 정적 팁 폴백 (날씨 API 미사용 시)
 */
export const getStaticSafetyTip = () => {
    const tips = WEATHER_SAFETY_TIPS.clear.tips;
    const tipIndex = getTodayTipIndex(tips.length);
    return {
        icon: '💡',
        label: 'Tip',
        tip: tips[tipIndex],
        temperature: null,
        category: 'clear'
    };
};

/**
 * 날씨 팁 카테고리 전체 목록 (테스트용)
 */
export const getAllWeatherCategories = () => Object.keys(WEATHER_SAFETY_TIPS);
