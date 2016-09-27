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
    ListView,
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
        postsData: null,
        enabled: true
      }
  }

  componentDidMount() {
    var self = this;
    var user = self.props.users.selectedUser;
    if (user) {
      var notifObj = {
        forUser: user._id,
        byUser: self.props.auth.user._id,
        personal: true,
        type: 'profile'
      }
      self.props.actions.createNotification(self.props.auth.token, notifObj);
      var posts = null;
      if (self.props.posts.userPosts) {
        if (self.props.posts.userPosts[self.props.users.selectedUser._id]) {
          if (self.props.posts.userPosts[self.props.users.selectedUser._id].length) {
            var posts = self.props.posts.userPosts[self.props.users.selectedUser._id];
            var fd = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
            self.setState({postsData: fd.cloneWithRows(posts)});
          } 
        }
      }
      console.log(self)
      if (!posts) {
        console.log('getting posts')
        self.props.actions.getUserPosts(0, 5, self.props.users.selectedUser._id);
      }
    }
  }

  componentWillReceiveProps(next) {
    var self = this;
    // if (next.posts.userPosts != self.props.posts.userPosts) {
    //   console.log('updating userPosts', next.posts.userPosts)
    //   var fd = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    //   self.setState({postsData: fd.cloneWithRows(next.posts.userPosts)});
    // }


    var newPosts = next.posts.userPosts[self.props.users.selectedUser._id];
    var oldPosts = self.props.posts.userPosts[self.props.users.selectedUser._id];

    if (newPosts != oldPosts) {
      var fd = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      self.setState({postsData: fd.cloneWithRows(newPosts)});
    }

  }


  renderFeedRow(rowData) {
    var self = this;
      return (
        <Post post={rowData} {...self.props} styles={styles} />
      );
  }

  onScroll() {
    var self = this;
    if (self.refs.postslist.scrollProperties.offset + self.refs.postslist.scrollProperties.visibleLength >= self.refs.postslist.scrollProperties.contentLength) {
      self.loadMore();
    }
  }

  loadMore() {
    var self = this;
    var length = self.props.posts.userPosts.length;
     console.log('load more, skip: ', length);
    if (self.state.enabled) {
      self.setState({enabled: false});
        self.props.actions.getUserPosts(length, 5, self.props.users.selectedUser._id);
      setTimeout(function() {
        self.setState({enabled: true})
      }, 1000);
    }
  }


  componentWillUnmount() {
    var self = this;
    self.props.actions.setSelectedUser();
    // self.props.actions.clearUserPosts();
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

    if (this.props.users.selectedUser) {
        user = this.props.users.selectedUser;
        if (user.posts) posts = user.posts;
        profileEl = (<ProfileComponent {...self.props} user={user} styles={styles} />);

      if (self.state.postsData) {
        postsEl = (<ListView ref="postslist" renderScrollComponent={props => <ScrollView {...props} />} onScroll={self.onScroll.bind(self)} dataSource={self.state.postsData} renderRow={self.renderFeedRow.bind(self)} />)
      } else {
        postsEl = (<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}><Text style={[{fontWeight: '500'}, styles.darkGray]}>No posts to display</Text></View>)
      }
    }

    return (
      <View style={styles.fullContainer}>
           {profileEl}
          <TouchableHighlight style={styles.thirstyIcon}>
            <Text style={styles.white} onPress={self.goTo.bind(self, 'thirst')} >Thirsty 👅💦</Text>
          </TouchableHighlight>

            {postsEl}

      </View>
    );
  }
}

export default User;

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
    width: 120,
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