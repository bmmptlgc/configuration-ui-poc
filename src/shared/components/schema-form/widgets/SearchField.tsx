import { Component, FormEvent, ReactNode } from 'react';
import Autosuggest, { ChangeEvent, InputProps, SuggestionsFetchRequestedParams } from 'react-autosuggest';

import { SearchFieldProps } from '../';

interface SearchFieldState<T> {
  value: string | null;
  validEntrySelected: boolean;
  checkValidEntry?: boolean;
  suggestions: T[];
  displayFieldName: string;
  idFieldName?: string;
  autofillMap?: Array<{ [key: string]: string }>;

  getSuggestions?(value: string, callback: (suggestions: Array<T>) => void): void;

  formatDisplayValue?(suggestion: T): string;

  renderSuggestion?(suggestion: T): ReactNode;
}

export default class SearchField<T extends Record<string, any>> extends Component<SearchFieldProps<T>, SearchFieldState<T>> {
  private timer: number;

  constructor(props: SearchFieldProps<T>) {
    super(props);

    this.state = {
      value: props.value !== undefined ? props.value : null,
      checkValidEntry: props.checkValidEntry || false,
      suggestions: [],
      validEntrySelected: props.value !== undefined,
      displayFieldName: props.id.split('_').pop() || '' // Get from props.id
    };

    if (this.props.formContext.searchFieldMap) {
      let stateProps = this.props.formContext.searchFieldMap[this.getFieldPrefix() + this.state.displayFieldName];

      Object.assign(this.state, stateProps);
    }

    this.timer = -1;

    this.getFieldPrefix = this.getFieldPrefix.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
    this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
    this.getSuggestionValue = this.getSuggestionValue.bind(this);
    this.renderSuggestion = this.renderSuggestion.bind(this);
  }

  UNSAFE_componentWillReceiveProps(nextProps: SearchFieldProps<T>) {
    let stateProps: SearchFieldState<T> = this.state;

    if (nextProps.value !== undefined && nextProps.value !== '') {
      stateProps.value = nextProps.value;
      stateProps.validEntrySelected = true;
    }

    if (nextProps.formContext.searchFieldMap) {
      stateProps = Object.assign(
        stateProps || {},
        nextProps.formContext.searchFieldMap[this.getFieldPrefix() + this.state.displayFieldName]);
    }

    if (stateProps) {
      this.setState(stateProps);
    }
  }

  getFieldPrefix() {
    let tokens = this.props.id.split('_');

    if (tokens.length > 3) {
      return tokens[2] + '_';
    } else {
      return '';
    }
  }

  onChange(event: FormEvent<HTMLElement>, params: ChangeEvent): void {
    const {newValue, method} = params;

    let value: string = '';
    let validEntrySelected: boolean = false;
    let autofillObj: { [key: string]: string | undefined } = {};

    if (method === 'type') {

      value = newValue;

      this.state.autofillMap && this.state.autofillMap.forEach((entry) => {
        autofillObj[Object.keys(entry)[0]] = undefined;
      });

      autofillObj[this.state.displayFieldName] = this.state.checkValidEntry ? '' : newValue;

    } else {

      let i: number = 0;

      let buildAutofill = (suggestion: Record<string, string>): void => {
        this.state.autofillMap && this.state.autofillMap.forEach((entry: Record<string, string>) => {
          autofillObj[Object.keys(entry)[0]] = suggestion[entry[Object.keys(entry)[0]]];
        });
      };

      if (this.state.suggestions) {
        for (i = 0; i < this.state.suggestions.length; i++) {
          if (this.state.suggestions[i][this.state.idFieldName || 'id'] === newValue) {
            value = this.state.formatDisplayValue
              ? this.state.formatDisplayValue(this.state.suggestions[i])
              : '';

            buildAutofill(this.state.suggestions[i]);

            autofillObj[this.state.displayFieldName] = value;

            validEntrySelected = true;
          }
        }
      }
    }

    this.setState({
      value: value,
      suggestions: [],
      validEntrySelected: validEntrySelected
    });

    if (this.props.formContext.autofill) {
      this.props.formContext.autofill(this.props.id, autofillObj);
    }
  }

  onBlur(): void {
    if (!this.state.validEntrySelected && this.state.checkValidEntry) {
      this.setState({
        value: '',
        suggestions: []
      });
    }

    this.props.onBlur && this.props.onBlur(this.props.id, this.state.value);
  }

  onFocus(): void {
    this.props.onFocus && this.props.onFocus(this.props.id, this.state.value);
  }

  renderSuggestion(suggestion: T) {
    return this.state.renderSuggestion && this.state.renderSuggestion(suggestion);
  }

  getSuggestionValue(suggestion: T) {
    return suggestion[this.state.idFieldName || 'id'];
  }

  onSuggestionsClearRequested() {
    this.setState({
      suggestions: []
    });
  }

  onSuggestionsFetchRequested({value}: SuggestionsFetchRequestedParams) {

    if (this.timer > -1) {
      clearTimeout(this.timer);
    }

    let self = this;

    this.timer = window.setTimeout(
      () => {
        self.fetchRequested(value);
      },
      300);
  }

  fetchRequested(value: string) {

    this.state.getSuggestions && this.state.getSuggestions(value, (suggestions: Array<T>) => {
      this.setState({
        suggestions: suggestions
      });
    });

  }

  render() {

    const inputProps: InputProps<T> = {
      placeholder: this.props.placeholder,
      value: this.state.value === null ? '' : this.state.value,
      onChange: this.onChange,
      onBlur: this.onBlur,
      onFocus: this.onFocus,
      id: this.props.id
    };

    const theme = {
      container: 'autosuggest',
      input: 'form-control',
      suggestionsContainer: 'dropdown dropdown-scroll',
      suggestionsList: 'dropdown-menu show',
      suggestion: 'dropdown-item',
      suggestionFocused: 'active',
    };

    return (
      <Autosuggest
        suggestions={this.state.suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={this.getSuggestionValue}
        renderSuggestion={this.renderSuggestion}
        inputProps={inputProps}
        theme={theme}
      />
    );
  }
}