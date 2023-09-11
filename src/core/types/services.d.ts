import { TFunction } from 'i18next';

import { ApiErrorResponse } from '../http-service';
import { ConfigInterface } from 'core/types/config';

export interface HttpServiceOptions {
  method?: string;
  contentType?: string;
  additionalHeaders?: { [k: string]: string };
  onFailure?: (error: ApiErrorResponse | TypeError | DOMException) => void;
  useToken?: boolean;
}

export interface HttpServiceApi {
  sendRequest: <T, R>(
    url: string,
    body?: T | string | null,
    options?: HttpServiceOptions
  ) => Promise<R | null>;
}

export type ServiceApi<A> = (
  appConfiguration: ConfigInterface,
  httpServiceApi: HttpServiceApi,
  t?: TFunction
) => A;