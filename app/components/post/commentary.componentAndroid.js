import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ListView,
  Image,
  Text,
  FlatList,
} from 'react-native';
import { globalStyles, fullWidth } from '../../styles/global';
import PostBody from './postBody.component';
import PostInfo from './postInfo.component';
import PostButtons from './postButtons.component';
import Pills from '../common/pills.component';
import Tags from '../tags.component';

let styles;

const LAYOUT = 1;

export default class Commentary extends Component {

  componentWillMount() {
    this.state = {
      currentIndex: 0,
    };
    // this.changeRow = this.changeRow.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.onScrollEnd = this.onScrollEnd.bind(this);
  }

  // changeRow(event, changed) {
  //   console.log(event, changed)
  //   if (event && event.s1) this.setState({ currentIndex: event.s1 });
  //   if (changed && changed.s1) this.setState({ changed: changed.s1 });
  // }

  goToPost() {
    if (!this.props.actions || !this.props.post || !this.props.post._id) return;
    if (this.props.scene && this.props.scene.id === this.props.post._id) return;
    this.props.actions.goToPost(this.props.post);
  }

  onScrollEnd(e) {
    let contentOffset = e.nativeEvent.contentOffset;
    let viewSize = e.nativeEvent.layoutMeasurement;

    // Divide the horizontal offset by the width of the view to see which page is visible
    let pageNum = Math.floor(contentOffset.x / viewSize.width);
    this.setState({ currentIndex: pageNum });
    // console.log('scrolled to page ', pageNum);
  }


  renderItem({ item, index }) {
    let post = item;
    let i = index;
    let length = this.props.commentary.length - 1;
    let repostEl;
    let postStyle;

    post = { ...post };
    if (post.user && this.props.users[post.user]) post.user = this.props.users[post.user];
    let separator = i < this.props.commentary.length - 1 || false;

    if (post.repost) {
      postStyle = [styles.repost];
      let repost = this.props.posts.posts[post.repost.post];
      if (!repost) repost = { body: '[deleted]' };
      if (repost.user && this.props.users[repost.user]) {
        repost.user = this.props.users[repost.user];
      }
      post.user = this.props.users[post.user] || post.user;
      repostEl = (
        <View style={{ marginBottom: 0 }}>
          <PostInfo repost {...this.props} post={post} />
          <PostBody
            repost
            {...this.props}
            post={{ _id: repost._id, body: post.repost.commentBody }}
          />
        </View>
      );
      post = { ...repost };
    }

    let repostedBy;
    if (post.reposted && post.reposted.length && this.props.metaPost) {
      let and = '';
      if (post.reposted.length > 2) {
        and = ' and ' + (post.reposted.length - 1) + ' others';
      }
      if (post.reposted.length === 2) {
        and = ' and @' + post.reposted[1].user;
      }
      repostedBy = (
        <View style={styles.reposted}>
          <Text
            onPress={() => this.props.actions.goToPost(post)}
            style={[styles.font12, styles.darkGrey, { lineHeight: 14 }]}
          >
            <View style={{ width: 10, height: 8, marginBottom: -2 }}>
              <Image
                resizeMode={'contain'}
                source={require('../../assets/images/reposted.png')}
                style={{ width: 10, height: 9, marginBottom: -1 }}
              />
            </View>
            {' '}reposted by @{post.reposted[0].user + and}
          </Text>
        </View>
      );
    }


    return (
      <View
        key={post._id + i}
        style={{
          flex: 1,
          flexDirection: 'row',
          // justifyContent: 'space-around',
          alignItems: 'center',
          width: fullWidth - 20,
          marginHorizontal: 10,
          // width: length ? fullWidth - 10 - 20 : fullWidth - 20
        }}
      >
        <View
          style={[
            styles.commentary,
            // length ? styles.multi : null,
          ]}
        >
          {repostEl}
          {repostedBy}
          <View style={[{ flex: 1 }, postStyle]}>
            <PostInfo
              big
              {...this.props}
              post={post}
            />
            <PostBody
              short {...this.props}
              post={post}
              editing={false}
            />
            <PostButtons
              scene={this.props.scene}
              {...this.props}
              post={post}
              comments={post.comments || null}
            />
          </View>
        </View>
      </View>
    );
  }


  render() {
    let pills = (
      <View style={{ marginVertical: 15 }}>
{/*        <Text style={[styles.tabFont, styles.cLabel]}>
          Swipe for other's commentary 🤔
        </Text>*/}
        <Pills
          changed={this.state.changed}
          currentIndex={this.state.currentIndex}
          slides={this.props.commentary.map((c, i) => i + 1)}
        />
      </View>
    );
    return (
      <View>
        <FlatList
          keyExtractor={(item, index) => index}
          horizontal
          data={this.props.commentary}
          renderItem={this.renderItem}
          pagingEnabled
          contentContainerStyle={[styles.postScroll]}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={this.onScrollEnd}
        />
        {this.props.commentary.length > 1 ? pills : null }
      </View>

    );
  }

}

const localStyles = StyleSheet.create({
  reposted: {
    backgroundColor: 'white',
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
    backgroundColor: 'white',
    flexDirection: 'column',
  },
  vSeparator: {
    width: 0,
    flexDirection: 'column',
    marginVertical: 60,
    borderRightColor: 'black',
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  rightBorder: {
    // borderRightColor: 'black',
    // borderRightWidth: StyleSheet.hairlineWidth,
  },
  repost: {
    borderLeftColor: 'black',
    borderLeftWidth: StyleSheet.hairlineWidth,
    paddingLeft: 10,
  },
  multi: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
  },
  cLabel: {
    fontSize: 12,
    // paddingTop: 20,
    paddingBottom: 10,
    textAlign: 'center',
  },
});

styles = { ...localStyles, ...globalStyles };

