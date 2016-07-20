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
var animations = require("../animation");

class SinglePost extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      investAni: [],
    }
  }

  componentDidMount() {
  }

  componentWillReceiveProps(next) {
    var self = this;
    if (self.props.animation != next.animation) {
      if (next.animation.bool) {
        if (next.animation.type == 'invest') {
          animations.investAni(self);
        }
      }
    }
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
      <View style={styles.fullContainer}>
        <ScrollView style={styles.fullContainer}>
          <View>
            <Post post={post} {...self.props} styles={styles} />
          </View>
          <View pointerEvents={'none'} style={styles.notificationContainer}>
            <Notification />
          </View>
        </ScrollView>
         {self.state.investAni}
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    router: state.routerReducer,
    users: state.user,
    posts: state.posts,
    animation: state.animation
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...investActions, ...authActions, ...userActions, ...postActions, ...animationActions}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SinglePost)

const localStyles = StyleSheet.create({
singlePostContainer: {
  width: fullWidth,
  flex: 1
}
});

var styles = {...localStyles, ...globalStyles}

