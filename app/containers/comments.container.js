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
import * as notifActions from '../actions/notif.actions';
import Notification from '../components/notification.component';
import Comment from '../components/comment.component';
import DiscoverUser from '../components/discoverUser.component';

class Comments extends Component {
  constructor (props, context) {
    super(props, context)
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      comment: null,
      visibleHeight: Dimensions.get('window').height - 120,
      elHeight: null,
      scrollView: ScrollView,
      scrollToBottomY: null,
      dataSource: ds.cloneWithRows([]),
    }
  }

  componentWillUnmount() {
    var self = this;
    self.props.actions.setBack(false);
    self.props.actions.setName(null);
  }

  componentDidMount() {
    var self = this;
    self.props.actions.getComments(self.props.posts.activePost);
    DeviceEventEmitter.addListener('keyboardWillShow', this.keyboardWillShow.bind(this))
    DeviceEventEmitter.addListener('keyboardWillHide', this.keyboardWillHide.bind(this))
    self.props.actions.setBack(true);
    self.props.actions.setName('Comments');
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
    if (next.posts.comments != self.props.posts.comments) {
      var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      self.setState({dataSource: ds.cloneWithRows(next.posts.comments)});
    }
  }

  componentDidUpdate(prev) {
    var self = this;
    if (!prev) return;
    if (prev.posts.comments && prev.posts.comments != self.props.posts.comments) {
      setTimeout(function() {
        self.scrollToBottom();
      }, 500);
    }
  }


  scrollToBottom() {
    var self = this;
    if (self.props.posts.comments.length < 7) return;
    var scrollDistance = self.state.scrollToBottomY - self.state.elHeight;
    self.state.scrollView.scrollTo({x: 0, y: scrollDistance, animated: true});
  }

  createComment() {
    var self = this;
    var commentObj = {
      post: self.props.posts.activePost,
      text: self.state.comment,
      user: self.props.auth.user._id
    }
    self.props.actions.createComment(self.props.auth.token, commentObj);
    self.setState({comment: null})
  }

  renderRow(rowData) {
    var self = this;
      return (
        <Comment styles={styles} {...self.props} comment={rowData} />
      );
  }


  render() {
    var self = this;
    var comments = [];
    var commentsEl = null;

    if (self.props.posts.comments) {
      comments = self.props.posts.comments;
      commentsEl = comments.map(function(comment) {
        return( <Comment styles={styles} {...self.props} comment={comment} />);
      })
    }

    return (
      <View style={[{height: self.state.visibleHeight, backgroundColor: 'white'}]}>
        <ScrollView ref={(scrollView) => { self.state.scrollView = scrollView; }} onContentSizeChange={(height, width)=>{self.state.scrollToBottomY = width;}} onLayout={(e)=>{self.state.elHeight = e.nativeEvent.layout.height}}>
          {commentsEl}
          </ScrollView>
        <View style={styles.commentInputParent}>
          <TextInput style={[styles.commentInput, styles.font15]} placeholder='Enter comment...' multiline={false} onChangeText={(comment) => this.setState({"comment": comment})} value={self.state.comment} returnKeyType='done' />
          <TouchableHighlight underlayColor={'transparent'} style={styles.commentSubmit} onPress={self.createComment.bind(self)}>
            <Text style={[styles.font15, styles.active]}>Submit</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

export default Comments

const localStyles = StyleSheet.create({
  commentInputParent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentInput: {
    height: 50,
    flex: 0.75,
    padding: 10,
  },
  commentSubmit: {
    flex: 0.25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

var styles = {...localStyles, ...globalStyles};


















