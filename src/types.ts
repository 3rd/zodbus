import { ZodType } from "zod";

export type IsZodType<T> = T extends ZodType ? true : false;
export type IsSchema<T> = T extends Schema ? true : false;
export type Listener<K extends string = string, V = unknown> = (data: V, event: K) => void;

export interface Schema {
  [key: string]: ZodType | Schema;
}

export type HasWildcard<T extends string> = T extends `*` | `*.${string}` | `${string}.*.${string}` | `${string}.*`
  ? true
  : false;

export type InferSubscriptionListener<
  T,
  K extends string,
  P extends string = ""
> = K extends `${infer Left}.${infer Right}`
  ? HasWildcard<Left & string> extends true
    ? Listener
    : Left extends keyof T
    ? T[Left] extends Schema
      ? InferSubscriptionListener<T[Left], Right, `${P}${Left}.`>
      : never
    : never
  : K extends keyof T
  ? T[K] extends ZodType<infer O, any, any>
    ? Listener<`${P}${K}`, O>
    : never
  : HasWildcard<K & string> extends true
  ? Listener
  : never;

export type InferSubscriptionListenerPayload<
  T,
  K extends string,
  P extends string = ""
> = K extends `${infer Left}.${infer Right}`
  ? HasWildcard<Left & string> extends true
    ? unknown
    : Left extends keyof T
    ? T[Left] extends Schema
      ? InferSubscriptionListenerPayload<T[Left], Right, `${P}${Left}.`>
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
export type NamespacePath<T, K extends keyof T = keyof T> = K extends string
  ? IsSchema<T[K]> extends true
    ? `${K}.${SchemaPath<T[K], keyof T[K]>}`
    : never
  : never;
export type SchemaPath<T, K extends keyof T = keyof T> = ZodTypePath<T, K> | NamespacePath<T, K>;

export type WildcardPath<T extends string> = T extends `${infer L}.${infer R}`
  ? `${L}.${WildcardPath<R>}` | `${L}.*` | `*.${WildcardPath<R>}`
  : T | "*";

export type ExcludeDirectlyNestedKeys<T extends string> = T extends `${infer L}.${infer R}`
  ? L | ExcludeDirectlyNestedKeys<R>
  : never;

export type Subscription<T extends Schema> = {
  [K in Exclude<WildcardPath<SchemaPath<T>>, ExcludeDirectlyNestedKeys<SchemaPath<T>>> | "*"]: {
    listener: InferSubscriptionListener<T, K>;
    payload: InferSubscriptionListenerPayload<T, K>;
  };
};

export type Subscriptions<T extends Schema> = {
  [K in keyof Subscription<T>]: Subscription<T>[K];
};

export type SubscriptionListeners<T extends Schema> = {
  [K in keyof Subscriptions<T>]: Subscriptions<T>[K]["listener"];
};

export type SubscriptionListenerPayloads<T extends Schema> = {
  [K in keyof Subscriptions<T>]: Subscriptions<T>[K]["payload"];
};

export type SubscriptionKey<T extends Schema> = Extract<keyof SubscriptionListeners<T>, string>;
export type PublishKey<T extends Schema> = Extract<SubscriptionKey<T>, SchemaPath<T>>;
