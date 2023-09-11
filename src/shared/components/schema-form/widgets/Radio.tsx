import { ReactElement } from 'react';
import { WidgetProps } from '@rjsf/utils';

import Label from '../../controls/Label';

const RadioWidget = (props: WidgetProps): ReactElement => {

  const {
    options,
    value,
    required,
    disabled,
    readonly,
    autofocus,
    onBlur,
    onFocus,
    onChange,
    id,
  } = props;

  // Generating a unique field name to identify this set of radio buttons
  const name = Math.random().toString();
  const {enumOptions, enumDisabled, inline} = options;
  // checked={checked} has been moved above name={name}, As mentioned in #349;
  // this is a temporary fix for radio button rendering bug in React, facebook/react#7630.

  return (
    <fieldset className="field-radio-group" id={id}>
      {
        enumOptions?.map((option, i) => {
          const checked = option.value === value;
          const itemDisabled = enumDisabled && enumDisabled.indexOf(option.value) !== -1;
          const disabledCls = disabled || itemDisabled || readonly ? 'disabled' : '';
          const radio = (
            <input
              type="radio"
              checked={checked}
              id={option.value as string}
              name={name}
              required={required}
              value={option.value}
              disabled={disabled || itemDisabled || readonly}
              autoFocus={autofocus && i === 0}
              className="custom-control-input"
              onChange={() => onChange(option.value)}
              onBlur={onBlur && (event => onBlur(id, event.target.value))}
              onFocus={onFocus && (event => onFocus(id, event.target.value))}
            />
          );

          return inline ? (
            <div key={i} className={`custom-radio custom-control custom-control-inline ${disabledCls}`}>
              {radio}
              <Label
                className="custom-control-label"
                for={option.value as string}
              >
                {option.label}
              </Label>
            </div>
          ) : (
            <div key={i} className={`custom-radio custom-control ${disabledCls}`}>
              {radio}
              <Label
                className="custom-control-label"
                for={option.value as string}
              >
                {option.label}
              </Label>
            </div>
          );
        })
      }
    </fieldset>
  );
};

RadioWidget.defaultProps = {
  autofocus: false
};

export default RadioWidget;