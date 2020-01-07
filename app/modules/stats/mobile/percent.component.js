import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PropTypes from 'prop-types';
import { numbers } from 'app/utils';
import { globalStyles, green } from 'app/styles/global';
import get from 'lodash/get';

let styles;

class Percent extends Component {
  static propTypes = {
    user: PropTypes.object,
    fontSize: PropTypes.number,
    fontFamily: PropTypes.string
  };

  componentDidMount() {
    this.percent = Math.max(0, numbers.percentChange(get(this.props.user, 'relevance')));
    this.percentPretty = numbers.abbreviateNumber(this.percent);
    this.animate();
  }

  componentWillUnmount() {
    clearTimeout(this.animationTimer);
  }

  animate() {
    const newPercent = Math.max(
      0,
      numbers.percentChange(get(this.props.user, 'relevance'))
    );
    const newPercentPretty = numbers.abbreviateNumber(newPercent);

    if (parseFloat(this.percentPretty) !== parseFloat(newPercentPretty)) {
      this.percent = newPercent;
      this.forceUpdate();
    }
    this.animationTimer = setTimeout(() => this.animate(), 300);
  }

  render() {
    const user = get(this.props.user, 'relevance');
    // console.log(user);
    const fontSize = this.props.fontSize || 17;
    // let arrowSize = this.props.fontSize - 1;
    if (!user) return null;
    let fontFamily;
    if (this.props.fontFamily) {
      fontFamily = { fontFamily: this.props.fontFamily, letterSpacing: 0 };
    }

    const percent = Math.max(0, numbers.percentChange(user));

    let percentComponent = null;

    if (percent >= 0) {
      percentComponent = (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          <Text style={{ fontSize, color: green, marginBottom: -3 }}>▲</Text>
          <Text
            style={[
              { fontSize, textAlign: 'right', color: green },
              styles.bebas,
              fontFamily
            ]}
          >
            {numbers.abbreviateNumber(percent)}%
          </Text>
        </View>
      );
    } else if (percent < 0) {
      percentComponent = (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          <Text style={{ fontSize, color: 'red', marginBottom: -3 }}>▼</Text>
          <Text
            style={[
              { fontSize, color: 'red', textAlign: 'right' },
              styles.bebas,
              fontFamily
            ]}
          >
            {numbers.abbreviateNumber(percent)}%
          </Text>
        </View>
      );
    }

    return percentComponent;
  }
}

export default Percent;

const localStyles = StyleSheet.create({});

styles = { ...globalStyles, ...localStyles };
