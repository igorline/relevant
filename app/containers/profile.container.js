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
    var investments = null;
    
    if (self.props.posts.userPosts && self.props.auth.user) {
      if (self.props.posts.userPosts[self.props.auth.user._id]) {
        if (self.props.posts.userPosts[self.props.auth.user._id].length) {
          posts = self.props.posts.userPosts[self.props.auth.user._id];
          var pd = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
          self.setState({postsData: pd.cloneWithRows(posts), received: true});
        } 
      }
    }

    if (self.props.investments && self.props.auth.user) {
      if (self.props.investments[self.props.auth.user._id]) {
        if (self.props.investments[self.props.auth.user._id].length) {
          investments = self.props.investments[self.props.auth.user._id];
          var ld = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
          self.setState({investmentsData: ld.cloneWithRows(investments)});
        }
      }
    }

    if (!posts && self.props.auth.user) self.props.actions.getUserPosts(0, 5, self.props.auth.user._id);
    if (!investments && self.props.auth.user) self.props.actions.getInvestments(self.props.auth.token, self.props.auth.user._id, 0,10);
  }

  componentWillUnmount() {
    var self = this;
  }

  componentWillUpdate(next) {
    var self = this;
    if (self.props.auth.user) {
      var newPosts = next.posts.userPosts[self.props.auth.user._id];
      var oldPosts = self.props.posts.userPosts[self.props.auth.user._id];

      var newInvestments = next.investments[self.props.auth.user._id];
      var oldInvestments = self.props.investments[self.props.auth.user._id];

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
    var key = new Date();
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
    if (self.props.view.profile == 1) {
      length = self.props.posts.userPosts[self.props.auth.user._id].length;
    } else {
      length = self.props.investments[self.props.auth.user._id].length;
    }
     console.log('load more, skip: ', length);
    if (self.state.enabled) {
      self.setState({enabled: false});

      if (self.props.view.profile == 1) {
        self.props.actions.getUserPosts(length, 5, self.props.auth.user._id);
      } else {
        self.props.actions.getInvestments(self.props.auth.token, self.props.auth.user._id, length,10);
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
    if (self.props.auth.user) {
      header.push(<ProfileComponent key={'header'+0} {...self.props} user={self.props.auth.user} styles={styles} />);
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

  renderSeparator(sectionID: number, rowID: number, adjacentRowHighlighted: bool) {
    // return (
    //   <View
    //     key={`${sectionID}-${rowID}`}
    //     style={{
    //       height: 20,
    //       backgroundColor: '#3B5998',
    //     }}
    //   ><Text>kys</Text></View>
    // );
    return null;
  }

  sectionHeader(sectionHeader, sectionID) {
    var self = this;
    // console.log(sectionHeader, 'sectionHeader');
    // console.log(sectionID, 'sectionID')
    // return (<View style={{height: 20, backgroundColor: 'blue'}}><Text style={{color: 'white', fontSize: 20}}>{sectionID}</Text></View>);
    return null;
  }

  render() {
    var self = this;
    var user = null;
    var userImage = null;
    var view = self.props.view.profile;
    var name = null;
    var relevance = 0;
    var balance = 0;
    var userImageEl = null;
    var postsEl = null;
    var profileEl = null;

    if (self.props.auth.user) {
      profileEl = (<ProfileComponent {...self.props} user={self.props.auth.user} styles={styles} />);

      if (self.state.postsData && self.state.received) {
        postsEl = (<ListView ref="postslist"  stickyHeaderIndices={[1]} renderScrollComponent={props => <ScrollView {...props} />} onScroll={self.onScroll.bind(self)} renderSectionHeader={self.sectionHeader.bind(self)} dataSource={view == 1 ? self.state.postsData : self.state.investmentsData} renderSeparator={self.renderSeparator.bind(self)} renderHeader={self.renderHeader.bind(self)} renderRow={self.renderFeedRow.bind(self)} />)
      }
      if (!self.state.postsData && self.state.received) {
        postsEl = (<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}><Text style={[{fontWeight: '500'}, styles.darkGray]}>No posts to display</Text></View>)
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

