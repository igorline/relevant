import React, { Component } from 'react';
import { View } from 'react-native';
import CustomSpinner from 'modules/ui/mobile/CustomSpinner.component';

class StallScreen extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {};
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'white',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CustomSpinner visible />
      </View>
    );
  }
}

export default StallScreen;
