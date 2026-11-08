<script>
  // A link in rendered Markdown. It never navigates the window: a click hands its href to the
  // caller, and middle-clicks and drags do nothing. The sanitizer has already dropped links with
  // a scheme it doesn't allow, which leaves no href at all.
  import { getMarkdownContext } from "./context.ts";

  let { href, title, children } = $props();
  const ctx = getMarkdownContext();

  function onclick(e) {
    e.preventDefault();
    if (href) ctx.onLink(href);
  }
  const refuse = (e) => e.preventDefault();
</script>

<a href={href ?? undefined} {title} {onclick} onauxclick={refuse} ondragstart={refuse}>{@render children?.()}</a>
