"use babel";

// Tranquil-style corner-notification toasts. The core notifications package
// can't give us both things we want at once: a close (×) so a toast can be
// dismissed immediately, AND an auto-hide. Core only renders the × for
// `dismissable` notifications, and dismissable notifications skip core's
// auto-hide timer entirely. So we opt into `dismissable` (to surface the ×)
// and run the auto-hide ourselves.
//
// Usage: notify("addWarning", "message"[, options]) — mirrors
// atom.notifications.add*(). Returns the Notification.

// Auto-hide delay comes from the `tranquil.toastDuration` setting (Settings →
// Tranquil), falling back to this default if the schema isn't registered yet.
// Callers can still override per-toast with `options.timeout`.
const DEFAULT_TOAST_TIMEOUT = 3000;

function toastTimeout(options = {}) {
  if (typeof options.timeout === "number") return options.timeout;
  const configured = atom.config.get("tranquil.toastDuration");
  return typeof configured === "number" ? configured : DEFAULT_TOAST_TIMEOUT;
}

// `timeout: 0` opts out of the auto-hide entirely: the toast stays until dismissed. Reserved for
// messages the user has to act on — a run refused for its permissions is unreadable in three
// seconds, and there is nowhere else to see it if it disappears.
function notify(kind, message, options = {}) {
  const { timeout, ...rest } = options;
  const notification = atom.notifications[kind](message, {
    dismissable: true,
    ...rest,
  });
  if (options.timeout !== 0) {
    setTimeout(() => notification.dismiss(), toastTimeout(options));
  }
  return notification;
}

module.exports = { notify };
