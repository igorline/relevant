import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { refreshTab } from 'modules/navigation/navigation.actions';
import { editPost } from 'modules/post/post.actions';
import { submitPost, generatePreviewServer } from 'modules/createPost/createPost.actions';

import ReactGA from 'react-ga';
import { alert } from 'app/utils';
import history from 'modules/navigation/history';

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
