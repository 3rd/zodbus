import { ZodType } from "zod";
import { ValidationError } from "./errors";
import type { MappedSubscriptionListenerPayloads, MappedSubscriptionListeners, Schema, SchemaPaths } from "./types";
import { getSubPubPathMap } from "./utils/schema";

type BusOptions<T extends Schema> = {
  schema: T;
  validate?: boolean;
};

function create<T extends Schema>({ schema, validate = true }: BusOptions<T>) {
  type SubscriptionListeners = MappedSubscriptionListeners<T>;
  type SubscriptionListenerPayloads = MappedSubscriptionListenerPayloads<T>;
  type SubscriptionKey = Extract<keyof SubscriptionListeners, string>;
  type PublishKey = Extract<SubscriptionKey, SchemaPaths<T>>;

  const subPubPathMap = getSubPubPathMap(schema) as Record<SubscriptionKey, PublishKey[]>;
  const listeners: Map<PublishKey, Set<unknown>> = new Map();

  const getListenerSetsForSubscriptionKey = (event: SubscriptionKey) => {
    if (event === "*") return new Set(listeners.values());
    const listenerSets: Set<unknown>[] = [];
    const publishPaths = subPubPathMap[event];
    if (!publishPaths) throw new ValidationError(`Invalid event: "${event}"`);
    for (const publishPath of publishPaths) {
      const listenerSet = listeners.get(publishPath);
      if (listenerSet) listenerSets.push(listenerSet);
    }
    return listenerSets;
  };

  const validatePayloadOrPanic = (event: string, data: unknown): void => {
    const pathFragments = event.split(".");
    let currentSchema: ZodType | Schema = schema;
    for (const fragment of pathFragments) {
      if (typeof (currentSchema as Record<string, unknown>)[fragment] === "undefined") {
        throw new ValidationError(`Invalid event: "${event}". Could not resolve "${fragment}" fragment.`);
      }
      currentSchema = (currentSchema as Record<string, ZodType | Schema>)[fragment];
    }
    if (typeof currentSchema.parse === "function") {
      (currentSchema as ZodType).parse(data);
    } else {
      throw new ValidationError(`Reached invalid payload schema for: "${event}"`);
    }
  };

  /** Unsubscribe from an event. If no listener is provided, all listeners for the event will be removed.
   * @param event The event to unsubscribe from. Wildcards `foo.*.bar.*` are supported.
   *   Using `*` will match any event on any level.
   *   More specific wildcard patterns like `*.*` will only match events on that level.
   *
   *   Examples:
   *   - `unsubscribe("foo.bar", listener)` will unsubscribe the listener from `foo.bar`
   *   - `unsubscribe("foo.*", listener)` will unsubscribe the listener from all events under `foo`
   *   - `unsubscribe("*", listener)` will unsubscribe the listener from all events
   *   - `unsubscribe("*")` will unsubscribe all listeners from all events
   *   - `unsubscribe("*.*")` will unsubscribe all listeners from all events on the second level
   * @param listener The listener to remove. If no listener is provided, all listeners for the event will be removed.
   */
  const unsubscribe = <K extends SubscriptionKey>(event: K, listener?: SubscriptionListeners[K]) => {
    const eventListeners = getListenerSetsForSubscriptionKey(event);
    for (const listenerSet of eventListeners) {
      if (typeof listener === "undefined") {
        listenerSet.clear();
      } else {
        listenerSet.delete(listener);
      }
    }
  };

  /** Subscribe to an event. Returns an object with the event name, listener, and an unsubscribe function.
   * @param event The event to subscribe to. Wildcards `foo.*.bar.*` are supported.
   *    Using `*` will match any event on any level.
   *    More specific wildcard patterns like `*.*` will only match events on that level.
   * @param listener The listener to call when the event is published.
   * @returns An object with the event name, listener, and an unsubscribe function.
   */
  const subscribe = <K extends SubscriptionKey>(event: K, listener: SubscriptionListeners[K]) => {
    if (typeof listener !== "function") {
      throw new ValidationError(`Invalid listener for event: "${event}". Expected function, got ${typeof listener}`);
    }
    const publishPaths = event === "*" ? (Object.values(subPubPathMap).flat() as PublishKey[]) : subPubPathMap[event];
    if (!publishPaths) throw new ValidationError(`Invalid event: "${event}"`);
    for (const publishPath of publishPaths) {
      if (!listeners.has(publishPath)) listeners.set(publishPath, new Set());
      listeners.get(publishPath)!.add(listener);
    }
    return { event, listener, unsubscribe: () => unsubscribe(event, listener) };
  };

  /** Subscribe to an event once. The listener will be unsubscribed after the first time it is called.
   * You cannot cancel this subscription using unsubscribe() with the original listener.
   * Use the returned unsubscribe function / listener instead.
   * @param event The event to subscribe to. Wildcards `foo.*.bar.*` are supported.
   *    Using `*` will match any event on any level.
   *    More specific wildcard patterns like `*.*` will only match events on that level.
   * @param listener The listener to call when the event is published.
   * @returns An object with the event name, listener, and an unsubscribe function.
   * */
  const subscribeOnce = <K extends SubscriptionKey>(event: K, listener: SubscriptionListeners[K]) => {
    const wrappedListener = (data: unknown, eventName: string) => {
      listener(data, eventName);
      unsubscribe(event, wrappedListener as unknown as SubscriptionListeners[K]);
    };
    return subscribe(event, wrappedListener as unknown as SubscriptionListeners[K]);
  };

  /** Publish an event. All listeners for the event will be called with the provided data.
   * @param event The event to publish.
   * @param data The data to pass to the listeners.*/
  const publish = <K extends PublishKey>(event: K, data: SubscriptionListenerPayloads[K]) => {
    if (validate) validatePayloadOrPanic(event, data);
    if (!listeners.has(event)) return;
    for (const listener of listeners.get(event)!) {
      (listener as SubscriptionListeners[K])(data, event);
    }
  };

  /** Get the list of listeners for an event or all listeners if no event is provided.
   * @param event The event to get listeners for.
   * @returns An array of listeners for the event. */
  const getListeners = <K extends SubscriptionKey>(event?: K) => {
    const targetListeners: ((data: unknown, eventName: string) => void)[] = [];
    const targetListenerSets = event ? getListenerSetsForSubscriptionKey(event) : Array.from(listeners.values());
    for (const listenerSet of targetListenerSets) {
      for (const listener of listenerSet) {
        targetListeners.push(listener as (data: unknown, eventName: string) => void);
      }
    }
    return targetListeners;
  };

  return {
    publish,
    subscribe,
    subscribeOnce,
    unsubscribe,
    getListeners,
  };
}

export { create };
