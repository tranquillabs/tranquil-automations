// A Svelte action that puts DOM nodes made elsewhere in place, and swaps them when they change:
// `<div use:attachNodes={nodes}>`. For content that's already safe to show as it is, such as
// Markdown rendered and hardened by the caller; it is never given HTML text to parse.
export function attachNodes(node, nodes) {
  node.replaceChildren(...nodes);
  return { update: (next) => node.replaceChildren(...next) };
}
