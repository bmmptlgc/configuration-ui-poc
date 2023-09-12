import validator from '@rjsf/validator-ajv8';

import { useFormSchema } from 'core/hooks/formSchema';
import { useHttpQuery } from 'core/hooks/async';
import { useServiceApi } from 'core/hooks/services';
import SchemaForm from 'shared/components/schema-form/SchemaForm';
import { programServiceApi } from 'services/program/programServiceApi';
import { useCancelableEffect } from 'core/hooks/utils';
import { buildSchemaFromSwagger, buildUiSchemaFormSwagger } from 'core/helpers/schemaForm';

const ProgramConfiguration = () => {
  const formSchemaApi = useFormSchema<{}, any>({
    formData: {
      "user": {
        "isB2BAdministrator": false,
        "userId": "21ecc90f-420e-4455-a906-481b0fdcde91"
      },
      "program": {
        "resellerId": "21ecc90f-420e-4455-a906-481b0fdcde91",
        "startDate": "2023-09-12T10:57:00.000Z",
        "programId": "21ecc90f-420e-4455-a906-481b0fdcde91",
        "expectedVersion": 1
      }
    },
    schema: {
      type: 'object',
      required: [],
      properties: {}
    },
    uiSchema: {
      'ui:order': [
        'program', '*'
      ],
      program: {
        'ui:title': 'Program',
        endDate: {
          'ui:widget': 'CustomDatePicker'
        }
      }
    }
  });

  const programService = useServiceApi(programServiceApi);

  const {data: programSwaggerJson, isLoading: isLoadingProgramSwagger} =
    useHttpQuery<any>(
      'programServiceSwaggerJson',
      async () =>
        await programService.getProgramServiceSwaggerJson(),
    );
  
  useCancelableEffect(
    (cleanup: { didCancel: boolean }): void => {
      if (!cleanup.didCancel && programSwaggerJson) {
        const schema = buildSchemaFromSwagger(
          programSwaggerJson.components.schemas, 
          { swaggerKey: 'CreateProgram', propertyName: 'program' },
          [],
          true
        );
        
        const uiSchema = buildUiSchemaFormSwagger(schema, formSchemaApi.uiSchema);
        
        formSchemaApi.setSchema(schema);
        formSchemaApi.setUiSchema(uiSchema);
      }
    },
    [programSwaggerJson]
  )
  
  return (
    <div style={{
      marginTop: '20px',
      marginLeft: '150px',
      marginRight: '150px'
    }}>
      {
        !isLoadingProgramSwagger && Object.keys(formSchemaApi.schema.properties!).length > 0 &&
          <SchemaForm
              schema={formSchemaApi.schema}
              uiSchema={formSchemaApi.uiSchema}
              formData={formSchemaApi.formData}
              btnText="Next Step"
              isBtnLarge={false}
            // validate={onValidate}
              onSubmit={(formData) => console.log(formData)}
              customValidationMessages={formSchemaApi.validationMessages}
              validator={validator}
          />
      }
    </div>
  )
};
export default ProgramConfiguration;