import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import Tag from 'modules/tag/tag.component';
import get from 'lodash/get';
import ULink from 'modules/navigation/ULink.component';
import { View, Title, SecondaryText } from 'modules/styled/uni';
import { colors } from 'app/styles';
import { getPostUrl } from 'app/utils/post';
import { goToUrl, goToPost } from 'modules/navigation/navigation.actions';
import history from 'modules/navigation/history';

PostTitle.propTypes = {
  mobile: PropTypes.bool,
  preview: PropTypes.bool,
  singlePost: PropTypes.bool,
  children: PropTypes.node,
  noLink: PropTypes.bool,
  link: PropTypes.object,
  post: PropTypes.object,
  title: PropTypes.string
};

export default memo(PostTitle);

function PostTitle({ children, post, link, title, noLink, mobile, singlePost, preview }) {
  const dispatch = useDispatch();

  const currentCommunity = useSelector(state => state.auth.community);
  const postCommunity = post && post.data && post.data.community;
  const community = postCommunity || currentCommunity;

  const c = mobile ? colors.white : null;

  if (!post) return null;
  const titleLines = preview && mobile ? 2 : 3;

  const parentPost = post.parentPost || post;
  const postUrl = getPostUrl(community, parentPost);

  const titleEl = link ? (
    <ULink
      // to={singlePost ? post.url : postUrl || '#'}
      // external={singlePost}
      // target={singlePost ? '_blank' : null}
      to={post.url}
      external
      target={'_blank'}
      noLink={noLink}
      onClick={() => history.push(postUrl)}
      onPress={() => {
        singlePost
          ? dispatch(goToPost(post))
          : dispatch(goToUrl(post.url)) && dispatch(goToPost(post));
      }}
    >
      <Title
        inline={1}
        lh={mobile ? 2.7 : null}
        c={c}
        flex={1}
        numberOfLines={titleLines}
      >
        {title}
      </Title>
    </ULink>
  ) : (
    <Title inline={1} c={c} flex={1} numberOfLines={titleLines}>
      {title}
    </Title>
  );

  const hasAuthor = link && link.articleAuthor && link.articleAuthor.length;
  const authorEl = hasAuthor ? (
    <SecondaryText c={c} numberOfLines={1} mr={0.5}>
      {link.articleAuthor.join(', ')} •
    </SecondaryText>
  ) : null;

  const domainEl = get(link, 'domain') && (
    <View fdirection={'row'} numberOfLines={1} align={'flex-end'}>
      {authorEl}
      <ULink
        type="text"
        external
        to={post.url}
        hc={colors.blue}
        hu
        target="_blank"
        disabled={!postUrl}
        noLink={noLink}
        onPress={() => dispatch(goToUrl(post.url))}
      >
        <SecondaryText c={c || null} inline={1}>
          {link.domain && `${link.domain}\u00A0\u2197\uFE0E`}
        </SecondaryText>
      </ULink>
    </View>
  );

  const renderCommentLink = post.commentCount && postUrl;
  const tags = get(post, 'tags', []);

  return (
    <View fdirection={'column'} flex={1} justify={mobile ? 'center' : 'flex-start'}>
      <View>
        {titleEl}
        <View mt={mobile ? 1 : 0} c={c}>
          {domainEl}
        </View>
      </View>
      {renderCommentLink || tags.length ? (
        <View
          fdirection={'row'}
          wrap={'wrap'}
          align={'flex-end'}
          h={2}
          style={{ overflow: 'hidden' }}
          c={c}
          mt={mobile ? 1 : 0.5}
          numberOfLines={mobile ? 1 : null}
        >
          <CommentEl post={post} c={c} postUrl={postUrl} noLink={noLink} />
          <TagEl post={post} c={c} noLink={noLink} community={community} />
        </View>
      ) : null}
      {children}
    </View>
  );
}

CommentEl.propTypes = {
  post: PropTypes.object,
  noLink: PropTypes.bool,
  c: PropTypes.string
};

export function CommentEl({ post, noLink, c }) {
  const dispatch = useDispatch();
  const parentPost = post.parentPost || post;

  const currentCommunity = useSelector(state => state.auth.community);
  const postCommunity = post && post.data && post.data.community;
  const community = postCommunity || currentCommunity;
  const postUrl = getPostUrl(community, parentPost);
  if (!post.commentCount) return null;

  return (
    <ULink
      type="text"
      to={postUrl}
      hu
      noLink={noLink}
      onPress={() => dispatch(goToPost(post))}
      inline={1}
    >
      <SecondaryText mr={1} c={c || colors.blue}>
        {post.commentCount} Comment{post.commentCount > 1 ? 's' : ''}
      </SecondaryText>
    </ULink>
  );
}

TagEl.propTypes = {
  post: PropTypes.object,
  noLink: PropTypes.bool,
  c: PropTypes.string
};

export function TagEl({ noLink, c, post }) {
  const tags = get(post, 'tags', []);
  const currentCommunity = useSelector(state => state.auth.community);
  const postCommunity = post && post.data && post.data.community;
  const community = postCommunity || currentCommunity;

  if (!tags.length) return null;

  return tags.map(tag => (
    <Tag
      name={tag}
      community={community || (post.data && post.data.community)}
      key={tag}
      noLink={noLink}
      c={c || colors.blue}
    />
  ));
}
