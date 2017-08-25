import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  InteractionManager,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { globalStyles } from '../../styles/global';
// import ScrollableTabView from 'react-native-scrollable-tab-view';
import Post from '../../components/post/post.component';
import ProfileComponent from './profile.component';
import CustomSpinner from '../../components/CustomSpinner.component';
import * as authActions from '../../actions/auth.actions';
import * as postActions from '../../actions/post.actions';
import * as createPostActions from '../../actions/createPost.actions';
import * as tagActions from '../../actions/tag.actions';
import * as userActions from '../../actions/user.actions';
import * as statsActions from '../../actions/stats.actions';
import * as onlineActions from '../../actions/online.actions';
import * as notifActions from '../../actions/notif.actions';
import * as errorActions from '../../actions/error.actions';
import * as messageActions from '../../actions/message.actions';
import * as investActions from '../../actions/invest.actions';
import * as animationActions from '../../actions/animation.actions';
import * as navigationActions from '../../actions/navigation.actions';
import Tabs from '../../components/tabs.component';
import CustomListView from '../../components/customList.component';

let styles;
let localStyles;

class Profile extends Component {
  constructor(props, context) {
    super(props, context);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.load = this.load.bind(this);
    this.loadUser = this.loadUser.bind(this);
    this.changeView = this.changeView.bind(this);
    this.offset = 0;
    this.state = {
      view: 0,
    };
    this.userData = null;
    this.userId = null;
    this.needsReload = new Date().getTime();
    this.tabs = [
      { id: 0, title: 'Posts' },
      { id: 1, title: 'Investments' },
    ];
    this.loaded = false;
    this.scrollTo = this.scrollTo.bind(this);
  }

  componentWillMount() {
    if (this.props.scene) {
      this.userId = this.props.scene.id;
      this.userData = this.props.users[this.userId];

      this.onInteraction = InteractionManager.runAfterInteractions(() => {
        this.loaded = true;
        this.loadUser();
        this.setState({});
      });
      // requestAnimationFrame(() => {
      //   this.loaded = true;
      //   this.setState({});
      // });
    } else {
      this.loaded = true;
      this.userId = this.props.auth.user._id;
      this.userData = this.props.users[this.userId];
      this.myProfile = true;
      this.setState({});
    }
  }

  componentWillReceiveProps(next) {
    this.userData = next.users[this.userId];

    if (this.props.refresh !== next.refresh) {
      this.scrollToTop();
    }
    if (this.props.reload !== next.reload) {
      this.needsReload = new Date().getTime();
      // this.loadUser();
    }
  }

  shouldComponentUpdate(next) {
    let tab = next.tabs.routes[next.tabs.index];
    if (tab.key !== 'myProfile' && !next.scene) return false;
    // console.log('updating profile');
    // for (let p in next) {
    //   if (next[p] !== this.props[p]) {
    //     console.log(p);
    //     for (let pp in next[p]) {
    //       if (next[p][pp] !== this.props[p][pp]) console.log('--> ',pp);
    //     }
    //   }
    // }
    return true;
  }

  componentWillUnmount() {
    if (this.onInteraction) this.onInteraction.cancel();
  }

  loadUser() {
    this.props.actions.getSelectedUser(this.userId);
  }

  load(view, length) {
    // if (!this.loaded) return;
    if (view === undefined) view = this.state.view;
    if (length === undefined) length = 0;

    if (this.state.view === 0) {
      this.props.actions.getUserPosts(
        length,
        5,
        this.userId);
    } else {
      this.props.actions.getInvestments(
        this.props.auth.token,
        this.userId,
        length,
        10);
    }
  }

  renderRow(rowData, view) {
    let scene = this.props.scene || { route: { id: this.userId } };

    let post = this.props.posts.posts[rowData];

    if (view === 0) return (<Post post={post} {...this.props} scene={scene} />);
    if (view === 1) {
      let investment = this.props.investments.investments[rowData];
      post = this.props.posts.posts[investment.post];
      return (<Post post={post} {...this.props} />);
    }
    return null;
  }

  scrollToTop() {
    let view = this.tabs[this.state.view].component.listview;
    if (view) view.scrollTo({ y: 0, animated: true });
  }

  scrollTo(y) {
    let view = this.tabs[this.state.view].component.listview;
    if (view) view.scrollTo({ y, animated: true });
  }

  renderHeader() {
    let header = null;
    if (this.userId && this.userData) {
      header = ([
        <ProfileComponent
          key={0}
          {...this.props}
          myProfile={this.myProfile}
          user={this.userData}
          styles={styles}
          scrollTo={this.scrollTo}
        />,
        <Tabs
          key={1}
          tabs={this.tabs}
          active={this.state.view}
          handleChange={this.changeView}
        />,
        <View key={2} style={{ height: 0 }} />
      ]);
    }
    return header;
  }

  getViewData(props, view) {
    switch (view) {
      case 0:
        return {
          data: this.props.posts.userPosts[this.userId],
          loaded: this.props.posts.loaded.userPosts,
        };
      case 1:
        return {
          data: this.props.investments.userInvestments[this.userId],
          loaded: this.props.investments.loadedProfileInv,
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
    let listEl = <CustomSpinner />;

    // solves logout bug
    if (!this.props.auth.user) return null;

    if (this.userData && this.loaded) {
      listEl = [];
      this.tabs.forEach((tab) => {
        let tabData = this.getViewData(this.props, tab.id);
        let active = this.state.view === tab.id;
        let data = tabData.data || [];
        if (!this.loaded) data = [];
        let loaded = tabData.loaded && this.loaded;
        let postCount = this.userData.postCount !== undefined ? this.userData.postCount : '';
        let Upvotes = this.userData.investmentCount !== undefined ? this.userData.investmentCount : '';

        if (tab.id === 0) {
          tab.title = 'Posts ' + postCount;
          tab.type = 'posts';
        }
        if (tab.id === 1) {
          tab.title = 'Upvotes ' + Upvotes;
          tab.type = 'investments';
        }

        listEl.push(<CustomListView
          ref={(c) => { this.tabs[tab.id].component = c; }}
          key={tab.id}
          data={data}
          parent={'profile'}
          loaded={loaded}
          renderRow={this.renderRow}
          load={this.load}
          view={tab.id}
          stickyHeaderIndices={[1]}
          type={tab.type}
          active={active}
          renderHeader={this.renderHeader}
          needsReload={this.needsReload}
          onReload={this.loadUser}
          error={this.props.error}
          headerData={this.userData}
        />
        );
      });
    }

    return (
      <View style={styles.profileContainer}>
        {listEl}
      </View>
    );
  }
}

Profile.propTypes = {
  actions: React.PropTypes.object,
};

function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    users: state.user.users,
    online: state.online,
    error: state.error.profile,
    view: state.view,
    stats: state.stats,
    investments: state.investments,
    refresh: state.navigation.myProfile.refresh,
    reload: state.navigation.myProfile.reload,
    tabs: state.navigation.tabs,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...statsActions,
      ...authActions,
      ...postActions,
      ...onlineActions,
      ...notifActions,
      ...errorActions,
      ...animationActions,
      ...messageActions,
      ...tagActions,
      ...userActions,
      ...investActions,
      ...createPostActions,
      ...navigationActions,
    }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);

localStyles = StyleSheet.create({
  postsHeader: {
    padding: 10,
  },
  profileContainer: {
    position: 'relative',
    flex: 1,
    flexGrow: 1,
    alignItems: 'stretch',
    backgroundColor: 'white',
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  centering: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
});

styles = { ...localStyles, ...globalStyles };
