// Normalize server membership records without treating pending users as active.
export function normalizeTeamMember(record) {
    const userId = record.user_id ?? record.userId;
    return {
        ...record,
        membershipId: record.membershipId ?? `${record.team_id ?? record.teamId}:${userId}`,
        userId,
        userName: record.profiles?.name ?? record.userName ?? '팀원',
        username: record.profiles?.username ?? record.username ?? '프로필 정보 비공개',
        leader: Boolean(record.is_leader ?? record.leader ?? record.isLeader ?? false)
    };
}

export function resolveTeamMembership(membership, userTeam = null) {
    const status = String(membership?.status || '').toUpperCase();
    const approved = status === 'APPROVED' || status === 'ACTIVE';
    const joinedTeam = membership?.teams;
    const teamId = membership?.team_id ?? membership?.teamId ?? userTeam?.id;
    const team = approved && teamId
        ? {
            id: teamId,
            name: joinedTeam?.name ?? membership.teamName ?? userTeam?.name,
            siteName: joinedTeam?.site_name ?? membership.siteName ?? userTeam?.siteName,
            leader: Boolean(membership.is_leader ?? membership.isLeader ?? userTeam?.leader ?? userTeam?.isLeader ?? false)
        }
        : !membership && userTeam?.id ? userTeam : null;
    return {
        team,
        status: team ? 'ACTIVE' : status === 'PENDING' ? 'PENDING' : 'NONE',
        isLeader: Boolean(team?.leader || team?.isLeader)
    };
}
