# 🔗 Gemini API 백엔드 연동 필요사항

> **목적**: 프론트엔드에서 Gemini API를 활용하기 위한 백엔드 구현 가이드

---

## 📋 현재 상태

### ✅ 프론트엔드 준비 완료
- `src/api/gemsApi.js` - 백엔드 API 호출 구조 완료
- `src/pages/RiskSolutionPage.jsx` - UI 및 연동 로직 완료
- `src/utils/geminiService.js` - 서비스 래퍼 완료
- Dashboard에서 "안전 지능 시스템" 버튼으로 접근 가능

### ⚠️ 백엔드 필요 작업
- 현재 Mock 응답만 구현되어 있음
- 실제 Gemini API 연동 필요

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
- [ ] Gemini API Key 설정 (`application.properties`)
- [ ] GeminiService.java 구현
- [ ] GeminiConfig.java 구현
- [ ] BusinessPlanService.java에서 Mock 제거 및 Gemini 호출로 대체
- [ ] 에러 처리 및 Fallback 로직 구현
- [ ] 토큰 사용량 로깅 (선택사항)

### 테스트
- [ ] 프론트엔드에서 API 호출 테스트
- [ ] 에러 케이스 테스트
- [ ] 응답 형식 검증

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

*문서 작성일: 2024-12-20*
*프론트엔드 준비 완료, 백엔드 Gemini 연동 대기 중*

