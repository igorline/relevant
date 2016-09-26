'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ListView,
  Dimensions,
  PushNotificationIOS,
  ScrollView,
  AlertIOS
} from 'react-native';

var FileUpload = require('NativeModules').FileUpload;
import { connect } from 'react-redux';
var Button = require('react-native-button');
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as tagActions from '../actions/tag.actions';
import { bindActionCreators } from 'redux';
var ImagePickerManager = require('NativeModules').ImagePickerManager;
import * as utils from '../utils';
import { pickerOptions } from '../utils/pickerOptions';
import * as animationActions from '../actions/animation.actions';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Post from '../components/post.component';
import * as subscriptionActions from '../actions/subscription.actions';
import * as investActions from '../actions/invest.actions';
import Notification from '../components/notification.component';
import ProfileComponent from '../components/profile.component';
import InvestAnimation from '../components/investAnimation.component';

class Profile extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      postsData: null,
      enabled: true
    }
  }

  componentWillMount() {
    var self = this;
    self.props.actions.getUserPosts(0, 5, self.props.auth.user._id);
  }

  componentWillUnmount() {
    var self = this;
    self.props.actions.clearUserPosts();
  }

  componentWillReceiveProps(next) {
    var self = this;
    if (next.posts.userPosts != self.props.posts.userPosts) {
      console.log('updating userPosts', next.posts.userPosts)
      var fd = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      self.setState({postsData: fd.cloneWithRows(next.posts.userPosts)});
    }
  }


  renderFeedRow(rowData) {
    var self = this;
      return (
        <Post post={rowData} {...self.props} styles={styles} />
      );
  }

  onScroll() {
    var self = this;
    if (self.refs.postslist.scrollProperties.offset + self.refs.postslist.scrollProperties.visibleLength >= self.refs.postslist.scrollProperties.contentLength) {
      self.loadMore();
    }
  }

  loadMore() {
    var self = this;
    var length = self.props.posts.userPosts.length;
     console.log('load more, skip: ', length);
    if (self.state.enabled) {
      self.setState({enabled: false});
        self.props.actions.getUserPosts(length, 5, self.props.auth.user._id);
      setTimeout(function() {
        self.setState({enabled: true})
      }, 1000);
    }
  }

  render() {
    var self = this;
    var user = null;
    var userImage = null;
    var name = null;
    var relevance = 0;
    var balance = 0;
    var userImageEl = null;
    var postsEl = null;
    var profileEl = null;

    if (self.props.auth.user) {
      profileEl = (<ProfileComponent {...self.props} user={self.props.auth.user} styles={styles} />);

      if (self.props.posts.userPosts.length && self.state.postsData) {
        postsEl = (<ListView ref="postslist" renderScrollComponent={props => <ScrollView {...props} />} onScroll={self.onScroll.bind(self)} dataSource={self.state.postsData} renderRow={self.renderFeedRow.bind(self)} />)
      } else {
        postsEl = (<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}><Text style={[{fontWeight: '500'}, styles.darkGray]}>No posts to display</Text></View>)
      }
    }

    return (
      <View style={styles.fullContainer}>
      {/*<ScrollView style={styles.fullContainer}>*/}
        {profileEl}
    
          {postsEl}
    
      {/*</ScrollView>*/}
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

