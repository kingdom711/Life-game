/**
 * 인증 API
 *
 * VITE_AUTH_PROVIDER=legacy (기본값)에서는 기존 Spring API를 사용합니다.
 * 모든 도메인 API를 Supabase로 이관하기 전에도 Auth만 안전하게 검증할 수 있도록
 * VITE_AUTH_PROVIDER=supabase를 별도 선택지로 제공합니다.
 */

import apiClient from './apiClient';
import { requireSupabase } from '../lib/supabase';

// The retired authentication adapter is retained only for import compatibility. Keep the public API surface
// stable while always routing identities through Supabase Auth.
const useSupabaseAuth = true;

const toAuthEmail = (identity) => {
    const normalized = identity?.trim().toLowerCase();

    if (!normalized) {
        throw new Error('아이디 또는 이메일을 입력해주세요.');
    }

    // 기존 이메일 로그인 UX와 신규 username 로그인 모두 지원합니다.
    if (normalized.includes('@')) {
        return normalized;
    }

    if (!/^[a-z0-9._-]{3,50}$/.test(normalized)) {
        throw new Error('아이디는 영문, 숫자, 점, 밑줄, 하이픈으로 3~50자여야 합니다.');
    }

    return `${normalized}@safety-quest.local`;
};

const throwIfError = (error) => {
    if (error) throw new Error(error.message || '인증 요청에 실패했습니다.');
};

const getSupabaseProfile = async (authUser) => {
    const client = requireSupabase();
    const { data, error } = await client
        .from('profiles')
        .select('id, username, name, contact_email, phone_number, role, status')
        .eq('id', authUser.id)
        .single();

    throwIfError(error);

    return {
        ...data,
        email: data.contact_email || authUser.email,
    };
};

const supabaseAuthApi = {
    signup: async ({ username, email, password, name }) => {
        const client = requireSupabase();
        const loginIdentity = username || email;
        const authEmail = toAuthEmail(loginIdentity);
        const { data, error } = await client.auth.signUp({
            email: authEmail,
            password,
            options: {
                data: {
                    username: loginIdentity,
                    name: name || loginIdentity,
                    // 실제 연락처 이메일은 인증/권한 정보와 분리해 profiles에 저장합니다.
                    contact_email: email?.includes('@') ? email : null,
                },
            },
        });

        throwIfError(error);

        return {
            // Email confirmation is enabled in some hosted projects. In that
            // case there is no session yet, so an RLS-protected profile query
            // must wait until the user confirms and signs in.
            user: data.user
                ? data.session
                    ? await getSupabaseProfile(data.user)
                    : {
                        id: data.user.id,
                        username: loginIdentity,
                        name: name || loginIdentity,
                        email: email || authEmail,
                    }
                : null,
            session: data.session,
            requiresEmailConfirmation: !data.session,
        };
    },

    login: async ({ username, password }) => {
        const client = requireSupabase();
        const { data, error } = await client.auth.signInWithPassword({
            email: toAuthEmail(username),
            password,
        });

        throwIfError(error);

        return {
            user: await getSupabaseProfile(data.user),
            session: data.session,
        };
    },

    logout: async () => {
        const { error } = await requireSupabase().auth.signOut();
        throwIfError(error);
    },

    refreshToken: async () => {
        const { data, error } = await requireSupabase().auth.refreshSession();
        throwIfError(error);
        return data.session;
    },

    getMe: async () => {
        const { data, error } = await requireSupabase().auth.getUser();
        throwIfError(error);

        if (!data.user) {
            throw new Error('로그인이 필요합니다.');
        }

        return getSupabaseProfile(data.user);
    },

    isAuthenticated: async () => {
        const { data, error } = await requireSupabase().auth.getSession();
        throwIfError(error);
        return Boolean(data.session);
    },

    requestPasswordReset: async (data) => {
        const email = typeof data === 'string' ? data : data.email;
        const { error } = await requireSupabase().auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/forgot-password`,
        });
        throwIfError(error);
    },

    resetPassword: async ({ newPassword }) => {
        const { data, error } = await requireSupabase().auth.updateUser({ password: newPassword });
        throwIfError(error);
        return data.user;
    },
};

const legacyAuthApi = {
    signup: async (data) => {
        const response = await apiClient.post('/auth/signup', data);
        if (response.accessToken) apiClient.token.setTokens(response.accessToken, response.refreshToken);
        return response;
    },

    login: async (credentials) => {
        const response = await apiClient.post('/auth/login', credentials);
        if (response.accessToken) apiClient.token.setTokens(response.accessToken, response.refreshToken);
        return response;
    },

    logout: async () => {
        try {
            await apiClient.post('/auth/logout');
        } finally {
            apiClient.token.clearTokens();
        }
    },

    refreshToken: async () => {
        const refreshToken = apiClient.token.getRefreshToken();
        if (!refreshToken) throw new Error('Refresh token not found');
        const response = await apiClient.post('/auth/refresh', { refreshToken });
        if (response.accessToken) apiClient.token.setTokens(response.accessToken, response.refreshToken);
        return response;
    },

    getMe: async () => apiClient.get('/auth/me'),
    isAuthenticated: () => Boolean(apiClient.token.getAccessToken()),
    requestPasswordReset: async (data) =>
        apiClient.post('/auth/password-reset/request', typeof data === 'string' ? { email: data } : data),
    resetPassword: async (data) => apiClient.post('/auth/password-reset/confirm', data),
};

const authApi = {
    ...(useSupabaseAuth ? supabaseAuthApi : legacyAuthApi),
    usesSupabase: useSupabaseAuth,
};

export default authApi;
