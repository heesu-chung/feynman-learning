import {
  applyTreePatch,
  type ApplyTreePatchResult,
  type TreePatch,
  validateConceptGraph,
} from "../conceptGraph/index.ts";
import type { ConceptGraph, ConceptNode } from "../conceptGraph/types.ts";
import type { CommandResult, DomainCommand } from "./types.ts";

export class TreePatchCommand implements DomainCommand {
  readonly type = "TREE_PATCH";
  private readonly patch: TreePatch;

  constructor(patch: TreePatch) {
    this.patch = patch;
  }

  execute(graph: ConceptGraph): CommandResult {
    const inversePatch = createInversePatch(graph, this.patch);
    if (!inversePatch.ok) {
      return inversePatch;
    }

    const result = applyTreePatch(graph, this.patch);
    return toCommandResult(result, inversePatch.patch);
  }
}

function toCommandResult(
  result: ApplyTreePatchResult,
  inversePatch: TreePatch | DomainCommand,
): CommandResult {
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  return {
    ok: true,
    graph: result.graph,
    inverse: isTreePatch(inversePatch) ? new TreePatchCommand(inversePatch) : inversePatch,
  };
}

type InversePatchResult =
  | { ok: true; patch: TreePatch | DomainCommand }
  | { ok: false; error: string };

function createInversePatch(graph: ConceptGraph, patch: TreePatch): InversePatchResult {
  switch (patch.type) {
    case "ADD_NODE":
      return {
        ok: true,
        patch: { type: "DELETE_NODE", nodeId: patch.node.id },
      };
    case "UPDATE_NODE":
      return createUpdateInversePatch(graph, patch.nodeId, patch.patch);
    case "DELETE_NODE":
      return createDeleteInversePatch(graph, patch.nodeId);
    case "MOVE_NODE":
      return createMoveInversePatch(graph, patch.nodeId);
  }
}

function createUpdateInversePatch(
  graph: ConceptGraph,
  nodeId: string,
  patch: Partial<ConceptNode>,
): InversePatchResult {
  const node = graph.nodes[nodeId];
  if (!node) {
    return { ok: false, error: "NODE_NOT_FOUND" };
  }

  const inverse: Partial<ConceptNode> = {};
  for (const key of Object.keys(patch) as Array<keyof ConceptNode>) {
    inverse[key] = node[key] as never;
  }

  return {
    ok: true,
    patch: { type: "UPDATE_NODE", nodeId, patch: inverse },
  };
}

function createDeleteInversePatch(graph: ConceptGraph, nodeId: string): InversePatchResult {
  const node = graph.nodes[nodeId];
  const parent = findParent(graph, nodeId);

  if (!node) {
    return { ok: false, error: "NODE_NOT_FOUND" };
  }

  if (!parent) {
    return { ok: false, error: "CANNOT_DELETE_ROOT" };
  }

  return {
    ok: true,
    patch: new RestoreDeletedSubtreeCommand(graph, nodeId, parent.node.id),
  };
}

function createMoveInversePatch(graph: ConceptGraph, nodeId: string): InversePatchResult {
  const parent = findParent(graph, nodeId);
  if (!graph.nodes[nodeId]) {
    return { ok: false, error: "NODE_NOT_FOUND" };
  }

  if (!parent) {
    return { ok: false, error: "CANNOT_MOVE_ROOT" };
  }

  return {
    ok: true,
    patch: {
      type: "MOVE_NODE",
      nodeId,
      newParentId: parent.node.id,
      index: parent.index,
    },
  };
}

function findParent(
  graph: ConceptGraph,
  nodeId: string,
): { node: ConceptNode; index: number } | undefined {
  for (const node of Object.values(graph.nodes)) {
    const index = node.children.indexOf(nodeId);
    if (index >= 0) {
      return { node, index };
    }
  }

  return undefined;
}

function cloneNode(node: ConceptNode): ConceptNode {
  return {
    ...node,
    children: [...node.children],
  };
}

function isTreePatch(command: TreePatch | DomainCommand): command is TreePatch {
  return !("execute" in command);
}

class RestoreDeletedSubtreeCommand implements DomainCommand {
  readonly type = "RESTORE_DELETED_SUBTREE";
  private readonly beforeDeleteGraph: ConceptGraph;
  private readonly nodeId: string;
  private readonly parentId: string;

  constructor(beforeDeleteGraph: ConceptGraph, nodeId: string, parentId: string) {
    this.beforeDeleteGraph = cloneGraph(beforeDeleteGraph);
    this.nodeId = nodeId;
    this.parentId = parentId;
  }

  execute(graph: ConceptGraph): CommandResult {
    const restoredIds = collectDescendantIds(this.beforeDeleteGraph, this.nodeId);
    const restoredNodes = Object.fromEntries(
      [...restoredIds].map((id) => [id, cloneNode(this.beforeDeleteGraph.nodes[id])]),
    );

    const restoredGraph: ConceptGraph = {
      ...graph,
      nodes: {
        ...graph.nodes,
        ...restoredNodes,
        [this.parentId]: cloneNode(this.beforeDeleteGraph.nodes[this.parentId]),
      },
    };

    const validation = validateConceptGraph(restoredGraph);
    if (!validation.valid) {
      return { ok: false, error: "INVALID_RESTORE_RESULT" };
    }

    return {
      ok: true,
      graph: restoredGraph,
      inverse: new TreePatchCommand({ type: "DELETE_NODE", nodeId: this.nodeId }),
    };
  }
}

function cloneGraph(graph: ConceptGraph): ConceptGraph {
  return {
    ...graph,
    nodes: Object.fromEntries(
      Object.entries(graph.nodes).map(([id, node]) => [id, cloneNode(node)]),
    ),
  };
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
