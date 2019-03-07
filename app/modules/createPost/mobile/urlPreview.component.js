import React, { Component } from 'react';
import { Image, Text, TouchableHighlight, ActionSheetIOS, Platform } from 'react-native';
import PropTypes from 'prop-types';
import RNBottomSheet from 'react-native-bottom-sheet';
import { greyText } from 'app/styles/global';
import CustomSpinner from 'modules/ui/mobile/CustomSpinner.component';
import { View } from 'modules/styled/uni';

let ActionSheet = ActionSheetIOS;

if (Platform.OS === 'android') {
  ActionSheet = RNBottomSheet;
  ActionSheet.showActionSheetWithOptions = RNBottomSheet.showBottomSheetWithOptions;
}

export default class UrlPreviewComponent extends Component {
  static propTypes = {
    actions: PropTypes.object,
    edit: PropTypes.bool,
    repost: PropTypes.object,
    size: PropTypes.string,
    image: PropTypes.string,
    title: PropTypes.string,
    urlPreview: PropTypes.object,
    domain: PropTypes.string,
    noLink: PropTypes.bool
  };

  constructor(props, state) {
    super(props, state);
    this.previewMenu = this.previewMenu.bind(this);
  }

  removeUrlPreview() {
    this.props.actions.setCreatePostState({ urlPreview: null, postUrl: null });
  }

  previewMenu() {
    if (this.props.edit || this.props.repost) return;
    ActionSheet.showActionSheetWithOptions(
      {
        options: ['Remove Url', 'Cancel'],
        cancelButtonIndex: 1,
        destructiveButtonIndex: 0
      },
      buttonIndex => {
        switch (buttonIndex) {
          case 0:
            this.removeUrlPreview();
            break;
          default:
        }
      }
    );
  }

  render() {
    const { noLink, urlPreview, image, domain, size, title } = this.props;
    const isSmall = size === 'small';
    const height = isSmall ? 55 : 80;
    const imageFlex = isSmall ? 0.35 : 0.4;
    const fontSize = isSmall ? 13 : 15;

    const img = image || (urlPreview && urlPreview.image);
    const body = title || (urlPreview && urlPreview.title);
    const domainUrl = domain || (urlPreview && urlPreview.domain);

    const imageEl = img && (
      <Image
        resizeMode={'cover'}
        source={img ? { uri: img } : require('app/public/img/missing.png')}
        style={{ flex: imageFlex, height: null, resizeMode: 'cover' }}
      />
    );

    const domainEl = domainUrl && (
      <Text style={{ color: greyText, fontSize: 10, paddingTop: 2 }}>
        from: {domainUrl}
      </Text>
    );

    const maxLines = isSmall && domainEl ? 2 : 3;

    return urlPreview ? (
      <TouchableHighlight
        underlayColor={'transparent'}
        style={{ height }}
        disabled={noLink}
      >
        <View h={height} border align={'stretch'} fdirection={'row'} flex={1}>
          {imageEl || <View style={{ width: 5 }} />}
          <View style={{ flex: 1, padding: 5, justifyContent: 'center' }}>
            <Text numberOfLines={maxLines} style={{ color: greyText, fontSize }}>
              {body}
            </Text>
            <Text>{domainEl}</Text>
          </View>
        </View>
      </TouchableHighlight>
    ) : (
      <TouchableHighlight
        underlayColor={'transparent'}
        style={{ height }}
        onPress={this.previewMenu}
      >
        <View h={height} border align={'stretch'} fdirection={'row'} flex={1}>
          <CustomSpinner size={'small'} visible />
        </View>
      </TouchableHighlight>
    );
  }
}
