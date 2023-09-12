import { Component, FormEvent } from 'react';
import Form, { IChangeEvent } from '@rjsf/core';
import { RegistryFieldsType, UiSchema } from '@rjsf/utils/src/types';
import {
  FormContextType,
  FormValidation,
  getUiOptions,
  RegistryWidgetsType,
  RJSFSchema,
  RJSFValidationError,
  StrictRJSFSchema
} from '@rjsf/utils';
import update from 'immutability-helper';

import { PathMap, SchemaFormProps, SchemaFormState } from './';

import { getSchemaPathsMap, orderRootProperties, rowify, stripRows, Util } from './helpers/SchemaHelpers';

import RowField from './fields/RowField';
import CustomField from './fields/CustomField';
import TitleField from './fields/TitleField';
import ArrayField from './fields/ArrayField';
import CustomSchemaField from './fields/CustomSchemaField';

import BaseInput from './widgets/BaseInput';
// import CustomInput from './widgets/CustomInput';
import CustomSearchField from './widgets/SearchField';
import CustomRadio from './widgets/Radio';
import CustomDatePicker from './widgets/DatePicker';

const formFields: RegistryFieldsType = {
  SchemaField: CustomSchemaField,
  row: RowField
};

const widgets: RegistryWidgetsType = {
  BaseInput,
  // CustomInput,
  CustomSearchField,
  CustomRadio,
  CustomDatePicker
};

export default class SchemaForm<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>
  extends Component<SchemaFormProps<T>, SchemaFormState<T>> {
  state: SchemaFormState<T>;

  constructor(props: SchemaFormProps<T>) {
    super(props);

    let rowified = rowify(props.schema, props.uiSchema || {}, props.formData);

    this.state = {
      schema: rowified.schema,
      uiSchema: orderRootProperties(rowified.uiSchema),
      formData: rowified.formData
    };

    this.customValidation = this.customValidation.bind(this);
    this.transformErrors = this.transformErrors.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onError = this.onError.bind(this);
    this.toggleEditing = this.toggleEditing.bind(this);
    this.autofill = this.autofill.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
  }

  static getDerivedStateFromProps<T>(nextProps: SchemaFormProps<T>, prevState: SchemaFormState<T>) {
    return {
      ...prevState,
      formContext: !nextProps.hasOwnProperty('readonly')
        ? prevState.formContext
        : update(prevState.formContext, {
          readMode: {
            $set: nextProps.readonly
          }
        })
    };
  }
  
  componentDidMount() {
    const {hideValidationMessages = false} = {...getUiOptions(this.props.uiSchema || {})};

    this.setState(prevState => ({
      ...prevState,
      formContext: {
        readMode: this.props.readonly,
        editing: [],
        toggleEditing: this.toggleEditing,
        autofill: this.autofill,
        searchFieldMap: this.props.searchFieldMap,
        hideValidationMessages: hideValidationMessages
      }
    }));
  }

  autofill(id: string, fields: { [key: string]: string | undefined }) {
    let tokens: Array<keyof T | string> = id.split('_') as Array<keyof T>;

    // remove root
    tokens.splice(0, 1);

    // remove widget leaf level and row level
    tokens.pop();
    tokens.pop();

    let formData = this.state.formData;

    type WidgetData = { [key: string]: T[keyof T] } | T[keyof T];
    type RecursiveWidgetData = { [key: string]: T[keyof T] } | T[keyof T] | WidgetData;

    let widgetData: RecursiveWidgetData;

    // build widget data so that it only contains the formData of the widget being autofilled
    // this will only include the widget row level and the leaf level
    // it will make it easy to find properties (leaf nodes) to update on any row of the widget
    tokens.forEach(token => {
      widgetData = widgetData
        ? (widgetData as { [key: string]: T[keyof T] })[token as string] as WidgetData
        : formData[token as keyof T];
    });

    let updateFormData = (key: string): void => {

      // find what row of the widget the property (leaf nodes) to update belongs to
      Object.keys(widgetData as { [key: string]: T[keyof T] }).some((level1) => {
        if (((widgetData as { [key: string]: T[keyof T] })[level1] as { [key: string]: T[keyof T] })
          .hasOwnProperty(key)) {
          tokens.push(level1);
          tokens.push(key);
          return true;
        }

        return false;
      });

      // at this point, tokens contains the full path to the property to be updated
      // so we use that to build the spec for the immutability-helper update function
      let spec = tokens.reduceRight<{ [key: string]: string }>(
        // @ts-ignore
        (accumulator, token) => ({[token]: accumulator}),
        {$set: fields[key]});

      formData = update(formData, spec as any);

      // remove the widget path to the property just updated
      tokens.pop();
      tokens.pop();
    };

    Object.keys(fields).forEach(updateFormData);

    this.setState(prevState => ({
      ...prevState,
      formData: formData
    }));
  }

  toggleEditing(id?: string) {
    let formContext: Object;
    let index: number = this.state.formContext.editing.indexOf(id);

    if (index === -1) {
      formContext = update(this.state.formContext, {
        editing: {
          $push: [id]
        }
      });
    } else {
      formContext = update(this.state.formContext, {
        editing: {
          $splice: [[index, 1]]
        }
      });
    }

    this.setState(prevState => ({
      ...prevState,
      formContext: formContext
    }));
  }

  customValidation(formData: T, errors: FormValidation<T>, uiSchema?: UiSchema<T, RJSFSchema, F>) {
    if (this.props.customValidation) {
      const data: T = uiSchema?.hasOwnProperty('custom:rows') ? stripRows(formData) : {...formData};

      const map = getSchemaPathsMap(this.state.schema) as PathMap;

      this.props.customValidation(data, map, errors, uiSchema);
    }

    return errors;
  }

  transformErrors(errors: RJSFValidationError[]): RJSFValidationError[] {
    let finalErrors: RJSFValidationError[] = [];

    const uiSchema = this.state.uiSchema;

    errors.forEach((error) => {
      const customMessages = {...this.props.customValidationMessages};

      customMessages && Object.keys(customMessages).every(key => {
        if (error.name === key) {
          switch (key) {
            case 'format':
              if (typeof customMessages[key] === 'object' && customMessages[key].constructor === Array) {
                const index = (customMessages[key] as { [deepProp: string]: string }[])
                  .findIndex(entry => entry.format === error.params.format);

                if (index !== -1) {
                  error.message = (customMessages[key][index] as { [deepProp: string]: string }).message;
                }
              }

              break;
            case 'maximum':
            case 'minimum':
              error.message = (customMessages[key] as string).replace(/{(limit)}/g, error.params.limit);

              break;
            default:
              error.message = customMessages[key] as string;

              break;
          }

          error.stack = `${error.property} ${error.message}`;

          // We don't need to check again for te same error message
          delete customMessages[key];

          // We found the error message we want to override, so we break the loop.
          return false;
        }

        return true;
      });

      const pathArray = error.property
        ? error.property
          .replace(/\.\d+./g, '.')
          .replace(/\.\d+$/g, '')
          .split('.') as string[]
        : [];

      pathArray.shift();

      const propertyUiSchema = Util.getObjectByStringArray(uiSchema, pathArray);

      error.message = error.message
        ? error.message.replace(/{(field)}/g, propertyUiSchema['ui:title'])
        : '';
      error.stack = error.stack.replace(/{(field)}/g, propertyUiSchema['ui:title']);

      finalErrors.push(error);
    });

    if (this.props.transformErrors) {
      finalErrors = this.props.transformErrors(finalErrors);
    }

    return finalErrors;
  }
  
  onChange(e: IChangeEvent<T>) {
    // const newFormData = reconcileNewArrayRowData(e.formData);
    
    if (this.props.onChange) {
      const event = {...e};
      event.formData = stripRows(event.formData);
      // event.formData = stripRows(newFormData);
      this.props.onChange(event);
    } else {
      this.setState(prevState => ({
        ...prevState,
        formData: e.formData as T
        // formData: newFormData as T
      }));
    }
  }

  onSubmit(data: IChangeEvent<T>, event: FormEvent<any>) {
    if (this.props.onSubmit) {
      this.props.onSubmit(stripRows(data.formData), event);
    }
  }

  onError(errors: { stack: string }[]) {
    if (this.props.onError) {
      this.props.onError(errors.map(error => {
        const colonIndex = error.stack.indexOf(':');

        return {
          property: error.stack.slice(0, colonIndex),
          message: error.stack.slice(colonIndex + 2)
        };
      }));
    }
  }

  onBlur(id: string, value: boolean | number | string | null) {
    if (this.props.onBlur) {
      this.props.onBlur(id, value, this.state.formData);
    }
  }

  onFocus(id: string, value: boolean | number | string | null) {
    if (this.props.onFocus) {
      this.props.onFocus(id, value, this.state.formData);
    }
  }

  render() {
    let formWidgets = (this.props.widgets !== undefined && this.props.widgets !== null)
      ? Object.assign(widgets, this.props.widgets)
      : widgets;

    const {
      liveValidate,
      showErrorList,
      noHtml5Validate,
      ErrorList
    } = this.props;

    return (
      <Form
        {...this.props}
        schema={this.state.schema}
        uiSchema={this.state.uiSchema}
        formData={this.state.formData}
        formContext={this.state.formContext}
        fields={formFields}
        widgets={formWidgets}
        templates={{
          FieldTemplate: CustomField,
          ArrayFieldTemplate: ArrayField,
          ErrorListTemplate: ErrorList,
          TitleFieldTemplate: TitleField
        }}
        onChange={this.onChange}
        onSubmit={this.onSubmit}
        onError={this.onError}
        customValidate={this.customValidation}
        liveValidate={liveValidate || false}
        showErrorList={showErrorList || false}
        noHtml5Validate={noHtml5Validate || true}
        transformErrors={this.transformErrors}
        onBlur={this.onBlur}
        onFocus={this.onFocus}
      >
        {
          !this.props.saveButtonJsx &&
            <div className="text-center" style={{display: (this.props.saveButtonRef ? 'none' : 'block')}}>
                <button
                    ref={this.props.saveButtonRef}
                    type="submit"
                    className={['btn', 'btn-primary', this.props.isBtnLarge && 'btn-lg'].join(' ')}
                >
                  {this.props.btnText || 'Save'}
                    <div className="ripple-container"/>
                </button>
            </div>
        }
        {this.props.saveButtonJsx}
      </Form>
    );
  }
}