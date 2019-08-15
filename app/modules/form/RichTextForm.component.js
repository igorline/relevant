import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RichText from 'modules/text/web/richText.component';
import { LinkFont, View } from 'modules/styled/uni';
import { colors } from 'app/styles';

export default class RichTextForm extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    input: PropTypes.object,
    placeholder: PropTypes.string,
    label: PropTypes.string,
    initialValues: PropTypes.object
  };

  state = {
    admins: this.props.initialValues,
    adminsText: ''
  };

  componentDidUpdate() {
    this.props.onChange(this.state.admins);
  }

  updateAdmins = (adminsText, data) => {
    this.setState({ admins: data.mentions, adminsText });
  };

  render() {
    const { input, placeholder, label } = this.props;
    const { adminsText } = this.state;
    return (
      <View display="flex" fdirection="column" mt={3}>
        <label>
          <LinkFont c={colors.black}>{label}:</LinkFont>
        </label>
        <RichText
          className="editor"
          body={'test'}
          onChange={this.updateAdmins}
          body={adminsText}
          placeholder={placeholder || label}
          onBlur={() => input.onBlur(input.value)}
        />
      </View>
    );
  }
}
