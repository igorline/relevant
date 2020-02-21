import React from 'react';
import PropTypes from 'prop-types';
import { View, LinkFont, SecondaryText, InputPlain } from 'modules/styled/web';
import { colors } from 'app/styles';

const Checkbox = props => {
  const { label, input, type, meta, name, placeholder, autocomplete } = props;
  const { dirty, touched, error, warning } = meta;
  return (
    <View fdirection="column" mt={3}>
      <View fdirection="row">
        <InputPlain
          {...input}
          placeholder={placeholder || label}
          autoComplete={autocomplete}
          name={name}
          type={type}
          mr={1}
        />{' '}
        {label ? (
          <label html-for={name}>
            <LinkFont c={colors.black}>{label}</LinkFont>
          </label>
        ) : null}
        {(dirty || touched) &&
          ((error && (
            <SecondaryText c={colors.red} mt={1}>
              {error}
            </SecondaryText>
          )) ||
            (warning && <SecondaryText c={colors.red}>{warning}</SecondaryText>))}
      </View>
    </View>
  );
};

Checkbox.propTypes = {
  error: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  meta: PropTypes.object,
  input: PropTypes.object,
  autocomplete: PropTypes.string
};

Checkbox.defaultProps = {
  autocomplete: null
};

export default Checkbox;
