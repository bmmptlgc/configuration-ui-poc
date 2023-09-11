import { lazy, ReactElement } from 'react';
import { Route, Routes } from 'react-router-dom';

import Constants from 'core/constants';
import FallBack from 'core/routes/FallBack';

const ConfigurationModule = lazy(() => import('../../modules/configuration/ConfigurationModule'));

const AppRoutes = (): ReactElement => {
  return (
    <Routes>
      <Route
        path="/*"
        element={<ConfigurationModule/>}
      />
      <Route
        path={`${Constants.Routes.Configuration.MODULE}/*`}
        element={<ConfigurationModule/>}
      />
    </Routes>
  );
};

export default AppRoutes;