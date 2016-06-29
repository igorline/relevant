'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  TextInput,
  Animated,
  Image
} from 'react-native';
var Button = require('react-native-button');
import {reduxForm} from 'redux-form';
import Notification from './notification.component';
var moment = require('moment');

class Comment extends Component {

  constructor (props, context) {
    super(props, context)
    this.state = {
    }
  }

  componentDidMount() {
    var self = this;
  }

  componentDidUpdate() {
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
          <View>
            <View style={styles.commentHeaderTextContainer}>
              <View style={[styles.flexRow]}>
                <Text style={styles.font10}>{createdTime} ago &#8226; </Text>
                <Text style={styles.font10}>{comment.user.name}</Text>
              </View>
              <Text style={styles.font10}>📈<Text style={styles.active}>{comment.user.relevance.toFixed(0)}</Text></Text>
            </View>
            <View style={styles.commentBody}>
              <Text>{comment.text}</Text>
            </View>
            {self.props.auth.user._id == comment.user._id ? <Text onPress={self.deleteComment.bind(self)} style={styles.deletePadding}>❌</Text> : null}
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
    height: 50,
    justifyContent: 'center'
  },
  commentContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray'
  },
  commentAvatar: {
    height: 50,
    width: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  deletePadding: {
    paddingTop: 10,
    paddingBottom: 10
  }
});



