import { State } from '../../../../core/types/state';
import { setStateData } from '../../../../core/helpers/state';

export interface ComplexConfigurationState {
  message: string;
}

export interface ComplexConfigurationStateApi extends ComplexConfigurationState {
  setMessage: (message: string) => void;
}

const complexConfigurationStateApi =
  ({ state, setState}: State<ComplexConfigurationState>): ComplexConfigurationStateApi =>
{
  const setMessage = (message: string): void => {
    setStateData('message', message, setState);
  };

  const message = state.message;

  return {
    message,
    setMessage
  };
};

export default complexConfigurationStateApi;