const MAX_ASSERT_ERROR_DATA_LENGTH = 100;

export const assert = (actual, expected, message = "Assertion failed") => {
  const stringifiedActual = JSON.stringify(actual, null, 2);
  const stringifiedExpected = JSON.stringify(expected, null, 2);
  if (stringifiedActual !== stringifiedExpected) {
    throw new Error(
      `${message}\n  Expected:\n ${stringifiedExpected.substring(
        0,
        MAX_ASSERT_ERROR_DATA_LENGTH
      )}\n  Actual:\n ${stringifiedActual.substring(0, MAX_ASSERT_ERROR_DATA_LENGTH)}`
    );
  }
};

export const createAssertableListenerStore = (implementations) => {
  // Map<`${implementation}`, Map<`${test}(${index})`, { data, count }>>
  const callMap = new Map(Object.keys(implementations).map((name) => [name, new Map()]));

  const createListener = (implementationName, listenerKey) => {
    const listener = function (data) {
      const implementationCalls = callMap.get(implementationName);
      const previousEntry = implementationCalls.get(listenerKey);
      const callCount = previousEntry ? previousEntry.count + 1 : 1;
      implementationCalls.set(listenerKey, { data, count: callCount });
    };
    return listener;
  };

  const assertImplementationCalls = () => {
    const implementationCalls = Array.from(callMap.entries());
    const expected = implementationCalls[0][1];
    for (const [implementationName, calls] of implementationCalls) {
      assert(
        Array.from(calls.values()).map((d) => d.data),
        Array.from(expected.values()).map((d) => d.data),
        `Implementation ${implementationName} called with unexpected arguments`
      );
    }
  };

  return {
    createListener,
    assertImplementationCalls,
    callMap,
  };
};
