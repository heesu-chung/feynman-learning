import { validateConceptGraph, type ConceptGraph, type ConceptNode } from "../conceptGraph/index.ts";
import type {
  ImportedLearningTree,
  ImportLearningTreeError,
  ImportLearningTreeResult,
} from "./types.ts";

type NormalizeNodeResult =
  | { ok: true; nodeId: string }
  | { ok: false; error: ImportLearningTreeError };

export function importLearningTree(tree: unknown): ImportLearningTreeResult {
  if (!isImportedLearningTree(tree)) {
    return { ok: false, error: "INVALID_ROOT" };
  }

  const nodes: Record<string, ConceptNode> = {};
  const usedIds = new Set<string>();

  const root = normalizeNode(tree, usedIds, nodes);
  if (!root.ok) {
    return root;
  }

  const graph: ConceptGraph = {
    rootId: root.nodeId,
    nodes,
  };
  const validation = validateConceptGraph(graph);

  if (!validation.valid) {
    return { ok: false, error: "INVALID_IMPORTED_TREE" };
  }

  return { ok: true, graph };
}

export function exportLearningTree(graph: ConceptGraph): ImportedLearningTree {
  const visited = new Set<string>();

  function exportNode(nodeId: string): ImportedLearningTree {
    const node = graph.nodes[nodeId];

    if (!node) {
      return { id: nodeId, title: nodeId };
    }

    if (visited.has(nodeId)) {
      return {
        id: node.id,
        title: node.title,
        body: node.explanation,
        children: [],
      };
    }

    visited.add(nodeId);

    return {
      id: node.id,
      title: node.title,
      body: node.explanation,
      children: node.children.map(exportNode),
    };
  }

  return exportNode(graph.rootId);
}

function normalizeNode(
  tree: ImportedLearningTree,
  usedIds: Set<string>,
  nodes: Record<string, ConceptNode>,
): NormalizeNodeResult {
  const title = tree.title.trim();
  if (!title) {
    return { ok: false, error: "EMPTY_TITLE" };
  }

  const nodeId = createNodeId(tree.id ?? title, usedIds);
  if (tree.id && usedIds.has(tree.id)) {
    return { ok: false, error: "DUPLICATE_ID" };
  }

  usedIds.add(nodeId);
  const childIds: string[] = [];

  for (const child of tree.children ?? []) {
    const result = normalizeNode(child, usedIds, nodes);
    if (!result.ok) {
      return result;
    }

    childIds.push(result.nodeId);
  }

  nodes[nodeId] = {
    id: nodeId,
    title,
    explanation: tree.body,
    children: childIds,
    learningState: "unknown",
  };

  return { ok: true, nodeId };
}

function createNodeId(value: string, usedIds: Set<string>): string {
  const base = slugify(value);
  let candidate = base;
  let index = 2;

  while (usedIds.has(candidate)) {
    candidate = `${base}-${index}`;
    index += 1;
  }

  return candidate;
}

function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "node";
}

function isImportedLearningTree(value: unknown): value is ImportedLearningTree {
  if (!isRecord(value) || typeof value.title !== "string") {
    return false;
  }

  if (value.body !== undefined && typeof value.body !== "string") {
    return false;
  }

  if (value.id !== undefined && typeof value.id !== "string") {
    return false;
  }

  if (value.children === undefined) {
    return true;
  }

  return Array.isArray(value.children) && value.children.every(isImportedLearningTree);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
