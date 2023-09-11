import createStore from './createStore';

// eslint-disable-next-line @typescript-eslint/ban-types
const {StoreProvider: ModuleStoreProvider, useStore: useModuleStore} = createStore<{}, {}>(
  (): Record<string, unknown> => ({}),
  {}
);

export { ModuleStoreProvider, useModuleStore };
