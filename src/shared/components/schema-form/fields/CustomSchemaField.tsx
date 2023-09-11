import { FieldProps } from '@rjsf/utils';
import SchemaField from '@rjsf/core/lib/components/fields/SchemaField';
import { Col } from 'reactstrap';


import { Util } from '../helpers/SchemaHelpers';
import { FormContextType, RJSFSchema, StrictRJSFSchema } from '@rjsf/utils/src/types';

const CustomSchemaField = <T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(
  props: FieldProps<T, S, F>
) => {
  let cls = '';

  const isRow = Util.isARow(props.uiSchema!);
  const isWidget = Util.isAWidgetField(props.uiSchema!);

  const isFieldElement = props.hasOwnProperty('name');

  if (isFieldElement && !isRow && props.uiSchema && props.uiSchema.hasOwnProperty('custom:classNames')) {
    cls += ` ${props.uiSchema['custom:classNames']}`;
  }

  if (isFieldElement && !isRow && props.uiSchema && props.uiSchema.hasOwnProperty('custom:col-width')) {
    cls += ` col-md-${props.uiSchema['custom:col-width']}`;
  }

  if (props.schema.hasOwnProperty('enum') && props.uiSchema && (props.uiSchema['ui:placeholder'] === undefined) &&
    (!props.uiSchema!['ui:hidePlaceholder'])) {
    props.uiSchema!['ui:placeholder'] = '- Select -';
  }

  const schemaField = <SchemaField {...props} />;

  return isWidget && !isRow
    ? (
      <Col className={cls} id={props.name}>
        {schemaField}
      </Col>
    )
    : (
      <div className={cls} id={props.name}>
        {schemaField}
      </div>
    );
};

export default CustomSchemaField;