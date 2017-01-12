import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
// import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Percent from '../components/percent.component';
import { numbers } from '../utils';

let defaultImg = require('../assets/images/default_user.jpg');
let localStyles;

class ProfileComponent extends Component {

  render() {
    const parentStyles = this.props.styles;
    const styles = { ...localStyles, ...parentStyles };
    let followers = 0;
    let user = null;
    let userImage = null;
    let relevance = 0;
    let balance = null;
    let userImageEl = null;
    let following = 0;
    let relevanceEl = null;

    if (this.props.user) {
      user = this.props.user;
      followers = this.props.user.followers;
      following = this.props.user.following;
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

    relevanceEl = (<Text allowFontScaling={false} style={[styles.libre, { fontSize: 19 }]}>
      📈 Relevance:
      <Text style={styles.bebas}>
        &nbsp;{numbers.abbreviateNumber(relevance)}&nbsp;•
        <Percent user={user} />
      </Text>
    </Text>);

    return (
      <View
        style={[{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          padding: 10,
          backgroundColor: 'white',
        }]}
      >
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

          <Text allowFontScaling={false} style={[styles.libre, { fontSize: 19 }]}>
            💵 Worth: <Text style={[styles.bebas, { fontSize: 19 }]}>
              {numbers.abbreviateNumber(balance)}
            </Text>

          </Text>

          <Text style={[styles.darkGray, styles.georgia]}>
            Followers: <Text style={[styles.active, styles.bebas]}>{followers}</Text>
          </Text>
          <Text style={[styles.darkGray, styles.georgia]}>
            Following: <Text style={[styles.active, styles.bebas]}>{following}</Text>
          </Text>

          <View style={styles.onlineRow}>
            <View style={user.online ? styles.onlineCirc : styles.offlineCirc} />
            <Text style={[styles.darkGray, styles.georgia]}>
              {user.online ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

localStyles = StyleSheet.create({

});

export default ProfileComponent;
