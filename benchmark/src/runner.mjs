import * as mitata from "mitata";
import { create } from "zodbus";
import { z } from "zod";
import mitt from "mitt";
import { EventEmitter as tseep } from "tseep";
import { createAssertableListenerStore, banner } from "./utils.mjs";

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

const createInstances = () => {
  const zodbus = create({ schema: { foo: z.string() }, validate: false });
  const mittEmitter = mitt();
  const tseepEmitter = new tseep();
  return {
    zodbus,
    mitt: mittEmitter,
    tseep: tseepEmitter,
  };
};

const DEBUG = false;

export const benchmark = async (suite) => {
  banner(suite.name);

  const listenerStore = createAssertableListenerStore(["zodbus", "mitt", "tseep"]);
  let listenerCount = 0;
  let listenerCallCount = 0;
  let implementationListenerCounts = {
    zodbus: 0,
    mitt: 0,
    tseep: 0,
  };

  const createListener = function (implementationName) {
    if (!DEBUG) return function () {};
    listenerCount++;
    implementationListenerCounts[implementationName]++;
    const listenerKey = `${suite.name}(${implementationListenerCounts[implementationName]})`;
    const listener = listenerStore.createListener(implementationName, listenerKey);
    return function (data) {
      listenerCallCount++;
      listener(data);
    };
  };

  const instances = createInstances();
  let exportedSetupContext = null;
  if (suite.setup) {
    exportedSetupContext = suite.setup({ ...instances, createListener });
  }

  const tests = Object.entries(suite.run).map(([key, run]) => {
    const context = {
      instance: suite.setup === false ? null : instances[key],
      createListener,
      ...exportedSetupContext,
    };
    return {
      name: key,
      run: run.bind(null, context),
    };
  });

  mitata.bench("noop", () => {});

  mitata.group(suite.name, () => {
    for (const test of tests) {
      mitata.bench(test.name, test.run);
    }
  });

  await mitata.run({});

  if (DEBUG) {
    console.log(`\nCreated listeners: ${listenerCount}`);
    console.log(`Listener call count: ${listenerCallCount}`);
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
};
