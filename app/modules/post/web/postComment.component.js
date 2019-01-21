import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AvatarBox from 'modules/user/avatarbox.component';
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

const View = styled.View`
`;

const Text = styled.Text`
`;

class PostComment extends Component {
  static propTypes = {
    // post: PropTypes.shape({
    //   data: PropTypes.object
    // }),
    auth: PropTypes.object,
    comment: PropTypes.object,
  };

  render() {
    const { comment, auth } = this.props;
    if (!comment) {
      return null;
    }
    return (
      <Wrapper>
        <View>
          <AvatarBox
            user={comment.embeddedUser}
            auth={auth}
            date={comment.postDate}
          />
        </View>
        <Text className="postDescription">{comment.description}</Text>
        <Text>{comment.body}</Text>
      </Wrapper>
    );
  }
}

export default PostComment;
