import { ApiErrorResponse, ApiResponse, IHttpService } from './index';

export const HttpMethods = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
};

class HttpService implements IHttpService {
  // Public members
  request = <T>(input: RequestInfo, init?: RequestInit): Promise<T> => {
    return new Promise((res, rej) => {
      return this.fetchFromApi<T>(input, init)
        .then((response: ApiResponse<T>) => {
          if (response.ok) {
            return res(response.parsedBody as T);
          } else {
            return rej({
              status: response.status,
              body: response.parsedBody
            } as ApiErrorResponse);
          }
        }, (error: TypeError | DOMException) => {
          rej(error);
        });
    });
  };

  // Private functions
  private fetchFromApi = <T>(input: RequestInfo, init?: RequestInit): Promise<ApiResponse<T>> => {
    return new Promise((res, rej) => {

      let apiResponse: ApiResponse<T>;

      fetch(input, init)
        .then((response: Response) => {
          apiResponse = response;

          if (apiResponse.status === 204) return Promise.resolve(null);

          return apiResponse.ok ? response.json() : response;
        })
        .then(json => {
          apiResponse.parsedBody = json;

          return res(apiResponse);
        })
        .catch(error => {
          return rej(error);
        });
    });
  };
}

export default new HttpService;