'use strict';
import React, { Component } from 'react';
import {
    AppRegistry,
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
import { bindActionCreators } from 'redux';
import * as utils from '../utils';
import Post from '../components/post.component';
import ProfileComponent from '../components/profile.component';
import Spinner from 'react-native-loading-spinner-overlay';

class User extends Component {
  constructor(props, context) {
      super(props, context)
      this.state = {
        postsData: null,
        enabled: true,
        received: false
      }
  }

  componentDidMount() {
    var self = this;
    var user = self.props.users.selectedUser;
    console.log("SETTING USER")
    if (user) {
      var notifObj = {
        forUser: user._id,
        byUser: self.props.auth.user._id,
        personal: true,
        type: 'profile'
      }
      self.props.actions.createNotification(self.props.auth.token, notifObj);
      var userId = self.props.users.selectedUser._id;
      var posts = null;
      if (self.props.posts.user.length && userId == self.props.posts.currentUser) {
        // if (self.props.posts.userPosts.length) {
          // if (self.props.posts.userPosts[self.props.users.selectedUser._id].length) {
        var posts = self.props.posts.user;
        var fd = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        self.setState({postsData: fd.cloneWithRows(posts), received: true});
          // } 
        // }
      }
      if (!posts) {
        //console.log('getting posts')
        self.props.actions.clearPosts('user');
        self.props.actions.getUserPosts(0, 5, self.props.users.selectedUser._id);
      }
    }
  }

  componentWillReceiveProps(next) {
    var self = this;
    var newPosts = next.posts.user;
    var oldPosts = self.props.posts.user;

    // if (!next.users.selectedUser || next.posts.currentUser != next.users.selectedUser._id) {
      // self.props.actions.clearUserPosts();
      // return;
    // }

    if (newPosts != oldPosts) {
      var fd = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      self.setState({postsData: fd.cloneWithRows(newPosts), received: true});
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
    var length = self.props.posts.user.length;
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

      if (self.state.postsData && self.state.received) {
        postsEl = (<ListView ref="postslist" renderScrollComponent={props => <ScrollView {...props} />} onScroll={self.onScroll.bind(self)} dataSource={self.state.postsData} renderRow={self.renderFeedRow.bind(self)} />)
      }

      if (!self.state.postsData && self.state.received) {
        postsEl = (<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}><Text style={[{fontWeight: '500'}, styles.darkGray]}>No posts to display</Text></View>)
      }
    }

    return (
      <View style={[styles.fullContainer, {backgroundColor: 'white'}]}>
        <Spinner color='rgba(0,0,0,1)' overlayColor='rgba(0,0,0,0)' visible={!self.state.received} />
        {profileEl}
        <TouchableHighlight style={styles.thirstyIcon}>
          <Text style={styles.white} onPress={self.goTo.bind(self, {name: 'thirst'})} >Thirsty 👅💦</Text>
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