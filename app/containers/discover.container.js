import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ListView,
  RefreshControl,
  // InteractionManager,
} from 'react-native';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Spinner from 'react-native-loading-spinner-overlay';
import { globalStyles } from '../styles/global';
import Post from '../components/post.component';
import DiscoverUser from '../components/discoverUser.component';
import DiscoverHeader from '../components/discoverHeader.component';
import * as userActions from '../actions/user.actions';
import * as statsActions from '../actions/stats.actions';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as tagActions from '../actions/tag.actions';
import * as viewActions from '../actions/view.actions';
import * as investActions from '../actions/invest.actions';
import * as animationActions from '../actions/animation.actions';

let styles;
const POST_PAGE_SIZE = 5;
const TYPE_LOOKUP = {
  1: 'new',
  2: 'top',
  3: 'people',
};

class Discover extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      lastOffset: 0,
      height: null,
      headerHeight: 138,
      layout: false,
      showHeader: true,
    };
    this.onScroll = this.onScroll.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.setPostTop = this.setPostTop.bind(this);
    this.reload = this.reload.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.currentScroll = {
      new: 0,
      top: 0,
      people: 0,
    };
  }

  componentDidMount() {
    // InteractionManager.runAfterInteractions(() => {
    this.offset = 0;
    this.view = this.props.view.discover;
    this.type = TYPE_LOOKUP[this.view];
    let ds;

    this.props.actions.getUsers(0, 2, this.props.auth.user._id);

    if (this.props.posts.comments) this.props.actions.setComments(null);

    if (this.props.posts.tag && this.props.posts[this.type]) {
      this.props.actions.clearPosts(this.type);
    }

    if (this.props.posts[this.type]) {
      if (this.props.posts[this.type].length > 0) {
        ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.dataSource = ds.cloneWithRows(this.props.posts[this.type]);
      }
    }
    if (this.props.posts[this.type].length === 0) this.reload();
    this.tag = null;
    if (this.props.posts.tag) this.tag = { ...this.props.posts.tag };
  }

  componentWillReceiveProps(next) {
    let ds;
    // update listview if needed
    if (next.posts[this.type] !== this.props.posts[this.type] && this.type !== 'people') {
      ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      this.dataSource = ds.cloneWithRows(next.posts[this.type]);
    }

    if (next.users.list !== this.props.users.list && this.type === 'people') {
      ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      this.dataSource = ds.cloneWithRows(next.users.list);
    }

    // update tag selection
    if (this.tag !== next.posts.tag && this.type !== 'people') {
      this.dataSource = null;
      this.reload(next.posts.tag);
      this.tag = next.posts.tag;
    }

    // update view
    if (this.props.view.discover !== next.view.discover) {
      this.view = next.view.discover;
      this.type = TYPE_LOOKUP[this.view];
      this.dataSource = null;


      if (this.view !== 3) {
        // option 1 - reload and scroll to top
        ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.dataSource = ds.cloneWithRows(next.posts[this.type]);
        setTimeout(() => this.reload(), 30);
        if (this.listview) this.listview.scrollTo({ y: -this.state.headerHeight, animated: false });


        // option 2 - scrolls to last place but and doesn't reload if there is data
        // if (!next.posts[this.type].length) this.reload();
        // else {
        //   this.offset = this.currentScroll[this.type];
        //   this.listview.scrollTo({ y: this.currentScroll[this.type], animated: false });
        // }
      } else {
        ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.dataSource = ds.cloneWithRows(next.users.list);
      }
    }

    // if (self.props.posts.newPostsAvailable != next.posts.newPostsAvailable) {
    //   if (next.posts.newPostsAvailable) console.log('newPostsAvailable');
    // }
  }

  onScroll() {
    const currentOffset = this.listview.scrollProperties.offset;

    let showHeader = null;
    if (currentOffset !== this.offset) showHeader = currentOffset < this.offset;
    if (currentOffset < 50) showHeader = true;
    if (showHeader != null && showHeader !== this.state.showHeader) {
      this.setState({ showHeader });
    }
    this.offset = currentOffset;

    this.currentScroll[this.type] = currentOffset;
  }

  setPostTop(height) {
    console.log('Setting height', height);
    this.setState({
      headerHeight: height,
    });
  }

  reload(tag) {
    console.log('REALOAD');
    if (this.view == 3) this.props.actions.clearUserList();
    this.loadPosts(0, tag);
  }

  loadMore() {
    console.log('LOAD MORE');
    let length = 0;
    if (this.type !== 'people') {
      length = this.props.posts[this.type].length;
      if (length < POST_PAGE_SIZE) return;
    } else {
      length = this.props.users.list.length;
    }
    this.loadPosts(length);
  }

  loadPosts(length, _tag) {
    if (this.props.posts.loading) return;
    if (this.props.users.loading) return;
    console.log('loading posts');
    const tag = typeof _tag !== 'undefined' ? _tag : this.props.posts.tag;
    switch (this.view) {
      case 1:
        this.props.actions.getPosts(length, tag, null, POST_PAGE_SIZE);
        break;
      case 2:
        this.props.actions.getPosts(length, tag, 'rank', POST_PAGE_SIZE);
        break;
      case 3:
        this.props.actions.getUsers(length, 2, this.props.auth.user._id);
        break;
      default:
        return;
    }
  }

  renderRow(rowData) {
    if (!rowData.role) {
      return (<Post post={rowData} {...this.props} styles={styles} />);
    } else {
      return(<DiscoverUser user={rowData} {...this.props} styles={styles} />);
    }
  }

  render() {
    let usersEl = null;
    const view = this.props.view.discover;
    let postsEl = null;

    if (this.dataSource) {
      postsEl = (
        <ListView
          ref={(c) => { this.listview = c; }}
          enableEmptySections
          removeClippedSubviews
          pageSize={1}
          initialListSize={2}
          scrollEventThrottle={16}
          onScroll={this.onScroll}
          dataSource={this.dataSource}
          renderRow={this.renderRow}
          automaticallyAdjustContentInsets={false}
          contentInset={{ top: this.state.headerHeight }}
          contentOffset={{ y: -this.state.headerHeight }}
          contentContainerStyle={{
            position: 'absolute',
            top: 0,
          }}
          onEndReached={this.loadMore}
          onEndReachedThreshold={100}
          refreshControl={
            <RefreshControl
              refreshing={this.props.posts.loading}
              onRefresh={this.reload}
              tintColor="#000000"
              colors={['#000000', '#000000', '#000000']}
              progressBackgroundColor="#ffffff"
            />
          }
        />
      );
    }

    // if (this.props.auth.userIndex) {
    //   userIndex = this.props.auth.userIndex;
    //   usersEl = userIndex.map((user, i) => {
    //     let dicoverUser = null;
    //     if (user.name !== 'Admin') {
    //       dicoverUser = (
    //         <DiscoverUser
    //           key={i}
    //           {...this.props}
    //           user={user}
    //           styles={styles}
    //         />);
    //     }
    //     return dicoverUser;
    //   });
    //   usersParent = (
    //     <ScrollView>
    //       {usersEl}
    //     </ScrollView>
    //   );
    // }

    return (
      <View style={[styles.fullContainer, { backgroundColor: 'white' }]}>
        <Spinner
          color="rgba(0,0,0,1)"
          overlayColor="rgba(0,0,0,0)"
          visible={!this.dataSource && this.props.view.discover !== 3}
        />
        {postsEl}
        {/*view === 3 ? usersParent : null*/}
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
  view: React.PropTypes.object,
  posts: React.PropTypes.object,
  actions: React.PropTypes.object,
  auth: React.PropTypes.object,
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
    users: state.user,
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
        ...userActions,
        ...statsActions,
        ...authActions,
      }, dispatch),
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(Discover);

