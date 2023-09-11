import { FC } from 'react';
import { FieldTemplateProps } from '@rjsf/utils';
import classNames from 'classnames';

import Label from '../../controls/Label';

import { Util } from '../helpers/SchemaHelpers';

const CustomField: FC<FieldTemplateProps> = (props: FieldTemplateProps) => {
  const {
    id,
    classNames: classes,
    label,
    children,
    errors,
    help,
    description,
    hidden,
    required,
    displayLabel,
    formContext,
    schema,
    uiSchema
  } = props;

  if (hidden) {
    return children;
  }

  let cls = classNames(
    Util.isARow(uiSchema!) ? '' : classes,
    Util.isAnArrayField(schema) ? 'form-group field-array' : ''
  );

  let readMode: boolean = formContext.readMode;

  if (formContext.editing) {
    formContext.editing.forEach((itemId: string) => {
      if (id.startsWith(itemId)) {
        readMode = false;
      }
    });
  }

  if (readMode) {
    switch (children.props.schema.type) {
      case 'string':
      case 'number':
      case 'boolean':
        let val: any = children.props.formData;

        if (children.props.schema.hasOwnProperty('enum')
          && children.props.schema.hasOwnProperty('enumNames')) {
          let i;

          for (i = 0; i < children.props.schema.enum.length; i++) {
            if (children.props.schema.enum[i] === val) {
              val = children.props.schema.enumNames[i];
            }
          }
        }

        if (children.props.schema.type === 'boolean' && (val === true || val === false)) {
          val = val === true ? 'Yes' : 'No';
        }

        if (children.props.schema.format === 'date') {
          val = Util.formatDate(val.toString());
        }

        return (
          <div>
            <p>
              {schema.title}:
              <span>{val}</span>
            </p>
            {errors}
          </div>
        );

      default:

    }
  }

  if (formContext.readMode && Util.isAWidgetField(uiSchema!) && !Util.isArrayItem(id)) {
    cls = classNames(cls, 'form-entry');
  }

  return uiSchema && uiSchema['custom:inline'] ? (
    <fieldset className={cls}>
      {displayLabel && description ? description : null}
      <div className="row">
        {
          displayLabel &&
            <Label
                required={required}
                for={id}
                className={
                  `col-md-${uiSchema['custom:inline'].label['col-width']}${uiSchema['custom:labelCssClass']}`}
            >
              {label}
            </Label>
        }
        <div
          className={
            classNames(
              'control-label',
              `col-md-${uiSchema['custom:inline'].control['col-width']}`
            )
          }
        >
          {children}
        </div>
      </div>
      {!formContext.hideValidationMessages && errors}
      {help}
    </fieldset>
  ) : (
    <fieldset className={cls}>
      {
        displayLabel &&
          <Label
              required={required}
              for={id}
              className={
                classNames(
                  'control-label',
                  uiSchema && uiSchema['custom:labelCssClass']
                )
              }
          >
            {label}
          </Label>
      }
      {displayLabel && description ? description : null}
      {children}
      {!formContext.hideValidationMessages && errors}
      {help}
    </fieldset>
  );
};

export default CustomField;