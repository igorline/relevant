import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LinkFont, SecondaryText, View } from 'modules/styled/uni';
import { colors } from 'app/styles';
import Select from 'react-select';

export default class SelectField extends Component {
  static propTypes = {
    input: PropTypes.object,
    options: PropTypes.array,
    label: PropTypes.string,
    error: PropTypes.string
  };

  state = { inputValue: '' };

  handleChange = vals => {
    const formattedVals = vals.map(v => v.value);
    this.props.input.onChange(formattedVals);
  };

  render() {
    const { label, error, options, input } = this.props;
    const vals = input.value.map(u => ({ label: u, value: u }));
    const opts = options.map(o => ({ label: o, value: o }));
    return (
      <View mt={2} zIndex={0}>
        {label ? (
          <LinkFont c={colors.black} mb={1}>
            {label}
          </LinkFont>
        ) : null}
        <Select
          styles={{ menu: styles => ({ ...styles, position: 'relative', top: 0 }) }}
          isMulti
          cacheOptions
          defaultOptions
          value={vals}
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