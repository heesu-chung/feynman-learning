# Feynman Learning OS

Feynman 학습법을 기반으로 어려운 개념을 직접 설명하고, 약한 지점을 찾아 다시 복습하는 개인용 Understanding System입니다.

이 프로젝트는 단기 데모가 아니라 1년 동안 제품을 만들며 엔지니어링을 함께 학습하는 프로젝트입니다.

## 프로젝트 목표

| 목표 | 설명 |
| --- | --- |
| 이해 중심 학습 | 개념을 그래프로 나누고 직접 설명하며 이해도를 확인합니다. |
| 작은 MVP | 학습 루프가 동작하기 전까지 큰 인프라를 만들지 않습니다. |
| 실전 학습 | TypeScript, 테스트, REST API, Node.js, GitHub workflow 등을 제품 안에서 배웁니다. |
| 디자인 방향 | 흑백 중심의 편집 화면 위에 파스텔 블록을 얹는 Figma-inspired 스타일을 따릅니다. |

## 현재 진행 상황

현재는 도메인 기반 위에 로컬 ConceptGraph 편집기를 얹는 단계입니다.

구현 완료:
- Next.js 최소 앱
- 로컬 ConceptGraph 편집기
- localStorage 저장/복원
- URL 공유
- 이해도 점수/약한 노드 표시
- 리뷰 플로우
- 자동 Task 프로토콜
- GitHub Issue/PR 템플릿
- 화면 문구 한글화
- 디자인 방향 문서화
- `ConceptGraph` 타입
- `LearningState` 타입
- 그래프 검증 로직
- `TreePatch` 타입과 적용 로직
- command/history 규칙
- 도메인 단위 테스트

아직 하지 않음:
- Pixi
- Playwright E2E
- REST API
- Notion/Figma 연동
- AWS
- OpenAI API

## 실행 방법

```bash
pnpm dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 테스트 방법

```bash
pnpm typecheck
pnpm test
pnpm test:unit
pnpm build
```

현재 `lint` 스크립트는 아직 정의되어 있지 않습니다.
