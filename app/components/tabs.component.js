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
          { alignItems: 'stretch' }
        ]}
        onPress={() => props.handleChange(tab.id)}
      >
        <View style={{ position: 'relative', alignItems: 'stretch', flex: 1, justifyContent: 'center' }}>
          <Text
            style={[
              styles.darkGray,
              styles.font15,
              active ? styles.active : null,
              { textAlign: 'center' }
            ]}
          >
            {tab.title}
          </Text>
          <View style={{ flex: 1, height: 5, backgroundColor: active ? '#3E3EFF' : 'transparent', position: 'absolute', bottom: 0, right: 0, left: 0 }}></View>
        </View>
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
    borderBottomColor: 'lightgrey',
    borderBottomWidth: StyleSheet.hairlineWidth,
  }
});

styles = { ...globalStyles, ...localStyles };