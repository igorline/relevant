'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TextInput,
  Animated,
  Image,
  ActionSheetIOS,
  AlertIOS,
  TouchableHighlight
} from 'react-native';
var moment = require('moment');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

class Comment extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
        buttons: [
        'Edit',
        'Delete',
        'Cancel'
      ],
      destructiveIndex: 1,
      cancelIndex: 2,
      editedText: null,
      editing: false,
      height: 0
    }
  }

  editComment() {
    var self = this;
    self.setState({editing: !self.state.editing})
  }

  saveEdit() {
    var self = this;
    if (self.state.editedText != self.props.comment.text) {
      var comment = self.props.comment;
      comment.text = self.state.editedText;
      self.props.actions.updateComment(comment, self.props.auth.token).then(function(results) {
        if (results) {
          self.setState({editing: !self.state.editing});
          AlertIOS.alert("Comment updated");
        } else {
          AlertIOS.alert("Try again");
        }
      })
    }
  }


  componentDidMount() {
    var self = this;
    self.setState({editedText: self.props.comment.text})
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
          self.editComment();
          break;
        case 1:
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
    var bodyEl = null;

    if (self.state.editing) {
      bodyEl = (<View style={{flex: 1}}>
        <TextInput 
          multiline={true}
          autoGrow={true}
          style={[styles.darkGray, styles.editingInput, {height: Math.max(35, self.state.height)}]} 
          onChange={(event) => {
            this.setState({
              editedText: event.nativeEvent.text,
              height: event.nativeEvent.contentSize.height,
            });
          }}
          value={this.state.editedText}
        />
        <View style={styles.postButtons}>
          <TouchableHighlight underlayColor={'transparent'} style={styles.postButton} onPress={self.saveEdit.bind(self)}>
            <Text style={[styles.font10, styles.postButtonText]}>Save changes</Text>
          </TouchableHighlight>
          <TouchableHighlight underlayColor={'transparent'} onPress={self.editComment.bind(self)} style={styles.postButton}>
            <Text style={[styles.font10, styles.postButtonText]}>Cancel</Text>
          </TouchableHighlight>
        </View>
      </View>);
    } else {
      bodyEl = (<Text style={styles.darkGray}>{self.state.editedText}</Text>);
    }

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
              {bodyEl}
            </View>
            {self.props.auth.user._id == comment.user._id ? <View style={{marginTop: 10, flex: 1, justifyContent: 'flex-end', flexDirection: 'row'}}>
              <TouchableHighlight underlayColor={'transparent'} onPress={self.showActionSheet.bind(self)} style={[]}>
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



