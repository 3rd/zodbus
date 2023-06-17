import { benchmark } from "../runner.mjs";

benchmark({
  name: "publish-no-listeners",
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
