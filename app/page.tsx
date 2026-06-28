import {
  applyTreePatch,
  validateConceptGraph,
  type ConceptGraph,
} from "../src/domain/conceptGraph/index.ts";
import { TreePatchCommand } from "../src/domain/commands/index.ts";
import { createHistoryState, executeCommand } from "../src/domain/history/index.ts";

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

const validation = validateConceptGraph(initialGraph);
const patchPreview = applyTreePatch(initialGraph, {
  type: "ADD_NODE",
  parentId: "root",
  node: {
    id: "feedback",
    title: "피드백 받기",
    children: [],
    learningState: "unknown",
  },
});
const historyPreview = executeCommand(
  createHistoryState(initialGraph),
  new TreePatchCommand({
    type: "UPDATE_NODE",
    nodeId: "review",
    patch: { learningState: "review_due" },
  }),
);

export default function Home() {
  const nodes = Object.values(initialGraph.nodes);

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Sprint 1</p>
        <h1>Feynman Learning OS</h1>
        <p className="summary">
          어려운 개념을 그래프로 나누고, 직접 설명하고, 약한 지점을 다시
          복습하는 개인용 이해 시스템입니다.
        </p>
      </section>

      <section className="statusGrid" aria-label="도메인 상태">
        <Status label="Graph validation" value={validation.valid ? "valid" : "invalid"} />
        <Status label="TreePatch" value={patchPreview.ok ? "ready" : "blocked"} />
        <Status label="Command history" value={historyPreview.ok ? "ready" : "blocked"} />
      </section>

      <section className="workspace" aria-label="현재 ConceptGraph">
        <div>
          <h2>현재 ConceptGraph</h2>
          <p>
            아직 UI 편집기나 Pixi 캔버스는 없습니다. 이 화면은 도메인 모델이
            Next.js 앱에서 정상적으로 연결되는지 보여주는 최소 앱입니다.
          </p>
        </div>

        <div className="nodeList">
          {nodes.map((node) => (
            <article className="node" key={node.id}>
              <div>
                <h3>{node.title}</h3>
                <p>{node.learningState}</p>
              </div>
              <span>{node.children.length}</span>
            </article>
          ))}
        </div>
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
