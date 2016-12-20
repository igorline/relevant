import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Image,
  Modal,
} from 'react-native';
import * as Progress from 'react-native-progress';
import UserName from './userNameSmall.component';
import * as utils from '../utils';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
let styles;
let moment = require('moment');

class Percent extends Component {
  constructor(props, context) {
    super(props, context);
    this.abbreviateNumber = this.abbreviateNumber.bind(this);
    this.renderPercent = this.renderPercent.bind(this);
    this.state = {
    };
  }

  componentDidMount() {
  }

  abbreviateNumber(num) {
    let fixed = 0;
    if (num === null) { return null; };
    if (num === 0) { return '0'; };
    if (typeof num !== 'number') num = Number(num);
    fixed = (!fixed || fixed < 0) ? 0 : fixed;
    let b = (num).toPrecision(2).split('e');
    let k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3);
    let c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3)).toFixed(1 + fixed);
    let d = c < 0 ? c : Math.abs(c);
    let e = d + ['', 'K', 'M', 'B', 'T'][k];
    return e;
  }

  renderPercent() {
    let user = this.props.user;
    if (!user) return null;
    let percent = utils.percent.percentChange(user);
    if (percent === 0) {
      return (<Text style={{ position: 'absolute' }}></Text>);
    } else if (percent > 0) {
      return (<Text style={[{ textAlign: 'right', color: '#196950' }, styles.bebas]}>
        ▲{this.abbreviateNumber(percent)}%
      </Text>);
    } else if (percent < 0) {
      return (<Text style={[{ color: 'red', textAlign: 'right' }, styles.bebas]}>
        ▼{this.abbreviateNumber(percent)}%
      </Text>);
    }
  }

  render() {
    return this.renderPercent();
  }
}

export default Percent;

const localStyles = StyleSheet.create({
});

styles = { ...globalStyles, ...localStyles };

