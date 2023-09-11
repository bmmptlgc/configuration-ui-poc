const Routes = {
  Server: {
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    }
  },
  Configuration: {
    MODULE: 'configuration',
    ProgramConfiguration: 'program-configuration',
    ComplexConfiguration: 'complex-configuration',
    templatedConfiguration: 'templated-configuration'
  }
};

export default Routes;