import React, { Component } from 'react';
import {
  View,
  Divider,
  LinkFont,
  CommentText,
  SecondaryText,
  Touchable
} from 'modules/styled/uni';
import get from 'lodash.get';
import PropTypes from 'prop-types';
import AvatarBox from 'modules/user/avatarbox.component';
import Popup from 'modules/ui/web/popup';
import PostButtons from 'modules/post/postbuttons.component';
import CommentForm from 'modules/comment/web/commentForm.component';
import { colors, sizing, mixins } from 'app/styles';
import styled from 'styled-components/primitives';

import ULink from 'modules/navigation/ULink.component';

if (process.env.BROWSER === true) {
  require('./comment.css');
}

const NESTING_UNIT = 8;

const Spacer = styled.View`
  ${mixins.margin}
  ${mixins.padding}
  display: flex;
  flex-direction: row;
  position: relative;
  background-color: ${(p) => p.bgColor || 'transparent'}
  padding-left: ${(p) => {
    if (p.nesting !== undefined && p.nesting !== null) {
      return sizing((p.nesting) * NESTING_UNIT);
    }
    return sizing(NESTING_UNIT);
  }}
  flex-grow: 1;
`;

const Container = styled.View`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 1;
`;

const PostButtonsContainer = styled.View`
  /* margin-right: ${sizing(4)}; */
  width: ${sizing(12)};
`;

const Actions = styled(View)`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;


class Comment extends Component {
  static propTypes = {
    actions: PropTypes.object,
    comment: PropTypes.object,
    user: PropTypes.object,
    auth: PropTypes.object,
    activeComment: PropTypes.string,
    setActiveComment: PropTypes.func,
    parentPost: PropTypes.object,
    childComments: PropTypes.object,
    posts: PropTypes.object,
    nesting: PropTypes.number,
    hidePostButtons: PropTypes.bool,
    condensedView: PropTypes.bool,
  };


  state = {
    editing: false,
    copied: false,
  };

  deletePost() {
    // TODO custom confirm
    // eslint-disable-next-line
    const okToDelete = confirm('Are you sure you want to delete this post?');
    if (!okToDelete) return;
    this.props.actions.deleteComment(this.props.comment._id);
  }

  editPost() {
    this.setState({ editing: true });
  }

  // TODO utils
  copyToClipboard = () => {
    const el = document.createElement('textarea');
    el.value = window.location;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    this.setState({ copied: true });
  }

  render() {
    const {
      auth, comment, activeComment,
      setActiveComment, childComments,
      posts, nesting, hidePostButtons, postUrl, condensedView, hideBorder,
      post
    } = this.props;
    if (!comment) return null;
    const { editing, copied } = this.state;
    let popup;
    const isActive = activeComment === comment.id;

    if (auth.user && auth.user._id === comment.user) {
      popup = (
        <Popup
          options={[
            { text: 'Edit Post', action: this.editPost.bind(this) },
            { text: 'Delete Post', action: this.deletePost.bind(this) }
          ]}
        >
          <span className={'optionDots'}>...</span>
        </Popup>
      );
    }

    const bodyMargin = condensedView ? '-0.5 0 2 5' : '3 0';
    let body = (
      <CommentText m={bodyMargin}>
        {comment.body}
      </CommentText>
    );

    if (postUrl) {
      body = <ULink to={postUrl} >
        {body}
      </ULink>;
    }

    const edit = (
      <CommentForm
        edit
        comment={comment}
        text={'Update'}
        cancel={() => this.setState({ editing: false })}
        {...this.props}
      />
    );

    const user = this.props.user.users[comment.embeddedUser.handle] || comment.embeddedUser;

    const commentChildren = get(childComments, comment.id) || [];

    return (
      <View>
        <Spacer nesting={nesting} m={'4 4 0 0'}>
          { !hidePostButtons ? <PostButtonsContainer>
            <PostButtons {...this.props} post={comment}/>
          </PostButtonsContainer> : null}
          <Container nesting={nesting}>
            <View fdirection={'row'} justify={'space-between'}>
              <AvatarBox
                user={{ ...user, _id: comment.user }}
                postTime={comment.createdAt}
                showRelevance
                condensedView={condensedView}
              />
              {popup}
            </View>
            {editing ? edit : body}
            <Actions ml={condensedView ? 5 : 0}>
              <Touchable onPress={() => { setActiveComment(comment.id); }}>
                <LinkFont mr={3} c={colors.blue}>Reply</LinkFont>
              </Touchable>
              <Touchable onPress={this.copyToClipboard}>
                <LinkFont mr={3} c={colors.blue}>Share</LinkFont>
              </Touchable>
              {copied && (<SecondaryText> - Link copied to clipboard</SecondaryText>)}
            </Actions>
            {!isActive && !hideBorder && <Divider pt={sizing(4)}/> }
          </Container>
        </Spacer>

        {isActive && (
          <Spacer
            nesting={nesting + 1.5}
            bgColor={colors.secondaryBG}
            p={4}
            mt={4}
          >
            <CommentForm
              isReply
              text={'Reply'}
              {...this.props}
              parentComment={comment}
              parentPost={post}
            />
          </Spacer>
        ) }
        {commentChildren.map(childId => (
          <Comment
            {...this.props}
            comment={posts.posts[childId]}
            key={childId}
            nesting={ nesting + 1}
          />
        ))}
      </View>
    );
  }
}
export default Comment;
