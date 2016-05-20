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
  }

  componentDidUpdate() {
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
            <View style={styles.flexRow}>
              <Text>{createdTime} ago &#8226; </Text>
              <Text>{comment.user.name}</Text>
            </View>
            <Text>&#1071;<Text style={styles.active}>{comment.user.relevance.toFixed(0)}</Text></Text>
          </View>
        </View>
        <Text>{comment.text}</Text>
      </View>
    );
  }
}

export default Comment

const localStyles = StyleSheet.create({
  commentContainer: {
    padding: 10
  },
  commentAvatar: {
    height: 50,
    width: 50,
    borderRadius: 25,
    marginRight: 10,
  },
});



