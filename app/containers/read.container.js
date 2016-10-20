import React, { Component } from 'react';
import {
  Text,
  View,
  ScrollView,
  ListView,
  StyleSheet,
  TouchableHighlight,
  InteractionManager
} from 'react-native';
import { bindActionCreators } from 'redux';
import Spinner from 'react-native-loading-spinner-overlay';
import { connect } from 'react-redux';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Post from '../components/post.component';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as tagActions from '../actions/tag.actions';
import * as userActions from '../actions/user.actions';
import * as statsActions from '../actions/stats.actions';
import * as viewActions from '../actions/view.actions';
import * as messageActions from '../actions/message.actions';
import * as subscriptionActions from '../actions/subscription.actions';
import * as investActions from '../actions/invest.actions';
import * as animationActions from '../actions/animation.actions';

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

class Read extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      tag: null,
      enabled: true,
      feedData: null,
    };
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      const self = this;
      if (self.props.posts.feed && self.props.posts.tag) this.props.actions.clearPosts('feed');
      if (self.props.posts.comments) this.props.actions.setComments(null);
      if (self.props.posts.feed) {
        if (self.props.posts.feed.length > 0) {
          let fd = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
          self.setState({ feedData: fd.cloneWithRows(self.props.posts.feed) });
        }
      }
      if (self.props.auth.token) this.props.actions.getFeed(self.props.auth.token, 0, null);
    });
  }

  componentWillReceiveProps(next) {
    const self = this;
    if (next.posts.feed !== self.props.posts.feed) {
      let fd = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      self.setState({ feedData: fd.cloneWithRows(next.posts.feed) });
    }
    if (self.props.posts.newFeedAvailable !== next.posts.newFeedAvailable) {
      if (next.posts.newFeedAvailable) console.log('newFeedAvailable');
    }
  }

  onScroll() {
    const self = this;
    if (self.listview.scrollProperties.offset + self.listview.scrollProperties.visibleLength >=
    self.listview.scrollProperties.contentLength) {
      self.loadMore();
    }
  }

  setTagAndRoute(tag) {
    const self = this;
    self.props.actions.setTag(tag);
    self.props.navigator.resetTo('discover');
  }

  setTag(tag) {
    const self = this;
    self.setState({ tag });
    self.props.actions.clearPosts('feed');
    self.props.actions.getFeed(self.props.auth.token, 0, self.state.tag);
  }

  loadMore() {
    const self = this;
    const length = self.props.posts.feed.length;
    console.log('load more, skip: ', length);
    if (self.state.enabled) {
      self.setState({ enabled: false });
      self.props.actions.getFeed(self.props.auth.token, length, self.state.tag);
      setTimeout(() => {
        self.setState({ enabled: true });
      }, 1000);
    }
  }

  changeView(view) {
    const self = this;
    if (view === 2) self.props.actions.setMessagesCount(0);
    self.props.actions.setView('read', view);
  }

  goTo(view) {
    const self = this;
    self.props.navigator.push(view);
  }

  renderFeedRow(rowData) {
    const self = this;
    return (
      <Post post={rowData} {...self.props} styles={styles} />
    );
  }

  render() {
    const self = this;
    let postsEl = null;
    let messagesCount = null;
    let recentMessages = [];
    let thirstyHeader = null;
    let messages = null;

    if (self.props.messages.index.length > 0) {
      messages = self.props.messages.index;
      for (let x = 0; x < 4; x++) {
        recentMessages.push(<Text key={x} style={styles.recentName}>{x < 3 ? self.props.messages.index[x].from.name+', ' : self.props.messages.index[x].from.name}</Text>);
      }
    }

    if (self.state.feedData && self.props.posts.feed.length) {
      postsEl = (<ListView
        ref={(c) => { this.listview = c; }}
        renderScrollComponent={props => <ScrollView {...props} />}
        onScroll={() => self.onScroll}
        dataSource={self.state.feedData}
        enableEmptySections
        renderRow={() => self.renderFeedRow}
      />);
    }

    if (self.state.feedData && self.props.posts.feed.length === 0) {
      postsEl = (<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={[{ fontWeight: '500' }, styles.darkGray]}>Nothing in yr feed bruh</Text></View>);
    }

    if (self.props.messages.count > 0) {
      messagesCount = (<Text style={[styles.white, styles.messagesCount]}>{self.props.messages.count + ' New'}</Text>);
    }

    thirstyHeader = (<TouchableHighlight underlayColor={'transparent'} onPress={messages ? () => self.goTo({ name: 'messages' }) : null}>
      <View style={[styles.thirstyHeader]}>
        <View style={{ paddingRight: 5 }}>
          <Text>👅💦</Text>
        </View>
        <View>
          <Text style={[{ fontWeight: '500' }, styles.darkGray]}>{messages ? 'Thirsty messages' : 'No messages'}</Text>
          <View style={styles.recentNames}>
            {recentMessages}
          </View>
        </View>
        <View style={{ justifyContent: 'flex-end', flex: 1, flexDirection: 'row' }}>
          {messagesCount}
        </View>
      </View>
    </TouchableHighlight>);

    return (
      <View style={[styles.fullContainer, { backgroundColor: 'white' }]}>
        {thirstyHeader}
        <Spinner color={'rgba(0,0,0,1)'} overlayColor={'rgba(0,0,0,0)'} visible={!self.state.feedData} />
        {postsEl}
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    users: state.user,
    animation: state.animation,
    view: state.view,
    messages: state.messages,
    stats: state.stats,
   };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...statsActions, ...authActions, ...postActions, ...animationActions, ...viewActions, ...messageActions, ...tagActions, ...userActions, ...investActions, ...subscriptionActions}, dispatch)
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(Read);

