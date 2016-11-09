import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
} from 'react-native';
import { globalStyles, fullWidth } from '../styles/global';

let styles;

export default function (props) {
  const tabs = props.tabs.map((tab) => {
    let active = props.active === tab.id;
    return (
      <TouchableHighlight
        key={tab.id}
        underlayColor={'white'}
        style={[
          styles.typeParent,
          active ? styles.activeBorder : styles.inactiveBorder
        ]}
        onPress={() => props.handleChange(tab.id)}
      >
        <Text
          style={[
            styles.type,
            styles.darkGray,
            styles.font15,
            active ? styles.active : null,
          ]}
        >
          {tab.title}
        </Text>
      </TouchableHighlight>
    );
  });

  return (
    <View style={[styles.row, styles.tabsParent, { width: fullWidth }]}>
      {tabs}
    </View>
  );
}

const localStyles = StyleSheet.create({
  tabsParent: {
    backgroundColor: 'white',
  },
  inactiveBorder: {
    borderBottomColor: 'lightgrey',
    borderBottomWidth: StyleSheet.hairlineWidth,
  }
});

styles = { ...globalStyles, ...localStyles };