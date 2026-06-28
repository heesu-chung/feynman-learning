import type { ConceptGraph } from "../conceptGraph/types.ts";
import type { DomainCommand } from "../commands/types.ts";

export type HistoryState = {
  graph: ConceptGraph;
  undoStack: DomainCommand[];
  redoStack: DomainCommand[];
};

export type HistoryResult =
  | { ok: true; state: HistoryState }
  | { ok: false; error: string; state: HistoryState };

export function createHistoryState(graph: ConceptGraph): HistoryState {
  return {
    graph,
    undoStack: [],
    redoStack: [],
  };
}

export function executeCommand(state: HistoryState, command: DomainCommand): HistoryResult {
  const result = command.execute(state.graph);
  if (!result.ok) {
    return { ok: false, error: result.error, state };
  }

  return {
    ok: true,
    state: {
      graph: result.graph,
      undoStack: [...state.undoStack, result.inverse],
      redoStack: [],
    },
  };
}

export function undo(state: HistoryState): HistoryResult {
  const command = state.undoStack.at(-1);
  if (!command) {
    return { ok: false, error: "NOTHING_TO_UNDO", state };
  }

  const result = command.execute(state.graph);
  if (!result.ok) {
    return { ok: false, error: result.error, state };
  }

  return {
    ok: true,
    state: {
      graph: result.graph,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, result.inverse],
    },
  };
}

export function redo(state: HistoryState): HistoryResult {
  const command = state.redoStack.at(-1);
  if (!command) {
    return { ok: false, error: "NOTHING_TO_REDO", state };
  }

  const result = command.execute(state.graph);
  if (!result.ok) {
    return { ok: false, error: result.error, state };
  }

  return {
    ok: true,
    state: {
      graph: result.graph,
      undoStack: [...state.undoStack, result.inverse],
      redoStack: state.redoStack.slice(0, -1),
    },
  };
}
