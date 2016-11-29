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
    super(props, context);
    this.abbreviateNumber = this.abbreviateNumber.bind(this);
    this.state = {
      followers: null,
      following: null,
    };
  }

  componentDidMount() {
    if (this.props.user) {
      if (this.props.user._id) {
        this.props.actions.getStats(this.props.user._id);
        subscriptionActions.getSubscriptionData('follower', this.props.user._id).then((response) => {
          this.setState({ following: response.data });
        });
        subscriptionActions.getSubscriptionData('following', this.props.user._id).then((response) => {
          this.setState({ followers: response.data });
        });
      }
    }
  }

  abbreviateNumber(num) {
    let fixed = 0;
    if (num === null) { return null; } // terminate early
    if (num === 0) { return '0'; } // terminate early
    if (typeof num !== 'number') num = Number(num);
    fixed = (!fixed || fixed < 0) ? 0 : fixed; // number of decimal places to show
    let b = (num).toPrecision(2).split('e'); // get power
    let k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3); // floor at decimals, ceiling at trillions
    let c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3) ).toFixed(1 + fixed); // divide by power
    let d = c < 0 ? c : Math.abs(c); // enforce -0 is 0
    let e = d + ['', 'K', 'M', 'B', 'T'][k]; // append power
    return e;
  }

  render() {
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
    
    if (this.state.followers) followers = this.state.followers;
    if (this.state.following) following = this.state.following;


    if (this.props.user) {
      user = this.props.user;
      if (user.online) online = true;
      if (user.image) userImage = user.image;
      if (user.relevance) relevance = user.relevance.toFixed(1);
      if (user.balance) balance = user.balance.toFixed(0);
    }

    if (userImage) {
      userImageEl = (<Image source={{ uri: userImage }} style={styles.uploadAvatar} />);
    } else {
      userImageEl = (<Image source={defaultImg} style={styles.uploadAvatar} />);
    }
    if (this.props.stats[this.props.user._id]) {
      if (this.props.stats[this.props.user._id].startAmount) {
        oldRel = this.props.stats[this.props.user._id].startAmount;
      }
      if (relevance > 0) {
        let change = oldRel / relevance;
        percent = Math.round((1 - change) * 100);
      }
    }

    if (percent === 0) {
      relevanceEl = (<Text style={[styles.libre, { fontSize: 23 }]}>📈 Relevance <Text style={[styles.bebas]}>{this.abbreviateNumber(relevance)} <Text style={styles.active}>0%</Text></Text></Text>);
    }
    if (percent > 0) {
      relevanceEl = (<Text>📈<Text style={[styles.libre]}>{this.abbreviateNumber(relevance)} ▲{percent}%</Text></Text>);
    }
    if (percent < 0) {
      relevanceEl = (
        <Text>📈<Text style={styles.active}>{this.abbreviateNumber(relevance)}</Text>
          <Text style={{ color: 'red' }}> ▼{percent}%</Text>
        </Text>
      );
    }


    return (
      <View style={[{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', padding: 10 }]}>
        <View style={{ paddingRight: 10, borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: '#242425'}}>
          {userImageEl}
        </View>
        <View style={{paddingLeft: 10}}>
          {relevanceEl}
          <Text style={[styles.libre, { fontSize: 25 }]}>💵 Worth <Text style={[styles.bebas, { fontSize: 23 }]}>{this.abbreviateNumber(balance)}</Text>
          </Text>

          <View style={styles.onlineRow}>
            <View style={user.online ? styles.onlineCirc : styles.offlineCirc} />
            <Text style={[styles.darkGray, styles.georgia]}>
              {user.online ? 'Online' : 'Offline'}
            </Text>
          </View>
  
          <Text style={[styles.darkGray, styles.georgia]}>
            Followers <Text style={[styles.active, styles.bebas]}>{followers ? followers.length : 0}</Text>
          </Text>
          <Text style={[styles.darkGray, styles.georgia]}>
            Following <Text style={[styles.active, styles.bebas]}>{following ? following.length : 0}</Text>
          </Text>
        </View>
      </View>
    );
  }
}

const localStyles = StyleSheet.create({

});

export default ProfileComponent;

