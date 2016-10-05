'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ListView,
  Dimensions,
  PushNotificationIOS,
  ScrollView,
  AlertIOS
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as utils from '../utils';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Post from '../components/post.component';
import ProfileComponent from '../components/profile.component';
import Spinner from 'react-native-loading-spinner-overlay';

class Profile extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      postsData: null,
      enabled: true,
      received: false
    }
  }

  componentWillMount() {
    var self = this;
    var posts = null;
    
    if (self.props.posts.userPosts) {
      if (self.props.posts.userPosts[self.props.auth.user._id]) {
        if (self.props.posts.userPosts[self.props.auth.user._id].length) {
          var posts = self.props.posts.userPosts[self.props.auth.user._id];
          var fd = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
          self.setState({postsData: fd.cloneWithRows(posts), received: true});
        } 
      }
    }
    if (!posts) self.props.actions.getUserPosts(0, 5, self.props.auth.user._id);
  }

  componentWillUnmount() {
    var self = this;
  }

  componentWillUpdate(next) {
    var self = this;

    var newPosts = next.posts.userPosts[self.props.auth.user._id];
    var oldPosts = self.props.posts.userPosts[self.props.auth.user._id];

    if (newPosts != oldPosts) {
      var fd = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      self.setState({postsData: fd.cloneWithRows(newPosts), received: true});
    }
  }


  renderFeedRow(rowData) {
    var self = this;
    var key = new Date();
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
    var length = self.props.posts.userPosts[self.props.auth.user._id].length;
     console.log('load more, skip: ', length);
    if (self.state.enabled) {
      self.setState({enabled: false});
        self.props.actions.getUserPosts(length, 5, self.props.auth.user._id);
      setTimeout(function() {
        self.setState({enabled: true})
      }, 1000);
    }
  }

  render() {
    var self = this;
    var user = null;
    var userImage = null;
    var name = null;
    var relevance = 0;
    var balance = 0;
    var userImageEl = null;
    var postsEl = null;
    var profileEl = null;

    if (self.props.auth.user) {
      profileEl = (<ProfileComponent {...self.props} user={self.props.auth.user} styles={styles} />);

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
        {postsEl}
      </View>
    );
  }
}

export default Profile


const localStyles = StyleSheet.create({
  postsHeader: {
    padding: 10
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

