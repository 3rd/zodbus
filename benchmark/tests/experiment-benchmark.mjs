import benchmark from "benchmark";
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

zodbus.subscribe("foo", (data) => {});
mitt.on("foo", (data) => {});
let i = 0;
tseep.on("foo", (data) => {});

new benchmark.Suite()
  .add("zodbus", function () {
    zodbus.publish("foo", "bar");
    zodbus.publish("foo", "baz");
    zodbus.publish("foo", "boom");
  })
  .add("mitt", function () {
    mitt.emit("foo", "bar");
    mitt.emit("foo", "baz");
    mitt.emit("foo", "boom");
  })
  .add("tseep", function () {
    tseep.emit("foo", "bar");
    tseep.emit("foo", "baz");
    tseep.emit("foo", "boom");
  })
  .on("cycle", function cycle(/** @type {{ target: { toString: () => any; }; }} */ e) {
    console.log(e.target.toString());
  })
  .on("complete", function completed() {
    // @ts-ignore
    console.log("Fastest is %s", this.filter("fastest").map("name"));
  })
  .run({ async: true, minTime: 500 });
