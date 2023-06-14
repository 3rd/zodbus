import { ZodType } from "zod";

export type IsZodType<T> = T extends ZodType ? true : false;
export type IsSchema<T> = T extends Schema ? true : false;
export type Listener<P = unknown, K extends string = string> = (data: P, event: K) => void;

export type Schema = { [key: string]: ZodType | Schema };

export type HasWildcard<T extends string> = T extends
  | `*`
  | `*.${infer _End}`
  | `${infer _Start}.*.${infer _End}`
  | `${infer _Start}.*`
  ? true
  : false;

export type InferSubscriptionHandler<
  T,
  K extends string,
  P extends string = ""
> = K extends `${infer Left}.${infer Right}`
  ? HasWildcard<Left & string> extends true
    ? Listener
    : Left extends keyof T
    ? T[Left] extends Schema
      ? InferSubscriptionHandler<T[Left], Right, `${P}${Left}.`>
      : never
    : never
  : K extends keyof T
  ? T[K] extends ZodType<infer O, any, any>
    ? Listener<O, `${P}${K}`>
    : never
  : HasWildcard<K & string> extends true
  ? Listener
  : never;

export type InferSubscriptionHandlerPayload<
  T,
  K extends string,
  P extends string = ""
> = K extends `${infer Left}.${infer Right}`
  ? HasWildcard<Left & string> extends true
    ? unknown
    : Left extends keyof T
    ? T[Left] extends Schema
      ? InferSubscriptionHandlerPayload<T[Left], Right, `${P}${Left}.`>
      : never
    : never
  : K extends keyof T
  ? T[K] extends ZodType<infer O, any, any>
    ? O
    : never
  : HasWildcard<K & string> extends true
  ? unknown
  : never;

export type ZodTypePath<T, K extends keyof T = keyof T> = K extends string
  ? IsZodType<T[K]> extends true
    ? K
    : never
  : never;
export type SchemaPath<T, K extends keyof T = keyof T> = K extends string
  ? IsSchema<T[K]> extends true
    ? `${K}.${SchemaPaths<T[K], keyof T[K]>}`
    : never
  : never;
export type SchemaPaths<T, K extends keyof T = keyof T> = ZodTypePath<T, K> | SchemaPath<T, K>;

export type WildcardPaths<T extends string> = T extends `${infer L}.${infer R}`
  ? IsZodType<L> extends true
    ? `${L}.${WildcardPaths<R>}` | `${L}.*`
    : `${L}.${WildcardPaths<R>}` | `${L}.*` | `*.${WildcardPaths<R>}`
  : T | "*";

export type ExcludeDirectlyNestedKeys<T extends string> = T extends `${infer L}.${infer R}`
  ? L | ExcludeDirectlyNestedKeys<R>
  : never;

export type MappedSubscriptionHandlers<T extends Schema> = {
  [K in Exclude<WildcardPaths<SchemaPaths<T>>, ExcludeDirectlyNestedKeys<SchemaPaths<T>>>]: InferSubscriptionHandler<
    T,
    K
  >;
};

export type MappedSubscriptionHandlerPayloads<T extends Schema> = {
  [K in Exclude<
    WildcardPaths<SchemaPaths<T>>,
    ExcludeDirectlyNestedKeys<SchemaPaths<T>>
  >]: InferSubscriptionHandlerPayload<T, K>;
};
