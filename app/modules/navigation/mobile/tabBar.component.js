import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
  Platform
} from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles, fullWidth, IphoneX } from 'app/styles/global';
import Percent from 'modules/stats/mobile/percent.component';
import { SmallText } from 'modules/styled/uni';
import { colors } from 'styles';

let styles;

let Emoji = Text;
if (Platform.OS === 'android') {
  Emoji = require('react-native-emoji-compat-text').default;
}

TabBar.propTypes = {
  currentTab: PropTypes.object,
  changeTab: PropTypes.func,
  tabs: PropTypes.array
};

export default memo(TabBar);

function TabBar({ tabs, currentTab, changeTab }) {
  return (
    <View style={styles.footer}>
      {tabs.map(t => (
        <Tab key={t.key} tab={t} currentTab={currentTab} changeTab={changeTab} />
      ))}
    </View>
  );
}

Tab.propTypes = {
  tab: PropTypes.object,
  currentTab: PropTypes.object,
  changeTab: PropTypes.func
};

function Tab({ tab, currentTab, changeTab }) {
  const notif = useSelector(state => state.notif);
  const user = useSelector(state => state.auth.user);
  const active = tab.key === currentTab.key;
  const badge = tab.params.title === 'Activity' && notif.count && notif.count;

  const fontAdjust = tab.params.title === 'Wallet' &&
    Platform.OS === 'ios' && { fontSize: 23 };

  const defaultIcon = (
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

  const defaultTitle = (
    <SmallText fs={1.25} c={active ? colors.blue : colors.grey}>
      {tab.params.title}
    </SmallText>
  );

  const profileTab = tab.key === 'myProfile';

  const icon =
    profileTab && user && user.image ? (
      <Image source={{ uri: user.image }} style={[styles.footerImg]} />
    ) : (
      defaultIcon
    );

  const title =
    profileTab && user ? (
      <View>
        <Percent fontSize={10} fontFamily={'Arial'} user={user} />
      </View>
    ) : (
      defaultTitle
    );

  return (
    <View style={{ flex: 1 }} key={tab.key}>
      <TouchableHighlight
        onPress={() => requestAnimationFrame(() => changeTab(tab.key))}
        underlayColor={'transparent'}
        style={[
          styles.footerItem,
          { borderBottomColor: active ? colors.blue : 'transparent' }
        ]}
      >
        <View style={styles.footerItemView}>
          <View style={styles.footerItemInner}>{icon}</View>
          {title}
        </View>
      </TouchableHighlight>
      {badge ? (
        <View pointerEvents={'none'} style={styles.notifCount}>
          <Text style={styles.notifText}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

const localStyles = StyleSheet.create({
  footer: {
    width: fullWidth,
    height: IphoneX ? 83 : 50,
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: 'white',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'black',
    paddingBottom: IphoneX ? 33 : 0
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
  }
});

styles = { ...localStyles, ...globalStyles };
