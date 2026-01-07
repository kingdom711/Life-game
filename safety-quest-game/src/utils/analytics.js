/**
 * Google Analytics 4 유틸리티
 * 
 * 페이지뷰 및 주요 전환 이벤트 추적을 위한 모듈입니다.
 * GA4 측정 ID는 환경변수 VITE_GA_MEASUREMENT_ID로 설정합니다.
 */

import ReactGA from 'react-ga4';
import config from '../config/environment';

// GA 초기화 상태
let isInitialized = false;

/**
 * GA4 초기화
 * - 프로덕션 환경에서만 실제 초기화
 * - 개발 환경에서는 디버그 모드로 동작 (콘솔 로그만)
 */
export const initializeAnalytics = () => {
    const measurementId = config.GA_MEASUREMENT_ID;

    if (!measurementId) {
        console.warn('[Analytics] GA_MEASUREMENT_ID not set. Analytics disabled.');
        return;
    }

    // 이미 초기화된 경우 스킵
    if (isInitialized) {
        return;
    }

    try {
        ReactGA.initialize(measurementId, {
            gaOptions: {
                anonymize_ip: true,          // 개인정보 보호
                send_page_view: false,       // 수동 페이지뷰 제어
            },
            gtagOptions: {
                debug_mode: config.GA_DEBUG_MODE,  // DebugView 활성화
            }
        });

        isInitialized = true;
        console.log('[Analytics] GA4 initialized:', measurementId);
    } catch (error) {
        console.error('[Analytics] GA4 initialization failed:', error);
    }
};

/**
 * 안전하게 이벤트 전송 (초기화 체크)
 */
const safeTrack = (trackFn) => {
    if (!isInitialized) {
        if (config.DEV_MODE) {
            console.log('[Analytics] (Dev Mode) Would track:', trackFn.toString());
        }
        return;
    }
    trackFn();
};

/**
 * Analytics API
 */
export const analytics = {
    /**
     * 페이지뷰 추적
     * @param {string} pagePath - 페이지 경로 (예: '/dashboard')
     * @param {string} pageTitle - 페이지 제목
     */
    pageView: (pagePath, pageTitle) => {
        safeTrack(() => {
            ReactGA.send({
                hitType: 'pageview',
                page: pagePath,
                title: pageTitle
            });
        });

        if (config.DEV_MODE) {
            console.log('[Analytics] PageView:', { pagePath, pageTitle });
        }
    },

    /**
     * 전환 이벤트 (가입, 결제 등)
     */
    conversion: {
        /**
         * 회원가입 시작
         */
        signupStart: () => {
            safeTrack(() => {
                ReactGA.event({
                    category: 'Conversion',
                    action: 'signup_start',
                    label: 'from_landing'
                });
            });

            if (config.DEV_MODE) {
                console.log('[Analytics] Event: signup_start');
            }
        },

        /**
         * 회원가입 완료
         * @param {string} planType - 플랜 유형 (free, pro, enterprise)
         */
        signupComplete: (planType) => {
            safeTrack(() => {
                ReactGA.event({
                    category: 'Conversion',
                    action: 'signup_complete',
                    label: planType
                });
            });

            if (config.DEV_MODE) {
                console.log('[Analytics] Event: signup_complete', { planType });
            }
        },

        /**
         * 플랜 선택
         * @param {string} planType - 플랜 유형
         * @param {number} price - 가격 (원)
         */
        planSelected: (planType, price) => {
            safeTrack(() => {
                ReactGA.event({
                    category: 'Conversion',
                    action: 'plan_selected',
                    label: planType,
                    value: price
                });
            });

            if (config.DEV_MODE) {
                console.log('[Analytics] Event: plan_selected', { planType, price });
            }
        },

        /**
         * 결제 시작 (Checkout)
         * @param {string} planType - 플랜 유형
         * @param {number} amount - 결제 금액
         */
        checkoutStart: (planType, amount) => {
            safeTrack(() => {
                ReactGA.event({
                    category: 'Conversion',
                    action: 'begin_checkout',
                    label: planType,
                    value: amount
                });
            });

            if (config.DEV_MODE) {
                console.log('[Analytics] Event: begin_checkout', { planType, amount });
            }
        },

        /**
         * 결제 완료 (Purchase)
         * @param {object} params - { planType, transactionId, amount }
         */
        purchase: ({ planType, transactionId, amount }) => {
            safeTrack(() => {
                ReactGA.event('purchase', {
                    transaction_id: transactionId,
                    value: amount,
                    currency: 'KRW',
                    items: [{
                        item_name: planType,
                        price: amount,
                        quantity: 1
                    }]
                });
            });

            if (config.DEV_MODE) {
                console.log('[Analytics] Event: purchase', { planType, transactionId, amount });
            }
        }
    },

    /**
     * 사용자 참여 이벤트
     */
    engagement: {
        /**
         * 출석 체크
         * @param {number} consecutiveDays - 연속 출석일
         * @param {number} bonusPoints - 보너스 포인트
         */
        dailyCheckIn: (consecutiveDays, bonusPoints) => {
            safeTrack(() => {
                ReactGA.event({
                    category: 'Engagement',
                    action: 'daily_check_in',
                    label: `streak_${consecutiveDays}`,
                    value: bonusPoints
                });
            });

            if (config.DEV_MODE) {
                console.log('[Analytics] Event: daily_check_in', { consecutiveDays, bonusPoints });
            }
        }
    }
};

export default analytics;
