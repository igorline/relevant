'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Dimensions,
  PushNotificationIOS,
  ScrollView,
  ListView,
  AlertIOS
} from 'react-native';

var FileUpload = require('NativeModules').FileUpload;
import { connect } from 'react-redux';
var Button = require('react-native-button');
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as tagActions from '../actions/tag.actions';
import { bindActionCreators } from 'redux';
var ImagePickerManager = require('NativeModules').ImagePickerManager;
import * as utils from '../utils';
import { pickerOptions } from '../utils/pickerOptions';
import * as animationActions from '../actions/animation.actions';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Post from '../components/post.component';
import * as subscriptionActions from '../actions/subscription.actions';
import * as investActions from '../actions/invest.actions';
import Notification from '../components/notification.component';
import ProfileComponent from '../components/profile.component';
import InvestAnimation from '../components/investAnimation.component';

class Messages extends Component {
  constructor (props, context) {
    super(props, context)
    var md = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      messagesData: md
    }
  }

  componentDidMount() {
    var self = this;
    self.props.actions.getMessages(self.props.auth.user._id);
    if (self.props.messages) {
      if (self.props.messages.index) {
        if (self.props.messages.index.length) {
          self.setState({messagesData: self.state.messagesData.cloneWithRows(self.props.messages.index)});
        }
      }
    }
  }

  componentWillReceiveProps(next) {
    var self = this;
    if (next.messages.index != self.props.messages.index) {
      self.setState({messagesData: self.state.messagesData.cloneWithRows(next.messages.index)});
    }
  }

  goToUser(id) {
    var self = this;
    self.props.actions.getSelectedUser(id).then(function(results) {
      if (results) {
        self.props.view.nav.resetTo(11);
      }
    })
  }

  renderMessageRow(rowData) {
    var self = this;
    if (!rowData) return;
    if (rowData.type == 'thirst') {
      return (<View style={styles.message}>
        <Text><Text style={styles.active} onPress={self.goToUser.bind(self, rowData.from._id)}>👅💦 {rowData.from.name}</Text> is thirsty 4 u:</Text>
        <Text>{rowData.text}</Text>
        </View>
      );
    } else {
      return (
        <Text>Message</Text>
      );
    }
  }

  render() {
    var self = this;
    var messagesEl = null;
    if (self.props.messages.index.length > 0) {
      messagesEl = (<ListView ref="messageslist" renderScrollComponent={props => <ScrollView {...props} />} dataSource={self.state.messagesData} renderRow={self.renderMessageRow.bind(self)} />);
    } else {
      messagesEl = (<View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'red'}}><Text style={styles.darkGray}>Nothing in yr feed bruh</Text></View>)
    }


    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        {messagesEl}
      </View>
    );
  }
}

export default Messages;


const localStyles = StyleSheet.create({
  postsHeader: {
    padding: 10
  },
  uploadAvatar: {
    height: 100,
    width: 100,
    resizeMode: 'cover'
  },
  profileContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: 'white',
  },
  insideRow: {
    flex: 1,
  },
  insidePadding: {
    paddingLeft: 10,
    paddingRight: 10
  },
  pictureWidth: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
    message: {
    padding: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0'
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'nowrap'
  },
});

var styles = {...localStyles, ...globalStyles};

