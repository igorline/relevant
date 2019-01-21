import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AvatarBox from 'modules/user/web/avatarbox.component';
// import PostButtons from './postbuttons.component';
import styled from 'styled-components/primitives';
import { layout, colors } from 'app/styles/globalStyles';

const Wrapper = styled.View`
  position: relative;
  overflow: hidden;
  padding-left: 1em;
  margin-left: 1em;
  /* border-left: ${layout.borderStyles(colors.borderColor)} */
`;

class PostComment extends Component {
  static propTypes = {
    post: PropTypes.shape({
      data: PropTypes.object
    }),
    repost: PropTypes.object,
    auth: PropTypes.object,
    showDescription: PropTypes.bool,
    // community: PropTypes.string,
  };

  render() {
    const { comment, auth } = this.props;
    if (!comment) {
      return null;
    }
    return (
      <Wrapper className="postBody">
        <div className="repostBody">
          <AvatarBox
            user={comment.embeddedUser}
            auth={auth}
            date={comment.postDate}
          />
        </div>
        <div className="postDescription">{comment.description}</div>
        <pre>{comment.body}</pre>
      </Wrapper>
    );
  }
}

export default PostComment;
