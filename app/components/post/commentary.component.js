import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
} from 'react-native';
import { globalStyles, fullWidth } from '../../styles/global';
import PostBody from './postBody.component';
import PostInfo from './postInfo.component';

let styles;

export default class Commentary extends Component {

  render() {
    let length = this.props.commentary.length;
    let commentary = this.props.commentary.map(post => {
      post = { ...post };
      if (this.props.users[post.user]) post.user = this.props.users[post.user];
      return (
        <View
          key={post._id}
          style={{ width: length ? fullWidth * 0.92 : fullWidth }}
        >
          <View
            style={[
              styles.commentary,
              styles.boxShadow,
            ]}
          >
            <PostInfo navigator={this.props.navigator} post={post} />
            <PostBody short {...this.props} post={post} editing={false} />
          </View>
        </View>
      )}
    );

    return (
      <ScrollView
        horizontal
        scrollEnabled={commentary.length > 1}
        decelerationRate={'fast'}
        showsHorizontalScrollIndicator={false}
        automaticallyAdjustContentInsets={false}
        contentContainerStyle={styles.postScroll}
        snapToInterval={(fullWidth * 0.92) + 8}
        snapToAlignment={'center'}
        // onScrollAnimationEnd={this.updateCurrent}
      >
        {commentary}
      </ScrollView>);
  }
}

const localStyles = StyleSheet.create({
  postScroll: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    marginLeft: 10,
    paddingRight: 10
  },
  commentary: {
    flex: 1,
    marginRight: 5,
    marginLeft: 5,
    marginTop: 3,
    marginBottom: 10,
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 25,
  },
});

styles = { ...localStyles, ...globalStyles };

