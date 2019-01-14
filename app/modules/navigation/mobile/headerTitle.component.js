import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity
} from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  darkGrey,
  smallScreen
} from 'app/styles/global';

let styles;

const HeaderTitle = props => {
  const { navigation, auth, navigationOptions } = props;
  const { state } = navigation;
  const { params, routeName } = state;

  let title = params && params.title ? params.title.trim() : null;

  if (state.routeName === 'myProfileView' && auth.user) {
    title = auth.user.name;
  }

  let clipped = title || navigationOptions.title;

  if (title && title.length > 20) {
    clipped = title.substring(0, smallScreen ? 14 : 18);
    clipped += '...';
  }

  if (
    routeName === 'discoverView' ||
    routeName === 'login' ||
    routeName === 'signup' ||
    routeName === 'imageUpload' ||
    routeName === 'twitterSignup'
  ) {
    return (
      <View
        style={{
          alignItems: 'center',
          paddingVertical: 6,
          backgroundColor: 'transparent'
        }}
      >
        <Image
          source={require('app/public/img/logo.png')}
          resizeMode={'contain'}
          style={{ width: 120, height: 20, marginBottom: 2 }}
        />
      </View>
    );
  }

  return (
    <View ref={c => (this.title = c)} style={[styles.titleComponent]}>
      <TouchableOpacity>
        <Text style={[styles.navTitle]}>{clipped}</Text>
      </TouchableOpacity>
    </View>
  );
};

HeaderTitle.propTypes = {
  auth: PropTypes.object,
  navigation: PropTypes.object,
  navigationOptions: PropTypes.object,
};

const localStyles = {
  titleComponent: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  navTitle: {
    fontSize: 22.5,
    fontFamily: 'BebasNeueRelevantRegular',
    fontWeight: 'bold',
    letterSpacing: 0.15,
    marginBottom: -2,
    color: darkGrey,
  },
};

styles = StyleSheet.create({ ...localStyles });

export default connect(
  state => ({ auth: state.auth })
)(HeaderTitle);
