import { benchmark } from "../runner.mjs";

benchmark({
  name: "publish-single-listener",
  setup: ({ createListener, zodbus, mitt, tseep }) => {
    zodbus.subscribe("foo", createListener("zodbus"));
    mitt.on("foo", createListener("mitt"));
    tseep.on("foo", createListener("tseep"));
  },
  run: {
    zodbus: ({ instance }) => {
      instance.publish("foo", "bar");
      instance.publish("foo", "baz");
      instance.publish("foo", "boom");
    },
    mitt: ({ instance }) => {
      instance.emit("foo", "bar");
      instance.emit("foo", "baz");
      instance.emit("foo", "boom");
    },
    tseep: ({ instance }) => {
      instance.emit("foo", "bar");
      instance.emit("foo", "baz");
      instance.emit("foo", "boom");
    },
  },
});
