import React, { Component } from 'react';
import { StyleSheet, View, InteractionManager } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { globalStyles } from 'app/styles/global';
import Post from 'modules/post/mobile/post.component';
import CustomSpinner from 'modules/ui/mobile/CustomSpinner.component';
import * as authActions from 'modules/auth/auth.actions';
import * as postActions from 'modules/post/post.actions';
import * as createPostActions from 'modules/createPost/createPost.actions';
import * as tagActions from 'modules/tag/tag.actions';
import * as userActions from 'modules/user/user.actions';
import * as statsActions from 'modules/stats/stats.actions';
import * as notifActions from 'modules/activity/activity.actions';
import * as errorActions from 'modules/ui/error.actions';
import * as investActions from 'modules/post/invest.actions';
import * as animationActions from 'modules/animation/animation.actions';
import * as navigationActions from 'modules/navigation/navigation.actions';
import CustomListView from 'modules/listview/mobile/customList.component';
import Tabs from 'modules/navigation/mobile/tabs.component';
import { get } from 'lodash';
import ProfileComponent from './profile.component';

let styles;

class Profile extends Component {
  static propTypes = {
    navigation: PropTypes.object,
    usersState: PropTypes.object,
    auth: PropTypes.object,
    refresh: PropTypes.number,
    reload: PropTypes.number,
    actions: PropTypes.object,
    posts: PropTypes.object,
    investments: PropTypes.object,
    error: PropTypes.bool
  };

  state = {
    user: {},
    handle: null,
    isOwner: false,
    view: 0,
    loaded: false
  };

  constructor(props, context) {
    super(props, context);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.load = this.load.bind(this);
    this.loadUser = this.loadUser.bind(this);
    this.changeView = this.changeView.bind(this);
    this.offset = 0;
    this.needsReload = new Date().getTime();
    // this.tabs = [{ id: 0, title: 'Posts' }, { id: 1, title: 'Upvotes' }];
    this.tabs = [{ id: 0, title: 'Posts' }];

    this.scrollTo = this.scrollTo.bind(this);
  }

  static getDerivedStateFromProps(props) {
    const { auth, navigation, usersState } = props;
    let handle = get(navigation, 'state.params.id');
    if (!handle && auth.user) handle = auth.user.handle;
    const userId = usersState.handleToId[handle];
    const user = usersState.users[userId];
    if (!user) return { handle };
    const isOwner = auth.user && user._id === auth.user._id;
    const loaded = true;
    return { user: isOwner ? auth.user : user, isOwner, handle, loaded };
  }

  componentDidMount() {
    const { handle, isOwner, loaded } = this.state;

    this.onInteraction = InteractionManager.runAfterInteractions(() => {
      this.loadUser();
    });

    if (!isOwner && !loaded) {
      return requestAnimationFrame(() => {
        this.setState({ loaded: true });
      });
    }
    if (handle) return this.props.navigation.setParams({ title: handle });
    return null;
  }

  componentDidUpdate(prev) {
    if (this.props.refresh !== prev.refresh) {
      this.scrollToTop();
    }
    if (this.props.reload !== prev.reload) {
      this.needsReload = new Date().getTime();
    }
  }

  shouldComponentUpdate(next) {
    if (next.auth.community !== this.props.auth.community) return true;
    return next.navigation.isFocused();
  }

  componentWillUnmount() {
    if (this.onInteraction) this.onInteraction.cancel();
  }

  loadUser() {
    this.props.actions.getSelectedUser(this.state.handle);
  }

  load(view, length) {
    const { handle, user } = this.state;
    if (view === undefined) view = this.state.view;
    if (length === undefined) length = 0;

    if (this.state.view === 0) {
      this.props.actions.getUserPosts(length, 5, handle);
    } else {
      this.props.actions.getInvestments(user._id, length, 10);
    }
  }

  renderRow(rowData, view) {
    const { posts, investments } = this.props;
    if (view === 0) {
      const post = posts.posts[rowData];
      if (!post) return null;
      const link = posts.links[post.metaPost];
      return <Post {...this.props} post={post} commentary={[post]} link={link} />;
    }
    if (view === 1) {
      const investment = investments.investments[rowData];
      const post = posts.posts[investment.post];
      if (!post) return null;
      const link = posts.links[post.metaPost];
      return <Post {...this.props} post={post} commentary={[post]} link={link} />;
    }
    return null;
  }

  scrollToTop() {
    const view = this.tabs[this.state.view].component.listview;
    if (view) view.scrollTo({ y: 0, animated: true });
  }

  scrollTo(y) {
    const view = this.tabs[this.state.view].component.listview;
    if (view) view.scrollTo({ y, animated: true });
  }

  renderHeader() {
    const { isOwner, user, view } = this.state;
    let header = null;
    if (user) {
      header = [
        <ProfileComponent
          key={0}
          {...this.props}
          isOwner={isOwner}
          user={user}
          styles={styles}
          scrollTo={this.scrollTo}
        />,
        <Tabs key={1} tabs={this.tabs} active={view} handleChange={this.changeView} />,
        <View key={2} style={{ height: 0 }} />
      ];
    }
    return header;
  }

  getViewData(props, view) {
    const { posts, investments } = this.props;
    const { handle, user } = this.state;
    switch (view) {
      case 0:
        return {
          data: posts.userPosts[handle],
          loaded: this.props.posts.loaded.userPosts
        };
      case 1:
        return {
          data: investments.userInvestments[user._id],
          loaded: investments.loadedProfileInv
        };
      default:
        return null;
    }
  }

  changeView(view) {
    if (view === this.state.view) this.scrollToTop();
    this.setState({ view });
  }

  render() {
    const { error } = this.props;
    const { user, loaded } = this.state;
    let listEl = <CustomSpinner />;

    if (user && loaded) {
      listEl = [];
      this.tabs.forEach(tab => {
        const tabData = this.getViewData(this.props, tab.id);
        const active = this.state.view === tab.id;
        const data = tabData.data || [];
        const postCount = user.postCount !== undefined ? user.postCount : '';
        const Upvotes = user.investmentCount !== undefined ? user.investmentCount : '';

        if (tab.id === 0) {
          tab.title = 'Posts ' + postCount;
          tab.type = 'posts';
        }
        if (tab.id === 1) {
          tab.title = 'Upvotes ' + Upvotes;
          tab.type = 'upvotes';
        }

        listEl.push(
          <CustomListView
            ref={c => {
              this.tabs[tab.id].component = c;
            }}
            key={tab.id}
            data={data}
            parent={'profile'}
            loaded={tabData.loaded}
            renderRow={this.renderRow}
            load={this.load}
            view={tab.id}
            stickyHeaderIndices={[1]}
            type={tab.type}
            active={active}
            renderHeader={this.renderHeader}
            needsReload={this.needsReload}
            onReload={this.loadUser}
            error={error}
            headerData={user}
          />
        );
      });
    }

    return <View style={styles.profileContainer}>{listEl}</View>;
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    usersState: state.user,
    online: state.online,
    error: state.error.profile,
    view: state.view,
    stats: state.stats,
    investments: state.investments,
    refresh: state.navigation.myProfile.refresh,
    reload: state.navigation.myProfile.reload,
    tabs: state.navigation.tabs
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...statsActions,
        ...authActions,
        ...postActions,
        ...notifActions,
        ...errorActions,
        ...animationActions,
        ...tagActions,
        ...userActions,
        ...investActions,
        ...createPostActions,
        ...navigationActions
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Profile);

const localStyles = StyleSheet.create({
  postsHeader: {
    padding: 10
  },
  profileContainer: {
    position: 'relative',
    flex: 1,
    flexGrow: 1,
    alignItems: 'stretch',
    backgroundColor: 'white'
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'nowrap'
  },
  centering: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8
  }
});

styles = { ...localStyles, ...globalStyles };
