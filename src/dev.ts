/* eslint-disable @typescript-eslint/no-unused-expressions */
import { z } from "zod";
import { HasWildcard, InferHandler, MappedHandlers, SchemaPaths, WildcardPaths } from "./types";
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

type TestHandlers = MappedHandlers<typeof testSchema>;
type TestDotNotation = SchemaPaths<typeof testSchema>;
type TestWildcardPaths = WildcardPaths<SchemaPaths<typeof testSchema>>;
type DebugHasWildcard = HasWildcard<"zap.zop.*.zip">;
type DebugInferHandler = InferHandler<typeof testSchema, "zap.zop.*zip">;

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
test.subscribe("zap.zop.zup.zip", (data) => {
  data.unknown; // fail
});
