import type { LearningScore, LearningState, ReviewInfo } from "../learning/types.ts";

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
