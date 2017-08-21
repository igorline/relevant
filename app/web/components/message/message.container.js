import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Message from './message';
import * as MessageActions from '../../actions/message.actions';

class MessageContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.getMessages(this.props.auth.user._id);
  }

  render () {
    return (
      <div>
        <Message { ...this.props} />
      </div>
    );
  }
}

export default connect(
  state => {
    return {
      auth: state.auth,
      message: state.message
    }
  },
  dispatch => {
    return Object.assign({}, { dispatch },  bindActionCreators(MessageActions, dispatch))
})(MessageContainer);
