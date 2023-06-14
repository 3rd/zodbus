import { z } from "zod";
import { create } from "./bus";
import { errorPrefix } from "./constants";

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
    expect(bus.getListeners("foo")).toHaveLength(2);

    bus.publish("foo", { field: "test" });

    bus.unsubscribe("foo");
    expect(bus.getListeners("foo")).toHaveLength(0);

    bus.publish("foo", { field: "test" });
    for (const handler of handlers) {
      expect(handler).toHaveBeenCalledTimes(1);
    }
  });

  it("returns the listeners for an event", () => {
    const handlers = [jest.fn(), jest.fn()];
    const bus = create({ schema });
    for (const handler of handlers) {
      bus.subscribe("foo", handler);
    }
    expect(bus.getListeners("foo")).toHaveLength(2);
    expect(bus.getListeners("foo")).toEqual(handlers);
  });

  it("returns all the listeners if the event is omitted", () => {
    const handlers = [jest.fn(), jest.fn()];
    const bus = create({ schema });
    for (const handler of handlers) {
      bus.subscribe("foo", handler);
    }
    expect(bus.getListeners()).toHaveLength(2);
    expect(bus.getListeners()).toEqual(handlers);
  });

  it("returns the listeners for an event with wildcards", () => {
    const events = ["bar.*", "*.baz", "*.*"] as const;
    const handlers = events.map(() => jest.fn());
    const bus = create({ schema });
    for (const [index, event] of events.entries()) {
      bus.subscribe(event, handlers[index]);
    }
    expect(bus.getListeners("bar.baz")).toHaveLength(3);
    expect(bus.getListeners("bar.baz")).toEqual(handlers);
    for (const event of events) {
      expect(bus.getListeners(event)).toEqual(handlers);
    }
  });

  it("throws and error when trying to retrieve the listeners for an unknown event", () => {
    const bus = create({ schema });
    // @ts-expect-error
    expect(() => bus.getListeners("unknown")).toThrowError(`${errorPrefix}Invalid event: "unknown"`);
  });

  it("subscribes to events with wildcards", () => {
    const events = (
      [
        "zap.zop.zup.zip",
        "zap.zop.zup.*",
        "zap.zop.*.zip",
        "zap.zop.*.*",
        "zap.*.zup.zip",
        "zap.*.zup.*",
        "zap.*.*.zip",
        "zap.*.*.*",
        "*.zop.zup.zip",
        "*.zop.zup.*",
        "*.zop.*.zip",
        "*.zop.*.*",
        "*.*.zup.zip",
        "*.*.zup.*",
        "*.*.*.zip",
        "*.*.*.*",
      ] as const
    ).map((event) => [event, jest.fn()] as const);
    const bus = create({ schema });
    for (const [event, handler] of events) {
      bus.subscribe(event, handler);
    }
    bus.publish("zap.zop.zup.zip", { field: "test" });
    for (const [_, handler] of events) {
      expect(handler).toHaveBeenCalledWith({ field: "test" }, "zap.zop.zup.zip");
    }
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
    expect(bus.getListeners("zap.zop.zup.zip")).toHaveLength(1);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("throws an error if an event is subscribed to that does not match the schema", () => {
    const bus = create({ schema });
    // @ts-expect-error
    expect(() => bus.subscribe("unknown", jest.fn())).toThrowError(`${errorPrefix}Invalid event: "unknown"`);
  });

  describe("when schema validation is enabled", () => {
    it("throws an error if an event is published that does not match the schema", () => {
      const bus = create({ schema });
      // @ts-expect-error
      expect(() => bus.publish("foo", { field: 1 })).toThrowError(
        JSON.stringify(
          [
            {
              code: "invalid_type",
              expected: "string",
              received: "number",
              path: ["field"],
              message: "Expected string, received number",
            },
          ],
          null,
          2
        )
      );
    });
  });

  describe("when schema validation is disabled", () => {
    it("does not throw an error if an event is published that does not match the schema", () => {
      const bus = create({ schema, validate: false });
      // @ts-expect-error
      expect(() => bus.publish("foo", { field: 1 })).not.toThrowError();
    });
  });

  it("returns the listener map", () => {
    const handler = jest.fn();
    const bus = create({ schema });

    expect(bus.listeners).toEqual(new Map());

    bus.subscribe("zap.*.*.zip", handler);
    expect(bus.listeners).toEqual(new Map([["zap.zop.zup.zip", new Set([handler])]]));
  });
});
