import type { ConceptGraph } from "../domain/conceptGraph/index.ts";
import { validateConceptGraph } from "../domain/conceptGraph/index.ts";

const hashPrefix = "#graph=";

export type DecodeGraphHashResult =
  | { ok: true; graph: ConceptGraph }
  | { ok: false; error: "MISSING_HASH" | "MALFORMED_HASH" | "INVALID_GRAPH" };

export function encodeGraphToHash(graph: ConceptGraph): string {
  const json = JSON.stringify(graph);
  return `${hashPrefix}${encodeBase64Url(json)}`;
}

export function decodeGraphFromHash(hash: string): DecodeGraphHashResult {
  if (!hash.startsWith(hashPrefix)) {
    return { ok: false, error: "MISSING_HASH" };
  }

  try {
    const graph = JSON.parse(decodeBase64Url(hash.slice(hashPrefix.length))) as ConceptGraph;
    const validation = validateConceptGraph(graph);

    if (!validation.valid) {
      return { ok: false, error: "INVALID_GRAPH" };
    }

    return { ok: true, graph };
  } catch {
    return { ok: false, error: "MALFORMED_HASH" };
  }
}

function encodeBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(paddedBase64);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}
