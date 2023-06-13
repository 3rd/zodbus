/* eslint-disable @typescript-eslint/no-empty-function */
import { z } from "zod";
import { create } from "./bus";

const schema = {
  foo: z.object({ field: z.string() }),
  bar: {
    baz: z.object({ field: z.string().or(z.number()) }),
  },
  zap: {
    zop: {
      zup: {
        zip: z.object({ field: z.string() }),
      },
    },
  },
};

describe("bus", () => {
  it("creates the bus", () => {
    const bus = create({ schema });
    expect(bus).toBeDefined();
    expect(bus.subscribe).toBeDefined();
    expect(bus.subscribeOnce).toBeDefined();
    expect(bus.unsubscribe).toBeDefined();
    expect(bus.publish).toBeDefined();
  });

  it("publishes nested events", () => {
    const handler = jest.fn();
    const bus = create({ schema });
    bus.subscribe("bar.baz", handler);
    bus.subscribe("zap.zop.zup.zip", handler);
    bus.publish("bar.baz", { field: "test" });
    bus.publish("zap.zop.zup.zip", { field: "test" });
    expect(handler).toHaveBeenCalledWith({ field: "test" });
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it("subscribes handlers to an event and notifies them", () => {
    const handlers = [jest.fn(), jest.fn()];
    const bus = create({ schema });
    for (const handler of handlers) {
      bus.subscribe("foo", handler);
    }
    bus.publish("foo", { field: "test" });
    for (const handler of handlers) {
      expect(handler).toHaveBeenCalledWith({ field: "test" });
    }
  });

  it("subscribes a handler to an event and notifies it once", () => {
    const handler = jest.fn();
    const bus = create({ schema });
    bus.subscribeOnce("foo", handler);
    bus.publish("foo", { field: "test" });
    bus.publish("foo", { field: "test" });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("unsubscribes a handler from an event", () => {
    const handler = jest.fn();
    const bus = create({ schema });
    bus.subscribe("foo", handler);
    bus.publish("foo", { field: "test" });
    bus.unsubscribe("foo", handler);
    bus.publish("foo", { field: "test" });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("unsubscribes all handlers from an event", () => {
    const handlers = [jest.fn(), jest.fn()];
    const bus = create({ schema });
    for (const handler of handlers) {
      bus.subscribe("foo", handler);
    }
    bus.publish("foo", { field: "test" });
    bus.unsubscribe("foo");
    bus.publish("foo", { field: "test" });
    for (const handler of handlers) {
      expect(handler).toHaveBeenCalledTimes(1);
    }
  });

  // TODO: separate publish keys from subscription keys
  // TODO: implement wildcards
  it.skip("subscribes to events with wildcards", () => {
    const handler = jest.fn();
    const bus = create({ schema });
    bus.subscribe("*", handler);
    bus.subscribe("*.*.*.*", handler);
    bus.subscribe("zap.zop.zup.*", handler);
    bus.subscribe("*.zop.zup.zip", handler);
    bus.subscribe("zap.zop.*.zip", handler);
    bus.subscribe("*.zop.zup.*", handler);
    bus.publish("zap.zop.zup.zip", { field: "test" });
    expect(handler).toHaveBeenCalledTimes(6);
  });
});
