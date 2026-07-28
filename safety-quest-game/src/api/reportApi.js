import apiClient from './apiClient';
import authApi from './authApi';
import { requireSupabase } from '../lib/supabase';

const DAY_MS = 24 * 60 * 60 * 1000;

const toDateKey = (date) => {
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

function getPeriod(type) {
    const today = startOfDay(new Date());
    const end = new Date(today.getTime() + DAY_MS);
    let start;

    if (type === 'monthly') {
        start = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (type === 'yearly') {
        start = new Date(today.getFullYear(), 0, 1);
    } else {
        const mondayOffset = (today.getDay() + 6) % 7;
        start = new Date(today.getTime() - mondayOffset * DAY_MS);
    }

    return { start, end, previousStart: new Date(start.getTime() - (end.getTime() - start.getTime())) };
}

function trendBuckets(type, start, end) {
    const buckets = [];
    if (type === 'yearly') {
        for (let month = 0; month < 12; month += 1) {
            const bucketStart = new Date(start.getFullYear(), month, 1);
            const bucketEnd = new Date(start.getFullYear(), month + 1, 1);
            if (bucketStart >= end) break;
            buckets.push({ start: bucketStart, end: bucketEnd, label: `${month + 1}월` });
        }
        return buckets;
    }

    const step = type === 'monthly' ? 7 : 1;
    for (let cursor = new Date(start); cursor < end; cursor = new Date(cursor.getTime() + step * DAY_MS)) {
        const bucketEnd = new Date(Math.min(cursor.getTime() + step * DAY_MS, end.getTime()));
        buckets.push({
            start: new Date(cursor),
            end: bucketEnd,
            label: type === 'monthly' ? `${cursor.getMonth() + 1}/${cursor.getDate()}` : `${cursor.getMonth() + 1}/${cursor.getDate()}`,
        });
    }
    return buckets;
}

function inBucket(value, bucket) {
    const time = new Date(value).getTime();
    return time >= bucket.start.getTime() && time < bucket.end.getTime();
}

function buildReport(type, period, rows) {
    const attendance = rows.attendance || [];
    const completions = rows.completions || [];
    const quests = rows.quests || [];
    const hazards = rows.hazards || [];
    const transactions = rows.transactions || [];
    const previousEarned = (rows.previousTransactions || [])
        .filter((row) => row.transaction_type === 'EARN')
        .reduce((sum, row) => sum + row.amount, 0);
    const earnedPoints = transactions.filter((row) => row.transaction_type === 'EARN').reduce((sum, row) => sum + row.amount, 0);
    const spentPoints = transactions.filter((row) => row.transaction_type === 'SPEND').reduce((sum, row) => sum + row.amount, 0);
    const averageQuizScore = completions.length
        ? Math.round(completions.reduce((sum, row) => sum + row.quiz_score, 0) / completions.length)
        : 0;
    const hazardCompletions = hazards.filter((row) => row.status === 'ACTION_COMPLETED').length;
    const completedQuests = quests.length;
    const loginDays = attendance.length;
    const hazardReports = hazards.length;
    const attendanceScore = Math.min(100, Math.round((loginDays / Math.max(1, Math.ceil((period.end - period.start) / DAY_MS))) * 100));
    const questScore = Math.min(100, completedQuests * 20);
    const educationScore = Math.min(100, completions.length * 40 + Math.round(averageQuizScore * 0.4));
    const hazardScore = hazardReports ? Math.min(100, 50 + hazardCompletions * 50) : 0;
    const pointsScore = Math.min(100, Math.round(earnedPoints / 5));
    const overallScore = Math.round((attendanceScore + questScore + educationScore + hazardScore + pointsScore) / 5);
    const periodLabel = type === 'yearly'
        ? `${period.start.getFullYear()}년 성장 리포트`
        : type === 'monthly'
            ? `${period.start.getFullYear()}년 ${period.start.getMonth() + 1}월 성장 리포트`
            : `${toDateKey(period.start)} ~ ${toDateKey(new Date(period.end.getTime() - DAY_MS))} 성장 리포트`;

    const strengths = [];
    const improvements = [];
    if (averageQuizScore >= 80) strengths.push(`교육 평가 평균 ${averageQuizScore}점으로 안전 지식 이행이 우수합니다.`);
    if (loginDays >= 3) strengths.push(`${loginDays}일 출석으로 안전 활동을 꾸준히 이어가고 있습니다.`);
    if (hazardCompletions > 0) strengths.push(`위험요소 ${hazardCompletions}건의 개선 완료를 기록했습니다.`);
    if (loginDays < 3) improvements.push('매일 출석해 안전 활동 기록의 연속성을 높여보세요.');
    if (!completions.length) improvements.push('이번 기간에 교육을 한 건 이상 완료해 안전 지식을 보완해보세요.');
    if (hazardReports && !hazardCompletions) improvements.push('등록한 위험요소의 개선 사진과 조치 내용을 마무리해보세요.');
    if (!strengths.length) strengths.push('첫 안전 활동을 완료하면 이곳에 강점이 표시됩니다.');
    if (!improvements.length) improvements.push('현재 활동 흐름이 안정적입니다. 다음 안전 퀘스트에 도전해보세요.');

    const buckets = trendBuckets(type, period.start, period.end);
    const trends = buckets.map((bucket) => {
        const bucketAttendance = attendance.filter((row) => inBucket(`${row.check_in_date}T00:00:00`, bucket)).length;
        const bucketCompletions = completions.filter((row) => inBucket(row.completed_at, bucket)).length;
        const bucketQuests = quests.filter((row) => inBucket(row.completed_at, bucket)).length;
        const bucketHazards = hazards.filter((row) => inBucket(row.reported_at, bucket)).length;
        const bucketCompletedHazards = hazards.filter((row) => row.completed_at && inBucket(row.completed_at, bucket)).length;
        const bucketEarned = transactions.filter((row) => row.transaction_type === 'EARN' && inBucket(row.created_at, bucket)).reduce((sum, row) => sum + row.amount, 0);
        return {
            label: bucket.label,
            startDate: toDateKey(bucket.start),
            endDate: toDateKey(new Date(bucket.end.getTime() - DAY_MS)),
            completedQuests: bucketQuests,
            educationCompletions: bucketCompletions,
            loginDays: bucketAttendance,
            hazardReports: bucketHazards,
            hazardCompletions: bucketCompletedHazards,
            earnedPoints: bucketEarned,
            activityScore: bucketAttendance * 10 + bucketQuests * 12 + bucketCompletions * 20 + bucketHazards * 15 + bucketEarned / 5,
        };
    });

    return {
        periodType: type,
        periodLabel,
        periodStart: period.start.toISOString(),
        periodEnd: period.end.toISOString(),
        summary: {
            completedQuests,
            educationCompletions: completions.length,
            passedEducations: completions.length,
            averageQuizScore,
            loginDays,
            hazardReports,
            hazardCompletions,
            earnedPoints,
            spentPoints,
            overallScore,
            scoreChange: earnedPoints - previousEarned,
        },
        categoryScores: [
            { key: 'attendance', label: '출석', score: attendanceScore, detail: `${loginDays}일 출석` },
            { key: 'quest', label: '퀘스트', score: questScore, detail: `${completedQuests}건 완료` },
            { key: 'education', label: '교육', score: educationScore, detail: `${completions.length}건 완료 · 평균 ${averageQuizScore}점` },
            { key: 'hazard', label: '위험요소', score: hazardScore, detail: `${hazardReports}건 신고 · ${hazardCompletions}건 조치 완료` },
            { key: 'points', label: '포인트', score: pointsScore, detail: `${earnedPoints.toLocaleString()}P 적립` },
        ],
        trends,
        strengths,
        improvements,
        recommendations: improvements.slice(0, 2),
    };
}

const reportApi = {
    getMyReport: async (type = 'weekly') => {
        if (!authApi.usesSupabase) {
            return apiClient.get(`/users/me/reports?type=${encodeURIComponent(type)}`);
        }

        if (!['weekly', 'monthly', 'yearly'].includes(type)) {
            throw new Error('지원하지 않는 보고서 기간입니다.');
        }

        const client = requireSupabase();
        const period = getPeriod(type);
        const start = period.start.toISOString();
        const end = period.end.toISOString();
        const previousStart = period.previousStart.toISOString();
        const [attendance, completions, quests, hazards, transactions, previousTransactions] = await Promise.all([
            client.from('attendance_records').select('check_in_date').gte('check_in_date', toDateKey(period.start)).lt('check_in_date', toDateKey(period.end)),
            client.from('education_completions').select('quiz_score,completed_at').gte('completed_at', start).lt('completed_at', end),
            client.from('user_quest_completions').select('completed_at').gte('completed_at', start).lt('completed_at', end),
            client.from('hazard_cycles').select('reported_at,completed_at,status').gte('reported_at', start).lt('reported_at', end),
            client.from('point_transactions').select('amount,transaction_type,created_at').gte('created_at', start).lt('created_at', end),
            client.from('point_transactions').select('amount,transaction_type').gte('created_at', previousStart).lt('created_at', start),
        ]);

        const responses = [attendance, completions, quests, hazards, transactions, previousTransactions];
        const failed = responses.find((response) => response.error);
        if (failed?.error) throw failed.error;

        return buildReport(type, period, {
            attendance: attendance.data,
            completions: completions.data,
            quests: quests.data,
            hazards: hazards.data,
            transactions: transactions.data,
            previousTransactions: previousTransactions.data,
        });
    },
};

export default reportApi;
