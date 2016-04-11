'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/authActions';
import * as userActions from '../actions/userActions';
import * as postActions from '../actions/postActions';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

class Discover extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      currentView: null
    }
  }

  componentDidMount() {
    this.props.actions.userIndex();
    this.props.actions.getPosts();
    this.props.actions.getRecent();
  }

  render() {
    var self = this;
    var usersEl = null;
    var currentView = self.state.currentView;
    var postsEl = null;
    var posts = null;
    var recentPostsEl = null;
    var recentPosts = null;
    // console.log(self, 'discover self')

    if (self.props.posts.index) {
      posts = self.props.posts.index;
      postsEl = posts.map(function(post, i) {
        return (
           <Text onPress={self.props.actions.getActivePost.bind(null, post._id)}>{post.title ? post.title : 'Untitled'}</Text>
        );
      });
    }

    if (self.props.posts.recentPosts) {
      recentPosts = self.props.posts.recentPosts;
      recentPostsEl = recentPosts.map(function(post, i) {
        return (
           <Text onPress={self.props.actions.getActivePost.bind(null, post._id)}>{post.title ? post.title : 'Untitled'}</Text>
        );
      });
    }

    function setSelected(id) {
      if (id == self.props.auth.user._id) {
        self.props.routes.Profile();
      } else {
        self.props.actions.getSelectedUser(id, self.props.auth.token);
      }
    }

    var userIndex = null;
    if (this.props.auth.userIndex) {
      userIndex = this.props.auth.userIndex;
      usersEl = userIndex.map(function(user, i) {
        return (
           <Text onPress={setSelected.bind(null, user._id)}>{user.name}</Text>
        );
      });
    }

    function changeView(view) {
      self.setState({currentView: view});
    }


    return (
      <View style={styles.fullContainer}>
        <View style={[styles.row, styles.discoverBar]}>
          <Text onPress={changeView.bind(null, 1)} style={[styles.font20, styles.category, currentView == 1? styles.active : null]}>New</Text>
          <Text onPress={changeView.bind(null, 2)} style={[styles.font20, styles.category, currentView == 2? styles.active : null]}>Top</Text>
          <Text onPress={changeView.bind(null, 3)} style={[styles.font20, styles.category, currentView == 3? styles.active : null]}>People</Text>
        </View>
        <View style={styles.padding20}>
          {currentView == 1 || !currentView ? recentPostsEl : null}
          {currentView == 2 ? postsEl : null}
          {currentView == 3 ? usersEl : null}
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    router: state.routerReducer,
    users: state.user,
    posts: state.posts
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...authActions, ...userActions, ...postActions}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Discover)

const localStyles = StyleSheet.create({
row: {
  flexDirection: 'row',
},
category: {
  flex: 1,
  textAlign: 'center'
},
padding20: {
  padding: 20
},
discoverBar: {
  width: fullWidth,
  paddingTop: 20,
  // paddingRight: 20,
  // paddingLeft: 20,
  // justifyContent: 'space-between'
}
});

var styles = {...localStyles, ...globalStyles};

