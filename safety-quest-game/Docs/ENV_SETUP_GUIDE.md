# 환경변수 설정 가이드

## .env 파일 생성 방법

프로젝트 루트 폴더에 `.env` 파일을 수동으로 생성하고 아래 내용을 복사하세요.

### 방법 1: 터미널에서 생성

```bash
# PowerShell
New-Item -Path ".env" -ItemType File

# 또는 Git Bash / Mac / Linux
touch .env
```

### 방법 2: 탐색기에서 생성

1. 프로젝트 폴더 열기: `D:\Workspace\repository\Life-game\safety-quest-game`
2. 새 텍스트 파일 만들기
3. 파일명을 `.env`로 변경 (확장자 없이)

---

## .env 파일 내용

아래 내용을 `.env` 파일에 복사하세요:

```env
# Backend API Configuration
# 백엔드 서버 URL (별도 백엔드 주소로 변경하세요)
VITE_API_BASE_URL=http://localhost:8080

# Mock 모드 (false = 실제 백엔드 사용, true = Mock 데이터 사용)
VITE_USE_MOCK=false

# API 타임아웃 (밀리초)
VITE_API_TIMEOUT=30000

# 개발 모드 (디버그 로그 활성화)
VITE_DEV_MODE=true
```

---

## 설정 옵션 설명

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `VITE_API_BASE_URL` | 백엔드 서버 주소 | `http://localhost:8080` |
| `VITE_USE_MOCK` | Mock 모드 사용 여부 | `false` |
| `VITE_API_TIMEOUT` | API 요청 타임아웃 (ms) | `30000` |
| `VITE_DEV_MODE` | 개발 모드 (디버그 로그) | `true` |

---

## 백엔드 서버 주소 예시

```env
# 로컬 개발 서버
VITE_API_BASE_URL=http://localhost:8080

# 같은 네트워크 내 다른 PC
VITE_API_BASE_URL=http://192.168.1.100:8080

# 클라우드 서버
VITE_API_BASE_URL=https://api.your-domain.com

# AWS EC2
VITE_API_BASE_URL=http://ec2-xx-xxx-xxx-xxx.compute.amazonaws.com:8080
```

---

## Mock 모드 사용

백엔드 서버 없이 테스트하려면:

```env
VITE_USE_MOCK=true
```

이 경우 프론트엔드가 미리 정의된 Mock 데이터를 반환합니다.

---

## 설정 후 확인

1. 프론트엔드 재시작: `npm run dev`
2. 브라우저 개발자 도구(F12) → Console 탭 확인
3. `[Config] Environment loaded:` 로그 확인

```
[Config] Environment loaded: {
  API_BASE_URL: "http://localhost:8080",
  USE_MOCK: false,
  API_TIMEOUT: 30000,
  DEV_MODE: true
}
```

---

*문서 작성일: 2024-12-20*

