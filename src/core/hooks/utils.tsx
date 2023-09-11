import { DependencyList, useEffect, useLayoutEffect, useRef } from 'react';

export const useIsFirstRender = (): boolean => {
  const isFirstRender = useRef(true);

  useEffect(
    () => {
      isFirstRender.current = false;
    },
    []
  );

  return isFirstRender.current;
};

export const useCancelableEffect = (
  effect: (cleanup: { didCancel: boolean }) => void,
  deps?: DependencyList,
  cleanupCallBack?: () => void
): void => {
  useEffect((): (() => void) => {
    /**
     * This cleanup object addresses the React warning below:
     *
     * "Warning: Can't perform a React state update on an unmounted component.
     * This is a no-op, but it indicates a memory leak in your application.
     * To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function."
     *
     * It is an object and not just a boolean variable, because we are passing it into effect(...),
     * so we need an object in order to pass it by reference.
     *
     * ALWAYS CHECK !cleanup.didCancel INSIDE THE effect CALLBACK FUNCTION BODY, BEFORE EACH UPDATE TO LOCAL STATE
     */
    const cleanup = {
      didCancel: false
    };

    effect(cleanup);

    return (): void => {
      cleanup.didCancel = true;
      cleanupCallBack && cleanupCallBack();
    };
  }, deps);
};

export const useCancelableLayoutEffect = (
  layoutEffect: (cleanup: { didCancel: boolean }) => (() => void) | undefined,
  deps?: DependencyList,
  cleanupCallBack?: () => void
): void => {
  useLayoutEffect((): (() => void) => {
    /**
     * This cleanup object addresses the React warning below:
     *
     * "Warning: Can't perform a React state update on an unmounted component.
     * This is a no-op, but it indicates a memory leak in your application.
     * To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function."
     *
     * It is an object and not just a boolean variable, because we are passing it into effect(...),
     * so we need an object in order to pass it by reference.
     *
     * ALWAYS CHECK !cleanup.didCancel INSIDE THE effect CALLBACK FUNCTION BODY, BEFORE EACH UPDATE TO LOCAL STATE
     */
    const cleanup = {
      didCancel: false
    };

    const returnCallBack = layoutEffect(cleanup);

    return (): void => {
      cleanup.didCancel = true;
      returnCallBack && returnCallBack();
      cleanupCallBack && cleanupCallBack();
    };
  }, deps);
};