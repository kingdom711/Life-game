const ADMIN_ROLES = new Set(['ADMIN', 'PROJECT_ADMIN', 'ROLE_ADMIN', 'ROLE_PROJECT_ADMIN']);

const MANAGER_ROLES = new Set([
    ...ADMIN_ROLES,
    'SUPERVISOR',
    'SAFETY_MANAGER',
    'ROLE_SUPERVISOR',
    'ROLE_SAFETY_MANAGER',
]);

export const isAdminRole = (role) => ADMIN_ROLES.has(role);

export const isManagerRole = (role) => MANAGER_ROLES.has(role);
