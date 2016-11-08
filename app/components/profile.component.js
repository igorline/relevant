'use strict';
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableHighlight,
  LinkingIOS,
  Animated
} from 'react-native';
import * as subscriptionActions from '../actions/subscription.actions';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class ProfileComponent extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      followers: null,
      following: null,
      online: false
    }
  }

  componentDidMount() {
    const self = this;
    if (self.props.user) {
      if (self.props.user._id) {
        self.props.actions.getStats(self.props.user._id);
        subscriptionActions.getSubscriptionData('follower', this.props.user._id).then((response) => {
          self.setState({ following: response.data });
        });
        subscriptionActions.getSubscriptionData('following', this.props.user._id).then((response) => {
          self.setState({ followers: response.data });
        });
      }
    }
    self.checkOnline(self.props.online);
  }

  componentWillReceiveProps(next) {
    const self = this;
    self.checkOnline(next.online);
  }

  checkOnline(online) {
    var self = this;
    if (!self.props.user._id) return;
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
    var relevanceEl = null;
    var change = 0;
    var percent = 0;
    var oldRel = null;
    if (self.state.followers) followers = self.state.followers;
    if (self.state.following) following = self.state.following;

    if (this.props.user) {
      user = this.props.user;
      if (user.name) name = user.name;
      if (user.image) userImage = user.image;
      if (user.relevance) relevance = user.relevance.toFixed(2);
      if (user.balance) balance = user.balance.toFixed(2);
    }

    if (userImage) userImageEl = (<Image source={{ uri: userImage }} style={styles.uploadAvatar} />);
    if (self.props.stats[self.props.user._id]) {
      if (self.props.stats[self.props.user._id].startAmount) oldRel = self.props.stats[self.props.user._id].startAmount;
      if (relevance > 0) {
        let change = oldRel / relevance;
        percent = Math.round((1 - change) * 100);
      }
    }

    if (percent == 0) {
      relevanceEl = (<Text>📈<Text style={styles.active}>{relevance} no change</Text></Text>)
    }
    if (percent > 0) {
      relevanceEl = (<Text>📈<Text style={styles.active}>{relevance} ⬆️{percent}%</Text></Text>)
    }
    if (percent < 0) {
      relevanceEl = (<Text>📈<Text style={styles.active}>{relevance}</Text><Text style={{color: 'red'}}> ⬇️{percent}%</Text></Text>)
    }


    return (
        <View style={[styles.row, styles.fullWidthStyle, styles.padding10]}>
          <View>{userImageEl}</View>
          <View style={[styles.insideRow, styles.insidePadding]}>
           <View style={styles.onlineRow}><Text style={styles.darkGray}>{self.state.online ? 'Online' : 'Offline'}</Text><View style={self.state.online ? styles.onlineCirc : styles.offlineCirc}></View></View>
            {relevanceEl}
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






