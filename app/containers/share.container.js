
import React, { Component } from 'react'
import Modal from 'react-native-modalbox'
import ShareExtension from 'react-native-share-extension'
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  Text,
  TextInput,
  View,
  TouchableOpacity
} from 'react-native'

class ShareContainer extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      isOpen: true,
      type: '',
      value: ''
    }
  }

  async componentDidMount() {
    console.log("LAUNCHING SHARE")
    try {
      const { type, value } = await ShareExtension.data()
      this.setState({
        type,
        value
      })
    } catch(e) {
      console.log('errrr', e)
    }
    console.log(this)
    this.props.actions.getUser(null, true);
  }

  onClose() {
    ShareExtension.close()
  }

  closing = () => {
    this.setState({
      isOpen: false
    })
  }

  render() {

    var name = null;
    if (this.props.auth && this.props.auth.user)
      name = this.props.auth.user.name
    return (
        <Modal backdrop={false}
               style={{ backgroundColor: 'white' }} position="center" isOpen={this.state.isOpen} onClosed={this.onClose}>
            <View style={{ alignItems: 'center', justifyContent:'center', flex: 1 }}>
              <View style={{ borderColor: 'green', borderWidth: 1, backgroundColor: 'white', height: 200, width: 300 }}>
                <TouchableOpacity onPress={this.closing}>
                  <Text>Close</Text>
                  <Text>type: { this.state.type }</Text>
                  <Text>value: { this.state.value }</Text>
                  <Text>value: { name }</Text>
                </TouchableOpacity>
              </View>
            </View>
        </Modal>
    )
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    post: state.post,
    user: state.user
   };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...authActions, ...postActions}, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ShareContainer)



