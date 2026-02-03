# YouTube 교육 영상 통합 구현 플랜

## 개요
안전 교육 시스템에 YouTube 영상 연결을 지원하며, 빨리감기/넘기기를 방지하고 실제 시청 시간이 경과해야만 퀴즈 버튼이 활성화되는 기능을 구현합니다.

## 주요 요구사항
1. **YouTube 영상 연결** - 로컬 MP4 대신 YouTube URL 지원
2. **빨리감기/넘기기 방지** - 학습자가 영상을 건너뛸 수 없도록 제한
3. **실제 시청 시간 추적** - 일시정지나 탭 이탈 시 시간 카운트 중단
4. **조건부 퀴즈 활성화** - 필수 시청 시간 충족 후에만 "문제 풀기" 버튼 표시

---

## User Review Required

> [!IMPORTANT]
> **YouTube API 키 필요**: YouTube IFrame API 사용 시 특별한 API 키는 필요 없지만, 일부 고급 기능(통계, 분석) 사용 시 Google Cloud Console에서 API 키 발급이 필요할 수 있습니다.

> [!WARNING]
> **YouTube Player 제약사항**: YouTube는 기본적으로 사용자에게 재생 바를 제공합니다. JavaScript로 seek 이벤트를 감지해 되돌릴 수는 있지만, 모바일 기기나 일부 브라우저에서는 완벽한 제어가 어려울 수 있습니다.

---

## Proposed Changes

### 1. 비디오 플레이어 컴포넌트

#### [NEW] [YouTubeEducationPlayer.jsx](file:///d:/Repository/JINSUNG/Life-game/safety-quest-game/src/components/YouTubeEducationPlayer.jsx)

YouTube IFrame API를 활용한 새 교육 전용 플레이어 컴포넌트:

```javascript
// 핵심 기능
- YouTube IFrame API 로드 및 초기화
- 재생 상태 모니터링 (onStateChange)
- 시청 시간 실시간 추적 (setInterval 사용)
- Seek 감지 및 되돌리기 (getCurrentTime vs maxWatchedTime 비교)
- 진행률 표시 및 완료 콜백
```

**주요 Props:**
- `youtubeVideoId`: YouTube 비디오 ID (예: "dQw4w9WgXcQ")
- `duration`: 영상 총 길이 (초)
- `requiredWatchTime`: 필수 시청 시간 (초)
- `onTimeUpdate`: 시간 업데이트 콜백
- `onVideoComplete`: 시청 완료 콜백

**빨리감기 방지 로직:**
```javascript
// 1초마다 현재 재생 위치 체크
const checkSeek = () => {
    const currentTime = player.getCurrentTime();
    if (currentTime > maxWatchedTime + 3) {
        // 빨리감기 감지 → 이전 최대 위치로 되돌림
        player.seekTo(maxWatchedTime, true);
        showWarning();
    } else if (currentTime > maxWatchedTime) {
        setMaxWatchedTime(currentTime);
    }
};
```

---

#### [MODIFY] [EducationVideoPlayer.jsx](file:///d:/Repository/JINSUNG/Life-game/safety-quest-game/src/components/EducationVideoPlayer.jsx)

기존 로컬 비디오 플레이어는 그대로 유지하고, Wrapper 컴포넌트 또는 조건부 렌더링으로 YouTube/로컬 비디오 분기 처리 추가:

```jsx
const EducationVideoPlayer = (props) => {
    const isYouTube = props.videoUrl?.includes('youtube') || props.youtubeVideoId;
    
    if (isYouTube) {
        return <YouTubeEducationPlayer {...props} />;
    }
    return <LocalVideoPlayer {...props} />;
};
```

---

### 2. 교육 데이터 스키마 확장

#### [MODIFY] [educationData.js](file:///d:/Repository/JINSUNG/Life-game/safety-quest-game/src/data/educationData.js)

YouTube URL을 저장할 수 있도록 데이터 스키마 확장:

```javascript
{
    id: 'edu_001',
    category: EDUCATION_CATEGORY.FALL_PREVENTION,
    title: '사다리 작업 안전 수칙',
    // 기존 필드
    videoUrl: '/videos/safety/ladder_safety.mp4',  // 로컬 비디오 (fallback)
    // 새 필드
    youtubeVideoId: 'xxxxxxxxxx',  // YouTube 비디오 ID (우선 사용)
    // ...
}
```

---

### 3. 페이지 컴포넌트 수정

#### [MODIFY] [EducationPage.jsx](file:///d:/Repository/JINSUNG/Life-game/safety-quest-game/src/pages/EducationPage.jsx)

YouTube 비디오 ID를 플레이어에 전달하도록 수정:

```jsx
<EducationVideoPlayer
    videoUrl={todayEducation.videoUrl}
    youtubeVideoId={todayEducation.youtubeVideoId}  // 추가
    duration={todayEducation.duration}
    requiredWatchTime={todayEducation.requiredWatchTime}
    // ...
/>
```

---

## 기술 세부사항

### YouTube IFrame API 사용법

```html
<!-- index.html에 스크립트 태그 추가 또는 동적 로드 -->
<script src="https://www.youtube.com/iframe_api"></script>
```

```javascript
// React 컴포넌트에서 동적 로드
useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
    
    window.onYouTubeIframeAPIReady = () => {
        // 플레이어 초기화
    };
}, []);
```

### 시청 시간 추적 알고리즘

```mermaid
flowchart TD
    A[영상 재생 시작] --> B{재생 중?}
    B -->|예| C[1초마다 currentTime 체크]
    C --> D{currentTime > maxWatchedTime + 3?}
    D -->|예| E[Seek 감지! 되돌리기]
    D -->|아니오| F{currentTime > maxWatchedTime?}
    F -->|예| G[maxWatchedTime 업데이트]
    F -->|아니오| H[유지]
    G --> I{maxWatchedTime >= requiredWatchTime?}
    I -->|예| J[onVideoComplete 호출]
    I -->|아니오| B
    B -->|아니오| K[타이머 일시정지]
    E --> B
```

---

## Verification Plan

### 1. 수동 테스트 (브라우저)

**테스트 환경 설정:**
```bash
cd d:\Repository\JINSUNG\Life-game\safety-quest-game
npm run dev
```

**테스트 시나리오:**

| # | 테스트 항목 | 예상 결과 | 확인 방법 |
|---|------------|----------|----------|
| 1 | YouTube 영상 로드 | 영상이 정상적으로 표시됨 | 교육 페이지 접속 후 영상 확인 |
| 2 | 빨리감기 시도 | 경고 메시지 표시 후 이전 위치로 되돌아감 | 재생 바를 앞으로 드래그 시도 |
| 3 | 되감기 허용 | 이미 시청한 구간으로 되돌아가기 가능 | 재생 바를 뒤로 드래그 |
| 4 | 시청 시간 누적 | 일시정지 시 시간 증가 멈춤 | 재생/일시정지 반복하며 진행률 확인 |
| 5 | 퀴즈 버튼 활성화 | 90% 시청 후에만 "문제 풀기" 버튼 표시 | 영상 끝까지 시청 |
| 6 | 탭 이탈 시 처리 | 다른 탭으로 전환 시 시간 카운트 중단 | 영상 재생 중 다른 탭으로 이동 후 복귀 |

### 2. 사용자 확인 요청

> [!NOTE]
> 구현 완료 후, 실제 YouTube 영상 URL/ID를 교육 데이터에 등록하고 교육 페이지에서 테스트해주시기 바랍니다. 모바일 환경에서의 동작도 확인이 필요합니다.

---

## 예상 작업 시간
- YouTubeEducationPlayer.jsx 신규 생성: ~1시간
- 기존 컴포넌트 수정 및 통합: ~30분
- 테스트 및 디버깅: ~30분

---

## 추가 고려사항

1. **오프라인 대비**: YouTube 연결 실패 시 로컬 비디오로 fallback
2. **모바일 호환성**: iOS Safari에서 자동 재생 제한 처리
3. **접근성**: 자막(CC) 활성화 옵션 제공
