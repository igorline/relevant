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
  ListView
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
import Shimmer from 'react-native-shimmer';

class Thirst extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
       visibleHeight: Dimensions.get('window').height - 120,
       tag: null,
       autoTags: [],
       preTag: null,
       tag: null
    }
  }

  componentDidMount() {
    var self = this;
    DeviceEventEmitter.addListener('keyboardWillShow', this.keyboardWillShow.bind(this))
    DeviceEventEmitter.addListener('keyboardWillHide', this.keyboardWillHide.bind(this))
  }

  keyboardWillShow (e) {
    let newSize = (Dimensions.get('window').height - e.endCoordinates.height) - 120
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
    if (!self.state.tag) {
      self.props.actions.setNotif(true, 'Add tag', false);
      return;
    }
    var messageObj = {
      to: self.props.user.selectedUser._id,
      from: self.props.auth.user._id,
      type: 'thirst',
      tag: self.state.tag._id
    }
    self.props.actions.createMessage(self.props.auth.token, messageObj).then(function(data) {
      if (data.status) {
        self.props.actions.setNotif(true, 'Message sent', true);
        self.setState({tag: null})
      } else {
        self.props.actions.setNotif(true, 'Try again', false);
        self.setState({tag: null})
      }
    })
  }


  searchTags(tag) {
    var self = this;
    self.setState({preTag: tag});
    if (!tag.length) {
      self.setState({autoTags: []});
      return;
    }
    self.props.actions.searchTags(tag).then(function(tags) {
      self.setState({autoTags: tags.data});
    })
  }

  addTagToMessage(tag) {
    var self = this;
    if (!self.state.tag) {
      self.setState({preTag: null, tag: tag, autoTags: []});
    } else {
      self.props.actions.setNotif(true, 'Cannot add multiple tags', false)
    }
  }

  removeTag() {
    var self = this;
    self.setState({tag: null})
  }

  render() {
    var self = this;

    var autoTags = (<Text style={styles.padding10}>No suggested tags</Text>);
    if (self.state.autoTags.length) {
      autoTags = [];
      self.state.autoTags.forEach(function(tag, i) {
        autoTags.push(<TouchableHighlight key={i} onPress={self.addTagToMessage.bind(self, tag)} style={[styles.list]}>
          <Text key={i+'x'}>Add tag: {tag.name}</Text>
        </TouchableHighlight>)
      });
    }

    var tagEl = null;

     if (self.state.tag) {
      tagEl = (<TouchableHighlight onPress={self.removeTag.bind(self)} style={styles.tagBox}><View style={styles.tagRow}><Image style={styles.tagX} source={require('../assets/images/x.png')} /><Text style={styles.white}>{self.state.tag.name}</Text></View></TouchableHighlight>)
    }

    return (
      <View style={[{height: self.state.visibleHeight}]}>
        <View style={{flex: 1}}>
          <View style={styles.chooseTagContainer}>
          <TextInput style={[styles.thirstInput, styles.font15]} placeholder={'Enter the tag you want '+self.props.user.selectedUser.name+' to post about'} multiline={false} onChangeText={(tags) => this.searchTags(tags)} value={self.state.preTag} returnKeyType='done' />
          {autoTags}
          <View style={styles.tagStringContainer}>{tagEl}</View>
          </View>
          <TouchableHighlight style={[styles.thirstSubmit]} onPress={self.sendThirst.bind(self)}>
            <Text style={[styles.font15, styles.active]}>Submit</Text>
          </TouchableHighlight>
        </View>
        <View pointerEvents={'none'} style={styles.notificationContainer}>
          <Notification />
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    user: state.user,
    router: state.routerReducer,
    online: state.online,
    messages: state.messages
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...notifActions, ...messageActions, ...investActions, ...authActions, ...postActions, ...userActions, ...tagActions}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Thirst)

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
    height: 50,
    width: fullWidth,
  },
  thirstSubmit: {
    flex: 0.1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

var styles = {...localStyles, ...globalStyles};


















