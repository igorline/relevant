import React from 'react';
import PropTypes from 'prop-types';
import { View, LinkFont, SecondaryText, Input } from 'modules/styled/web';
import { colors } from 'app/styles';

const FormField = props => {
  const {
    error,
    type,
    placeholder,
    label,
    value,
    onChange,
    onBlur,
    onFocus,
    onKeyDown
  } = props;
  return (
    <View display="flex" fdirection="column" mt={3}>
      <label>
        <LinkFont c={colors.black}>{label}</LinkFont>
      </label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
      />
      {error ? (
        <SecondaryText c={colors.red} mt={1}>
          {error}
        </SecondaryText>
      ) : null}
    </View>
  );
};

FormField.propTypes = {
  error: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  onKeyDown: PropTypes.func
};

export default FormField;
