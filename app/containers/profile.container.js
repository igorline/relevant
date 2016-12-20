import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  InteractionManager,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { globalStyles } from '../styles/global';
import Post from '../components/post/post.component';
import ProfileComponent from '../components/profile.component';
import ErrorComponent from '../components/error.component';
import Investment from '../components/investment.component';
import CustomSpinner from '../components/CustomSpinner.component';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as createPostActions from '../actions/createPost.actions';
import * as tagActions from '../actions/tag.actions';
import * as userActions from '../actions/user.actions';
import * as statsActions from '../actions/stats.actions';
import * as onlineActions from '../actions/online.actions';
import * as notifActions from '../actions/notif.actions';
import * as errorActions from '../actions/error.actions';
import * as viewActions from '../actions/view.actions';
import * as messageActions from '../actions/message.actions';
import * as subscriptionActions from '../actions/subscription.actions';
import * as investActions from '../actions/invest.actions';
import * as animationActions from '../actions/animation.actions';
import Tabs from '../components/tabs.component';
import CustomListView from '../components/customList.component';
import EmptyList from '../components/emptyList.component';

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
  }

  componentWillMount() {
    if (this.props.scene) {
      this.myProfile = false;
      this.userId = this.props.scene.id;
      this.userData = this.props.users.selectedUserData[this.userId];

      InteractionManager.runAfterInteractions(() => {
        if (!this.userData) this.loadUser();
        this.loadContent = true;
      });
    } else {
      this.myProfile = true;
      this.userId = this.props.auth.user._id;
      this.userData = this.props.auth.user;
    }
  }

  componentWillReceiveProps(next) {
    if (this.myProfile) {
      this.userData = next.auth.user;
    } else {
      this.userData = next.users.selectedUserData[this.userId];
    }
    if (this.props.refresh !== next.refresh) {
      this.scrollToTop();
    }
    if (this.props.reload !== next.reload) {
      this.needsReload = new Date().getTime();
    }
  }

  scrollToTop() {
    let view = this.tabs[this.state.view].component.listview;
    if (view) view.scrollTo({ y: 0, animated: true });
  }

  loadUser() {
    this.props.actions.getSelectedUser(this.userId);
  }

  load(view, length) {
    if (view === undefined) view === this.state.view;
    if (length === undefined) length = 0;

    if (length === 0) this.loadUser();

    if (this.state.view === 0) {
      this.props.actions.getUserPosts(
        length,
        5,
        this.userData._id);
    } else {
      this.props.actions.getInvestments(
        this.props.auth.token,
        this.userData._id,
        length,
        10);
    }
  }

  changeView(view) {
    if (view === this.state.view) this.scrollToTop();
    this.setState({ view });
  }

  renderRow(rowData, view) {
    // console.log('renderRow profile', rowData)
    if (view === 0) return (<Post post={rowData} {...this.props} />);
    if (view === 1) return (<Investment investment={rowData} {...this.props} />);
  }

  renderHeader() {
    let header = null;
    if (this.userId && this.userData) {
      header = ([
        <ProfileComponent
          key={0}
          {...this.props}
          user={this.userData}
          styles={styles}
        />,
        <Tabs
          key={1}
          tabs={this.tabs}
          active={this.state.view}
          handleChange={this.changeView}
        />
      ]);
    }
    return header;
  }

  getViewData(props, view) {
    switch (view) {
      case 0:
        return {
          data: this.props.posts.userPosts[this.userData._id],
          loaded: this.props.posts.loaded.userPosts,
        };
      case 1:
        return {
          data: this.props.investments.userInvestments[this.userData._id],
          loaded: this.props.investments.loaded,
        };
      default:
        return null;
    }
  }

  render() {
    let listEl = [];

    if (this.userData) {
      this.tabs.forEach((tab) => {
        let tabData = this.getViewData(this.props, tab.id);
        let active = this.state.view === tab.id;
        let data = tabData.data || [];
        let loaded = tabData.loaded || false;

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
          type={tab.title}
          active={active}
          renderHeader={this.renderHeader}
          needsReload={this.needsReload}
        />
        );
      });
    }

    return (
      <View style={styles.profileContainer}>
        {listEl}
        <ErrorComponent parent={'profile'} reloadFunction={this.loadUser} />
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
    users: state.user,
    online: state.online,
    error: state.error,
    view: state.view,
    stats: state.stats,
    investments: state.investments,
    refresh: state.navigation.myProfile.refresh,
    reload: state.navigation.myProfile.reload
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
      ...viewActions,
      ...messageActions,
      ...tagActions,
      ...userActions,
      ...investActions,
      ...subscriptionActions,
      ...createPostActions
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
    backgroundColor: 'white',
    flex: 1,
    // flexGrow: 1,
    // alignItems: 'stretch'
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
