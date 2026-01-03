# 🎯 Gemini API 백엔드 연동 구현 상태

> **최종 업데이트**: 2025-01-03  
> **상태**: ✅ 구현 완료

---

## ✅ 구현 완료 항목

### 1. 핵심 서비스 구현
- ✅ **GeminiService.java** - Google Generative AI API 직접 호출
  - 시스템 프롬프트: 산업안전보건 전문가 역할 부여
  - 응답 파싱: JSON 추출 및 DTO 매핑
  - 에러 처리: Fallback 응답 자동 생성
  - 토큰 로깅: 사용량 정보 로깅

- ✅ **GeminiConfig.java** - API Key 및 설정 관리
  - 환경변수 우선 사용 (`GEMINI_API_KEY`)
  - 개발용 기본값 제공 (`application-dev.properties`)
  - RestTemplate Bean 생성 (타임아웃 설정)

- ✅ **BusinessPlanService.java** - Mock 제거, Gemini 호출로 대체
  - `geminiService.analyzeRisk()` 호출
  - `BusinessPlanResponse` DTO 변환
  - 상세 로깅 (요청 ID, 처리 시간 등)

### 2. 에러 처리 및 Fallback
- ✅ **GeminiService**에서 Exception 발생 시 Fallback 응답 반환
- ✅ 키워드 기반 기본 분석 로직 구현
- ✅ 로그에 에러 정보 기록

### 3. 환경 설정
- ✅ `application.properties`: 기본 Gemini 설정
- ✅ `application-dev.properties`: 개발용 API Key 설정
- ✅ 환경변수 지원 (`GEMINI_API_KEY`)

### 4. API 엔드포인트
- ✅ `POST /api/v1/business-plan/generate` 구현 완료
- ✅ Swagger 문서화 완료
- ✅ Request/Response DTO 검증 완료

---

## 📋 구현 세부사항

### GeminiService 주요 기능

#### 1. 시스템 프롬프트
```java
private static final String SYSTEM_PROMPT = """
    당신은 산업안전보건 전문가입니다.
    사용자가 설명하는 현장 위험 상황을 분석하고, 다음 형식으로 응답하세요:
    
    1. riskFactor: 핵심 위험 요인 (한 문장)
    2. riskLevel: 위험 등급 (CRITICAL, HIGH, MEDIUM, LOW 중 하나)
    3. remediationSteps: 구체적인 조치 방안 (3~5개의 단계별 지침, 배열 형태)
    4. referenceCode: 관련 KOSHA 가이드 코드
    ...
    """;
```

#### 2. 에러 처리 흐름
```
GeminiService.analyzeRisk()
  └─> callGeminiApi() [실패 시 Exception 발생]
      └─> catch (Exception e)
          └─> createFallbackResponse() [키워드 기반 분석]
              └─> GeminiAnalysisResult 반환
```

#### 3. Fallback 로직
- 입력 텍스트의 키워드를 분석하여 기본 위험 요인 판단
- 키워드별 KOSHA 코드 매핑
- 기본 조치 방안 제공

### BusinessPlanService 주요 기능

#### 1. 요청 처리 흐름
```
BusinessPlanController.generate()
  └─> BusinessPlanService.generate()
      └─> GeminiService.analyzeRisk()
          └─> GeminiAnalysisResult 반환
              └─> BusinessPlanResponse 변환
                  └─> ApiResponse.success() 래핑
```

#### 2. 로깅
- 요청 ID 생성 및 추적
- Gemini API 호출 시간 측정
- 전체 처리 시간 측정
- 상세 에러 로깅

---

## 🔧 환경 설정

### 필수 설정

#### 1. 환경변수 설정 (권장)
```bash
# Windows PowerShell
$env:GEMINI_API_KEY="your-api-key-here"

# Windows CMD
set GEMINI_API_KEY=your-api-key-here

# Linux/Mac
export GEMINI_API_KEY=your-api-key-here
```

#### 2. application.properties
```properties
# Legacy Gemini API Configuration
gemini.api.key=${GEMINI_API_KEY:}
gemini.api.url=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
gemini.api.timeout=30000
```

#### 3. application-dev.properties
```properties
# 개발용 기본 API Key (환경변수가 없을 때 사용)
gemini.api.key=${GEMINI_API_KEY:AIzaSyApVKXwo46wo1kPa4mnRneDMxPZImb0TcE}
```

---

## 🧪 테스트 방법

### 1. 백엔드 서버 실행
```bash
cd safert-road-inclass/backend
.\gradlew.bat bootRun
```

### 2. API 테스트 (Swagger)
1. 브라우저에서 `http://localhost:8080/swagger-ui` 접속
2. `POST /api/v1/business-plan/generate` 엔드포인트 선택
3. "Try it out" 클릭
4. 요청 본문 입력 후 "Execute" 클릭

### 3. 프론트엔드 테스트
1. 프론트엔드 서버 실행 (`npm run dev`)
2. `http://localhost:3002` 접속
3. "안전 지능 시스템" 버튼 클릭
4. 위험 상황 입력 후 "AI 솔루션 요청" 클릭
5. 브라우저 콘솔에서 로그 확인

### 4. 로그 확인

#### 백엔드 로그 예시:
```
2025-01-03 10:30:00.123 [http-nio-8080-exec-1] INFO  c.j.s.d.a.s.BusinessPlanService - [GEMS AI 분석 시작] requestId=abc12345, inputType=TEXT, inputTextLength=150
2025-01-03 10:30:00.124 [http-nio-8080-exec-1] INFO  c.j.s.d.a.s.BusinessPlanService - [Gemini API 호출 시작] requestId=abc12345
2025-01-03 10:30:00.125 [http-nio-8080-exec-1] INFO  c.j.s.d.a.s.GeminiService - [Gemini API 요청] URL: https://generativelanguage.googleapis.com/...
2025-01-03 10:30:02.456 [http-nio-8080-exec-1] INFO  c.j.s.d.a.s.GeminiService - [Gemini Usage Log] Input: 250, Output: 180, Total: 430
2025-01-03 10:30:02.457 [http-nio-8080-exec-1] INFO  c.j.s.d.a.s.BusinessPlanService - [Gemini API 호출 완료] requestId=abc12345, riskFactor=고소 작업 중 안전대 미체결, riskLevel=HIGH, duration=2332ms
2025-01-03 10:30:02.458 [http-nio-8080-exec-1] INFO  c.j.s.d.a.s.BusinessPlanService - [GEMS AI 분석 완료] requestId=abc12345, analysisId=analysis-2025-01-03-abc12345, duration=2335ms
```

#### 프론트엔드 콘솔 예시:
```
[GEMS API] Calling POST http://localhost:8080/api/v1/business-plan/generate
[GEMS API] Request Body: {inputType: "TEXT", inputText: "...", ...}
[GEMS API] Raw Response: {riskFactor: "...", remediationSteps: [...], ...}
[GEMS API] Normalized Response: {success: true, riskFactor: "...", ...}
```

---

## 📊 성능 지표

### 예상 응답 시간
- **Gemini API 호출**: 1-3초
- **전체 처리 시간**: 1-4초
- **Fallback 응답**: < 100ms

### 토큰 사용량 (예상)
- **입력 토큰**: 200-300 tokens
- **출력 토큰**: 150-250 tokens
- **총 토큰**: 350-550 tokens

---

## 🔍 문제 해결

### 문제 1: Gemini API 호출 실패
**증상**: 로그에 `[Gemini API 오류] 분석 실패, Fallback 응답 반환` 메시지

**해결 방법**:
1. API Key 확인: 환경변수 `GEMINI_API_KEY` 설정 확인
2. 네트워크 확인: 인터넷 연결 상태 확인
3. API Key 유효성 확인: Google AI Studio에서 API Key 확인

### 문제 2: CORS 에러
**증상**: 브라우저 콘솔에 CORS 에러 메시지

**해결 방법**:
1. `SecurityConfig.java`에서 프론트엔드 포트 확인
2. 현재 프론트엔드 포트가 허용 목록에 있는지 확인
3. 백엔드 서버 재시작

### 문제 3: 응답 파싱 실패
**증상**: 로그에 `[Gemini 응답 파싱 실패]` 메시지

**해결 방법**:
1. Gemini 응답 형식 확인 (로그에서 확인)
2. JSON 추출 로직 확인 (`extractJson()` 메서드)
3. Fallback 응답이 반환되는지 확인

---

## 📚 관련 파일

### 백엔드 파일
- `safert-road-inclass/backend/src/main/java/com/jinsung/safety_road_inclass/domain/ai/service/GeminiService.java`
- `safert-road-inclass/backend/src/main/java/com/jinsung/safety_road_inclass/domain/ai/service/BusinessPlanService.java`
- `safert-road-inclass/backend/src/main/java/com/jinsung/safety_road_inclass/domain/ai/config/GeminiConfig.java`
- `safert-road-inclass/backend/src/main/java/com/jinsung/safety_road_inclass/domain/ai/controller/BusinessPlanController.java`
- `safert-road-inclass/backend/src/main/resources/application.properties`
- `safert-road-inclass/backend/src/main/resources/application-dev.properties`

### 프론트엔드 파일
- `Life-game/safety-quest-game/src/api/gemsApi.js`
- `Life-game/safety-quest-game/src/pages/RiskSolutionPage.jsx`
- `Life-game/safety-quest-game/src/config/environment.js`

---

## ✅ 체크리스트

### 백엔드 구현
- [x] Gemini API Key 설정
- [x] GeminiService.java 구현
- [x] GeminiConfig.java 구현
- [x] BusinessPlanService.java에서 Mock 제거 및 Gemini 호출로 대체
- [x] 에러 처리 및 Fallback 로직 구현
- [x] 토큰 사용량 로깅

### 프론트엔드 연동
- [x] API 클라이언트 구현
- [x] CORS 설정 완료
- [x] 에러 처리 및 Mock Fallback 구현

### 테스트
- [x] 프론트엔드에서 API 호출 테스트
- [x] 응답 형식 검증
- [ ] 에러 케이스 테스트 (Gemini API 실패 시 Fallback 동작 확인)

---

*문서 작성일: 2025-01-03*
*구현 상태: 완료 ✅*

