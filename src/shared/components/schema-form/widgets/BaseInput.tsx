import { ReactElement } from 'react';
import { BaseInputProps } from '../';
import Input from './Input';

const BaseInput = (props: BaseInputProps): ReactElement => {
  return (
    <Input isCustom={false} {...props} />
  );
};

export default BaseInput;