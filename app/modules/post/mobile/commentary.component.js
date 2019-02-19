import React, { Component } from 'react';
import { StyleSheet, View, Image, Text, FlatList, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles, fullWidth, mainPadding, borderGrey } from 'app/styles/global';
import Pills from 'modules/ui/mobile/pills.component';
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
    posts: PropTypes.object,
    auth: PropTypes.object,
    myPostInv: PropTypes.object,
    singlePost: PropTypes.bool,
    tooltip: PropTypes.bool,
    focusInput: PropTypes.func,
    commentary: PropTypes.array,
    navigation: PropTypes.object
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
      posts,
      actions,
      auth,
      singlePost,
      focusInput,
      tooltip,
      myPostInv
    } = this.props;

    const i = index;
    let repostEl;
    let postStyle;

    let post = { ...item };
    const user = users[post.user] || post.embeddedUser;

    if (post.repost) {
      postStyle = [styles.repost];
      let repost = posts.posts[post.repost.post];
      if (!repost) repost = { body: '[deleted]' };

      const repostUser = users[repost.user] || repost.embeddedUser;

      repostEl = (
        <View style={{ marginBottom: 0 }}>
          <PostInfo
            repost
            actions={actions}
            auth={auth}
            post={post}
            user={repostUser}
            navigation={this.props.navigation}
          />
          <PostBody
            repost
            actions={actions}
            auth={auth}
            post={{
              _id: repost._id,
              body: post.repost.commentBody
            }}
            navigation={this.props.navigation}
          />
        </View>
      );
      post = { ...repost };
    }

    let repostedBy;
    if (post.reposted && post.reposted.length && this.props.link) {
      let and = '';
      if (post.reposted.length > 2) {
        and = ' and ' + (post.reposted.length - 1) + ' others';
      }
      if (post.reposted.length === 2) {
        and = ' and @' + post.reposted[1].user;
      }
      repostedBy = (
        <View>
          <TouchableOpacity onPress={() => actions.goToPost(post)}>
            <View style={styles.textRow}>
              <Image
                resizeMode={'contain'}
                source={require('app/public/img/reposted.png')}
                style={{ width: 8, height: 13 }}
              />
              <Text style={[styles.font12, styles.darkGrey, { lineHeight: 14 }]}>
                {' '}
                reposted by @{post.reposted[0].user + and}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View key={post._id + i} style={styles.commentaryContainer}>
        <View style={[styles.commentary]}>
          {repostEl}
          {repostedBy}
          <View style={[{ flex: 1 }, postStyle]}>
            <PostInfo
              big
              post={post}
              actions={actions}
              auth={auth}
              singlePost={singlePost}
              user={user}
              navigation={this.props.navigation}
            />
            <PostBody
              short
              post={post}
              editing={false}
              actions={actions}
              auth={auth}
              singlePost={singlePost}
              navigation={this.props.navigation}
            />
            <PostButtons
              post={post}
              link={link}
              tooltip={index === 0 ? tooltip : null}
              comments={post.comments || null}
              actions={actions}
              auth={auth}
              myPostInv={myPostInv[post._id]}
              focusInput={focusInput}
              navigation={this.props.navigation}
            />
          </View>
        </View>
      </View>
    );
  }

  render() {
    const { commentary } = this.props;
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
      <View style={{ marginVertical: 16 }}>
        <FlatList
          ref={c => (this.scrollView = c)}
          scrollEnabled={commentary.length > 1}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          data={commentary}
          renderItem={this.renderItem}
          pagingEnabled
          contentContainerStyle={[styles.postScroll]}
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
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'column'
  },
  repost: {
    borderLeftColor: borderGrey,
    borderLeftWidth: StyleSheet.hairlineWidth,
    paddingLeft: 10
  }
});

styles = { ...localStyles, ...globalStyles };
