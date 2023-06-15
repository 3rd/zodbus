import testInit from "./init.mjs";
import testPublishNoListeners from "./publish-no-listeners.mjs";
import testPublishSingleListener from "./publish-single-listener.mjs";
import testPublishMultipleListeners from "./publish-multiple-listeners.mjs";
import testSubscribe from "./subscribe-unsubscribe.mjs";
import testOnce from "./once.mjs";

export default [
  testInit,
  testPublishNoListeners,
  testPublishSingleListener,
  testPublishMultipleListeners,
  testSubscribe,
  testOnce,
];
