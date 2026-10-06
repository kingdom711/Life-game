import { Link } from 'react-router-dom';
import { userProfile } from '../../utils/storage';
import { useAuth } from '../../context/AuthContext';
import useTeamGate from '../../hooks/useTeamGate';
import PlayerCard from './PlayerCard';

function UserProfileCard({ playerStats, role, equippedItems, educationCompleted }) {
    const { user } = useAuth();
    const teamGate = useTeamGate({ autoLoad: Boolean(user) });
    const team = teamGate.team || user?.team;
    return <PlayerCard name={userProfile.getName() || user?.name || '안전 탐험가'} role={role} experience={playerStats?.experience} equippedItems={equippedItems} siteName={team?.siteName} teamName={team?.name}>
        {!teamGate.isActive && !team?.name && <Link to="/profile" className="adventure-player-team">{teamGate.isPending ? '팀 가입 승인 대기 중' : '우리 팀 연결하기'}</Link>}
        {!educationCompleted && <Link to="/education" className="adventure-player-team">오늘의 첫 도전: 안전교육</Link>}
    </PlayerCard>;
}
export default UserProfileCard;
