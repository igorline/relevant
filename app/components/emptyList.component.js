import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform
} from 'react-native';
import { globalStyles, fullHeight } from '../styles/global';

let styles;


class EmptyList extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      top: 0,
      ready: false
    };
  }

  render() {
    let type = this.props.type || '';
    let emoji = this.props.emoji || (Platform.OS === 'android' ? '😮' : '😶');
    let visible = this.props.visible;
    let content = this.props.children || (
      <Text style={[styles.libre, styles.darkGrey, { fontSize: 40, textAlign: 'center' }]}>
        {this.props.text ? this.props.text : 'Sorry, no ' + type + ' ' + emoji}
      </Text>
    );
    return (
      <View
        style={[
          visible && this.state.ready ? styles.emptyList : styles.hideEmptyList,
          { height: fullHeight - ((59 * 2) + this.state.top + (this.props.YOffset || 0)) },
        ]}
        pointerEvents={visible ? 'auto' : 'none'}
        onLayout={(e) => {
          this.setState({ top: e.nativeEvent.layout.y });
          this.setState({ ready: true });
        }}
      >
        {content}
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  hideEmptyList: {
    flex: 0,
    opacity: 0,
    position: 'absolute',
  },
});

styles = { ...localStyles, ...globalStyles };

module.exports = EmptyList;
