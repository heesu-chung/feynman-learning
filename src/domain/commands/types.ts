import type { ConceptGraph } from "../conceptGraph/types.ts";

export type CommandResult =
  | { ok: true; graph: ConceptGraph; inverse: DomainCommand }
  | { ok: false; error: string };

export type DomainCommand = {
  readonly type: string;
  execute(graph: ConceptGraph): CommandResult;
};
