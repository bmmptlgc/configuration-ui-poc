import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

import App from 'core/components/app/App';
import { AppStoreProvider } from 'core/stores/appStore';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as serviceWorker from './serviceWorker';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      refetchOnWindowFocus: false
    }
  }
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <BrowserRouter>
    <AppStoreProvider>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<>TODO: Fallback</>}>
          <App/>
        </Suspense>
      </QueryClientProvider>
    </AppStoreProvider>
  </BrowserRouter>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
