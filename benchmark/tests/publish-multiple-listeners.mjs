export default {
  name: "publish-multiple-listeners",
  run({ instance, createListener }) {
    const firstListener = createListener();
    const secondListener = createListener();
    instance.subscribe("foo", firstListener);
    instance.subscribe("foo", secondListener);
    instance.publish("foo", "bar");
    instance.publish("foo", "bax");
    instance.publish("foo", "baz");
  },
};
