import { benchmark } from "../runner.mjs";

benchmark({
  name: "subscribe-unsubscribe",
  setup: ({ createListener }) => {
    return {
      listeners: {
        zodbus: createListener("zodbus"),
        mitt: createListener("mitt"),
        tseep: createListener("tseep"),
        eventemitter3: createListener("eventemitter3"),
        drip: createListener("drip"),
        fastemitter: createListener("fastemitter"),
        emitix: createListener("emitix"),
      },
    };
  },
  run: {
    zodbus({ instance, listeners }) {
      instance.subscribe("foo", listeners.zodbus);
      instance.unsubscribe("foo", listeners.zodbus);
    },
    mitt({ instance, listeners }) {
      instance.on("foo", listeners.mitt);
      instance.off("foo", listeners.mitt);
    },
    tseep({ instance, listeners }) {
      instance.on("foo", listeners.tseep);
      instance.off("foo", listeners.tseep);
    },
    eventemitter3({ instance, listeners }) {
      instance.on("foo", listeners.eventemitter3);
      instance.off("foo", listeners.eventemitter3);
    },
    drip({ instance, listeners }) {
      instance.on("foo", listeners.drip);
      instance.off("foo", listeners.drip);
    },
    fastemitter({ instance, listeners }) {
      instance.on("foo", listeners.fastemitter);
      instance.removeListener("foo", listeners.fastemitter);
    },
    emitix({ instance, listeners }) {
      instance.on("foo", listeners.emitix);
      instance.off("foo", listeners.emitix);
    },
  },
});
