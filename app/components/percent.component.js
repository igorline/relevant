import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import { numbers } from '../utils';
import { globalStyles, green } from '../styles/global';

let styles;

class Percent extends Component {

  componentDidMount() {
    this.percent = numbers.percentChange(this.props.user);
    this.percentPretty = numbers.abbreviateNumber(this.percent);
    this.animate();
  }

  componentWillUnmount() {
    clearTimeout(this.animationTimer);
  }

  animate() {
    let newPercent = numbers.percentChange(this.props.user);
    let newPercentPretty = numbers.abbreviateNumber(newPercent);

    if (parseFloat(this.percentPretty) !== parseFloat(newPercentPretty)) {
      this.percent = newPercent;
      this.forceUpdate();
    }
    this.animationTimer = setTimeout(() => this.animate(), 100);
  }

  render() {
    let user = this.props.user;
    let fontSize = this.props.fontSize || 17;
    let arrowSize = this.props.fontSize - 1 || 16;
    if (!user) return null;

    let percent = numbers.percentChange(user);

    let percentComponent = null;

    if (percent > 0) {
      percentComponent = (
        <Text style={[{ fontSize, textAlign: 'right', color: green }, styles.bebas]}>
          <View style={{ height: arrowSize, width: arrowSize }}>
            <Text style={{ fontSize, color: green }}>▲</Text>
          </View>
          {numbers.abbreviateNumber(percent)}%
        </Text>
      );
    } else if (percent <= 0) {
      percentComponent = (
        <Text style={[{ fontSize, color: 'red', textAlign: 'right', lineHeight: 20 }, styles.bebas]}>
          <View style={{ height: arrowSize, width: arrowSize }}>
            <Text style={{ fontSize: arrowSize, color: 'red' }}>▼</Text>
          </View>
          {numbers.abbreviateNumber(percent)}%
        </Text>
      );
    }

    return percentComponent;
  }
}

export default Percent;

const localStyles = StyleSheet.create({
});

styles = { ...globalStyles, ...localStyles };

