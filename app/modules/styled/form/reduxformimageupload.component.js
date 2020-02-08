import React from 'react';
import PropTypes from 'prop-types';
import ImageUpload from 'modules/ui/web/imageUpload.component';
import { View, LinkFont, SecondaryText } from 'modules/styled/web';
import { colors } from 'app/styles';

const ReduxFormField = props => {
  const { label, meta, name, placeholder, imageComponent } = props;
  const {
    input: { onChange, value }
  } = props;
  const { touched, error, warning } = meta;
  return (
    <View display="flex" fdirection="column" mt={3}>
      {label ? (
        <label html-for={name}>
          <LinkFont c={colors.black}>{label}</LinkFont>
        </label>
      ) : null}
      <ImageUpload
        placeholder={value || placeholder}
        imageComponent={imageComponent}
        onChange={vals => {
          onChange(vals);
        }}
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
  name: PropTypes.string,
  label: PropTypes.string,
  meta: PropTypes.object,
  input: PropTypes.object,
  placeholder: PropTypes.node,
  imageComponent: PropTypes.node
};

export default ReduxFormField;
