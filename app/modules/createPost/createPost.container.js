import React, { Fragment, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { setCreatePostState } from 'modules/createPost/createPost.actions';
import { text } from 'app/utils';
import { View, SmallText, AbsoluteView, BodyText, Box } from 'modules/styled/uni';
import { Input } from 'modules/styled/web';
import AvatarBox from 'modules/user/avatarbox.component';
import PostInfo from 'modules/post/postinfo.component';
import { colors, sizing } from 'styles';
import { getTextData } from 'utils/text';
import { useCommunity } from 'modules/community/community.selectors';
import { usePrevious } from 'utils/hooks';
import TextAreaWithMention from 'modules/text/web/textAreaWithMention';
import TagsInput from './tags.input';
import Footer from './footer';
import { usePreview, useCommunityAuth } from './hooks';

const PLACEHOLDER_URL = "What's relevant?  Paste article URL.";
const PLACEHOLDER_TEXT =
  'Add your commentary, opinion, summary or a relevant quote from the article';

const MD_PLACEHOLDER =
  'Add text or paste a url here.\n\nYou can use Markdown:\n# Title\n**bold**\n`inline code`\n```code block```';

CreatePostContainer.propTypes = {
  close: PropTypes.func
};

export default function CreatePostContainer({ close }) {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const postData = useSelector(state => state.createPost);
  const community = useCommunity();
  const textArea = useRef();

  const authError = useCommunityAuth();

  const {
    title,
    channel,
    postBody,
    urlPreview,
    linkPreview,
    selectedTags,
    allTags,
    postUrl,
    loadingPreview,
    postTags,
    disableUrl
  } = postData;

  const setState = state => {
    dispatch(
      setCreatePostState({
        ...postData,
        ...state
      })
    );
  };

  // set our suggested topic from the community
  useEffect(() => {
    setState({ allTags: community.topics });
  }, [community.topics]); // eslint-disable-line

  // create url preview
  const prevUrl = usePrevious(postUrl);
  const createPreview = usePreview(setState);

  const clearUrl = (shouldDisableUrl = true) => {
    setState({
      url: null,
      postUrl: null,
      urlPreview: null,
      loadingPreview: false,
      postTags: [],
      disableUrl: shouldDisableUrl && true
    });
  };

  useEffect(() => {
    const shouldDisableUrl = false;
    if (!postUrl && urlPreview) clearUrl(shouldDisableUrl);
    else if (postUrl && prevUrl !== postUrl && !loadingPreview && !disableUrl) {
      createPreview({ postUrl, postBody });
    }
  }, [postUrl]); // eslint-disable-line

  const enableUrl = () => setState({ disableUrl: false });

  const prevDisableUrl = usePrevious(disableUrl);
  // process body on next tick once we enable url
  useEffect(() => {
    prevDisableUrl &&
      !disableUrl &&
      handleBodyChange({ target: { value: postBody } }) &&
      textArea.current.focus();
  }, [disableUrl]); // eslint-disable-line

  const handleBlur = () => {
    const { tags, mentions } = getTextData(postBody);
    const mergedTags = [...new Set([...selectedTags, ...tags])];
    setState({
      mentions,
      selectedTags: mergedTags
    });
  };

  const handleBodyChange = e => {
    const newBody = e.target.value;
    // TODO this may be expensive to do on every render we can skip some of it...
    const { url } = getTextData(newBody);
    const newUrl = url && url.url;

    // don't process url until we see a blank space or user pastes it
    const isPaste = newBody.length > postBody + 4;
    const doneTypingUrl = url && url.lastIndex !== newBody.length;
    const shouldUpdateUrl = doneTypingUrl || isPaste;

    const addUrlToState = !disableUrl && shouldUpdateUrl && { postUrl: newUrl };

    setState({
      postBody: newBody,
      ...addUrlToState
    });
  };

  const addTextFromLink = () =>
    handleBodyChange({
      target: { value: `${postBody}\n>"${text.stripHTML(urlPreview.description)}"` }
    });

  const showPasteButton = urlPreview && urlPreview.description;
  const placeholder = urlPreview ? PLACEHOLDER_TEXT : PLACEHOLDER_URL;
  const renderTags = postBody || postUrl;

  const suggestedTags = [...new Set([...allTags, ...postTags])];

  if (authError) return authError.component;

  return (
    <View>
      <View display="flex" fdirection="row" align="center">
        <AvatarBox user={user} size={4} />
      </View>
      {channel && (
        <Input
          onChange={e => setState({ title: e.target.value })}
          value={title}
          name="title"
          mt={2}
          type="text"
          placeholder="Title"
        />
      )}

      <View mt={2}>
        <TextAreaWithMention
          value={postBody}
          onChange={handleBodyChange}
          placeholder={community.defaultPost === 'text' ? MD_PLACEHOLDER : placeholder}
          withPreview
          textArea={textArea}
          minheight={22}
          onBlur={handleBlur}
          onSubmit={handleBlur}
        />
        {showPasteButton && <PasteTextButton addTextFromLink={addTextFromLink} />}
      </View>

      <Box mt={1} />
      <PostPreview
        clearUrl={clearUrl}
        urlPreview={urlPreview}
        linkPreview={linkPreview}
        PostPreview={PostPreview}
        enableUrl={enableUrl}
        disableUrl={disableUrl}
      />

      {renderTags && (
        <TagsInput
          setState={setState}
          selectedTags={selectedTags || []}
          allTags={suggestedTags || []}
        />
      )}

      <Footer close={close} />
    </View>
  );
}

PostPreview.propTypes = {
  urlPreview: PropTypes.object,
  linkPreview: PropTypes.object,
  clearUrl: PropTypes.func,
  enableUrl: PropTypes.func,
  disableUrl: PropTypes.bool
};

function PostPreview({ urlPreview, linkPreview, clearUrl, disableUrl, enableUrl }) {
  const screenSize = useSelector(state => state.navigation.screenSize);

  if (disableUrl)
    return (
      <View fdirection="row" align={'center'}>
        <input
          checked={!disableUrl}
          type="checkbox"
          name={'preivew'}
          onChange={enableUrl}
        />
        <BodyText ml={0.5}>Add Link Preview</BodyText>
      </View>
    );

  if (!urlPreview) return null;

  return (
    <Fragment>
      <PostInfo preview={!!screenSize} post={urlPreview} link={linkPreview} />
      <SmallText onPress={clearUrl} c={colors.blue} style={{ textAlign: 'right' }}>
        Remove Link Preview
      </SmallText>
    </Fragment>
  );
}

PasteTextButton.propTypes = {
  addTextFromLink: PropTypes.func
};

function PasteTextButton({ addTextFromLink }) {
  return (
    <AbsoluteView right={sizing(2)} bottom={sizing(3.5)}>
      <SmallText
        c={colors.blue}
        onPress={e => {
          e.preventDefault();
          addTextFromLink();
        }}
      >
        Paste article description
      </SmallText>
    </AbsoluteView>
  );
}
