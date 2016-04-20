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
  Linking
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
import Notification from '../components/notification.component';

class Read extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
    }
  }

  componentDidMount() {
    var self = this;
    this.props.actions.getFeed(this.props.auth.user._id);
  }

  componentDidUpdate() {
  }

  render() {
    var self = this;
    var postsEl = null;
    var posts = null;
    if (self.props.posts.feed) {
      posts = self.props.posts.feed;
      postsEl = posts.map(function(post) {
        return (
          <Post post={post} {...self.props} styles={styles} />
        );
      });
    }


    return (
      <ScrollView style={[styles.readContainer]}>
       {postsEl}
       <View pointerEvents={'none'} style={styles.notificationContainer}>
          <Notification />
        </View>
      </ScrollView>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    user: state.user,
    router: state.routerReducer
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...authActions, ...postActions, ...userActions}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Read)

const localStyles = StyleSheet.create({
  readContainer: {
   // padding: 20,
   // borderWidth: 1,
   // borderColor: 'red'
  },
  readHeader: {
    marginBottom: 10
  }
});

var styles = {...localStyles, ...globalStyles};

