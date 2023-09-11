import React, { Component, FormEvent } from 'react';
import ReactDatePicker from 'react-datepicker';
import { format } from 'date-fns';

import 'react-datepicker/dist/react-datepicker.css';
import './styles/DatePicker.css';
import { DatePickerProps, DatePickerState } from 'shared/components/date-picker/index';

export default class DatePicker extends Component<DatePickerProps, DatePickerState> {

  constructor(props: DatePickerProps) {
    super(props);

    const value = this.props.value && DatePicker.formatDate(this.props.value);

    this.state = {
      selectedDate: value
        ? new Date(value.includes('T') ? value.replace(/T.+/, '') : value)
        : null,
      placeholderText: this.props.placeholderText
        ? this.props.placeholderText
        : this.props.displayFormat
          ? this.props.displayFormat
          : 'MM/DD/YYYY',
      className: this.props.className ? this.props.className : 'form-control',
      displayFormat: this.props.displayFormat ? this.props.displayFormat : 'MM/dd/yyyy',
      backEndFormat: this.props.backEndFormat ? this.props.backEndFormat : 'yyyy-MM-dd'
    };
  }

  static formatDate(date: string) {
    return date.replace(/-/g, '\/').replace(/\./g, '\/');
  }

  UNSAFE_componentWillReceiveProps(nextProps: DatePickerProps) {
    const value = nextProps.value && DatePicker.formatDate(nextProps.value);
    const date = value && new Date(value.includes('T') ? value.replace(/T.+/, '') : value) || undefined;

    this.setState({
      selectedDate: (date !== undefined && !isNaN(date.getTime()))
        ? date
        : this.state.selectedDate
    });
  }

  handleDivChange = (event: FormEvent<HTMLDivElement> | null | undefined): void => {
    let selectedDate = null;
    let backEndDateValue;

    if (event && event.target) {

      let inputEvent: HTMLInputElement = event.target as HTMLInputElement;

      let date = inputEvent.value;

      if (date !== '') {
        let displayDate = new Date(date);

        if (!isNaN(displayDate.getTime())) {
          selectedDate = displayDate;
          backEndDateValue = format(selectedDate, this.state.backEndFormat);
        } else {
          selectedDate = this.state.selectedDate;
          backEndDateValue = this.state.selectedDate &&
            format(this.state.selectedDate, this.state.backEndFormat);
        }
      } else {
        selectedDate = null;
      }
    }

    this.changeState(selectedDate, backEndDateValue || '');
  }

  handleChange = (date: Date | null): void => {
    const backEndDateValue = date
      ? format(date as Date, this.state.backEndFormat)
      : undefined;

    this.changeState(date, backEndDateValue);
  }

  render() {
    return (
      <div onChange={this.handleDivChange}>
        <ReactDatePicker
          className={this.state.className}
          selected={this.state.selectedDate}
          onChange={this.handleChange}
          isClearable={!this.props.readOnly}
          dateFormat={this.state.displayFormat}
          placeholderText={this.state.placeholderText}
          onBlur={this.props.onBlur}
          onFocus={this.props.onFocus}
          readOnly={this.props.readOnly}
        />
      </div>
    );
  }

  private changeState = (selectedDate: Date | null, backEndDateValue?: string): void => {
    this.setState(
      {
        selectedDate: selectedDate
      },
      () => {
        if (this.props.onChange) {
          this.props.onChange(backEndDateValue);
        }
      }
    );
  }
}