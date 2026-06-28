import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

import type { ConceptGraph } from "../../src/domain/conceptGraph/index.ts";
import { decodeGraphFromHash, encodeGraphToHash } from "../../src/state/urlState.ts";

before(() => {
  globalThis.btoa = (value: string) => Buffer.from(value, "binary").toString("base64");
  globalThis.atob = (value: string) => Buffer.from(value, "base64").toString("binary");
});

describe("urlState", () => {
  it("encodes and decodes a valid graph", () => {
    const graph = createGraph();
    const hash = encodeGraphToHash(graph);

    assert.equal(hash.startsWith("#graph="), true);
    assert.deepEqual(decodeGraphFromHash(hash), { ok: true, graph });
  });

  it("preserves unicode text", () => {
    const graph = createGraph("한글 설명");
    const result = decodeGraphFromHash(encodeGraphToHash(graph));

    assert.equal(result.ok, true);
    assert.equal(result.ok ? result.graph.nodes.root.explanation : "", "한글 설명");
  });

  it("rejects a missing graph hash", () => {
    assert.deepEqual(decodeGraphFromHash("#other=value"), {
      ok: false,
      error: "MISSING_HASH",
    });
  });

  it("rejects malformed graph hashes", () => {
    assert.deepEqual(decodeGraphFromHash("#graph=not-json"), {
      ok: false,
      error: "MALFORMED_HASH",
    });
  });

  it("rejects invalid graph state", () => {
    const graph = createGraph();
    graph.rootId = "missing";

    assert.deepEqual(decodeGraphFromHash(encodeGraphToHash(graph)), {
      ok: false,
      error: "INVALID_GRAPH",
    });
  });
});

function createGraph(explanation?: string): ConceptGraph {
  const root = {
    id: "root",
    title: "Root",
    children: [],
    learningState: "unknown" as const,
  };

  return {
    rootId: "root",
    nodes: {
      root: explanation ? { ...root, explanation } : root,
    },
  };
}
