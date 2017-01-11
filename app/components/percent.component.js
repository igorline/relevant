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
    if (!user) return null;
    let percent = numbers.percentChange(user);
    let percentComponent;
    if (percent === 0) {
      percentComponent = (<Text style={[{ textAlign: 'right', color: 'red' }, styles.bebas]}> ▼{numbers.abbreviateNumber(percent)}%</Text>);
    } else if (percent > 0) {
      percentComponent = (<Text style={[{ textAlign: 'right', color: '#196950' }, styles.bebas]}>
        ▲{numbers.abbreviateNumber(percent)}%
      </Text>);
    } else if (percent < 0) {
      percentComponent = (<Text style={[{ color: 'red', textAlign: 'right' }, styles.bebas]}>
        ▼{numbers.abbreviateNumber(percent)}%
      </Text>);
    }

    return percentComponent;
  }
}

export default Percent;

const localStyles = StyleSheet.create({
});

styles = { ...globalStyles, ...localStyles };

