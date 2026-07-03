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

const TOAST_TIMEOUT = 1000;

function notify(kind, message, options = {}) {
  const notification = atom.notifications[kind](message, {
    dismissable: true,
    ...options,
  });
  setTimeout(() => notification.dismiss(), TOAST_TIMEOUT);
  return notification;
}

module.exports = { notify, TOAST_TIMEOUT };
