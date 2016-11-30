import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  ActionSheetIOS,
  AlertIOS,
  TouchableHighlight
} from 'react-native';
import { globalStyles } from '../styles/global';

let moment = require('moment');

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
      <View style={this.visible ? styles.emptyList : styles.hideEmptyList} pointerEvents={this.visible ? 'auto' : 'none'}>
        <Text style={[styles.libre, {fontSize: 20}]}>Sorry bruh, no {this.type} {this.emoji}</Text>
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
  }
});

styles = { ...localStyles, ...globalStyles };

