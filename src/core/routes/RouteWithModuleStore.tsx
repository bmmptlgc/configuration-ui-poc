import { ReactElement } from 'react';

import { useAppStore } from '../stores/appStore';
import { useCancelableEffect } from '../hooks/utils';
import { RouteWithStoreProps } from '../types/routes';

const RouteWithModuleStore = <S, A>({route, children, storeApi}: RouteWithStoreProps<S, A>): ReactElement => {
  const appStore = useAppStore();

  useCancelableEffect(
    (cleanup: { didCancel: boolean }): void => {
      !cleanup.didCancel && appStore.setModuleStore(route, storeApi);
    },
    [storeApi]
  );

  return (
    <>
      {
        route === appStore.moduleRoute && children
      }
    </>
  );
};

export default RouteWithModuleStore;