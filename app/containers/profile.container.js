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
import Post from '../components/post.component';
import ProfileComponent from '../components/profile.component';
import ErrorComponent from '../components/error.component';
import Investment from '../components/investment.component';
import CustomSpinner from '../components/CustomSpinner.component';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
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
    this.onScroll = this.onScroll.bind(this);
    this.offset = 0;
    this.state = {
      view: 0,
      offsetHeight: 195,
      headerHeight: 195,
      showHeader: true,
      transY: new Animated.Value(0),
    };
    this.userData = null;
    this.userId = null;
    this.showHeader  = this.showHeader.bind(this);
    this.hideHeader = this.hideHeader.bind(this);
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
      this.userName = this.props.scene.title;
      this.userData = this.props.users.selectedUserData[this.userName];

      InteractionManager.runAfterInteractions(() => {
        if (!this.userData) this.loadUser();
        this.loadContent = true;
        // this.setState({});
      });

    } else {
      this.myProfile = true;
      this.userId = this.props.auth.user._id;
      this.userName = this.props.auth.userName;
      this.userData = this.props.auth.user;
    }
  }

  componentWillReceiveProps(next) {
    if (this.myProfile) {
      this.userData = next.auth.user;
    } else {
      this.userData = next.users.selectedUserData[this.userName];
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
    this.props.actions.getSelectedUser(this.userName);
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
    this.showHeader();
  }

  renderRow(rowData, view) {
    if (view === 0) return (<Post post={rowData} {...this.props} />);
    if (view === 1) return (<Investment investment={rowData} {...this.props} />);
  }

  renderHeader() {
    let header = null;
    if (this.userId && this.userData) {
      header = (<Animated.View
        style={{
          position: 'absolute',
          top: 0,
          backgroundColor:
          'white',
          transform: [{ translateY: this.state.transY }],
          overflow: 'hidden',
        }}
      >
        <ProfileComponent
          {...this.props}
          user={this.userData}
          styles={styles}
        />
        <Tabs
          key={1}
          tabs={this.tabs}
          active={this.state.view}
          handleChange={this.changeView}
        />
      </Animated.View>);
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

  onScroll(event) {
    const currentOffset = event.nativeEvent.contentOffset.y;
    let showHeader = null;
    if (currentOffset !== this.offset) showHeader = currentOffset < this.offset;
    if (currentOffset < 50) showHeader = true;
    if (showHeader !== null && showHeader !== this.state.showHeader) {
      if (showHeader) {
        this.showHeader();
      } else {
        this.hideHeader();
      }
    }
    this.offset = currentOffset;
  }

  showHeader() {
    this.setState({ showHeader: true });
    Animated.timing(
      this.state.transY,
      {
        toValue: 0,
      }
     ).start();
  }

  hideHeader() {
    const moveHeader = -145;
    this.setState({ showHeader: false });
    Animated.timing(
       this.state.transY,
      {
        toValue: moveHeader,
      }
     ).start();
  }

  render() {
    let listEl = [];
    let headerEl = this.renderHeader();

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
          loaded={loaded}
          renderRow={this.renderRow}
          load={this.load}
          onScroll={this.onScroll}
          view={tab.id}
          YOffset={this.state.offsetHeight}
          type={tab.title}
          active={active}
          needsReload={this.needsReload}
        />);
      });
    }

    return (
      <View style={styles.profileContainer}>
        {listEl}
        {headerEl}
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
    flexGrow: 1,
    alignItems: 'stretch'
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
