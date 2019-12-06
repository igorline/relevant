import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles, fullWidth, mainPadding, borderGrey } from 'app/styles/global';
import Pills from 'modules/ui/mobile/pills.component';
import { Image, Divider, View } from 'modules/styled/uni';
import {
  // PanGestureHandler,
  FlatList
  // TapGestureHandler,
  // State
} from 'react-native-gesture-handler';
import ButtonContainer from 'modules/post/mobile/postButtons.container';
import PostBody from './postBody.component';
import PostInfo from './postInfo.component';

let styles;

export default class Commentary extends Component {
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
    isReply: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.state = {
      currentIndex: 0
    };
    this.renderItem = this.renderItem.bind(this);
    this.onScrollEnd = this.onScrollEnd.bind(this);
    this.scrollToPage = this.scrollToPage.bind(this);
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
    this.scrollView.scrollToIndex({ index: p });
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
      // myPostInv,
      preview,
      isReply
    } = this.props;

    const i = index;
    let postStyle;

    const post = { ...item };
    if (!post) return null;

    const user = users[post.user] || post.embeddedUser;
    const hideButtons = preview;

    return (
      <View
        key={post._id + i}
        style={[
          styles.commentaryContainer,
          preview ? { width: 'auto', flex: 1 } : null,
          preview ? { marginHorizontal: 0, marginTop: 16 } : null
        ]}
      >
        {isReply && !preview ? <Divider /> : null}
        <View style={[styles.commentary]}>
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
            <View style={[postStyle, { flex: 1 }]}>
              <PostInfo
                big
                post={post}
                actions={actions}
                auth={auth}
                singlePost={singlePost}
                user={user}
                avatarText={this.props.avatarText}
                preview
              />
              <PostBody
                short
                post={post}
                editing={false}
                actions={actions}
                auth={auth}
                singlePost={singlePost}
                avatarText={this.props.avatarText}
                preview={preview}
              />
              {!hideButtons && (
                <View m={'2 0'}>
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
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  }

  render() {
    const { commentary, preview, isReply } = this.props;
    const pills = (
      <View style={{ marginVertical: 16 }}>
        <Pills
          changed={this.state.changed}
          currentIndex={this.state.currentIndex}
          slides={commentary.map((c, i) => i + 1)}
          scrollToPage={this.scrollToPage}
        />
      </View>
    );
    return (
      <View style={{ marginBottom: !preview ? 16 : 0 }}>
        {isReply && !preview ? <Divider m={'0 2'} /> : null}
        <FlatList
          style={{ marginTop: !preview ? 16 : 0 }}
          ref={c => (this.scrollView = c)}
          ref={this.scrollRef}
          // waitFor={enable ? this.ref : this.scrollRef}
          scrollEnabled={commentary.length > 1}
          scrollEventThrottle={16}
          onScroll={e => {
            const { x } = e.nativeEvent.contentOffset;
            const length = e.nativeEvent.layoutMeasurement.width;
            // const { length, offset } = this.scrollView.getItemLayout();
            // console.log(offset, length);
            this.scrollView.scrollEnabled = commentary.length > 1;
            if (x < 0 || x > length) {
              this.scrollView.scrollEnabled = false;
            }
          }}
          keyExtractor={(item, index) => index.toString()}
          horizontal={!preview}
          data={commentary}
          // getItemLayout={({ length, offset }) => {
          //   console.log(offset, length)
          //   this.scrollView.scrollEnabled = true;
          //   if (offset < 0 || offset > length) {
          //     this.scrollView.scrollEnabled = false;
          //   }
          // }}
          // bounces={false}
          renderItem={this.renderItem}
          pagingEnabled
          contentContainerStyle={[!preview ? styles.postScroll : null]}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={this.onScrollEnd}
        />

        {commentary.length > 1 ? pills : null}
      </View>
    );
  }
}

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
  },
  repost: {
    borderLeftColor: borderGrey,
    borderLeftWidth: StyleSheet.hairlineWidth,
    paddingLeft: 10
  }
});

styles = { ...localStyles, ...globalStyles };
