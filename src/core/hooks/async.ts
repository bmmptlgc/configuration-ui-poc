import { DependencyList, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MutationFunction,
  QueryFunction,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult
} from 'react-query';
import { QueryKey } from 'react-query/types/core/types';

import Constants from '../constants';
import { useAppStore } from '../stores/appStore';
import { forPromise } from '../helpers/utils';
import { HttpServiceApi, HttpServiceOptions } from '../types/services';
import { ApiErrorResponse } from '../http-service';
import HttpService, { HttpMethods } from '../http-service/HttpService';

import { AppConfig } from '../types/appConfig';
import { AppConfiguration } from '../components/app/App';

export const useAsyncEffect = (
  effect: (cleanup: { didCancel: boolean }) => Promise<void>,
  deps?: DependencyList,
  cleanupCallBack?: () => void
): void => {
  const {showModal} = useAppStore();

  const {t} = useTranslation(Constants.Localization.Namespaces.CORE);

  useEffect(
    (): (() => void) => {
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
       * ALWAYS CHECK !cleanup.didCancel INSIDE THE effect CALLBACK, BEFORE EACH UPDATE TO LOCAL STATE
       */
      const cleanup = {
        didCancel: false
      };

      (async () => {
        await effect(cleanup).catch(() => {
          showModal({
            title: t('modal.defaultError.title'),
            body: t('modal.defaultError.message')
          });
        });
      })();

      return (): void => {
        cleanup.didCancel = true;
        cleanupCallBack && cleanupCallBack();
      };
    },
    deps
  );
};

export const useHttpService = (abortController: AbortController): HttpServiceApi => {
  const {user: {token}, showModal} = useAppStore();

  const {t} = useTranslation(Constants.Localization.Namespaces.CORE);

  const sendRequest = async <T, R>(
    url: string,
    body: T | string | null = null,
    {
      useToken = true,
      ...options
    }: HttpServiceOptions = {}
  ): Promise<R | null> => {

    const onFailure = (
      error: ApiErrorResponse | TypeError | DOMException
    ): void => {
      if (options.onFailure) {
        options.onFailure(error);
      } else {
        showModal({
          body: t([`api.errors.${(error as ApiErrorResponse).status}`, 'api.errors.default'])
        });
      }
    };

    const headers = new Headers();

    headers.append('Content-Type', options.contentType || 'application/json');
    headers.append('Accept', 'application/json');

    if (useToken) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    if (options.additionalHeaders) {
      for (const [key, value] of Object.entries(options.additionalHeaders)) {
        headers.append(key, value);
      }
    }

    const init: RequestInit = {
      method: options.method || HttpMethods.GET,
      headers: headers
    };

    const request = new Request(encodeURI(url), init);

    const requestData: RequestInit = body
      ? {
        body: options.contentType === 'application/x-www-form-urlencoded'
          ? body as string
          : JSON.stringify(body)
      }
      : {};

    const {error, response} = await forPromise<R>(HttpService.request<R>(
      request,
      {
          signal: abortController.signal,
        ...requestData,
      }
    ));

    // Only run the callBack if the error didn't result from the request being aborted
    if (error && (error as DOMException).code !== 20) {
      onFailure(error);
    }

    return response;
  };

  return {
    sendRequest
  };
};

export const useHttpQuery = <
  TQueryFnData,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: TQueryKey,
  queryFn: QueryFunction<TQueryFnData, TQueryKey>,
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> = {},
): UseQueryResult<TData, TError> => {
  const {config: appConfiguration} = useContext<AppConfig>(AppConfiguration);

  return useQuery<TQueryFnData, TError, TData, TQueryKey>(queryKey, queryFn, {
    ...options,
    // specifying the 2 values below is necessary to guarantee cache invalidation
    cacheTime: options.cacheTime || appConfiguration.cacheTimeout,
    staleTime: options.staleTime || appConfiguration.cacheTimeout,
  });
};

export const useHttpCreate = <
  TData,
  TError = unknown,
  TEntity = unknown,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: TQueryKey,
  mutationFn: MutationFunction<TData, TEntity>,
  options?: UseMutationOptions<TData, TError, TEntity, void>,
): UseMutationResult<TData, TError, TEntity, void> => {
  const queryClient = useQueryClient();

  return useMutation<TData, TError, TEntity, void>(mutationFn, {
    ...options,
    onSuccess: (createdEntity, variables, context): void => {
      const previousArray = queryClient.getQueryData(queryKey) as TData[];

      queryClient.setQueryData(queryKey, [...previousArray, createdEntity]);

      options &&
      options.onSuccess &&
      options.onSuccess(createdEntity, variables, context);
    },
  });
};

interface ExtendedUseMutationOptions<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TEntity = unknown,
  TContext = unknown,
> extends UseMutationOptions<TData, TError, TVariables, TContext> {
  idFieldName?: string;
  updateCacheCallback?: (
    previousArray: TEntity[],
    variables: TVariables,
  ) => TEntity[];
}

export const useHttpUpdate = <
  TData,
  TError = unknown,
  TVariables = void,
  TEntity = TVariables | unknown,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: TQueryKey,
  mutationFn: MutationFunction<TData, TVariables>,
  {
    idFieldName = 'id',
    ...options
  }: ExtendedUseMutationOptions<
    TData,
    TError,
    TVariables,
    TEntity,
    { previousArray: TEntity[] }
  > = {},
): UseMutationResult<
  TData,
  TError,
  TVariables,
  { previousArray: TEntity[] }
> => {
  const queryClient = useQueryClient();

  return useMutation<TData, TError, TVariables, { previousArray: TEntity[] }>(
    mutationFn,
    {
      ...options,
      onMutate:
        (options && options.onMutate) ||
        (async (updatedEntity): Promise<{ previousArray: TEntity[] }> => {
          await queryClient.cancelQueries(queryKey);

          const previousArray = queryClient.getQueryData(queryKey) as TEntity[];

          let nextArray;

          if (!options.updateCacheCallback) {
            // Spread the cached collection, so that we don't mutate it
            nextArray = [...previousArray];

            const updatedArrayIndex = nextArray.findIndex(
              entity =>
                entity[idFieldName as keyof TEntity] ===
                (updatedEntity as unknown as TEntity)[
                  idFieldName as keyof TEntity
                  ],
            );

            // This will not mutate the cache, because we spread it above
            nextArray[updatedArrayIndex] = {
              ...nextArray[updatedArrayIndex],
              ...updatedEntity,
            };
          } else {
            nextArray = options.updateCacheCallback(
              previousArray,
              updatedEntity,
            );
          }

          queryClient.setQueryData(queryKey, nextArray);

          return {previousArray};
        }),
      onError: (error, variables, context) => {
        queryClient.setQueryData(
          queryKey,
          (context as { previousArray: TEntity[] }).previousArray,
        );

        options?.onError && options.onError(error, variables, context);
      },
    },
  );
};

export const useHttpDelete = <
  TEntity,
  TData = unknown,
  TError = unknown,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: TQueryKey,
  mutationFn: MutationFunction<TData, TEntity[keyof TEntity]>,
  options?: UseMutationOptions<
    TData,
    TError,
    TEntity[keyof TEntity],
    { previousArray: TEntity[] }
  >,
  idFieldName = 'id',
): UseMutationResult<
  TData,
  TError,
  TEntity[keyof TEntity],
  { previousArray: TEntity[] }
> => {
  const queryClient = useQueryClient();

  return useMutation<
    TData,
    TError,
    TEntity[keyof TEntity],
    { previousArray: TEntity[] }
  >(mutationFn, {
    ...options,
    onMutate:
      (options && options.onMutate) ||
      (async (id): Promise<{ previousArray: TEntity[] }> => {
        await queryClient.cancelQueries(queryKey);

        const previousArray = queryClient.getQueryData(queryKey) as TEntity[];

        const deletedArrayIndex = previousArray.findIndex(
          dimension => dimension[idFieldName as keyof TEntity] === id,
        );

        // We hsave to delete the dimension without mutating the cache
        queryClient.setQueryData(queryKey, [
          ...previousArray.slice(0, deletedArrayIndex),
          ...previousArray.slice(deletedArrayIndex + 1),
        ]);

        return {previousArray};
      }),
    onError: (_error, _dimension, context) => {
      queryClient.setQueryData(
        queryKey,
        (context as { previousArray: TEntity[] }).previousArray,
      );
    },
  });
};