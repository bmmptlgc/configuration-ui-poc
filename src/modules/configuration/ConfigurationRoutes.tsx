import { lazy, ReactElement } from 'react';
import { Route, Routes } from 'react-router-dom';

import Constants from '../../core/constants';
import FallBack from 'core/routes/FallBack';

const ProgramConfiguration =
  lazy(() => import('./components/program-configuration/ProgramConfiguration'));
const ComplexConfiguration =
  lazy(() => import('./components/complex-configuration/ComplexConfiguration'));
const TemplatedConfiguration =
  lazy(() => import('./components/templated-configuration/TemplatedConfiguration'));
const JsonSchemaConfiguration =
  lazy(() => import('./components/json-schema-configuration/JsonSchemaConfiguration'));

const ConfigurationRoutes = (): ReactElement => {
  return (
    <Routes>
      <Route
        path="/*"
        element={<ProgramConfiguration/>}
      />
      <Route
        path={Constants.Routes.Configuration.ProgramConfiguration}
        element={<ProgramConfiguration/>}
      />
      <Route
        path={Constants.Routes.Configuration.ComplexConfiguration}
        element={<ComplexConfiguration/>}
      />
      <Route
        path={Constants.Routes.Configuration.TemplatedConfiguration}
        element={<TemplatedConfiguration/>}
      />
      <Route
        path={Constants.Routes.Configuration.JsonSchemaConfiguration}
        element={<JsonSchemaConfiguration/>}
      />
    </Routes>
  );
};

export default ConfigurationRoutes;