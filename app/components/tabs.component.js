import React from 'react';
import {
  Text,
  View,
  TouchableHighlight,
} from 'react-native';
import { globalStyles, fullWidth } from '../styles/global';

let styles = { ...globalStyles };

export default function (props) {
  const tabs = props.tabs.map((tab) => {
    let active = props.active === tab.id;
    return (
      <TouchableHighlight
        key={tab.id}
        underlayColor={'transparent'}
        style={[
          styles.typeParent,
          active ? styles.activeBorder : null
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
    <View style={[styles.row, { width: fullWidth }]}>
      {tabs}
    </View>
  );
}

