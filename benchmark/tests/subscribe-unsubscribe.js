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
const listener = () => {};

bench
  .add("subscribe-unsubscribe: zodbus", () => {
    emitters.zodbus.subscribe("foo", listener);
    emitters.zodbus.unsubscribe("foo", listener);
  })
  .add("subscribe-unsubscribe: mitt", () => {
    emitters.mitt.on("foo", listener);
    emitters.mitt.off("foo", listener);
  })
  .todo("unimplemented bench");

await bench.run();
console.table(bench.table());
