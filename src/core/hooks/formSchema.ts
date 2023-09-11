import { useMemo, useState } from 'react';

import {
  FormSchemaState,
  formSchemaStateApiFactory,
  FormSchemaStateApiWithValidationMessages
} from './state-apis/formSchemaStateApi';
import { useAppStore } from '../stores/appStore';

export const useFormSchema = <T, E>(
  initialState: FormSchemaState<T>
): FormSchemaStateApiWithValidationMessages<T, E> => {
  const {schemaFormValidationMessages} = useAppStore();

  const [state, setState] = useState<FormSchemaState<T>>(initialState);

  return useMemo(
    (): FormSchemaStateApiWithValidationMessages<T, E> =>
      ({
        ...formSchemaStateApiFactory({state, setState}),
        // This will make the validation errors available to all components that use this hook, without having
        // to add it to FormSchemaStateApi<T>
        validationMessages: schemaFormValidationMessages
      }),
    [state, setState, formSchemaStateApiFactory]
  );
};