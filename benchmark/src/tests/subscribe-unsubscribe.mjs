import { benchmark } from "../runner.mjs";

benchmark({
  name: "subscribe-unsubscribe",
  setup: ({ createListener }) => {
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
  },
});
