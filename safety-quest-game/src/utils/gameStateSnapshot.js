/**
 * gameStateSnapshot - 게임 상태 스냅샷 동기화 (Phase 1: 스냅샷 백업)
 *
 * 정규화 테이블로 분리되지 않은 durable localStorage 데이터
 * (인벤토리/검교정/퀘스트진행/출석/교육이력 등)를 JSON 한 덩어리로
 * 서버에 백업/복원하여 기기 변경 시 유실을 방지한다.
 *
 * 모델: Local-first whole-snapshot LWW
 *  - 읽기(복원): 로그인 시 서버 스냅샷이 로컬보다 최신이면 durable 키들을 덮어씀
 *  - 쓰기(백업): 변경 발생 시 디바운스 push + 페이지 종료 시 flush
 *
 * 정규화(Phase 2)가 끝난 카테고리는 DURABLE_KEYS에서 제거하면 된다.
 */

import { storage } from './storage';
import gameProfileApi from '../api/gameProfileApi';
import config from '../config/environment';

// 로컬 스냅샷 메타(마지막 백업 시각) 저장 키 — 스코프 적용됨
const SNAPSHOT_META_KEY = 'safety_quest_snapshot_meta';

/**
 * 서버에 백업할 durable 로컬 데이터 키 목록.
 * - 캐시/휘발성(날씨, 세션 시청시간, 일일 스냅샷)은 제외
 * - 사진 등 대용량 blob은 payload 비대화 방지를 위해 제외(Phase 2에서 별도 처리)
 */
// 주의: level/points/streak/specialization 은 기존 정규화 동기화
// (AuthContext.hydrateLocalStorage/collectLocalData)가 소유하므로 제외한다.
export const DURABLE_KEYS = [
    // 프로필/진행
    'safety_quest_user_profile',
    'safety_quest_quest_progress',
    // 자산
    'safety_quest_inventory',
    'safety_quest_equipped_items',
    'safety_quest_inventory_instances',
    'safety_quest_calibration_logs',
    'safety_quest_points_history',
    // 출석
    'safety_quest_attendance_logs',
    'safety_quest_monthly_attendance',
    'safety_quest_weekly_progress',
    // 교육
    'safety_quest_education_progress',
    'safety_quest_education_history',
    'safety_quest_legal_hours',
    'safety_quest_quiz_attempts',
    'safety_quest_cumulative_watch_time',
    // 전직(활성/해금은 정규화가 소유, 진행/퀴즈만 스냅샷)
    'safety_quest_spec_progress',
    'safety_quest_spec_quiz_attempts',
    // 안전점수/로그
    'safety_quest_safety_score_history',
    'safety_quest_hazard_logs',
    'safety_quest_daily_instances',
    'safety_quest_hazard_id_logs',
    'safety_quest_action_records',
    'safety_quest_gems_logs',
    'safety_quest_checklists',
    'safety_quest_reviews',
];

const getLocalMeta = () => storage.get(SNAPSHOT_META_KEY, { updatedAt: 0 });
const setLocalMeta = (updatedAt) => storage.set(SNAPSHOT_META_KEY, { updatedAt });

/**
 * durable 키들을 모아 스냅샷 객체 생성 (존재하는 키만 포함)
 */
export const collectSnapshot = () => {
    const snapshot = {};
    DURABLE_KEYS.forEach((key) => {
        const value = storage.get(key, undefined);
        if (value !== undefined && value !== null) {
            snapshot[key] = value;
        }
    });
    return snapshot;
};

/**
 * 스냅샷 객체를 로컬에 반영 (durable 키 덮어쓰기)
 */
export const applySnapshot = (snapshot) => {
    if (!snapshot || typeof snapshot !== 'object') return 0;
    let applied = 0;
    Object.entries(snapshot).forEach(([key, value]) => {
        if (!DURABLE_KEYS.includes(key)) return; // 화이트리스트만 반영
        storage.set(key, value);
        applied += 1;
    });
    return applied;
};

let pushTimer = null;
let pushInFlight = false;

/**
 * 서버에 스냅샷 업로드 (즉시)
 */
export const pushSnapshot = async () => {
    if (pushInFlight) return;
    // 비로그인 상태면 백업 스킵 (401 노이즈 방지)
    if (typeof localStorage !== 'undefined' && !localStorage.getItem('accessToken')) return;
    pushInFlight = true;
    try {
        const snapshot = collectSnapshot();
        const clientUpdatedAt = Date.now();
        await gameProfileApi.pushStateSnapshot({
            payload: JSON.stringify(snapshot),
            clientUpdatedAt,
        });
        setLocalMeta(clientUpdatedAt);
    } catch (err) {
        // 오프라인/실패 시에는 다음 트리거에서 재시도 (로컬은 이미 최신)
        console.warn('[Snapshot] 백업 실패(다음 기회에 재시도):', err.message);
    } finally {
        pushInFlight = false;
    }
};

/**
 * 변경 발생 시 호출 — 디바운스 후 서버 백업 (기본 5초)
 */
export const scheduleSnapshotPush = (delay = 5000) => {
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(() => {
        pushTimer = null;
        pushSnapshot();
    }, delay);
};

/**
 * 서버 스냅샷을 가져와 로컬보다 최신이면 복원 (로그인/세션복원 시 호출)
 * @returns {Promise<boolean>} 복원이 일어났으면 true
 */
export const pullAndRestoreSnapshot = async () => {
    try {
        const result = await gameProfileApi.fetchStateSnapshot();
        if (!result || !result.payload) {
            // 서버에 스냅샷이 없으면(신규 기기 최초 로그인) 로컬을 즉시 업로드
            await pushSnapshot();
            return false;
        }

        const localMeta = getLocalMeta();
        const serverNewer = (result.clientUpdatedAt || 0) > (localMeta.updatedAt || 0);

        if (serverNewer) {
            const parsed = JSON.parse(result.payload);
            const count = applySnapshot(parsed);
            setLocalMeta(result.clientUpdatedAt);
            console.log(`[Snapshot] 서버 스냅샷 복원 완료: ${count}개 키`);
            return true;
        }

        // 로컬이 더 최신 → 서버에 백업
        await pushSnapshot();
        return false;
    } catch (err) {
        console.warn('[Snapshot] 복원 실패(오프라인 모드 유지):', err.message);
        return false;
    }
};

let unloadBound = false;

/**
 * 페이지 종료 시 마지막 백업을 보장하는 리스너 등록 (앱 1회 호출)
 */
export const bindSnapshotFlushOnUnload = () => {
    if (unloadBound || typeof window === 'undefined') return;
    unloadBound = true;

    const flush = () => {
        try {
            const snapshot = collectSnapshot();
            const clientUpdatedAt = Date.now();
            const body = JSON.stringify({ payload: JSON.stringify(snapshot), clientUpdatedAt });
            const token = localStorage.getItem('accessToken');
            const url = config.getApiUrl('/game-profile/me/state-snapshot');

            // sendBeacon은 PUT을 지원하지 않으므로 keepalive fetch 사용
            if (token) {
                fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body,
                    keepalive: true,
                }).catch(() => {});
                setLocalMeta(clientUpdatedAt);
            }
        } catch (_) {
            /* best-effort */
        }
    };

    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') flush();
    });

    // durable 데이터 변경 시 디바운스 백업
    window.addEventListener('safety_quest_storage_write', (e) => {
        const key = e?.detail?.key;
        if (key && DURABLE_KEYS.includes(key)) {
            scheduleSnapshotPush();
        }
    });
};
