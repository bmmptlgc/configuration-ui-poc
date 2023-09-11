import { Component } from 'react';
import { ErrorSchema, FieldProps, IdSchema, orderProperties } from '@rjsf/utils';
import { JSONSchema7 } from 'json-schema';

export default class RowField extends Component<FieldProps> {
  constructor(props: FieldProps) {
    super(props);
  }

  render() {
    const _this2 = this;

    const isRequired = (propName: string) => {
      return (
        Array.isArray(this.props.schema.required) && this.props.schema.required.indexOf(propName) !== -1
      );
    };

    const onPropertyChange = (propName: string, addedByAdditionalProperties = false) => {
      return (value: any, errSchema?: ErrorSchema | undefined, _id?: string | undefined) => {
        if (!value && addedByAdditionalProperties) {
          // Don't set value = undefined for fields added by
          // additionalProperties. Doing so removes them from the
          // formData, which causes them to completely disappear
          // (including the input field for the property name). Unlike
          // fields which are "mandated" by the schema, these fields can
          // be set to undefined by clicking a "delete field" button, so
          // set empty values to the empty string.
          value = '';
        }

        const newFormData = {..._this2.props.formData, [propName]: value};

        _this2.props.onChange(
          newFormData,
          errSchema &&
          _this2.props.errorSchema && {
            ..._this2.props.errorSchema,
            [propName]: errSchema,
          }
        );
      };
    };

    const {
      uiSchema,
      formData = {},
      errorSchema,
      idSchema,
      name,
      disabled,
      readonly,
      onBlur,
      onFocus,
      registry,
      autofocus,
      idPrefix,
      required,
      onChange
    } = this.props;

    const {
      // definitions,
      schemaUtils,
      fields,
      formContext
    } = registry;

    const {
      SchemaField,
      DescriptionField
    } = fields;

    // const schema = retrieveSchema(this.props.schema, definitions);
    const schema = schemaUtils.retrieveSchema(this.props.schema, formData);

    let orderedProperties;

    try {
      const properties = Object.keys(schema.properties || {});
      orderedProperties = orderProperties(properties as [], uiSchema!['ui:order'] as []);
    } catch (err) {
      return (
        <div>
          <p className="config-error" style={{color: 'red'}}>
            Invalid {name || 'root'} object field configuration:
            <em>{err instanceof Error ? err.message : 'An error occurred trying to order properties'}</em>.
          </p>
          <pre>{JSON.stringify(schema)}</pre>
        </div>
      );
    }

    let RowComp = (
      <div className="row">
        {
          schema.description &&
            <DescriptionField
                id={`${idSchema.$id}__description`}
                description={schema.description}
                formContext={formContext}
                schema={schema}
                uiSchema={uiSchema}
                errorSchema={errorSchema}
                idSchema={idSchema}
                formData={formData}
                onChange={onChange}
                registry={registry}
                disabled={disabled}
                readonly={readonly}
                autofocus={autofocus}
                required={required}
                name={name}
                onBlur={onBlur}
                onFocus={onFocus}
            />
        }
        {
          orderedProperties &&
          orderedProperties.map((propName: string, index: number) => {
            return (
              <SchemaField
                key={index}
                name={propName}
                required={isRequired(propName)}
                schema={schema.properties ? schema.properties[propName] as JSONSchema7 : {}}
                uiSchema={uiSchema![propName]}
                errorSchema={errorSchema![propName]}
                idSchema={idSchema[propName] as IdSchema}
                formData={formData[propName]}
                onChange={onPropertyChange(propName)}
                onBlur={onBlur}
                onFocus={onFocus}
                registry={registry}
                disabled={disabled}
                readonly={readonly}
                formContext={formContext}
                autofocus={autofocus}
                idPrefix={idPrefix}
              />
            );
          })
        }
      </div>
    );

    return (
      <div>
        {RowComp}
      </div>
    );
  }
}