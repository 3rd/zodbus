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
    const listener = jest.fn();
    const bus = create({ schema });
    bus.subscribe("bar.baz", listener);
    bus.subscribe("zap.zop.zup.zip", listener);
    bus.publish("bar.baz", { field: "bar-test" });
    bus.publish("zap.zop.zup.zip", { field: "zap-test" });
    expect(listener).toHaveBeenCalledWith({ field: "bar-test" }, "bar.baz");
    expect(listener).toHaveBeenCalledWith({ field: "zap-test" }, "zap.zop.zup.zip");
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("subscribes listeners to an event and calls them", () => {
    const listeners = [jest.fn(), jest.fn()];
    const bus = create({ schema });
    for (const listener of listeners) {
      bus.subscribe("foo", listener);
    }
    bus.publish("foo", { field: "test" });
    for (const listener of listeners) {
      expect(listener).toHaveBeenCalledWith({ field: "test" }, "foo");
    }
  });

  it("subscribes a listener to an event and calls it once", () => {
    const bus = create({ schema });

    // without other subscriptions
    {
      const listener = jest.fn();
      bus.subscribeOnce("foo", listener);
      bus.publish("foo", { field: "test" });
      bus.publish("foo", { field: "test" });
      expect(listener).toHaveBeenCalledTimes(1);
    }

    // with other subscriptions
    {
      const listener = jest.fn();
      bus.subscribe("foo", listener);
      bus.subscribeOnce("foo", listener);
      bus.publish("foo", { field: "test" });
      bus.publish("foo", { field: "test" });
      expect(listener).toHaveBeenCalledTimes(3);
    }
  });

  it("unsubscribes a listener from an event", () => {
    const listener = jest.fn();
    const bus = create({ schema });
    bus.subscribe("foo", listener);
    bus.publish("foo", { field: "test" });
    bus.unsubscribe("foo", listener);
    bus.publish("foo", { field: "test" });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("unsubscribes all listeners from an event", () => {
    const listeners = [jest.fn(), jest.fn()];
    const bus = create({ schema });

    for (const listener of listeners) {
      bus.subscribe("foo", listener);
    }
    expect(bus.getListeners("foo")).toHaveLength(2);

    bus.publish("foo", { field: "test" });

    bus.unsubscribe("foo");
    expect(bus.getListeners("foo")).toHaveLength(0);

    bus.publish("foo", { field: "test" });
    for (const listener of listeners) {
      expect(listener).toHaveBeenCalledTimes(1);
    }
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
    for (const [event, listener] of events) {
      bus.subscribe(event, listener);
    }
    bus.publish("zap.zop.zup.zip", { field: "test" });
    for (const [_, listener] of events) {
      expect(listener).toHaveBeenCalledWith({ field: "test" }, "zap.zop.zup.zip");
    }
  });

  it("only calls a listener once if subscribed through multiple wildcard variations", () => {
    const listener = jest.fn();
    const bus = create({ schema });
    bus.subscribe("*", listener);
    bus.subscribe("*.*.*.*", listener);
    bus.subscribe("zap.zop.zup.*", listener);
    bus.subscribe("*.zop.zup.zip", listener);
    bus.subscribe("zap.zop.*.zip", listener);
    bus.subscribe("*.zop.zup.*", listener);
    bus.publish("zap.zop.zup.zip", { field: "test" });
    expect(bus.getListeners("zap.zop.zup.zip")).toHaveLength(1);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("calls all listeners when subscribed using the special catch-all '*' event", () => {
    const bus = create({ schema });
    const catchAllListener = jest.fn();
    bus.subscribe("*", catchAllListener);
    bus.publish("foo", { field: "foo" });
    bus.publish("bar.baz", { field: "bar" });
    expect(catchAllListener).toHaveBeenCalledTimes(2);
    expect(catchAllListener).toHaveBeenCalledWith({ field: "foo" }, "foo");
    expect(catchAllListener).toHaveBeenCalledWith({ field: "bar" }, "bar.baz");
  });

  it("unsubscribes a listener from all events using the special catch-all '*' event", () => {
    const bus = create({ schema });
    const listener = jest.fn();
    bus.subscribe("bar.baz", listener);
    expect(bus.getListeners("bar.baz")).toHaveLength(1);
    bus.unsubscribe("*", listener);
    expect(bus.getListeners("bar.baz")).toHaveLength(0);
  });

  it("unsubscribes all listeners from all events using the special catch-all '*' event", () => {
    const bus = create({ schema });
    const listeners = [jest.fn(), jest.fn()];
    for (const listener of listeners) {
      bus.subscribe("bar.baz", listener);
    }
    expect(bus.getListeners("bar.baz")).toHaveLength(2);
    bus.unsubscribe("*");
    expect(bus.getListeners("bar.baz")).toHaveLength(0);
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

  it("returns the listeners for an event", () => {
    const listeners = [jest.fn(), jest.fn()];
    const bus = create({ schema });
    for (const listener of listeners) {
      bus.subscribe("foo", listener);
    }
    expect(bus.getListeners("foo")).toHaveLength(2);
    expect(bus.getListeners("foo")).toEqual(listeners);
  });

  it("returns all the listeners if the event is omitted", () => {
    const listeners = [jest.fn(), jest.fn()];
    const bus = create({ schema });
    for (const listener of listeners) {
      bus.subscribe("foo", listener);
    }
    expect(bus.getListeners()).toHaveLength(2);
    expect(bus.getListeners()).toEqual(listeners);
  });

  it("returns the listeners for an event with wildcards", () => {
    const events = ["bar.*", "*.baz", "*.*"] as const;
    const listeners = events.map(() => jest.fn());
    const bus = create({ schema });
    for (const [index, event] of events.entries()) {
      bus.subscribe(event, listeners[index]);
    }
    expect(bus.getListeners("bar.baz")).toHaveLength(3);
    expect(bus.getListeners("bar.baz")).toEqual(listeners);
    for (const event of events) {
      expect(bus.getListeners(event)).toEqual(listeners);
    }
  });

  it("throws and error when trying to retrieve the listeners for an unknown event", () => {
    const bus = create({ schema });
    // @ts-expect-error
    expect(() => bus.getListeners("unknown")).toThrowError(`${errorPrefix}Invalid event: "unknown"`);
  });

  it("throws an error if an event is subscribed to that does not match the schema", () => {
    const bus = create({ schema });
    // @ts-expect-error
    expect(() => bus.subscribe("unknown", jest.fn())).toThrowError(`${errorPrefix}Invalid event: "unknown"`);
  });

  it("awaits for an event to be published", async () => {
    const bus = create({ schema });
    const promise = bus.waitFor("foo");
    bus.publish("foo", { field: "test" });
    expect(await promise).toEqual({ field: "test" });
  });

  it("awaits for an event to be published with a timeout", async () => {
    const bus = create({ schema });
    const promise = bus.waitFor("foo", { timeout: 10 });
    await expect(promise).rejects.toThrowError(`${errorPrefix}Timeout waiting for event: "foo"`);
  });

  it("awaits for an event to be published with a filter", async () => {
    const bus = create({ schema });

    let promise = bus.waitFor("foo", { filter: (event) => event.field === "test", timeout: 10 });
    bus.publish("foo", { field: "not-test" });
    await expect(promise).rejects.toThrowError(`${errorPrefix}Timeout waiting for event: "foo"`);

    promise = bus.waitFor("foo", { filter: (event) => event.field === "test", timeout: 10 });
    bus.publish("foo", { field: "test" });
    expect(await promise).toEqual({ field: "test" });
  });
});
