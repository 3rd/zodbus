import { benchmark } from "../runner.mjs";

benchmark({
  name: "once",
  setup({ createListener }) {
    return {
      listeners: {
        zodbus: createListener("zodbus"),
        mitt: createListener("mitt"),
        tseep: createListener("tseep"),
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
  },
});
