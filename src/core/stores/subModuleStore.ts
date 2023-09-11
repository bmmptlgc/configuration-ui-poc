import createStore from './createStore';

// eslint-disable-next-line @typescript-eslint/ban-types
const {StoreProvider: SubModuleStoreProvider, useStore: useSubModuleStore} = createStore<{}, {}>(
  (): Record<string, unknown> => ({}),
  {}
);

export { SubModuleStoreProvider, useSubModuleStore };
