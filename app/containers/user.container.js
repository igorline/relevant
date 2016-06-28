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
var ImagePickerManager = require('NativeModules').ImagePickerManager;
require('../publicenv');
import * as utils from '../utils';
import Post from '../components/post.component';
import * as subscriptionActions from '../actions/subscription.actions';
import Notification from '../components/notification.component';
import ProfileComponent from '../components/profile.component';

class User extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
          followers: null,
          following: null,
          online: false
        }
    }

    componentDidMount() {
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

      notifActions.createNotification(self.props.auth.token, notifObj)

      subscriptionActions.getSubscriptionData('follower', self.props.users.selectedUser._id).then(function(data) {
        self.setState({following: data.data});
      })
      subscriptionActions.getSubscriptionData('following', self.props.users.selectedUser._id).then(function(data) {
        self.setState({followers: data.data});
      })
      self.checkOnline(self.props.online);
    }

    componentWillReceiveProps(next) {
      var self = this;
      self.checkOnline(next.online);
    }

    checkOnline(online) {
      var self = this;
      for (var index in online) {
        if (index == self.props.users.selectedUser._id) {
          self.setState({online: true});
        }
      }
    }

    sendThirst() {
      var self = this;
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
      if (self.state.followers) followers = self.state.followers;
      if (self.state.following) following = self.state.following;

      if (this.props.users.selectedUser) {
          user = this.props.users.selectedUser;
          if (user.name) name = user.name;
          if (user.image) userImage = user.image;
          if (user.relevance) relevance = user.relevance;
          if (user.balance) balance = user.balance;
      }

      if (userImage) {
        userImageEl = (<Image source={{uri: userImage}} style={styles.uploadAvatar} /> );
      }


      if (self.props.users.selectedUser.posts) {
        if (self.props.users.selectedUser.posts.length > 0) {
          var posts = null;

          if (self.props.users.selectedUser.posts.length > 10) {
            posts = self.props.users.selectedUser.posts.slice(0, 10);
          } else {
            posts = self.props.users.selectedUser.posts;
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
          <ProfileComponent {...self.props} user={self.props.users.selectedUser} styles={styles} />

          <TouchableHighlight style={styles.thirstyIcon}>
            <Text style={styles.white} onPress={self.props.routes.Thirst} >Thirsty 👅💦</Text>
          </TouchableHighlight>
          <View>
            <Text style={[styles.font20, styles.postsHeader]}>Posts</Text>
            {postsEl}
          </View>
            </ScrollView>
          <View pointerEvents={'none'} style={styles.notificationContainer}>
          <Notification />
        </View>
        </View>
      );
  }
}


function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    users: state.user,
    router: state.routerReducer,
    online: state.online
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...investActions, ...authActions, ...postActions, ...tagActions}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(User)

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