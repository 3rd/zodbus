import { Bench } from "tinybench";
import mitt from "mitt";
import { create } from "zodbus";

const bench = new Bench({ time: 200 });

bench
  .add("init: zodbus", () => {
    create({ schema: {} });
  })
  .add("init: mitt", () => {
    mitt();
  })
  .todo("unimplemented bench");

await bench.run();
console.table(bench.table());
