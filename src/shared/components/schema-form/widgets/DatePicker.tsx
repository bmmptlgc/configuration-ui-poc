import { FormEvent } from 'react';
import { FieldProps, WidgetProps } from '@rjsf/utils';
import classNames from 'classnames';

import DatePicker from '../../date-picker/DatePicker';
import { DatePickerProps } from '../../date-picker';

type PartialDatePickerProps = Omit<DatePickerProps, 'value' | 'onChange' | 'onBlur' | 'onFocus'>;

interface DatePickerWidgetProps extends PartialDatePickerProps, WidgetProps {
  registry: FieldProps['registry'];
}

const DatePickerWidget = (props: DatePickerWidgetProps) => {
  const {
    id,
    autofocus,
    options,
    schema,
    uiSchema,
    formContext,
    registry,
    rawErrors,
    className,
    placeholder,
    label,
    onBlur,
    onFocus,
    ...restProps
  } = props;

  const displayFormat = options && options.displayFormat ? options.displayFormat : 'MM/dd/yyyy';
  const backEndFormat = options && options.backEndFormat ? options.backEndFormat : 'yyyy-MM-dd';
  const placeholderText = options && options.placeholderText ? options.placeholderText : displayFormat;

  const datePickerOnBlur = (event: FormEvent<HTMLInputElement>): void => {
    let onBlurEvent: HTMLInputElement = event.target as HTMLInputElement;

    onBlur && onBlur(id, onBlurEvent.value);
  };

  const datePickerOnFocus = (event: FormEvent<HTMLInputElement>): void => {
    let onFocusEvent: HTMLInputElement = event.target as HTMLInputElement;

    onFocus && onFocus(id, onFocusEvent.value);
  };

  const cssClasses = classNames(className, rawErrors && rawErrors.length > 0 && 'is-invalid');

  return (
    <DatePicker
      {...restProps}
      className={cssClasses}
      displayFormat={displayFormat as string}
      backEndFormat={backEndFormat as string}
      placeholderText={placeholderText as string}
      onBlur={datePickerOnBlur}
      onFocus={datePickerOnFocus}
    />
  );
};

export default DatePickerWidget;