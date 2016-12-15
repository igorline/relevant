import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import * as subscriptionActions from '../actions/subscription.actions';
import * as utils from '../utils';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import EmptyList from '../components/emptyList.component';

let defaultImg = require('../assets/images/default_user.jpg');
let localStyles;

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
        // this.props.actions.getStats(this.props.user._id);
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
    if (num === null) { return null; }
    if (num === 0) { return '0'; }
    if (typeof num !== 'number') num = Number(num);
    fixed = (!fixed || fixed < 0) ? 0 : fixed;
    let b = (num).toPrecision(2).split('e');
    let k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3);
    let c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3)).toFixed(1 + fixed);
    let d = c < 0 ? c : Math.abs(c);
    let e = d + ['', 'K', 'M', 'B', 'T'][k];
    return e;
  }

  render() {
    const parentStyles = this.props.styles;
    const styles = { ...localStyles, ...parentStyles };
    let followers = null;
    let user = null;
    let userImage = null;
    let relevance = 0;
    let balance = null;
    let userImageEl = null;
    let following = null;
    let relevanceEl = null;
    let percent = 0;

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

    percent = utils.percent.percentChange(user);

    if (percent === 0) {
      relevanceEl = (<Text style={[styles.libre, { fontSize: 23 }]}>
        📈 Relevance
        <Text style={[styles.bebas]}>
          &nbsp;{this.abbreviateNumber(relevance)} 0%
        </Text>
      </Text>);
    }
    if (percent > 0) {
      relevanceEl = (<Text style={[styles.libre, { fontSize: 23 }]}>
        📈 Relevance
        <Text style={{ fontFamily: 'Bebas Neue' }}>
          &nbsp;{this.abbreviateNumber(relevance)}
          <Text style={{ color: '#196950' }}>
            ▲{this.abbreviateNumber(percent)}%
          </Text>
        </Text>
      </Text>);
    }
    if (percent < 0) {
      relevanceEl = (<Text style={[styles.libre, { fontSize: 23 }]}>
        📈 Relevance
        <Text style={{ fontFamily: 'Bebas Neue' }}>
          &nbsp;{this.abbreviateNumber(relevance)}
          <Text style={{ color: 'red' }}>
            ▼{this.abbreviateNumber(percent)}%
          </Text>
        </Text>
      </Text>);
    }

    return (
      <View style={[{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', padding: 10 }]}>

        <View
          style={{
            paddingRight: 10,
            borderRightWidth:
            StyleSheet.hairlineWidth,
            borderRightColor: '#242425'
          }}
        >
          {userImageEl}
        </View>

        <View style={{ paddingLeft: 10 }}>
          {relevanceEl}

          <Text style={[styles.libre, { fontSize: 25 }]}>
            💵 Worth <Text style={[styles.bebas, { fontSize: 23 }]}>
              {this.abbreviateNumber(balance)}
            </Text>

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

localStyles = StyleSheet.create({

});

export default ProfileComponent;

