import { Dispatch, SetStateAction } from 'react';

import { ModalProps } from '../components/modal';

export type State<S> = {
  state: S;
  setState: Dispatch<SetStateAction<S>>;
};

export type StateApi<S, A> = (stateApi: State<S>) => A;

export type StateApiWithModal<S, A> = (
  stateApi: State<S>,
  modal: {
    showModal: ({...props}: ModalProps) => void;
  }
) => A;