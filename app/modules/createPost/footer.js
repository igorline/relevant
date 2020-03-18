import React, { Fragment, memo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import {
  setCreatePostState,
  clearCreatePost
} from 'modules/createPost/createPost.actions';
import { View, Button, BodyText, LinkFont } from 'modules/styled/uni';
import { useCreatePost } from './hooks';

const CHAT_ENABLED = false;

export default memo(Footer);

Footer.propTypes = {
  close: PropTypes.func
};

function Footer({ close }) {
  const dispatch = useDispatch();
  const [{ submitting }, setStatus] = useState({ submitting: false, error: null });
  const user = useSelector(state => state.auth.user);
  const postData = useSelector(state => state.createPost);
  const { channel, postBody, edit, selectedTags } = postData;

  const handleCheckbox = e => setState({ [e.target.name]: e.target.checked });

  const clearPost = useCallback(() => dispatch(clearCreatePost()), [dispatch]);

  const createPost = useCreatePost({ close, clearPost, setStatus });

  const setState = state =>
    dispatch(
      setCreatePostState({
        ...postData,
        ...state
      })
    );

  const submitDisabled =
    submitting || !selectedTags.length || !postBody || !postBody.trim().length;
  const isAdmin = user && user.role === 'admin';

  return (
    <Fragment>
      <View mt={2} fdirection="row" justify="space-between">
        {isAdmin && CHAT_ENABLED && (
          <View fdirection="row" align={'center'} alignself={'center'}>
            <input
              checked={channel}
              type="checkbox"
              name={'channel'}
              onChange={handleCheckbox}
            />
            <BodyText ml={0.5}>This is a chat channel</BodyText>
          </View>
        )}
        <View fdirection="row" flex={1} justify="flex-end" align="center">
          <LinkFont mr={3} onClick={clearPost}>
            Clear
          </LinkFont>

          <Button
            onClick={() => !submitDisabled && createPost(postData)}
            disabled={submitDisabled}
            ml={2}
          >
            {edit ? 'Update Post' : 'Create Post'}
          </Button>
        </View>
      </View>
    </Fragment>
  );
}
