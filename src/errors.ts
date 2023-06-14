import { errorPrefix } from "./constants";

export class ValidationError extends Error {
  constructor(message: string) {
    super(`${errorPrefix}${message}`);
    this.name = "ValidationError";
  }
}

export class RuntimeError extends Error {
  constructor(message: string) {
    super(`${errorPrefix}${message}`);
    this.name = "RuntimeError";
  }
}
