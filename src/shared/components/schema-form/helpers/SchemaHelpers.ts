import { FormValidation, UiSchema } from '@rjsf/utils';
import { JSONSchema7, JSONSchema7Definition } from 'json-schema';

import { PathMap } from '../';
import { FormContextType, RJSFSchema, StrictRJSFSchema } from '@rjsf/utils/src/types';

type Rowified<T> = {
  schema: JSONSchema7,
  uiSchema: UiSchema,
  formData: T
};

export const hasKey = <O extends object>(obj: O, key: keyof any): key is keyof O => {
  return key in obj;
};

export const rowify = <T>(
  flatSchema: JSONSchema7,
  flatUiSchema: UiSchema,
  flatData?: T | {}
): Rowified<T> => {

  flatSchema = flatSchema || {};
  flatUiSchema = flatUiSchema || {};
  flatData = flatData || {};

  let schema: JSONSchema7 = JSON.parse(JSON.stringify(flatSchema));
  let uiSchema: UiSchema = JSON.parse(JSON.stringify(flatUiSchema));
  let formData: T = JSON.parse(JSON.stringify(flatData));

  if (flatUiSchema.hasOwnProperty('custom:rows')) {
    let row: JSONSchema7, uiRow: UiSchema, dataRow: Record<string, T | T[] | T[keyof T] | undefined>;

    let createRow = (val: string | keyof T): void => {

      if (flatSchema.properties &&
        (flatSchema.properties[val] as JSONSchema7).type === 'object' &&
        flatSchema.properties[val].hasOwnProperty('properties')) {

        const dataItem: Object = flatData
          ? (flatData as T)[val as keyof T] || {}
          : {}

        const item = rowify(flatSchema.properties[val] as JSONSchema7, uiSchema[val as string], dataItem);

        item.schema.required = [];

        if (row.properties) {
          row.properties[val as string] = item.schema;
        }

        uiRow[val as string] = item.uiSchema;

        dataRow[val as string] = item.formData as T;
      } else if (flatSchema.properties && (flatSchema.properties[val] as JSONSchema7).type === 'array') {
        let item: Rowified<T>, dataItem: (T | {})[], arrayItems: T[] = [];

        if (row.properties) {
          row.properties[val as string] = Object.assign({}, flatSchema.properties[val as string]);

          (row.properties[val] as JSONSchema7).items = [];
        }

        uiRow[val as string] = {
          'ui:options': flatUiSchema[val as string]['ui:options']
        };

        const items = (flatSchema.properties[val] as JSONSchema7).items as JSONSchema7;

        item = rowify(items, uiSchema[val as string]);

        item.schema.required = [];

        if (row.properties) {
          (row.properties[val] as JSONSchema7).items = item.schema;
        }

        uiRow[val as string] = item.uiSchema;

        dataItem = flatData && (flatData as T)[val as keyof T]
          ? (flatData as T)[val as keyof T] as T[]
          : [];

        const rowMinItems = (row.properties![val] as JSONSchema7).minItems || 0

        if (rowMinItems > 0 && (dataItem as T[]).length < rowMinItems) {
          for (let i = 0; i < rowMinItems; i++) {
            (dataItem).push({});
          }
        }

        (dataItem as T[]).forEach((arrayItem: T) => {
          if (flatSchema.properties) {
            const property = flatSchema.properties[val] as JSONSchema7;

            const rowified = rowify(
              property.items as JSONSchema7,
              uiSchema[val as string],
              arrayItem
            );

            arrayItems.push(rowified.formData);
          }
        });

        dataRow[val as string] = arrayItems;
      } else {
        dataRow[val as string] = flatData
          ? (flatData as T)[val as keyof T] as T[keyof T]
          : undefined;

        if (dataRow[val as string] === undefined) {
          dataRow[val as string] = flatSchema.properties && (flatSchema.properties[val as string] as JSONSchema7).default as T[keyof T];
        }
        
        if (row.properties) {
          row.properties[val as string] = Object
            .assign({}, flatSchema.properties && flatSchema.properties[val as string]);
        }

        if (flatUiSchema.hasOwnProperty(val)) {
          uiRow[val as string] = flatUiSchema[val as string];

          uiRow['custom:col-width'] += flatUiSchema[val as string].hasOwnProperty('custom:col-width')
            ? flatUiSchema[val as string]['custom:col-width']
            : 0;

          uiRow['custom:classNames'] += flatUiSchema[val as string].hasOwnProperty('custom:classNames')
            ? flatUiSchema[val as string]['custom:classNames']
            : '';

          delete uiSchema[val as string];
        } else {
          uiRow[val as string] = {};
        }
      }

      if (schema.properties) {
        delete schema.properties[val as string];
      }
    };

    let expandRequireds = (index: number, key: string): void => {
      if (schema.required) {
        const ind = schema.required.indexOf(key);

        if (ind > -1) {
          if (schema.properties) {
            const rowProperty = schema.properties['row' + index] as JSONSchema7;
            rowProperty.required && rowProperty.required.push(key);
          }
          schema.required.splice(ind, -1);
        }
      }
    };

    for (let i = 1; i <= flatUiSchema['custom:rows'].length; i++) {
      row = {
        type: 'object',
        required: [],
        properties: {}
      };

      uiRow = {
        'ui:field': 'row',
        'custom:col-width': 0
      };

      dataRow = {};

      flatUiSchema['custom:rows'][i - 1].forEach(createRow);

      if (schema.properties) {
        schema.properties['row' + i] = row;
      }

      uiSchema['row' + i] = uiRow;
      formData[('row' + i) as keyof T] = dataRow as T[keyof T];

      if (schema.hasOwnProperty('required')) {
        if (schema.properties) {
          (schema.properties['row' + i] as JSONSchema7).required = [];
        }
        if (row.properties) {
          Object.keys(row.properties).forEach(expandRequireds.bind(null, i));
        }
      }
    }

    if (schema.hasOwnProperty('required')) {
      delete schema.required;
    }

    Object.keys(flatData).forEach((key) => {
      delete formData[key as keyof T];
    });
  }
  
  return {
    schema,
    uiSchema,
    formData
  };
};

export const stripRows = <T>(formData: any) => {
  let stripped: any = {};
  let topLevel: any;

  let i: number;

  if (formData === undefined || formData === null) {
    return formData;
  }

  Object.keys(formData).forEach((row) => {
    if (formData[row] !== null) {
      if (typeof (formData[row]) === 'object') {
        Object.keys(formData[row]).forEach((level1) => {
          // widget
          if (Array.isArray(formData[row][level1])) {
            topLevel = [];
            for (i = 0; i < formData[row][level1].length; i++) {
              topLevel[i] = {};
              Object.keys(formData[row][level1][i]).forEach((key) => {
                Object.keys(formData[row][level1][i][key]).forEach((subkey) => {
                  topLevel[i][subkey] = formData[row][level1][i][key][subkey];
                });
              });
            }
          } else {
            topLevel = {};
            if (formData[row][level1] !== null && typeof (formData[row][level1]) === 'object') {
              Object.keys(formData[row][level1]).forEach((key => {
                Object.keys(formData[row][level1][key]).forEach((subkey) => {
                  topLevel[subkey] = formData[row][level1][key][subkey];
                });
              }));
            } else {
              topLevel = formData[row][level1];
            }
          }

          if (!row.startsWith('row') || !Number(row.slice(3, row.length))) {
            stripped[row] = stripped[row] || {};
            stripped[row][level1] = topLevel;
          } else {
            stripped[level1] = topLevel;
          }

        });
      } else {
        stripped[row] = formData[row];
      }
    }
  });

  return stripped;
};

export const getSchemaPathsMap = (
  schema: JSONSchema7,
  path: string[] = []
): string[] | PathMap => {
  const map: PathMap = {};

  if (hasKey(schema, 'properties')) {
    const properties = schema.properties as {
      [k: string]: JSONSchema7Definition;
    };

    Object.keys(properties).forEach((row) => {
      const rowProperties = (properties[row] as JSONSchema7).properties as {
        [k: string]: JSONSchema7Definition;
      };

      if (rowProperties) {
        Object.keys(rowProperties).forEach((property) => {
          const propertyPath: string[] = [];

          propertyPath.push(row);
          propertyPath.push(property);

          (map[property] as string[] | PathMap) =
            getSchemaPathsMap(
              rowProperties[property] as JSONSchema7,
              path.concat(propertyPath)) as string[] | PathMap;
        });
      } else {
        map[row] = [row];
      }
    });
  } else if (hasKey(schema, 'items')) {
    return getSchemaPathsMap(schema.items as JSONSchema7, path) as PathMap;
  } else {
    return path;
  }

  return map;
};

export const addCustomError = (
  errors: FormValidation,
  pathArray: string[],
  errorMessage: string,
  uiSchema: UiSchema
): void => {
  const errorProperty = Util.getObjectByStringArray(errors, pathArray);

  const uiPathArray: string[] = [];

  pathArray.forEach(path => !path.startsWith('row') && uiPathArray.push(path));

  const propertyUiSchema = Util.getObjectByStringArray(uiSchema, uiPathArray);

  errorProperty && errorProperty.addError(errorMessage.replace(/{(field)}/g, propertyUiSchema['ui:title']));
};

export const orderRootProperties = (uiSchema: any): any => {
  if (!uiSchema['ui:order']) {
    return uiSchema;
  }

  uiSchema['ui:order'].forEach((property: string, index: number) => {
    if (property !== '*') {
      Object.keys(uiSchema).forEach(key => {
        if (uiSchema[key]['ui:field'] === 'row' && !!uiSchema[key][property]) {
          uiSchema['ui:order'][index] = key;
        }
      });
    }
  });

  return uiSchema;
};

export const Util = {
  isAnArrayField(schema: JSONSchema7): boolean {
    return schema !== undefined && schema.type === 'array';
  },

  isARow<T, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(uiSchema: UiSchema<T, S, F>): boolean {
    return uiSchema !== undefined && uiSchema.hasOwnProperty('ui:field') && uiSchema['ui:field'] === 'row';
  },

  isAWidgetField<T, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(uiSchema: UiSchema<T, S, F>): boolean {
    return uiSchema !== undefined && uiSchema.hasOwnProperty('ui:field') && uiSchema['ui:field'] === 'widget';
  },

  isArrayItem(id: string): boolean {
    const tokens = id.split('_');

    return tokens.length === 4 && this.isNumeric(tokens[tokens.length - 1]);
  },

  isNumeric(n: string): boolean {
    return !isNaN(parseFloat(n)) && isFinite(Number(n));
  },

  formatDate(date: string) {
    if (date !== '' && date !== undefined) {
      let dateObj = new Date(date);
      let month = (dateObj.getUTCMonth() + 1).toString();
      let day = dateObj.getUTCDate().toString();
      let year = dateObj.getUTCFullYear();

      if (month.length < 2) {
        month = '0' + month;
      }
      if (day.length < 2) {
        day = '0' + day;
      }

      date = [month, day, year].join('/');
    }

    return date;
  },

  getObjectByStringArray: <T>(o: T, a: string[]): T | T[string & keyof T] | undefined => {
    let keyValue: T | T[string & keyof T] = o;

    for (let i = 0, n = a.length; i < n; ++i) {
      const k = a[i];

      if (hasKey(keyValue as object, k)) {
        keyValue = keyValue[k] as T[string & keyof T];
      } else {
        return undefined;
      }
    }

    return keyValue;
  }
};