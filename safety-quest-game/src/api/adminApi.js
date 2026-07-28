import apiClient from './apiClient';
import authApi from './authApi';
import { requireSupabase } from '../lib/supabase';

const throwIfError = (error) => {
    if (error) throw error;
};

const toMap = (rows = [], key = 'user_id') => new Map(rows.map((row) => [row[key], row]));
const dateStart = (value) => value ? `${value}T00:00:00.000Z` : null;
const dateEnd = (value) => value ? `${value}T23:59:59.999Z` : null;

const getAdminData = async (params = {}) => {
    const client = requireSupabase();
    const from = dateStart(params.from);
    const to = dateEnd(params.to);
    const range = (query, column) => {
        if (from) query.gte(column, from);
        if (to) query.lte(column, to);
        return query;
    };
    const [profilesResult, pointsResult, goldResult, membershipsResult, attendanceResult, educationResult,
        checklistsResult, hazardsResult, hazardAcksResult, workStopsResult, pointTransactionsResult,
        goldTransactionsResult, redemptionsResult, rewardsResult] = await Promise.all([
        client.from('profiles').select('id, username, name, role, status'),
        client.from('user_points').select('user_id, balance, total_earned, total_spent'),
        client.from('user_gold').select('user_id, balance, total_earned, total_spent'),
        client.from('team_memberships').select('user_id, team_id, status, teams(id, name)').eq('status', 'APPROVED'),
        range(client.from('attendance_records').select('user_id, created_at'), 'created_at'),
        range(client.from('education_completions').select('user_id, quiz_score, completed_at'), 'completed_at'),
        range(client.from('checklists').select('user_id, status, submitted_at'), 'submitted_at'),
        range(client.from('hazard_cycles').select('reporter_id, status, reported_at'), 'reported_at'),
        range(client.from('hazard_cycle_acks').select('user_id, created_at'), 'created_at'),
        range(client.from('work_stop_reports').select('reporter_id, status, created_at'), 'created_at'),
        range(client.from('point_transactions').select('user_id, amount, transaction_type, created_at'), 'created_at'),
        range(client.from('gold_transactions').select('user_id, amount, transaction_type, created_at'), 'created_at'),
        range(client.from('reward_redemptions').select('id, user_id, reward_id, gold_paid, status, created_at'), 'created_at'),
        client.from('reward_items').select('id, name, gold_price, cash_value, remaining_quantity'),
    ]);
    [profilesResult, pointsResult, goldResult, membershipsResult, attendanceResult, educationResult,
        checklistsResult, hazardsResult, hazardAcksResult, workStopsResult, pointTransactionsResult,
        goldTransactionsResult, redemptionsResult, rewardsResult].forEach(({ error }) => throwIfError(error));
    return {
        profiles: profilesResult.data || [], points: pointsResult.data || [], gold: goldResult.data || [],
        memberships: membershipsResult.data || [], attendance: attendanceResult.data || [],
        education: educationResult.data || [], checklists: checklistsResult.data || [],
        hazards: hazardsResult.data || [], hazardAcks: hazardAcksResult.data || [],
        workStops: workStopsResult.data || [], pointTransactions: pointTransactionsResult.data || [],
        goldTransactions: goldTransactionsResult.data || [], redemptions: redemptionsResult.data || [],
        rewards: rewardsResult.data || [],
    };
};

const createEngagement = (data, params = {}) => {
    const countBy = (rows, key) => rows.reduce((map, row) => map.set(row[key], (map.get(row[key]) || 0) + 1), new Map());
    const sumBy = (rows, key, value, predicate = () => true) => rows.reduce((map, row) => {
        if (predicate(row)) map.set(row[key], (map.get(row[key]) || 0) + Number(row[value] || 0));
        return map;
    }, new Map());
    const pointMap = toMap(data.points);
    const membershipMap = new Map(data.memberships.map((row) => [row.user_id, row]));
    const attendance = countBy(data.attendance, 'user_id');
    const education = countBy(data.education, 'user_id');
    const checklists = countBy(data.checklists, 'user_id');
    const hazards = countBy(data.hazards, 'reporter_id');
    const acks = countBy(data.hazardAcks, 'user_id');
    const workStops = countBy(data.workStops, 'reporter_id');
    const earned = sumBy(data.pointTransactions, 'user_id', 'amount', (row) => row.transaction_type === 'EARN');
    const lastActivity = new Map();
    const addActivity = (rows, userKey, timeKey) => rows.forEach((row) => {
        const id = row[userKey]; const value = row[timeKey];
        if (id && value && (!lastActivity.get(id) || lastActivity.get(id) < value)) lastActivity.set(id, value);
    });
    addActivity(data.attendance, 'user_id', 'created_at'); addActivity(data.education, 'user_id', 'completed_at');
    addActivity(data.checklists, 'user_id', 'submitted_at'); addActivity(data.hazards, 'reporter_id', 'reported_at');
    addActivity(data.hazardAcks, 'user_id', 'created_at'); addActivity(data.workStops, 'reporter_id', 'created_at');
    const keyword = (params.keyword || '').trim().toLowerCase();
    const rows = data.profiles.map((profile) => {
        const member = membershipMap.get(profile.id); const team = member?.teams;
        const row = {
            userId: profile.id, username: profile.username, name: profile.name, role: profile.role,
            teamId: member?.team_id || null, teamName: team?.name || '-', attendanceCount: attendance.get(profile.id) || 0,
            educationCompletions: education.get(profile.id) || 0, questCompletions: checklists.get(profile.id) || 0,
            hazardReports: hazards.get(profile.id) || 0, hazardAcks: acks.get(profile.id) || 0,
            workStopReports: workStops.get(profile.id) || 0, pointsEarned: earned.get(profile.id) || 0,
            averageQuizScore: 0, questProgressCount: checklists.get(profile.id) || 0, lastActivityAt: lastActivity.get(profile.id) || null,
        };
        const completions = data.education.filter((item) => item.user_id === profile.id);
        row.averageQuizScore = completions.length ? Math.round(completions.reduce((sum, item) => sum + item.quiz_score, 0) / completions.length) : 0;
        row.engagementScore = row.attendanceCount * 4 + row.educationCompletions * 10 + row.questCompletions * 5 + row.hazardReports * 12 + row.hazardAcks * 3 + row.workStopReports * 10;
        return row;
    }).filter((row) => (!params.teamId || row.teamId === params.teamId) && (!keyword || [row.name, row.username, row.teamName].some((value) => value?.toLowerCase().includes(keyword))));
    const sort = params.sort || 'score';
    const sorters = { score: (a, b) => b.engagementScore - a.engagementScore, last: (a, b) => String(b.lastActivityAt || '').localeCompare(String(a.lastActivityAt || '')), attendance: (a, b) => b.attendanceCount - a.attendanceCount, education: (a, b) => b.educationCompletions - a.educationCompletions, hazard: (a, b) => b.hazardReports - a.hazardReports, points: (a, b) => b.pointsEarned - a.pointsEarned, name: (a, b) => a.name.localeCompare(b.name, 'ko-KR') };
    rows.sort(sorters[sort] || sorters.score);
    return { from: params.from || null, to: params.to || null, participants: rows, summary: { totalParticipants: rows.length, activeParticipants: rows.filter((row) => row.engagementScore > 0).length, inactiveParticipants: rows.filter((row) => row.engagementScore === 0).length, averageEngagementScore: rows.length ? Math.round(rows.reduce((sum, row) => sum + row.engagementScore, 0) / rows.length) : 0, totalEducationCompletions: rows.reduce((sum, row) => sum + row.educationCompletions, 0), totalHazardReports: rows.reduce((sum, row) => sum + row.hazardReports, 0) } };
};

const supabaseAdminApi = {
    getDashboardSummary: async () => {
        const data = await getAdminData({ from: new Date().toISOString().slice(0, 10), to: new Date().toISOString().slice(0, 10) });
        const active = (statuses) => data.workStops.filter((row) => statuses.includes(row.status));
        const pending = data.redemptions.filter((row) => row.status === 'PENDING');
        const byHazard = data.workStops.reduce((map, row) => ({ ...map, [row.status]: (map[row.status] || 0) + 1 }), {});
        return { totalParticipants: data.profiles.length, activeParticipants: data.profiles.length, inactiveParticipants: 0, averageEngagementScore: 0, totalEducationCompletions: data.education.length, totalHazardReports: data.hazards.length, totalPointBalance: data.points.reduce((sum, row) => sum + row.balance, 0), periodPointsEarned: data.pointTransactions.filter((row) => row.transaction_type === 'EARN').reduce((sum, row) => sum + row.amount, 0), periodPointsSpent: data.pointTransactions.filter((row) => row.transaction_type === 'SPEND').reduce((sum, row) => sum + row.amount, 0), totalGoldBalance: data.gold.reduce((sum, row) => sum + row.balance, 0), pendingRewardRequests: pending.length, pendingRewardGold: pending.reduce((sum, row) => sum + row.gold_paid, 0), pendingRewardCashValue: 0, metrics: { totalUsers: data.profiles.length, openWorkStopReports: active(['reported', 'confirmed', 'investigating']).length, pendingRewardRequests: pending.length, openHazardCycles: data.hazards.filter((row) => !['ACTION_COMPLETED', 'EXPIRED', 'REJECTED'].includes(row.status)).length, todayEducationCompletions: data.education.length, todayChecklistSubmissions: data.checklists.length, todayHazardReports: data.hazards.length }, metricDetails: {}, actionItems: [], recentActivities: [], workStopByHazardType: byHazard };
    },
    getParticipantEngagement: async (params = {}) => createEngagement(await getAdminData(params), params),
    getPointRewardDashboard: async (params = {}) => {
        const data = await getAdminData(params); const points = toMap(data.points); const gold = toMap(data.gold); const membership = new Map(data.memberships.map((row) => [row.user_id, row])); const rewards = toMap(data.rewards, 'id');
        const sum = (rows, id, type) => rows.filter((row) => row.user_id === id && row.transaction_type === type).reduce((total, row) => total + row.amount, 0);
        const users = data.profiles.map((profile) => { const p = points.get(profile.id) || {}; const g = gold.get(profile.id) || {}; const pending = data.redemptions.filter((row) => row.user_id === profile.id && row.status === 'PENDING'); return { userId: profile.id, name: profile.name, teamName: membership.get(profile.id)?.teams?.name || '-', pointBalance: p.balance || 0, totalPointsEarned: p.total_earned || 0, totalPointsSpent: p.total_spent || 0, periodPointsEarned: sum(data.pointTransactions, profile.id, 'EARN'), periodPointsSpent: sum(data.pointTransactions, profile.id, 'SPEND'), goldBalance: g.balance || 0, periodGoldEarned: sum(data.goldTransactions, profile.id, 'EARN'), periodGoldSpent: sum(data.goldTransactions, profile.id, 'SPEND'), pendingRewardRequests: pending.length, pendingRewardGold: pending.reduce((total, row) => total + row.gold_paid, 0), lastPointActivityAt: data.pointTransactions.filter((row) => row.user_id === profile.id).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0]?.created_at || null }; });
        const sort = params.sort || 'balance'; const key = { balance: 'pointBalance', earned: 'periodPointsEarned', spent: 'periodPointsSpent', gold: 'goldBalance', pending: 'pendingRewardRequests', last: 'lastPointActivityAt' }[sort]; users.sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name, 'ko-KR') : (typeof a[key] === 'string' ? String(b[key] || '').localeCompare(String(a[key] || '')) : b[key] - a[key]));
        const pendingRows = data.redemptions.filter((row) => row.status === 'PENDING'); return { from: params.from || null, to: params.to || null, users, summary: { totalPointBalance: users.reduce((total, row) => total + row.pointBalance, 0), periodPointsEarned: users.reduce((total, row) => total + row.periodPointsEarned, 0), periodPointsSpent: users.reduce((total, row) => total + row.periodPointsSpent, 0), totalGoldBalance: users.reduce((total, row) => total + row.goldBalance, 0), pendingRewardRequests: pendingRows.length, pendingRewardGold: pendingRows.reduce((total, row) => total + row.gold_paid, 0), pendingRewardCashValue: pendingRows.reduce((total, row) => total + (rewards.get(row.reward_id)?.cash_value || 0), 0) }, pendingRewards: data.rewards.map((reward) => ({ rewardId: reward.id, rewardName: reward.name, requiredGold: reward.gold_price, cashValue: reward.cash_value, remainingQuantity: reward.remaining_quantity, pendingCount: pendingRows.filter((row) => row.reward_id === reward.id).length })).filter((row) => row.pendingCount > 0) };
    },
    getPasswordResetRequests: async () => [],
    approvePasswordResetRequest: async () => { throw new Error('Supabase Auth 비밀번호 재설정은 사용자의 이메일 재설정 흐름으로 처리됩니다.'); },
    rejectPasswordResetRequest: async () => { throw new Error('Supabase Auth 비밀번호 재설정 요청은 별도 승인하지 않습니다.'); },
};

const legacyAdminApi = {
    getDashboardSummary: async () => apiClient.get('/admin/dashboard/summary'),
    getParticipantEngagement: async (params = {}) => apiClient.get(`/admin/dashboard/participants?${new URLSearchParams(params)}`),
    getPointRewardDashboard: async (params = {}) => apiClient.get(`/admin/dashboard/points?${new URLSearchParams(params)}`),
    getPasswordResetRequests: async (pendingOnly = true) => apiClient.get(`/admin/password-reset-requests?pendingOnly=${pendingOnly}`),
    approvePasswordResetRequest: async (requestId) => apiClient.post(`/admin/password-reset-requests/${requestId}/approve`, {}),
    rejectPasswordResetRequest: async (requestId, reason) => apiClient.post(`/admin/password-reset-requests/${requestId}/reject`, { reason }),
};

export default authApi.usesSupabase ? supabaseAdminApi : legacyAdminApi;
