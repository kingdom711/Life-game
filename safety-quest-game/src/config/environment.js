/**
 * Browser runtime configuration. Authentication and server-side logic are
 * supplied by Supabase; no application API host is configured here.
 */
const config = {
    API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT, 10) || 30000,
    DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV || false,
    USE_MOCK: import.meta.env.VITE_USE_MOCK === 'true',
    GA_MEASUREMENT_ID: import.meta.env.VITE_GA_MEASUREMENT_ID || '',
    GA_DEBUG_MODE: import.meta.env.VITE_GA_DEBUG_MODE === 'true',
    LEGACY_API_DISABLED: true,
};

export default config;
