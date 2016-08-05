'use strict';
import React, {
    AppRegistry,
    Component,
    StyleSheet,
    Text,
    View,
    Image,
    TextInput,
    Dimensions,
    ScrollView,
    TouchableHighlight
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
var FileUpload = require('NativeModules').FileUpload;
import { connect } from 'react-redux';
var Button = require('react-native-button');
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as tagActions from '../actions/tag.actions';
import { bindActionCreators } from 'redux';
import * as investActions from '../actions/invest.actions';
import * as notifActions from '../actions/notif.actions';
import * as userActions from '../actions/user.actions';
import * as animationActions from '../actions/animation.actions';
var ImagePickerManager = require('NativeModules').ImagePickerManager;
require('../publicenv');
import * as utils from '../utils';
import Post from '../components/post.component';
import * as subscriptionActions from '../actions/subscription.actions';
import Notification from '../components/notification.component';
import ProfileComponent from '../components/profile.component';
import InvestAnimation from '../components/investAnimation.component';

class User extends Component {
  constructor(props, context) {
      super(props, context)
      this.state = {
        followers: null,
        following: null,
        online: false,
        investAni: [],
        init: false
      }
  }

  actions() {
    var self = this;
    var notifObj = {
      notification: {
        post: null,
        forUser: self.props.users.selectedUser._id,
        byUser: self.props.auth.user._id,
        amount: null,
        type: 'profile',
        personal: true
      },
      message: self.props.auth.user.name+' just visited your profile'
    }

    self.props.dispatch(notifActions.createNotification(self.props.auth.token, notifObj));

    subscriptionActions.getSubscriptionData('follower', self.props.users.selectedUser._id).then(function(data) {
      self.setState({following: data.data});
    })
    subscriptionActions.getSubscriptionData('following', self.props.users.selectedUser._id).then(function(data) {
      self.setState({followers: data.data});
    })
    self.checkOnline(self.props.online);
    self.setState({init: true});
  }

  componentDidMount() {
    var self = this;
    if (self.props.users.selectedUser) self.actions();
  }

  componentDidUpdate(prev) {
    var self = this;
    if (self.props.users.selectedUser != prev.users.selectedUser && !self.state.init) self.actions();
    if (self.state.init) self.checkOnline(self.props.online);
  }

  checkOnline(online) {
    var self = this;
    for (var index in online) {
      if (index == self.props.users.selectedUser._id) {
        self.setState({online: true});
      }
    }
  }

  goTo(view) {
    var self = this;
    self.props.navigator.push(view);
  }

  render() {
    var self = this;
    var user = null;
    var userImage = null;
    var name = null;
    var relevance = 0;
    var balance = 0;
    const {actions} = this.props;
    var userImageEl = null;
    var postsEl = null;
    var followers = null;
    var following = null;
    var posts = null;
    var profileEl = null;

    console.log(self, 'user render')

    if (self.state.followers) followers = self.state.followers;
    if (self.state.following) following = self.state.following;

    if (this.props.users.selectedUser) {
        user = this.props.users.selectedUser;
        if (user.name) name = user.name;
        if (user.image) userImage = user.image;
        if (user.relevance) relevance = user.relevance;
        if (user.balance) balance = user.balance;
        if (user.posts) posts = user.posts;
        profileEl = (<ProfileComponent {...self.props} user={user} styles={styles} />)
    }

    if (userImage) {
      userImageEl = (<Image source={{uri: userImage}} style={styles.uploadAvatar} /> );
    }

    if (posts) {
      if (posts.length > 0) {

        if (posts.length > 10) {
          posts = posts.slice(0, 10);
        } else {
          posts = posts;
        }

        postsEl = posts.map(function(post, i) {
          return (<Post key={i} post={post} {...self.props} styles={styles} />)
        })
      } else {
        postsEl = (<View style={[styles.padding10]}><Text>0 Posts</Text></View>);
      }
    } else {
      postsEl = (<View style={styles.padding10}><Text>0 Posts</Text></View>);
    }

    return (
      <View style={styles.fullContainer}>
        <ScrollView style={styles.fullContainer}>
           {profileEl}
          <TouchableHighlight style={styles.thirstyIcon}>
            <Text style={styles.white} onPress={self.goTo.bind(self, 11)} >Thirsty 👅💦</Text>
          </TouchableHighlight>
          <View>
            {postsEl}
          </View>
        </ScrollView>
      </View>
    );
  }
}

export default User

const localStyles = StyleSheet.create({
  postsHeader: {
    padding: 10
  },
  thirstyIcon: {
    marginLeft: 10,
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    backgroundColor: 'black',
    borderRadius: 5,
    width: 108,
    justifyContent: 'center',
    color: 'white'
  },
  uploadAvatar: {
    height: 100,
    width: 100,
    resizeMode: 'cover'
  },
  profileContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: 'white',
  },
  row: {
    flexDirection: 'row',
    width: fullWidth,
    padding: 20
  },
  column: {
    flexDirection: 'column',
    width: fullWidth,
    paddingRight: 20,
    paddingLeft: 20,
    paddingBottom: 20,
  },
  insideRow: {
    flex: 1,
  },
  insidePadding: {
    paddingLeft: 10,
    paddingRight: 10
  },
  pictureWidth: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'nowrap'
  },
});
var styles = {...localStyles, ...globalStyles};