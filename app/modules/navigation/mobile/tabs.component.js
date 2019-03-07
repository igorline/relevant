import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableHighlight, Animated } from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles, fullWidth } from 'app/styles/global';

let styles;

class HeaderTabs extends Component {
  static propTypes = {
    scrollValue: PropTypes.object,
    tabs: PropTypes.array,
    active: PropTypes.number,
    handleChange: PropTypes.func
  };

  render() {
    const { handleChange, active, tabs, scrollValue } = this.props;
    const tabWidth = fullWidth / tabs.length;

    const tabUnderlineStyle = {
      position: 'absolute',
      width: tabWidth,
      height: 4,
      backgroundColor: '#3E3EFF',
      bottom: 0
    };

    let left;
    if (scrollValue) {
      left = scrollValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, tabWidth]
      });
    } else {
      left = active * tabWidth;
    }

    const tabsEl = tabs.map(tab => {
      const isActive = active === tab.id;
      return (
        <TouchableHighlight
          key={tab.id}
          underlayColor={'white'}
          style={[styles.typeParent, { alignItems: 'stretch' }, styles.inactiveBorder]}
          onPress={() => handleChange(tab.id)}
        >
          <View
            style={{
              position: 'relative',
              alignItems: 'stretch',
              flex: 1,
              justifyContent: 'center'
            }}
          >
            <Text
              style={[
                styles.darkGrey,
                styles.tabFont,
                styles.quarterLetterSpacing,
                styles.font15,
                isActive ? styles.active : null,
                { textAlign: 'center' }
              ]}
            >
              {tab.title}
            </Text>
          </View>
        </TouchableHighlight>
      );
    });

    return (
      <View style={[styles.row, styles.tabsParent, { width: fullWidth }]}>
        {tabsEl}
        <Animated.View style={[tabUnderlineStyle, { left }]} />
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  typeParent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  tabsParent: {
    backgroundColor: 'white',
    height: 50
  },
  inactiveBorder: {
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth
  }
});

styles = { ...globalStyles, ...localStyles };

export default HeaderTabs;
