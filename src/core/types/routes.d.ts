import { ReactNode } from 'react';

import { StateApi } from './state';

export type RouteWithStoreProps<S, A> = {
  route: string;
  children: ReactNode;
  storeApi: StateApi<S, A>;
};