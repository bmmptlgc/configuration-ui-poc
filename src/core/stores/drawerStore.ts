/* eslint-disable  @typescript-eslint/no-explicit-any */
import createStore from './createStore';

// I'm not a fan of "any", but the stateApi here can be anything, depending on what is going to be rendered
// inside the drawer. If anyone knows of a type safe way to do this, let me know.
const {StoreProvider: DrawerStoreProvider, useStore: useDrawerPanelStore} = createStore<any, any>(
  (): Record<string, unknown> => ({}),
  {}
);

export { DrawerStoreProvider, useDrawerPanelStore };