import type { EventEmitter as NodeEventEmitter } from "node:events";
import type { PublishKey, Schema, SubscriptionKey, SubscriptionListenerPayloads, SubscriptionListeners } from "./types";
import { create } from "./bus";
import { z } from "zod";

interface EventEmitter<T extends Schema> extends NodeEventEmitter {
  addListener<K extends SubscriptionKey<T>>(event: K, listener: SubscriptionListeners<T>[K]): this;
  on<K extends SubscriptionKey<T>>(event: K, listener: SubscriptionListeners<T>[K]): this;
  once<K extends SubscriptionKey<T>>(event: K, listener: SubscriptionListeners<T>[K]): this;
  removeListener<K extends SubscriptionKey<T>>(event: K, listener: SubscriptionListeners<T>[K]): this;
  off<K extends SubscriptionKey<T>>(event: K, listener: SubscriptionListeners<T>[K]): this;
  removeAllListeners<K extends SubscriptionKey<T>>(event?: K): this;
  setMaxListeners(n: number): this;
  getMaxListeners(): number;
  listeners<K extends SubscriptionKey<T>>(event: K): Function[];
  rawListeners<K extends SubscriptionKey<T>>(event: K): Function[];
  emit<K extends PublishKey<T>>(event: K, ...args: [SubscriptionListenerPayloads<T>[K]]): boolean;
  listenerCount<K extends SubscriptionKey<T>>(type: K): number;
  prependListener<K extends SubscriptionKey<T>>(event: K, listener: SubscriptionListeners<T>[K]): this;
  prependOnceListener<K extends SubscriptionKey<T>>(event: K, listener: SubscriptionListeners<T>[K]): this;
  eventNames<K extends PublishKey<T>>(): K[];
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class EventEmitter<T extends Schema> implements EventEmitter<T> {
  private bus: ReturnType<typeof create<T>>;

  constructor({ schema }: { schema: T }) {
    this.bus = create({ schema });
  }

  addListener<K extends SubscriptionKey<T>>(event: K, listener: SubscriptionListeners<T>[K]): this {
    this.bus.subscribe(event, listener);
    return this;
  }

  on<K extends SubscriptionKey<T>>(event: K, listener: SubscriptionListeners<T>[K]): this {
    this.addListener(event, listener);
    return this;
  }

  once<K extends SubscriptionKey<T>>(event: K, listener: SubscriptionListeners<T>[K]): this {
    this.bus.subscribeOnce(event, listener);
    return this;
  }

  removeListener<K extends SubscriptionKey<T>>(event: K, listener: SubscriptionListeners<T>[K]): this {
    this.bus.unsubscribe(event, listener);
    return this;
  }

  off<K extends SubscriptionKey<T>>(event: K, listener: SubscriptionListeners<T>[K]): this {
    this.removeListener(event, listener);
    return this;
  }

  removeAllListeners<K extends SubscriptionKey<T>>(event?: K): this {
    this.bus.unsubscribe(event ?? ("*" as K));
    return this;
  }

  setMaxListeners(n: number): this {
    return this;
  }

  getMaxListeners(): number {
    return Number.POSITIVE_INFINITY;
  }

  listeners<K extends SubscriptionKey<T>>(event: K): Function[] {
    return this.bus.getListeners(event);
  }

  rawListeners<K extends SubscriptionKey<T>>(event: K): Function[] {
    return this.listeners(event);
  }

  emit<K extends PublishKey<T>>(event: K, ...args: [SubscriptionListenerPayloads<T>[K]]): boolean {
    this.bus.publish(event, ...args);
    return true;
  }

  listenerCount<K extends SubscriptionKey<T>>(type: K): number {
    return this.listeners(type).length;
  }

  prependListener<K extends SubscriptionKey<T>>(event: K, listener: SubscriptionListeners<T>[K]): this {
    // TODO
    // this.bus.subscribe(event, listener, { prepend: true });
    return this;
  }

  prependOnceListener<K extends SubscriptionKey<T>>(event: K, listener: SubscriptionListeners<T>[K]): this {
    // TODO
    // this.bus.subscribeOnce(event, listener, { prepend: true });
    return this;
  }

  eventNames() {
    return this.bus.getEventNames();
  }
}

export { EventEmitter };

const ee = new EventEmitter({
  schema: {
    foo: z.object({
      bar: z.string(),
    }),
  },
});
ee.addListener("foo", (payload) => {
  console.log(payload.bar);
});
