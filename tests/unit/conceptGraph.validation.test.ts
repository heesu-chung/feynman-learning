import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  type ConceptGraph,
  validateConceptGraph,
} from "../../src/domain/conceptGraph/index.ts";

describe("validateConceptGraph", () => {
  it("accepts a valid concept graph", () => {
    const graph: ConceptGraph = {
      rootId: "root",
      nodes: {
        root: {
          id: "root",
          title: "Feynman technique",
          children: ["explain"],
          learningState: "read",
          score: {
            clarity: 0.8,
            correctness: 0.7,
            simplicity: 0.6,
            confidence: 0.5,
            retention: 0.4,
          },
        },
        explain: {
          id: "explain",
          title: "Explain in my own words",
          children: [],
          learningState: "unknown",
        },
      },
    };

    assert.deepEqual(validateConceptGraph(graph), { valid: true });
  });

  it("rejects a graph with a missing root node", () => {
    const graph: ConceptGraph = {
      rootId: "missing",
      nodes: {},
    };

    assert.deepEqual(validateConceptGraph(graph), {
      valid: false,
      errors: ["MISSING_ROOT_NODE"],
    });
  });

  it("rejects a graph with a missing child node", () => {
    const graph: ConceptGraph = {
      rootId: "root",
      nodes: {
        root: {
          id: "root",
          title: "Root",
          children: ["missing-child"],
          learningState: "unknown",
        },
      },
    };

    assert.deepEqual(validateConceptGraph(graph), {
      valid: false,
      errors: ["MISSING_CHILD_NODE"],
    });
  });

  it("rejects circular references", () => {
    const graph: ConceptGraph = {
      rootId: "root",
      nodes: {
        root: {
          id: "root",
          title: "Root",
          children: ["child"],
          learningState: "unknown",
        },
        child: {
          id: "child",
          title: "Child",
          children: ["root"],
          learningState: "read",
        },
      },
    };

    assert.deepEqual(validateConceptGraph(graph), {
      valid: false,
      errors: ["CIRCULAR_REFERENCE"],
    });
  });

  it("rejects invalid learning score ranges", () => {
    const graph: ConceptGraph = {
      rootId: "root",
      nodes: {
        root: {
          id: "root",
          title: "Root",
          children: [],
          learningState: "unknown",
          score: {
            clarity: 1.1,
            correctness: 0,
            simplicity: 0.5,
            confidence: 1,
          },
        },
      },
    };

    assert.deepEqual(validateConceptGraph(graph), {
      valid: false,
      errors: ["INVALID_LEARNING_SCORE"],
    });
  });

  it("rejects invalid learning states", () => {
    const graph = {
      rootId: "root",
      nodes: {
        root: {
          id: "root",
          title: "Root",
          children: [],
          learningState: "done",
        },
      },
    } as unknown as ConceptGraph;

    assert.deepEqual(validateConceptGraph(graph), {
      valid: false,
      errors: ["INVALID_LEARNING_STATE"],
    });
  });
});
