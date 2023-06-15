import type {
  PublishKey,
  Schema,
  SubscriptionKey,
  SubscriptionListenerPayloads,
  SubscriptionListeners,
} from "../types";
import { create } from "../bus";
import { z } from "zod";

class EventTarget<T extends Schema> implements EventTarget<T> {
  private bus: ReturnType<typeof create<T>>;

  constructor({ schema }: { schema: T }) {
    this.bus = create({ schema });
  }

  addEventListener<K extends SubscriptionKey<T>>(
    event: K,
    listener: SubscriptionListeners<T>[K],
    _options?: boolean | AddEventListenerOptions
  ): void {
    this.bus.subscribe(event, listener);
  }

  removeEventListener<K extends SubscriptionKey<T>>(
    event: K,
    listener: SubscriptionListeners<T>[K],
    _options?: boolean | EventListenerOptions
  ): void {
    this.bus.unsubscribe(event, listener);
  }

  dispatchEvent<K extends PublishKey<T>>(event: K, ...args: [SubscriptionListenerPayloads<T>[K]]): boolean {
    this.bus.publish(event, ...args);
    return true;
  }

  getListeners<K extends SubscriptionKey<T>>(event: K): Function[] {
    return this.bus.getListeners(event);
  }

  listenerCount<K extends SubscriptionKey<T>>(event?: K): number {
    return this.bus.getListeners(event).length;
  }

  eventNames(): string[] {
    return this.bus.getEventNames();
  }
}

export { EventTarget };

const et = new EventTarget({
  schema: {
    foo: z.object({
      bar: z.string(),
    }),
  },
});
et.addEventListener("foo", (data) => {
  console.log(data);
});
