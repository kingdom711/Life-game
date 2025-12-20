# Safety Quest Game - Cursor Rules Index

> 이 문서는 `.cursor/rule/` 폴더의 모든 규칙 파일을 정리한 인덱스입니다.
> AI Agent가 프로젝트 작업 시 참고합니다.

## 📁 규칙 파일 구조

### 000-099: 코어/프로젝트 전체 규칙
| 파일 | 설명 | 적용 범위 |
|------|------|----------|
| [000-meta-rule-script.mdc](000-meta-rule-script.mdc) | 프로젝트 원칙 및 AI Agent 메타 규칙 | 항상 적용 |
| [001-project-overview.mdc](001-project-overview.mdc) | Safety Quest Game 프로젝트 개요 | 항상 적용 |
| [002-tech-stack.mdc](002-tech-stack.mdc) | 기술 스택 정의 | 항상 적용 |
| [003-development-guidelines.mdc](003-development-guidelines.mdc) | 개발 가이드라인 | 항상 적용 |
| [010-cursor-rules.mdc](010-cursor-rules.mdc) | .mdc 파일 구조 가이드 | 규칙 파일 |
| [011-cursor-docs.mdc](011-cursor-docs.mdc) | 문서 구조 가이드라인 | 문서 파일 |
| [012-cursor-tools.mdc](012-cursor-tools.mdc) | 도구/스크립트 관리 | 도구 파일 |

### 100-199: 워크플로우 및 통합 규칙
| 파일 | 설명 | 적용 범위 |
|------|------|----------|
| [100-error-fixing-process.mdc](100-error-fixing-process.mdc) | 에러 해결 프로세스 | 디버깅 시 |
| [101-build-and-env-setup.mdc](101-build-and-env-setup.mdc) | 빌드 및 환경 설정 | 설정 파일 |
| [102-gitflow-agent.mdc](102-gitflow-agent.mdc) | Git Flow 자동화 | Git 작업 |

### 200-299: 패턴 및 스타일 규칙
| 파일 | 설명 | 적용 범위 |
|------|------|----------|
| [200-git-commit-push-pr.mdc](200-git-commit-push-pr.mdc) | Git 커밋/PR 규칙 | Git 작업 |
| [201-code-commenting.mdc](201-code-commenting.mdc) | 코드 주석 규칙 | 모든 코드 |
| [202-github-issue-handling.mdc](202-github-issue-handling.mdc) | GitHub 이슈 관리 | 이슈/PR |

### 300-399: 기술별 규칙
| 파일 | 설명 | 적용 범위 |
|------|------|----------|
| [301-spring-boot-java-rules.mdc](301-spring-boot-java-rules.mdc) | Spring Boot/Java 규칙 | *.java |
| [302-python-fastapi-rules.mdc](302-python-fastapi-rules.mdc) | ⚠️ 미사용 (Python) | - |
| [303-database-mysql-jpa-rules.mdc](303-database-mysql-jpa-rules.mdc) | DB/JPA 규칙 (H2/MySQL) | *.java, *.sql |
| [304-api-rest-design-rules.mdc](304-api-rest-design-rules.mdc) | REST API 설계 규칙 | Controller |
| [305-react-frontend-rules.mdc](305-react-frontend-rules.mdc) | React/Vite 규칙 | *.jsx, *.js |

---

## 🔗 관련 문서

| 문서 | 위치 | 설명 |
|------|------|------|
| Backend Integration Guide | `Docs/BACKEND_INTEGRATION_GUIDE.md` | 백엔드 연동 통합 가이드 |
| API Structure | `Docs/API_STRUCTURE.md` | 프론트엔드 API 구조 |
| AI Generation API | `Docs/AI_GENERATION_API_SUBMIT.md` | GEMS AI API 상세 스펙 |

---

## 🎯 주요 작업별 참조 규칙

### 프론트엔드 개발
→ [305-react-frontend-rules.mdc](305-react-frontend-rules.mdc), [003-development-guidelines.mdc](003-development-guidelines.mdc)

### 백엔드 연동
→ [301-spring-boot-java-rules.mdc](301-spring-boot-java-rules.mdc), [304-api-rest-design-rules.mdc](304-api-rest-design-rules.mdc), `Docs/BACKEND_INTEGRATION_GUIDE.md`

### 데이터베이스 작업
→ [303-database-mysql-jpa-rules.mdc](303-database-mysql-jpa-rules.mdc)

### Git 작업
→ [200-git-commit-push-pr.mdc](200-git-commit-push-pr.mdc), [102-gitflow-agent.mdc](102-gitflow-agent.mdc)

### 에러 해결
→ [100-error-fixing-process.mdc](100-error-fixing-process.mdc)
