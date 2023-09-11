import { ReactElement } from 'react';
import { Label as L, LabelProps } from 'reactstrap';

const Label = (props: LabelProps): ReactElement => {
  return (
    <L {...props} />
  );
};

export default Label;