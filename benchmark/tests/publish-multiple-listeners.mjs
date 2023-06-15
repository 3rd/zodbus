export default {
  name: "publish-multiple-listeners",
  setup({ implementation, createListener, normalizeInstance }) {
    const instance = implementation.init();
    const firstListener = createListener();
    const secondListener = createListener();
    const thirdListener = createListener();
    implementation.subscribe(instance, "foo", firstListener);
    implementation.subscribe(instance, "foo", secondListener);
    implementation.subscribe(instance, "foo", thirdListener);
    return normalizeInstance(implementation, instance);
  },
  run({ instance }) {
    instance.publish("foo", "bar");
  },
};
