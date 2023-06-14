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
    bus.publish("bar.baz", { field: "bar-test" });
    bus.publish("zap.zop.zup.zip", { field: "zap-test" });
    expect(handler).toHaveBeenCalledWith({ field: "bar-test" }, "bar.baz");
    expect(handler).toHaveBeenCalledWith({ field: "zap-test" }, "zap.zop.zup.zip");
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
      expect(handler).toHaveBeenCalledWith({ field: "test" }, "foo");
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

  it("subscribes to events with wildcards", () => {
    const defaultHandler = jest.fn();
    const wildcardHandler = jest.fn();
    const bus = create({ schema });
    bus.subscribe("*.zop.zup.zip", defaultHandler);
    bus.subscribe("zap.zop.zup.*", wildcardHandler);
    bus.publish("zap.zop.zup.zip", { field: "test" });
    expect(defaultHandler).toHaveBeenCalledWith({ field: "test" }, "zap.zop.zup.zip");
    expect(defaultHandler).toHaveBeenCalledTimes(1);
    expect(wildcardHandler).toHaveBeenCalledWith({ field: "test" }, "zap.zop.zup.zip");
    expect(wildcardHandler).toHaveBeenCalledTimes(1);
  });

  it("only calls a handler once if subscribed through multiple wildcard variations", () => {
    const handler = jest.fn();
    const bus = create({ schema });
    bus.subscribe("*", handler);
    bus.subscribe("*.*.*.*", handler);
    bus.subscribe("zap.zop.zup.*", handler);
    bus.subscribe("*.zop.zup.zip", handler);
    bus.subscribe("zap.zop.*.zip", handler);
    bus.subscribe("*.zop.zup.*", handler);
    bus.publish("zap.zop.zup.zip", { field: "test" });
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
