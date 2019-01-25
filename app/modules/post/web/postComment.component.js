import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AvatarBox from 'modules/user/avatarbox.component';
import { CommentText } from 'modules/styled';
import styled from 'styled-components/primitives';
import ULink from 'modules/navigation/ULink.component';
import { colors, sizing } from 'app/styles/globalStyles';

const Wrapper = styled.View`
  position: relative;
  overflow: hidden;
  padding-left: ${sizing.byUnit(2)};
  flex-shrink: 1;
  border-left-color: ${colors.lineColor};
  border-left-width: 1px;
  border-left-style: solid;
`;

const Container = styled.View`
  padding: ${sizing.byUnit(1)} 0;
`;

class PostComment extends Component {
  static propTypes = {
    auth: PropTypes.object,
    comment: PropTypes.object,
    postUrl: PropTypes.string,
  };

  render() {
    const { comment, auth, postUrl } = this.props;
    if (!comment) {
      return null;
    }
    return (
      <Wrapper>
        <AvatarBox
          user={comment.embeddedUser}
          auth={auth}
          postTime={comment.postDate}
          setSelected={() => { console.log('TODO:'); }}
          showRelevance
        />
        <Container>
          <ULink to={postUrl} >
            <CommentText>{comment.body}</CommentText>
          </ULink>
        </Container>
      </Wrapper>
    );
  }
}

export default PostComment;
