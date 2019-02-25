import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/Ionicons';
import { toggleTopics } from 'modules/navigation/navigation.actions';

import { darkGrey, mainPadding, colors } from 'app/styles/global';

let styles;

const HeaderLeft = props => {
  const { navigation, screenProps } = props;
  const parent = navigation.dangerouslyGetParent() || navigation;

  const { index } = parent.state;

  const { state } = navigation;
  const params = state.params || {};

  let back;
  let backEl;

  let goBack = () => {
    // Go back on next tick because button ripple effect needs to happen on Android
    requestAnimationFrame(() => {
      navigation.goBack(navigation.state.key);
    });
  };

  if (state.routeName === 'createPostUrl' || state.routeName === 'shareAuth') {
    if (params.share) {
      goBack = () => screenProps.close();
    } else goBack = () => navigation.navigate('main');
  }

  if (index > 0 || params.left) {
    back = <Icon name="ios-arrow-back" size={28} color={darkGrey} />;

    if (params.left) {
      back = <Text style={[{ fontSize: 17 }, styles.active]}>{params.left}</Text>;
    }

    backEl = (
      <TouchableOpacity
        onPress={goBack}
        style={{ justifyContent: 'center', padding: 0, paddingHorizontal: 10 }}
      >
        {back}
      </TouchableOpacity>
    );
  }

  const options = (
    <TouchableOpacity
      onPress={() => navigation.openDrawer()}
      style={{ padding: 0, paddingHorizontal: 10 }}
    >
      <Icon name="ios-options" size={23} style={{ height: 26 }} color={darkGrey} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.leftButton, { flexDirection: 'row' }]}>{backEl || options}</View>
  );
};

HeaderLeft.propTypes = {
  navigation: PropTypes.object,
  screenProps: PropTypes.object
};

const localStyles = {
  leftButton: {
    flex: 1,
    marginLeft: mainPadding - 10,
    justifyContent: 'flex-start',
    alignItems: 'center'
  }
};

styles = StyleSheet.create({ ...localStyles, ...colors });

export default connect(
  () => ({}),
  dispatch => ({ actions: bindActionCreators({ toggleTopics }, dispatch) })
)(HeaderLeft);
