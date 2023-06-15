const MAX_ASSERT_ERROR_DATA_LENGTH = 100;

const stringiTrimify = (data) => {
  const stringified = JSON.stringify(data, null, 2);
  return stringified.substring(0, MAX_ASSERT_ERROR_DATA_LENGTH);
};

export const assert = (actual, expected, message = "Assertion failed") => {
  const expectedEntries = Array.from(expected.entries());
  const actualEntries = Array.from(actual.entries());

  for (let i = 0; i < expectedEntries.length; i++) {
    const [key, expectedValue] = expectedEntries[i];
    const actualValue = actualEntries[i][1];
    if (JSON.stringify(expectedValue.data) !== JSON.stringify(actualValue.data)) {
      throw new Error(
        `${message}\n  Expected ${key} to be called with ${stringiTrimify(
          expectedValue.data
        )}, but was called with ${stringiTrimify(actualValue.data)}`
      );
    }
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
      assert(calls, expected, `Implementation ${implementationName} called with unexpected arguments`);
    }
  };

  return {
    createListener,
    assertImplementationCalls,
    callMap,
  };
};
