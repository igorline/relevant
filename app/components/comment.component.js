'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  TextInput,
  Animated,
  Image,
  ActionSheetIOS,
  TouchableHighlight
} from 'react-native';
var Button = require('react-native-button');
import {reduxForm} from 'redux-form';
import Notification from './notification.component';
var moment = require('moment');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

class Comment extends Component {

  constructor (props, context) {
    super(props, context)
    this.state = {
        buttons: [
        'Delete',
        'Cancel'
      ],
      destructiveIndex: 0,
      cancelIndex: 1,
    }
  }

  showActionSheet() {
    var self = this;
    ActionSheetIOS.showActionSheetWithOptions({
      options: self.state.buttons,
      cancelButtonIndex: self.state.cancelIndex,
      destructiveButtonIndex: self.state.destructiveIndex,
    },
    (buttonIndex) => {
      switch(buttonIndex) {
          case 0:
              self.deleteComment();
              break;
          default:
              return;
      }
    });
  }

  deleteComment() {
    var self = this;
    self.props.actions.deleteComment(self.props.auth.token, self.props.comment._id, self.props.comment.post);
  }

  render() {
    var self = this;
    var comment = self.props.comment;
    var styles = {...localStyles, ...self.props.styles};
    var postTime = moment(comment.createdAt);
    var timeNow = moment();
    var dif = timeNow.diff(postTime);
    var createdTime = moment.duration(dif).humanize();

    return (
      <View style={[styles.commentContainer]}>
        <View style={[styles.flexRow]}>
          <Image style={styles.commentAvatar} source={{uri: comment.user.image}} />
          <View style={{flex: 1}}>
            <View style={styles.commentHeaderTextContainer}>
                <Text style={{fontSize: 12, color: '#aaaaaa'}}>{createdTime} ago</Text>
                <Text style={{fontSize: 12, color: '#aaaaaa'}}>{comment.user.name}</Text>
            </View>
            <View style={styles.commentBody}>
              <Text style={styles.darkGray}>{comment.text}</Text>
            </View>
            {self.props.auth.user._id == comment.user._id ? <View style={{marginTop: 10, flex: 1, justifyContent: 'flex-end', flexDirection: 'row'}}>
              <TouchableHighlight underlayColor={'transparent'}  onPress={self.showActionSheet.bind(self)} style={[]}>
                <Text style={[{fontSize: 20, color: '#808080'}]}>...</Text>
              </TouchableHighlight>
            </View> : null}
          </View>
        </View>
      </View>
    );
  }
}

export default Comment

const localStyles = StyleSheet.create({
  commentBody: {
  },
  commentHeaderTextContainer: {
    height: 50
  },
  commentContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  commentAvatar: {
    height: 25,
    width: 25,
    borderRadius: 12.5,
    marginRight: 10,
  },
});



