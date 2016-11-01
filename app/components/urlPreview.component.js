import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
} from 'react-native';
import { globalStyles } from '../styles/global';

let styles;

export default function (props) {
  let preview = null;

  if (props.urlPreview) {
    preview = (
      <View style={[styles.outerPreview]}>
        <View style={[styles.innerPreview]}>
          {props.urlPreview.image ?
            <Image
              source={{ uri: props.urlPreview.image }}
              style={{ flex: 0.4, resizeMode: 'cover' }}
            /> : null }
          <Text style={{ flex: 0.6, padding: 5, color: '#808080' }}>
            {props.urlPreview.title}
          </Text>
        </View>
      </View>
    );
  }

  return preview;
}

const localStyles = StyleSheet.create({
  outerPreview: {
    flex: 0.2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10
  },
  innerPreview: {
    borderRadius: 4,
    borderColor: '#f0f0f0',
    borderStyle: 'solid',
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    flex: 1,
    overflow: 'hidden'
  }
});

styles = { ...localStyles, globalStyles };
