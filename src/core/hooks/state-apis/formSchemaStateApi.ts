import { JSONSchema7, JSONSchema7Type } from 'json-schema';
import { FormContextType, RJSFSchema, UiSchema } from '@rjsf/utils';

import { setStateData } from 'core/helpers/state';
import { StringOrNumber } from 'core/types/common';
import { State } from 'core/types/state';
import { CustomValidationMessages, EnumData } from 'shared/components/schema-form';

export interface FormSchemaState<T, F extends FormContextType = any> {
  schema: JSONSchema7;
  uiSchema?: UiSchema<T, RJSFSchema, F>;
  formData?: T;
}

export interface FormSchemaStateApi<T, E, F extends FormContextType = any>
  extends FormSchemaState<T, F> {
  setSchema: (schema: JSONSchema7) => void;
  setUiSchema: (uiSchema: UiSchema<T, RJSFSchema, F>) => void;
  updateFormData: (formData: T) => void;
  // TODO: enhance for nested props
  populateEnumeration: (property: JSONSchema7, enumData: EnumData<E>) => void;
}

export type FormSchemaStateApiWithValidationMessages<T, E> =
  FormSchemaStateApi<T, E> & { validationMessages?: CustomValidationMessages }

export const formSchemaStateApiFactory = <T, E, F extends FormContextType = any>(
  {state, setState}: State<FormSchemaState<T>>
): FormSchemaStateApi<T, E> => {
  const setSchema = (schema: JSONSchema7): void => {
    setStateData('schema', schema, setState);
  };

  const setUiSchema = (uiSchema: UiSchema<T, RJSFSchema, F>): void => {
    setStateData('uiSchema', uiSchema, setState);
  };

  const updateFormData = (formData: T): void => {
    setState(prevState => {
      const nextState = {...prevState};

      for (const key in formData) {
        (nextState.formData as T)[key] = formData[key];
      }

      return nextState;
    })
  };

  // TODO: enhance for nested props
  const populateEnumeration = (property: JSONSchema7, enumData: EnumData<E>): void => {
    setState(
      (prevState: FormSchemaState<T>): FormSchemaState<T> => {
        const schema = {...prevState.schema};

        Object.keys(enumData).forEach((key: StringOrNumber) => {
          const enumeration = (property as JSONSchema7).enum;
          const enumNames = (property as JSONSchema7).enumNames;

          if (enumeration && enumNames && !enumeration.includes(key)) {
            enumeration.push(key);
            enumNames.push(enumData[key as keyof E] as JSONSchema7Type[]);
          }
        });

        return {
          ...prevState,
          schema: schema
        }
      }
    );
  };

  const schema = state.schema;
  const uiSchema = state.uiSchema;
  const formData = state.formData;

  return {
    schema,
    uiSchema,
    formData,
    setSchema,
    setUiSchema,
    updateFormData,
    populateEnumeration
  };
};