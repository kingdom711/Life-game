/**
 * 위험 히트맵 매니저 (Hazard Heatmap Manager)
 *
 * 현장 구역별 위험 신고 데이터를 관리하고
 * 히트맵 시각화에 필요한 통계를 제공합니다.
 *
 * 기능:
 * - 위험 신고 데이터 CRUD (localStorage)
 * - 구역별 통계 (신고 건수, 심각도 분포, 주요 유형)
 * - 히트맵 인텐시티 계산 (0~1)
 * - 기간별 트렌드 데이터
 * - Mock 데이터 초기화
 */

const STORAGE_KEY = 'safety_quest_heatmap_data';

// ── 구역 정의 ──────────────────────────────────────────────
const ZONES = [
    { id: 'zone_a1', name: 'A동 1층', description: '1층 골조 작업 구역', coordinates: { x: 0, y: 0, width: 1, height: 1 } },
    { id: 'zone_a2', name: 'A동 2층', description: '2층 마감 작업 구역', coordinates: { x: 1, y: 0, width: 1, height: 1 } },
    { id: 'zone_b1', name: 'B동 1층', description: '1층 전기·설비 구역', coordinates: { x: 0, y: 1, width: 1, height: 1 } },
    { id: 'zone_b2', name: 'B동 2층', description: '2층 배관·덕트 구역', coordinates: { x: 1, y: 1, width: 1, height: 1 } },
    { id: 'zone_outdoor', name: '야외 작업장', description: '크레인 및 양중 작업 구역', coordinates: { x: 2, y: 0, width: 1, height: 1 } },
    { id: 'zone_storage', name: '자재 보관소', description: '건설 자재 적재 구역', coordinates: { x: 2, y: 1, width: 1, height: 1 } },
];

// ── 위험 유형 정의 ──────────────────────────────────────────
const HAZARD_TYPES = [
    { id: 'fall', label: '추락', icon: '🪜', color: '#ef4444' },
    { id: 'crush', label: '끼임', icon: '⚙️', color: '#f97316' },
    { id: 'electric', label: '감전', icon: '⚡', color: '#eab308' },
    { id: 'fire', label: '화재', icon: '🔥', color: '#dc2626' },
    { id: 'chemical', label: '화학물질', icon: '☣️', color: '#8b5cf6' },
];

const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'];

const SEVERITY_LABELS = {
    low: '낮음',
    medium: '보통',
    high: '높음',
    critical: '심각',
};

const SEVERITY_COLORS = {
    low: '#22c55e',
    medium: '#eab308',
    high: '#f97316',
    critical: '#ef4444',
};

// ── KST 유틸 ────────────────────────────────────────────────
function getKSTDate(date) {
    const d = date ? new Date(date) : new Date();
    return new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
}

function toKSTString(date) {
    const d = getKSTDate(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function getKSTNow() {
    return getKSTDate();
}

// ── localStorage 접근 ────────────────────────────────────────
function loadReports() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function saveReports(reports) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    } catch (e) {
        console.error('[heatmapManager] 저장 실패:', e);
    }
}

// ── Mock 데이터 생성 ─────────────────────────────────────────
const MOCK_REPORTERS = ['김안전', '이현장', '박기술', '최감독', '정작업', '한관리', '오점검'];

const MOCK_DESCRIPTIONS = {
    fall: [
        '비계 상부 안전난간 미설치 구간 발견',
        '개구부 덮개 미설치로 추락 위험',
        '사다리 고정 불량 — 미끄럼 위험',
        '안전대 미착용 작업자 확인',
        '작업발판 균열 발생',
    ],
    crush: [
        '회전 기계 방호덮개 미설치',
        '크레인 선회 반경 내 작업자 진입',
        '컨베이어 끼임 방호장치 고장',
        '문 개폐 구간 손가락 끼임 위험',
        '리프트 이동 경로 미확보',
    ],
    electric: [
        '전선 피복 벗겨짐 — 감전 위험',
        '분전반 접지 불량',
        '습기 많은 구역 콘센트 방수 미비',
        '가설 전기 배선 정리 불량',
        '용접기 누전 차단기 미작동',
    ],
    fire: [
        '용접 작업 주변 인화물질 미격리',
        '소화기 유효기간 만료',
        '전기 배선 과부하 발열',
        '가연성 도료 보관 부적합',
        '화기 사용 구역 감시자 미배치',
    ],
    chemical: [
        '화학물질 경고 표지 미부착',
        'MSDS 비치 미흡',
        '유기용제 보관함 환기 불량',
        '폐유 처리 용기 미밀봉',
        '산·알칼리 혼재 보관 위험',
    ],
};

/**
 * 주어진 범위 내 랜덤 정수
 */
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Mock 데이터 초기화 (30개 내외의 위험 신고)
 */
export function initMockData() {
    const existing = loadReports();
    if (existing.length > 0) return existing;

    const now = getKSTNow();
    const reports = [];

    // 구역별 가중치 — 일부 구역에 더 많은 신고가 쌓이도록
    const zoneWeights = [
        { zoneId: 'zone_a2', weight: 7 },
        { zoneId: 'zone_outdoor', weight: 6 },
        { zoneId: 'zone_a1', weight: 5 },
        { zoneId: 'zone_b2', weight: 4 },
        { zoneId: 'zone_b1', weight: 4 },
        { zoneId: 'zone_storage', weight: 4 },
    ];

    const weightedZones = [];
    zoneWeights.forEach(({ zoneId, weight }) => {
        for (let i = 0; i < weight; i++) weightedZones.push(zoneId);
    });

    const typeIds = HAZARD_TYPES.map(t => t.id);

    for (let i = 0; i < 30; i++) {
        const daysAgo = randInt(0, 89);
        const reportDate = new Date(now);
        reportDate.setDate(reportDate.getDate() - daysAgo);
        reportDate.setHours(randInt(7, 17), randInt(0, 59), 0, 0);

        const type = pickRandom(typeIds);
        const zoneId = pickRandom(weightedZones);
        const severity = pickRandom(SEVERITY_LEVELS);
        const resolved = daysAgo > 7 ? Math.random() < 0.8 : Math.random() < 0.3;

        reports.push({
            id: `hzd_${Date.now()}_${i}_${randInt(1000, 9999)}`,
            zone: zoneId,
            type,
            severity,
            reportedAt: reportDate.toISOString(),
            description: pickRandom(MOCK_DESCRIPTIONS[type]),
            reporter: pickRandom(MOCK_REPORTERS),
            resolved,
        });
    }

    // 날짜순 정렬 (최신 먼저)
    reports.sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));

    saveReports(reports);
    return reports;
}

// ── 필터링 ───────────────────────────────────────────────────
/**
 * 기간 필터에 따른 시작 날짜 반환
 */
function getPeriodStartDate(period) {
    const now = getKSTNow();
    switch (period) {
        case '1w':
            return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        case '1m':
            return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        case '3m':
        default:
            return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    }
}

/**
 * 위험 신고 목록 조회 (필터 적용)
 * @param {Object} filters - { period: '1w'|'1m'|'3m', type: 'all'|string, zone: 'all'|string }
 * @returns {Array} 필터링된 신고 목록
 */
export function getHazardReports(filters = {}) {
    const { period = '3m', type = 'all', zone = 'all' } = filters;
    let reports = loadReports();

    // 기간 필터
    const startDate = getPeriodStartDate(period);
    reports = reports.filter(r => new Date(r.reportedAt) >= startDate);

    // 유형 필터
    if (type !== 'all') {
        reports = reports.filter(r => r.type === type);
    }

    // 구역 필터
    if (zone !== 'all') {
        reports = reports.filter(r => r.zone === zone);
    }

    return reports.sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));
}

// ── 구역 통계 ────────────────────────────────────────────────
/**
 * 각 구역의 통계 반환
 * @param {Object} filters - 필터 옵션 (getHazardReports와 동일)
 * @returns {Array<Object>} 구역별 통계 배열
 */
export function getZoneStats(filters = {}) {
    const reports = getHazardReports(filters);

    return ZONES.map(zone => {
        const zoneReports = reports.filter(r => r.zone === zone.id);
        const unresolvedCount = zoneReports.filter(r => !r.resolved).length;

        // 심각도 분포
        const severityBreakdown = {};
        SEVERITY_LEVELS.forEach(s => {
            severityBreakdown[s] = zoneReports.filter(r => r.severity === s).length;
        });

        // 가장 빈번한 유형
        const typeCounts = {};
        zoneReports.forEach(r => {
            typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
        });
        const mostCommonType = Object.entries(typeCounts)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || null;

        return {
            zoneId: zone.id,
            zoneName: zone.name,
            totalReports: zoneReports.length,
            unresolvedCount,
            severityBreakdown,
            mostCommonType,
        };
    });
}

// ── 히트맵 데이터 ────────────────────────────────────────────
/**
 * 히트맵 인텐시티 계산
 * 각 구역의 신고 밀도를 0~1로 정규화
 * @param {Object} filters - 필터 옵션
 * @returns {Array<Object>} { zoneId, zoneName, intensity, reportCount, unresolvedCount }
 */
export function getHeatmapData(filters = {}) {
    const stats = getZoneStats(filters);
    const maxReports = Math.max(...stats.map(s => s.totalReports), 1);

    return stats.map(stat => ({
        zoneId: stat.zoneId,
        zoneName: stat.zoneName,
        intensity: stat.totalReports / maxReports,
        reportCount: stat.totalReports,
        unresolvedCount: stat.unresolvedCount,
        severityBreakdown: stat.severityBreakdown,
        mostCommonType: stat.mostCommonType,
    }));
}

// ── 신고 추가 ────────────────────────────────────────────────
/**
 * 새 위험 신고 추가
 * @param {Object} report - { zone, type, severity, description, reporter }
 * @returns {Object} 생성된 신고 객체
 */
export function addHazardReport(report) {
    const reports = loadReports();
    const now = new Date();

    const newReport = {
        id: `hzd_${Date.now()}_${randInt(1000, 9999)}`,
        zone: report.zone,
        type: report.type,
        severity: report.severity || 'medium',
        reportedAt: now.toISOString(),
        description: report.description || '',
        reporter: report.reporter || '익명',
        resolved: false,
    };

    reports.unshift(newReport);
    saveReports(reports);
    return newReport;
}

// ── 참조 데이터 ──────────────────────────────────────────────
/**
 * 위험 유형 목록
 */
export function getHazardTypes() {
    return [...HAZARD_TYPES];
}

/**
 * 구역 목록
 */
export function getZones() {
    return ZONES.map(z => ({ ...z }));
}

// ── 트렌드 데이터 ────────────────────────────────────────────
/**
 * 기간별 트렌드 데이터 (일별/주별 신고 건수)
 * @param {'1w'|'1m'|'3m'} period
 * @returns {Array<Object>} { label, count, date }
 */
export function getTimelineTrend(period = '1m') {
    const reports = loadReports();
    const now = getKSTNow();

    if (period === '1w') {
        // 최근 7일 — 일별
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = toKSTString(d);
            const dayLabel = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];

            const count = reports.filter(r => toKSTString(r.reportedAt) === dateStr).length;
            days.push({ label: dayLabel, count, date: dateStr });
        }
        return days;
    }

    if (period === '1m') {
        // 최근 4주 — 주별
        const weeks = [];
        for (let w = 3; w >= 0; w--) {
            const weekEnd = new Date(now);
            weekEnd.setDate(weekEnd.getDate() - w * 7);
            const weekStart = new Date(weekEnd);
            weekStart.setDate(weekStart.getDate() - 6);

            const count = reports.filter(r => {
                const rd = new Date(r.reportedAt);
                return rd >= weekStart && rd <= weekEnd;
            }).length;

            const startLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
            weeks.push({ label: `${startLabel}~`, count, date: toKSTString(weekStart) });
        }
        return weeks;
    }

    // 3m — 월별
    const months = [];
    for (let m = 2; m >= 0; m--) {
        const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);

        const count = reports.filter(r => {
            const rd = new Date(r.reportedAt);
            return rd >= d && rd <= monthEnd;
        }).length;

        months.push({
            label: `${d.getMonth() + 1}월`,
            count,
            date: toKSTString(d),
        });
    }
    return months;
}

// ── 내보내기 (상수) ──────────────────────────────────────────
export { SEVERITY_LABELS, SEVERITY_COLORS, SEVERITY_LEVELS };
