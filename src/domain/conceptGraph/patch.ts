import type { ConceptGraph, ConceptNode } from "./types.ts";
import { validateConceptGraph } from "./validation.ts";

export type TreePatch =
  | { type: "ADD_NODE"; parentId: string; node: ConceptNode; index?: number }
  | { type: "UPDATE_NODE"; nodeId: string; patch: Partial<ConceptNode> }
  | { type: "DELETE_NODE"; nodeId: string }
  | { type: "MOVE_NODE"; nodeId: string; newParentId: string; index?: number };

export type ApplyTreePatchError =
  | "PARENT_NOT_FOUND"
  | "NODE_NOT_FOUND"
  | "NODE_ALREADY_EXISTS"
  | "CANNOT_DELETE_ROOT"
  | "INVALID_PATCH_RESULT";

export type ApplyTreePatchResult =
  | { ok: true; graph: ConceptGraph }
  | { ok: false; error: ApplyTreePatchError };

export function applyTreePatch(graph: ConceptGraph, patch: TreePatch): ApplyTreePatchResult {
  const result = applyPatchUnchecked(graph, patch);

  if (!result.ok) {
    return result;
  }

  const validation = validateConceptGraph(result.graph);
  if (!validation.valid) {
    return { ok: false, error: "INVALID_PATCH_RESULT" };
  }

  return result;
}

function applyPatchUnchecked(graph: ConceptGraph, patch: TreePatch): ApplyTreePatchResult {
  switch (patch.type) {
    case "ADD_NODE":
      return addNode(graph, patch.parentId, patch.node, patch.index);
    case "UPDATE_NODE":
      return updateNode(graph, patch.nodeId, patch.patch);
    case "DELETE_NODE":
      return deleteNode(graph, patch.nodeId);
    case "MOVE_NODE":
      return moveNode(graph, patch.nodeId, patch.newParentId, patch.index);
  }
}

function addNode(
  graph: ConceptGraph,
  parentId: string,
  node: ConceptNode,
  index?: number,
): ApplyTreePatchResult {
  const parent = graph.nodes[parentId];
  if (!parent) {
    return { ok: false, error: "PARENT_NOT_FOUND" };
  }

  if (graph.nodes[node.id]) {
    return { ok: false, error: "NODE_ALREADY_EXISTS" };
  }

  const nodes = {
    ...graph.nodes,
    [parentId]: {
      ...parent,
      children: insertAt(parent.children, node.id, index),
    },
    [node.id]: {
      ...node,
      children: [...node.children],
    },
  };

  return { ok: true, graph: { ...graph, nodes } };
}

function updateNode(
  graph: ConceptGraph,
  nodeId: string,
  patch: Partial<ConceptNode>,
): ApplyTreePatchResult {
  const node = graph.nodes[nodeId];
  if (!node) {
    return { ok: false, error: "NODE_NOT_FOUND" };
  }

  return {
    ok: true,
    graph: {
      ...graph,
      nodes: {
        ...graph.nodes,
        [nodeId]: {
          ...node,
          ...patch,
          id: node.id,
          children: patch.children ? [...patch.children] : [...node.children],
        },
      },
    },
  };
}

function deleteNode(graph: ConceptGraph, nodeId: string): ApplyTreePatchResult {
  if (nodeId === graph.rootId) {
    return { ok: false, error: "CANNOT_DELETE_ROOT" };
  }

  if (!graph.nodes[nodeId]) {
    return { ok: false, error: "NODE_NOT_FOUND" };
  }

  const deleteIds = collectDescendantIds(graph, nodeId);
  const nodes = Object.fromEntries(
    Object.entries(graph.nodes)
      .filter(([id]) => !deleteIds.has(id))
      .map(([id, node]) => [
        id,
        {
          ...node,
          children: node.children.filter((childId) => !deleteIds.has(childId)),
        },
      ]),
  );

  return { ok: true, graph: { ...graph, nodes } };
}

function moveNode(
  graph: ConceptGraph,
  nodeId: string,
  newParentId: string,
  index?: number,
): ApplyTreePatchResult {
  if (!graph.nodes[nodeId]) {
    return { ok: false, error: "NODE_NOT_FOUND" };
  }

  const newParent = graph.nodes[newParentId];
  if (!newParent) {
    return { ok: false, error: "PARENT_NOT_FOUND" };
  }

  const nodes = Object.fromEntries(
    Object.entries(graph.nodes).map(([id, node]) => {
      const children = node.children.filter((childId) => childId !== nodeId);

      if (id === newParentId) {
        return [id, { ...node, children: insertAt(children, nodeId, index) }];
      }

      return [id, { ...node, children }];
    }),
  );

  return { ok: true, graph: { ...graph, nodes } };
}

function insertAt(children: string[], childId: string, index?: number): string[] {
  const nextChildren = children.filter((id) => id !== childId);
  const safeIndex = index === undefined ? nextChildren.length : Math.max(0, index);

  return [
    ...nextChildren.slice(0, safeIndex),
    childId,
    ...nextChildren.slice(safeIndex),
  ];
}

function collectDescendantIds(graph: ConceptGraph, nodeId: string): Set<string> {
  const ids = new Set<string>();

  function collect(id: string): void {
    if (ids.has(id)) {
      return;
    }

    ids.add(id);

    for (const childId of graph.nodes[id]?.children ?? []) {
      collect(childId);
    }
  }

  collect(nodeId);
  return ids;
}
