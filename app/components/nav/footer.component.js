import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
  PushNotificationIOS,
  Platform
} from 'react-native';
import PushNotification from 'react-native-push-notification';
import PropTypes from 'prop-types';
import { globalStyles, fullWidth, blue, greyText, IphoneX } from '../../styles/global';
import Percent from '../percent.component';

let styles;

export default class Footer extends Component {
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
    return (<View pointerEvents={'none'} style={styles.notifCount}>
      <Text style={styles.notifText}>
        {count}
      </Text>
    </View>);
  }

  renderTab(tab) {
    let user = this.props.auth.user;
    let currentTab = this.props.navigation.tabs.routes[this.props.navigation.tabs.index];
    let badge;
    let active = tab.key === currentTab.key;
    let activeText;
    if (tab.key === 'activity' && this.props.notif.count) badge = this.props.notif.count;
    if (tab.key === 'discover' && this.props.feedUnread) badge = this.props.feedUnread;

    let fontAdjust;
    if (tab.title === 'Stats' && Platform.OS === 'ios') {
      fontAdjust = { fontSize: 15, lineHeight: 35 };
    }
    let icon = (<Text style={[styles.icon, styles.textCenter, fontAdjust]}>{tab.icon}</Text>);
    let title = (
      <Text style={[styles.footerText, active || activeText ? styles.footerTextActive : null]}>
        {tab.title}
      </Text>
    );
    if (tab.key === 'myProfile') {
      if (user && user.image) {
        icon = (
          <Image
            source={{ uri: this.props.auth.user.image }}
            style={[styles.footerImg]}
          />);
      }
      title = <View><Percent fontSize={10} fontFamily={'Arial'} user={user} /></View>;
      activeText = true;
    }

    return (
      <View style={{ flex: 1 }} key={tab.key}>
        <TouchableHighlight
          onPress={() => this.props.changeTab(tab.key)}
          underlayColor={'transparent'}
          style={[
            styles.footerItem,
            { borderBottomColor: active ? blue : 'transparent' }
          ]}
        >
          <View style={styles.footerItemView}>
            <View style={styles.footerItemInner}>
              {icon}
            </View>
            {title}
          </View>
        </TouchableHighlight>
        {this.renderBadge(badge)}
      </View>
    );
  }

  render() {
    this.totalBadge = 0;
    let tabs = [...this.props.navigation.tabs.routes];
    let footerEl = null;

    footerEl = tabs.map(t => this.renderTab(t));

    return (
      <View style={styles.footer}>{footerEl}</View>
    );
  }
}

Footer.propTypes = {
  changeTab: PropTypes.func,
  auth: PropTypes.object,
  navigation: PropTypes.object,
  notif: PropTypes.object,
  feedUnread: PropTypes.number,
};

const localStyles = StyleSheet.create({
  footer: {
    position: 'absolute',
    width: fullWidth,
    bottom: 0,
    height: IphoneX ? 83 : 50,
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: 'white',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'black',
    paddingBottom: IphoneX ? 33 : 0,
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
    paddingTop: 2,
  },
  footerItemInner: {
    height: 27,
    justifyContent: 'flex-start',
  },
  footerImg: {
    resizeMode: 'cover',
    height: 25,
    width: 25,
    borderRadius: 12.5,
    // marginTop: -2,
  },
  icon: {
    fontSize: 20,
    color: 'black'
  },
  activeIcon: {
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  footerText: {
    paddingTop: 0,
    fontSize: 10,
    // opacity: 0.7,
    color: greyText
  },
  footerTextActive: {
    color: blue,
    opacity: 1,
  }
});

styles = { ...localStyles, ...globalStyles };