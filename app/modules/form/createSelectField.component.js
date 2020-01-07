import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CreatableSelect from 'react-select/creatable';
import { LinkFont, SecondaryText, View } from 'modules/styled/uni';
import { colors } from 'app/styles';

const components = {
  DropdownIndicator: null
};

const createOption = (label: string) => ({
  label,
  value: label
});

export default class CreatableMulti extends Component {
  static propTypes = {
    // initialValues: PropTypes.array,
    input: PropTypes.object,
    placeholder: PropTypes.string,
    label: PropTypes.string,
    error: PropTypes.string
  };

  state = {
    inputValue: '',
    value: this.props.input.value
      ? this.props.input.value.map(option => ({ value: option, label: option }))
      : []
  };

  componentDidUpdate() {
    const vals = this.state.value.map(v => v.label);
    // console.log('did update', vals);
    this.props.input.onChange(vals);
  }

  handleChange = (
    value: any
    // actionMeta: any
  ) => {
    // console.group('Value Changed');
    // console.log(value);
    // console.log(`action: ${actionMeta.action}`);
    // console.groupEnd();
    this.setState({ value });
  };

  handleInputChange = (inputValue: string) => {
    this.setState({ inputValue });
  };

  handleKeyDown = event => {
    const { inputValue, value } = this.state;
    if (!inputValue) return;
    switch (event.key) {
      case 'Enter':
      case 'Tab':
        // console.group('Value Added');
        // console.log(value);
        // console.groupEnd();
        this.setState({
          inputValue: '',
          value: [...value, createOption(inputValue)]
        });
        event.preventDefault();
        break;
      default:
        // console.log('DEFAULT');
        break;
    }
  };

  render() {
    const { placeholder, label, error, input } = this.props;
    const { inputValue } = this.state;
    const vals = input.value ? input.value.map(v => ({ label: v, value: v })) : [];
    return (
      <View key="tags-input" mt={2}>
        {label ? (
          <LinkFont c={colors.black} mb={1}>
            {label}
          </LinkFont>
        ) : null}
        <CreatableSelect
          key="tags-input-select"
          components={components}
          inputValue={inputValue}
          isClearable
          isMulti
          menuIsOpen={false}
          onChange={this.handleChange}
          onInputChange={this.handleInputChange}
          onKeyDown={this.handleKeyDown}
          placeholder={placeholder}
          value={vals}
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
