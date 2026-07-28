import { useAuth } from '../context/AuthContext';
import { BETA_CLOSED } from '../config/betaConfig';
import { isAdminRole } from '../utils/authRoles';

/**
 * 베타 종료 후 참여자 화면 축소 여부
 * 관리자 계정(관리자 모드·테스트 모드)은 축소 대상에서 제외
 */
export default function useParticipantLockdown() {
    const { user } = useAuth();
    const isAdminAccount = isAdminRole(user?.role);
    return BETA_CLOSED && !isAdminAccount;
}
