# 베타 종료 — 참여자 페이지 축소 계획

> 작성일: 2026-07-15 · 실행 예정일: 2026-07-16
> 목표: **관리자 페이지는 그대로 유지**, 참여자에게는 **① 자기 점수 ② 보상센터 ③ 게시판** 만 노출

---

## 1. 배경 및 목표

베타 테스트가 종료되어 참여자의 게임 활동(퀘스트, 교육, 상점, 위험 신고 등)은 더 이상 필요 없다.
참여자는 자신이 획득한 점수를 확인하고, 보상을 수령하고, 게시판(피드백)을 이용하는 것만 가능해야 한다.
관리자(`ROLE_ADMIN`, `ROLE_PROJECT_ADMIN`)의 관리자 대시보드/보상 승인/리포트 기능은 변경 없이 유지한다.

## 2. 현재 구조 요약 (조사 완료)

- 라우팅: [App.jsx](../src/App.jsx) 단일 파일에서 전체 `<Routes>` 정의 (약 30개 라우트)
- 참여자 하단 내비게이션: [Navigation.jsx](../src/components/Navigation.jsx) — 현재 6개 메뉴(교육/퀘스트/업적/게시판/상점/내프로필)
- 관리자 판별: `user.role === 'ROLE_PROJECT_ADMIN' || 'ROLE_ADMIN'` (App.jsx:105-106)
- 관리자는 로그인 후 `AdminModeSelector`에서 **관리자 모드 / 테스트(체험) 모드** 선택
  - 관리자 모드: `/admin`, `/admin/reward-approval`, `/admin/password-reset-requests`, `/admin/feedback`, `/reports`
  - 테스트 모드: 참여자와 동일한 화면을 체험
- 대상 페이지 매핑:
  | 요구사항 | 페이지 | 라우트 |
  |---|---|---|
  | 자기 점수 | `Profile.jsx` (포인트·레벨·등급) | `/profile` |
  | 보상 | `RewardCenter.jsx` (골드로 기프티콘 수령) | `/reward-center` |
  | 게시판 | `FeedbackBoard.jsx` | `/feedback` |
- 부가 장치: 작업중지 플로팅 버튼(`WorkStopButton`), 팀 가입 강제 위저드(`TeamJoinWizard`), 역할 선택(`RoleSelector`) — 참여자 진입 시 동작하므로 함께 정리 필요

## 3. 설계 방침

**전면 삭제가 아닌 플래그 기반 차단**으로 구현한다. 이유:
- 롤백이 플래그 하나로 가능 (실수 시 즉시 복구)
- 관리자 테스트 모드에서는 기존 전체 화면을 계속 볼 수 있어야 함
- 코드 삭제는 추후 안정화 이후에 별도로 진행

### 새 플래그

`src/config/betaConfig.js` (신규 파일):

```js
// 베타 종료 모드: 참여자에게 점수/보상/게시판만 노출
// 롤백 시 .env에 VITE_BETA_CLOSED=false 설정 후 재배포
export const BETA_CLOSED = import.meta.env.VITE_BETA_CLOSED !== 'false';

export const PARTICIPANT_ALLOWED_PATHS = [
    '/profile',        // 내 점수
    '/reward-center',  // 보상센터
    '/exchange',       // 포인트→골드 교환 (보상 수령에 필요, 5절 결정사항 참고)
    '/feedback',       // 게시판
];
```

### 차단 기준

`isParticipantLockdown = BETA_CLOSED && !isAdminAccount`

- 일반 참여자: 축소 라우트만 접근 가능
- 관리자(관리자 모드·테스트 모드 모두): 기존 그대로 — 테스트 모드에서 전체 화면 검증 가능

## 4. 파일별 변경 내역

### 4-1. `src/config/betaConfig.js` — 신규

위 코드 그대로 생성.

### 4-2. [App.jsx](../src/App.jsx) — 라우트 게이팅

1. `import { BETA_CLOSED } from './config/betaConfig';` 추가
2. `isParticipantLockdown` 계산 추가 (App.jsx:106 부근, `isAdminAccount` 선언 다음)
3. **라우트 분기** (App.jsx:340 `<Routes>` 부분): `isParticipantLockdown`이면 축소 라우트, 아니면 기존 라우트 유지

```jsx
{isParticipantLockdown ? (
    <Routes>
        <Route path="/" element={<Navigate to="/profile" replace />} />
        <Route path="/profile" element={<Profile role={selectedRole || 'technician'} />} />
        <Route path="/reward-center" element={<RewardCenter />} />
        <Route path="/exchange" element={<Exchange />} />
        <Route path="/feedback" element={<FeedbackBoard />} />
        <Route path="*" element={<Navigate to="/profile" replace />} />
    </Routes>
) : (
    <Routes> {/* 기존 라우트 전체 그대로 */} </Routes>
)}
```

4. **작업중지 버튼 숨김** (App.jsx:396): `{(!isAdminAccount || isAdminTestMode) && !isParticipantLockdown && (...)}`
   — 베타 종료 후 참여자의 작업중지 신고는 받지 않음. 테스트 모드 관리자에게는 유지.
5. **팀 가입 강제 해제** (App.jsx:111): `shouldForceTeamJoin` 계산에 `&& !BETA_CLOSED` 추가
   — 팀 미가입 참여자가 점수 확인만 하러 들어왔는데 팀 가입 모달에 막히는 것 방지.
6. **역할 선택 화면 건너뛰기** (App.jsx:294): `!selectedRole && !isAdminAccount` 조건에 `&& !BETA_CLOSED` 추가
   — 역할 미선택 참여자가 RoleSelector에 걸리지 않고 바로 점수 페이지로 진입. Profile에는 `selectedRole || 'technician'` 폴백 전달(위 3번 코드에 반영됨).

### 4-3. [Navigation.jsx](../src/components/Navigation.jsx) — 메뉴 축소

1. `import { BETA_CLOSED } from '../config/betaConfig';`, lucide에서 `Gift` 아이콘 추가
2. App에서 `participantLockdown` prop 전달 (App.jsx:323 `<Navigation ...>` 에 `participantLockdown={isParticipantLockdown}` 추가)
3. `navItems`를 조건 분기:

```jsx
const navItems = participantLockdown ? [
    { path: '/profile',       label: '내 점수', Icon: User,          active: location.pathname === '/profile' },
    { path: '/reward-center', label: '보상',   Icon: Gift,          active: location.pathname === '/reward-center' },
    { path: '/feedback',      label: '게시판', Icon: MessageSquare, active: location.pathname === '/feedback' },
] : [ /* 기존 6개 그대로 */ ];
```

4. 교육 완료 체크 `useEffect`(5초 인터벌)는 lockdown일 때 실행하지 않도록 조기 반환 — 불필요한 연산 제거.

### 4-4. [RewardCenter.jsx](../src/pages/RewardCenter.jsx) — 내부 링크 정리

- 229행 `← 상점으로` 링크: lockdown 시 숨김 (상점 접근 불가이므로)
- 230행·257행 `💱 교환소` 링크: `/exchange`를 허용 라우트에 포함하므로 유지 (5절 결정에 따라 조정)

### 4-5. [Profile.jsx](../src/pages/Profile.jsx) — 내부 링크 정리

- 50행 `대시보드로 돌아가기` 링크: lockdown 시 숨김 (`/`가 `/profile`로 리다이렉트되므로 무의미)
- 98행 `팀 설정하기` 버튼: lockdown 시 숨김 (팀 활동 종료)
- (선택) 상단에 "베타 테스트가 종료되었습니다. 획득한 포인트로 보상을 수령해 주세요" 안내 배너 추가

### 4-6. [Exchange.jsx](../src/pages/Exchange.jsx) — 실행 시 확인

- 내부에 상점/퀘스트 등 차단된 페이지로 가는 링크가 있는지 실행 당일 확인 후 같은 방식으로 숨김 처리.

## 5. 실행 전 결정 사항 (내일 시작 전 확인)

| # | 결정 | 권장안 | 대안 |
|---|---|---|---|
| 1 | "자기 점수" 페이지 | **`/profile`** — 포인트·레벨·등급이 한 화면에 있고 서버 데이터 기반 | `/safety-score`(안전점수 대시보드)는 localStorage 계산 기반이라 기기 바뀌면 값이 달라짐. 필요 시 허용 라우트에 추가만 하면 됨 |
| 2 | `/exchange`(교환소) 포함 여부 | **포함** — 보상센터는 골드로 결제하므로, 포인트만 있는 참여자는 교환소 없이 보상 수령 불가 | 남은 포인트를 일괄 골드 전환해주는 운영 처리를 했다면 제외 가능 |
| 3 | 관리자 테스트 모드 | **기존 전체 화면 유지** — 검증·CS 대응용 | 테스트 모드도 축소하려면 lockdown 조건을 `!isAdminDashboardMode`로 변경 |
| 4 | 작업중지 플로팅 버튼 | **참여자에게 숨김** | 안전 신고 채널을 계속 열어두려면 4-2의 4번 항목 생략 |

## 6. 실행 순서 (내일)

1. [ ] 5절 결정 사항 확정
2. [ ] `git` 브랜치 생성 (예: `feature/beta-close-lockdown`) — 저장소 루트는 `Life-game/`
3. [ ] `src/config/betaConfig.js` 생성 (4-1)
4. [ ] `App.jsx` 수정 (4-2)
5. [ ] `Navigation.jsx` 수정 (4-3)
6. [ ] `RewardCenter.jsx` / `Profile.jsx` / `Exchange.jsx` 내부 링크 정리 (4-4~4-6)
7. [ ] 로컬 dev 서버로 검증 (7절)
8. [ ] 커밋 → 배포 (기존 배포 파이프라인)
9. [ ] 배포 후 실서버에서 참여자 계정으로 최종 확인

## 7. 검증 시나리오

**참여자 계정:**
- [ ] 로그인 → `/profile`(내 점수)로 진입, 하단 메뉴 3개(내 점수/보상/게시판)만 표시
- [ ] 주소창에 `/daily`, `/shop`, `/education`, `/admin` 직접 입력 → 모두 `/profile`로 리다이렉트
- [ ] 보상센터: 골드 잔액 표시, 교환소 이동, 보상 수령 흐름 정상
- [ ] 게시판 글 목록·작성 정상
- [ ] 작업중지 버튼 미표시, 팀 가입 모달 미표시, 역할 선택 화면 미표시

**관리자 계정:**
- [ ] 모드 선택 화면 정상 → 관리자 모드: `/admin`, 보상 승인, 비밀번호 초기화 승인, 의견관리, 리포트 모두 기존과 동일
- [ ] 테스트 모드: 기존 전체 참여자 화면 접근 가능

## 8. 롤백

`.env`에 `VITE_BETA_CLOSED=false` 추가 후 재빌드·재배포 → 베타 당시 화면으로 즉시 복귀.
(빌드 타임 env이므로 재배포는 필요함)

## 9. 범위 외 (참고)

- **백엔드 API 차단 없음**: 이번 작업은 프론트엔드 노출 제어만 수행. 퀘스트/상점 API 자체는 살아있으므로, 완전 차단이 필요하면 백엔드에서 해당 엔드포인트를 비활성화하는 후속 작업 필요.
- 코드 물리적 삭제(사용 안 하는 페이지 제거)는 안정화 후 별도 진행 권장.
- Supabase 전환 계획(별도 문서)과는 독립적 — 순서 무관하게 진행 가능.
