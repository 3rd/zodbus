import { ZodType } from "zod";
import { ValidationError } from "./errors";
import { MappedHandlers, Schema } from "./types";

type BusOptions<T extends Schema> = {
  schema: T;
  validate?: boolean;
};

function create<T extends Schema>({ schema, validate = false }: BusOptions<T>) {
  type Handlers = MappedHandlers<T>;

  const listeners: Map<keyof Handlers, Set<unknown>> = new Map();

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
   * @param event The event to unsubscribe from.
   * @param listener The listener to remove. If no listener is provided, all listeners for the event will be removed.
   */
  const unsubscribe = <K extends Extract<keyof Handlers, string>>(event: K, listener?: Handlers[K]) => {
    const eventListeners = listeners.get(event);
    if (!eventListeners) return;
    if (typeof listener === "undefined") {
      eventListeners.clear();
    } else {
      eventListeners.delete(listener);
    }
  };

  /** Subscribe to an event. Returns an object with the event name, listener, and an unsubscribe function.
   * @param event The event to subscribe to. Wildcards "foo.*.bar.*" are supported.
   * @param listener The listener to call when the event is published.
   */
  const subscribe = <K extends Extract<keyof Handlers, string>>(event: K, listener: Handlers[K]) => {
    if (typeof listener !== "function") {
      throw new ValidationError(`Invalid listener for event: "${event}". Expected function, got ${typeof listener}`);
    }
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event)!.add(listener);
    return { event, listener, unsubscribe: () => unsubscribe(event, listener) };
  };

  /** Subscribe to an event once. The listener will be unsubscribed after the first time it is called.
   * You cannot cancel this subscription using unsubscribe() with the original handler.
   * Use the returned unsubscribe function / handler instead. */
  const subscribeOnce = <K extends Extract<keyof Handlers, string>>(event: K, listener: Handlers[K]) => {
    const wrappedListener = (data: Parameters<Handlers[K]>[0]) => {
      listener(data);
      unsubscribe(event, listener);
    };
    return subscribe(event, wrappedListener as Handlers[K]);
  };

  /** Publish an event. All listeners for the event will be called with the provided data.
   * @param event The event to publish.
   * @param data The data to pass to the listeners.*/
  const publish = <K extends Extract<keyof Handlers, string>>(event: K, data: Parameters<Handlers[K]>[0]) => {
    if (validate) validatePayloadOrPanic(event, data);
    if (!listeners.has(event)) return;
    for (const listener of listeners.get(event)!) {
      (listener as Handlers[K])(data);
    }
  };

  return {
    listeners,
    publish,
    subscribe,
    subscribeOnce,
    unsubscribe,
  };
}

export { create };
