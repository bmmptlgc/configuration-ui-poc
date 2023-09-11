import React, { FormEvent, MutableRefObject, ReactNode } from 'react';
import { FormProps } from '@rjsf/core';
import {
    ErrorListProps,
    FormContextType,
    FormValidation,
    RJSFSchema,
    StrictRJSFSchema,
    UiSchema,
    WidgetProps
} from '@rjsf/utils';
// import { CustomInputType } from 'reactstrap/lib/CustomInput';
import { InputProps } from 'reactstrap';
import { JSONSchema7 } from 'json-schema';
import { InputType } from 'reactstrap/types/lib/Input';
import { EnumOptionsType } from '@rjsf/utils/src/types';

export type SearchFieldMap = { [key: string]: SearchFieldProps<Record<string, any>> };

declare module 'json-schema' {
  export interface JSONSchema7 {
    enumNames?: JSONSchema7Type[];
  }
}

export interface CustomValidationMessages {
  [errorType: string]: string | { [deepProp: string]: string }[];
}

export interface SchemaFormError {
  property: string;
  message: string;
}

export interface SchemaFormProps<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any> extends Omit<FormProps<T, S, F>, 'onSubmit' | 'onError' | 'onBlur' | 'onFocus' | 'customValidate'> {
  /**
   * If the form contains one or more search fields (autocomplete search with api call to get results)
   * we need to provide props for each individual search field, and we do so by providing a map of props
   */
  searchFieldMap?: SearchFieldMap;
  /** If you don't want your button to say "Save" */
  btnText?: string;
  /** Button size */
  isBtnLarge?: boolean;
  /** Custom JSX to use for the Save button */
  saveButtonJsx?: ReactNode;
  /** Reference to save button that allows triggering the save from a parent component */
  saveButtonRef?: MutableRefObject<HTMLButtonElement>;
  /**
   * If we need to provide custom validation messages to override the default form-schema messages, we can pass in
   * this map (error type, new message description) the will be applied within the transformErrors callback
   * errorTypes need to match the AjvError name property values that we want to override (eg: required, format, etc.)
   *
   * For "format" an array must be provided (ex:
   *  {
   *      format: [
   *          {
   *              format: 'email',
   *              message: 'This is not a valid email'
   *          },
   *          {
   *              format: 'my-custom-phone-format',
   *              message: 'This is not a valid phone'
   *          }
   *      ]
   *  }
   * all fields formatted as email will display the desired message email message and so on
   */
  customValidationMessages?: CustomValidationMessages;
  ErrorList?: React.FC<ErrorListProps>;

  /** Callback that is executed when the form submission passes validation */
  onSubmit?(formData: T, event: FormEvent<any>): void;

  /** Callback that is executed when the form submission fails validation */
  onError?(errors: SchemaFormError[]): void;

  /** callback for when the field looses focus */
  onBlur?(id: string, value: boolean | number | string | null, formData: T): void;

  /** callback for when the field gains focus */
  onFocus?(id: string, value: boolean | number | string | null, formData: T): void;

  /** callback for custom validation
   *  formData - is stripped of rows for ease of development
   *  schemaPathMap - is and object with the same structure as the schema, but which sets the value of each field to
   *  an array of strings where each is a part of the object path for the field.
   *  When there is a custom error to report on the field we should use this map to get the path array for the field
   *  and pass it to the Utils method getObjectByStringArray, to get the corresponding object from the errors
   *  collection and then add the respective validation error text to it.
   *  errors - collection of errors that form-schema will use to report error messages per field
   */
  customValidation?(formData: T, schemaPathMap: PathMap, errors: FormValidation<T>, uiSchema?: UiSchema<T, S, F>): void;
}

export interface SchemaFormState<T> {
  schema: JSONSchema7;
  uiSchema: UiSchema;
  formData: T;
  // tslint:disable-next-line:no-any
  formContext?: any;
}

export interface SearchFieldProps<T> extends WidgetProps {
  /** onBlur event will clear value and suggestions when checkValidEntry is TRUE and the entry is not valid */
  checkValidEntry?: boolean;
  /** Name of the id field for the entity returned by the api search */
  idFieldName?: string;
  /** Map of other form fields that need to be pre-populated with data returned by the api call */
  autofillMap?: Array<{ [key: string]: string }>;
  placeholder?: string;

  /**
   * This function should contain the code that fetches the data from the API
   * @param value passed to the API to be used as the search criteria
   * @param callback executed when the API returns a response
   */
  getSuggestions?(value: string, callback: (suggestions: Array<T>) => void): void;

  /**
   * This function should contain code that determines what we want to display in the input box
   * once a suggestion is selected from within the values returned by the api call
   * @param suggestion (selected from the API results)
   */
  formatDisplayValue?(suggestion: T): string;

  /**
   * This function should contain code that determines how to render the values returned by the API
   * @param suggestion (each item returned by the API call)
   */
  renderSuggestion?(suggestion: T): ReactNode;
}

// DO NOT DELETE, even thugh it's not used
// This is a reference to the additional keys that can be set under ui:options for BaseInputProps and
// PartialCustomInputProps as part of the WidgetProps interface where
// options: NonNullable<UiSchema['ui:options']> and
// 'ui:options'?: { [key: string]: boolean | number | string | object | any[] | null };
interface BaseInputOptions {
  inputType: InputType;
  emptyValue: unknown;
  enumOptions?: EnumOptionsType[];
  enumDisabled?: Record<string, unknown>[];
  inline?: boolean;
  hideBlankOption?: boolean;
  isMulti?: boolean;
}

type PartialInputProps = Omit<InputProps, 'onFocus'>;

export interface BaseInputProps extends PartialInputProps, WidgetProps {
}

// type PartialCustomInputProps = Omit<CustomInputProps, 'onFocus'>;

// export interface BaseCustomInputProps extends PartialCustomInputProps, WidgetProps {}

export type PathMap = {
  [key: string]: (
    string[] |
    {
      [index: string]: PathMap;
    });
};

export const addCustomError: (
  errors: FormValidation,
  pathArray: string[],
  errorMessage: string,
  uiSchema: UiSchema
) => void;

type Partial<T> = {
  [P in keyof T]?: T[P];
};

export type EnumData<T> = Partial<T>;