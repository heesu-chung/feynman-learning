import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { ConceptGraph } from "../../src/domain/conceptGraph/index.ts";
import {
  exportLearningTree,
  importLearningTree,
} from "../../src/domain/importExport/index.ts";

describe("learning tree JSON import/export", () => {
  it("imports nested ChatGPT-friendly JSON into a normalized concept graph", () => {
    const result = importLearningTree({
      title: "React Rendering",
      body: "React renders components into UI.",
      children: [
        {
          title: "Reconciliation",
          body: "React compares the previous and next tree.",
        },
      ],
    });

    assert.equal(result.ok, true);

    if (!result.ok) {
      return;
    }

    assert.equal(result.graph.rootId, "react-rendering");
    assert.deepEqual(result.graph.nodes["react-rendering"], {
      id: "react-rendering",
      title: "React Rendering",
      explanation: "React renders components into UI.",
      children: ["reconciliation"],
      learningState: "unknown",
    });
    assert.equal(result.graph.nodes.reconciliation?.title, "Reconciliation");
  });

  it("keeps explicit ids and rejects duplicate explicit ids", () => {
    const result = importLearningTree({
      id: "root",
      title: "Root",
      children: [
        {
          id: "root",
          title: "Duplicate",
        },
      ],
    });

    assert.deepEqual(result, { ok: false, error: "DUPLICATE_ID" });
  });

  it("generates unique ids for repeated titles", () => {
    const result = importLearningTree({
      title: "State",
      children: [{ title: "State" }, { title: "State" }],
    });

    assert.equal(result.ok, true);

    if (!result.ok) {
      return;
    }

    assert.deepEqual(result.graph.nodes.state?.children, ["state-2", "state-3"]);
  });

  it("rejects malformed trees", () => {
    assert.deepEqual(importLearningTree({ title: "" }), { ok: false, error: "EMPTY_TITLE" });
    assert.deepEqual(importLearningTree({ body: "missing title" }), {
      ok: false,
      error: "INVALID_ROOT",
    });
  });

  it("exports a concept graph back to nested JSON", () => {
    const graph: ConceptGraph = {
      rootId: "root",
      nodes: {
        root: {
          id: "root",
          title: "Root",
          explanation: "Root body",
          children: ["child"],
          learningState: "unknown",
        },
        child: {
          id: "child",
          title: "Child",
          explanation: "Child body",
          children: [],
          learningState: "unknown",
        },
      },
    };

    assert.deepEqual(exportLearningTree(graph), {
      id: "root",
      title: "Root",
      body: "Root body",
      children: [
        {
          id: "child",
          title: "Child",
          body: "Child body",
          children: [],
        },
      ],
    });
  });
});
