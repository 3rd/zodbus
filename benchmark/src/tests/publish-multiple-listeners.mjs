import { benchmark } from "../runner.mjs";

benchmark({
  name: "publish-multiple-listeners",
  run({ instance, createListener }) {
    const firstListener = createListener();
    const secondListener = createListener();
    const thirdListener = createListener();

    instance.subscribe("foo", firstListener);
    instance.subscribe("foo", secondListener);
    instance.subscribe("foo", thirdListener);

    instance.publish("foo", "bar");
  },
});
