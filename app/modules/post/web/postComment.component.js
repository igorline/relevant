import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import AvatarBox from 'modules/user/avatarbox.component';
import Avatar from 'modules/user/UAvatar.component';
import styled from 'styled-components/primitives';
import ULink from 'modules/navigation/ULink.component';
import { sizing, fonts } from 'app/styles';
import { View } from 'modules/styled/uni';

const CommentText = styled.Text`
  ${fonts.commentText}
`;

const Container = styled.View`
  padding: 0 ${sizing(1)};
  flex-shrink: 1;
  max-height: ${sizing(4.5)};
  overflow: hidden;
`;

class PostComment extends Component {
  static propTypes = {
    auth: PropTypes.object,
    comment: PropTypes.object,
    postUrl: PropTypes.string
  };

  render() {
    const { comment, auth, postUrl } = this.props;
    if (!comment || !comment.body) {
      return null;
    }
    return (
      <View mt={sizing(2)} fdirection={'row'} align={'center'}>
        <Avatar
          user={comment.embeddedUser}
          auth={auth}
          postTime={comment.postDate}
          setSelected={() => {
            console.warning('TODO:'); // eslint-disable-line
          }}
          showRelevance
        />
        <Container>
          <ULink to={postUrl}>
            <CommentText>{comment.body}</CommentText>
          </ULink>
        </Container>
      </View>
    );
  }
}

export default PostComment;
