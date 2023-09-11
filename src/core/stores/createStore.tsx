import { createContext, ReactElement, ReactNode, useContext, useEffect } from 'react';

import { useStateApi } from '../hooks/state';
import { StateApi } from '../types/state';

interface Store<S, A> {
  StoreProvider: (props: { storeApi?: StateApi<S, A>; children?: ReactNode }) => ReactElement;
  useStore: () => A;
}

const createStore = <S, A>(
  storeApi: StateApi<S, A>,
  initialState: S,
  effectCallback?: (store: A) => (() => void),
): Store<S, A> => {
  // The actual initial context (or initial store) is defined by each different type of store we create,
  // and is only really "created" when we call useStateApi inside our StoreProvider, so we don't have access to it
  // at this point and just set it to null
  const StoreContext = createContext<A>((initialState as unknown) as A);

  const StoreProvider = (props: { storeApi?: StateApi<S, A>; children?: ReactNode }): ReactElement => {
    const store = useStateApi(props.storeApi || storeApi, initialState);

    useEffect(
      () => {
        let returnCallBack: () => void;

        if (effectCallback) {
          returnCallBack = effectCallback(store);
        }

        return (): void => {
          returnCallBack && returnCallBack();
        }
      },
      []
    );

    return (
      <StoreContext.Provider value={store}>
        {props.children}
      </StoreContext.Provider>
    );
  };

  const useStore = (): A => {
    return useContext(StoreContext);
  };

  return {StoreProvider, useStore};
};

export default createStore;
