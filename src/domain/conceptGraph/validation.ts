import { isLearningState, type LearningScore } from "../learning/types.ts";
import type { ConceptGraph, ConceptNode } from "./types.ts";

export type ConceptGraphValidationError =
  | "MISSING_ROOT_NODE"
  | "MISSING_CHILD_NODE"
  | "CIRCULAR_REFERENCE"
  | "INVALID_LEARNING_SCORE"
  | "INVALID_LEARNING_STATE";

export type ConceptGraphValidationResult =
  | { valid: true }
  | { valid: false; errors: ConceptGraphValidationError[] };

export function validateConceptGraph(graph: ConceptGraph): ConceptGraphValidationResult {
  const errors = new Set<ConceptGraphValidationError>();
  const root = graph.nodes[graph.rootId];

  if (!root) {
    errors.add("MISSING_ROOT_NODE");
  }

  for (const node of Object.values(graph.nodes)) {
    validateNode(node, graph, errors);
  }

  if (root && hasCircularReference(graph, graph.rootId)) {
    errors.add("CIRCULAR_REFERENCE");
  }

  if (errors.size > 0) {
    return { valid: false, errors: [...errors] };
  }

  return { valid: true };
}

function validateNode(
  node: ConceptNode,
  graph: ConceptGraph,
  errors: Set<ConceptGraphValidationError>,
): void {
  if (!isLearningState(node.learningState)) {
    errors.add("INVALID_LEARNING_STATE");
  }

  if (node.score && !isValidLearningScore(node.score)) {
    errors.add("INVALID_LEARNING_SCORE");
  }

  for (const childId of node.children) {
    if (!graph.nodes[childId]) {
      errors.add("MISSING_CHILD_NODE");
    }
  }
}

function isValidLearningScore(score: LearningScore): boolean {
  return [
    score.clarity,
    score.correctness,
    score.simplicity,
    score.confidence,
    score.retention,
  ].every((value) => value === undefined || isScoreValue(value));
}

function isScoreValue(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

function hasCircularReference(graph: ConceptGraph, rootId: string): boolean {
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(nodeId: string): boolean {
    if (visiting.has(nodeId)) {
      return true;
    }

    if (visited.has(nodeId)) {
      return false;
    }

    const node = graph.nodes[nodeId];
    if (!node) {
      return false;
    }

    visiting.add(nodeId);

    for (const childId of node.children) {
      if (visit(childId)) {
        return true;
      }
    }

    visiting.delete(nodeId);
    visited.add(nodeId);
    return false;
  }

  return visit(rootId);
}
