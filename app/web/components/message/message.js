import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import * as MessageActions from '../../actions/message'

class Message extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    var messages = this.props.message.messages

    if (messages) {
      return (
        <div>
          {messages.map(function(message){
            return (
              <div key={message._id}>
                <h3>
                  <a href={'/profile/' + message.from._id}>{message.from.name}</a> is thirsty 4 u:
                </h3>

                <p>{message.text}</p>
                
                <br/>
                <br/>
                </div>
            )
          })}
        </div>
      )

    } else {
      return (
        null
      )
    }
  }
}

export default Message
