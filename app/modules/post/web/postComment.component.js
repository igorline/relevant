import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AvatarBox from 'modules/user/web/avatarbox.component';
import Tag from 'modules/tag/web/tag.component';
import PostButtons from './postbuttons.component';
import styled from 'styled-components/primitives';
import {layout, colors } from 'app/styles/globalStyles';

const Wrapper = styled.View`
  position: relative;
  overflow: hidden;
  padding-left: 1em;
  margin-left: 1em;
  /* border-left: ${layout.borderStyles(colors.borderColor)} */
`;

function PostBody(props) {
  const { post, community, repost } = props;
  const { body } = post;
  const tags = (post.tags || []).map(tag => (
    <Tag {...props} name={tag} community={community} key={tag} />
  ));
  return (
    <div className={repost ? 'repostText' : ''}>
      <pre>{body}</pre> {tags}
    </div>
  );
}

PostBody.propTypes = {
  post: PropTypes.object,
  repost: PropTypes.object,
  community: PropTypes.string,
};

class PostComment extends Component {
  static propTypes = {
    post: PropTypes.shape({
      data: PropTypes.object
    }),
    repost: PropTypes.object,
    auth: PropTypes.object,
    showDescription: PropTypes.bool,
    community: PropTypes.string,
  };

  render() {
    const { post, repost, community, auth } = this.props;
    return (
      <Wrapper className="postBody">
        <PostBody auth={this.props.auth} community={community} repost={repost} post={post} />
        {repost && (
          <div className="repostBody">
            <AvatarBox
              user={repost.embeddedUser}
              auth={auth}
              date={post.postDate}
            />
            <div>
              <PostBody post={repost} community={community} />
            </div>
          </div>
        )}
        {this.props.showDescription && (
          <div className="postDescription">{post.description}</div>
        )}
      </Wrapper>
    );
  }
}

export default PostComment;
