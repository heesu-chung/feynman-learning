"use client";

import { useEffect, useMemo, useState } from "react";

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
import {
  calculateScoreAverage,
  isWeakNode,
  learningStates,
  type LearningScore,
  type LearningState,
} from "../src/domain/learning/index.ts";
import { decodeGraphFromHash, encodeGraphToHash } from "../src/state/urlState.ts";

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

const storageKey = "feynman-learning-os:concept-graph";

export function GraphEditor() {
  const [history, setHistory] = useState<HistoryState>(() => createHistoryState(initialGraph));
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const [selectedId, setSelectedId] = useState(initialGraph.rootId);
  const [childTitle, setChildTitle] = useState("");
  const [shareStatus, setShareStatus] = useState("idle");
  const [showWeakOnly, setShowWeakOnly] = useState(false);
  const validation = validateConceptGraph(history.graph);
  const selectedNode = history.graph.nodes[selectedId] ?? history.graph.nodes[history.graph.rootId];
  const nodes = useMemo(() => flattenGraph(history.graph), [history.graph]);
  const weakNodes = nodes.filter(({ node }) => isWeakNode(node));
  const visibleNodes = showWeakOnly ? weakNodes : nodes;
  const weakNodeCount = weakNodes.length;
  const selectedAverage = calculateScoreAverage(selectedNode.score);

  useEffect(() => {
    const urlGraph = loadGraphFromUrl();
    const storedGraph = loadStoredGraph();
    const graph = urlGraph ?? storedGraph;

    if (graph) {
      setHistory(createHistoryState(graph));
      setSelectedId(graph.rootId);
    }

    setHasLoadedStorage(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(history.graph));
  }, [hasLoadedStorage, history.graph]);

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

  function updateSelectedScore(key: keyof LearningScore, value: number): void {
    updateSelected({
      score: {
        clarity: selectedNode.score?.clarity ?? 0,
        correctness: selectedNode.score?.correctness ?? 0,
        simplicity: selectedNode.score?.simplicity ?? 0,
        confidence: selectedNode.score?.confidence ?? 0,
        retention: selectedNode.score?.retention,
        [key]: value,
      },
    });
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

  function selectNextWeakNode(): void {
    if (weakNodes.length === 0) {
      return;
    }

    const currentIndex = weakNodes.findIndex(({ node }) => node.id === selectedNode.id);
    const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % weakNodes.length;
    setSelectedId(weakNodes[nextIndex].node.id);
  }

  function markSelectedReviewed(): void {
    updateSelected({ learningState: "reviewed" });
  }

  function resetGraph(): void {
    localStorage.removeItem(storageKey);
    window.history.replaceState(null, "", window.location.pathname);
    setHistory(createHistoryState(initialGraph));
    setSelectedId(initialGraph.rootId);
    setChildTitle("");
    setShareStatus("reset");
  }

  async function shareGraph(): Promise<void> {
    const hash = encodeGraphToHash(history.graph);
    const shareUrl = `${window.location.origin}${window.location.pathname}${hash}`;
    window.history.replaceState(null, "", hash);

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus("copied");
    } catch {
      setShareStatus("url ready");
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
        <Status label="Weak nodes" value={`${weakNodeCount}`} />
        <Status label="Share URL" value={shareStatus} />
      </section>

      <section className="toolbar" aria-label="편집 도구">
        <button disabled={history.undoStack.length === 0} onClick={undoLast} type="button">
          Undo
        </button>
        <button disabled={history.redoStack.length === 0} onClick={redoLast} type="button">
          Redo
        </button>
        <button onClick={resetGraph} type="button">
          Reset
        </button>
        <button onClick={() => void shareGraph()} type="button">
          Share URL
        </button>
        <button
          className={showWeakOnly ? "activeButton" : ""}
          onClick={() => setShowWeakOnly((value) => !value)}
          type="button"
        >
          Weak only
        </button>
        <button disabled={weakNodeCount === 0} onClick={selectNextWeakNode} type="button">
          Next weak
        </button>
      </section>

      <section className="reviewStrip" aria-label="약한 노드 리뷰">
        <div>
          <p className="eyebrow">Review queue</p>
          <h2>{weakNodeCount === 0 ? "No weak nodes" : `${weakNodeCount} weak nodes`}</h2>
        </div>
        <p>
          Weak node는 설명이 비어 있거나 이해도 평균이 낮은 개념입니다. 복습 후에도 점수가
          낮으면 계속 약한 노드로 남습니다.
        </p>
      </section>

      <section className="editorShell" aria-label="ConceptGraph 편집기">
        <aside className="nodeTree">
          <h2>ConceptGraph</h2>
          <div className="nodeList">
            {visibleNodes.map(({ node, depth }) => (
              <button
                className={[
                  "node",
                  node.id === selectedNode.id ? "selected" : "",
                  isWeakNode(node) ? "weak" : "strong",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={node.id}
                onClick={() => setSelectedId(node.id)}
                style={{ "--depth": depth } as React.CSSProperties}
                type="button"
              >
                <span>
                  <strong>{node.title}</strong>
                  <small>
                    {node.learningState} · {scoreLabel(node)}
                  </small>
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

          <section className="scorePanel" aria-label="이해도 점수">
            <div className="scoreHeader">
              <div>
                <p className="eyebrow">Understanding score</p>
                <h3>{selectedAverage === undefined ? "Not scored" : formatScore(selectedAverage)}</h3>
              </div>
              <strong className={isWeakNode(selectedNode) ? "weakBadge" : "strongBadge"}>
                {isWeakNode(selectedNode) ? "weak" : "steady"}
              </strong>
            </div>

            <ScoreSlider
              label="Clarity"
              onChange={(value) => updateSelectedScore("clarity", value)}
              value={selectedNode.score?.clarity ?? 0}
            />
            <ScoreSlider
              label="Correctness"
              onChange={(value) => updateSelectedScore("correctness", value)}
              value={selectedNode.score?.correctness ?? 0}
            />
            <ScoreSlider
              label="Simplicity"
              onChange={(value) => updateSelectedScore("simplicity", value)}
              value={selectedNode.score?.simplicity ?? 0}
            />
            <ScoreSlider
              label="Confidence"
              onChange={(value) => updateSelectedScore("confidence", value)}
              value={selectedNode.score?.confidence ?? 0}
            />
          </section>

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
            className="reviewButton"
            disabled={selectedNode.learningState === "reviewed"}
            onClick={markSelectedReviewed}
            type="button"
          >
            Mark reviewed
          </button>

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

function ScoreSlider({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <label className="scoreSlider">
      <span>
        {label}
        <strong>{formatScore(value)}</strong>
      </span>
      <input
        max="1"
        min="0"
        onChange={(event) => onChange(Number(event.target.value))}
        step="0.05"
        type="range"
        value={value}
      />
    </label>
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

function scoreLabel(node: ConceptNode): string {
  const average = calculateScoreAverage(node.score);
  return average === undefined ? "not scored" : formatScore(average);
}

function formatScore(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function loadStoredGraph(): ConceptGraph | undefined {
  const rawGraph = localStorage.getItem(storageKey);
  if (!rawGraph) {
    return undefined;
  }

  try {
    const parsedGraph = JSON.parse(rawGraph) as ConceptGraph;
    const validation = validateConceptGraph(parsedGraph);
    return validation.valid ? parsedGraph : undefined;
  } catch {
    return undefined;
  }
}

function loadGraphFromUrl(): ConceptGraph | undefined {
  const result = decodeGraphFromHash(window.location.hash);
  return result.ok ? result.graph : undefined;
}
