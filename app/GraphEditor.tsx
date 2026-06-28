"use client";

import { useMemo, useState } from "react";

import type { ConceptGraph, ConceptNode } from "../src/domain/conceptGraph/index.ts";
import { validateConceptGraph } from "../src/domain/conceptGraph/index.ts";
import { TreePatchCommand } from "../src/domain/commands/index.ts";
import {
  createHistoryState,
  executeCommand,
  redo,
  undo,
  type HistoryState,
} from "../src/domain/history/index.ts";
import { learningStates, type LearningState } from "../src/domain/learning/types.ts";

const initialGraph: ConceptGraph = {
  rootId: "root",
  nodes: {
    root: {
      id: "root",
      title: "Feynman Learning OS",
      children: ["explain", "review"],
      learningState: "read",
      score: {
        clarity: 0.7,
        correctness: 0.6,
        simplicity: 0.5,
        confidence: 0.6,
      },
    },
    explain: {
      id: "explain",
      title: "내 말로 설명하기",
      children: [],
      learningState: "explained",
    },
    review: {
      id: "review",
      title: "약한 지점 복습하기",
      children: [],
      learningState: "unknown",
    },
  },
};

export function GraphEditor() {
  const [history, setHistory] = useState<HistoryState>(() => createHistoryState(initialGraph));
  const [selectedId, setSelectedId] = useState(initialGraph.rootId);
  const [childTitle, setChildTitle] = useState("");
  const validation = validateConceptGraph(history.graph);
  const selectedNode = history.graph.nodes[selectedId] ?? history.graph.nodes[history.graph.rootId];
  const nodes = useMemo(() => flattenGraph(history.graph), [history.graph]);

  function run(command: TreePatchCommand): void {
    const result = executeCommand(history, command);
    if (result.ok) {
      setHistory(result.state);
    }
  }

  function updateSelected(patch: Partial<ConceptNode>): void {
    run(
      new TreePatchCommand({
        type: "UPDATE_NODE",
        nodeId: selectedNode.id,
        patch,
      }),
    );
  }

  function addChild(): void {
    const title = childTitle.trim();
    if (!title) {
      return;
    }

    const id = createNodeId(history.graph, title);
    run(
      new TreePatchCommand({
        type: "ADD_NODE",
        parentId: selectedNode.id,
        node: {
          id,
          title,
          children: [],
          learningState: "unknown",
        },
      }),
    );
    setSelectedId(id);
    setChildTitle("");
  }

  function deleteSelected(): void {
    if (selectedNode.id === history.graph.rootId) {
      return;
    }

    const parentId = findParentId(history.graph, selectedNode.id) ?? history.graph.rootId;
    run(new TreePatchCommand({ type: "DELETE_NODE", nodeId: selectedNode.id }));
    setSelectedId(parentId);
  }

  function undoLast(): void {
    const result = undo(history);
    if (result.ok) {
      setHistory(result.state);
      if (!result.state.graph.nodes[selectedId]) {
        setSelectedId(result.state.graph.rootId);
      }
    }
  }

  function redoLast(): void {
    const result = redo(history);
    if (result.ok) {
      setHistory(result.state);
      if (!result.state.graph.nodes[selectedId]) {
        setSelectedId(result.state.graph.rootId);
      }
    }
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Sprint 2</p>
        <h1>Feynman Learning OS</h1>
        <p className="summary">
          ConceptGraph를 직접 수정하며 Feynman 학습 루프의 기본 구조를 다듬는
          로컬 편집기입니다.
        </p>
      </section>

      <section className="statusGrid" aria-label="도메인 상태">
        <Status label="Graph validation" value={validation.valid ? "valid" : "invalid"} />
        <Status label="Undo stack" value={`${history.undoStack.length}`} />
        <Status label="Redo stack" value={`${history.redoStack.length}`} />
      </section>

      <section className="toolbar" aria-label="편집 도구">
        <button disabled={history.undoStack.length === 0} onClick={undoLast} type="button">
          Undo
        </button>
        <button disabled={history.redoStack.length === 0} onClick={redoLast} type="button">
          Redo
        </button>
      </section>

      <section className="editorShell" aria-label="ConceptGraph 편집기">
        <aside className="nodeTree">
          <h2>ConceptGraph</h2>
          <div className="nodeList">
            {nodes.map(({ node, depth }) => (
              <button
                className={node.id === selectedNode.id ? "node selected" : "node"}
                key={node.id}
                onClick={() => setSelectedId(node.id)}
                style={{ "--depth": depth } as React.CSSProperties}
                type="button"
              >
                <span>
                  <strong>{node.title}</strong>
                  <small>{node.learningState}</small>
                </span>
                <em>{node.children.length}</em>
              </button>
            ))}
          </div>
        </aside>

        <section className="inspector" aria-label="선택된 node 편집">
          <div>
            <p className="eyebrow">Selected node</p>
            <h2>{selectedNode.title}</h2>
          </div>

          <label>
            Title
            <input
              onChange={(event) => updateSelected({ title: event.target.value })}
              value={selectedNode.title}
            />
          </label>

          <label>
            Learning state
            <select
              onChange={(event) =>
                updateSelected({ learningState: event.target.value as LearningState })
              }
              value={selectedNode.learningState}
            >
              {learningStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>

          <label>
            Explanation
            <textarea
              onChange={(event) => updateSelected({ explanation: event.target.value })}
              rows={6}
              value={selectedNode.explanation ?? ""}
            />
          </label>

          <div className="addChild">
            <input
              onChange={(event) => setChildTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  addChild();
                }
              }}
              placeholder="새 child node"
              value={childTitle}
            />
            <button onClick={addChild} type="button">
              Add child
            </button>
          </div>

          <button
            className="dangerButton"
            disabled={selectedNode.id === history.graph.rootId}
            onClick={deleteSelected}
            type="button"
          >
            Delete node
          </button>
        </section>
      </section>
    </main>
  );
}

function Status({ label, value }: { label: string; value: string }) {
  return (
    <article className="status">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function flattenGraph(graph: ConceptGraph): Array<{ node: ConceptNode; depth: number }> {
  const result: Array<{ node: ConceptNode; depth: number }> = [];

  function visit(nodeId: string, depth: number): void {
    const node = graph.nodes[nodeId];
    if (!node) {
      return;
    }

    result.push({ node, depth });
    for (const childId of node.children) {
      visit(childId, depth + 1);
    }
  }

  visit(graph.rootId, 0);
  return result;
}

function createNodeId(graph: ConceptGraph, title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-|-$/g, "");
  const base = slug || "node";
  let index = 1;
  let id = base;

  while (graph.nodes[id]) {
    index += 1;
    id = `${base}-${index}`;
  }

  return id;
}

function findParentId(graph: ConceptGraph, nodeId: string): string | undefined {
  return Object.values(graph.nodes).find((node) => node.children.includes(nodeId))?.id;
}
