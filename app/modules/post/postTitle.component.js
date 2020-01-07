import React from 'react';
import PropTypes from 'prop-types';
import Tag from 'modules/tag/tag.component';
import get from 'lodash/get';
import ULink from 'modules/navigation/ULink.component';
import { View, Title, SecondaryText } from 'modules/styled/uni';
import { colors } from 'app/styles';

export default function PostTitle(props) {
  const {
    children,
    postUrl,
    post,
    link,
    community,
    title,
    noLink,
    mobile,
    actions,
    singlePost,
    preview
  } = props;

  const c = mobile ? colors.white : null;

  if (!post) return null;
  const tags = get(post, 'tags', []);
  const titleLines = preview && mobile ? 2 : 3;

  const titleEl = link ? (
    <ULink
      to={singlePost ? post.url : postUrl || '#'}
      external={singlePost}
      target={singlePost ? '_blank' : null}
      noLink={noLink}
      onPress={() => (singlePost ? actions.goToUrl(post.url) : actions.goToPost(post))}
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

  const commentEl =
    post.commentCount && postUrl ? (
      <ULink
        type="text"
        to={postUrl}
        hu
        noLink={noLink}
        onPress={() => actions.goToPost(post)}
        inline={1}
      >
        <SecondaryText mr={1} c={c || colors.blue}>
          {post.commentCount} Comment{post.commentCount > 1 ? 's' : ''}
        </SecondaryText>
      </ULink>
    ) : null;

  const tagEl = tags.length
    ? tags.map(tag => (
        <Tag
          actions={actions}
          name={tag}
          community={community}
          key={tag}
          noLink={noLink}
          c={c || colors.blue}
        />
      ))
    : null;

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
        onPress={() => actions.goToUrl(post.url)}
      >
        <SecondaryText c={c || null} inline={1}>
          {link.domain && `${link.domain}\u00A0\u2197\uFE0E`}
        </SecondaryText>
      </ULink>
    </View>
  );

  return (
    <View fdirection={'column'} flex={1} justify={mobile ? 'center' : 'flex-start'}>
      <View>
        {titleEl}
        <View mt={mobile ? 1 : 0} c={c}>
          {domainEl}
        </View>
      </View>
      {commentEl || tagEl ? (
        <View>
          <View
            fdirection={'row'}
            align={'flex-end'}
            h={2}
            style={{ overflow: 'hidden' }}
            c={c}
            mt={mobile ? 1 : 0.5}
            numberOfLines={mobile ? 1 : null}
          >
            {commentEl}
            {tagEl}
          </View>
        </View>
      ) : null}
      {children}
    </View>
  );
}

PostTitle.propTypes = {
  preview: PropTypes.bool,
  singlePost: PropTypes.bool,
  mobile: PropTypes.bool,
  noLink: PropTypes.bool,
  children: PropTypes.node,
  link: PropTypes.object,
  post: PropTypes.object,
  community: PropTypes.string,
  postUrl: PropTypes.string,
  title: PropTypes.string,
  actions: PropTypes.object
};
