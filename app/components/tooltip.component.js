import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
} from 'react-native';
import { numbers } from '../utils';
import { globalStyles } from '../styles/global';

let styles;

class Tooltip extends Component {

  render() {
    let el = null;
    let text = this.props.text;
    if (!text) return null;
    el = (<View style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: 5 }}>
      <Text style={{ color: 'white' }}>{text}</Text>
    </View>)

    return el;
  }
}

export default Tooltip;

const localStyles = StyleSheet.create({
});

styles = { ...globalStyles, ...localStyles };

