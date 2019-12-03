import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
  Platform
} from 'react-native';
import PushNotification from 'react-native-push-notification';
import PropTypes from 'prop-types';
import { globalStyles, fullWidth, blue, greyText } from 'app/styles/global';
import Percent from 'modules/stats/mobile/percent.component';
import { SafeAreaView } from 'react-navigation';

let styles;

let Emoji = Text;
if (Platform.OS === 'android') {
  Emoji = require('react-native-emoji-compat-text').default;
}

export default class TabBar extends Component {
  static propTypes = {
    auth: PropTypes.object,
    navigation: PropTypes.object,
    notif: PropTypes.object,
    changeTab: PropTypes.func
  };

  constructor(props, context) {
    super(props, context);
    this.totalBadge = 0;
  }

  renderBadge(count) {
    if (typeof count === 'number') {
      this.totalBadge += count;
    }
    PushNotification.setApplicationIconBadgeNumber(this.totalBadge);

    if (!count) return null;

    return (
      <View pointerEvents={'none'} style={styles.notifCount}>
        <Text style={styles.notifText}>{count}</Text>
      </View>
    );
  }

  renderTab(tab) {
    const { notif, auth, navigation, changeTab } = this.props;
    const { user } = auth;
    const currentTab = navigation.state
      ? navigation.state.routes[navigation.state.index]
      : null;
    let badge;
    const active = tab.key === currentTab.key;
    let activeText;
    if (tab.params.title === 'Activity' && notif.count) badge = notif.count;

    let fontAdjust;
    if (tab.params.title === 'Wallet' && Platform.OS === 'ios') {
      fontAdjust = { fontSize: 23 };
    }

    let icon = (
      <Emoji
        style={[
          styles.icon,
          styles.textCenter,
          fontAdjust,
          active ? styles.footerTextActive : null
        ]}
      >
        {tab.params.icon}
      </Emoji>
    );
    let title = (
      <Text
        style={[styles.footerText, active || activeText ? styles.footerTextActive : null]}
      >
        {tab.params.title}
      </Text>
    );
    if (tab.key === 'myProfile') {
      if (user && user.image) {
        icon = <Image source={{ uri: user.image }} style={[styles.footerImg]} />;
      }
      title = (
        <View>
          <Percent fontSize={10} fontFamily={'Arial'} user={user} />
        </View>
      );
      activeText = true;
    }

    return (
      <View style={{ flex: 1 }} key={tab.key}>
        <TouchableHighlight
          onPress={() => changeTab(tab.key)}
          underlayColor={'transparent'}
          style={[
            styles.footerItem,
            { borderBottomColor: active ? blue : 'transparent' }
          ]}
        >
          <View style={styles.footerItemView}>
            <View style={styles.footerItemInner}>{icon}</View>
            {title}
          </View>
        </TouchableHighlight>
        {this.renderBadge(badge)}
      </View>
    );
  }

  render() {
    const { navigation } = this.props;
    const tabs = [...navigation.state.routes];
    this.totalBadge = 0;

    return (
      <SafeAreaView>
        <View style={styles.footer}>{tabs.map(t => this.renderTab(t))}</View>
      </SafeAreaView>
    );
  }
}

const localStyles = StyleSheet.create({
  footer: {
    width: fullWidth,
    height: 50,
    // height: IphoneX ? 83 : 50,
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: 'white',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'black'
    // paddingBottom: IphoneX ? 33 : 0
  },
  footerItem: {
    flex: 1,
    borderBottomWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  footerItemView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 2
  },
  footerItemInner: {
    height: 27,
    justifyContent: 'flex-start'
  },
  footerImg: {
    resizeMode: 'cover',
    height: 25,
    width: 25,
    borderRadius: 12.5
  },
  icon: {
    fontSize: 20,
    opacity: 1,
    color: 'black',
    width: 25
  },
  activeIcon: {},
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  footerText: {
    paddingTop: 0,
    fontSize: 10,
    color: greyText
  },
  footerTextActive: {
    color: blue,
    opacity: 1
  }
});

styles = { ...localStyles, ...globalStyles };
