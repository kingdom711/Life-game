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
    config,
};

// 기본 export
export default api;

