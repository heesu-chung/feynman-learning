# Domain Model

```ts
export type LearningState =
  | "unknown"
  | "read"
  | "explained"
  | "verified"
  | "review_due"
  | "reviewed"
  | "mastered";

export type LearningScore = {
  clarity: number;
  correctness: number;
  simplicity: number;
  confidence: number;
  retention?: number;
};

export type ReviewInfo = {
  lastReviewedAt?: string;
  nextReviewAt?: string;
  reviewCount: number;
};

export type ConceptNode = {
  id: string;
  title: string;
  explanation?: string;
  simpleExplanation?: string;
  analogy?: string;
  children: string[];
  learningState: LearningState;
  score?: LearningScore;
  review?: ReviewInfo;
};

export type ConceptGraph = {
  rootId: string;
  nodes: Record<string, ConceptNode>;
};
```
