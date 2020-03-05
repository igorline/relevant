import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Touchable, View } from 'modules/styled/uni';
import PropTypes from 'prop-types';
import ULink from 'modules/navigation/ULink.component';
import { getTitle } from 'utils/text';
import Markdown from 'modules/comment/renderMarkdown';
import history from 'modules/navigation/history';
import { goToPost } from 'modules/navigation/navigation.actions';
import { getPostUrl } from 'app/utils/post';
import linkifyText from './linkify';

const RENDERERS = {
  link: MarkdownLink
};

CommentBody.propTypes = {
  noLink: PropTypes.bool,
  avatarText: PropTypes.func,
  comment: PropTypes.object,
  inMainFeed: PropTypes.bool,
  preview: PropTypes.bool,
  omitTitle: PropTypes.bool
};

export default function CommentBody({
  avatarText,
  inMainFeed,
  comment,
  noLink,
  preview,
  omitTitle
}) {
  const dispatch = useDispatch();
  const community = useSelector(state => state.auth.community);
  const postUrl = getPostUrl(community, comment);

  if (!comment || !comment.body) return null;

  const { isHeading, titleText } = omitTitle ? getTitle(comment.body) : {};
  const isPreview = inMainFeed || preview;

  const fullText = isHeading
    ? comment.body.replace(`# ${titleText}`, '').trim()
    : comment.body.replace(`${titleText}`, '').trim();

  const textTrim = preview ? 250 : 400;
  let text = isPreview ? trimText(fullText, textTrim) : fullText;
  const readMore = text.length < fullText.length;
  text += readMore ? ' _...Read More_' : '';
  text = linkifyText(text, community, comment.url);

  const body = (
    <Markdown
      noLink={noLink}
      className={'markdown-body'}
      renderers={RENDERERS}
      markdown={text}
    />
  );

  const postLink = comment.parentPost || comment;
  const postLinkObj = postLink._id ? postLink : { _id: postLink };

  // link to full post
  if (isPreview || noLink) {
    return (
      <View shrink={1} pl={avatarText ? 5 : 0}>
        <Touchable
          style={{ zIndex: 0 }}
          to={postUrl}
          onPress={e => {
            if (noLink) {
              e.preventDefault();
              return e.stopPropagation();
            }
            return dispatch(goToPost({ ...postLinkObj, comment }));
          }}
          onClick={e => {
            if (noLink) {
              e.preventDefault();
              return e.stopPropagation();
            }
            return history.push(postUrl);
          }}
        >
          {body}
        </Touchable>
      </View>
    );
  }

  return (
    <View shrink={1} pl={avatarText ? 5 : 0}>
      {body}
    </View>
  );
}

function trimText(text, limit) {
  if (!text || !text.length) return text;
  const lines = text.split(/\n/);
  text = lines.slice(0, 3).join('\n');
  if (text.length <= limit) return handleCodeblock(text);
  const excerpt = text.substr(0, text.lastIndexOf(' ', limit));
  return handleCodeblock(excerpt);
}

function handleCodeblock(excerpt) {
  const hasCodeblock = excerpt.match('```');
  if (!hasCodeblock) return excerpt;
  const lastIndex = hasCodeblock.index;
  if (excerpt.length === lastIndex + 3) return excerpt.substr(0, lastIndex);

  const hasUnclosedCodeblock = hasCodeblock && hasCodeblock.length % 2 !== 0;
  return hasUnclosedCodeblock ? excerpt + '\n```\n' : excerpt;
}

MarkdownLink.propTypes = {
  href: PropTypes.string
};

function MarkdownLink({ href, ...rest }) {
  const regex = /^(https?|file|ftps?|mailto|javascript|data:image\/[^;]{2,9};):/i;
  const isAbsolute = regex.test(href);
  return (
    <ULink
      to={href}
      {...rest}
      onClick={e => e.stopPropagation()}
      external={isAbsolute}
      target={isAbsolute ? '_blank' : null}
    />
  );
}
