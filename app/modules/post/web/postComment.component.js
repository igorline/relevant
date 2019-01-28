import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import AvatarBox from 'modules/user/avatarbox.component';
import Avatar from 'modules/user/UAvatar.component';
import { CommentText } from 'modules/styled';
import styled from 'styled-components/primitives';
import ULink from 'modules/navigation/ULink.component';
import { sizing } from 'app/styles';


const Wrapper = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: ${sizing.byUnit(2)};
  padding-left: ${sizing.byUnit(0)};
`;

// const Wrapper = styled.View`
//   position: relative;
//   overflow: hidden;
//   padding-left: ${sizing.byUnit(0)};
//   flex-shrink: 1;
// /*  border-left-color: ${colors.lineColor};
//   border-left-width: 1px;
//   border-left-style: solid; */
// `;

const Container = styled.View`
  padding: 0 ${sizing.byUnit(1)};
  flex-shrink: 1;
  max-height: ${sizing.byUnit(4.5)};
  overflow: hidden;
`;

class PostComment extends Component {
  static propTypes = {
    auth: PropTypes.object,
    comment: PropTypes.object,
    postUrl: PropTypes.string,
  };

  render() {
    const { comment, auth, postUrl } = this.props;
    if (!comment || !comment.body || comment.body.length < 100) {
      return null;
    }
    return (
      <Wrapper>
        <Avatar
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
