import { create } from "zodbus";
import { z } from "zod";
import mitt from "mitt";
import { EventEmitter as tseep } from "tseep";
import EventEmitter3 from "eventemitter3";
import drip from "drip";
import fastemitter from "fastemitter";
import emitix from "emitix";
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
    eventemitter3: () => {
      return new EventEmitter3();
    },
    drip: () => {
      return new drip.EventEmitter();
    },
    fastemitter: () => {
      return new fastemitter();
    },
    emitix: () => {
      return new emitix.default();
    },
  },
});
