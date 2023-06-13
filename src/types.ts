import { ZodType } from "zod";

export type IsZodType<T> = T extends ZodType ? true : false;
export type IsSchema<T> = T extends Schema ? true : false;
export type WildcardListener = ({ event, data }: { event: string; data: unknown }) => void;

export type Schema = { [key: string]: ZodType | Schema };

export type HasWildcard<T extends string> = T extends
  | `*`
  | `*.${infer _End}`
  | `${infer _Start}.*.${infer _End}`
  | `${infer _Start}.*`
  ? true
  : false;

export type InferHandler<T, K> = K extends `${infer Left}.${infer Right}`
  ? HasWildcard<Left & string> extends true
    ? WildcardListener
    : Left extends keyof T
    ? T[Left] extends Schema
      ? InferHandler<T[Left], Right>
      : never
    : never
  : K extends keyof T
  ? T[K] extends ZodType<infer O, any, any>
    ? (arg: O) => void
    : never
  : HasWildcard<K & string> extends true
  ? WildcardListener
  : never;

export type StringPath<T> = T extends string ? T : never;
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
export type SchemaPaths<T, K extends keyof T = keyof T> = StringPath<K> | ZodTypePath<T, K> | SchemaPath<T, K>;

export type WildcardPaths<T extends string> = T extends `${infer L}.${infer R}`
  ? IsZodType<L> extends true
    ? `${L}.${WildcardPaths<R>}` | `${L}.*`
    : `${L}.${WildcardPaths<R>}` | `${L}.*` | `*.${WildcardPaths<R>}`
  : T | "*";

export type ExcludeDirectlyNestedKeys<T extends string> = T extends `${infer L}.${infer R}`
  ? L | ExcludeDirectlyNestedKeys<R>
  : never;

export type MappedHandlers<T extends Schema> = {
  [K in Exclude<WildcardPaths<SchemaPaths<T>>, ExcludeDirectlyNestedKeys<SchemaPaths<T>>>]: InferHandler<T, K>;
};
