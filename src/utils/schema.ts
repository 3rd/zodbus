import { ZodType } from "zod";
import { Schema } from "../types";

export const hasWildcard = (path: string): boolean => path.split(".").includes("*");

export const getPublishPaths = (schema: Schema | ZodType, prefix = ""): string[] => {
  const paths: string[] = [];
  for (const [k, v] of Object.entries(schema)) {
    const newPrefix = prefix ? `${prefix}.${k}` : k;
    if (typeof v.parse === "function") {
      paths.push(newPrefix);
    } else {
      paths.push(...getPublishPaths(v, newPrefix));
    }
  }
  return paths;
};

export const getSubscribePaths = (schema: Schema | ZodType, prefix = ""): string[] => {
  const paths: string[] = [];
  for (const [k, v] of Object.entries(schema)) {
    const newPrefix = prefix ? `${prefix}.${k}` : k;
    const newWildcardPrefix = prefix ? `${prefix}.*` : "*";
    if (typeof v.parse === "function") {
      paths.push(newPrefix, newWildcardPrefix);
    } else {
      paths.push(...getSubscribePaths(v, newPrefix), ...getSubscribePaths(v, newWildcardPrefix));
    }
  }
  return paths;
};

export const getSubPubPathMap = (schema: Schema | ZodType): Record<string, string[]> => {
  const map: Record<string, string[]> = {};
  const publishPaths = getPublishPaths(schema);
  const subscribePaths = getSubscribePaths(schema);

  for (const subscribePath of subscribePaths) {
    const subscribeParts = subscribePath.split(".");
    map[subscribePath] = publishPaths.filter((publishPath) => {
      const publishParts = publishPath.split(".");
      if (publishParts.length !== subscribeParts.length) return false;
      for (let i = 0; i < publishParts.length; i++) {
        if (subscribeParts[i] !== "*" && publishParts[i] !== subscribeParts[i]) return false;
      }
      return true;
    });
  }

  return map;
};
