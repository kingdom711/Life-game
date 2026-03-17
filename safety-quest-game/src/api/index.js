/**
 * API 모듈 통합 export
 */

import apiClient, { ApiError } from './apiClient';
import authApi from './authApi';
import userApi from './userApi';
import questApi from './questApi';
import inventoryApi from './inventoryApi';
import shopApi from './shopApi';
import gemsApi from './gemsApi';
import checklistApi from './checklistApi';
import templateApi from './templateApi';
import reviewApi from './reviewApi';
import riskApi from './riskApi';
import aiApi from './aiApi';
import hazardCycleApi from './hazardCycleApi';
import workStopApi from './workStopApi';
import config from '../config/environment';

// 모든 API를 하나의 객체로 통합
const api = {
    client: apiClient,
    auth: authApi,
    user: userApi,
    quest: questApi,
    inventory: inventoryApi,
    shop: shopApi,
    gems: gemsApi,
    checklist: checklistApi,
    template: templateApi,
    review: reviewApi,
    risk: riskApi,
    ai: aiApi,
    hazardCycle: hazardCycleApi,
    workStop: workStopApi,
    config,
};

// 개별 export
export {
    apiClient,
    ApiError,
    authApi,
    userApi,
    questApi,
    inventoryApi,
    shopApi,
    gemsApi,
    checklistApi,
    templateApi,
    reviewApi,
    riskApi,
    aiApi,
    hazardCycleApi,
    workStopApi,
    config,
};

// 기본 export
export default api;

