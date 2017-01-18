import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableHighlight,
  ActionSheetIOS,
} from 'react-native';
import { globalStyles } from '../../styles/global';

let styles;

export default class UrlPreviewComponent extends Component {

  constructor(props, state) {
    super(props, state);
    this.previewMenu = this.previewMenu.bind(this);
  }

  removeUrlPreview() {
    this.props.actions.setCreaPostState({ urlPreview: null, postUrl: null });
  }

  previewMenu() {
    if (this.props.edit || this.props.repost) return;
    ActionSheetIOS.showActionSheetWithOptions({
      options: ['Remove Url', 'Cancel'],
      cancelButtonIndex: 1,
      destructiveButtonIndex: 0,
    }, (buttonIndex) => {
      switch (buttonIndex) {
        case 0:
          this.removeUrlPreview();
          break;
        default:
          return;
      }
    });
  }

  render() {
    let preview = null;
    let previewImage = this.props.urlPreview.image;
    if (!previewImage || typeof previewImage !== 'string') {
      previewImage = 'https://s3.amazonaws.com/relevant-images/missing.png';
    }

    if (this.props.urlPreview) {
      preview = (
        <TouchableHighlight
          underlayColor={'transparent'}
          style={[styles.createPostInput, styles.preview]}
          onPress={this.previewMenu}
        >
          <View style={[styles.innerPreview]}>
            <Image
              resizeMode={'cover'}
              source={previewImage ? { uri: previewImage } : require('../../assets/images/missing.png')}
              style={{ flex: 0.4, height: 75, resizeMode: 'cover' }}
            />
            <Text style={{ flex: 0.6, padding: 5, color: '#808080' }}>
              {this.props.urlPreview.title}
            </Text>
          </View>
        </TouchableHighlight>
      );
    }

    return preview;
  }
}

const localStyles = StyleSheet.create({
  preview: {
    height: 100,
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

styles = { ...localStyles, ...globalStyles };
