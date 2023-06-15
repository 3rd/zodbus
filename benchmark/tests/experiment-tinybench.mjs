import { Bench } from "tinybench";
import _mitt from "mitt";
import { EventEmitter as _tseep } from "tseep";
import { z } from "zod";
import { create } from "zodbus";

const schema = {
  foo: z.string(),
};

const zodbus = create({ schema, validate: false });
const mitt = _mitt();
const tseep = new _tseep();

zodbus.subscribe("foo", () => {});
mitt.on("foo", () => {});
tseep.on("foo", () => {});

const bench = new Bench({ time: 5000 });

bench.add("zodbus", () => {
  zodbus.publish("foo", "bar");
  zodbus.publish("foo", "baz");
  zodbus.publish("foo", "boom");
});

bench.add("mitt", () => {
  mitt.emit("foo", "bar");
  mitt.emit("foo", "baz");
  mitt.emit("foo", "boom");
});

bench.add("tseep", () => {
  tseep.emit("foo", "bar");
  tseep.emit("foo", "baz");
  tseep.emit("foo", "boom");
});

await bench.warmup();
await bench.run();
console.table(bench.table());
