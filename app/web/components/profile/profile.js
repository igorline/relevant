import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import NewMessage from '../message/newMessage'
import * as ProfileActions from '../../actions/profile'
import * as MessageActions from '../../actions/message'

class Profile extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showMsgForm: false
    }
  }
  
  onClick(e){
    e.preventDefault();
    this.setState({showMsgForm: !this.state.showMsgForm})
  }

  render() {
    var userPath = this.props.profile.selectedUser

    if (userPath) {
      return (
        <div>
          <div>
            <h1>{userPath.name}</h1>
            <h3> Relevance: {Math.round(userPath.relevance * 100) / 100}</h3>
            <img src={userPath.image} width="15%"></img>
            <br/>
            <a onClick={this.onClick.bind(this)} href='#'>Thirsty?</a>
            {this.state.showMsgForm && <NewMessage { ...this.props} />}
          </div>

          <br/>
          <br/>
          <br/>
          <br/>
        </div>
      )

    } else {
      return (
        null
      )
    }
  }
}

Profile.defaultProps = {
    profile: {userPosts: []}
}

export default connect(
  state => {
    return {
      message: state.message
    }
  },
  dispatch => {
    return Object.assign({}, { dispatch },  bindActionCreators(MessageActions, dispatch))
  }
)(Profile)