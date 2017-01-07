import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableHighlight,
  Keyboard,
} from 'react-native';
import CustomSpinner from './CustomSpinner.component';
import { globalStyles } from '../styles/global';

let styles;

class StallScreen extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
    };
  }

  render() {

    return (<View style={{ flex: 1, backgroundColor:'white', alignItems: 'center', justifyContent: 'center' }}>
      <CustomSpinner visible={true} />
    </View>);
  }
}

const localStyles = StyleSheet.create({
});

styles = { ...localStyles, ...globalStyles };

export default StallScreen;

