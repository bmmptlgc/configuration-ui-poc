import { useMemo, useState } from 'react';

import { StateApi, StateApiWithModal } from '../types/state';
import { useAppStore } from '../stores/appStore';

/**
 * Generic function that adds state to the a component (with the useState hook), initializes the state and
 * uses a factory to return an Api (Application Programming Interface, not to confuse with a web/rest api)
 * that manages the state. We can optimize useStateApi by memoizing the execution of stateApi.
 * @param stateApi is a function that creates and returns a state Api
 * @param initialState is the initial state of the component
 *
 * @returns an Api with the component's state properties and methods to manage them
 */
export const useStateApi = <S, A>(
  stateApi: StateApi<S, A>,
  initialState: S
): A => {
  const [state, setState] = useState<S>(initialState);

  return useMemo(
    (): A => stateApi({state, setState}),
    [state, setState, stateApi]
  );
};

// Same as the hook above, but allows components to show the modal window while setting their state
export const useStateApiWithModal = <S, A>(
  stateApi: StateApiWithModal<S, A>,
  initialState: S
): A => {
  const [state, setState] = useState<S>(initialState);
  const {showModal} = useAppStore();

  return useMemo(
    (): A => stateApi({state, setState}, {showModal}),
    [state, setState, stateApi]
  );
};