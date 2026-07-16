/**
 * 베타 종료 설정
 * 베타 종료 모드: 참여자에게 점수/보상안내/게시판만 노출
 * 롤백 시 .env에 VITE_BETA_CLOSED=false 설정 후 재배포
 */
export const BETA_CLOSED = import.meta.env.VITE_BETA_CLOSED !== 'false';

// 베타 종료 후 참여자에게 허용되는 라우트
export const PARTICIPANT_ALLOWED_PATHS = [
    '/profile',        // 내 점수
    '/reward-center',  // 보상안내
    '/feedback',       // 게시판
];
