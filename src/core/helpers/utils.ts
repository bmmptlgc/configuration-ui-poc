import { ApiErrorResponse } from '../http-service';

const stringFormat = (
  str: string,
  ...replacements: string[]
): string => {
  return str.replace(/{(\d+)}/g, (match, number): string =>
    typeof replacements[number] != 'undefined'
      ? replacements[number]
      : match
  );
};

export const getPathToParentUrl = (url: string, pathSegmentsToRemove = 1): string => {
  const pathToParent = url.split('/');

  for (let i = 0; i < pathSegmentsToRemove; i++) pathToParent.pop();

  return pathToParent.join('/');
};

export const forPromise = <R>(
  promise: Promise<R>
): Promise<{ error: ApiErrorResponse | TypeError | DOMException | null; response: R | null }> => promise
  .then((response: R) => {
    return {error: null, response};
  })
  .catch((error: ApiErrorResponse | TypeError | DOMException) => {
    return {error, response: null};
  });

const _hasOwnProperty = Object.prototype.hasOwnProperty;

export const hasOwnProperty = <TObject extends object, TProperty extends PropertyKey>(
  object: TObject,
  property: TProperty
): object is TObject & Record<TProperty, unknown> => _hasOwnProperty.call(object, property);

// Given 2 arrays of objects with different interfaces, it uses the intersectionFunction to determine what fields common
// to the 2 arrays to include in their concatenation result
const concat = <R, A1, A2>(
  arrayOne: A1[],
  arrayTwo: A2[],
  intersectionFunction: (currentItem: A1 | A2) => R
): R[] => {
  let result = arrayOne.map((currentValue) => {
    return intersectionFunction(currentValue);
  });

  result = result.concat(arrayTwo.map((currentValue) => {
    return intersectionFunction(currentValue);
  }));

  return result;
};

// Given an array, it groups it by the key parameter and uses the aggregationFunction to determine what fields and
// corresponding aggregated values to add to each item of the returned array. The key field will also be part of each
// item and it's value will be unique (no duplicate objects with the same value for the key field.
const aggregateBy = <R extends { [key in keyof A]: A[key] }, A extends R>(
  array: A[],
  key: keyof A & keyof R,
  aggregationFunction: (currentResult: R, currentValue: A) => void
): R[] => {
  return array.reduce((result: R[], currentValue) => {
    let resultItem: R | undefined =
      result.find(item => item[key as keyof R] === currentValue[key as keyof A]);

    if (!resultItem) {
      resultItem = {
        [key]: currentValue[key as keyof A]
      } as R;
      result.push(resultItem as R);
    }

    aggregationFunction(resultItem, currentValue);

    return result;
  }, []);
};

export const arrays = {
  concat,
  aggregateBy
};