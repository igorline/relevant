import React from 'react';
import Linkify from 'linkifyjs/react';
import * as linkify from 'linkifyjs';
import mentionPlugin from 'linkifyjs/plugins/mention';
import hashTagPlugin from 'linkifyjs/plugins/hashtag';
import { CommentText, Touchable } from 'modules/styled/uni';
import { Link } from 'react-router-dom';
import { colors } from 'app/styles';
import PropTypes from 'prop-types';

mentionPlugin(linkify);
hashTagPlugin(linkify);

export default function CommentBody({
  avatarText,
  auth,
  inMainFeed,
  comment,
  postUrl,
  noLink,
  history,
  condensedView
}) {
  let readMore;
  let text = comment.body;
  if (inMainFeed && text && text.length) {
    let lines = text.split(/\n/);
    lines = lines.map(line =>
      line
      .split(/\s/)
      .slice(0, 50)
      .join(' ')
    );
    text = lines.slice(0, 3).join('\n');
    readMore = text.length < comment.body.length;
  }

  const bodyMargin = condensedView ? '1 0 0 5' : '3 0';

  const body = (
    <CommentText style={{ zIndex: 0 }} m={bodyMargin} pl={avatarText ? 5 : 0}>
      <Linkify
        style={{ width: '100%' }}
        options={{
          tagName: {
            mention: () => Link,
            hashtag: () => Link
          },
          attributes: (href, type) => {
            if (type === 'mention') {
              return {
                to: '/user/profile' + href
              };
            }
            if (type === 'hashtag') {
              return {
                to: `/${auth.community}/top/${href.replace('#', '')}`
              };
            }
            return {
              onClick: e => e.stopPropagation()
            };
          }
        }}
      >
        {text}
        {readMore ? (
          <CommentText inline={1} c={colors.grey}>
            {' '}
            ...Read More
          </CommentText>
        ) : null}
      </Linkify>
    </CommentText>
  );

  if (postUrl) {
    return (
      <Touchable
        style={{ zIndex: 0 }}
        to={postUrl}
        onClick={() => (noLink ? null : history.push(postUrl))}
      >
        {body}
      </Touchable>
    );
  }

  return body;
}

CommentBody.propTypes = {
  condensedView: PropTypes.bool,
  history: PropTypes.object,
  noLink: PropTypes.bool,
  avatarText: PropTypes.func,
  auth: PropTypes.object,
  comment: PropTypes.object,
  inMainFeed: PropTypes.bool,
  postUrl: PropTypes.string
};
