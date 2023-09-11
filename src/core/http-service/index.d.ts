export interface IHttpService {
  request: <T>(input: RequestInfo, init?: RequestInit) => Promise<T>;
}

export type ApiError = {
  code: number;
  message: string;
  details: string[];
};

export interface ApiResponse<T> extends Response {
  parsedBody?: T | unknown;
}

export interface ApiErrorResponse {
  status: number;
  body: string | ApiError;
}
