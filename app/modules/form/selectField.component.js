import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LinkFont, SecondaryText, View } from 'modules/styled/uni';
import { colors } from 'app/styles';
import Select from 'react-select';

export default class SelectField extends Component {
  static propTypes = {
    input: PropTypes.object,
    options: PropTypes.array,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    error: PropTypes.string
  };

  state = { inputValue: '' };

  handleChange = value => {
    this.props.input.onChange(value.value);
  };

  render() {
    const { label, error, options, input } = this.props;
    const defaultValue = { value: input.value, label: input.value };
    const opts = options.map(o => ({ label: o, value: o }));
    return (
      <View mt={2} zIndex={0}>
        {label ? (
          <LinkFont c={colors.black} mb={1}>
            {label}
          </LinkFont>
        ) : null}
        <Select
          styles={{
            menu: styles => ({ ...styles, position: 'relative', top: 0, zIndex: 10 })
          }}
          // isMulti
          // cacheOptions
          defaultValue={defaultValue}
          onChange={this.handleChange}
          options={opts}
        />
        {error ? (
          <SecondaryText c={colors.red} mt={1}>
            {error}
          </SecondaryText>
        ) : null}
      </View>
    );
  }
}
