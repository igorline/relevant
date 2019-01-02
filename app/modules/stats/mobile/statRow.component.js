import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles } from 'app/styles/global';

let styles;

export default function StatRow(props) {
  const l = props.elements.length;
  const els = props.elements.map((el, i) => (
    <View key={i} style={[styles.statRow, i < l - 1 ? styles.vBorder : null]}>
      {el.el}
      {el.label ? <Text style={styles.smallInfo}>{el.label}</Text> : null}
    </View>
  ));

  return <View style={[styles.row]}>{els}</View>;
}

const localStyles = StyleSheet.create({
  vBorder: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: 'hsl(0,0%,80%)'
  },
  statRow: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  row: {
    marginTop: 20,
    marginBottom: 20,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

StatRow.propTypes = {
  elements: PropTypes.array
};

styles = { ...globalStyles, ...localStyles };
