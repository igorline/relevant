import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { BodyText, ErrorBox, Box } from 'modules/styled/uni';
import { useSelector, useDispatch } from 'react-redux';
import { refreshTab } from 'modules/navigation/navigation.actions';
import { editPost } from 'modules/post/post.actions';
import { submitPost, generatePreviewServer } from 'modules/createPost/createPost.actions';
import { checkAuth } from 'modules/community/community.actions';
import BoxLogin from 'modules/auth/web/login.3box';
import ReactGA from 'react-ga';
import { alert } from 'app/utils';
import history from 'modules/navigation/history';

export function useCommunityAuth() {
  const dispatch = useDispatch();
  const [authError, setAuthError] = useState();
  const user = useSelector(state => state.auth.user);
  const ethAddress = user && user.ethLogin;
  useEffect(() => {
    const sendAuthRequtest = async () => {
      const err = await dispatch(checkAuth());
      err &&
        setAuthError({
          component: (
            <Fragment>
              <ErrorBox align={'flex-start'}>
                <BodyText>{err.message}</BodyText>
                {!ethAddress && (
                  <Fragment>
                    <Box mt={3} />
                    <BoxLogin type={'metamask'} text={'Connect your Ethereum Address'} />
                  </Fragment>
                )}
              </ErrorBox>
            </Fragment>
          )
        });
    };
    sendAuthRequtest();
  }, [dispatch, ethAddress]);
  return authError;
}

export function useCreatePost({ close, clearPost, setStatus }) {
  const community = useSelector(state => state.auth.community);
  const dispatch = useDispatch();

  const createPost = async postData => {
    setStatus({ submitting: true, error: null });
    const {
      selectedTags,
      postUrl,
      urlPreview,
      edit,
      mentions,
      domain,
      channel,
      title,
      postBody,
      editPost: originalPost
    } = postData;

    const image = urlPreview ? urlPreview.image : null;

    try {
      const validate = validateInput({ postBody, selectedTags, setStatus });
      if (validate !== true) throw new Error(validate);

      let newPost = {
        url: postUrl || postUrl,
        tags: selectedTags,
        body: postBody,
        title: urlPreview ? urlPreview.title : title,
        description: urlPreview ? urlPreview.description : null,
        image,
        mentions,
        domain,
        channel
      };

      if (edit) {
        newPost = { ...originalPost, ...newPost };
        const success = await dispatch(editPost(newPost));
        if (success) {
          clearPost();
          history.push(history.location.pathname);
          if (close) close();
        }
        return;
      }

      newPost = await dispatch(submitPost(newPost));
      if (!newPost) throw new Error('Something went wrong... please try again');

      close && close();
      clearPost();

      history.push(`/${community}/new/`);
      dispatch(refreshTab('discover'));

      ReactGA.event({
        category: 'User',
        action: 'Created a Post'
      });

      setStatus({ submitting: false, error: null });
    } catch (err) {
      alert.browserAlerts.alert(err.message);
      setStatus({ error: err.message, submitting: false });
    }
  };

  return useCallback(createPost, [community, dispatch, clearPost, close, setStatus]);
}

function validateInput({ postBody, selectedTags, setStatus }) {
  if (!selectedTags.length) {
    setStatus({ error: 'Please select at least one topic' });
    return 'Please select at least one topic';
  }
  if (!postBody || !postBody.trim().length) {
    setStatus({ error: 'Please write something' });
    return 'Can not create empty post';
  }
  return true;
}

export function usePreview(setState) {
  const dispatch = useDispatch();

  const createPreview = async ({ postUrl, postBody }) => {
    try {
      setState({
        loadingPreview: true,
        urlPreview: {
          loading: true
        }
      });

      const preview = await dispatch(generatePreviewServer(postUrl));
      if (!preview || !preview.url) throw new Error("Couldn't generate preview");

      const images = preview.image;
      const imageURL = images && images.indexOf(', ') ? images.split(', ')[0] : images;

      setState({
        domain: preview.domain,
        // postBody: postBody.replace(urlText, '').trim(),
        // postUrl: preview.url,
        url: preview.url,
        loadingPreview: false,
        keywords: preview.keywords,
        postTags: preview.keywords,
        urlPreview: {
          ...preview,
          image: imageURL,
          title: preview.title || 'Untitled',
          loading: false,
          tags: []
        },
        linkPreview: {
          ...preview,
          image: imageURL
        }
      });
    } catch (err) {
      setState({ failedUrl: postUrl, loadingPreview: false, postBody });
    }
  };
  return createPreview;
}
