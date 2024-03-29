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

const AddRootPropertyToWidget = (
  properties: { [key: string]: JSONSchema7 & { nullable?: boolean; $ref: string }},
  propertyName: string,
  key: string,
  property: JSONSchema7 & { nullable?: boolean; $ref: string }
) => {
  if (!hasOwnProperty(properties, propertyName)) {
    (properties as { [key: string]: JSONSchema7 })[propertyName] = {
      type: 'object',
      properties: {
        [key]: properties[key]
      }
    }
  } else {
    (properties[propertyName] as JSONSchema7).properties![key] = properties[key];
  }

  let propertySchema = properties[propertyName] as JSONSchema7;

  if (!property.nullable) {
    if (propertySchema.required) {
      propertySchema.required.push(key);
    } else {
      propertySchema.required = [key];
    }
  }

  delete properties[key];
}

export const buildSchemaFromSwagger = <S extends StrictRJSFSchema = RJSFSchema>(
  swaggerSchemas: any,
  schemaKeys: { swaggerKey: string; propertyName: string },
  rootRequiredWidgets: string[],
  isRoot: boolean,
  template?: { [key: string]: JSONSchema7 }
): S => {
  const { propertyName } = schemaKeys;

  const swaggerSchema = swaggerSchemas[schemaKeys.swaggerKey];
  
  if (swaggerSchema.enum) {
    return {
      type: swaggerSchema.type,
      enum: swaggerSchema.enum
    } as S;
  }

  const schema: S = {} as S;
  
  const required: string[] = [];

  const properties = { ...swaggerSchema.properties };
  
  Object.keys(properties).forEach((key: string) => {
    let property = { ...properties[key] as JSONSchema7 & {
        nullable?: boolean;
        $ref: string
      }
    };
    
    const ref = property.$ref;
    
    if (!ref && template && template[isRoot ? propertyName : key] && (!isRoot || template[propertyName].properties
      && template[propertyName].properties![key])) {
      property = Object.assign(property, isRoot ? template[propertyName].properties![key] : template[key]);
    }
    
    if (!property.nullable && !isRoot) {
      required.push(key);
    }
    
    if (ref) {
      properties[key] = buildSchemaFromSwagger(
        swaggerSchemas, 
        { swaggerKey: ref.split('/').pop() as string, propertyName: key },
        rootRequiredWidgets,
        false,
        template && template[key] && template[key].properties as { [key: string]: JSONSchema7 } || undefined
        // template && template[propertyName] && template[propertyName].properties as { [key: string]: JSONSchema7 } || undefined
      );

      if (properties[key].properties) {
        properties[key].type = 'object';
      }

      if (properties[key].enum && template && template[propertyName] && template[propertyName].properties
        && template[propertyName].properties![key]) {
        properties[key] = Object.assign(properties[key], template[propertyName].properties![key]);
      }
      
      if (isRoot && properties[key].enum) {
        AddRootPropertyToWidget(properties, propertyName, key, property);
      }
      
      if ((properties as JSONSchema7).required) {
        rootRequiredWidgets.push(key);
      }
    } else {
      if (property.type === 'array') {
        const items = property.items as JSONSchema7 | { $ref:  string };
        
        if (items.$ref) {
          (properties[key] as JSONSchema7).items = buildSchemaFromSwagger(
            swaggerSchemas, 
            { swaggerKey: items.$ref.split('/').pop() as string, propertyName: key },
            rootRequiredWidgets, 
            false,
            template
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
        properties[key] = { ...property };

        delete properties[key].nullable;
        
        if (!property.type) {
          (properties[key] as JSONSchema7).type = 'string';
        } else if (property.type === 'boolean') {
          (properties[key] as JSONSchema7).default = false;
        }
        
        // Root level properties that are not a reference to another swagger schema need to be grouped into a top lever
        // property that will get the name of the schemaKey, thus creating a distinct and titled form section for the
        // group 
        if (isRoot) {
          AddRootPropertyToWidget(properties, propertyName, key, property);
        }

        if (!property.nullable && !rootRequiredWidgets.includes(propertyName)) {
          rootRequiredWidgets.push(propertyName);
        }
      }
    }

    // delete property.nullable;
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
  let uiSchema: UiSchema<T, S, F> = originalSchema
    ? { ...originalSchema }
    : {};

  customRows[level] = [[]];
  
  const properties = schema.properties || schema.items?.properties;

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

      uiSchema[key] = Object.assign(uiSchema[key], buildUiSchemaFormSwagger(properties[key], uiSchema[key], customRows, level + 1));
    } else {
      uiSchema[key]['custom:col-width'] = 3;
      
      if (properties[key].format === 'date-time') {
        uiSchema[key]['ui:widget'] = 'CustomDatePicker';
      }
    }
  });

  uiSchema['custom:rows'] = customRows[level];
  
  return uiSchema;
}