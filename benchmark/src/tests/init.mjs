import { benchmark } from "../runner.mjs";

benchmark({
  name: "init",
  setup: false,
  run({ implementation }) {
    implementation.init();
  },
});
