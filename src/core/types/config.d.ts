export interface ConfigInterface {
  localization: {
    debug: boolean;
  };
  api: {
    [api: string]: {
      swaggerUrl?: string;
      baseUrl: string;
      refreshInterval?: number;
    };
  };
  ui: {
    responsive: {
      breakpoints: {
        small: number;
        large: number;
      }
    };
  };
  cacheTimeout: number;
}