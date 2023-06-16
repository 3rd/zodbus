import { benchmark } from "../runner.mjs";

benchmark({
  name: "publish-no-listeners",
  run({ instance }) {
    instance.publish("foo", "bar");
  },
});
