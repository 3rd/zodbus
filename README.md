# ZodBus

ZodBus is a fully-typed event bus powered by [Zod](https://zod.dev), with multiple namespace/level support and payload validation.

https://github.com/3rd/zodbus/assets/59587503/08d2c13c-cccd-407f-b14c-957d7dd5115d

## Installation

ZodBus is published on the NPM Registry: [https://npmjs.com/package/zodbus](https://npmjs.com/package/zodbus)

```sh
npm install -D zod zodbus
pnpm install -D zod zodbus
yarn add -D zod zodbus
```

## Usage

```ts
import { z } from "zod";
import { create } from "zodbus";

// This is how you define your event schema.
//  By traversing the schema, event names are built by concatenating the parent keys with dots,
//  and when a ZodType is encountered it means we have reached the end of the key definition,
//  and the ZodType describes the payload signature for the current event.
const schema = {
  foo: {
    bar: {
      baz: z.object({    // this creates the event "foo.bar.baz",
        id: z.string(),  // with the { id: string; val: number } payload type
        val: z.number()
      })
    }
  },
  zip: {
    za: z.string(),      // this creates the event "zip.za" with a string payload
    zb: z.number(),      // this creates the event "zip.zb" with a number payload
  }
};

const bus = create({ schema, validate: true });

// Non-wildcard subscription signatures are fully-typed.
bus.subscribe("foo.bar.baz", (data: { id: string; val: number; }, event: "foo.bar.baz") => {});
bus.subscribe("zip.za", (data: string, event: "zip.za") => {});

// Wildcard event signatures are typed as (data: unknown; event: string), it's up to you to handle the type.
//  The "*" wildcard is special, as it refers to all events, regardless of the nesting depth.
//  All other wildcard patterns refer to a specific event shape.
bus.subscribe("*", (data: unknown, event: string) => {}); // will be called for all events
bus.subscribe("foo.*.baz", ...); // will be called when publishing a "foo.bar.baz" event
bus.subscribe("foo.bar.*", ...); // same
bus.subscribe("*.bar.*", ...); // same
bus.subscribe("*.*.*", ...); // same
bus.subscribe("*.*", ...); // will be called for "zip.za" and "zip.zb"
bus.subscribeOnce("*.*", ...); // you can also subscribe to an event only once

// You can unsubscribe one or all handlers from one or multiple events.
bus.unsubscribe("zip.za", handler); // unsubscribe handler from "zip.za"
bus.unsubscribe("zip.*", handler); // unsubscribe handler from "zip.za" and "zip.bzb"
bus.unsubscribe("zip.*"); // unsubscribe all handlers from "zip.za" and "zip.bzb"
bus.unsubscribe("*", handler); // unsubscribe handler from all events
bus.unsubscribe("*"); // unsubscribe all handlers from all events

// Publishing is only allowed on fully-qualified event names.
bus.publish("foo.bar.baz", { id: "uwu", val: 4815162342 });

// Utilities
bus.getEventNames(); // ["foo.bar.baz", "zip.za", "zip.zb"]
bus.getListeners("zip.*"); // gets the listeners for "zip.*"
bus.getListeners(); // gets all listeners
const data = await bus.waitFor("zip.zap"); // typed waitFor with timeout and filter support
```

### Payload validation

Payload validation is performed by Zod based on the schema, and **enabled by default**.
\
It is however optional if you don't have to validate external data.
\
For most use-cases the type checking is enough as it won't allow you to make mistakes.
