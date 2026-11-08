Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
// \0rolldown/runtime.js
var __create$1 = Object.create;
var __defProp$1 = Object.defineProperty;
var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
var __getOwnPropNames$1 = Object.getOwnPropertyNames;
var __getProtoOf$1 = Object.getPrototypeOf;
var __hasOwnProp$1 = Object.prototype.hasOwnProperty;
var __copyProps$1 = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames$1(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp$1.call(to, key) && key !== except) __defProp$1(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc$1(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM$1 = (mod, isNodeMode, target) => (target = mod != null ? __create$1(__getProtoOf$1(mod)) : {}, __copyProps$1(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp$1.call(mod, "default") ? __defProp$1(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
let node_crypto = require("node:crypto");
node_crypto = __toESM$1(node_crypto, 1);
let node_fs = require("node:fs");
node_fs = __toESM$1(node_fs, 1);
let node_path = require("node:path");
node_path = __toESM$1(node_path, 1);
let node_buffer = require("node:buffer");
// common/links.ts
function classifyLink(href) {
	const h = String(href || "").trim();
	if (/^https?:\/\//i.test(h)) return {
		kind: "web",
		url: h
	};
	if (h === "" || h.startsWith("#") || h.startsWith("//") || /^[a-z][a-z0-9+.-]*:/i.test(h)) return { kind: "inert" };
	try {
		return {
			kind: "relative",
			path: decodeURI(h.split("#")[0])
		};
	} catch {
		return { kind: "inert" };
	}
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/disclose-version.js
if (typeof window !== "undefined") ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/constants.js
var HYDRATION_ERROR = {};
var UNINITIALIZED = Symbol("uninitialized");
var NAMESPACE_HTML = "http://www.w3.org/1999/xhtml";
var NAMESPACE_SVG = "http://www.w3.org/2000/svg";
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/shared/utils.js
var is_array = Array.isArray;
var index_of = Array.prototype.indexOf;
var includes = Array.prototype.includes;
var array_from = Array.from;
var define_property = Object.defineProperty;
var get_descriptor = Object.getOwnPropertyDescriptor;
var get_descriptors = Object.getOwnPropertyDescriptors;
var object_prototype = Object.prototype;
var array_prototype = Array.prototype;
var get_prototype_of = Object.getPrototypeOf;
var is_extensible = Object.isExtensible;
/**
* @param {any} thing
* @returns {thing is Function}
*/
function is_function(thing) {
	return typeof thing === "function";
}
var noop = () => {};
/** @param {Array<() => void>} arr */
function run_all(arr) {
	for (var i = 0; i < arr.length; i++) arr[i]();
}
/**
* TODO replace with Promise.withResolvers once supported widely enough
* @template [T=void]
*/
function deferred() {
	/** @type {(value: T) => void} */
	var resolve;
	/** @type {(reason: any) => void} */
	var reject;
	return {
		promise: new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		}),
		resolve,
		reject
	};
}
/**
* When encountering a situation like `let [a, b, c] = $derived(blah())`,
* we need to stash an intermediate value that `a`, `b`, and `c` derive
* from, in case it's an iterable
* @template T
* @param {ArrayLike<T> | Iterable<T>} value
* @param {number} [n]
* @returns {Array<T>}
*/
function to_array(value, n) {
	if (Array.isArray(value)) return value;
	if (n === void 0 || !(Symbol.iterator in value)) return Array.from(value);
	/** @type {T[]} */
	const array = [];
	for (const element of value) {
		array.push(element);
		if (array.length === n) break;
	}
	return array;
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/constants.js
/**
* An effect that does not destroy its child effects when it reruns.
* Runs as part of render effects, i.e. not eagerly as part of tree traversal or effect flushing.
*/
var MANAGED_EFFECT = 1 << 24;
var CLEAN = 1024;
var DIRTY = 2048;
var MAYBE_DIRTY = 4096;
var INERT = 8192;
var DESTROYED = 16384;
/** Set once a reaction has run for the first time */
var REACTION_RAN = 32768;
/** Effect is in the process of getting destroyed. Can be observed in child teardown functions */
var DESTROYING = 1 << 25;
/**
* 'Transparent' effects do not create a transition boundary.
* This is on a block effect 99% of the time but may also be on a branch effect if its parent block effect was pruned
*/
var EFFECT_TRANSPARENT = 65536;
var EFFECT_PRESERVED = 1 << 19;
var USER_EFFECT = 1 << 20;
var EFFECT_OFFSCREEN = 1 << 25;
var REACTION_IS_UPDATING = 1 << 21;
var ASYNC = 1 << 22;
var ERROR_VALUE = 1 << 23;
var STATE_SYMBOL = Symbol("$state");
/** Marks component export objects, so that `proxy(...)` leaves them untouched */
var COMPONENT_SYMBOL = Symbol("component");
var LEGACY_PROPS = Symbol("legacy props");
var LOADING_ATTR_SYMBOL = Symbol("");
var ATTRIBUTES_CACHE = Symbol("attributes");
var CLASS_CACHE = Symbol("class");
var STYLE_CACHE = Symbol("style");
var TEXT_CACHE = Symbol("text");
var FORM_RESET_HANDLER = Symbol("form reset");
/** allow users to ignore aborted signal errors if `reason.name === 'StaleReactionError` */
var STALE_REACTION = new class StaleReactionError extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
var IS_XHTML = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
/**
* Reading a derived belonging to a now-destroyed effect may result in stale values
*/
function derived_inert() {
	console.warn(`https://svelte.dev/e/derived_inert`);
}
/**
* Hydration failed because the initial UI does not match what was rendered on the server. The error occurred near %location%
* @param {string | undefined | null} [location]
*/
function hydration_mismatch(location) {
	console.warn(`https://svelte.dev/e/hydration_mismatch`);
}
/**
* The `value` property of a `<select multiple>` element should be an array, but it received a non-array value. The selection will be kept as is.
*/
function select_multiple_invalid_value() {
	console.warn(`https://svelte.dev/e/select_multiple_invalid_value`);
}
/**
* A `<svelte:boundary>` `reset` function only resets the boundary the first time it is called
*/
function svelte_boundary_reset_noop() {
	console.warn(`https://svelte.dev/e/svelte_boundary_reset_noop`);
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/hydration.js
/** @import { TemplateNode } from '#client' */
/**
* Use this variable to guard everything related to hydration code so it can be treeshaken out
* if the user doesn't use the `hydrate` method and these code paths are therefore not needed.
*/
var hydrating = false;
/** @param {boolean} value */
function set_hydrating(value) {
	hydrating = value;
}
/**
* The node that is currently being hydrated. This starts out as the first node inside the opening
* <!--[--> comment, and updates each time a component calls `$.child(...)` or `$.sibling(...)`.
* When entering a block (e.g. `{#if ...}`), `hydrate_node` is the block opening comment; by the
* time we leave the block it is the closing comment, which serves as the block's anchor.
* @type {TemplateNode}
*/
var hydrate_node;
/** @param {TemplateNode | null} node */
function set_hydrate_node(node) {
	if (node === null) {
		hydration_mismatch();
		throw HYDRATION_ERROR;
	}
	return hydrate_node = node;
}
function hydrate_next() {
	return set_hydrate_node(/* @__PURE__ */ get_next_sibling(hydrate_node));
}
/** @param {TemplateNode} node */
function reset(node) {
	if (!hydrating) return;
	if (/* @__PURE__ */ get_next_sibling(hydrate_node) !== null) {
		hydration_mismatch();
		throw HYDRATION_ERROR;
	}
	hydrate_node = node;
}
function next$1(count = 1) {
	if (hydrating) {
		var i = count;
		var node = hydrate_node;
		while (i--) node = /* @__PURE__ */ get_next_sibling(node);
		hydrate_node = node;
	}
}
/**
* Skips or removes (depending on {@link remove}) all nodes starting at `hydrate_node` up until the next hydration end comment
* @param {boolean} remove
*/
function skip_nodes(remove = true) {
	var depth = 0;
	var node = hydrate_node;
	while (true) {
		if (node.nodeType === 8) {
			var data = node.data;
			if (data === "]") {
				if (depth === 0) return node;
				depth -= 1;
			} else if (data === "[" || data === "[!" || data[0] === "[" && !isNaN(Number(data.slice(1)))) depth += 1;
		}
		var next = /* @__PURE__ */ get_next_sibling(node);
		if (remove) node.remove();
		node = next;
	}
}
/**
*
* @param {TemplateNode} node
*/
function read_hydration_instruction(node) {
	if (!node || node.nodeType !== 8) {
		hydration_mismatch();
		throw HYDRATION_ERROR;
	}
	return node.data;
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/reactivity/equality.js
/** @import { Equals } from '#client' */
/** @type {Equals} */
function equals(value) {
	return value === this.v;
}
/**
* @param {unknown} a
* @param {unknown} b
* @returns {boolean}
*/
function safe_not_equal(a, b) {
	return a != a ? b == b : a !== b || a !== null && typeof a === "object" || typeof a === "function";
}
/** @type {Equals} */
function safe_equals(value) {
	return !safe_not_equal(value, this.v);
}
/**
* `%name%(...)` can only be used during component initialisation
* @param {string} name
* @returns {never}
*/
function lifecycle_outside_component(name) {
	throw new Error(`https://svelte.dev/e/lifecycle_outside_component`);
}
/**
* `setContext` must be called when a component first initializes, not in a subsequent effect or after an `await` expression
* @returns {never}
*/
function set_context_after_init() {
	throw new Error(`https://svelte.dev/e/set_context_after_init`);
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/errors.js
/**
* Cannot create a `$derived(...)` with an `await` expression outside of an effect tree
* @returns {never}
*/
function async_derived_orphan() {
	throw new Error(`https://svelte.dev/e/async_derived_orphan`);
}
/**
* Keyed each block has duplicate key `%value%` at indexes %a% and %b%
* @param {string} a
* @param {string} b
* @param {string | undefined | null} [value]
* @returns {never}
*/
function each_key_duplicate(a, b, value) {
	throw new Error(`https://svelte.dev/e/each_key_duplicate`);
}
/**
* `%rune%` cannot be used inside an effect cleanup function
* @param {string} rune
* @returns {never}
*/
function effect_in_teardown(rune) {
	throw new Error(`https://svelte.dev/e/effect_in_teardown`);
}
/**
* Effect cannot be created inside a `$derived` value that was not itself created inside an effect
* @returns {never}
*/
function effect_in_unowned_derived() {
	throw new Error(`https://svelte.dev/e/effect_in_unowned_derived`);
}
/**
* `%rune%` can only be used inside an effect (e.g. during component initialisation)
* @param {string} rune
* @returns {never}
*/
function effect_orphan(rune) {
	throw new Error(`https://svelte.dev/e/effect_orphan`);
}
/**
* Maximum update depth exceeded. This typically indicates that an effect reads and writes the same piece of state
* @returns {never}
*/
function effect_update_depth_exceeded() {
	throw new Error(`https://svelte.dev/e/effect_update_depth_exceeded`);
}
/**
* Cannot do `bind:%key%={undefined}` when `%key%` has a fallback value
* @param {string} key
* @returns {never}
*/
function props_invalid_value(key) {
	throw new Error(`https://svelte.dev/e/props_invalid_value`);
}
/**
* Property descriptors defined on `$state` objects must contain `value` and always be `enumerable`, `configurable` and `writable`.
* @returns {never}
*/
function state_descriptors_fixed() {
	throw new Error(`https://svelte.dev/e/state_descriptors_fixed`);
}
/**
* Cannot set prototype of `$state` object
* @returns {never}
*/
function state_prototype_fixed() {
	throw new Error(`https://svelte.dev/e/state_prototype_fixed`);
}
/**
* Updating state inside `$derived(...)`, `$inspect(...)` or a template expression is forbidden. If the value should not be reactive, declare it without `$state`
* @returns {never}
*/
function state_unsafe_mutation() {
	throw new Error(`https://svelte.dev/e/state_unsafe_mutation`);
}
/**
* A `<svelte:boundary>` `reset` function cannot be called while an error is still being handled
* @returns {never}
*/
function svelte_boundary_reset_onerror() {
	throw new Error(`https://svelte.dev/e/svelte_boundary_reset_onerror`);
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/flags/index.js
/** True if experimental.async=true */
var async_mode_flag = false;
/** True if we're not certain that we only have Svelte 5 code in the compilation */
var legacy_mode_flag = false;
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/shared/context.js
/**
* @typedef {{ p: Context | null, c: Map<unknown, unknown> | null }} Context
*/
/**
* @param {Context} context
* @returns {Map<unknown, unknown> | null}
*/
function get_parent_context(context) {
	let parent = context.p;
	while (parent !== null && parent.c === null) parent = parent.p;
	return parent?.c ?? null;
}
/**
* @param {Context | null} context
* @param {string} name
* @returns {Map<unknown, unknown>}
*/
function get_or_init_context_map(context, name) {
	if (context === null) lifecycle_outside_component(name);
	return context.c ??= new Map(get_parent_context(context) || void 0);
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/context.js
/** @import { ComponentContext, DevStackEntry, Effect } from '#client' */
/** @type {ComponentContext | null} */
var component_context = null;
/** @param {ComponentContext | null} context */
function set_component_context(context) {
	component_context = context;
}
/**
* Retrieves the context set with the specified `key` in the current component or any of its
* ancestors. If multiple components set the same key, the value from the closest one is returned.
* A `setContext` call in the current component is only visible to `getContext` calls that run after it.
* Must be called during component initialisation.
*
* [`createContext`](https://svelte.dev/docs/svelte/svelte#createContext) is a type-safe alternative.
*
* @template T
* @param {any} key
* @returns {T}
*/
function getContext(key) {
	return get_or_init_context_map(component_context, "getContext").get(key);
}
/**
* Associates an arbitrary `context` object with the current component and the specified `key`
* and returns that object. The context is then available to the component itself and all of its
* descendants (including slotted content) with `getContext`.
*
* Like lifecycle functions, this must be called during component initialisation.
*
* [`createContext`](https://svelte.dev/docs/svelte/svelte#createContext) is a type-safe alternative.
*
* @template T
* @param {any} key
* @param {T} context
* @returns {T}
*/
function setContext(key, context) {
	const context_map = get_or_init_context_map(component_context, "setContext");
	if (async_mode_flag) {
		var flags = active_effect.f;
		if (!(!active_reaction && (flags & 32) !== 0 && !component_context.i)) set_context_after_init();
	}
	context_map.set(key, context);
	return context;
}
/**
* @param {Record<string, unknown>} props
* @param {any} runes
* @param {Function} [fn]
* @returns {void}
*/
function push$1(props, runes = false, fn) {
	component_context = {
		p: component_context,
		i: false,
		c: null,
		e: null,
		s: props,
		x: null,
		r: active_effect,
		l: legacy_mode_flag && !runes ? {
			s: null,
			u: null,
			$: []
		} : null
	};
}
/**
* @template {Record<string, any>} T
* @param {T} [component]
* @returns {T}
*/
function pop(component) {
	var context = component_context;
	var effects = context.e;
	if (effects !== null) {
		context.e = null;
		for (var fn of effects) create_user_effect(fn);
	}
	if (component !== void 0) context.x = component;
	context.i = true;
	component_context = context.p;
	return mark_as_component(component);
}
/**
* Add a symbol to the object (or create one if undefined) to mark it as a component so it isn't proxified.
* @param {any} component
*/
function mark_as_component(component = {}) {
	define_property(component, COMPONENT_SYMBOL, { value: true });
	return component;
}
/** @returns {boolean} */
function is_runes() {
	return !legacy_mode_flag || component_context !== null && component_context.l === null;
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/task.js
/** @type {Array<() => void>} */
var micro_tasks = [];
function run_micro_tasks() {
	var tasks = micro_tasks;
	micro_tasks = [];
	run_all(tasks);
}
/**
* @param {() => void} fn
*/
function queue_micro_task(fn) {
	if (micro_tasks.length === 0 && !is_flushing_sync) {
		var tasks = micro_tasks;
		queueMicrotask(() => {
			if (tasks === micro_tasks) run_micro_tasks();
		});
	}
	micro_tasks.push(fn);
}
/**
* Synchronously run any queued tasks.
*/
function flush_tasks() {
	while (micro_tasks.length > 0) run_micro_tasks();
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/reactivity/status.js
/** @import { Derived, Signal } from '#client' */
var STATUS_MASK = ~(DIRTY | MAYBE_DIRTY | CLEAN);
/**
* @param {Signal} signal
* @param {number} status
*/
function set_signal_status(signal, status) {
	signal.f = signal.f & STATUS_MASK | status;
}
/**
* Set a derived's status to CLEAN or MAYBE_DIRTY based on its connection state.
* @param {Derived} derived
*/
function update_derived_status(derived) {
	if ((derived.f & 512) !== 0 || derived.deps === null) set_signal_status(derived, CLEAN);
	else set_signal_status(derived, MAYBE_DIRTY);
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/reactivity/utils.js
/** @import { Effect } from '#client' */
/**
* @param {Effect} effect
* @param {Map<Effect, number>} dirty_reactions
*/
function defer_effect(effect, dirty_reactions) {
	if ((effect.f & 2048) !== 0) dirty_reactions.set(effect, DIRTY);
	else if ((effect.f & 4096) !== 0 && dirty_reactions.get(effect) !== 2048) dirty_reactions.set(effect, MAYBE_DIRTY);
	set_signal_status(effect, CLEAN);
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/elements/misc.js
/**
* @param {HTMLElement} dom
* @param {boolean} value
* @returns {void}
*/
function autofocus(dom, value) {
	if (value) {
		const body = document.body;
		dom.autofocus = true;
		queue_micro_task(() => {
			if (document.activeElement === body) dom.focus();
		});
	}
}
var listening_to_form_reset = false;
function add_form_reset_listener() {
	if (!listening_to_form_reset) {
		listening_to_form_reset = true;
		document.addEventListener("reset", (evt) => {
			Promise.resolve().then(() => {
				if (!evt.defaultPrevented) for (const e of evt.target.elements)
 /** @type {any} */ e[FORM_RESET_HANDLER]?.();
			});
		}, { capture: true });
	}
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
/**
* @template T
* @param {() => T} fn
*/
function without_reactive_context(fn) {
	var previous_reaction = active_reaction;
	var previous_effect = active_effect;
	set_active_reaction(null);
	set_active_effect(null);
	try {
		return fn();
	} finally {
		set_active_reaction(previous_reaction);
		set_active_effect(previous_effect);
	}
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/reactivity/async.js
/** @import { Blocker, Effect, Source, Value } from '#client' */
/**
* @param {Blocker[]} blockers
* @param {Array<() => any>} sync
* @param {Array<() => Promise<any>>} async
* @param {(values: Value[]) => any} fn
*/
function flatten(blockers, sync, async, fn) {
	const d = is_runes() ? derived : derived_safe_equal;
	var pending = blockers.filter((b) => !b.settled);
	var deriveds = sync.map(d);
	if (async.length === 0 && pending.length === 0) {
		fn(deriveds);
		return;
	}
	var parent = active_effect;
	var restore = capture();
	var blocker_promise = pending.length === 1 ? pending[0].promise : pending.length > 1 ? Promise.all(pending.map((b) => b.promise)) : null;
	/**
	* @param {Source[]} async
	*/
	function finish(async) {
		if ((parent.f & 16384) !== 0) return;
		restore();
		try {
			fn([...deriveds, ...async]);
		} catch (error) {
			invoke_error_boundary(error, parent);
		}
		unset_context();
	}
	var decrement_pending = increment_pending();
	if (async.length === 0) {
		/** @type {Promise<any>} */ blocker_promise.then(() => finish([])).finally(decrement_pending);
		return;
	}
	function run() {
		Promise.all(async.map((expression) => /* @__PURE__ */ async_derived(expression))).then(finish).catch((error) => invoke_error_boundary(error, parent)).finally(decrement_pending);
	}
	if (blocker_promise) blocker_promise.then(() => {
		if ((parent.f & 16384) !== 0) {
			decrement_pending();
			return;
		}
		restore();
		run();
		unset_context();
	});
	else run();
}
/**
* Captures the current effect context so that we can restore it after
* some asynchronous work has happened (so that e.g. `await a + b`
* causes `b` to be registered as a dependency).
*/
function capture() {
	var previous_effect = active_effect;
	var previous_reaction = active_reaction;
	var previous_component_context = component_context;
	var previous_batch = current_batch;
	return function restore(activate_batch = true) {
		set_active_effect(previous_effect);
		set_active_reaction(previous_reaction);
		set_component_context(previous_component_context);
		if (activate_batch && (previous_effect.f & 16384) === 0) {
			previous_batch?.activate();
			previous_batch?.apply();
		}
	};
}
function unset_context(deactivate_batch = true) {
	set_active_effect(null);
	set_active_reaction(null);
	set_component_context(null);
	if (deactivate_batch) current_batch?.deactivate();
}
/**
* @returns {(skip?: boolean) => void}
*/
function increment_pending() {
	var effect = active_effect;
	var boundary = effect.b;
	var batch = current_batch;
	var blocking = !!boundary?.is_rendered();
	boundary?.update_pending_count(1, batch);
	batch.increment(blocking, effect);
	return () => {
		boundary?.update_pending_count(-1, batch);
		batch.decrement(blocking, effect);
	};
}
/**
* @template V
* @param {() => V} fn
* @returns {Derived<V>}
*/
/*#__NO_SIDE_EFFECTS__*/
function derived(fn) {
	var flags = 2 | DIRTY;
	if (active_effect !== null) active_effect.f |= EFFECT_PRESERVED;
	return {
		ctx: component_context,
		deps: null,
		effects: null,
		equals,
		f: flags,
		fn,
		reactions: null,
		rv: 0,
		v: UNINITIALIZED,
		wv: 0,
		parent: active_effect,
		ac: null
	};
}
var OBSOLETE = Symbol("obsolete");
/**
* @template V
* @param {() => V | Promise<V>} fn
* @param {string} [label]
* @param {string} [location] If provided, print a warning if the value is not read immediately after update
* @returns {Promise<Source<V>>}
*/
/*#__NO_SIDE_EFFECTS__*/
function async_derived(fn, label, location) {
	let parent = active_effect;
	if (parent === null) async_derived_orphan();
	var promise = void 0;
	var signal = source(UNINITIALIZED);
	var should_suspend = !active_reaction;
	/** @type {Set<ReturnType<typeof deferred<V>>>} */
	var deferreds = /* @__PURE__ */ new Set();
	async_effect(() => {
		var effect = active_effect;
		/** @type {ReturnType<typeof deferred<V>>} */
		var d = deferred();
		promise = d.promise;
		try {
			Promise.resolve(fn()).then(d.resolve, (e) => {
				if (e !== STALE_REACTION) d.reject(e);
			}).finally(unset_context);
		} catch (error) {
			d.reject(error);
			unset_context();
		}
		var batch = current_batch;
		if (should_suspend) {
			if ((effect.f & 32768) !== 0) var decrement_pending = increment_pending();
			if (parent.b?.is_rendered()) batch.async_deriveds.get(effect)?.reject(OBSOLETE);
			else for (const d of deferreds.values()) d.reject(OBSOLETE);
			deferreds.add(d);
			batch.async_deriveds.set(effect, d);
		}
		/**
		* @param {any} value
		* @param {unknown} error
		*/
		const handler = (value, error = void 0) => {
			decrement_pending?.();
			deferreds.delete(d);
			if (error === OBSOLETE) return;
			batch.activate();
			if (error) {
				signal.f |= ERROR_VALUE;
				internal_set(signal, error);
			} else {
				if ((signal.f & 8388608) !== 0) signal.f ^= ERROR_VALUE;
				internal_set(signal, value);
			}
			batch.deactivate();
		};
		d.promise.then(handler, (e) => handler(null, e || "unknown"));
	});
	teardown(() => {
		for (const d of deferreds) d.reject(OBSOLETE);
	});
	return new Promise((fulfil) => {
		/** @param {Promise<V>} p */
		function next(p) {
			function go() {
				if (p === promise) fulfil(signal);
				else next(promise);
			}
			p.then(go, go);
		}
		next(promise);
	});
}
/**
* @template V
* @param {() => V} fn
* @returns {Derived<V>}
*/
/*#__NO_SIDE_EFFECTS__*/
function user_derived(fn) {
	const d = /* @__PURE__ */ derived(fn);
	if (!async_mode_flag) push_reaction_value(d);
	return d;
}
/**
* @template V
* @param {() => V} fn
* @returns {Derived<V>}
*/
/*#__NO_SIDE_EFFECTS__*/
function derived_safe_equal(fn) {
	const signal = /* @__PURE__ */ derived(fn);
	signal.equals = safe_equals;
	return signal;
}
/**
* @param {Derived} derived
* @returns {void}
*/
function destroy_derived_effects(derived) {
	var effects = derived.effects;
	if (effects !== null) {
		derived.effects = null;
		for (var i = 0; i < effects.length; i += 1) destroy_effect(effects[i]);
	}
}
/**
* @template T
* @param {Derived} derived
* @returns {T}
*/
function execute_derived(derived) {
	var value;
	var prev_active_effect = active_effect;
	var parent = derived.parent;
	if (!is_destroying_effect && parent !== null && derived.v !== UNINITIALIZED && (parent.f & 24576) !== 0) {
		derived_inert();
		return derived.v;
	}
	set_active_effect(parent);
	try {
		destroy_derived_effects(derived);
		value = update_reaction(derived);
	} finally {
		set_active_effect(prev_active_effect);
	}
	return value;
}
/**
* @param {Derived} derived
* @returns {void}
*/
function update_derived(derived) {
	var value = execute_derived(derived);
	if (!derived.equals(value)) {
		derived.wv = increment_write_version();
		if (!current_batch?.is_fork || derived.deps === null) {
			if (current_batch !== null) {
				current_batch.capture(derived, value, true);
				previous_batch?.capture(derived, value, true);
			} else derived.v = value;
			if (derived.deps === null) {
				set_signal_status(derived, CLEAN);
				return;
			}
		}
	}
	if (is_destroying_effect) return;
	if (batch_values !== null) {
		if (effect_tracking() || current_batch?.is_fork) batch_values.set(derived, value);
	} else update_derived_status(derived);
}
/**
* @param {Derived} derived
*/
function freeze_derived_effects(derived) {
	if (derived.effects === null) return;
	for (const e of derived.effects) if (e.teardown || e.ac) {
		e.teardown?.();
		if (e.ac !== null) without_reactive_context(() => {
			/** @type {AbortController} */ e.ac.abort(STALE_REACTION);
			e.ac = null;
		});
		if (e.fn !== null) e.teardown = noop;
		remove_reactions(e, 0);
		destroy_effect_children(e);
	}
}
/**
* @param {Derived} derived
*/
function unfreeze_derived_effects(derived) {
	if (derived.effects === null) return;
	for (const e of derived.effects) if (e.teardown && e.fn !== null) update_effect(e);
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/reactivity/batch.js
/** @import { Fork } from 'svelte' */
/** @import { Derived, Effect, Reaction, Source, Value } from '#client' */
/** @type {Batch | null} */
var first_batch = null;
/** @type {Batch | null} */
var last_batch = null;
/** @type {Batch | null} */
var current_batch = null;
/**
* This is needed to avoid overwriting inputs
* @type {Batch | null}
*/
var previous_batch = null;
/**
* When time travelling (i.e. working in one batch, while other batches
* still have ongoing work), we ignore the real values of affected
* signals in favour of their values within the batch
* @type {Map<Value, any> | null}
*/
var batch_values = null;
/** @type {Effect | null} */
var last_scheduled_effect = null;
var is_flushing_sync = false;
var is_processing = false;
/**
* During traversal, this is an array. Newly created effects are (if not immediately
* executed) pushed to this array, rather than going through the scheduling
* rigamarole that would cause another turn of the flush loop.
* @type {Effect[] | null}
*/
var collected_effects = null;
/**
* An array of effects that are marked during traversal as a result of a `set`
* (not `internal_set`) call. These will be added to the next batch and
* trigger another `batch.process()`
* @type {Effect[] | null}
* @deprecated when we get rid of legacy mode and stores, we can get rid of this
*/
var legacy_updates = null;
var flush_count = 0;
var uid = 1;
var Batch = class Batch {
	id = uid++;
	/** True as soon as `#process` was called */
	started = false;
	linked = true;
	/** @type {Batch | null} */
	prev = null;
	/** @type {Batch | null} */
	next = null;
	/** @type {Map<Effect, ReturnType<typeof deferred<any>>>} */
	async_deriveds = /* @__PURE__ */ new Map();
	/**
	* The current values of any signals that are updated in this batch.
	* Tuple format: [value, is_derived] (note: is_derived is false for deriveds, too, if they were overridden via assignment)
	* The keys of this map are identical to `this.previous`
	* @type {Map<Value, [any, boolean]>}
	*/
	current = /* @__PURE__ */ new Map();
	/**
	* The values of any signals (sources and deriveds) that are updated in this batch _before_ those updates took place.
	* The keys of this map are identical to `this.current`
	* @type {Map<Value, any>}
	*/
	previous = /* @__PURE__ */ new Map();
	/**
	* When the batch is committed (and the DOM is updated), we need to remove old branches
	* and append new ones by calling the functions added inside (if/each/key/etc) blocks
	* @type {Set<(batch: Batch) => void>}
	*/
	#commit_callbacks = /* @__PURE__ */ new Set();
	/**
	* If a fork is discarded, we need to destroy any effects that are no longer needed
	* @type {Set<(batch: Batch) => void>}
	*/
	#discard_callbacks = /* @__PURE__ */ new Set();
	/**
	* The number of async effects that are currently in flight
	*/
	#pending = 0;
	/**
	* Async effects that are currently in flight, _not_ inside a pending boundary
	* @type {Map<Effect, number>}
	*/
	#blocking_pending = /* @__PURE__ */ new Map();
	/**
	* A deferred that resolves when the batch is committed, used with `settled()`
	* TODO replace with Promise.withResolvers once supported widely enough
	* @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
	*/
	#deferred = null;
	/**
	* Effects that were scheduled in this batch but not yet 'resolved' into the
	* root effects that need to be flushed. Resolving — the upwards traversal that
	* marks the path to each effect on the shared effect tree (see #resolve) — is
	* deferred until the batch is processed, so that the markers are created and
	* consumed within a single traversal. Scheduling into other batches (which can
	* happen concurrently, e.g. while a batch is committed) can therefore never
	* observe (and be confused by) this batch's markers.
	* May contain duplicates — deduplication happens during resolving
	* @type {Effect[]}
	*/
	#scheduled = [];
	/**
	* Effects created while this batch was active.
	* @type {Effect[]}
	*/
	#new_effects = [];
	/**
	* Deferred effects (which run after async work has completed) and their status (DIRTY or MAYBE_DIRTY)
	* @type {Map<Effect, number>}
	*/
	#dirty_reactions = /* @__PURE__ */ new Map();
	/**
	* A map of branches that still exist, but will be destroyed when this batch
	* is committed — we skip over these during `process`.
	* The value contains child effects that were dirty/maybe_dirty before being reset,
	* so they can be rescheduled if the branch survives.
	* @type {Map<Effect, { d: Effect[], m: Effect[] }>}
	*/
	#skipped_branches = /* @__PURE__ */ new Map();
	/**
	* Inverse of #skipped_branches which we need to tell prior batches to unskip them when committing
	* @type {Set<Effect>}
	*/
	#unskipped_branches = /* @__PURE__ */ new Set();
	is_fork = false;
	#decrement_queued = false;
	constructor() {
		if (last_batch === null) first_batch = last_batch = this;
		else {
			last_batch.next = this;
			this.prev = last_batch;
		}
		last_batch = this;
	}
	#is_deferred() {
		if (this.is_fork) return true;
		for (const effect of this.#blocking_pending.keys()) if (!this.#is_skipped(effect)) return true;
		return false;
	}
	/**
	* Whether `effect` is inside a branch that this batch skips
	* @param {Effect} effect
	*/
	#is_skipped(effect) {
		for (var e = effect; e !== null; e = e.parent) if (this.#skipped_branches.has(e)) return true;
		return false;
	}
	/**
	* Add an effect to the #skipped_branches map and reset its children
	* @param {Effect} effect
	*/
	skip_effect(effect) {
		if (!this.#skipped_branches.has(effect)) this.#skipped_branches.set(effect, {
			d: [],
			m: []
		});
		this.#unskipped_branches.delete(effect);
	}
	/**
	* Remove an effect from the #skipped_branches map and reschedule
	* any tracked dirty/maybe_dirty child effects
	* @param {Effect} effect
	* @param {(e: Effect) => void} callback
	*/
	unskip_effect(effect, callback = (e) => this.schedule(e)) {
		var tracked = this.#skipped_branches.get(effect);
		if (tracked) {
			this.#skipped_branches.delete(effect);
			for (var e of tracked.d) {
				set_signal_status(e, DIRTY);
				callback(e);
			}
			for (e of tracked.m) {
				set_signal_status(e, MAYBE_DIRTY);
				callback(e);
			}
		}
		this.#unskipped_branches.add(effect);
	}
	/**
	* Convert the effects that were scheduled in this batch into the root effects
	* that need to be traversed, marking the path to each effect (by clearing the
	* `CLEAN` flag on ancestor branches) so that the traversal can find them.
	* This happens right before traversal rather than at scheduling time, so that
	* the markers left on the (shared) effect tree are created and consumed within
	* a single traversal — scheduling into other batches can never observe them
	* @returns {Effect[]}
	*/
	#resolve() {
		/** @type {Effect[]} */
		var roots = [];
		for (const effect of this.#scheduled) {
			if ((effect.f & 16384) !== 0 || (effect.f & 6144) === 0) continue;
			var e = effect;
			var covered = false;
			while (e.parent !== null) {
				e = e.parent;
				var flags = e.f;
				if ((flags & 96) !== 0) {
					if ((flags & 1024) === 0) {
						covered = true;
						break;
					}
					e.f ^= CLEAN;
				}
			}
			if (!covered) roots.push(e);
		}
		this.#scheduled = [];
		return roots;
	}
	#process() {
		this.started = true;
		for (const [e, status] of this.#dirty_reactions) {
			set_signal_status(e, status);
			this.schedule(e);
		}
		this.apply();
		/** @type {Effect[]} */
		var effects = collected_effects = [];
		/** @type {Effect[]} */
		var render_effects = [];
		/**
		* @type {Effect[]}
		* @deprecated when we get rid of legacy mode and stores, we can get rid of this
		*/
		var updates = legacy_updates = [];
		while (this.#scheduled.length > 0) {
			if (flush_count++ > 1e3) {
				this.#unlink();
				infinite_loop_guard();
			}
			for (const root of this.#resolve()) try {
				this.#traverse(root, effects, render_effects);
			} catch (e) {
				reset_all(root);
				if (!this.#is_deferred()) this.discard();
				throw e;
			}
		}
		current_batch = null;
		if (updates.length > 0) {
			var batch = Batch.ensure();
			for (const e of updates) batch.schedule(e);
		}
		collected_effects = null;
		legacy_updates = null;
		if (this.#is_deferred()) {
			this.#defer_effects(render_effects);
			this.#defer_effects(effects);
			for (const [e, t] of this.#skipped_branches) reset_branch(e, t);
			if (updates.length > 0)
 /** @type {Batch} */ current_batch.#process();
			return;
		}
		const earlier_batch = this.#find_earlier_batch();
		if (earlier_batch) {
			this.#defer_effects(render_effects);
			this.#defer_effects(effects);
			earlier_batch.#merge(this);
			return;
		}
		this.#dirty_reactions.clear();
		for (const fn of this.#commit_callbacks) fn(this);
		this.#commit_callbacks.clear();
		previous_batch = this;
		flush_queued_effects(render_effects);
		flush_queued_effects(effects);
		previous_batch = null;
		this.#deferred?.resolve();
		var next_batch = current_batch;
		if (this.#pending === 0 && (this.#scheduled.length === 0 || next_batch !== null)) {
			this.#unlink();
			if (async_mode_flag) {
				this.#commit();
				current_batch = next_batch;
			}
		}
		if (next_batch !== null) {
			old_values.clear();
			next_batch.#process();
		}
	}
	/**
	* Traverse the effect tree, executing effects or stashing
	* them for later execution as appropriate
	* @param {Effect} root
	* @param {Effect[]} effects
	* @param {Effect[]} render_effects
	*/
	#traverse(root, effects, render_effects) {
		root.f ^= CLEAN;
		var effect = root.first;
		while (effect !== null) {
			var flags = effect.f;
			var is_branch = (flags & 96) !== 0;
			if (!(is_branch && (flags & 1024) !== 0 || (flags & 8192) !== 0 || this.#skipped_branches.has(effect)) && effect.fn !== null) {
				if (is_branch) effect.f ^= CLEAN;
				else if ((flags & 4) !== 0) effects.push(effect);
				else if (async_mode_flag && (flags & 16777224) !== 0) render_effects.push(effect);
				else if (is_dirty(effect)) {
					if ((flags & 16) !== 0) this.add_dirty_reaction(effect, MAYBE_DIRTY);
					update_effect(effect);
				}
				var child = effect.first;
				if (child !== null) {
					effect = child;
					continue;
				}
			}
			while (effect !== null) {
				var next = effect.next;
				if (next !== null) {
					effect = next;
					break;
				}
				effect = effect.parent;
			}
		}
	}
	#find_earlier_batch() {
		for (var batch = this.prev; batch !== null; batch = batch.prev) if (!batch.is_fork && this.#intersects(batch)) return batch;
		return null;
	}
	/** @param {Batch} batch */
	#intersects(batch) {
		for (const [source, [, is_derived]] of this.current) {
			if (is_derived) continue;
			if (batch.current.has(source)) return true;
		}
		return false;
	}
	/**
	* @param {Batch} batch
	*/
	#merge(batch) {
		for (const [source, value] of batch.current) {
			if (!this.previous.has(source) && batch.previous.has(source)) this.previous.set(source, batch.previous.get(source));
			this.current.set(source, value);
		}
		for (const [effect, deferred] of batch.async_deriveds) {
			const d = this.async_deriveds.get(effect);
			if (d) deferred.promise.then(d.resolve).catch(d.reject);
		}
		batch.async_deriveds.clear();
		this.transfer_reactions(batch.#dirty_reactions);
		/**
		* mark all effects that depend on `batch.current`, except the
		* async effects that we just resolved (TODO unless they depend
		* on values in this batch that are NOT in the later batch?).
		* Through this we also will populate the correct #skipped_branches,
		* oncommit callbacks etc, so we don't need to merge them separately.
		* @param {Value} value
		*/
		const mark = (value) => {
			var reactions = value.reactions;
			if (reactions === null) return;
			if ((value.f & 2) !== 0 && (value.f & 6144) === 0) return;
			for (const reaction of reactions) {
				var flags = reaction.f;
				if ((flags & 2) !== 0) mark(reaction);
				else {
					var effect = reaction;
					if (flags & 4194320 && !this.async_deriveds.has(effect)) {
						this.#dirty_reactions.delete(effect);
						set_signal_status(effect, DIRTY);
						this.schedule(effect);
					}
				}
			}
		};
		for (const source of this.current.keys()) mark(source);
		this.oncommit(() => batch.discard());
		batch.#unlink();
		current_batch = this;
		this.#process();
	}
	/**
	* @param {Effect[]} effects
	*/
	#defer_effects(effects) {
		for (var i = 0; i < effects.length; i += 1) defer_effect(effects[i], this.#dirty_reactions);
	}
	/**
	* Associate a change to a given source with the current
	* batch, noting its previous and current values
	* @param {Value} source
	* @param {any} value
	* @param {boolean} [is_derived]
	*/
	capture(source, value, is_derived = false) {
		if (source.v !== UNINITIALIZED && !this.previous.has(source)) this.previous.set(source, source.v);
		if ((source.f & 8388608) === 0) {
			this.current.set(source, [value, is_derived]);
			batch_values?.set(source, value);
		}
		if (!this.is_fork) source.v = value;
	}
	activate() {
		current_batch = this;
	}
	deactivate() {
		current_batch = null;
		batch_values = null;
	}
	flush() {
		try {
			is_processing = true;
			current_batch = this;
			this.#process();
		} finally {
			flush_count = 0;
			last_scheduled_effect = null;
			collected_effects = null;
			legacy_updates = null;
			is_processing = false;
			current_batch = null;
			batch_values = null;
			old_values.clear();
		}
	}
	discard() {
		for (const fn of this.#discard_callbacks) fn(this);
		this.#discard_callbacks.clear();
		for (const deferred of this.async_deriveds.values()) deferred.reject(OBSOLETE);
		this.#unlink();
		this.#deferred?.resolve();
	}
	/**
	* @param {Effect} effect
	*/
	register_created_effect(effect) {
		this.#new_effects.push(effect);
	}
	#commit() {
		for (let batch = first_batch; batch !== null; batch = batch.next) {
			var is_earlier = batch.id < this.id;
			/** @type {Source[]} */
			var sources = [];
			for (const [source, [value, is_derived]] of this.current) {
				if (batch.current.has(source)) {
					var batch_value = batch.current.get(source)[0];
					if (is_earlier && value !== batch_value) batch.current.set(source, [value, is_derived]);
					else continue;
				}
				sources.push(source);
			}
			if (is_earlier) for (const [effect, deferred] of this.async_deriveds) {
				const d = batch.async_deriveds.get(effect);
				if (d) deferred.promise.then(d.resolve).catch(d.reject);
			}
			var current = [...batch.current.keys()].filter((source) => !batch.current.get(source)[1]);
			if (!batch.started || current.length === 0) continue;
			var others = current.filter((source) => !this.current.has(source));
			if (others.length === 0) {
				if (is_earlier) batch.discard();
			} else if (sources.length > 0) {
				if (is_earlier) for (const unskipped of this.#unskipped_branches) batch.unskip_effect(unskipped, (e) => {
					if ((e.f & 4194320) !== 0) batch.schedule(e);
					else batch.#defer_effects([e]);
				});
				batch.activate();
				/** @type {Set<Value>} */
				var marked = /* @__PURE__ */ new Set();
				/** @type {Map<Reaction, boolean>} */
				var checked = /* @__PURE__ */ new Map();
				for (var source of sources) mark_effects(source, others, marked, checked);
				checked = /* @__PURE__ */ new Map();
				var current_unequal = [...batch.current].filter(([c, v1]) => {
					const v2 = this.current.get(c);
					if (!v2) return true;
					return v2[0] !== v1[0] || v2[1] !== v1[1];
				}).map(([c]) => c);
				if (current_unequal.length > 0) {
					for (const effect of this.#new_effects) if ((effect.f & 155648) === 0 && depends_on(effect, current_unequal, checked)) {
						if ((effect.f & 4194320) !== 0) {
							set_signal_status(effect, DIRTY);
							batch.schedule(effect);
						} else batch.add_dirty_reaction(effect, DIRTY);
					}
				}
				if (batch.#scheduled.length > 0 && !batch.#decrement_queued) {
					batch.apply();
					for (var root of batch.#resolve()) batch.#traverse(root, [], []);
				}
				batch.deactivate();
			}
		}
	}
	/**
	* @param {boolean} blocking
	* @param {Effect} effect
	*/
	increment(blocking, effect) {
		this.#pending += 1;
		if (blocking) {
			let blocking_pending_count = this.#blocking_pending.get(effect) ?? 0;
			this.#blocking_pending.set(effect, blocking_pending_count + 1);
		}
	}
	/**
	* @param {boolean} blocking
	* @param {Effect} effect
	*/
	decrement(blocking, effect) {
		this.#pending -= 1;
		if (blocking) {
			let blocking_pending_count = this.#blocking_pending.get(effect) ?? 0;
			if (blocking_pending_count === 1) this.#blocking_pending.delete(effect);
			else this.#blocking_pending.set(effect, blocking_pending_count - 1);
		}
		if (this.#decrement_queued) return;
		this.#decrement_queued = true;
		queue_micro_task(() => {
			this.#decrement_queued = false;
			if (this.linked) this.flush();
		});
	}
	/**
	* @param {Map<Effect, number>} dirty_reactions
	*/
	transfer_reactions(dirty_reactions) {
		for (const [effect, status] of dirty_reactions) this.add_dirty_reaction(effect, status);
		dirty_reactions.clear();
	}
	/**
	* @param {Effect} effect
	* @param {number} status
	*/
	add_dirty_reaction(effect, status) {
		if (status === 2048 || this.#dirty_reactions.get(effect) !== 2048) this.#dirty_reactions.set(effect, status);
	}
	/** @param {(batch: Batch) => void} fn */
	oncommit(fn) {
		this.#commit_callbacks.add(fn);
	}
	/** @param {(batch: Batch) => void} fn */
	ondiscard(fn) {
		this.#discard_callbacks.add(fn);
	}
	settled() {
		return (this.#deferred ??= deferred()).promise;
	}
	static ensure() {
		if (current_batch === null) {
			const batch = current_batch = new Batch();
			if (!is_processing && !is_flushing_sync) queue_micro_task(() => {
				if (!batch.started) batch.flush();
			});
		}
		return current_batch;
	}
	apply() {
		if (!async_mode_flag || !this.is_fork && this.prev === null && this.next === null) {
			batch_values = null;
			return;
		}
		batch_values = /* @__PURE__ */ new Map();
		for (const [source, [value]] of this.current) batch_values.set(source, value);
		for (let batch = first_batch; batch !== null; batch = batch.next) {
			if (batch === this || batch.is_fork) continue;
			if (batch.id >= this.id || !batch.#intersects(this)) {
				for (const [source, previous] of batch.previous) if (!batch_values.has(source)) batch_values.set(source, previous);
			}
		}
	}
	/**
	*
	* @param {Effect} effect
	*/
	schedule(effect) {
		last_scheduled_effect = effect;
		if (effect.b?.is_pending && (effect.f & 16777228) !== 0 && (effect.f & 32768) === 0) {
			effect.b.defer_effect(effect);
			return;
		}
		this.#scheduled.push(effect);
	}
	#unlink() {
		if (!this.linked) return;
		var prev = this.prev;
		var next = this.next;
		if (prev === null) first_batch = next;
		else prev.next = next;
		if (next === null) last_batch = prev;
		else next.prev = prev;
		this.linked = false;
	}
};
/**
* Synchronously flush any pending updates.
* Returns void if no callback is provided, otherwise returns the result of calling the callback.
* @template [T=void]
* @param {(() => T) | undefined} [fn]
* @returns {T}
*/
function flushSync(fn) {
	var was_flushing_sync = is_flushing_sync;
	var prev_previous_batch = previous_batch;
	previous_batch = null;
	is_flushing_sync = true;
	try {
		var result;
		if (fn) {
			flushSync();
			result = fn();
		}
		while (true) {
			flush_tasks();
			if (current_batch === null) return result;
			current_batch.flush();
		}
	} finally {
		is_flushing_sync = was_flushing_sync;
		previous_batch = prev_previous_batch;
	}
}
function infinite_loop_guard() {
	try {
		effect_update_depth_exceeded();
	} catch (error) {
		invoke_error_boundary(error, last_scheduled_effect);
	}
}
/** @type {Set<Effect> | null} */
var eager_block_effects = null;
/**
* @param {Array<Effect>} effects
* @returns {void}
*/
function flush_queued_effects(effects) {
	var length = effects.length;
	if (length === 0) return;
	var i = 0;
	while (i < length) {
		var effect = effects[i++];
		if ((effect.f & 24576) === 0 && is_dirty(effect)) {
			eager_block_effects = /* @__PURE__ */ new Set();
			update_effect(effect);
			if (effect.deps === null && effect.first === null && effect.nodes === null && effect.teardown === null && effect.ac === null) unlink_effect(effect);
			if (eager_block_effects?.size > 0) {
				old_values.clear();
				for (const e of eager_block_effects) {
					if ((e.f & 24576) !== 0) continue;
					/** @type {Effect[]} */
					const ordered_effects = [e];
					let ancestor = e.parent;
					while (ancestor !== null) {
						if (eager_block_effects.has(ancestor)) {
							eager_block_effects.delete(ancestor);
							ordered_effects.push(ancestor);
						}
						ancestor = ancestor.parent;
					}
					for (let j = ordered_effects.length - 1; j >= 0; j--) {
						const e = ordered_effects[j];
						if ((e.f & 24576) !== 0) continue;
						update_effect(e);
					}
				}
				eager_block_effects.clear();
			}
		}
	}
	eager_block_effects = null;
}
/**
* This is similar to `mark_reactions`, but it only marks async/block effects
* depending on `value` and at least one of the other `sources`, so that
* these effects can re-run after another batch has been committed
* @param {Value} value
* @param {Source[]} sources
* @param {Set<Value>} marked
* @param {Map<Reaction, boolean>} checked
*/
function mark_effects(value, sources, marked, checked) {
	if (marked.has(value)) return;
	marked.add(value);
	if (value.reactions !== null) for (const reaction of value.reactions) {
		const flags = reaction.f;
		if ((flags & 2) !== 0) mark_effects(reaction, sources, marked, checked);
		else if ((flags & 4194320) !== 0 && (flags & 2048) === 0 && depends_on(reaction, sources, checked)) {
			set_signal_status(reaction, DIRTY);
			schedule_effect(reaction);
		}
	}
}
/**
* @param {Reaction} reaction
* @param {Source[]} sources
* @param {Map<Reaction, boolean>} checked
*/
function depends_on(reaction, sources, checked) {
	const depends = checked.get(reaction);
	if (depends !== void 0) return depends;
	if (reaction.deps !== null) for (const dep of reaction.deps) {
		if (includes.call(sources, dep)) return true;
		if ((dep.f & 2) !== 0 && depends_on(dep, sources, checked)) {
			checked.set(dep, true);
			return true;
		}
	}
	checked.set(reaction, false);
	return false;
}
/**
* @param {Effect} effect
* @returns {void}
*/
function schedule_effect(effect) {
	/** @type {Batch} */ current_batch.schedule(effect);
}
/**
* Mark all the effects inside a skipped branch CLEAN, so that
* they can be correctly rescheduled later. Tracks dirty and maybe_dirty
* effects so they can be rescheduled if the branch survives.
* @param {Effect} effect
* @param {{ d: Effect[], m: Effect[] }} tracked
*/
function reset_branch(effect, tracked) {
	if ((effect.f & 32) !== 0 && (effect.f & 1024) !== 0) return;
	if ((effect.f & 2048) !== 0) tracked.d.push(effect);
	else if ((effect.f & 4096) !== 0) tracked.m.push(effect);
	set_signal_status(effect, CLEAN);
	var e = effect.first;
	while (e !== null) {
		reset_branch(e, tracked);
		e = e.next;
	}
}
/**
* Mark an entire effect tree clean following an error
* @param {Effect} effect
*/
function reset_all(effect) {
	set_signal_status(effect, CLEAN);
	var e = effect.first;
	while (e !== null) {
		reset_all(e);
		e = e.next;
	}
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/reactivity/sources.js
/** @import { Derived, Effect, Source, Value } from '#client' */
/** @type {Set<Effect>} */
var eager_effects = /* @__PURE__ */ new Set();
/** @type {Map<Value, any>} */
var old_values = /* @__PURE__ */ new Map();
var eager_effects_deferred = false;
/**
* @template V
* @param {V} v
* @param {Error | null} [stack]
* @returns {Source<V>}
*/
function source(v, stack) {
	return {
		f: 0,
		v,
		reactions: null,
		equals,
		rv: 0,
		wv: 0
	};
}
/**
* @template V
* @param {V} v
* @param {Error | null} [stack]
*/
/*#__NO_SIDE_EFFECTS__*/
function state(v, stack) {
	const s = source(v, stack);
	push_reaction_value(s);
	return s;
}
/**
* @template V
* @param {V} initial_value
* @param {boolean} [immutable]
* @returns {Source<V>}
*/
/*#__NO_SIDE_EFFECTS__*/
function mutable_source(initial_value, immutable = false, trackable = true) {
	const s = source(initial_value);
	if (!immutable) s.equals = safe_equals;
	if (legacy_mode_flag && trackable && component_context !== null && component_context.l !== null) (component_context.l.s ??= []).push(s);
	return s;
}
/**
* @template V
* @param {Value<V>} source
* @param {V} value
* @param {boolean} [should_proxy]
* @returns {V}
*/
function set(source, value, should_proxy = false) {
	if (active_reaction !== null && (!untracking || (active_reaction.f & 131072) !== 0) && is_runes() && (active_reaction.f & 4325394) !== 0 && (current_sources === null || !current_sources.has(source))) state_unsafe_mutation();
	return internal_set(source, should_proxy ? proxy(value) : value, legacy_updates);
}
/**
* A set of signals we have already seen while traversing in mark_reactions.
* Not always set to balance the common case of sources only having a couple
* of (transitive) dependencies (where always creating a Set would be bad for perf)
* with the edge case of extremely deep or wide dependency arrays with cycles.
* @type {Set<any> | null}
*/
var seen = null;
/** Number of transitive dependencies, see {@link seen} for more info */
var count_deps = 0;
/**
* @template V
* @param {Value<V>} source
* @param {V} value
* @param {Effect[] | null} [updated_during_traversal]
* @returns {V}
*/
function internal_set(source, value, updated_during_traversal = null) {
	if (!source.equals(value)) {
		if (is_destroying_effect) old_values.set(source, value);
		else if (!old_values.has(source)) old_values.set(source, source.v);
		var batch = Batch.ensure();
		batch.capture(source, value);
		if ((source.f & 2) !== 0) {
			const derived = source;
			if ((source.f & 2048) !== 0) execute_derived(derived);
			if (batch_values === null) update_derived_status(derived);
		}
		source.wv = increment_write_version();
		seen = null;
		count_deps = 0;
		mark_reactions(source, DIRTY, updated_during_traversal);
		seen = null;
		if (is_runes() && active_effect !== null && (active_effect.f & 1024) !== 0 && (active_effect.f & 96) === 0) {
			if (untracked_writes === null) set_untracked_writes([source]);
			else untracked_writes.push(source);
		}
		if (!batch.is_fork && eager_effects.size > 0 && !eager_effects_deferred) flush_eager_effects();
	}
	return value;
}
function flush_eager_effects() {
	eager_effects_deferred = false;
	for (const effect of eager_effects) {
		if ((effect.f & 1024) !== 0) set_signal_status(effect, MAYBE_DIRTY);
		let dirty;
		try {
			dirty = is_dirty(effect);
		} catch {
			dirty = true;
		}
		if (dirty) update_effect(effect);
	}
	eager_effects.clear();
}
/**
* Silently (without using `get`) increment a source
* @param {Source<number>} source
*/
function increment(source) {
	set(source, source.v + 1);
}
/**
* @param {Value} signal
* @param {number} status should be DIRTY or MAYBE_DIRTY
* @param {Effect[] | null} updated_during_traversal
* @returns {void}
*/
function mark_reactions(signal, status, updated_during_traversal) {
	var reactions = signal.reactions;
	if (reactions === null) return;
	var runes = is_runes();
	var length = reactions.length;
	count_deps += length;
	if (count_deps > 1e5 && seen === null) seen = /* @__PURE__ */ new Set();
	if (seen !== null) {
		if (seen.has(signal)) return;
		seen.add(signal);
	}
	for (var i = 0; i < length; i++) {
		var reaction = reactions[i];
		var flags = reaction.f;
		if (!runes && reaction === active_effect) continue;
		var not_dirty = (flags & DIRTY) === 0;
		if (not_dirty) set_signal_status(reaction, status);
		if ((flags & 131072) !== 0) eager_effects.add(reaction);
		else if ((flags & 2) !== 0) {
			var derived = reaction;
			batch_values?.delete(derived);
			mark_reactions(derived, MAYBE_DIRTY, updated_during_traversal);
		} else if (not_dirty) {
			var effect = reaction;
			if ((flags & 16) !== 0 && eager_block_effects !== null) eager_block_effects.add(effect);
			if (updated_during_traversal !== null) updated_during_traversal.push(effect);
			else schedule_effect(effect);
		}
	}
}
/**
* @template T
* @param {T} value
* @returns {T}
*/
function proxy(value) {
	if (typeof value !== "object" || value === null || STATE_SYMBOL in value || COMPONENT_SYMBOL in value) return value;
	const prototype = get_prototype_of(value);
	if (prototype !== object_prototype && prototype !== array_prototype) return value;
	/** @type {Map<any, Source<any>>} */
	var sources = /* @__PURE__ */ new Map();
	var is_proxied_array = is_array(value);
	var version = /* @__PURE__ */ state(0);
	var stack = null;
	var parent_version = update_version;
	/**
	* Executes the proxy in the context of the reaction it was originally created in, if any
	* @template T
	* @param {() => T} fn
	*/
	var with_parent = (fn) => {
		if (update_version === parent_version) return fn();
		var reaction = active_reaction;
		var version = update_version;
		set_active_reaction(null);
		set_update_version(parent_version);
		var result = fn();
		set_active_reaction(reaction);
		set_update_version(version);
		return result;
	};
	if (is_proxied_array) sources.set("length", /* @__PURE__ */ state(
		/** @type {any[]} */
		value.length,
		stack
	));
	return new Proxy(value, {
		defineProperty(_, prop, descriptor) {
			if (!("value" in descriptor) || descriptor.configurable === false || descriptor.enumerable === false || descriptor.writable === false) state_descriptors_fixed();
			var s = sources.get(prop);
			if (s === void 0) with_parent(() => {
				var s = /* @__PURE__ */ state(descriptor.value, stack);
				sources.set(prop, s);
				return s;
			});
			else set(s, descriptor.value, true);
			return true;
		},
		deleteProperty(target, prop) {
			var s = sources.get(prop);
			if (s === void 0) {
				if (prop in target) {
					const s = with_parent(() => /* @__PURE__ */ state(UNINITIALIZED, stack));
					sources.set(prop, s);
					increment(version);
				}
			} else {
				set(s, UNINITIALIZED);
				increment(version);
			}
			return true;
		},
		get(target, prop, receiver) {
			if (prop === STATE_SYMBOL) return value;
			var s = sources.get(prop);
			var exists = prop in target;
			if (s === void 0 && (!exists || get_descriptor(target, prop)?.writable)) {
				s = with_parent(() => {
					return /* @__PURE__ */ state(proxy(exists ? target[prop] : UNINITIALIZED), stack);
				});
				sources.set(prop, s);
			}
			if (s !== void 0) {
				var v = get(s);
				return v === UNINITIALIZED ? void 0 : v;
			}
			return Reflect.get(target, prop, receiver);
		},
		getOwnPropertyDescriptor(target, prop) {
			this.has?.(target, prop);
			var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
			var s = sources.get(prop);
			if (s !== void 0) {
				var value = get(s);
				if (value === UNINITIALIZED) return;
				if (descriptor && "value" in descriptor) descriptor.value = value;
				else return {
					enumerable: true,
					configurable: true,
					value,
					writable: true
				};
			}
			return descriptor;
		},
		has(target, prop) {
			if (prop === STATE_SYMBOL) return true;
			var s = sources.get(prop);
			var has = s !== void 0 && s.v !== UNINITIALIZED || Reflect.has(target, prop);
			if (s !== void 0 || (active_effect !== null || active_reaction !== null) && (!has || get_descriptor(target, prop)?.writable)) {
				if (s === void 0) {
					s = with_parent(() => {
						return /* @__PURE__ */ state(has ? proxy(target[prop]) : UNINITIALIZED, stack);
					});
					sources.set(prop, s);
				}
				if (get(s) === UNINITIALIZED) return false;
			}
			return has;
		},
		set(target, prop, value, receiver) {
			var s = sources.get(prop);
			var has = prop in target;
			if (is_proxied_array && prop === "length") for (var i = value; i < s.v; i += 1) {
				var other_s = sources.get(i + "");
				if (other_s !== void 0) set(other_s, UNINITIALIZED);
				else if (i in target) {
					other_s = with_parent(() => /* @__PURE__ */ state(UNINITIALIZED, stack));
					sources.set(i + "", other_s);
				}
			}
			if (s === void 0) {
				if (!has || get_descriptor(target, prop)?.writable) {
					s = with_parent(() => /* @__PURE__ */ state(void 0, stack));
					set(s, proxy(value));
					sources.set(prop, s);
				}
			} else {
				has = s.v !== UNINITIALIZED;
				var p = with_parent(() => proxy(value));
				set(s, p);
			}
			var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
			if (descriptor?.set) descriptor.set.call(receiver, value);
			if (!has) {
				if (is_proxied_array && typeof prop === "string") {
					var ls = sources.get("length");
					var n = Number(prop);
					if (Number.isInteger(n) && n >= ls.v) set(ls, n + 1);
				}
				increment(version);
			}
			return true;
		},
		ownKeys(target) {
			get(version);
			var own_keys = Reflect.ownKeys(target).filter((key) => {
				var source = sources.get(key);
				return source === void 0 || source.v !== UNINITIALIZED;
			});
			for (var [key, source] of sources) if (source.v !== UNINITIALIZED && !(key in target)) own_keys.push(key);
			return own_keys;
		},
		setPrototypeOf() {
			state_prototype_fixed();
		}
	});
}
/**
* @param {any} value
*/
function get_proxied_value(value) {
	try {
		if (value !== null && typeof value === "object" && STATE_SYMBOL in value) return value[STATE_SYMBOL];
	} catch {}
	return value;
}
/**
* @param {any} a
* @param {any} b
*/
function is$1(a, b) {
	return Object.is(get_proxied_value(a), get_proxied_value(b));
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/operations.js
/** @import { Effect, TemplateNode } from '#client' */
/** @type {Window} */
var $window;
/** @type {boolean} */
var is_firefox;
/** @type {() => Node | null} */
var first_child_getter;
/** @type {() => Node | null} */
var next_sibling_getter;
/**
* Initialize these lazily to avoid issues when using the runtime in a server context
* where these globals are not available while avoiding a separate server entry point
*/
function init_operations() {
	if ($window !== void 0) return;
	$window = window;
	is_firefox = /Firefox/.test(navigator.userAgent);
	var element_prototype = Element.prototype;
	var node_prototype = Node.prototype;
	var text_prototype = Text.prototype;
	first_child_getter = get_descriptor(node_prototype, "firstChild").get;
	next_sibling_getter = get_descriptor(node_prototype, "nextSibling").get;
	if (is_extensible(element_prototype)) {
		/** @type {any} */ element_prototype[CLASS_CACHE] = void 0;
		/** @type {any} */ element_prototype[ATTRIBUTES_CACHE] = null;
		/** @type {any} */ element_prototype[STYLE_CACHE] = void 0;
		element_prototype.__e = void 0;
	}
	if (is_extensible(text_prototype))
 /** @type {any} */ text_prototype[TEXT_CACHE] = void 0;
}
/**
* @param {string} value
* @returns {Text}
*/
function create_text(value = "") {
	return document.createTextNode(value);
}
/**
* @template {Node} N
* @param {N} node
*/
/*@__NO_SIDE_EFFECTS__*/
function get_first_child(node) {
	return first_child_getter.call(node);
}
/**
* @template {Node} N
* @param {N} node
*/
/*@__NO_SIDE_EFFECTS__*/
function get_next_sibling(node) {
	return next_sibling_getter.call(node);
}
/**
* Don't mark this as side-effect-free, hydration needs to walk all nodes
* @template {Node} N
* @param {N} node
* @param {boolean} is_text
* @returns {TemplateNode | null}
*/
function child(node, is_text) {
	if (!hydrating) return /* @__PURE__ */ get_first_child(node);
	var child = /* @__PURE__ */ get_first_child(hydrate_node);
	if (child === null) child = hydrate_node.appendChild(create_text());
	else if (is_text && child.nodeType !== 3) {
		var text = create_text();
		child?.before(text);
		set_hydrate_node(text);
		return text;
	}
	if (is_text) merge_text_nodes(child);
	set_hydrate_node(child);
	return child;
}
/**
* Don't mark this as side-effect-free, hydration needs to walk all nodes
* @param {TemplateNode} node
* @param {boolean} [is_text]
* @returns {TemplateNode | null}
*/
function first_child(node, is_text = false) {
	if (!hydrating) {
		var first = /* @__PURE__ */ get_first_child(node);
		if (first instanceof Comment && first.data === "") return /* @__PURE__ */ get_next_sibling(first);
		return first;
	}
	if (is_text) {
		if (hydrate_node?.nodeType !== 3) {
			var text = create_text();
			hydrate_node?.before(text);
			set_hydrate_node(text);
			return text;
		}
		merge_text_nodes(hydrate_node);
	}
	return hydrate_node;
}
/**
* `child`, for the very common case of an element with exactly one child. Resetting the
* hydration cursor is part of the same step, so the compiler doesn't have to emit a
* separate `reset` call for every `<p>{text}</p>` in an app.
* Don't mark this as side-effect-free, hydration needs to walk all nodes
* @param {TemplateNode} node
* @param {boolean} [is_text]
* @returns {TemplateNode | null}
*/
function only_child(node, is_text = false) {
	if (!hydrating) return /* @__PURE__ */ get_first_child(node);
	var first = child(node, is_text);
	reset(node);
	return first;
}
/**
* Don't mark this as side-effect-free, hydration needs to walk all nodes
* @param {TemplateNode} node
* @param {number} count
* @param {boolean} is_text
* @returns {TemplateNode | null}
*/
function sibling(node, count = 1, is_text = false) {
	let next_sibling = hydrating ? hydrate_node : node;
	var last_sibling;
	while (count--) {
		last_sibling = next_sibling;
		next_sibling = /* @__PURE__ */ get_next_sibling(next_sibling);
	}
	if (!hydrating) return next_sibling;
	if (is_text) {
		if (next_sibling?.nodeType !== 3) {
			var text = create_text();
			if (next_sibling === null) last_sibling?.after(text);
			else next_sibling.before(text);
			set_hydrate_node(text);
			return text;
		}
		merge_text_nodes(next_sibling);
	}
	set_hydrate_node(next_sibling);
	return next_sibling;
}
/**
* @template {Node} N
* @param {N} node
* @returns {void}
*/
function clear_text_content(node) {
	node.textContent = "";
}
/**
* Returns `true` if we're updating the current block, for example `condition` in
* an `{#if condition}` block just changed. In this case, the branch should be
* appended (or removed) at the same time as other updates within the
* current `<svelte:boundary>`
*/
function should_defer_append() {
	if (!async_mode_flag) return false;
	if (eager_block_effects !== null) return false;
	return (active_effect.f & REACTION_RAN) !== 0;
}
/**
* Branching here is intentional and load-bearing for perf. `createElement(tag)`
* hits a fast path in Blink that `createElementNS(NAMESPACE_HTML, tag)` doesn't,
* and passing an explicit `undefined` as the trailing options arg measurably
* slows both APIs. Funnelling every case through a single `createElementNS(ns,
* tag, options)` call would be smaller but slower on the HTML path.
*
* @template {keyof HTMLElementTagNameMap | string} T
* @param {T} tag
* @param {string} [namespace]
* @param {string} [is]
* @returns {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element}
*/
function create_element(tag, namespace, is) {
	if (namespace == null || namespace === "http://www.w3.org/1999/xhtml") return is ? document.createElement(tag, { is }) : document.createElement(tag);
	return is ? document.createElementNS(namespace, tag, { is }) : document.createElementNS(namespace, tag);
}
/**
* Browsers split text nodes larger than 65536 bytes when parsing.
* For hydration to succeed, we need to stitch them back together
* @param {Text} text
*/
function merge_text_nodes(text) {
	if (text.nodeValue.length < 65536) return;
	let next = text.nextSibling;
	while (next !== null && next.nodeType === 3) {
		next.remove();
		/** @type {string} */ text.nodeValue += next.nodeValue;
		next = text.nextSibling;
	}
}
/**
* @param {unknown} error
*/
function handle_error(error) {
	var effect = active_effect;
	if (effect === null) {
		/** @type {Derived} */ active_reaction.f |= ERROR_VALUE;
		return error;
	}
	if ((effect.f & 32768) === 0 && (effect.f & 4) === 0) throw error;
	invoke_error_boundary(error, effect);
}
/**
* @param {unknown} error
* @param {Effect | null} effect
*/
function invoke_error_boundary(error, effect) {
	if (error === HYDRATION_ERROR) throw error;
	if (effect !== null && (effect.f & 16384) !== 0) return;
	while (effect !== null) {
		if ((effect.f & 128) !== 0 && (effect.f & 33570816) === 0) {
			if ((effect.f & 32768) === 0) throw error;
			try {
				/** @type {Boundary} */ effect.b.error(error);
				return;
			} catch (e) {
				error = e;
			}
		}
		effect = effect.parent;
	}
	throw error;
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/reactivity/effects.js
/** @import { Blocker, ComponentContext, ComponentContextLegacy, Derived, Effect, TemplateNode, TransitionManager } from '#client' */
/**
* @param {'$effect' | '$effect.pre' | '$inspect'} rune
*/
function validate_effect(rune) {
	if (active_effect === null) {
		if (active_reaction === null) effect_orphan(rune);
		effect_in_unowned_derived();
	}
	if (is_destroying_effect) effect_in_teardown(rune);
}
/**
* @param {Effect} effect
* @param {Effect} parent_effect
*/
function push_effect(effect, parent_effect) {
	var parent_last = parent_effect.last;
	if (parent_last === null) parent_effect.last = parent_effect.first = effect;
	else {
		parent_last.next = effect;
		effect.prev = parent_last;
		parent_effect.last = effect;
	}
}
/**
* @param {number} type
* @param {null | (() => void | (() => void))} fn
* @returns {Effect}
*/
function create_effect(type, fn) {
	var parent = active_effect;
	if (parent !== null && (parent.f & 8192) !== 0) type |= INERT;
	/** @type {Effect} */
	var effect = {
		ctx: component_context,
		deps: null,
		nodes: null,
		f: type | DIRTY | 512,
		first: null,
		fn,
		last: null,
		next: null,
		parent,
		b: parent && parent.b,
		prev: null,
		teardown: null,
		wv: 0,
		ac: null
	};
	current_batch?.register_created_effect(effect);
	/** @type {Effect | null} */
	var e = effect;
	if ((type & 4) !== 0) {
		if (collected_effects !== null) collected_effects.push(effect);
		else Batch.ensure().schedule(effect);
	} else if (fn !== null) {
		try {
			update_effect(effect);
		} catch (e) {
			destroy_effect(effect);
			throw e;
		}
		if (e.deps === null && e.teardown === null && e.nodes === null && e.first === e.last && (e.f & 524288) === 0) {
			e = e.first;
			if ((type & 16) !== 0 && (type & 65536) !== 0 && e !== null) e.f |= EFFECT_TRANSPARENT;
		}
	}
	if (e !== null) {
		e.parent = parent;
		if (parent !== null) push_effect(e, parent);
		if (active_reaction !== null && (active_reaction.f & 2) !== 0 && (type & 64) === 0) {
			var derived = active_reaction;
			(derived.effects ??= []).push(e);
		}
	}
	return effect;
}
/**
* Internal representation of `$effect.tracking()`
* @returns {boolean}
*/
function effect_tracking() {
	return active_reaction !== null && !untracking;
}
/**
* @param {() => void} fn
*/
function teardown(fn) {
	const effect = create_effect(8, null);
	set_signal_status(effect, CLEAN);
	effect.teardown = fn;
	return effect;
}
/**
* Internal representation of `$effect(...)`
* @param {() => void | (() => void)} fn
*/
function user_effect(fn) {
	validate_effect("$effect");
	var flags = active_effect.f;
	if (!active_reaction && (flags & 32) !== 0 && component_context !== null && !component_context.i) {
		var context = component_context;
		(context.e ??= []).push(fn);
	} else return create_user_effect(fn);
}
/**
* @param {() => void | (() => void)} fn
*/
function create_user_effect(fn) {
	return create_effect(4 | USER_EFFECT, fn);
}
/**
* Internal representation of `$effect.pre(...)`
* @param {() => void | (() => void)} fn
* @returns {Effect}
*/
function user_pre_effect(fn) {
	validate_effect("$effect.pre");
	return create_effect(8 | USER_EFFECT, fn);
}
/**
* An effect root whose children can transition out
* @param {() => void} fn
* @returns {(options?: { outro?: boolean }) => Promise<void>}
*/
function component_root(fn) {
	Batch.ensure();
	const effect = create_effect(64 | EFFECT_PRESERVED, fn);
	return (options = {}) => {
		return new Promise((fulfil) => {
			if (options.outro) pause_effect(effect, () => {
				destroy_effect(effect);
				fulfil(void 0);
			});
			else {
				destroy_effect(effect);
				fulfil(void 0);
			}
		});
	};
}
/**
* @param {() => void | (() => void)} fn
* @returns {Effect}
*/
function effect(fn) {
	return create_effect(4, fn);
}
/**
* @param {() => void | (() => void)} fn
* @returns {Effect}
*/
function async_effect(fn) {
	return create_effect(ASYNC | EFFECT_PRESERVED, fn);
}
/**
* @param {() => void | (() => void)} fn
* @returns {Effect}
*/
function render_effect(fn, flags = 0) {
	return create_effect(8 | flags, fn);
}
/**
* @param {(...expressions: any) => void | (() => void)} fn
* @param {Array<() => any>} sync
* @param {Array<() => Promise<any>>} async
* @param {Blocker[]} blockers
*/
function template_effect(fn, sync = [], async = [], blockers = []) {
	flatten(blockers, sync, async, (values) => {
		create_effect(8, () => {
			fn(...values.map(get));
		});
	});
}
/**
* @param {(() => void)} fn
* @param {number} flags
*/
function block(fn, flags = 0) {
	return create_effect(16 | flags, fn);
}
/**
* @param {(() => void)} fn
* @param {number} flags
*/
function managed(fn, flags = 0) {
	return create_effect(MANAGED_EFFECT | flags, fn);
}
/**
* @param {(() => void)} fn
*/
function branch(fn) {
	return create_effect(32 | EFFECT_PRESERVED, fn);
}
/**
* @param {Effect} effect
*/
function execute_effect_teardown(effect) {
	var teardown = effect.teardown;
	if (teardown !== null) {
		const previously_destroying_effect = is_destroying_effect;
		const previous_reaction = active_reaction;
		set_is_destroying_effect(true);
		set_active_reaction(null);
		try {
			teardown.call(null);
		} catch (error) {
			invoke_error_boundary(error, effect.parent);
		} finally {
			set_is_destroying_effect(previously_destroying_effect);
			set_active_reaction(previous_reaction);
		}
	}
}
/**
* @param {Effect} signal
* @param {boolean} remove_dom
* @returns {void}
*/
function destroy_effect_children(signal, remove_dom = false) {
	var effect = signal.first;
	signal.first = signal.last = null;
	while (effect !== null) {
		const controller = effect.ac;
		if (controller !== null) without_reactive_context(() => {
			controller.abort(STALE_REACTION);
		});
		var next = effect.next;
		if ((effect.f & 64) !== 0) effect.parent = null;
		else destroy_effect(effect, remove_dom);
		effect = next;
	}
}
/**
* @param {Effect} signal
* @returns {void}
*/
function destroy_block_effect_children(signal) {
	var effect = signal.first;
	while (effect !== null) {
		var next = effect.next;
		if ((effect.f & 32) === 0) destroy_effect(effect);
		effect = next;
	}
}
/**
* @param {Effect} effect
* @param {boolean} [remove_dom]
* @returns {void}
*/
function destroy_effect(effect, remove_dom = true) {
	var removed = false;
	if ((remove_dom || (effect.f & 262144) !== 0) && effect.nodes !== null && effect.nodes.end !== null) {
		remove_effect_dom(effect.nodes.start, effect.nodes.end);
		removed = true;
	}
	effect.f |= DESTROYING;
	destroy_effect_children(effect, remove_dom && !removed);
	remove_reactions(effect, 0);
	var transitions = effect.nodes && effect.nodes.t;
	if (transitions !== null) for (const transition of transitions) transition.stop();
	execute_effect_teardown(effect);
	effect.f ^= DESTROYING;
	effect.f |= DESTROYED;
	var parent = effect.parent;
	if (parent !== null && parent.first !== null) unlink_effect(effect);
	effect.next = effect.prev = effect.teardown = effect.ctx = effect.deps = effect.fn = effect.nodes = effect.ac = effect.b = null;
}
/**
*
* @param {TemplateNode | null} node
* @param {TemplateNode} end
*/
function remove_effect_dom(node, end) {
	while (node !== null) {
		/** @type {TemplateNode | null} */
		var next = node === end ? null : /* @__PURE__ */ get_next_sibling(node);
		node.remove();
		node = next;
	}
}
/**
* Detach an effect from the effect tree, freeing up memory and
* reducing the amount of work that happens on subsequent traversals
* @param {Effect} effect
*/
function unlink_effect(effect) {
	var parent = effect.parent;
	var prev = effect.prev;
	var next = effect.next;
	if (prev !== null) prev.next = next;
	if (next !== null) next.prev = prev;
	if (parent !== null) {
		if (parent.first === effect) parent.first = next;
		if (parent.last === effect) parent.last = prev;
	}
}
/**
* When a block effect is removed, we don't immediately destroy it or yank it
* out of the DOM, because it might have transitions. Instead, we 'pause' it.
* It stays around (in memory, and in the DOM) until outro transitions have
* completed, and if the state change is reversed then we _resume_ it.
* A paused effect does not update, and the DOM subtree becomes inert.
* @param {Effect} effect
* @param {() => void} [callback]
* @param {boolean} [destroy]
*/
function pause_effect(effect, callback, destroy = true) {
	/** @type {TransitionManager[]} */
	var transitions = [];
	effect.f |= 256;
	pause_children(effect, transitions, true);
	var fn = () => {
		if (destroy) destroy_effect(effect);
		if (callback) callback();
	};
	var remaining = transitions.length;
	if (remaining > 0) {
		var check = () => --remaining || fn();
		for (var transition of transitions) transition.out(check);
	} else fn();
}
/**
* @param {Effect} effect
* @param {TransitionManager[]} transitions
* @param {boolean} local
*/
function pause_children(effect, transitions, local) {
	if ((effect.f & 8192) !== 0) return;
	effect.f ^= INERT;
	var t = effect.nodes && effect.nodes.t;
	if (t !== null) {
		for (const transition of t) if (transition.is_global || local) transitions.push(transition);
	}
	var child = effect.first;
	while (child !== null) {
		var sibling = child.next;
		if ((child.f & 64) === 0) {
			var transparent = (child.f & 65536) !== 0 || (child.f & 32) !== 0 && (effect.f & 16) !== 0;
			pause_children(child, transitions, transparent ? local : false);
		}
		child = sibling;
	}
}
/**
* The opposite of `pause_effect`. We call this if (for example)
* `x` becomes falsy then truthy: `{#if x}...{/if}`
* @param {Effect} effect
*/
function resume_effect(effect) {
	effect.f &= -257;
	resume_children(effect, true);
}
/**
* @param {Effect} effect
* @param {boolean} local
*/
function resume_children(effect, local) {
	if ((effect.f & 256) !== 0) return;
	if ((effect.f & 8192) === 0) return;
	effect.f ^= INERT;
	if ((effect.f & 1024) === 0) {
		set_signal_status(effect, DIRTY);
		Batch.ensure().schedule(effect);
	}
	var child = effect.first;
	while (child !== null) {
		var sibling = child.next;
		var transparent = (child.f & 65536) !== 0 || (child.f & 32) !== 0;
		resume_children(child, transparent ? local : false);
		child = sibling;
	}
	var t = effect.nodes && effect.nodes.t;
	if (t !== null) {
		for (const transition of t) if (transition.is_global || local) transition.in();
	}
}
/**
* @param {Effect} effect
* @param {DocumentFragment} fragment
*/
function move_effect(effect, fragment) {
	if (!effect.nodes) return;
	/** @type {TemplateNode | null} */
	var node = effect.nodes.start;
	var end = effect.nodes.end;
	while (node !== null) {
		/** @type {TemplateNode | null} */
		var next = node === end ? null : /* @__PURE__ */ get_next_sibling(node);
		fragment.append(node);
		node = next;
	}
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/legacy.js
/**
* @type {Set<Value> | null}
* @deprecated
*/
var captured_signals = null;
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/runtime.js
/** @import { Derived, Effect, Reaction, Source, Value } from '#client' */
var is_destroying_effect = false;
/** @param {boolean} value */
function set_is_destroying_effect(value) {
	is_destroying_effect = value;
}
/** @type {null | Reaction} */
var active_reaction = null;
var untracking = false;
/** @param {null | Reaction} reaction */
function set_active_reaction(reaction) {
	active_reaction = reaction;
}
/** @type {null | Effect} */
var active_effect = null;
/** @param {null | Effect} effect */
function set_active_effect(effect) {
	active_effect = effect;
}
/**
* When sources are created within a reaction, reading and writing
* them within that reaction should not cause a re-run
* @type {null | Set<Value>}
*/
var current_sources = null;
/** @param {Value} value */
function push_reaction_value(value) {
	if (active_reaction !== null && (!async_mode_flag && (active_reaction.f & 2097152) !== 0 || (active_reaction.f & 2) !== 0)) (current_sources ??= /* @__PURE__ */ new Set()).add(value);
}
/**
* The dependencies of the reaction that is currently being executed. In many cases,
* the dependencies are unchanged between runs, and so this will be `null` unless
* and until a new dependency is accessed — we track this via `skipped_deps`
* @type {null | Value[]}
*/
var new_deps = null;
var skipped_deps = 0;
/**
* Tracks writes that the effect it's executed in doesn't listen to yet,
* so that the dependency can be added to the effect later on if it then reads it
* @type {null | Value[]}
*/
var untracked_writes = null;
/** @param {null | Value[]} value */
function set_untracked_writes(value) {
	untracked_writes = value;
}
/**
* @type {number} Used by sources and deriveds for handling updates.
* Version starts from 1 so that unowned deriveds differentiate between a created effect and a run one for tracing
**/
var write_version = 1;
/** @type {number} Used to version each read of a source of derived to avoid duplicating dependencies inside a reaction */
var read_version = 0;
var update_version = read_version;
/** @param {number} value */
function set_update_version(value) {
	update_version = value;
}
function increment_write_version() {
	return ++write_version;
}
/**
* Determines whether a derived or effect is dirty.
* If it is MAYBE_DIRTY, will set the status to CLEAN
* @param {Reaction} reaction
* @returns {boolean}
*/
function is_dirty(reaction) {
	var flags = reaction.f;
	if ((flags & 2048) !== 0) return true;
	if ((flags & 4096) !== 0) {
		var dependencies = reaction.deps;
		var length = dependencies.length;
		for (var i = 0; i < length; i++) {
			var dependency = dependencies[i];
			if (is_dirty(dependency)) update_derived(dependency);
			if (dependency.wv > reaction.wv) return true;
		}
		if ((flags & 512) !== 0 && batch_values === null) set_signal_status(reaction, CLEAN);
	}
	return false;
}
/**
* @param {Value} signal
* @param {Effect} effect
* @param {boolean} [root]
*/
function schedule_possible_effect_self_invalidation(signal, effect, root = true) {
	var reactions = signal.reactions;
	if (reactions === null) return;
	if (!async_mode_flag && current_sources !== null && current_sources.has(signal)) return;
	for (var i = 0; i < reactions.length; i++) {
		var reaction = reactions[i];
		if ((reaction.f & 2) !== 0) schedule_possible_effect_self_invalidation(reaction, effect, false);
		else if (effect === reaction) {
			if (root) set_signal_status(reaction, DIRTY);
			else if ((reaction.f & 1024) !== 0) set_signal_status(reaction, MAYBE_DIRTY);
			schedule_effect(reaction);
		}
	}
}
/** @param {Reaction} reaction */
function update_reaction(reaction) {
	var previous_deps = new_deps;
	var previous_skipped_deps = skipped_deps;
	var previous_untracked_writes = untracked_writes;
	var previous_reaction = active_reaction;
	var previous_sources = current_sources;
	var previous_component_context = component_context;
	var previous_untracking = untracking;
	var previous_update_version = update_version;
	var flags = reaction.f;
	new_deps = null;
	skipped_deps = 0;
	untracked_writes = null;
	active_reaction = (flags & 96) === 0 ? reaction : null;
	current_sources = null;
	set_component_context(reaction.ctx);
	untracking = false;
	update_version = ++read_version;
	if (reaction.ac !== null) {
		without_reactive_context(() => {
			/** @type {AbortController} */ reaction.ac.abort(STALE_REACTION);
		});
		reaction.ac = null;
	}
	try {
		reaction.f |= REACTION_IS_UPDATING;
		var fn = reaction.fn;
		var result = fn();
		reaction.f |= REACTION_RAN;
		var deps = update_dependencies(reaction);
		if (is_runes() && untracked_writes !== null && !untracking && deps !== null && (reaction.f & 6146) === 0) for (var i = 0; i < untracked_writes.length; i++) schedule_possible_effect_self_invalidation(untracked_writes[i], reaction);
		if (previous_reaction !== null && previous_reaction !== reaction) {
			read_version++;
			if (previous_reaction.deps !== null) for (let i = 0; i < previous_skipped_deps; i += 1) previous_reaction.deps[i].rv = read_version;
			if (previous_deps !== null) for (const dep of previous_deps) dep.rv = read_version;
			if (untracked_writes !== null) {
				if (previous_untracked_writes === null) previous_untracked_writes = untracked_writes;
				else previous_untracked_writes.push(...untracked_writes);
			}
		}
		if ((reaction.f & 8388608) !== 0) reaction.f ^= ERROR_VALUE;
		return result;
	} catch (error) {
		update_dependencies(reaction);
		return handle_error(error);
	} finally {
		reaction.f ^= REACTION_IS_UPDATING;
		new_deps = previous_deps;
		skipped_deps = previous_skipped_deps;
		untracked_writes = previous_untracked_writes;
		active_reaction = previous_reaction;
		current_sources = previous_sources;
		set_component_context(previous_component_context);
		untracking = previous_untracking;
		update_version = previous_update_version;
	}
}
/**
* @param {Reaction} reaction
*/
function update_dependencies(reaction) {
	var deps = reaction.deps;
	var is_fork = current_batch?.is_fork;
	if (new_deps !== null) {
		var i;
		if (!is_fork) remove_reactions(reaction, skipped_deps);
		if (deps !== null && skipped_deps > 0) {
			deps.length = skipped_deps + new_deps.length;
			for (i = 0; i < new_deps.length; i++) deps[skipped_deps + i] = new_deps[i];
		} else reaction.deps = deps = new_deps;
		if (effect_tracking() && (reaction.f & 512) !== 0) for (i = skipped_deps; i < deps.length; i++) (deps[i].reactions ??= []).push(reaction);
	} else if (!is_fork && deps !== null && skipped_deps < deps.length) {
		remove_reactions(reaction, skipped_deps);
		deps.length = skipped_deps;
	}
	return deps;
}
/**
* @template V
* @param {Reaction} signal
* @param {Value<V>} dependency
* @returns {void}
*/
function remove_reaction(signal, dependency) {
	let reactions = dependency.reactions;
	if (reactions !== null) {
		var index = index_of.call(reactions, signal);
		if (index !== -1) {
			var new_length = reactions.length - 1;
			if (new_length === 0) reactions = dependency.reactions = null;
			else {
				reactions[index] = reactions[new_length];
				reactions.pop();
			}
		}
	}
	if (reactions === null && (dependency.f & 2) !== 0 && (new_deps === null || !includes.call(new_deps, dependency))) {
		var derived = dependency;
		if ((derived.f & 512) !== 0) derived.f ^= 512;
		if (derived.v !== UNINITIALIZED) update_derived_status(derived);
		if (derived.ac !== null) without_reactive_context(() => {
			/** @type {AbortController} */ derived.ac.abort(STALE_REACTION);
			derived.ac = null;
			set_signal_status(derived, DIRTY);
		});
		freeze_derived_effects(derived);
		remove_reactions(derived, 0);
	}
}
/**
* @param {Reaction} signal
* @param {number} start_index
* @returns {void}
*/
function remove_reactions(signal, start_index) {
	var dependencies = signal.deps;
	if (dependencies === null) return;
	for (var i = start_index; i < dependencies.length; i++) remove_reaction(signal, dependencies[i]);
}
/**
* @param {Effect} effect
* @returns {void}
*/
function update_effect(effect) {
	var flags = effect.f;
	if ((flags & 16384) !== 0) return;
	set_signal_status(effect, CLEAN);
	var previous_effect = active_effect;
	active_effect = effect;
	try {
		if ((flags & 16777232) !== 0) destroy_block_effect_children(effect);
		else destroy_effect_children(effect);
		execute_effect_teardown(effect);
		var teardown = update_reaction(effect);
		effect.teardown = typeof teardown === "function" ? teardown : null;
		effect.wv = write_version;
	} finally {
		active_effect = previous_effect;
	}
}
/**
* @template V
* @param {Value<V>} signal
* @returns {V}
*/
function get(signal) {
	var is_derived = (signal.f & 2) !== 0;
	captured_signals?.add(signal);
	if (active_reaction !== null && !untracking) {
		if (!(active_effect !== null && (active_effect.f & 16384) !== 0) && (current_sources === null || !current_sources.has(signal))) {
			var deps = active_reaction.deps;
			if ((active_reaction.f & 2097152) !== 0) {
				if (signal.rv < read_version) {
					signal.rv = read_version;
					if (new_deps === null && deps !== null && deps[skipped_deps] === signal) skipped_deps++;
					else if (new_deps === null) new_deps = [signal];
					else new_deps.push(signal);
				}
			} else {
				active_reaction.deps ??= [];
				if (!includes.call(active_reaction.deps, signal)) active_reaction.deps.push(signal);
				var reactions = signal.reactions;
				if (reactions === null) signal.reactions = [active_reaction];
				else if (!includes.call(reactions, active_reaction)) reactions.push(active_reaction);
			}
		}
	}
	if (is_destroying_effect && old_values.has(signal)) return old_values.get(signal);
	if (is_derived) {
		var derived = signal;
		if (is_destroying_effect) {
			var value = derived.v;
			if ((derived.f & 1024) === 0 && derived.reactions !== null || depends_on_old_values(derived)) value = execute_derived(derived);
			old_values.set(derived, value);
			return value;
		}
		var should_connect = (derived.f & 512) === 0 && !untracking && active_reaction !== null && (active_reaction.f & 512) !== 0;
		var is_new = (derived.f & REACTION_RAN) === 0;
		if (is_dirty(derived)) {
			if (should_connect) derived.f |= 512;
			update_derived(derived);
		}
		if (should_connect && !is_new) {
			unfreeze_derived_effects(derived);
			reconnect(derived);
		}
	}
	if (batch_values?.has(signal)) return batch_values.get(signal);
	if ((signal.f & 8388608) !== 0) throw signal.v;
	return signal.v;
}
/**
* (Re)connect a disconnected derived, so that it is notified
* of changes in `mark_reactions`
* @param {Derived} derived
*/
function reconnect(derived) {
	derived.f |= 512;
	if (derived.deps === null) return;
	for (const dep of derived.deps) {
		var reactions = dep.reactions;
		if (reactions === null) dep.reactions = [derived];
		else if (!includes.call(reactions, derived)) reactions.push(derived);
		if ((dep.f & 2) !== 0 && (dep.f & 512) === 0) {
			unfreeze_derived_effects(dep);
			reconnect(dep);
		}
	}
}
/** @param {Derived} derived */
function depends_on_old_values(derived) {
	if (derived.v === UNINITIALIZED) return true;
	if (derived.deps === null) return false;
	for (const dep of derived.deps) {
		if (old_values.has(dep)) return true;
		if ((dep.f & 2) !== 0 && depends_on_old_values(dep)) return true;
	}
	return false;
}
/**
* When used inside a [`$derived`](https://svelte.dev/docs/svelte/$derived) or [`$effect`](https://svelte.dev/docs/svelte/$effect),
* any state read inside `fn` will not be treated as a dependency.
*
* ```ts
* $effect(() => {
*   // this will run when `data` changes, but not when `time` changes
*   save(data, {
*     timestamp: untrack(() => time)
*   });
* });
* ```
* @template T
* @param {() => T} fn
* @returns {T}
*/
function untrack(fn) {
	var previous_untracking = untracking;
	try {
		untracking = true;
		return fn();
	} finally {
		untracking = previous_untracking;
	}
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/elements/events.js
/**
* Used on elements, as a map of event type -> event handler,
* and on events themselves to track which element handled an event
*/
var event_symbol = Symbol("events");
/** @type {Set<string>} */
var all_registered_events = /* @__PURE__ */ new Set();
/** @type {Set<(events: Array<string>) => void>} */
var root_event_handles = /* @__PURE__ */ new Set();
/**
* @param {string} event_name
* @param {EventTarget} dom
* @param {EventListener} [handler]
* @param {AddEventListenerOptions} [options]
*/
function create_event(event_name, dom, handler, options = {}) {
	/**
	* @this {EventTarget}
	*/
	function target_handler(event) {
		if (!options.capture) handle_event_propagation.call(dom, event);
		if (!event.cancelBubble) return without_reactive_context(() => {
			return handler?.call(this, event);
		});
	}
	if (event_name.startsWith("pointer") || event_name.startsWith("touch") || event_name === "wheel") {
		target_handler.__removed = false;
		queue_micro_task(() => {
			if (!target_handler.__removed) dom.addEventListener(event_name, target_handler, options);
		});
	} else dom.addEventListener(event_name, target_handler, options);
	return target_handler;
}
/**
* @param {string} event_name
* @param {Element} dom
* @param {EventListener} [handler]
* @param {boolean} [capture]
* @param {boolean} [passive]
* @returns {void}
*/
function event(event_name, dom, handler, capture, passive) {
	var options = {
		capture,
		passive
	};
	var target_handler = create_event(event_name, dom, handler, options);
	if (dom === document.body || dom === window || dom === document || dom instanceof HTMLMediaElement) teardown(() => {
		target_handler.__removed = true;
		dom.removeEventListener(event_name, target_handler, options);
	});
}
/**
* @param {string} event_name
* @param {Element} element
* @param {EventListener} [handler]
* @returns {void}
*/
function delegated(event_name, element, handler) {
	(element[event_symbol] ??= {})[event_name] = handler;
}
/**
* @param {Array<string>} events
* @returns {void}
*/
function delegate(events) {
	for (var i = 0; i < events.length; i++) all_registered_events.add(events[i]);
	for (var fn of root_event_handles) fn(events);
}
var last_propagated_event = null;
var last_propagated_event_clear_scheduled = false;
/**
* @this {EventTarget}
* @param {Event} event
* @returns {void}
*/
function handle_event_propagation(event) {
	var handler_element = this;
	var owner_document = handler_element.ownerDocument;
	var event_name = event.type;
	var path = event.composedPath?.() || [];
	var current_target = path[0] || event.target;
	last_propagated_event = event;
	if (!last_propagated_event_clear_scheduled) {
		last_propagated_event_clear_scheduled = true;
		setTimeout(() => {
			last_propagated_event_clear_scheduled = false;
			last_propagated_event = null;
		});
	}
	var path_idx = 0;
	var handled_at = last_propagated_event === event && event[event_symbol];
	if (handled_at) {
		var at_idx = path.indexOf(handled_at);
		if (at_idx !== -1 && (handler_element === document || handler_element === window)) {
			event[event_symbol] = handler_element;
			return;
		}
		var handler_idx = path.indexOf(handler_element);
		if (handler_idx === -1) return;
		if (at_idx <= handler_idx) path_idx = at_idx;
	}
	current_target = path[path_idx] || event.target;
	if (current_target === handler_element) return;
	define_property(event, "currentTarget", {
		configurable: true,
		get() {
			return current_target || owner_document;
		}
	});
	var previous_reaction = active_reaction;
	var previous_effect = active_effect;
	set_active_reaction(null);
	set_active_effect(null);
	try {
		/**
		* @type {unknown}
		*/
		var throw_error;
		/**
		* @type {unknown[]}
		*/
		var other_errors = [];
		while (current_target !== null) {
			if (current_target === handler_element) break;
			try {
				var delegated = current_target[event_symbol]?.[event_name];
				if (delegated != null && (!current_target.disabled || event.target === current_target)) delegated.call(current_target, event);
			} catch (error) {
				if (throw_error) other_errors.push(error);
				else throw_error = error;
			}
			if (event.cancelBubble) break;
			path_idx++;
			current_target = path_idx < path.length ? path[path_idx] : null;
		}
		if (throw_error) {
			for (let error of other_errors) queueMicrotask(() => {
				throw error;
			});
			throw throw_error;
		}
	} finally {
		event[event_symbol] = handler_element;
		delete event.currentTarget;
		set_active_reaction(previous_reaction);
		set_active_effect(previous_effect);
	}
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/reconciler.js
var policy = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { 
/** @param {string} html */
createHTML: (html) => {
	return html;
} });
/** @param {string} html */
function create_trusted_html(html) {
	return policy?.createHTML(html) ?? html;
}
/**
* @param {string} html
*/
function create_fragment_from_html(html) {
	var elem = create_element("template");
	elem.innerHTML = create_trusted_html(html.replaceAll("<!>", "<!---->"));
	return elem.content;
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/template.js
/** @import { Effect, EffectNodes, TemplateNode } from '#client' */
/** @import { TemplateStructure } from './types' */
/**
* @param {TemplateNode} start
* @param {TemplateNode | null} end
*/
function assign_nodes(start, end) {
	var effect = active_effect;
	if (effect.nodes === null) effect.nodes = {
		start,
		end,
		a: null,
		t: null
	};
}
/**
* @param {string} content
* @param {number} flags
* @returns {() => Node | Node[]}
*/
/*#__NO_SIDE_EFFECTS__*/
function from_html(content, flags) {
	var is_fragment = (flags & 1) !== 0;
	var use_import_node = (flags & 2) !== 0;
	/** @type {Node} */
	var node;
	/**
	* Whether or not the first item is a text/element node. If not, we need to
	* create an additional comment node to act as `effect.nodes.start`
	*/
	var has_start = !content.startsWith("<!>");
	return () => {
		if (hydrating) {
			assign_nodes(hydrate_node, null);
			return hydrate_node;
		}
		if (node === void 0) {
			node = create_fragment_from_html(has_start ? content : "<!>" + content);
			if (!is_fragment) node = /* @__PURE__ */ get_first_child(node);
		}
		var clone = use_import_node || is_firefox ? document.importNode(node, true) : node.cloneNode(true);
		if (is_fragment) {
			var start = /* @__PURE__ */ get_first_child(clone);
			var end = clone.lastChild;
			assign_nodes(start, end);
		} else assign_nodes(clone, clone);
		return clone;
	};
}
/**
* Don't mark this as side-effect-free, hydration needs to walk all nodes
* @param {any} value
*/
function text$3(value = "") {
	if (!hydrating) {
		var t = create_text(value + "");
		assign_nodes(t, t);
		return t;
	}
	var node = hydrate_node;
	if (node.nodeType !== 3) {
		node.before(node = create_text());
		set_hydrate_node(node);
	} else merge_text_nodes(node);
	assign_nodes(node, node);
	return node;
}
/**
* @returns {TemplateNode | DocumentFragment}
*/
function comment$1() {
	if (hydrating) {
		assign_nodes(hydrate_node, null);
		return hydrate_node;
	}
	var frag = document.createDocumentFragment();
	var start = document.createComment("");
	var anchor = create_text();
	frag.append(start, anchor);
	assign_nodes(start, anchor);
	return frag;
}
/**
* Assign the created (or in hydration mode, traversed) dom elements to the current block
* and insert the elements into the dom (in client mode).
* @param {Text | Comment | Element} anchor
* @param {DocumentFragment | Element} dom
*/
function append(anchor, dom) {
	if (hydrating) {
		var effect = active_effect;
		if ((effect.f & 32768) === 0 || effect.nodes.end === null) effect.nodes.end = hydrate_node;
		hydrate_next();
		return;
	}
	if (anchor === null) return;
	anchor.before(dom);
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/utils.js
/**
* @param {string} name
*/
function is_capture_event(name) {
	return name.endsWith("capture") && name !== "gotpointercapture" && name !== "lostpointercapture";
}
/** List of Element events that will be delegated */
var DELEGATED_EVENTS = [
	"beforeinput",
	"click",
	"change",
	"dblclick",
	"contextmenu",
	"focusin",
	"focusout",
	"input",
	"keydown",
	"keyup",
	"mousedown",
	"mousemove",
	"mouseout",
	"mouseover",
	"mouseup",
	"pointerdown",
	"pointermove",
	"pointerout",
	"pointerover",
	"pointerup",
	"touchend",
	"touchmove",
	"touchstart"
];
/**
* Returns `true` if `event_name` is a delegated event
* @param {string} event_name
*/
function can_delegate_event(event_name) {
	return DELEGATED_EVENTS.includes(event_name);
}
/**
* Attributes that are boolean, i.e. they are present or not present.
*/
var DOM_BOOLEAN_ATTRIBUTES = [
	"allowfullscreen",
	"async",
	"autofocus",
	"autoplay",
	"checked",
	"controls",
	"default",
	"disabled",
	"formnovalidate",
	"indeterminate",
	"inert",
	"ismap",
	"loop",
	"multiple",
	"muted",
	"nomodule",
	"novalidate",
	"open",
	"playsinline",
	"readonly",
	"required",
	"reversed",
	"seamless",
	"selected",
	"webkitdirectory",
	"defer",
	"disablepictureinpicture",
	"disableremoteplayback"
];
/**
* @type {Record<string, string>}
* List of attribute names that should be aliased to their property names
* because they behave differently between setting them as an attribute and
* setting them as a property.
*/
var ATTRIBUTE_ALIASES = {
	formnovalidate: "formNoValidate",
	ismap: "isMap",
	nomodule: "noModule",
	playsinline: "playsInline",
	readonly: "readOnly",
	defaultvalue: "defaultValue",
	defaultchecked: "defaultChecked",
	srcobject: "srcObject",
	novalidate: "noValidate",
	allowfullscreen: "allowFullscreen",
	disablepictureinpicture: "disablePictureInPicture",
	disableremoteplayback: "disableRemotePlayback"
};
/**
* @param {string} name
*/
function normalize_attribute(name) {
	name = name.toLowerCase();
	return ATTRIBUTE_ALIASES[name] ?? name;
}
[...DOM_BOOLEAN_ATTRIBUTES];
/**
* Subset of delegated events which should be passive by default.
* These two are already passive via browser defaults on window, document and body.
* But since
* - we're delegating them
* - they happen often
* - they apply to mobile which is generally less performant
* we're marking them as passive by default for other elements, too.
*/
var PASSIVE_EVENTS = ["touchstart", "touchmove"];
/**
* Returns `true` if `name` is a passive event
* @param {string} name
*/
function is_passive_event(name) {
	return PASSIVE_EVENTS.includes(name);
}
/** List of elements that require raw contents and should not have SSR comments put in them */
var RAW_TEXT_ELEMENTS = [
	"textarea",
	"script",
	"style",
	"title"
];
/** @param {string} name */
function is_raw_text_element(name) {
	return RAW_TEXT_ELEMENTS.includes(name);
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/reactivity/create-subscriber.js
/**
* Returns a `subscribe` function that integrates external event-based systems with Svelte's reactivity.
* It's particularly useful for integrating with web APIs like `MediaQuery`, `IntersectionObserver`, or `WebSocket`.
*
* If `subscribe` is called inside an effect (including indirectly, for example inside a getter),
* the `start` callback will be called with an `update` function. Whenever `update` is called, the effect re-runs.
*
* If `start` returns a cleanup function, it will be called when the effect is destroyed.
*
* If `subscribe` is called in multiple effects, `start` will only be called once as long as the effects
* are active, and the returned teardown function will only be called when all effects are destroyed.
*
* It's best understood with an example. Here's an implementation of [`MediaQuery`](https://svelte.dev/docs/svelte/svelte-reactivity#MediaQuery):
*
* ```js
* import { createSubscriber } from 'svelte/reactivity';
* import { on } from 'svelte/events';
*
* export class MediaQuery {
* 	#query;
* 	#subscribe;
*
* 	constructor(query) {
* 		this.#query = window.matchMedia(`(${query})`);
*
* 		this.#subscribe = createSubscriber((update) => {
* 			// when the `change` event occurs, re-run any effects that read `this.current`
* 			const off = on(this.#query, 'change', update);
*
* 			// stop listening when all the effects are destroyed
* 			return () => off();
* 		});
* 	}
*
* 	get current() {
* 		// This makes the getter reactive, if read in an effect
* 		this.#subscribe();
*
* 		// Return the current state of the query, whether or not we're in an effect
* 		return this.#query.matches;
* 	}
* }
* ```
* @param {(update: () => void) => (() => void) | void} start
* @since 5.7.0
*/
function createSubscriber(start) {
	let subscribers = 0;
	let version = source(0);
	/** @type {(() => void) | void} */
	let stop;
	return () => {
		if (effect_tracking()) {
			get(version);
			render_effect(() => {
				if (subscribers === 0) stop = untrack(() => start(() => increment(version)));
				subscribers += 1;
				return () => {
					queue_micro_task(() => {
						subscribers -= 1;
						if (subscribers === 0) {
							stop?.();
							stop = void 0;
							increment(version);
						}
					});
				};
			});
		}
	};
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/blocks/boundary.js
/** @import { Effect, Source, TemplateNode, } from '#client' */
/**
* @typedef {{
* 	 onerror?: ((error: unknown, reset: () => void) => void) | null;
*   failed?: ((anchor: Node, error: () => unknown, reset: () => () => void) => void) | null;
*   pending?: ((anchor: Node) => void) | null;
* }} BoundaryProps
*/
var flags = EFFECT_TRANSPARENT | EFFECT_PRESERVED;
/**
* @param {TemplateNode} node
* @param {BoundaryProps} props
* @param {((anchor: Node) => void)} children
* @param {((error: unknown) => unknown) | undefined} [transform_error]
* @returns {void}
*/
function boundary(node, props, children, transform_error) {
	new Boundary(node, props, children, transform_error);
}
var Boundary = class {
	/** @type {Boundary | null} */
	parent;
	is_pending = false;
	/**
	* API-level transformError transform function. Transforms errors before they reach the `failed` snippet.
	* Inherited from parent boundary, or defaults to identity.
	* @type {(error: unknown) => unknown}
	*/
	transform_error;
	/** @type {TemplateNode} */
	#anchor;
	/** @type {TemplateNode | null} */
	#hydrate_open = hydrating ? hydrate_node : null;
	/** @type {BoundaryProps} */
	#props;
	/** @type {((anchor: Node) => void)} */
	#children;
	/** @type {Effect} */
	#effect;
	/** @type {Effect | null} */
	#main_effect = null;
	/** @type {Effect | null} */
	#pending_effect = null;
	/** @type {Effect | null} */
	#failed_effect = null;
	/** @type {DocumentFragment | null} */
	#offscreen_fragment = null;
	#local_pending_count = 0;
	#pending_count = 0;
	#pending_count_update_queued = false;
	/** @type {Map<Effect, number>} */
	#dirty_reactions = /* @__PURE__ */ new Map();
	/**
	* A source containing the number of pending async deriveds/expressions.
	* Only created if `$effect.pending()` is used inside the boundary,
	* otherwise updating the source results in needless `Batch.ensure()`
	* calls followed by no-op flushes
	* @type {Source<number> | null}
	*/
	#effect_pending = null;
	#effect_pending_subscriber = createSubscriber(() => {
		this.#effect_pending = source(this.#local_pending_count);
		return () => {
			this.#effect_pending = null;
		};
	});
	/**
	* @param {TemplateNode} node
	* @param {BoundaryProps} props
	* @param {((anchor: Node) => void)} children
	* @param {((error: unknown) => unknown) | undefined} [transform_error]
	*/
	constructor(node, props, children, transform_error) {
		this.#anchor = node;
		this.#props = props;
		this.#children = (anchor) => {
			var effect = active_effect;
			effect.b = this;
			effect.f |= 128;
			children(anchor);
		};
		this.parent = active_effect.b;
		this.transform_error = transform_error ?? this.parent?.transform_error ?? ((e) => e);
		this.#effect = block(() => {
			if (hydrating) {
				const comment_data = read_hydration_instruction(this.#hydrate_open);
				hydrate_next();
				const server_rendered_pending = comment_data === "[!";
				if (comment_data.startsWith("[?")) {
					const serialized_error = JSON.parse(comment_data.slice(2));
					this.#hydrate_failed_content(serialized_error);
				} else if (server_rendered_pending) this.#hydrate_pending_content();
				else this.#hydrate_resolved_content();
			} else this.#render();
		}, flags);
		if (hydrating) this.#anchor = hydrate_node;
	}
	#hydrate_resolved_content() {
		try {
			this.#main_effect = branch(() => this.#children(this.#anchor));
		} catch (error) {
			this.error(error);
		}
	}
	/**
	* @param {unknown} error The deserialized error from the server's hydration comment
	*/
	#hydrate_failed_content(error) {
		const failed = this.#props.failed;
		const { reset, invoke_onerror } = this.#create_reset(error);
		queue_micro_task(invoke_onerror);
		if (!failed) return;
		this.#failed_effect = branch(() => {
			failed(this.#anchor, () => error, () => reset);
		});
	}
	/**
	* Creates the `reset` function for a failed boundary, along with a function
	* that invokes `onerror` with it (if provided)
	* @param {unknown} error
	* @returns {{ reset: () => void, invoke_onerror: () => void }}
	*/
	#create_reset(error) {
		var did_reset = false;
		var calling_on_error = false;
		const reset = () => {
			if (this.#is_destroyed()) return;
			if (did_reset) {
				svelte_boundary_reset_noop();
				return;
			}
			did_reset = true;
			if (calling_on_error) svelte_boundary_reset_onerror();
			if (this.#failed_effect !== null) pause_effect(this.#failed_effect, () => {
				this.#failed_effect = null;
			});
			this.#run(() => {
				this.#render();
			});
		};
		const invoke_onerror = () => {
			if (this.#is_destroyed()) return;
			try {
				calling_on_error = true;
				this.#props.onerror?.(error, reset);
				calling_on_error = false;
			} catch (err) {
				invoke_error_boundary(err, this.#effect && this.#effect.parent);
			}
		};
		return {
			reset,
			invoke_onerror
		};
	}
	#is_destroyed() {
		return (this.#effect.f & (DESTROYED | DESTROYING)) !== 0;
	}
	#hydrate_pending_content() {
		const pending = this.#props.pending;
		if (!pending) return;
		this.is_pending = true;
		this.#pending_effect = branch(() => pending(this.#anchor));
		queue_micro_task(() => {
			if (this.#is_destroyed()) return;
			var fragment = this.#offscreen_fragment = document.createDocumentFragment();
			var anchor = create_text();
			var handled = false;
			fragment.append(anchor);
			this.#main_effect = this.#run(() => {
				try {
					return branch(() => this.#children(anchor));
				} catch (error) {
					try {
						this.error(error);
						handled = true;
					} catch (error) {
						invoke_error_boundary(error, this.#effect.parent);
					}
					return null;
				}
			});
			if (this.#main_effect === null) {
				this.#offscreen_fragment = null;
				if (handled) this.#resolve(current_batch);
				return;
			}
			if (this.#pending_count === 0) {
				this.#anchor.before(fragment);
				this.#offscreen_fragment = null;
				pause_effect(this.#pending_effect, () => {
					this.#pending_effect = null;
				});
				this.#resolve(current_batch);
			}
		});
	}
	#render() {
		try {
			this.is_pending = this.has_pending_snippet();
			this.#pending_count = 0;
			this.#local_pending_count = 0;
			this.#main_effect = branch(() => {
				this.#children(this.#anchor);
			});
			if (this.#pending_count > 0) {
				var fragment = this.#offscreen_fragment = document.createDocumentFragment();
				move_effect(this.#main_effect, fragment);
				const pending = this.#props.pending;
				this.#pending_effect = branch(() => pending(this.#anchor));
			} else this.#resolve(current_batch);
		} catch (error) {
			this.error(error);
		}
	}
	/**
	* @param {Batch} batch
	*/
	#resolve(batch) {
		this.is_pending = false;
		batch.transfer_reactions(this.#dirty_reactions);
	}
	/**
	* Defer an effect inside a pending boundary until the boundary resolves
	* @param {Effect} effect
	*/
	defer_effect(effect) {
		defer_effect(effect, this.#dirty_reactions);
	}
	/**
	* Returns `false` if the effect exists inside a boundary whose pending snippet is shown
	* @returns {boolean}
	*/
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#props.pending;
	}
	/**
	* @template T
	* @param {() => T} fn
	*/
	#run(fn) {
		var previous_effect = active_effect;
		var previous_reaction = active_reaction;
		var previous_ctx = component_context;
		set_active_effect(this.#effect);
		set_active_reaction(this.#effect);
		set_component_context(this.#effect.ctx);
		try {
			Batch.ensure();
			return fn();
		} finally {
			set_active_effect(previous_effect);
			set_active_reaction(previous_reaction);
			set_component_context(previous_ctx);
		}
	}
	/**
	* Updates the pending count associated with the currently visible pending snippet,
	* if any, such that we can replace the snippet with content once work is done
	* @param {1 | -1} d
	* @param {Batch} batch
	*/
	#update_pending_count(d, batch) {
		if (!this.has_pending_snippet()) {
			if (this.parent) this.parent.#update_pending_count(d, batch);
			return;
		}
		this.#pending_count += d;
		if (this.#pending_count === 0) {
			this.#resolve(batch);
			if (this.#pending_effect) pause_effect(this.#pending_effect, () => {
				this.#pending_effect = null;
			});
			if (this.#offscreen_fragment) {
				this.#anchor.before(this.#offscreen_fragment);
				this.#offscreen_fragment = null;
			}
		}
	}
	/**
	* Update the source that powers `$effect.pending()` inside this boundary,
	* and controls when the current `pending` snippet (if any) is removed.
	* Do not call from inside the class
	* @param {1 | -1} d
	* @param {Batch} batch
	*/
	update_pending_count(d, batch) {
		this.#update_pending_count(d, batch);
		this.#local_pending_count += d;
		if (!this.#effect_pending || this.#pending_count_update_queued) return;
		this.#pending_count_update_queued = true;
		queue_micro_task(() => {
			this.#pending_count_update_queued = false;
			if (this.#effect_pending) internal_set(this.#effect_pending, this.#local_pending_count);
		});
	}
	get_effect_pending() {
		this.#effect_pending_subscriber();
		return get(this.#effect_pending);
	}
	/** @param {unknown} error */
	error(error) {
		if (error === HYDRATION_ERROR) throw error;
		if (!this.#props.onerror && !this.#props.failed) throw error;
		if (current_batch?.is_fork) {
			if (this.#main_effect) current_batch.skip_effect(this.#main_effect);
			if (this.#pending_effect) current_batch.skip_effect(this.#pending_effect);
			if (this.#failed_effect) current_batch.skip_effect(this.#failed_effect);
			current_batch.oncommit(() => {
				if (!this.#is_destroyed()) this.#handle_error(error);
			});
		} else this.#handle_error(error);
	}
	/**
	* @param {unknown} error
	*/
	#handle_error(error) {
		if (this.#main_effect) {
			destroy_effect(this.#main_effect);
			this.#main_effect = null;
		}
		if (this.#pending_effect) {
			destroy_effect(this.#pending_effect);
			this.#pending_effect = null;
		}
		if (this.#failed_effect) {
			destroy_effect(this.#failed_effect);
			this.#failed_effect = null;
		}
		if (hydrating) {
			set_hydrate_node(this.#hydrate_open);
			next$1();
			set_hydrate_node(skip_nodes());
		}
		let failed = this.#props.failed;
		/** @param {unknown} transformed_error */
		const handle_error_result = (transformed_error) => {
			if (this.#is_destroyed()) return;
			const { reset, invoke_onerror } = this.#create_reset(transformed_error);
			invoke_onerror();
			if (failed && !this.#is_destroyed()) this.#failed_effect = this.#run(() => {
				try {
					return branch(() => {
						var effect = active_effect;
						effect.b = this;
						effect.f |= 128;
						failed(this.#anchor, () => transformed_error, () => reset);
					});
				} catch (error) {
					invoke_error_boundary(error, this.#effect.parent);
					return null;
				}
			});
		};
		queue_micro_task(() => {
			if (this.#is_destroyed()) return;
			/** @type {unknown} */
			var result;
			try {
				result = this.transform_error(error);
			} catch (e) {
				invoke_error_boundary(e, this.#effect && this.#effect.parent);
				return;
			}
			if (result !== null && typeof result === "object" && typeof result.then === "function")
 /** @type {any} */ result.then(
				handle_error_result,
				/** @param {unknown} e */
				(e) => invoke_error_boundary(e, this.#effect && this.#effect.parent)
			);
			else handle_error_result(result);
		});
	}
};
/**
* @param {Element} text
* @param {string} value
* @returns {void}
*/
function set_text(text, value) {
	var str = value == null ? "" : typeof value === "object" ? `${value}` : value;
	if (str !== (text[TEXT_CACHE] ??= text.nodeValue)) {
		/** @type {any} */ text[TEXT_CACHE] = str;
		text.nodeValue = `${str}`;
	}
}
/**
* Mounts a component to the given target and returns the exports and potentially the props (if compiled with `accessors: true`) of the component.
* Transitions will play during the initial render unless the `intro` option is set to `false`.
*
* @template {Record<string, any>} Props
* @template {Record<string, any>} Exports
* @param {ComponentType<SvelteComponent<Props>> | Component<Props, Exports, any>} component
* @param {MountOptions<Props>} options
* @returns {Exports}
*/
function mount(component, options) {
	return _mount(component, options);
}
/** @type {Map<EventTarget, Map<string, number>>} */
var listeners = /* @__PURE__ */ new Map();
/**
* @template {Record<string, any>} Exports
* @param {ComponentType<SvelteComponent<any>> | Component<any>} Component
* @param {MountOptions} options
* @returns {Exports}
*/
function _mount(Component, { target, anchor, props = {}, events, context, intro = true, transformError }) {
	init_operations();
	/** @type {Exports} */
	var component = void 0;
	var unmount = component_root(() => {
		var anchor_node = anchor ?? target.appendChild(create_text());
		boundary(anchor_node, { pending: () => {} }, (anchor_node) => {
			push$1({});
			var ctx = component_context;
			if (context) ctx.c = context;
			if (events)
 /** @type {any} */ props.$$events = events;
			if (hydrating) assign_nodes(anchor_node, null);
			component = Component(anchor_node, props) || mark_as_component();
			if (hydrating) {
				/** @type {Effect & { nodes: EffectNodes }} */ active_effect.nodes.end = hydrate_node;
				if (hydrate_node === null || hydrate_node.nodeType !== 8 || hydrate_node.data !== "]") {
					hydration_mismatch();
					throw HYDRATION_ERROR;
				}
			}
			pop();
		}, transformError);
		/** @type {Set<string>} */
		var registered_events = /* @__PURE__ */ new Set();
		/** @param {Array<string>} events */
		var event_handle = (events) => {
			for (var i = 0; i < events.length; i++) {
				var event_name = events[i];
				if (registered_events.has(event_name)) continue;
				registered_events.add(event_name);
				var passive = is_passive_event(event_name);
				for (const node of [target, document]) {
					var counts = listeners.get(node);
					if (counts === void 0) {
						counts = /* @__PURE__ */ new Map();
						listeners.set(node, counts);
					}
					var count = counts.get(event_name);
					if (count === void 0) {
						node.addEventListener(event_name, handle_event_propagation, { passive });
						counts.set(event_name, 1);
					} else counts.set(event_name, count + 1);
				}
			}
		};
		event_handle(array_from(all_registered_events));
		root_event_handles.add(event_handle);
		return () => {
			for (var event_name of registered_events) for (const node of [target, document]) {
				var counts = listeners.get(node);
				var count = counts.get(event_name);
				if (--count == 0) {
					node.removeEventListener(event_name, handle_event_propagation);
					counts.delete(event_name);
					if (counts.size === 0) listeners.delete(node);
				} else counts.set(event_name, count);
			}
			root_event_handles.delete(event_handle);
			if (anchor_node !== anchor) anchor_node.parentNode?.removeChild(anchor_node);
		};
	});
	mounted_components.set(component, unmount);
	return component;
}
/**
* References of the components that were mounted or hydrated.
* Uses a `WeakMap` to avoid memory leaks.
*/
var mounted_components = /* @__PURE__ */ new WeakMap();
/**
* Unmounts a component that was previously mounted using `mount` or `hydrate`.
*
* Since 5.13.0, if `options.outro` is `true`, [transitions](https://svelte.dev/docs/svelte/transition) will play before the component is removed from the DOM.
*
* Returns a `Promise` that resolves after transitions have completed if `options.outro` is true, or immediately otherwise (prior to 5.13.0, returns `void`).
*
* ```js
* import { mount, unmount } from 'svelte';
* import App from './App.svelte';
*
* const app = mount(App, { target: document.body });
*
* // later...
* unmount(app, { outro: true });
* ```
* @param {Record<string, any>} component
* @param {{ outro?: boolean }} [options]
* @returns {Promise<void>}
*/
function unmount(component, options) {
	const fn = mounted_components.get(component);
	if (fn) {
		mounted_components.delete(component);
		return fn(options);
	}
	return Promise.resolve();
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/blocks/branches.js
/** @import { Effect, TemplateNode } from '#client' */
/**
* @typedef {{ effect: Effect, fragment: DocumentFragment }} Branch
*/
/**
* @template Key
*/
var BranchManager = class {
	/** @type {TemplateNode} */
	anchor;
	/** @type {Map<Batch, Key>} */
	#batches = /* @__PURE__ */ new Map();
	/**
	* Map of keys to effects that are currently rendered in the DOM.
	* These effects are visible and actively part of the document tree.
	* Example:
	* ```
	* {#if condition}
	* 	foo
	* {:else}
	* 	bar
	* {/if}
	* ```
	* Can result in the entries `true->Effect` and `false->Effect`
	* @type {Map<Key, Effect>}
	*/
	#onscreen = /* @__PURE__ */ new Map();
	/**
	* Similar to #onscreen with respect to the keys, but contains branches that are not yet
	* in the DOM, because their insertion is deferred.
	* @type {Map<Key, Branch>}
	*/
	#offscreen = /* @__PURE__ */ new Map();
	/**
	* Keys of effects that are currently outroing
	* @type {Set<Key>}
	*/
	#outroing = /* @__PURE__ */ new Set();
	/**
	* Whether to pause (i.e. outro) on change, or destroy immediately.
	* This is necessary for `<svelte:element>`
	*/
	#transition = true;
	/**
	* @param {TemplateNode} anchor
	* @param {boolean} transition
	*/
	constructor(anchor, transition = true) {
		this.anchor = anchor;
		this.#transition = transition;
	}
	/**
	* @param {Batch} batch
	*/
	#commit = (batch) => {
		if (!this.#batches.has(batch)) return;
		var key = this.#batches.get(batch);
		var onscreen = this.#onscreen.get(key);
		if (onscreen) {
			resume_effect(onscreen);
			this.#outroing.delete(key);
		} else {
			var offscreen = this.#offscreen.get(key);
			if (offscreen) {
				resume_effect(offscreen.effect);
				this.#onscreen.set(key, offscreen.effect);
				this.#offscreen.delete(key);
				/** @type {TemplateNode} */ offscreen.fragment.lastChild.remove();
				this.anchor.before(offscreen.fragment);
				onscreen = offscreen.effect;
			}
		}
		for (const [b, k] of this.#batches) {
			this.#batches.delete(b);
			if (b === batch) break;
			const offscreen = this.#offscreen.get(k);
			if (offscreen) {
				destroy_effect(offscreen.effect);
				this.#offscreen.delete(k);
			}
		}
		for (const [k, effect] of this.#onscreen) {
			if (k === key || this.#outroing.has(k)) continue;
			const on_destroy = () => {
				if (Array.from(this.#batches.values()).includes(k)) {
					var fragment = document.createDocumentFragment();
					move_effect(effect, fragment);
					fragment.append(create_text());
					this.#offscreen.set(k, {
						effect,
						fragment
					});
				} else destroy_effect(effect);
				this.#outroing.delete(k);
				this.#onscreen.delete(k);
			};
			if (this.#transition || !onscreen) {
				this.#outroing.add(k);
				pause_effect(effect, on_destroy, false);
			} else on_destroy();
		}
	};
	/**
	* @param {Batch} batch
	*/
	#discard = (batch) => {
		this.#batches.delete(batch);
		const keys = Array.from(this.#batches.values());
		for (const [k, branch] of this.#offscreen) if (!keys.includes(k)) {
			destroy_effect(branch.effect);
			this.#offscreen.delete(k);
		}
	};
	/**
	*
	* @param {any} key
	* @param {null | ((target: TemplateNode) => void)} fn
	*/
	ensure(key, fn) {
		var batch = current_batch;
		var defer = should_defer_append();
		if (fn && !this.#onscreen.has(key) && !this.#offscreen.has(key)) {
			if (defer) {
				var fragment = document.createDocumentFragment();
				var target = create_text();
				fragment.append(target);
				this.#offscreen.set(key, {
					effect: branch(() => fn(target)),
					fragment
				});
			} else this.#onscreen.set(key, branch(() => fn(this.anchor)));
		}
		this.#batches.set(batch, key);
		if (defer) {
			for (const [k, effect] of this.#onscreen) if (k === key) batch.unskip_effect(effect);
			else batch.skip_effect(effect);
			for (const [k, branch] of this.#offscreen) if (k === key) batch.unskip_effect(branch.effect);
			else batch.skip_effect(branch.effect);
			batch.oncommit(this.#commit);
			batch.ondiscard(this.#discard);
		} else {
			if (hydrating) this.anchor = hydrate_node;
			this.#commit(batch);
		}
	}
};
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/blocks/snippet.js
/** @import { Snippet } from 'svelte' */
/** @import { TemplateNode } from '#client' */
/** @import { Getters } from '#shared' */
/**
* @template {(node: TemplateNode, ...args: any[]) => void} SnippetFn
* @param {TemplateNode} node
* @param {() => SnippetFn | null | undefined} get_snippet
* @param {(() => any)[]} args
* @returns {void}
*/
function snippet(node, get_snippet, ...args) {
	var branches = new BranchManager(node);
	block(() => {
		const snippet = get_snippet() ?? null;
		branches.ensure(snippet, snippet && ((anchor) => snippet(anchor, ...args)));
	}, EFFECT_TRANSPARENT);
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/blocks/if.js
/** @import { TemplateNode } from '#client' */
/**
* @param {TemplateNode} node
* @param {(branch: (fn: (anchor: Node) => void, key?: number | false) => void) => void} fn
* @param {boolean} [elseif] True if this is an `{:else if ...}` block rather than an `{#if ...}`, as that affects which transitions are considered 'local'
* @returns {void}
*/
function if_block(node, fn, elseif = false) {
	/** @type {TemplateNode | undefined} */
	var marker;
	if (hydrating) {
		marker = hydrate_node;
		hydrate_next();
	}
	var branches = new BranchManager(node);
	var flags = elseif ? EFFECT_TRANSPARENT : 0;
	/**
	* @param {number | false} key
	* @param {null | ((anchor: Node) => void)} fn
	*/
	function update_branch(key, fn) {
		if (hydrating) {
			var data = read_hydration_instruction(marker);
			if (key !== parseInt(data.substring(1))) {
				var anchor = skip_nodes();
				set_hydrate_node(anchor);
				branches.anchor = anchor;
				set_hydrating(false);
				branches.ensure(key, fn);
				set_hydrating(true);
				return;
			}
		}
		branches.ensure(key, fn);
	}
	block(() => {
		var has_branch = false;
		fn((fn, key = 0) => {
			has_branch = true;
			update_branch(key, fn);
		});
		if (!has_branch) update_branch(-1, null);
	}, flags);
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/blocks/each.js
/** @import { EachItem, EachOutroGroup, EachState, Effect, EffectNodes, MaybeSource, TemplateNode, TransitionManager } from '#client' */
/** @import { Batch } from '../../reactivity/batch.js'; */
/**
* @param {any} _
* @param {number} i
*/
function index$1(_, i) {
	return i;
}
/**
* Pause multiple effects simultaneously, and coordinate their
* subsequent destruction. Used in each blocks
* @param {EachState} state
* @param {Effect[]} to_destroy
* @param {null | Node} controlled_anchor
*/
function pause_effects(state, to_destroy, controlled_anchor) {
	/** @type {TransitionManager[]} */
	var transitions = [];
	var length = to_destroy.length;
	/** @type {EachOutroGroup} */
	var group;
	var remaining = to_destroy.length;
	for (var i = 0; i < length; i++) {
		let effect = to_destroy[i];
		pause_effect(effect, () => {
			if (group) {
				group.pending.delete(effect);
				group.done.add(effect);
				if (group.pending.size === 0) {
					var groups = state.outrogroups;
					destroy_effects(state, array_from(group.done));
					groups.delete(group);
					if (groups.size === 0) state.outrogroups = null;
				}
			} else remaining -= 1;
		}, false);
	}
	if (remaining === 0) {
		var fast_path = transitions.length === 0 && controlled_anchor !== null && state.pending.size === 0;
		if (fast_path) {
			var anchor = controlled_anchor;
			var parent_node = anchor.parentNode;
			clear_text_content(parent_node);
			parent_node.append(anchor);
			state.items.clear();
		}
		destroy_effects(state, to_destroy, !fast_path);
	} else {
		group = {
			pending: new Set(to_destroy),
			done: /* @__PURE__ */ new Set()
		};
		(state.outrogroups ??= /* @__PURE__ */ new Set()).add(group);
	}
}
/**
* @param {EachState} state
* @param {Effect[]} to_destroy
* @param {boolean} remove_dom
*/
function destroy_effects(state, to_destroy, remove_dom = true) {
	/** @type {Set<Effect> | undefined} */
	var preserved_effects;
	if (state.pending.size > 0) {
		preserved_effects = /* @__PURE__ */ new Set();
		for (const keys of state.pending.values()) for (const key of keys) preserved_effects.add(
			/** @type {EachItem} */
			state.items.get(key).e
		);
	}
	for (var i = 0; i < to_destroy.length; i++) {
		var e = to_destroy[i];
		if (preserved_effects?.has(e)) {
			e.f |= EFFECT_OFFSCREEN;
			move_effect(e, document.createDocumentFragment());
		} else destroy_effect(to_destroy[i], remove_dom);
	}
}
/** @type {TemplateNode} */
var offscreen_anchor;
/**
* @template V
* @param {Element | Comment} node The next sibling node, or the parent node if this is a 'controlled' block
* @param {number} flags
* @param {() => V[]} get_collection
* @param {(value: V, index: number) => any} get_key
* @param {(anchor: Node, item: MaybeSource<V>, index: MaybeSource<number>) => void} render_fn
* @param {null | ((anchor: Node) => void)} fallback_fn
* @returns {void}
*/
function each(node, flags, get_collection, get_key, render_fn, fallback_fn = null) {
	var anchor = node;
	/** @type {Map<any, EachItem>} */
	var items = /* @__PURE__ */ new Map();
	if ((flags & 4) !== 0) {
		var parent_node = node;
		anchor = hydrating ? set_hydrate_node(/* @__PURE__ */ get_first_child(parent_node)) : parent_node.appendChild(create_text());
	}
	if (hydrating) hydrate_next();
	/** @type {Effect | null} */
	var fallback = null;
	var each_array = /* @__PURE__ */ derived_safe_equal(() => {
		var collection = get_collection();
		return is_array(collection) ? collection : collection == null ? [] : array_from(collection);
	});
	/** @type {Map<Batch, Set<any>>} */
	var pending = /* @__PURE__ */ new Map();
	var first_run = true;
	/**
	* @param {Batch} batch
	*/
	function commit(batch) {
		if ((state.effect.f & 16384) !== 0) return;
		state.pending.delete(batch);
		var array = get(each_array);
		state.fallback = fallback;
		reconcile(state, array, anchor, flags, get_key);
		if (fallback !== null) {
			if (array.length === 0) {
				if ((fallback.f & 33554432) === 0) resume_effect(fallback);
				else {
					fallback.f ^= EFFECT_OFFSCREEN;
					move(fallback, null, anchor);
				}
			} else pause_effect(fallback, () => {
				fallback = null;
			});
		}
	}
	/**
	* @param {Batch} batch
	*/
	function discard(batch) {
		state.pending.delete(batch);
	}
	/** @type {EachState} */
	var state = {
		effect: block(() => {
			var array = get(each_array);
			var length = array.length;
			/** `true` if there was a hydration mismatch. Needs to be a `let` or else it isn't treeshaken out */
			let mismatch = false;
			if (hydrating) {
				if (read_hydration_instruction(anchor) === "[!" !== (length === 0)) {
					anchor = skip_nodes();
					set_hydrate_node(anchor);
					set_hydrating(false);
					mismatch = true;
				}
			}
			var keys = /* @__PURE__ */ new Set();
			var batch = current_batch;
			var defer = should_defer_append();
			for (var index = 0; index < length; index += 1) {
				if (hydrating && hydrate_node.nodeType === 8 && hydrate_node.data === "]") {
					anchor = hydrate_node;
					mismatch = true;
					set_hydrating(false);
				}
				var value = array[index];
				var key = get_key(value, index);
				var item = first_run ? null : items.get(key);
				if (item) {
					if (item.v) internal_set(item.v, value);
					if (item.i) internal_set(item.i, index);
					if (defer) batch.unskip_effect(item.e);
				} else {
					item = create_item(items, first_run ? anchor : offscreen_anchor ??= create_text(), value, key, index, render_fn, flags, get_collection);
					if (!first_run) item.e.f |= EFFECT_OFFSCREEN;
					items.set(key, item);
				}
				keys.add(key);
			}
			if (length === 0 && fallback_fn && !fallback) {
				if (first_run) fallback = branch(() => fallback_fn(anchor));
				else {
					fallback = branch(() => fallback_fn(offscreen_anchor ??= create_text()));
					fallback.f |= EFFECT_OFFSCREEN;
				}
			}
			if (length > keys.size) each_key_duplicate("", "", "");
			if (hydrating && length > 0) set_hydrate_node(skip_nodes());
			if (!first_run) {
				pending.set(batch, keys);
				if (defer) {
					for (const [key, item] of items) if (!keys.has(key)) batch.skip_effect(item.e);
					batch.oncommit(commit);
					batch.ondiscard(discard);
				} else commit(batch);
			}
			if (mismatch) set_hydrating(true);
			get(each_array);
		}),
		flags,
		items,
		pending,
		outrogroups: null,
		fallback
	};
	first_run = false;
	if (hydrating) anchor = hydrate_node;
}
/**
* Skip past any non-branch effects (which could be created with `createSubscriber`, for example) to find the next branch effect
* @param {Effect | null} effect
* @returns {Effect | null}
*/
function skip_to_branch(effect) {
	while (effect !== null && (effect.f & 32) === 0) effect = effect.next;
	return effect;
}
/**
* Add, remove, or reorder items output by an each block as its input changes
* @template V
* @param {EachState} state
* @param {Array<V>} array
* @param {Element | Comment | Text} anchor
* @param {number} flags
* @param {(value: V, index: number) => any} get_key
* @returns {void}
*/
function reconcile(state, array, anchor, flags, get_key) {
	var is_animated = (flags & 8) !== 0;
	var length = array.length;
	var items = state.items;
	var current = skip_to_branch(state.effect.first);
	/** @type {undefined | Set<Effect>} */
	var seen;
	/** @type {Effect | null} */
	var prev = null;
	/** @type {undefined | Set<Effect>} */
	var to_animate;
	/** @type {Effect[]} */
	var matched = [];
	/** @type {Effect[]} */
	var stashed = [];
	/** @type {V} */
	var value;
	/** @type {any} */
	var key;
	/** @type {Effect | undefined} */
	var effect;
	/** @type {number} */
	var i;
	if (is_animated) for (i = 0; i < length; i += 1) {
		value = array[i];
		key = get_key(value, i);
		effect = items.get(key).e;
		if ((effect.f & 33554432) === 0) {
			effect.nodes?.a?.measure();
			(to_animate ??= /* @__PURE__ */ new Set()).add(effect);
		}
	}
	for (i = 0; i < length; i += 1) {
		value = array[i];
		key = get_key(value, i);
		effect = items.get(key).e;
		if (state.outrogroups !== null) for (const group of state.outrogroups) {
			group.pending.delete(effect);
			group.done.delete(effect);
		}
		if ((effect.f & 8192) !== 0) {
			resume_effect(effect);
			if (is_animated) {
				effect.nodes?.a?.unfix();
				(to_animate ??= /* @__PURE__ */ new Set()).delete(effect);
			}
		}
		if ((effect.f & 33554432) !== 0) {
			effect.f ^= EFFECT_OFFSCREEN;
			if (effect === current) move(effect, null, anchor);
			else {
				var next = prev ? prev.next : current;
				if (effect === state.effect.last) state.effect.last = effect.prev;
				if (effect.prev) effect.prev.next = effect.next;
				if (effect.next) effect.next.prev = effect.prev;
				link$2(state, prev, effect);
				link$2(state, effect, next);
				move(effect, next, anchor);
				prev = effect;
				matched = [];
				stashed = [];
				current = skip_to_branch(prev.next);
				continue;
			}
		}
		if (effect !== current) {
			if (seen !== void 0 && seen.has(effect)) {
				if (matched.length < stashed.length) {
					var start = stashed[0];
					var j;
					prev = start.prev;
					var a = matched[0];
					var b = matched[matched.length - 1];
					for (j = 0; j < matched.length; j += 1) move(matched[j], start, anchor);
					for (j = 0; j < stashed.length; j += 1) seen.delete(stashed[j]);
					link$2(state, a.prev, b.next);
					link$2(state, prev, a);
					link$2(state, b, start);
					current = start;
					prev = b;
					i -= 1;
					matched = [];
					stashed = [];
				} else {
					seen.delete(effect);
					move(effect, current, anchor);
					link$2(state, effect.prev, effect.next);
					link$2(state, effect, prev === null ? state.effect.first : prev.next);
					link$2(state, prev, effect);
					prev = effect;
				}
				continue;
			}
			matched = [];
			stashed = [];
			while (current !== null && current !== effect) {
				(seen ??= /* @__PURE__ */ new Set()).add(current);
				stashed.push(current);
				current = skip_to_branch(current.next);
			}
			if (current === null) continue;
		}
		if ((effect.f & 33554432) === 0) matched.push(effect);
		prev = effect;
		current = skip_to_branch(effect.next);
	}
	if (state.outrogroups !== null) {
		for (const group of state.outrogroups) if (group.pending.size === 0) {
			destroy_effects(state, array_from(group.done));
			state.outrogroups?.delete(group);
		}
		if (state.outrogroups.size === 0) state.outrogroups = null;
	}
	if (current !== null || seen !== void 0) {
		/** @type {Effect[]} */
		var to_destroy = [];
		if (seen !== void 0) {
			for (effect of seen) if ((effect.f & 8192) === 0) to_destroy.push(effect);
		}
		while (current !== null) {
			if ((current.f & 8192) === 0 && current !== state.fallback) to_destroy.push(current);
			current = skip_to_branch(current.next);
		}
		var destroy_length = to_destroy.length;
		if (destroy_length > 0) {
			var controlled_anchor = (flags & 4) !== 0 && length === 0 ? anchor : null;
			if (is_animated) {
				for (i = 0; i < destroy_length; i += 1) to_destroy[i].nodes?.a?.measure();
				for (i = 0; i < destroy_length; i += 1) to_destroy[i].nodes?.a?.fix();
			}
			pause_effects(state, to_destroy, controlled_anchor);
		}
	}
	if (is_animated) queue_micro_task(() => {
		if (to_animate === void 0) return;
		for (effect of to_animate) effect.nodes?.a?.apply();
	});
}
/**
* @template V
* @param {Map<any, EachItem>} items
* @param {Node} anchor
* @param {V} value
* @param {unknown} key
* @param {number} index
* @param {(anchor: Node, item: MaybeSource<V>, index: MaybeSource<number>, collection: () => V[]) => void} render_fn
* @param {number} flags
* @param {() => V[]} get_collection
* @returns {EachItem}
*/
function create_item(items, anchor, value, key, index, render_fn, flags, get_collection) {
	var v = (flags & 1) !== 0 ? (flags & 16) === 0 ? /* @__PURE__ */ mutable_source(value, false, false) : source(value) : null;
	var i = (flags & 2) !== 0 ? source(index) : null;
	return {
		v,
		i,
		e: branch(() => {
			render_fn(anchor, v ?? value, i ?? index, get_collection);
			return () => {
				items.delete(key);
			};
		})
	};
}
/**
* @param {Effect} effect
* @param {Effect | null} next
* @param {Text | Element | Comment} anchor
*/
function move(effect, next, anchor) {
	if (!effect.nodes) return;
	var node = effect.nodes.start;
	var end = effect.nodes.end;
	var dest = next && (next.f & 33554432) === 0 ? next.nodes.start : anchor;
	while (node !== null) {
		var next_node = /* @__PURE__ */ get_next_sibling(node);
		dest.before(node);
		if (node === end) return;
		node = next_node;
	}
}
/**
* @param {EachState} state
* @param {Effect | null} prev
* @param {Effect | null} next
*/
function link$2(state, prev, next) {
	if (prev === null) state.effect.first = next;
	else prev.next = next;
	if (next === null) state.effect.last = prev;
	else next.prev = prev;
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/blocks/svelte-component.js
/** @import { TemplateNode, Dom } from '#client' */
/**
* @template P
* @template {(props: P) => void} C
* @param {TemplateNode} node
* @param {() => C} get_component
* @param {(anchor: TemplateNode, component: C) => Dom | void} render_fn
* @returns {void}
*/
function component(node, get_component, render_fn) {
	/** @type {TemplateNode | undefined} */
	var hydration_start_node;
	if (hydrating) {
		hydration_start_node = hydrate_node;
		hydrate_next();
	}
	var branches = new BranchManager(node);
	block(() => {
		var component = get_component() ?? null;
		if (hydrating) {
			if (read_hydration_instruction(hydration_start_node) === "[" !== (component !== null)) {
				var anchor = skip_nodes();
				set_hydrate_node(anchor);
				branches.anchor = anchor;
				set_hydrating(false);
				branches.ensure(component, component && ((target) => render_fn(target, component)));
				set_hydrating(true);
				return;
			}
		}
		branches.ensure(component, component && ((target) => render_fn(target, component)));
	}, EFFECT_TRANSPARENT);
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/blocks/svelte-element.js
/** @import { Effect, EffectNodes, TemplateNode } from '#client' */
/**
* @param {Comment | Element} node
* @param {() => string} get_tag
* @param {boolean} is_svg
* @param {undefined | ((element: Element, anchor: Node | null) => void)} render_fn,
* @param {undefined | (() => string)} get_namespace
* @param {undefined | [number, number]} location
* @returns {void}
*/
function element$1(node, get_tag, is_svg, render_fn, get_namespace, location) {
	let was_hydrating = hydrating;
	if (hydrating) hydrate_next();
	/** @type {null | Element} */
	var element = null;
	if (hydrating && hydrate_node.nodeType === 1) {
		element = hydrate_node;
		hydrate_next();
	}
	var anchor = hydrating ? hydrate_node : node;
	var branches = new BranchManager(anchor, false);
	block(() => {
		const next_tag = get_tag() || null;
		var ns = get_namespace ? get_namespace() : is_svg || next_tag === "svg" ? NAMESPACE_SVG : void 0;
		if (next_tag === null) {
			branches.ensure(null, null);
			return;
		}
		branches.ensure(next_tag, (anchor) => {
			if (next_tag) {
				var is_hydrating = hydrating;
				element = hydrating ? element : create_element(next_tag, ns);
				assign_nodes(element, element);
				if (render_fn) {
					var tmp_comment = null;
					if (hydrating && is_raw_text_element(next_tag)) element.append(tmp_comment = document.createComment(""));
					var child_anchor = hydrating ? /* @__PURE__ */ get_first_child(element) : element.appendChild(create_text());
					if (hydrating) {
						if (child_anchor === null) set_hydrating(false);
						else set_hydrate_node(child_anchor);
					}
					render_fn(element, child_anchor);
					tmp_comment?.remove();
				}
				/** @type {Effect & { nodes: EffectNodes }} */ active_effect.nodes.end = element;
				if (!is_hydrating) anchor.before(element);
			}
			if (hydrating) set_hydrate_node(anchor);
		});
		return () => {
			if (next_tag);
		};
	}, EFFECT_TRANSPARENT);
	teardown(() => {});
	if (was_hydrating) {
		set_hydrating(true);
		set_hydrate_node(anchor);
	}
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/elements/attachments.js
/** @import { Effect } from '#client' */
/**
* @param {Element} node
* @param {() => (node: Element) => void} get_fn
*/
function attach(node, get_fn) {
	/** @type {false | undefined | ((node: Element) => void)} */
	var fn = void 0;
	/** @type {Effect | null} */
	var e;
	managed(() => {
		if (fn !== (fn = get_fn())) {
			if (e) {
				destroy_effect(e);
				e = null;
			}
			if (fn) e = branch(() => {
				effect(() => fn(node));
			});
		}
	});
}
// node_modules/.deno/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
function r(e) {
	var t, f, n = "";
	if ("string" == typeof e || "number" == typeof e) n += e;
	else if ("object" == typeof e) if (Array.isArray(e)) {
		var o = e.length;
		for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
	} else for (f in e) e[f] && (n && (n += " "), n += f);
	return n;
}
function clsx$1() {
	for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
	return n;
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/shared/attributes.js
/**
* Small wrapper around clsx to preserve Svelte's (weird) handling of falsy values.
* TODO Svelte 6 revisit this, and likely turn all falsy values into the empty string (what clsx also does)
* @param  {any} value
*/
function clsx(value) {
	if (typeof value === "object") return clsx$1(value);
	else return value ?? "";
}
var whitespace = [..." 	\n\r\f\xA0\v﻿"];
/**
* @param {any} value
* @param {string | null} [hash]
* @param {Record<string, boolean>} [directives]
* @returns {string | null}
*/
function to_class(value, hash, directives) {
	var classname = value == null ? "" : "" + value;
	if (hash) classname = classname ? classname + " " + hash : hash;
	if (directives) {
		for (var key of Object.keys(directives)) if (directives[key]) classname = classname ? classname + " " + key : key;
		else if (classname.length) {
			var len = key.length;
			var a = 0;
			while ((a = classname.indexOf(key, a)) >= 0) {
				var b = a + len;
				if ((a === 0 || whitespace.includes(classname[a - 1])) && (b === classname.length || whitespace.includes(classname[b]))) classname = (a === 0 ? "" : classname.substring(0, a)) + classname.substring(b + 1);
				else a = b;
			}
		}
	}
	return classname === "" ? null : classname;
}
/**
*
* @param {Record<string,any>} styles
* @param {boolean} important
*/
function append_styles(styles, important = false) {
	var separator = important ? " !important;" : ";";
	var css = "";
	for (var key of Object.keys(styles)) {
		var value = styles[key];
		if (value != null && value !== "") css += " " + key + ": " + value + separator;
	}
	return css;
}
/**
* @param {string} name
* @returns {string}
*/
function to_css_name(name) {
	if (name[0] !== "-" || name[1] !== "-") return name.toLowerCase();
	return name;
}
/**
* @param {any} value
* @param {Record<string, any> | [Record<string, any>, Record<string, any>]} [styles]
* @returns {string | null}
*/
function to_style(value, styles) {
	if (styles) {
		var new_style = "";
		/** @type {Record<string,any> | undefined} */
		var normal_styles;
		/** @type {Record<string,any> | undefined} */
		var important_styles;
		if (Array.isArray(styles)) {
			normal_styles = styles[0];
			important_styles = styles[1];
		} else normal_styles = styles;
		if (value) {
			value = String(value).replaceAll(/\/\*.*?\*\//g, "").trim();
			/** @type {boolean | '"' | "'"} */
			var in_str = false;
			var in_apo = 0;
			var in_comment = false;
			var reserved_names = [];
			if (normal_styles) reserved_names.push(...Object.keys(normal_styles).map(to_css_name));
			if (important_styles) reserved_names.push(...Object.keys(important_styles).map(to_css_name));
			var start_index = 0;
			var name_index = -1;
			const len = value.length;
			for (var i = 0; i < len; i++) {
				var c = value[i];
				if (in_comment) {
					if (c === "/" && value[i - 1] === "*") in_comment = false;
				} else if (in_str) {
					if (in_str === c) in_str = false;
				} else if (c === "/" && value[i + 1] === "*") in_comment = true;
				else if (c === "\"" || c === "'") in_str = c;
				else if (c === "(") in_apo++;
				else if (c === ")") in_apo--;
				if (!in_comment && in_str === false && in_apo === 0) {
					if (c === ":" && name_index === -1) name_index = i;
					else if (c === ";" || i === len - 1) {
						if (name_index !== -1) {
							var name = to_css_name(value.substring(start_index, name_index).trim());
							if (!reserved_names.includes(name)) {
								if (c !== ";") i++;
								var property = value.substring(start_index, i).trim();
								new_style += " " + property + ";";
							}
						}
						start_index = i + 1;
						name_index = -1;
					}
				}
			}
		}
		if (normal_styles) new_style += append_styles(normal_styles);
		if (important_styles) new_style += append_styles(important_styles, true);
		new_style = new_style.trim();
		return new_style === "" ? null : new_style;
	}
	return value == null ? null : String(value);
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/elements/class.js
/**
* @param {Element} dom
* @param {boolean | number} is_html
* @param {string | null} value
* @param {string} [hash]
* @param {Record<string, any>} [prev_classes]
* @param {Record<string, any>} [next_classes]
* @returns {Record<string, boolean> | undefined}
*/
function set_class(dom, is_html, value, hash, prev_classes, next_classes) {
	var prev = dom[CLASS_CACHE];
	if (hydrating || prev !== value || prev === void 0) {
		var next_class_name = to_class(value, hash, next_classes);
		if (!hydrating || next_class_name !== dom.getAttribute("class")) {
			if (next_class_name == null) dom.removeAttribute("class");
			else if (is_html) dom.className = next_class_name;
			else dom.setAttribute("class", next_class_name);
		}
		/** @type {any} */ dom[CLASS_CACHE] = value;
	} else if (next_classes && prev_classes !== next_classes) for (var key in next_classes) {
		var is_present = !!next_classes[key];
		if (prev_classes == null || is_present !== !!prev_classes[key]) dom.classList.toggle(key, is_present);
	}
	return next_classes;
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/elements/style.js
/**
* @param {Element & ElementCSSInlineStyle} dom
* @param {Record<string, any>} prev
* @param {Record<string, any>} next
* @param {string} [priority]
*/
function update_styles(dom, prev = {}, next, priority) {
	for (var key in next) {
		var value = next[key];
		if (prev[key] !== value) {
			if (next[key] == null) dom.style.removeProperty(key);
			else dom.style.setProperty(key, value, priority);
		}
	}
}
/**
* @param {Element & ElementCSSInlineStyle} dom
* @param {string | null} value
* @param {Record<string, any> | [Record<string, any>, Record<string, any>]} [prev_styles]
* @param {Record<string, any> | [Record<string, any>, Record<string, any>]} [next_styles]
*/
function set_style(dom, value, prev_styles, next_styles) {
	var prev = dom[STYLE_CACHE];
	if (hydrating || prev !== value) {
		var next_style_attr = to_style(value, next_styles);
		if (!hydrating || next_style_attr !== dom.getAttribute("style")) {
			if (next_style_attr == null) dom.removeAttribute("style");
			else dom.style.cssText = next_style_attr;
		}
		/** @type {any} */ dom[STYLE_CACHE] = value;
	} else if (next_styles) {
		if (Array.isArray(next_styles)) {
			update_styles(dom, prev_styles?.[0], next_styles[0]);
			update_styles(dom, prev_styles?.[1], next_styles[1], "important");
		} else update_styles(dom, prev_styles, next_styles);
	}
	return next_styles;
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
/**
* Sets the `selected` attribute on an option so form reset can restore it.
* @param {HTMLOptionElement} option
* @param {boolean} selected
*/
function set_selected(option, selected) {
	if (selected) {
		if (!option.hasAttribute("selected")) option.setAttribute("selected", "");
	} else option.removeAttribute("selected");
}
/**
* Sets the options a form reset should restore. The first call selects
* them if nothing has set a value, later calls leave the current selection alone.
* @param {HTMLSelectElement} select
* @param {any} value
*/
function set_default_select_value(select, value) {
	var mounting = !("__defaultValue" in select);
	if (!mounting && select.__defaultValue === value) return;
	select.__defaultValue = value;
	apply_default_select_value(select, !mounting || "__value" in select);
}
/**
* Marks the options matching `__defaultValue` as selected. Without `preserve`
* a newly matching option gets selected, as an inserted `<option selected>` would.
* @param {HTMLSelectElement} select
* @param {boolean} preserve
*/
function apply_default_select_value(select, preserve) {
	var value = select.__defaultValue;
	var multiple = select.multiple;
	var values = multiple ? value ?? [] : null;
	if (multiple && !is_array(values)) return;
	var index = select.selectedIndex;
	var selected = preserve && multiple ? new Set(select.selectedOptions) : null;
	for (var option of select.options) {
		var option_value = get_option_value(option);
		set_selected(option, multiple ? values.includes(option_value) : is$1(option_value, value));
	}
	if (!preserve) return;
	if (selected !== null) for (option of select.options) {
		var was_selected = selected.has(option);
		if (option.selected !== was_selected) option.selected = was_selected;
	}
	else if (select.selectedIndex !== index) select.selectedIndex = index;
}
/**
* Selects the correct option(s) (depending on whether this is a multiple select)
* @template V
* @param {HTMLSelectElement} select
* @param {V} value
* @param {boolean} mounting
*/
function select_option(select, value, mounting = false) {
	if (select.multiple) {
		if (value == void 0) return;
		if (!is_array(value)) return select_multiple_invalid_value();
		for (var option of select.options) option.selected = value.includes(get_option_value(option));
		return;
	}
	for (option of select.options) if (is$1(get_option_value(option), value)) {
		option.selected = true;
		return;
	}
	if (!mounting || value !== void 0) select.selectedIndex = -1;
}
/**
* Sets up a mutation observer to sync the current selection
* and default to the dom when the options change, for example
* when they are inside an `#each` block. Called once per `<select>`,
* by the compiled output or by `attribute_effect` for spreads.
* @param {HTMLSelectElement} select
*/
function init_select(select) {
	var observer = new MutationObserver((entries) => {
		if (entries.every(is_selectedcontent_mutation)) return;
		if ("__defaultValue" in select) apply_default_select_value(select, false);
		if ("__value" in select) select_option(select, select.__value);
	});
	observer.observe(select, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ["value"]
	});
	teardown(() => {
		observer.disconnect();
	});
}
/** @param {HTMLOptionElement} option */
function get_option_value(option) {
	if ("__value" in option) return option.__value;
	else return option.value;
}
/**
* Returns `true` if the mutation stems from the browser mirroring the selected
* option's content into `<selectedcontent>`, or from us replacing the
* `<selectedcontent>` element with a clone of itself
* @param {MutationRecord} entry
*/
function is_selectedcontent_mutation(entry) {
	if (entry.target.closest("selectedcontent") !== null) return true;
	if (entry.type === "childList") {
		var nodes = [...entry.addedNodes, ...entry.removedNodes];
		return nodes.length > 0 && nodes.every((node) => node.nodeName === "SELECTEDCONTENT");
	}
	return false;
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/elements/attributes.js
/** @import { Blocker, Effect } from '#client' */
var CLASS = Symbol("class");
var STYLE = Symbol("style");
var IS_CUSTOM_ELEMENT = Symbol("is custom element");
var IS_HTML = Symbol("is html");
var LINK_TAG = IS_XHTML ? "link" : "LINK";
var INPUT_TAG = IS_XHTML ? "input" : "INPUT";
var OPTION_TAG = IS_XHTML ? "option" : "OPTION";
var SELECT_TAG = IS_XHTML ? "select" : "SELECT";
var PROGRESS_TAG = IS_XHTML ? "progress" : "PROGRESS";
/**
* The value/checked attribute in the template actually corresponds to the defaultValue property, so we need
* to remove it upon hydration to avoid a bug when someone resets the form value.
* @param {HTMLInputElement} input
* @returns {void}
*/
function remove_input_defaults(input) {
	if (!hydrating) return;
	var already_removed = false;
	var remove_defaults = () => {
		if (already_removed) return;
		already_removed = true;
		if (input.hasAttribute("value")) {
			var value = input.value;
			set_attribute(input, "value", null);
			input.value = value;
		}
		if (input.hasAttribute("checked")) {
			var checked = input.checked;
			set_attribute(input, "checked", null);
			input.checked = checked;
		}
	};
	/** @type {any} */ input[FORM_RESET_HANDLER] = remove_defaults;
	queue_micro_task(remove_defaults);
	add_form_reset_listener();
}
/**
* @param {Element} element
* @param {boolean} checked
*/
function set_checked(element, checked) {
	var attributes = get_attributes(element);
	if (attributes.checked === (attributes.checked = checked ?? void 0)) return;
	element.checked = checked;
}
/**
* @param {Element} element
* @param {string} attribute
* @param {string | null} value
* @param {boolean} [skip_warning]
*/
function set_attribute(element, attribute, value, skip_warning) {
	var attributes = get_attributes(element);
	if (hydrating) {
		attributes[attribute] = element.getAttribute(attribute);
		if (attribute === "src" || attribute === "srcset" || attribute === "href" && element.nodeName === LINK_TAG) {
			if (!skip_warning);
			return;
		}
	}
	var previous = attributes[attribute];
	if (previous === (attributes[attribute] = value)) return;
	if (attribute === "loading") element[LOADING_ATTR_SYMBOL] = value;
	if (value == null) element.removeAttribute(attribute);
	else if (typeof value !== "string" && get_setters(element).has(attribute)) element[attribute] = value;
	else if (!(hydrating && (typeof value === "number" || typeof value === "boolean") && previous === String(value))) element.setAttribute(attribute, value);
}
/**
* Spreads attributes onto a DOM element, taking into account the currently set attributes
* @param {Element & ElementCSSInlineStyle} element
* @param {Record<string | symbol, any> | undefined} prev
* @param {Record<string | symbol, any>} next New attributes - this function mutates this object
* @param {string} [css_hash]
* @param {boolean} [should_remove_defaults]
* @param {boolean} [skip_warning]
* @returns {Record<string, any>}
*/
function set_attributes(element, prev, next, css_hash, should_remove_defaults = false, skip_warning = false) {
	if (hydrating && should_remove_defaults && element.nodeName === INPUT_TAG) {
		if (!("defaultValue" in next || "defaultChecked" in next)) remove_input_defaults(element);
	}
	var attributes = get_attributes(element);
	var is_custom_element = attributes[IS_CUSTOM_ELEMENT];
	var preserve_attribute_case = !attributes[IS_HTML];
	let is_hydrating_custom_element = hydrating && is_custom_element;
	if (is_hydrating_custom_element) set_hydrating(false);
	var current = prev || {};
	var is_option_element = element.nodeName === OPTION_TAG;
	var is_select_element = element.nodeName === SELECT_TAG;
	try {
		for (var key in prev) if (!(key in next) && key[0] + key[1] !== "$$") next[key] = null;
		if (next.class) next.class = clsx(next.class);
		else if (css_hash || next[CLASS]) next.class = null;
		if (next[STYLE]) next.style ??= null;
		var setters = get_setters(element);
		if (element.nodeName === INPUT_TAG && "type" in next && ("value" in next || "__value" in next)) {
			var type = next.type;
			if (type !== current.type || type === void 0 && element.hasAttribute("type")) {
				current.type = type;
				set_attribute(element, "type", type, skip_warning);
			}
		}
		for (const key in next) {
			let value = next[key];
			if (is_option_element && key === "value" && value == null) {
				element.value = element.__value = "";
				current[key] = value;
				continue;
			}
			if (key === "class") {
				set_class(element, element.namespaceURI === "http://www.w3.org/1999/xhtml", value, css_hash, prev?.[CLASS], next[CLASS]);
				current[key] = value;
				current[CLASS] = next[CLASS];
				continue;
			}
			if (key === "style") {
				set_style(element, value, prev?.[STYLE], next[STYLE]);
				current[key] = value;
				current[STYLE] = next[STYLE];
				continue;
			}
			var prev_value = current[key];
			if (value === prev_value && !(value === void 0 && element.hasAttribute(key))) continue;
			current[key] = value;
			var prefix = key[0] + key[1];
			if (prefix === "$$") continue;
			if (prefix === "on") {
				/** @type {{ capture?: true }} */
				const opts = {};
				const event_handle_key = "$$" + key;
				let event_name = key.slice(2);
				var is_delegated = can_delegate_event(event_name);
				if (is_capture_event(event_name)) {
					event_name = event_name.slice(0, -7);
					opts.capture = true;
				}
				if (!is_delegated && prev_value) {
					if (value != null) continue;
					element.removeEventListener(event_name, current[event_handle_key], opts);
					current[event_handle_key] = null;
				}
				if (is_delegated) {
					delegated(event_name, element, value);
					delegate([event_name]);
				} else if (value != null) {
					/**
					* @this {any}
					* @param {Event} evt
					*/
					function handle(evt) {
						current[key].call(this, evt);
					}
					current[event_handle_key] = create_event(event_name, element, handle, opts);
				}
			} else if (key === "style") set_attribute(element, key, value);
			else if (key === "autofocus") autofocus(element, Boolean(value));
			else if (!is_custom_element && (key === "__value" || key === "value" && value != null)) {
				element.__value = value;
				if (prev_value == null || element.value !== value || value === 0 && element.nodeName === PROGRESS_TAG) element.value = value;
			} else if (key === "selected" && is_option_element) set_selected(element, value);
			else {
				var name = key;
				if (!preserve_attribute_case) name = normalize_attribute(name);
				var is_default = name === "defaultValue" || name === "defaultChecked";
				if (is_select_element && name === "defaultValue") continue;
				if (value == null && !is_custom_element && !is_default) {
					attributes[key] = null;
					if (name === "value" || name === "checked") {
						let input = element;
						const use_default = prev === void 0;
						if (name === "value") {
							let previous = input.defaultValue;
							input.removeAttribute(name);
							input.defaultValue = previous;
							input.value = input.__value = use_default ? previous : null;
						} else {
							let previous = input.defaultChecked;
							input.removeAttribute(name);
							input.defaultChecked = previous;
							input.checked = use_default ? previous : false;
						}
					} else element.removeAttribute(key);
				} else if (is_default || (is_custom_element || typeof value !== "string") && setters.has(name)) {
					element[name] = value;
					if (name in attributes) attributes[name] = UNINITIALIZED;
				} else if (typeof value !== "function") set_attribute(element, name, value, skip_warning);
			}
		}
	} finally {
		if (is_hydrating_custom_element) set_hydrating(true);
	}
	return current;
}
/**
* @param {Element & ElementCSSInlineStyle} element
* @param {(...expressions: any) => Record<string | symbol, any>} fn
* @param {Array<() => any>} sync
* @param {Array<() => Promise<any>>} async
* @param {Blocker[]} blockers
* @param {string} [css_hash]
* @param {boolean} [should_remove_defaults]
* @param {boolean} [skip_warning]
*/
function attribute_effect(element, fn, sync = [], async = [], blockers = [], css_hash, should_remove_defaults = false, skip_warning = false) {
	flatten(blockers, sync, async, (values) => {
		/** @type {Record<string | symbol, any> | undefined} */
		var prev = void 0;
		/** @type {Record<symbol, Effect>} */
		var effects = {};
		var is_select = element.nodeName === SELECT_TAG;
		var inited = false;
		managed(() => {
			var next = fn(...values.map(get));
			/** @type {Record<string | symbol, any>} */
			var current = set_attributes(element, prev, next, css_hash, should_remove_defaults, skip_warning);
			if (inited && is_select) {
				var select = element;
				if ("defaultValue" in next) set_default_select_value(select, next.defaultValue);
				if ("value" in next) select_option(select, next.value);
			}
			for (let symbol of Object.getOwnPropertySymbols(effects)) if (!next[symbol]) destroy_effect(effects[symbol]);
			for (let symbol of Object.getOwnPropertySymbols(next)) {
				var n = next[symbol];
				if (symbol.description === "@attach" && (!prev || n !== prev[symbol])) {
					if (effects[symbol]) destroy_effect(effects[symbol]);
					effects[symbol] = branch(() => attach(element, () => n));
				}
				current[symbol] = n;
			}
			prev = current;
		});
		if (is_select) {
			var select = element;
			effect(() => {
				var attrs = prev;
				if ("defaultValue" in attrs) set_default_select_value(select, attrs.defaultValue);
				select_option(select, attrs.value, true);
				init_select(select);
			});
		}
		inited = true;
	});
}
/**
*
* @param {Element} element
*/
function get_attributes(element) {
	return element[ATTRIBUTES_CACHE] ??= {
		[IS_CUSTOM_ELEMENT]: element.nodeName.includes("-"),
		[IS_HTML]: element.namespaceURI === NAMESPACE_HTML
	};
}
/** @type {Map<string, Set<string>>} */
var setters_cache = /* @__PURE__ */ new Map();
/** @param {Element} element */
function get_setters(element) {
	var cache_key = element.getAttribute("is") || element.nodeName;
	var setters = setters_cache.get(cache_key);
	if (setters) return setters;
	setters_cache.set(cache_key, setters = /* @__PURE__ */ new Set());
	var descriptors;
	var proto = element;
	var element_proto = Element.prototype;
	while (element_proto !== proto) {
		descriptors = get_descriptors(proto);
		for (var key in descriptors) if (descriptors[key].set && key !== "innerHTML" && key !== "textContent" && key !== "innerText") setters.add(key);
		proto = get_prototype_of(proto);
	}
	return setters;
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
/** @import { ComponentContext, Effect } from '#client' */
/**
* @param {any} bound_value
* @param {Element} element_or_component
* @returns {boolean}
*/
function is_bound_this(bound_value, element_or_component) {
	return bound_value === element_or_component || bound_value?.[STATE_SYMBOL] === element_or_component;
}
/**
* @param {any} element_or_component
* @param {(value: unknown, ...parts: unknown[]) => void} update
* @param {(...parts: unknown[]) => unknown} get_value
* @param {() => unknown[]} [get_parts] Set if the this binding is used inside an each block,
* 										returns all the parts of the each block context that are used in the expression
* @returns {void}
*/
function bind_this(element_or_component = mark_as_component(), update, get_value, get_parts) {
	var component_effect = component_context.r;
	var parent = active_effect;
	effect(() => {
		/** @type {unknown[]} */
		var old_parts;
		/** @type {unknown[]} */
		var parts;
		render_effect(() => {
			old_parts = parts;
			parts = get_parts?.() || [];
			untrack(() => {
				if (!is_bound_this(get_value(...parts), element_or_component)) {
					update(element_or_component, ...parts);
					if (old_parts && is_bound_this(get_value(...old_parts), element_or_component)) update(null, ...old_parts);
				}
			});
		});
		return () => {
			let p = parent;
			while (p !== component_effect && p.parent !== null && p.parent.f & 33554432) p = p.parent;
			const teardown = () => {
				if (parts && is_bound_this(get_value(...parts), element_or_component)) update(null, ...parts);
			};
			const original_teardown = p.teardown;
			p.teardown = () => {
				teardown();
				original_teardown?.();
			};
		};
	});
	return element_or_component;
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/reactivity/store.js
/**
* Whether or not the prop currently being read is a store binding, as in
* `<Child bind:x={$y} />`. If it is, we treat the prop as mutable even in
* runes mode, and skip `binding_property_non_reactive` validation
*/
var is_store_binding = false;
/**
* Returns a tuple that indicates whether `fn()` reads a prop that is a store binding.
* Used to prevent `binding_property_non_reactive` validation false positives and
* ensure that these props are treated as mutable even in runes mode
* @template T
* @param {() => T} fn
* @returns {[T, boolean]}
*/
function capture_store_binding(fn) {
	var previous_is_store_binding = is_store_binding;
	try {
		is_store_binding = false;
		return [fn(), is_store_binding];
	} finally {
		is_store_binding = previous_is_store_binding;
	}
}
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/internal/client/reactivity/props.js
/** @import { Derived, Effect, Source } from './types.js' */
/**
* The proxy handler for rest props (i.e. `const { x, ...rest } = $props()`).
* Is passed the full `$$props` object and excludes the named props.
* @type {ProxyHandler<{ props: Record<string | symbol, unknown>, exclude: Set<string | symbol>, name?: string }>}}
*/
var rest_props_handler = {
	get(target, key) {
		if (target.exclude.has(key)) return;
		return target.props[key];
	},
	set(target, key) {
		return false;
	},
	getOwnPropertyDescriptor(target, key) {
		if (target.exclude.has(key)) return;
		if (key in target.props) return {
			enumerable: true,
			configurable: true,
			value: target.props[key]
		};
	},
	has(target, key) {
		if (target.exclude.has(key)) return false;
		return key in target.props;
	},
	ownKeys(target) {
		return Reflect.ownKeys(target.props).filter((key) => !target.exclude.has(key));
	}
};
/**
* @param {Record<string, unknown>} props
* @param {Set<string>} exclude
* @param {string} [name]
* @returns {Record<string, unknown>}
*/
/*#__NO_SIDE_EFFECTS__*/
function rest_props(props, exclude, name) {
	return new Proxy({
		props,
		exclude
	}, rest_props_handler);
}
/**
* The proxy handler for spread props. Handles the incoming array of props
* that looks like `() => { dynamic: props }, { static: prop }, ..` and wraps
* them so that the whole thing is passed to the component as the `$$props` argument.
* @type {ProxyHandler<{ props: Array<Record<string | symbol, unknown> | (() => Record<string | symbol, unknown>)> }>}}
*/
var spread_props_handler = {
	get(target, key) {
		let i = target.props.length;
		while (i--) {
			let p = target.props[i];
			if (is_function(p)) p = p();
			if (typeof p === "object" && p !== null && key in p) return p[key];
		}
	},
	set(target, key, value) {
		let i = target.props.length;
		while (i--) {
			let p = target.props[i];
			if (is_function(p)) p = p();
			const desc = get_descriptor(p, key);
			if (desc && desc.set) {
				desc.set(value);
				return true;
			}
		}
		return false;
	},
	getOwnPropertyDescriptor(target, key) {
		let i = target.props.length;
		while (i--) {
			let p = target.props[i];
			if (is_function(p)) p = p();
			if (typeof p === "object" && p !== null && key in p) {
				const descriptor = get_descriptor(p, key);
				if (descriptor && !descriptor.configurable) descriptor.configurable = true;
				return descriptor;
			}
		}
	},
	has(target, key) {
		if (key === STATE_SYMBOL || key === LEGACY_PROPS) return false;
		for (let p of target.props) {
			if (is_function(p)) p = p();
			if (p != null && key in p) return true;
		}
		return false;
	},
	ownKeys(target) {
		/** @type {Array<string | symbol>} */
		const keys = [];
		for (let p of target.props) {
			if (is_function(p)) p = p();
			if (!p) continue;
			for (const key in p) if (!keys.includes(key)) keys.push(key);
			for (const key of Object.getOwnPropertySymbols(p)) if (!keys.includes(key)) keys.push(key);
		}
		return keys;
	}
};
/**
* @param {Array<Record<string, unknown> | (() => Record<string, unknown>)>} props
* @returns {any}
*/
function spread_props(...props) {
	return new Proxy({ props }, spread_props_handler);
}
/**
* This function is responsible for synchronizing a possibly bound prop with the inner component state.
* It is used whenever the compiler sees that the component writes to the prop, or when it has a default prop_value.
* @template V
* @param {Record<string, unknown>} props
* @param {string} key
* @param {number} flags
* @param {V | (() => V)} [fallback]
* @returns {(() => V | ((arg: V) => V) | ((arg: V, mutation: boolean) => V))}
*/
function prop(props, key, flags, fallback) {
	var runes = !legacy_mode_flag || (flags & 2) !== 0;
	var bindable = (flags & 8) !== 0;
	var lazy = (flags & 16) !== 0;
	var fallback_value = fallback;
	var fallback_dirty = true;
	var fallback_signal = void 0;
	var get_fallback = () => {
		if (lazy && runes) {
			fallback_signal ??= /* @__PURE__ */ derived(fallback);
			return get(fallback_signal);
		}
		if (fallback_dirty) {
			fallback_dirty = false;
			fallback_value = lazy ? untrack(fallback) : fallback;
		}
		return fallback_value;
	};
	/** @type {((v: V) => void) | undefined} */
	let setter;
	if (bindable) {
		var is_entry_props = STATE_SYMBOL in props || LEGACY_PROPS in props;
		setter = get_descriptor(props, key)?.set ?? (is_entry_props && key in props ? (v) => props[key] = v : void 0);
	}
	/** @type {V} */
	var initial_value;
	var is_store_sub = false;
	if (bindable) [initial_value, is_store_sub] = capture_store_binding(() => props[key]);
	else initial_value = props[key];
	if (initial_value === void 0 && fallback !== void 0) {
		initial_value = get_fallback();
		if (setter) {
			if (runes) props_invalid_value(key);
			setter(initial_value);
		}
	}
	/** @type {() => V} */
	var getter;
	if (runes) getter = () => {
		var value = props[key];
		if (value === void 0) return get_fallback();
		fallback_dirty = true;
		return value;
	};
	else getter = () => {
		var value = props[key];
		if (value !== void 0) fallback_value = void 0;
		return value === void 0 ? fallback_value : value;
	};
	if (runes && (flags & 4) === 0) return getter;
	if (setter) {
		var legacy_parent = props.$$legacy;
		return (function(value, mutation) {
			if (arguments.length > 0) {
				if (!runes || !mutation || legacy_parent || is_store_sub)
 /** @type {Function} */ setter(mutation ? getter() : value);
				return value;
			}
			return getter();
		});
	}
	var overridden = false;
	var d = ((flags & 1) !== 0 ? derived : derived_safe_equal)(() => {
		overridden = false;
		return getter();
	});
	if (bindable) get(d);
	var parent_effect = active_effect;
	return (function(value, mutation) {
		if (arguments.length > 0) {
			const new_value = mutation ? get(d) : runes && bindable ? proxy(value) : value;
			set(d, new_value);
			overridden = true;
			if (fallback_value !== void 0) fallback_value = new_value;
			return value;
		}
		if (is_destroying_effect && overridden || (parent_effect.f & 16384) !== 0) return d.v;
		return get(d);
	});
}
if (typeof HTMLElement === "function");
// node_modules/.deno/svelte-exmarkdown@5.0.2/node_modules/svelte-exmarkdown/dist/contexts.svelte.js
var ref = (value) => {
	let inner = /* @__PURE__ */ state(proxy(value));
	return {
		get current() {
			return get(inner);
		},
		set current(newVal) {
			set(inner, newVal, true);
		}
	};
};
var componentsContextKey = "components";
var getComponentsMap = () => getContext(componentsContextKey);
var setComponentsContext = (value) => setContext(componentsContextKey, value);
var astContextKey = "ast";
var setAstContext = (value) => setContext(astContextKey, value);
// node_modules/.deno/svelte-exmarkdown@5.0.2/node_modules/svelte-exmarkdown/dist/utils.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
	return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all2) => {
	for (var name in all2) __defProp(target, name, {
		get: all2[name],
		enumerable: true
	});
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") {
		for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: () => from[key],
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
var require_extend = __commonJS({ "node_modules/.pnpm/extend@3.0.2/node_modules/extend/index.js"(exports, module) {
	"use strict";
	var hasOwn = Object.prototype.hasOwnProperty;
	var toStr = Object.prototype.toString;
	var defineProperty = Object.defineProperty;
	var gOPD = Object.getOwnPropertyDescriptor;
	var isArray = function isArray2(arr) {
		if (typeof Array.isArray === "function") return Array.isArray(arr);
		return toStr.call(arr) === "[object Array]";
	};
	var isPlainObject2 = function isPlainObject3(obj) {
		if (!obj || toStr.call(obj) !== "[object Object]") return false;
		var hasOwnConstructor = hasOwn.call(obj, "constructor");
		var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, "isPrototypeOf");
		if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) return false;
		var key;
		for (key in obj);
		return typeof key === "undefined" || hasOwn.call(obj, key);
	};
	var setProperty = function setProperty2(target, options) {
		if (defineProperty && options.name === "__proto__") defineProperty(target, options.name, {
			enumerable: true,
			configurable: true,
			value: options.newValue,
			writable: true
		});
		else target[options.name] = options.newValue;
	};
	var getProperty = function getProperty2(obj, name) {
		if (name === "__proto__") {
			if (!hasOwn.call(obj, name)) return;
			else if (gOPD) return gOPD(obj, name).value;
		}
		return obj[name];
	};
	module.exports = function extend2() {
		var options, name, src, copy, copyIsArray, clone;
		var target = arguments[0];
		var i = 1;
		var length = arguments.length;
		var deep = false;
		if (typeof target === "boolean") {
			deep = target;
			target = arguments[1] || {};
			i = 2;
		}
		if (target == null || typeof target !== "object" && typeof target !== "function") target = {};
		for (; i < length; ++i) {
			options = arguments[i];
			if (options != null) for (name in options) {
				src = getProperty(target, name);
				copy = getProperty(options, name);
				if (target !== copy) {
					if (deep && copy && (isPlainObject2(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else clone = src && isPlainObject2(src) ? src : {};
						setProperty(target, {
							name,
							newValue: extend2(deep, clone, copy)
						});
					} else if (typeof copy !== "undefined") setProperty(target, {
						name,
						newValue: copy
					});
				}
			}
		}
		return target;
	};
} });
var emptyOptions$1 = {};
function toString$2(value, options) {
	const settings = options || emptyOptions$1;
	return one$1(value, typeof settings.includeImageAlt === "boolean" ? settings.includeImageAlt : true, typeof settings.includeHtml === "boolean" ? settings.includeHtml : true);
}
function one$1(value, includeImageAlt, includeHtml) {
	if (node$1(value)) {
		if ("value" in value) return value.type === "html" && !includeHtml ? "" : value.value;
		if (includeImageAlt && "alt" in value && value.alt) return value.alt;
		if ("children" in value) return all$1(value.children, includeImageAlt, includeHtml);
	}
	if (Array.isArray(value)) return all$1(value, includeImageAlt, includeHtml);
	return "";
}
function all$1(values, includeImageAlt, includeHtml) {
	const result = [];
	let index2 = -1;
	while (++index2 < values.length) result[index2] = one$1(values[index2], includeImageAlt, includeHtml);
	return result.join("");
}
function node$1(value) {
	return Boolean(value && typeof value === "object");
}
var characterEntities = {
	AElig: "Æ",
	AMP: "&",
	Aacute: "Á",
	Abreve: "Ă",
	Acirc: "Â",
	Acy: "А",
	Afr: "𝔄",
	Agrave: "À",
	Alpha: "Α",
	Amacr: "Ā",
	And: "⩓",
	Aogon: "Ą",
	Aopf: "𝔸",
	ApplyFunction: "⁡",
	Aring: "Å",
	Ascr: "𝒜",
	Assign: "≔",
	Atilde: "Ã",
	Auml: "Ä",
	Backslash: "∖",
	Barv: "⫧",
	Barwed: "⌆",
	Bcy: "Б",
	Because: "∵",
	Bernoullis: "ℬ",
	Beta: "Β",
	Bfr: "𝔅",
	Bopf: "𝔹",
	Breve: "˘",
	Bscr: "ℬ",
	Bumpeq: "≎",
	CHcy: "Ч",
	COPY: "©",
	Cacute: "Ć",
	Cap: "⋒",
	CapitalDifferentialD: "ⅅ",
	Cayleys: "ℭ",
	Ccaron: "Č",
	Ccedil: "Ç",
	Ccirc: "Ĉ",
	Cconint: "∰",
	Cdot: "Ċ",
	Cedilla: "¸",
	CenterDot: "·",
	Cfr: "ℭ",
	Chi: "Χ",
	CircleDot: "⊙",
	CircleMinus: "⊖",
	CirclePlus: "⊕",
	CircleTimes: "⊗",
	ClockwiseContourIntegral: "∲",
	CloseCurlyDoubleQuote: "”",
	CloseCurlyQuote: "’",
	Colon: "∷",
	Colone: "⩴",
	Congruent: "≡",
	Conint: "∯",
	ContourIntegral: "∮",
	Copf: "ℂ",
	Coproduct: "∐",
	CounterClockwiseContourIntegral: "∳",
	Cross: "⨯",
	Cscr: "𝒞",
	Cup: "⋓",
	CupCap: "≍",
	DD: "ⅅ",
	DDotrahd: "⤑",
	DJcy: "Ђ",
	DScy: "Ѕ",
	DZcy: "Џ",
	Dagger: "‡",
	Darr: "↡",
	Dashv: "⫤",
	Dcaron: "Ď",
	Dcy: "Д",
	Del: "∇",
	Delta: "Δ",
	Dfr: "𝔇",
	DiacriticalAcute: "´",
	DiacriticalDot: "˙",
	DiacriticalDoubleAcute: "˝",
	DiacriticalGrave: "`",
	DiacriticalTilde: "˜",
	Diamond: "⋄",
	DifferentialD: "ⅆ",
	Dopf: "𝔻",
	Dot: "¨",
	DotDot: "⃜",
	DotEqual: "≐",
	DoubleContourIntegral: "∯",
	DoubleDot: "¨",
	DoubleDownArrow: "⇓",
	DoubleLeftArrow: "⇐",
	DoubleLeftRightArrow: "⇔",
	DoubleLeftTee: "⫤",
	DoubleLongLeftArrow: "⟸",
	DoubleLongLeftRightArrow: "⟺",
	DoubleLongRightArrow: "⟹",
	DoubleRightArrow: "⇒",
	DoubleRightTee: "⊨",
	DoubleUpArrow: "⇑",
	DoubleUpDownArrow: "⇕",
	DoubleVerticalBar: "∥",
	DownArrow: "↓",
	DownArrowBar: "⤓",
	DownArrowUpArrow: "⇵",
	DownBreve: "̑",
	DownLeftRightVector: "⥐",
	DownLeftTeeVector: "⥞",
	DownLeftVector: "↽",
	DownLeftVectorBar: "⥖",
	DownRightTeeVector: "⥟",
	DownRightVector: "⇁",
	DownRightVectorBar: "⥗",
	DownTee: "⊤",
	DownTeeArrow: "↧",
	Downarrow: "⇓",
	Dscr: "𝒟",
	Dstrok: "Đ",
	ENG: "Ŋ",
	ETH: "Ð",
	Eacute: "É",
	Ecaron: "Ě",
	Ecirc: "Ê",
	Ecy: "Э",
	Edot: "Ė",
	Efr: "𝔈",
	Egrave: "È",
	Element: "∈",
	Emacr: "Ē",
	EmptySmallSquare: "◻",
	EmptyVerySmallSquare: "▫",
	Eogon: "Ę",
	Eopf: "𝔼",
	Epsilon: "Ε",
	Equal: "⩵",
	EqualTilde: "≂",
	Equilibrium: "⇌",
	Escr: "ℰ",
	Esim: "⩳",
	Eta: "Η",
	Euml: "Ë",
	Exists: "∃",
	ExponentialE: "ⅇ",
	Fcy: "Ф",
	Ffr: "𝔉",
	FilledSmallSquare: "◼",
	FilledVerySmallSquare: "▪",
	Fopf: "𝔽",
	ForAll: "∀",
	Fouriertrf: "ℱ",
	Fscr: "ℱ",
	GJcy: "Ѓ",
	GT: ">",
	Gamma: "Γ",
	Gammad: "Ϝ",
	Gbreve: "Ğ",
	Gcedil: "Ģ",
	Gcirc: "Ĝ",
	Gcy: "Г",
	Gdot: "Ġ",
	Gfr: "𝔊",
	Gg: "⋙",
	Gopf: "𝔾",
	GreaterEqual: "≥",
	GreaterEqualLess: "⋛",
	GreaterFullEqual: "≧",
	GreaterGreater: "⪢",
	GreaterLess: "≷",
	GreaterSlantEqual: "⩾",
	GreaterTilde: "≳",
	Gscr: "𝒢",
	Gt: "≫",
	HARDcy: "Ъ",
	Hacek: "ˇ",
	Hat: "^",
	Hcirc: "Ĥ",
	Hfr: "ℌ",
	HilbertSpace: "ℋ",
	Hopf: "ℍ",
	HorizontalLine: "─",
	Hscr: "ℋ",
	Hstrok: "Ħ",
	HumpDownHump: "≎",
	HumpEqual: "≏",
	IEcy: "Е",
	IJlig: "Ĳ",
	IOcy: "Ё",
	Iacute: "Í",
	Icirc: "Î",
	Icy: "И",
	Idot: "İ",
	Ifr: "ℑ",
	Igrave: "Ì",
	Im: "ℑ",
	Imacr: "Ī",
	ImaginaryI: "ⅈ",
	Implies: "⇒",
	Int: "∬",
	Integral: "∫",
	Intersection: "⋂",
	InvisibleComma: "⁣",
	InvisibleTimes: "⁢",
	Iogon: "Į",
	Iopf: "𝕀",
	Iota: "Ι",
	Iscr: "ℐ",
	Itilde: "Ĩ",
	Iukcy: "І",
	Iuml: "Ï",
	Jcirc: "Ĵ",
	Jcy: "Й",
	Jfr: "𝔍",
	Jopf: "𝕁",
	Jscr: "𝒥",
	Jsercy: "Ј",
	Jukcy: "Є",
	KHcy: "Х",
	KJcy: "Ќ",
	Kappa: "Κ",
	Kcedil: "Ķ",
	Kcy: "К",
	Kfr: "𝔎",
	Kopf: "𝕂",
	Kscr: "𝒦",
	LJcy: "Љ",
	LT: "<",
	Lacute: "Ĺ",
	Lambda: "Λ",
	Lang: "⟪",
	Laplacetrf: "ℒ",
	Larr: "↞",
	Lcaron: "Ľ",
	Lcedil: "Ļ",
	Lcy: "Л",
	LeftAngleBracket: "⟨",
	LeftArrow: "←",
	LeftArrowBar: "⇤",
	LeftArrowRightArrow: "⇆",
	LeftCeiling: "⌈",
	LeftDoubleBracket: "⟦",
	LeftDownTeeVector: "⥡",
	LeftDownVector: "⇃",
	LeftDownVectorBar: "⥙",
	LeftFloor: "⌊",
	LeftRightArrow: "↔",
	LeftRightVector: "⥎",
	LeftTee: "⊣",
	LeftTeeArrow: "↤",
	LeftTeeVector: "⥚",
	LeftTriangle: "⊲",
	LeftTriangleBar: "⧏",
	LeftTriangleEqual: "⊴",
	LeftUpDownVector: "⥑",
	LeftUpTeeVector: "⥠",
	LeftUpVector: "↿",
	LeftUpVectorBar: "⥘",
	LeftVector: "↼",
	LeftVectorBar: "⥒",
	Leftarrow: "⇐",
	Leftrightarrow: "⇔",
	LessEqualGreater: "⋚",
	LessFullEqual: "≦",
	LessGreater: "≶",
	LessLess: "⪡",
	LessSlantEqual: "⩽",
	LessTilde: "≲",
	Lfr: "𝔏",
	Ll: "⋘",
	Lleftarrow: "⇚",
	Lmidot: "Ŀ",
	LongLeftArrow: "⟵",
	LongLeftRightArrow: "⟷",
	LongRightArrow: "⟶",
	Longleftarrow: "⟸",
	Longleftrightarrow: "⟺",
	Longrightarrow: "⟹",
	Lopf: "𝕃",
	LowerLeftArrow: "↙",
	LowerRightArrow: "↘",
	Lscr: "ℒ",
	Lsh: "↰",
	Lstrok: "Ł",
	Lt: "≪",
	Map: "⤅",
	Mcy: "М",
	MediumSpace: " ",
	Mellintrf: "ℳ",
	Mfr: "𝔐",
	MinusPlus: "∓",
	Mopf: "𝕄",
	Mscr: "ℳ",
	Mu: "Μ",
	NJcy: "Њ",
	Nacute: "Ń",
	Ncaron: "Ň",
	Ncedil: "Ņ",
	Ncy: "Н",
	NegativeMediumSpace: "​",
	NegativeThickSpace: "​",
	NegativeThinSpace: "​",
	NegativeVeryThinSpace: "​",
	NestedGreaterGreater: "≫",
	NestedLessLess: "≪",
	NewLine: "\n",
	Nfr: "𝔑",
	NoBreak: "⁠",
	NonBreakingSpace: "\xA0",
	Nopf: "ℕ",
	Not: "⫬",
	NotCongruent: "≢",
	NotCupCap: "≭",
	NotDoubleVerticalBar: "∦",
	NotElement: "∉",
	NotEqual: "≠",
	NotEqualTilde: "≂̸",
	NotExists: "∄",
	NotGreater: "≯",
	NotGreaterEqual: "≱",
	NotGreaterFullEqual: "≧̸",
	NotGreaterGreater: "≫̸",
	NotGreaterLess: "≹",
	NotGreaterSlantEqual: "⩾̸",
	NotGreaterTilde: "≵",
	NotHumpDownHump: "≎̸",
	NotHumpEqual: "≏̸",
	NotLeftTriangle: "⋪",
	NotLeftTriangleBar: "⧏̸",
	NotLeftTriangleEqual: "⋬",
	NotLess: "≮",
	NotLessEqual: "≰",
	NotLessGreater: "≸",
	NotLessLess: "≪̸",
	NotLessSlantEqual: "⩽̸",
	NotLessTilde: "≴",
	NotNestedGreaterGreater: "⪢̸",
	NotNestedLessLess: "⪡̸",
	NotPrecedes: "⊀",
	NotPrecedesEqual: "⪯̸",
	NotPrecedesSlantEqual: "⋠",
	NotReverseElement: "∌",
	NotRightTriangle: "⋫",
	NotRightTriangleBar: "⧐̸",
	NotRightTriangleEqual: "⋭",
	NotSquareSubset: "⊏̸",
	NotSquareSubsetEqual: "⋢",
	NotSquareSuperset: "⊐̸",
	NotSquareSupersetEqual: "⋣",
	NotSubset: "⊂⃒",
	NotSubsetEqual: "⊈",
	NotSucceeds: "⊁",
	NotSucceedsEqual: "⪰̸",
	NotSucceedsSlantEqual: "⋡",
	NotSucceedsTilde: "≿̸",
	NotSuperset: "⊃⃒",
	NotSupersetEqual: "⊉",
	NotTilde: "≁",
	NotTildeEqual: "≄",
	NotTildeFullEqual: "≇",
	NotTildeTilde: "≉",
	NotVerticalBar: "∤",
	Nscr: "𝒩",
	Ntilde: "Ñ",
	Nu: "Ν",
	OElig: "Œ",
	Oacute: "Ó",
	Ocirc: "Ô",
	Ocy: "О",
	Odblac: "Ő",
	Ofr: "𝔒",
	Ograve: "Ò",
	Omacr: "Ō",
	Omega: "Ω",
	Omicron: "Ο",
	Oopf: "𝕆",
	OpenCurlyDoubleQuote: "“",
	OpenCurlyQuote: "‘",
	Or: "⩔",
	Oscr: "𝒪",
	Oslash: "Ø",
	Otilde: "Õ",
	Otimes: "⨷",
	Ouml: "Ö",
	OverBar: "‾",
	OverBrace: "⏞",
	OverBracket: "⎴",
	OverParenthesis: "⏜",
	PartialD: "∂",
	Pcy: "П",
	Pfr: "𝔓",
	Phi: "Φ",
	Pi: "Π",
	PlusMinus: "±",
	Poincareplane: "ℌ",
	Popf: "ℙ",
	Pr: "⪻",
	Precedes: "≺",
	PrecedesEqual: "⪯",
	PrecedesSlantEqual: "≼",
	PrecedesTilde: "≾",
	Prime: "″",
	Product: "∏",
	Proportion: "∷",
	Proportional: "∝",
	Pscr: "𝒫",
	Psi: "Ψ",
	QUOT: "\"",
	Qfr: "𝔔",
	Qopf: "ℚ",
	Qscr: "𝒬",
	RBarr: "⤐",
	REG: "®",
	Racute: "Ŕ",
	Rang: "⟫",
	Rarr: "↠",
	Rarrtl: "⤖",
	Rcaron: "Ř",
	Rcedil: "Ŗ",
	Rcy: "Р",
	Re: "ℜ",
	ReverseElement: "∋",
	ReverseEquilibrium: "⇋",
	ReverseUpEquilibrium: "⥯",
	Rfr: "ℜ",
	Rho: "Ρ",
	RightAngleBracket: "⟩",
	RightArrow: "→",
	RightArrowBar: "⇥",
	RightArrowLeftArrow: "⇄",
	RightCeiling: "⌉",
	RightDoubleBracket: "⟧",
	RightDownTeeVector: "⥝",
	RightDownVector: "⇂",
	RightDownVectorBar: "⥕",
	RightFloor: "⌋",
	RightTee: "⊢",
	RightTeeArrow: "↦",
	RightTeeVector: "⥛",
	RightTriangle: "⊳",
	RightTriangleBar: "⧐",
	RightTriangleEqual: "⊵",
	RightUpDownVector: "⥏",
	RightUpTeeVector: "⥜",
	RightUpVector: "↾",
	RightUpVectorBar: "⥔",
	RightVector: "⇀",
	RightVectorBar: "⥓",
	Rightarrow: "⇒",
	Ropf: "ℝ",
	RoundImplies: "⥰",
	Rrightarrow: "⇛",
	Rscr: "ℛ",
	Rsh: "↱",
	RuleDelayed: "⧴",
	SHCHcy: "Щ",
	SHcy: "Ш",
	SOFTcy: "Ь",
	Sacute: "Ś",
	Sc: "⪼",
	Scaron: "Š",
	Scedil: "Ş",
	Scirc: "Ŝ",
	Scy: "С",
	Sfr: "𝔖",
	ShortDownArrow: "↓",
	ShortLeftArrow: "←",
	ShortRightArrow: "→",
	ShortUpArrow: "↑",
	Sigma: "Σ",
	SmallCircle: "∘",
	Sopf: "𝕊",
	Sqrt: "√",
	Square: "□",
	SquareIntersection: "⊓",
	SquareSubset: "⊏",
	SquareSubsetEqual: "⊑",
	SquareSuperset: "⊐",
	SquareSupersetEqual: "⊒",
	SquareUnion: "⊔",
	Sscr: "𝒮",
	Star: "⋆",
	Sub: "⋐",
	Subset: "⋐",
	SubsetEqual: "⊆",
	Succeeds: "≻",
	SucceedsEqual: "⪰",
	SucceedsSlantEqual: "≽",
	SucceedsTilde: "≿",
	SuchThat: "∋",
	Sum: "∑",
	Sup: "⋑",
	Superset: "⊃",
	SupersetEqual: "⊇",
	Supset: "⋑",
	THORN: "Þ",
	TRADE: "™",
	TSHcy: "Ћ",
	TScy: "Ц",
	Tab: "	",
	Tau: "Τ",
	Tcaron: "Ť",
	Tcedil: "Ţ",
	Tcy: "Т",
	Tfr: "𝔗",
	Therefore: "∴",
	Theta: "Θ",
	ThickSpace: "  ",
	ThinSpace: " ",
	Tilde: "∼",
	TildeEqual: "≃",
	TildeFullEqual: "≅",
	TildeTilde: "≈",
	Topf: "𝕋",
	TripleDot: "⃛",
	Tscr: "𝒯",
	Tstrok: "Ŧ",
	Uacute: "Ú",
	Uarr: "↟",
	Uarrocir: "⥉",
	Ubrcy: "Ў",
	Ubreve: "Ŭ",
	Ucirc: "Û",
	Ucy: "У",
	Udblac: "Ű",
	Ufr: "𝔘",
	Ugrave: "Ù",
	Umacr: "Ū",
	UnderBar: "_",
	UnderBrace: "⏟",
	UnderBracket: "⎵",
	UnderParenthesis: "⏝",
	Union: "⋃",
	UnionPlus: "⊎",
	Uogon: "Ų",
	Uopf: "𝕌",
	UpArrow: "↑",
	UpArrowBar: "⤒",
	UpArrowDownArrow: "⇅",
	UpDownArrow: "↕",
	UpEquilibrium: "⥮",
	UpTee: "⊥",
	UpTeeArrow: "↥",
	Uparrow: "⇑",
	Updownarrow: "⇕",
	UpperLeftArrow: "↖",
	UpperRightArrow: "↗",
	Upsi: "ϒ",
	Upsilon: "Υ",
	Uring: "Ů",
	Uscr: "𝒰",
	Utilde: "Ũ",
	Uuml: "Ü",
	VDash: "⊫",
	Vbar: "⫫",
	Vcy: "В",
	Vdash: "⊩",
	Vdashl: "⫦",
	Vee: "⋁",
	Verbar: "‖",
	Vert: "‖",
	VerticalBar: "∣",
	VerticalLine: "|",
	VerticalSeparator: "❘",
	VerticalTilde: "≀",
	VeryThinSpace: " ",
	Vfr: "𝔙",
	Vopf: "𝕍",
	Vscr: "𝒱",
	Vvdash: "⊪",
	Wcirc: "Ŵ",
	Wedge: "⋀",
	Wfr: "𝔚",
	Wopf: "𝕎",
	Wscr: "𝒲",
	Xfr: "𝔛",
	Xi: "Ξ",
	Xopf: "𝕏",
	Xscr: "𝒳",
	YAcy: "Я",
	YIcy: "Ї",
	YUcy: "Ю",
	Yacute: "Ý",
	Ycirc: "Ŷ",
	Ycy: "Ы",
	Yfr: "𝔜",
	Yopf: "𝕐",
	Yscr: "𝒴",
	Yuml: "Ÿ",
	ZHcy: "Ж",
	Zacute: "Ź",
	Zcaron: "Ž",
	Zcy: "З",
	Zdot: "Ż",
	ZeroWidthSpace: "​",
	Zeta: "Ζ",
	Zfr: "ℨ",
	Zopf: "ℤ",
	Zscr: "𝒵",
	aacute: "á",
	abreve: "ă",
	ac: "∾",
	acE: "∾̳",
	acd: "∿",
	acirc: "â",
	acute: "´",
	acy: "а",
	aelig: "æ",
	af: "⁡",
	afr: "𝔞",
	agrave: "à",
	alefsym: "ℵ",
	aleph: "ℵ",
	alpha: "α",
	amacr: "ā",
	amalg: "⨿",
	amp: "&",
	and: "∧",
	andand: "⩕",
	andd: "⩜",
	andslope: "⩘",
	andv: "⩚",
	ang: "∠",
	ange: "⦤",
	angle: "∠",
	angmsd: "∡",
	angmsdaa: "⦨",
	angmsdab: "⦩",
	angmsdac: "⦪",
	angmsdad: "⦫",
	angmsdae: "⦬",
	angmsdaf: "⦭",
	angmsdag: "⦮",
	angmsdah: "⦯",
	angrt: "∟",
	angrtvb: "⊾",
	angrtvbd: "⦝",
	angsph: "∢",
	angst: "Å",
	angzarr: "⍼",
	aogon: "ą",
	aopf: "𝕒",
	ap: "≈",
	apE: "⩰",
	apacir: "⩯",
	ape: "≊",
	apid: "≋",
	apos: "'",
	approx: "≈",
	approxeq: "≊",
	aring: "å",
	ascr: "𝒶",
	ast: "*",
	asymp: "≈",
	asympeq: "≍",
	atilde: "ã",
	auml: "ä",
	awconint: "∳",
	awint: "⨑",
	bNot: "⫭",
	backcong: "≌",
	backepsilon: "϶",
	backprime: "‵",
	backsim: "∽",
	backsimeq: "⋍",
	barvee: "⊽",
	barwed: "⌅",
	barwedge: "⌅",
	bbrk: "⎵",
	bbrktbrk: "⎶",
	bcong: "≌",
	bcy: "б",
	bdquo: "„",
	becaus: "∵",
	because: "∵",
	bemptyv: "⦰",
	bepsi: "϶",
	bernou: "ℬ",
	beta: "β",
	beth: "ℶ",
	between: "≬",
	bfr: "𝔟",
	bigcap: "⋂",
	bigcirc: "◯",
	bigcup: "⋃",
	bigodot: "⨀",
	bigoplus: "⨁",
	bigotimes: "⨂",
	bigsqcup: "⨆",
	bigstar: "★",
	bigtriangledown: "▽",
	bigtriangleup: "△",
	biguplus: "⨄",
	bigvee: "⋁",
	bigwedge: "⋀",
	bkarow: "⤍",
	blacklozenge: "⧫",
	blacksquare: "▪",
	blacktriangle: "▴",
	blacktriangledown: "▾",
	blacktriangleleft: "◂",
	blacktriangleright: "▸",
	blank: "␣",
	blk12: "▒",
	blk14: "░",
	blk34: "▓",
	block: "█",
	bne: "=⃥",
	bnequiv: "≡⃥",
	bnot: "⌐",
	bopf: "𝕓",
	bot: "⊥",
	bottom: "⊥",
	bowtie: "⋈",
	boxDL: "╗",
	boxDR: "╔",
	boxDl: "╖",
	boxDr: "╓",
	boxH: "═",
	boxHD: "╦",
	boxHU: "╩",
	boxHd: "╤",
	boxHu: "╧",
	boxUL: "╝",
	boxUR: "╚",
	boxUl: "╜",
	boxUr: "╙",
	boxV: "║",
	boxVH: "╬",
	boxVL: "╣",
	boxVR: "╠",
	boxVh: "╫",
	boxVl: "╢",
	boxVr: "╟",
	boxbox: "⧉",
	boxdL: "╕",
	boxdR: "╒",
	boxdl: "┐",
	boxdr: "┌",
	boxh: "─",
	boxhD: "╥",
	boxhU: "╨",
	boxhd: "┬",
	boxhu: "┴",
	boxminus: "⊟",
	boxplus: "⊞",
	boxtimes: "⊠",
	boxuL: "╛",
	boxuR: "╘",
	boxul: "┘",
	boxur: "└",
	boxv: "│",
	boxvH: "╪",
	boxvL: "╡",
	boxvR: "╞",
	boxvh: "┼",
	boxvl: "┤",
	boxvr: "├",
	bprime: "‵",
	breve: "˘",
	brvbar: "¦",
	bscr: "𝒷",
	bsemi: "⁏",
	bsim: "∽",
	bsime: "⋍",
	bsol: "\\",
	bsolb: "⧅",
	bsolhsub: "⟈",
	bull: "•",
	bullet: "•",
	bump: "≎",
	bumpE: "⪮",
	bumpe: "≏",
	bumpeq: "≏",
	cacute: "ć",
	cap: "∩",
	capand: "⩄",
	capbrcup: "⩉",
	capcap: "⩋",
	capcup: "⩇",
	capdot: "⩀",
	caps: "∩︀",
	caret: "⁁",
	caron: "ˇ",
	ccaps: "⩍",
	ccaron: "č",
	ccedil: "ç",
	ccirc: "ĉ",
	ccups: "⩌",
	ccupssm: "⩐",
	cdot: "ċ",
	cedil: "¸",
	cemptyv: "⦲",
	cent: "¢",
	centerdot: "·",
	cfr: "𝔠",
	chcy: "ч",
	check: "✓",
	checkmark: "✓",
	chi: "χ",
	cir: "○",
	cirE: "⧃",
	circ: "ˆ",
	circeq: "≗",
	circlearrowleft: "↺",
	circlearrowright: "↻",
	circledR: "®",
	circledS: "Ⓢ",
	circledast: "⊛",
	circledcirc: "⊚",
	circleddash: "⊝",
	cire: "≗",
	cirfnint: "⨐",
	cirmid: "⫯",
	cirscir: "⧂",
	clubs: "♣",
	clubsuit: "♣",
	colon: ":",
	colone: "≔",
	coloneq: "≔",
	comma: ",",
	commat: "@",
	comp: "∁",
	compfn: "∘",
	complement: "∁",
	complexes: "ℂ",
	cong: "≅",
	congdot: "⩭",
	conint: "∮",
	copf: "𝕔",
	coprod: "∐",
	copy: "©",
	copysr: "℗",
	crarr: "↵",
	cross: "✗",
	cscr: "𝒸",
	csub: "⫏",
	csube: "⫑",
	csup: "⫐",
	csupe: "⫒",
	ctdot: "⋯",
	cudarrl: "⤸",
	cudarrr: "⤵",
	cuepr: "⋞",
	cuesc: "⋟",
	cularr: "↶",
	cularrp: "⤽",
	cup: "∪",
	cupbrcap: "⩈",
	cupcap: "⩆",
	cupcup: "⩊",
	cupdot: "⊍",
	cupor: "⩅",
	cups: "∪︀",
	curarr: "↷",
	curarrm: "⤼",
	curlyeqprec: "⋞",
	curlyeqsucc: "⋟",
	curlyvee: "⋎",
	curlywedge: "⋏",
	curren: "¤",
	curvearrowleft: "↶",
	curvearrowright: "↷",
	cuvee: "⋎",
	cuwed: "⋏",
	cwconint: "∲",
	cwint: "∱",
	cylcty: "⌭",
	dArr: "⇓",
	dHar: "⥥",
	dagger: "†",
	daleth: "ℸ",
	darr: "↓",
	dash: "‐",
	dashv: "⊣",
	dbkarow: "⤏",
	dblac: "˝",
	dcaron: "ď",
	dcy: "д",
	dd: "ⅆ",
	ddagger: "‡",
	ddarr: "⇊",
	ddotseq: "⩷",
	deg: "°",
	delta: "δ",
	demptyv: "⦱",
	dfisht: "⥿",
	dfr: "𝔡",
	dharl: "⇃",
	dharr: "⇂",
	diam: "⋄",
	diamond: "⋄",
	diamondsuit: "♦",
	diams: "♦",
	die: "¨",
	digamma: "ϝ",
	disin: "⋲",
	div: "÷",
	divide: "÷",
	divideontimes: "⋇",
	divonx: "⋇",
	djcy: "ђ",
	dlcorn: "⌞",
	dlcrop: "⌍",
	dollar: "$",
	dopf: "𝕕",
	dot: "˙",
	doteq: "≐",
	doteqdot: "≑",
	dotminus: "∸",
	dotplus: "∔",
	dotsquare: "⊡",
	doublebarwedge: "⌆",
	downarrow: "↓",
	downdownarrows: "⇊",
	downharpoonleft: "⇃",
	downharpoonright: "⇂",
	drbkarow: "⤐",
	drcorn: "⌟",
	drcrop: "⌌",
	dscr: "𝒹",
	dscy: "ѕ",
	dsol: "⧶",
	dstrok: "đ",
	dtdot: "⋱",
	dtri: "▿",
	dtrif: "▾",
	duarr: "⇵",
	duhar: "⥯",
	dwangle: "⦦",
	dzcy: "џ",
	dzigrarr: "⟿",
	eDDot: "⩷",
	eDot: "≑",
	eacute: "é",
	easter: "⩮",
	ecaron: "ě",
	ecir: "≖",
	ecirc: "ê",
	ecolon: "≕",
	ecy: "э",
	edot: "ė",
	ee: "ⅇ",
	efDot: "≒",
	efr: "𝔢",
	eg: "⪚",
	egrave: "è",
	egs: "⪖",
	egsdot: "⪘",
	el: "⪙",
	elinters: "⏧",
	ell: "ℓ",
	els: "⪕",
	elsdot: "⪗",
	emacr: "ē",
	empty: "∅",
	emptyset: "∅",
	emptyv: "∅",
	emsp13: " ",
	emsp14: " ",
	emsp: " ",
	eng: "ŋ",
	ensp: " ",
	eogon: "ę",
	eopf: "𝕖",
	epar: "⋕",
	eparsl: "⧣",
	eplus: "⩱",
	epsi: "ε",
	epsilon: "ε",
	epsiv: "ϵ",
	eqcirc: "≖",
	eqcolon: "≕",
	eqsim: "≂",
	eqslantgtr: "⪖",
	eqslantless: "⪕",
	equals: "=",
	equest: "≟",
	equiv: "≡",
	equivDD: "⩸",
	eqvparsl: "⧥",
	erDot: "≓",
	erarr: "⥱",
	escr: "ℯ",
	esdot: "≐",
	esim: "≂",
	eta: "η",
	eth: "ð",
	euml: "ë",
	euro: "€",
	excl: "!",
	exist: "∃",
	expectation: "ℰ",
	exponentiale: "ⅇ",
	fallingdotseq: "≒",
	fcy: "ф",
	female: "♀",
	ffilig: "ﬃ",
	fflig: "ﬀ",
	ffllig: "ﬄ",
	ffr: "𝔣",
	filig: "ﬁ",
	fjlig: "fj",
	flat: "♭",
	fllig: "ﬂ",
	fltns: "▱",
	fnof: "ƒ",
	fopf: "𝕗",
	forall: "∀",
	fork: "⋔",
	forkv: "⫙",
	fpartint: "⨍",
	frac12: "½",
	frac13: "⅓",
	frac14: "¼",
	frac15: "⅕",
	frac16: "⅙",
	frac18: "⅛",
	frac23: "⅔",
	frac25: "⅖",
	frac34: "¾",
	frac35: "⅗",
	frac38: "⅜",
	frac45: "⅘",
	frac56: "⅚",
	frac58: "⅝",
	frac78: "⅞",
	frasl: "⁄",
	frown: "⌢",
	fscr: "𝒻",
	gE: "≧",
	gEl: "⪌",
	gacute: "ǵ",
	gamma: "γ",
	gammad: "ϝ",
	gap: "⪆",
	gbreve: "ğ",
	gcirc: "ĝ",
	gcy: "г",
	gdot: "ġ",
	ge: "≥",
	gel: "⋛",
	geq: "≥",
	geqq: "≧",
	geqslant: "⩾",
	ges: "⩾",
	gescc: "⪩",
	gesdot: "⪀",
	gesdoto: "⪂",
	gesdotol: "⪄",
	gesl: "⋛︀",
	gesles: "⪔",
	gfr: "𝔤",
	gg: "≫",
	ggg: "⋙",
	gimel: "ℷ",
	gjcy: "ѓ",
	gl: "≷",
	glE: "⪒",
	gla: "⪥",
	glj: "⪤",
	gnE: "≩",
	gnap: "⪊",
	gnapprox: "⪊",
	gne: "⪈",
	gneq: "⪈",
	gneqq: "≩",
	gnsim: "⋧",
	gopf: "𝕘",
	grave: "`",
	gscr: "ℊ",
	gsim: "≳",
	gsime: "⪎",
	gsiml: "⪐",
	gt: ">",
	gtcc: "⪧",
	gtcir: "⩺",
	gtdot: "⋗",
	gtlPar: "⦕",
	gtquest: "⩼",
	gtrapprox: "⪆",
	gtrarr: "⥸",
	gtrdot: "⋗",
	gtreqless: "⋛",
	gtreqqless: "⪌",
	gtrless: "≷",
	gtrsim: "≳",
	gvertneqq: "≩︀",
	gvnE: "≩︀",
	hArr: "⇔",
	hairsp: " ",
	half: "½",
	hamilt: "ℋ",
	hardcy: "ъ",
	harr: "↔",
	harrcir: "⥈",
	harrw: "↭",
	hbar: "ℏ",
	hcirc: "ĥ",
	hearts: "♥",
	heartsuit: "♥",
	hellip: "…",
	hercon: "⊹",
	hfr: "𝔥",
	hksearow: "⤥",
	hkswarow: "⤦",
	hoarr: "⇿",
	homtht: "∻",
	hookleftarrow: "↩",
	hookrightarrow: "↪",
	hopf: "𝕙",
	horbar: "―",
	hscr: "𝒽",
	hslash: "ℏ",
	hstrok: "ħ",
	hybull: "⁃",
	hyphen: "‐",
	iacute: "í",
	ic: "⁣",
	icirc: "î",
	icy: "и",
	iecy: "е",
	iexcl: "¡",
	iff: "⇔",
	ifr: "𝔦",
	igrave: "ì",
	ii: "ⅈ",
	iiiint: "⨌",
	iiint: "∭",
	iinfin: "⧜",
	iiota: "℩",
	ijlig: "ĳ",
	imacr: "ī",
	image: "ℑ",
	imagline: "ℐ",
	imagpart: "ℑ",
	imath: "ı",
	imof: "⊷",
	imped: "Ƶ",
	in: "∈",
	incare: "℅",
	infin: "∞",
	infintie: "⧝",
	inodot: "ı",
	int: "∫",
	intcal: "⊺",
	integers: "ℤ",
	intercal: "⊺",
	intlarhk: "⨗",
	intprod: "⨼",
	iocy: "ё",
	iogon: "į",
	iopf: "𝕚",
	iota: "ι",
	iprod: "⨼",
	iquest: "¿",
	iscr: "𝒾",
	isin: "∈",
	isinE: "⋹",
	isindot: "⋵",
	isins: "⋴",
	isinsv: "⋳",
	isinv: "∈",
	it: "⁢",
	itilde: "ĩ",
	iukcy: "і",
	iuml: "ï",
	jcirc: "ĵ",
	jcy: "й",
	jfr: "𝔧",
	jmath: "ȷ",
	jopf: "𝕛",
	jscr: "𝒿",
	jsercy: "ј",
	jukcy: "є",
	kappa: "κ",
	kappav: "ϰ",
	kcedil: "ķ",
	kcy: "к",
	kfr: "𝔨",
	kgreen: "ĸ",
	khcy: "х",
	kjcy: "ќ",
	kopf: "𝕜",
	kscr: "𝓀",
	lAarr: "⇚",
	lArr: "⇐",
	lAtail: "⤛",
	lBarr: "⤎",
	lE: "≦",
	lEg: "⪋",
	lHar: "⥢",
	lacute: "ĺ",
	laemptyv: "⦴",
	lagran: "ℒ",
	lambda: "λ",
	lang: "⟨",
	langd: "⦑",
	langle: "⟨",
	lap: "⪅",
	laquo: "«",
	larr: "←",
	larrb: "⇤",
	larrbfs: "⤟",
	larrfs: "⤝",
	larrhk: "↩",
	larrlp: "↫",
	larrpl: "⤹",
	larrsim: "⥳",
	larrtl: "↢",
	lat: "⪫",
	latail: "⤙",
	late: "⪭",
	lates: "⪭︀",
	lbarr: "⤌",
	lbbrk: "❲",
	lbrace: "{",
	lbrack: "[",
	lbrke: "⦋",
	lbrksld: "⦏",
	lbrkslu: "⦍",
	lcaron: "ľ",
	lcedil: "ļ",
	lceil: "⌈",
	lcub: "{",
	lcy: "л",
	ldca: "⤶",
	ldquo: "“",
	ldquor: "„",
	ldrdhar: "⥧",
	ldrushar: "⥋",
	ldsh: "↲",
	le: "≤",
	leftarrow: "←",
	leftarrowtail: "↢",
	leftharpoondown: "↽",
	leftharpoonup: "↼",
	leftleftarrows: "⇇",
	leftrightarrow: "↔",
	leftrightarrows: "⇆",
	leftrightharpoons: "⇋",
	leftrightsquigarrow: "↭",
	leftthreetimes: "⋋",
	leg: "⋚",
	leq: "≤",
	leqq: "≦",
	leqslant: "⩽",
	les: "⩽",
	lescc: "⪨",
	lesdot: "⩿",
	lesdoto: "⪁",
	lesdotor: "⪃",
	lesg: "⋚︀",
	lesges: "⪓",
	lessapprox: "⪅",
	lessdot: "⋖",
	lesseqgtr: "⋚",
	lesseqqgtr: "⪋",
	lessgtr: "≶",
	lesssim: "≲",
	lfisht: "⥼",
	lfloor: "⌊",
	lfr: "𝔩",
	lg: "≶",
	lgE: "⪑",
	lhard: "↽",
	lharu: "↼",
	lharul: "⥪",
	lhblk: "▄",
	ljcy: "љ",
	ll: "≪",
	llarr: "⇇",
	llcorner: "⌞",
	llhard: "⥫",
	lltri: "◺",
	lmidot: "ŀ",
	lmoust: "⎰",
	lmoustache: "⎰",
	lnE: "≨",
	lnap: "⪉",
	lnapprox: "⪉",
	lne: "⪇",
	lneq: "⪇",
	lneqq: "≨",
	lnsim: "⋦",
	loang: "⟬",
	loarr: "⇽",
	lobrk: "⟦",
	longleftarrow: "⟵",
	longleftrightarrow: "⟷",
	longmapsto: "⟼",
	longrightarrow: "⟶",
	looparrowleft: "↫",
	looparrowright: "↬",
	lopar: "⦅",
	lopf: "𝕝",
	loplus: "⨭",
	lotimes: "⨴",
	lowast: "∗",
	lowbar: "_",
	loz: "◊",
	lozenge: "◊",
	lozf: "⧫",
	lpar: "(",
	lparlt: "⦓",
	lrarr: "⇆",
	lrcorner: "⌟",
	lrhar: "⇋",
	lrhard: "⥭",
	lrm: "‎",
	lrtri: "⊿",
	lsaquo: "‹",
	lscr: "𝓁",
	lsh: "↰",
	lsim: "≲",
	lsime: "⪍",
	lsimg: "⪏",
	lsqb: "[",
	lsquo: "‘",
	lsquor: "‚",
	lstrok: "ł",
	lt: "<",
	ltcc: "⪦",
	ltcir: "⩹",
	ltdot: "⋖",
	lthree: "⋋",
	ltimes: "⋉",
	ltlarr: "⥶",
	ltquest: "⩻",
	ltrPar: "⦖",
	ltri: "◃",
	ltrie: "⊴",
	ltrif: "◂",
	lurdshar: "⥊",
	luruhar: "⥦",
	lvertneqq: "≨︀",
	lvnE: "≨︀",
	mDDot: "∺",
	macr: "¯",
	male: "♂",
	malt: "✠",
	maltese: "✠",
	map: "↦",
	mapsto: "↦",
	mapstodown: "↧",
	mapstoleft: "↤",
	mapstoup: "↥",
	marker: "▮",
	mcomma: "⨩",
	mcy: "м",
	mdash: "—",
	measuredangle: "∡",
	mfr: "𝔪",
	mho: "℧",
	micro: "µ",
	mid: "∣",
	midast: "*",
	midcir: "⫰",
	middot: "·",
	minus: "−",
	minusb: "⊟",
	minusd: "∸",
	minusdu: "⨪",
	mlcp: "⫛",
	mldr: "…",
	mnplus: "∓",
	models: "⊧",
	mopf: "𝕞",
	mp: "∓",
	mscr: "𝓂",
	mstpos: "∾",
	mu: "μ",
	multimap: "⊸",
	mumap: "⊸",
	nGg: "⋙̸",
	nGt: "≫⃒",
	nGtv: "≫̸",
	nLeftarrow: "⇍",
	nLeftrightarrow: "⇎",
	nLl: "⋘̸",
	nLt: "≪⃒",
	nLtv: "≪̸",
	nRightarrow: "⇏",
	nVDash: "⊯",
	nVdash: "⊮",
	nabla: "∇",
	nacute: "ń",
	nang: "∠⃒",
	nap: "≉",
	napE: "⩰̸",
	napid: "≋̸",
	napos: "ŉ",
	napprox: "≉",
	natur: "♮",
	natural: "♮",
	naturals: "ℕ",
	nbsp: "\xA0",
	nbump: "≎̸",
	nbumpe: "≏̸",
	ncap: "⩃",
	ncaron: "ň",
	ncedil: "ņ",
	ncong: "≇",
	ncongdot: "⩭̸",
	ncup: "⩂",
	ncy: "н",
	ndash: "–",
	ne: "≠",
	neArr: "⇗",
	nearhk: "⤤",
	nearr: "↗",
	nearrow: "↗",
	nedot: "≐̸",
	nequiv: "≢",
	nesear: "⤨",
	nesim: "≂̸",
	nexist: "∄",
	nexists: "∄",
	nfr: "𝔫",
	ngE: "≧̸",
	nge: "≱",
	ngeq: "≱",
	ngeqq: "≧̸",
	ngeqslant: "⩾̸",
	nges: "⩾̸",
	ngsim: "≵",
	ngt: "≯",
	ngtr: "≯",
	nhArr: "⇎",
	nharr: "↮",
	nhpar: "⫲",
	ni: "∋",
	nis: "⋼",
	nisd: "⋺",
	niv: "∋",
	njcy: "њ",
	nlArr: "⇍",
	nlE: "≦̸",
	nlarr: "↚",
	nldr: "‥",
	nle: "≰",
	nleftarrow: "↚",
	nleftrightarrow: "↮",
	nleq: "≰",
	nleqq: "≦̸",
	nleqslant: "⩽̸",
	nles: "⩽̸",
	nless: "≮",
	nlsim: "≴",
	nlt: "≮",
	nltri: "⋪",
	nltrie: "⋬",
	nmid: "∤",
	nopf: "𝕟",
	not: "¬",
	notin: "∉",
	notinE: "⋹̸",
	notindot: "⋵̸",
	notinva: "∉",
	notinvb: "⋷",
	notinvc: "⋶",
	notni: "∌",
	notniva: "∌",
	notnivb: "⋾",
	notnivc: "⋽",
	npar: "∦",
	nparallel: "∦",
	nparsl: "⫽⃥",
	npart: "∂̸",
	npolint: "⨔",
	npr: "⊀",
	nprcue: "⋠",
	npre: "⪯̸",
	nprec: "⊀",
	npreceq: "⪯̸",
	nrArr: "⇏",
	nrarr: "↛",
	nrarrc: "⤳̸",
	nrarrw: "↝̸",
	nrightarrow: "↛",
	nrtri: "⋫",
	nrtrie: "⋭",
	nsc: "⊁",
	nsccue: "⋡",
	nsce: "⪰̸",
	nscr: "𝓃",
	nshortmid: "∤",
	nshortparallel: "∦",
	nsim: "≁",
	nsime: "≄",
	nsimeq: "≄",
	nsmid: "∤",
	nspar: "∦",
	nsqsube: "⋢",
	nsqsupe: "⋣",
	nsub: "⊄",
	nsubE: "⫅̸",
	nsube: "⊈",
	nsubset: "⊂⃒",
	nsubseteq: "⊈",
	nsubseteqq: "⫅̸",
	nsucc: "⊁",
	nsucceq: "⪰̸",
	nsup: "⊅",
	nsupE: "⫆̸",
	nsupe: "⊉",
	nsupset: "⊃⃒",
	nsupseteq: "⊉",
	nsupseteqq: "⫆̸",
	ntgl: "≹",
	ntilde: "ñ",
	ntlg: "≸",
	ntriangleleft: "⋪",
	ntrianglelefteq: "⋬",
	ntriangleright: "⋫",
	ntrianglerighteq: "⋭",
	nu: "ν",
	num: "#",
	numero: "№",
	numsp: " ",
	nvDash: "⊭",
	nvHarr: "⤄",
	nvap: "≍⃒",
	nvdash: "⊬",
	nvge: "≥⃒",
	nvgt: ">⃒",
	nvinfin: "⧞",
	nvlArr: "⤂",
	nvle: "≤⃒",
	nvlt: "<⃒",
	nvltrie: "⊴⃒",
	nvrArr: "⤃",
	nvrtrie: "⊵⃒",
	nvsim: "∼⃒",
	nwArr: "⇖",
	nwarhk: "⤣",
	nwarr: "↖",
	nwarrow: "↖",
	nwnear: "⤧",
	oS: "Ⓢ",
	oacute: "ó",
	oast: "⊛",
	ocir: "⊚",
	ocirc: "ô",
	ocy: "о",
	odash: "⊝",
	odblac: "ő",
	odiv: "⨸",
	odot: "⊙",
	odsold: "⦼",
	oelig: "œ",
	ofcir: "⦿",
	ofr: "𝔬",
	ogon: "˛",
	ograve: "ò",
	ogt: "⧁",
	ohbar: "⦵",
	ohm: "Ω",
	oint: "∮",
	olarr: "↺",
	olcir: "⦾",
	olcross: "⦻",
	oline: "‾",
	olt: "⧀",
	omacr: "ō",
	omega: "ω",
	omicron: "ο",
	omid: "⦶",
	ominus: "⊖",
	oopf: "𝕠",
	opar: "⦷",
	operp: "⦹",
	oplus: "⊕",
	or: "∨",
	orarr: "↻",
	ord: "⩝",
	order: "ℴ",
	orderof: "ℴ",
	ordf: "ª",
	ordm: "º",
	origof: "⊶",
	oror: "⩖",
	orslope: "⩗",
	orv: "⩛",
	oscr: "ℴ",
	oslash: "ø",
	osol: "⊘",
	otilde: "õ",
	otimes: "⊗",
	otimesas: "⨶",
	ouml: "ö",
	ovbar: "⌽",
	par: "∥",
	para: "¶",
	parallel: "∥",
	parsim: "⫳",
	parsl: "⫽",
	part: "∂",
	pcy: "п",
	percnt: "%",
	period: ".",
	permil: "‰",
	perp: "⊥",
	pertenk: "‱",
	pfr: "𝔭",
	phi: "φ",
	phiv: "ϕ",
	phmmat: "ℳ",
	phone: "☎",
	pi: "π",
	pitchfork: "⋔",
	piv: "ϖ",
	planck: "ℏ",
	planckh: "ℎ",
	plankv: "ℏ",
	plus: "+",
	plusacir: "⨣",
	plusb: "⊞",
	pluscir: "⨢",
	plusdo: "∔",
	plusdu: "⨥",
	pluse: "⩲",
	plusmn: "±",
	plussim: "⨦",
	plustwo: "⨧",
	pm: "±",
	pointint: "⨕",
	popf: "𝕡",
	pound: "£",
	pr: "≺",
	prE: "⪳",
	prap: "⪷",
	prcue: "≼",
	pre: "⪯",
	prec: "≺",
	precapprox: "⪷",
	preccurlyeq: "≼",
	preceq: "⪯",
	precnapprox: "⪹",
	precneqq: "⪵",
	precnsim: "⋨",
	precsim: "≾",
	prime: "′",
	primes: "ℙ",
	prnE: "⪵",
	prnap: "⪹",
	prnsim: "⋨",
	prod: "∏",
	profalar: "⌮",
	profline: "⌒",
	profsurf: "⌓",
	prop: "∝",
	propto: "∝",
	prsim: "≾",
	prurel: "⊰",
	pscr: "𝓅",
	psi: "ψ",
	puncsp: " ",
	qfr: "𝔮",
	qint: "⨌",
	qopf: "𝕢",
	qprime: "⁗",
	qscr: "𝓆",
	quaternions: "ℍ",
	quatint: "⨖",
	quest: "?",
	questeq: "≟",
	quot: "\"",
	rAarr: "⇛",
	rArr: "⇒",
	rAtail: "⤜",
	rBarr: "⤏",
	rHar: "⥤",
	race: "∽̱",
	racute: "ŕ",
	radic: "√",
	raemptyv: "⦳",
	rang: "⟩",
	rangd: "⦒",
	range: "⦥",
	rangle: "⟩",
	raquo: "»",
	rarr: "→",
	rarrap: "⥵",
	rarrb: "⇥",
	rarrbfs: "⤠",
	rarrc: "⤳",
	rarrfs: "⤞",
	rarrhk: "↪",
	rarrlp: "↬",
	rarrpl: "⥅",
	rarrsim: "⥴",
	rarrtl: "↣",
	rarrw: "↝",
	ratail: "⤚",
	ratio: "∶",
	rationals: "ℚ",
	rbarr: "⤍",
	rbbrk: "❳",
	rbrace: "}",
	rbrack: "]",
	rbrke: "⦌",
	rbrksld: "⦎",
	rbrkslu: "⦐",
	rcaron: "ř",
	rcedil: "ŗ",
	rceil: "⌉",
	rcub: "}",
	rcy: "р",
	rdca: "⤷",
	rdldhar: "⥩",
	rdquo: "”",
	rdquor: "”",
	rdsh: "↳",
	real: "ℜ",
	realine: "ℛ",
	realpart: "ℜ",
	reals: "ℝ",
	rect: "▭",
	reg: "®",
	rfisht: "⥽",
	rfloor: "⌋",
	rfr: "𝔯",
	rhard: "⇁",
	rharu: "⇀",
	rharul: "⥬",
	rho: "ρ",
	rhov: "ϱ",
	rightarrow: "→",
	rightarrowtail: "↣",
	rightharpoondown: "⇁",
	rightharpoonup: "⇀",
	rightleftarrows: "⇄",
	rightleftharpoons: "⇌",
	rightrightarrows: "⇉",
	rightsquigarrow: "↝",
	rightthreetimes: "⋌",
	ring: "˚",
	risingdotseq: "≓",
	rlarr: "⇄",
	rlhar: "⇌",
	rlm: "‏",
	rmoust: "⎱",
	rmoustache: "⎱",
	rnmid: "⫮",
	roang: "⟭",
	roarr: "⇾",
	robrk: "⟧",
	ropar: "⦆",
	ropf: "𝕣",
	roplus: "⨮",
	rotimes: "⨵",
	rpar: ")",
	rpargt: "⦔",
	rppolint: "⨒",
	rrarr: "⇉",
	rsaquo: "›",
	rscr: "𝓇",
	rsh: "↱",
	rsqb: "]",
	rsquo: "’",
	rsquor: "’",
	rthree: "⋌",
	rtimes: "⋊",
	rtri: "▹",
	rtrie: "⊵",
	rtrif: "▸",
	rtriltri: "⧎",
	ruluhar: "⥨",
	rx: "℞",
	sacute: "ś",
	sbquo: "‚",
	sc: "≻",
	scE: "⪴",
	scap: "⪸",
	scaron: "š",
	sccue: "≽",
	sce: "⪰",
	scedil: "ş",
	scirc: "ŝ",
	scnE: "⪶",
	scnap: "⪺",
	scnsim: "⋩",
	scpolint: "⨓",
	scsim: "≿",
	scy: "с",
	sdot: "⋅",
	sdotb: "⊡",
	sdote: "⩦",
	seArr: "⇘",
	searhk: "⤥",
	searr: "↘",
	searrow: "↘",
	sect: "§",
	semi: ";",
	seswar: "⤩",
	setminus: "∖",
	setmn: "∖",
	sext: "✶",
	sfr: "𝔰",
	sfrown: "⌢",
	sharp: "♯",
	shchcy: "щ",
	shcy: "ш",
	shortmid: "∣",
	shortparallel: "∥",
	shy: "­",
	sigma: "σ",
	sigmaf: "ς",
	sigmav: "ς",
	sim: "∼",
	simdot: "⩪",
	sime: "≃",
	simeq: "≃",
	simg: "⪞",
	simgE: "⪠",
	siml: "⪝",
	simlE: "⪟",
	simne: "≆",
	simplus: "⨤",
	simrarr: "⥲",
	slarr: "←",
	smallsetminus: "∖",
	smashp: "⨳",
	smeparsl: "⧤",
	smid: "∣",
	smile: "⌣",
	smt: "⪪",
	smte: "⪬",
	smtes: "⪬︀",
	softcy: "ь",
	sol: "/",
	solb: "⧄",
	solbar: "⌿",
	sopf: "𝕤",
	spades: "♠",
	spadesuit: "♠",
	spar: "∥",
	sqcap: "⊓",
	sqcaps: "⊓︀",
	sqcup: "⊔",
	sqcups: "⊔︀",
	sqsub: "⊏",
	sqsube: "⊑",
	sqsubset: "⊏",
	sqsubseteq: "⊑",
	sqsup: "⊐",
	sqsupe: "⊒",
	sqsupset: "⊐",
	sqsupseteq: "⊒",
	squ: "□",
	square: "□",
	squarf: "▪",
	squf: "▪",
	srarr: "→",
	sscr: "𝓈",
	ssetmn: "∖",
	ssmile: "⌣",
	sstarf: "⋆",
	star: "☆",
	starf: "★",
	straightepsilon: "ϵ",
	straightphi: "ϕ",
	strns: "¯",
	sub: "⊂",
	subE: "⫅",
	subdot: "⪽",
	sube: "⊆",
	subedot: "⫃",
	submult: "⫁",
	subnE: "⫋",
	subne: "⊊",
	subplus: "⪿",
	subrarr: "⥹",
	subset: "⊂",
	subseteq: "⊆",
	subseteqq: "⫅",
	subsetneq: "⊊",
	subsetneqq: "⫋",
	subsim: "⫇",
	subsub: "⫕",
	subsup: "⫓",
	succ: "≻",
	succapprox: "⪸",
	succcurlyeq: "≽",
	succeq: "⪰",
	succnapprox: "⪺",
	succneqq: "⪶",
	succnsim: "⋩",
	succsim: "≿",
	sum: "∑",
	sung: "♪",
	sup1: "¹",
	sup2: "²",
	sup3: "³",
	sup: "⊃",
	supE: "⫆",
	supdot: "⪾",
	supdsub: "⫘",
	supe: "⊇",
	supedot: "⫄",
	suphsol: "⟉",
	suphsub: "⫗",
	suplarr: "⥻",
	supmult: "⫂",
	supnE: "⫌",
	supne: "⊋",
	supplus: "⫀",
	supset: "⊃",
	supseteq: "⊇",
	supseteqq: "⫆",
	supsetneq: "⊋",
	supsetneqq: "⫌",
	supsim: "⫈",
	supsub: "⫔",
	supsup: "⫖",
	swArr: "⇙",
	swarhk: "⤦",
	swarr: "↙",
	swarrow: "↙",
	swnwar: "⤪",
	szlig: "ß",
	target: "⌖",
	tau: "τ",
	tbrk: "⎴",
	tcaron: "ť",
	tcedil: "ţ",
	tcy: "т",
	tdot: "⃛",
	telrec: "⌕",
	tfr: "𝔱",
	there4: "∴",
	therefore: "∴",
	theta: "θ",
	thetasym: "ϑ",
	thetav: "ϑ",
	thickapprox: "≈",
	thicksim: "∼",
	thinsp: " ",
	thkap: "≈",
	thksim: "∼",
	thorn: "þ",
	tilde: "˜",
	times: "×",
	timesb: "⊠",
	timesbar: "⨱",
	timesd: "⨰",
	tint: "∭",
	toea: "⤨",
	top: "⊤",
	topbot: "⌶",
	topcir: "⫱",
	topf: "𝕥",
	topfork: "⫚",
	tosa: "⤩",
	tprime: "‴",
	trade: "™",
	triangle: "▵",
	triangledown: "▿",
	triangleleft: "◃",
	trianglelefteq: "⊴",
	triangleq: "≜",
	triangleright: "▹",
	trianglerighteq: "⊵",
	tridot: "◬",
	trie: "≜",
	triminus: "⨺",
	triplus: "⨹",
	trisb: "⧍",
	tritime: "⨻",
	trpezium: "⏢",
	tscr: "𝓉",
	tscy: "ц",
	tshcy: "ћ",
	tstrok: "ŧ",
	twixt: "≬",
	twoheadleftarrow: "↞",
	twoheadrightarrow: "↠",
	uArr: "⇑",
	uHar: "⥣",
	uacute: "ú",
	uarr: "↑",
	ubrcy: "ў",
	ubreve: "ŭ",
	ucirc: "û",
	ucy: "у",
	udarr: "⇅",
	udblac: "ű",
	udhar: "⥮",
	ufisht: "⥾",
	ufr: "𝔲",
	ugrave: "ù",
	uharl: "↿",
	uharr: "↾",
	uhblk: "▀",
	ulcorn: "⌜",
	ulcorner: "⌜",
	ulcrop: "⌏",
	ultri: "◸",
	umacr: "ū",
	uml: "¨",
	uogon: "ų",
	uopf: "𝕦",
	uparrow: "↑",
	updownarrow: "↕",
	upharpoonleft: "↿",
	upharpoonright: "↾",
	uplus: "⊎",
	upsi: "υ",
	upsih: "ϒ",
	upsilon: "υ",
	upuparrows: "⇈",
	urcorn: "⌝",
	urcorner: "⌝",
	urcrop: "⌎",
	uring: "ů",
	urtri: "◹",
	uscr: "𝓊",
	utdot: "⋰",
	utilde: "ũ",
	utri: "▵",
	utrif: "▴",
	uuarr: "⇈",
	uuml: "ü",
	uwangle: "⦧",
	vArr: "⇕",
	vBar: "⫨",
	vBarv: "⫩",
	vDash: "⊨",
	vangrt: "⦜",
	varepsilon: "ϵ",
	varkappa: "ϰ",
	varnothing: "∅",
	varphi: "ϕ",
	varpi: "ϖ",
	varpropto: "∝",
	varr: "↕",
	varrho: "ϱ",
	varsigma: "ς",
	varsubsetneq: "⊊︀",
	varsubsetneqq: "⫋︀",
	varsupsetneq: "⊋︀",
	varsupsetneqq: "⫌︀",
	vartheta: "ϑ",
	vartriangleleft: "⊲",
	vartriangleright: "⊳",
	vcy: "в",
	vdash: "⊢",
	vee: "∨",
	veebar: "⊻",
	veeeq: "≚",
	vellip: "⋮",
	verbar: "|",
	vert: "|",
	vfr: "𝔳",
	vltri: "⊲",
	vnsub: "⊂⃒",
	vnsup: "⊃⃒",
	vopf: "𝕧",
	vprop: "∝",
	vrtri: "⊳",
	vscr: "𝓋",
	vsubnE: "⫋︀",
	vsubne: "⊊︀",
	vsupnE: "⫌︀",
	vsupne: "⊋︀",
	vzigzag: "⦚",
	wcirc: "ŵ",
	wedbar: "⩟",
	wedge: "∧",
	wedgeq: "≙",
	weierp: "℘",
	wfr: "𝔴",
	wopf: "𝕨",
	wp: "℘",
	wr: "≀",
	wreath: "≀",
	wscr: "𝓌",
	xcap: "⋂",
	xcirc: "◯",
	xcup: "⋃",
	xdtri: "▽",
	xfr: "𝔵",
	xhArr: "⟺",
	xharr: "⟷",
	xi: "ξ",
	xlArr: "⟸",
	xlarr: "⟵",
	xmap: "⟼",
	xnis: "⋻",
	xodot: "⨀",
	xopf: "𝕩",
	xoplus: "⨁",
	xotime: "⨂",
	xrArr: "⟹",
	xrarr: "⟶",
	xscr: "𝓍",
	xsqcup: "⨆",
	xuplus: "⨄",
	xutri: "△",
	xvee: "⋁",
	xwedge: "⋀",
	yacute: "ý",
	yacy: "я",
	ycirc: "ŷ",
	ycy: "ы",
	yen: "¥",
	yfr: "𝔶",
	yicy: "ї",
	yopf: "𝕪",
	yscr: "𝓎",
	yucy: "ю",
	yuml: "ÿ",
	zacute: "ź",
	zcaron: "ž",
	zcy: "з",
	zdot: "ż",
	zeetrf: "ℨ",
	zeta: "ζ",
	zfr: "𝔷",
	zhcy: "ж",
	zigrarr: "⇝",
	zopf: "𝕫",
	zscr: "𝓏",
	zwj: "‍",
	zwnj: "‌"
};
var own$1 = {}.hasOwnProperty;
function decodeNamedCharacterReference(value) {
	return own$1.call(characterEntities, value) ? characterEntities[value] : false;
}
function splice$1(list3, start, remove, items) {
	const end = list3.length;
	let chunkStart = 0;
	let parameters;
	if (start < 0) start = -start > end ? 0 : end + start;
	else start = start > end ? end : start;
	remove = remove > 0 ? remove : 0;
	if (items.length < 1e4) {
		parameters = Array.from(items);
		parameters.unshift(start, remove);
		list3.splice(...parameters);
	} else {
		if (remove) list3.splice(start, remove);
		while (chunkStart < items.length) {
			parameters = items.slice(chunkStart, chunkStart + 1e4);
			parameters.unshift(start, 0);
			list3.splice(...parameters);
			chunkStart += 1e4;
			start += 1e4;
		}
	}
}
function push(list3, items) {
	if (list3.length > 0) {
		splice$1(list3, list3.length, 0, items);
		return list3;
	}
	return items;
}
var hasOwnProperty$1 = {}.hasOwnProperty;
function combineExtensions$1(extensions) {
	const all2 = {};
	let index2 = -1;
	while (++index2 < extensions.length) syntaxExtension$1(all2, extensions[index2]);
	return all2;
}
function syntaxExtension$1(all2, extension2) {
	let hook;
	for (hook in extension2) {
		const left = (hasOwnProperty$1.call(all2, hook) ? all2[hook] : void 0) || (all2[hook] = {});
		const right = extension2[hook];
		let code2;
		if (right) for (code2 in right) {
			if (!hasOwnProperty$1.call(left, code2)) left[code2] = [];
			const value = right[code2];
			constructs$1(left[code2], Array.isArray(value) ? value : value ? [value] : []);
		}
	}
}
function constructs$1(existing, list3) {
	let index2 = -1;
	const before = [];
	while (++index2 < list3.length) (list3[index2].add === "after" ? existing : before).push(list3[index2]);
	splice$1(existing, 0, 0, before);
}
function decodeNumericCharacterReference(value, base) {
	const code2 = Number.parseInt(value, base);
	if (code2 < 9 || code2 === 11 || code2 > 13 && code2 < 32 || code2 > 126 && code2 < 160 || code2 > 55295 && code2 < 57344 || code2 > 64975 && code2 < 65008 || (code2 & 65535) === 65535 || (code2 & 65535) === 65534 || code2 > 1114111) return "�";
	return String.fromCodePoint(code2);
}
function normalizeIdentifier$1(value) {
	return value.replace(/[\t\n\r ]+/g, " ").replace(/^ | $/g, "").toLowerCase().toUpperCase();
}
var asciiAlpha$1 = regexCheck$1(/[A-Za-z]/);
var asciiAlphanumeric$1 = regexCheck$1(/[\dA-Za-z]/);
var asciiAtext = regexCheck$1(/[#-'*+\--9=?A-Z^-~]/);
function asciiControl$1(code2) {
	return code2 !== null && (code2 < 32 || code2 === 127);
}
var asciiDigit = regexCheck$1(/\d/);
var asciiHexDigit = regexCheck$1(/[\dA-Fa-f]/);
var asciiPunctuation = regexCheck$1(/[!-/:-@[-`{-~]/);
function markdownLineEnding$1(code2) {
	return code2 !== null && code2 < -2;
}
function markdownLineEndingOrSpace$1(code2) {
	return code2 !== null && (code2 < 0 || code2 === 32);
}
function markdownSpace$1(code2) {
	return code2 === -2 || code2 === -1 || code2 === 32;
}
var unicodePunctuation$1 = regexCheck$1(/\p{P}|\p{S}/u);
var unicodeWhitespace$1 = regexCheck$1(/\s/);
function regexCheck$1(regex) {
	return check;
	function check(code2) {
		return code2 !== null && code2 > -1 && regex.test(String.fromCharCode(code2));
	}
}
function normalizeUri(value) {
	const result = [];
	let index2 = -1;
	let start = 0;
	let skip = 0;
	while (++index2 < value.length) {
		const code2 = value.charCodeAt(index2);
		let replace = "";
		if (code2 === 37 && asciiAlphanumeric$1(value.charCodeAt(index2 + 1)) && asciiAlphanumeric$1(value.charCodeAt(index2 + 2))) skip = 2;
		else if (code2 < 128) {
			if (!/[!#$&-;=?-Z_a-z~]/.test(String.fromCharCode(code2))) replace = String.fromCharCode(code2);
		} else if (code2 > 55295 && code2 < 57344) {
			const next = value.charCodeAt(index2 + 1);
			if (code2 < 56320 && next > 56319 && next < 57344) {
				replace = String.fromCharCode(code2, next);
				skip = 1;
			} else replace = "�";
		} else replace = String.fromCharCode(code2);
		if (replace) {
			result.push(value.slice(start, index2), encodeURIComponent(replace));
			start = index2 + skip + 1;
			replace = "";
		}
		if (skip) {
			index2 += skip;
			skip = 0;
		}
	}
	return result.join("") + value.slice(start);
}
function factorySpace$1(effects, ok3, type, max) {
	const limit = max ? max - 1 : Number.POSITIVE_INFINITY;
	let size = 0;
	return start;
	function start(code2) {
		if (markdownSpace$1(code2)) {
			effects.enter(type);
			return prefix(code2);
		}
		return ok3(code2);
	}
	function prefix(code2) {
		if (markdownSpace$1(code2) && size++ < limit) {
			effects.consume(code2);
			return prefix;
		}
		effects.exit(type);
		return ok3(code2);
	}
}
var content = { tokenize: initializeContent };
function initializeContent(effects) {
	const contentStart = effects.attempt(this.parser.constructs.contentInitial, afterContentStartConstruct, paragraphInitial);
	let previous2;
	return contentStart;
	function afterContentStartConstruct(code2) {
		if (code2 === null) {
			effects.consume(code2);
			return;
		}
		effects.enter("lineEnding");
		effects.consume(code2);
		effects.exit("lineEnding");
		return factorySpace$1(effects, contentStart, "linePrefix");
	}
	function paragraphInitial(code2) {
		effects.enter("paragraph");
		return lineStart(code2);
	}
	function lineStart(code2) {
		const token = effects.enter("chunkText", {
			contentType: "text",
			previous: previous2
		});
		if (previous2) previous2.next = token;
		previous2 = token;
		return data(code2);
	}
	function data(code2) {
		if (code2 === null) {
			effects.exit("chunkText");
			effects.exit("paragraph");
			effects.consume(code2);
			return;
		}
		if (markdownLineEnding$1(code2)) {
			effects.consume(code2);
			effects.exit("chunkText");
			return lineStart;
		}
		effects.consume(code2);
		return data;
	}
}
var document$1 = { tokenize: initializeDocument };
var containerConstruct = { tokenize: tokenizeContainer };
function initializeDocument(effects) {
	const self2 = this;
	const stack = [];
	let continued = 0;
	let childFlow;
	let childToken;
	let lineStartOffset;
	return start;
	function start(code2) {
		if (continued < stack.length) {
			const item = stack[continued];
			self2.containerState = item[1];
			return effects.attempt(item[0].continuation, documentContinue, checkNewContainers)(code2);
		}
		return checkNewContainers(code2);
	}
	function documentContinue(code2) {
		continued++;
		if (self2.containerState._closeFlow) {
			self2.containerState._closeFlow = void 0;
			if (childFlow) closeFlow();
			const indexBeforeExits = self2.events.length;
			let indexBeforeFlow = indexBeforeExits;
			let point4;
			while (indexBeforeFlow--) if (self2.events[indexBeforeFlow][0] === "exit" && self2.events[indexBeforeFlow][1].type === "chunkFlow") {
				point4 = self2.events[indexBeforeFlow][1].end;
				break;
			}
			exitContainers(continued);
			let index2 = indexBeforeExits;
			while (index2 < self2.events.length) {
				self2.events[index2][1].end = { ...point4 };
				index2++;
			}
			splice$1(self2.events, indexBeforeFlow + 1, 0, self2.events.slice(indexBeforeExits));
			self2.events.length = index2;
			return checkNewContainers(code2);
		}
		return start(code2);
	}
	function checkNewContainers(code2) {
		if (continued === stack.length) {
			if (!childFlow) return documentContinued(code2);
			if (childFlow.currentConstruct && childFlow.currentConstruct.concrete) return flowStart(code2);
			self2.interrupt = Boolean(childFlow.currentConstruct && !childFlow._gfmTableDynamicInterruptHack);
		}
		self2.containerState = {};
		return effects.check(containerConstruct, thereIsANewContainer, thereIsNoNewContainer)(code2);
	}
	function thereIsANewContainer(code2) {
		if (childFlow) closeFlow();
		exitContainers(continued);
		return documentContinued(code2);
	}
	function thereIsNoNewContainer(code2) {
		self2.parser.lazy[self2.now().line] = continued !== stack.length;
		lineStartOffset = self2.now().offset;
		return flowStart(code2);
	}
	function documentContinued(code2) {
		self2.containerState = {};
		return effects.attempt(containerConstruct, containerContinue, flowStart)(code2);
	}
	function containerContinue(code2) {
		continued++;
		stack.push([self2.currentConstruct, self2.containerState]);
		return documentContinued(code2);
	}
	function flowStart(code2) {
		if (code2 === null) {
			if (childFlow) closeFlow();
			exitContainers(0);
			effects.consume(code2);
			return;
		}
		childFlow = childFlow || self2.parser.flow(self2.now());
		effects.enter("chunkFlow", {
			_tokenizer: childFlow,
			contentType: "flow",
			previous: childToken
		});
		return flowContinue(code2);
	}
	function flowContinue(code2) {
		if (code2 === null) {
			writeToChild(effects.exit("chunkFlow"), true);
			exitContainers(0);
			effects.consume(code2);
			return;
		}
		if (markdownLineEnding$1(code2)) {
			effects.consume(code2);
			writeToChild(effects.exit("chunkFlow"));
			continued = 0;
			self2.interrupt = void 0;
			return start;
		}
		effects.consume(code2);
		return flowContinue;
	}
	function writeToChild(token, endOfFile) {
		const stream = self2.sliceStream(token);
		if (endOfFile) stream.push(null);
		token.previous = childToken;
		if (childToken) childToken.next = token;
		childToken = token;
		childFlow.defineSkip(token.start);
		childFlow.write(stream);
		if (self2.parser.lazy[token.start.line]) {
			let index2 = childFlow.events.length;
			while (index2--) if (childFlow.events[index2][1].start.offset < lineStartOffset && (!childFlow.events[index2][1].end || childFlow.events[index2][1].end.offset > lineStartOffset)) return;
			const indexBeforeExits = self2.events.length;
			let indexBeforeFlow = indexBeforeExits;
			let seen;
			let point4;
			while (indexBeforeFlow--) if (self2.events[indexBeforeFlow][0] === "exit" && self2.events[indexBeforeFlow][1].type === "chunkFlow") {
				if (seen) {
					point4 = self2.events[indexBeforeFlow][1].end;
					break;
				}
				seen = true;
			}
			exitContainers(continued);
			index2 = indexBeforeExits;
			while (index2 < self2.events.length) {
				self2.events[index2][1].end = { ...point4 };
				index2++;
			}
			splice$1(self2.events, indexBeforeFlow + 1, 0, self2.events.slice(indexBeforeExits));
			self2.events.length = index2;
		}
	}
	function exitContainers(size) {
		let index2 = stack.length;
		while (index2-- > size) {
			const entry = stack[index2];
			self2.containerState = entry[1];
			entry[0].exit.call(self2, effects);
		}
		stack.length = size;
	}
	function closeFlow() {
		childFlow.write([null]);
		childToken = void 0;
		childFlow = void 0;
		self2.containerState._closeFlow = void 0;
	}
}
function tokenizeContainer(effects, ok3, nok) {
	return factorySpace$1(effects, effects.attempt(this.parser.constructs.document, ok3, nok), "linePrefix", this.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4);
}
function classifyCharacter$1(code2) {
	if (code2 === null || markdownLineEndingOrSpace$1(code2) || unicodeWhitespace$1(code2)) return 1;
	if (unicodePunctuation$1(code2)) return 2;
}
function resolveAll$1(constructs2, events, context) {
	const called = [];
	let index2 = -1;
	while (++index2 < constructs2.length) {
		const resolve = constructs2[index2].resolveAll;
		if (resolve && !called.includes(resolve)) {
			events = resolve(events, context);
			called.push(resolve);
		}
	}
	return events;
}
var attention = {
	name: "attention",
	resolveAll: resolveAllAttention,
	tokenize: tokenizeAttention
};
function resolveAllAttention(events, context) {
	let index2 = -1;
	let open;
	let group;
	let text4;
	let openingSequence;
	let closingSequence;
	let use;
	let nextEvents;
	let offset;
	while (++index2 < events.length) if (events[index2][0] === "enter" && events[index2][1].type === "attentionSequence" && events[index2][1]._close) {
		open = index2;
		while (open--) if (events[open][0] === "exit" && events[open][1].type === "attentionSequence" && events[open][1]._open && context.sliceSerialize(events[open][1]).charCodeAt(0) === context.sliceSerialize(events[index2][1]).charCodeAt(0)) {
			if ((events[open][1]._close || events[index2][1]._open) && (events[index2][1].end.offset - events[index2][1].start.offset) % 3 && !((events[open][1].end.offset - events[open][1].start.offset + events[index2][1].end.offset - events[index2][1].start.offset) % 3)) continue;
			use = events[open][1].end.offset - events[open][1].start.offset > 1 && events[index2][1].end.offset - events[index2][1].start.offset > 1 ? 2 : 1;
			const start = { ...events[open][1].end };
			const end = { ...events[index2][1].start };
			movePoint(start, -use);
			movePoint(end, use);
			openingSequence = {
				type: use > 1 ? "strongSequence" : "emphasisSequence",
				start,
				end: { ...events[open][1].end }
			};
			closingSequence = {
				type: use > 1 ? "strongSequence" : "emphasisSequence",
				start: { ...events[index2][1].start },
				end
			};
			text4 = {
				type: use > 1 ? "strongText" : "emphasisText",
				start: { ...events[open][1].end },
				end: { ...events[index2][1].start }
			};
			group = {
				type: use > 1 ? "strong" : "emphasis",
				start: { ...openingSequence.start },
				end: { ...closingSequence.end }
			};
			events[open][1].end = { ...openingSequence.start };
			events[index2][1].start = { ...closingSequence.end };
			nextEvents = [];
			if (events[open][1].end.offset - events[open][1].start.offset) nextEvents = push(nextEvents, [[
				"enter",
				events[open][1],
				context
			], [
				"exit",
				events[open][1],
				context
			]]);
			nextEvents = push(nextEvents, [
				[
					"enter",
					group,
					context
				],
				[
					"enter",
					openingSequence,
					context
				],
				[
					"exit",
					openingSequence,
					context
				],
				[
					"enter",
					text4,
					context
				]
			]);
			nextEvents = push(nextEvents, resolveAll$1(context.parser.constructs.insideSpan.null, events.slice(open + 1, index2), context));
			nextEvents = push(nextEvents, [
				[
					"exit",
					text4,
					context
				],
				[
					"enter",
					closingSequence,
					context
				],
				[
					"exit",
					closingSequence,
					context
				],
				[
					"exit",
					group,
					context
				]
			]);
			if (events[index2][1].end.offset - events[index2][1].start.offset) {
				offset = 2;
				nextEvents = push(nextEvents, [[
					"enter",
					events[index2][1],
					context
				], [
					"exit",
					events[index2][1],
					context
				]]);
			} else offset = 0;
			splice$1(events, open - 1, index2 - open + 3, nextEvents);
			index2 = open + nextEvents.length - offset - 2;
			break;
		}
	}
	index2 = -1;
	while (++index2 < events.length) if (events[index2][1].type === "attentionSequence") events[index2][1].type = "data";
	return events;
}
function tokenizeAttention(effects, ok3) {
	const attentionMarkers2 = this.parser.constructs.attentionMarkers.null;
	const previous2 = this.previous;
	const before = classifyCharacter$1(previous2);
	let marker;
	return start;
	function start(code2) {
		marker = code2;
		effects.enter("attentionSequence");
		return inside(code2);
	}
	function inside(code2) {
		if (code2 === marker) {
			effects.consume(code2);
			return inside;
		}
		const token = effects.exit("attentionSequence");
		const after = classifyCharacter$1(code2);
		const open = !after || after === 2 && before || attentionMarkers2.includes(code2);
		const close = !before || before === 2 && after || attentionMarkers2.includes(previous2);
		token._open = Boolean(marker === 42 ? open : open && (before || !close));
		token._close = Boolean(marker === 42 ? close : close && (after || !open));
		return ok3(code2);
	}
}
function movePoint(point4, offset) {
	point4.column += offset;
	point4.offset += offset;
	point4._bufferIndex += offset;
}
var autolink = {
	name: "autolink",
	tokenize: tokenizeAutolink
};
function tokenizeAutolink(effects, ok3, nok) {
	let size = 0;
	return start;
	function start(code2) {
		effects.enter("autolink");
		effects.enter("autolinkMarker");
		effects.consume(code2);
		effects.exit("autolinkMarker");
		effects.enter("autolinkProtocol");
		return open;
	}
	function open(code2) {
		if (asciiAlpha$1(code2)) {
			effects.consume(code2);
			return schemeOrEmailAtext;
		}
		if (code2 === 64) return nok(code2);
		return emailAtext(code2);
	}
	function schemeOrEmailAtext(code2) {
		if (code2 === 43 || code2 === 45 || code2 === 46 || asciiAlphanumeric$1(code2)) {
			size = 1;
			return schemeInsideOrEmailAtext(code2);
		}
		return emailAtext(code2);
	}
	function schemeInsideOrEmailAtext(code2) {
		if (code2 === 58) {
			effects.consume(code2);
			size = 0;
			return urlInside;
		}
		if ((code2 === 43 || code2 === 45 || code2 === 46 || asciiAlphanumeric$1(code2)) && size++ < 32) {
			effects.consume(code2);
			return schemeInsideOrEmailAtext;
		}
		size = 0;
		return emailAtext(code2);
	}
	function urlInside(code2) {
		if (code2 === 62) {
			effects.exit("autolinkProtocol");
			effects.enter("autolinkMarker");
			effects.consume(code2);
			effects.exit("autolinkMarker");
			effects.exit("autolink");
			return ok3;
		}
		if (code2 === null || code2 === 32 || code2 === 60 || asciiControl$1(code2)) return nok(code2);
		effects.consume(code2);
		return urlInside;
	}
	function emailAtext(code2) {
		if (code2 === 64) {
			effects.consume(code2);
			return emailAtSignOrDot;
		}
		if (asciiAtext(code2)) {
			effects.consume(code2);
			return emailAtext;
		}
		return nok(code2);
	}
	function emailAtSignOrDot(code2) {
		return asciiAlphanumeric$1(code2) ? emailLabel(code2) : nok(code2);
	}
	function emailLabel(code2) {
		if (code2 === 46) {
			effects.consume(code2);
			size = 0;
			return emailAtSignOrDot;
		}
		if (code2 === 62) {
			effects.exit("autolinkProtocol").type = "autolinkEmail";
			effects.enter("autolinkMarker");
			effects.consume(code2);
			effects.exit("autolinkMarker");
			effects.exit("autolink");
			return ok3;
		}
		return emailValue(code2);
	}
	function emailValue(code2) {
		if ((code2 === 45 || asciiAlphanumeric$1(code2)) && size++ < 63) {
			const next = code2 === 45 ? emailValue : emailLabel;
			effects.consume(code2);
			return next;
		}
		return nok(code2);
	}
}
var blankLine$1 = {
	partial: true,
	tokenize: tokenizeBlankLine$1
};
function tokenizeBlankLine$1(effects, ok3, nok) {
	return start;
	function start(code2) {
		return markdownSpace$1(code2) ? factorySpace$1(effects, after, "linePrefix")(code2) : after(code2);
	}
	function after(code2) {
		return code2 === null || markdownLineEnding$1(code2) ? ok3(code2) : nok(code2);
	}
}
var blockQuote = {
	continuation: { tokenize: tokenizeBlockQuoteContinuation },
	exit: exit$1,
	name: "blockQuote",
	tokenize: tokenizeBlockQuoteStart
};
function tokenizeBlockQuoteStart(effects, ok3, nok) {
	const self2 = this;
	return start;
	function start(code2) {
		if (code2 === 62) {
			const state = self2.containerState;
			if (!state.open) {
				effects.enter("blockQuote", { _container: true });
				state.open = true;
			}
			effects.enter("blockQuotePrefix");
			effects.enter("blockQuoteMarker");
			effects.consume(code2);
			effects.exit("blockQuoteMarker");
			return after;
		}
		return nok(code2);
	}
	function after(code2) {
		if (markdownSpace$1(code2)) {
			effects.enter("blockQuotePrefixWhitespace");
			effects.consume(code2);
			effects.exit("blockQuotePrefixWhitespace");
			effects.exit("blockQuotePrefix");
			return ok3;
		}
		effects.exit("blockQuotePrefix");
		return ok3(code2);
	}
}
function tokenizeBlockQuoteContinuation(effects, ok3, nok) {
	const self2 = this;
	return contStart;
	function contStart(code2) {
		if (markdownSpace$1(code2)) return factorySpace$1(effects, contBefore, "linePrefix", self2.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code2);
		return contBefore(code2);
	}
	function contBefore(code2) {
		return effects.attempt(blockQuote, ok3, nok)(code2);
	}
}
function exit$1(effects) {
	effects.exit("blockQuote");
}
var characterEscape = {
	name: "characterEscape",
	tokenize: tokenizeCharacterEscape
};
function tokenizeCharacterEscape(effects, ok3, nok) {
	return start;
	function start(code2) {
		effects.enter("characterEscape");
		effects.enter("escapeMarker");
		effects.consume(code2);
		effects.exit("escapeMarker");
		return inside;
	}
	function inside(code2) {
		if (asciiPunctuation(code2)) {
			effects.enter("characterEscapeValue");
			effects.consume(code2);
			effects.exit("characterEscapeValue");
			effects.exit("characterEscape");
			return ok3;
		}
		return nok(code2);
	}
}
var characterReference = {
	name: "characterReference",
	tokenize: tokenizeCharacterReference
};
function tokenizeCharacterReference(effects, ok3, nok) {
	const self2 = this;
	let size = 0;
	let max;
	let test;
	return start;
	function start(code2) {
		effects.enter("characterReference");
		effects.enter("characterReferenceMarker");
		effects.consume(code2);
		effects.exit("characterReferenceMarker");
		return open;
	}
	function open(code2) {
		if (code2 === 35) {
			effects.enter("characterReferenceMarkerNumeric");
			effects.consume(code2);
			effects.exit("characterReferenceMarkerNumeric");
			return numeric;
		}
		effects.enter("characterReferenceValue");
		max = 31;
		test = asciiAlphanumeric$1;
		return value(code2);
	}
	function numeric(code2) {
		if (code2 === 88 || code2 === 120) {
			effects.enter("characterReferenceMarkerHexadecimal");
			effects.consume(code2);
			effects.exit("characterReferenceMarkerHexadecimal");
			effects.enter("characterReferenceValue");
			max = 6;
			test = asciiHexDigit;
			return value;
		}
		effects.enter("characterReferenceValue");
		max = 7;
		test = asciiDigit;
		return value(code2);
	}
	function value(code2) {
		if (code2 === 59 && size) {
			const token = effects.exit("characterReferenceValue");
			if (test === asciiAlphanumeric$1 && !decodeNamedCharacterReference(self2.sliceSerialize(token))) return nok(code2);
			effects.enter("characterReferenceMarker");
			effects.consume(code2);
			effects.exit("characterReferenceMarker");
			effects.exit("characterReference");
			return ok3;
		}
		if (test(code2) && size++ < max) {
			effects.consume(code2);
			return value;
		}
		return nok(code2);
	}
}
var nonLazyContinuation = {
	partial: true,
	tokenize: tokenizeNonLazyContinuation
};
var codeFenced = {
	concrete: true,
	name: "codeFenced",
	tokenize: tokenizeCodeFenced
};
function tokenizeCodeFenced(effects, ok3, nok) {
	const self2 = this;
	const closeStart = {
		partial: true,
		tokenize: tokenizeCloseStart
	};
	let initialPrefix = 0;
	let sizeOpen = 0;
	let marker;
	return start;
	function start(code2) {
		return beforeSequenceOpen(code2);
	}
	function beforeSequenceOpen(code2) {
		const tail = self2.events[self2.events.length - 1];
		initialPrefix = tail && tail[1].type === "linePrefix" ? tail[2].sliceSerialize(tail[1], true).length : 0;
		marker = code2;
		effects.enter("codeFenced");
		effects.enter("codeFencedFence");
		effects.enter("codeFencedFenceSequence");
		return sequenceOpen(code2);
	}
	function sequenceOpen(code2) {
		if (code2 === marker) {
			sizeOpen++;
			effects.consume(code2);
			return sequenceOpen;
		}
		if (sizeOpen < 3) return nok(code2);
		effects.exit("codeFencedFenceSequence");
		return markdownSpace$1(code2) ? factorySpace$1(effects, infoBefore, "whitespace")(code2) : infoBefore(code2);
	}
	function infoBefore(code2) {
		if (code2 === null || markdownLineEnding$1(code2)) {
			effects.exit("codeFencedFence");
			return self2.interrupt ? ok3(code2) : effects.check(nonLazyContinuation, atNonLazyBreak, after)(code2);
		}
		effects.enter("codeFencedFenceInfo");
		effects.enter("chunkString", { contentType: "string" });
		return info(code2);
	}
	function info(code2) {
		if (code2 === null || markdownLineEnding$1(code2)) {
			effects.exit("chunkString");
			effects.exit("codeFencedFenceInfo");
			return infoBefore(code2);
		}
		if (markdownSpace$1(code2)) {
			effects.exit("chunkString");
			effects.exit("codeFencedFenceInfo");
			return factorySpace$1(effects, metaBefore, "whitespace")(code2);
		}
		if (code2 === 96 && code2 === marker) return nok(code2);
		effects.consume(code2);
		return info;
	}
	function metaBefore(code2) {
		if (code2 === null || markdownLineEnding$1(code2)) return infoBefore(code2);
		effects.enter("codeFencedFenceMeta");
		effects.enter("chunkString", { contentType: "string" });
		return meta(code2);
	}
	function meta(code2) {
		if (code2 === null || markdownLineEnding$1(code2)) {
			effects.exit("chunkString");
			effects.exit("codeFencedFenceMeta");
			return infoBefore(code2);
		}
		if (code2 === 96 && code2 === marker) return nok(code2);
		effects.consume(code2);
		return meta;
	}
	function atNonLazyBreak(code2) {
		return effects.attempt(closeStart, after, contentBefore)(code2);
	}
	function contentBefore(code2) {
		effects.enter("lineEnding");
		effects.consume(code2);
		effects.exit("lineEnding");
		return contentStart;
	}
	function contentStart(code2) {
		return initialPrefix > 0 && markdownSpace$1(code2) ? factorySpace$1(effects, beforeContentChunk, "linePrefix", initialPrefix + 1)(code2) : beforeContentChunk(code2);
	}
	function beforeContentChunk(code2) {
		if (code2 === null || markdownLineEnding$1(code2)) return effects.check(nonLazyContinuation, atNonLazyBreak, after)(code2);
		effects.enter("codeFlowValue");
		return contentChunk(code2);
	}
	function contentChunk(code2) {
		if (code2 === null || markdownLineEnding$1(code2)) {
			effects.exit("codeFlowValue");
			return beforeContentChunk(code2);
		}
		effects.consume(code2);
		return contentChunk;
	}
	function after(code2) {
		effects.exit("codeFenced");
		return ok3(code2);
	}
	function tokenizeCloseStart(effects2, ok4, nok2) {
		let size = 0;
		return startBefore;
		function startBefore(code2) {
			effects2.enter("lineEnding");
			effects2.consume(code2);
			effects2.exit("lineEnding");
			return start2;
		}
		function start2(code2) {
			effects2.enter("codeFencedFence");
			return markdownSpace$1(code2) ? factorySpace$1(effects2, beforeSequenceClose, "linePrefix", self2.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code2) : beforeSequenceClose(code2);
		}
		function beforeSequenceClose(code2) {
			if (code2 === marker) {
				effects2.enter("codeFencedFenceSequence");
				return sequenceClose(code2);
			}
			return nok2(code2);
		}
		function sequenceClose(code2) {
			if (code2 === marker) {
				size++;
				effects2.consume(code2);
				return sequenceClose;
			}
			if (size >= sizeOpen) {
				effects2.exit("codeFencedFenceSequence");
				return markdownSpace$1(code2) ? factorySpace$1(effects2, sequenceCloseAfter, "whitespace")(code2) : sequenceCloseAfter(code2);
			}
			return nok2(code2);
		}
		function sequenceCloseAfter(code2) {
			if (code2 === null || markdownLineEnding$1(code2)) {
				effects2.exit("codeFencedFence");
				return ok4(code2);
			}
			return nok2(code2);
		}
	}
}
function tokenizeNonLazyContinuation(effects, ok3, nok) {
	const self2 = this;
	return start;
	function start(code2) {
		if (code2 === null) return nok(code2);
		effects.enter("lineEnding");
		effects.consume(code2);
		effects.exit("lineEnding");
		return lineStart;
	}
	function lineStart(code2) {
		return self2.parser.lazy[self2.now().line] ? nok(code2) : ok3(code2);
	}
}
var codeIndented = {
	name: "codeIndented",
	tokenize: tokenizeCodeIndented
};
var furtherStart = {
	partial: true,
	tokenize: tokenizeFurtherStart
};
function tokenizeCodeIndented(effects, ok3, nok) {
	const self2 = this;
	return start;
	function start(code2) {
		effects.enter("codeIndented");
		return factorySpace$1(effects, afterPrefix, "linePrefix", 5)(code2);
	}
	function afterPrefix(code2) {
		const tail = self2.events[self2.events.length - 1];
		return tail && tail[1].type === "linePrefix" && tail[2].sliceSerialize(tail[1], true).length >= 4 ? atBreak(code2) : nok(code2);
	}
	function atBreak(code2) {
		if (code2 === null) return after(code2);
		if (markdownLineEnding$1(code2)) return effects.attempt(furtherStart, atBreak, after)(code2);
		effects.enter("codeFlowValue");
		return inside(code2);
	}
	function inside(code2) {
		if (code2 === null || markdownLineEnding$1(code2)) {
			effects.exit("codeFlowValue");
			return atBreak(code2);
		}
		effects.consume(code2);
		return inside;
	}
	function after(code2) {
		effects.exit("codeIndented");
		return ok3(code2);
	}
}
function tokenizeFurtherStart(effects, ok3, nok) {
	const self2 = this;
	return furtherStart2;
	function furtherStart2(code2) {
		if (self2.parser.lazy[self2.now().line]) return nok(code2);
		if (markdownLineEnding$1(code2)) {
			effects.enter("lineEnding");
			effects.consume(code2);
			effects.exit("lineEnding");
			return furtherStart2;
		}
		return factorySpace$1(effects, afterPrefix, "linePrefix", 5)(code2);
	}
	function afterPrefix(code2) {
		const tail = self2.events[self2.events.length - 1];
		return tail && tail[1].type === "linePrefix" && tail[2].sliceSerialize(tail[1], true).length >= 4 ? ok3(code2) : markdownLineEnding$1(code2) ? furtherStart2(code2) : nok(code2);
	}
}
var codeText = {
	name: "codeText",
	previous: previous$1,
	resolve: resolveCodeText,
	tokenize: tokenizeCodeText
};
function resolveCodeText(events) {
	let tailExitIndex = events.length - 4;
	let headEnterIndex = 3;
	let index2;
	let enter;
	if ((events[headEnterIndex][1].type === "lineEnding" || events[headEnterIndex][1].type === "space") && (events[tailExitIndex][1].type === "lineEnding" || events[tailExitIndex][1].type === "space")) {
		index2 = headEnterIndex;
		while (++index2 < tailExitIndex) if (events[index2][1].type === "codeTextData") {
			events[headEnterIndex][1].type = "codeTextPadding";
			events[tailExitIndex][1].type = "codeTextPadding";
			headEnterIndex += 2;
			tailExitIndex -= 2;
			break;
		}
	}
	index2 = headEnterIndex - 1;
	tailExitIndex++;
	while (++index2 <= tailExitIndex) if (enter === void 0) {
		if (index2 !== tailExitIndex && events[index2][1].type !== "lineEnding") enter = index2;
	} else if (index2 === tailExitIndex || events[index2][1].type === "lineEnding") {
		events[enter][1].type = "codeTextData";
		if (index2 !== enter + 2) {
			events[enter][1].end = events[index2 - 1][1].end;
			events.splice(enter + 2, index2 - enter - 2);
			tailExitIndex -= index2 - enter - 2;
			index2 = enter + 2;
		}
		enter = void 0;
	}
	return events;
}
function previous$1(code2) {
	return code2 !== 96 || this.events[this.events.length - 1][1].type === "characterEscape";
}
function tokenizeCodeText(effects, ok3, nok) {
	let sizeOpen = 0;
	let size;
	let token;
	return start;
	function start(code2) {
		effects.enter("codeText");
		effects.enter("codeTextSequence");
		return sequenceOpen(code2);
	}
	function sequenceOpen(code2) {
		if (code2 === 96) {
			effects.consume(code2);
			sizeOpen++;
			return sequenceOpen;
		}
		effects.exit("codeTextSequence");
		return between(code2);
	}
	function between(code2) {
		if (code2 === null) return nok(code2);
		if (code2 === 32) {
			effects.enter("space");
			effects.consume(code2);
			effects.exit("space");
			return between;
		}
		if (code2 === 96) {
			token = effects.enter("codeTextSequence");
			size = 0;
			return sequenceClose(code2);
		}
		if (markdownLineEnding$1(code2)) {
			effects.enter("lineEnding");
			effects.consume(code2);
			effects.exit("lineEnding");
			return between;
		}
		effects.enter("codeTextData");
		return data(code2);
	}
	function data(code2) {
		if (code2 === null || code2 === 32 || code2 === 96 || markdownLineEnding$1(code2)) {
			effects.exit("codeTextData");
			return between(code2);
		}
		effects.consume(code2);
		return data;
	}
	function sequenceClose(code2) {
		if (code2 === 96) {
			effects.consume(code2);
			size++;
			return sequenceClose;
		}
		if (size === sizeOpen) {
			effects.exit("codeTextSequence");
			effects.exit("codeText");
			return ok3(code2);
		}
		token.type = "codeTextData";
		return data(code2);
	}
}
var SpliceBuffer = class {
	/**
	* @param {ReadonlyArray<T> | null | undefined} [initial]
	*   Initial items (optional).
	* @returns
	*   Splice buffer.
	*/
	constructor(initial) {
		this.left = initial ? [...initial] : [];
		this.right = [];
	}
	/**
	* Array access;
	* does not move the cursor.
	*
	* @param {number} index
	*   Index.
	* @return {T}
	*   Item.
	*/
	get(index2) {
		if (index2 < 0 || index2 >= this.left.length + this.right.length) throw new RangeError("Cannot access index `" + index2 + "` in a splice buffer of size `" + (this.left.length + this.right.length) + "`");
		if (index2 < this.left.length) return this.left[index2];
		return this.right[this.right.length - index2 + this.left.length - 1];
	}
	/**
	* The length of the splice buffer, one greater than the largest index in the
	* array.
	*/
	get length() {
		return this.left.length + this.right.length;
	}
	/**
	* Remove and return `list[0]`;
	* moves the cursor to `0`.
	*
	* @returns {T | undefined}
	*   Item, optional.
	*/
	shift() {
		this.setCursor(0);
		return this.right.pop();
	}
	/**
	* Slice the buffer to get an array;
	* does not move the cursor.
	*
	* @param {number} start
	*   Start.
	* @param {number | null | undefined} [end]
	*   End (optional).
	* @returns {Array<T>}
	*   Array of items.
	*/
	slice(start, end) {
		const stop = end === null || end === void 0 ? Number.POSITIVE_INFINITY : end;
		if (stop < this.left.length) return this.left.slice(start, stop);
		if (start > this.left.length) return this.right.slice(this.right.length - stop + this.left.length, this.right.length - start + this.left.length).reverse();
		return this.left.slice(start).concat(this.right.slice(this.right.length - stop + this.left.length).reverse());
	}
	/**
	* Mimics the behavior of Array.prototype.splice() except for the change of
	* interface necessary to avoid segfaults when patching in very large arrays.
	*
	* This operation moves cursor is moved to `start` and results in the cursor
	* placed after any inserted items.
	*
	* @param {number} start
	*   Start;
	*   zero-based index at which to start changing the array;
	*   negative numbers count backwards from the end of the array and values
	*   that are out-of bounds are clamped to the appropriate end of the array.
	* @param {number | null | undefined} [deleteCount=0]
	*   Delete count (default: `0`);
	*   maximum number of elements to delete, starting from start.
	* @param {Array<T> | null | undefined} [items=[]]
	*   Items to include in place of the deleted items (default: `[]`).
	* @return {Array<T>}
	*   Any removed items.
	*/
	splice(start, deleteCount, items) {
		const count = deleteCount || 0;
		this.setCursor(Math.trunc(start));
		const removed = this.right.splice(this.right.length - count, Number.POSITIVE_INFINITY);
		if (items) chunkedPush(this.left, items);
		return removed.reverse();
	}
	/**
	* Remove and return the highest-numbered item in the array, so
	* `list[list.length - 1]`;
	* Moves the cursor to `length`.
	*
	* @returns {T | undefined}
	*   Item, optional.
	*/
	pop() {
		this.setCursor(Number.POSITIVE_INFINITY);
		return this.left.pop();
	}
	/**
	* Inserts a single item to the high-numbered side of the array;
	* moves the cursor to `length`.
	*
	* @param {T} item
	*   Item.
	* @returns {undefined}
	*   Nothing.
	*/
	push(item) {
		this.setCursor(Number.POSITIVE_INFINITY);
		this.left.push(item);
	}
	/**
	* Inserts many items to the high-numbered side of the array.
	* Moves the cursor to `length`.
	*
	* @param {Array<T>} items
	*   Items.
	* @returns {undefined}
	*   Nothing.
	*/
	pushMany(items) {
		this.setCursor(Number.POSITIVE_INFINITY);
		chunkedPush(this.left, items);
	}
	/**
	* Inserts a single item to the low-numbered side of the array;
	* Moves the cursor to `0`.
	*
	* @param {T} item
	*   Item.
	* @returns {undefined}
	*   Nothing.
	*/
	unshift(item) {
		this.setCursor(0);
		this.right.push(item);
	}
	/**
	* Inserts many items to the low-numbered side of the array;
	* moves the cursor to `0`.
	*
	* @param {Array<T>} items
	*   Items.
	* @returns {undefined}
	*   Nothing.
	*/
	unshiftMany(items) {
		this.setCursor(0);
		chunkedPush(this.right, items.reverse());
	}
	/**
	* Move the cursor to a specific position in the array. Requires
	* time proportional to the distance moved.
	*
	* If `n < 0`, the cursor will end up at the beginning.
	* If `n > length`, the cursor will end up at the end.
	*
	* @param {number} n
	*   Position.
	* @return {undefined}
	*   Nothing.
	*/
	setCursor(n) {
		if (n === this.left.length || n > this.left.length && this.right.length === 0 || n < 0 && this.left.length === 0) return;
		if (n < this.left.length) {
			const removed = this.left.splice(n, Number.POSITIVE_INFINITY);
			chunkedPush(this.right, removed.reverse());
		} else {
			const removed = this.right.splice(this.left.length + this.right.length - n, Number.POSITIVE_INFINITY);
			chunkedPush(this.left, removed.reverse());
		}
	}
};
function chunkedPush(list3, right) {
	let chunkStart = 0;
	if (right.length < 1e4) list3.push(...right);
	else while (chunkStart < right.length) {
		list3.push(...right.slice(chunkStart, chunkStart + 1e4));
		chunkStart += 1e4;
	}
}
function subtokenize(eventsArray) {
	const jumps = {};
	let index2 = -1;
	let event;
	let lineIndex;
	let otherIndex;
	let otherEvent;
	let parameters;
	let subevents;
	let more;
	const events = new SpliceBuffer(eventsArray);
	while (++index2 < events.length) {
		while (index2 in jumps) index2 = jumps[index2];
		event = events.get(index2);
		if (index2 && event[1].type === "chunkFlow" && events.get(index2 - 1)[1].type === "listItemPrefix") {
			subevents = event[1]._tokenizer.events;
			otherIndex = 0;
			if (otherIndex < subevents.length && subevents[otherIndex][1].type === "lineEndingBlank") otherIndex += 2;
			if (otherIndex < subevents.length && subevents[otherIndex][1].type === "content") while (++otherIndex < subevents.length) {
				if (subevents[otherIndex][1].type === "content") break;
				if (subevents[otherIndex][1].type === "chunkText") {
					subevents[otherIndex][1]._isInFirstContentOfListItem = true;
					otherIndex++;
				}
			}
		}
		if (event[0] === "enter") {
			if (event[1].contentType) {
				Object.assign(jumps, subcontent(events, index2));
				index2 = jumps[index2];
				more = true;
			}
		} else if (event[1]._container) {
			otherIndex = index2;
			lineIndex = void 0;
			while (otherIndex--) {
				otherEvent = events.get(otherIndex);
				if (otherEvent[1].type === "lineEnding" || otherEvent[1].type === "lineEndingBlank") {
					if (otherEvent[0] === "enter") {
						if (lineIndex) events.get(lineIndex)[1].type = "lineEndingBlank";
						otherEvent[1].type = "lineEnding";
						lineIndex = otherIndex;
					}
				} else if (otherEvent[1].type === "linePrefix" || otherEvent[1].type === "listItemIndent") {} else break;
			}
			if (lineIndex) {
				event[1].end = { ...events.get(lineIndex)[1].start };
				parameters = events.slice(lineIndex, index2);
				parameters.unshift(event);
				events.splice(lineIndex, index2 - lineIndex + 1, parameters);
			}
		}
	}
	splice$1(eventsArray, 0, Number.POSITIVE_INFINITY, events.slice(0));
	return !more;
}
function subcontent(events, eventIndex) {
	const token = events.get(eventIndex)[1];
	const context = events.get(eventIndex)[2];
	let startPosition = eventIndex - 1;
	const startPositions = [];
	let tokenizer = token._tokenizer;
	if (!tokenizer) {
		tokenizer = context.parser[token.contentType](token.start);
		if (token._contentTypeTextTrailing) tokenizer._contentTypeTextTrailing = true;
	}
	const childEvents = tokenizer.events;
	const jumps = [];
	const gaps = {};
	let stream;
	let previous2;
	let index2 = -1;
	let current = token;
	let adjust = 0;
	let start = 0;
	const breaks = [start];
	while (current) {
		while (events.get(++startPosition)[1] !== current);
		startPositions.push(startPosition);
		if (!current._tokenizer) {
			stream = context.sliceStream(current);
			if (!current.next) stream.push(null);
			if (previous2) tokenizer.defineSkip(current.start);
			if (current._isInFirstContentOfListItem) tokenizer._gfmTasklistFirstContentOfListItem = true;
			tokenizer.write(stream);
			if (current._isInFirstContentOfListItem) tokenizer._gfmTasklistFirstContentOfListItem = void 0;
		}
		previous2 = current;
		current = current.next;
	}
	current = token;
	while (++index2 < childEvents.length) if (childEvents[index2][0] === "exit" && childEvents[index2 - 1][0] === "enter" && childEvents[index2][1].type === childEvents[index2 - 1][1].type && childEvents[index2][1].start.line !== childEvents[index2][1].end.line) {
		start = index2 + 1;
		breaks.push(start);
		current._tokenizer = void 0;
		current.previous = void 0;
		current = current.next;
	}
	tokenizer.events = [];
	if (current) {
		current._tokenizer = void 0;
		current.previous = void 0;
	} else breaks.pop();
	index2 = breaks.length;
	while (index2--) {
		const slice = childEvents.slice(breaks[index2], breaks[index2 + 1]);
		const start2 = startPositions.pop();
		jumps.push([start2, start2 + slice.length - 1]);
		events.splice(start2, 2, slice);
	}
	jumps.reverse();
	index2 = -1;
	while (++index2 < jumps.length) {
		gaps[adjust + jumps[index2][0]] = adjust + jumps[index2][1];
		adjust += jumps[index2][1] - jumps[index2][0] - 1;
	}
	return gaps;
}
var content2 = {
	resolve: resolveContent,
	tokenize: tokenizeContent
};
var continuationConstruct = {
	partial: true,
	tokenize: tokenizeContinuation
};
function resolveContent(events) {
	subtokenize(events);
	return events;
}
function tokenizeContent(effects, ok3) {
	let previous2;
	return chunkStart;
	function chunkStart(code2) {
		effects.enter("content");
		previous2 = effects.enter("chunkContent", { contentType: "content" });
		return chunkInside(code2);
	}
	function chunkInside(code2) {
		if (code2 === null) return contentEnd(code2);
		if (markdownLineEnding$1(code2)) return effects.check(continuationConstruct, contentContinue, contentEnd)(code2);
		effects.consume(code2);
		return chunkInside;
	}
	function contentEnd(code2) {
		effects.exit("chunkContent");
		effects.exit("content");
		return ok3(code2);
	}
	function contentContinue(code2) {
		effects.consume(code2);
		effects.exit("chunkContent");
		previous2.next = effects.enter("chunkContent", {
			contentType: "content",
			previous: previous2
		});
		previous2 = previous2.next;
		return chunkInside;
	}
}
function tokenizeContinuation(effects, ok3, nok) {
	const self2 = this;
	return startLookahead;
	function startLookahead(code2) {
		effects.exit("chunkContent");
		effects.enter("lineEnding");
		effects.consume(code2);
		effects.exit("lineEnding");
		return factorySpace$1(effects, prefixed, "linePrefix");
	}
	function prefixed(code2) {
		if (code2 === null || markdownLineEnding$1(code2)) return nok(code2);
		const tail = self2.events[self2.events.length - 1];
		if (!self2.parser.constructs.disable.null.includes("codeIndented") && tail && tail[1].type === "linePrefix" && tail[2].sliceSerialize(tail[1], true).length >= 4) return ok3(code2);
		return effects.interrupt(self2.parser.constructs.flow, nok, ok3)(code2);
	}
}
function factoryDestination(effects, ok3, nok, type, literalType, literalMarkerType, rawType, stringType, max) {
	const limit = max || Number.POSITIVE_INFINITY;
	let balance = 0;
	return start;
	function start(code2) {
		if (code2 === 60) {
			effects.enter(type);
			effects.enter(literalType);
			effects.enter(literalMarkerType);
			effects.consume(code2);
			effects.exit(literalMarkerType);
			return enclosedBefore;
		}
		if (code2 === null || code2 === 32 || code2 === 41 || asciiControl$1(code2)) return nok(code2);
		effects.enter(type);
		effects.enter(rawType);
		effects.enter(stringType);
		effects.enter("chunkString", { contentType: "string" });
		return raw(code2);
	}
	function enclosedBefore(code2) {
		if (code2 === 62) {
			effects.enter(literalMarkerType);
			effects.consume(code2);
			effects.exit(literalMarkerType);
			effects.exit(literalType);
			effects.exit(type);
			return ok3;
		}
		effects.enter(stringType);
		effects.enter("chunkString", { contentType: "string" });
		return enclosed(code2);
	}
	function enclosed(code2) {
		if (code2 === 62) {
			effects.exit("chunkString");
			effects.exit(stringType);
			return enclosedBefore(code2);
		}
		if (code2 === null || code2 === 60 || markdownLineEnding$1(code2)) return nok(code2);
		effects.consume(code2);
		return code2 === 92 ? enclosedEscape : enclosed;
	}
	function enclosedEscape(code2) {
		if (code2 === 60 || code2 === 62 || code2 === 92) {
			effects.consume(code2);
			return enclosed;
		}
		return enclosed(code2);
	}
	function raw(code2) {
		if (!balance && (code2 === null || code2 === 41 || markdownLineEndingOrSpace$1(code2))) {
			effects.exit("chunkString");
			effects.exit(stringType);
			effects.exit(rawType);
			effects.exit(type);
			return ok3(code2);
		}
		if (balance < limit && code2 === 40) {
			effects.consume(code2);
			balance++;
			return raw;
		}
		if (code2 === 41) {
			effects.consume(code2);
			balance--;
			return raw;
		}
		if (code2 === null || code2 === 32 || code2 === 40 || asciiControl$1(code2)) return nok(code2);
		effects.consume(code2);
		return code2 === 92 ? rawEscape : raw;
	}
	function rawEscape(code2) {
		if (code2 === 40 || code2 === 41 || code2 === 92) {
			effects.consume(code2);
			return raw;
		}
		return raw(code2);
	}
}
function factoryLabel(effects, ok3, nok, type, markerType, stringType) {
	const self2 = this;
	let size = 0;
	let seen;
	return start;
	function start(code2) {
		effects.enter(type);
		effects.enter(markerType);
		effects.consume(code2);
		effects.exit(markerType);
		effects.enter(stringType);
		return atBreak;
	}
	function atBreak(code2) {
		if (size > 999 || code2 === null || code2 === 91 || code2 === 93 && !seen || 
		/* c8 ignore next 3 */
		code2 === 94 && !size && "_hiddenFootnoteSupport" in self2.parser.constructs) return nok(code2);
		if (code2 === 93) {
			effects.exit(stringType);
			effects.enter(markerType);
			effects.consume(code2);
			effects.exit(markerType);
			effects.exit(type);
			return ok3;
		}
		if (markdownLineEnding$1(code2)) {
			effects.enter("lineEnding");
			effects.consume(code2);
			effects.exit("lineEnding");
			return atBreak;
		}
		effects.enter("chunkString", { contentType: "string" });
		return labelInside(code2);
	}
	function labelInside(code2) {
		if (code2 === null || code2 === 91 || code2 === 93 || markdownLineEnding$1(code2) || size++ > 999) {
			effects.exit("chunkString");
			return atBreak(code2);
		}
		effects.consume(code2);
		if (!seen) seen = !markdownSpace$1(code2);
		return code2 === 92 ? labelEscape : labelInside;
	}
	function labelEscape(code2) {
		if (code2 === 91 || code2 === 92 || code2 === 93) {
			effects.consume(code2);
			size++;
			return labelInside;
		}
		return labelInside(code2);
	}
}
function factoryTitle(effects, ok3, nok, type, markerType, stringType) {
	let marker;
	return start;
	function start(code2) {
		if (code2 === 34 || code2 === 39 || code2 === 40) {
			effects.enter(type);
			effects.enter(markerType);
			effects.consume(code2);
			effects.exit(markerType);
			marker = code2 === 40 ? 41 : code2;
			return begin;
		}
		return nok(code2);
	}
	function begin(code2) {
		if (code2 === marker) {
			effects.enter(markerType);
			effects.consume(code2);
			effects.exit(markerType);
			effects.exit(type);
			return ok3;
		}
		effects.enter(stringType);
		return atBreak(code2);
	}
	function atBreak(code2) {
		if (code2 === marker) {
			effects.exit(stringType);
			return begin(marker);
		}
		if (code2 === null) return nok(code2);
		if (markdownLineEnding$1(code2)) {
			effects.enter("lineEnding");
			effects.consume(code2);
			effects.exit("lineEnding");
			return factorySpace$1(effects, atBreak, "linePrefix");
		}
		effects.enter("chunkString", { contentType: "string" });
		return inside(code2);
	}
	function inside(code2) {
		if (code2 === marker || code2 === null || markdownLineEnding$1(code2)) {
			effects.exit("chunkString");
			return atBreak(code2);
		}
		effects.consume(code2);
		return code2 === 92 ? escape : inside;
	}
	function escape(code2) {
		if (code2 === marker || code2 === 92) {
			effects.consume(code2);
			return inside;
		}
		return inside(code2);
	}
}
function factoryWhitespace(effects, ok3) {
	let seen;
	return start;
	function start(code2) {
		if (markdownLineEnding$1(code2)) {
			effects.enter("lineEnding");
			effects.consume(code2);
			effects.exit("lineEnding");
			seen = true;
			return start;
		}
		if (markdownSpace$1(code2)) return factorySpace$1(effects, start, seen ? "linePrefix" : "lineSuffix")(code2);
		return ok3(code2);
	}
}
var definition$1 = {
	name: "definition",
	tokenize: tokenizeDefinition
};
var titleBefore = {
	partial: true,
	tokenize: tokenizeTitleBefore
};
function tokenizeDefinition(effects, ok3, nok) {
	const self2 = this;
	let identifier;
	return start;
	function start(code2) {
		effects.enter("definition");
		return before(code2);
	}
	function before(code2) {
		return factoryLabel.call(self2, effects, labelAfter, nok, "definitionLabel", "definitionLabelMarker", "definitionLabelString")(code2);
	}
	function labelAfter(code2) {
		identifier = normalizeIdentifier$1(self2.sliceSerialize(self2.events[self2.events.length - 1][1]).slice(1, -1));
		if (code2 === 58) {
			effects.enter("definitionMarker");
			effects.consume(code2);
			effects.exit("definitionMarker");
			return markerAfter;
		}
		return nok(code2);
	}
	function markerAfter(code2) {
		return markdownLineEndingOrSpace$1(code2) ? factoryWhitespace(effects, destinationBefore)(code2) : destinationBefore(code2);
	}
	function destinationBefore(code2) {
		return factoryDestination(effects, destinationAfter, nok, "definitionDestination", "definitionDestinationLiteral", "definitionDestinationLiteralMarker", "definitionDestinationRaw", "definitionDestinationString")(code2);
	}
	function destinationAfter(code2) {
		return effects.attempt(titleBefore, after, after)(code2);
	}
	function after(code2) {
		return markdownSpace$1(code2) ? factorySpace$1(effects, afterWhitespace, "whitespace")(code2) : afterWhitespace(code2);
	}
	function afterWhitespace(code2) {
		if (code2 === null || markdownLineEnding$1(code2)) {
			effects.exit("definition");
			self2.parser.defined.push(identifier);
			return ok3(code2);
		}
		return nok(code2);
	}
}
function tokenizeTitleBefore(effects, ok3, nok) {
	return titleBefore2;
	function titleBefore2(code2) {
		return markdownLineEndingOrSpace$1(code2) ? factoryWhitespace(effects, beforeMarker)(code2) : nok(code2);
	}
	function beforeMarker(code2) {
		return factoryTitle(effects, titleAfter, nok, "definitionTitle", "definitionTitleMarker", "definitionTitleString")(code2);
	}
	function titleAfter(code2) {
		return markdownSpace$1(code2) ? factorySpace$1(effects, titleAfterOptionalWhitespace, "whitespace")(code2) : titleAfterOptionalWhitespace(code2);
	}
	function titleAfterOptionalWhitespace(code2) {
		return code2 === null || markdownLineEnding$1(code2) ? ok3(code2) : nok(code2);
	}
}
var hardBreakEscape = {
	name: "hardBreakEscape",
	tokenize: tokenizeHardBreakEscape
};
function tokenizeHardBreakEscape(effects, ok3, nok) {
	return start;
	function start(code2) {
		effects.enter("hardBreakEscape");
		effects.consume(code2);
		return after;
	}
	function after(code2) {
		if (markdownLineEnding$1(code2)) {
			effects.exit("hardBreakEscape");
			return ok3(code2);
		}
		return nok(code2);
	}
}
var headingAtx = {
	name: "headingAtx",
	resolve: resolveHeadingAtx,
	tokenize: tokenizeHeadingAtx
};
function resolveHeadingAtx(events, context) {
	let contentEnd = events.length - 2;
	let contentStart = 3;
	let content3;
	let text4;
	if (events[contentStart][1].type === "whitespace") contentStart += 2;
	if (contentEnd - 2 > contentStart && events[contentEnd][1].type === "whitespace") contentEnd -= 2;
	if (events[contentEnd][1].type === "atxHeadingSequence" && (contentStart === contentEnd - 1 || contentEnd - 4 > contentStart && events[contentEnd - 2][1].type === "whitespace")) contentEnd -= contentStart + 1 === contentEnd ? 2 : 4;
	if (contentEnd > contentStart) {
		content3 = {
			type: "atxHeadingText",
			start: events[contentStart][1].start,
			end: events[contentEnd][1].end
		};
		text4 = {
			type: "chunkText",
			start: events[contentStart][1].start,
			end: events[contentEnd][1].end,
			contentType: "text"
		};
		splice$1(events, contentStart, contentEnd - contentStart + 1, [
			[
				"enter",
				content3,
				context
			],
			[
				"enter",
				text4,
				context
			],
			[
				"exit",
				text4,
				context
			],
			[
				"exit",
				content3,
				context
			]
		]);
	}
	return events;
}
function tokenizeHeadingAtx(effects, ok3, nok) {
	let size = 0;
	return start;
	function start(code2) {
		effects.enter("atxHeading");
		return before(code2);
	}
	function before(code2) {
		effects.enter("atxHeadingSequence");
		return sequenceOpen(code2);
	}
	function sequenceOpen(code2) {
		if (code2 === 35 && size++ < 6) {
			effects.consume(code2);
			return sequenceOpen;
		}
		if (code2 === null || markdownLineEndingOrSpace$1(code2)) {
			effects.exit("atxHeadingSequence");
			return atBreak(code2);
		}
		return nok(code2);
	}
	function atBreak(code2) {
		if (code2 === 35) {
			effects.enter("atxHeadingSequence");
			return sequenceFurther(code2);
		}
		if (code2 === null || markdownLineEnding$1(code2)) {
			effects.exit("atxHeading");
			return ok3(code2);
		}
		if (markdownSpace$1(code2)) return factorySpace$1(effects, atBreak, "whitespace")(code2);
		effects.enter("atxHeadingText");
		return data(code2);
	}
	function sequenceFurther(code2) {
		if (code2 === 35) {
			effects.consume(code2);
			return sequenceFurther;
		}
		effects.exit("atxHeadingSequence");
		return atBreak(code2);
	}
	function data(code2) {
		if (code2 === null || code2 === 35 || markdownLineEndingOrSpace$1(code2)) {
			effects.exit("atxHeadingText");
			return atBreak(code2);
		}
		effects.consume(code2);
		return data;
	}
}
var htmlBlockNames = [
	"address",
	"article",
	"aside",
	"base",
	"basefont",
	"blockquote",
	"body",
	"caption",
	"center",
	"col",
	"colgroup",
	"dd",
	"details",
	"dialog",
	"dir",
	"div",
	"dl",
	"dt",
	"fieldset",
	"figcaption",
	"figure",
	"footer",
	"form",
	"frame",
	"frameset",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"head",
	"header",
	"hr",
	"html",
	"iframe",
	"legend",
	"li",
	"link",
	"main",
	"menu",
	"menuitem",
	"nav",
	"noframes",
	"ol",
	"optgroup",
	"option",
	"p",
	"param",
	"search",
	"section",
	"summary",
	"table",
	"tbody",
	"td",
	"tfoot",
	"th",
	"thead",
	"title",
	"tr",
	"track",
	"ul"
];
var htmlRawNames = [
	"pre",
	"script",
	"style",
	"textarea"
];
var htmlFlow = {
	concrete: true,
	name: "htmlFlow",
	resolveTo: resolveToHtmlFlow,
	tokenize: tokenizeHtmlFlow
};
var blankLineBefore = {
	partial: true,
	tokenize: tokenizeBlankLineBefore
};
var nonLazyContinuationStart = {
	partial: true,
	tokenize: tokenizeNonLazyContinuationStart
};
function resolveToHtmlFlow(events) {
	let index2 = events.length;
	while (index2--) if (events[index2][0] === "enter" && events[index2][1].type === "htmlFlow") break;
	if (index2 > 1 && events[index2 - 2][1].type === "linePrefix") {
		events[index2][1].start = events[index2 - 2][1].start;
		events[index2 + 1][1].start = events[index2 - 2][1].start;
		events.splice(index2 - 2, 2);
	}
	return events;
}
function tokenizeHtmlFlow(effects, ok3, nok) {
	const self2 = this;
	let marker;
	let closingTag;
	let buffer;
	let index2;
	let markerB;
	return start;
	function start(code2) {
		return before(code2);
	}
	function before(code2) {
		effects.enter("htmlFlow");
		effects.enter("htmlFlowData");
		effects.consume(code2);
		return open;
	}
	function open(code2) {
		if (code2 === 33) {
			effects.consume(code2);
			return declarationOpen;
		}
		if (code2 === 47) {
			effects.consume(code2);
			closingTag = true;
			return tagCloseStart;
		}
		if (code2 === 63) {
			effects.consume(code2);
			marker = 3;
			return self2.interrupt ? ok3 : continuationDeclarationInside;
		}
		if (asciiAlpha$1(code2)) {
			effects.consume(code2);
			buffer = String.fromCharCode(code2);
			return tagName;
		}
		return nok(code2);
	}
	function declarationOpen(code2) {
		if (code2 === 45) {
			effects.consume(code2);
			marker = 2;
			return commentOpenInside;
		}
		if (code2 === 91) {
			effects.consume(code2);
			marker = 5;
			index2 = 0;
			return cdataOpenInside;
		}
		if (asciiAlpha$1(code2)) {
			effects.consume(code2);
			marker = 4;
			return self2.interrupt ? ok3 : continuationDeclarationInside;
		}
		return nok(code2);
	}
	function commentOpenInside(code2) {
		if (code2 === 45) {
			effects.consume(code2);
			return self2.interrupt ? ok3 : continuationDeclarationInside;
		}
		return nok(code2);
	}
	function cdataOpenInside(code2) {
		if (code2 === "CDATA[".charCodeAt(index2++)) {
			effects.consume(code2);
			if (index2 === 6) return self2.interrupt ? ok3 : continuation;
			return cdataOpenInside;
		}
		return nok(code2);
	}
	function tagCloseStart(code2) {
		if (asciiAlpha$1(code2)) {
			effects.consume(code2);
			buffer = String.fromCharCode(code2);
			return tagName;
		}
		return nok(code2);
	}
	function tagName(code2) {
		if (code2 === null || code2 === 47 || code2 === 62 || markdownLineEndingOrSpace$1(code2)) {
			const slash = code2 === 47;
			const name = buffer.toLowerCase();
			if (!slash && !closingTag && htmlRawNames.includes(name)) {
				marker = 1;
				return self2.interrupt ? ok3(code2) : continuation(code2);
			}
			if (htmlBlockNames.includes(buffer.toLowerCase())) {
				marker = 6;
				if (slash) {
					effects.consume(code2);
					return basicSelfClosing;
				}
				return self2.interrupt ? ok3(code2) : continuation(code2);
			}
			marker = 7;
			return self2.interrupt && !self2.parser.lazy[self2.now().line] ? nok(code2) : closingTag ? completeClosingTagAfter(code2) : completeAttributeNameBefore(code2);
		}
		if (code2 === 45 || asciiAlphanumeric$1(code2)) {
			effects.consume(code2);
			buffer += String.fromCharCode(code2);
			return tagName;
		}
		return nok(code2);
	}
	function basicSelfClosing(code2) {
		if (code2 === 62) {
			effects.consume(code2);
			return self2.interrupt ? ok3 : continuation;
		}
		return nok(code2);
	}
	function completeClosingTagAfter(code2) {
		if (markdownSpace$1(code2)) {
			effects.consume(code2);
			return completeClosingTagAfter;
		}
		return completeEnd(code2);
	}
	function completeAttributeNameBefore(code2) {
		if (code2 === 47) {
			effects.consume(code2);
			return completeEnd;
		}
		if (code2 === 58 || code2 === 95 || asciiAlpha$1(code2)) {
			effects.consume(code2);
			return completeAttributeName;
		}
		if (markdownSpace$1(code2)) {
			effects.consume(code2);
			return completeAttributeNameBefore;
		}
		return completeEnd(code2);
	}
	function completeAttributeName(code2) {
		if (code2 === 45 || code2 === 46 || code2 === 58 || code2 === 95 || asciiAlphanumeric$1(code2)) {
			effects.consume(code2);
			return completeAttributeName;
		}
		return completeAttributeNameAfter(code2);
	}
	function completeAttributeNameAfter(code2) {
		if (code2 === 61) {
			effects.consume(code2);
			return completeAttributeValueBefore;
		}
		if (markdownSpace$1(code2)) {
			effects.consume(code2);
			return completeAttributeNameAfter;
		}
		return completeAttributeNameBefore(code2);
	}
	function completeAttributeValueBefore(code2) {
		if (code2 === null || code2 === 60 || code2 === 61 || code2 === 62 || code2 === 96) return nok(code2);
		if (code2 === 34 || code2 === 39) {
			effects.consume(code2);
			markerB = code2;
			return completeAttributeValueQuoted;
		}
		if (markdownSpace$1(code2)) {
			effects.consume(code2);
			return completeAttributeValueBefore;
		}
		return completeAttributeValueUnquoted(code2);
	}
	function completeAttributeValueQuoted(code2) {
		if (code2 === markerB) {
			effects.consume(code2);
			markerB = null;
			return completeAttributeValueQuotedAfter;
		}
		if (code2 === null || markdownLineEnding$1(code2)) return nok(code2);
		effects.consume(code2);
		return completeAttributeValueQuoted;
	}
	function completeAttributeValueUnquoted(code2) {
		if (code2 === null || code2 === 34 || code2 === 39 || code2 === 47 || code2 === 60 || code2 === 61 || code2 === 62 || code2 === 96 || markdownLineEndingOrSpace$1(code2)) return completeAttributeNameAfter(code2);
		effects.consume(code2);
		return completeAttributeValueUnquoted;
	}
	function completeAttributeValueQuotedAfter(code2) {
		if (code2 === 47 || code2 === 62 || markdownSpace$1(code2)) return completeAttributeNameBefore(code2);
		return nok(code2);
	}
	function completeEnd(code2) {
		if (code2 === 62) {
			effects.consume(code2);
			return completeAfter;
		}
		return nok(code2);
	}
	function completeAfter(code2) {
		if (code2 === null || markdownLineEnding$1(code2)) return continuation(code2);
		if (markdownSpace$1(code2)) {
			effects.consume(code2);
			return completeAfter;
		}
		return nok(code2);
	}
	function continuation(code2) {
		if (code2 === 45 && marker === 2) {
			effects.consume(code2);
			return continuationCommentInside;
		}
		if (code2 === 60 && marker === 1) {
			effects.consume(code2);
			return continuationRawTagOpen;
		}
		if (code2 === 62 && marker === 4) {
			effects.consume(code2);
			return continuationClose;
		}
		if (code2 === 63 && marker === 3) {
			effects.consume(code2);
			return continuationDeclarationInside;
		}
		if (code2 === 93 && marker === 5) {
			effects.consume(code2);
			return continuationCdataInside;
		}
		if (markdownLineEnding$1(code2) && (marker === 6 || marker === 7)) {
			effects.exit("htmlFlowData");
			return effects.check(blankLineBefore, continuationAfter, continuationStart)(code2);
		}
		if (code2 === null || markdownLineEnding$1(code2)) {
			effects.exit("htmlFlowData");
			return continuationStart(code2);
		}
		effects.consume(code2);
		return continuation;
	}
	function continuationStart(code2) {
		return effects.check(nonLazyContinuationStart, continuationStartNonLazy, continuationAfter)(code2);
	}
	function continuationStartNonLazy(code2) {
		effects.enter("lineEnding");
		effects.consume(code2);
		effects.exit("lineEnding");
		return continuationBefore;
	}
	function continuationBefore(code2) {
		if (code2 === null || markdownLineEnding$1(code2)) return continuationStart(code2);
		effects.enter("htmlFlowData");
		return continuation(code2);
	}
	function continuationCommentInside(code2) {
		if (code2 === 45) {
			effects.consume(code2);
			return continuationDeclarationInside;
		}
		return continuation(code2);
	}
	function continuationRawTagOpen(code2) {
		if (code2 === 47) {
			effects.consume(code2);
			buffer = "";
			return continuationRawEndTag;
		}
		return continuation(code2);
	}
	function continuationRawEndTag(code2) {
		if (code2 === 62) {
			const name = buffer.toLowerCase();
			if (htmlRawNames.includes(name)) {
				effects.consume(code2);
				return continuationClose;
			}
			return continuation(code2);
		}
		if (asciiAlpha$1(code2) && buffer.length < 8) {
			effects.consume(code2);
			buffer += String.fromCharCode(code2);
			return continuationRawEndTag;
		}
		return continuation(code2);
	}
	function continuationCdataInside(code2) {
		if (code2 === 93) {
			effects.consume(code2);
			return continuationDeclarationInside;
		}
		return continuation(code2);
	}
	function continuationDeclarationInside(code2) {
		if (code2 === 62) {
			effects.consume(code2);
			return continuationClose;
		}
		if (code2 === 45 && marker === 2) {
			effects.consume(code2);
			return continuationDeclarationInside;
		}
		return continuation(code2);
	}
	function continuationClose(code2) {
		if (code2 === null || markdownLineEnding$1(code2)) {
			effects.exit("htmlFlowData");
			return continuationAfter(code2);
		}
		effects.consume(code2);
		return continuationClose;
	}
	function continuationAfter(code2) {
		effects.exit("htmlFlow");
		return ok3(code2);
	}
}
function tokenizeNonLazyContinuationStart(effects, ok3, nok) {
	const self2 = this;
	return start;
	function start(code2) {
		if (markdownLineEnding$1(code2)) {
			effects.enter("lineEnding");
			effects.consume(code2);
			effects.exit("lineEnding");
			return after;
		}
		return nok(code2);
	}
	function after(code2) {
		return self2.parser.lazy[self2.now().line] ? nok(code2) : ok3(code2);
	}
}
function tokenizeBlankLineBefore(effects, ok3, nok) {
	return start;
	function start(code2) {
		effects.enter("lineEnding");
		effects.consume(code2);
		effects.exit("lineEnding");
		return effects.attempt(blankLine$1, ok3, nok);
	}
}
var htmlText = {
	name: "htmlText",
	tokenize: tokenizeHtmlText
};
function tokenizeHtmlText(effects, ok3, nok) {
	const self2 = this;
	let marker;
	let index2;
	let returnState;
	return start;
	function start(code2) {
		effects.enter("htmlText");
		effects.enter("htmlTextData");
		effects.consume(code2);
		return open;
	}
	function open(code2) {
		if (code2 === 33) {
			effects.consume(code2);
			return declarationOpen;
		}
		if (code2 === 47) {
			effects.consume(code2);
			return tagCloseStart;
		}
		if (code2 === 63) {
			effects.consume(code2);
			return instruction;
		}
		if (asciiAlpha$1(code2)) {
			effects.consume(code2);
			return tagOpen;
		}
		return nok(code2);
	}
	function declarationOpen(code2) {
		if (code2 === 45) {
			effects.consume(code2);
			return commentOpenInside;
		}
		if (code2 === 91) {
			effects.consume(code2);
			index2 = 0;
			return cdataOpenInside;
		}
		if (asciiAlpha$1(code2)) {
			effects.consume(code2);
			return declaration;
		}
		return nok(code2);
	}
	function commentOpenInside(code2) {
		if (code2 === 45) {
			effects.consume(code2);
			return commentEnd;
		}
		return nok(code2);
	}
	function comment(code2) {
		if (code2 === null) return nok(code2);
		if (code2 === 45) {
			effects.consume(code2);
			return commentClose;
		}
		if (markdownLineEnding$1(code2)) {
			returnState = comment;
			return lineEndingBefore(code2);
		}
		effects.consume(code2);
		return comment;
	}
	function commentClose(code2) {
		if (code2 === 45) {
			effects.consume(code2);
			return commentEnd;
		}
		return comment(code2);
	}
	function commentEnd(code2) {
		return code2 === 62 ? end(code2) : code2 === 45 ? commentClose(code2) : comment(code2);
	}
	function cdataOpenInside(code2) {
		if (code2 === "CDATA[".charCodeAt(index2++)) {
			effects.consume(code2);
			return index2 === 6 ? cdata : cdataOpenInside;
		}
		return nok(code2);
	}
	function cdata(code2) {
		if (code2 === null) return nok(code2);
		if (code2 === 93) {
			effects.consume(code2);
			return cdataClose;
		}
		if (markdownLineEnding$1(code2)) {
			returnState = cdata;
			return lineEndingBefore(code2);
		}
		effects.consume(code2);
		return cdata;
	}
	function cdataClose(code2) {
		if (code2 === 93) {
			effects.consume(code2);
			return cdataEnd;
		}
		return cdata(code2);
	}
	function cdataEnd(code2) {
		if (code2 === 62) return end(code2);
		if (code2 === 93) {
			effects.consume(code2);
			return cdataEnd;
		}
		return cdata(code2);
	}
	function declaration(code2) {
		if (code2 === null || code2 === 62) return end(code2);
		if (markdownLineEnding$1(code2)) {
			returnState = declaration;
			return lineEndingBefore(code2);
		}
		effects.consume(code2);
		return declaration;
	}
	function instruction(code2) {
		if (code2 === null) return nok(code2);
		if (code2 === 63) {
			effects.consume(code2);
			return instructionClose;
		}
		if (markdownLineEnding$1(code2)) {
			returnState = instruction;
			return lineEndingBefore(code2);
		}
		effects.consume(code2);
		return instruction;
	}
	function instructionClose(code2) {
		return code2 === 62 ? end(code2) : instruction(code2);
	}
	function tagCloseStart(code2) {
		if (asciiAlpha$1(code2)) {
			effects.consume(code2);
			return tagClose;
		}
		return nok(code2);
	}
	function tagClose(code2) {
		if (code2 === 45 || asciiAlphanumeric$1(code2)) {
			effects.consume(code2);
			return tagClose;
		}
		return tagCloseBetween(code2);
	}
	function tagCloseBetween(code2) {
		if (markdownLineEnding$1(code2)) {
			returnState = tagCloseBetween;
			return lineEndingBefore(code2);
		}
		if (markdownSpace$1(code2)) {
			effects.consume(code2);
			return tagCloseBetween;
		}
		return end(code2);
	}
	function tagOpen(code2) {
		if (code2 === 45 || asciiAlphanumeric$1(code2)) {
			effects.consume(code2);
			return tagOpen;
		}
		if (code2 === 47 || code2 === 62 || markdownLineEndingOrSpace$1(code2)) return tagOpenBetween(code2);
		return nok(code2);
	}
	function tagOpenBetween(code2) {
		if (code2 === 47) {
			effects.consume(code2);
			return end;
		}
		if (code2 === 58 || code2 === 95 || asciiAlpha$1(code2)) {
			effects.consume(code2);
			return tagOpenAttributeName;
		}
		if (markdownLineEnding$1(code2)) {
			returnState = tagOpenBetween;
			return lineEndingBefore(code2);
		}
		if (markdownSpace$1(code2)) {
			effects.consume(code2);
			return tagOpenBetween;
		}
		return end(code2);
	}
	function tagOpenAttributeName(code2) {
		if (code2 === 45 || code2 === 46 || code2 === 58 || code2 === 95 || asciiAlphanumeric$1(code2)) {
			effects.consume(code2);
			return tagOpenAttributeName;
		}
		return tagOpenAttributeNameAfter(code2);
	}
	function tagOpenAttributeNameAfter(code2) {
		if (code2 === 61) {
			effects.consume(code2);
			return tagOpenAttributeValueBefore;
		}
		if (markdownLineEnding$1(code2)) {
			returnState = tagOpenAttributeNameAfter;
			return lineEndingBefore(code2);
		}
		if (markdownSpace$1(code2)) {
			effects.consume(code2);
			return tagOpenAttributeNameAfter;
		}
		return tagOpenBetween(code2);
	}
	function tagOpenAttributeValueBefore(code2) {
		if (code2 === null || code2 === 60 || code2 === 61 || code2 === 62 || code2 === 96) return nok(code2);
		if (code2 === 34 || code2 === 39) {
			effects.consume(code2);
			marker = code2;
			return tagOpenAttributeValueQuoted;
		}
		if (markdownLineEnding$1(code2)) {
			returnState = tagOpenAttributeValueBefore;
			return lineEndingBefore(code2);
		}
		if (markdownSpace$1(code2)) {
			effects.consume(code2);
			return tagOpenAttributeValueBefore;
		}
		effects.consume(code2);
		return tagOpenAttributeValueUnquoted;
	}
	function tagOpenAttributeValueQuoted(code2) {
		if (code2 === marker) {
			effects.consume(code2);
			marker = void 0;
			return tagOpenAttributeValueQuotedAfter;
		}
		if (code2 === null) return nok(code2);
		if (markdownLineEnding$1(code2)) {
			returnState = tagOpenAttributeValueQuoted;
			return lineEndingBefore(code2);
		}
		effects.consume(code2);
		return tagOpenAttributeValueQuoted;
	}
	function tagOpenAttributeValueUnquoted(code2) {
		if (code2 === null || code2 === 34 || code2 === 39 || code2 === 60 || code2 === 61 || code2 === 96) return nok(code2);
		if (code2 === 47 || code2 === 62 || markdownLineEndingOrSpace$1(code2)) return tagOpenBetween(code2);
		effects.consume(code2);
		return tagOpenAttributeValueUnquoted;
	}
	function tagOpenAttributeValueQuotedAfter(code2) {
		if (code2 === 47 || code2 === 62 || markdownLineEndingOrSpace$1(code2)) return tagOpenBetween(code2);
		return nok(code2);
	}
	function end(code2) {
		if (code2 === 62) {
			effects.consume(code2);
			effects.exit("htmlTextData");
			effects.exit("htmlText");
			return ok3;
		}
		return nok(code2);
	}
	function lineEndingBefore(code2) {
		effects.exit("htmlTextData");
		effects.enter("lineEnding");
		effects.consume(code2);
		effects.exit("lineEnding");
		return lineEndingAfter;
	}
	function lineEndingAfter(code2) {
		return markdownSpace$1(code2) ? factorySpace$1(effects, lineEndingAfterPrefix, "linePrefix", self2.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code2) : lineEndingAfterPrefix(code2);
	}
	function lineEndingAfterPrefix(code2) {
		effects.enter("htmlTextData");
		return returnState(code2);
	}
}
var labelEnd = {
	name: "labelEnd",
	resolveAll: resolveAllLabelEnd,
	resolveTo: resolveToLabelEnd,
	tokenize: tokenizeLabelEnd
};
var resourceConstruct = { tokenize: tokenizeResource };
var referenceFullConstruct = { tokenize: tokenizeReferenceFull };
var referenceCollapsedConstruct = { tokenize: tokenizeReferenceCollapsed };
function resolveAllLabelEnd(events) {
	let index2 = -1;
	const newEvents = [];
	while (++index2 < events.length) {
		const token = events[index2][1];
		newEvents.push(events[index2]);
		if (token.type === "labelImage" || token.type === "labelLink" || token.type === "labelEnd") {
			const offset = token.type === "labelImage" ? 4 : 2;
			token.type = "data";
			index2 += offset;
		}
	}
	if (events.length !== newEvents.length) splice$1(events, 0, events.length, newEvents);
	return events;
}
function resolveToLabelEnd(events, context) {
	let index2 = events.length;
	let offset = 0;
	let token;
	let open;
	let close;
	let media;
	while (index2--) {
		token = events[index2][1];
		if (open) {
			if (token.type === "link" || token.type === "labelLink" && token._inactive) break;
			if (events[index2][0] === "enter" && token.type === "labelLink") token._inactive = true;
		} else if (close) {
			if (events[index2][0] === "enter" && (token.type === "labelImage" || token.type === "labelLink") && !token._balanced) {
				open = index2;
				if (token.type !== "labelLink") {
					offset = 2;
					break;
				}
			}
		} else if (token.type === "labelEnd") close = index2;
	}
	const group = {
		type: events[open][1].type === "labelLink" ? "link" : "image",
		start: { ...events[open][1].start },
		end: { ...events[events.length - 1][1].end }
	};
	const label = {
		type: "label",
		start: { ...events[open][1].start },
		end: { ...events[close][1].end }
	};
	const text4 = {
		type: "labelText",
		start: { ...events[open + offset + 2][1].end },
		end: { ...events[close - 2][1].start }
	};
	media = [[
		"enter",
		group,
		context
	], [
		"enter",
		label,
		context
	]];
	media = push(media, events.slice(open + 1, open + offset + 3));
	media = push(media, [[
		"enter",
		text4,
		context
	]]);
	media = push(media, resolveAll$1(context.parser.constructs.insideSpan.null, events.slice(open + offset + 4, close - 3), context));
	media = push(media, [
		[
			"exit",
			text4,
			context
		],
		events[close - 2],
		events[close - 1],
		[
			"exit",
			label,
			context
		]
	]);
	media = push(media, events.slice(close + 1));
	media = push(media, [[
		"exit",
		group,
		context
	]]);
	splice$1(events, open, events.length, media);
	return events;
}
function tokenizeLabelEnd(effects, ok3, nok) {
	const self2 = this;
	let index2 = self2.events.length;
	let labelStart;
	let defined;
	while (index2--) if ((self2.events[index2][1].type === "labelImage" || self2.events[index2][1].type === "labelLink") && !self2.events[index2][1]._balanced) {
		labelStart = self2.events[index2][1];
		break;
	}
	return start;
	function start(code2) {
		if (!labelStart) return nok(code2);
		if (labelStart._inactive) return labelEndNok(code2);
		defined = self2.parser.defined.includes(normalizeIdentifier$1(self2.sliceSerialize({
			start: labelStart.end,
			end: self2.now()
		})));
		effects.enter("labelEnd");
		effects.enter("labelMarker");
		effects.consume(code2);
		effects.exit("labelMarker");
		effects.exit("labelEnd");
		return after;
	}
	function after(code2) {
		if (code2 === 40) return effects.attempt(resourceConstruct, labelEndOk, defined ? labelEndOk : labelEndNok)(code2);
		if (code2 === 91) return effects.attempt(referenceFullConstruct, labelEndOk, defined ? referenceNotFull : labelEndNok)(code2);
		return defined ? labelEndOk(code2) : labelEndNok(code2);
	}
	function referenceNotFull(code2) {
		return effects.attempt(referenceCollapsedConstruct, labelEndOk, labelEndNok)(code2);
	}
	function labelEndOk(code2) {
		return ok3(code2);
	}
	function labelEndNok(code2) {
		labelStart._balanced = true;
		return nok(code2);
	}
}
function tokenizeResource(effects, ok3, nok) {
	return resourceStart;
	function resourceStart(code2) {
		effects.enter("resource");
		effects.enter("resourceMarker");
		effects.consume(code2);
		effects.exit("resourceMarker");
		return resourceBefore;
	}
	function resourceBefore(code2) {
		return markdownLineEndingOrSpace$1(code2) ? factoryWhitespace(effects, resourceOpen)(code2) : resourceOpen(code2);
	}
	function resourceOpen(code2) {
		if (code2 === 41) return resourceEnd(code2);
		return factoryDestination(effects, resourceDestinationAfter, resourceDestinationMissing, "resourceDestination", "resourceDestinationLiteral", "resourceDestinationLiteralMarker", "resourceDestinationRaw", "resourceDestinationString", 32)(code2);
	}
	function resourceDestinationAfter(code2) {
		return markdownLineEndingOrSpace$1(code2) ? factoryWhitespace(effects, resourceBetween)(code2) : resourceEnd(code2);
	}
	function resourceDestinationMissing(code2) {
		return nok(code2);
	}
	function resourceBetween(code2) {
		if (code2 === 34 || code2 === 39 || code2 === 40) return factoryTitle(effects, resourceTitleAfter, nok, "resourceTitle", "resourceTitleMarker", "resourceTitleString")(code2);
		return resourceEnd(code2);
	}
	function resourceTitleAfter(code2) {
		return markdownLineEndingOrSpace$1(code2) ? factoryWhitespace(effects, resourceEnd)(code2) : resourceEnd(code2);
	}
	function resourceEnd(code2) {
		if (code2 === 41) {
			effects.enter("resourceMarker");
			effects.consume(code2);
			effects.exit("resourceMarker");
			effects.exit("resource");
			return ok3;
		}
		return nok(code2);
	}
}
function tokenizeReferenceFull(effects, ok3, nok) {
	const self2 = this;
	return referenceFull;
	function referenceFull(code2) {
		return factoryLabel.call(self2, effects, referenceFullAfter, referenceFullMissing, "reference", "referenceMarker", "referenceString")(code2);
	}
	function referenceFullAfter(code2) {
		return self2.parser.defined.includes(normalizeIdentifier$1(self2.sliceSerialize(self2.events[self2.events.length - 1][1]).slice(1, -1))) ? ok3(code2) : nok(code2);
	}
	function referenceFullMissing(code2) {
		return nok(code2);
	}
}
function tokenizeReferenceCollapsed(effects, ok3, nok) {
	return referenceCollapsedStart;
	function referenceCollapsedStart(code2) {
		effects.enter("reference");
		effects.enter("referenceMarker");
		effects.consume(code2);
		effects.exit("referenceMarker");
		return referenceCollapsedOpen;
	}
	function referenceCollapsedOpen(code2) {
		if (code2 === 93) {
			effects.enter("referenceMarker");
			effects.consume(code2);
			effects.exit("referenceMarker");
			effects.exit("reference");
			return ok3;
		}
		return nok(code2);
	}
}
var labelStartImage = {
	name: "labelStartImage",
	resolveAll: labelEnd.resolveAll,
	tokenize: tokenizeLabelStartImage
};
function tokenizeLabelStartImage(effects, ok3, nok) {
	const self2 = this;
	return start;
	function start(code2) {
		effects.enter("labelImage");
		effects.enter("labelImageMarker");
		effects.consume(code2);
		effects.exit("labelImageMarker");
		return open;
	}
	function open(code2) {
		if (code2 === 91) {
			effects.enter("labelMarker");
			effects.consume(code2);
			effects.exit("labelMarker");
			effects.exit("labelImage");
			return after;
		}
		return nok(code2);
	}
	function after(code2) {
		return code2 === 94 && "_hiddenFootnoteSupport" in self2.parser.constructs ? nok(code2) : ok3(code2);
	}
}
var labelStartLink = {
	name: "labelStartLink",
	resolveAll: labelEnd.resolveAll,
	tokenize: tokenizeLabelStartLink
};
function tokenizeLabelStartLink(effects, ok3, nok) {
	const self2 = this;
	return start;
	function start(code2) {
		effects.enter("labelLink");
		effects.enter("labelMarker");
		effects.consume(code2);
		effects.exit("labelMarker");
		effects.exit("labelLink");
		return after;
	}
	function after(code2) {
		return code2 === 94 && "_hiddenFootnoteSupport" in self2.parser.constructs ? nok(code2) : ok3(code2);
	}
}
var lineEnding = {
	name: "lineEnding",
	tokenize: tokenizeLineEnding
};
function tokenizeLineEnding(effects, ok3) {
	return start;
	function start(code2) {
		effects.enter("lineEnding");
		effects.consume(code2);
		effects.exit("lineEnding");
		return factorySpace$1(effects, ok3, "linePrefix");
	}
}
var thematicBreak$1 = {
	name: "thematicBreak",
	tokenize: tokenizeThematicBreak
};
function tokenizeThematicBreak(effects, ok3, nok) {
	let size = 0;
	let marker;
	return start;
	function start(code2) {
		effects.enter("thematicBreak");
		return before(code2);
	}
	function before(code2) {
		marker = code2;
		return atBreak(code2);
	}
	function atBreak(code2) {
		if (code2 === marker) {
			effects.enter("thematicBreakSequence");
			return sequence(code2);
		}
		if (size >= 3 && (code2 === null || markdownLineEnding$1(code2))) {
			effects.exit("thematicBreak");
			return ok3(code2);
		}
		return nok(code2);
	}
	function sequence(code2) {
		if (code2 === marker) {
			effects.consume(code2);
			size++;
			return sequence;
		}
		effects.exit("thematicBreakSequence");
		return markdownSpace$1(code2) ? factorySpace$1(effects, atBreak, "whitespace")(code2) : atBreak(code2);
	}
}
var list$1 = {
	continuation: { tokenize: tokenizeListContinuation },
	exit: tokenizeListEnd,
	name: "list",
	tokenize: tokenizeListStart
};
var listItemPrefixWhitespaceConstruct = {
	partial: true,
	tokenize: tokenizeListItemPrefixWhitespace
};
var indentConstruct = {
	partial: true,
	tokenize: tokenizeIndent$1
};
function tokenizeListStart(effects, ok3, nok) {
	const self2 = this;
	const tail = self2.events[self2.events.length - 1];
	let initialSize = tail && tail[1].type === "linePrefix" ? tail[2].sliceSerialize(tail[1], true).length : 0;
	let size = 0;
	return start;
	function start(code2) {
		const kind = self2.containerState.type || (code2 === 42 || code2 === 43 || code2 === 45 ? "listUnordered" : "listOrdered");
		if (kind === "listUnordered" ? !self2.containerState.marker || code2 === self2.containerState.marker : asciiDigit(code2)) {
			if (!self2.containerState.type) {
				self2.containerState.type = kind;
				effects.enter(kind, { _container: true });
			}
			if (kind === "listUnordered") {
				effects.enter("listItemPrefix");
				return code2 === 42 || code2 === 45 ? effects.check(thematicBreak$1, nok, atMarker)(code2) : atMarker(code2);
			}
			if (!self2.interrupt || code2 === 49) {
				effects.enter("listItemPrefix");
				effects.enter("listItemValue");
				return inside(code2);
			}
		}
		return nok(code2);
	}
	function inside(code2) {
		if (asciiDigit(code2) && ++size < 10) {
			effects.consume(code2);
			return inside;
		}
		if ((!self2.interrupt || size < 2) && (self2.containerState.marker ? code2 === self2.containerState.marker : code2 === 41 || code2 === 46)) {
			effects.exit("listItemValue");
			return atMarker(code2);
		}
		return nok(code2);
	}
	function atMarker(code2) {
		effects.enter("listItemMarker");
		effects.consume(code2);
		effects.exit("listItemMarker");
		self2.containerState.marker = self2.containerState.marker || code2;
		return effects.check(blankLine$1, self2.interrupt ? nok : onBlank, effects.attempt(listItemPrefixWhitespaceConstruct, endOfPrefix, otherPrefix));
	}
	function onBlank(code2) {
		self2.containerState.initialBlankLine = true;
		initialSize++;
		return endOfPrefix(code2);
	}
	function otherPrefix(code2) {
		if (markdownSpace$1(code2)) {
			effects.enter("listItemPrefixWhitespace");
			effects.consume(code2);
			effects.exit("listItemPrefixWhitespace");
			return endOfPrefix;
		}
		return nok(code2);
	}
	function endOfPrefix(code2) {
		self2.containerState.size = initialSize + self2.sliceSerialize(effects.exit("listItemPrefix"), true).length;
		return ok3(code2);
	}
}
function tokenizeListContinuation(effects, ok3, nok) {
	const self2 = this;
	self2.containerState._closeFlow = void 0;
	return effects.check(blankLine$1, onBlank, notBlank);
	function onBlank(code2) {
		self2.containerState.furtherBlankLines = self2.containerState.furtherBlankLines || self2.containerState.initialBlankLine;
		return factorySpace$1(effects, ok3, "listItemIndent", self2.containerState.size + 1)(code2);
	}
	function notBlank(code2) {
		if (self2.containerState.furtherBlankLines || !markdownSpace$1(code2)) {
			self2.containerState.furtherBlankLines = void 0;
			self2.containerState.initialBlankLine = void 0;
			return notInCurrentItem(code2);
		}
		self2.containerState.furtherBlankLines = void 0;
		self2.containerState.initialBlankLine = void 0;
		return effects.attempt(indentConstruct, ok3, notInCurrentItem)(code2);
	}
	function notInCurrentItem(code2) {
		self2.containerState._closeFlow = true;
		self2.interrupt = void 0;
		return factorySpace$1(effects, effects.attempt(list$1, ok3, nok), "linePrefix", self2.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code2);
	}
}
function tokenizeIndent$1(effects, ok3, nok) {
	const self2 = this;
	return factorySpace$1(effects, afterPrefix, "listItemIndent", self2.containerState.size + 1);
	function afterPrefix(code2) {
		const tail = self2.events[self2.events.length - 1];
		return tail && tail[1].type === "listItemIndent" && tail[2].sliceSerialize(tail[1], true).length === self2.containerState.size ? ok3(code2) : nok(code2);
	}
}
function tokenizeListEnd(effects) {
	effects.exit(this.containerState.type);
}
function tokenizeListItemPrefixWhitespace(effects, ok3, nok) {
	const self2 = this;
	return factorySpace$1(effects, afterPrefix, "listItemPrefixWhitespace", self2.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 5);
	function afterPrefix(code2) {
		const tail = self2.events[self2.events.length - 1];
		return !markdownSpace$1(code2) && tail && tail[1].type === "listItemPrefixWhitespace" ? ok3(code2) : nok(code2);
	}
}
var setextUnderline = {
	name: "setextUnderline",
	resolveTo: resolveToSetextUnderline,
	tokenize: tokenizeSetextUnderline
};
function resolveToSetextUnderline(events, context) {
	let index2 = events.length;
	let content3;
	let text4;
	let definition2;
	while (index2--) if (events[index2][0] === "enter") {
		if (events[index2][1].type === "content") {
			content3 = index2;
			break;
		}
		if (events[index2][1].type === "paragraph") text4 = index2;
	} else {
		if (events[index2][1].type === "content") events.splice(index2, 1);
		if (!definition2 && events[index2][1].type === "definition") definition2 = index2;
	}
	const heading2 = {
		type: "setextHeading",
		start: { ...events[content3][1].start },
		end: { ...events[events.length - 1][1].end }
	};
	events[text4][1].type = "setextHeadingText";
	if (definition2) {
		events.splice(text4, 0, [
			"enter",
			heading2,
			context
		]);
		events.splice(definition2 + 1, 0, [
			"exit",
			events[content3][1],
			context
		]);
		events[content3][1].end = { ...events[definition2][1].end };
	} else events[content3][1] = heading2;
	events.push([
		"exit",
		heading2,
		context
	]);
	return events;
}
function tokenizeSetextUnderline(effects, ok3, nok) {
	const self2 = this;
	let marker;
	return start;
	function start(code2) {
		let index2 = self2.events.length;
		let paragraph2;
		while (index2--) if (self2.events[index2][1].type !== "lineEnding" && self2.events[index2][1].type !== "linePrefix" && self2.events[index2][1].type !== "content") {
			paragraph2 = self2.events[index2][1].type === "paragraph";
			break;
		}
		if (!self2.parser.lazy[self2.now().line] && (self2.interrupt || paragraph2)) {
			effects.enter("setextHeadingLine");
			marker = code2;
			return before(code2);
		}
		return nok(code2);
	}
	function before(code2) {
		effects.enter("setextHeadingLineSequence");
		return inside(code2);
	}
	function inside(code2) {
		if (code2 === marker) {
			effects.consume(code2);
			return inside;
		}
		effects.exit("setextHeadingLineSequence");
		return markdownSpace$1(code2) ? factorySpace$1(effects, after, "lineSuffix")(code2) : after(code2);
	}
	function after(code2) {
		if (code2 === null || markdownLineEnding$1(code2)) {
			effects.exit("setextHeadingLine");
			return ok3(code2);
		}
		return nok(code2);
	}
}
var flow = { tokenize: initializeFlow };
function initializeFlow(effects) {
	const self2 = this;
	const initial = effects.attempt(blankLine$1, atBlankEnding, effects.attempt(this.parser.constructs.flowInitial, afterConstruct, factorySpace$1(effects, effects.attempt(this.parser.constructs.flow, afterConstruct, effects.attempt(content2, afterConstruct)), "linePrefix")));
	return initial;
	function atBlankEnding(code2) {
		if (code2 === null) {
			effects.consume(code2);
			return;
		}
		effects.enter("lineEndingBlank");
		effects.consume(code2);
		effects.exit("lineEndingBlank");
		self2.currentConstruct = void 0;
		return initial;
	}
	function afterConstruct(code2) {
		if (code2 === null) {
			effects.consume(code2);
			return;
		}
		effects.enter("lineEnding");
		effects.consume(code2);
		effects.exit("lineEnding");
		self2.currentConstruct = void 0;
		return initial;
	}
}
var resolver = { resolveAll: createResolver() };
var string = initializeFactory("string");
var text$2 = initializeFactory("text");
function initializeFactory(field) {
	return {
		resolveAll: createResolver(field === "text" ? resolveAllLineSuffixes : void 0),
		tokenize: initializeText
	};
	function initializeText(effects) {
		const self2 = this;
		const constructs2 = this.parser.constructs[field];
		const text4 = effects.attempt(constructs2, start, notText);
		return start;
		function start(code2) {
			return atBreak(code2) ? text4(code2) : notText(code2);
		}
		function notText(code2) {
			if (code2 === null) {
				effects.consume(code2);
				return;
			}
			effects.enter("data");
			effects.consume(code2);
			return data;
		}
		function data(code2) {
			if (atBreak(code2)) {
				effects.exit("data");
				return text4(code2);
			}
			effects.consume(code2);
			return data;
		}
		function atBreak(code2) {
			if (code2 === null) return true;
			const list3 = constructs2[code2];
			let index2 = -1;
			if (list3) while (++index2 < list3.length) {
				const item = list3[index2];
				if (!item.previous || item.previous.call(self2, self2.previous)) return true;
			}
			return false;
		}
	}
}
function createResolver(extraResolver) {
	return resolveAllText;
	function resolveAllText(events, context) {
		let index2 = -1;
		let enter;
		while (++index2 <= events.length) if (enter === void 0) {
			if (events[index2] && events[index2][1].type === "data") {
				enter = index2;
				index2++;
			}
		} else if (!events[index2] || events[index2][1].type !== "data") {
			if (index2 !== enter + 2) {
				events[enter][1].end = events[index2 - 1][1].end;
				events.splice(enter + 2, index2 - enter - 2);
				index2 = enter + 2;
			}
			enter = void 0;
		}
		return extraResolver ? extraResolver(events, context) : events;
	}
}
function resolveAllLineSuffixes(events, context) {
	let eventIndex = 0;
	while (++eventIndex <= events.length) if ((eventIndex === events.length || events[eventIndex][1].type === "lineEnding") && events[eventIndex - 1][1].type === "data") {
		const data = events[eventIndex - 1][1];
		const chunks = context.sliceStream(data);
		let index2 = chunks.length;
		let bufferIndex = -1;
		let size = 0;
		let tabs;
		while (index2--) {
			const chunk = chunks[index2];
			if (typeof chunk === "string") {
				bufferIndex = chunk.length;
				while (chunk.charCodeAt(bufferIndex - 1) === 32) {
					size++;
					bufferIndex--;
				}
				if (bufferIndex) break;
				bufferIndex = -1;
			} else if (chunk === -2) {
				tabs = true;
				size++;
			} else if (chunk === -1) {} else {
				index2++;
				break;
			}
		}
		if (context._contentTypeTextTrailing && eventIndex === events.length) size = 0;
		if (size) {
			const token = {
				type: eventIndex === events.length || tabs || size < 2 ? "lineSuffix" : "hardBreakTrailing",
				start: {
					_bufferIndex: index2 ? bufferIndex : data.start._bufferIndex + bufferIndex,
					_index: data.start._index + index2,
					line: data.end.line,
					column: data.end.column - size,
					offset: data.end.offset - size
				},
				end: { ...data.end }
			};
			data.end = { ...token.start };
			if (data.start.offset === data.end.offset) Object.assign(data, token);
			else {
				events.splice(eventIndex, 0, [
					"enter",
					token,
					context
				], [
					"exit",
					token,
					context
				]);
				eventIndex += 2;
			}
		}
		eventIndex++;
	}
	return events;
}
var constructs_exports = {};
__export(constructs_exports, {
	attentionMarkers: () => attentionMarkers,
	contentInitial: () => contentInitial,
	disable: () => disable,
	document: () => document2,
	flow: () => flow2,
	flowInitial: () => flowInitial,
	insideSpan: () => insideSpan,
	string: () => string2,
	text: () => text2$1
});
var document2 = {
	[42]: list$1,
	[43]: list$1,
	[45]: list$1,
	[48]: list$1,
	[49]: list$1,
	[50]: list$1,
	[51]: list$1,
	[52]: list$1,
	[53]: list$1,
	[54]: list$1,
	[55]: list$1,
	[56]: list$1,
	[57]: list$1,
	[62]: blockQuote
};
var contentInitial = { [91]: definition$1 };
var flowInitial = {
	[-2]: codeIndented,
	[-1]: codeIndented,
	[32]: codeIndented
};
var flow2 = {
	[35]: headingAtx,
	[42]: thematicBreak$1,
	[45]: [setextUnderline, thematicBreak$1],
	[60]: htmlFlow,
	[61]: setextUnderline,
	[95]: thematicBreak$1,
	[96]: codeFenced,
	[126]: codeFenced
};
var string2 = {
	[38]: characterReference,
	[92]: characterEscape
};
var text2$1 = {
	[-5]: lineEnding,
	[-4]: lineEnding,
	[-3]: lineEnding,
	[33]: labelStartImage,
	[38]: characterReference,
	[42]: attention,
	[60]: [autolink, htmlText],
	[91]: labelStartLink,
	[92]: [hardBreakEscape, characterEscape],
	[93]: labelEnd,
	[95]: attention,
	[96]: codeText
};
var insideSpan = { null: [attention, resolver] };
var attentionMarkers = { null: [42, 95] };
var disable = { null: [] };
function createTokenizer(parser, initialize, from) {
	let point4 = {
		_bufferIndex: -1,
		_index: 0,
		line: from && from.line || 1,
		column: from && from.column || 1,
		offset: from && from.offset || 0
	};
	const columnStart = {};
	const resolveAllConstructs = [];
	let chunks = [];
	let stack = [];
	const effects = {
		attempt: constructFactory(onsuccessfulconstruct),
		check: constructFactory(onsuccessfulcheck),
		consume,
		enter,
		exit: exit2,
		interrupt: constructFactory(onsuccessfulcheck, { interrupt: true })
	};
	const context = {
		code: null,
		containerState: {},
		defineSkip,
		events: [],
		now,
		parser,
		previous: null,
		sliceSerialize,
		sliceStream,
		write
	};
	let state = initialize.tokenize.call(context, effects);
	if (initialize.resolveAll) resolveAllConstructs.push(initialize);
	return context;
	function write(slice) {
		chunks = push(chunks, slice);
		main();
		if (chunks[chunks.length - 1] !== null) return [];
		addResult(initialize, 0);
		context.events = resolveAll$1(resolveAllConstructs, context.events, context);
		return context.events;
	}
	function sliceSerialize(token, expandTabs) {
		return serializeChunks(sliceStream(token), expandTabs);
	}
	function sliceStream(token) {
		return sliceChunks(chunks, token);
	}
	function now() {
		const { _bufferIndex, _index, line, column, offset } = point4;
		return {
			_bufferIndex,
			_index,
			line,
			column,
			offset
		};
	}
	function defineSkip(value) {
		columnStart[value.line] = value.column;
		accountForPotentialSkip();
	}
	function main() {
		let chunkIndex;
		while (point4._index < chunks.length) {
			const chunk = chunks[point4._index];
			if (typeof chunk === "string") {
				chunkIndex = point4._index;
				if (point4._bufferIndex < 0) point4._bufferIndex = 0;
				while (point4._index === chunkIndex && point4._bufferIndex < chunk.length) go(chunk.charCodeAt(point4._bufferIndex));
			} else go(chunk);
		}
	}
	function go(code2) {
		state = state(code2);
	}
	function consume(code2) {
		if (markdownLineEnding$1(code2)) {
			point4.line++;
			point4.column = 1;
			point4.offset += code2 === -3 ? 2 : 1;
			accountForPotentialSkip();
		} else if (code2 !== -1) {
			point4.column++;
			point4.offset++;
		}
		if (point4._bufferIndex < 0) point4._index++;
		else {
			point4._bufferIndex++;
			if (point4._bufferIndex === chunks[point4._index].length) {
				point4._bufferIndex = -1;
				point4._index++;
			}
		}
		context.previous = code2;
	}
	function enter(type, fields) {
		const token = fields || {};
		token.type = type;
		token.start = now();
		context.events.push([
			"enter",
			token,
			context
		]);
		stack.push(token);
		return token;
	}
	function exit2(type) {
		const token = stack.pop();
		token.end = now();
		context.events.push([
			"exit",
			token,
			context
		]);
		return token;
	}
	function onsuccessfulconstruct(construct, info) {
		addResult(construct, info.from);
	}
	function onsuccessfulcheck(_, info) {
		info.restore();
	}
	function constructFactory(onreturn, fields) {
		return hook;
		function hook(constructs2, returnState, bogusState) {
			let listOfConstructs;
			let constructIndex;
			let currentConstruct;
			let info;
			return Array.isArray(constructs2) ? 
			/* c8 ignore next 1 */
			handleListOfConstructs(constructs2) : "tokenize" in constructs2 ? handleListOfConstructs([constructs2]) : handleMapOfConstructs(constructs2);
			function handleMapOfConstructs(map) {
				return start;
				function start(code2) {
					const left = code2 !== null && map[code2];
					const all2 = code2 !== null && map.null;
					return handleListOfConstructs([...Array.isArray(left) ? left : left ? [left] : [], ...Array.isArray(all2) ? all2 : all2 ? [all2] : []])(code2);
				}
			}
			function handleListOfConstructs(list3) {
				listOfConstructs = list3;
				constructIndex = 0;
				if (list3.length === 0) return bogusState;
				return handleConstruct(list3[constructIndex]);
			}
			function handleConstruct(construct) {
				return start;
				function start(code2) {
					info = store();
					currentConstruct = construct;
					if (!construct.partial) context.currentConstruct = construct;
					if (construct.name && context.parser.constructs.disable.null.includes(construct.name)) return nok(code2);
					return construct.tokenize.call(fields ? Object.assign(Object.create(context), fields) : context, effects, ok3, nok)(code2);
				}
			}
			function ok3(code2) {
				onreturn(currentConstruct, info);
				return returnState;
			}
			function nok(code2) {
				info.restore();
				if (++constructIndex < listOfConstructs.length) return handleConstruct(listOfConstructs[constructIndex]);
				return bogusState;
			}
		}
	}
	function addResult(construct, from2) {
		if (construct.resolveAll && !resolveAllConstructs.includes(construct)) resolveAllConstructs.push(construct);
		if (construct.resolve) splice$1(context.events, from2, context.events.length - from2, construct.resolve(context.events.slice(from2), context));
		if (construct.resolveTo) context.events = construct.resolveTo(context.events, context);
	}
	function store() {
		const startPoint = now();
		const startPrevious = context.previous;
		const startCurrentConstruct = context.currentConstruct;
		const startEventsIndex = context.events.length;
		const startStack = Array.from(stack);
		return {
			from: startEventsIndex,
			restore
		};
		function restore() {
			point4 = startPoint;
			context.previous = startPrevious;
			context.currentConstruct = startCurrentConstruct;
			context.events.length = startEventsIndex;
			stack = startStack;
			accountForPotentialSkip();
		}
	}
	function accountForPotentialSkip() {
		if (point4.line in columnStart && point4.column < 2) {
			point4.column = columnStart[point4.line];
			point4.offset += columnStart[point4.line] - 1;
		}
	}
}
function sliceChunks(chunks, token) {
	const startIndex = token.start._index;
	const startBufferIndex = token.start._bufferIndex;
	const endIndex = token.end._index;
	const endBufferIndex = token.end._bufferIndex;
	let view;
	if (startIndex === endIndex) view = [chunks[startIndex].slice(startBufferIndex, endBufferIndex)];
	else {
		view = chunks.slice(startIndex, endIndex);
		if (startBufferIndex > -1) {
			const head = view[0];
			if (typeof head === "string") view[0] = head.slice(startBufferIndex);
			else view.shift();
		}
		if (endBufferIndex > 0) view.push(chunks[endIndex].slice(0, endBufferIndex));
	}
	return view;
}
function serializeChunks(chunks, expandTabs) {
	let index2 = -1;
	const result = [];
	let atTab;
	while (++index2 < chunks.length) {
		const chunk = chunks[index2];
		let value;
		if (typeof chunk === "string") value = chunk;
		else switch (chunk) {
			case -5:
				value = "\r";
				break;
			case -4:
				value = "\n";
				break;
			case -3:
				value = "\r\n";
				break;
			case -2:
				value = expandTabs ? " " : "	";
				break;
			case -1:
				if (!expandTabs && atTab) continue;
				value = " ";
				break;
			default: value = String.fromCharCode(chunk);
		}
		atTab = chunk === -2;
		result.push(value);
	}
	return result.join("");
}
function parse(options) {
	const parser = {
		constructs: combineExtensions$1([constructs_exports, ...(options || {}).extensions || []]),
		content: create(content),
		defined: [],
		document: create(document$1),
		flow: create(flow),
		lazy: {},
		string: create(string),
		text: create(text$2)
	};
	return parser;
	function create(initial) {
		return creator;
		function creator(from) {
			return createTokenizer(parser, initial, from);
		}
	}
}
function postprocess(events) {
	while (!subtokenize(events));
	return events;
}
var search = /[\0\t\n\r]/g;
function preprocess() {
	let column = 1;
	let buffer = "";
	let start = true;
	let atCarriageReturn;
	return preprocessor;
	function preprocessor(value, encoding, end) {
		const chunks = [];
		let match;
		let next;
		let startPosition;
		let endPosition;
		let code2;
		value = buffer + (typeof value === "string" ? value.toString() : new TextDecoder(encoding || void 0).decode(value));
		startPosition = 0;
		buffer = "";
		if (start) {
			if (value.charCodeAt(0) === 65279) startPosition++;
			start = void 0;
		}
		while (startPosition < value.length) {
			search.lastIndex = startPosition;
			match = search.exec(value);
			endPosition = match && match.index !== void 0 ? match.index : value.length;
			code2 = value.charCodeAt(endPosition);
			if (!match) {
				buffer = value.slice(startPosition);
				break;
			}
			if (code2 === 10 && startPosition === endPosition && atCarriageReturn) {
				chunks.push(-3);
				atCarriageReturn = void 0;
			} else {
				if (atCarriageReturn) {
					chunks.push(-5);
					atCarriageReturn = void 0;
				}
				if (startPosition < endPosition) {
					chunks.push(value.slice(startPosition, endPosition));
					column += endPosition - startPosition;
				}
				switch (code2) {
					case 0:
						chunks.push(65533);
						column++;
						break;
					case 9:
						next = Math.ceil(column / 4) * 4;
						chunks.push(-2);
						while (column++ < next) chunks.push(-1);
						break;
					case 10:
						chunks.push(-4);
						column = 1;
						break;
					default:
						atCarriageReturn = true;
						column = 1;
				}
			}
			startPosition = endPosition + 1;
		}
		if (end) {
			if (atCarriageReturn) chunks.push(-5);
			if (buffer) chunks.push(buffer);
			chunks.push(null);
		}
		return chunks;
	}
}
var characterEscapeOrReference = /\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi;
function decodeString(value) {
	return value.replace(characterEscapeOrReference, decode);
}
function decode($0, $1, $2) {
	if ($1) return $1;
	if ($2.charCodeAt(0) === 35) {
		const head2 = $2.charCodeAt(1);
		const hex = head2 === 120 || head2 === 88;
		return decodeNumericCharacterReference($2.slice(hex ? 2 : 1), hex ? 16 : 10);
	}
	return decodeNamedCharacterReference($2) || $0;
}
function stringifyPosition(value) {
	if (!value || typeof value !== "object") return "";
	if ("position" in value || "type" in value) return position$1(value.position);
	if ("start" in value || "end" in value) return position$1(value);
	if ("line" in value || "column" in value) return point$1(value);
	return "";
}
function point$1(point4) {
	return index(point4 && point4.line) + ":" + index(point4 && point4.column);
}
function position$1(pos) {
	return point$1(pos && pos.start) + "-" + point$1(pos && pos.end);
}
function index(value) {
	return value && typeof value === "number" ? value : 1;
}
var own2 = {}.hasOwnProperty;
function fromMarkdown(value, encoding, options) {
	if (typeof encoding !== "string") {
		options = encoding;
		encoding = void 0;
	}
	return compiler(options)(postprocess(parse(options).document().write(preprocess()(value, encoding, true))));
}
function compiler(options) {
	const config = {
		transforms: [],
		canContainEols: [
			"emphasis",
			"fragment",
			"heading",
			"paragraph",
			"strong"
		],
		enter: {
			autolink: opener(link2),
			autolinkProtocol: onenterdata,
			autolinkEmail: onenterdata,
			atxHeading: opener(heading2),
			blockQuote: opener(blockQuote2),
			characterEscape: onenterdata,
			characterReference: onenterdata,
			codeFenced: opener(codeFlow),
			codeFencedFenceInfo: buffer,
			codeFencedFenceMeta: buffer,
			codeIndented: opener(codeFlow, buffer),
			codeText: opener(codeText2, buffer),
			codeTextData: onenterdata,
			data: onenterdata,
			codeFlowValue: onenterdata,
			definition: opener(definition2),
			definitionDestinationString: buffer,
			definitionLabelString: buffer,
			definitionTitleString: buffer,
			emphasis: opener(emphasis2),
			hardBreakEscape: opener(hardBreak2),
			hardBreakTrailing: opener(hardBreak2),
			htmlFlow: opener(html2, buffer),
			htmlFlowData: onenterdata,
			htmlText: opener(html2, buffer),
			htmlTextData: onenterdata,
			image: opener(image2),
			label: buffer,
			link: opener(link2),
			listItem: opener(listItem2),
			listItemValue: onenterlistitemvalue,
			listOrdered: opener(list3, onenterlistordered),
			listUnordered: opener(list3),
			paragraph: opener(paragraph2),
			reference: onenterreference,
			referenceString: buffer,
			resourceDestinationString: buffer,
			resourceTitleString: buffer,
			setextHeading: opener(heading2),
			strong: opener(strong2),
			thematicBreak: opener(thematicBreak3)
		},
		exit: {
			atxHeading: closer(),
			atxHeadingSequence: onexitatxheadingsequence,
			autolink: closer(),
			autolinkEmail: onexitautolinkemail,
			autolinkProtocol: onexitautolinkprotocol,
			blockQuote: closer(),
			characterEscapeValue: onexitdata,
			characterReferenceMarkerHexadecimal: onexitcharacterreferencemarker,
			characterReferenceMarkerNumeric: onexitcharacterreferencemarker,
			characterReferenceValue: onexitcharacterreferencevalue,
			characterReference: onexitcharacterreference,
			codeFenced: closer(onexitcodefenced),
			codeFencedFence: onexitcodefencedfence,
			codeFencedFenceInfo: onexitcodefencedfenceinfo,
			codeFencedFenceMeta: onexitcodefencedfencemeta,
			codeFlowValue: onexitdata,
			codeIndented: closer(onexitcodeindented),
			codeText: closer(onexitcodetext),
			codeTextData: onexitdata,
			data: onexitdata,
			definition: closer(),
			definitionDestinationString: onexitdefinitiondestinationstring,
			definitionLabelString: onexitdefinitionlabelstring,
			definitionTitleString: onexitdefinitiontitlestring,
			emphasis: closer(),
			hardBreakEscape: closer(onexithardbreak),
			hardBreakTrailing: closer(onexithardbreak),
			htmlFlow: closer(onexithtmlflow),
			htmlFlowData: onexitdata,
			htmlText: closer(onexithtmltext),
			htmlTextData: onexitdata,
			image: closer(onexitimage),
			label: onexitlabel,
			labelText: onexitlabeltext,
			lineEnding: onexitlineending,
			link: closer(onexitlink),
			listItem: closer(),
			listOrdered: closer(),
			listUnordered: closer(),
			paragraph: closer(),
			referenceString: onexitreferencestring,
			resourceDestinationString: onexitresourcedestinationstring,
			resourceTitleString: onexitresourcetitlestring,
			resource: onexitresource,
			setextHeading: closer(onexitsetextheading),
			setextHeadingLineSequence: onexitsetextheadinglinesequence,
			setextHeadingText: onexitsetextheadingtext,
			strong: closer(),
			thematicBreak: closer()
		}
	};
	configure(config, (options || {}).mdastExtensions || []);
	const data = {};
	return compile;
	function compile(events) {
		let tree = {
			type: "root",
			children: []
		};
		const context = {
			stack: [tree],
			tokenStack: [],
			config,
			enter,
			exit: exit2,
			buffer,
			resume,
			data
		};
		const listStack = [];
		let index2 = -1;
		while (++index2 < events.length) if (events[index2][1].type === "listOrdered" || events[index2][1].type === "listUnordered") {
			if (events[index2][0] === "enter") listStack.push(index2);
			else index2 = prepareList(events, listStack.pop(), index2);
		}
		index2 = -1;
		while (++index2 < events.length) {
			const handler = config[events[index2][0]];
			if (own2.call(handler, events[index2][1].type)) handler[events[index2][1].type].call(Object.assign({ sliceSerialize: events[index2][2].sliceSerialize }, context), events[index2][1]);
		}
		if (context.tokenStack.length > 0) {
			const tail = context.tokenStack[context.tokenStack.length - 1];
			(tail[1] || defaultOnError).call(context, void 0, tail[0]);
		}
		tree.position = {
			start: point2(events.length > 0 ? events[0][1].start : {
				line: 1,
				column: 1,
				offset: 0
			}),
			end: point2(events.length > 0 ? events[events.length - 2][1].end : {
				line: 1,
				column: 1,
				offset: 0
			})
		};
		index2 = -1;
		while (++index2 < config.transforms.length) tree = config.transforms[index2](tree) || tree;
		return tree;
	}
	function prepareList(events, start, length) {
		let index2 = start - 1;
		let containerBalance = -1;
		let listSpread = false;
		let listItem3;
		let lineIndex;
		let firstBlankLineIndex;
		let atMarker;
		while (++index2 <= length) {
			const event = events[index2];
			switch (event[1].type) {
				case "listUnordered":
				case "listOrdered":
				case "blockQuote":
					if (event[0] === "enter") containerBalance++;
					else containerBalance--;
					atMarker = void 0;
					break;
				case "lineEndingBlank":
					if (event[0] === "enter") {
						if (listItem3 && !atMarker && !containerBalance && !firstBlankLineIndex) firstBlankLineIndex = index2;
						atMarker = void 0;
					}
					break;
				case "linePrefix":
				case "listItemValue":
				case "listItemMarker":
				case "listItemPrefix":
				case "listItemPrefixWhitespace": break;
				default: atMarker = void 0;
			}
			if (!containerBalance && event[0] === "enter" && event[1].type === "listItemPrefix" || containerBalance === -1 && event[0] === "exit" && (event[1].type === "listUnordered" || event[1].type === "listOrdered")) {
				if (listItem3) {
					let tailIndex = index2;
					lineIndex = void 0;
					while (tailIndex--) {
						const tailEvent = events[tailIndex];
						if (tailEvent[1].type === "lineEnding" || tailEvent[1].type === "lineEndingBlank") {
							if (tailEvent[0] === "exit") continue;
							if (lineIndex) {
								events[lineIndex][1].type = "lineEndingBlank";
								listSpread = true;
							}
							tailEvent[1].type = "lineEnding";
							lineIndex = tailIndex;
						} else if (tailEvent[1].type === "linePrefix" || tailEvent[1].type === "blockQuotePrefix" || tailEvent[1].type === "blockQuotePrefixWhitespace" || tailEvent[1].type === "blockQuoteMarker" || tailEvent[1].type === "listItemIndent") {} else break;
					}
					if (firstBlankLineIndex && (!lineIndex || firstBlankLineIndex < lineIndex)) listItem3._spread = true;
					listItem3.end = Object.assign({}, lineIndex ? events[lineIndex][1].start : event[1].end);
					events.splice(lineIndex || index2, 0, [
						"exit",
						listItem3,
						event[2]
					]);
					index2++;
					length++;
				}
				if (event[1].type === "listItemPrefix") {
					const item = {
						type: "listItem",
						_spread: false,
						start: Object.assign({}, event[1].start),
						end: void 0
					};
					listItem3 = item;
					events.splice(index2, 0, [
						"enter",
						item,
						event[2]
					]);
					index2++;
					length++;
					firstBlankLineIndex = void 0;
					atMarker = true;
				}
			}
		}
		events[start][1]._spread = listSpread;
		return length;
	}
	function opener(create, and) {
		return open;
		function open(token) {
			enter.call(this, create(token), token);
			if (and) and.call(this, token);
		}
	}
	function buffer() {
		this.stack.push({
			type: "fragment",
			children: []
		});
	}
	function enter(node2, token, errorHandler) {
		this.stack[this.stack.length - 1].children.push(node2);
		this.stack.push(node2);
		this.tokenStack.push([token, errorHandler || void 0]);
		node2.position = {
			start: point2(token.start),
			end: void 0
		};
	}
	function closer(and) {
		return close;
		function close(token) {
			if (and) and.call(this, token);
			exit2.call(this, token);
		}
	}
	function exit2(token, onExitError) {
		const node2 = this.stack.pop();
		const open = this.tokenStack.pop();
		if (!open) throw new Error("Cannot close `" + token.type + "` (" + stringifyPosition({
			start: token.start,
			end: token.end
		}) + "): it’s not open");
		else if (open[0].type !== token.type) {
			if (onExitError) onExitError.call(this, token, open[0]);
			else (open[1] || defaultOnError).call(this, token, open[0]);
		}
		node2.position.end = point2(token.end);
	}
	function resume() {
		return toString$2(this.stack.pop());
	}
	function onenterlistordered() {
		this.data.expectingFirstListItemValue = true;
	}
	function onenterlistitemvalue(token) {
		if (this.data.expectingFirstListItemValue) {
			const ancestor = this.stack[this.stack.length - 2];
			ancestor.start = Number.parseInt(this.sliceSerialize(token), 10);
			this.data.expectingFirstListItemValue = void 0;
		}
	}
	function onexitcodefencedfenceinfo() {
		const data2 = this.resume();
		const node2 = this.stack[this.stack.length - 1];
		node2.lang = data2;
	}
	function onexitcodefencedfencemeta() {
		const data2 = this.resume();
		const node2 = this.stack[this.stack.length - 1];
		node2.meta = data2;
	}
	function onexitcodefencedfence() {
		if (this.data.flowCodeInside) return;
		this.buffer();
		this.data.flowCodeInside = true;
	}
	function onexitcodefenced() {
		const data2 = this.resume();
		const node2 = this.stack[this.stack.length - 1];
		node2.value = data2.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, "");
		this.data.flowCodeInside = void 0;
	}
	function onexitcodeindented() {
		const data2 = this.resume();
		const node2 = this.stack[this.stack.length - 1];
		node2.value = data2.replace(/(\r?\n|\r)$/g, "");
	}
	function onexitdefinitionlabelstring(token) {
		const label = this.resume();
		const node2 = this.stack[this.stack.length - 1];
		node2.label = label;
		node2.identifier = normalizeIdentifier$1(this.sliceSerialize(token)).toLowerCase();
	}
	function onexitdefinitiontitlestring() {
		const data2 = this.resume();
		const node2 = this.stack[this.stack.length - 1];
		node2.title = data2;
	}
	function onexitdefinitiondestinationstring() {
		const data2 = this.resume();
		const node2 = this.stack[this.stack.length - 1];
		node2.url = data2;
	}
	function onexitatxheadingsequence(token) {
		const node2 = this.stack[this.stack.length - 1];
		if (!node2.depth) node2.depth = this.sliceSerialize(token).length;
	}
	function onexitsetextheadingtext() {
		this.data.setextHeadingSlurpLineEnding = true;
	}
	function onexitsetextheadinglinesequence(token) {
		const node2 = this.stack[this.stack.length - 1];
		node2.depth = this.sliceSerialize(token).codePointAt(0) === 61 ? 1 : 2;
	}
	function onexitsetextheading() {
		this.data.setextHeadingSlurpLineEnding = void 0;
	}
	function onenterdata(token) {
		const siblings = this.stack[this.stack.length - 1].children;
		let tail = siblings[siblings.length - 1];
		if (!tail || tail.type !== "text") {
			tail = text4();
			tail.position = {
				start: point2(token.start),
				end: void 0
			};
			siblings.push(tail);
		}
		this.stack.push(tail);
	}
	function onexitdata(token) {
		const tail = this.stack.pop();
		tail.value += this.sliceSerialize(token);
		tail.position.end = point2(token.end);
	}
	function onexitlineending(token) {
		const context = this.stack[this.stack.length - 1];
		if (this.data.atHardBreak) {
			const tail = context.children[context.children.length - 1];
			tail.position.end = point2(token.end);
			this.data.atHardBreak = void 0;
			return;
		}
		if (!this.data.setextHeadingSlurpLineEnding && config.canContainEols.includes(context.type)) {
			onenterdata.call(this, token);
			onexitdata.call(this, token);
		}
	}
	function onexithardbreak() {
		this.data.atHardBreak = true;
	}
	function onexithtmlflow() {
		const data2 = this.resume();
		const node2 = this.stack[this.stack.length - 1];
		node2.value = data2;
	}
	function onexithtmltext() {
		const data2 = this.resume();
		const node2 = this.stack[this.stack.length - 1];
		node2.value = data2;
	}
	function onexitcodetext() {
		const data2 = this.resume();
		const node2 = this.stack[this.stack.length - 1];
		node2.value = data2;
	}
	function onexitlink() {
		const node2 = this.stack[this.stack.length - 1];
		if (this.data.inReference) {
			const referenceType = this.data.referenceType || "shortcut";
			node2.type += "Reference";
			node2.referenceType = referenceType;
			delete node2.url;
			delete node2.title;
		} else {
			delete node2.identifier;
			delete node2.label;
		}
		this.data.referenceType = void 0;
	}
	function onexitimage() {
		const node2 = this.stack[this.stack.length - 1];
		if (this.data.inReference) {
			const referenceType = this.data.referenceType || "shortcut";
			node2.type += "Reference";
			node2.referenceType = referenceType;
			delete node2.url;
			delete node2.title;
		} else {
			delete node2.identifier;
			delete node2.label;
		}
		this.data.referenceType = void 0;
	}
	function onexitlabeltext(token) {
		const string3 = this.sliceSerialize(token);
		const ancestor = this.stack[this.stack.length - 2];
		ancestor.label = decodeString(string3);
		ancestor.identifier = normalizeIdentifier$1(string3).toLowerCase();
	}
	function onexitlabel() {
		const fragment = this.stack[this.stack.length - 1];
		const value = this.resume();
		const node2 = this.stack[this.stack.length - 1];
		this.data.inReference = true;
		if (node2.type === "link") node2.children = fragment.children;
		else node2.alt = value;
	}
	function onexitresourcedestinationstring() {
		const data2 = this.resume();
		const node2 = this.stack[this.stack.length - 1];
		node2.url = data2;
	}
	function onexitresourcetitlestring() {
		const data2 = this.resume();
		const node2 = this.stack[this.stack.length - 1];
		node2.title = data2;
	}
	function onexitresource() {
		this.data.inReference = void 0;
	}
	function onenterreference() {
		this.data.referenceType = "collapsed";
	}
	function onexitreferencestring(token) {
		const label = this.resume();
		const node2 = this.stack[this.stack.length - 1];
		node2.label = label;
		node2.identifier = normalizeIdentifier$1(this.sliceSerialize(token)).toLowerCase();
		this.data.referenceType = "full";
	}
	function onexitcharacterreferencemarker(token) {
		this.data.characterReferenceType = token.type;
	}
	function onexitcharacterreferencevalue(token) {
		const data2 = this.sliceSerialize(token);
		const type = this.data.characterReferenceType;
		let value;
		if (type) {
			value = decodeNumericCharacterReference(data2, type === "characterReferenceMarkerNumeric" ? 10 : 16);
			this.data.characterReferenceType = void 0;
		} else value = decodeNamedCharacterReference(data2);
		const tail = this.stack[this.stack.length - 1];
		tail.value += value;
	}
	function onexitcharacterreference(token) {
		const tail = this.stack.pop();
		tail.position.end = point2(token.end);
	}
	function onexitautolinkprotocol(token) {
		onexitdata.call(this, token);
		const node2 = this.stack[this.stack.length - 1];
		node2.url = this.sliceSerialize(token);
	}
	function onexitautolinkemail(token) {
		onexitdata.call(this, token);
		const node2 = this.stack[this.stack.length - 1];
		node2.url = "mailto:" + this.sliceSerialize(token);
	}
	function blockQuote2() {
		return {
			type: "blockquote",
			children: []
		};
	}
	function codeFlow() {
		return {
			type: "code",
			lang: null,
			meta: null,
			value: ""
		};
	}
	function codeText2() {
		return {
			type: "inlineCode",
			value: ""
		};
	}
	function definition2() {
		return {
			type: "definition",
			identifier: "",
			label: null,
			title: null,
			url: ""
		};
	}
	function emphasis2() {
		return {
			type: "emphasis",
			children: []
		};
	}
	function heading2() {
		return {
			type: "heading",
			depth: 0,
			children: []
		};
	}
	function hardBreak2() {
		return { type: "break" };
	}
	function html2() {
		return {
			type: "html",
			value: ""
		};
	}
	function image2() {
		return {
			type: "image",
			title: null,
			url: "",
			alt: null
		};
	}
	function link2() {
		return {
			type: "link",
			title: null,
			url: "",
			children: []
		};
	}
	function list3(token) {
		return {
			type: "list",
			ordered: token.type === "listOrdered",
			start: null,
			spread: token._spread,
			children: []
		};
	}
	function listItem2(token) {
		return {
			type: "listItem",
			spread: token._spread,
			checked: null,
			children: []
		};
	}
	function paragraph2() {
		return {
			type: "paragraph",
			children: []
		};
	}
	function strong2() {
		return {
			type: "strong",
			children: []
		};
	}
	function text4() {
		return {
			type: "text",
			value: ""
		};
	}
	function thematicBreak3() {
		return { type: "thematicBreak" };
	}
}
function point2(d) {
	return {
		line: d.line,
		column: d.column,
		offset: d.offset
	};
}
function configure(combined, extensions) {
	let index2 = -1;
	while (++index2 < extensions.length) {
		const value = extensions[index2];
		if (Array.isArray(value)) configure(combined, value);
		else extension(combined, value);
	}
}
function extension(combined, extension2) {
	let key;
	for (key in extension2) if (own2.call(extension2, key)) switch (key) {
		case "canContainEols": {
			const right = extension2[key];
			if (right) combined[key].push(...right);
			break;
		}
		case "transforms": {
			const right = extension2[key];
			if (right) combined[key].push(...right);
			break;
		}
		case "enter":
		case "exit": {
			const right = extension2[key];
			if (right) Object.assign(combined[key], right);
			break;
		}
	}
}
function defaultOnError(left, right) {
	if (left) throw new Error("Cannot close `" + left.type + "` (" + stringifyPosition({
		start: left.start,
		end: left.end
	}) + "): a different token (`" + right.type + "`, " + stringifyPosition({
		start: right.start,
		end: right.end
	}) + ") is open");
	else throw new Error("Cannot close document, a token (`" + right.type + "`, " + stringifyPosition({
		start: right.start,
		end: right.end
	}) + ") is still open");
}
function remarkParse(options) {
	const self2 = this;
	self2.parser = parser;
	function parser(doc) {
		return fromMarkdown(doc, {
			...self2.data("settings"),
			...options,
			extensions: self2.data("micromarkExtensions") || [],
			mdastExtensions: self2.data("fromMarkdownExtensions") || []
		});
	}
}
function blockquote$1(state, node2) {
	const result = {
		type: "element",
		tagName: "blockquote",
		properties: {},
		children: state.wrap(state.all(node2), true)
	};
	state.patch(node2, result);
	return state.applyData(node2, result);
}
function hardBreak$1(state, node2) {
	const result = {
		type: "element",
		tagName: "br",
		properties: {},
		children: []
	};
	state.patch(node2, result);
	return [state.applyData(node2, result), {
		type: "text",
		value: "\n"
	}];
}
function code$1(state, node2) {
	const value = node2.value ? node2.value + "\n" : "";
	const properties = {};
	if (node2.lang) properties.className = ["language-" + node2.lang];
	let result = {
		type: "element",
		tagName: "code",
		properties,
		children: [{
			type: "text",
			value
		}]
	};
	if (node2.meta) result.data = { meta: node2.meta };
	state.patch(node2, result);
	result = state.applyData(node2, result);
	result = {
		type: "element",
		tagName: "pre",
		properties: {},
		children: [result]
	};
	state.patch(node2, result);
	return result;
}
function strikethrough(state, node2) {
	const result = {
		type: "element",
		tagName: "del",
		properties: {},
		children: state.all(node2)
	};
	state.patch(node2, result);
	return state.applyData(node2, result);
}
function emphasis$1(state, node2) {
	const result = {
		type: "element",
		tagName: "em",
		properties: {},
		children: state.all(node2)
	};
	state.patch(node2, result);
	return state.applyData(node2, result);
}
function footnoteReference$1(state, node2) {
	const clobberPrefix = typeof state.options.clobberPrefix === "string" ? state.options.clobberPrefix : "user-content-";
	const id = String(node2.identifier).toUpperCase();
	const safeId = normalizeUri(id.toLowerCase());
	const index2 = state.footnoteOrder.indexOf(id);
	let counter;
	let reuseCounter = state.footnoteCounts.get(id);
	if (reuseCounter === void 0) {
		reuseCounter = 0;
		state.footnoteOrder.push(id);
		counter = state.footnoteOrder.length;
	} else counter = index2 + 1;
	reuseCounter += 1;
	state.footnoteCounts.set(id, reuseCounter);
	const link2 = {
		type: "element",
		tagName: "a",
		properties: {
			href: "#" + clobberPrefix + "fn-" + safeId,
			id: clobberPrefix + "fnref-" + safeId + (reuseCounter > 1 ? "-" + reuseCounter : ""),
			dataFootnoteRef: true,
			ariaDescribedBy: ["footnote-label"]
		},
		children: [{
			type: "text",
			value: String(counter)
		}]
	};
	state.patch(node2, link2);
	const sup = {
		type: "element",
		tagName: "sup",
		properties: {},
		children: [link2]
	};
	state.patch(node2, sup);
	return state.applyData(node2, sup);
}
function heading$1(state, node2) {
	const result = {
		type: "element",
		tagName: "h" + node2.depth,
		properties: {},
		children: state.all(node2)
	};
	state.patch(node2, result);
	return state.applyData(node2, result);
}
function html$1(state, node2) {
	if (state.options.allowDangerousHtml) {
		const result = {
			type: "raw",
			value: node2.value
		};
		state.patch(node2, result);
		return state.applyData(node2, result);
	}
}
function revert(state, node2) {
	const subtype = node2.referenceType;
	let suffix = "]";
	if (subtype === "collapsed") suffix += "[]";
	else if (subtype === "full") suffix += "[" + (node2.label || node2.identifier) + "]";
	if (node2.type === "imageReference") return [{
		type: "text",
		value: "![" + node2.alt + suffix
	}];
	const contents = state.all(node2);
	const head = contents[0];
	if (head && head.type === "text") head.value = "[" + head.value;
	else contents.unshift({
		type: "text",
		value: "["
	});
	const tail = contents[contents.length - 1];
	if (tail && tail.type === "text") tail.value += suffix;
	else contents.push({
		type: "text",
		value: suffix
	});
	return contents;
}
function imageReference$1(state, node2) {
	const id = String(node2.identifier).toUpperCase();
	const definition2 = state.definitionById.get(id);
	if (!definition2) return revert(state, node2);
	const properties = {
		src: normalizeUri(definition2.url || ""),
		alt: node2.alt
	};
	if (definition2.title !== null && definition2.title !== void 0) properties.title = definition2.title;
	const result = {
		type: "element",
		tagName: "img",
		properties,
		children: []
	};
	state.patch(node2, result);
	return state.applyData(node2, result);
}
function image$1(state, node2) {
	const properties = { src: normalizeUri(node2.url) };
	if (node2.alt !== null && node2.alt !== void 0) properties.alt = node2.alt;
	if (node2.title !== null && node2.title !== void 0) properties.title = node2.title;
	const result = {
		type: "element",
		tagName: "img",
		properties,
		children: []
	};
	state.patch(node2, result);
	return state.applyData(node2, result);
}
function inlineCode$1(state, node2) {
	const text4 = {
		type: "text",
		value: node2.value.replace(/\r?\n|\r/g, " ")
	};
	state.patch(node2, text4);
	const result = {
		type: "element",
		tagName: "code",
		properties: {},
		children: [text4]
	};
	state.patch(node2, result);
	return state.applyData(node2, result);
}
function linkReference$1(state, node2) {
	const id = String(node2.identifier).toUpperCase();
	const definition2 = state.definitionById.get(id);
	if (!definition2) return revert(state, node2);
	const properties = { href: normalizeUri(definition2.url || "") };
	if (definition2.title !== null && definition2.title !== void 0) properties.title = definition2.title;
	const result = {
		type: "element",
		tagName: "a",
		properties,
		children: state.all(node2)
	};
	state.patch(node2, result);
	return state.applyData(node2, result);
}
function link$1(state, node2) {
	const properties = { href: normalizeUri(node2.url) };
	if (node2.title !== null && node2.title !== void 0) properties.title = node2.title;
	const result = {
		type: "element",
		tagName: "a",
		properties,
		children: state.all(node2)
	};
	state.patch(node2, result);
	return state.applyData(node2, result);
}
function listItem$1(state, node2, parent) {
	const results = state.all(node2);
	const loose = parent ? listLoose(parent) : listItemLoose(node2);
	const properties = {};
	const children = [];
	if (typeof node2.checked === "boolean") {
		const head = results[0];
		let paragraph2;
		if (head && head.type === "element" && head.tagName === "p") paragraph2 = head;
		else {
			paragraph2 = {
				type: "element",
				tagName: "p",
				properties: {},
				children: []
			};
			results.unshift(paragraph2);
		}
		if (paragraph2.children.length > 0) paragraph2.children.unshift({
			type: "text",
			value: " "
		});
		paragraph2.children.unshift({
			type: "element",
			tagName: "input",
			properties: {
				type: "checkbox",
				checked: node2.checked,
				disabled: true
			},
			children: []
		});
		properties.className = ["task-list-item"];
	}
	let index2 = -1;
	while (++index2 < results.length) {
		const child = results[index2];
		if (loose || index2 !== 0 || child.type !== "element" || child.tagName !== "p") children.push({
			type: "text",
			value: "\n"
		});
		if (child.type === "element" && child.tagName === "p" && !loose) children.push(...child.children);
		else children.push(child);
	}
	const tail = results[results.length - 1];
	if (tail && (loose || tail.type !== "element" || tail.tagName !== "p")) children.push({
		type: "text",
		value: "\n"
	});
	const result = {
		type: "element",
		tagName: "li",
		properties,
		children
	};
	state.patch(node2, result);
	return state.applyData(node2, result);
}
function listLoose(node2) {
	let loose = false;
	if (node2.type === "list") {
		loose = node2.spread || false;
		const children = node2.children;
		let index2 = -1;
		while (!loose && ++index2 < children.length) loose = listItemLoose(children[index2]);
	}
	return loose;
}
function listItemLoose(node2) {
	const spread = node2.spread;
	return spread === null || spread === void 0 ? node2.children.length > 1 : spread;
}
function list2(state, node2) {
	const properties = {};
	const results = state.all(node2);
	let index2 = -1;
	if (typeof node2.start === "number" && node2.start !== 1) properties.start = node2.start;
	while (++index2 < results.length) {
		const child = results[index2];
		if (child.type === "element" && child.tagName === "li" && child.properties && Array.isArray(child.properties.className) && child.properties.className.includes("task-list-item")) {
			properties.className = ["contains-task-list"];
			break;
		}
	}
	const result = {
		type: "element",
		tagName: node2.ordered ? "ol" : "ul",
		properties,
		children: state.wrap(results, true)
	};
	state.patch(node2, result);
	return state.applyData(node2, result);
}
function paragraph$1(state, node2) {
	const result = {
		type: "element",
		tagName: "p",
		properties: {},
		children: state.all(node2)
	};
	state.patch(node2, result);
	return state.applyData(node2, result);
}
function root$12(state, node2) {
	const result = {
		type: "root",
		children: state.wrap(state.all(node2))
	};
	state.patch(node2, result);
	return state.applyData(node2, result);
}
function strong$1(state, node2) {
	const result = {
		type: "element",
		tagName: "strong",
		properties: {},
		children: state.all(node2)
	};
	state.patch(node2, result);
	return state.applyData(node2, result);
}
var pointEnd$1 = point3("end");
var pointStart$1 = point3("start");
function point3(type) {
	return point4;
	function point4(node2) {
		const point5 = node2 && node2.position && node2.position[type] || {};
		if (typeof point5.line === "number" && point5.line > 0 && typeof point5.column === "number" && point5.column > 0) return {
			line: point5.line,
			column: point5.column,
			offset: typeof point5.offset === "number" && point5.offset > -1 ? point5.offset : void 0
		};
	}
}
function position2(node2) {
	const start = pointStart$1(node2);
	const end = pointEnd$1(node2);
	if (start && end) return {
		start,
		end
	};
}
function table(state, node2) {
	const rows = state.all(node2);
	const firstRow = rows.shift();
	const tableContent = [];
	if (firstRow) {
		const head = {
			type: "element",
			tagName: "thead",
			properties: {},
			children: state.wrap([firstRow], true)
		};
		state.patch(node2.children[0], head);
		tableContent.push(head);
	}
	if (rows.length > 0) {
		const body = {
			type: "element",
			tagName: "tbody",
			properties: {},
			children: state.wrap(rows, true)
		};
		const start = pointStart$1(node2.children[1]);
		const end = pointEnd$1(node2.children[node2.children.length - 1]);
		if (start && end) body.position = {
			start,
			end
		};
		tableContent.push(body);
	}
	const result = {
		type: "element",
		tagName: "table",
		properties: {},
		children: state.wrap(tableContent, true)
	};
	state.patch(node2, result);
	return state.applyData(node2, result);
}
function tableRow(state, node2, parent) {
	const siblings = parent ? parent.children : void 0;
	const tagName = (siblings ? siblings.indexOf(node2) : 1) === 0 ? "th" : "td";
	const align = parent && parent.type === "table" ? parent.align : void 0;
	const length = align ? align.length : node2.children.length;
	let cellIndex = -1;
	const cells = [];
	while (++cellIndex < length) {
		const cell = node2.children[cellIndex];
		const properties = {};
		const alignValue = align ? align[cellIndex] : void 0;
		if (alignValue) properties.align = alignValue;
		let result2 = {
			type: "element",
			tagName,
			properties,
			children: []
		};
		if (cell) {
			result2.children = state.all(cell);
			state.patch(cell, result2);
			result2 = state.applyData(cell, result2);
		}
		cells.push(result2);
	}
	const result = {
		type: "element",
		tagName: "tr",
		properties: {},
		children: state.wrap(cells, true)
	};
	state.patch(node2, result);
	return state.applyData(node2, result);
}
function tableCell(state, node2) {
	const result = {
		type: "element",
		tagName: "td",
		properties: {},
		children: state.all(node2)
	};
	state.patch(node2, result);
	return state.applyData(node2, result);
}
var tab = 9;
var space = 32;
function trimLines(value) {
	const source = String(value);
	const search2 = /\r?\n|\r/g;
	let match = search2.exec(source);
	let last = 0;
	const lines = [];
	while (match) {
		lines.push(trimLine(source.slice(last, match.index), last > 0, true), match[0]);
		last = match.index + match[0].length;
		match = search2.exec(source);
	}
	lines.push(trimLine(source.slice(last), last > 0, false));
	return lines.join("");
}
function trimLine(value, start, end) {
	let startIndex = 0;
	let endIndex = value.length;
	if (start) {
		let code2 = value.codePointAt(startIndex);
		while (code2 === tab || code2 === space) {
			startIndex++;
			code2 = value.codePointAt(startIndex);
		}
	}
	if (end) {
		let code2 = value.codePointAt(endIndex - 1);
		while (code2 === tab || code2 === space) {
			endIndex--;
			code2 = value.codePointAt(endIndex - 1);
		}
	}
	return endIndex > startIndex ? value.slice(startIndex, endIndex) : "";
}
function text3(state, node2) {
	const result = {
		type: "text",
		value: trimLines(String(node2.value))
	};
	state.patch(node2, result);
	return state.applyData(node2, result);
}
function thematicBreak2(state, node2) {
	const result = {
		type: "element",
		tagName: "hr",
		properties: {},
		children: []
	};
	state.patch(node2, result);
	return state.applyData(node2, result);
}
var handlers = {
	blockquote: blockquote$1,
	break: hardBreak$1,
	code: code$1,
	delete: strikethrough,
	emphasis: emphasis$1,
	footnoteReference: footnoteReference$1,
	heading: heading$1,
	html: html$1,
	imageReference: imageReference$1,
	image: image$1,
	inlineCode: inlineCode$1,
	linkReference: linkReference$1,
	link: link$1,
	listItem: listItem$1,
	list: list2,
	paragraph: paragraph$1,
	root: root$12,
	strong: strong$1,
	table,
	tableCell,
	tableRow,
	text: text3,
	thematicBreak: thematicBreak2,
	toml: ignore,
	yaml: ignore,
	definition: ignore,
	footnoteDefinition: ignore
};
function ignore() {}
var VOID = -1;
var PRIMITIVE = 0;
var ARRAY = 1;
var OBJECT = 2;
var DATE = 3;
var REGEXP = 4;
var MAP = 5;
var SET = 6;
var ERROR = 7;
var BIGINT = 8;
var env$1 = typeof self === "object" ? self : globalThis;
var deserializer$1 = ($, _) => {
	const as = (out, index2) => {
		$.set(index2, out);
		return out;
	};
	const unpair = (index2) => {
		if ($.has(index2)) return $.get(index2);
		const [type, value] = _[index2];
		switch (type) {
			case PRIMITIVE:
			case VOID: return as(value, index2);
			case ARRAY: {
				const arr = as([], index2);
				for (const index3 of value) arr.push(unpair(index3));
				return arr;
			}
			case OBJECT: {
				const object = as({}, index2);
				for (const [key, index3] of value) object[unpair(key)] = unpair(index3);
				return object;
			}
			case DATE: return as(new Date(value), index2);
			case REGEXP: {
				const { source, flags } = value;
				return as(new RegExp(source, flags), index2);
			}
			case MAP: {
				const map = as(/* @__PURE__ */ new Map(), index2);
				for (const [key, index3] of value) map.set(unpair(key), unpair(index3));
				return map;
			}
			case SET: {
				const set = as(/* @__PURE__ */ new Set(), index2);
				for (const index3 of value) set.add(unpair(index3));
				return set;
			}
			case ERROR: {
				const { name, message } = value;
				return as(new env$1[name](message), index2);
			}
			case BIGINT: return as(BigInt(value), index2);
			case "BigInt": return as(Object(BigInt(value)), index2);
			case "ArrayBuffer": return as(new Uint8Array(value).buffer, value);
			case "DataView": {
				const { buffer } = new Uint8Array(value);
				return as(new DataView(buffer), value);
			}
		}
		return as(new env$1[type](value), index2);
	};
	return unpair;
};
var deserialize$1 = (serialized) => deserializer$1(/* @__PURE__ */ new Map(), serialized)(0);
var EMPTY$1 = "";
var { toString: toString2 } = {};
var { keys: keys$1 } = Object;
var typeOf$1 = (value) => {
	const type = typeof value;
	if (type !== "object" || !value) return [PRIMITIVE, type];
	const asString = toString2.call(value).slice(8, -1);
	switch (asString) {
		case "Array": return [ARRAY, EMPTY$1];
		case "Object": return [OBJECT, EMPTY$1];
		case "Date": return [DATE, EMPTY$1];
		case "RegExp": return [REGEXP, EMPTY$1];
		case "Map": return [MAP, EMPTY$1];
		case "Set": return [SET, EMPTY$1];
		case "DataView": return [ARRAY, asString];
	}
	if (asString.includes("Array")) return [ARRAY, asString];
	if (asString.includes("Error")) return [ERROR, asString];
	return [OBJECT, asString];
};
var shouldSkip$1 = ([TYPE, type]) => TYPE === PRIMITIVE && (type === "function" || type === "symbol");
var serializer$1 = (strict, json, $, _) => {
	const as = (out, value) => {
		const index2 = _.push(out) - 1;
		$.set(value, index2);
		return index2;
	};
	const pair = (value) => {
		if ($.has(value)) return $.get(value);
		let [TYPE, type] = typeOf$1(value);
		switch (TYPE) {
			case PRIMITIVE: {
				let entry = value;
				switch (type) {
					case "bigint":
						TYPE = BIGINT;
						entry = value.toString();
						break;
					case "function":
					case "symbol":
						if (strict) throw new TypeError("unable to serialize " + type);
						entry = null;
						break;
					case "undefined": return as([VOID], value);
				}
				return as([TYPE, entry], value);
			}
			case ARRAY: {
				if (type) {
					let spread = value;
					if (type === "DataView") spread = new Uint8Array(value.buffer);
					else if (type === "ArrayBuffer") spread = new Uint8Array(value);
					return as([type, [...spread]], value);
				}
				const arr = [];
				const index2 = as([TYPE, arr], value);
				for (const entry of value) arr.push(pair(entry));
				return index2;
			}
			case OBJECT: {
				if (type) switch (type) {
					case "BigInt": return as([type, value.toString()], value);
					case "Boolean":
					case "Number":
					case "String": return as([type, value.valueOf()], value);
				}
				if (json && "toJSON" in value) return pair(value.toJSON());
				const entries = [];
				const index2 = as([TYPE, entries], value);
				for (const key of keys$1(value)) if (strict || !shouldSkip$1(typeOf$1(value[key]))) entries.push([pair(key), pair(value[key])]);
				return index2;
			}
			case DATE: return as([TYPE, value.toISOString()], value);
			case REGEXP: {
				const { source, flags } = value;
				return as([TYPE, {
					source,
					flags
				}], value);
			}
			case MAP: {
				const entries = [];
				const index2 = as([TYPE, entries], value);
				for (const [key, entry] of value) if (strict || !(shouldSkip$1(typeOf$1(key)) || shouldSkip$1(typeOf$1(entry)))) entries.push([pair(key), pair(entry)]);
				return index2;
			}
			case SET: {
				const entries = [];
				const index2 = as([TYPE, entries], value);
				for (const entry of value) if (strict || !shouldSkip$1(typeOf$1(entry))) entries.push(pair(entry));
				return index2;
			}
		}
		const { message } = value;
		return as([TYPE, {
			name: type,
			message
		}], value);
	};
	return pair;
};
var serialize$2 = (value, { json, lossy } = {}) => {
	const _ = [];
	return serializer$1(!(json || lossy), !!json, /* @__PURE__ */ new Map(), _)(value), _;
};
var esm_default$1 = typeof structuredClone === "function" ? (
/* c8 ignore start */
(any, options) => options && ("json" in options || "lossy" in options) ? deserialize$1(serialize$2(any, options)) : structuredClone(any)) : (any, options) => deserialize$1(serialize$2(any, options));
function defaultFootnoteBackContent(_, rereferenceIndex) {
	const result = [{
		type: "text",
		value: "↩"
	}];
	if (rereferenceIndex > 1) result.push({
		type: "element",
		tagName: "sup",
		properties: {},
		children: [{
			type: "text",
			value: String(rereferenceIndex)
		}]
	});
	return result;
}
function defaultFootnoteBackLabel(referenceIndex, rereferenceIndex) {
	return "Back to reference " + (referenceIndex + 1) + (rereferenceIndex > 1 ? "-" + rereferenceIndex : "");
}
function footer(state) {
	const clobberPrefix = typeof state.options.clobberPrefix === "string" ? state.options.clobberPrefix : "user-content-";
	const footnoteBackContent = state.options.footnoteBackContent || defaultFootnoteBackContent;
	const footnoteBackLabel = state.options.footnoteBackLabel || defaultFootnoteBackLabel;
	const footnoteLabel = state.options.footnoteLabel || "Footnotes";
	const footnoteLabelTagName = state.options.footnoteLabelTagName || "h2";
	const footnoteLabelProperties = state.options.footnoteLabelProperties || { className: ["sr-only"] };
	const listItems = [];
	let referenceIndex = -1;
	while (++referenceIndex < state.footnoteOrder.length) {
		const definition2 = state.footnoteById.get(state.footnoteOrder[referenceIndex]);
		if (!definition2) continue;
		const content3 = state.all(definition2);
		const id = String(definition2.identifier).toUpperCase();
		const safeId = normalizeUri(id.toLowerCase());
		let rereferenceIndex = 0;
		const backReferences = [];
		const counts = state.footnoteCounts.get(id);
		while (counts !== void 0 && ++rereferenceIndex <= counts) {
			if (backReferences.length > 0) backReferences.push({
				type: "text",
				value: " "
			});
			let children = typeof footnoteBackContent === "string" ? footnoteBackContent : footnoteBackContent(referenceIndex, rereferenceIndex);
			if (typeof children === "string") children = {
				type: "text",
				value: children
			};
			backReferences.push({
				type: "element",
				tagName: "a",
				properties: {
					href: "#" + clobberPrefix + "fnref-" + safeId + (rereferenceIndex > 1 ? "-" + rereferenceIndex : ""),
					dataFootnoteBackref: "",
					ariaLabel: typeof footnoteBackLabel === "string" ? footnoteBackLabel : footnoteBackLabel(referenceIndex, rereferenceIndex),
					className: ["data-footnote-backref"]
				},
				children: Array.isArray(children) ? children : [children]
			});
		}
		const tail = content3[content3.length - 1];
		if (tail && tail.type === "element" && tail.tagName === "p") {
			const tailTail = tail.children[tail.children.length - 1];
			if (tailTail && tailTail.type === "text") tailTail.value += " ";
			else tail.children.push({
				type: "text",
				value: " "
			});
			tail.children.push(...backReferences);
		} else content3.push(...backReferences);
		const listItem2 = {
			type: "element",
			tagName: "li",
			properties: { id: clobberPrefix + "fn-" + safeId },
			children: state.wrap(content3, true)
		};
		state.patch(definition2, listItem2);
		listItems.push(listItem2);
	}
	if (listItems.length === 0) return;
	return {
		type: "element",
		tagName: "section",
		properties: {
			dataFootnotes: true,
			className: ["footnotes"]
		},
		children: [
			{
				type: "element",
				tagName: footnoteLabelTagName,
				properties: {
					...esm_default$1(footnoteLabelProperties),
					id: "footnote-label"
				},
				children: [{
					type: "text",
					value: footnoteLabel
				}]
			},
			{
				type: "text",
				value: "\n"
			},
			{
				type: "element",
				tagName: "ol",
				properties: {},
				children: state.wrap(listItems, true)
			},
			{
				type: "text",
				value: "\n"
			}
		]
	};
}
var convert$1 = (
/**
* @type {(
*   (<Condition extends string>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & {type: Condition}) &
*   (<Condition extends Props>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Condition) &
*   (<Condition extends TestFunction>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Predicate<Condition, Node>) &
*   ((test?: null | undefined) => (node?: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node) &
*   ((test?: Test) => Check)
* )}
*/
/**
* @param {Test} [test]
* @returns {Check}
*/
function(test) {
	if (test === null || test === void 0) return ok2$1;
	if (typeof test === "function") return castFactory$1(test);
	if (typeof test === "object") return Array.isArray(test) ? anyFactory$1(test) : propsFactory$1(test);
	if (typeof test === "string") return typeFactory$1(test);
	throw new Error("Expected function, string, or object as test");
});
function anyFactory$1(tests) {
	const checks = [];
	let index2 = -1;
	while (++index2 < tests.length) checks[index2] = convert$1(tests[index2]);
	return castFactory$1(any);
	function any(...parameters) {
		let index3 = -1;
		while (++index3 < checks.length) if (checks[index3].apply(this, parameters)) return true;
		return false;
	}
}
function propsFactory$1(check) {
	const checkAsRecord = check;
	return castFactory$1(all2);
	function all2(node2) {
		const nodeAsRecord = node2;
		let key;
		for (key in check) if (nodeAsRecord[key] !== checkAsRecord[key]) return false;
		return true;
	}
}
function typeFactory$1(check) {
	return castFactory$1(type);
	function type(node2) {
		return node2 && node2.type === check;
	}
}
function castFactory$1(testFunction) {
	return check;
	function check(value, index2, parent) {
		return Boolean(looksLikeANode$1(value) && testFunction.call(this, value, typeof index2 === "number" ? index2 : void 0, parent || void 0));
	}
}
function ok2$1() {
	return true;
}
function looksLikeANode$1(value) {
	return value !== null && typeof value === "object" && "type" in value;
}
function color$1(d) {
	return d;
}
var empty$1 = [];
var CONTINUE$1 = true;
var EXIT$1 = false;
var SKIP$1 = "skip";
function visitParents$1(tree, test, visitor, reverse) {
	let check;
	if (typeof test === "function" && typeof visitor !== "function") {
		reverse = visitor;
		visitor = test;
	} else check = test;
	const is2 = convert$1(check);
	const step = reverse ? -1 : 1;
	factory(tree, void 0, [])();
	function factory(node2, index2, parents) {
		const value = node2 && typeof node2 === "object" ? node2 : {};
		if (typeof value.type === "string") {
			const name = typeof value.tagName === "string" ? value.tagName : typeof value.name === "string" ? value.name : void 0;
			Object.defineProperty(visit3, "name", { value: "node (" + color$1(node2.type + (name ? "<" + name + ">" : "")) + ")" });
		}
		return visit3;
		function visit3() {
			let result = empty$1;
			let subresult;
			let offset;
			let grandparents;
			if (!test || is2(node2, index2, parents[parents.length - 1] || void 0)) {
				result = toResult$1(visitor(node2, parents));
				if (result[0] === EXIT$1) return result;
			}
			if ("children" in node2 && node2.children) {
				const nodeAsParent = node2;
				if (nodeAsParent.children && result[0] !== SKIP$1) {
					offset = (reverse ? nodeAsParent.children.length : -1) + step;
					grandparents = parents.concat(nodeAsParent);
					while (offset > -1 && offset < nodeAsParent.children.length) {
						const child = nodeAsParent.children[offset];
						subresult = factory(child, offset, grandparents)();
						if (subresult[0] === EXIT$1) return subresult;
						offset = typeof subresult[1] === "number" ? subresult[1] : offset + step;
					}
				}
			}
			return result;
		}
	}
}
function toResult$1(value) {
	if (Array.isArray(value)) return value;
	if (typeof value === "number") return [CONTINUE$1, value];
	return value === null || value === void 0 ? empty$1 : [value];
}
function visit$1(tree, testOrVisitor, visitorOrReverse, maybeReverse) {
	let reverse;
	let test;
	let visitor;
	if (typeof testOrVisitor === "function" && typeof visitorOrReverse !== "function") {
		test = void 0;
		visitor = testOrVisitor;
		reverse = visitorOrReverse;
	} else {
		test = testOrVisitor;
		visitor = visitorOrReverse;
		reverse = maybeReverse;
	}
	visitParents$1(tree, test, overload, reverse);
	function overload(node2, parents) {
		const parent = parents[parents.length - 1];
		const index2 = parent ? parent.children.indexOf(node2) : void 0;
		return visitor(node2, index2, parent);
	}
}
var own3 = {}.hasOwnProperty;
var emptyOptions2$1 = {};
function createState(tree, options) {
	const settings = options || emptyOptions2$1;
	const definitionById = /* @__PURE__ */ new Map();
	const footnoteById = /* @__PURE__ */ new Map();
	const state = {
		all: all2,
		applyData,
		definitionById,
		footnoteById,
		footnoteCounts: /* @__PURE__ */ new Map(),
		footnoteOrder: [],
		handlers: {
			...handlers,
			...settings.handlers
		},
		one: one2,
		options: settings,
		patch: patch$1,
		wrap
	};
	visit$1(tree, function(node2) {
		if (node2.type === "definition" || node2.type === "footnoteDefinition") {
			const map = node2.type === "definition" ? definitionById : footnoteById;
			const id = String(node2.identifier).toUpperCase();
			if (!map.has(id)) map.set(id, node2);
		}
	});
	return state;
	function one2(node2, parent) {
		const type = node2.type;
		const handle = state.handlers[type];
		if (own3.call(state.handlers, type) && handle) return handle(state, node2, parent);
		if (state.options.passThrough && state.options.passThrough.includes(type)) {
			if ("children" in node2) {
				const { children, ...shallow } = node2;
				const result = esm_default$1(shallow);
				result.children = state.all(node2);
				return result;
			}
			return esm_default$1(node2);
		}
		return (state.options.unknownHandler || defaultUnknownHandler)(state, node2, parent);
	}
	function all2(parent) {
		const values = [];
		if ("children" in parent) {
			const nodes = parent.children;
			let index2 = -1;
			while (++index2 < nodes.length) {
				const result = state.one(nodes[index2], parent);
				if (result) {
					if (index2 && nodes[index2 - 1].type === "break") {
						if (!Array.isArray(result) && result.type === "text") result.value = trimMarkdownSpaceStart(result.value);
						if (!Array.isArray(result) && result.type === "element") {
							const head = result.children[0];
							if (head && head.type === "text") head.value = trimMarkdownSpaceStart(head.value);
						}
					}
					if (Array.isArray(result)) values.push(...result);
					else values.push(result);
				}
			}
		}
		return values;
	}
}
function patch$1(from, to) {
	if (from.position) to.position = position2(from);
}
function applyData(from, to) {
	let result = to;
	if (from && from.data) {
		const hName = from.data.hName;
		const hChildren = from.data.hChildren;
		const hProperties = from.data.hProperties;
		if (typeof hName === "string") {
			if (result.type === "element") result.tagName = hName;
			else result = {
				type: "element",
				tagName: hName,
				properties: {},
				children: "children" in result ? result.children : [result]
			};
		}
		if (result.type === "element" && hProperties) Object.assign(result.properties, esm_default$1(hProperties));
		if ("children" in result && result.children && hChildren !== null && hChildren !== void 0) result.children = hChildren;
	}
	return result;
}
function defaultUnknownHandler(state, node2) {
	const data = node2.data || {};
	const result = "value" in node2 && !(own3.call(data, "hProperties") || own3.call(data, "hChildren")) ? {
		type: "text",
		value: node2.value
	} : {
		type: "element",
		tagName: "div",
		properties: {},
		children: state.all(node2)
	};
	state.patch(node2, result);
	return state.applyData(node2, result);
}
function wrap(nodes, loose) {
	const result = [];
	let index2 = -1;
	if (loose) result.push({
		type: "text",
		value: "\n"
	});
	while (++index2 < nodes.length) {
		if (index2) result.push({
			type: "text",
			value: "\n"
		});
		result.push(nodes[index2]);
	}
	if (loose && nodes.length > 0) result.push({
		type: "text",
		value: "\n"
	});
	return result;
}
function trimMarkdownSpaceStart(value) {
	let index2 = 0;
	let code2 = value.charCodeAt(index2);
	while (code2 === 9 || code2 === 32) {
		index2++;
		code2 = value.charCodeAt(index2);
	}
	return value.slice(index2);
}
function toHast(tree, options) {
	const state = createState(tree, options);
	const node2 = state.one(tree, void 0);
	const foot = footer(state);
	const result = Array.isArray(node2) ? {
		type: "root",
		children: node2
	} : node2 || {
		type: "root",
		children: []
	};
	if (foot) {
		"children" in result;
		result.children.push({
			type: "text",
			value: "\n"
		}, foot);
	}
	return result;
}
function remarkRehype(destination, options) {
	if (destination && "run" in destination) return async function(tree, file) {
		const hastTree = toHast(tree, {
			file,
			...options
		});
		await destination.run(hastTree, file);
	};
	return function(tree, file) {
		return toHast(tree, {
			file,
			...destination || options
		});
	};
}
function bail(error) {
	if (error) throw error;
}
var import_extend = __toESM(require_extend(), 1);
function isPlainObject(value) {
	if (typeof value !== "object" || value === null) return false;
	const prototype = Object.getPrototypeOf(value);
	return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
}
function trough() {
	const fns = [];
	const pipeline = {
		run,
		use
	};
	return pipeline;
	function run(...values) {
		let middlewareIndex = -1;
		const callback = values.pop();
		if (typeof callback !== "function") throw new TypeError("Expected function as last argument, not " + callback);
		next(null, ...values);
		function next(error, ...output) {
			const fn = fns[++middlewareIndex];
			let index2 = -1;
			if (error) {
				callback(error);
				return;
			}
			while (++index2 < values.length) if (output[index2] === null || output[index2] === void 0) output[index2] = values[index2];
			values = output;
			if (fn) wrap2(fn, next)(...output);
			else callback(null, ...output);
		}
	}
	function use(middelware) {
		if (typeof middelware !== "function") throw new TypeError("Expected `middelware` to be a function, not " + middelware);
		fns.push(middelware);
		return pipeline;
	}
}
function wrap2(middleware, callback) {
	let called;
	return wrapped;
	function wrapped(...parameters) {
		const fnExpectsCallback = middleware.length > parameters.length;
		let result;
		if (fnExpectsCallback) parameters.push(done);
		try {
			result = middleware.apply(this, parameters);
		} catch (error) {
			const exception = error;
			if (fnExpectsCallback && called) throw exception;
			return done(exception);
		}
		if (!fnExpectsCallback) {
			if (result && result.then && typeof result.then === "function") result.then(then, done);
			else if (result instanceof Error) done(result);
			else then(result);
		}
	}
	function done(error, ...output) {
		if (!called) {
			called = true;
			callback(error, ...output);
		}
	}
	function then(value) {
		done(null, value);
	}
}
var VFileMessage = class extends Error {
	/**
	* Create a message for `reason`.
	*
	* > 🪦 **Note**: also has obsolete signatures.
	*
	* @overload
	* @param {string} reason
	* @param {Options | null | undefined} [options]
	* @returns
	*
	* @overload
	* @param {string} reason
	* @param {Node | NodeLike | null | undefined} parent
	* @param {string | null | undefined} [origin]
	* @returns
	*
	* @overload
	* @param {string} reason
	* @param {Point | Position | null | undefined} place
	* @param {string | null | undefined} [origin]
	* @returns
	*
	* @overload
	* @param {string} reason
	* @param {string | null | undefined} [origin]
	* @returns
	*
	* @overload
	* @param {Error | VFileMessage} cause
	* @param {Node | NodeLike | null | undefined} parent
	* @param {string | null | undefined} [origin]
	* @returns
	*
	* @overload
	* @param {Error | VFileMessage} cause
	* @param {Point | Position | null | undefined} place
	* @param {string | null | undefined} [origin]
	* @returns
	*
	* @overload
	* @param {Error | VFileMessage} cause
	* @param {string | null | undefined} [origin]
	* @returns
	*
	* @param {Error | VFileMessage | string} causeOrReason
	*   Reason for message, should use markdown.
	* @param {Node | NodeLike | Options | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
	*   Configuration (optional).
	* @param {string | null | undefined} [origin]
	*   Place in code where the message originates (example:
	*   `'my-package:my-rule'` or `'my-rule'`).
	* @returns
	*   Instance of `VFileMessage`.
	*/
	constructor(causeOrReason, optionsOrParentOrPlace, origin) {
		super();
		if (typeof optionsOrParentOrPlace === "string") {
			origin = optionsOrParentOrPlace;
			optionsOrParentOrPlace = void 0;
		}
		let reason = "";
		let options = {};
		let legacyCause = false;
		if (optionsOrParentOrPlace) {
			if ("line" in optionsOrParentOrPlace && "column" in optionsOrParentOrPlace) options = { place: optionsOrParentOrPlace };
			else if ("start" in optionsOrParentOrPlace && "end" in optionsOrParentOrPlace) options = { place: optionsOrParentOrPlace };
			else if ("type" in optionsOrParentOrPlace) options = {
				ancestors: [optionsOrParentOrPlace],
				place: optionsOrParentOrPlace.position
			};
			else options = { ...optionsOrParentOrPlace };
		}
		if (typeof causeOrReason === "string") reason = causeOrReason;
		else if (!options.cause && causeOrReason) {
			legacyCause = true;
			reason = causeOrReason.message;
			options.cause = causeOrReason;
		}
		if (!options.ruleId && !options.source && typeof origin === "string") {
			const index2 = origin.indexOf(":");
			if (index2 === -1) options.ruleId = origin;
			else {
				options.source = origin.slice(0, index2);
				options.ruleId = origin.slice(index2 + 1);
			}
		}
		if (!options.place && options.ancestors && options.ancestors) {
			const parent = options.ancestors[options.ancestors.length - 1];
			if (parent) options.place = parent.position;
		}
		const start = options.place && "start" in options.place ? options.place.start : options.place;
		this.ancestors = options.ancestors || void 0;
		this.cause = options.cause || void 0;
		this.column = start ? start.column : void 0;
		this.fatal = void 0;
		this.file = "";
		this.message = reason;
		this.line = start ? start.line : void 0;
		this.name = stringifyPosition(options.place) || "1:1";
		this.place = options.place || void 0;
		this.reason = this.message;
		this.ruleId = options.ruleId || void 0;
		this.source = options.source || void 0;
		this.stack = legacyCause && options.cause && typeof options.cause.stack === "string" ? options.cause.stack : "";
		this.actual = void 0;
		this.expected = void 0;
		this.note = void 0;
		this.url = void 0;
	}
};
VFileMessage.prototype.file = "";
VFileMessage.prototype.name = "";
VFileMessage.prototype.reason = "";
VFileMessage.prototype.message = "";
VFileMessage.prototype.stack = "";
VFileMessage.prototype.column = void 0;
VFileMessage.prototype.line = void 0;
VFileMessage.prototype.ancestors = void 0;
VFileMessage.prototype.cause = void 0;
VFileMessage.prototype.fatal = void 0;
VFileMessage.prototype.place = void 0;
VFileMessage.prototype.ruleId = void 0;
VFileMessage.prototype.source = void 0;
var minpath = {
	basename,
	dirname,
	extname,
	join,
	sep: "/"
};
function basename(path, extname2) {
	if (extname2 !== void 0 && typeof extname2 !== "string") throw new TypeError("\"ext\" argument must be a string");
	assertPath(path);
	let start = 0;
	let end = -1;
	let index2 = path.length;
	let seenNonSlash;
	if (extname2 === void 0 || extname2.length === 0 || extname2.length > path.length) {
		while (index2--) if (path.codePointAt(index2) === 47) {
			if (seenNonSlash) {
				start = index2 + 1;
				break;
			}
		} else if (end < 0) {
			seenNonSlash = true;
			end = index2 + 1;
		}
		return end < 0 ? "" : path.slice(start, end);
	}
	if (extname2 === path) return "";
	let firstNonSlashEnd = -1;
	let extnameIndex = extname2.length - 1;
	while (index2--) if (path.codePointAt(index2) === 47) {
		if (seenNonSlash) {
			start = index2 + 1;
			break;
		}
	} else {
		if (firstNonSlashEnd < 0) {
			seenNonSlash = true;
			firstNonSlashEnd = index2 + 1;
		}
		if (extnameIndex > -1) {
			if (path.codePointAt(index2) === extname2.codePointAt(extnameIndex--)) {
				if (extnameIndex < 0) end = index2;
			} else {
				extnameIndex = -1;
				end = firstNonSlashEnd;
			}
		}
	}
	if (start === end) end = firstNonSlashEnd;
	else if (end < 0) end = path.length;
	return path.slice(start, end);
}
function dirname(path) {
	assertPath(path);
	if (path.length === 0) return ".";
	let end = -1;
	let index2 = path.length;
	let unmatchedSlash;
	while (--index2) if (path.codePointAt(index2) === 47) {
		if (unmatchedSlash) {
			end = index2;
			break;
		}
	} else if (!unmatchedSlash) unmatchedSlash = true;
	return end < 0 ? path.codePointAt(0) === 47 ? "/" : "." : end === 1 && path.codePointAt(0) === 47 ? "//" : path.slice(0, end);
}
function extname(path) {
	assertPath(path);
	let index2 = path.length;
	let end = -1;
	let startPart = 0;
	let startDot = -1;
	let preDotState = 0;
	let unmatchedSlash;
	while (index2--) {
		const code2 = path.codePointAt(index2);
		if (code2 === 47) {
			if (unmatchedSlash) {
				startPart = index2 + 1;
				break;
			}
			continue;
		}
		if (end < 0) {
			unmatchedSlash = true;
			end = index2 + 1;
		}
		if (code2 === 46) {
			if (startDot < 0) startDot = index2;
			else if (preDotState !== 1) preDotState = 1;
		} else if (startDot > -1) preDotState = -1;
	}
	if (startDot < 0 || end < 0 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) return "";
	return path.slice(startDot, end);
}
function join(...segments) {
	let index2 = -1;
	let joined;
	while (++index2 < segments.length) {
		assertPath(segments[index2]);
		if (segments[index2]) joined = joined === void 0 ? segments[index2] : joined + "/" + segments[index2];
	}
	return joined === void 0 ? "." : normalize(joined);
}
function normalize(path) {
	assertPath(path);
	const absolute = path.codePointAt(0) === 47;
	let value = normalizeString(path, !absolute);
	if (value.length === 0 && !absolute) value = ".";
	if (value.length > 0 && path.codePointAt(path.length - 1) === 47) value += "/";
	return absolute ? "/" + value : value;
}
function normalizeString(path, allowAboveRoot) {
	let result = "";
	let lastSegmentLength = 0;
	let lastSlash = -1;
	let dots = 0;
	let index2 = -1;
	let code2;
	let lastSlashIndex;
	while (++index2 <= path.length) {
		if (index2 < path.length) code2 = path.codePointAt(index2);
		else if (code2 === 47) break;
		else code2 = 47;
		if (code2 === 47) {
			if (lastSlash === index2 - 1 || dots === 1) {} else if (lastSlash !== index2 - 1 && dots === 2) {
				if (result.length < 2 || lastSegmentLength !== 2 || result.codePointAt(result.length - 1) !== 46 || result.codePointAt(result.length - 2) !== 46) {
					if (result.length > 2) {
						lastSlashIndex = result.lastIndexOf("/");
						if (lastSlashIndex !== result.length - 1) {
							if (lastSlashIndex < 0) {
								result = "";
								lastSegmentLength = 0;
							} else {
								result = result.slice(0, lastSlashIndex);
								lastSegmentLength = result.length - 1 - result.lastIndexOf("/");
							}
							lastSlash = index2;
							dots = 0;
							continue;
						}
					} else if (result.length > 0) {
						result = "";
						lastSegmentLength = 0;
						lastSlash = index2;
						dots = 0;
						continue;
					}
				}
				if (allowAboveRoot) {
					result = result.length > 0 ? result + "/.." : "..";
					lastSegmentLength = 2;
				}
			} else {
				if (result.length > 0) result += "/" + path.slice(lastSlash + 1, index2);
				else result = path.slice(lastSlash + 1, index2);
				lastSegmentLength = index2 - lastSlash - 1;
			}
			lastSlash = index2;
			dots = 0;
		} else if (code2 === 46 && dots > -1) dots++;
		else dots = -1;
	}
	return result;
}
function assertPath(path) {
	if (typeof path !== "string") throw new TypeError("Path must be a string. Received " + JSON.stringify(path));
}
var minproc = { cwd };
function cwd() {
	return "/";
}
function isUrl(fileUrlOrPath) {
	return Boolean(fileUrlOrPath !== null && typeof fileUrlOrPath === "object" && "href" in fileUrlOrPath && fileUrlOrPath.href && "protocol" in fileUrlOrPath && fileUrlOrPath.protocol && fileUrlOrPath.auth === void 0);
}
function urlToPath(path) {
	if (typeof path === "string") path = new URL(path);
	else if (!isUrl(path)) {
		const error = /* @__PURE__ */ new TypeError("The \"path\" argument must be of type string or an instance of URL. Received `" + path + "`");
		error.code = "ERR_INVALID_ARG_TYPE";
		throw error;
	}
	if (path.protocol !== "file:") {
		const error = /* @__PURE__ */ new TypeError("The URL must be of scheme file");
		error.code = "ERR_INVALID_URL_SCHEME";
		throw error;
	}
	return getPathFromURLPosix(path);
}
function getPathFromURLPosix(url) {
	if (url.hostname !== "") {
		const error = /* @__PURE__ */ new TypeError("File URL host must be \"localhost\" or empty on darwin");
		error.code = "ERR_INVALID_FILE_URL_HOST";
		throw error;
	}
	const pathname = url.pathname;
	let index2 = -1;
	while (++index2 < pathname.length) if (pathname.codePointAt(index2) === 37 && pathname.codePointAt(index2 + 1) === 50) {
		const third = pathname.codePointAt(index2 + 2);
		if (third === 70 || third === 102) {
			const error = /* @__PURE__ */ new TypeError("File URL path must not include encoded / characters");
			error.code = "ERR_INVALID_FILE_URL_PATH";
			throw error;
		}
	}
	return decodeURIComponent(pathname);
}
var order = [
	"history",
	"path",
	"basename",
	"stem",
	"extname",
	"dirname"
];
var VFile = class {
	/**
	* Create a new virtual file.
	*
	* `options` is treated as:
	*
	* *   `string` or `Uint8Array` — `{value: options}`
	* *   `URL` — `{path: options}`
	* *   `VFile` — shallow copies its data over to the new file
	* *   `object` — all fields are shallow copied over to the new file
	*
	* Path related fields are set in the following order (least specific to
	* most specific): `history`, `path`, `basename`, `stem`, `extname`,
	* `dirname`.
	*
	* You cannot set `dirname` or `extname` without setting either `history`,
	* `path`, `basename`, or `stem` too.
	*
	* @param {Compatible | null | undefined} [value]
	*   File value.
	* @returns
	*   New instance.
	*/
	constructor(value) {
		let options;
		if (!value) options = {};
		else if (isUrl(value)) options = { path: value };
		else if (typeof value === "string" || isUint8Array(value)) options = { value };
		else options = value;
		this.cwd = "cwd" in options ? "" : minproc.cwd();
		this.data = {};
		this.history = [];
		this.messages = [];
		this.value;
		this.map;
		this.result;
		this.stored;
		let index2 = -1;
		while (++index2 < order.length) {
			const field2 = order[index2];
			if (field2 in options && options[field2] !== void 0 && options[field2] !== null) this[field2] = field2 === "history" ? [...options[field2]] : options[field2];
		}
		let field;
		for (field in options) if (!order.includes(field)) this[field] = options[field];
	}
	/**
	* Get the basename (including extname) (example: `'index.min.js'`).
	*
	* @returns {string | undefined}
	*   Basename.
	*/
	get basename() {
		return typeof this.path === "string" ? minpath.basename(this.path) : void 0;
	}
	/**
	* Set basename (including extname) (`'index.min.js'`).
	*
	* Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
	* on windows).
	* Cannot be nullified (use `file.path = file.dirname` instead).
	*
	* @param {string} basename
	*   Basename.
	* @returns {undefined}
	*   Nothing.
	*/
	set basename(basename2) {
		assertNonEmpty(basename2, "basename");
		assertPart(basename2, "basename");
		this.path = minpath.join(this.dirname || "", basename2);
	}
	/**
	* Get the parent path (example: `'~'`).
	*
	* @returns {string | undefined}
	*   Dirname.
	*/
	get dirname() {
		return typeof this.path === "string" ? minpath.dirname(this.path) : void 0;
	}
	/**
	* Set the parent path (example: `'~'`).
	*
	* Cannot be set if there’s no `path` yet.
	*
	* @param {string | undefined} dirname
	*   Dirname.
	* @returns {undefined}
	*   Nothing.
	*/
	set dirname(dirname2) {
		assertPath2(this.basename, "dirname");
		this.path = minpath.join(dirname2 || "", this.basename);
	}
	/**
	* Get the extname (including dot) (example: `'.js'`).
	*
	* @returns {string | undefined}
	*   Extname.
	*/
	get extname() {
		return typeof this.path === "string" ? minpath.extname(this.path) : void 0;
	}
	/**
	* Set the extname (including dot) (example: `'.js'`).
	*
	* Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
	* on windows).
	* Cannot be set if there’s no `path` yet.
	*
	* @param {string | undefined} extname
	*   Extname.
	* @returns {undefined}
	*   Nothing.
	*/
	set extname(extname2) {
		assertPart(extname2, "extname");
		assertPath2(this.dirname, "extname");
		if (extname2) {
			if (extname2.codePointAt(0) !== 46) throw new Error("`extname` must start with `.`");
			if (extname2.includes(".", 1)) throw new Error("`extname` cannot contain multiple dots");
		}
		this.path = minpath.join(this.dirname, this.stem + (extname2 || ""));
	}
	/**
	* Get the full path (example: `'~/index.min.js'`).
	*
	* @returns {string}
	*   Path.
	*/
	get path() {
		return this.history[this.history.length - 1];
	}
	/**
	* Set the full path (example: `'~/index.min.js'`).
	*
	* Cannot be nullified.
	* You can set a file URL (a `URL` object with a `file:` protocol) which will
	* be turned into a path with `url.fileURLToPath`.
	*
	* @param {URL | string} path
	*   Path.
	* @returns {undefined}
	*   Nothing.
	*/
	set path(path) {
		if (isUrl(path)) path = urlToPath(path);
		assertNonEmpty(path, "path");
		if (this.path !== path) this.history.push(path);
	}
	/**
	* Get the stem (basename w/o extname) (example: `'index.min'`).
	*
	* @returns {string | undefined}
	*   Stem.
	*/
	get stem() {
		return typeof this.path === "string" ? minpath.basename(this.path, this.extname) : void 0;
	}
	/**
	* Set the stem (basename w/o extname) (example: `'index.min'`).
	*
	* Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
	* on windows).
	* Cannot be nullified (use `file.path = file.dirname` instead).
	*
	* @param {string} stem
	*   Stem.
	* @returns {undefined}
	*   Nothing.
	*/
	set stem(stem) {
		assertNonEmpty(stem, "stem");
		assertPart(stem, "stem");
		this.path = minpath.join(this.dirname || "", stem + (this.extname || ""));
	}
	/**
	* Create a fatal message for `reason` associated with the file.
	*
	* The `fatal` field of the message is set to `true` (error; file not usable)
	* and the `file` field is set to the current file path.
	* The message is added to the `messages` field on `file`.
	*
	* > 🪦 **Note**: also has obsolete signatures.
	*
	* @overload
	* @param {string} reason
	* @param {MessageOptions | null | undefined} [options]
	* @returns {never}
	*
	* @overload
	* @param {string} reason
	* @param {Node | NodeLike | null | undefined} parent
	* @param {string | null | undefined} [origin]
	* @returns {never}
	*
	* @overload
	* @param {string} reason
	* @param {Point | Position | null | undefined} place
	* @param {string | null | undefined} [origin]
	* @returns {never}
	*
	* @overload
	* @param {string} reason
	* @param {string | null | undefined} [origin]
	* @returns {never}
	*
	* @overload
	* @param {Error | VFileMessage} cause
	* @param {Node | NodeLike | null | undefined} parent
	* @param {string | null | undefined} [origin]
	* @returns {never}
	*
	* @overload
	* @param {Error | VFileMessage} cause
	* @param {Point | Position | null | undefined} place
	* @param {string | null | undefined} [origin]
	* @returns {never}
	*
	* @overload
	* @param {Error | VFileMessage} cause
	* @param {string | null | undefined} [origin]
	* @returns {never}
	*
	* @param {Error | VFileMessage | string} causeOrReason
	*   Reason for message, should use markdown.
	* @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
	*   Configuration (optional).
	* @param {string | null | undefined} [origin]
	*   Place in code where the message originates (example:
	*   `'my-package:my-rule'` or `'my-rule'`).
	* @returns {never}
	*   Never.
	* @throws {VFileMessage}
	*   Message.
	*/
	fail(causeOrReason, optionsOrParentOrPlace, origin) {
		const message = this.message(causeOrReason, optionsOrParentOrPlace, origin);
		message.fatal = true;
		throw message;
	}
	/**
	* Create an info message for `reason` associated with the file.
	*
	* The `fatal` field of the message is set to `undefined` (info; change
	* likely not needed) and the `file` field is set to the current file path.
	* The message is added to the `messages` field on `file`.
	*
	* > 🪦 **Note**: also has obsolete signatures.
	*
	* @overload
	* @param {string} reason
	* @param {MessageOptions | null | undefined} [options]
	* @returns {VFileMessage}
	*
	* @overload
	* @param {string} reason
	* @param {Node | NodeLike | null | undefined} parent
	* @param {string | null | undefined} [origin]
	* @returns {VFileMessage}
	*
	* @overload
	* @param {string} reason
	* @param {Point | Position | null | undefined} place
	* @param {string | null | undefined} [origin]
	* @returns {VFileMessage}
	*
	* @overload
	* @param {string} reason
	* @param {string | null | undefined} [origin]
	* @returns {VFileMessage}
	*
	* @overload
	* @param {Error | VFileMessage} cause
	* @param {Node | NodeLike | null | undefined} parent
	* @param {string | null | undefined} [origin]
	* @returns {VFileMessage}
	*
	* @overload
	* @param {Error | VFileMessage} cause
	* @param {Point | Position | null | undefined} place
	* @param {string | null | undefined} [origin]
	* @returns {VFileMessage}
	*
	* @overload
	* @param {Error | VFileMessage} cause
	* @param {string | null | undefined} [origin]
	* @returns {VFileMessage}
	*
	* @param {Error | VFileMessage | string} causeOrReason
	*   Reason for message, should use markdown.
	* @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
	*   Configuration (optional).
	* @param {string | null | undefined} [origin]
	*   Place in code where the message originates (example:
	*   `'my-package:my-rule'` or `'my-rule'`).
	* @returns {VFileMessage}
	*   Message.
	*/
	info(causeOrReason, optionsOrParentOrPlace, origin) {
		const message = this.message(causeOrReason, optionsOrParentOrPlace, origin);
		message.fatal = void 0;
		return message;
	}
	/**
	* Create a message for `reason` associated with the file.
	*
	* The `fatal` field of the message is set to `false` (warning; change may be
	* needed) and the `file` field is set to the current file path.
	* The message is added to the `messages` field on `file`.
	*
	* > 🪦 **Note**: also has obsolete signatures.
	*
	* @overload
	* @param {string} reason
	* @param {MessageOptions | null | undefined} [options]
	* @returns {VFileMessage}
	*
	* @overload
	* @param {string} reason
	* @param {Node | NodeLike | null | undefined} parent
	* @param {string | null | undefined} [origin]
	* @returns {VFileMessage}
	*
	* @overload
	* @param {string} reason
	* @param {Point | Position | null | undefined} place
	* @param {string | null | undefined} [origin]
	* @returns {VFileMessage}
	*
	* @overload
	* @param {string} reason
	* @param {string | null | undefined} [origin]
	* @returns {VFileMessage}
	*
	* @overload
	* @param {Error | VFileMessage} cause
	* @param {Node | NodeLike | null | undefined} parent
	* @param {string | null | undefined} [origin]
	* @returns {VFileMessage}
	*
	* @overload
	* @param {Error | VFileMessage} cause
	* @param {Point | Position | null | undefined} place
	* @param {string | null | undefined} [origin]
	* @returns {VFileMessage}
	*
	* @overload
	* @param {Error | VFileMessage} cause
	* @param {string | null | undefined} [origin]
	* @returns {VFileMessage}
	*
	* @param {Error | VFileMessage | string} causeOrReason
	*   Reason for message, should use markdown.
	* @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
	*   Configuration (optional).
	* @param {string | null | undefined} [origin]
	*   Place in code where the message originates (example:
	*   `'my-package:my-rule'` or `'my-rule'`).
	* @returns {VFileMessage}
	*   Message.
	*/
	message(causeOrReason, optionsOrParentOrPlace, origin) {
		const message = new VFileMessage(causeOrReason, optionsOrParentOrPlace, origin);
		if (this.path) {
			message.name = this.path + ":" + message.name;
			message.file = this.path;
		}
		message.fatal = false;
		this.messages.push(message);
		return message;
	}
	/**
	* Serialize the file.
	*
	* > **Note**: which encodings are supported depends on the engine.
	* > For info on Node.js, see:
	* > <https://nodejs.org/api/util.html#whatwg-supported-encodings>.
	*
	* @param {string | null | undefined} [encoding='utf8']
	*   Character encoding to understand `value` as when it’s a `Uint8Array`
	*   (default: `'utf-8'`).
	* @returns {string}
	*   Serialized file.
	*/
	toString(encoding) {
		if (this.value === void 0) return "";
		if (typeof this.value === "string") return this.value;
		return new TextDecoder(encoding || void 0).decode(this.value);
	}
};
function assertPart(part, name) {
	if (part && part.includes(minpath.sep)) throw new Error("`" + name + "` cannot be a path: did not expect `" + minpath.sep + "`");
}
function assertNonEmpty(part, name) {
	if (!part) throw new Error("`" + name + "` cannot be empty");
}
function assertPath2(path, name) {
	if (!path) throw new Error("Setting `" + name + "` requires `path` to be set too");
}
function isUint8Array(value) {
	return Boolean(value && typeof value === "object" && "byteLength" in value && "byteOffset" in value);
}
var CallableInstance = (
/**
* @type {new <Parameters extends Array<unknown>, Result>(property: string | symbol) => (...parameters: Parameters) => Result}
*/
/** @type {unknown} */
/**
* @this {Function}
* @param {string | symbol} property
* @returns {(...parameters: Array<unknown>) => unknown}
*/
function(property) {
	const proto = this.constructor.prototype;
	const value = proto[property];
	const apply = function() {
		return value.apply(apply, arguments);
	};
	Object.setPrototypeOf(apply, proto);
	return apply;
});
var own4 = {}.hasOwnProperty;
var unified = new class _Processor extends CallableInstance {
	/**
	* Create a processor.
	*/
	constructor() {
		super("copy");
		this.Compiler = void 0;
		this.Parser = void 0;
		this.attachers = [];
		this.compiler = void 0;
		this.freezeIndex = -1;
		this.frozen = void 0;
		this.namespace = {};
		this.parser = void 0;
		this.transformers = trough();
	}
	/**
	* Copy a processor.
	*
	* @deprecated
	*   This is a private internal method and should not be used.
	* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
	*   New *unfrozen* processor ({@linkcode Processor}) that is
	*   configured to work the same as its ancestor.
	*   When the descendant processor is configured in the future it does not
	*   affect the ancestral processor.
	*/
	copy() {
		const destination = new _Processor();
		let index2 = -1;
		while (++index2 < this.attachers.length) {
			const attacher = this.attachers[index2];
			destination.use(...attacher);
		}
		destination.data((0, import_extend.default)(true, {}, this.namespace));
		return destination;
	}
	/**
	* Configure the processor with info available to all plugins.
	* Information is stored in an object.
	*
	* Typically, options can be given to a specific plugin, but sometimes it
	* makes sense to have information shared with several plugins.
	* For example, a list of HTML elements that are self-closing, which is
	* needed during all phases.
	*
	* > **Note**: setting information cannot occur on *frozen* processors.
	* > Call the processor first to create a new unfrozen processor.
	*
	* > **Note**: to register custom data in TypeScript, augment the
	* > {@linkcode Data} interface.
	*
	* @example
	*   This example show how to get and set info:
	*
	*   ```js
	*   import {unified} from 'unified'
	*
	*   const processor = unified().data('alpha', 'bravo')
	*
	*   processor.data('alpha') // => 'bravo'
	*
	*   processor.data() // => {alpha: 'bravo'}
	*
	*   processor.data({charlie: 'delta'})
	*
	*   processor.data() // => {charlie: 'delta'}
	*   ```
	*
	* @template {keyof Data} Key
	*
	* @overload
	* @returns {Data}
	*
	* @overload
	* @param {Data} dataset
	* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
	*
	* @overload
	* @param {Key} key
	* @returns {Data[Key]}
	*
	* @overload
	* @param {Key} key
	* @param {Data[Key]} value
	* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
	*
	* @param {Data | Key} [key]
	*   Key to get or set, or entire dataset to set, or nothing to get the
	*   entire dataset (optional).
	* @param {Data[Key]} [value]
	*   Value to set (optional).
	* @returns {unknown}
	*   The current processor when setting, the value at `key` when getting, or
	*   the entire dataset when getting without key.
	*/
	data(key, value) {
		if (typeof key === "string") {
			if (arguments.length === 2) {
				assertUnfrozen("data", this.frozen);
				this.namespace[key] = value;
				return this;
			}
			return own4.call(this.namespace, key) && this.namespace[key] || void 0;
		}
		if (key) {
			assertUnfrozen("data", this.frozen);
			this.namespace = key;
			return this;
		}
		return this.namespace;
	}
	/**
	* Freeze a processor.
	*
	* Frozen processors are meant to be extended and not to be configured
	* directly.
	*
	* When a processor is frozen it cannot be unfrozen.
	* New processors working the same way can be created by calling the
	* processor.
	*
	* It’s possible to freeze processors explicitly by calling `.freeze()`.
	* Processors freeze automatically when `.parse()`, `.run()`, `.runSync()`,
	* `.stringify()`, `.process()`, or `.processSync()` are called.
	*
	* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
	*   The current processor.
	*/
	freeze() {
		if (this.frozen) return this;
		const self2 = this;
		while (++this.freezeIndex < this.attachers.length) {
			const [attacher, ...options] = this.attachers[this.freezeIndex];
			if (options[0] === false) continue;
			if (options[0] === true) options[0] = void 0;
			const transformer = attacher.call(self2, ...options);
			if (typeof transformer === "function") this.transformers.use(transformer);
		}
		this.frozen = true;
		this.freezeIndex = Number.POSITIVE_INFINITY;
		return this;
	}
	/**
	* Parse text to a syntax tree.
	*
	* > **Note**: `parse` freezes the processor if not already *frozen*.
	*
	* > **Note**: `parse` performs the parse phase, not the run phase or other
	* > phases.
	*
	* @param {Compatible | undefined} [file]
	*   file to parse (optional); typically `string` or `VFile`; any value
	*   accepted as `x` in `new VFile(x)`.
	* @returns {ParseTree extends undefined ? Node : ParseTree}
	*   Syntax tree representing `file`.
	*/
	parse(file) {
		this.freeze();
		const realFile = vfile(file);
		const parser = this.parser || this.Parser;
		assertParser("parse", parser);
		return parser(String(realFile), realFile);
	}
	/**
	* Process the given file as configured on the processor.
	*
	* > **Note**: `process` freezes the processor if not already *frozen*.
	*
	* > **Note**: `process` performs the parse, run, and stringify phases.
	*
	* @overload
	* @param {Compatible | undefined} file
	* @param {ProcessCallback<VFileWithOutput<CompileResult>>} done
	* @returns {undefined}
	*
	* @overload
	* @param {Compatible | undefined} [file]
	* @returns {Promise<VFileWithOutput<CompileResult>>}
	*
	* @param {Compatible | undefined} [file]
	*   File (optional); typically `string` or `VFile`]; any value accepted as
	*   `x` in `new VFile(x)`.
	* @param {ProcessCallback<VFileWithOutput<CompileResult>> | undefined} [done]
	*   Callback (optional).
	* @returns {Promise<VFile> | undefined}
	*   Nothing if `done` is given.
	*   Otherwise a promise, rejected with a fatal error or resolved with the
	*   processed file.
	*
	*   The parsed, transformed, and compiled value is available at
	*   `file.value` (see note).
	*
	*   > **Note**: unified typically compiles by serializing: most
	*   > compilers return `string` (or `Uint8Array`).
	*   > Some compilers, such as the one configured with
	*   > [`rehype-react`][rehype-react], return other values (in this case, a
	*   > React tree).
	*   > If you’re using a compiler that doesn’t serialize, expect different
	*   > result values.
	*   >
	*   > To register custom results in TypeScript, add them to
	*   > {@linkcode CompileResultMap}.
	*
	*   [rehype-react]: https://github.com/rehypejs/rehype-react
	*/
	process(file, done) {
		const self2 = this;
		this.freeze();
		assertParser("process", this.parser || this.Parser);
		assertCompiler("process", this.compiler || this.Compiler);
		return done ? executor(void 0, done) : new Promise(executor);
		function executor(resolve, reject) {
			const realFile = vfile(file);
			const parseTree = self2.parse(realFile);
			self2.run(parseTree, realFile, function(error, tree, file2) {
				if (error || !tree || !file2) return realDone(error);
				const compileTree = tree;
				const compileResult = self2.stringify(compileTree, file2);
				if (looksLikeAValue(compileResult)) file2.value = compileResult;
				else file2.result = compileResult;
				realDone(
					error,
					/** @type {VFileWithOutput<CompileResult>} */
					file2
				);
			});
			function realDone(error, file2) {
				if (error || !file2) reject(error);
				else if (resolve) resolve(file2);
				else done(void 0, file2);
			}
		}
	}
	/**
	* Process the given file as configured on the processor.
	*
	* An error is thrown if asynchronous transforms are configured.
	*
	* > **Note**: `processSync` freezes the processor if not already *frozen*.
	*
	* > **Note**: `processSync` performs the parse, run, and stringify phases.
	*
	* @param {Compatible | undefined} [file]
	*   File (optional); typically `string` or `VFile`; any value accepted as
	*   `x` in `new VFile(x)`.
	* @returns {VFileWithOutput<CompileResult>}
	*   The processed file.
	*
	*   The parsed, transformed, and compiled value is available at
	*   `file.value` (see note).
	*
	*   > **Note**: unified typically compiles by serializing: most
	*   > compilers return `string` (or `Uint8Array`).
	*   > Some compilers, such as the one configured with
	*   > [`rehype-react`][rehype-react], return other values (in this case, a
	*   > React tree).
	*   > If you’re using a compiler that doesn’t serialize, expect different
	*   > result values.
	*   >
	*   > To register custom results in TypeScript, add them to
	*   > {@linkcode CompileResultMap}.
	*
	*   [rehype-react]: https://github.com/rehypejs/rehype-react
	*/
	processSync(file) {
		let complete = false;
		let result;
		this.freeze();
		assertParser("processSync", this.parser || this.Parser);
		assertCompiler("processSync", this.compiler || this.Compiler);
		this.process(file, realDone);
		assertDone("processSync", "process", complete);
		return result;
		function realDone(error, file2) {
			complete = true;
			bail(error);
			result = file2;
		}
	}
	/**
	* Run *transformers* on a syntax tree.
	*
	* > **Note**: `run` freezes the processor if not already *frozen*.
	*
	* > **Note**: `run` performs the run phase, not other phases.
	*
	* @overload
	* @param {HeadTree extends undefined ? Node : HeadTree} tree
	* @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
	* @returns {undefined}
	*
	* @overload
	* @param {HeadTree extends undefined ? Node : HeadTree} tree
	* @param {Compatible | undefined} file
	* @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
	* @returns {undefined}
	*
	* @overload
	* @param {HeadTree extends undefined ? Node : HeadTree} tree
	* @param {Compatible | undefined} [file]
	* @returns {Promise<TailTree extends undefined ? Node : TailTree>}
	*
	* @param {HeadTree extends undefined ? Node : HeadTree} tree
	*   Tree to transform and inspect.
	* @param {(
	*   RunCallback<TailTree extends undefined ? Node : TailTree> |
	*   Compatible
	* )} [file]
	*   File associated with `node` (optional); any value accepted as `x` in
	*   `new VFile(x)`.
	* @param {RunCallback<TailTree extends undefined ? Node : TailTree>} [done]
	*   Callback (optional).
	* @returns {Promise<TailTree extends undefined ? Node : TailTree> | undefined}
	*   Nothing if `done` is given.
	*   Otherwise, a promise rejected with a fatal error or resolved with the
	*   transformed tree.
	*/
	run(tree, file, done) {
		assertNode(tree);
		this.freeze();
		const transformers = this.transformers;
		if (!done && typeof file === "function") {
			done = file;
			file = void 0;
		}
		return done ? executor(void 0, done) : new Promise(executor);
		function executor(resolve, reject) {
			const realFile = vfile(file);
			transformers.run(tree, realFile, realDone);
			function realDone(error, outputTree, file2) {
				const resultingTree = outputTree || tree;
				if (error) reject(error);
				else if (resolve) resolve(resultingTree);
				else done(void 0, resultingTree, file2);
			}
		}
	}
	/**
	* Run *transformers* on a syntax tree.
	*
	* An error is thrown if asynchronous transforms are configured.
	*
	* > **Note**: `runSync` freezes the processor if not already *frozen*.
	*
	* > **Note**: `runSync` performs the run phase, not other phases.
	*
	* @param {HeadTree extends undefined ? Node : HeadTree} tree
	*   Tree to transform and inspect.
	* @param {Compatible | undefined} [file]
	*   File associated with `node` (optional); any value accepted as `x` in
	*   `new VFile(x)`.
	* @returns {TailTree extends undefined ? Node : TailTree}
	*   Transformed tree.
	*/
	runSync(tree, file) {
		let complete = false;
		let result;
		this.run(tree, file, realDone);
		assertDone("runSync", "run", complete);
		return result;
		function realDone(error, tree2) {
			bail(error);
			result = tree2;
			complete = true;
		}
	}
	/**
	* Compile a syntax tree.
	*
	* > **Note**: `stringify` freezes the processor if not already *frozen*.
	*
	* > **Note**: `stringify` performs the stringify phase, not the run phase
	* > or other phases.
	*
	* @param {CompileTree extends undefined ? Node : CompileTree} tree
	*   Tree to compile.
	* @param {Compatible | undefined} [file]
	*   File associated with `node` (optional); any value accepted as `x` in
	*   `new VFile(x)`.
	* @returns {CompileResult extends undefined ? Value : CompileResult}
	*   Textual representation of the tree (see note).
	*
	*   > **Note**: unified typically compiles by serializing: most compilers
	*   > return `string` (or `Uint8Array`).
	*   > Some compilers, such as the one configured with
	*   > [`rehype-react`][rehype-react], return other values (in this case, a
	*   > React tree).
	*   > If you’re using a compiler that doesn’t serialize, expect different
	*   > result values.
	*   >
	*   > To register custom results in TypeScript, add them to
	*   > {@linkcode CompileResultMap}.
	*
	*   [rehype-react]: https://github.com/rehypejs/rehype-react
	*/
	stringify(tree, file) {
		this.freeze();
		const realFile = vfile(file);
		const compiler2 = this.compiler || this.Compiler;
		assertCompiler("stringify", compiler2);
		assertNode(tree);
		return compiler2(tree, realFile);
	}
	/**
	* Configure the processor to use a plugin, a list of usable values, or a
	* preset.
	*
	* If the processor is already using a plugin, the previous plugin
	* configuration is changed based on the options that are passed in.
	* In other words, the plugin is not added a second time.
	*
	* > **Note**: `use` cannot be called on *frozen* processors.
	* > Call the processor first to create a new unfrozen processor.
	*
	* @example
	*   There are many ways to pass plugins to `.use()`.
	*   This example gives an overview:
	*
	*   ```js
	*   import {unified} from 'unified'
	*
	*   unified()
	*     // Plugin with options:
	*     .use(pluginA, {x: true, y: true})
	*     // Passing the same plugin again merges configuration (to `{x: true, y: false, z: true}`):
	*     .use(pluginA, {y: false, z: true})
	*     // Plugins:
	*     .use([pluginB, pluginC])
	*     // Two plugins, the second with options:
	*     .use([pluginD, [pluginE, {}]])
	*     // Preset with plugins and settings:
	*     .use({plugins: [pluginF, [pluginG, {}]], settings: {position: false}})
	*     // Settings only:
	*     .use({settings: {position: false}})
	*   ```
	*
	* @template {Array<unknown>} [Parameters=[]]
	* @template {Node | string | undefined} [Input=undefined]
	* @template [Output=Input]
	*
	* @overload
	* @param {Preset | null | undefined} [preset]
	* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
	*
	* @overload
	* @param {PluggableList} list
	* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
	*
	* @overload
	* @param {Plugin<Parameters, Input, Output>} plugin
	* @param {...(Parameters | [boolean])} parameters
	* @returns {UsePlugin<ParseTree, HeadTree, TailTree, CompileTree, CompileResult, Input, Output>}
	*
	* @param {PluggableList | Plugin | Preset | null | undefined} value
	*   Usable value.
	* @param {...unknown} parameters
	*   Parameters, when a plugin is given as a usable value.
	* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
	*   Current processor.
	*/
	use(value, ...parameters) {
		const attachers = this.attachers;
		const namespace = this.namespace;
		assertUnfrozen("use", this.frozen);
		if (value === null || value === void 0) {} else if (typeof value === "function") addPlugin(value, parameters);
		else if (typeof value === "object") {
			if (Array.isArray(value)) addList(value);
			else addPreset(value);
		} else throw new TypeError("Expected usable value, not `" + value + "`");
		return this;
		function add(value2) {
			if (typeof value2 === "function") addPlugin(value2, []);
			else if (typeof value2 === "object") {
				if (Array.isArray(value2)) {
					const [plugin, ...parameters2] = value2;
					addPlugin(plugin, parameters2);
				} else addPreset(value2);
			} else throw new TypeError("Expected usable value, not `" + value2 + "`");
		}
		function addPreset(result) {
			if (!("plugins" in result) && !("settings" in result)) throw new Error("Expected usable value but received an empty preset, which is probably a mistake: presets typically come with `plugins` and sometimes with `settings`, but this has neither");
			addList(result.plugins);
			if (result.settings) namespace.settings = (0, import_extend.default)(true, namespace.settings, result.settings);
		}
		function addList(plugins) {
			let index2 = -1;
			if (plugins === null || plugins === void 0) {} else if (Array.isArray(plugins)) while (++index2 < plugins.length) {
				const thing = plugins[index2];
				add(thing);
			}
			else throw new TypeError("Expected a list of plugins, not `" + plugins + "`");
		}
		function addPlugin(plugin, parameters2) {
			let index2 = -1;
			let entryIndex = -1;
			while (++index2 < attachers.length) if (attachers[index2][0] === plugin) {
				entryIndex = index2;
				break;
			}
			if (entryIndex === -1) attachers.push([plugin, ...parameters2]);
			else if (parameters2.length > 0) {
				let [primary, ...rest] = parameters2;
				const currentPrimary = attachers[entryIndex][1];
				if (isPlainObject(currentPrimary) && isPlainObject(primary)) primary = (0, import_extend.default)(true, currentPrimary, primary);
				attachers[entryIndex] = [
					plugin,
					primary,
					...rest
				];
			}
		}
	}
}().freeze();
function assertParser(name, value) {
	if (typeof value !== "function") throw new TypeError("Cannot `" + name + "` without `parser`");
}
function assertCompiler(name, value) {
	if (typeof value !== "function") throw new TypeError("Cannot `" + name + "` without `compiler`");
}
function assertUnfrozen(name, frozen) {
	if (frozen) throw new Error("Cannot call `" + name + "` on a frozen processor.\nCreate a new processor first, by calling it: use `processor()` instead of `processor`.");
}
function assertNode(node2) {
	if (!isPlainObject(node2) || typeof node2.type !== "string") throw new TypeError("Expected node, got `" + node2 + "`");
}
function assertDone(name, asyncName, complete) {
	if (!complete) throw new Error("`" + name + "` finished async. Use `" + asyncName + "` instead");
}
function vfile(value) {
	return looksLikeAVFile(value) ? value : new VFile(value);
}
function looksLikeAVFile(value) {
	return Boolean(value && typeof value === "object" && "message" in value && "messages" in value);
}
function looksLikeAValue(value) {
	return typeof value === "string" || isUint8Array2(value);
}
function isUint8Array2(value) {
	return Boolean(value && typeof value === "object" && "byteLength" in value && "byteOffset" in value);
}
var nonNullable = (value) => value != null;
var camelToKebab = (str) => str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
var transformClassName = (node2) => {
	if (node2.type !== "element" || node2.properties === void 0 || !Array.isArray(node2.properties.className)) return;
	node2.properties.class = node2.properties.className.join(" ");
	delete node2.properties.className;
};
var transformAriaProps = (node2) => {
	if (node2.type !== "element" || node2.properties === void 0) return;
	const ariaProps = Object.keys(node2.properties).filter((key) => key.startsWith("aria"));
	for (const key of ariaProps) {
		const value = node2.properties[key];
		delete node2.properties[key];
		node2.properties[camelToKebab(key)] = value;
	}
};
var transform$1 = (node2) => {
	transformClassName(node2);
	transformAriaProps(node2);
};
var visit2 = (visitor, node2) => {
	visitor(node2);
	node2.children?.forEach((child) => visit2(visitor, child));
};
var rehypeReactPropsToSvelteProps = () => {
	return (node2, _file, done) => {
		try {
			visit2(transform$1, node2);
			done();
		} catch (e) {
			if (e instanceof Error) return done(e);
			return done(new Error(String(e)));
		}
	};
};
var createParser = (plugins) => {
	const processor = unified().use(remarkParse).use(plugins.map((plugin) => plugin.remarkPlugin).filter(nonNullable)).use(remarkRehype, { allowDangerousHtml: true }).use(plugins.map((plugin) => plugin.rehypePlugin).filter(nonNullable)).use(rehypeReactPropsToSvelteProps);
	return (md) => processor.runSync(processor.parse(md), md);
};
var resolveComponent = (map, tagName, circularCheck = []) => {
	if (circularCheck.includes(tagName)) {
		circularCheck.push(tagName);
		throw new Error(`Circular dependency detected: ${circularCheck.join(" -> ")}`);
	}
	const component = map[tagName];
	if (typeof component === "string") return resolveComponent(map, component, [...circularCheck, tagName]);
	if (component === null) return null;
	if (component === void 0) return tagName;
	return component;
};
var getComponentsFromPlugins = (plugins) => {
	return plugins.map((plugin) => plugin.renderer).filter(nonNullable).reduce((acc, cur) => ({
		...acc,
		...cur
	}), {});
};
var htmlTags = [
	"html",
	"base",
	"head",
	"link",
	"meta",
	"style",
	"title",
	"body",
	"address",
	"article",
	"aside",
	"footer",
	"header",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"hgroup",
	"main",
	"nav",
	"section",
	"search",
	"blockquote",
	"dd",
	"div",
	"dl",
	"dt",
	"figcaption",
	"figure",
	"hr",
	"li",
	"menu",
	"ol",
	"p",
	"pre",
	"ul",
	"a",
	"abbr",
	"b",
	"bdi",
	"bdo",
	"br",
	"cite",
	"code",
	"data",
	"dfn",
	"em",
	"i",
	"kbd",
	"mark",
	"q",
	"rp",
	"rt",
	"ruby",
	"s",
	"samp",
	"small",
	"span",
	"strong",
	"sub",
	"sup",
	"time",
	"u",
	"var",
	"wbr",
	"area",
	"audio",
	"img",
	"map",
	"track",
	"video",
	"embed",
	"iframe",
	"object",
	"picture",
	"portal",
	"source",
	"svg",
	"math",
	"canvas",
	"noscript",
	"script",
	"del",
	"ins",
	"caption",
	"col",
	"colgroup",
	"table",
	"tbody",
	"td",
	"tfoot",
	"th",
	"thead",
	"tr",
	"button",
	"datalist",
	"fieldset",
	"form",
	"input",
	"label",
	"legend",
	"meter",
	"optgroup",
	"option",
	"output",
	"progress",
	"select",
	"textarea",
	"details",
	"dialog",
	"summary",
	"slot",
	"template",
	"acronym",
	"big",
	"center",
	"content",
	"dir",
	"font",
	"frame",
	"frameset",
	"image",
	"marquee",
	"menuitem",
	"nobr",
	"noembed",
	"noframes",
	"param",
	"plaintext",
	"rb",
	"rtc",
	"shadow",
	"strike",
	"tt",
	"xmp"
];
var svgTags = [
	"animate",
	"animateMotion",
	"animateTransform",
	"circle",
	"clipPath",
	"defs",
	"desc",
	"ellipse",
	"feBlend",
	"feColorMatrix",
	"feComponentTransfer",
	"feComposite",
	"feConvolveMatrix",
	"feDiffuseLighting",
	"feDisplacementMap",
	"feDistantLight",
	"feDropShadow",
	"feFlood",
	"feFuncA",
	"feFuncB",
	"feFuncG",
	"feFuncR",
	"feGaussianBlur",
	"feImage",
	"feMerge",
	"feMergeNode",
	"feMorphology",
	"feOffset",
	"fePointLight",
	"feSpecularLighting",
	"feSpotLight",
	"feTile",
	"feTurbulence",
	"filter",
	"foreignObject",
	"g",
	"hatch",
	"hatchpath",
	"line",
	"linearGradient",
	"marker",
	"mask",
	"metadata",
	"mpath",
	"path",
	"pattern",
	"polygon",
	"polyline",
	"radialGradient",
	"rect",
	"set",
	"stop",
	"svg",
	"switch",
	"symbol",
	"text",
	"textPath",
	"tspan",
	"use",
	"view"
];
[...htmlTags, ...svgTags];
var snippetRendererMarker = Symbol.for("snippetRenderer");
var snippetRenderer = (snippet) => {
	const renderer = snippet;
	renderer[snippetRendererMarker] = true;
	return renderer;
};
// node_modules/.deno/svelte-exmarkdown@5.0.2/node_modules/svelte-exmarkdown/dist/Renderer.svelte
var children$1 = ($$anchor, nodes = noop) => {
	var fragment = comment$1();
	each(first_child(fragment), 17, nodes, index$1, ($$anchor, node) => {
		Renderer_1($$anchor, { get astNode() {
			return get(node);
		} });
	});
	append($$anchor, fragment);
};
function Renderer_1($$anchor, $$props) {
	push$1($$props, true);
	const components = getComponentsMap();
	const astContext = ref($$props.astNode);
	user_pre_effect(() => {
		astContext.current = $$props.astNode;
	});
	setAstContext(astContext);
	const svgContextKey = "svg";
	if ($$props.astNode.type === "element" && $$props.astNode.tagName === "svg") setContext(svgContextKey, true);
	var fragment_2 = comment$1();
	var node_2 = first_child(fragment_2);
	var consequent = ($$anchor) => {
		children$1($$anchor, () => $$props.astNode.children);
	};
	var consequent_9 = ($$anchor) => {
		const Component = /* @__PURE__ */ user_derived(() => resolveComponent(components.current, $$props.astNode.tagName));
		var fragment_4 = comment$1();
		var node_3 = first_child(fragment_4);
		var consequent_4 = ($$anchor) => {
			var fragment_5 = comment$1();
			var node_4 = first_child(fragment_5);
			var consequent_2 = ($$anchor) => {
				const svgElement = /* @__PURE__ */ user_derived(() => get(Component));
				var fragment_6 = comment$1();
				var node_5 = first_child(fragment_6);
				var consequent_1 = ($$anchor) => {
					var fragment_7 = comment$1();
					element$1(first_child(fragment_7), () => get(svgElement), true, ($$element, $$anchor) => {
						attribute_effect($$element, () => ({
							xmlns: "http://www.w3.org/2000/svg",
							...$$props.astNode.properties
						}));
						children$1($$anchor, () => $$props.astNode.children);
					});
					append($$anchor, fragment_7);
				};
				var d = /* @__PURE__ */ user_derived(() => Array.isArray($$props.astNode.children) && $$props.astNode.children.length !== 0);
				var alternate = ($$anchor) => {
					var fragment_9 = comment$1();
					element$1(first_child(fragment_9), () => get(svgElement), true, ($$element_1, $$anchor) => {
						attribute_effect($$element_1, () => ({
							xmlns: "http://www.w3.org/2000/svg",
							...$$props.astNode.properties
						}));
					});
					append($$anchor, fragment_9);
				};
				if_block(node_5, ($$render) => {
					if (get(d)) $$render(consequent_1);
					else $$render(alternate, -1);
				});
				append($$anchor, fragment_6);
			};
			var d_1 = /* @__PURE__ */ user_derived(() => getContext(svgContextKey));
			var consequent_3 = ($$anchor) => {
				var fragment_10 = comment$1();
				element$1(first_child(fragment_10), () => get(Component), false, ($$element_2, $$anchor) => {
					attribute_effect($$element_2, () => ({ ...$$props.astNode.properties }));
					children$1($$anchor, () => $$props.astNode.children);
				});
				append($$anchor, fragment_10);
			};
			var d_2 = /* @__PURE__ */ user_derived(() => Array.isArray($$props.astNode.children) && $$props.astNode.children.length !== 0);
			var alternate_1 = ($$anchor) => {
				var fragment_12 = comment$1();
				element$1(first_child(fragment_12), () => get(Component), false, ($$element_3, $$anchor) => {
					attribute_effect($$element_3, () => ({ ...$$props.astNode.properties }));
				});
				append($$anchor, fragment_12);
			};
			if_block(node_4, ($$render) => {
				if (get(d_1)) $$render(consequent_2);
				else if (get(d_2)) $$render(consequent_3, 1);
				else $$render(alternate_1, -1);
			});
			append($$anchor, fragment_5);
		};
		var consequent_8 = ($$anchor) => {
			var fragment_13 = comment$1();
			var node_10 = first_child(fragment_13);
			var consequent_6 = ($$anchor) => {
				var fragment_14 = comment$1();
				var node_11 = first_child(fragment_14);
				var consequent_5 = ($$anchor) => {
					const _children = ($$anchor) => {
						children$1($$anchor, () => $$props.astNode.children);
					};
					var fragment_16 = comment$1();
					var node_12 = first_child(fragment_16);
					{
						let $0 = /* @__PURE__ */ user_derived(() => ({
							...$$props.astNode.properties,
							children: _children
						}));
						snippet(node_12, () => get(Component), () => get($0));
					}
					append($$anchor, fragment_16);
				};
				var d_3 = /* @__PURE__ */ user_derived(() => Array.isArray($$props.astNode.children) && $$props.astNode.children.length !== 0);
				var alternate_2 = ($$anchor) => {
					var fragment_17 = comment$1();
					snippet(first_child(fragment_17), () => get(Component), () => $$props.astNode.properties);
					append($$anchor, fragment_17);
				};
				if_block(node_11, ($$render) => {
					if (get(d_3)) $$render(consequent_5);
					else $$render(alternate_2, -1);
				});
				append($$anchor, fragment_14);
			};
			var consequent_7 = ($$anchor) => {
				var fragment_18 = comment$1();
				component(first_child(fragment_18), () => get(Component), ($$anchor, Component_1) => {
					Component_1($$anchor, spread_props(() => $$props.astNode.properties, {
						children: ($$anchor, $$slotProps) => {
							children$1($$anchor, () => $$props.astNode.children);
						},
						$$slots: { default: true }
					}));
				});
				append($$anchor, fragment_18);
			};
			var d_4 = /* @__PURE__ */ user_derived(() => Array.isArray($$props.astNode.children) && $$props.astNode.children.length !== 0);
			var alternate_3 = ($$anchor) => {
				var fragment_20 = comment$1();
				component(first_child(fragment_20), () => get(Component), ($$anchor, Component_2) => {
					Component_2($$anchor, spread_props(() => $$props.astNode.properties));
				});
				append($$anchor, fragment_20);
			};
			if_block(node_10, ($$render) => {
				if (snippetRendererMarker in get(Component) && get(Component)[snippetRendererMarker]) $$render(consequent_6);
				else if (get(d_4)) $$render(consequent_7, 1);
				else $$render(alternate_3, -1);
			});
			append($$anchor, fragment_13);
		};
		if_block(node_3, ($$render) => {
			if (typeof get(Component) === "string") $$render(consequent_4);
			else if (get(Component) !== null) $$render(consequent_8, 1);
		});
		append($$anchor, fragment_4);
	};
	var consequent_10 = ($$anchor) => {
		var text = text$3();
		template_effect(() => set_text(text, $$props.astNode.value));
		append($$anchor, text);
	};
	if_block(node_2, ($$render) => {
		if ($$props.astNode.type === "root") $$render(consequent);
		else if ($$props.astNode.type === "element") $$render(consequent_9, 1);
		else if ($$props.astNode.type === "text" || $$props.astNode.type === "raw") $$render(consequent_10, 2);
	});
	append($$anchor, fragment_2);
	pop();
}
// node_modules/.deno/svelte-exmarkdown@5.0.2/node_modules/svelte-exmarkdown/dist/Markdown.svelte
var rest_excludes = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"md",
	"plugins"
]);
function Markdown($$anchor, $$props) {
	push$1($$props, true);
	let plugins = prop($$props, "plugins", 19, () => []), snippetRenderers = /* @__PURE__ */ rest_props($$props, rest_excludes);
	let snippetRenderersPlugin = /* @__PURE__ */ user_derived(() => ({ renderer: Object.fromEntries(Object.entries(snippetRenderers).map(([tag, renderer]) => {
		if (typeof renderer === "string") return [tag, renderer];
		if (typeof renderer !== "function") return void 0;
		return [tag, snippetRenderer(renderer)];
	}).filter((tuple) => tuple != null)) }));
	let parse = /* @__PURE__ */ user_derived(() => createParser(plugins()));
	const componentsContextValue = ref(getComponentsFromPlugins([...plugins(), get(snippetRenderersPlugin)]));
	user_effect(() => {
		componentsContextValue.current = getComponentsFromPlugins([...plugins(), get(snippetRenderersPlugin)]);
	});
	setComponentsContext(componentsContextValue);
	let result = /* @__PURE__ */ user_derived(() => get(parse)($$props.md));
	Renderer_1($$anchor, { get astNode() {
		return get(result);
	} });
	pop();
}
// node_modules/.deno/svelte-exmarkdown@5.0.2/node_modules/svelte-exmarkdown/dist/index.js
var dist_default = Markdown;
// node_modules/.deno/svelte-exmarkdown@5.0.2/node_modules/svelte-exmarkdown/dist/gfm/index.js
function ccount(value, character) {
	const source = String(value);
	if (typeof character !== "string") throw new TypeError("Expected character");
	let count = 0;
	let index = source.indexOf(character);
	while (index !== -1) {
		count++;
		index = source.indexOf(character, index + character.length);
	}
	return count;
}
var asciiAlpha = regexCheck(/[A-Za-z]/);
var asciiAlphanumeric = regexCheck(/[\dA-Za-z]/);
function asciiControl(code3) {
	return code3 !== null && (code3 < 32 || code3 === 127);
}
function markdownLineEnding(code3) {
	return code3 !== null && code3 < -2;
}
function markdownLineEndingOrSpace(code3) {
	return code3 !== null && (code3 < 0 || code3 === 32);
}
function markdownSpace(code3) {
	return code3 === -2 || code3 === -1 || code3 === 32;
}
var unicodePunctuation = regexCheck(/\p{P}|\p{S}/u);
var unicodeWhitespace = regexCheck(/\s/);
function regexCheck(regex) {
	return check;
	function check(code3) {
		return code3 !== null && code3 > -1 && regex.test(String.fromCharCode(code3));
	}
}
function escapeStringRegexp(string) {
	if (typeof string !== "string") throw new TypeError("Expected a string");
	return string.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
var convert = (
/**
* @type {(
*   (<Condition extends string>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & {type: Condition}) &
*   (<Condition extends Props>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Condition) &
*   (<Condition extends TestFunction>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Predicate<Condition, Node>) &
*   ((test?: null | undefined) => (node?: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node) &
*   ((test?: Test) => Check)
* )}
*/
/**
* @param {Test} [test]
* @returns {Check}
*/
function(test) {
	if (test === null || test === void 0) return ok2;
	if (typeof test === "function") return castFactory(test);
	if (typeof test === "object") return Array.isArray(test) ? anyFactory(test) : propsFactory(test);
	if (typeof test === "string") return typeFactory(test);
	throw new Error("Expected function, string, or object as test");
});
function anyFactory(tests) {
	const checks = [];
	let index = -1;
	while (++index < tests.length) checks[index] = convert(tests[index]);
	return castFactory(any);
	function any(...parameters) {
		let index2 = -1;
		while (++index2 < checks.length) if (checks[index2].apply(this, parameters)) return true;
		return false;
	}
}
function propsFactory(check) {
	const checkAsRecord = check;
	return castFactory(all2);
	function all2(node2) {
		const nodeAsRecord = node2;
		let key;
		for (key in check) if (nodeAsRecord[key] !== checkAsRecord[key]) return false;
		return true;
	}
}
function typeFactory(check) {
	return castFactory(type);
	function type(node2) {
		return node2 && node2.type === check;
	}
}
function castFactory(testFunction) {
	return check;
	function check(value, index, parent) {
		return Boolean(looksLikeANode(value) && testFunction.call(this, value, typeof index === "number" ? index : void 0, parent || void 0));
	}
}
function ok2() {
	return true;
}
function looksLikeANode(value) {
	return value !== null && typeof value === "object" && "type" in value;
}
function color(d) {
	return d;
}
var empty = [];
var CONTINUE = true;
var EXIT = false;
var SKIP = "skip";
function visitParents(tree, test, visitor, reverse) {
	let check;
	if (typeof test === "function" && typeof visitor !== "function") {
		reverse = visitor;
		visitor = test;
	} else check = test;
	const is2 = convert(check);
	const step = reverse ? -1 : 1;
	factory(tree, void 0, [])();
	function factory(node2, index, parents) {
		const value = node2 && typeof node2 === "object" ? node2 : {};
		if (typeof value.type === "string") {
			const name = typeof value.tagName === "string" ? value.tagName : typeof value.name === "string" ? value.name : void 0;
			Object.defineProperty(visit2, "name", { value: "node (" + color(node2.type + (name ? "<" + name + ">" : "")) + ")" });
		}
		return visit2;
		function visit2() {
			let result = empty;
			let subresult;
			let offset;
			let grandparents;
			if (!test || is2(node2, index, parents[parents.length - 1] || void 0)) {
				result = toResult(visitor(node2, parents));
				if (result[0] === EXIT) return result;
			}
			if ("children" in node2 && node2.children) {
				const nodeAsParent = node2;
				if (nodeAsParent.children && result[0] !== SKIP) {
					offset = (reverse ? nodeAsParent.children.length : -1) + step;
					grandparents = parents.concat(nodeAsParent);
					while (offset > -1 && offset < nodeAsParent.children.length) {
						const child = nodeAsParent.children[offset];
						subresult = factory(child, offset, grandparents)();
						if (subresult[0] === EXIT) return subresult;
						offset = typeof subresult[1] === "number" ? subresult[1] : offset + step;
					}
				}
			}
			return result;
		}
	}
}
function toResult(value) {
	if (Array.isArray(value)) return value;
	if (typeof value === "number") return [CONTINUE, value];
	return value === null || value === void 0 ? empty : [value];
}
function findAndReplace(tree, list2, options) {
	const ignored = convert((options || {}).ignore || []);
	const pairs = toPairs(list2);
	let pairIndex = -1;
	while (++pairIndex < pairs.length) visitParents(tree, "text", visitor);
	function visitor(node2, parents) {
		let index = -1;
		let grandparent;
		while (++index < parents.length) {
			const parent = parents[index];
			const siblings = grandparent ? grandparent.children : void 0;
			if (ignored(parent, siblings ? siblings.indexOf(parent) : void 0, grandparent)) return;
			grandparent = parent;
		}
		if (grandparent) return handler(node2, parents);
	}
	function handler(node2, parents) {
		const parent = parents[parents.length - 1];
		const find = pairs[pairIndex][0];
		const replace2 = pairs[pairIndex][1];
		let start = 0;
		const index = parent.children.indexOf(node2);
		let change = false;
		let nodes = [];
		find.lastIndex = 0;
		let match = find.exec(node2.value);
		while (match) {
			const position = match.index;
			const matchObject = {
				index: match.index,
				input: match.input,
				stack: [...parents, node2]
			};
			let value = replace2(...match, matchObject);
			if (typeof value === "string") value = value.length > 0 ? {
				type: "text",
				value
			} : void 0;
			if (value === false) find.lastIndex = position + 1;
			else {
				if (start !== position) nodes.push({
					type: "text",
					value: node2.value.slice(start, position)
				});
				if (Array.isArray(value)) nodes.push(...value);
				else if (value) nodes.push(value);
				start = position + match[0].length;
				change = true;
			}
			if (!find.global) break;
			match = find.exec(node2.value);
		}
		if (change) {
			if (start < node2.value.length) nodes.push({
				type: "text",
				value: node2.value.slice(start)
			});
			parent.children.splice(index, 1, ...nodes);
		} else nodes = [node2];
		return index + nodes.length;
	}
}
function toPairs(tupleOrList) {
	const result = [];
	if (!Array.isArray(tupleOrList)) throw new TypeError("Expected find and replace tuple or list of tuples");
	const list2 = !tupleOrList[0] || Array.isArray(tupleOrList[0]) ? tupleOrList : [tupleOrList];
	let index = -1;
	while (++index < list2.length) {
		const tuple = list2[index];
		result.push([toExpression(tuple[0]), toFunction(tuple[1])]);
	}
	return result;
}
function toExpression(find) {
	return typeof find === "string" ? new RegExp(escapeStringRegexp(find), "g") : find;
}
function toFunction(replace2) {
	return typeof replace2 === "function" ? replace2 : function() {
		return replace2;
	};
}
var inConstruct = "phrasing";
var notInConstruct = [
	"autolink",
	"link",
	"image",
	"label"
];
function gfmAutolinkLiteralFromMarkdown() {
	return {
		transforms: [transformGfmAutolinkLiterals],
		enter: {
			literalAutolink: enterLiteralAutolink,
			literalAutolinkEmail: enterLiteralAutolinkValue,
			literalAutolinkHttp: enterLiteralAutolinkValue,
			literalAutolinkWww: enterLiteralAutolinkValue
		},
		exit: {
			literalAutolink: exitLiteralAutolink,
			literalAutolinkEmail: exitLiteralAutolinkEmail,
			literalAutolinkHttp: exitLiteralAutolinkHttp,
			literalAutolinkWww: exitLiteralAutolinkWww
		}
	};
}
function gfmAutolinkLiteralToMarkdown() {
	return { unsafe: [
		{
			character: "@",
			before: "[+\\-.\\w]",
			after: "[\\-.\\w]",
			inConstruct,
			notInConstruct
		},
		{
			character: ".",
			before: "[Ww]",
			after: "[\\-.\\w]",
			inConstruct,
			notInConstruct
		},
		{
			character: ":",
			before: "[ps]",
			after: "\\/",
			inConstruct,
			notInConstruct
		}
	] };
}
function enterLiteralAutolink(token) {
	this.enter({
		type: "link",
		title: null,
		url: "",
		children: []
	}, token);
}
function enterLiteralAutolinkValue(token) {
	this.config.enter.autolinkProtocol.call(this, token);
}
function exitLiteralAutolinkHttp(token) {
	this.config.exit.autolinkProtocol.call(this, token);
}
function exitLiteralAutolinkWww(token) {
	this.config.exit.data.call(this, token);
	const node2 = this.stack[this.stack.length - 1];
	node2.type;
	node2.url = "http://" + this.sliceSerialize(token);
}
function exitLiteralAutolinkEmail(token) {
	this.config.exit.autolinkEmail.call(this, token);
}
function exitLiteralAutolink(token) {
	this.exit(token);
}
function transformGfmAutolinkLiterals(tree) {
	findAndReplace(tree, [[/(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/gi, findUrl], [/(?<=^|\s|\p{P}|\p{S})([-.\w+]+)@([-\w]+(?:\.[-\w]+)+)/gu, findEmail]], { ignore: ["link", "linkReference"] });
}
function findUrl(_, protocol, domain2, path2, match) {
	let prefix = "";
	if (!previous(match)) return false;
	if (/^w/i.test(protocol)) {
		domain2 = protocol + domain2;
		protocol = "";
		prefix = "http://";
	}
	if (!isCorrectDomain(domain2)) return false;
	const parts = splitUrl(domain2 + path2);
	if (!parts[0]) return false;
	const result = {
		type: "link",
		title: null,
		url: prefix + protocol + parts[0],
		children: [{
			type: "text",
			value: protocol + parts[0]
		}]
	};
	if (parts[1]) return [result, {
		type: "text",
		value: parts[1]
	}];
	return result;
}
function findEmail(_, atext, label, match) {
	if (!previous(match, true) || /[-\d_]$/.test(label)) return false;
	return {
		type: "link",
		title: null,
		url: "mailto:" + atext + "@" + label,
		children: [{
			type: "text",
			value: atext + "@" + label
		}]
	};
}
function isCorrectDomain(domain2) {
	const parts = domain2.split(".");
	if (parts.length < 2 || parts[parts.length - 1] && (/_/.test(parts[parts.length - 1]) || !/[a-zA-Z\d]/.test(parts[parts.length - 1])) || parts[parts.length - 2] && (/_/.test(parts[parts.length - 2]) || !/[a-zA-Z\d]/.test(parts[parts.length - 2]))) return false;
	return true;
}
function splitUrl(url) {
	const trailExec = /[!"&'),.:;<>?\]}]+$/.exec(url);
	if (!trailExec) return [url, void 0];
	url = url.slice(0, trailExec.index);
	let trail2 = trailExec[0];
	let closingParenIndex = trail2.indexOf(")");
	const openingParens = ccount(url, "(");
	let closingParens = ccount(url, ")");
	while (closingParenIndex !== -1 && openingParens > closingParens) {
		url += trail2.slice(0, closingParenIndex + 1);
		trail2 = trail2.slice(closingParenIndex + 1);
		closingParenIndex = trail2.indexOf(")");
		closingParens++;
	}
	return [url, trail2];
}
function previous(match, email) {
	const code3 = match.input.charCodeAt(match.index - 1);
	return (match.index === 0 || unicodeWhitespace(code3) || unicodePunctuation(code3)) && (!email || code3 !== 47);
}
function normalizeIdentifier(value) {
	return value.replace(/[\t\n\r ]+/g, " ").replace(/^ | $/g, "").toLowerCase().toUpperCase();
}
footnoteReference.peek = footnoteReferencePeek;
function enterFootnoteCallString() {
	this.buffer();
}
function enterFootnoteCall(token) {
	this.enter({
		type: "footnoteReference",
		identifier: "",
		label: ""
	}, token);
}
function enterFootnoteDefinitionLabelString() {
	this.buffer();
}
function enterFootnoteDefinition(token) {
	this.enter({
		type: "footnoteDefinition",
		identifier: "",
		label: "",
		children: []
	}, token);
}
function exitFootnoteCallString(token) {
	const label = this.resume();
	const node2 = this.stack[this.stack.length - 1];
	node2.type;
	node2.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
	node2.label = label;
}
function exitFootnoteCall(token) {
	this.exit(token);
}
function exitFootnoteDefinitionLabelString(token) {
	const label = this.resume();
	const node2 = this.stack[this.stack.length - 1];
	node2.type;
	node2.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
	node2.label = label;
}
function exitFootnoteDefinition(token) {
	this.exit(token);
}
function footnoteReferencePeek() {
	return "[";
}
function footnoteReference(node2, _, state, info) {
	const tracker = state.createTracker(info);
	let value = tracker.move("[^");
	const exit2 = state.enter("footnoteReference");
	const subexit = state.enter("reference");
	value += tracker.move(state.safe(state.associationId(node2), {
		after: "]",
		before: value
	}));
	subexit();
	exit2();
	value += tracker.move("]");
	return value;
}
function gfmFootnoteFromMarkdown() {
	return {
		enter: {
			gfmFootnoteCallString: enterFootnoteCallString,
			gfmFootnoteCall: enterFootnoteCall,
			gfmFootnoteDefinitionLabelString: enterFootnoteDefinitionLabelString,
			gfmFootnoteDefinition: enterFootnoteDefinition
		},
		exit: {
			gfmFootnoteCallString: exitFootnoteCallString,
			gfmFootnoteCall: exitFootnoteCall,
			gfmFootnoteDefinitionLabelString: exitFootnoteDefinitionLabelString,
			gfmFootnoteDefinition: exitFootnoteDefinition
		}
	};
}
function gfmFootnoteToMarkdown(options) {
	let firstLineBlank = false;
	if (options && options.firstLineBlank) firstLineBlank = true;
	return {
		handlers: {
			footnoteDefinition,
			footnoteReference
		},
		unsafe: [{
			character: "[",
			inConstruct: [
				"label",
				"phrasing",
				"reference"
			]
		}]
	};
	function footnoteDefinition(node2, _, state, info) {
		const tracker = state.createTracker(info);
		let value = tracker.move("[^");
		const exit2 = state.enter("footnoteDefinition");
		const subexit = state.enter("label");
		value += tracker.move(state.safe(state.associationId(node2), {
			before: value,
			after: "]"
		}));
		subexit();
		value += tracker.move("]:");
		if (node2.children && node2.children.length > 0) {
			tracker.shift(4);
			value += tracker.move((firstLineBlank ? "\n" : " ") + state.indentLines(state.containerFlow(node2, tracker.current()), firstLineBlank ? mapAll : mapExceptFirst));
		}
		exit2();
		return value;
	}
}
function mapExceptFirst(line, index, blank) {
	return index === 0 ? line : mapAll(line, index, blank);
}
function mapAll(line, index, blank) {
	return (blank ? "" : "    ") + line;
}
var constructsWithoutStrikethrough = [
	"autolink",
	"destinationLiteral",
	"destinationRaw",
	"reference",
	"titleQuote",
	"titleApostrophe"
];
handleDelete.peek = peekDelete;
function gfmStrikethroughFromMarkdown() {
	return {
		canContainEols: ["delete"],
		enter: { strikethrough: enterStrikethrough },
		exit: { strikethrough: exitStrikethrough }
	};
}
function gfmStrikethroughToMarkdown() {
	return {
		unsafe: [{
			character: "~",
			inConstruct: "phrasing",
			notInConstruct: constructsWithoutStrikethrough
		}],
		handlers: { delete: handleDelete }
	};
}
function enterStrikethrough(token) {
	this.enter({
		type: "delete",
		children: []
	}, token);
}
function exitStrikethrough(token) {
	this.exit(token);
}
function handleDelete(node2, _, state, info) {
	const tracker = state.createTracker(info);
	const exit2 = state.enter("strikethrough");
	let value = tracker.move("~~");
	value += state.containerPhrasing(node2, {
		...tracker.current(),
		before: value,
		after: "~"
	});
	value += tracker.move("~~");
	exit2();
	return value;
}
function peekDelete() {
	return "~";
}
function defaultStringLength(value) {
	return value.length;
}
function markdownTable(table, options) {
	const settings = options || {};
	const align = (settings.align || []).concat();
	const stringLength = settings.stringLength || defaultStringLength;
	const alignments = [];
	const cellMatrix = [];
	const sizeMatrix = [];
	const longestCellByColumn = [];
	let mostCellsPerRow = 0;
	let rowIndex = -1;
	while (++rowIndex < table.length) {
		const row2 = [];
		const sizes2 = [];
		let columnIndex2 = -1;
		if (table[rowIndex].length > mostCellsPerRow) mostCellsPerRow = table[rowIndex].length;
		while (++columnIndex2 < table[rowIndex].length) {
			const cell = serialize$1(table[rowIndex][columnIndex2]);
			if (settings.alignDelimiters !== false) {
				const size = stringLength(cell);
				sizes2[columnIndex2] = size;
				if (longestCellByColumn[columnIndex2] === void 0 || size > longestCellByColumn[columnIndex2]) longestCellByColumn[columnIndex2] = size;
			}
			row2.push(cell);
		}
		cellMatrix[rowIndex] = row2;
		sizeMatrix[rowIndex] = sizes2;
	}
	let columnIndex = -1;
	if (typeof align === "object" && "length" in align) while (++columnIndex < mostCellsPerRow) alignments[columnIndex] = toAlignment(align[columnIndex]);
	else {
		const code3 = toAlignment(align);
		while (++columnIndex < mostCellsPerRow) alignments[columnIndex] = code3;
	}
	columnIndex = -1;
	const row = [];
	const sizes = [];
	while (++columnIndex < mostCellsPerRow) {
		const code3 = alignments[columnIndex];
		let before = "";
		let after = "";
		if (code3 === 99) {
			before = ":";
			after = ":";
		} else if (code3 === 108) before = ":";
		else if (code3 === 114) after = ":";
		let size = settings.alignDelimiters === false ? 1 : Math.max(1, longestCellByColumn[columnIndex] - before.length - after.length);
		const cell = before + "-".repeat(size) + after;
		if (settings.alignDelimiters !== false) {
			size = before.length + size + after.length;
			if (size > longestCellByColumn[columnIndex]) longestCellByColumn[columnIndex] = size;
			sizes[columnIndex] = size;
		}
		row[columnIndex] = cell;
	}
	cellMatrix.splice(1, 0, row);
	sizeMatrix.splice(1, 0, sizes);
	rowIndex = -1;
	const lines = [];
	while (++rowIndex < cellMatrix.length) {
		const row2 = cellMatrix[rowIndex];
		const sizes2 = sizeMatrix[rowIndex];
		columnIndex = -1;
		const line = [];
		while (++columnIndex < mostCellsPerRow) {
			const cell = row2[columnIndex] || "";
			let before = "";
			let after = "";
			if (settings.alignDelimiters !== false) {
				const size = longestCellByColumn[columnIndex] - (sizes2[columnIndex] || 0);
				const code3 = alignments[columnIndex];
				if (code3 === 114) before = " ".repeat(size);
				else if (code3 === 99) {
					if (size % 2) {
						before = " ".repeat(size / 2 + .5);
						after = " ".repeat(size / 2 - .5);
					} else {
						before = " ".repeat(size / 2);
						after = before;
					}
				} else after = " ".repeat(size);
			}
			if (settings.delimiterStart !== false && !columnIndex) line.push("|");
			if (settings.padding !== false && !(settings.alignDelimiters === false && cell === "") && (settings.delimiterStart !== false || columnIndex)) line.push(" ");
			if (settings.alignDelimiters !== false) line.push(before);
			line.push(cell);
			if (settings.alignDelimiters !== false) line.push(after);
			if (settings.padding !== false) line.push(" ");
			if (settings.delimiterEnd !== false || columnIndex !== mostCellsPerRow - 1) line.push("|");
		}
		lines.push(settings.delimiterEnd === false ? line.join("").replace(/ +$/, "") : line.join(""));
	}
	return lines.join("\n");
}
function serialize$1(value) {
	return value === null || value === void 0 ? "" : String(value);
}
function toAlignment(value) {
	const code3 = typeof value === "string" ? value.codePointAt(0) : 0;
	return code3 === 67 || code3 === 99 ? 99 : code3 === 76 || code3 === 108 ? 108 : code3 === 82 || code3 === 114 ? 114 : 0;
}
function blockquote(node2, _, state, info) {
	const exit2 = state.enter("blockquote");
	const tracker = state.createTracker(info);
	tracker.move("> ");
	tracker.shift(2);
	const value = state.indentLines(state.containerFlow(node2, tracker.current()), map);
	exit2();
	return value;
}
function map(line, _, blank) {
	return ">" + (blank ? "" : " ") + line;
}
function patternInScope(stack, pattern) {
	return listInScope(stack, pattern.inConstruct, true) && !listInScope(stack, pattern.notInConstruct, false);
}
function listInScope(stack, list2, none) {
	if (typeof list2 === "string") list2 = [list2];
	if (!list2 || list2.length === 0) return none;
	let index = -1;
	while (++index < list2.length) if (stack.includes(list2[index])) return true;
	return false;
}
function hardBreak(_, _1, state, info) {
	let index = -1;
	while (++index < state.unsafe.length) if (state.unsafe[index].character === "\n" && patternInScope(state.stack, state.unsafe[index])) return /[ \t]/.test(info.before) ? "" : " ";
	return "\\\n";
}
function longestStreak(value, substring) {
	const source = String(value);
	let index = source.indexOf(substring);
	let expected = index;
	let count = 0;
	let max = 0;
	if (typeof substring !== "string") throw new TypeError("Expected substring");
	while (index !== -1) {
		if (index === expected) {
			if (++count > max) max = count;
		} else count = 1;
		expected = index + substring.length;
		index = source.indexOf(substring, expected);
	}
	return max;
}
function formatCodeAsIndented(node2, state) {
	return Boolean(state.options.fences === false && node2.value && !node2.lang && /[^ \r\n]/.test(node2.value) && !/^[\t ]*(?:[\r\n]|$)|(?:^|[\r\n])[\t ]*$/.test(node2.value));
}
function checkFence(state) {
	const marker = state.options.fence || "`";
	if (marker !== "`" && marker !== "~") throw new Error("Cannot serialize code with `" + marker + "` for `options.fence`, expected `` ` `` or `~`");
	return marker;
}
function code(node2, _, state, info) {
	const marker = checkFence(state);
	const raw = node2.value || "";
	const suffix = marker === "`" ? "GraveAccent" : "Tilde";
	if (formatCodeAsIndented(node2, state)) {
		const exit3 = state.enter("codeIndented");
		const value2 = state.indentLines(raw, map2);
		exit3();
		return value2;
	}
	const tracker = state.createTracker(info);
	const sequence = marker.repeat(Math.max(longestStreak(raw, marker) + 1, 3));
	const exit2 = state.enter("codeFenced");
	let value = tracker.move(sequence);
	if (node2.lang) {
		const subexit = state.enter(`codeFencedLang${suffix}`);
		value += tracker.move(state.safe(node2.lang, {
			before: value,
			after: " ",
			encode: ["`"],
			...tracker.current()
		}));
		subexit();
	}
	if (node2.lang && node2.meta) {
		const subexit = state.enter(`codeFencedMeta${suffix}`);
		value += tracker.move(" ");
		value += tracker.move(state.safe(node2.meta, {
			before: value,
			after: "\n",
			encode: ["`"],
			...tracker.current()
		}));
		subexit();
	}
	value += tracker.move("\n");
	if (raw) value += tracker.move(raw + "\n");
	value += tracker.move(sequence);
	exit2();
	return value;
}
function map2(line, _, blank) {
	return (blank ? "" : "    ") + line;
}
function checkQuote(state) {
	const marker = state.options.quote || "\"";
	if (marker !== "\"" && marker !== "'") throw new Error("Cannot serialize title with `" + marker + "` for `options.quote`, expected `\"`, or `'`");
	return marker;
}
function definition(node2, _, state, info) {
	const quote = checkQuote(state);
	const suffix = quote === "\"" ? "Quote" : "Apostrophe";
	const exit2 = state.enter("definition");
	let subexit = state.enter("label");
	const tracker = state.createTracker(info);
	let value = tracker.move("[");
	value += tracker.move(state.safe(state.associationId(node2), {
		before: value,
		after: "]",
		...tracker.current()
	}));
	value += tracker.move("]: ");
	subexit();
	if (!node2.url || /[\0- \u007F]/.test(node2.url)) {
		subexit = state.enter("destinationLiteral");
		value += tracker.move("<");
		value += tracker.move(state.safe(node2.url, {
			before: value,
			after: ">",
			...tracker.current()
		}));
		value += tracker.move(">");
	} else {
		subexit = state.enter("destinationRaw");
		value += tracker.move(state.safe(node2.url, {
			before: value,
			after: node2.title ? " " : "\n",
			...tracker.current()
		}));
	}
	subexit();
	if (node2.title) {
		subexit = state.enter(`title${suffix}`);
		value += tracker.move(" " + quote);
		value += tracker.move(state.safe(node2.title, {
			before: value,
			after: quote,
			...tracker.current()
		}));
		value += tracker.move(quote);
		subexit();
	}
	exit2();
	return value;
}
function checkEmphasis(state) {
	const marker = state.options.emphasis || "*";
	if (marker !== "*" && marker !== "_") throw new Error("Cannot serialize emphasis with `" + marker + "` for `options.emphasis`, expected `*`, or `_`");
	return marker;
}
function encodeCharacterReference(code3) {
	return "&#x" + code3.toString(16).toUpperCase() + ";";
}
function classifyCharacter(code3) {
	if (code3 === null || markdownLineEndingOrSpace(code3) || unicodeWhitespace(code3)) return 1;
	if (unicodePunctuation(code3)) return 2;
}
function encodeInfo(outside, inside, marker) {
	const outsideKind = classifyCharacter(outside);
	const insideKind = classifyCharacter(inside);
	if (outsideKind === void 0) return insideKind === void 0 ? marker === "_" ? {
		inside: true,
		outside: true
	} : {
		inside: false,
		outside: false
	} : insideKind === 1 ? {
		inside: true,
		outside: true
	} : {
		inside: false,
		outside: true
	};
	if (outsideKind === 1) return insideKind === void 0 ? {
		inside: false,
		outside: false
	} : insideKind === 1 ? {
		inside: true,
		outside: true
	} : {
		inside: false,
		outside: false
	};
	return insideKind === void 0 ? {
		inside: false,
		outside: false
	} : insideKind === 1 ? {
		inside: true,
		outside: false
	} : {
		inside: false,
		outside: false
	};
}
emphasis.peek = emphasisPeek;
function emphasis(node2, _, state, info) {
	const marker = checkEmphasis(state);
	const exit2 = state.enter("emphasis");
	const tracker = state.createTracker(info);
	const before = tracker.move(marker);
	let between = tracker.move(state.containerPhrasing(node2, {
		after: marker,
		before,
		...tracker.current()
	}));
	const betweenHead = between.charCodeAt(0);
	const open = encodeInfo(info.before.charCodeAt(info.before.length - 1), betweenHead, marker);
	if (open.inside) between = encodeCharacterReference(betweenHead) + between.slice(1);
	const betweenTail = between.charCodeAt(between.length - 1);
	const close = encodeInfo(info.after.charCodeAt(0), betweenTail, marker);
	if (close.inside) between = between.slice(0, -1) + encodeCharacterReference(betweenTail);
	const after = tracker.move(marker);
	exit2();
	state.attentionEncodeSurroundingInfo = {
		after: close.outside,
		before: open.outside
	};
	return before + between + after;
}
function emphasisPeek(_, _1, state) {
	return state.options.emphasis || "*";
}
function visit(tree, testOrVisitor, visitorOrReverse, maybeReverse) {
	let reverse;
	let test;
	let visitor;
	if (typeof testOrVisitor === "function" && typeof visitorOrReverse !== "function") {
		test = void 0;
		visitor = testOrVisitor;
		reverse = visitorOrReverse;
	} else {
		test = testOrVisitor;
		visitor = visitorOrReverse;
		reverse = maybeReverse;
	}
	visitParents(tree, test, overload, reverse);
	function overload(node2, parents) {
		const parent = parents[parents.length - 1];
		const index = parent ? parent.children.indexOf(node2) : void 0;
		return visitor(node2, index, parent);
	}
}
var emptyOptions = {};
function toString$1(value, options) {
	const settings = options || emptyOptions;
	return one(value, typeof settings.includeImageAlt === "boolean" ? settings.includeImageAlt : true, typeof settings.includeHtml === "boolean" ? settings.includeHtml : true);
}
function one(value, includeImageAlt, includeHtml) {
	if (node(value)) {
		if ("value" in value) return value.type === "html" && !includeHtml ? "" : value.value;
		if (includeImageAlt && "alt" in value && value.alt) return value.alt;
		if ("children" in value) return all(value.children, includeImageAlt, includeHtml);
	}
	if (Array.isArray(value)) return all(value, includeImageAlt, includeHtml);
	return "";
}
function all(values, includeImageAlt, includeHtml) {
	const result = [];
	let index = -1;
	while (++index < values.length) result[index] = one(values[index], includeImageAlt, includeHtml);
	return result.join("");
}
function node(value) {
	return Boolean(value && typeof value === "object");
}
function formatHeadingAsSetext(node2, state) {
	let literalWithBreak = false;
	visit(node2, function(node3) {
		if ("value" in node3 && /\r?\n|\r/.test(node3.value) || node3.type === "break") {
			literalWithBreak = true;
			return EXIT;
		}
	});
	return Boolean((!node2.depth || node2.depth < 3) && toString$1(node2) && (state.options.setext || literalWithBreak));
}
function heading(node2, _, state, info) {
	const rank = Math.max(Math.min(6, node2.depth || 1), 1);
	const tracker = state.createTracker(info);
	if (formatHeadingAsSetext(node2, state)) {
		const exit3 = state.enter("headingSetext");
		const subexit2 = state.enter("phrasing");
		const value2 = state.containerPhrasing(node2, {
			...tracker.current(),
			before: "\n",
			after: "\n"
		});
		subexit2();
		exit3();
		return value2 + "\n" + (rank === 1 ? "=" : "-").repeat(value2.length - (Math.max(value2.lastIndexOf("\r"), value2.lastIndexOf("\n")) + 1));
	}
	const sequence = "#".repeat(rank);
	const exit2 = state.enter("headingAtx");
	const subexit = state.enter("phrasing");
	tracker.move(sequence + " ");
	let value = state.containerPhrasing(node2, {
		before: "# ",
		after: "\n",
		...tracker.current()
	});
	if (/^[\t ]/.test(value)) value = encodeCharacterReference(value.charCodeAt(0)) + value.slice(1);
	value = value ? sequence + " " + value : sequence;
	if (state.options.closeAtx) value += " " + sequence;
	subexit();
	exit2();
	return value;
}
html.peek = htmlPeek;
function html(node2) {
	return node2.value || "";
}
function htmlPeek() {
	return "<";
}
image.peek = imagePeek;
function image(node2, _, state, info) {
	const quote = checkQuote(state);
	const suffix = quote === "\"" ? "Quote" : "Apostrophe";
	const exit2 = state.enter("image");
	let subexit = state.enter("label");
	const tracker = state.createTracker(info);
	let value = tracker.move("![");
	value += tracker.move(state.safe(node2.alt, {
		before: value,
		after: "]",
		...tracker.current()
	}));
	value += tracker.move("](");
	subexit();
	if (!node2.url && node2.title || /[\0- \u007F]/.test(node2.url)) {
		subexit = state.enter("destinationLiteral");
		value += tracker.move("<");
		value += tracker.move(state.safe(node2.url, {
			before: value,
			after: ">",
			...tracker.current()
		}));
		value += tracker.move(">");
	} else {
		subexit = state.enter("destinationRaw");
		value += tracker.move(state.safe(node2.url, {
			before: value,
			after: node2.title ? " " : ")",
			...tracker.current()
		}));
	}
	subexit();
	if (node2.title) {
		subexit = state.enter(`title${suffix}`);
		value += tracker.move(" " + quote);
		value += tracker.move(state.safe(node2.title, {
			before: value,
			after: quote,
			...tracker.current()
		}));
		value += tracker.move(quote);
		subexit();
	}
	value += tracker.move(")");
	exit2();
	return value;
}
function imagePeek() {
	return "!";
}
imageReference.peek = imageReferencePeek;
function imageReference(node2, _, state, info) {
	const type = node2.referenceType;
	const exit2 = state.enter("imageReference");
	let subexit = state.enter("label");
	const tracker = state.createTracker(info);
	let value = tracker.move("![");
	const alt = state.safe(node2.alt, {
		before: value,
		after: "]",
		...tracker.current()
	});
	value += tracker.move(alt + "][");
	subexit();
	const stack = state.stack;
	state.stack = [];
	subexit = state.enter("reference");
	const reference = state.safe(state.associationId(node2), {
		before: value,
		after: "]",
		...tracker.current()
	});
	subexit();
	state.stack = stack;
	exit2();
	if (type === "full" || !alt || alt !== reference) value += tracker.move(reference + "]");
	else if (type === "shortcut") value = value.slice(0, -1);
	else value += tracker.move("]");
	return value;
}
function imageReferencePeek() {
	return "!";
}
inlineCode.peek = inlineCodePeek;
function inlineCode(node2, _, state) {
	let value = node2.value || "";
	let sequence = "`";
	let index = -1;
	while (new RegExp("(^|[^`])" + sequence + "([^`]|$)").test(value)) sequence += "`";
	if (/[^ \r\n]/.test(value) && (/^[ \r\n]/.test(value) && /[ \r\n]$/.test(value) || /^`|`$/.test(value))) value = " " + value + " ";
	while (++index < state.unsafe.length) {
		const pattern = state.unsafe[index];
		const expression = state.compilePattern(pattern);
		let match;
		if (!pattern.atBreak) continue;
		while (match = expression.exec(value)) {
			let position = match.index;
			if (value.charCodeAt(position) === 10 && value.charCodeAt(position - 1) === 13) position--;
			value = value.slice(0, position) + " " + value.slice(match.index + 1);
		}
	}
	return sequence + value + sequence;
}
function inlineCodePeek() {
	return "`";
}
function formatLinkAsAutolink(node2, state) {
	const raw = toString$1(node2);
	return Boolean(!state.options.resourceLink && node2.url && !node2.title && node2.children && node2.children.length === 1 && node2.children[0].type === "text" && (raw === node2.url || "mailto:" + raw === node2.url) && /^[a-z][a-z+.-]+:/i.test(node2.url) && !/[\0- <>\u007F]/.test(node2.url));
}
link.peek = linkPeek;
function link(node2, _, state, info) {
	const quote = checkQuote(state);
	const suffix = quote === "\"" ? "Quote" : "Apostrophe";
	const tracker = state.createTracker(info);
	let exit2;
	let subexit;
	if (formatLinkAsAutolink(node2, state)) {
		const stack = state.stack;
		state.stack = [];
		exit2 = state.enter("autolink");
		let value2 = tracker.move("<");
		value2 += tracker.move(state.containerPhrasing(node2, {
			before: value2,
			after: ">",
			...tracker.current()
		}));
		value2 += tracker.move(">");
		exit2();
		state.stack = stack;
		return value2;
	}
	exit2 = state.enter("link");
	subexit = state.enter("label");
	let value = tracker.move("[");
	value += tracker.move(state.containerPhrasing(node2, {
		before: value,
		after: "](",
		...tracker.current()
	}));
	value += tracker.move("](");
	subexit();
	if (!node2.url && node2.title || /[\0- \u007F]/.test(node2.url)) {
		subexit = state.enter("destinationLiteral");
		value += tracker.move("<");
		value += tracker.move(state.safe(node2.url, {
			before: value,
			after: ">",
			...tracker.current()
		}));
		value += tracker.move(">");
	} else {
		subexit = state.enter("destinationRaw");
		value += tracker.move(state.safe(node2.url, {
			before: value,
			after: node2.title ? " " : ")",
			...tracker.current()
		}));
	}
	subexit();
	if (node2.title) {
		subexit = state.enter(`title${suffix}`);
		value += tracker.move(" " + quote);
		value += tracker.move(state.safe(node2.title, {
			before: value,
			after: quote,
			...tracker.current()
		}));
		value += tracker.move(quote);
		subexit();
	}
	value += tracker.move(")");
	exit2();
	return value;
}
function linkPeek(node2, _, state) {
	return formatLinkAsAutolink(node2, state) ? "<" : "[";
}
linkReference.peek = linkReferencePeek;
function linkReference(node2, _, state, info) {
	const type = node2.referenceType;
	const exit2 = state.enter("linkReference");
	let subexit = state.enter("label");
	const tracker = state.createTracker(info);
	let value = tracker.move("[");
	const text3 = state.containerPhrasing(node2, {
		before: value,
		after: "]",
		...tracker.current()
	});
	value += tracker.move(text3 + "][");
	subexit();
	const stack = state.stack;
	state.stack = [];
	subexit = state.enter("reference");
	const reference = state.safe(state.associationId(node2), {
		before: value,
		after: "]",
		...tracker.current()
	});
	subexit();
	state.stack = stack;
	exit2();
	if (type === "full" || !text3 || text3 !== reference) value += tracker.move(reference + "]");
	else if (type === "shortcut") value = value.slice(0, -1);
	else value += tracker.move("]");
	return value;
}
function linkReferencePeek() {
	return "[";
}
function checkBullet(state) {
	const marker = state.options.bullet || "*";
	if (marker !== "*" && marker !== "+" && marker !== "-") throw new Error("Cannot serialize items with `" + marker + "` for `options.bullet`, expected `*`, `+`, or `-`");
	return marker;
}
function checkBulletOther(state) {
	const bullet = checkBullet(state);
	const bulletOther = state.options.bulletOther;
	if (!bulletOther) return bullet === "*" ? "-" : "*";
	if (bulletOther !== "*" && bulletOther !== "+" && bulletOther !== "-") throw new Error("Cannot serialize items with `" + bulletOther + "` for `options.bulletOther`, expected `*`, `+`, or `-`");
	if (bulletOther === bullet) throw new Error("Expected `bullet` (`" + bullet + "`) and `bulletOther` (`" + bulletOther + "`) to be different");
	return bulletOther;
}
function checkBulletOrdered(state) {
	const marker = state.options.bulletOrdered || ".";
	if (marker !== "." && marker !== ")") throw new Error("Cannot serialize items with `" + marker + "` for `options.bulletOrdered`, expected `.` or `)`");
	return marker;
}
function checkRule(state) {
	const marker = state.options.rule || "*";
	if (marker !== "*" && marker !== "-" && marker !== "_") throw new Error("Cannot serialize rules with `" + marker + "` for `options.rule`, expected `*`, `-`, or `_`");
	return marker;
}
function list(node2, parent, state, info) {
	const exit2 = state.enter("list");
	const bulletCurrent = state.bulletCurrent;
	let bullet = node2.ordered ? checkBulletOrdered(state) : checkBullet(state);
	const bulletOther = node2.ordered ? bullet === "." ? ")" : "." : checkBulletOther(state);
	let useDifferentMarker = parent && state.bulletLastUsed ? bullet === state.bulletLastUsed : false;
	if (!node2.ordered) {
		const firstListItem = node2.children ? node2.children[0] : void 0;
		if ((bullet === "*" || bullet === "-") && firstListItem && (!firstListItem.children || !firstListItem.children[0]) && state.stack[state.stack.length - 1] === "list" && state.stack[state.stack.length - 2] === "listItem" && state.stack[state.stack.length - 3] === "list" && state.stack[state.stack.length - 4] === "listItem" && state.indexStack[state.indexStack.length - 1] === 0 && state.indexStack[state.indexStack.length - 2] === 0 && state.indexStack[state.indexStack.length - 3] === 0) useDifferentMarker = true;
		if (checkRule(state) === bullet && firstListItem) {
			let index = -1;
			while (++index < node2.children.length) {
				const item = node2.children[index];
				if (item && item.type === "listItem" && item.children && item.children[0] && item.children[0].type === "thematicBreak") {
					useDifferentMarker = true;
					break;
				}
			}
		}
	}
	if (useDifferentMarker) bullet = bulletOther;
	state.bulletCurrent = bullet;
	const value = state.containerFlow(node2, info);
	state.bulletLastUsed = bullet;
	state.bulletCurrent = bulletCurrent;
	exit2();
	return value;
}
function checkListItemIndent(state) {
	const style = state.options.listItemIndent || "one";
	if (style !== "tab" && style !== "one" && style !== "mixed") throw new Error("Cannot serialize items with `" + style + "` for `options.listItemIndent`, expected `tab`, `one`, or `mixed`");
	return style;
}
function listItem(node2, parent, state, info) {
	const listItemIndent = checkListItemIndent(state);
	let bullet = state.bulletCurrent || checkBullet(state);
	if (parent && parent.type === "list" && parent.ordered) bullet = (typeof parent.start === "number" && parent.start > -1 ? parent.start : 1) + (state.options.incrementListMarker === false ? 0 : parent.children.indexOf(node2)) + bullet;
	let size = bullet.length + 1;
	if (listItemIndent === "tab" || listItemIndent === "mixed" && (parent && parent.type === "list" && parent.spread || node2.spread)) size = Math.ceil(size / 4) * 4;
	const tracker = state.createTracker(info);
	tracker.move(bullet + " ".repeat(size - bullet.length));
	tracker.shift(size);
	const exit2 = state.enter("listItem");
	const value = state.indentLines(state.containerFlow(node2, tracker.current()), map3);
	exit2();
	return value;
	function map3(line, index, blank) {
		if (index) return (blank ? "" : " ".repeat(size)) + line;
		return (blank ? bullet : bullet + " ".repeat(size - bullet.length)) + line;
	}
}
function paragraph(node2, _, state, info) {
	const exit2 = state.enter("paragraph");
	const subexit = state.enter("phrasing");
	const value = state.containerPhrasing(node2, info);
	subexit();
	exit2();
	return value;
}
var phrasing = convert([
	"break",
	"delete",
	"emphasis",
	"footnote",
	"footnoteReference",
	"image",
	"imageReference",
	"inlineCode",
	"inlineMath",
	"link",
	"linkReference",
	"mdxJsxTextElement",
	"mdxTextExpression",
	"strong",
	"text",
	"textDirective"
]);
function root$11(node2, _, state, info) {
	return (node2.children.some(function(d) {
		return phrasing(d);
	}) ? state.containerPhrasing : state.containerFlow).call(state, node2, info);
}
function checkStrong(state) {
	const marker = state.options.strong || "*";
	if (marker !== "*" && marker !== "_") throw new Error("Cannot serialize strong with `" + marker + "` for `options.strong`, expected `*`, or `_`");
	return marker;
}
strong.peek = strongPeek;
function strong(node2, _, state, info) {
	const marker = checkStrong(state);
	const exit2 = state.enter("strong");
	const tracker = state.createTracker(info);
	const before = tracker.move(marker + marker);
	let between = tracker.move(state.containerPhrasing(node2, {
		after: marker,
		before,
		...tracker.current()
	}));
	const betweenHead = between.charCodeAt(0);
	const open = encodeInfo(info.before.charCodeAt(info.before.length - 1), betweenHead, marker);
	if (open.inside) between = encodeCharacterReference(betweenHead) + between.slice(1);
	const betweenTail = between.charCodeAt(between.length - 1);
	const close = encodeInfo(info.after.charCodeAt(0), betweenTail, marker);
	if (close.inside) between = between.slice(0, -1) + encodeCharacterReference(betweenTail);
	const after = tracker.move(marker + marker);
	exit2();
	state.attentionEncodeSurroundingInfo = {
		after: close.outside,
		before: open.outside
	};
	return before + between + after;
}
function strongPeek(_, _1, state) {
	return state.options.strong || "*";
}
function text$1(node2, _, state, info) {
	return state.safe(node2.value, info);
}
function checkRuleRepetition(state) {
	const repetition = state.options.ruleRepetition || 3;
	if (repetition < 3) throw new Error("Cannot serialize rules with repetition `" + repetition + "` for `options.ruleRepetition`, expected `3` or more");
	return repetition;
}
function thematicBreak(_, _1, state) {
	const value = (checkRule(state) + (state.options.ruleSpaces ? " " : "")).repeat(checkRuleRepetition(state));
	return state.options.ruleSpaces ? value.slice(0, -1) : value;
}
var handle = {
	blockquote,
	break: hardBreak,
	code,
	definition,
	emphasis,
	hardBreak,
	heading,
	html,
	image,
	imageReference,
	inlineCode,
	link,
	linkReference,
	list,
	listItem,
	paragraph,
	root: root$11,
	strong,
	text: text$1,
	thematicBreak
};
function gfmTableFromMarkdown() {
	return {
		enter: {
			table: enterTable,
			tableData: enterCell,
			tableHeader: enterCell,
			tableRow: enterRow
		},
		exit: {
			codeText: exitCodeText,
			table: exitTable,
			tableData: exit,
			tableHeader: exit,
			tableRow: exit
		}
	};
}
function enterTable(token) {
	const align = token._align;
	this.enter({
		type: "table",
		align: align.map(function(d) {
			return d === "none" ? null : d;
		}),
		children: []
	}, token);
	this.data.inTable = true;
}
function exitTable(token) {
	this.exit(token);
	this.data.inTable = void 0;
}
function enterRow(token) {
	this.enter({
		type: "tableRow",
		children: []
	}, token);
}
function exit(token) {
	this.exit(token);
}
function enterCell(token) {
	this.enter({
		type: "tableCell",
		children: []
	}, token);
}
function exitCodeText(token) {
	let value = this.resume();
	if (this.data.inTable) value = value.replace(/\\([\\|])/g, replace);
	const node2 = this.stack[this.stack.length - 1];
	node2.type;
	node2.value = value;
	this.exit(token);
}
function replace($0, $1) {
	return $1 === "|" ? $1 : $0;
}
function gfmTableToMarkdown(options) {
	const settings = options || {};
	const padding = settings.tableCellPadding;
	const alignDelimiters = settings.tablePipeAlign;
	const stringLength = settings.stringLength;
	const around = padding ? " " : "|";
	return {
		unsafe: [
			{
				character: "\r",
				inConstruct: "tableCell"
			},
			{
				character: "\n",
				inConstruct: "tableCell"
			},
			{
				atBreak: true,
				character: "|",
				after: "[	 :-]"
			},
			{
				character: "|",
				inConstruct: "tableCell"
			},
			{
				atBreak: true,
				character: ":",
				after: "-"
			},
			{
				atBreak: true,
				character: "-",
				after: "[:|-]"
			}
		],
		handlers: {
			inlineCode: inlineCodeWithTable,
			table: handleTable,
			tableCell: handleTableCell,
			tableRow: handleTableRow
		}
	};
	function handleTable(node2, _, state, info) {
		return serializeData(handleTableAsData(node2, state, info), node2.align);
	}
	function handleTableRow(node2, _, state, info) {
		const value = serializeData([handleTableRowAsData(node2, state, info)]);
		return value.slice(0, value.indexOf("\n"));
	}
	function handleTableCell(node2, _, state, info) {
		const exit2 = state.enter("tableCell");
		const subexit = state.enter("phrasing");
		const value = state.containerPhrasing(node2, {
			...info,
			before: around,
			after: around
		});
		subexit();
		exit2();
		return value;
	}
	function serializeData(matrix, align) {
		return markdownTable(matrix, {
			align,
			alignDelimiters,
			padding,
			stringLength
		});
	}
	function handleTableAsData(node2, state, info) {
		const children = node2.children;
		let index = -1;
		const result = [];
		const subexit = state.enter("table");
		while (++index < children.length) result[index] = handleTableRowAsData(children[index], state, info);
		subexit();
		return result;
	}
	function handleTableRowAsData(node2, state, info) {
		const children = node2.children;
		let index = -1;
		const result = [];
		const subexit = state.enter("tableRow");
		while (++index < children.length) result[index] = handleTableCell(children[index], node2, state, info);
		subexit();
		return result;
	}
	function inlineCodeWithTable(node2, parent, state) {
		let value = handle.inlineCode(node2, parent, state);
		if (state.stack.includes("tableCell")) value = value.replace(/\|/g, "\\$&");
		return value;
	}
}
function gfmTaskListItemFromMarkdown() {
	return { exit: {
		taskListCheckValueChecked: exitCheck,
		taskListCheckValueUnchecked: exitCheck,
		paragraph: exitParagraphWithTaskListItem
	} };
}
function gfmTaskListItemToMarkdown() {
	return {
		unsafe: [{
			atBreak: true,
			character: "-",
			after: "[:|-]"
		}],
		handlers: { listItem: listItemWithTaskListItem }
	};
}
function exitCheck(token) {
	const node2 = this.stack[this.stack.length - 2];
	node2.type;
	node2.checked = token.type === "taskListCheckValueChecked";
}
function exitParagraphWithTaskListItem(token) {
	const parent = this.stack[this.stack.length - 2];
	if (parent && parent.type === "listItem" && typeof parent.checked === "boolean") {
		const node2 = this.stack[this.stack.length - 1];
		node2.type;
		const head = node2.children[0];
		if (head && head.type === "text") {
			const siblings = parent.children;
			let index = -1;
			let firstParaghraph;
			while (++index < siblings.length) {
				const sibling = siblings[index];
				if (sibling.type === "paragraph") {
					firstParaghraph = sibling;
					break;
				}
			}
			if (firstParaghraph === node2) {
				head.value = head.value.slice(1);
				if (head.value.length === 0) node2.children.shift();
				else if (node2.position && head.position && typeof head.position.start.offset === "number") {
					head.position.start.column++;
					head.position.start.offset++;
					node2.position.start = Object.assign({}, head.position.start);
				}
			}
		}
	}
	this.exit(token);
}
function listItemWithTaskListItem(node2, parent, state, info) {
	const head = node2.children[0];
	const checkable = typeof node2.checked === "boolean" && head && head.type === "paragraph";
	const checkbox = "[" + (node2.checked ? "x" : " ") + "] ";
	const tracker = state.createTracker(info);
	if (checkable) tracker.move(checkbox);
	let value = handle.listItem(node2, parent, state, {
		...info,
		...tracker.current()
	});
	if (checkable) value = value.replace(/^(?:[*+-]|\d+\.)([\r\n]| {1,3})/, check);
	return value;
	function check($0) {
		return $0 + checkbox;
	}
}
function gfmFromMarkdown() {
	return [
		gfmAutolinkLiteralFromMarkdown(),
		gfmFootnoteFromMarkdown(),
		gfmStrikethroughFromMarkdown(),
		gfmTableFromMarkdown(),
		gfmTaskListItemFromMarkdown()
	];
}
function gfmToMarkdown(options) {
	return { extensions: [
		gfmAutolinkLiteralToMarkdown(),
		gfmFootnoteToMarkdown(options),
		gfmStrikethroughToMarkdown(),
		gfmTableToMarkdown(options),
		gfmTaskListItemToMarkdown()
	] };
}
function splice(list2, start, remove, items) {
	const end = list2.length;
	let chunkStart = 0;
	let parameters;
	if (start < 0) start = -start > end ? 0 : end + start;
	else start = start > end ? end : start;
	remove = remove > 0 ? remove : 0;
	if (items.length < 1e4) {
		parameters = Array.from(items);
		parameters.unshift(start, remove);
		list2.splice(...parameters);
	} else {
		if (remove) list2.splice(start, remove);
		while (chunkStart < items.length) {
			parameters = items.slice(chunkStart, chunkStart + 1e4);
			parameters.unshift(start, 0);
			list2.splice(...parameters);
			chunkStart += 1e4;
			start += 1e4;
		}
	}
}
var hasOwnProperty = {}.hasOwnProperty;
function combineExtensions(extensions) {
	const all2 = {};
	let index = -1;
	while (++index < extensions.length) syntaxExtension(all2, extensions[index]);
	return all2;
}
function syntaxExtension(all2, extension) {
	let hook;
	for (hook in extension) {
		const left = (hasOwnProperty.call(all2, hook) ? all2[hook] : void 0) || (all2[hook] = {});
		const right = extension[hook];
		let code3;
		if (right) for (code3 in right) {
			if (!hasOwnProperty.call(left, code3)) left[code3] = [];
			const value = right[code3];
			constructs(left[code3], Array.isArray(value) ? value : value ? [value] : []);
		}
	}
}
function constructs(existing, list2) {
	let index = -1;
	const before = [];
	while (++index < list2.length) (list2[index].add === "after" ? existing : before).push(list2[index]);
	splice(existing, 0, 0, before);
}
var wwwPrefix = {
	tokenize: tokenizeWwwPrefix,
	partial: true
};
var domain = {
	tokenize: tokenizeDomain,
	partial: true
};
var path$2 = {
	tokenize: tokenizePath,
	partial: true
};
var trail = {
	tokenize: tokenizeTrail,
	partial: true
};
var emailDomainDotTrail = {
	tokenize: tokenizeEmailDomainDotTrail,
	partial: true
};
var wwwAutolink = {
	name: "wwwAutolink",
	tokenize: tokenizeWwwAutolink,
	previous: previousWww
};
var protocolAutolink = {
	name: "protocolAutolink",
	tokenize: tokenizeProtocolAutolink,
	previous: previousProtocol
};
var emailAutolink = {
	name: "emailAutolink",
	tokenize: tokenizeEmailAutolink,
	previous: previousEmail
};
var text2 = {};
function gfmAutolinkLiteral() {
	return { text: text2 };
}
var code2 = 48;
while (code2 < 123) {
	text2[code2] = emailAutolink;
	code2++;
	if (code2 === 58) code2 = 65;
	else if (code2 === 91) code2 = 97;
}
text2[43] = emailAutolink;
text2[45] = emailAutolink;
text2[46] = emailAutolink;
text2[95] = emailAutolink;
text2[72] = [emailAutolink, protocolAutolink];
text2[104] = [emailAutolink, protocolAutolink];
text2[87] = [emailAutolink, wwwAutolink];
text2[119] = [emailAutolink, wwwAutolink];
function tokenizeEmailAutolink(effects, ok3, nok) {
	const self = this;
	let dot;
	let data;
	return start;
	function start(code3) {
		if (!gfmAtext(code3) || !previousEmail.call(self, self.previous) || previousUnbalanced(self.events)) return nok(code3);
		effects.enter("literalAutolink");
		effects.enter("literalAutolinkEmail");
		return atext(code3);
	}
	function atext(code3) {
		if (gfmAtext(code3)) {
			effects.consume(code3);
			return atext;
		}
		if (code3 === 64) {
			effects.consume(code3);
			return emailDomain;
		}
		return nok(code3);
	}
	function emailDomain(code3) {
		if (code3 === 46) return effects.check(emailDomainDotTrail, emailDomainAfter, emailDomainDot)(code3);
		if (code3 === 45 || code3 === 95 || asciiAlphanumeric(code3)) {
			data = true;
			effects.consume(code3);
			return emailDomain;
		}
		return emailDomainAfter(code3);
	}
	function emailDomainDot(code3) {
		effects.consume(code3);
		dot = true;
		return emailDomain;
	}
	function emailDomainAfter(code3) {
		if (data && dot && asciiAlpha(self.previous)) {
			effects.exit("literalAutolinkEmail");
			effects.exit("literalAutolink");
			return ok3(code3);
		}
		return nok(code3);
	}
}
function tokenizeWwwAutolink(effects, ok3, nok) {
	const self = this;
	return wwwStart;
	function wwwStart(code3) {
		if (code3 !== 87 && code3 !== 119 || !previousWww.call(self, self.previous) || previousUnbalanced(self.events)) return nok(code3);
		effects.enter("literalAutolink");
		effects.enter("literalAutolinkWww");
		return effects.check(wwwPrefix, effects.attempt(domain, effects.attempt(path$2, wwwAfter), nok), nok)(code3);
	}
	function wwwAfter(code3) {
		effects.exit("literalAutolinkWww");
		effects.exit("literalAutolink");
		return ok3(code3);
	}
}
function tokenizeProtocolAutolink(effects, ok3, nok) {
	const self = this;
	let buffer = "";
	let seen = false;
	return protocolStart;
	function protocolStart(code3) {
		if ((code3 === 72 || code3 === 104) && previousProtocol.call(self, self.previous) && !previousUnbalanced(self.events)) {
			effects.enter("literalAutolink");
			effects.enter("literalAutolinkHttp");
			buffer += String.fromCodePoint(code3);
			effects.consume(code3);
			return protocolPrefixInside;
		}
		return nok(code3);
	}
	function protocolPrefixInside(code3) {
		if (asciiAlpha(code3) && buffer.length < 5) {
			buffer += String.fromCodePoint(code3);
			effects.consume(code3);
			return protocolPrefixInside;
		}
		if (code3 === 58) {
			const protocol = buffer.toLowerCase();
			if (protocol === "http" || protocol === "https") {
				effects.consume(code3);
				return protocolSlashesInside;
			}
		}
		return nok(code3);
	}
	function protocolSlashesInside(code3) {
		if (code3 === 47) {
			effects.consume(code3);
			if (seen) return afterProtocol;
			seen = true;
			return protocolSlashesInside;
		}
		return nok(code3);
	}
	function afterProtocol(code3) {
		return code3 === null || asciiControl(code3) || markdownLineEndingOrSpace(code3) || unicodeWhitespace(code3) || unicodePunctuation(code3) ? nok(code3) : effects.attempt(domain, effects.attempt(path$2, protocolAfter), nok)(code3);
	}
	function protocolAfter(code3) {
		effects.exit("literalAutolinkHttp");
		effects.exit("literalAutolink");
		return ok3(code3);
	}
}
function tokenizeWwwPrefix(effects, ok3, nok) {
	let size = 0;
	return wwwPrefixInside;
	function wwwPrefixInside(code3) {
		if ((code3 === 87 || code3 === 119) && size < 3) {
			size++;
			effects.consume(code3);
			return wwwPrefixInside;
		}
		if (code3 === 46 && size === 3) {
			effects.consume(code3);
			return wwwPrefixAfter;
		}
		return nok(code3);
	}
	function wwwPrefixAfter(code3) {
		return code3 === null ? nok(code3) : ok3(code3);
	}
}
function tokenizeDomain(effects, ok3, nok) {
	let underscoreInLastSegment;
	let underscoreInLastLastSegment;
	let seen;
	return domainInside;
	function domainInside(code3) {
		if (code3 === 46 || code3 === 95) return effects.check(trail, domainAfter, domainAtPunctuation)(code3);
		if (code3 === null || markdownLineEndingOrSpace(code3) || unicodeWhitespace(code3) || code3 !== 45 && unicodePunctuation(code3)) return domainAfter(code3);
		seen = true;
		effects.consume(code3);
		return domainInside;
	}
	function domainAtPunctuation(code3) {
		if (code3 === 95) underscoreInLastSegment = true;
		else {
			underscoreInLastLastSegment = underscoreInLastSegment;
			underscoreInLastSegment = void 0;
		}
		effects.consume(code3);
		return domainInside;
	}
	function domainAfter(code3) {
		if (underscoreInLastLastSegment || underscoreInLastSegment || !seen) return nok(code3);
		return ok3(code3);
	}
}
function tokenizePath(effects, ok3) {
	let sizeOpen = 0;
	let sizeClose = 0;
	return pathInside;
	function pathInside(code3) {
		if (code3 === 40) {
			sizeOpen++;
			effects.consume(code3);
			return pathInside;
		}
		if (code3 === 41 && sizeClose < sizeOpen) return pathAtPunctuation(code3);
		if (code3 === 33 || code3 === 34 || code3 === 38 || code3 === 39 || code3 === 41 || code3 === 42 || code3 === 44 || code3 === 46 || code3 === 58 || code3 === 59 || code3 === 60 || code3 === 63 || code3 === 93 || code3 === 95 || code3 === 126) return effects.check(trail, ok3, pathAtPunctuation)(code3);
		if (code3 === null || markdownLineEndingOrSpace(code3) || unicodeWhitespace(code3)) return ok3(code3);
		effects.consume(code3);
		return pathInside;
	}
	function pathAtPunctuation(code3) {
		if (code3 === 41) sizeClose++;
		effects.consume(code3);
		return pathInside;
	}
}
function tokenizeTrail(effects, ok3, nok) {
	return trail2;
	function trail2(code3) {
		if (code3 === 33 || code3 === 34 || code3 === 39 || code3 === 41 || code3 === 42 || code3 === 44 || code3 === 46 || code3 === 58 || code3 === 59 || code3 === 63 || code3 === 95 || code3 === 126) {
			effects.consume(code3);
			return trail2;
		}
		if (code3 === 38) {
			effects.consume(code3);
			return trailCharacterReferenceStart;
		}
		if (code3 === 93) {
			effects.consume(code3);
			return trailBracketAfter;
		}
		if (code3 === 60 || code3 === null || markdownLineEndingOrSpace(code3) || unicodeWhitespace(code3)) return ok3(code3);
		return nok(code3);
	}
	function trailBracketAfter(code3) {
		if (code3 === null || code3 === 40 || code3 === 91 || markdownLineEndingOrSpace(code3) || unicodeWhitespace(code3)) return ok3(code3);
		return trail2(code3);
	}
	function trailCharacterReferenceStart(code3) {
		return asciiAlpha(code3) ? trailCharacterReferenceInside(code3) : nok(code3);
	}
	function trailCharacterReferenceInside(code3) {
		if (code3 === 59) {
			effects.consume(code3);
			return trail2;
		}
		if (asciiAlpha(code3)) {
			effects.consume(code3);
			return trailCharacterReferenceInside;
		}
		return nok(code3);
	}
}
function tokenizeEmailDomainDotTrail(effects, ok3, nok) {
	return start;
	function start(code3) {
		effects.consume(code3);
		return after;
	}
	function after(code3) {
		return asciiAlphanumeric(code3) ? nok(code3) : ok3(code3);
	}
}
function previousWww(code3) {
	return code3 === null || code3 === 40 || code3 === 42 || code3 === 95 || code3 === 91 || code3 === 93 || code3 === 126 || markdownLineEndingOrSpace(code3);
}
function previousProtocol(code3) {
	return !asciiAlpha(code3);
}
function previousEmail(code3) {
	return !(code3 === 47 || gfmAtext(code3));
}
function gfmAtext(code3) {
	return code3 === 43 || code3 === 45 || code3 === 46 || code3 === 95 || asciiAlphanumeric(code3);
}
function previousUnbalanced(events) {
	let index = events.length;
	let result = false;
	while (index--) {
		const token = events[index][1];
		if ((token.type === "labelLink" || token.type === "labelImage") && !token._balanced) {
			result = true;
			break;
		}
		if (token._gfmAutolinkLiteralWalkedInto) {
			result = false;
			break;
		}
	}
	if (events.length > 0 && !result) events[events.length - 1][1]._gfmAutolinkLiteralWalkedInto = true;
	return result;
}
function resolveAll(constructs2, events, context) {
	const called = [];
	let index = -1;
	while (++index < constructs2.length) {
		const resolve = constructs2[index].resolveAll;
		if (resolve && !called.includes(resolve)) {
			events = resolve(events, context);
			called.push(resolve);
		}
	}
	return events;
}
function factorySpace(effects, ok3, type, max) {
	const limit = max ? max - 1 : Number.POSITIVE_INFINITY;
	let size = 0;
	return start;
	function start(code3) {
		if (markdownSpace(code3)) {
			effects.enter(type);
			return prefix(code3);
		}
		return ok3(code3);
	}
	function prefix(code3) {
		if (markdownSpace(code3) && size++ < limit) {
			effects.consume(code3);
			return prefix;
		}
		effects.exit(type);
		return ok3(code3);
	}
}
var blankLine = {
	partial: true,
	tokenize: tokenizeBlankLine
};
function tokenizeBlankLine(effects, ok3, nok) {
	return start;
	function start(code3) {
		return markdownSpace(code3) ? factorySpace(effects, after, "linePrefix")(code3) : after(code3);
	}
	function after(code3) {
		return code3 === null || markdownLineEnding(code3) ? ok3(code3) : nok(code3);
	}
}
var indent = {
	tokenize: tokenizeIndent,
	partial: true
};
function gfmFootnote() {
	return {
		document: { [91]: {
			name: "gfmFootnoteDefinition",
			tokenize: tokenizeDefinitionStart,
			continuation: { tokenize: tokenizeDefinitionContinuation },
			exit: gfmFootnoteDefinitionEnd
		} },
		text: {
			[91]: {
				name: "gfmFootnoteCall",
				tokenize: tokenizeGfmFootnoteCall
			},
			[93]: {
				name: "gfmPotentialFootnoteCall",
				add: "after",
				tokenize: tokenizePotentialGfmFootnoteCall,
				resolveTo: resolveToPotentialGfmFootnoteCall
			}
		}
	};
}
function tokenizePotentialGfmFootnoteCall(effects, ok3, nok) {
	const self = this;
	let index = self.events.length;
	const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = []);
	let labelStart;
	while (index--) {
		const token = self.events[index][1];
		if (token.type === "labelImage") {
			labelStart = token;
			break;
		}
		if (token.type === "gfmFootnoteCall" || token.type === "labelLink" || token.type === "label" || token.type === "image" || token.type === "link") break;
	}
	return start;
	function start(code3) {
		if (!labelStart || !labelStart._balanced) return nok(code3);
		const id = normalizeIdentifier(self.sliceSerialize({
			start: labelStart.end,
			end: self.now()
		}));
		if (id.codePointAt(0) !== 94 || !defined.includes(id.slice(1))) return nok(code3);
		effects.enter("gfmFootnoteCallLabelMarker");
		effects.consume(code3);
		effects.exit("gfmFootnoteCallLabelMarker");
		return ok3(code3);
	}
}
function resolveToPotentialGfmFootnoteCall(events, context) {
	let index = events.length;
	while (index--) if (events[index][1].type === "labelImage" && events[index][0] === "enter") {
		events[index][1];
		break;
	}
	events[index + 1][1].type = "data";
	events[index + 3][1].type = "gfmFootnoteCallLabelMarker";
	const call = {
		type: "gfmFootnoteCall",
		start: Object.assign({}, events[index + 3][1].start),
		end: Object.assign({}, events[events.length - 1][1].end)
	};
	const marker = {
		type: "gfmFootnoteCallMarker",
		start: Object.assign({}, events[index + 3][1].end),
		end: Object.assign({}, events[index + 3][1].end)
	};
	marker.end.column++;
	marker.end.offset++;
	marker.end._bufferIndex++;
	const string = {
		type: "gfmFootnoteCallString",
		start: Object.assign({}, marker.end),
		end: Object.assign({}, events[events.length - 1][1].start)
	};
	const chunk = {
		type: "chunkString",
		contentType: "string",
		start: Object.assign({}, string.start),
		end: Object.assign({}, string.end)
	};
	const replacement = [
		events[index + 1],
		events[index + 2],
		[
			"enter",
			call,
			context
		],
		events[index + 3],
		events[index + 4],
		[
			"enter",
			marker,
			context
		],
		[
			"exit",
			marker,
			context
		],
		[
			"enter",
			string,
			context
		],
		[
			"enter",
			chunk,
			context
		],
		[
			"exit",
			chunk,
			context
		],
		[
			"exit",
			string,
			context
		],
		events[events.length - 2],
		events[events.length - 1],
		[
			"exit",
			call,
			context
		]
	];
	events.splice(index, events.length - index + 1, ...replacement);
	return events;
}
function tokenizeGfmFootnoteCall(effects, ok3, nok) {
	const self = this;
	const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = []);
	let size = 0;
	let data;
	return start;
	function start(code3) {
		effects.enter("gfmFootnoteCall");
		effects.enter("gfmFootnoteCallLabelMarker");
		effects.consume(code3);
		effects.exit("gfmFootnoteCallLabelMarker");
		return callStart;
	}
	function callStart(code3) {
		if (code3 !== 94) return nok(code3);
		effects.enter("gfmFootnoteCallMarker");
		effects.consume(code3);
		effects.exit("gfmFootnoteCallMarker");
		effects.enter("gfmFootnoteCallString");
		effects.enter("chunkString").contentType = "string";
		return callData;
	}
	function callData(code3) {
		if (size > 999 || code3 === 93 && !data || code3 === null || code3 === 91 || markdownLineEndingOrSpace(code3)) return nok(code3);
		if (code3 === 93) {
			effects.exit("chunkString");
			const token = effects.exit("gfmFootnoteCallString");
			if (!defined.includes(normalizeIdentifier(self.sliceSerialize(token)))) return nok(code3);
			effects.enter("gfmFootnoteCallLabelMarker");
			effects.consume(code3);
			effects.exit("gfmFootnoteCallLabelMarker");
			effects.exit("gfmFootnoteCall");
			return ok3;
		}
		if (!markdownLineEndingOrSpace(code3)) data = true;
		size++;
		effects.consume(code3);
		return code3 === 92 ? callEscape : callData;
	}
	function callEscape(code3) {
		if (code3 === 91 || code3 === 92 || code3 === 93) {
			effects.consume(code3);
			size++;
			return callData;
		}
		return callData(code3);
	}
}
function tokenizeDefinitionStart(effects, ok3, nok) {
	const self = this;
	const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = []);
	let identifier;
	let size = 0;
	let data;
	return start;
	function start(code3) {
		effects.enter("gfmFootnoteDefinition")._container = true;
		effects.enter("gfmFootnoteDefinitionLabel");
		effects.enter("gfmFootnoteDefinitionLabelMarker");
		effects.consume(code3);
		effects.exit("gfmFootnoteDefinitionLabelMarker");
		return labelAtMarker;
	}
	function labelAtMarker(code3) {
		if (code3 === 94) {
			effects.enter("gfmFootnoteDefinitionMarker");
			effects.consume(code3);
			effects.exit("gfmFootnoteDefinitionMarker");
			effects.enter("gfmFootnoteDefinitionLabelString");
			effects.enter("chunkString").contentType = "string";
			return labelInside;
		}
		return nok(code3);
	}
	function labelInside(code3) {
		if (size > 999 || code3 === 93 && !data || code3 === null || code3 === 91 || markdownLineEndingOrSpace(code3)) return nok(code3);
		if (code3 === 93) {
			effects.exit("chunkString");
			const token = effects.exit("gfmFootnoteDefinitionLabelString");
			identifier = normalizeIdentifier(self.sliceSerialize(token));
			effects.enter("gfmFootnoteDefinitionLabelMarker");
			effects.consume(code3);
			effects.exit("gfmFootnoteDefinitionLabelMarker");
			effects.exit("gfmFootnoteDefinitionLabel");
			return labelAfter;
		}
		if (!markdownLineEndingOrSpace(code3)) data = true;
		size++;
		effects.consume(code3);
		return code3 === 92 ? labelEscape : labelInside;
	}
	function labelEscape(code3) {
		if (code3 === 91 || code3 === 92 || code3 === 93) {
			effects.consume(code3);
			size++;
			return labelInside;
		}
		return labelInside(code3);
	}
	function labelAfter(code3) {
		if (code3 === 58) {
			effects.enter("definitionMarker");
			effects.consume(code3);
			effects.exit("definitionMarker");
			if (!defined.includes(identifier)) defined.push(identifier);
			return factorySpace(effects, whitespaceAfter, "gfmFootnoteDefinitionWhitespace");
		}
		return nok(code3);
	}
	function whitespaceAfter(code3) {
		return ok3(code3);
	}
}
function tokenizeDefinitionContinuation(effects, ok3, nok) {
	return effects.check(blankLine, ok3, effects.attempt(indent, ok3, nok));
}
function gfmFootnoteDefinitionEnd(effects) {
	effects.exit("gfmFootnoteDefinition");
}
function tokenizeIndent(effects, ok3, nok) {
	const self = this;
	return factorySpace(effects, afterPrefix, "gfmFootnoteDefinitionIndent", 5);
	function afterPrefix(code3) {
		const tail = self.events[self.events.length - 1];
		return tail && tail[1].type === "gfmFootnoteDefinitionIndent" && tail[2].sliceSerialize(tail[1], true).length === 4 ? ok3(code3) : nok(code3);
	}
}
function gfmStrikethrough(options) {
	let single = (options || {}).singleTilde;
	const tokenizer = {
		name: "strikethrough",
		tokenize: tokenizeStrikethrough,
		resolveAll: resolveAllStrikethrough
	};
	if (single === null || single === void 0) single = true;
	return {
		text: { [126]: tokenizer },
		insideSpan: { null: [tokenizer] },
		attentionMarkers: { null: [126] }
	};
	function resolveAllStrikethrough(events, context) {
		let index = -1;
		while (++index < events.length) if (events[index][0] === "enter" && events[index][1].type === "strikethroughSequenceTemporary" && events[index][1]._close) {
			let open = index;
			while (open--) if (events[open][0] === "exit" && events[open][1].type === "strikethroughSequenceTemporary" && events[open][1]._open && events[index][1].end.offset - events[index][1].start.offset === events[open][1].end.offset - events[open][1].start.offset) {
				events[index][1].type = "strikethroughSequence";
				events[open][1].type = "strikethroughSequence";
				const strikethrough = {
					type: "strikethrough",
					start: Object.assign({}, events[open][1].start),
					end: Object.assign({}, events[index][1].end)
				};
				const text3 = {
					type: "strikethroughText",
					start: Object.assign({}, events[open][1].end),
					end: Object.assign({}, events[index][1].start)
				};
				const nextEvents = [
					[
						"enter",
						strikethrough,
						context
					],
					[
						"enter",
						events[open][1],
						context
					],
					[
						"exit",
						events[open][1],
						context
					],
					[
						"enter",
						text3,
						context
					]
				];
				const insideSpan = context.parser.constructs.insideSpan.null;
				if (insideSpan) splice(nextEvents, nextEvents.length, 0, resolveAll(insideSpan, events.slice(open + 1, index), context));
				splice(nextEvents, nextEvents.length, 0, [
					[
						"exit",
						text3,
						context
					],
					[
						"enter",
						events[index][1],
						context
					],
					[
						"exit",
						events[index][1],
						context
					],
					[
						"exit",
						strikethrough,
						context
					]
				]);
				splice(events, open - 1, index - open + 3, nextEvents);
				index = open + nextEvents.length - 2;
				break;
			}
		}
		index = -1;
		while (++index < events.length) if (events[index][1].type === "strikethroughSequenceTemporary") events[index][1].type = "data";
		return events;
	}
	function tokenizeStrikethrough(effects, ok3, nok) {
		const previous2 = this.previous;
		const events = this.events;
		let size = 0;
		return start;
		function start(code3) {
			if (previous2 === 126 && events[events.length - 1][1].type !== "characterEscape") return nok(code3);
			effects.enter("strikethroughSequenceTemporary");
			return more(code3);
		}
		function more(code3) {
			const before = classifyCharacter(previous2);
			if (code3 === 126) {
				if (size > 1) return nok(code3);
				effects.consume(code3);
				size++;
				return more;
			}
			if (size < 2 && !single) return nok(code3);
			const token = effects.exit("strikethroughSequenceTemporary");
			const after = classifyCharacter(code3);
			token._open = !after || after === 2 && Boolean(before);
			token._close = !before || before === 2 && Boolean(after);
			return ok3(code3);
		}
	}
}
var EditMap = class {
	/**
	* Create a new edit map.
	*/
	constructor() {
		this.map = [];
	}
	/**
	* Create an edit: a remove and/or add at a certain place.
	*
	* @param {number} index
	* @param {number} remove
	* @param {Array<Event>} add
	* @returns {undefined}
	*/
	add(index, remove, add) {
		addImplementation(this, index, remove, add);
	}
	/**
	* Done, change the events.
	*
	* @param {Array<Event>} events
	* @returns {undefined}
	*/
	consume(events) {
		this.map.sort(function(a, b) {
			return a[0] - b[0];
		});
		if (this.map.length === 0) return;
		let index = this.map.length;
		const vecs = [];
		while (index > 0) {
			index -= 1;
			vecs.push(events.slice(this.map[index][0] + this.map[index][1]), this.map[index][2]);
			events.length = this.map[index][0];
		}
		vecs.push(events.slice());
		events.length = 0;
		let slice = vecs.pop();
		while (slice) {
			for (const element of slice) events.push(element);
			slice = vecs.pop();
		}
		this.map.length = 0;
	}
};
function addImplementation(editMap, at, remove, add) {
	let index = 0;
	if (remove === 0 && add.length === 0) return;
	while (index < editMap.map.length) {
		if (editMap.map[index][0] === at) {
			editMap.map[index][1] += remove;
			editMap.map[index][2].push(...add);
			return;
		}
		index += 1;
	}
	editMap.map.push([
		at,
		remove,
		add
	]);
}
function gfmTableAlign(events, index) {
	let inDelimiterRow = false;
	const align = [];
	while (index < events.length) {
		const event = events[index];
		if (inDelimiterRow) {
			if (event[0] === "enter") {
				if (event[1].type === "tableContent") align.push(events[index + 1][1].type === "tableDelimiterMarker" ? "left" : "none");
			} else if (event[1].type === "tableContent") {
				if (events[index - 1][1].type === "tableDelimiterMarker") {
					const alignIndex = align.length - 1;
					align[alignIndex] = align[alignIndex] === "left" ? "center" : "right";
				}
			} else if (event[1].type === "tableDelimiterRow") break;
		} else if (event[0] === "enter" && event[1].type === "tableDelimiterRow") inDelimiterRow = true;
		index += 1;
	}
	return align;
}
function gfmTable() {
	return { flow: { null: {
		name: "table",
		tokenize: tokenizeTable,
		resolveAll: resolveTable
	} } };
}
function tokenizeTable(effects, ok3, nok) {
	const self = this;
	let size = 0;
	let sizeB = 0;
	let seen;
	return start;
	function start(code3) {
		let index = self.events.length - 1;
		while (index > -1) {
			const type = self.events[index][1].type;
			if (type === "lineEnding" || type === "linePrefix") index--;
			else break;
		}
		const tail = index > -1 ? self.events[index][1].type : null;
		const next = tail === "tableHead" || tail === "tableRow" ? bodyRowStart : headRowBefore;
		if (next === bodyRowStart && self.parser.lazy[self.now().line]) return nok(code3);
		return next(code3);
	}
	function headRowBefore(code3) {
		effects.enter("tableHead");
		effects.enter("tableRow");
		return headRowStart(code3);
	}
	function headRowStart(code3) {
		if (code3 === 124) return headRowBreak(code3);
		seen = true;
		sizeB += 1;
		return headRowBreak(code3);
	}
	function headRowBreak(code3) {
		if (code3 === null) return nok(code3);
		if (markdownLineEnding(code3)) {
			if (sizeB > 1) {
				sizeB = 0;
				self.interrupt = true;
				effects.exit("tableRow");
				effects.enter("lineEnding");
				effects.consume(code3);
				effects.exit("lineEnding");
				return headDelimiterStart;
			}
			return nok(code3);
		}
		if (markdownSpace(code3)) return factorySpace(effects, headRowBreak, "whitespace")(code3);
		sizeB += 1;
		if (seen) {
			seen = false;
			size += 1;
		}
		if (code3 === 124) {
			effects.enter("tableCellDivider");
			effects.consume(code3);
			effects.exit("tableCellDivider");
			seen = true;
			return headRowBreak;
		}
		effects.enter("data");
		return headRowData(code3);
	}
	function headRowData(code3) {
		if (code3 === null || code3 === 124 || markdownLineEndingOrSpace(code3)) {
			effects.exit("data");
			return headRowBreak(code3);
		}
		effects.consume(code3);
		return code3 === 92 ? headRowEscape : headRowData;
	}
	function headRowEscape(code3) {
		if (code3 === 92 || code3 === 124) {
			effects.consume(code3);
			return headRowData;
		}
		return headRowData(code3);
	}
	function headDelimiterStart(code3) {
		self.interrupt = false;
		if (self.parser.lazy[self.now().line]) return nok(code3);
		effects.enter("tableDelimiterRow");
		seen = false;
		if (markdownSpace(code3)) return factorySpace(effects, headDelimiterBefore, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code3);
		return headDelimiterBefore(code3);
	}
	function headDelimiterBefore(code3) {
		if (code3 === 45 || code3 === 58) return headDelimiterValueBefore(code3);
		if (code3 === 124) {
			seen = true;
			effects.enter("tableCellDivider");
			effects.consume(code3);
			effects.exit("tableCellDivider");
			return headDelimiterCellBefore;
		}
		return headDelimiterNok(code3);
	}
	function headDelimiterCellBefore(code3) {
		if (markdownSpace(code3)) return factorySpace(effects, headDelimiterValueBefore, "whitespace")(code3);
		return headDelimiterValueBefore(code3);
	}
	function headDelimiterValueBefore(code3) {
		if (code3 === 58) {
			sizeB += 1;
			seen = true;
			effects.enter("tableDelimiterMarker");
			effects.consume(code3);
			effects.exit("tableDelimiterMarker");
			return headDelimiterLeftAlignmentAfter;
		}
		if (code3 === 45) {
			sizeB += 1;
			return headDelimiterLeftAlignmentAfter(code3);
		}
		if (code3 === null || markdownLineEnding(code3)) return headDelimiterCellAfter(code3);
		return headDelimiterNok(code3);
	}
	function headDelimiterLeftAlignmentAfter(code3) {
		if (code3 === 45) {
			effects.enter("tableDelimiterFiller");
			return headDelimiterFiller(code3);
		}
		return headDelimiterNok(code3);
	}
	function headDelimiterFiller(code3) {
		if (code3 === 45) {
			effects.consume(code3);
			return headDelimiterFiller;
		}
		if (code3 === 58) {
			seen = true;
			effects.exit("tableDelimiterFiller");
			effects.enter("tableDelimiterMarker");
			effects.consume(code3);
			effects.exit("tableDelimiterMarker");
			return headDelimiterRightAlignmentAfter;
		}
		effects.exit("tableDelimiterFiller");
		return headDelimiterRightAlignmentAfter(code3);
	}
	function headDelimiterRightAlignmentAfter(code3) {
		if (markdownSpace(code3)) return factorySpace(effects, headDelimiterCellAfter, "whitespace")(code3);
		return headDelimiterCellAfter(code3);
	}
	function headDelimiterCellAfter(code3) {
		if (code3 === 124) return headDelimiterBefore(code3);
		if (code3 === null || markdownLineEnding(code3)) {
			if (!seen || size !== sizeB) return headDelimiterNok(code3);
			effects.exit("tableDelimiterRow");
			effects.exit("tableHead");
			return ok3(code3);
		}
		return headDelimiterNok(code3);
	}
	function headDelimiterNok(code3) {
		return nok(code3);
	}
	function bodyRowStart(code3) {
		effects.enter("tableRow");
		return bodyRowBreak(code3);
	}
	function bodyRowBreak(code3) {
		if (code3 === 124) {
			effects.enter("tableCellDivider");
			effects.consume(code3);
			effects.exit("tableCellDivider");
			return bodyRowBreak;
		}
		if (code3 === null || markdownLineEnding(code3)) {
			effects.exit("tableRow");
			return ok3(code3);
		}
		if (markdownSpace(code3)) return factorySpace(effects, bodyRowBreak, "whitespace")(code3);
		effects.enter("data");
		return bodyRowData(code3);
	}
	function bodyRowData(code3) {
		if (code3 === null || code3 === 124 || markdownLineEndingOrSpace(code3)) {
			effects.exit("data");
			return bodyRowBreak(code3);
		}
		effects.consume(code3);
		return code3 === 92 ? bodyRowEscape : bodyRowData;
	}
	function bodyRowEscape(code3) {
		if (code3 === 92 || code3 === 124) {
			effects.consume(code3);
			return bodyRowData;
		}
		return bodyRowData(code3);
	}
}
function resolveTable(events, context) {
	let index = -1;
	let inFirstCellAwaitingPipe = true;
	let rowKind = 0;
	let lastCell = [
		0,
		0,
		0,
		0
	];
	let cell = [
		0,
		0,
		0,
		0
	];
	let afterHeadAwaitingFirstBodyRow = false;
	let lastTableEnd = 0;
	let currentTable;
	let currentBody;
	let currentCell;
	const map3 = new EditMap();
	while (++index < events.length) {
		const event = events[index];
		const token = event[1];
		if (event[0] === "enter") {
			if (token.type === "tableHead") {
				afterHeadAwaitingFirstBodyRow = false;
				if (lastTableEnd !== 0) {
					flushTableEnd(map3, context, lastTableEnd, currentTable, currentBody);
					currentBody = void 0;
					lastTableEnd = 0;
				}
				currentTable = {
					type: "table",
					start: Object.assign({}, token.start),
					end: Object.assign({}, token.end)
				};
				map3.add(index, 0, [[
					"enter",
					currentTable,
					context
				]]);
			} else if (token.type === "tableRow" || token.type === "tableDelimiterRow") {
				inFirstCellAwaitingPipe = true;
				currentCell = void 0;
				lastCell = [
					0,
					0,
					0,
					0
				];
				cell = [
					0,
					index + 1,
					0,
					0
				];
				if (afterHeadAwaitingFirstBodyRow) {
					afterHeadAwaitingFirstBodyRow = false;
					currentBody = {
						type: "tableBody",
						start: Object.assign({}, token.start),
						end: Object.assign({}, token.end)
					};
					map3.add(index, 0, [[
						"enter",
						currentBody,
						context
					]]);
				}
				rowKind = token.type === "tableDelimiterRow" ? 2 : currentBody ? 3 : 1;
			} else if (rowKind && (token.type === "data" || token.type === "tableDelimiterMarker" || token.type === "tableDelimiterFiller")) {
				inFirstCellAwaitingPipe = false;
				if (cell[2] === 0) {
					if (lastCell[1] !== 0) {
						cell[0] = cell[1];
						currentCell = flushCell(map3, context, lastCell, rowKind, void 0, currentCell);
						lastCell = [
							0,
							0,
							0,
							0
						];
					}
					cell[2] = index;
				}
			} else if (token.type === "tableCellDivider") {
				if (inFirstCellAwaitingPipe) inFirstCellAwaitingPipe = false;
				else {
					if (lastCell[1] !== 0) {
						cell[0] = cell[1];
						currentCell = flushCell(map3, context, lastCell, rowKind, void 0, currentCell);
					}
					lastCell = cell;
					cell = [
						lastCell[1],
						index,
						0,
						0
					];
				}
			}
		} else if (token.type === "tableHead") {
			afterHeadAwaitingFirstBodyRow = true;
			lastTableEnd = index;
		} else if (token.type === "tableRow" || token.type === "tableDelimiterRow") {
			lastTableEnd = index;
			if (lastCell[1] !== 0) {
				cell[0] = cell[1];
				currentCell = flushCell(map3, context, lastCell, rowKind, index, currentCell);
			} else if (cell[1] !== 0) currentCell = flushCell(map3, context, cell, rowKind, index, currentCell);
			rowKind = 0;
		} else if (rowKind && (token.type === "data" || token.type === "tableDelimiterMarker" || token.type === "tableDelimiterFiller")) cell[3] = index;
	}
	if (lastTableEnd !== 0) flushTableEnd(map3, context, lastTableEnd, currentTable, currentBody);
	map3.consume(context.events);
	index = -1;
	while (++index < context.events.length) {
		const event = context.events[index];
		if (event[0] === "enter" && event[1].type === "table") event[1]._align = gfmTableAlign(context.events, index);
	}
	return events;
}
function flushCell(map3, context, range, rowKind, rowEnd, previousCell) {
	const groupName = rowKind === 1 ? "tableHeader" : rowKind === 2 ? "tableDelimiter" : "tableData";
	const valueName = "tableContent";
	if (range[0] !== 0) {
		previousCell.end = Object.assign({}, getPoint(context.events, range[0]));
		map3.add(range[0], 0, [[
			"exit",
			previousCell,
			context
		]]);
	}
	const now = getPoint(context.events, range[1]);
	previousCell = {
		type: groupName,
		start: Object.assign({}, now),
		end: Object.assign({}, now)
	};
	map3.add(range[1], 0, [[
		"enter",
		previousCell,
		context
	]]);
	if (range[2] !== 0) {
		const relatedStart = getPoint(context.events, range[2]);
		const relatedEnd = getPoint(context.events, range[3]);
		const valueToken = {
			type: valueName,
			start: Object.assign({}, relatedStart),
			end: Object.assign({}, relatedEnd)
		};
		map3.add(range[2], 0, [[
			"enter",
			valueToken,
			context
		]]);
		if (rowKind !== 2) {
			const start = context.events[range[2]];
			const end = context.events[range[3]];
			start[1].end = Object.assign({}, end[1].end);
			start[1].type = "chunkText";
			start[1].contentType = "text";
			if (range[3] > range[2] + 1) {
				const a = range[2] + 1;
				const b = range[3] - range[2] - 1;
				map3.add(a, b, []);
			}
		}
		map3.add(range[3] + 1, 0, [[
			"exit",
			valueToken,
			context
		]]);
	}
	if (rowEnd !== void 0) {
		previousCell.end = Object.assign({}, getPoint(context.events, rowEnd));
		map3.add(rowEnd, 0, [[
			"exit",
			previousCell,
			context
		]]);
		previousCell = void 0;
	}
	return previousCell;
}
function flushTableEnd(map3, context, index, table, tableBody) {
	const exits = [];
	const related = getPoint(context.events, index);
	if (tableBody) {
		tableBody.end = Object.assign({}, related);
		exits.push([
			"exit",
			tableBody,
			context
		]);
	}
	table.end = Object.assign({}, related);
	exits.push([
		"exit",
		table,
		context
	]);
	map3.add(index + 1, 0, exits);
}
function getPoint(events, index) {
	const event = events[index];
	const side = event[0] === "enter" ? "start" : "end";
	return event[1][side];
}
var tasklistCheck = {
	name: "tasklistCheck",
	tokenize: tokenizeTasklistCheck
};
function gfmTaskListItem() {
	return { text: { [91]: tasklistCheck } };
}
function tokenizeTasklistCheck(effects, ok3, nok) {
	const self = this;
	return open;
	function open(code3) {
		if (self.previous !== null || !self._gfmTasklistFirstContentOfListItem) return nok(code3);
		effects.enter("taskListCheck");
		effects.enter("taskListCheckMarker");
		effects.consume(code3);
		effects.exit("taskListCheckMarker");
		return inside;
	}
	function inside(code3) {
		if (markdownLineEndingOrSpace(code3)) {
			effects.enter("taskListCheckValueUnchecked");
			effects.consume(code3);
			effects.exit("taskListCheckValueUnchecked");
			return close;
		}
		if (code3 === 88 || code3 === 120) {
			effects.enter("taskListCheckValueChecked");
			effects.consume(code3);
			effects.exit("taskListCheckValueChecked");
			return close;
		}
		return nok(code3);
	}
	function close(code3) {
		if (code3 === 93) {
			effects.enter("taskListCheckMarker");
			effects.consume(code3);
			effects.exit("taskListCheckMarker");
			effects.exit("taskListCheck");
			return after;
		}
		return nok(code3);
	}
	function after(code3) {
		if (markdownLineEnding(code3)) return ok3(code3);
		if (markdownSpace(code3)) return effects.check({ tokenize: spaceThenNonSpace }, ok3, nok)(code3);
		return nok(code3);
	}
}
function spaceThenNonSpace(effects, ok3, nok) {
	return factorySpace(effects, after, "whitespace");
	function after(code3) {
		return code3 === null ? nok(code3) : ok3(code3);
	}
}
function gfm(options) {
	return combineExtensions([
		gfmAutolinkLiteral(),
		gfmFootnote(),
		gfmStrikethrough(options),
		gfmTable(),
		gfmTaskListItem()
	]);
}
var emptyOptions2 = {};
function remarkGfm(options) {
	const self = this;
	const settings = options || emptyOptions2;
	const data = self.data();
	const micromarkExtensions = data.micromarkExtensions || (data.micromarkExtensions = []);
	const fromMarkdownExtensions = data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);
	const toMarkdownExtensions = data.toMarkdownExtensions || (data.toMarkdownExtensions = []);
	micromarkExtensions.push(gfm(settings));
	fromMarkdownExtensions.push(gfmFromMarkdown());
	toMarkdownExtensions.push(gfmToMarkdown(settings));
}
var gfmPlugin = (options = {}) => ({ remarkPlugin: [remarkGfm, options] });
// node_modules/.deno/@ungap+structured-clone@1.4.0/node_modules/@ungap/structured-clone/esm/deserialize.js
var { defineProperty } = Object;
var env = typeof self === "object" ? self : globalThis;
var guard = (name, init) => {
	switch (name) {
		case "Function":
		case "SharedWorker":
		case "Worker":
		case "eval":
		case "setInterval":
		case "setTimeout": throw new TypeError("unable to deserialize " + name);
	}
	return new env[name](init);
};
var deserializer = ($, _) => {
	const as = (out, index) => {
		$.set(index, out);
		return out;
	};
	const unpair = (index) => {
		if ($.has(index)) return $.get(index);
		const [type, value] = _[index];
		switch (type) {
			case 0:
			case -1: return as(value, index);
			case 1: {
				const arr = as([], index);
				for (const index of value) arr.push(unpair(index));
				return arr;
			}
			case 2: {
				const object = as({}, index);
				for (const [key, index] of value) {
					const k = unpair(key), value = unpair(index);
					if (k === "__proto__") defineProperty(object, k, {
						value,
						configurable: true,
						enumerable: true,
						writable: true
					});
					else object[k] = value;
				}
				return object;
			}
			case 3: return as(new Date(value), index);
			case 4: {
				const { source, flags } = value;
				return as(new RegExp(source, flags), index);
			}
			case 5: {
				const map = as(/* @__PURE__ */ new Map(), index);
				for (const [key, index] of value) map.set(unpair(key), unpair(index));
				return map;
			}
			case 6: {
				const set = as(/* @__PURE__ */ new Set(), index);
				for (const index of value) set.add(unpair(index));
				return set;
			}
			case 7: {
				const { name, message } = value;
				return as(typeof env[name] === "function" ? guard(name, message) : new Error(message), index);
			}
			case 8: return as(BigInt(value), index);
			case "BigInt": return as(Object(BigInt(value)), index);
			case "ArrayBuffer": return as(new Uint8Array(value).buffer, value);
			case "DataView": {
				const { buffer } = new Uint8Array(value);
				return as(new DataView(buffer), value);
			}
			case "-0": return -0;
		}
		return as(guard(type, value), index);
	};
	return unpair;
};
/**
* @typedef {Array<string,any>} Record a type representation
*/
/**
* Returns a deserialized value from a serialized array of Records.
* @param {Record[]} serialized a previously serialized value.
* @returns {any}
*/
var deserialize = (serialized) => deserializer(/* @__PURE__ */ new Map(), serialized)(0);
// node_modules/.deno/@ungap+structured-clone@1.4.0/node_modules/@ungap/structured-clone/esm/serialize.js
var EMPTY = "";
var { toString } = {};
var { keys, is } = Object;
var typeOf = (value) => {
	const type = typeof value;
	if (type !== "object" || !value) return [0, type];
	const asString = toString.call(value).slice(8, -1);
	switch (asString) {
		case "Array": return [1, EMPTY];
		case "Object": return [2, EMPTY];
		case "Date": return [3, EMPTY];
		case "RegExp": return [4, EMPTY];
		case "Map": return [5, EMPTY];
		case "Set": return [6, EMPTY];
		case "DataView": return [1, asString];
	}
	if (asString.includes("Array")) return [1, asString];
	if (value instanceof Error) return [7, value.name || "Error"];
	return [2, asString];
};
var shouldSkip = ([TYPE, type]) => TYPE === 0 && (type === "function" || type === "symbol");
var serializer = (strict, json, $, _) => {
	const as = (out, value) => {
		const index = _.push(out) - 1;
		$.set(value, index);
		return index;
	};
	const pair = (value) => {
		if ($.has(value)) return $.get(value);
		let [TYPE, type] = typeOf(value);
		switch (TYPE) {
			case 0: {
				let entry = value;
				switch (type) {
					case "bigint":
						TYPE = 8;
						entry = value.toString();
						break;
					case "number":
						if (!value && is(value, -0)) return _.push(["-0"]) - 1;
						break;
					case "function":
					case "symbol":
						if (strict) throw new TypeError("unable to serialize " + type);
						entry = null;
						break;
					case "undefined": return as([-1], value);
				}
				return as([TYPE, entry], value);
			}
			case 1: {
				if (type) {
					let spread = value;
					if (type === "DataView") spread = new Uint8Array(value.buffer);
					else if (type === "ArrayBuffer") spread = new Uint8Array(value);
					return as([type, [...spread]], value);
				}
				const arr = [];
				const index = as([TYPE, arr], value);
				for (const entry of value) arr.push(pair(entry));
				return index;
			}
			case 2: {
				if (type) switch (type) {
					case "BigInt": return as([type, value.toString()], value);
					case "Boolean":
					case "Number":
					case "String": return as([type, value.valueOf()], value);
				}
				if (json && "toJSON" in value) return pair(value.toJSON());
				const entries = [];
				const index = as([TYPE, entries], value);
				for (const key of keys(value)) if (strict || !shouldSkip(typeOf(value[key]))) entries.push([pair(key), pair(value[key])]);
				return index;
			}
			case 3: return as([TYPE, isNaN(value.getTime()) ? EMPTY : value.toISOString()], value);
			case 4: {
				const { source, flags } = value;
				return as([TYPE, {
					source,
					flags
				}], value);
			}
			case 5: {
				const entries = [];
				const index = as([TYPE, entries], value);
				for (const [key, entry] of value) if (strict || !(shouldSkip(typeOf(key)) || shouldSkip(typeOf(entry)))) entries.push([pair(key), pair(entry)]);
				return index;
			}
			case 6: {
				const entries = [];
				const index = as([TYPE, entries], value);
				for (const entry of value) if (strict || !shouldSkip(typeOf(entry))) entries.push(pair(entry));
				return index;
			}
		}
		const { message } = value;
		return as([TYPE, {
			name: type,
			message
		}], value);
	};
	return pair;
};
/**
* @typedef {Array<string,any>} Record a type representation
*/
/**
* Returns an array of serialized Records.
* @param {any} value a serializable value.
* @param {{json?: boolean, lossy?: boolean}?} options an object with a `lossy` or `json` property that,
*  if `true`, will not throw errors on incompatible types, and behave more
*  like JSON stringify would behave. Symbol and Function will be discarded.
* @returns {Record[]}
*/
var serialize = (value, { json, lossy } = {}) => {
	const _ = [];
	return serializer(!(json || lossy), !!json, /* @__PURE__ */ new Map(), _)(value), _;
};
// node_modules/.deno/@ungap+structured-clone@1.4.0/node_modules/@ungap/structured-clone/esm/index.js
/**
* @typedef {Array<string,any>} Record a type representation
*/
/**
* Returns an array of serialized Records.
* @param {any} any a serializable value.
* @param {{transfer?: any[], json?: boolean, lossy?: boolean}?} options an object with
* a transfer option (ignored when polyfilled) and/or non standard fields that
* fallback to the polyfill if present.
* @returns {Record[]}
*/
var esm_default = typeof structuredClone === "function" ? 
/* c8 ignore start */
(any, options) => options && ("json" in options || "lossy" in options) ? deserialize(serialize(any, options)) : structuredClone(any) : (any, options) => deserialize(serialize(any, options));
// node_modules/.deno/unist-util-position@5.0.0/node_modules/unist-util-position/lib/index.js
/**
* @typedef {import('unist').Node} Node
* @typedef {import('unist').Point} Point
* @typedef {import('unist').Position} Position
*/
/**
* @typedef NodeLike
* @property {string} type
* @property {PositionLike | null | undefined} [position]
*
* @typedef PositionLike
* @property {PointLike | null | undefined} [start]
* @property {PointLike | null | undefined} [end]
*
* @typedef PointLike
* @property {number | null | undefined} [line]
* @property {number | null | undefined} [column]
* @property {number | null | undefined} [offset]
*/
/**
* Get the ending point of `node`.
*
* @param node
*   Node.
* @returns
*   Point.
*/
var pointEnd = point("end");
/**
* Get the starting point of `node`.
*
* @param node
*   Node.
* @returns
*   Point.
*/
var pointStart = point("start");
/**
* Get the positional info of `node`.
*
* @param {'end' | 'start'} type
*   Side.
* @returns
*   Getter.
*/
function point(type) {
	return point;
	/**
	* Get the point info of `node` at a bound side.
	*
	* @param {Node | NodeLike | null | undefined} [node]
	* @returns {Point | undefined}
	*/
	function point(node) {
		const point = node && node.position && node.position[type] || {};
		if (typeof point.line === "number" && point.line > 0 && typeof point.column === "number" && point.column > 0) return {
			line: point.line,
			column: point.column,
			offset: typeof point.offset === "number" && point.offset > -1 ? point.offset : void 0
		};
	}
}
/**
* Get the positional info of `node`.
*
* @param {Node | NodeLike | null | undefined} [node]
*   Node.
* @returns {Position | undefined}
*   Position.
*/
function position(node) {
	const start = pointStart(node);
	const end = pointEnd(node);
	if (start && end) return {
		start,
		end
	};
}
// node_modules/.deno/hast-util-sanitize@5.0.2/node_modules/hast-util-sanitize/lib/schema.js
/**
* @import {Schema} from 'hast-util-sanitize'
*/
var aria = [
	"ariaDescribedBy",
	"ariaLabel",
	"ariaLabelledBy"
];
/**
* Default schema.
*
* Follows GitHub style sanitation.
*
* @type {Schema}
*/
var defaultSchema = {
	ancestors: {
		tbody: ["table"],
		td: ["table"],
		th: ["table"],
		thead: ["table"],
		tfoot: ["table"],
		tr: ["table"]
	},
	attributes: {
		a: [
			...aria,
			"dataFootnoteBackref",
			"dataFootnoteRef",
			["className", "data-footnote-backref"],
			"href"
		],
		blockquote: ["cite"],
		code: [["className", /^language-./]],
		del: ["cite"],
		div: ["itemScope", "itemType"],
		dl: [...aria],
		h2: [["className", "sr-only"]],
		img: [
			...aria,
			"longDesc",
			"src"
		],
		input: [["disabled", true], ["type", "checkbox"]],
		ins: ["cite"],
		li: [["className", "task-list-item"]],
		ol: [...aria, ["className", "contains-task-list"]],
		q: ["cite"],
		section: ["dataFootnotes", ["className", "footnotes"]],
		source: ["srcSet"],
		summary: [...aria],
		table: [...aria],
		ul: [...aria, ["className", "contains-task-list"]],
		"*": [
			"abbr",
			"accept",
			"acceptCharset",
			"accessKey",
			"action",
			"align",
			"alt",
			"axis",
			"border",
			"cellPadding",
			"cellSpacing",
			"char",
			"charOff",
			"charSet",
			"checked",
			"clear",
			"colSpan",
			"color",
			"cols",
			"compact",
			"coords",
			"dateTime",
			"dir",
			"encType",
			"frame",
			"hSpace",
			"headers",
			"height",
			"hrefLang",
			"htmlFor",
			"id",
			"isMap",
			"itemProp",
			"label",
			"lang",
			"maxLength",
			"media",
			"method",
			"multiple",
			"name",
			"noHref",
			"noShade",
			"noWrap",
			"open",
			"prompt",
			"readOnly",
			"rev",
			"rowSpan",
			"rows",
			"rules",
			"scope",
			"selected",
			"shape",
			"size",
			"span",
			"start",
			"summary",
			"tabIndex",
			"title",
			"useMap",
			"vAlign",
			"value",
			"width"
		]
	},
	clobber: [
		"ariaDescribedBy",
		"ariaLabelledBy",
		"id",
		"name"
	],
	clobberPrefix: "user-content-",
	protocols: {
		cite: ["http", "https"],
		href: [
			"http",
			"https",
			"irc",
			"ircs",
			"mailto",
			"xmpp"
		],
		longDesc: ["http", "https"],
		src: ["http", "https"]
	},
	required: { input: {
		disabled: true,
		type: "checkbox"
	} },
	strip: ["script"],
	tagNames: [
		"a",
		"b",
		"blockquote",
		"br",
		"code",
		"dd",
		"del",
		"details",
		"div",
		"dl",
		"dt",
		"em",
		"h1",
		"h2",
		"h3",
		"h4",
		"h5",
		"h6",
		"hr",
		"i",
		"img",
		"input",
		"ins",
		"kbd",
		"li",
		"ol",
		"p",
		"picture",
		"pre",
		"q",
		"rp",
		"rt",
		"ruby",
		"s",
		"samp",
		"section",
		"source",
		"span",
		"strike",
		"strong",
		"sub",
		"summary",
		"sup",
		"table",
		"tbody",
		"td",
		"tfoot",
		"th",
		"thead",
		"tr",
		"tt",
		"ul",
		"var"
	]
};
// node_modules/.deno/hast-util-sanitize@5.0.2/node_modules/hast-util-sanitize/lib/index.js
/**
* @import {
*   Comment,
*   Doctype,
*   ElementContent,
*   Element,
*   Nodes,
*   Properties,
*   RootContent,
*   Root,
*   Text
* } from 'hast'
*/
/**
* @typedef {[string, ...Array<Exclude<Properties[keyof Properties], Array<any>> | RegExp>] | string} PropertyDefinition
*   Definition for a property.
*
* @typedef Schema
*   Schema that defines what nodes and properties are allowed.
*
*   The default schema is `defaultSchema`, which follows how GitHub cleans.
*   If any top-level key is missing in the given schema, the corresponding
*   value of the default schema is used.
*
*   To extend the standard schema with a few changes, clone `defaultSchema`
*   like so:
*
*   ```js
*   import deepmerge from 'deepmerge'
*   import {h} from 'hastscript'
*   import {defaultSchema, sanitize} from 'hast-util-sanitize'
*
*   // This allows `className` on all elements.
*   const schema = deepmerge(defaultSchema, {attributes: {'*': ['className']}})
*
*   const tree = sanitize(h('div', {className: ['foo']}), schema)
*
*   // `tree` still has `className`.
*   console.log(tree)
*   // {
*   //   type: 'element',
*   //   tagName: 'div',
*   //   properties: {className: ['foo']},
*   //   children: []
*   // }
*   ```
* @property {boolean | null | undefined} [allowComments=false]
*   Whether to allow comment nodes (default: `false`).
*
*   For example:
*
*   ```js
*   allowComments: true
*   ```
* @property {boolean | null | undefined} [allowDoctypes=false]
*   Whether to allow doctype nodes (default: `false`).
*
*   For example:
*
*   ```js
*   allowDoctypes: true
*   ```
* @property {Record<string, Array<string>> | null | undefined} [ancestors]
*   Map of tag names to a list of tag names which are required ancestors
*   (default: `defaultSchema.ancestors`).
*
*   Elements with these tag names will be ignored if they occur outside of one
*   of their allowed parents.
*
*   For example:
*
*   ```js
*   ancestors: {
*     tbody: ['table'],
*     // …
*     tr: ['table']
*   }
*   ```
* @property {Record<string, Array<PropertyDefinition>> | null | undefined} [attributes]
*   Map of tag names to allowed property names (default:
*   `defaultSchema.attributes`).
*
*   The special key `'*'` as a tag name defines property names allowed on all
*   elements.
*
*   The special value `'data*'` as a property name can be used to allow all
*   `data` properties.
*
*   For example:
*
*   ```js
*   attributes: {
*     'ariaDescribedBy', 'ariaLabel', 'ariaLabelledBy', …, 'href'
*     // …
*     '*': [
*       'abbr',
*       'accept',
*       'acceptCharset',
*       // …
*       'vAlign',
*       'value',
*       'width'
*     ]
*   }
*   ```
*
*   Instead of a single string in the array, which allows any property value
*   for the field, you can use an array to allow several values.
*   For example, `input: ['type']` allows `type` set to any value on `input`s.
*   But `input: [['type', 'checkbox', 'radio']]` allows `type` when set to
*   `'checkbox'` or `'radio'`.
*
*   You can use regexes, so for example `span: [['className', /^hljs-/]]`
*   allows any class that starts with `hljs-` on `span`s.
*
*   When comma- or space-separated values are used (such as `className`), each
*   value in is checked individually.
*   For example, to allow certain classes on `span`s for syntax highlighting,
*   use `span: [['className', 'number', 'operator', 'token']]`.
*   This will allow `'number'`, `'operator'`, and `'token'` classes, but drop
*   others.
* @property {Array<string> | null | undefined} [clobber]
*   List of property names that clobber (default: `defaultSchema.clobber`).
*
*   For example:
*
*   ```js
*   clobber: ['ariaDescribedBy', 'ariaLabelledBy', 'id', 'name']
*   ```
* @property {string | null | undefined} [clobberPrefix]
*   Prefix to use before clobbering properties (default:
*   `defaultSchema.clobberPrefix`).
*
*   For example:
*
*   ```js
*   clobberPrefix: 'user-content-'
*   ```
* @property {Record<string, Array<string> | null | undefined> | null | undefined} [protocols]
*   Map of *property names* to allowed protocols (default:
*   `defaultSchema.protocols`).
*
*   This defines URLs that are always allowed to have local URLs (relative to
*   the current website, such as `this`, `#this`, `/this`, or `?this`), and
*   only allowed to have remote URLs (such as `https://example.com`) if they
*   use a known protocol.
*
*   For example:
*
*   ```js
*   protocols: {
*     cite: ['http', 'https'],
*     // …
*     src: ['http', 'https']
*   }
*   ```
* @property {Record<string, Record<string, Properties[keyof Properties]>> | null | undefined} [required]
*   Map of tag names to required property names with a default value
*   (default: `defaultSchema.required`).
*
*   This defines properties that must be set.
*   If a field does not exist (after the element was made safe), these will be
*   added with the given value.
*
*   For example:
*
*   ```js
*   required: {
*     input: {disabled: true, type: 'checkbox'}
*   }
*   ```
*
*   > 👉 **Note**: properties are first checked based on `schema.attributes`,
*   > then on `schema.required`.
*   > That means properties could be removed by `attributes` and then added
*   > again with `required`.
* @property {Array<string> | null | undefined} [strip]
*   List of tag names to strip from the tree (default: `defaultSchema.strip`).
*
*   By default, unsafe elements (those not in `schema.tagNames`) are replaced
*   by what they contain.
*   This option can drop their contents.
*
*   For example:
*
*   ```js
*   strip: ['script']
*   ```
* @property {Array<string> | null | undefined} [tagNames]
*   List of allowed tag names (default: `defaultSchema.tagNames`).
*
*   For example:
*
*   ```js
*   tagNames: [
*     'a',
*     'b',
*     // …
*     'ul',
*     'var'
*   ]
*   ```
*
* @typedef State
*   Info passed around.
* @property {Readonly<Schema>} schema
*   Schema.
* @property {Array<string>} stack
*   Tag names of ancestors.
*/
var own = {}.hasOwnProperty;
/**
* Sanitize a tree.
*
* @param {Readonly<Nodes>} node
*   Unsafe tree.
* @param {Readonly<Schema> | null | undefined} [options]
*   Configuration (default: `defaultSchema`).
* @returns {Nodes}
*   New, safe tree.
*/
function sanitize(node, options) {
	/** @type {Nodes} */
	let result = {
		type: "root",
		children: []
	};
	const replace = transform({
		schema: options ? {
			...defaultSchema,
			...options
		} : defaultSchema,
		stack: []
	}, node);
	if (replace) {
		if (Array.isArray(replace)) {
			if (replace.length === 1) result = replace[0];
			else result.children = replace;
		} else result = replace;
	}
	return result;
}
/**
* Sanitize `node`.
*
* @param {State} state
*   Info passed around.
* @param {Readonly<unknown>} node
*   Unsafe node.
* @returns {Array<ElementContent> | Nodes | undefined}
*   Safe result.
*/
function transform(state, node) {
	if (node && typeof node === "object") {
		const unsafe = node;
		switch (typeof unsafe.type === "string" ? unsafe.type : "") {
			case "comment": return comment(state, unsafe);
			case "doctype": return doctype(state, unsafe);
			case "element": return element(state, unsafe);
			case "root": return root$10(state, unsafe);
			case "text": return text(state, unsafe);
		}
	}
}
/**
* Make a safe comment.
*
* @param {State} state
*   Info passed around.
* @param {Readonly<Record<string, Readonly<unknown>>>} unsafe
*   Unsafe comment-like value.
* @returns {Comment | undefined}
*   Safe comment (if with `allowComments`).
*/
function comment(state, unsafe) {
	if (state.schema.allowComments) {
		const result = typeof unsafe.value === "string" ? unsafe.value : "";
		const index = result.indexOf("-->");
		/** @type {Comment} */
		const node = {
			type: "comment",
			value: index < 0 ? result : result.slice(0, index)
		};
		patch(node, unsafe);
		return node;
	}
}
/**
* Make a safe doctype.
*
* @param {State} state
*   Info passed around.
* @param {Readonly<Record<string, Readonly<unknown>>>} unsafe
*   Unsafe doctype-like value.
* @returns {Doctype | undefined}
*   Safe doctype (if with `allowDoctypes`).
*/
function doctype(state, unsafe) {
	if (state.schema.allowDoctypes) {
		/** @type {Doctype} */
		const node = { type: "doctype" };
		patch(node, unsafe);
		return node;
	}
}
/**
* Make a safe element.
*
* @param {State} state
*   Info passed around.
* @param {Readonly<Record<string, Readonly<unknown>>>} unsafe
*   Unsafe element-like value.
* @returns {Array<ElementContent> | Element | undefined}
*   Safe element.
*/
function element(state, unsafe) {
	const name = typeof unsafe.tagName === "string" ? unsafe.tagName : "";
	state.stack.push(name);
	const content = children(state, unsafe.children);
	const properties_ = properties(state, unsafe.properties);
	state.stack.pop();
	let safeElement = false;
	if (name && name !== "*" && (!state.schema.tagNames || state.schema.tagNames.includes(name))) {
		safeElement = true;
		if (state.schema.ancestors && own.call(state.schema.ancestors, name)) {
			const ancestors = state.schema.ancestors[name];
			let index = -1;
			safeElement = false;
			while (++index < ancestors.length) if (state.stack.includes(ancestors[index])) safeElement = true;
		}
	}
	if (!safeElement) return state.schema.strip && !state.schema.strip.includes(name) ? content : void 0;
	/** @type {Element} */
	const node = {
		type: "element",
		tagName: name,
		properties: properties_,
		children: content
	};
	patch(node, unsafe);
	return node;
}
/**
* Make a safe root.
*
* @param {State} state
*   Info passed around.
* @param {Readonly<Record<string, Readonly<unknown>>>} unsafe
*   Unsafe root-like value.
* @returns {Root}
*   Safe root.
*/
function root$10(state, unsafe) {
	/** @type {Root} */
	const node = {
		type: "root",
		children: children(state, unsafe.children)
	};
	patch(node, unsafe);
	return node;
}
/**
* Make a safe text.
*
* @param {State} _
*   Info passed around.
* @param {Readonly<Record<string, Readonly<unknown>>>} unsafe
*   Unsafe text-like value.
* @returns {Text}
*   Safe text.
*/
function text(_, unsafe) {
	/** @type {Text} */
	const node = {
		type: "text",
		value: typeof unsafe.value === "string" ? unsafe.value : ""
	};
	patch(node, unsafe);
	return node;
}
/**
* Make children safe.
*
* @param {State} state
*   Info passed around.
* @param {Readonly<unknown>} children
*   Unsafe value.
* @returns {Array<Nodes>}
*   Safe children.
*/
function children(state, children) {
	/** @type {Array<Nodes>} */
	const results = [];
	if (Array.isArray(children)) {
		const childrenUnknown = children;
		let index = -1;
		while (++index < childrenUnknown.length) {
			const value = transform(state, childrenUnknown[index]);
			if (value) {
				if (Array.isArray(value)) results.push(...value);
				else results.push(value);
			}
		}
	}
	return results;
}
/**
* Make element properties safe.
*
* @param {State} state
*   Info passed around.
* @param {Readonly<unknown>} properties
*   Unsafe value.
* @returns {Properties}
*   Safe value.
*/
function properties(state, properties) {
	const tagName = state.stack[state.stack.length - 1];
	const attributes = state.schema.attributes;
	const required = state.schema.required;
	const specific = attributes && own.call(attributes, tagName) ? attributes[tagName] : void 0;
	const defaults = attributes && own.call(attributes, "*") ? attributes["*"] : void 0;
	const properties_ = properties && typeof properties === "object" ? properties : {};
	/** @type {Properties} */
	const result = {};
	/** @type {string} */
	let key;
	for (key in properties_) if (own.call(properties_, key)) {
		const unsafe = properties_[key];
		let safe = propertyValue(state, findDefinition(specific, key), key, unsafe);
		if (safe === null || safe === void 0) safe = propertyValue(state, findDefinition(defaults, key), key, unsafe);
		if (safe !== null && safe !== void 0) result[key] = safe;
	}
	if (required && own.call(required, tagName)) {
		const properties = required[tagName];
		for (key in properties) if (own.call(properties, key) && !own.call(result, key)) result[key] = properties[key];
	}
	return result;
}
/**
* Sanitize a property value.
*
* @param {State} state
*   Info passed around.
* @param {Readonly<PropertyDefinition> | undefined} definition
*   Definition.
* @param {string} key
*   Field name.
* @param {Readonly<unknown>} value
*   Unsafe value (but an array).
* @returns {Array<number | string> | boolean | number | string | undefined}
*   Safe value.
*/
function propertyValue(state, definition, key, value) {
	return definition ? Array.isArray(value) ? propertyValueMany(state, definition, key, value) : propertyValuePrimitive(state, definition, key, value) : void 0;
}
/**
* Sanitize a property value which is a list.
*
* @param {State} state
*   Info passed around.
* @param {Readonly<PropertyDefinition>} definition
*   Definition.
* @param {string} key
*   Field name.
* @param {Readonly<Array<Readonly<unknown>>>} values
*   Unsafe value (but an array).
* @returns {Array<number | string>}
*   Safe value.
*/
function propertyValueMany(state, definition, key, values) {
	let index = -1;
	/** @type {Array<number | string>} */
	const result = [];
	while (++index < values.length) {
		const value = propertyValuePrimitive(state, definition, key, values[index]);
		if (typeof value === "number" || typeof value === "string") result.push(value);
	}
	return result;
}
/**
* Sanitize a property value which is a primitive.
*
* @param {State} state
*   Info passed around.
* @param {Readonly<PropertyDefinition>} definition
*   Definition.
* @param {string} key
*   Field name.
* @param {Readonly<unknown>} value
*   Unsafe value (but not an array).
* @returns {boolean | number | string | undefined}
*   Safe value.
*/
function propertyValuePrimitive(state, definition, key, value) {
	if (typeof value !== "boolean" && typeof value !== "number" && typeof value !== "string") return;
	if (!safeProtocol(state, key, value)) return;
	if (typeof definition === "object" && definition.length > 1) {
		let ok = false;
		let index = 0;
		while (++index < definition.length) {
			const allowed = definition[index];
			if (allowed && typeof allowed === "object" && "flags" in allowed) {
				if (allowed.test(String(value))) {
					ok = true;
					break;
				}
			} else if (allowed === value) {
				ok = true;
				break;
			}
		}
		if (!ok) return;
	}
	return state.schema.clobber && state.schema.clobberPrefix && state.schema.clobber.includes(key) ? state.schema.clobberPrefix + value : value;
}
/**
* Check whether `value` is a safe URL.
*
* @param {State} state
*   Info passed around.
* @param {string} key
*   Field name.
* @param {Readonly<unknown>} value
*   Unsafe value.
* @returns {boolean}
*   Whether it’s a safe value.
*/
function safeProtocol(state, key, value) {
	const protocols = state.schema.protocols && own.call(state.schema.protocols, key) ? state.schema.protocols[key] : void 0;
	if (!protocols || protocols.length === 0) return true;
	const url = String(value);
	const colon = url.indexOf(":");
	const questionMark = url.indexOf("?");
	const numberSign = url.indexOf("#");
	const slash = url.indexOf("/");
	if (colon < 0 || slash > -1 && colon > slash || questionMark > -1 && colon > questionMark || numberSign > -1 && colon > numberSign) return true;
	let index = -1;
	while (++index < protocols.length) {
		const protocol = protocols[index];
		if (colon === protocol.length && url.slice(0, protocol.length) === protocol) return true;
	}
	return false;
}
/**
* Add data and position.
*
* @param {Nodes} node
*   Node to patch safe data and position on.
* @param {Readonly<Record<string, Readonly<unknown>>>} unsafe
*   Unsafe node-like value.
* @returns {undefined}
*   Nothing.
*/
function patch(node, unsafe) {
	const cleanPosition = position(unsafe);
	if (unsafe.data) node.data = esm_default(unsafe.data);
	if (cleanPosition) node.position = cleanPosition;
}
/**
*
* @param {Readonly<Array<PropertyDefinition>> | undefined} definitions
* @param {string} key
* @returns {Readonly<PropertyDefinition> | undefined}
*/
function findDefinition(definitions, key) {
	/** @type {PropertyDefinition | undefined} */
	let dataDefault;
	let index = -1;
	if (definitions) while (++index < definitions.length) {
		const entry = definitions[index];
		const name = typeof entry === "string" ? entry : entry[0];
		if (name === key) return entry;
		if (name === "data*") dataDefault = entry;
	}
	if (key.length > 4 && key.slice(0, 4).toLowerCase() === "data") return dataDefault;
}
// node_modules/.deno/rehype-sanitize@6.0.0/node_modules/rehype-sanitize/lib/index.js
/**
* @typedef {import('hast').Root} Root
* @typedef {import('hast-util-sanitize').Schema} Schema
*/
/**
* Sanitize HTML.
*
* @param {Schema | null | undefined} [options]
*   Configuration (optional).
* @returns
*   Transform.
*/
function rehypeSanitize(options) {
	/**
	* @param {Root} tree
	*   Tree.
	* @returns {Root}
	*   New tree.
	*/
	return function(tree) {
		return sanitize(tree, options);
	};
}
// common/markdown/context.ts
var KEY$1 = Symbol("tranquil-markdown");
var setMarkdownContext = (ctx) => setContext(KEY$1, ctx);
var getMarkdownContext = () => getContext(KEY$1);
// common/markdown/plugins.ts
function walk(node, visit) {
	visit(node);
	if ("children" in node && node.children) for (const child of node.children) walk(child, visit);
}
/**
* Numbers the task-list checkboxes in document order (`taskIndex`), so each one can say which
* task it is when it's clicked.
*/
function numberTasks() {
	return (tree) => {
		let n = 0;
		walk(tree, (node) => {
			if (node.type === "element" && node.tagName === "input" && node.properties.type === "checkbox") node.properties.taskIndex = n++;
		});
	};
}
/**
* Replaces each paragraph whose only text is a placeholder `WB<nonce>N<index>` with a
* `tq-insert` element carrying that index, which the renderer draws with the caller's component.
* The nonce is new on every render, so text in the document can't pose as a placeholder.
*/
function insertsAt(nonce) {
	const placeholder = new RegExp(`^WB${nonce}N(\\d+)$`);
	return (tree) => {
		walk(tree, (node) => {
			if (!("children" in node) || !node.children) return;
			node.children = node.children.map((child) => {
				if (child.type !== "element" || child.tagName !== "p" || child.children.length !== 1) return child;
				const [only] = child.children;
				const m = only.type === "text" ? placeholder.exec(only.value.trim()) : null;
				if (!m) return child;
				return {
					type: "element",
					tagName: "tq-insert",
					properties: { index: Number(m[1]) },
					children: []
				};
			});
		});
	};
}
// common/markdown/ImageAlt.svelte
var root$9 = /* @__PURE__ */ from_html(`<span class="image-alt"> </span>`);
function ImageAlt($$anchor, $$props) {
	var fragment = comment$1();
	var node = first_child(fragment);
	var consequent = ($$anchor) => {
		var span = root$9();
		var text = only_child(span, true);
		template_effect(() => set_text(text, $$props.alt));
		append($$anchor, span);
	};
	if_block(node, ($$render) => {
		if ($$props.alt) $$render(consequent);
	});
	append($$anchor, fragment);
}
// common/markdown/Link.svelte
var root$8 = /* @__PURE__ */ from_html(`<a><!></a>`);
function Link($$anchor, $$props) {
	push$1($$props, true);
	const ctx = getMarkdownContext();
	function onclick(e) {
		e.preventDefault();
		if ($$props.href) ctx.onLink($$props.href);
	}
	const refuse = (e) => e.preventDefault();
	var a = root$8();
	snippet(child(a), () => $$props.children ?? noop);
	reset(a);
	template_effect(() => {
		set_attribute(a, "href", $$props.href ?? void 0);
		set_attribute(a, "title", $$props.title);
	});
	delegated("click", a, onclick);
	event("auxclick", a, refuse);
	event("dragstart", a, refuse);
	append($$anchor, a);
	pop();
}
delegate(["click"]);
// common/markdown/TaskBox.svelte
var root$7 = /* @__PURE__ */ from_html(`<input type="checkbox"/>`);
function TaskBox($$anchor, $$props) {
	push$1($$props, true);
	let checked = prop($$props, "checked", 3, false);
	const ctx = getMarkdownContext();
	const live = /* @__PURE__ */ user_derived(() => $$props.type === "checkbox" && ctx.onTask !== null && typeof $$props.taskIndex === "number" && ctx.tasks[$$props.taskIndex] === Boolean(checked()));
	function onclick(e) {
		e.preventDefault();
		if (get(live)) ctx.onTask($$props.taskIndex, Boolean(checked()));
	}
	var fragment = comment$1();
	var node = first_child(fragment);
	var consequent = ($$anchor) => {
		var input = root$7();
		remove_input_defaults(input);
		template_effect(($0) => {
			set_checked(input, $0);
			input.disabled = !get(live);
		}, [() => Boolean(checked())]);
		delegated("click", input, onclick);
		append($$anchor, input);
	};
	if_block(node, ($$render) => {
		if ($$props.type === "checkbox") $$render(consequent);
	});
	append($$anchor, fragment);
	pop();
}
delegate(["click"]);
// common/markdown/Markdown.svelte
function Markdown_1($$anchor, $$props) {
	push$1($$props, true);
	let onLink = prop($$props, "onLink", 3, () => {}), tasks = prop($$props, "tasks", 19, () => []), onTask = prop($$props, "onTask", 3, null), inserts = prop($$props, "inserts", 3, null);
	setMarkdownContext({
		get onLink() {
			return onLink();
		},
		get tasks() {
			return tasks();
		},
		get onTask() {
			return onTask();
		}
	});
	const plugins = /* @__PURE__ */ user_derived(() => [
		gfmPlugin(),
		{ rehypePlugin: [rehypeSanitize, defaultSchema] },
		{ rehypePlugin: [numberTasks] },
		...inserts() ? [{
			rehypePlugin: [insertsAt, inserts().nonce],
			renderer: { "tq-insert": inserts().component }
		}] : [],
		{ renderer: {
			a: Link,
			img: ImageAlt,
			input: TaskBox
		} }
	]);
	dist_default($$anchor, {
		get md() {
			return $$props.md;
		},
		get plugins() {
			return get(plugins);
		}
	});
	pop();
}
// common/mount.js
function mountInShadow(host, Component, props, cssText) {
	host.classList.add("tranquil-ui");
	const shadow = host.attachShadow({ mode: "open" });
	const sheet = new CSSStyleSheet();
	sheet.replaceSync(cssText);
	shadow.adoptedStyleSheets = [sheet];
	const root = document.createElement("div");
	root.className = "tranquil-ui-root";
	shadow.append(root);
	const ui = {
		component: mount(Component, {
			target: root,
			props
		}),
		/** Marks dark or light from the host's color-scheme, for Tailwind's `dark:` variant. */
		syncMode() {
			if (host.isConnected) root.dataset.mode = getComputedStyle(host).colorScheme.includes("dark") ? "dark" : "light";
		},
		destroy: () => unmount(ui.component)
	};
	requestAnimationFrame(ui.syncMode);
	return ui;
}
// common/pane-item.js
/** A minimal event emitter: `on` returns what Pulsar expects of a subscription (a disposable). */
function emitter() {
	const handlers = /* @__PURE__ */ new Map();
	return {
		on(name, fn) {
			if (!handlers.has(name)) handlers.set(name, /* @__PURE__ */ new Set());
			handlers.get(name).add(fn);
			return { dispose: () => handlers.get(name)?.delete(fn) };
		},
		emit(name, value) {
			for (const fn of handlers.get(name) ?? []) fn(value);
		},
		clear: () => handlers.clear()
	};
}
var SveltePane = class {
	/**
	* `component` and `props` are what to draw; `css` is the built stylesheet; `className` goes on
	* the pane's element. `uri`, `title`, `iconName` and `allowedLocations` answer Pulsar's
	* questions, and `serialize(saved)` builds the saved state (with its `deserializer`) from what
	* the component's own `serialize()` returned. `slots` maps slot names to light-DOM elements, and
	* `onDestroy` runs when the pane closes.
	*/
	constructor({ component, props = {}, css, className, uri, title, iconName, allowedLocations, serialize, slots = {}, onDestroy }) {
		this.events = emitter();
		this.onDestroyed = onDestroy;
		this.uri = uri;
		this.title = title;
		this.iconName = iconName;
		this.allowedLocations = allowedLocations;
		this.serializeWith = serialize;
		this.pending = true;
		this.element = document.createElement("div");
		if (className) this.element.className = className;
		this.element.tabIndex = -1;
		this.element.addEventListener("mousedown", () => this.terminatePendingState(), { once: true });
		for (const [name, el] of Object.entries(slots)) {
			el.slot = name;
			this.element.append(el);
		}
		this.ui = mountInShadow(this.element, component, {
			...props,
			setTitle: (t) => this.setTitle(t)
		}, css);
		this.themes = atom.themes.onDidChangeActiveThemes(() => this.ui.syncMode());
	}
	setTitle(title) {
		if (!title || title === this.title) return;
		this.title = title;
		this.events.emit("did-change-title", title);
	}
	getTitle() {
		return this.title;
	}
	onDidChangeTitle(fn) {
		return this.events.on("did-change-title", fn);
	}
	getURI() {
		return this.uri;
	}
	getPath() {
		return this.uri;
	}
	getIconName() {
		return this.iconName;
	}
	getAllowedLocations() {
		return this.allowedLocations;
	}
	terminatePendingState() {
		if (!this.pending) return;
		this.pending = false;
		this.events.emit("did-terminate-pending-state");
	}
	onDidTerminatePendingState(fn) {
		return this.events.on("did-terminate-pending-state", fn);
	}
	serialize() {
		return this.serializeWith ? this.serializeWith(this.ui.component.serialize?.() ?? {}) : void 0;
	}
	onDidDestroy(fn) {
		return this.events.on("did-destroy", fn);
	}
	destroy() {
		this.themes.dispose();
		this.ui.destroy();
		this.onDestroyed?.();
		this.element.remove();
		this.events.emit("did-destroy");
		this.events.clear();
	}
};
// node_modules/.deno/svelte@5.57.3/node_modules/svelte/src/reactivity/map.js
/** @import { Source } from '#client' */
/**
* A reactive version of the built-in [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) object.
* Reading contents of the map (by iterating, or by reading `map.size` or calling `map.get(...)` or `map.has(...)` as in the [tic-tac-toe example](https://svelte.dev/playground/0b0ff4aa49c9443f9b47fe5203c78293) below) in an [effect](https://svelte.dev/docs/svelte/$effect) or [derived](https://svelte.dev/docs/svelte/$derived)
* will cause it to be re-evaluated as necessary when the map is updated.
*
* Note that values in a reactive map are _not_ made [deeply reactive](https://svelte.dev/docs/svelte/$state#Deep-state).
*
* ```svelte
* <script>
* 	import { SvelteMap } from 'svelte/reactivity';
* 	import { result } from './game.js';
*
* 	let board = new SvelteMap();
* 	let player = $state('x');
* 	let winner = $derived(result(board));
*
* 	function reset() {
* 		player = 'x';
* 		board.clear();
* 	}
* <\/script>
*
* <div class="board">
* 	{#each Array(9), i}
* 		<button
* 			disabled={board.has(i) || winner}
* 			onclick={() => {
* 				board.set(i, player);
* 				player = player === 'x' ? 'o' : 'x';
* 			}}
* 		>{board.get(i)}</button>
* 	{/each}
* </div>
*
* {#if winner}
* 	<p>{winner} wins!</p>
* 	<button onclick={reset}>reset</button>
* {:else}
* 	<p>{player} is next</p>
* {/if}
* ```
*
* @template K
* @template V
* @extends {Map<K, V>}
*/
var SvelteMap = class extends Map {
	/** @type {Map<K, Source<number>>} */
	#sources = /* @__PURE__ */ new Map();
	#version = /* @__PURE__ */ state(0);
	#size = /* @__PURE__ */ state(0);
	#update_version = update_version || -1;
	/**
	* @param {Iterable<readonly [K, V]> | null | undefined} [value]
	*/
	constructor(value) {
		super();
		if (value) {
			for (var [key, v] of value) super.set(key, v);
			this.#size.v = super.size;
		}
	}
	/**
	* If the source is being created inside the same reaction as the SvelteMap instance,
	* we use `state` so that it will not be a dependency of the reaction. Otherwise we
	* use `source` so it will be.
	*
	* @template T
	* @param {T} value
	* @returns {Source<T>}
	*/
	#source(value) {
		return update_version === this.#update_version ? /* @__PURE__ */ state(value) : source(value);
	}
	/** @param {K} key */
	has(key) {
		var sources = this.#sources;
		var s = sources.get(key);
		if (s === void 0) {
			if (super.has(key)) {
				s = this.#source(0);
				sources.set(key, s);
			} else {
				get(this.#version);
				return false;
			}
		}
		get(s);
		return true;
	}
	/**
	* @param {(value: V, key: K, map: Map<K, V>) => void} callbackfn
	* @param {any} [this_arg]
	*/
	forEach(callbackfn, this_arg) {
		this.#read_all();
		super.forEach(callbackfn, this_arg);
	}
	/** @param {K} key */
	get(key) {
		var sources = this.#sources;
		var s = sources.get(key);
		if (s === void 0) {
			if (super.has(key)) {
				s = this.#source(0);
				sources.set(key, s);
			} else {
				get(this.#version);
				return;
			}
		}
		get(s);
		return super.get(key);
	}
	/**
	* @param {K} key
	* @param {V} value
	* */
	getOrInsert(key, value) {
		if (!super.has(key)) this.set(key, value);
		return this.get(key);
	}
	/**
	* @param {K} key
	* @param {(key: K) => V} callbackFn
	*/
	getOrInsertComputed(key, callbackFn) {
		if (!super.has(key)) this.set(key, callbackFn(key));
		return this.get(key);
	}
	/**
	* @param {K} key
	* @param {V} value
	* */
	set(key, value) {
		var sources = this.#sources;
		var s = sources.get(key);
		var prev_res = super.get(key);
		var res = super.set(key, value);
		var version = this.#version;
		if (s === void 0) {
			s = this.#source(0);
			sources.set(key, s);
			set(this.#size, super.size);
			increment(version);
		} else if (prev_res !== value) {
			increment(s);
			var v_reactions = version.reactions === null ? null : new Set(version.reactions);
			if (v_reactions === null || !s.reactions?.every((r) => v_reactions.has(r))) increment(version);
		}
		return res;
	}
	/** @param {K} key */
	delete(key) {
		var sources = this.#sources;
		var s = sources.get(key);
		var res = super.delete(key);
		if (s !== void 0) {
			sources.delete(key);
			set(s, -1);
		}
		if (res) {
			set(this.#size, super.size);
			increment(this.#version);
		}
		return res;
	}
	clear() {
		if (super.size === 0) return;
		super.clear();
		var sources = this.#sources;
		set(this.#size, 0);
		for (var s of sources.values()) set(s, -1);
		increment(this.#version);
		sources.clear();
	}
	#read_all() {
		get(this.#version);
		var sources = this.#sources;
		if (this.#size.v !== sources.size) {
			for (var key of super.keys()) if (!sources.has(key)) {
				var s = this.#source(0);
				sources.set(key, s);
			}
		}
		for ([, s] of this.#sources) get(s);
	}
	keys() {
		get(this.#version);
		return super.keys();
	}
	values() {
		this.#read_all();
		return super.values();
	}
	entries() {
		this.#read_all();
		return super.entries();
	}
	[Symbol.iterator]() {
		return this.entries();
	}
	get size() {
		get(this.#size);
		return super.size;
	}
};
// workbook/context.js
var KEY = Symbol("tranquil-workbook");
var setWorkbookContext = (ctx) => setContext(KEY, ctx);
var getWorkbookContext = () => getContext(KEY);
// workbook/ConversationEntry.svelte
var root$6 = /* @__PURE__ */ from_html(`<span class="text-surface-700-300"> </span>`);
var root_1$5 = /* @__PURE__ */ from_html(`<p class="mt-1 whitespace-pre-wrap"> </p>`);
var root_2$4 = /* @__PURE__ */ from_html(`<div class="mt-1"><!></div>`);
var root_3$3 = /* @__PURE__ */ from_html(`<details class="entry border-surface-300-700 my-1 ml-6 border-l-2 pl-3 text-sm"><summary class="cursor-pointer"><span class="font-semibold"> </span> <!> <span class="text-surface-700-300"> </span></summary> <!></details>`);
function ConversationEntry($$anchor, $$props) {
	push$1($$props, true);
	var details = root_3$3();
	var summary = child(details);
	var span = child(summary);
	var text = only_child(span, true);
	var node = sibling(span, 2);
	var consequent = ($$anchor) => {
		var span_1 = root$6();
		var text_1 = only_child(span_1);
		template_effect(() => set_text(text_1, `· ${$$props.entry.time ?? ""}`));
		append($$anchor, span_1);
	};
	if_block(node, ($$render) => {
		if ($$props.entry.time) $$render(consequent);
	});
	var text_2 = only_child(sibling(node, 2));
	reset(summary);
	var node_1 = sibling(summary, 2);
	var consequent_1 = ($$anchor) => {
		var p = root_1$5();
		var text_3 = only_child(p, true);
		template_effect(() => set_text(text_3, $$props.entry.body));
		append($$anchor, p);
	};
	var alternate = ($$anchor) => {
		var div = root_2$4();
		Markdown_1(child(div), {
			get md() {
				return $$props.entry.body;
			},
			get onLink() {
				return $$props.onLink;
			}
		});
		reset(div);
		append($$anchor, div);
	};
	if_block(node_1, ($$render) => {
		if ($$props.entry.kind === "message") $$render(consequent_1);
		else $$render(alternate, -1);
	});
	reset(details);
	template_effect(($0) => {
		details.open = $0;
		set_text(text, $$props.entry.kind === "message" ? "You" : "Agent");
		set_text(text_2, `· ${$$props.entry.summary ?? ""}`);
	}, [() => $$props.isOpen($$props.entry.key, $$props.entry.startOpen)]);
	event("toggle", details, (e) => $$props.setOpen($$props.entry.key, e.currentTarget.open));
	append($$anchor, details);
	pop();
}
// workbook/FileView.svelte
var root$5 = /* @__PURE__ */ from_html(`<pre class="mt-2"><code> </code></pre>`);
var root_1$4 = /* @__PURE__ */ from_html(`<details class="card border-surface-200-800 my-3 border p-3"><summary class="cursor-pointer"><span class="font-mono text-sm"> </span> <span> </span></summary> <!></details>`);
function FileView($$anchor, $$props) {
	push$1($$props, true);
	var details = root_1$4();
	var summary = child(details);
	var span = child(summary);
	var text = only_child(span, true);
	var span_1 = sibling(span, 2);
	var text_1 = only_child(span_1, true);
	reset(summary);
	var node = sibling(summary, 2);
	var consequent = ($$anchor) => {
		var pre = root$5();
		var text_2 = only_child(child(pre), true);
		reset(pre);
		template_effect(() => set_text(text_2, $$props.file.text));
		append($$anchor, pre);
	};
	if_block(node, ($$render) => {
		if ($$props.file.text !== void 0) $$render(consequent);
	});
	reset(details);
	template_effect(($0) => {
		details.open = $0;
		set_text(text, $$props.file.path ?? "(no path)");
		set_class(span_1, 1, `ml-2 text-sm ${$$props.file.error ? "text-error-500" : "text-surface-700-300"}`);
		set_text(text_1, $$props.file.state);
	}, [() => $$props.isOpen($$props.file.key, false)]);
	event("toggle", details, (e) => $$props.setOpen($$props.file.key, e.currentTarget.open));
	append($$anchor, details);
	pop();
}
// workbook/ResultView.svelte
var root$4 = /* @__PURE__ */ from_html(`<th> </th>`);
var root_1$3 = /* @__PURE__ */ from_html(`<td> </td>`);
var root_2$3 = /* @__PURE__ */ from_html(`<tr></tr>`);
var root_3$2 = /* @__PURE__ */ from_html(`<div class="table-wrap"><table class="table"><thead><tr></tr></thead><tbody></tbody></table></div>`);
var root_4$2 = /* @__PURE__ */ from_html(`<tr><th class="text-left"> </th><td> </td></tr>`);
var root_5$1 = /* @__PURE__ */ from_html(`<table class="table"><tbody></tbody></table>`);
var root_6$1 = /* @__PURE__ */ from_html(`<pre><code> </code></pre>`);
var root_7 = /* @__PURE__ */ from_html(`<div class="text-sm font-semibold">Result</div> <!>`, 1);
function ResultView($$anchor, $$props) {
	push$1($$props, true);
	const isRecord = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
	const rows = /* @__PURE__ */ user_derived(() => Array.isArray($$props.value) && $$props.value.length > 0 && $$props.value.every(isRecord) ? $$props.value : null);
	const columns = /* @__PURE__ */ user_derived(() => get(rows) ? [...new Set(get(rows).flatMap((r) => Object.keys(r)))] : []);
	const cell = (v) => v === null || v === void 0 ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
	var fragment = root_7();
	var node = sibling(first_child(fragment), 2);
	var consequent = ($$anchor) => {
		var div = root_3$2();
		var table = child(div);
		var thead = child(table);
		var tr = child(thead);
		each(tr, 21, () => get(columns), index$1, ($$anchor, column) => {
			var th = root$4();
			var text = only_child(th, true);
			template_effect(() => set_text(text, get(column)));
			append($$anchor, th);
		});
		reset(tr);
		reset(thead);
		var tbody = sibling(thead);
		each(tbody, 21, () => get(rows), index$1, ($$anchor, row) => {
			var tr_1 = root_2$3();
			each(tr_1, 21, () => get(columns), index$1, ($$anchor, column) => {
				var td = root_1$3();
				var text_1 = only_child(td, true);
				template_effect(($0) => set_text(text_1, $0), [() => cell(get(row)[get(column)])]);
				append($$anchor, td);
			});
			reset(tr_1);
			append($$anchor, tr_1);
		});
		reset(tbody);
		reset(table);
		reset(div);
		append($$anchor, div);
	};
	var consequent_1 = ($$anchor) => {
		var table_1 = root_5$1();
		var tbody_1 = child(table_1);
		each(tbody_1, 21, () => Object.entries($$props.value), index$1, ($$anchor, $$item) => {
			var $$array = /* @__PURE__ */ user_derived(() => to_array(get($$item), 2));
			let name = () => get($$array)[0];
			let v = () => get($$array)[1];
			var tr_2 = root_4$2();
			var th_1 = child(tr_2);
			var text_2 = only_child(th_1, true);
			var text_3 = only_child(sibling(th_1), true);
			reset(tr_2);
			template_effect(($0) => {
				set_text(text_2, name());
				set_text(text_3, $0);
			}, [() => cell(v())]);
			append($$anchor, tr_2);
		});
		reset(tbody_1);
		reset(table_1);
		append($$anchor, table_1);
	};
	var d = /* @__PURE__ */ user_derived(() => isRecord($$props.value));
	var alternate = ($$anchor) => {
		var pre = root_6$1();
		var text_4 = only_child(child(pre), true);
		reset(pre);
		template_effect(($0) => set_text(text_4, $0), [() => JSON.stringify($$props.value, null, 2)]);
		append($$anchor, pre);
	};
	if_block(node, ($$render) => {
		if (get(rows)) $$render(consequent);
		else if (get(d)) $$render(consequent_1, 1);
		else $$render(alternate, -1);
	});
	append($$anchor, fragment);
	pop();
}
// workbook/OutputBlock.svelte
var root$3 = /* @__PURE__ */ from_html(`<pre class="m-0 rounded-none"><code> </code></pre>`);
var root_1$2 = /* @__PURE__ */ from_html(`<div class="px-3 pb-3"><!></div>`);
var root_2$2 = /* @__PURE__ */ from_html(`<div class="card border-surface-200-800 my-3 border"><div class="border-surface-200-800 flex flex-wrap items-center gap-2 border-b px-3 py-2 text-sm"><span class="font-semibold">Code output</span> <span> </span> <span> </span> <span class="text-surface-700-300"> </span></div> <!> <!></div>`);
function OutputBlock($$anchor, $$props) {
	push$1($$props, true);
	const TONES = {
		success: "preset-tonal-success",
		error: "preset-tonal-error",
		warning: "preset-tonal-warning",
		surface: "preset-filled-surface-200-800"
	};
	var div = root_2$2();
	var div_1 = child(div);
	var span = sibling(child(div_1), 2);
	var text = only_child(span);
	var span_1 = sibling(span, 2);
	var text_1 = only_child(span_1, true);
	var text_2 = only_child(sibling(span_1, 2), true);
	reset(div_1);
	var node = sibling(div_1, 2);
	var consequent = ($$anchor) => {
		var pre = root$3();
		var text_3 = only_child(child(pre), true);
		reset(pre);
		template_effect(() => set_text(text_3, $$props.output.text));
		append($$anchor, pre);
	};
	if_block(node, ($$render) => {
		if ($$props.output.text) $$render(consequent);
	});
	var node_1 = sibling(node, 2);
	var consequent_1 = ($$anchor) => {
		var div_2 = root_1$2();
		ResultView(child(div_2), { get value() {
			return $$props.output.result;
		} });
		reset(div_2);
		append($$anchor, div_2);
	};
	if_block(node_1, ($$render) => {
		if ($$props.output.hasResult) $$render(consequent_1);
	});
	reset(div);
	template_effect(($0) => {
		set_text(text, `${$$props.output.script ?? ""} · run by you`);
		set_class(span_1, 1, `badge ${TONES[$$props.output.tone] ?? TONES.surface ?? ""}`);
		set_text(text_1, $$props.output.state);
		set_text(text_2, $0);
	}, [() => [$$props.output.time, $$props.output.duration].filter(Boolean).join(" · ")]);
	append($$anchor, div);
	pop();
}
// workbook/run-machine.ts
var RUN_TABLE = {
	idle: { run: "starting" },
	starting: {
		started: "running",
		refused: "writing",
		threw: "writing"
	},
	running: {
		ended: "writing",
		threw: "writing"
	},
	writing: {
		written: "idle",
		writeFailed: "idle"
	}
};
/** The phase `event` leads to from `phase`, or null when `phase` doesn't allow it. */
function next(phase, event) {
	return RUN_TABLE[phase][event] ?? null;
}
/** Whether `phase` allows `event`. */
function can(phase, event) {
	return next(phase, event) !== null;
}
// workbook/RunCard.svelte
var root$2 = /* @__PURE__ */ from_html(`<span class="badge preset-tonal-warning">script changed since this run</span>`);
var root_1$1 = /* @__PURE__ */ from_html(`<span> </span> <!> <span class="ml-auto flex gap-2"><button type="button" class="btn btn-sm preset-tonal-surface">Ask about this step</button> <button type="button" class="btn btn-sm preset-filled-primary-500"> </button></span>`, 1);
var root_2$1 = /* @__PURE__ */ from_html(`<p class="mt-2"> </p>`);
var root_3$1 = /* @__PURE__ */ from_html(`<details class="mt-2"><summary class="text-surface-700-300 cursor-pointer">source</summary> <pre><code> </code></pre></details>`);
var root_4$1 = /* @__PURE__ */ from_html(`<div><div class="flex flex-wrap items-center gap-2"><span class="font-mono text-sm"> </span> <!></div> <!></div>`);
function RunCard($$anchor, $$props) {
	push$1($$props, true);
	const state = /* @__PURE__ */ user_derived(() => $$props.run.state);
	const phase = /* @__PURE__ */ user_derived(() => get(state).kind === "running" ? get(state).phase : "idle");
	const sourceKey = /* @__PURE__ */ user_derived(() => `${$$props.run.key}:source`);
	const RUN_LABELS = {
		idle: "Run",
		starting: "Starting…",
		running: "Running…",
		writing: "Running…"
	};
	var div = root_4$1();
	var div_1 = child(div);
	var span = child(div_1);
	var text = only_child(span, true);
	var node = sibling(span, 2);
	var consequent_1 = ($$anchor) => {
		var fragment = root_1$1();
		var span_1 = first_child(fragment);
		var text_1 = only_child(span_1, true);
		var node_1 = sibling(span_1, 2);
		var consequent = ($$anchor) => {
			append($$anchor, root$2());
		};
		if_block(node_1, ($$render) => {
			if (get(state).kind === "changed") $$render(consequent);
		});
		var span_3 = sibling(node_1, 2);
		var button = child(span_3);
		var button_1 = sibling(button, 2);
		var text_2 = only_child(button_1, true);
		reset(span_3);
		template_effect(($0) => {
			set_class(span_1, 1, `badge ${get(state).script.grants.error ? "preset-tonal-error" : "preset-filled-surface-200-800"}`);
			set_attribute(span_1, "title", get(state).script.grants.detail);
			set_text(text_1, get(state).script.grants.summary);
			button_1.disabled = $0;
			set_text(text_2, RUN_LABELS[get(phase)]);
		}, [() => $$props.locked || !can(get(phase), "run")]);
		delegated("click", button, () => $$props.onAsk($$props.run.id));
		delegated("click", button_1, () => $$props.onRun($$props.run.id));
		append($$anchor, fragment);
	};
	if_block(node, ($$render) => {
		if (get(state).kind !== "refused") $$render(consequent_1);
	});
	reset(div_1);
	var node_2 = sibling(div_1, 2);
	var consequent_2 = ($$anchor) => {
		var p = root_2$1();
		var text_3 = only_child(p, true);
		template_effect(() => set_text(text_3, get(state).reason));
		append($$anchor, p);
	};
	var alternate = ($$anchor) => {
		var details = root_3$1();
		var pre = sibling(child(details), 2);
		var text_4 = only_child(child(pre), true);
		reset(pre);
		reset(details);
		template_effect(($0) => {
			details.open = $0;
			set_text(text_4, get(state).script.source);
		}, [() => $$props.isOpen(get(sourceKey), get(state).kind === "new" || get(state).kind === "changed")]);
		event("toggle", details, (e) => $$props.setOpen(get(sourceKey), e.currentTarget.open));
		append($$anchor, details);
	};
	if_block(node_2, ($$render) => {
		if (get(state).kind === "refused") $$render(consequent_2);
		else $$render(alternate, -1);
	});
	reset(div);
	template_effect(() => {
		set_class(div, 1, `card my-3 border p-3 ${get(state).kind === "refused" ? "preset-tonal-error border-error-500" : "border-surface-200-800"}`);
		set_text(text, $$props.run.path ?? "(no script)");
	});
	append($$anchor, div);
	pop();
}
delegate(["click"]);
// workbook/UnverifiedBlock.svelte
var root$1 = /* @__PURE__ */ from_html(`<div class="card border-surface-300-700 my-3 border border-dashed p-3"><div class="text-surface-700-300 text-sm"> </div> <pre class="mt-1"><code> </code></pre></div>`);
function UnverifiedBlock($$anchor, $$props) {
	push$1($$props, true);
	var div = root$1();
	var div_1 = child(div);
	var text = only_child(div_1, true);
	var pre = sibling(div_1, 2);
	var text_1 = only_child(child(pre), true);
	reset(pre);
	reset(div);
	template_effect(() => {
		set_text(text, $$props.block.label);
		set_text(text_1, $$props.block.body);
	});
	append($$anchor, div);
	pop();
}
// workbook/Block.svelte
function Block($$anchor, $$props) {
	push$1($$props, true);
	const wb = getWorkbookContext();
	const block = /* @__PURE__ */ user_derived(() => wb.model?.blocks?.[$$props.index]);
	var fragment = comment$1();
	var node = first_child(fragment);
	var consequent_4 = ($$anchor) => {
		var fragment_1 = comment$1();
		var node_1 = first_child(fragment_1);
		var consequent = ($$anchor) => {
			RunCard($$anchor, {
				get run() {
					return get(block);
				},
				get locked() {
					return wb.model.locked;
				},
				get isOpen() {
					return wb.isOpen;
				},
				get setOpen() {
					return wb.setOpen;
				},
				get onRun() {
					return wb.onRun;
				},
				get onAsk() {
					return wb.onAsk;
				}
			});
		};
		var consequent_1 = ($$anchor) => {
			FileView($$anchor, {
				get file() {
					return get(block);
				},
				get isOpen() {
					return wb.isOpen;
				},
				get setOpen() {
					return wb.setOpen;
				}
			});
		};
		var consequent_2 = ($$anchor) => {
			OutputBlock($$anchor, { get output() {
				return get(block);
			} });
		};
		var consequent_3 = ($$anchor) => {
			UnverifiedBlock($$anchor, { get block() {
				return get(block);
			} });
		};
		var alternate = ($$anchor) => {
			ConversationEntry($$anchor, {
				get entry() {
					return get(block);
				},
				get isOpen() {
					return wb.isOpen;
				},
				get setOpen() {
					return wb.setOpen;
				},
				get onLink() {
					return wb.onLink;
				}
			});
		};
		if_block(node_1, ($$render) => {
			if (get(block).kind === "run") $$render(consequent);
			else if (get(block).kind === "file") $$render(consequent_1, 1);
			else if (get(block).kind === "output") $$render(consequent_2, 2);
			else if (get(block).kind === "unverified") $$render(consequent_3, 3);
			else $$render(alternate, -1);
		});
		append($$anchor, fragment_1);
	};
	if_block(node, ($$render) => {
		if (get(block)) $$render(consequent_4);
	});
	append($$anchor, fragment);
	pop();
}
// workbook/Workbook.svelte
var root = /* @__PURE__ */ from_html(`<div class="card preset-tonal-error p-3"> </div>`);
var root_1 = /* @__PURE__ */ from_html(`<div class="card preset-tonal-warning mb-4 p-3">This workbook has unsaved changes in an editor. Save or discard them to run steps, tick boxes or send
            messages.</div>`);
var root_2 = /* @__PURE__ */ from_html(`<li> </li>`);
var root_3 = /* @__PURE__ */ from_html(`<div class="card preset-tonal-warning mb-4 p-3"><p class="font-semibold">This workbook has problems:</p> <ul class="mt-1 list-disc pl-5"></ul></div>`);
var root_4 = /* @__PURE__ */ from_html(`<!> <!> <div class="markdown"><!></div>`, 1);
var root_5 = /* @__PURE__ */ from_html(`<div class="mb-1 flex items-center gap-2 text-sm"><span>About step <code> </code></span> <button type="button" class="btn btn-sm preset-tonal-surface">Not about a step</button></div>`);
var root_6 = /* @__PURE__ */ from_html(`<div class="view svelte-1pkf3dj"><div class="scroller svelte-1pkf3dj"><div class="workbook svelte-1pkf3dj"><!></div></div> <div class="composer border-surface-200-800 border-t px-6 py-3"><!> <div class="flex items-end gap-2"><div class="min-w-0 flex-1"><!></div> <button type="button" class="btn preset-filled-primary-500">Send</button></div> <p class="text-surface-700-300 mt-1 text-xs"> </p></div></div>`);
function Workbook($$anchor, $$props) {
	push$1($$props, true);
	let scrollTop = prop($$props, "scrollTop", 3, 0);
	let model = /* @__PURE__ */ state(null);
	const opened = new SvelteMap();
	let askStep = /* @__PURE__ */ state(null);
	let scroller;
	let drawn = false;
	const sendKeys = /Mac/.test(navigator.platform) ? "⌘↩" : "Ctrl+Enter";
	const isOpen = (key, byDefault) => opened.has(key) ? opened.get(key) : byDefault;
	const setOpen = (key, open) => opened.set(key, open);
	const onLink = (href) => $$props.service.openLink($$props.filePath, href);
	function ask(stepId) {
		set(askStep, stepId, true);
		$$props.composer.focus();
	}
	setWorkbookContext({
		get model() {
			return get(model);
		},
		isOpen,
		setOpen,
		onLink,
		onRun: (id) => $$props.service.runStep($$props.filePath, id),
		onAsk: ask
	});
	user_effect(() => $$props.service.watchWorkbook($$props.filePath, (next) => {
		const atBottom = drawn && scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 40;
		const top = drawn ? scroller.scrollTop : scrollTop();
		flushSync(() => set(model, next));
		scroller.scrollTop = atBottom ? scroller.scrollHeight : top;
		drawn = true;
		$$props.setTitle(next.title);
	}));
	user_effect(() => {
		const sub = $$props.composer.onSubmit(send);
		return () => sub.dispose();
	});
	function serialize() {
		return { scrollTop: scroller?.scrollTop ?? 0 };
	}
	function send() {
		if (!get(model) || get(model).error || get(model).locked) return;
		if ($$props.service.sendMessage($$props.filePath, $$props.composer.getText(), get(askStep))) {
			$$props.composer.clear();
			set(askStep, null);
		}
	}
	const onTask = /* @__PURE__ */ user_derived(() => get(model) && !get(model).error && !get(model).locked ? (index, wasChecked) => $$props.service.toggleTask($$props.filePath, index, wasChecked) : null);
	var $$exports = { serialize };
	var div = root_6();
	var div_1 = child(div);
	var div_2 = child(div_1);
	var node = child(div_2);
	var consequent = ($$anchor) => {
		var div_3 = root();
		var text = only_child(div_3, true);
		template_effect(() => set_text(text, get(model).error));
		append($$anchor, div_3);
	};
	var consequent_3 = ($$anchor) => {
		var fragment = root_4();
		var node_1 = first_child(fragment);
		var consequent_1 = ($$anchor) => {
			append($$anchor, root_1());
		};
		if_block(node_1, ($$render) => {
			if (get(model).locked) $$render(consequent_1);
		});
		var node_2 = sibling(node_1, 2);
		var consequent_2 = ($$anchor) => {
			var div_5 = root_3();
			var ul = sibling(child(div_5), 2);
			each(ul, 21, () => get(model).warnings, index$1, ($$anchor, warning) => {
				var li = root_2();
				var text_1 = only_child(li, true);
				template_effect(() => set_text(text_1, get(warning)));
				append($$anchor, li);
			});
			reset(ul);
			reset(div_5);
			append($$anchor, div_5);
		};
		if_block(node_2, ($$render) => {
			if (get(model).warnings.length) $$render(consequent_2);
		});
		var div_6 = sibling(node_2, 2);
		var node_3 = child(div_6);
		{
			let $0 = /* @__PURE__ */ user_derived(() => ({
				nonce: get(model).nonce,
				component: Block
			}));
			Markdown_1(node_3, {
				get md() {
					return get(model).markdown;
				},
				onLink,
				get tasks() {
					return get(model).tasks;
				},
				get onTask() {
					return get(onTask);
				},
				get inserts() {
					return get($0);
				}
			});
		}
		reset(div_6);
		append($$anchor, fragment);
	};
	if_block(node, ($$render) => {
		if (get(model)?.error) $$render(consequent);
		else if (get(model)) $$render(consequent_3, 1);
	});
	reset(div_2);
	reset(div_1);
	bind_this(div_1, ($$value) => scroller = $$value, () => scroller);
	var div_7 = sibling(div_1, 2);
	var node_4 = child(div_7);
	var consequent_4 = ($$anchor) => {
		var div_8 = root_5();
		var span = child(div_8);
		var text_2 = only_child(sibling(child(span)), true);
		reset(span);
		var button = sibling(span, 2);
		reset(div_8);
		template_effect(() => set_text(text_2, get(askStep)));
		delegated("click", button, () => set(askStep, null));
		append($$anchor, div_8);
	};
	if_block(node_4, ($$render) => {
		if (get(askStep)) $$render(consequent_4);
	});
	var div_9 = sibling(node_4, 2);
	var div_10 = child(div_9);
	element$1(child(div_10), () => "slot", false, ($$element, $$anchor) => {
		attribute_effect($$element, () => ({ name: "composer" }));
	});
	reset(div_10);
	var button_1 = sibling(div_10, 2);
	reset(div_9);
	var text_3 = only_child(sibling(div_9, 2));
	reset(div_7);
	reset(div);
	template_effect(() => {
		button_1.disabled = !get(model) || get(model).error || get(model).locked;
		set_text(text_3, `${sendKeys} sends. Your LLM reads the workbook and replies in it.`);
	});
	delegated("click", button_1, send);
	append($$anchor, div);
	return pop($$exports);
}
delegate(["click"]);
// workbook/disk.ts
var READ_CAP = 65536;
var messageOf$1 = (e) => e instanceof Error ? e.message : String(e);
var codeOf$1 = (e) => typeof e === "object" && e !== null && "code" in e ? String(e.code) : void 0;
function realish(p) {
	let head = p;
	const tail = [];
	for (;;) try {
		return node_path.default.join(node_fs.default.realpathSync(head), ...tail);
	} catch {
		const parent = node_path.default.dirname(head);
		if (parent === head) return p;
		tail.unshift(node_path.default.basename(head));
		head = parent;
	}
}
function inside(root, p) {
	const rel = node_path.default.relative(root, p);
	return rel === "" || !rel.startsWith("..") && !node_path.default.isAbsolute(rel);
}
/**
* Resolves a path a workbook names (a run block's script, a file block, a relative link) against
* the workbook's folder, and keeps it inside `root` (the project that holds the workbook). `ext`,
* when given, is the extension it must have.
*/
function resolveInProject(root, docPath, rel, opts = {}) {
	const name = String(rel || "").trim();
	if (!name) return {
		ok: false,
		reason: "no path given"
	};
	if (node_path.default.isAbsolute(name) || name.startsWith("~")) return {
		ok: false,
		reason: `"${name}" must be relative to the workbook`
	};
	if (opts.ext && !name.endsWith(opts.ext)) return {
		ok: false,
		reason: `"${name}" must end in ${opts.ext}`
	};
	const abs = node_path.default.resolve(node_path.default.dirname(docPath), name);
	if (!inside(realish(root), realish(abs))) return {
		ok: false,
		reason: `"${name}" is outside this project`
	};
	return {
		ok: true,
		abs
	};
}
/** Reads a text file, cut at `cap` bytes. */
function readCapped(abs, cap = READ_CAP) {
	let fd;
	try {
		const stat = node_fs.default.statSync(abs);
		if (!stat.isFile()) return {
			ok: false,
			missing: false,
			reason: "not a file"
		};
		fd = node_fs.default.openSync(abs, "r");
		const size = Math.min(stat.size, cap);
		const buf = node_buffer.Buffer.alloc(size);
		node_fs.default.readSync(fd, buf, 0, size, 0);
		return {
			ok: true,
			text: buf.toString("utf8"),
			truncated: stat.size > cap,
			mtimeMs: stat.mtimeMs
		};
	} catch (e) {
		if (codeOf$1(e) === "ENOENT") return {
			ok: false,
			missing: true,
			reason: "not written yet"
		};
		return {
			ok: false,
			missing: false,
			reason: messageOf$1(e)
		};
	} finally {
		if (fd !== void 0) node_fs.default.closeSync(fd);
	}
}
/**
* Applies `edit` to a workbook safely. `edit` takes the file's text and returns the new text, or
* null to leave it alone. The new text goes to a temporary file beside the workbook, which is
* renamed over it only if nothing else wrote the workbook in between; otherwise it reads again and
* retries, up to three times. A symlinked workbook is written through to the file it points to,
* and the file keeps its permissions.
*/
function writeDoc(filePath, edit) {
	let real = filePath;
	try {
		for (let hops = 0; hops < 8 && node_fs.default.lstatSync(real).isSymbolicLink(); hops++) real = node_path.default.resolve(node_path.default.dirname(real), node_fs.default.readlinkSync(real));
	} catch (e) {
		return {
			ok: false,
			reason: messageOf$1(e)
		};
	}
	for (let attempt = 0; attempt < 3; attempt++) {
		let before;
		try {
			before = node_fs.default.readFileSync(real, "utf8");
		} catch (e) {
			return {
				ok: false,
				reason: messageOf$1(e)
			};
		}
		const next = edit(before);
		if (next === null || next === before) return {
			ok: true,
			changed: false
		};
		const tmp = node_path.default.join(node_path.default.dirname(real), `.${node_path.default.basename(real)}.${process.pid}.${Date.now()}.tmp`);
		try {
			node_fs.default.writeFileSync(tmp, next, {
				mode: node_fs.default.statSync(real).mode & 511,
				flag: "wx"
			});
			if (node_fs.default.readFileSync(real, "utf8") !== before) {
				node_fs.default.rmSync(tmp, { force: true });
				continue;
			}
			node_fs.default.renameSync(tmp, real);
			return {
				ok: true,
				changed: true
			};
		} catch (e) {
			node_fs.default.rmSync(tmp, { force: true });
			return {
				ok: false,
				reason: messageOf$1(e)
			};
		}
	}
	return {
		ok: false,
		reason: "the workbook kept changing while Tranquil was writing to it; try again"
	};
}
// workbook/format.ts
var BLOCK_KINDS = [
	"run",
	"file",
	"output",
	"message",
	"reply"
];
var STEP_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
var FENCE = /^(`{3,}|~{3,})(.*)$/;
var TASK = /^(\s*(?:>\s*)*(?:[-*+]|\d+[.)])\s+)\[( |x|X)\]\s/;
var isBlockKind = (word) => BLOCK_KINDS.includes(word);
function unquote(s) {
	const t = s.trim();
	if (t.length >= 2 && (t[0] === "\"" && t.endsWith("\"") || t[0] === "'" && t.endsWith("'"))) return t.slice(1, -1);
	return t;
}
function scalar(s) {
	const t = s.trim();
	if (t === "true") return true;
	if (t === "false") return false;
	if (t.startsWith("[") && t.endsWith("]")) {
		const inner = t.slice(1, -1).trim();
		return inner === "" ? [] : inner.split(",").map(unquote);
	}
	return unquote(t);
}
/** The lines between the opening and closing `---`. */
function parseFrontMatter(lines) {
	const data = {};
	const warnings = [];
	let list = null;
	let item = null;
	for (const raw of lines) {
		if (raw.trim() === "" || raw.trim().startsWith("#")) continue;
		const top = raw.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
		if (top) {
			list = null;
			item = null;
			if (top[2] === "") {
				list = [];
				data[top[1]] = list;
			} else data[top[1]] = scalar(top[2]);
			continue;
		}
		const entry = raw.match(/^\s+-\s+(.*)$/);
		if (entry && list) {
			const pair = entry[1].match(/^([A-Za-z][\w-]*):\s*(.*)$/);
			if (pair) {
				item = { [pair[1]]: scalar(pair[2]) };
				list.push(item);
			} else {
				item = null;
				list.push(scalar(entry[1]));
			}
			continue;
		}
		const more = raw.match(/^\s{2,}([A-Za-z][\w-]*):\s*(.*)$/);
		if (more && item) {
			item[more[1]] = scalar(more[2]);
			continue;
		}
		warnings.push(`front matter: can't read "${raw.trim()}"`);
	}
	return {
		data,
		warnings
	};
}
function parseInfo(info) {
	const words = info.trim().split(/\s+/).filter(Boolean);
	const kind = words[0] || "";
	const attrs = {};
	const rest = [];
	for (const w of words.slice(1)) {
		const eq = w.indexOf("=");
		if (eq > 0) attrs[w.slice(0, eq)] = w.slice(eq + 1);
		else rest.push(w);
	}
	return {
		kind,
		id: rest[0],
		attrs
	};
}
/** Parses a workbook's text: its front matter, its own blocks, other fences, tasks and title. */
function parseDoc(text) {
	const src = String(text);
	const warnings = [];
	const lines = src.split("\n");
	const starts = [];
	let at = 0;
	for (const l of lines) {
		starts.push(at);
		at += l.length + 1;
	}
	const lineText = (i) => lines[i].replace(/\r$/, "");
	let frontMatter = {};
	let first = 0;
	if (lines.length > 1 && lineText(0) === "---") {
		const close = lines.findIndex((l, i) => i > 0 && l.replace(/\r$/, "") === "---");
		if (close > 0) {
			const fm = parseFrontMatter(lines.slice(1, close).map((l) => l.replace(/\r$/, "")));
			frontMatter = fm.data;
			warnings.push(...fm.warnings);
			first = close + 1;
		} else warnings.push("front matter: no closing ---");
	}
	const blocks = [];
	const fences = [];
	const tasks = [];
	let title = null;
	for (let i = first; i < lines.length; i++) {
		const open = lineText(i).match(FENCE);
		if (!open) {
			const t = lineText(i).match(TASK);
			if (t) tasks.push({
				index: tasks.length,
				line: i + 1,
				checked: t[2] !== " ",
				offset: starts[i] + t[1].length + 1
			});
			if (title === null) {
				const h = lineText(i).match(/^#\s+(.+?)\s*#*\s*$/);
				if (h) title = h[1];
			}
			continue;
		}
		const marker = open[1];
		const close = new RegExp(`^${marker[0] === "`" ? "`" : "~"}{${marker.length},}\\s*$`);
		let j = i + 1;
		while (j < lines.length && !close.test(lineText(j))) j++;
		const closed = j < lines.length;
		const body = lines.slice(i + 1, j).map((l) => l.replace(/\r$/, "")).join("\n");
		const end = closed ? starts[j] + lineText(j).length : src.length;
		const info = parseInfo(open[2]);
		if (isBlockKind(info.kind)) {
			if (!closed) warnings.push(`line ${i + 1}: the ${info.kind} block has no closing fence`);
			blocks.push({
				kind: info.kind,
				id: info.id,
				attrs: info.attrs,
				body,
				start: starts[i],
				end,
				line: i + 1,
				fence: marker
			});
		} else fences.push({
			marker,
			info: open[2],
			line: i,
			closeLine: closed ? j : null
		});
		i = closed ? j : lines.length;
	}
	checkBlocks(blocks, warnings);
	return {
		frontMatter,
		bodyStart: first < lines.length ? starts[first] : src.length,
		blocks,
		fences,
		tasks,
		title,
		warnings
	};
}
function checkBlocks(blocks, warnings) {
	const seen = /* @__PURE__ */ new Map();
	for (const b of blocks) {
		if (b.kind === "run") {
			if (!b.id) warnings.push(`line ${b.line}: this run block has no step id. Write one after "run", as in "run read-form".`);
			else if (!STEP_ID.test(b.id)) warnings.push(`line ${b.line}: step id "${b.id}" must be kebab-case`);
			else if (seen.has(b.id)) warnings.push(`line ${b.line}: step id "${b.id}" is already used on line ${seen.get(b.id)}`);
			else seen.set(b.id, b.line);
		}
		if (b.kind === "run" || b.kind === "file") {
			const paths = b.body.split("\n").map((l) => l.trim()).filter(Boolean);
			b.path = paths.length === 1 ? paths[0] : null;
			if (paths.length !== 1) warnings.push(`line ${b.line}: a ${b.kind} block holds exactly one path`);
		}
	}
	for (const b of blocks) if (b.kind === "run") b.stepOk = Boolean(b.id && STEP_ID.test(b.id) && seen.get(b.id) === b.line && b.path);
}
function placeholder(nonce, n) {
	return `WB${nonce}N${n}`;
}
/**
* The Markdown the view renders: the body without front matter, each workbook block replaced by
* a paragraph holding a placeholder (`WB<nonce>N<index>`), and every other fence's info string cut
* to one plain word. The nonce is new on every render, so text in the workbook can't pose as a
* placeholder.
*/
function renderSource(text, doc, nonce) {
	const src = String(text);
	const lines = src.split("\n");
	for (const f of doc.fences) {
		const word = (f.info.trim().split(/\s+/)[0] || "").replace(/[^\w+#.-]/g, "");
		lines[f.line] = f.marker + word;
	}
	const out = [];
	let skipUntil = -1;
	const byLine = new Map(doc.blocks.map((b, n) => [b.line - 1, {
		b,
		n
	}]));
	const firstLine = src.slice(0, doc.bodyStart).split("\n").length - 1;
	for (let i = firstLine; i < lines.length; i++) {
		if (i <= skipUntil) continue;
		const hit = byLine.get(i);
		if (hit) {
			out.push("", placeholder(nonce, hit.n), "");
			skipUntil = i + src.slice(hit.b.start, hit.b.end).split("\n").length - 1;
			continue;
		}
		out.push(lines[i]);
	}
	return out.join("\n");
}
var OUTPUT_CAP = 16e3;
var OUTPUT_HEAD = 4e3;
var OUTPUT_TAIL = 12e3;
var eol = (text) => text.includes("\r\n") ? "\r\n" : "\n";
var withEol = (block, nl) => nl === "\n" ? block : block.replace(/\n/g, nl);
/** Text with CRLF and CR as LF, and control characters other than tab and newline dropped. */
function cleanText(text) {
	return String(text).replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b-\u001f\u007f-\u009f]/g, "");
}
/** An output cut to the cap: its first 4,000 and last 12,000 characters, with the cut marked. */
function capOutput(text) {
	const t = cleanText(text);
	if (t.length <= OUTPUT_CAP) return t;
	return `${t.slice(0, OUTPUT_HEAD)}\n… (${t.length - OUTPUT_HEAD - OUTPUT_TAIL} characters cut) …\n${t.slice(-12e3)}`;
}
/**
* A body as a block holds it, and as it reads back: without trailing newlines, which a fence
* can't keep. Sign this, not the raw text, or the block won't verify.
*/
var blockBody = (body) => body.replace(/\n+$/, "");
/**
* A workbook block as text. The fence is longer than any run of backticks in the body, so nothing
* inside can close it. Attribute values must not contain whitespace.
*/
function blockText(kind, id, attrs, body) {
	const longest = Math.max(2, ...(body.match(/`+/g) || []).map((run) => run.length));
	const fence = "`".repeat(longest + 1);
	return `${fence}${[
		kind,
		id,
		...Object.entries(attrs).filter(([, v]) => v !== void 0 && v !== "").map(([k, v]) => `${k}=${v}`)
	].filter(Boolean).join(" ")}\n${blockBody(body)}\n${fence}`;
}
var after = (text, at, block) => {
	const nl = eol(text);
	return text.slice(0, at) + nl + nl + withEol(block, nl) + text.slice(at);
};
/**
* The step's output replaced by `block`: in place when it has one, otherwise just below the step.
* Returns null when the workbook has no step with that id.
*/
function setOutput(text, id, block) {
	const doc = parseDoc(text);
	const existing = doc.blocks.find((b) => b.kind === "output" && b.id === id);
	if (existing) return text.slice(0, existing.start) + withEol(block, eol(text)) + text.slice(existing.end);
	const run = doc.blocks.find((b) => b.kind === "run" && b.id === id);
	return run ? after(text, run.end, block) : null;
}
/**
* Task `index` ticked or unticked. Returns null when it is no longer as the person saw it
* (`wasChecked`), because the file changed in between.
*/
function toggleTask(text, index, wasChecked) {
	const task = parseDoc(text).tasks[index];
	if (!task || task.checked !== wasChecked) return null;
	return text.slice(0, task.offset) + (wasChecked ? " " : "x") + text.slice(task.offset + 1);
}
/**
* A message added at the end, or, with `stepId`, under that step: after its output (or the step
* itself when it hasn't run) and after the messages and replies already there, so a thread stays
* in order beside its step.
*/
function insertMessage(text, block, stepId) {
	const doc = parseDoc(text);
	const at = stepId ? [doc.blocks.findIndex((b) => b.kind === "output" && b.id === stepId), doc.blocks.findIndex((b) => b.kind === "run" && b.id === stepId)].find((i) => i >= 0) : void 0;
	if (at === void 0) {
		const nl = eol(text);
		return `${text.replace(/\s+$/, "")}${nl}${nl}${withEol(block, nl)}${nl}`;
	}
	let last = doc.blocks[at];
	for (const next of doc.blocks.slice(at + 1)) {
		if (next.kind !== "message" && next.kind !== "reply" || text.slice(last.end, next.start).trim() !== "") break;
		last = next;
	}
	return after(text, last.end, block);
}
// workbook/signatures.ts
var codeOf = (e) => typeof e === "object" && e !== null && "code" in e ? String(e.code) : void 0;
/** The signing key, made on first use: 32 random bytes, readable by this user only. */
function loadKey(keyPath) {
	try {
		return node_buffer.Buffer.from(node_fs.default.readFileSync(keyPath, "utf8").trim(), "hex");
	} catch (e) {
		if (codeOf(e) !== "ENOENT") throw e;
	}
	const key = node_crypto.default.randomBytes(32);
	try {
		node_fs.default.writeFileSync(keyPath, key.toString("hex"), {
			mode: 384,
			flag: "wx"
		});
	} catch (e) {
		if (codeOf(e) === "EEXIST") return loadKey(keyPath);
		throw e;
	}
	return key;
}
/** What a signature covers, in one string: the same block always gives the same text. */
function canonical(kind, id, attrs, body) {
	const fields = Object.keys(attrs).filter((k) => k !== "sig").sort().map((k) => [k, attrs[k]]);
	return JSON.stringify([
		kind,
		id || "",
		fields,
		String(body).replace(/\r\n?/g, "\n")
	]);
}
/** The signature for a block, as hex. */
function sign(key, kind, id, attrs, body) {
	return node_crypto.default.createHmac("sha256", key).update(canonical(kind, id, attrs, body)).digest("hex");
}
/** Whether a parsed block's `sig` attribute is Tranquil's signature for it. */
function verify(key, block) {
	const given = block.attrs.sig;
	if (typeof given !== "string" || !/^[0-9a-f]{64}$/.test(given)) return false;
	const expected = sign(key, block.kind, block.id, block.attrs, block.body);
	return node_crypto.default.timingSafeEqual(node_buffer.Buffer.from(given, "hex"), node_buffer.Buffer.from(expected, "hex"));
}
// workbook/service.ts
var DEBOUNCE_MS = 75;
var CUT_NOTE = "\n… (cut at 64 KB)";
var RESULT_MARK = "Result:\n";
var TONES = {
	succeeded: "success",
	failed: "error",
	"timed-out": "error",
	"not-started": "warning"
};
var messageOf = (e) => e instanceof Error ? e.message : String(e);
function timeOf(ms) {
	return new Date(ms).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit"
	});
}
function grantSummary(grants) {
	const parts = [];
	if (grants.browser) parts.push("controls the browser");
	else {
		if (grants["page-js"]) parts.push("runs code in pages");
		if (grants.submit) parts.push("submits forms");
		else if (grants.forms) parts.push("fills forms");
		else if (grants.tabs) parts.push("reads pages");
	}
	if (grants.tabs) parts.push((grants.sites || []).length ? (grants.sites || []).join(", ") : "any site");
	if (grants.read.length) parts.push("reads files");
	if (grants.write.length) parts.push("writes files");
	if (grants.net.length) parts.push("uses the network");
	if (grants.run.length) parts.push("runs commands");
	if (grants.clipboard) parts.push("uses the clipboard");
	return parts.length ? parts.join(" · ") : "no permissions";
}
/** A script's hash as outputs record it: the first 16 hex characters of its SHA-256. */
var hashOf = (text) => node_crypto.default.createHash("sha256").update(text).digest("hex").slice(0, 16);
var firstLine = (text) => (String(text).split("\n").find((l) => l.trim()) || "").trim();
/** A signed output's body split into its text and its result, when it has one. */
function splitResult(block) {
	if (block.attrs.result !== "1") return {
		text: block.body,
		hasResult: false
	};
	const at = block.body.startsWith(RESULT_MARK) ? 0 : block.body.lastIndexOf(`\n\n${RESULT_MARK}`);
	if (at < 0) return {
		text: block.body,
		hasResult: false
	};
	const json = block.body.slice(at + (at === 0 ? 0 : 2) + 8);
	try {
		return {
			text: block.body.slice(0, at),
			result: JSON.parse(json),
			hasResult: true
		};
	} catch {
		return {
			text: block.body,
			hasResult: false
		};
	}
}
function createWorkbookService(deps) {
	const { pulsar } = deps;
	let key = null;
	const signingKey = () => key ??= loadKey(node_path.default.join(pulsar.getConfigDirPath(), "workbook-signing.key"));
	const phases = /* @__PURE__ */ new Map();
	const redraws = /* @__PURE__ */ new Map();
	const runKey = (filePath, id) => `${filePath}\n${id}`;
	const phaseOf = (k) => phases.get(k) ?? "idle";
	const redraw = (filePath) => redraws.get(filePath)?.forEach((fn) => fn());
	/** Moves a step's run on by `event`, and redraws. `runStep` sends only events the table allows. */
	function advance(filePath, k, event) {
		const from = phaseOf(k);
		const to = next(from, event);
		if (to === null) throw new Error(`A step's run can't go from ${from} on ${event}.`);
		if (to === "idle") phases.delete(k);
		else phases.set(k, to);
		redraw(filePath);
	}
	function resolve(filePath, rel, opts) {
		const [root] = pulsar.project.relativizePath(filePath);
		return resolveInProject(root || node_path.default.dirname(filePath), filePath, rel, opts);
	}
	/** Whether an editor holds unsaved changes to this workbook, which a write would clash with. */
	const locked = (filePath) => pulsar.workspace.getTextEditors().some((e) => e.getPath() === filePath && e.isModified());
	function stepScript(filePath, block) {
		if (!block.stepOk) return { refused: "This step can't run until the problem above is fixed." };
		const res = resolve(filePath, block.path, { ext: ".ts" });
		if (!res.ok) return { refused: `This step can't run: ${res.reason}.` };
		const read = readCapped(res.abs);
		if (!read.ok) return {
			abs: res.abs,
			refused: read.missing ? `The script ${block.path} doesn't exist.` : read.reason
		};
		return {
			abs: res.abs,
			text: read.text,
			truncated: read.truncated,
			hash: hashOf(read.text)
		};
	}
	function runModel(filePath, block, outputs, watch) {
		const run = {
			kind: "run",
			key: `run:${block.id}`,
			id: block.id,
			path: block.path || null
		};
		const read = stepScript(filePath, block);
		if (read.abs) watch.add(read.abs);
		if (read.refused !== void 0) return {
			...run,
			state: {
				kind: "refused",
				reason: read.refused
			}
		};
		let grants;
		try {
			const g = deps.parseHeader(read.text).grants;
			grants = {
				summary: grantSummary(g),
				detail: deps.renderGrants(g).join("\n"),
				error: false
			};
		} catch (e) {
			grants = {
				summary: "no valid permission header",
				detail: messageOf(e),
				error: true
			};
		}
		const script = {
			grants,
			source: read.text + (read.truncated ? CUT_NOTE : "")
		};
		const phase = block.id === void 0 ? "idle" : phaseOf(runKey(filePath, block.id));
		if (phase !== "idle") return {
			...run,
			state: {
				kind: "running",
				phase,
				script
			}
		};
		const last = block.id ? outputs.get(block.id) : void 0;
		if (!last) return {
			...run,
			state: {
				kind: "new",
				script
			}
		};
		const changed = last.attrs.hash !== read.hash || decodeURI(last.attrs.script || "") !== block.path;
		return {
			...run,
			state: {
				kind: changed ? "changed" : "current",
				script
			}
		};
	}
	function fileModel(filePath, block, watch) {
		const file = {
			kind: "file",
			key: `file:${block.path}`,
			path: block.path || null,
			state: "",
			error: false
		};
		const res = resolve(filePath, block.path);
		if (!res.ok) return {
			...file,
			state: res.reason,
			error: true
		};
		watch.add(res.abs);
		const read = readCapped(res.abs);
		if (!read.ok) return {
			...file,
			state: read.missing ? "not written yet" : read.reason
		};
		return {
			...file,
			state: `changed ${timeOf(read.mtimeMs)}`,
			text: read.text + (read.truncated ? CUT_NOTE : "")
		};
	}
	function blockModel(filePath, block, index, ctx) {
		if (block.kind === "run") return runModel(filePath, block, ctx.outputs, ctx.watch);
		if (block.kind === "file") return fileModel(filePath, block, ctx.watch);
		const at = Date.parse(block.attrs.at || "");
		const time = Number.isNaN(at) ? "" : timeOf(at);
		if (block.kind === "reply") return {
			kind: "reply",
			key: `reply:${index}`,
			time,
			summary: firstLine(block.body),
			body: block.body,
			startOpen: ctx.newestThread.has(index)
		};
		if (!verify(signingKey(), block)) return {
			kind: "unverified",
			label: `${block.kind} · not written by Tranquil`,
			body: block.body
		};
		if (block.kind === "message") return {
			kind: "message",
			key: `message:${index}`,
			time,
			summary: firstLine(block.body),
			body: block.body,
			startOpen: ctx.newestThread.has(index)
		};
		const state = block.attrs.state || "";
		const { text, result, hasResult } = splitResult(block);
		return {
			kind: "output",
			key: `output:${block.id}`,
			script: node_path.default.basename(decodeURI(block.attrs.script || "")),
			state: state === "not-started" ? "not started" : deps.stateLabels[state] || state,
			tone: TONES[state] ?? "surface",
			time,
			duration: block.attrs.ms ? deps.formatDuration(Number(block.attrs.ms)) : "",
			text,
			result,
			hasResult
		};
	}
	/** What the view draws for a workbook, and every file whose change should redraw it. */
	function readWorkbook(filePath) {
		const title = node_path.default.basename(filePath);
		const watch = /* @__PURE__ */ new Set([filePath]);
		let text;
		try {
			text = node_fs.default.readFileSync(filePath, "utf8");
		} catch (e) {
			return {
				model: {
					title,
					error: `Can't read this workbook: ${messageOf(e)}`
				},
				watch
			};
		}
		const doc = parseDoc(text);
		const isLocked = locked(filePath);
		const outputs = /* @__PURE__ */ new Map();
		for (const b of doc.blocks) if (b.kind === "output" && b.id && verify(signingKey(), b)) outputs.set(b.id, b);
		const newestThread = /* @__PURE__ */ new Set();
		const lastMessage = doc.blocks.map((b) => b.kind).lastIndexOf("message");
		if (lastMessage >= 0) {
			newestThread.add(lastMessage);
			if (doc.blocks[lastMessage + 1]?.kind === "reply") newestThread.add(lastMessage + 1);
		}
		const ctx = {
			outputs,
			watch,
			newestThread
		};
		const nonce = node_crypto.default.randomBytes(8).toString("hex");
		return {
			model: {
				title: doc.title || title,
				warnings: doc.warnings,
				locked: isLocked,
				tasks: doc.tasks.map((t) => t.checked),
				markdown: renderSource(text, doc, nonce),
				nonce,
				blocks: doc.blocks.map((b, i) => blockModel(filePath, b, i, ctx))
			},
			watch
		};
	}
	function watchWorkbook(filePath, onModel) {
		const watchers = /* @__PURE__ */ new Map();
		let watched = /* @__PURE__ */ new Set();
		let timer;
		let stopped = false;
		function draw() {
			if (stopped) return;
			const { model, watch } = readWorkbook(filePath);
			watched = watch;
			const folders = new Set(Array.from(watch, (p) => node_path.default.dirname(p)));
			for (const [dir, w] of watchers) if (!folders.has(dir)) {
				w.close();
				watchers.delete(dir);
			}
			for (const dir of folders) {
				if (watchers.has(dir)) continue;
				try {
					watchers.set(dir, node_fs.default.watch(dir, (_event, name) => {
						if (!name || watched.has(node_path.default.join(dir, String(name)))) later();
					}));
				} catch {}
			}
			onModel(model);
		}
		function later() {
			clearTimeout(timer);
			timer = setTimeout(draw, DEBOUNCE_MS);
		}
		if (!redraws.has(filePath)) redraws.set(filePath, /* @__PURE__ */ new Set());
		redraws.get(filePath)?.add(later);
		const subscriptions = [];
		subscriptions.push(pulsar.workspace.observeTextEditors((editor) => {
			if (editor.getPath() === filePath) subscriptions.push(editor.onDidChangeModified(later));
		}));
		queueMicrotask(draw);
		return () => {
			stopped = true;
			clearTimeout(timer);
			for (const w of watchers.values()) w.close();
			watchers.clear();
			redraws.get(filePath)?.delete(later);
			for (const s of subscriptions) s.dispose();
		};
	}
	/** Writes an edit to the workbook, or says why it can't. Returns whether it was written. */
	function write(filePath, edit) {
		if (locked(filePath)) {
			pulsar.notifications.addWarning("Save or discard the workbook's unsaved changes first", {
				detail: "It's open in an editor with changes that aren't saved, and Tranquil's write would clash with them.",
				dismissable: true
			});
			return false;
		}
		const result = writeDoc(filePath, edit);
		if (!result.ok) pulsar.notifications.addError("Couldn't write the workbook", {
			detail: result.reason,
			dismissable: true
		});
		return result.ok;
	}
	/** A signed block's text. */
	function signedBlock(kind, id, attrs, body) {
		const present = Object.fromEntries(Object.entries(attrs).filter((e) => e[1] !== void 0));
		const text = blockBody(body);
		const sig = sign(signingKey(), kind, id, present, text);
		return blockText(kind, id, {
			...present,
			sig
		}, text);
	}
	/**
	* Runs a step, as the person who clicked Run, and writes its signed output under it. The
	* script's hash is taken now, so the output records the version that ran. Each stage sends the
	* run machine an event (run-machine.ts); a click the step's phase doesn't allow, such as a
	* second one while it runs, does nothing.
	*/
	async function runStep(filePath, stepId) {
		const k = runKey(filePath, stepId);
		const runManager = deps.runManager();
		if (!can(phaseOf(k), "run") || !runManager || locked(filePath)) return;
		let text;
		try {
			text = node_fs.default.readFileSync(filePath, "utf8");
		} catch (e) {
			pulsar.notifications.addError("Couldn't read the workbook", {
				detail: messageOf(e),
				dismissable: true
			});
			return;
		}
		const block = parseDoc(text).blocks.find((b) => b.kind === "run" && b.id === stepId);
		if (!block || !block.path) return;
		const script = stepScript(filePath, block);
		if (script.refused !== void 0) return;
		advance(filePath, k, "run");
		const trigger = `workbook:${filePath}`;
		const startedAt = Date.now();
		const refusal = { record: null };
		const sub = runManager.onDidStartRun((r) => {
			if (!refusal.record && r.trigger === trigger && r.scriptPath === script.abs && r.state !== "running") refusal.record = r;
		});
		let runId = null;
		let record = null;
		let failure = null;
		try {
			runId = await runManager.run({
				scriptPath: script.abs,
				trigger
			});
		} catch (e) {
			failure = messageOf(e);
		} finally {
			sub.dispose();
		}
		if (runId !== null) {
			advance(filePath, k, "started");
			try {
				record = await runManager.whenDone(runId);
			} catch (e) {
				failure = messageOf(e);
			}
		}
		advance(filePath, k, failure !== null ? "threw" : record ? "ended" : "refused");
		let written = false;
		try {
			const body = capOutput(record ? deps.runText(record) : refusal.record?.output || failure || "The run didn't start.");
			const attrs = {
				script: encodeURI(block.path),
				hash: script.hash,
				state: record ? record.state : "not-started",
				at: new Date(record ? record.startedAt : startedAt).toISOString(),
				ms: record?.endedAt ? String(record.endedAt - record.startedAt) : void 0,
				result: record && record.result !== void 0 ? "1" : void 0
			};
			written = write(filePath, (now) => setOutput(now, stepId, signedBlock("output", stepId, attrs, body)));
		} finally {
			advance(filePath, k, written ? "written" : "writeFailed");
		}
	}
	/** Ticks or unticks task `index`, unless it changed since the person saw it. */
	function toggleTask$1(filePath, index, wasChecked) {
		write(filePath, (text) => toggleTask(text, index, wasChecked));
	}
	/** Adds the person's signed message: at the end, or under a step when it's about one. */
	function sendMessage(filePath, text, stepId) {
		const body = String(text).replace(/\r\n?/g, "\n").trim();
		if (!body) return false;
		const block = signedBlock("message", void 0, { at: (/* @__PURE__ */ new Date()).toISOString() }, body);
		return write(filePath, (now) => insertMessage(now, block, stepId || void 0));
	}
	function openLink(filePath, href) {
		const link = classifyLink(href);
		if (link.kind === "web") pulsar.workspace.open(link.url);
		else if (link.kind === "relative") {
			const res = resolve(filePath, link.path);
			if (res.ok) pulsar.workspace.open(res.abs);
			else pulsar.notifications.addWarning("Can't open that link", {
				detail: res.reason,
				dismissable: true
			});
		}
	}
	return {
		watchWorkbook,
		runStep,
		toggleTask: toggleTask$1,
		sendMessage,
		openLink
	};
}
// workbook/main.js
/**
* The pane a `*.workbook.md` opens in. `saved` is what the pane last saved (its file and scroll);
* `service` is the workbook service (service.ts); `composer` is the message box the loader made (a
* Pulsar text editor, slotted in); `css` is the built stylesheet; `deserializer` is the name
* Pulsar restores the pane by.
*/
function workbookPane(saved, { service, composer, css, deserializer }) {
	const { filePath, scrollTop = 0 } = saved;
	return new SveltePane({
		component: Workbook,
		props: {
			filePath,
			scrollTop,
			service,
			composer
		},
		css,
		className: "tranquil-workbook",
		uri: filePath,
		title: filePath.split(/[\\/]/).pop(),
		iconName: "checklist",
		allowedLocations: ["center", "right"],
		serialize: (state) => ({
			deserializer,
			filePath,
			...state
		}),
		slots: { composer: composer.element },
		onDestroy: composer.destroy
	});
}
exports.createWorkbookService = createWorkbookService;
exports.workbookPane = workbookPane;
