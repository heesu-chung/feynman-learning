import type { ConceptNode } from "../conceptGraph/types.ts";
import type { LearningScore } from "./types.ts";

export const weakScoreThreshold = 0.6;

export function calculateScoreAverage(score: LearningScore | undefined): number | undefined {
  if (!score) {
    return undefined;
  }

  const values = [score.clarity, score.correctness, score.simplicity, score.confidence];
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function isWeakNode(node: ConceptNode): boolean {
  if (!node.explanation?.trim()) {
    return true;
  }

  const average = calculateScoreAverage(node.score);
  return average === undefined || average < weakScoreThreshold;
}
