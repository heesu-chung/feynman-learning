import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { type ConceptGraph } from "../../src/domain/conceptGraph/index.ts";
import { TreePatchCommand } from "../../src/domain/commands/index.ts";
import {
  createHistoryState,
  executeCommand,
  redo,
  undo,
} from "../../src/domain/history/index.ts";

describe("domain history", () => {
  it("executes a command and supports undo and redo", () => {
    const initial = createHistoryState(baseGraph());

    const executed = executeCommand(
      initial,
      new TreePatchCommand({
        type: "ADD_NODE",
        parentId: "root",
        node: {
          id: "child",
          title: "Child",
          children: [],
          learningState: "unknown",
        },
      }),
    );

    assert.equal(executed.ok, true);
    assert.deepEqual(executed.ok ? executed.state.graph.nodes.root.children : [], ["child"]);
    assert.equal(executed.ok ? executed.state.undoStack.length : 0, 1);

    const undone = undo(executed.ok ? executed.state : initial);

    assert.equal(undone.ok, true);
    assert.deepEqual(undone.ok ? undone.state.graph.nodes.root.children : ["child"], []);
    assert.equal(undone.ok ? undone.state.redoStack.length : 0, 1);

    const redone = redo(undone.ok ? undone.state : initial);

    assert.equal(redone.ok, true);
    assert.deepEqual(redone.ok ? redone.state.graph.nodes.root.children : [], ["child"]);
  });

  it("clears redo history when a new command is executed", () => {
    const initial = createHistoryState(baseGraph());
    const first = executeCommand(
      initial,
      new TreePatchCommand({
        type: "ADD_NODE",
        parentId: "root",
        node: node("first"),
      }),
    );
    const undone = undo(first.ok ? first.state : initial);

    const second = executeCommand(
      undone.ok ? undone.state : initial,
      new TreePatchCommand({
        type: "ADD_NODE",
        parentId: "root",
        node: node("second"),
      }),
    );

    assert.equal(second.ok, true);
    assert.equal(second.ok ? second.state.redoStack.length : -1, 0);
    assert.deepEqual(second.ok ? second.state.graph.nodes.root.children : [], ["second"]);
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

function node(id: string) {
  return {
    id,
    title: id,
    children: [],
    learningState: "unknown" as const,
  };
}
