import createStore from './createStore';

// eslint-disable-next-line @typescript-eslint/ban-types
const {StoreProvider: DomainStoreProvider, useStore: useDomainStore} = createStore<{}, {}>(
  (): Record<string, unknown> => ({}),
  {}
);

export { DomainStoreProvider, useDomainStore };
