import { benchmark } from "../runner.mjs";

benchmark({
  name: "once",
  run({ instance, createListener }) {
    const listener = createListener();
    instance.once("foo", listener);
    instance.publish("foo", "bar");
  },
});
