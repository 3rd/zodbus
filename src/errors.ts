import { errorPrefix } from "./constants";

export class ValidationError extends Error {
  constructor(message: string) {
    super(`${errorPrefix}${message}`);
    this.name = "ValidationError";
  }
}
