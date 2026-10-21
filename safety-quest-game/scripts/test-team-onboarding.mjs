import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';
import { normalizeTeamMember, resolveTeamMembership } from '../src/utils/teamMembership.js';

test('approved creator is an active leader after profile refresh', () => {
    const state = resolveTeamMembership({ status: 'APPROVED', team_id: 'owned-team', is_leader: true, teams: { name: 'Leader team', site_name: 'Site A' } });
    assert.equal(state.status, 'ACTIVE');
    assert.equal(state.isLeader, true);
    assert.deepEqual(state.team, { id: 'owned-team', name: 'Leader team', siteName: 'Site A', leader: true });
});
test('pending join never inherits a stale active leader team', () => {
    const state = resolveTeamMembership({ status: 'PENDING', team_id: 'requested-team', is_leader: false }, { id: 'old-team', leader: true });
    assert.equal(state.status, 'PENDING');
    assert.equal(state.team, null);
    assert.equal(state.isLeader, false);
});
test('approved ordinary member stays a non-leader', () => {
    const state = resolveTeamMembership({ status: 'APPROVED', team_id: 'member-team', is_leader: false }, { id: 'old-team', leader: true });
    assert.equal(state.status, 'ACTIVE');
    assert.equal(state.isLeader, false);
});
test('legacy active membership remains compatible', () => {
    const state = resolveTeamMembership({ status: 'ACTIVE', teamId: 'legacy-team', teamName: 'Legacy', isLeader: true });
    assert.equal(state.team.id, 'legacy-team');
    assert.equal(state.team.name, 'Legacy');
    assert.equal(state.isLeader, true);
});
test('missing or malformed membership does not unlock a team', () => {
    assert.equal(resolveTeamMembership(null).status, 'NONE');
    assert.equal(resolveTeamMembership({ status: 'APPROVED' }).status, 'NONE');
});

const apiSource = await readFile(new URL('../src/api/teamApi.js', import.meta.url), 'utf8');
async function loadApi(client) {
    const context = vm.createContext({});
    const module = new vm.SourceTextModule(apiSource, { context });
    await module.link(specifier => {
        if (specifier === './authApi') return new vm.SyntheticModule(['default'], function(){this.setExport('default', { usesSupabase: true });}, { context });
        if (specifier === './apiClient') return new vm.SyntheticModule(['default'], function(){this.setExport('default', {});}, { context });
        if (specifier === '../lib/supabase') return new vm.SyntheticModule(['requireSupabase'], function(){this.setExport('requireSupabase', () => client);}, { context });
        if (specifier === '../utils/teamMembership') return new vm.SyntheticModule(['normalizeTeamMember'], function(){this.setExport('normalizeTeamMember', normalizeTeamMember);}, { context });
        throw new Error('Unexpected import: ' + specifier);
    });
    await module.evaluate();
    return module.namespace.default;
}
test('create returns the new leader team details and propagates RPC errors', async () => {
    const calls = [];
    const api = await loadApi({ rpc: async (...args) => { calls.push(args); return { data: 'new-team', error: null }; } });
    const result = await api.createTeam({ name: ' Crew A ', siteName: ' Site A ' });
    assert.equal(result.id, 'new-team');
    assert.equal(result.name, 'Crew A');
    assert.equal(result.siteName, 'Site A');
    assert.equal(result.leader, true);
    assert.equal(calls[0][0], 'create_team');
    assert.equal(calls[0][1].p_name, 'Crew A');
    const failure = new Error('Create rejected');
    const failingApi = await loadApi({ rpc: async () => ({ data: null, error: failure }) });
    await assert.rejects(failingApi.createTeam({ name: 'Crew', siteName: 'Site' }), /Create rejected/);
});

test('team member fields preserve the creator identity and leader protection', () => {
    const member = normalizeTeamMember({ team_id: 'team', user_id: 'creator', is_leader: true, profiles: { name: 'Creator', username: 'creator-name' } });
    assert.equal(member.membershipId, 'team:creator');
    assert.equal(member.userId, 'creator');
    assert.equal(member.userName, 'Creator');
    assert.equal(member.username, 'creator-name');
    assert.equal(member.leader, true);
    const hiddenProfile = normalizeTeamMember({ team_id: 'team', user_id: 'member', is_leader: false, profiles: null });
    assert.equal(hiddenProfile.userName, '팀원');
    assert.equal(hiddenProfile.username, '프로필 정보 비공개');
    assert.equal(hiddenProfile.leader, false);
});

test('approved and pending lists both map server records without widening profile access', async () => {
    const calls = [];
    const query = {};
    for (const method of ['select', 'eq']) query[method] = (...args) => { calls.push([method, ...args]); return query; };
    query.then = callback => Promise.resolve(callback({ data: [{ team_id: 'team', user_id: 'creator', is_leader: true, profiles: { name: 'Creator' } }], error: null }));
    const api = await loadApi({ from: () => query });
    for (const list of [api.listTeamMembers, api.listPendingMembers]) {
        const [member] = await list('team');
        assert.equal(member.userId, 'creator');
        assert.equal(member.userName, 'Creator');
        assert.equal(member.leader, true);
    }
    assert.ok(calls.some(call => call[0] === 'select' && call[1] === '*, profiles(name, username)'));
    assert.ok(calls.some(call => call[0] === 'eq' && call[1] === 'status' && call[2] === 'APPROVED'));
    assert.ok(calls.some(call => call[0] === 'eq' && call[1] === 'status' && call[2] === 'PENDING'));
});
test('membership reads only the signed-in user and bounds multiple memberships', async () => {
    const calls = [];
    const row = { team_id: 'latest-team', status: 'APPROVED', is_leader: true };
    const query = {};
    for (const method of ['select', 'eq', 'order', 'limit']) query[method] = (...args) => { calls.push([method, ...args]); return query; };
    query.maybeSingle = async () => ({ data: row, error: null });
    const api = await loadApi({ auth: { getUser: async () => ({ data: { user: { id: 'signed-in-user' } }, error: null }) }, from: table => { assert.equal(table, 'team_memberships'); return query; } });
    assert.equal((await api.getMyMembership()).team_id, 'latest-team');
    assert.ok(calls.some(c => c[0] === 'eq' && c[1] === 'user_id' && c[2] === 'signed-in-user'));
    assert.ok(calls.some(c => c[0] === 'limit' && c[1] === 1));
    assert.ok(calls.some(c => c[0] === 'order' && c[1] === 'created_at' && c[2].ascending === false));
});
test('signed-out and failed authentication never query memberships', async () => {
    let queried = false;
    const client = { auth: { getUser: async () => ({ data: { user: null }, error: null }) }, from: () => { queried = true; throw new Error('Unexpected query'); } };
    assert.equal(await (await loadApi(client)).getMyMembership(), null);
    assert.equal(queried, false);
    client.auth.getUser = async () => ({ data: { user: null }, error: new Error('Session rejected') });
    await assert.rejects((await loadApi(client)).getMyMembership(), /Session rejected/);
    assert.equal(queried, false);
});
