import validator from '@rjsf/validator-ajv8';

import { useFormSchema } from 'core/hooks/formSchema';
import { useHttpQuery } from 'core/hooks/async';
import { useServiceApi } from 'core/hooks/services';
import SchemaForm from 'shared/components/schema-form/SchemaForm';
import { programServiceApi } from 'services/program/programServiceApi';
import { useCancelableEffect } from 'core/hooks/utils';
import { buildSchemaFromSwagger, buildUiSchemaFormSwagger } from 'core/helpers/schemaForm';
import { JSONSchema7 } from 'json-schema';

const template: {
  [key: string]: JSONSchema7;
} = {
  program: {
    type: 'object',
    properties: {
      name: {
        default: 'optum X',
        readOnly: true
      },
      resellerId: {
        default: 'should this be defaulted',
        readOnly: true
      },
      status: {
        enum: [ 'Draft', 'Started', 'Ended'],
        default: 'Draft'
      }
    }
  }
}

const TemplatedConfiguration = () => {

  const formSchemaApi = useFormSchema<{}, any>({
    formData: {},
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
        'ui:title': 'Program'
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
          true,
          template
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
            // onSubmit={onSubmit}
              customValidationMessages={formSchemaApi.validationMessages}
              validator={validator}
          />
      }
    </div>
  )
};
export default TemplatedConfiguration;