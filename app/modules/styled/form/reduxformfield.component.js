import React from 'react';
import PropTypes from 'prop-types';
import { View, LinkFont, SecondaryText } from 'modules/styled/web';
import { colors, mixins } from 'app/styles';
import styled from 'styled-components';

const Input = styled.input`
  ${mixins.padding}
  ${mixins.border}
`;

const ReduxFormField = props => {
  const { label, input, type, meta, name, placeholder } = props;
  const { touched, error, warning } = meta;
  return (
    <View display="flex" fdirection="column" mt={3}>
      {label ? (
        <label html-for={name}>
          <LinkFont c={colors.black}>{label}:</LinkFont>
        </label>
      ) : null}
      <Input
        {...input}
        placeholder={label || placeholder}
        name={name}
        type={type}
        border={1}
        p="2 2"
        mt={1}
      />
      {touched &&
        ((error && (
          <SecondaryText c={colors.red} mt={1}>
            {error}
          </SecondaryText>
        )) ||
          (warning && <SecondaryText c={colors.red}>{warning}</SecondaryText>))}
    </View>
  );
};

ReduxFormField.propTypes = {
  error: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  meta: PropTypes.object,
  input: PropTypes.object
};

export default ReduxFormField;
