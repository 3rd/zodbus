import { benchmark } from "../runner.mjs";

benchmark({
  name: "publish-multiple-listeners",
  setup({ createListener, zodbus, mitt, tseep, eventemitter3, drip, fastemitter, emitix }) {
    zodbus.subscribe("foo", createListener("zodbus"));
    zodbus.subscribe("foo", createListener("zodbus"));
    zodbus.subscribe("foo", createListener("zodbus"));

    mitt.on("foo", createListener("mitt"));
    mitt.on("foo", createListener("mitt"));
    mitt.on("foo", createListener("mitt"));

    tseep.on("foo", createListener("tseep"));
    tseep.on("foo", createListener("tseep"));
    tseep.on("foo", createListener("tseep"));

    eventemitter3.on("foo", createListener("eventemitter3"));
    eventemitter3.on("foo", createListener("eventemitter3"));
    eventemitter3.on("foo", createListener("eventemitter3"));

    drip.on("foo", createListener("drip"));
    drip.on("foo", createListener("drip"));
    drip.on("foo", createListener("drip"));

    fastemitter.on("foo", createListener("fastemitter"));
    fastemitter.on("foo", createListener("fastemitter"));
    fastemitter.on("foo", createListener("fastemitter"));

    emitix.on("foo", createListener("emitix"));
    emitix.on("foo", createListener("emitix"));
    emitix.on("foo", createListener("emitix"));
  },
  run: {
    zodbus({ instance }) {
      instance.publish("foo", "bar");
      instance.publish("foo", "baz");
      instance.publish("foo", "boom");
    },
    mitt({ instance }) {
      instance.emit("foo", "bar");
      instance.emit("foo", "baz");
      instance.emit("foo", "boom");
    },
    tseep({ instance }) {
      instance.emit("foo", "bar");
      instance.emit("foo", "baz");
      instance.emit("foo", "boom");
    },
    eventemitter3({ instance }) {
      instance.emit("foo", "bar");
      instance.emit("foo", "baz");
      instance.emit("foo", "boom");
    },
    drip({ instance }) {
      instance.emit("foo", "bar");
      instance.emit("foo", "baz");
      instance.emit("foo", "boom");
    },
    fastemitter({ instance }) {
      instance.emit("foo", "bar");
      instance.emit("foo", "baz");
      instance.emit("foo", "boom");
    },
    emitix({ instance }) {
      instance.emit("foo", "bar");
      instance.emit("foo", "baz");
      instance.emit("foo", "boom");
    },
  },
});
