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
  Picker,
  Animated,
  PickerIOS,
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as userActions from '../actions/user.actions';
import * as postActions from '../actions/post.actions';
import * as investActions from '../actions/invest.actions';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Post from '../components/post.component';
import DiscoverUser from '../components/discoverUser.component';
import Notification from '../components/notification.component';
import * as animationActions from '../actions/animation.actions';
import InvestAnimation from '../components/investAnimation.component';

class SinglePost extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      investAni: [],
    }
  }

  componentWillUnmount() {
    var self = this;
    self.props.actions.setBack(false);
    self.props.actions.setName();
  }

  componentDidMount() {
    var self = this;
    var title = self.props.posts.activePost.title ? self.props.posts.activePost.title : title = 'Untitled Post';
    self.props.actions.setName(title);
    self.props.actions.setBack(true);
  }

  render() {
    var self = this;
    var post = null;
    if (this.props.posts.activePost) post = this.props.posts.activePost;
    var title = null;
    var description = null;
    var image = null;
    var link = null;
    if (post.link) link = post.link;
    if (post.title) title = post.title;
    if (post.description) description = post.description;
    if (post.image) image = post.image;

    return (
      <View style={[styles.fullContainer, {backgroundColor: 'white'}]}>
        <ScrollView style={styles.fullContainer}>
          <View>
            <Post post={post} {...self.props} styles={styles} />
          </View>
        </ScrollView>
      </View>
    );
  }
}

export default SinglePost


const localStyles = StyleSheet.create({
singlePostContainer: {
  width: fullWidth,
  flex: 1
}
});

var styles = {...localStyles, ...globalStyles}

