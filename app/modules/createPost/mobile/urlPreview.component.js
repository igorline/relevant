import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableHighlight,
  ActionSheetIOS,
  Platform
} from 'react-native';
import PropTypes from 'prop-types';
import RNBottomSheet from 'react-native-bottom-sheet';
import { globalStyles, greyText } from 'app/styles/global';
import CustomSpinner from 'modules/ui/mobile/CustomSpinner.component';

let ActionSheet = ActionSheetIOS;

if (Platform.OS === 'android') {
  ActionSheet = RNBottomSheet;
  ActionSheet.showActionSheetWithOptions = RNBottomSheet.showBottomSheetWithOptions;
}

let styles;

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
    onPress: PropTypes.func,
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
    const imageFlex = isSmall ? 0.25 : 0.4;
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
        style={[styles.createPostInput, { height, marginTop: 0 }]}
        onPress={this.props.onPress || this.previewMenu}
        disabled={noLink}
      >
        <View style={[styles.innerPreview]}>
          {imageEl || <View style={{ width: 5 }} />}
          <View style={{ flex: 0.6, padding: 5, justifyContent: 'center' }}>
            <Text numberOfLines={maxLines} style={{ color: greyText, fontSize }}>
              {body}
            </Text>
            {domainEl}
          </View>
        </View>
      </TouchableHighlight>
    ) : (
      <TouchableHighlight
        underlayColor={'transparent'}
        style={[styles.createPostInput, styles.preview, { height }]}
        onPress={this.previewMenu}
      >
        <View style={styles.innerPreview}>
          <CustomSpinner size={'small'} visible />
        </View>
      </TouchableHighlight>
    );
  }
}

const localStyles = StyleSheet.create({
  preview: {
    height: 100
  },
  innerPreview: {
    borderRadius: 0,
    borderColor: greyText,
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
