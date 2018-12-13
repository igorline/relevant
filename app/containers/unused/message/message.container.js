import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Message from './message';
import * as MessageActions from '../../actions/message.actions';

class MessageContainer extends Component {
  static propTypes = {
    getMessages: PropTypes.func,
    auth: PropTypes.object
  };

  componentWillMount() {
    this.props.getMessages(this.props.auth.user._id);
  }

  render() {
    return (
      <div>
        <Message {...this.props} />
      </div>
    );
  }
}

export default connect(
  state => ({
    auth: state.auth,
    message: state.message
  }),
  dispatch => Object.assign({}, { dispatch }, bindActionCreators(MessageActions, dispatch))
)(MessageContainer);
