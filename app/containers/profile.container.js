import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ListView,
  TouchableHighlight,
  ScrollView,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Spinner from 'react-native-loading-spinner-overlay';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
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
      postsData: null,
      investmentsData: null,
      enabled: true,
      userId: null,
      userData: null
    };
  }

  componentWillMount() {
    const self = this;
    let posts = null;
    let userId = null;
    let investments = null;
    let currentUser = null;
    let postsUser = null;
    let investmentsUser = null;

    if (self.props.users.selectedUserId) userId = self.props.users.selectedUserId;
    if (self.props.users.currentUser) currentUser = self.props.users.currentUser;
    if (self.props.investments.index) {
      if (self.props.investments.index.length) investments = self.props.investments.index;
    }
    if (self.props.investments.user) investmentsUser = self.props.investments.user;
    if (self.props.posts.user) {
      if (self.props.posts.user.length) {
        posts = self.props.posts.user;
      }
    }
    if (self.props.posts.currentUser) postsUser = self.props.posts.currentUser;

    if (userId) {
      if (userId !== currentUser) {
        self.props.actions.getSelectedUser(userId);
      } else if (self.state.users.selectedUserData) {
        self.setState({ userId, userData: self.state.users.selectedUserData });
      }
    }

    if (postsUser && userId) {
      if (postsUser === userId && posts) {
        const pd = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        self.setState({ postsData: pd.cloneWithRows(posts)});
      } else {
        self.props.actions.clearPosts('user');
        self.props.actions.getUserPosts(0, 5, userId);
      }
    } else if (userId) {
      self.props.actions.clearPosts('user');
      self.props.actions.getUserPosts(0, 5, userId);
    }

    if (investmentsUser && userId) {
      if (investmentsUser === userId && investments) {
        const ld = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        self.setState({ investmentsData: ld.cloneWithRows(investments)});
      } else {
        self.props.actions.getInvestments(self.props.auth.token, userId, 0, 10);
      }
    } else {
      self.props.actions.getInvestments(self.props.auth.token, userId, 0, 10);
    }
  }

  componentWillReceiveProps(next) {
    const self = this;
    let userId = null;
    if (next.users.selectedUserId) userId = next.users.selectedUserId;

    if (userId !== self.props.users.selectedUserId) {
      self.setState({userData: null, userId: null});
      if (self.state.postsData) {
        self.setState({ postsData: null});
      }
      if (self.state.investmentsData) {
        self.setState({ investmentsData: null });
      }
      if (userId !== next.users.currentUserId) {
        self.props.actions.getSelectedUser(userId);
      }
      if (next.investments.user !== userId) {
        self.props.actions.clearInvestments();
        self.props.actions.getInvestments(self.props.auth.token, userId, 0, 10);
      }
      if (userId !== next.posts.currentUser) {
        self.props.actions.clearPosts('user');
        self.props.actions.getUserPosts(0, 5, userId);
      }
    }

    if (userId === next.users.currentUserId) {
      if (next.users.selectedUserData) {
        if (!self.state.userData || self.state.userData !== next.users.selectedUserData) {
          self.setState({ userId: userId, userData: next.users.selectedUserData });
        }
      }
    }

    let newPosts = next.posts.user;
    let oldPosts = self.props.posts.user;

    let newInvestments = next.investments.index;
    let oldInvestments = self.props.investments.index;

    if (newPosts !== oldPosts && newPosts) {
      let altered = null;
      if (!newPosts.length) {
        altered = [{ fakePost: true }];
      } else {
        altered = newPosts;
      }
      let pd = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      self.setState({ postsData: pd.cloneWithRows(altered)});
    }

    if (newInvestments !== oldInvestments && newInvestments) {
      let altered = null;
      if (!newInvestments.length) {
        altered = [{ fakeInvestment: true }];
      } else {
        altered = newInvestments;
      }
      let id = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      self.setState({ investmentsData: id.cloneWithRows(altered) });
    }
  }

  onScroll() {
    const self = this;
    if (self.listview.scrollProperties.offset + self.listview.scrollProperties.visibleLength >= self.listview.scrollProperties.contentLength) {
      self.loadMore();
    }
  }

  loadMore() {
    const self = this;
    let length = 0;
    let user = null;
    if (self.props.users.selectedUserId) user = self.props.users.selectedUserId;
    if (self.props.view.profile === 1) {
      length = self.props.posts.user.length;
    } else {
      length = self.props.investments.length;
    }

    if (self.state.enabled) {
      self.setState({ enabled: false });

      if (self.props.view.profile === 1) {
        self.props.actions.getUserPosts(length, 5, user);
      } else {
        self.props.actions.getInvestments(self.props.auth.token, user, length, 10);
      }
      setTimeout(() => {
        self.setState({ enabled: true });
      }, 1000);
    }
  }

  changeView(view) {
    this.props.actions.setView('profile', view);
  }

  renderFeedRow(rowData, sectionID, rowID) {
    const self = this;
    if (self.props.view.profile === 1) {
      if (!rowData.fakePost) {
        return (<Post key={rowID} post={rowData} {...self.props} styles={styles} />);
      } else {
        return (<View key={rowID}><Text>No posts babe</Text></View>);
      }
    } else {
      if (!rowData.fakeInvestment) {
        return (<Investment key={rowID} investment={rowData} {...self.props} styles={styles} />);
      } else {
        return (<View><Text>No investments bruh</Text></View>);
      }
    }
  }

  renderHeader() {
    const self = this;
    const view = self.props.view.profile;
    const header = [];
    let userId = self.state.userId;
    let userData = self.state.userData;

    if (self.props.users.selectedUserId) {
      userId = self.props.users.selectedUserId;
      if (self.props.users.selectedUserData) userData = self.props.users.selectedUserData;
    }
    if (userId && userData) {
      header.push(<ProfileComponent key={'header0'} {...self.props} user={userData} styles={styles} />);
      header.push(<View style={[styles.row, { width: fullWidth, backgroundColor: 'white' }]} key={'header1'}>
        <TouchableHighlight underlayColor={'transparent'} style={[styles.typeParent, view === 1 ? styles.activeBorder : null]} onPress={()=> this.changeView(1)}>
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
    var self = this;
    var view = self.props.view.profile;
    var userId = null;
    var userData = null;
    var profileEl = null;
    var postsEl = null;

    if (self.state.userId && self.state.userData) {
      profileEl = (<ProfileComponent {...self.props} user={userData} styles={styles} />);

      if (self.state.postsData && self.state.investmentsData) {
        postsEl = (
          <ListView
            ref={(c) => { this.listview = c; }}
            enableEmptySections
            stickyHeaderIndices={[1]}
            renderScrollComponent={props => <ScrollView {...props} />}
            onScroll={self.onScroll}
            dataSource={view === 1 ? self.state.postsData : self.state.investmentsData}
            renderHeader={self.renderHeader}
            renderRow={self.renderFeedRow}
        />);
      }
    }

    return (
      <View style={[styles.fullContainer, { backgroundColor: 'white' }]}>
        <Spinner color={'rgba(0,0,0,1)'} overlayColor={'rgba(0,0,0,0)'} visible={!self.state.postsData || !self.state.investmentsData || !self.state.userData} />
        {postsEl}
      </View>
    );
  }
}

Profile.propTypes = {
  actions: React.PropTypes.Object,
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
