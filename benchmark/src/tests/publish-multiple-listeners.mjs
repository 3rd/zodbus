import { benchmark } from "../runner.mjs";

benchmark({
  name: "publish-multiple-listeners",
  setup({ createListener, zodbus, mitt, tseep }) {
    zodbus.subscribe("foo", createListener("zodbus"));
    zodbus.subscribe("foo", createListener("zodbus"));
    zodbus.subscribe("foo", createListener("zodbus"));

    mitt.on("foo", createListener("mitt"));
    mitt.on("foo", createListener("mitt"));
    mitt.on("foo", createListener("mitt"));

    tseep.on("foo", createListener("tseep"));
    tseep.on("foo", createListener("tseep"));
    tseep.on("foo", createListener("tseep"));
  },
  run: {
    zodbus({ instance }) {
      instance.publish("foo", "bar");
      instance.publish("foo", "baz");
      instance.publish("foo", "boom");
    },
    mitt({ instance }) {
      instance.emit("foo", "bar");
      instance.emit("foo", "baz");
      instance.emit("foo", "boom");
    },
    tseep({ instance }) {
      instance.emit("foo", "bar");
      instance.emit("foo", "baz");
      instance.emit("foo", "boom");
    },
  },
});
