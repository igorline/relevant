import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import * as MessageActions from '../../../actions/message.actions';

class NewMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      showConfirmation: false
    };
  }

  componentDidMount() {
    if (this.state.showConfirmation) this.setState({ showConfirmation: false });
  }

  onMessageChange(event) {
    this.setState({message: event.target.value});
  }

  sendMessage() {
    const messageObj = {
      to: this.props.profile.selectedUser._id,
      from: this.props.auth.user._id,
      type: 'thirst',
      text: this.state.message,
    };
    this.props.createMessage(this.props.auth.token, messageObj);
    this.setState({ message: '' });
    this.setState({ showConfirmation: true });
  }

  render() {
    console.log(this, 'thisnewmessage');
    return (
      <div>
        <form>
          <input type="text" onChange={this.onMessageChange.bind(this)} value={this.state.message}  placeholder="Show ur thirst" />
          <button type="button" onClick={this.sendMessage.bind(this)}>Send</button>
        </form>
        {this.state.showConfirmation && this.props.message.successMsg && <div>{this.props.message.successMsg}</div>}
        {this.state.showConfirmation && this.props.message.failureMsg && <div>{this.props.message.failureMsg}</div>}
      </div>
    );
  }
}

export default NewMessage;
