'use strict';
import React, { Component } from 'react';

import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ScrollView,
  Linking,
  ListView,
  TouchableHighlight
} from 'react-native';
import { bindActionCreators } from 'redux';
require('../publicenv');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Post from '../components/post.component';
import Spinner from 'react-native-loading-spinner-overlay';

class Read extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      tag: null,
      enabled: true,
      feedData: null,
    }
  }

  componentDidMount() {
    var self = this;
    if (self.props.posts.feed && self.props.posts.tag) this.props.actions.clearPosts();
    if (self.props.posts.comments) this.props.actions.setComments(null);
    if (self.props.posts.feed) {
      if (self.props.posts.feed.length > 0) {
        var fd = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        self.setState({feedData: fd.cloneWithRows(self.props.posts.feed)});
      }
    }
      if (self.props.auth.token) this.props.actions.getFeed(self.props.auth.token, 0, null);
  }

  componentWillReceiveProps(next) {
    var self = this;
    if (next.posts.feed != self.props.posts.feed) {
      var fd = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      self.setState({feedData: fd.cloneWithRows(next.posts.feed)});
    }
    if (self.props.posts.newFeedAvailable != next.posts.newFeedAvailable) {
      if (next.posts.newFeedAvailable) console.log('newFeedAvailable');
    }
  }

  setTag(tag) {
    var self = this;
    self.setState({tag: tag});
    self.props.actions.clearPosts();
    self.props.actions.getFeed(self.props.auth.token, 0, self.state.tag);
  }

  renderFeedRow(rowData) {
    var self = this;
      return (
        <Post post={rowData} {...self.props} styles={styles} />
      );
  }

  setTagAndRoute(tag) {
    var self = this;
    self.props.actions.setTag(tag);
    self.props.navigator.resetTo('discover');
  }

  onScroll() {
    var self = this;
    if (self.refs.feedlist.scrollProperties.offset + self.refs.feedlist.scrollProperties.visibleLength >= self.refs.feedlist.scrollProperties.contentLength) {
      self.loadMore();
    }
  }

  loadMore() {
    var self = this;
    var length = self.props.posts.feed.length;
     console.log('load more, skip: ', length);
    if (self.state.enabled) {
      self.setState({enabled: false});
        self.props.actions.getFeed(self.props.auth.token, length, self.state.tag);
      setTimeout(function() {
        if (self._mounted) self.setState({enabled: true})
      }, 1000);
    }
  }

  changeView(view) {
    var self = this;
    if (view == 2) self.props.actions.setMessagesCount(0);
    self.props.actions.setView('read', view);
  }

  goTo(view) {
    var self = this;
    self.props.navigator.push(view);
  }

  render() {
    var self = this;
    var postsEl = null;
    var posts = null;
    var pages = null;
    var paginationEl = null;
    var tags = [];
    var tagsEl = null;
    var page = self.state.page;
    var taggedPosts = null;
    var messages = null;
    var messagesEl = null;
    var messagesCount = null;
    var recentMessages = [];
    var thirstyHeader = null;

     if (self.props.messages.index.length > 0) {
      messages = self.props.messages.index;
      for (var x = 0; x < 4; x++) {
        recentMessages.push(<Text key={x} style={styles.recentName}>{x < 3 ? self.props.messages.index[x].from.name+', ' : self.props.messages.index[x].from.name}</Text>);
      }
    }

    if (self.state.feedData) {
      postsEl = (<ListView ref="feedlist" renderScrollComponent={props => <ScrollView {...props} />} onScroll={self.onScroll.bind(self)} dataSource={self.state.feedData} renderRow={self.renderFeedRow.bind(self)} />)
    }
    if (self.state.feedData && self.state.feedData.length == 0) {
      postsEl = (<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}><Text style={[{fontWeight: '500'}, styles.darkGray]}>Nothing in yr feed bruh</Text></View>)
    }

    if (self.props.messages.count > 0) {
       messagesCount = (<Text style={[styles.white, styles.messagesCount]}>{self.props.messages.count+' New'}</Text>)
    }

    thirstyHeader = (<TouchableHighlight underlayColor={'transparent'} onPress={messages ? self.goTo.bind(self, {name: 'messages'}) : null}>
      <View style={[styles.thirstyHeader]}>
        <View style={{paddingRight: 5}}>
          <Text>👅💦</Text>
        </View>
        <View>
          <Text style={[{fontWeight: '500'}, styles.darkGray]}>{messages ? 'Thirsty messages' : 'No messages'}</Text>
          <View style={styles.recentNames}>
            {recentMessages}
          </View>
        </View>
        <View style={{justifyContent: 'flex-end',flex: 1, flexDirection: 'row'}}>
          {messagesCount}
        </View>
      </View>
    </TouchableHighlight>);

    return (
      <View style={[styles.fullContainer, {backgroundColor: 'white'}]}>
        {thirstyHeader}
        <Spinner color='rgba(0,0,0,1)' overlayColor='rgba(0,0,0,0)' visible={!self.state.feedData} />
        {postsEl}
      </View>
    );
  }
}

export default Read

const localStyles = StyleSheet.create({
  thirstyHeader: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
    padding: 10,
    flexDirection: 'row'
  },
  messagesCount: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  recentNames: {
    flexDirection: 'row',
  },
  recentName: {
    color: 'gray'
  },
  readHeader: {
    marginBottom: 10
  },
});

var styles = {...localStyles, ...globalStyles};

