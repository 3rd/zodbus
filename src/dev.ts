/* eslint-disable @typescript-eslint/no-unused-expressions */
import type { HasWildcard, InferHandler, MappedHandlers, SchemaPaths, WildcardPaths } from "./types";
import { z } from "zod";
import { create } from ".";

// debug
const testSchema = {
  foo: z.object({ field: z.string() }),
  bar: {
    baz: z.object({ field: z.string().or(z.number()) }),
  },
  zap: {
    zop: {
      zup: {
        zip: z.object({ field: z.string() }),
      },
    },
  },
};

type DebugMappedHandlers = MappedHandlers<typeof testSchema>;
type DebugSchemaPaths = SchemaPaths<typeof testSchema>;
type DebugWildcardPaths = WildcardPaths<SchemaPaths<typeof testSchema>>;
type DebugHasWildcard = HasWildcard<"zap.zop.*.zip">;
type DebugInferHandler = InferHandler<typeof testSchema, "zap.zop.*.zip">;

const test = create({ schema: testSchema });
test.subscribe("zap.zop.*.zip", (data) => {
  data.event; // string
  data.data; // unknown
});
test.subscribe("foo", (data) => {
  data.field; // string
});
test.subscribe("bar.baz", (data) => {
  data.field; // string
});
test.subscribe("zap.zop.zup.zip", (data) => {
  data.field; // string
});
// fail
test.subscribe("zap.zop.zup.unknown", (data) => {
  data.field; // string
});
// fail
test.subscribe("zap.zop.zup.*", (data) => {
  data.unknown; // fail
});

test.publish("bar.baz", { field: "test" });
