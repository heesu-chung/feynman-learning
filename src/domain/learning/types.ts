export const learningStates = [
  "unknown",
  "read",
  "explained",
  "verified",
  "review_due",
  "reviewed",
  "mastered",
] as const;

export type LearningState = (typeof learningStates)[number];

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

export function isLearningState(value: unknown): value is LearningState {
  return typeof value === "string" && learningStates.includes(value as LearningState);
}
