// Child side of the runner bridge (mirrors tranquil-rpc/lib/transport-ws.js): the AUTH
// handshake, the Cap'n Web string-encoding transport, and the protocol-level cancel — a frame
// that is exactly "CANCEL" aborts context.signal, and the child exits shortly after so it
// usually beats the host's SIGTERM backstop.
import { triggerCancel } from "./context.ts";

const CANCEL_EXIT_DELAY_MS = 1500;

function makeQueue<T>() {
  const items: T[] = [];
  const waiters: { resolve: (v: T) => void; reject: (e: unknown) => void }[] = [];
  let failed: unknown = null;
  return {
    push(v: T) {
      const w = waiters.shift();
      if (w) w.resolve(v);
      else items.push(v);
    },
    fail(err: unknown) {
      failed = err;
      for (const w of waiters.splice(0)) w.reject(err);
    },
    pull(): Promise<T> {
      if (items.length) return Promise.resolve(items.shift()!);
      if (failed) return Promise.reject(failed);
      return new Promise((resolve, reject) => waiters.push({ resolve, reject }));
    },
  };
}

export interface StringTransport {
  encodingLevel: "string";
  send(msg: string): Promise<void>;
  receive(): Promise<string>;
  abort(reason: unknown): void;
}

// Open the socket, authenticate with the one-time token, and return the transport for
// capnweb. Rejects on auth failure or timeout (the host closes unauthenticated sockets).
export function connectTransport(url: string, token: string): Promise<StringTransport> {
  const ws = new WebSocket(url);
  const q = makeQueue<string>();
  let authed = false;

  return new Promise<StringTransport>((resolve, reject) => {
    ws.onopen = () => ws.send(`AUTH ${token}`);
    ws.onmessage = (e) => {
      const text = String(e.data);
      if (!authed) {
        if (text === "AUTH OK") {
          authed = true;
          resolve({
            encodingLevel: "string",
            send: (msg) => {
              ws.send(msg);
              return Promise.resolve();
            },
            receive: () => q.pull(),
            abort: (reason) => q.fail(reason),
          });
        } else {
          reject(new Error(`runner bridge refused auth: ${text}`));
        }
        return;
      }
      if (text === "CANCEL") {
        triggerCancel();
        setTimeout(() => Deno.exit(130), CANCEL_EXIT_DELAY_MS);
        return;
      }
      q.push(text);
    };
    ws.onerror = () => reject(new Error("runner bridge connection failed"));
    ws.onclose = (e) => {
      const err = new Error(`runner bridge closed (${e.code})`);
      q.fail(err);
      if (!authed) reject(err);
    };
  });
}
