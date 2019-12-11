import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { globalStyles, blue } from 'app/styles/global';
import Post from 'modules/post/mobile/post.component';
import * as postActions from 'modules/post/post.actions';
import * as createPostActions from 'modules/createPost/createPost.actions';
import * as investActions from 'modules/post/invest.actions';
import * as authActions from 'modules/auth/auth.actions';
import * as userActions from 'modules/user/user.actions';
import * as tagActions from 'modules/tag/tag.actions';
import * as navigationActions from 'modules/navigation/navigation.actions';
import CustomListView from 'modules/listview/mobile/customList.component';
import * as animationActions from 'modules/animation/animation.actions';

let styles;

class Read extends Component {
  static propTypes = {
    refresh: PropTypes.object,
    active: PropTypes.object,
    reload: PropTypes.object,
    reloadFeed: PropTypes.object,
    actions: PropTypes.object,
    offsetY: PropTypes.number,
    posts: PropTypes.object,
    subscriptions: PropTypes.object,
    onScroll: PropTypes.func,
    error: PropTypes.string
  };

  constructor(props, context) {
    super(props, context);
    this.renderRow = this.renderRow.bind(this);
    this.load = this.load.bind(this);
    this.needsReload = new Date().getTime();
    this.renderHeader = this.renderHeader.bind(this);
    this.tooltipParent = {};
    this.toggleTooltip = this.toggleTooltip.bind(this);
    this.initTooltips = this.initTooltips.bind(this);
    this.tabs = [{ id: 0, title: 'Feed', type: 'feed' }];
  }

  componentWillMount() {}

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

    if (next.posts.feedUnread && next.active && !this.props.active) {
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
      const parent = { x, y, w, h };
      if (x + y + w + h === 0) return;
      this.props.actions.setTooltipData({
        name,
        parent
      });
      this.props.actions.showTooltip(name);
    });
  }

  scrollToTop() {
    const view = this.listview;
    if (view && view.listview) {
      view.listview.scrollToOffset({ offset: -this.props.offsetY });
    }
  }

  load(view, length) {
    const { tag, actions, posts } = this.props.posts;
    if (!length) length = 0;

    if (length === 0) actions.getSubscriptions();

    actions.getFeed(length, tag);
    if (posts.feedUnread) {
      actions.markFeedRead();
    }
  }

  renderHeader() {
    const { total, totalUsers } = this.props.subscriptions;
    if (!total) return null;
    setTimeout(this.initTooltips, 0);

    return (
      <View style={styles.feedHeader} ref={c => (this.tooltipParent.subscriptions = c)}>
        <Text
          onPress={() => this.toggleTooltip('subscriptions')}
          style={[styles.font10, { color: 'white' }]}
        >
          You are subscribed to {total} post{total > 1 ? 's' : ''} from {totalUsers} user
          {totalUsers > 1 ? 's' : ''}
        </Text>
      </View>
    );
  }

  renderRow(rowData) {
    const post = this.props.posts.posts[rowData];
    return <Post post={post} {...this.props} styles={styles} />;
  }

  render() {
    const { total, totalUsers } = this.props.subscriptions;
    const feedEl = [];

    const filler = (
      <View>
        <Text
          style={[
            styles.georgia,
            styles.darkGrey,
            styles.emptyText,
            styles.quarterLetterSpacing
          ]}
        >
          {!total
            ? 'You have not subscribed to anyone yet'
            : 'You have subscribed to ' +
              totalUsers +
              ' user' +
              (totalUsers > 1 ? 's' : '') +
              ' — find their future posts here!'}
        </Text>
        <Text
          onPress={() => {
            this.props.actions.setScrollTab('discover', 1);
          }}
          style={[styles.libre, styles.darkGrey, { fontSize: 40, textAlign: 'center' }]}
        >
          {!total
            ? '😎\nUpvote posts to subscribe to users'
            : '😛\nKeep upvoting to subscribe to more users'}
        </Text>
      </View>
    );

    this.tabs.forEach(tab => {
      const tabData = this.props.posts.feed;
      const loaded = this.props.posts.loaded.feed;

      feedEl.push(
        <CustomListView
          ref={c => {
            this.listview = c;
          }}
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
    backgroundColor: blue
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
    flexDirection: 'row'
  },
  recentName: {
    color: 'gray'
  },
  readHeader: {
    marginBottom: 10
  }
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
    subscriptions: state.subscriptions
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...postActions,
        ...animationActions,
        ...investActions,
        ...userActions,
        ...tagActions,
        ...navigationActions,
        ...authActions,
        ...createPostActions
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Read);
