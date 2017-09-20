import React, { Component, PropTypes } from 'react'
import Comments from '../comment/comment.container'
import Avatar from '../common/avatar.component'

class NewCommentForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      text: ''
    }
  }

  handleChange(e) {
    this.setState({text: e.target.value});
  }

  handleKeydown(e) {
    if (e.keyCode == 13 && e.shiftKey == false) {
      this.handleSubmit(e); // <--- all the form values are in a prop
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.onCommentSubmit(this.state.text);
    this.setState({ text: '' });
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit.bind(this)}>
          <Avatar user={this.props.auth.user} />
          <textarea placeholder="Enter comment..." value={this.state.text} onKeyDown={this.handleKeydown} onChange={this.handleChange.bind(this)} />
          <input type="submit" value="Submit" />
          {/*this.props.comment.failureMsg && <div>{ this.props.comment.failureMsg }</div>*/}
        </form>
      </div>
    )
  }
}

export default NewCommentForm
