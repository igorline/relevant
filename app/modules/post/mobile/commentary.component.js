import React, { PureComponent } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { globalStyles, fullWidth, mainPadding } from 'app/styles/global';
import Pills from 'modules/ui/mobile/pills.component';
import { Image, Divider, View, Box } from 'modules/styled/uni';
import {
  PanGestureHandler,
  NativeViewGestureHandler
} from 'react-native-gesture-handler';
import { registerGesture } from 'modules/navigation/navigation.actions';
import ButtonContainer from 'modules/post/mobile/postButtons.container';
import { DrawerGestureContext } from 'react-navigation-drawer';
import { TabViewContext } from 'modules/discover/mobile/discoverTabContext';
import CommentBody from 'modules/comment/commentBody';
import PostInfo from './postInfo.component';

let styles;

class Commentary extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    post: PropTypes.object,
    link: PropTypes.object,
    users: PropTypes.object,
    auth: PropTypes.object,
    singlePost: PropTypes.bool,
    tooltip: PropTypes.bool,
    focusInput: PropTypes.func,
    commentary: PropTypes.array,
    preview: PropTypes.bool,
    avatarText: PropTypes.func,
    isReply: PropTypes.bool,
    connectedActions: PropTypes.object,
    gesture: PropTypes.object
  };

  scrollView = React.createRef();

  panRef = React.createRef();

  listRef = React.createRef();

  tapRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      currentIndex: 0,
      scrollEnabled: true
    };
    this.renderItem = this.renderItem.bind(this);
    this.onScrollEnd = this.onScrollEnd.bind(this);
    this.scrollToPage = this.scrollToPage.bind(this);
    this.x = 0;
    this.scrollOffset = 0;
    this.maxOffset = 10000;
  }

  onScrollEnd(e) {
    const { contentOffset } = e.nativeEvent;
    const viewSize = e.nativeEvent.layoutMeasurement;

    // Divide the horizontal offset by the width of the view to see which page is visible
    const pageNum = Math.floor(contentOffset.x / viewSize.width);
    this.setState({ currentIndex: pageNum });
  }

  goToPost() {
    const { post, actions } = this.props;
    if (!post || !post._id) return;
    actions.goToPost(post);
  }

  scrollToPage(p) {
    this.scrollView.current.scrollToIndex({ index: p });
  }

  renderItem({ item, index }) {
    const {
      link,
      users,
      actions,
      auth,
      singlePost,
      focusInput,
      tooltip,
      preview,
      isReply,
      avatarText
    } = this.props;

    const i = index;

    const post = { ...item };
    if (!post) return null;

    const user = users[post.user] || post.embeddedUser;
    const hideButtons = preview;

    return (
      <Box
        key={post._id + i}
        style={[
          styles.commentaryContainer,
          preview ? { width: 'auto', flex: 1 } : null,
          preview ? { marginHorizontal: 0, marginTop: 16 } : null
        ]}
      >
        {isReply && !preview ? <Divider /> : null}
        <Box style={[styles.commentary]}>
          <View flex={1} fdirection={'row'} m={`2 0 ${preview ? 0 : 2} 0`}>
            {isReply && !preview ? (
              <Image
                h={2}
                w={2}
                mt={1}
                mr={1}
                resizeMode={'contain'}
                source={require('app/public/img/reply.png')}
              />
            ) : null}
            <Box style={{ flex: 1 }}>
              <PostInfo
                big
                post={post}
                actions={actions}
                auth={auth}
                singlePost={singlePost}
                user={user}
                avatarText={avatarText}
                preview={preview}
              />
              <Box
                style={[
                  {
                    marginTop: preview && !post.link && !post.parentPost ? 0 : 16,
                    flex: 1,
                    justifyContent: 'center',
                    marginLeft: avatarText ? 6 * 8 : 0
                  }
                ]}
              >
                <CommentBody
                  community={'relevant'}
                  comment={post}
                  preview={preview}
                  inMainFeed={!singlePost && !preview}
                />
              </Box>
              {!hideButtons && (
                <Box m={'2 0'}>
                  <ButtonContainer
                    horizontal
                    post={post}
                    parentPost={post.parentPost ? post.parentPost : post}
                    comment={post}
                    link={link}
                    tooltip={index === 0 ? tooltip : null}
                    comments={post.comments || null}
                    actions={actions}
                    auth={auth}
                    focusInput={focusInput}
                    singlePost={singlePost}
                  />
                </Box>
              )}
            </Box>
          </View>
        </Box>
      </Box>
    );
  }

  handleGesture = e => {
    const { gesture, connectedActions } = this.props;
    const { scrollEnabled } = this.state;
    const { translationX, state } = e.nativeEvent;
    if (gesture !== this.listRef && state === 2) {
      connectedActions.registerGesture(this.listRef);
    }

    if (state === 2) return;
    const offset = translationX;

    const leftEnd = this.scrollOffset - offset <= 0 && offset > 0;
    const rightEnd = this.scrollOffset - offset >= this.maxOffset;

    const shouldDisableScroll = leftEnd || rightEnd;
    const shouldEnableScroll = !shouldDisableScroll || state === 5;

    shouldDisableScroll && scrollEnabled && this.setState({ scrollEnabled: false });
    shouldEnableScroll && !scrollEnabled && this.setState({ scrollEnabled: true });
  };

  render() {
    const { commentary, preview, isReply } = this.props;
    const { scrollEnabled } = this.state;
    const pills = (
      <Box style={{ marginVertical: 16 }}>
        <Pills
          changed={this.state.changed}
          currentIndex={this.state.currentIndex}
          slides={commentary.map((c, i) => i + 1)}
          scrollToPage={this.scrollToPage}
        />
      </Box>
    );

    return (
      <Box style={{ marginBottom: !preview ? 16 : 0 }}>
        {isReply && !preview ? <Divider m={'0 2'} /> : null}
        <TabViewContext.Consumer>
          {tabView => (
            <DrawerGestureContext.Consumer>
              {drawer => (
                <PanGestureHandler
                  enabled={commentary.length > 1}
                  ref={this.panRef}
                  activeOffsetX={[-5, 5]}
                  onHandlerStateChange={this.handleGesture}
                  onGestureEvent={this.handleGesture}
                  simultaneousHandlers={[drawer, tabView, this.listRef]}
                >
                  <NativeViewGestureHandler
                    enabled={commentary.length > 1 && scrollEnabled}
                    ref={this.listRef}
                    shouldRecognizeSimultaneously
                    // simultaneousHandlers={[drawer, tabView, this.panRef]}
                    // waitFor={this.state.scrollEnabled ? [] : [drawer, tabView]}
                  >
                    <FlatList
                      style={{ marginTop: !preview ? 16 : 0 }}
                      ref={this.scrollView}
                      shouldActivateOnStart={false}
                      scrollEnabled={commentary.length > 1 && scrollEnabled}
                      scrollEventThrottle={30}
                      scrollToOverflowEnabled={false}
                      alwaysBounceHorizontal={false}
                      bounces={false}
                      onScroll={e => {
                        const { x } = e.nativeEvent.contentOffset;
                        const length = e.nativeEvent.layoutMeasurement.width;
                        this.scrollOffset = x;
                        this.maxOffset = length * (commentary.length - 1);
                      }}
                      keyExtractor={(item, index) => index.toString()}
                      horizontal={!preview}
                      data={commentary}
                      renderItem={this.renderItem}
                      pagingEnabled
                      contentContainerStyle={[!preview ? styles.postScroll : null]}
                      showsHorizontalScrollIndicator={false}
                      onMomentumScrollEnd={this.onScrollEnd}
                    />
                  </NativeViewGestureHandler>
                </PanGestureHandler>
              )}
            </DrawerGestureContext.Consumer>
          )}
        </TabViewContext.Consumer>
        {commentary.length > 1 ? pills : null}
      </Box>
    );
  }
}

function mapStateToProps(state) {
  return {
    gesture: state.navigation.gesture
  };
}

function mapDispatchToProps(dispatch) {
  return {
    connectedActions: bindActionCreators(
      {
        registerGesture
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Commentary);

const localStyles = StyleSheet.create({
  commentaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    width: fullWidth - mainPadding * 2,
    marginHorizontal: mainPadding
  },
  postScroll: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    marginLeft: 0,
    marginRight: 0
  },
  commentary: {
    flexGrow: 1,
    flexDirection: 'column'
  }
});

styles = { ...localStyles, ...globalStyles };
