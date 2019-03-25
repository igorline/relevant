import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { colors } from 'app/styles';
import CustomSpinner from 'modules/ui/mobile/CustomSpinner.component';
import { View, Text, Image } from 'modules/styled/uni';
import ULink from 'modules/navigation/ULink.component';

export default class UrlPreviewComponent extends Component {
  static propTypes = {
    size: PropTypes.string,
    image: PropTypes.string,
    title: PropTypes.string,
    urlPreview: PropTypes.object,
    domain: PropTypes.string,
    noLink: PropTypes.bool,
    urlMenu: PropTypes.func
  };

  render() {
    const { noLink, urlPreview, image, domain, size, title, urlMenu } = this.props;
    const isSmall = size === 'small';
    const height = isSmall ? 7 : 10;
    const imageFlex = isSmall ? 0.35 : 0.4;
    const fontSize = isSmall ? 1.5 : 2;

    const img = image || (urlPreview && urlPreview.image);
    const body = title || (urlPreview && urlPreview.title);
    const domainUrl = domain || (urlPreview && urlPreview.domain);

    const imageEl = img && (
      <Image
        resizeMode={'cover'}
        source={img ? { uri: img } : require('app/public/img/missing.png')}
        flex={imageFlex}
      />
    );

    const domainEl = domainUrl && (
      <Text numberOfLines={1} fs={fontSize} c={colors.grey} pt={1 / 4}>
        from: {domainUrl}
      </Text>
    );

    const maxLines = isSmall && domainEl ? 2 : 3;

    return urlPreview ? (
      <View border>
        <ULink underlayColor={'transparent'} onPress={urlMenu} to={'#'} disabled={noLink}>
          <View h={height} align={'stretch'} fdirection={'row'}>
            {imageEl || null}
            <View
              flex={1}
              p={0.5}
              fdirection={'column'}
              justify={'center'}
              style={{
                overflow: 'hidden'
              }}
            >
              <Text
                style={{
                  overflow: 'hidden'
                }}
                maxheight={maxLines * fontSize * 1.33}
                fs={fontSize}
                numberOfLines={maxLines}
                c={colors.grey}
              >
                {body}
              </Text>
              {domainEl}
            </View>
          </View>
        </ULink>
      </View>
    ) : (
      <ULink underlayColor={'transparent'} style={{ height }} onPress={urlMenu} to={'#'}>
        <View h={height} border align={'stretch'} fdirection={'row'} flex={1}>
          <CustomSpinner size={'small'} visible />
        </View>
      </ULink>
    );
  }
}
