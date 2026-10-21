import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// Publishable keys are preferred for new projects. Keep the legacy anon name as
// a temporary compatibility path while the Vercel environment is migrated.
const supabaseKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        },
    })
    : null;

export function requireSupabase() {
    if (!supabase) {
        throw new Error(
            'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
        );
    }

    return supabase;
}

// Supabase Auth는 세션을 `sb-<projectRef>-auth-token`에 보관한다. 레거시 Spring
// 시절의 `accessToken` 키는 더 이상 아무도 쓰지 않으므로, 그 키의 존재로 로그인
// 여부를 판단하던 코드는 전부 이 함수를 쓰도록 바꾼다.
//
// 동기 함수인 이유: 호출부 대부분이 fire-and-forget 동기 경로다. getSession()은
// 비동기라 최초 렌더에서 레이스가 나므로, 캐시된 세션과 영속 스토리지를 함께 본다.
const AUTH_STORAGE_KEY = supabaseUrl
    ? `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`
    : null;

let cachedSession = null;

if (supabase) {
    supabase.auth.getSession().then(({ data }) => {
        cachedSession = data.session;
    }).catch(() => {});
    supabase.auth.onAuthStateChange((_event, session) => {
        cachedSession = session;
    });
}

export function hasActiveSession() {
    if (cachedSession) return true;
    if (!AUTH_STORAGE_KEY || typeof localStorage === 'undefined') return false;
    return Boolean(localStorage.getItem(AUTH_STORAGE_KEY));
}

// pagehide처럼 await할 수 없는 지점에서 keepalive fetch를 직접 쏘기 위한 동기 접근자.
// 평상시에는 캐시된 세션을 쓰고, 캐시가 아직 안 찼으면 영속 스토리지를 파싱한다.
export function getAccessToken() {
    if (cachedSession?.access_token) return cachedSession.access_token;
    if (!AUTH_STORAGE_KEY || typeof localStorage === 'undefined') return null;
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw)?.access_token ?? null;
    } catch (_) {
        return null;
    }
}

export const supabaseRestUrl = supabaseUrl;
export const supabasePublishableKey = supabaseKey;

// Edge Function 호출 공통 래퍼.
//
// functions.invoke()는 4xx/5xx 응답을 FunctionsHttpError로 감싸면서 본문을
// data에 넣지 않는다. 함수가 돌려준 사용자용 메시지는 error.context(Response)
// 안에만 있으므로, 그 본문을 풀어 메시지를 살려서 던진다.
export async function invokeEdgeFunction(name, body) {
    const { data, error } = await requireSupabase().functions.invoke(name, { body });

    if (error) {
        let message = null;
        try {
            message = (await error.context?.json())?.error?.message ?? null;
        } catch (_) {
            message = null;
        }
        throw new Error(message || error.message || '요청 처리에 실패했습니다.');
    }

    if (data?.error?.message) throw new Error(data.error.message);

    return data;
}
