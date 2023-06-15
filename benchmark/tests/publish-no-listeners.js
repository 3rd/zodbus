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

bench
  .add("publish-no-listeners: zodbus", () => {
    emitters.zodbus.publish("foo", "bar");
  })
  .add("publish-no-listeners: mitt", () => {
    emitters.mitt.emit("foo", "bar");
  })
  .todo("unimplemented bench");

await bench.run();
console.table(bench.table());
