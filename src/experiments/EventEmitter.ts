import type { EventEmitter as NodeEventEmitter } from "node:events";
import { z } from "zod";
import type {
  PublishKey,
  Schema,
  SubscriptionKey,
  SubscriptionListenerPayloads,
  SubscriptionListeners,
} from "../types";
import { create } from "../bus";

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class EventEmitter<T extends Schema> implements NodeEventEmitter {
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

  // eslint-disable-next-line class-methods-use-this
  setMaxListeners(_n: number): this {
    throw new Error("Not supported");
  }

  // eslint-disable-next-line class-methods-use-this
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

  // eslint-disable-next-line class-methods-use-this
  prependListener<K extends SubscriptionKey<T>>(_event: K, _listener: SubscriptionListeners<T>[K]): this {
    throw new Error("Not supported");
  }

  // eslint-disable-next-line class-methods-use-this
  prependOnceListener<K extends SubscriptionKey<T>>(_event: K, _listener: SubscriptionListeners<T>[K]): this {
    throw new Error("Not supported");
  }

  eventNames() {
    return this.bus.getEventNames();
  }
}

export { EventEmitter };

// eslint-disable-next-line unicorn/prefer-event-target
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
