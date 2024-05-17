## [1.1.3](https://github.com/3rd/zodbus/compare/v1.1.2...v1.1.3) (2024-05-17)

### Bug Fixes

- publish ([4ee3856](https://github.com/3rd/zodbus/commit/4ee385643037665569282ef6de07ef33e63b9d4e))

# [1.1.0](https://github.com/3rd/zodbus/compare/v1.0.4...v1.1.0) (2024-05-17)

### Bug Fixes

- make sure zod is not bundled ([2089f31](https://github.com/3rd/zodbus/commit/2089f313b689e2c15873971ba3b683106816a170))

### Features

- add InferBusType, InferPublishHandler, InferSubscribeHandler helpers ([980408c](https://github.com/3rd/zodbus/commit/980408cec8ad3a787b5f1ed844616e752ee8b4c6))
- export InferSubscriptionKey and InferPublishKey helpers ([6322818](https://github.com/3rd/zodbus/commit/6322818830b1242951a17f3695583b0324ae7c31))

# [1.1.0](https://github.com/3rd/zodbus/compare/v1.0.4...v1.1.0) (2024-05-17)

### Features

- add InferBusType, InferPublishHandler, InferSubscribeHandler helpers ([980408c](https://github.com/3rd/zodbus/commit/980408cec8ad3a787b5f1ed844616e752ee8b4c6))

## [1.0.4](https://github.com/3rd/zodbus/compare/v1.0.3...v1.0.4) (2024-02-26)

### Bug Fixes

- typings mapping & clean-up ([5b3cc4a](https://github.com/3rd/zodbus/commit/5b3cc4aa1932b754958f84cd0d4cf9a9dea25762))

## [1.0.3](https://github.com/3rd/zodbus/compare/v1.0.2...v1.0.3) (2023-06-15)

### Bug Fixes

- move README.md to the right place ([dbc03d3](https://github.com/3rd/zodbus/commit/dbc03d3eefb21766c2d1dd53e46e898859123f96))

## [1.0.2](https://github.com/3rd/zodbus/compare/v1.0.1...v1.0.2) (2023-06-15)

### Bug Fixes

- always include "\*" as a valid subscription key ([787c2e6](https://github.com/3rd/zodbus/commit/787c2e6998bc7af8972a36aeaf0dd28632c6c8ca))

## [1.0.1](https://github.com/3rd/zodbus/compare/v1.0.0...v1.0.1) (2023-06-15)

### Bug Fixes

- fix types not built on CI ([f1ed4de](https://github.com/3rd/zodbus/commit/f1ed4de60c7df0b98bcee4982826bc7059d4b1ff))

# 1.0.0 (2023-06-15)

### Bug Fixes

- clean-up HasWildcard ([68417fe](https://github.com/3rd/zodbus/commit/68417fefe011c4e4264fb77b743a9ed28d8f9bd0))
- default to validation enabled ([a67b0f1](https://github.com/3rd/zodbus/commit/a67b0f1ce8c2aaec485156d6ada12bc5838dbc9e))
- fix exports and build to ESM by default ([0870105](https://github.com/3rd/zodbus/commit/08701051edbdf14a396d16910f9da5c80eb4e0c2))
- fix inconsistent return, optimize & clean-up types ([5efc117](https://github.com/3rd/zodbus/commit/5efc117e18ed14656ac84b010a4f3e0bcd487f6e))
- keep the listener map internal ([6a884e7](https://github.com/3rd/zodbus/commit/6a884e70a5cfa04bc580bde286e32b1b93b29ad6))

### Features

- add EventEmitter stub ([1937800](https://github.com/3rd/zodbus/commit/1937800e19ea6b5776fb5a9b14c8ce816cefc9c7))
- add getListeners to get the listeners for an event or all if omitted ([dda38b5](https://github.com/3rd/zodbus/commit/dda38b513731cab382b53ded0686eea3d2644a21))
- add special catch-call handling case using the "\*" event path and refactor ([e3a1feb](https://github.com/3rd/zodbus/commit/e3a1febc30dc42eedee593bda73a6a4392214777))
- add waitFor with timeout and filter support ([2c7fcb4](https://github.com/3rd/zodbus/commit/2c7fcb4212219866f33a49a941999b53a2b48fd8))
- add wildcard support ([388ed60](https://github.com/3rd/zodbus/commit/388ed60a6bf08c53fa517d7119e474342dd9c475))
- bootstrap benchmark ([ef0be2a](https://github.com/3rd/zodbus/commit/ef0be2aaa80ddc27c5c1611d50664ce93979512b))
- EventEmitter / EventTarget experiments ([1a29bc0](https://github.com/3rd/zodbus/commit/1a29bc0d67875ce7019ed7fc12898711c498e98b))
- genesis ([c6752e8](https://github.com/3rd/zodbus/commit/c6752e88fbb7e7a0e03d2d44a9310d98a02d8ab8))
- restrict publish event type to valid ZodType paths ([6c27b62](https://github.com/3rd/zodbus/commit/6c27b62b97d18f4c4af1dc6607e8ef7c97838b8b))
- return eventNames and extract helper types from bus.create ([bad81bb](https://github.com/3rd/zodbus/commit/bad81bb1789b46681432a7f730cd0384b59ccdb5))
- rework benchmarking and add primary benchmarks :slick: ([ed47b96](https://github.com/3rd/zodbus/commit/ed47b964314798ae0111f6148c5bd3a7f41827c9))
