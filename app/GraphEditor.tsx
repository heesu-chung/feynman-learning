"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

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
import {
  exportLearningTree,
  importLearningTree,
  type ImportLearningTreeError,
} from "../src/domain/importExport/index.ts";
import { decodeGraphFromHash, encodeGraphToHash } from "../src/state/urlState.ts";

const initialGraph: ConceptGraph = {
  rootId: "root",
  nodes: {
    root: {
      id: "root",
      title: "파인만 러닝 OS",
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
  const [treeJsonInput, setTreeJsonInput] = useState("");
  const [treeJsonImportStatus, setTreeJsonImportStatus] = useState("idle");
  const [treeJsonExportStatus, setTreeJsonExportStatus] = useState("idle");
  const [treeJsonError, setTreeJsonError] = useState("");
  const [showWeakOnly, setShowWeakOnly] = useState(false);
  const validation = validateConceptGraph(history.graph);
  const selectedNode = history.graph.nodes[selectedId] ?? history.graph.nodes[history.graph.rootId];
  const nodes = useMemo(() => flattenGraph(history.graph), [history.graph]);
  const exportedTreeJson = useMemo(
    () => JSON.stringify(exportLearningTree(history.graph), null, 2),
    [history.graph],
  );
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
    setTreeJsonImportStatus("idle");
    setTreeJsonExportStatus("idle");
    setTreeJsonError("");
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

  function importTreeJson(): void {
    setTreeJsonError("");

    let parsedTree: unknown;
    try {
      parsedTree = JSON.parse(treeJsonInput);
    } catch {
      setTreeJsonImportStatus("error");
      setTreeJsonError("JSON 문법을 확인해 주세요.");
      return;
    }

    const result = importLearningTree(parsedTree);
    if (!result.ok) {
      setTreeJsonImportStatus("error");
      setTreeJsonError(importErrorLabel(result.error));
      return;
    }

    window.history.replaceState(null, "", window.location.pathname);
    setHistory(createHistoryState(result.graph));
    setSelectedId(result.graph.rootId);
    setChildTitle("");
    setShareStatus("idle");
    setTreeJsonImportStatus("imported");
    setTreeJsonExportStatus("idle");
  }

  async function copyExportedTreeJson(): Promise<void> {
    try {
      await navigator.clipboard.writeText(exportedTreeJson);
      setTreeJsonExportStatus("copied");
    } catch {
      setTreeJsonExportStatus("ready");
    }
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">스프린트 2</p>
        <h1>파인만 러닝 OS</h1>
        <p className="summary">
          개념 그래프를 직접 수정하며 파인만 학습 루프의 기본 구조를 다듬는
          로컬 편집기입니다.
        </p>
      </section>

      <section className="statusGrid" aria-label="도메인 상태">
        <Status label="그래프 검증" value={validation.valid ? "정상" : "오류"} />
        <Status label="약한 노드" value={`${weakNodeCount}개`} />
        <Status label="공유 링크" value={shareStatusLabel(shareStatus)} />
      </section>

      <section className="toolbar" aria-label="편집 도구">
        <button disabled={history.undoStack.length === 0} onClick={undoLast} type="button">
          되돌리기
        </button>
        <button disabled={history.redoStack.length === 0} onClick={redoLast} type="button">
          다시 실행
        </button>
        <button onClick={resetGraph} type="button">
          초기화
        </button>
        <button onClick={() => void shareGraph()} type="button">
          링크 복사
        </button>
        <button
          className={showWeakOnly ? "activeButton" : ""}
          onClick={() => setShowWeakOnly((value) => !value)}
          type="button"
        >
          약한 노드만
        </button>
        <button disabled={weakNodeCount === 0} onClick={selectNextWeakNode} type="button">
          다음 약점
        </button>
      </section>

      <section className="treeJsonPanel" aria-label="Learning tree JSON 가져오기와 내보내기">
        <div className="treeJsonColumn">
          <label>
            JSON 가져오기
            <textarea
              onChange={(event) => {
                setTreeJsonInput(event.target.value);
                setTreeJsonError("");
                setTreeJsonImportStatus("idle");
              }}
              placeholder='{"title":"주제","children":[{"title":"하위 개념"}]}'
              rows={8}
              value={treeJsonInput}
            />
          </label>
          <div className="treeJsonActions">
            <button
              disabled={treeJsonInput.trim().length === 0}
              onClick={importTreeJson}
              type="button"
            >
              JSON 가져오기
            </button>
            <span aria-live="polite">{treeJsonImportStatusLabel(treeJsonImportStatus)}</span>
          </div>
          {treeJsonError ? <p className="errorText">{treeJsonError}</p> : null}
        </div>

        <div className="treeJsonColumn">
          <label>
            JSON 내보내기
            <textarea readOnly rows={8} value={exportedTreeJson} />
          </label>
          <div className="treeJsonActions">
            <button onClick={() => void copyExportedTreeJson()} type="button">
              JSON 복사
            </button>
            <span aria-live="polite">{treeJsonExportStatusLabel(treeJsonExportStatus)}</span>
          </div>
        </div>
      </section>

      <section className="reviewStrip" aria-label="약한 노드 리뷰">
        <div>
          <p className="eyebrow">복습 대기열</p>
          <h2>{weakNodeCount === 0 ? "약한 노드 없음" : `약한 노드 ${weakNodeCount}개`}</h2>
        </div>
        <p>
          Weak node는 설명이 비어 있거나 이해도 평균이 낮은 개념입니다. 복습 후에도 점수가
          낮으면 계속 약한 노드로 남습니다.
        </p>
      </section>

      <section className="editorShell" aria-label="개념 그래프 편집기">
        <aside className="nodeTree">
          <h2>개념 그래프</h2>
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
                style={{ "--depth": depth } as CSSProperties}
                type="button"
              >
                <span>
                  <strong>{node.title}</strong>
                  <small>
                    {learningStateLabel(node.learningState)} · {scoreLabel(node)}
                  </small>
                </span>
                <em>{node.children.length}</em>
              </button>
            ))}
          </div>
        </aside>

        <section className="inspector" aria-label="선택된 node 편집">
          <div>
            <p className="eyebrow">선택한 노드</p>
            <h2>{selectedNode.title}</h2>
          </div>

          <label>
            제목
            <input
              onChange={(event) => updateSelected({ title: event.target.value })}
              value={selectedNode.title}
            />
          </label>

          <label>
            학습 상태
            <select
              onChange={(event) =>
                updateSelected({ learningState: event.target.value as LearningState })
              }
              value={selectedNode.learningState}
            >
              {learningStates.map((state) => (
                <option key={state} value={state}>
                  {learningStateLabel(state)}
                </option>
              ))}
            </select>
          </label>

          <label>
            내 설명
            <textarea
              onChange={(event) => updateSelected({ explanation: event.target.value })}
              rows={6}
              value={selectedNode.explanation ?? ""}
            />
          </label>

          <section className="scorePanel" aria-label="이해도 점수">
            <div className="scoreHeader">
              <div>
                <p className="eyebrow">이해도 점수</p>
                <h3>{selectedAverage === undefined ? "점수 없음" : formatScore(selectedAverage)}</h3>
              </div>
              <strong className={isWeakNode(selectedNode) ? "weakBadge" : "strongBadge"}>
                {isWeakNode(selectedNode) ? "약함" : "안정"}
              </strong>
            </div>

            <ScoreSlider
              label="명확성"
              onChange={(value) => updateSelectedScore("clarity", value)}
              value={selectedNode.score?.clarity ?? 0}
            />
            <ScoreSlider
              label="정확성"
              onChange={(value) => updateSelectedScore("correctness", value)}
              value={selectedNode.score?.correctness ?? 0}
            />
            <ScoreSlider
              label="단순성"
              onChange={(value) => updateSelectedScore("simplicity", value)}
              value={selectedNode.score?.simplicity ?? 0}
            />
            <ScoreSlider
              label="자신감"
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
              placeholder="새 하위 노드"
              value={childTitle}
            />
            <button onClick={addChild} type="button">
              하위 노드 추가
            </button>
          </div>

          <button
            className="reviewButton"
            disabled={selectedNode.learningState === "reviewed"}
            onClick={markSelectedReviewed}
            type="button"
          >
            복습 완료로 표시
          </button>

          <button
            className="dangerButton"
            disabled={selectedNode.id === history.graph.rootId}
            onClick={deleteSelected}
            type="button"
          >
            노드 삭제
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
  return average === undefined ? "점수 없음" : formatScore(average);
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

function shareStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    copied: "복사됨",
    idle: "대기",
    reset: "초기화됨",
    "url ready": "링크 준비됨",
  };

  return labels[status] ?? status;
}

function treeJsonImportStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    error: "가져오기 실패",
    idle: "대기",
    imported: "가져오기 완료",
  };

  return labels[status] ?? status;
}

function treeJsonExportStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    copied: "복사됨",
    idle: "대기",
    ready: "복사할 JSON 준비됨",
  };

  return labels[status] ?? status;
}

function importErrorLabel(error: ImportLearningTreeError): string {
  const labels: Record<ImportLearningTreeError, string> = {
    DUPLICATE_ID: "중복된 id가 있습니다.",
    EMPTY_TITLE: "비어 있는 title이 있습니다.",
    INVALID_IMPORTED_TREE: "ConceptGraph로 변환할 수 없는 트리입니다.",
    INVALID_ROOT: "루트에는 문자열 title이 필요합니다.",
  };

  return labels[error];
}

function learningStateLabel(state: LearningState): string {
  const labels: Record<LearningState, string> = {
    unknown: "모름",
    read: "읽음",
    explained: "설명함",
    verified: "검증됨",
    review_due: "복습 필요",
    reviewed: "복습 완료",
    mastered: "숙달",
  };

  return labels[state];
}
