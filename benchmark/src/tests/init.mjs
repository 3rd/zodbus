import { create } from "zodbus";
import { z } from "zod";
import mitt from "mitt";
import { EventEmitter as tseep } from "tseep";
import { benchmark } from "../runner.mjs";

benchmark({
  name: "init",
  setup: false,
  run({ implementation }) {
    implementation.init();
  },
  run: {
    zodbus: () => {
      return create({ schema: { foo: z.string() }, validate: false });
    },
    mitt: () => {
      return mitt();
    },
    tseep: () => {
      return new tseep();
    },
  },
});
