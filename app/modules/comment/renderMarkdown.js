import React, { useCallback, memo } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { isNative } from 'app/styles';
import { goToProfile, goToUrl, goToTopic } from 'modules/navigation/navigation.actions';
import ULink from 'modules/navigation/ULink.component';
import nativeStyles from 'styles/markdown.native';

let MarkdownNative;
let ReactMarkdown;

if (process.env.WEB === 'true') {
  ReactMarkdown = require('react-markdown');
} else {
  MarkdownNative = require('react-native-markdown-display').default;
}

MD.propTypes = {
  markdown: PropTypes.string,
  noLink: PropTypes.bool,
  className: PropTypes.string
};

export default function MD({ markdown, noLink, className }) {
  const processNativeLink = useNativeLink(noLink);
  const MarkdownLink = getMDLink(noLink);
  const RENDERERS = {
    link: MarkdownLink,
    linkReference: MarkdownLink
  };

  return isNative ? (
    <MarkdownNative
      mergeStyle={true}
      onLinkPress={processNativeLink}
      style={nativeStyles}
    >
      {markdown}
    </MarkdownNative>
  ) : (
    <ReactMarkdown renderers={RENDERERS} className={className} source={markdown} />
  );
}

function useNativeLink(noLink) {
  const dispatch = useDispatch();
  return useCallback(
    url => {
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
    },
    [dispatch, noLink]
  );
}

function getMDLink(noLink) {
  MarkdownLink.propTypes = {
    href: PropTypes.string,
    children: PropTypes.node,
    onPress: PropTypes.func
  };
  function MarkdownLink({ href, children, onPress, ...rest }) {
    if (href === '') return children;
    const regex = /^(https?|file|ftps?|mailto|javascript|data:image\/[^;]{2,9};):/i;
    const isAbsolute = regex.test(href);
    return (
      <ULink
        to={href}
        {...rest}
        children={children}
        onClick={e => (noLink ? e.preventDefault() : e.stopPropagation())}
        onPress={e => (noLink ? e.preventDefault() : onPress(e))}
        external={isAbsolute}
        target={isAbsolute ? '_blank' : null}
      />
    );
  }
  return memo(MarkdownLink);
}
