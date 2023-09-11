import { ChangeEventHandler, ReactElement } from 'react';
// import { CustomInputProps } from 'reactstrap';
// import { CustomInputType } from 'reactstrap/lib/CustomInput';
import classNames from 'classnames';

import I from '../../controls/Input';
// import CustomInput from '../../controls/CustomInput';
import { BaseInputProps } from '../';
import { InputType } from 'reactstrap/types/lib/Input';
// import { EnumOptionsType } from '@rjsf/utils/src/types';
// import { BaseCustomInputProps, BaseInputProps, EnumOption } from '../';

// const selectValue = (value: string | number, all: (string | number)[], selected?: (string | number)[]) => {
//     const at = all.indexOf(value);
//     const updated = selected && selected.slice(0, at).concat(value, selected.slice(at)) || [value];
//     // As inserting values at predefined index positions doesn't work with empty
//     // arrays, we need to reorder the updated selection to match the initial order
//     return updated.sort((a: string | number, b: string | number) => all.indexOf(a) > all.indexOf(b) ? 1 : -1);
// };

// const deselectValue = (value: string | number, selected: (string | number)[]) => {
//     return selected.filter(v => v !== value);
// };

// const getValue = (event: ChangeEvent<HTMLSelectElement>, isMulti: boolean, hideBlankOption: boolean) => {
//     if (isMulti) {
//         const selectedValues = [].slice
//             .call(event.target.options)
//             .filter((o: HTMLOptionElement, index: number) => o.selected && (hideBlankOption || index !== 0))
//             .map((o: HTMLOptionElement) => o.value);
//
//         return selectedValues.length > 0 ? selectedValues : undefined;
//     } else {
//         return event.target.value;
//     }
// };

// const Input = (props: (BaseInputProps | BaseCustomInputProps) & { isCustom: boolean }): ReactElement => {
const Input = (props: BaseInputProps & { isCustom: boolean }): ReactElement => {
  // Note: since React 15.2.0 we can't forward unknown element attributes, so we
  // exclude the "options" and "schema" ones here.
  if (!props.id) {
    throw new Error(`No id for props ${JSON.stringify(props)}`);
  }

  const {
    id,
    isCustom,
    value,
    readonly,
    disabled,
    autofocus,
    onChange,
    onBlur,
    onFocus,
    options,
    inputOptions,
    schema,
    uiSchema,
    formContext,
    registry,
    rawErrors,
    className,
    placeholder,
    DescriptionField,
    ...inputProps
  } = props;

  const {
    // title,
    inputType,
    emptyValue,
    // enumOptions,
    // enumDisabled,
    // inline,
    // hideBlankOption,
    // isMulti
  } = options;

  const cssClasses = classNames(className, rawErrors && rawErrors.length > 0 && 'is-invalid');

  // If options.inputType is set use that as the input type
  if (inputType) {
    inputProps.type = inputType;
  } else if (!inputProps.type) {
    // If the schema is of type number or integer, set the input type to number
    if (schema.type === 'number') {
      inputProps.type = 'number';
      // Setting step to 'any' fixes a defect in Safari where decimals are not allowed in number inputs
      inputProps.step = 'any';
    } else if (schema.type === 'integer') {
      inputProps.type = 'number';
      // Since this is integer, you always want to step up or down in multiples
      // of 1
      inputProps.step = '1';
    } else {
      inputProps.type = 'text';
    }
  }

  // If multipleOf is defined, use this as the step value. This mainly improves
  // the experience for keyboard users (who can use the up/down KB arrows).
  if (schema.multipleOf) {
    inputProps.step = schema.multipleOf;
  }

  if (typeof schema.minimum !== 'undefined') {
    inputProps.min = schema.minimum;
  }

  if (typeof schema.maximum !== 'undefined') {
    inputProps.max = schema.maximum;
  }

  let _onChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = ({target: {value: v}}) => {
    onChange(v === '' ? emptyValue : v);
  };

  let input: ReactElement;

  // if (isCustom) {
  //     if (enumOptions && schema.type !== 'boolean') {
  //         const inputs: ReactElement[] = [];
  //
  //         const children: ReactElement[] = [];
  //
  //         if (inputProps.type === 'select' && !hideBlankOption) {
  //             children.push(
  //                 <option key={`option-${id}_0`} value="">
  //                     {placeholder ? placeholder : '- Select -'}
  //                 </option>);
  //         }
  //
  //         (enumOptions as EnumOptionsType[]).forEach((option, i) => {
  //             if (inputProps.type === 'radio') {
  //                 _onChange = () => onChange(option.value);
  //             } else if (inputProps.type === 'select') {
  //                 _onChange = (event: ChangeEvent<HTMLSelectElement>) => {
  //                     const newValue = getValue(event, isMulti as boolean, hideBlankOption as boolean);
  //
  //                     onChange(newValue);
  //                 };
  //             } else {
  //                 _onChange = (event: ChangeEvent<HTMLInputElement>) => {
  //                     const all: (string | number)[] = (enumOptions as EnumOptionsType[]).map(({ value: v }) => v);
  //                     if (event.target.checked) {
  //                         onChange(selectValue(option.value, all, value));
  //                     } else {
  //                         onChange(deselectValue(option.value, value));
  //                     }
  //                 };
  //             }
  //
  //             const checked = inputProps.type === 'radio'
  //                 ? option.value === value
  //                 : value && value.indexOf(option.value) !== -1 || false;
  //
  //             const itemDisabled = enumDisabled && (enumDisabled as Object[]).indexOf(option.value) !== -1;
  //
  //             if (inputProps.type === 'select') {
  //                 children.push(<option key={`option-${id}_${++i}`} value={option.value}>{option.label}</option>);
  //             }
  //             // else {
  //             //     inputs.push(
  //             //         <CustomInput
  //             //             {...inputProps}
  //             //             id={inputProps.type === 'radio' ? option.value as string : `${id}_${i}`}
  //             //             key={`input-${id}_${i}`}
  //             //             type={inputProps.type as CustomInputType}
  //             //             className={cssClasses}
  //             //             checked={checked}
  //             //             disabled={disabled || itemDisabled || readonly}
  //             //             autoFocus={autofocus && i === 0}
  //             //             inline={inline as boolean}
  //             //             value={inputProps.type === 'radio' ? option.value : value}
  //             //             label={option.label}
  //             //             onChange={_onChange}
  //             //             onBlur={onBlur && (event => onBlur(id, event.target.value))}
  //             //             onFocus={onFocus && (event => onFocus(id, event.target.value))}
  //             //             children={children}
  //             //         />
  //             //     );
  //             // }
  //         });
  //
  //         input = (
  //             <div>
  //                 {
  //                     // inputProps.type === 'select'
  //                     //     ? <CustomInput
  //                     //         {...inputProps}
  //                     //         id={id}
  //                     //         type={inputProps.type as CustomInputType}
  //                     //         value={value}
  //                     //         className={cssClasses}
  //                     //         disabled={disabled || readonly}
  //                     //         autoFocus={autofocus}
  //                     //         inline={inline as boolean}
  //                     //         onChange={_onChange}
  //                     //         onBlur={onBlur && (event => onBlur(id, event.target.value))}
  //                     //         onFocus={onFocus && (event => onFocus(id, event.target.value))}
  //                     //         children={children}
  //                     //         multiple={(isMulti as boolean) || false}
  //                     //     />
  //                     //     : 
  //                       inputs
  //                 }
  //             </div>
  //         );
  //     }
  //     // else {
  //     //     const additionalProps: CustomInputProps = {
  //     //         id,
  //     //         type: inputProps.type as CustomInputType,
  //     //         value: value || ''
  //     //     };
  //     //
  //     //     if (schema.type === 'boolean') {
  //     //         additionalProps.checked = value || false;
  //     //         additionalProps.value = value || false;
  //     //         additionalProps.label = title;
  //     //         additionalProps.disabled = readonly;
  //     //         additionalProps.type = 'checkbox';
  //     //
  //     //         _onChange = (event: ChangeEvent<HTMLInputElement>) => {
  //     //             if (event.target.checked) {
  //     //                 onChange(true);
  //     //             } else {
  //     //                 onChange(false);
  //     //             }
  //     //         };
  //     //     } else {
  //     //         additionalProps.readOnly = readonly;
  //     //     }
  //     //
  //     //     input = (
  //     //         <CustomInput
  //     //             {...inputProps}
  //     //             {...additionalProps}
  //     //             className={cssClasses}
  //     //             disabled={disabled}
  //     //             autoFocus={autofocus}
  //     //             onChange={_onChange}
  //     //             onBlur={onBlur && (event => onBlur(id, event.target.value))}
  //     //             onFocus={onFocus && (event => onFocus(id, event.target.value))}
  //     //         />
  //     //     );
  //     // }
  // } else {
  input = (
    <I
      {...inputProps}
      id={id}
      type={inputProps.type as InputType}
      className={cssClasses}
      disabled={disabled}
      autoFocus={autofocus}
      readOnly={readonly}
      value={value == null ? '' : value}
      onChange={_onChange}
      onBlur={onBlur && (event => onBlur(id, event.target.value))}
      onFocus={onFocus && (event => onFocus(id, event.target.value))}
    />
  );
  // }

  return input;
};

Input.defaultProps = {
  required: false,
  disabled: false,
  readonly: false,
  autofocus: false
};

export default Input;