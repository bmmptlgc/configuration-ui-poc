import React, { FC } from 'react';
import { ButtonGroup as BG, ButtonGroupProps } from 'reactstrap';

const ButtonGroup: FC<ButtonGroupProps> = props => {
  return (
    <BG {...props}/>
  );
};

export default ButtonGroup;