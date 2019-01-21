import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AvatarBox from 'modules/user/avatarbox.component';
// import PostButtons from './postbuttons.component';
import { ContentText } from 'modules/styled/Text.component';
import styled from 'styled-components/primitives';
import { layout, colors } from 'app/styles/globalStyles';

const Wrapper = styled.View`
  position: relative;
  overflow: hidden;
  padding-left: 1em;
  flex-shrink: 1;
  border-left-color: ${colors.borderColor};
  border-left-width: 1px;
  border-left-style: solid;
`;

const View = styled.View`
`;

const Text = styled.Text`
`;

class PostComment extends Component {
  static propTypes = {
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
            postTime={comment.postDate}
          />
        </View>
        <ContentText>{comment.body}</ContentText>
      </Wrapper>
    );
  }
}

export default PostComment;
