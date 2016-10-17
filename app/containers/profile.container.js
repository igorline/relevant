'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ListView,
  Dimensions,
  PushNotificationIOS,
  TouchableHighlight,
  ScrollView,
  AlertIOS
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as utils from '../utils';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Post from '../components/post.component';
import ProfileComponent from '../components/profile.component';
import Investment from '../components/investment.component';
import Spinner from 'react-native-loading-spinner-overlay';

class Profile extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      postsData: null,
      investmentsData: null,
      enabled: true,
      received: false
    }
  }

  componentWillMount() {
    var self = this;
    var posts = null;
    var user = null;
    if (self.props.users.selectedUserId) {
      user = self.props.users.selectedUserId;
      self.props.actions.getSelectedUser(user);
    } else {
      user = self.props.auth.user._id;
    }

    var investments = null;

    if (self.props.posts.user.length &&
        user &&
        user == self.props.posts.currentUser) {

      var posts = self.props.posts.user;
      var fd = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      self.setState({postsData: fd.cloneWithRows(posts), received: true});
    }

    if (!posts && user) {
      self.props.actions.clearPosts('user');
      self.props.actions.getUserPosts(0, 5, user);
    }

    if (self.props.investments && user) {
      if (self.props.investments[user]) {
        if (self.props.investments[user].length) {
          investments = self.props.investments[user];
          var ld = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
          self.setState({investmentsData: ld.cloneWithRows(investments)});
        }
      }
    }
    if (!investments && user) self.props.actions.getInvestments(self.props.auth.token, user, 0,10);
  }

  componentWillUnmount() {
    var self = this;
    self.props.actions.clearSelectedUser();
  }

  componentWillUpdate(next) {
    var self = this;
    var user = null;
    if (self.props.users.selectedUserId) {
      user = self.props.users.selectedUserId;
    } else {
      user = self.props.auth.user._id;
    }

    if (!user) return;
    if (next.posts.currentUser != user) return;
    if (user) {
      var newPosts = next.posts.user;
      var oldPosts = self.props.posts.user;

      var newInvestments = next.investments[user];
      var oldInvestments = self.props.investments[user];

      if (newPosts != oldPosts) {
        var pd = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        self.setState({postsData: pd.cloneWithRows(newPosts), received: true});
      }
      if (newInvestments != oldInvestments) {
        var id = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        self.setState({investmentsData: id.cloneWithRows(newInvestments)});
      }
    }
  }

  renderFeedRow(rowData, sectionID, rowID, highlightRow) {
    var self = this;
    if (self.props.view.profile == 1) {
      return (<Post key={rowID} post={rowData} {...self.props} styles={styles} />);
    } else {
      return (<Investment key={rowID} investment={rowData} {...self.props} styles={styles} />);
    }
  }

  onScroll() {
    var self = this;
    if (self.refs.postslist.scrollProperties.offset + self.refs.postslist.scrollProperties.visibleLength >= self.refs.postslist.scrollProperties.contentLength) {
      self.loadMore();
    }
  }

  loadMore() {
    var self = this;
    var length = 0;
    var user = null;
    if (self.props.users.selectedUserId) {
      user = self.props.users.selectedUserId;
    } else {
      user = self.props.auth.user._id;
    }

    if (self.props.view.profile == 1) {
      length = self.props.posts.user.length;
    } else {
      length = self.props.investments[user].length;
    }

    console.log('load more, skip: ', length);
    if (self.state.enabled) {
      self.setState({enabled: false});

      if (self.props.view.profile == 1) {
        self.props.actions.getUserPosts(length, 5, user);
      } else {
        self.props.actions.getInvestments(self.props.auth.token, user, length,10);
      }
      setTimeout(function() {
        self.setState({enabled: true})
      }, 1000);
    }
  }

  changeView(view) {
    var self = this;
    self.props.actions.setView('profile', view);
  }

  renderHeader() {
    var self = this;
    var view = self.props.view.profile;
    var header = [];
    var userId = null;
    var userData = null;
    if (self.props.users.selectedUserId) {
      userId = self.props.users.selectedUserId;
      if(self.props.users.selectedUserData) userData = self.props.users.selectedUserData;
    } else {
      userId = self.props.auth.user._id;
      userData = self.props.auth.user;
    }
    if (userId && userData) {
      header.push(<ProfileComponent key={'header'+0} {...self.props} user={userData} styles={styles} />);
      header.push(<View style={[styles.row, {width: fullWidth, backgroundColor: 'white'}]} key={'header'+1}>
        <TouchableHighlight  underlayColor={'transparent'} style={[styles.typeParent, view == 1 ? styles.activeBorder : null]} onPress={self.changeView.bind(self, 1)}>
          <Text style={[styles.type, styles.darkGray, styles.font15, view == 1 ? styles.active : null]}>Posts</Text>
        </TouchableHighlight>
        <TouchableHighlight  underlayColor={'transparent'} style={[styles.typeParent, view == 2 ? styles.activeBorder : null]} onPress={self.changeView.bind(self, 2)}>
          <Text style={[styles.type, styles.darkGray, styles.font15, view == 2 ? styles.active : null]}>Investments</Text>
        </TouchableHighlight>
      </View>);
    }
    return header;
  }

  render() {
    var self = this;
    var userImage = null;
    var view = self.props.view.profile;
    var name = null;
    var relevance = 0;
    var balance = 0;
    var userImageEl = null;
    var postsEl = null;
    var profileEl = null;
    var userId = null;
    var userData = null;
    var checkLength = false;
    if (self.props.posts) {
      if (self.props.posts.user) {
        if (self.props.posts.user.length) checkLength = true;
      }
    }
    if (self.props.users.selectedUserId) {
      userId = self.props.users.selectedUserId;
      if(self.props.users.selectedUserData) userData = self.props.users.selectedUserData;
    } else {
      userId = self.props.auth.user._id;
      userData = self.props.auth.user;
    }

    if (userId && userData) {
      profileEl = (<ProfileComponent {...self.props} user={userData} styles={styles} />);

      if (self.state.postsData && self.state.received ) {
        postsEl = (
          <ListView
            ref="postslist"
            enableEmptySections={true}
            stickyHeaderIndices={[1]}
            renderScrollComponent={props => <ScrollView {...props} />}
            onScroll={self.onScroll.bind(self)}
            dataSource={view == 1 ? self.state.postsData : self.state.investmentsData}
            renderHeader={self.renderHeader.bind(self)}
            renderRow={self.renderFeedRow.bind(self)}
          />)
      }
    }

    return (
      <View style={[styles.fullContainer, {backgroundColor: 'white'}]}>
      <Spinner color='rgba(0,0,0,1)' overlayColor='rgba(0,0,0,0)' visible={!self.state.received} />
        {postsEl}
      </View>
    );
  }
}

export default Profile


const localStyles = StyleSheet.create({
  postsHeader: {
    padding: 10
  },
  uploadAvatar: {
    height: 100,
    width: 100,
    resizeMode: 'cover'
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
    paddingRight: 10
  },
  pictureWidth: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'nowrap'
  },
});

var styles = {...localStyles, ...globalStyles};

