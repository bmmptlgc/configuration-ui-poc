import { ReactElement } from 'react';
import { Input as I, InputProps } from 'reactstrap';

const Input = (props: InputProps): ReactElement => {
  return (
    <I {...props} />
  );
};

export default Input;