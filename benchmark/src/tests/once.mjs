import { benchmark } from "../runner.mjs";

benchmark({
  name: "once",
  setup({ createListener }) {
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
      instance.subscribeOnce("foo", listeners.zodbus);
      instance.publish("foo", "bar");
    },
    mitt({ instance, listeners }) {
      const wrapper = (data) => {
        listeners.mitt(data);
        instance.off("foo", wrapper);
      };
      instance.on("foo", wrapper);
      instance.emit("foo", "bar");
    },
    tseep({ instance, listeners }) {
      instance.once("foo", listeners.tseep);
      instance.emit("foo", "bar");
    },
    eventemitter3({ instance, listeners }) {
      instance.once("foo", listeners.eventemitter3);
      instance.emit("foo", "bar");
    },
    drip({ instance, listeners }) {
      const wrapper = (data) => {
        listeners.mitt(data);
        instance.off("foo", wrapper);
      };
      instance.on("foo", wrapper);
      instance.emit("foo", "bar");
    },
    fastemitter({ instance, listeners }) {
      instance.once("foo", listeners.fastemitter);
      instance.emit("foo", "bar");
    },
    emitix({ instance, listeners }) {
      instance.once("foo", listeners.emitix);
      instance.emit("foo", "bar");
    },
  },
});
