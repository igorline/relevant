import React, { Component } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles, fullHeight } from 'app/styles/global';

let styles;

class EmptyList extends Component {
  static propTypes = {
    type: PropTypes.string,
    emoji: PropTypes.string,
    visible: PropTypes.bool,
    children: PropTypes.node,
    text: PropTypes.string,
    YOffset: PropTypes.number
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      top: 0,
      ready: false
    };
  }

  render() {
    const type = this.props.type || '';
    const emoji = this.props.emoji || (Platform.OS === 'android' ? '😮' : '😶');
    const { visible } = this.props;
    const content = this.props.children || (
      <Text
        style={[styles.libre, styles.darkGrey, { fontSize: 40, textAlign: 'center' }]}
      >
        {this.props.text ? this.props.text : 'Sorry, no ' + type + ' ' + emoji}
      </Text>
    );
    return (
      <View
        style={[
          visible && this.state.ready ? styles.emptyList : styles.hideEmptyList,
          { height: fullHeight - (59 * 2 + this.state.top + (this.props.YOffset || 0)) }
        ]}
        pointerEvents={visible ? 'auto' : 'none'}
        onLayout={e => {
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
    position: 'absolute'
  }
});

styles = { ...localStyles, ...globalStyles };

module.exports = EmptyList;
