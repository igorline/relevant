import React, { Component } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles, fullWidth, mainPadding, borderGrey } from 'app/styles/global';
import Pills from 'modules/ui/mobile/pills.component';
import { Image, Divider, View } from 'modules/styled/uni';
// import UAvatar from 'modules/user/UAvatar.component';
import PostBody from './postBody.component';
import PostInfo from './postInfo.component';
import PostButtons from './postButtons.component';

let styles;

export default class Commentary extends Component {
  static propTypes = {
    actions: PropTypes.object,
    post: PropTypes.object,
    link: PropTypes.object,
    users: PropTypes.object,
    auth: PropTypes.object,
    // myPostInv: PropTypes.object,
    singlePost: PropTypes.bool,
    tooltip: PropTypes.bool,
    focusInput: PropTypes.func,
    commentary: PropTypes.array,
    navigation: PropTypes.object,
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
                navigation={this.props.navigation}
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
                navigation={this.props.navigation}
                avatarText={this.props.avatarText}
                preview={preview}
              />
              {!hideButtons && (
                <PostButtons
                  post={post}
                  parentPost={post.parentPost ? post.parentPost : post}
                  comment={post}
                  link={link}
                  tooltip={index === 0 ? tooltip : null}
                  comments={post.comments || null}
                  actions={actions}
                  auth={auth}
                  // myPostInv={myPostInv[post._id]}
                  focusInput={focusInput}
                  navigation={this.props.navigation}
                />
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
          scrollEnabled={commentary.length > 1}
          keyExtractor={(item, index) => index.toString()}
          horizontal={!preview}
          data={commentary}
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
