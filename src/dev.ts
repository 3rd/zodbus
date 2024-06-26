/* eslint-disable @typescript-eslint/no-empty-function */
import { z } from "zod";
import type { HasWildcard, InferSubscriptionListener, SubscriptionListeners, SchemaPath, WildcardPath } from "./types";
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

type DebugSchemaPath = SchemaPath<typeof testSchema>;
type DebugWildcardPath = WildcardPath<DebugSchemaPath>;
type DebugHasWildcard = HasWildcard<"zap.*.zup">;
type DebugInferListener = InferSubscriptionListener<typeof testSchema, "bar.baz">;
type DebugSubscriptionListeners = SubscriptionListeners<typeof testSchema>;

const testSchemaPaths: "bar.baz" | "foo" | "zap.zop.zup" = {} as SchemaPath<typeof testSchema>;
const testWildcardPaths:
  | "*.*.*"
  | "*.*.zup"
  | "*.*"
  | "*.baz"
  | "*.zop.*"
  | "*.zop.zup"
  | "*"
  | "bar.*"
  | "bar.baz"
  | "foo"
  | "zap.*.*"
  | "zap.*.zup"
  | "zap.*"
  | "zap.zop.*"
  | "zap.zop.zup" = {} as WildcardPath<SchemaPath<typeof testSchema>>;

const testHasWildcard: true = {} as HasWildcard<"*">;
const testHasWildcard2: true = {} as HasWildcard<"*.zop.zup">;
const testHasWildcard3: true = {} as HasWildcard<"zap.*.zup">;
const testHasWildcard4: true = {} as HasWildcard<"zap.zop.*">;
const testHasNoWildcard: false = {} as HasWildcard<"z*ap.zop.zup">;
const testHasNoWildcard2: false = {} as HasWildcard<"**.**">;

const testInferFooListener: (data: { field: string }, event: "foo") => void = {} as InferSubscriptionListener<
  typeof testSchema,
  "foo"
>;
const testInferBarBazListener: InferSubscriptionListener<typeof testSchema, "bar.baz"> = (
  data: { field: number | string },
  event: "bar.baz"
) => {};
const testInferWildcardListener: InferSubscriptionListener<typeof testSchema, "bar.*"> = (
  data: unknown,
  event: string
) => {};

const testSubscriptionListeners: {
  foo: (data: { field: string }, event: "foo") => void;
  "*": (data: unknown, event: string) => void;
  "bar.baz": (data: { field: number | string }, event: "bar.baz") => void;
  "bar.*": (data: unknown, event: string) => void;
  "*.baz": (data: unknown, event: string) => void;
  "*.*": (data: unknown, event: string) => void;
  "zap.zop.zup": (data: { field: string }, event: "zap.zop.zup") => void;
  "zap.zop.*": (data: unknown, event: string) => void;
  "zap.*.zup": (data: unknown, event: string) => void;
  "zap.*.*": (data: unknown, event: string) => void;
  "*.zop.zup": (data: unknown, event: string) => void;
  "*.zop.*": (data: unknown, event: string) => void;
  "*.*.zup": (data: unknown, event: string) => void;
  "*.*.*": (data: unknown, event: string) => void;
} = {} as SubscriptionListeners<typeof testSchema>;

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
