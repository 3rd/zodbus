export default {
  name: "once",
  run({ instance, createListener }) {
    const listener = createListener();
    instance.once("foo", listener);
  },
};
