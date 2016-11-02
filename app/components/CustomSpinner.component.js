'use strict';
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableHighlight,
  LinkingIOS,
  Animated,
  ActivityIndicator,
  Easing
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

class CustomSpinner extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
    }
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  render() {
    var self = this;

    return (
      <View pointerEvents={'none'} style={localStyles.container}>
        <ActivityIndicator
          animating={this.props.visible}
          size="large"
        />
      </View>
    );
  }
}

export default CustomSpinner;

const localStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    flexGrow: 1 
  }
});






