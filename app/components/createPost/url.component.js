import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { globalStyles } from '../../styles/global';
import RCTKeyboardToolbarTextInput from 'react-native-textinput-utils';

let styles = { ...globalStyles };

export default function (props) {
  const view = props.view.post;
  let input;

  if (view === 'url') {
    input = (
      <View
        style={{
          borderBottomColor: !this.state.urlPreview ? '#f0f0f0' : 'transparent',
          borderBottomWidth: StyleSheet.hairlineWidth,
          flex: 0.1 }}
      >
        <RCTKeyboardToolbarTextInput
          leftButtonText="Previous"
          rightButtonText="Next"
          onCancel={() => this.createPreview()}
          onDone={() => this.nextInput('body')}
          numberOfLines={1}
          style={[styles.font15, { flex: 1, padding: 10 }]}
          placeholder={'Enter URL here...'}
          multiline={false}
          onChangeText={postLink => this.setState({ postLink, urlPreview: null })}
          onBlur={this.createPreview}
          onSubmitEditing={this.createPreview}
          value={this.state.postLink}
          returnKeyType={'next'}
        />
      </View>
    );
  }

  return (
    input
  );
}
