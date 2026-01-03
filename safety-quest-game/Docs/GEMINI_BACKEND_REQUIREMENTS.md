# 🔗 Gemini API 백엔드 연동 필요사항

> **목적**: 프론트엔드에서 Gemini API를 활용하기 위한 백엔드 구현 가이드

---

## 📋 현재 상태

### ✅ 프론트엔드 준비 완료
- `src/api/gemsApi.js` - 백엔드 API 호출 구조 완료
- `src/pages/RiskSolutionPage.jsx` - UI 및 연동 로직 완료
- `src/utils/geminiService.js` - 서비스 래퍼 완료
- Dashboard에서 "안전 지능 시스템" 버튼으로 접근 가능

### ✅ 백엔드 구현 완료
- `GeminiService.java` - Gemini API 직접 호출 구현 완료
- `GeminiConfig.java` - API Key 및 설정 관리 구현 완료
- `BusinessPlanService.java` - Gemini 호출로 구현 완료 (Mock 제거됨)
- 에러 처리 및 Fallback 로직 구현 완료
- 토큰 사용량 로깅 구현 완료
- `application.properties` 및 `application-dev.properties`에 Gemini 설정 완료

---

## 🎯 백엔드 구현 필요사항

### 1. API 엔드포인트 (이미 구현됨)
```
POST /api/v1/business-plan/generate
```

### 2. Request 형식 (프론트엔드에서 전송)
```json
{
  "inputType": "TEXT",
  "inputText": "건설 현장 2층 비계 작업 중 안전난간이 심하게 흔들리고 있습니다...",
  "photoId": null,
  "context": {
    "workType": "construction",
    "location": "2층 비계",
    "workerCount": 3,
    "currentTask": "철골 용접 작업"
  }
}
```

### 3. Response 형식 (백엔드에서 반환해야 함)
```json
{
  "success": true,
  "data": {
    "riskFactor": "고소 작업 중 안전대 미체결",
    "remediationSteps": [
      "즉시 작업을 중단하고 안전한 장소로 이동하십시오.",
      "안전대 및 부속품의 상태를 점검하십시오.",
      "안전대 체결 후 2인 1조로 작업을 재개하십시오."
    ],
    "referenceCode": "KOSHA-G-2023-01",
    "actionRecordId": "550e8400-e29b-41d4-a716-446655440000",
    "riskLevel": "HIGH",
    "analysisId": "analysis-2024-12-17-001",
    "analyzedAt": "2024-12-17T10:30:00.000Z"
  }
}
```

### 4. Gemini API 연동 구현

#### 필요한 파일들
1. **GeminiService.java** - Gemini API 직접 호출
2. **GeminiConfig.java** - API Key 및 설정 관리
3. **BusinessPlanService.java** - Mock 로직을 Gemini 호출로 대체

#### 구현 가이드
자세한 구현 가이드는 다음 문서를 참조하세요:
- **@Docs/GEMINI_INTEGRATION_PROMPT.md** - Cursor AI용 프롬프트 포함

#### 핵심 요구사항
1. **시스템 프롬프트**: 산업안전보건 전문가 역할 부여
2. **응답 파싱**: Gemini의 JSON 응답을 DTO에 매핑
3. **에러 처리**: Gemini API 실패 시 Fallback 처리
4. **토큰 로깅**: 사용량 정보 로깅 (선택사항)

---

## 📚 관련 문서

| 문서 | 설명 |
|------|------|
| [BACKEND_INTEGRATION_GUIDE.md](./BACKEND_INTEGRATION_GUIDE.md) | 백엔드 통합 가이드 (현재 Mock 상태) |
| [GEMINI_INTEGRATION_PROMPT.md](./GEMINI_INTEGRATION_PROMPT.md) | Gemini API 연동 상세 가이드 (Cursor 프롬프트 포함) |
| [API_STRUCTURE.md](./API_STRUCTURE.md) | API 구조 문서 |

---

## ✅ 체크리스트

### 백엔드 작업
- [x] Gemini API Key 설정 (`application.properties`) ✅
- [x] GeminiService.java 구현 ✅
- [x] GeminiConfig.java 구현 ✅
- [x] BusinessPlanService.java에서 Mock 제거 및 Gemini 호출로 대체 ✅
- [x] 에러 처리 및 Fallback 로직 구현 ✅
- [x] 토큰 사용량 로깅 (선택사항) ✅

### 테스트
- [x] 프론트엔드에서 API 호출 테스트 ✅ (CORS 설정 완료, 포트 3002 추가됨)
- [ ] 에러 케이스 테스트 (Gemini API 실패 시 Fallback 동작 확인)
- [x] 응답 형식 검증 ✅ (BusinessPlanResponse DTO로 표준화됨)

---

## 🔧 환경 설정

### application.properties
```properties
# Gemini API Configuration
gemini.api.key=${GEMINI_API_KEY}
gemini.api.url=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
gemini.api.timeout=30000
```

> ⚠️ **보안**: 프로덕션 환경에서는 환경변수로 API Key 관리

---

## 📞 프론트엔드 연동 확인

프론트엔드에서 백엔드 연동을 확인하려면:

1. **환경변수 설정** (`.env` 파일)
   ```
   VITE_API_BASE_URL=http://localhost:8080
   VITE_USE_MOCK=false
   ```

2. **브라우저 콘솔 확인**
   - `[GEMS API] Calling POST /api/v1/business-plan/generate` 로그 확인
   - 응답 데이터 확인

3. **에러 처리**
   - 서버 연결 실패 시 자동으로 Mock으로 폴백
   - 네트워크 에러는 사용자에게 표시

---

---

## 🎉 구현 완료 상태

### ✅ 완료된 작업 (2025-01-03)
1. **Gemini API 연동 완료**
   - `GeminiService.java`: Google Generative AI API 직접 호출 구현
   - `GeminiConfig.java`: API Key 및 설정 관리 (환경변수 지원)
   - `BusinessPlanService.java`: Mock 제거, 실제 Gemini API 호출로 대체

2. **에러 처리 및 Fallback**
   - Gemini API 실패 시 자동 Fallback 응답 생성
   - 키워드 기반 기본 분석 로직 구현

3. **로깅 및 모니터링**
   - 토큰 사용량 로깅 구현
   - 상세한 요청/응답 로깅

4. **환경 설정**
   - `application.properties`: 기본 Gemini 설정
   - `application-dev.properties`: 개발용 API Key 설정 (환경변수 우선)

### 📝 사용 방법

#### 1. 환경변수 설정 (권장)
```bash
# Windows PowerShell
$env:GEMINI_API_KEY="your-api-key-here"

# Windows CMD
set GEMINI_API_KEY=your-api-key-here

# Linux/Mac
export GEMINI_API_KEY=your-api-key-here
```

#### 2. API Key 확인
- 환경변수 `GEMINI_API_KEY`가 설정되어 있으면 우선 사용
- 없으면 `application-dev.properties`의 기본값 사용

#### 3. 테스트
1. 백엔드 서버 실행
2. 프론트엔드에서 "안전 지능 시스템" 버튼 클릭
3. 위험 상황 입력 후 "AI 솔루션 요청" 클릭
4. 브라우저 콘솔에서 로그 확인:
   - `[GEMS API] Calling POST /api/v1/business-plan/generate`
   - `[Gemini API 호출 시작]`
   - `[Gemini API 호출 완료]`

---

## 🧪 테스트 가이드

### 1. 정상 동작 테스트

#### 요청 예시
```bash
curl -X POST http://localhost:8080/api/v1/business-plan/generate \
  -H "Content-Type: application/json" \
  -d '{
    "inputType": "TEXT",
    "inputText": "건설 현장 2층 비계 작업 중 안전난간이 심하게 흔들리고 있습니다. 작업자 3명이 해당 구역에서 철골 용접 작업을 진행 중이며, 안전대 체결 상태가 불량하여 추락 사고 위험이 매우 높은 상황입니다.",
    "photoId": null,
    "context": {
      "workType": "construction",
      "location": "2층 비계",
      "workerCount": 3,
      "currentTask": "철골 용접 작업"
    }
  }'
```

#### 예상 응답
```json
{
  "success": true,
  "data": {
    "riskFactor": "고소 작업 중 안전대 미체결",
    "remediationSteps": [
      "즉시 작업을 중단하고 안전한 장소로 이동하십시오.",
      "안전대 및 부속품의 상태를 점검하십시오.",
      "안전대 체결 후 2인 1조로 작업을 재개하십시오."
    ],
    "referenceCode": "KOSHA-G-2023-01",
    "actionRecordId": "550e8400-e29b-41d4-a716-446655440000",
    "riskLevel": "HIGH",
    "analysisId": "analysis-2025-01-03-abc12345",
    "analyzedAt": "2025-01-03T10:30:00"
  }
}
```

### 2. 에러 케이스 테스트

#### 2.1 Gemini API 실패 시 Fallback 동작 확인

**테스트 방법:**
1. 잘못된 API Key 설정 (또는 네트워크 차단)
2. API 호출 시도
3. Fallback 응답이 반환되는지 확인

**예상 동작:**
- `GeminiService`에서 Exception 발생
- `createFallbackResponse()` 호출
- 키워드 기반 기본 분석 결과 반환
- 로그에 `[Gemini API 오류] 분석 실패, Fallback 응답 반환` 메시지 출력

#### 2.2 잘못된 요청 형식 테스트

**요청 예시:**
```json
{
  "inputType": "TEXT",
  "inputText": "",  // 빈 문자열
  "photoId": null,
  "context": {}
}
```

**예상 동작:**
- `@NotBlank` validation에 의해 400 Bad Request 반환
- 에러 메시지: "입력 텍스트는 비워둘 수 없습니다."

### 3. 로그 확인

#### 백엔드 로그에서 확인할 내용:
```
[GEMS AI 분석 시작] requestId=xxx, inputType=TEXT, inputTextLength=xxx
[Gemini API 호출 시작] requestId=xxx
[Gemini API 요청] URL: https://generativelanguage.googleapis.com/...
[Gemini Usage Log] Input: xxx, Output: xxx, Total: xxx
[Gemini API 호출 완료] requestId=xxx, riskFactor=xxx, riskLevel=xxx, duration=xxxms
[GEMS AI 분석 완료] requestId=xxx, analysisId=xxx, duration=xxxms
```

#### 프론트엔드 콘솔에서 확인할 내용:
```
[GEMS API] Calling POST http://localhost:8080/api/v1/business-plan/generate
[GEMS API] Request Body: {...}
[GEMS API] Raw Response: {...}
[GEMS API] Normalized Response: {...}
```

### 4. 성능 테스트

#### 예상 응답 시간:
- Gemini API 호출: 1-3초
- 전체 처리 시간: 1-4초

#### 모니터링 포인트:
- 토큰 사용량 (로그에서 확인)
- API 응답 시간
- Fallback 발생 빈도

---

*문서 작성일: 2024-12-20*
*최종 업데이트: 2025-01-03*
*백엔드 Gemini API 연동 완료 ✅*

