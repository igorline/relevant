'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ScrollView,
  Linking,
  TouchableHighlight,
  LayoutAnimation,
  DeviceEventEmitter,
  Dimensions,
  ListView,
  AlertIOS
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as userActions from '../actions/user.actions';
require('../publicenv');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Post from '../components/post.component';
import * as investActions from '../actions/invest.actions';
import * as tagActions from '../actions/tag.actions';
import * as notifActions from '../actions/notif.actions';
import * as messageActions from '../actions/message.actions';
import Notification from '../components/notification.component';
import Comment from '../components/comment.component';
import DiscoverUser from '../components/discoverUser.component';

class Thirst extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
       visibleHeight: Dimensions.get('window').height - 120,
       tag: null,
       autoTags: [],
       preTag: null,
       tag: null,
       text: null
    }
  }

  componentDidMount() {
    var self = this;
    DeviceEventEmitter.addListener('keyboardWillShow', this.keyboardWillShow.bind(this))
    DeviceEventEmitter.addListener('keyboardWillHide', this.keyboardWillHide.bind(this))
  }

  keyboardWillShow (e) {
    let newSize = (Dimensions.get('window').height - e.endCoordinates.height) - 60
    this.setState({visibleHeight: newSize})
  }

  keyboardWillHide (e) {
    this.setState({visibleHeight: Dimensions.get('window').height - 120})
  }

  componentWillUpdate(next) {
    var self = this;
  }

  componentDidUpdate(prev) {
    var self = this;
  }

  sendThirst() {
    var self = this;
    if (!self.state.text) {
      AlertIOS.alert("Add text");
      return;
    }
    var messageObj = {
      to: self.props.users.selectedUser._id,
      from: self.props.auth.user._id,
      type: 'thirst',
      text: self.state.text,
      tag: null
    }

    self.props.actions.createMessage(self.props.auth.token, messageObj).then(function(data) {
      console.log(data, 'thirty data')
      if (data.status) {
        AlertIOS.alert("Message sent");
        self.setState({tag: null, text: null})
      } else {
        //self.props.actions.setNotif(true, 'Try again', false);
        AlertIOS.alert("Try again");
        self.setState({tag: null, text: null})
      }
    })
  }

  addTagToMessage(tag) {
    var self = this;
    if (!self.state.tag) {
      self.setState({preTag: null, tag: tag, autoTags: []});
    } else {
      AlertIOS.alert("Cannot add multiple tags");
    }
  }

  removeTag() {
    var self = this;
    self.setState({tag: null})
  }

  render() {
    var self = this;
    var user = null;
    var name = null;
    if (self.props.users) {
      if (self.props.users.selectedUser) user = self.props.users.selectedUser;
      if (user) name = user.name;
    }
    var tagEl = null;

    return (
      <View style={[{height: self.state.visibleHeight, backgroundColor: 'white'}]}>
        <View style={{flex: 1}}>
          <TextInput style={[styles.thirstInput, styles.font15]} placeholder={'Enter your message for '+name} multiline={true} onChangeText={(text) => this.setState({text})} value={self.state.text} returnKeyType='done' />
          <TouchableHighlight underlayColor={'transparent'} style={[styles.thirstSubmit]} onPress={self.sendThirst.bind(self)}>
            <Text style={[styles.font15, styles.active]}>Send</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

export default Thirst

const localStyles = StyleSheet.create({
  commentInputParent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chooseTagContainer: {
    flex: 0.9,
    padding: 10,
  },
   thirstInput: {
    flex: 0.9,
    width: fullWidth,
    // borderWidth: 1,
    // borderColor: 'red',
    padding: 10
  },
  thirstSubmit: {
    flex: 0.1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

var styles = {...localStyles, ...globalStyles};


















