// Ranking "did you mean" suggestions (ADR-0026): diagnostic only, never used to choose a target.
import { wordSimilaritySort } from "jsr:@std/text@^1/word-similarity-sort";

const squash = (s: string) => s.normalize("NFKD").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

/**
 * Candidates closest to `wanted`: those containing it (or contained in it), ignoring case,
 * accents and punctuation, come first ("Email" → "E-mail address"), then by edit distance.
 */
export function rankSuggestions(wanted: string, candidates: string[]): string[] {
  const w = squash(wanted);
  const related = (c: string) => {
    const s = squash(c);
    return !!w && !!s && (s.includes(w) || w.includes(s));
  };
  const sorted = wordSimilaritySort(wanted, candidates);
  return [...sorted.filter(related), ...sorted.filter((c) => !related(c))];
}
