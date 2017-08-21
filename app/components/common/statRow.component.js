import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { globalStyles } from '../../styles/global';


let styles;

export default function StatRow(props) {
  let l = props.elements.length;
  let els = props.elements.map((el, i) => (
    <View key={i} style={[styles.statRow, i < l - 1 ? styles.vBorder : null]}>
      {el.el}
      {el.label ? <Text style={styles.smallInfo}>{el.label}</Text> : null}
    </View>
  ));

  return (
    <View style={[styles.row]}>
      {els}
    </View>
  );
}

let localStyles = StyleSheet.create({
  vBorder: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: 'hsl(0,0%,80%)',
  },
  statRow: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    marginTop: 20,
    marginBottom: 20,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

styles = { ...globalStyles, ...localStyles };
