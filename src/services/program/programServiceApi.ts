import { HttpServiceApi, ServiceApi } from 'core/types/services';
import { ApiErrorResponse } from 'core/http-service';
import { ConfigInterface } from 'core/types/config';

export interface ProgramServiceApi {
  getProgramServiceSwaggerJson: () => Promise<any | null>;
}

export const programServiceApi: ServiceApi<ProgramServiceApi> = (
  appConfiguration: ConfigInterface,
  httpServiceApi: HttpServiceApi
): ProgramServiceApi => {
  const getProgramServiceSwaggerJson = async (): Promise<any | null> => {
    return await httpServiceApi.sendRequest(
      appConfiguration.api.program.swaggerUrl!,
      null,
      {
        useToken: false,
        onFailure: error => {
          (error as ApiErrorResponse).status !== 422 && console.log('TODO: Report unexpected error');
        }
      }
    ) as any | null;
  };

  return {
    getProgramServiceSwaggerJson
  }
};