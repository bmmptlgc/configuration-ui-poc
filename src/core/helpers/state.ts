import { Dispatch, SetStateAction } from 'react';

export const setStateData = <S, D>(
  statePropName: keyof S,
  data: D,
  setState: Dispatch<SetStateAction<S>>
): void => {
  setState(
    (prevState: S): S => ({
      ...prevState,
      [statePropName]: data
    })
  );
};