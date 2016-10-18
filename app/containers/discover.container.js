import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ListView,
  // InteractionManager,
} from 'react-native';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Spinner from 'react-native-loading-spinner-overlay';
import { globalStyles } from '../styles/global';
import Post from '../components/post.component';
import DiscoverUser from '../components/discoverUser.component';
import DiscoverHeader from '../components/discoverHeader.component';

import * as statsActions from '../actions/stats.actions';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as tagActions from '../actions/tag.actions';
import * as viewActions from '../actions/view.actions';
import * as investActions from '../actions/invest.actions';
import * as animationActions from '../actions/animation.actions';

let styles;

class Discover extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      lastOffset: 0,
      height: null,
      headerHeight: 0,
      layout: false,
      showHeader: true,
    };
    this.onScroll = this.onScroll.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.setPostTop = this.setPostTop.bind(this);
  }

  componentDidMount() {
    // InteractionManager.runAfterInteractions(() => {
    this.offset = 0;
    this.view = this.props.view.discover;
    let ds;

    if (this.props.posts.comments) this.props.actions.setComments(null);

    if (this.props.posts.tag && this.props.posts.index) this.props.actions.clearPosts('index');

    if (this.props.posts.index.length > 0) {
      ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      this.dataSource = ds.cloneWithRows(this.props.posts.index);
    }

    if (this.props.posts.index.length === 0) this.loadMore();

    this.tag = null;
    if (this.props.posts.tag) this.tag = { ...this.props.posts.tag };

    if (this.props.posts.index.length === 0) this.loadMore();

    // });
  }

  componentWillReceiveProps(next) {
    let ds;

    if (next.posts.index !== this.props.posts.index) {
      ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      this.dataSource = ds.cloneWithRows(next.posts.index);
    }

    if (this.tag !== next.posts.tag) {
      this.reload(next.posts.tag);
      this.tag = next.posts.tag;
    }

    if (this.props.view.discover !== next.view.discover) {
      this.view = next.view.discover;
      if (this.view < 3) this.reload();
      else if (!this.props.auth.userIndex) this.props.actions.userIndex();
    }

    // if (self.props.posts.newPostsAvailable != next.posts.newPostsAvailable) {
    //   if (next.posts.newPostsAvailable) console.log('newPostsAvailable');
    // }
  }

  onScroll() {
    const currentOffset = this.listview.scrollProperties.offset;
    let down = null;
    if (currentOffset !== this.offset) {
      down = currentOffset > this.offset;
    }
    if (currentOffset < 50) {
      down = false;
    }
    if (down === true && this.state.showHeader) {
      this.setState({ showHeader: false });
    }
    if (down === false && !this.state.showHeader) {
      this.setState({ showHeader: true });
    }
    this.offset = currentOffset;

    if (this.props.view.discover === 3) return;

    if (currentOffset < -100) {
      this.reload();
    }
    if (currentOffset > 100
      && currentOffset + this.listview.scrollProperties.visibleLength >
        this.listview.scrollProperties.contentLength + 5) {
      this.loadMore();
    }
  }

  setPostTop(height) {
    this.setState({
      headerHeight: height,
    });
  }

  reload(tag) {
    console.log('REALOAD');
    this.props.actions.clearPosts('index');
    this.loadPosts(0, tag);
  }

  loadMore() {
    console.log('LOAD MORE');
    const length = this.props.posts.index.length;
    this.loadPosts(length);
  }

  loadPosts(length, _tag) {
    if (this.props.posts.loading) return;

    const tag = typeof _tag !== 'undefined' ? _tag : this.props.posts.tag;
    switch (this.view) {
      case 1:
        this.props.actions.getPosts(length, tag, null, 5);
        break;

      case 2:
        this.props.actions.getPosts(length, tag, 'rank', 5);
        break;

      default:
        return;
    }
  }

  renderRow(rowData) {
    return (
      <Post post={rowData} {...this.props} styles={styles} />
    );
  }

  render() {
    let usersEl = null;
    const view = this.props.view.discover;
    let postsEl = null;
    let userIndex = null;
    let usersParent = null;

    if (this.dataSource) {
      postsEl = (
        <ListView
          ref={(c) => { this.listview = c; }}
          enableEmptySections
          removeClippedSubviews
          pageSize={1}
          initialListSize={3}
          scrollEventThrottle={16}
          onScroll={this.onScroll}
          dataSource={this.dataSource}
          renderRow={this.renderRow}
          contentContainerStyle={{
            position: 'absolute',
            top: this.state.headerHeight,
          }}
          renderScrollComponent={props => <ScrollView {...props} />}
        />
      );
    }

    if (this.props.auth.userIndex) {
      userIndex = this.props.auth.userIndex;
      usersEl = userIndex.map((user, i) => {
        let dicoverUser = null;
        if (user.name !== 'Admin') {
          dicoverUser = (
            <DiscoverUser
              key={i}
              {...this.props}
              user={user}
              styles={styles}
            />);
        }
        return dicoverUser;
      });
      usersParent = (
        <ScrollView>
          {usersEl}
        </ScrollView>
      );
    }

    return (
      <View style={[styles.fullContainer, { backgroundColor: 'white' }]}>
        <Spinner
          color="rgba(0,0,0,1)"
          overlayColor="rgba(0,0,0,0)"
          visible={!this.dataSource}
        />
        {view !== 3 ? postsEl : null}
        {view === 3 ? usersParent : null}
        <DiscoverHeader
          showHeader={this.state.showHeader}
          posts={this.props.posts}
          view={this.props.view.discover}
          setPostTop={this.setPostTop}
          actions={this.props.actions}
        />
      </View>
    );
  }
}

Discover.propTypes = {
  view: React.PropTypes.Object,
  posts: React.PropTypes.Object,
  actions: React.PropTypes.Object,
  auth: React.PropTypes.Auth,
};

const localStyles = StyleSheet.create({
  padding20: {
    padding: 20,
  },
  listStyle: {
    height: 100,
  },
  listScroll: {
    height: 100,
    borderWidth: 1,
    borderColor: 'red',
  },
  scrollPadding: {
    marginTop: 300,
  },
});

styles = { ...localStyles, ...globalStyles };

function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    router: state.routerReducer,
    animation: state.animation,
    view: state.view,
    stats: state.stats,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      { ...postActions,
        ...animationActions,
        ...viewActions,
        ...tagActions,
        ...investActions,
        ...statsActions,
        ...authActions,
      }, dispatch),
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(Discover);

