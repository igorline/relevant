'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableHighlight,
  LinkingIOS,
  Animated
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as subscriptionActions from '../actions/subscription.actions';
import * as notifActions from '../actions/notif.actions';
require('../publicenv');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

class ProfileComponent extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      followers: null,
      following: null,
      online: false
    }
  }

  componentDidUpdate() {
    var self = this;
  }

  componentDidMount() {
    var self = this;
    subscriptionActions.getSubscriptionData('follower', this.props.user._id).then(function(response) {
     self.setState({following: response.data});
   })
   subscriptionActions.getSubscriptionData('following', this.props.user._id).then(function(response) {
    self.setState({followers: response.data});
   });
   self.checkOnline(self.props.online);
  }

  componentWillReceiveProps(next) {
    var self = this;
    self.checkOnline(next.online);
  }


  checkOnline(online) {
    var self = this;
    for (var index in online) {
      if (index == self.props.user._id) {
        self.setState({online: true});
        return;
      }
    }
  }

  render() {
    var self = this;
    var parentStyles = this.props.styles;
    var styles = {...localStyles, ...parentStyles};
    var followers = null;
    var user = null;
    var name = null;
    var userImage = null;
    var relevance = null;
    var balance = null;
    var userImageEl = null;
    var following = null;
    if (self.state.followers) followers = self.state.followers;
    if (self.state.following) following = self.state.following;

    if (this.props.user) {
      user = this.props.user;
      if (user.name) name = user.name;
      if (user.image) userImage = user.image;
      if (user.relevance) relevance = user.relevance.toFixed(2);
      if (user.balance) balance = user.balance.toFixed(2);
    }

    if (userImage) {
      userImageEl = (<Image source={{uri: userImage}} style={styles.uploadAvatar} />)
    }

    return (
        <View style={[styles.row, styles.fullWidthStyle, styles.padding10]}>
          <View>{userImageEl}</View>
          <View style={[styles.insideRow, styles.insidePadding]}>
           <View style={styles.onlineRow}><Text style={styles.darkGray}>{self.state.online ? 'Online' : 'Offline'}</Text><View style={self.state.online ? styles.onlineCirc : styles.offlineCirc}></View></View>
            <Text>📈<Text style={styles.active}>{relevance}</Text></Text>
            <Text>💵<Text style={styles.active}>{balance}</Text></Text>
            <Text style={styles.darkGray}>Followers <Text style={styles.active}>{followers ? followers.length : 0}</Text></Text>
            <Text style={styles.darkGray}>Following <Text style={styles.active}>{following ? following.length : 0}</Text></Text>
          </View>
        </View>
    );
  }
}

const localStyles = StyleSheet.create({

});

export default ProfileComponent;






