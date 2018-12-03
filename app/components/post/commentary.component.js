import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { globalStyles, fullWidth, mainPadding, borderGrey } from '../../styles/global';
import PostBody from './postBody.component';
import PostInfo from './postInfo.component';
import PostButtons from './postButtons.component';
import Pills from '../common/pills.component';
import Tags from '../tags.component';

let styles;

export default class Commentary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentIndex: 0,
    };
    this.renderItem = this.renderItem.bind(this);
    this.onScrollEnd = this.onScrollEnd.bind(this);
    this.scrollToPage = this.scrollToPage.bind(this);
  }

  onScrollEnd(e) {
    let contentOffset = e.nativeEvent.contentOffset;
    let viewSize = e.nativeEvent.layoutMeasurement;

    // Divide the horizontal offset by the width of the view to see which page is visible
    let pageNum = Math.floor(contentOffset.x / viewSize.width);
    this.setState({ currentIndex: pageNum });
  }

  goToPost() {
    if (!this.props.actions || !this.props.post || !this.props.post._id) return;
    this.props.actions.goToPost(this.props.post);
  }

  scrollToPage(p) {
    this.scrollView.scrollToIndex({ index: p });
  }

  renderItem({ item, index }) {
    let link = this.props.link;
    let post = item;
    let i = index;
    let repostEl;
    let postStyle;

    post = { ...post };
    if (post.user && this.props.users[post.user]) post.user = this.props.users[post.user];

    if (post.repost) {
      // console.log(post)
      // if(!this.props.posts) return null;
      postStyle = [styles.repost];
      let repost = this.props.posts.posts[post.repost.post];
      if (!repost) repost = { body: '[deleted]' };
      if (repost.user && this.props.users[repost.user]) {
        repost.user = this.props.users[repost.user];
      }

      repostEl = (
        <View style={{ marginBottom: 0 }}>
          <PostInfo
            repost
            actions={this.props.actions}
            auth={this.props.auth}
            post={post}
            users={this.props.users}
          />
          <PostBody
            repost
            actions={this.props.actions}
            auth={this.props.auth}
            post={{ _id: repost._id, body: post.repost.commentBody }}
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
          <TouchableOpacity
            onPress={() => this.props.actions.goToPost(post)}
          >
            <View style={styles.textRow}>
              <Image
                resizeMode={'contain'}
                source={require('../../assets/images/reposted.png')}
                style={{ width: 8, height: 13 }}
              />
              <Text style={[styles.font12, styles.darkGrey, { lineHeight: 14 }]}>
                {' '}reposted by @{post.reposted[0].user + and}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    let myPostInv = this.props.myPostInv[post._id];

    return (
      <View
        key={post._id + i}
        style={styles.commentaryContainer}
      >
        <View
          style={[styles.commentary]}
        >
          {repostEl}
          {repostedBy}
          <View style={[{ flex: 1 }, postStyle]}>
            <PostInfo
              big
              post={post}
              actions={this.props.actions}
              auth={this.props.auth}
              singlePost={this.props.singlePost}
              users={this.props.users}
            />
            <PostBody
              short
              post={post}
              editing={false}
              actions={this.props.actions}
              auth={this.props.auth}
              singlePost={this.props.singlePost}
            />
            <PostButtons
              post={post}
              link={link}
              tooltip={index === 0 ? this.props.tooltip : null}
              // tooltip={this.props.tooltip}
              comments={post.comments || null}
              actions={this.props.actions}
              auth={this.props.auth}
              myPostInv={myPostInv}
              focusInput={this.props.focusInput}
            />
          </View>
        </View>
      </View>
    );
  }


  render() {
    let { commentary } = this.props
    let pills = (
      <View style={{ marginVertical: 15 }}>
        <Pills
          changed={this.state.changed}
          currentIndex={this.state.currentIndex}
          slides={commentary.map((c, i) => i + 1)}
          scrollToPage={this.scrollToPage}
        />
{/*       <Text style={[styles.smallInfo, {textAlign: 'center'}]}>
          Swipe for other's commentary 🤔
        </Text>*/}
      </View>
    );
    return (
      <View>
        <FlatList
          ref={c => this.scrollView = c}
          scrollEnabled={commentary.length > 1}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          data={commentary}
          renderItem={this.renderItem}
          pagingEnabled
          contentContainerStyle={[styles.postScroll]}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={this.onScrollEnd}
          // columnWrapperStyle={{ flex: 1 }}
        />
        {commentary.length > 1 ? pills : null }
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
    marginHorizontal: mainPadding,
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
    // flex: 1,
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'column',
  },
  repost: {
    borderLeftColor: borderGrey,
    borderLeftWidth: StyleSheet.hairlineWidth,
    paddingLeft: 10,
  },
});

styles = { ...localStyles, ...globalStyles };

