import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { ConceptNode } from "../../src/domain/conceptGraph/index.ts";
import { calculateScoreAverage, isWeakNode } from "../../src/domain/learning/index.ts";

describe("learning scoring", () => {
  it("calculates the average of core score dimensions", () => {
    assert.equal(
      calculateScoreAverage({
        clarity: 1,
        correctness: 0.5,
        simplicity: 0.5,
        confidence: 0,
      }),
      0.5,
    );
  });

  it("marks nodes without explanations as weak", () => {
    assert.equal(isWeakNode(node({ explanation: "" })), true);
  });

  it("marks nodes below the weak threshold as weak", () => {
    assert.equal(
      isWeakNode(
        node({
          explanation: "I can explain part of this.",
          score: {
            clarity: 0.5,
            correctness: 0.5,
            simplicity: 0.5,
            confidence: 0.5,
          },
        }),
      ),
      true,
    );
  });

  it("does not mark explained high-score nodes as weak", () => {
    assert.equal(
      isWeakNode(
        node({
          explanation: "I can explain this simply.",
          score: {
            clarity: 0.8,
            correctness: 0.8,
            simplicity: 0.8,
            confidence: 0.8,
          },
        }),
      ),
      false,
    );
  });
});

function node(patch: Partial<ConceptNode>): ConceptNode {
  return {
    id: "node",
    title: "Node",
    children: [],
    learningState: "unknown",
    ...patch,
  };
}
