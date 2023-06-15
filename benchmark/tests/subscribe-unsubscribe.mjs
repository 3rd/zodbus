export default {
  name: "subscribe-unsubscribe",
  run({ instance, createListener }) {
    const listener = createListener();
    instance.subscribe("foo", listener);
    instance.unsubscribe("foo", listener);
  },
};
