import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { globalStyles, blue } from '../../styles/global';
import Post from '../post/post.component';
import * as postActions from '../../actions/post.actions';
import * as createPostActions from '../../actions/createPost.actions';
import * as animationActions from '../../actions/animation.actions';
import * as investActions from '../../actions/invest.actions';
import * as authActions from '../../actions/auth.actions';
import * as userActions from '../../actions/user.actions';
import * as tagActions from '../../actions/tag.actions';
import * as navigationActions from '../../actions/navigation.actions';
import CustomListView from '../customList.component';

let styles;

class Read extends Component {
  constructor(props, context) {
    super(props, context);
    this.renderRow = this.renderRow.bind(this);
    this.load = this.load.bind(this);
    this.needsReload = new Date().getTime();
    this.renderHeader = this.renderHeader.bind(this);
    this.tooltipParent = {};
    this.toggleTooltip = this.toggleTooltip.bind(this);
    this.initTooltips = this.initTooltips.bind(this);
    this.tabs = [
      { id: 0, title: 'Feed', type: 'feed' },
    ];
  }

  componentWillMount() {
  }

  componentWillReceiveProps(next) {
    if (this.props.refresh !== next.refresh && this.props.active) {
      this.scrollToTop();
    }
    if (this.props.reload !== next.reload) {
      this.needsReload = new Date().getTime();
    }

    if (this.props.reloadFeed !== next.reloadFeed) {
      this.props.actions.getSubscriptions();
    }

    if (next.posts.feedUnread &&
      next.active && !this.props.active) {
      this.needsReload = new Date().getTime();
    }
  }

  shouldComponentUpdate(next) {
    if (!next.active) return false;
    return true;
  }

  initTooltips() {
    ['subscriptions'].forEach(name => {
      this.props.actions.setTooltipData({
        name,
        toggle: () => this.toggleTooltip(name)
      });
    });
  }

  toggleTooltip(name) {
    if (!this.tooltipParent[name]) return;
    this.tooltipParent[name].measureInWindow((x, y, w, h) => {
      let parent = { x, y, w, h };
      if (x + y + w + h === 0) return;
      this.props.actions.setTooltipData({
        name,
        parent
      });
      this.props.actions.showTooltip(name);
    });
  }

  scrollToTop() {
    let view = this.listview;
    if (view) view.listview.scrollTo({ y: -this.props.offsetY, animated: true });
  }

  load(view, length) {
    const tag = this.props.posts.tag;
    if (!length) length = 0;

    if (length === 0) this.props.actions.getSubscriptions();

    this.props.actions.getFeed(length, tag);
    if (this.props.posts.feedUnread) {
      this.props.actions.markFeedRead();
    }
  }

  renderHeader() {
    let { total, totalUsers } = this.props.subscriptions;
    if (!total) return null;
    setTimeout(this.initTooltips, 0);

    return (
      <View
        style={styles.feedHeader}
        ref={c => this.tooltipParent.subscriptions = c}
      >
        <Text
          onPress={() => this.toggleTooltip('subscriptions')}
          style={[styles.font10, { color: 'white' }]}
        >
          You are subscribed to {total} post{total > 1 ? 's' : ''} from {totalUsers} user{totalUsers > 1 ? 's' : ''}
        </Text>
      </View>
    );
  }

  renderRow(rowData) {
    let post = this.props.posts.posts[rowData];
    return (
      <Post post={post} {...this.props} styles={styles} />
    );
  }

  render() {
    let feedEl = [];
    let filler;
    let { total, totalUsers } = this.props.subscriptions;

    filler = (
      <View>
        <Text
          style={[styles.georgia, styles.darkGrey, styles.emptyText, styles.quarterLetterSpacing]}
        >
          {!total ?
            'You have not subscribed to anyone yet' :
            'You have subscribed to ' + totalUsers + ' user' + (totalUsers > 1 ? 's' : '') + ' — find their future posts here!'}
        </Text>
        <Text
          onPress={() => { this.props.actions.setView('discover', 1); }}
          style={[styles.libre, styles.darkGrey, { fontSize: 40, textAlign: 'center' }]}
        >
          {!total ? '😎\nUpvote posts to subscribe to users' : '😛\nKeep upvoting to subscribe to more users'}
        </Text>
      </View>
    );

    this.tabs.forEach((tab) => {
      let tabData = this.props.posts.feed;
      let loaded = this.props.posts.loaded.feed;

      feedEl.push(
        <CustomListView
          ref={(c) => { this.listview = c; }}
          key={tab.id}
          data={tabData}
          loaded={loaded}
          renderRow={this.renderRow}
          renderHeader={this.renderHeader}
          load={this.load}
          view={tab.id}
          type={'posts'}
          parent={'feed'}
          active={this.props.active}
          YOffset={this.props.offsetY}
          onScroll={this.props.onScroll}
          needsReload={this.needsReload}
          actions={this.props.actions}
          error={this.props.error}
        >
          {filler}
        </CustomListView>
      );
    });

    return (
      <View style={[styles.fullContainer, { backgroundColor: 'hsl(0,0%,100%)' }]}>
        {feedEl}
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  feedHeader: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: blue,
  },
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

styles = { ...localStyles, ...globalStyles };

function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    messages: state.messages,
    refresh: state.navigation.discover.refresh,
    reload: state.navigation.discover.reload,
    reloadFeed: state.navigation.read.reload,
    error: state.error.read,
    tabs: state.navigation.tabs,
    subscriptions: state.subscriptions,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...postActions,
      ...animationActions,
      ...investActions,
      ...userActions,
      ...tagActions,
      ...navigationActions,
      ...authActions,
      ...createPostActions
    }, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Read);
