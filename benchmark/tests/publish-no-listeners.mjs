export default {
  name: "publish-no-listeners",
  run({ instance }) {
    instance.publish("foo", "bar");
  },
};
