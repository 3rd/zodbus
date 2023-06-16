import { benchmark } from "../runner.mjs";

benchmark({
  name: "publish-single-listener",
  run({ instance, createListener }) {
    const listener = createListener();
    instance.subscribe("foo", listener);
    instance.publish("foo", "bar");
  },
});
