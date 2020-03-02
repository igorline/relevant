import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { isNative, colors, fonts } from 'app/styles';
import { Platform } from 'react-native';
import { goToProfile, goToUrl, goToTopic } from 'modules/navigation/navigation.actions';

let MarkdownNative;
let ReactMarkdown;

if (process.env.WEB === 'true') {
  ReactMarkdown = require('react-markdown');
} else {
  MarkdownNative = require('react-native-markdown-display').default;
}

MD.propTypes = {
  markdown: PropTypes.string,
  noLink: PropTypes.bool
};

export default function MD({ markdown, noLink, ...props }) {
  const dispatch = useDispatch();
  if (isNative)
    return (
      <MarkdownNative
        mergeStyle={true}
        onLinkPress={url => {
          if (noLink) return null;
          switch (true) {
            case url === '':
              return true;
            case /__user_profile__/.test(url):
              return dispatch(goToProfile(url.replace('__user_profile__', '')));
            case /__tag_link__/.test(url):
              return dispatch(goToTopic(url.replace('__tag_link__', '')));
            default:
              return dispatch(goToUrl(url));
          }
        }}
        style={styles}
      >
        {markdown}
      </MarkdownNative>
    );
  return <ReactMarkdown {...props} source={markdown} />;
}

const mb = 16;
const headingMargin = 10;

export const styles = {
  body: {
    fontFamily: 'Georgia',
    fontSize: 18,
    lineHeight: 27,
    color: colors.black
  },
  heading1: {
    fontSize: 32,
    lineHeight: 54,
    fontFamily: fonts.HELVETICA_NEUE_BOLD,
    marginVertical: headingMargin
  },
  heading2: {
    fontSize: 24,
    fontFamily: fonts.HELVETICA_NEUE_CONDENSED_BOLD,
    marginVertical: headingMargin
  },
  heading3: {
    fontSize: 20,
    fontFamily: fonts.HELVETICA_NEUE_BOLD,
    marginVertical: headingMargin
  },
  heading4: {
    fontSize: 18,
    fontFamily: fonts.HELVETICA_NEUE_CONDENSED_BOLD,
    marginVertical: headingMargin
  },
  heading5: {
    fontSize: 18,
    fontFamily: fonts.HELVETICA_NEUE_CONDENSED_BOLD,
    marginVertical: headingMargin
  },
  link: {
    color: colors.blue,
    textDecorationLine: 'none'
  },
  blockquote: {
    borderLeftColor: '#DDDDDD',
    backgroundColor: 'transparent',
    paddingVertical: 4,
    borderLeftWidth: 6,
    opacity: 1
  },
  code_block: {
    backgroundColor: 'rgba(27,31,35,.05)',
    borderWidth: 0,
    borderRadius: 3,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'Monospace'
  },
  code_inline: {
    backgroundColor: 'rgba(27,31,35,.05)',
    borderRadius: 3,
    borderWidth: 0,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'Monospace'
  },
  fence: {
    borderWidth: 0,
    backgroundColor: 'rgba(27,31,35,.05)',
    borderRadius: 3,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'Monospace',
    marginBottom: 10
  },
  paragraph: {
    marginTop: 0,
    marginBottom: mb
  },
  bullet_list: {
    marginBottom: mb
  },
  ordered_list: {
    marginBottom: mb
  },
  list_item: {
    marginBottom: -10,
    marginTop: -10,
    lineHeight: 36
  }
};
