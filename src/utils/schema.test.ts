import { z } from "zod";
import { getPublishPaths, getSubscribePaths, getSubPubPathMap } from "./schema";

const schema = {
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

describe("getPublishPaths", () => {
  it("resolves all paths", () => {
    const paths = getPublishPaths(schema);
    expect(paths).toEqual(["foo", "bar.baz", "zap.zop.zup.zip"]);
  });
});

describe("getSubscribePaths", () => {
  it("resolves all paths", () => {
    const paths = getSubscribePaths(schema);
    expect(paths).toEqual([
      "foo",
      "*",
      "bar.baz",
      "bar.*",
      "*.baz",
      "*.*",
      "zap.zop.zup.zip",
      "zap.zop.zup.*",
      "zap.zop.*.zip",
      "zap.zop.*.*",
      "zap.*.zup.zip",
      "zap.*.zup.*",
      "zap.*.*.zip",
      "zap.*.*.*",
      "*.zop.zup.zip",
      "*.zop.zup.*",
      "*.zop.*.zip",
      "*.zop.*.*",
      "*.*.zup.zip",
      "*.*.zup.*",
      "*.*.*.zip",
      "*.*.*.*",
    ]);
  });
});

describe("getPubSubPathMap", () => {
  it("resolves all paths", () => {
    const map = getSubPubPathMap(schema);
    expect(map).toEqual({
      foo: ["foo"],
      "*": ["foo"],
      "bar.baz": ["bar.baz"],
      "bar.*": ["bar.baz"],
      "*.baz": ["bar.baz"],
      "*.*": ["bar.baz"],
      "zap.zop.zup.zip": ["zap.zop.zup.zip"],
      "zap.zop.zup.*": ["zap.zop.zup.zip"],
      "zap.zop.*.zip": ["zap.zop.zup.zip"],
      "zap.zop.*.*": ["zap.zop.zup.zip"],
      "zap.*.zup.zip": ["zap.zop.zup.zip"],
      "zap.*.zup.*": ["zap.zop.zup.zip"],
      "zap.*.*.zip": ["zap.zop.zup.zip"],
      "zap.*.*.*": ["zap.zop.zup.zip"],
      "*.zop.zup.zip": ["zap.zop.zup.zip"],
      "*.zop.zup.*": ["zap.zop.zup.zip"],
      "*.zop.*.zip": ["zap.zop.zup.zip"],
      "*.zop.*.*": ["zap.zop.zup.zip"],
      "*.*.zup.zip": ["zap.zop.zup.zip"],
      "*.*.zup.*": ["zap.zop.zup.zip"],
      "*.*.*.zip": ["zap.zop.zup.zip"],
      "*.*.*.*": ["zap.zop.zup.zip"],
    });
  });
});
