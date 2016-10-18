'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  ListView,
  InteractionManager,
} from 'react-native';
import Button from 'react-native-button';
import { bindActionCreators } from 'redux';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Post from '../components/post.component';
import DiscoverUser from '../components/discoverUser.component';
import Spinner from 'react-native-loading-spinner-overlay';
import DiscoverHeader from '../components/discoverHeader.component.js';

class Discover extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      dataSource: null,
      lastOffset: 0,
      height: null,
      headerHeight: 0,
      layout: false,
      showHeader: true
    };
  }

  componentDidMount() {
    // InteractionManager.runAfterInteractions(() => {
      var self = this;
      this.offset = 0;

      this.view = this.props.view.discover;

      if (self.props.posts.comments) this.props.actions.setComments(null);
      if (!self.props.posts.discoverTags.length) this.props.actions.getDiscoverTags();

      if (self.props.posts.tag && self.props.posts.index) self.props.actions.clearPosts('index');

      if (self.props.posts.index.length > 0) {
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        self.setState({dataSource: ds.cloneWithRows(self.props.posts.index)});
      }
      if (self.props.posts.index.length == 0) this.loadMore();

      this.tag = null;
      if (this.props.posts.tag) this.tag = {...this.props.posts.tag}

    // });

  }

  componentWillReceiveProps(next) {
    var self = this;

    if (next.posts.index != self.props.posts.index) {
      var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      self.setState({dataSource: ds.cloneWithRows(next.posts.index)});
    }

    if (this.tag !== next.posts.tag) {
      this.reload(next.posts.tag);
      this.tag = next.posts.tag;
    }

    if (this.props.view.discover != next.view.discover) {
      this.view = next.view.discover;
      if (this.view < 3) this.reload();
      else if (!self.props.auth.userIndex) this.props.actions.userIndex();
    }

    // if (self.props.posts.newPostsAvailable != next.posts.newPostsAvailable) {
    //   if (next.posts.newPostsAvailable) console.log('newPostsAvailable');
    // }
  }

  setPostTop(height) {
    this.setState({
      headerHeight: height
    })
  }

  onScroll(e) {
    var self = this;

    var currentOffset = self.refs.listview.scrollProperties.offset;
    var down = null;
    if (currentOffset != this.offset)
      down = currentOffset > this.offset ? true : false;
    if (self.refs.listview.scrollProperties.offset < 50)
      down = false;
    if (down == true && self.state.showHeader)
      this.setState({showHeader: false})
    if (down == false && !self.state.showHeader)
      this.setState({showHeader: true})
    this.offset = currentOffset;

    if (self.props.view.discover == 3) return;

    if (self.refs.listview.scrollProperties.offset < -100) {
      self.reload();
    }
    if (self.refs.listview.scrollProperties.offset > 100 && self.refs.listview.scrollProperties.offset + self.refs.listview.scrollProperties.visibleLength > self.refs.listview.scrollProperties.contentLength + 5) {
      this.loadMore();
    }
  }

  reload(tag) {
    console.log("REALOAD")
    this.props.actions.clearPosts('index');
    this.loadPosts(0, tag);
  }

  loadMore() {
    console.log("LOAD MORE")
    var length = this.props.posts.index.length;
    this.loadPosts(length);
  }

  loadPosts(length, _tag) {

    if (this.props.posts.loading) return;

    var self = this;
    var tag = typeof _tag != 'undefined' ? _tag : self.props.posts.tag
    switch(this.view) {
      case 1:
         self.props.actions.getPosts(length, tag, null, 5);
        break;

      case 2:
         self.props.actions.getPosts(length, tag, 'rank', 5);
        break;

      default:
        return;
    }
  }

  renderRow(rowData) {
    var self = this;
    return (
      <Post post={rowData} {...self.props} styles={styles} />
    );
  }

  render() {
    var self = this;
    var _scrollView: ScrollView;
    var usersEl = null;
    var view = self.props.view.discover;
    var postsEl = null;
    var posts = null;


    if (self.state.dataSource) {
      postsEl = (
        <ListView ref="listview"
          enableEmptySections={true}
          removeClippedSubviews={true}
          pageSize={1}
          initialListSize={3}
          scrollEventThrottle={16}
          onScroll={self.onScroll.bind(self)}
          dataSource={self.state.dataSource}
          renderRow={self.renderRow.bind(self)}
          contentContainerStyle={{
            position: 'absolute',
            top: self.state.headerHeight
          }}
          renderScrollComponent={props => <ScrollView {...props} />}
        />)
    }

    var userIndex = null;
    var usersParent = null;

    if (this.props.auth.userIndex) {
      userIndex = this.props.auth.userIndex;
      usersEl = userIndex.map(function(user, i) {
        if (user.name != 'Admin')
          return (
            <DiscoverUser
              key={i}
              {...self.props}
              user={user}
              styles={styles}
            />);
      });
      usersParent = (
        <ScrollView>
          {usersEl}
        </ScrollView>
      )
    }

    return (
      <View style={[styles.fullContainer, {backgroundColor: 'white'}]}>
        <Spinner color='rgba(0,0,0,1)' overlayColor='rgba(0,0,0,0)' visible={!self.state.dataSource} />
        {view != 3 ? postsEl : null}
        {view == 3 ? usersParent : null}
        <DiscoverHeader
          showHeader={this.state.showHeader}
          posts = {this.props.posts}
          view = {this.props.view.discover}
          setPostTop = {this.setPostTop.bind(this)}
          actions = {this.props.actions}
          />
      </View>
    );
  }
}

export default Discover

const localStyles = StyleSheet.create({
padding20: {
  padding: 20
},
listStyle: {
  height: 100,
},
listScroll: {
  height: 100,
  borderWidth: 1,
  borderColor: 'red'
},
scrollPadding: {
  marginTop: 300
}
});

var styles = {...localStyles, ...globalStyles};
