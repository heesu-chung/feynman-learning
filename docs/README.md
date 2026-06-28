# Feynman Learning OS

Feynman 학습법을 기반으로 어려운 개념을 직접 설명하고, 약한 지점을 찾아 다시 복습하는 개인용 Understanding System입니다.

이 프로젝트는 단기 데모가 아니라 1년 동안 제품을 만들며 엔지니어링을 함께 학습하는 프로젝트입니다.

## 프로젝트 목표

| 목표 | 설명 |
| --- | --- |
| 이해 중심 학습 | 개념을 그래프로 나누고 직접 설명하며 이해도를 확인합니다. |
| 작은 MVP | 학습 루프가 동작하기 전까지 큰 인프라를 만들지 않습니다. |
| 실전 학습 | TypeScript, 테스트, REST API, Node.js, GitHub workflow 등을 제품 안에서 배웁니다. |

## 현재 진행 상황

현재 Sprint 1은 `ConceptGraph`와 `LearningState` 도메인 기반을 만드는 단계입니다.

구현 완료:
- `ConceptGraph` 타입
- `LearningState` 타입
- 그래프 검증 로직
- 도메인 단위 테스트

아직 하지 않음:
- UI
- Pixi
- REST API
- Notion/Figma 연동
- AWS
- OpenAI API

## 테스트 방법

```bash
pnpm test
pnpm test:unit
```

현재 `typecheck`, `lint`, `build` 스크립트는 아직 정의되어 있지 않습니다.
