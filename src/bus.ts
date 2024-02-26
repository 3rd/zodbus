import { ZodType } from "zod";
import { RuntimeError, ValidationError } from "./errors";
import type { PublishKey, Schema, SubscriptionKey, SubscriptionListenerPayloads, SubscriptionListeners } from "./types";
import { getSubPubPathMap } from "./utils/schema";

type BusOptions<T extends Schema> = {
  schema: T;
  validate?: boolean;
};

interface Bus<T extends Schema> {
  publish: <K extends PublishKey<T>>(event: K, data: SubscriptionListenerPayloads<T>[K]) => void;
  subscribe: <K extends SubscriptionKey<T>>(
    event: K,
    listener: SubscriptionListeners<T>[K]
  ) => { event: K; listener: SubscriptionListeners<T>[K]; unsubscribe: () => void };
  subscribeOnce: <K extends SubscriptionKey<T>>(
    event: K,
    listener: SubscriptionListeners<T>[K]
  ) => { event: K; listener: SubscriptionListeners<T>[K]; unsubscribe: () => void };
  unsubscribe: <K extends SubscriptionKey<T>>(event: K, listener?: SubscriptionListeners<T>[K]) => void;
  getEventNames: () => string[];
  getListeners: <K extends SubscriptionKey<T>>(event?: K) => ((data: unknown, eventName: string) => void)[];
  waitFor: <K extends SubscriptionKey<T>>(
    event: K,
    options?: { timeout?: number; filter?: (data: SubscriptionListenerPayloads<T>[K]) => boolean }
  ) => Promise<SubscriptionListenerPayloads<T>[K]>;
}

function create<T extends Schema>({ schema, validate = true }: BusOptions<T>): Bus<T> {
  const subPubPathMap = getSubPubPathMap(schema) as Record<SubscriptionKey<T>, PublishKey<T>[]>;
  const eventNames = Array.from(new Set(Object.values(subPubPathMap).flat())) as PublishKey<T>[];
  const listeners = new Map<PublishKey<T>, Set<unknown>>();

  const getListenerSetsForSubscriptionKey = (event: SubscriptionKey<T>): Set<unknown>[] => {
    if (event === "*") return Array.from(listeners.values());
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
    let currentSchema: Schema | ZodType = schema;
    for (const fragment of pathFragments) {
      if ((currentSchema as Record<string, unknown>)[fragment] === undefined) {
        throw new ValidationError(`Invalid event: "${event}". Could not resolve "${fragment}" fragment.`);
      }
      currentSchema = (currentSchema as Record<string, Schema | ZodType>)[fragment];
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
   * @param listener The listener to remove. If no listener is provided, all listeners for the event will be removed.
   *
   *   Examples:
   *   - `unsubscribe("foo.bar", listener)` will unsubscribe the listener from `foo.bar`
   *   - `unsubscribe("foo.*", listener)` will unsubscribe the listener from all events under `foo`
   *   - `unsubscribe("*", listener)` will unsubscribe the listener from all events
   *   - `unsubscribe("*")` will unsubscribe all listeners from all events
   *   - `unsubscribe("*.*")` will unsubscribe all listeners from all events on the second level
   */
  const unsubscribe = <K extends SubscriptionKey<T>>(event: K, listener?: SubscriptionListeners<T>[K]): void => {
    const eventListeners = getListenerSetsForSubscriptionKey(event);
    for (const listenerSet of eventListeners) {
      if (listener === undefined) {
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
   * @returns A subscription object with the event name, listener, and an unsubscribe function.
   */
  const subscribe = <K extends SubscriptionKey<T>>(
    event: K,
    listener: SubscriptionListeners<T>[K]
  ): {
    event: K;
    listener: SubscriptionListeners<T>[K];
    unsubscribe: () => void;
  } => {
    if (typeof listener !== "function") {
      throw new ValidationError(`Invalid listener for event: "${event}". Expected function, got ${typeof listener}`);
    }
    const publishPaths = event === "*" ? eventNames : subPubPathMap[event];
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
   * @returns A subscription object with the event name, listener, and an unsubscribe function.
   * */
  const subscribeOnce = <K extends SubscriptionKey<T>>(event: K, listener: SubscriptionListeners<T>[K]) => {
    const wrappedListener = (data: unknown, eventName: string) => {
      listener(data, eventName);
      unsubscribe(event, wrappedListener as unknown as SubscriptionListeners<T>[K]);
    };
    return subscribe(event, wrappedListener as unknown as SubscriptionListeners<T>[K]);
  };

  /** Publish an event. All listeners for the event will be called with the provided data.
   * @param event The event to publish.
   * @param data The data to pass to the listeners.*/
  const publish = <K extends PublishKey<T>>(event: K, data: SubscriptionListenerPayloads<T>[K]) => {
    if (validate) validatePayloadOrPanic(event, data);
    if (!listeners.has(event)) return;
    for (const listener of listeners.get(event)!) {
      (listener as SubscriptionListeners<T>[K])(data, event);
    }
  };

  /** Returns a list of all the event names.
   * @returns An array of event names. */
  const getEventNames = () => eventNames;

  /** Get the list of listeners for an event or all listeners if no event is provided.
   * @param event The event to get listeners for.
   * @returns An array of listeners for the event. */
  const getListeners = <K extends SubscriptionKey<T>>(event?: K) => {
    const targetListeners: ((data: unknown, eventName: string) => void)[] = [];
    const targetListenerSets = event ? getListenerSetsForSubscriptionKey(event) : Array.from(listeners.values());
    for (const listenerSet of targetListenerSets) {
      for (const listener of listenerSet) {
        targetListeners.push(listener as (data: unknown, eventName: string) => void);
      }
    }
    return targetListeners;
  };

  /** Waits for an event to be published.
   * Returns a promise that resolves when the event is published.
   * @param event The event to wait for.
   * @param options.timeout The timeout in milliseconds. Defaults to 10000.
   * @param options.filter A function that returns true if the event should be accepted.
   * @returns A promise that resolves when the event is published with the data passed to the listener. */
  const waitFor = <K extends SubscriptionKey<T>>(
    event: K,
    options: { timeout?: number; filter?: (data: SubscriptionListenerPayloads<T>[K]) => boolean } = {}
  ) => {
    const { timeout = 5000, filter } = options;
    return new Promise<SubscriptionListenerPayloads<T>[K]>((resolve, reject) => {
      let timeoutId: ReturnType<typeof setTimeout>;
      const listener = (data: unknown) => {
        if (filter && !filter(data as SubscriptionListenerPayloads<T>[K])) return;
        unsubscribe(event, listener as unknown as SubscriptionListeners<T>[K]);
        resolve(data as SubscriptionListenerPayloads<T>[K]);
        clearTimeout(timeoutId);
      };
      subscribe(event, listener as unknown as SubscriptionListeners<T>[K]);
      if (timeout) {
        timeoutId = setTimeout(() => {
          unsubscribe(event, listener as unknown as SubscriptionListeners<T>[K]);
          reject(new RuntimeError(`Timeout waiting for event: "${event}"`));
        }, timeout);
      }
    });
  };

  return {
    publish,
    subscribe,
    subscribeOnce,
    unsubscribe,
    getEventNames,
    getListeners,
    waitFor,
  };
}

export { create };
