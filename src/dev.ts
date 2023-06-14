/* eslint-disable @typescript-eslint/no-unused-expressions */
import type {
  HasWildcard,
  InferSubscriptionHandler,
  MappedSubscriptionHandlers,
  SchemaPaths,
  WildcardPaths,
} from "./types";
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

type DebugSubscriptionHandlers = MappedSubscriptionHandlers<typeof testSchema>;
type DebugSchemaPaths = SchemaPaths<typeof testSchema>;
type DebugWildcardPaths = WildcardPaths<SchemaPaths<typeof testSchema>>;
type DebugHasWildcard = HasWildcard<"zap.zop.*.zip">;
type DebugInferHandler = InferSubscriptionHandler<typeof testSchema, "zap.zop.*.zip">;

const test = create({ schema: testSchema });
test.subscribe("zap.zop.*.zip", (data, event) => {
  data; // string
  event; // unknown
});
test.subscribe("foo", (data) => {
  data.field; // string
});
test.subscribe("bar.baz", (data, event) => {
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
test.publish("foo.*", { field: "test" });
