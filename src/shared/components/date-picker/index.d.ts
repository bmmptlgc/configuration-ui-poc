import { Component } from 'react';

export interface DatePickerProps {
  /** current date value as a string (see the backEndFormat prop) */
  value?: string;
  /** placeholder text value (defaults to be the same as displayFormat) */
  placeholderText?: string;
  /** css class name to use for the component (defaults to 'form-control') */
  className?: string;
  /** the format in which the date is displayed (defaults to 'MM/DD/YYYY') */
  displayFormat?: string;
  /** the format in which the date is passed into and out of the component (defaults to 'yyyy-MM-dd') */
  backEndFormat?: string;
  /** used to determine whether or not to disable the date picker */
  readOnly?: boolean;

  /** callback for when the date value is updated */
  onChange?(updatedDate: string | undefined): void;

  /** callback for when the field looses focus */
  onBlur?(event: React.FocusEvent<HTMLInputElement>): void;

  /** callback for when the field gains focus */
  onFocus?(event: React.FocusEvent<HTMLInputElement>): void;
}

export interface DatePickerState {
  selectedDate: Date | null;
  placeholderText: string;
  className: string;
  displayFormat: string;
  backEndFormat: string;
}

declare class DatePicker extends Component<DatePickerProps, DatePickerState> {
}

export default DatePicker;
