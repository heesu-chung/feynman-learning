import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  applyTreePatch,
  type ConceptGraph,
} from "../../src/domain/conceptGraph/index.ts";

describe("applyTreePatch", () => {
  it("adds a child node to a parent", () => {
    const result = applyTreePatch(baseGraph(), {
      type: "ADD_NODE",
      parentId: "root",
      node: {
        id: "child",
        title: "Child",
        children: [],
        learningState: "unknown",
      },
    });

    assert.equal(result.ok, true);
    assert.deepEqual(result.ok ? result.graph.nodes.root.children : [], ["child"]);
    assert.equal(result.ok ? result.graph.nodes.child.title : "", "Child");
  });

  it("updates node fields without changing the node id", () => {
    const result = applyTreePatch(baseGraph(), {
      type: "UPDATE_NODE",
      nodeId: "root",
      patch: {
        id: "ignored",
        title: "Updated root",
        learningState: "explained",
      },
    });

    assert.equal(result.ok, true);
    assert.equal(result.ok ? result.graph.nodes.root.id : "", "root");
    assert.equal(result.ok ? result.graph.nodes.root.title : "", "Updated root");
    assert.equal(result.ok ? result.graph.nodes.root.learningState : "", "explained");
  });

  it("deletes a node and its descendants", () => {
    const graph: ConceptGraph = {
      rootId: "root",
      nodes: {
        root: node("root", ["child"]),
        child: node("child", ["grandchild"]),
        grandchild: node("grandchild"),
      },
    };

    const result = applyTreePatch(graph, {
      type: "DELETE_NODE",
      nodeId: "child",
    });

    assert.equal(result.ok, true);
    assert.deepEqual(result.ok ? result.graph.nodes.root.children : ["not-empty"], []);
    assert.equal(result.ok ? result.graph.nodes.child : undefined, undefined);
    assert.equal(result.ok ? result.graph.nodes.grandchild : undefined, undefined);
  });

  it("moves a node to a new parent", () => {
    const graph: ConceptGraph = {
      rootId: "root",
      nodes: {
        root: node("root", ["a", "b"]),
        a: node("a"),
        b: node("b"),
      },
    };

    const result = applyTreePatch(graph, {
      type: "MOVE_NODE",
      nodeId: "a",
      newParentId: "b",
    });

    assert.equal(result.ok, true);
    assert.deepEqual(result.ok ? result.graph.nodes.root.children : [], ["b"]);
    assert.deepEqual(result.ok ? result.graph.nodes.b.children : [], ["a"]);
  });

  it("rejects patches that create circular references", () => {
    const graph: ConceptGraph = {
      rootId: "root",
      nodes: {
        root: node("root", ["child"]),
        child: node("child"),
      },
    };

    const result = applyTreePatch(graph, {
      type: "MOVE_NODE",
      nodeId: "root",
      newParentId: "child",
    });

    assert.deepEqual(result, { ok: false, error: "INVALID_PATCH_RESULT" });
  });

  it("rejects deleting the root node", () => {
    const result = applyTreePatch(baseGraph(), {
      type: "DELETE_NODE",
      nodeId: "root",
    });

    assert.deepEqual(result, { ok: false, error: "CANNOT_DELETE_ROOT" });
  });

  it("rejects adding duplicate nodes", () => {
    const result = applyTreePatch(baseGraph(), {
      type: "ADD_NODE",
      parentId: "root",
      node: node("root"),
    });

    assert.deepEqual(result, { ok: false, error: "NODE_ALREADY_EXISTS" });
  });
});

function baseGraph(): ConceptGraph {
  return {
    rootId: "root",
    nodes: {
      root: node("root"),
    },
  };
}

function node(id: string, children: string[] = []) {
  return {
    id,
    title: id,
    children,
    learningState: "unknown" as const,
  };
}
