"use babel";

// Markdown to DOM that can't run code or load anything (ADR-0030). A workbook holds text from
// web pages and from an LLM, and this window has Node, so nothing in it may become live markup.
//
// Pulsar's renderer is not safe on its own: it puts a fence's first word into an HTML attribute
// unescaped, and passes the wrong options to DOMPurify, so DOMPurify runs on defaults that keep
// <style>, <img> and <form> (src/ui.js). Raw HTML is turned off, fence words are cut to one safe
// word before rendering (workbook-format's renderSource), and harden() below is the real guard.

// Elements kept as they are. Everything else is removed outright (DROP) or replaced by its text.
const KEEP = new Set([
  "P", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "LI", "BLOCKQUOTE", "PRE", "CODE", "EM",
  "STRONG", "DEL", "S", "A", "TABLE", "THEAD", "TBODY", "TR", "TH", "TD", "HR", "BR", "INPUT",
  "LABEL",
]);
const DROP = new Set([
  "SCRIPT", "STYLE", "IFRAME", "FRAME", "OBJECT", "EMBED", "FORM", "LINK", "META", "BASE", "SVG",
  "MATH", "TEMPLATE", "NOSCRIPT", "AUDIO", "VIDEO", "SOURCE", "TRACK", "CANVAS",
]);
const SAFE_CODE_CLASS = /^language-[\w+#.-]+$/;
const ALIGN = /^\s*text-align:\s*(left|right|center)\s*;?\s*$/i;

function textNode(node, text) {
  return node.ownerDocument.createTextNode(text);
}

// Keep only the attributes an element may carry here; drop the rest.
function cleanAttributes(el) {
  const tag = el.nodeName;
  const keep = {};
  if (tag === "A" && el.getAttribute("href") !== null) keep.href = el.getAttribute("href");
  if (tag === "CODE" && SAFE_CODE_CLASS.test(el.getAttribute("class") || "")) keep.class = el.getAttribute("class");
  if ((tag === "TH" || tag === "TD") && ALIGN.test(el.getAttribute("style") || "")) {
    keep.style = `text-align: ${el.getAttribute("style").match(ALIGN)[1].toLowerCase()}`;
  }
  if (tag === "LI" && /\btask-list-item\b/.test(el.getAttribute("class") || "")) keep.class = "task-list-item";
  if (tag === "INPUT") {
    keep.type = "checkbox";
    keep.disabled = "";
    if (el.hasAttribute("checked")) keep.checked = "";
  }
  for (const name of Array.from(el.attributes, (a) => a.name)) el.removeAttribute(name);
  for (const [name, value] of Object.entries(keep)) el.setAttribute(name, value);
}

/**
 * Make a parsed fragment safe, in place, before it is attached to the window. Returns it.
 * - Elements not in KEEP are replaced by their text; those in DROP are removed with their content.
 * - An image becomes its alt text, so nothing is fetched.
 * - Only a task checkbox survives as an <input>, and it is disabled.
 * - Attributes are stripped except a link's href, a safe code language class, table alignment,
 *   and a task checkbox's state.
 */
function harden(root) {
  const walk = (parent) => {
    for (const node of Array.from(parent.childNodes)) {
      if (node.nodeType === 8) {
        parent.removeChild(node); // comments
        continue;
      }
      if (node.nodeType !== 1) continue;
      const tag = node.nodeName.toUpperCase();
      if (DROP.has(tag)) {
        parent.removeChild(node);
        continue;
      }
      if (tag === "IMG") {
        parent.replaceChild(textNode(node, node.getAttribute("alt") || ""), node);
        continue;
      }
      if (tag === "INPUT" && (node.getAttribute("type") || "").toLowerCase() !== "checkbox") {
        parent.removeChild(node);
        continue;
      }
      if (!KEEP.has(tag)) {
        parent.replaceChild(textNode(node, node.textContent || ""), node);
        continue;
      }
      cleanAttributes(node);
      walk(node);
    }
  };
  walk(root);
  return root;
}

/**
 * What clicking a link in a workbook may do. Web links open in a Tranquil browser tab, relative
 * paths open in Tranquil once the caller has checked they stay in the project, and anything
 * else (javascript:, file:, data:, mailto:, in-page anchors) does nothing.
 */
function classifyLink(href) {
  const h = String(href || "").trim();
  if (/^https?:\/\//i.test(h)) return { kind: "web", url: h };
  if (h === "" || h.startsWith("#") || h.startsWith("//") || /^[a-z][a-z0-9+.-]*:/i.test(h)) return { kind: "inert" };
  return { kind: "relative", path: decodeURI(h.split("#")[0]) };
}

/**
 * Text that a Markdown renderer outside our control will show exactly as written. Pulsar's
 * notifications render their message as Markdown with HTML on, so a script's (page-derived)
 * text could carry an image that loads, a link, or markup. Escaping every ASCII punctuation
 * character makes Markdown and HTML both render as plain text.
 */
function escapeMarkdown(text) {
  return String(text).replace(/[!-/:-@[-`{-~]/g, "\\$&");
}

/** Render Markdown to a hardened fragment. Needs Pulsar (`atom.ui.markdown`). */
function render(markdown) {
  const html = atom.ui.markdown.render(markdown, {
    html: false,
    sanitize: true,
    handleFrontMatter: false,
    breaks: false,
    useTaskCheckbox: true,
    taskCheckboxDisabled: true,
    transformImageLinks: false,
    transformAtomLinks: false,
    transformNonFqdnLinks: false,
  });
  return harden(atom.ui.markdown.convertToDOM(html));
}

module.exports = { render, harden, classifyLink, escapeMarkdown };
