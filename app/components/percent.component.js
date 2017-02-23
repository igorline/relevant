import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
} from 'react-native';
import { numbers } from '../utils';
import { globalStyles } from '../styles/global';

let styles;

class Percent extends Component {

  render() {
    let user = this.props.user;
    let arrowSize = this.props.fontSize - 1 || 16;
    if (!user) return null;
    let percent = numbers.percentChange(user);
    let percentComponent = null;
    if (percent === 0) {
      percentComponent = (<Text style={[{ textAlign: 'right', color: 'red' }, styles.bebas]}>
        <Text style={{ fontSize: arrowSize }}>▼</Text>
        {numbers.abbreviateNumber(percent)}%
      </Text>);
    } else if (percent > 0) {
      percentComponent = (<Text style={[{ textAlign: 'right', color: '#196950' }, styles.bebas]}>
        <Text style={{ fontSize: arrowSize }}>▲</Text>
        {numbers.abbreviateNumber(percent)}%
      </Text>);
    } else if (percent < 0) {
      percentComponent = (<Text style={[{ color: 'red', textAlign: 'right', lineHeight: 20 }, styles.bebas]}>
        <Text style={{ fontSize: arrowSize }}>▼</Text>{numbers.abbreviateNumber(percent)}%
      </Text>);
    }

    return percentComponent;
  }
}

export default Percent;

const localStyles = StyleSheet.create({
});

styles = { ...globalStyles, ...localStyles };

