import { useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Namespace } from 'i18next';

import Constants from 'core/constants';
import { HttpServiceApi, ServiceApi } from 'core/types/services';
import { AppConfig } from 'core/types/appConfig';
import { AppConfiguration } from 'core/components/app/App';

import { useHttpService } from './async';

export const useServiceApi = <A>(
  serviceApi: ServiceApi<A>,
  ns: Namespace = Constants.Localization.Namespaces.CORE
): A => {
  const {config} = useContext<AppConfig>(AppConfiguration);

  const abortController = new AbortController();

  const {t} = useTranslation(ns);

  const httpService: HttpServiceApi = useHttpService(abortController);

  useEffect(() => {
    return (): void => {
      abortController.abort();
    }
  }, []);

  return useMemo(
    (): A => serviceApi(config, httpService, t),
    [httpService, serviceApi]
  );
};