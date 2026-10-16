// Run `fn` in a page with JSON-encoded arguments. The page code is a real function, checked like
// the rest of the package, and values travel as JSON, so none can break out of a string the way
// concatenated code can. `fn` must not use anything from the calling file: only its source is sent.
// (tranquil-browser has the same helper in lib/utils.js.)
function callInPage(webview, fn, ...args) {
  // deno-lint-ignore tranquil-security/no-string-page-code -- the one sanctioned builder: a function's own source plus JSON
  return webview.executeJavaScript(`(${fn})(...${JSON.stringify(args)})`);
}

module.exports = { callInPage };
