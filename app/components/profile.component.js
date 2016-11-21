import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import * as subscriptionActions from '../actions/subscription.actions';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

let defaultImg = require('../assets/images/default_user.jpg');

class ProfileComponent extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      followers: null,
      following: null,
    };
  }

  componentDidMount() {
    const self = this;
    if (self.props.user) {
      console.log(self.props.user, 'user')
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
  }

  componentWillReceiveProps(next) {
    const self = this;
  }

  render() {
    const self = this;
    const parentStyles = this.props.styles;
    const styles = { ...localStyles, ...parentStyles };
    let followers = null;
    let user = null;
    let userImage = null;
    let relevance = null;
    let balance = null;
    let userImageEl = null;
    let following = null;
    let relevanceEl = null;
    let percent = 0;
    let oldRel = null;
    let online = false;
    
    if (self.state.followers) followers = self.state.followers;
    if (self.state.following) following = self.state.following;

    if (this.props.user) {
      user = this.props.user;
      if (user.online) online = true;
      if (user.image) userImage = user.image;
      if (user.relevance) relevance = user.relevance.toFixed(2);
      if (user.balance) balance = user.balance.toFixed(2);
    }

    if (userImage) {
      userImageEl = (<Image source={{ uri: userImage }} style={styles.uploadAvatar} />);
    } else {
      userImageEl = (<Image source={defaultImg} style={styles.uploadAvatar} />);
    }
    if (self.props.stats[self.props.user._id]) {
      if (self.props.stats[self.props.user._id].startAmount) {
        oldRel = self.props.stats[self.props.user._id].startAmount;
      }
      if (relevance > 0) {
        let change = oldRel / relevance;
        percent = Math.round((1 - change) * 100);
      }
    }

    if (percent == 0) {
      relevanceEl = (<Text>📈<Text style={styles.active}>{relevance} 0%</Text></Text>);
    }
    if (percent > 0) {
      relevanceEl = (<Text>📈<Text style={styles.active}>{relevance} ⬆️{percent}%</Text></Text>);
    }
    if (percent < 0) {
      relevanceEl = (<Text>📈<Text style={styles.active}>{relevance}</Text><Text style={{ color: 'red' }}> ⬇️{percent}%</Text></Text>)
    }


    return (
        <View style={[styles.row, styles.fullWidthStyle, styles.padding10]}>
          <View>{userImageEl}</View>
          <View style={[styles.insideRow, styles.insidePadding]}>
           <View style={styles.onlineRow}><Text style={styles.darkGray}>{online ? 'Online' : 'Offline'}</Text><View style={self.state.online ? styles.onlineCirc : styles.offlineCirc}></View></View>
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






