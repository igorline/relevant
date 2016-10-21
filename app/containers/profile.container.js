import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ListView,
  TouchableHighlight,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Spinner from 'react-native-loading-spinner-overlay';
import { globalStyles, fullWidth } from '../styles/global';
import Post from '../components/post.component';
import ProfileComponent from '../components/profile.component';
import Investment from '../components/investment.component';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as tagActions from '../actions/tag.actions';
import * as userActions from '../actions/user.actions';
import * as statsActions from '../actions/stats.actions';
import * as onlineActions from '../actions/online.actions';
import * as notifActions from '../actions/notif.actions';
import * as viewActions from '../actions/view.actions';
import * as messageActions from '../actions/message.actions';
import * as subscriptionActions from '../actions/subscription.actions';
import * as investActions from '../actions/invest.actions';
import * as animationActions from '../actions/animation.actions';

const localStyles = StyleSheet.create({
  postsHeader: {
    padding: 10,
  },
  uploadAvatar: {
    height: 100,
    width: 100,
    resizeMode: 'cover',
  },
  profileContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: 'white',
  },
  insideRow: {
    flex: 1,
  },
  insidePadding: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  pictureWidth: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
});

const styles = { ...localStyles, ...globalStyles };

class Profile extends Component {
  constructor(props, context) {
    super(props, context);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderFeedRow = this.renderFeedRow.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.state = {
      enabled: true,
      userId: null,
      userData: null
    };
    this.postsData = null;
    this.investmentsData = null;
  }

  componentWillMount() {
    let posts = null;
    let userId = null;
    let investments = null;
    let currentUser = null;
    let postsUser = null;
    let investmentsUser = null;

    if (this.props.users.selectedUserId) userId = this.props.users.selectedUserId;
    if (this.props.users.currentUser) currentUser = this.props.users.currentUser;
    if (this.props.investments.index) {
      if (this.props.investments.index.length) investments = this.props.investments.index;
    }
    if (this.props.investments.user) investmentsUser = this.props.investments.user;
    if (this.props.posts.user) {
      if (this.props.posts.user.length) {
        posts = this.props.posts.user;
      }
    }
    if (this.props.posts.currentUser) postsUser = this.props.posts.currentUser;

    if (userId) {
      if (userId !== currentUser) {
        this.props.actions.getSelectedUser(userId);
      } else if (this.props.users.selectedUserData) {
        this.userId = userId;
        this.userData = this.props.users.selectedUserData;
      }
    }

    if (postsUser && userId) {
      if (postsUser === userId && posts) {
        if (posts.length) {
          const pd = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
          this.postsData = pd.cloneWithRows(posts);
        }
      } else {
        this.props.actions.clearPosts('user');
        this.props.actions.getUserPosts(0, 5, userId);
      }
    } else if (userId) {
      this.props.actions.clearPosts('user');
      this.props.actions.getUserPosts(0, 5, userId);
    }

    if (investmentsUser && userId) {
      if (investmentsUser === userId && investments) {
        const ld = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.investmentsData = ld.cloneWithRows(investments);
      } else {
        this.props.actions.getInvestments(this.props.auth.token, userId, 0, 10);
      }
    } else {
      this.props.actions.getInvestments(this.props.auth.token, userId, 0, 10);
    }
  }


  componentWillReceiveProps(next) {
    let userId = null;
    if (next.users.selectedUserId) userId = next.users.selectedUserId;

    if (userId !== this.props.users.selectedUserId) {
      this.userData = null;
      this.userId = null;
      this.postsData = null;
      this.investmentsData = null;

      if (userId !== next.users.currentUserId) {
        this.props.actions.getSelectedUser(userId);
      }
      if (next.investments.user !== userId) {
        this.props.actions.clearInvestments();
        this.props.actions.getInvestments(this.props.auth.token, userId, 0, 10);
      }
      if (userId !== next.posts.currentUser) {
        this.props.actions.clearPosts('user');
        this.props.actions.getUserPosts(0, 5, userId);
      }
    }

    if (userId === next.users.currentUserId) {
      if (next.users.selectedUserData) {
        if (!this.userData || this.userData !== next.users.selectedUserData) {
          this.userId = userId;
          this.userData = next.users.selectedUserData;
        }
      }
    }

    let newPosts = next.posts.user;
    let oldPosts = this.props.posts.user;

    let newInvestments = next.investments.index;
    let oldInvestments = this.props.investments.index;

    if (newPosts !== oldPosts && newPosts) {
      let altered = null;
      if (!newPosts.length) {
        altered = [{ fakePost: true }];
      } else {
        altered = newPosts;
      }
      let pd = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      this.postsData = pd.cloneWithRows(altered);
    }

    if (newInvestments !== oldInvestments && newInvestments) {
      let altered = null;
      if (!newInvestments.length) {
        altered = [{ fakeInvestment: true }];
      } else {
        altered = newInvestments;
      }
      let id = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      this.investmentsData = id.cloneWithRows(altered);
    }
  }

  onScroll() {
    if (this.listview.scrollProperties.offset + this.listview.scrollProperties.visibleLength >= this.listview.scrollProperties.contentLength) {
      this.loadMore();
    }
  }

  loadMore() {
    let length = 0;
    let user = null;
    if (this.props.users.selectedUserId) user = this.props.users.selectedUserId;
    if (this.props.view.profile === 1) {
      length = this.props.posts.user.length;
    } else {
      length = this.props.investments.length;
    }

    if (this.state.enabled) {
      this.setState({ enabled: false });

      if (this.props.view.profile === 1) {
        this.props.actions.getUserPosts(length, 5, user);
      } else {
        this.props.actions.getInvestments(this.props.auth.token, user, length, 10);
      }
      setTimeout(() => {
        this.setState({ enabled: true });
      }, 1000);
    }
  }

  changeView(view) {
    this.props.actions.setView('profile', view);
  }

  renderFeedRow(rowData, sectionID, rowID) {
    if (this.props.view.profile === 1) {
      if (!rowData.fakePost) {
        return (<Post key={rowID} post={rowData} {...this.props} styles={styles} />);
      } else {
        return (<View key={rowID}><Text>No posts babe</Text></View>);
      }
    } else {
      if (!rowData.fakeInvestment) {
        return (<Investment key={rowID} investment={rowData} {...this.props} styles={styles} />);
      } else {
        return (<View><Text>No investments bruh</Text></View>);
      }
    }
  }

  renderHeader() {
    const view = this.props.view.profile;
    const header = [];
    let userId = this.userId;
    let userData = this.userData;

    if (this.props.users.selectedUserId) {
      userId = this.props.users.selectedUserId;
      if (this.props.users.selectedUserData) userData = this.props.users.selectedUserData;
    }
    if (userId && userData) {
      header.push(<ProfileComponent key={'header0'} {...this.props} user={userData} styles={styles} />);
      header.push(<View style={[styles.row, { width: fullWidth, backgroundColor: 'white' }]} key={'header1'}>
        <TouchableHighlight
          underlayColor={'transparent'}
          style={[styles.typeParent, view === 1 ? styles.activeBorder : null]}
          onPress={()=> this.changeView(1)}
        >
          <Text style={[styles.type, styles.darkGray, styles.font15, view === 1 ? styles.active : null]}>Posts</Text>
        </TouchableHighlight>
        <TouchableHighlight underlayColor={'transparent'} style={[styles.typeParent, view === 2 ? styles.activeBorder : null]} onPress={()=> this.changeView(2)}>
          <Text style={[styles.type, styles.darkGray, styles.font15, view === 2 ? styles.active : null]}>Investments</Text>
        </TouchableHighlight>
      </View>);
    }
    return header;
  }

  render() {
    let view = this.props.view.profile;
    let userId = null;
    let userData = null;
    let postsEl = null;
    let spinner = null;

    if (this.userId && this.userData) {
      profileEl = (<ProfileComponent {...this.props} user={userData} styles={styles} />);

      if (this.postsData && this.investmentsData) {
        postsEl = (
          <ListView
            ref={(c) => { this.listview = c; }}
            enableEmptySections
            stickyHeaderIndices={[1]}
            onScroll={this.onScroll}
            dataSource={view === 1 ? this.postsData : this.investmentsData}
            renderHeader={this.renderHeader}
            renderRow={this.renderFeedRow}
        />);
      }
    }

    if (!this.postsData) {
      // spinner = (
      //   <Spinner color={'rgba(0,0,0,1)'} overlayColor={'rgba(0,0,0,0)'} visible/>
      // );
    }

    return (
      <View style={[styles.fullContainer, { backgroundColor: 'white' }]}>
        {spinner}
        {postsEl}
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
    view: state.view,
    stats: state.stats,
    investments: state.investments,
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
