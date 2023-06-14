/* eslint-disable @typescript-eslint/no-empty-function */
import type {
  HasWildcard,
  InferSubscriptionHandler,
  MappedSubscriptionHandlers,
  SchemaPaths,
  WildcardPaths,
} from "./types";
import { z } from "zod";
import { create } from ".";

const testSchema = {
  foo: z.object({ field: z.string() }),
  bar: {
    baz: z.object({ field: z.string().or(z.number()) }),
  },
  zap: {
    zop: {
      zup: z.object({ field: z.string() }),
    },
  },
};
const test = create({ schema: testSchema });

type DebugSchemaPaths = SchemaPaths<typeof testSchema>;
type DebugWildcardPaths = WildcardPaths<SchemaPaths<typeof testSchema>>;
type DebugHasWildcard = HasWildcard<"zap.*.zup">;
type DebugInferHandler = InferSubscriptionHandler<typeof testSchema, "foo.bar.*">;
type DebugSubscriptionHandlers = MappedSubscriptionHandlers<typeof testSchema>;

const testSchemaPaths: "foo" | "bar.baz" | "zap.zop.zup" = {} as SchemaPaths<typeof testSchema>;
const testWildcardPaths:
  | "foo"
  | "*"
  | "bar.baz"
  | "zap.zop.zup"
  | "zap.*.zup"
  | "bar.*"
  | "*.baz"
  | "*.*"
  | "zap.*.*"
  | "zap.zop.*"
  | "zap.*"
  | "*.zop.zup"
  | "*.*.*"
  | "*.zop.*"
  | "*.*.zup" = {} as WildcardPaths<SchemaPaths<typeof testSchema>>;

const testHasWildcard: true = {} as HasWildcard<"*.zop.zup">;
const testHasWildcard2: true = {} as HasWildcard<"zap.*.zup">;
const testHasWildcard3: true = {} as HasWildcard<"zap.zop.*">;
const testHasNoWildcard: false = {} as HasWildcard<"z*ap.zop.zup">;

const testInferFooHandler: (data: { field: string }, event: "foo") => void = {} as InferSubscriptionHandler<
  typeof testSchema,
  "foo"
>;
const testInferBarBazHandler: InferSubscriptionHandler<typeof testSchema, "bar.baz"> = (
  data: { field: string | number },
  event: "bar.baz"
) => {};
const testInferWildcardHandler: InferSubscriptionHandler<typeof testSchema, "bar.*"> = (
  data: unknown,
  event: string
) => {};

const testSubscriptionHandlers: {
  foo: (data: { field: string }, event: "foo") => void;
  "*": (data: { field: string }, event: string) => void;
  "bar.baz": (data: { field: string | number }, event: "bar.baz") => void;
  "bar.*": (data: { field: string | number }, event: string) => void;
  "*.baz": (data: { field: string | number }, event: string) => void;
  "*.*": (data: { field: string | number }, event: string) => void;
  "zap.zop.zup": (data: { field: string }, event: "zap.zop.zup") => void;
  "zap.zop.*": (data: { field: string }, event: string) => void;
  "zap.*.zup": (data: { field: string }, event: string) => void;
  "zap.*.*": (data: { field: string }, event: string) => void;
  "*.zop.zup": (data: { field: string }, event: string) => void;
  "*.zop.*": (data: { field: string }, event: string) => void;
  "*.*.zup": (data: { field: string }, event: string) => void;
  "*.*.*": (data: { field: string }, event: string) => void;
} = {} as MappedSubscriptionHandlers<typeof testSchema>;

// PASS
test.subscribe("zap.*.zup", (data, event) => {
  // data: unknown
  // event: string
});
test.subscribe("foo", (data, event) => {
  // data: { field: string }
  // event: "foo"
});
test.subscribe("bar.baz", (data, event) => {
  // data: { field: string | number }
  // event: "bar.baz"
});
test.subscribe("zap.zop.zup", (data) => {
  // data: { field: string }
  // event: "zap.zop.zup"
});
test.publish("bar.baz", { field: "test" });

// FAIL
// @ts-expect-error
test.subscribe("zap.zop.zup.unknown", () => {});

test.subscribe("zap.zop.*", (data) => {
  // @ts-expect-error
  console.log(data.unknown); // fail
});

// @ts-expect-error
test.publish("foo.*", { field: "test" });
