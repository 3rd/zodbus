import { Bench } from "tinybench";
import { z } from "zod";
import mitt from "mitt";
import { create } from "zodbus";

const bench = new Bench({ time: 200 });

const schema = {
  foo: z.string(),
};

const emitters = {
  mitt: mitt(),
  zodbus: create({ schema }),
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const handler = () => {};
const mittHandler = () => {
  emitters.mitt.off("foo", mittHandler);
  handler();
};

bench
  .add("once: zodbus", () => {
    emitters.zodbus.subscribeOnce("foo", handler);
    emitters.zodbus.publish("foo", "bar");
  })
  .add("once: mitt", () => {
    emitters.mitt.on("foo", mittHandler);
    emitters.mitt.emit("foo", "bar");
  })
  .todo("unimplemented bench");

await bench.run();
console.table(bench.table());
