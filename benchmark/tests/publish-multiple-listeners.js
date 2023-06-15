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
const listeners = Array.from({ length: 10 })
  .fill(0)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  .map(() => () => {});

const subscriberHandlers = [emitters.zodbus.subscribe, emitters.mitt.on];
for (const handler of subscriberHandlers) {
  for (const listener of listeners) {
    handler("foo", listener);
  }
}

bench
  .add("publish-multiple-listeners: zodbus", () => {
    emitters.zodbus.publish("foo", "bar");
    emitters.zodbus.publish("foo", "bax");
    emitters.zodbus.publish("foo", "baz");
  })
  .add("publish-multiple-listeners: mitt", () => {
    emitters.mitt.emit("foo", "bar");
    emitters.mitt.emit("foo", "bax");
    emitters.mitt.emit("foo", "baz");
  })
  .todo("unimplemented bench");

await bench.run();
console.table(bench.table());
