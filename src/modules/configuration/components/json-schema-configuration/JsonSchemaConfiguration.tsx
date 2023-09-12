import validator from '@rjsf/validator-ajv8';

import { useFormSchema } from 'core/hooks/formSchema';
import SchemaForm from 'shared/components/schema-form/SchemaForm';

const JsonSchemaConfiguration = () => {

  const formSchemaApi = useFormSchema<{}, any>({
    formData: {},
    schema: {
      properties: {
        program: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
            displayName: {
              type: 'string',
            },
            resellerId: {
              type: 'string',
              format: 'uuid'
            },
            startDate: {
              type: 'string',
              format: 'date-time'
            },
            endDate: {
              type: 'string',
              format: 'date-time',
            },
            programId: {
              type: 'string',
              format: 'uuid'
            },
            expectedVersion: {
              type: 'integer',
              format: 'int64'
            }
          },
          required: [
            'resellerId',
            'startDate',
            'programId',
            'expectedVersion'
          ]
        }
      },
      required: [
        'program'
      ]
    },
    uiSchema: {
      'ui:order': [
        '*'
      ],
      program: {
        'ui:title': 'Program',
        'ui:field': 'widget',
        name: {
          'ui:title': 'Name',
          'custom:col-width': 3
        },
        displayName: {
          'ui:title': 'Display Name',
          'custom:col-width': 3
        },
        resellerId: {
          'ui:title': 'Reseller Id',
          'custom:col-width': 3
        },
        startDate: {
          'ui:title': 'Start Date',
          'custom:col-width': 3
        },
        endDate: {
          'ui:title': 'End Date',
          'custom:col-width': 3,
          'ui:widget': 'CustomDatePicker'
        },
        programId: {
          'ui:title': 'Program Id',
          'custom:col-width': 3
        },
        expectedVersion: {
          'ui:title': 'Expected Version',
          'custom:col-width': 3
        },
        'custom:rows': [
          [
            'name',
            'displayName',
            'resellerId',
            'startDate'
          ],
          [
            'endDate',
            'programId',
            'expectedVersion'
          ]
        ]
      },
      'custom:rows': [
        [
          'program'
        ]
      ]
    }
  });

  return (
    <div style={{
      marginTop: '20px',
      marginLeft: '150px',
      marginRight: '150px'
    }}>
      <SchemaForm
        schema={formSchemaApi.schema}
        uiSchema={formSchemaApi.uiSchema}
        formData={formSchemaApi.formData}
        btnText="Next Step"
        isBtnLarge={false}
        // validate={onValidate}
        // onSubmit={onSubmit}
        customValidationMessages={formSchemaApi.validationMessages}
        validator={validator}
      />
    </div>
  )
};
export default JsonSchemaConfiguration;