import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { globalStyles } from '../styles/global';

let styles;

class EmptyList extends Component {
  constructor(props, context) {
    super(props, context);
    this.type = '';
    this.emoji = '😶';
    this.visible = false;
  }

  componentDidMount() {
    if (this.props.type) this.type = this.props.type;
    if (this.props.emoji) this.emoji = this.props.emoji;
    if (!this.props.visible) this.visible = false;
    if (this.props.visible) this.visible = true;
  }

  componentWillReceiveProps(next) {
    if (next.type) this.type = next.type;
    if (next.emoji) this.emoji = next.emoji;
    if (!next.visible) this.visible = false;
    if (next.visible) this.visible = true;
  }

  render() {
    return (
      <View style={[this.visible ? styles.emptyList : styles.hideEmptyList]} pointerEvents={this.visible ? 'auto' : 'none'}>
        <Text style={[styles.libre, { fontSize: 20 }]}>
          Sorry bruh, no {this.type} {this.emoji}
        </Text>
      </View>
    );
  }
}

export default EmptyList;

const localStyles = StyleSheet.create({
  hideEmptyList: {
    flex: 0,
    opacity: 0,
    position: 'absolute',
  },
  emptyList: {
    // position: 'absolute',
    // top: 0,
    // left: 0,
    flex: 1,
    // bottom: 0,
    // right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

styles = { ...localStyles, ...globalStyles };

