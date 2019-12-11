import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import Animated from 'react-native-reanimated';
import { NumericalValue } from 'modules/styled/uni';
import { globalStyles, fullWidth } from 'app/styles/global';
import { colors } from 'styles';

let styles;

TabBar.propTypes = {
  position: PropTypes.object,
  navigationState: PropTypes.object,
  setTab: PropTypes.func
};

export default function TabBar({ navigationState, position, setTab }) {
  const inputRange = navigationState.routes.map((x, i) => i);
  const nRoutes = navigationState.routes.length;

  const tabUnderlineStyle = {
    position: 'absolute',
    width: fullWidth / nRoutes,
    height: 4,
    backgroundColor: colors.blue,
    bottom: 0
  };

  function getColor(inactive, active, i) {
    return Animated.round(
      Animated.interpolate(position, {
        inputRange,
        outputRange: inputRange.map(inputIndex => (inputIndex === i ? active : inactive)),
        extrapolate: 'clamp'
      })
    );
  }

  const left = Animated.interpolate(position, {
    inputRange: [0, 1],
    outputRange: [0, fullWidth / nRoutes],
    extrapolate: 'clamp'
  });

  return (
    <View style={styles.tabs}>
      {navigationState.routes.map((route, i) => {
        const color = Animated.color(
          getColor(33, 0, i),
          getColor(33, 0, i),
          getColor(33, 255, i)
        );

        return (
          <TouchableOpacity
            key={route.title}
            activeOpacity={0.6}
            style={styles.tab}
            onPress={() => setTab(i)}
          >
            <NumericalValue>
              <Animated.Text style={[{ color, fontWeight: 'bold' }]}>
                {route.title}
              </Animated.Text>
            </NumericalValue>
          </TouchableOpacity>
        );
      })}
      <Animated.View style={[tabUnderlineStyle, { transform: [{ translateX: left }] }]} />
    </View>
  );
}

const localStyles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabs: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderGrey
  }
});

styles = { ...globalStyles, ...localStyles };
