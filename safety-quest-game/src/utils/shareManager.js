/**
 * 보상 공유 관리자 (Share Manager)
 *
 * 기획서 4-5: 보상 공유하기 — 안전을 지켜서 받은 보상을 자랑하다
 *
 * 공유 유형:
 * - levelUp: 레벨업 달성
 * - rareItem: 레어 이상 아이템 획득
 * - specialization: 전직 성공
 * - monthlyAttendance: 월간 출석 달성
 *
 * Web Share API (주) + 클립보드 복사 (폴백)
 */

import { LEVELS, TIERS } from './pointsCalculator';

/**
 * 공유 유형별 카드 콘텐츠 생성
 */
const SHARE_TEMPLATES = {
    levelUp: (data) => ({
        title: `${data.levelName} 달성!`,
        text: `${data.levelName} 달성! 안전교육 ${data.streakDays || 0}일 연속 이수`,
        emoji: data.tierIcon || '🏆',
        color: data.tierColor || '#ffd700',
        subtitle: '레벨업 달성'
    }),

    rareItem: (data) => ({
        title: `${data.itemName} 획득!`,
        text: `${data.rarityLabel} ${data.itemName} 획득! 안전 퀘스트 보상`,
        emoji: data.rarityEmoji || '✨',
        color: data.rarityColor || '#8b5cf6',
        subtitle: `${data.rarityLabel} 아이템 획득`
    }),

    specialization: (data) => ({
        title: `${data.specName} 전직!`,
        text: `${data.specName}(으)로 전직 성공! 전문 교육 이수 완료`,
        emoji: '⚔️',
        color: '#f59e0b',
        subtitle: '전직 성공'
    }),

    monthlyAttendance: (data) => ({
        title: `월간 ${data.days}일 출석!`,
        text: `이번 달 ${data.days}일 출석 달성! 월간 보상 수령`,
        emoji: '🗓️',
        color: '#10b981',
        subtitle: '월간 출석 달성'
    })
};

/**
 * Canvas로 공유 카드 이미지 생성
 */
export const generateShareCardImage = async (type, data) => {
    const template = SHARE_TEMPLATES[type]?.(data);
    if (!template) return null;

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 340;
    const ctx = canvas.getContext('2d');

    // 배경 그라디언트
    const gradient = ctx.createLinearGradient(0, 0, 600, 340);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, 600, 340, 20);
    ctx.fill();

    // 상단 악센트 라인
    const accentGrad = ctx.createLinearGradient(0, 0, 600, 0);
    accentGrad.addColorStop(0, template.color);
    accentGrad.addColorStop(1, template.color + '60');
    ctx.fillStyle = accentGrad;
    ctx.fillRect(0, 0, 600, 5);

    // 이모지
    ctx.font = '60px serif';
    ctx.textAlign = 'center';
    ctx.fillText(template.emoji, 300, 90);

    // 제목
    ctx.font = 'bold 28px "Segoe UI", sans-serif';
    ctx.fillStyle = '#f1f5f9';
    ctx.textAlign = 'center';
    ctx.fillText(template.title, 300, 150);

    // 부제
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.fillStyle = template.color;
    ctx.fillText(template.subtitle, 300, 180);

    // 설명
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(template.text, 300, 220);

    // 구분선
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(80, 250);
    ctx.lineTo(520, 250);
    ctx.stroke();

    // 브랜딩
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('Safety Quest', 300, 290);

    ctx.font = '12px "Segoe UI", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('안전을 게임으로, 습관으로, 생활로', 300, 315);

    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
};

/**
 * 공유 텍스트 생성
 */
const getShareText = (type, data) => {
    const template = SHARE_TEMPLATES[type]?.(data);
    if (!template) return '';

    return `${template.emoji} ${template.title}\n${template.text}\n\n— Safety Quest`;
};

/**
 * Web Share API로 공유
 */
export const shareReward = async (type, data) => {
    const shareText = getShareText(type, data);

    // Web Share API 지원 여부 확인
    if (navigator.share) {
        try {
            const shareData = {
                title: 'Safety Quest',
                text: shareText
            };

            // 이미지 공유 시도 (navigator.canShare 확인)
            try {
                const imageBlob = await generateShareCardImage(type, data);
                if (imageBlob) {
                    const file = new File([imageBlob], 'safety-quest-reward.png', { type: 'image/png' });
                    const dataWithFile = { ...shareData, files: [file] };

                    if (navigator.canShare && navigator.canShare(dataWithFile)) {
                        await navigator.share(dataWithFile);
                        return { success: true, method: 'webshare-image' };
                    }
                }
            } catch {
                // 이미지 공유 실패 시 텍스트만 공유
            }

            await navigator.share(shareData);
            return { success: true, method: 'webshare-text' };
        } catch (err) {
            if (err.name === 'AbortError') {
                return { success: false, method: 'cancelled' };
            }
            // Web Share 실패 시 클립보드 폴백
        }
    }

    // 폴백: 클립보드 복사
    try {
        await navigator.clipboard.writeText(shareText);
        return { success: true, method: 'clipboard' };
    } catch {
        return { success: false, method: 'failed' };
    }
};

/**
 * 레벨업 공유 데이터 헬퍼
 */
export const buildLevelUpShareData = (levelName, streakDays = 0) => {
    // LEVELS에서 해당 레벨 정보 찾기
    const levelEntry = Object.values(LEVELS).find(l => l.name === levelName);
    const tierInfo = levelEntry ? TIERS[levelEntry.tier] : null;

    return {
        levelName,
        streakDays,
        tierIcon: tierInfo?.icon || '🏆',
        tierColor: tierInfo?.color || '#ffd700'
    };
};

/**
 * 아이템 공유 데이터 헬퍼
 */
export const buildItemShareData = (item) => {
    const rarityConfig = {
        common: { label: '일반', emoji: '⚪', color: '#94a3b8' },
        rare: { label: '고급', emoji: '🔵', color: '#3b82f6' },
        epic: { label: '영웅', emoji: '🟣', color: '#8b5cf6' },
        legendary: { label: '전설', emoji: '🟡', color: '#f59e0b' }
    };

    const rarity = rarityConfig[item.rarity] || rarityConfig.common;

    return {
        itemName: item.name,
        rarityLabel: rarity.label,
        rarityEmoji: rarity.emoji,
        rarityColor: rarity.color
    };
};

/**
 * 전직 공유 데이터 헬퍼
 */
export const buildSpecializationShareData = (specName) => ({
    specName
});

/**
 * 월간 출석 공유 데이터 헬퍼
 */
export const buildMonthlyAttendanceShareData = (days) => ({
    days
});
