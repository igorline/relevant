import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ListView,
  Text,
} from 'react-native';
import { globalStyles, fullWidth } from '../../styles/global';
import PostBody from './postBody.component';
import PostInfo from './postInfo.component';
import PostButtons from './postButtons.component';
import Pills from '../common/pills.component';

let styles;

const LAYOUT = 1;

export default class Commentary extends Component {

  componentWillMount() {
    this.state = {
      currentIndex: null,
      changed: null,
    };
    this.changeRow = this.changeRow.bind(this);
  }


  changeRow(event, changed) {
    if (event && event.s1) this.setState({ currentIndex: event.s1 });
    if (changed && changed.s1) this.setState({ changed: changed.s1 });
  }

  render() {
    let length = this.props.commentary.length - 1;

    let commentary = this.props.commentary.map((post, i) => {
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


      return (
        <View
          key={post._id + i}
          style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: length ? fullWidth - 10 - 20: fullWidth - 20 }}
        >
          <View
            style={[
              styles.commentary,
              length ? styles.multi : null,
              // separator ? styles.rightBorder : null,
              // length ? styles.boxShadow : null,
            ]}
          >
            {repostEl}
            <View style={[{ flex: 1 }, postStyle]}>
              <PostInfo
                big
                // big={this.props.singlePost}
                {...this.props}
                post={post}
              />
              <PostBody
                short {...this.props}
                post={post}
                editing={false}
              />
              { LAYOUT === 1 ? <PostButtons
                scene={this.props.scene}
                {...this.props}
                post={post}
                comments={post.comments || null}
              /> : null}
            </View>
          </View>
          { separator ?
          <View style={styles.vSeparator}><View style={{ flex: 1 }} /></View> :
          null}
          <View><Text>{post.rank}</Text></View>
        </View>
      )}
    );


    return (
      <View>
        <ScrollView
          horizontal
          scrollEnabled={commentary.length > 1}
          decelerationRate={'fast'}
          showsHorizontalScrollIndicator={false}
          automaticallyAdjustContentInsets={false}
          contentInset={{ left: length ? 15 : 10, right: length ? 15 : 10 }}
          contentOffset={{ x: length ? -15 : -10 }}
          contentContainerStyle={[styles.postScroll]}
          snapToInterval={(fullWidth - 20 - 10)}
          snapToAlignment={'center'}
          scrollEventThrottle={1}
          onScroll={() => {
            this.props.actions.scrolling(true);
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(
              () => this.props.actions.scrolling(false), 300);
          }}
          onChangeVisibleRows={this.changeRow}
          forceSetResponder={() => {
            if (!length) return;
            this.props.actions.scrolling(true);
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(
              () => this.props.actions.scrolling(false), 80);
          }}
          // onScrollAnimationEnd={this.updateCurrent}
        >
          {commentary}
        </ScrollView>

      </View>);
  }

        // <Pills
        //   changed={this.state.changed}
        //   currentIndex={this.state.currentIndex}
        //   slides={commentary.map((c, i) => i + 1)}
        // />
}

const localStyles = StyleSheet.create({
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
    // marginRight: 2.5,
    // marginLeft: 2.5,
    // borderLeftColor: 'black',
    // borderLeftWidth: StyleSheet.hairlineWidth,
    // borderRightColor: 'black',
    // borderRightWidth: StyleSheet.hairlineWidth,
  }
});

styles = { ...localStyles, ...globalStyles };

