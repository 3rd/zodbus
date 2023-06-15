import { Bench } from "tinybench";
import { create } from "zodbus";
import { z } from "zod";
import mitt from "mitt";
import { EventEmitter as tseep } from "tseep";
import tests from "../tests/index.mjs";
import { createAssertableListenerStore } from "../utils.mjs";

const schema = {
  foo: z.string(),
};

const debugImplementationCalls = (implementation) => {
  return Object.entries(implementation).reduce((acc, [key, value]) => {
    if (typeof value === "function") {
      acc[key] = (...args) => {
        console.log(`${key}()`, args);
        return value(...args);
      };
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});
};

const implementations = {
  zodbus: {
    init: () => create({ schema, validate: false }),
    subscribe: (instance, event, listener) => instance.subscribe(event, listener),
    unsubscribe: (instance, event, listener) => instance.unsubscribe(event, listener),
    publish: (instance, event, data) => instance.publish(event, data),
    once: (instance, event, listener) => instance.subscribeOnce(event, listener),
  },
  mitt: {
    init: () => mitt(),
    subscribe: (instance, event, listener) => instance.on(event, listener),
    unsubscribe: (instance, event, listener) => instance.off(event, listener),
    publish: (instance, event, data) => instance.emit(event, data),
    once: (instance, event, listener) => {
      const wrappedListener = () => {
        listener();
        instance.off("foo", wrappedListener);
      };
      instance.on(event, listener);
    },
  },
  tseep: {
    init: () => new tseep(),
    subscribe: (instance, event, listener) => instance.on(event, (data) => listener(data)),
    unsubscribe: (instance, event, listener) => instance.off(event, listener),
    publish: (instance, event, data) => instance.emit(event, data),
    once: (instance, event, listener) => instance.once(event, listener),
  },
};

const normalizeInstance = (implementation, instance) => {
  return {
    instance,
    subscribe: (event, listener) => implementation.subscribe(instance, event, listener),
    unsubscribe: (event, listener) => implementation.unsubscribe(instance, event, listener),
    publish: (event, data) => implementation.publish(instance, event, data),
    once: (event, listener) => implementation.once(instance, event, listener),
  };
};
const createNormalizedInstance = (implementation) => {
  const instance = implementation.init();
  return normalizeInstance(implementation, instance);
};

for (const test of tests) {
  console.log(`\n${test.name}`);

  const listenerStore = createAssertableListenerStore(implementations);
  const bench = new Bench({ time: 500 });

  let listenerCount = 0;
  let listenerCallCount = 0;
  for (const [implementationName, implementation] of Object.entries(implementations)) {
    let implementationListenerCount = 0;
    let instance = null;

    const createListener = () => {
      listenerCount++;
      implementationListenerCount++;
      const listenerKey = `${test.name}(${implementationListenerCount})`;
      const listener = listenerStore.createListener(implementationName, listenerKey);
      return (...args) => {
        listenerCallCount++;
        listener(...args);
      };
    };

    bench.add(
      `${implementationName}`,
      () => {
        test.run({
          implementation,
          instance,
          createListener,
        });
      },
      {
        beforeEach: () => {
          implementationListenerCount = 0;
          if (test.setup === false) instance = null;
          else if (typeof test.setup === "function")
            instance = test.setup({ implementation, createListener, normalizeInstance });
          else instance = createNormalizedInstance(implementation);
        },
      }
    );
  }

  await bench.run();

  console.table(bench.table());
  console.log(`Created listeners: ${listenerCount}`);
  console.log(`Listener call count: ${listenerCount}`);
  console.log(
    `Dispatched event counts:\n${Array.from(listenerStore.callMap.keys())
      .map(
        (name) =>
          `  ${name}: ${Array.from(listenerStore.callMap.get(name).values()).reduce((acc, d) => {
            return acc + d.count;
          }, 0)}`
      )
      .join("\n")}`
  );
  listenerStore.assertImplementationCalls();
}
