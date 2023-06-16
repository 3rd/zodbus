import { benchmark } from "../runner.mjs";

benchmark({
  name: "subscribe-unsubscribe",
  run({ instance, createListener }) {
    const listener = createListener();
    instance.subscribe("foo", listener);
    instance.unsubscribe("foo", listener);
  },
});
