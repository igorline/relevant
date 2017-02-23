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
import CustomSpinner from '../CustomSpinner.component';

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
    let image;
    let domain;
    let addStyle = {};

    let height = 80;
    let imageFlex = 0.4;
    let fontSize = 15;
    let maxLines = 3;
    if (this.props.size === 'small') {
      height = 55;
      imageFlex = 0.25;
      fontSize = 12;
    }

    if (this.props.urlPreview && (this.props.urlPreview.image || this.props.size !== 'small')) {
      let previewImage = this.props.urlPreview.image;
      image = (<Image
        resizeMode={'cover'}
        source={previewImage ? { uri: previewImage } : require('../../assets/images/missing.png')}
        style={{ flex: imageFlex, height: null, resizeMode: 'cover' }}
      />);
    } else {
      height = null;
      // addStyle = {
      //   borderWidth: 0
      // };
    }

    if (this.props.domain) {
      maxLines = 2;
      domain = (<Text style={{ color: '#808080', fontSize: fontSize - 2, paddingTop: 2 }}>
        from: {this.props.domain}
      </Text>);
    }

    if (this.props.urlPreview) {

      preview = (
        <TouchableHighlight
          underlayColor={'transparent'}
          style={[styles.createPostInput, { height }]}
          onPress={this.props.onPress || this.previewMenu}
        >
          <View style={[styles.innerPreview]}>
            {image}
            <View style={{ flex: 0.6, padding: 5 }}>
              <Text
                numberOfLines={maxLines}
                style={{ color: '#808080', fontSize }}
              >
                {this.props.urlPreview.title}
              </Text>
              {domain}
            </View>
          </View>
        </TouchableHighlight>
      );
    } else {
      preview = (
        <TouchableHighlight
          underlayColor={'transparent'}
          style={[styles.createPostInput, styles.preview]}
          onPress={this.previewMenu}
        >
          <View style={styles.innerPreview}>
            <CustomSpinner size={'small'} visible />
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
