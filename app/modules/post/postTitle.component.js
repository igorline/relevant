import React from 'react';
import PropTypes from 'prop-types';
import Tag from 'modules/tag/tag.component';
import get from 'lodash.get';
import ULink from 'modules/navigation/ULink.component';
import { View, Title, SecondaryText, InlineText } from 'modules/styled/uni';
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
      <InlineText>
        <ULink
          type="text"
          to={postUrl}
          hu
          noLink={noLink}
          onPress={() => actions.goToPost(post)}
        >
          <SecondaryText inline={1} c={c || colors.blue}>
            {post.commentCount} Comment{post.commentCount > 1 ? 's' : ''}
          </SecondaryText>
        </ULink>
        <InlineText>&nbsp;&nbsp;&nbsp; </InlineText>
      </InlineText>
    ) : null;

  const tagEl = tags.length ? (
    <InlineText c={c || colors.blue}>
      {tags.map(tag => (
        <Tag
          actions={actions}
          name={tag}
          community={community}
          key={tag}
          noLink={noLink}
          c={c || colors.blue}
        />
      ))}
    </InlineText>
  ) : null;

  const hasAuthor = link && link.articleAuthor && link.articleAuthor.length;
  const authorEl = hasAuthor ? (
    <InlineText numberOfLines={1}>
      {link.articleAuthor.join(', ')}
      {' • '}
    </InlineText>
  ) : null;

  const domainEl = get(link, 'domain') && (
    <InlineText numberOfLines={1}>
      <SecondaryText c={c} inline={1}>
        {authorEl}
      </SecondaryText>
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
    </InlineText>
  );

  // const userSet = new Set();
  // (get(post, 'commentary', []) || []).forEach(user => userSet.add(user.id));

  // const timestamp = getTimestamp(post.postDate);
  // const uniqueUsers = userSet.size - 1;
  // let postUser;
  // if (get(post, 'embeddedUser.handle')) {
  //   postUser = post.embeddedUser;
  // } else if (get(firstPost, 'embeddedUser.handle')) {
  //   postUser = firstPost.embeddedUser;
  // }

  // const userEl = get(postUser, 'handle') &&
  //   <TextView>
  //     <Text>Posted by: </Text>
  //     <ULink to={`/user/profile/${postUser.handle}`} disabled={!postUrl}>
  //       {`@${get(postUser, 'handle')}`}
  //     </ULink>
  //   </TextView>;

  return (
    <View fdirection={'column'} flex={1} justify={mobile ? 'center' : 'flex-start'}>
      <View>
        {titleEl}
        {/* {postUrl && timestamp }{' • '} */}
        <SecondaryText mt={mobile ? 1 : 0} c={c}>
          {domainEl}
        </SecondaryText>
      </View>
      {commentEl || tagEl ? (
        <SecondaryText c={c} mt={mobile ? 0 : 0.5} numberOfLines={mobile ? 1 : null}>
          <InlineText>
            {commentEl}
            {tagEl}
          </InlineText>
        </SecondaryText>
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
