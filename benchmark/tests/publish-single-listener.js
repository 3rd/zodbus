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

emitters.zodbus.subscribe("foo", listener);
emitters.mitt.on("foo", listener);

bench
  .add("publish-single-listener: zodbus", () => {
    emitters.zodbus.publish("foo", "bar");
    emitters.zodbus.publish("foo", "bax");
    emitters.zodbus.publish("foo", "baz");
  })
  .add("publish-single-listener: mitt", () => {
    emitters.mitt.emit("foo", "bar");
    emitters.mitt.emit("foo", "bax");
    emitters.mitt.emit("foo", "baz");
  })
  .todo("unimplemented bench");

await bench.run();
console.table(bench.table());
