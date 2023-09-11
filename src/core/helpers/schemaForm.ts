import { TFunction } from 'i18next';

import { CustomValidationMessages, EnumData } from 'shared/components/schema-form';
import { UiSchema } from '@rjsf/utils';
import { FormContextType, RJSFSchema, StrictRJSFSchema } from '@rjsf/utils/src/types';
import { JSONSchema7 } from 'json-schema';
import { hasOwnProperty } from 'core/helpers/utils';


export const getValidationMessages = (t: TFunction): CustomValidationMessages => ({
  required: t('form.validation.requiredField'),
  format: [
    {
      format: 'email',
      message: t('form.validation.invalidEmail')
    },
    {
      format: 'password',
      message: t('form.validation.invalidPassword')
    }
  ]
});

export const convertEntityToEnum = <T, K extends keyof T>(entity: T[], enumKey: K, enumNamesKey: keyof T): EnumData<T> => {
  const enumData: EnumData<T> = {};

  entity.forEach((record: T) => {
    const idField = record[enumKey];
    enumData[idField as keyof T] = record[enumNamesKey];
  });

  return enumData;
};

export const buildSchemaFromSwagger = <S extends StrictRJSFSchema = RJSFSchema>(
  swaggerSchemas: any,
  schemaKey: string,
  rootRequiredWidgets: string[],
  isRoot?: boolean
): S => {
  const schema: S = {
    // properties: {}
  } as S;

  if (schema.enum) {
    return {
      type: schema.type,
      enum: schema.enum
    } as S;
  }
  
  const required: string[] = [];

  const properties = { ...swaggerSchemas[schemaKey].properties };
  
  Object.keys(properties).forEach((key: string) => {
    const property = { ...properties[key] as JSONSchema7 & {
        nullable?: boolean;
        $ref: string
      }
    };
    
    if (!property.nullable && !isRoot) {
      required.push(key);
    }
    
    const ref = property.$ref;
    
    if (ref) {
      properties[key] = buildSchemaFromSwagger(
        { ...swaggerSchemas },
        ref.split('/').pop() as string,
        rootRequiredWidgets
      );

      if ((properties as JSONSchema7).required) {
        rootRequiredWidgets.push(key);
      }
    } else {
      if (property.type === 'array') {
        const items = property.items as JSONSchema7 | { $ref:  string };
        
        if (items.$ref) {
          (properties[key] as JSONSchema7).items = buildSchemaFromSwagger(
            { ...swaggerSchemas },
            items.$ref.split('/').pop() as string,
            rootRequiredWidgets
          );
        } else if (!(items as JSONSchema7).properties && (items as JSONSchema7).format === 'uuid') {
          (properties[key] as JSONSchema7).items = {
            type: 'object',
            properties: {
              id: items
            }
          }
        }
        
        if (!property.nullable) {
          (properties[key] as JSONSchema7).minItems = 1;
        }
      } else {
        if (!property.type) {
          (properties[key] as JSONSchema7).type = 'string';
        } else if (property.type === 'boolean') {
          (properties[key] as JSONSchema7).default = false;
        }
        
        if (isRoot) {
          if (!hasOwnProperty(properties, schemaKey)) {
            (properties as { [key: string]: JSONSchema7 })[schemaKey] = {
              type: 'object',
              properties: {
                [key]: properties[key]
              }
            }
          } else {
            (properties[schemaKey] as JSONSchema7).properties![key] = properties[key];
          }

          let propertySchema = properties[schemaKey] as JSONSchema7;
          
          if (!property.nullable) {
            if (propertySchema.required) {
              propertySchema.required.push(key);
            } else {
              propertySchema.required = [key];
            }

            if (!schema.required) {
              schema.required = [schemaKey];
            } else if (!schema.required.includes(schemaKey)) {
              schema.required.push(schemaKey);
            }
          }
          
          delete properties[key];
        }
      }
    }

    delete property.nullable;
  });
  
  schema.properties = properties;
  
  if (required.length > 0) {
    schema.required = required;
  }
  
  if (isRoot && rootRequiredWidgets) {
    schema.required = (schema.required || []).concat(rootRequiredWidgets);
  }
  
  return schema;
}

export const buildUiSchemaFormSwagger = <T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(
  schema: any,
  originalSchema: UiSchema<T, S, F> = {},
  customRows: { [level: number]: [string[]] } = {},
  level: number = 0
): UiSchema<T, S, F> => {
  const uiSchema: UiSchema<T, S, F> = level === 0
    ? { ...originalSchema }
    : {};

  customRows[level] = [[]];
  
  const properties = schema.properties || schema.items.properties;

  if (!properties) {
    return {};
  }
  
  let columnIndex = 0;
  let rowIndex = 0;
  let previousPropertyType = '';
  
  Object.keys(properties).forEach((key: string) => {
    if ([properties[key].type, previousPropertyType].includes('array')) {
      columnIndex = 0;
      rowIndex++;
    }

    previousPropertyType = properties[key].type;
    
    customRows[level][rowIndex] = customRows[level][rowIndex] || [];
    
    customRows[level][rowIndex].push(key);

    // Each row will have up to 4 properties, except for the root level where each row will contain 1 widget only
    if (columnIndex++ === 3 || level === 0) {
      columnIndex = 0;
      rowIndex++;
    }
    
    uiSchema[key] = Object.assign(
      uiSchema[key] || {},
      {
        'ui:title': uiSchema[key] && uiSchema[key]['ui:title']
          ? uiSchema[key]['ui:title']
          : key
      }
    );
    
    if (['object', 'array'].includes(properties[key].type)) {
      uiSchema[key]['ui:field'] = 'widget';

      uiSchema[key] = Object.assign(uiSchema[key], buildUiSchemaFormSwagger(properties[key], {}, customRows, level + 1));
    } else {
      uiSchema[key]['custom:col-width'] = 3;
    }
  });

  uiSchema['custom:rows'] = customRows[level];
  
  return uiSchema;
}