import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Animated
} from 'react-native';
import { globalStyles, fullWidth } from '../styles/global';

let styles;

class Tabs extends Component {

  render() {
    let props = this.props;
    let tabWidth = fullWidth / props.tabs.length;

    const tabUnderlineStyle = {
      position: 'absolute',
      width: tabWidth,
      height: 4,
      backgroundColor: '#3E3EFF',
      bottom: 0,
    };

    let left;
    // console.log(this.props.scrollValue);
    if (this.props.scrollValue) {
      left = this.props.scrollValue.interpolate({
        inputRange: [0, 1], outputRange: [0, tabWidth],
      });
    } else {
      left = props.active * tabWidth;
    }

    const tabs = props.tabs.map((tab) => {
      let active = props.active === tab.id;
      return (
        <TouchableHighlight
          key={tab.id}
          underlayColor={'white'}
          style={[
            styles.typeParent,
            { alignItems: 'stretch' },
            styles.inactiveBorder,
          ]}
          onPress={() => props.handleChange(tab.id)}
        >
          <View style={{ position: 'relative', alignItems: 'stretch', flex: 1, justifyContent: 'center' }}>
            <Text
              style={[
                styles.darkGray,
                styles.tabFont,
                styles.quarterLetterSpacing,
                styles.font15,
                active ? styles.active : null,
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
        {tabs}
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
    height: 50,
  },
  inactiveBorder: {
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth,
  }
});

styles = { ...globalStyles, ...localStyles };

export default Tabs;
