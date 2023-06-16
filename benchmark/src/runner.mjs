import * as mitata from "mitata";
import { create } from "zodbus";
import { z } from "zod";
import mitt from "mitt";
import { EventEmitter as tseep } from "tseep";
import { createAssertableListenerStore, banner } from "./utils.mjs";

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
    reset: (instance) => instance.unsubscribe("*"),
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
    reset: (instance) => instance.all.clear(),
  },
  tseep: {
    init: () => new tseep(),
    subscribe: (instance, event, listener) => instance.on(event, (data) => listener(data)),
    unsubscribe: (instance, event, listener) => instance.off(event, listener),
    publish: (instance, event, data) => instance.emit(event, data),
    once: (instance, event, listener) => instance.once(event, listener),
    reset: (instance) => instance.removeAllListeners(),
  },
};

const normalizeInstance = (implementation, instance) => {
  return {
    instance,
    subscribe: (event, listener) => implementation.subscribe(instance, event, listener),
    unsubscribe: (event, listener) => implementation.unsubscribe(instance, event, listener),
    publish: (event, data) => implementation.publish(instance, event, data),
    once: (event, listener) => implementation.once(instance, event, listener),
    reset: () => implementation.reset(instance),
  };
};
const createNormalizedInstance = (implementation) => {
  const instance = implementation.init();
  return normalizeInstance(implementation, instance);
};

export const benchmark = async (suite) => {
  banner(suite.name);

  const listenerStore = createAssertableListenerStore(implementations);
  let listenerCount = 0;
  let listenerCallCount = 0;

  mitata.group(suite.name, () => {
    for (const [implementationName, implementation] of Object.entries(implementations)) {
      let implementationListenerCount = 0;

      const createListener = () => {
        listenerCount++;
        implementationListenerCount++;
        const listenerKey = `${suite.name}(${implementationListenerCount})`;
        const listener = listenerStore.createListener(implementationName, listenerKey);
        return (...args) => {
          listenerCallCount++;
          listener(...args);
        };
      };

      const createInstance = () => {
        if (suite.setup === false) return null;
        else if (typeof suite.setup === "function")
          return suite.setup({ implementation, createListener, normalizeInstance });
        else return createNormalizedInstance(implementation);
      };
      const instance = createInstance();

      mitata.bench(`${implementationName}`, () => {
        implementationListenerCount = 0;
        instance?.reset();
        suite.run({
          implementation,
          instance,
          createListener,
        });
      });
    }
  });

  await mitata.run({});

  console.log(`\nCreated listeners: ${listenerCount}`);
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
};
