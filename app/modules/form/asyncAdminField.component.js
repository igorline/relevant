import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { LinkFont, SecondaryText, View } from 'modules/styled/uni';
import { colors } from 'app/styles';

import AsyncSelect from 'react-select/lib/Async';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { searchUser } from 'modules/user/user.actions';

class AsyncAdminField extends Component {
  static propTypes = {
    input: PropTypes.object,
    label: PropTypes.string,
    error: PropTypes.string,
    actions: PropTypes.object
    // userSearch: PropTypes.array
  };

  state = { inputValue: '' };

  handleInputChange = (newValue: string) => {
    const inputValue = newValue.replace(/\W/g, '');
    this.setState({ inputValue });
    return inputValue;
  };

  loadOptions = async val => {
    if (!val.length) return null;
    const userSearch = await this.props.actions.searchUser(val);
    return userSearch.map(u => ({ label: u.handle, value: u.handle }));
  };

  handleChange = vals => {
    const formattedVals = vals.map(v => v.value);
    this.props.input.onChange(formattedVals);
  };

  render() {
    const { label, error, input } = this.props;
    const vals = get(input, 'value', []).map(u => ({ label: u, value: u }));
    return (
      <View mt={2} zIndex={0}>
        {label ? (
          <LinkFont c={colors.black} mb={1}>
            {label}
          </LinkFont>
        ) : null}
        <AsyncSelect
          styles={{ menu: styles => ({ ...styles, position: 'relative', top: 0 }) }}
          isMulti
          cacheOptions
          defaultOptions
          value={vals}
          loadOptions={this.loadOptions}
          onChange={this.handleChange}
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

function mapStateToProps(state) {
  return {
    userSearch: state.user.search
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        searchUser
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AsyncAdminField);
