import React, { Component, PropTypes } from 'react'
import Comments from '../comment/comment.container'

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

  handleSubmit(e) {
    e.preventDefault();
    this.props.onCommentSubmit(this.state.text);
    this.setState({text: ''});
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit.bind(this)}>  
          <input type="text" value={this.state.text} onChange={this.handleChange.bind(this)} />
          <br/>
          {/*this.props.comment.failureMsg && <div>{ this.props.comment.failureMsg }</div>*/}
          <input type="submit" value="Add comment" />
        </form>
      </div>
    )
  }
}

export default NewCommentForm