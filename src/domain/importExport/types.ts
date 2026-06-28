export type ImportedLearningTree = {
  id?: string;
  title: string;
  body?: string;
  children?: ImportedLearningTree[];
};

export type ImportLearningTreeResult =
  | { ok: true; graph: import("../conceptGraph/types.ts").ConceptGraph }
  | { ok: false; error: ImportLearningTreeError };

export type ImportLearningTreeError =
  | "INVALID_ROOT"
  | "EMPTY_TITLE"
  | "DUPLICATE_ID"
  | "INVALID_IMPORTED_TREE";

