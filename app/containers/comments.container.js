import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableHighlight,
  Dimensions,
  Keyboard,
  InteractionManager,
  ListView,
  RefreshControl,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
// import Spinner from 'react-native-loading-spinner-overlay';
import * as postActions from '../actions/post.actions';
import { globalStyles } from '../styles/global';
import Comment from '../components/comment.component';
import CustomSpinner from '../components/CustomSpinner.component';

require('../publicenv');

let styles;

class Comments extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      comment: null,
      visibleHeight: Dimensions.get('window').height,
      scrollView: ScrollView,
      scrollToBottomY: null,
    };
    this.renderRow = this.renderRow.bind(this);
    this.elHeight = null;
    this.loading = false;
    this.reload = this.reload.bind(this);
    this.dataSource = null;
    this.createComment = this.createComment.bind(this);
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      if (this.props.posts.selectedPostId) {
        this.props.actions.getComments(this.props.posts.selectedPostId, 0);
      }
      this.showListener = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this));
      this.hideListener = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide.bind(this));
    })
  }

  componentWillReceiveProps(next) {
    if (next.comments.index !== this.props.comments.index) {
      let ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      this.dataSource = ds.cloneWithRows(next.comments.index);
    }
  }

  componentDidUpdate(prev) {
    if (!prev) return;
    if (prev.comments.comments && prev.comments.comments !== this.props.comments.comments) {
      setTimeout(() => {
        this.scrollToBottom();
      }, 500);
    }
  }

  componentWillUnmount() {
    this.showListener.remove();
    this.hideListener.remove();
  }

  keyboardWillHide() {
    this.setState({ visibleHeight: Dimensions.get('window').height});
  }

  keyboardWillShow(e) {
    let newSize = (Dimensions.get('window').height - e.endCoordinates.height);
    this.setState({ visibleHeight: newSize });
  }


  scrollToBottom() {
    if (this.props.comments.comments.length < 7) return;
    let scrollDistance = this.state.scrollToBottomY - this.elHeight;
    this.state.scrollView.scrollTo({ x: 0, y: scrollDistance, animated: true });
  }

  createComment() {
    console.log('createComment')
    let commentObj = {
      post: this.props.posts.selectedPostId,
      text: this.state.comment,
      user: this.props.auth.user._id
    };
    this.props.actions.createComment(this.props.auth.token, commentObj);
    this.setState({ comment: null });
  }

  renderRow(rowData) {
    const self = this;
    return (
      <Comment styles={styles} {...self.props} comment={rowData} />
    );
  }

  reload() {
    console.log('reload');
    this.loading = true;
    this.props.actions.getComments(this.props.posts.selectedPostId, 0);
  }

  loadMore() {
    console.log('loadmore');
  }

  render() {
    let commentsEl = null;
    //console.log(this.dataSource, 'this.dataSource')
    if (this.dataSource) {
      commentsEl = (<ListView
        enableEmptySections
        removeClippedSubviews
        scrollEventThrottle={16}
        //onScroll={this.onScroll}
        dataSource={this.dataSource}
        renderRow={this.renderRow}
        automaticallyAdjustContentInsets={true}
        //contentInset={{ top: this.state.headerHeight }}
        //contentOffset={{ y: -this.state.headerHeight }}
        //contentContainerStyle={{
        //  position: 'absolute',
        //  top: 0,
        // }}
        // onEndReached={this.loadMore}
        onEndReachedThreshold={100}
        ref={(scrollView) => {
          this.state.scrollView = scrollView;
        }}
        onContentSizeChange={(height, width) => {
          this.state.scrollToBottomY = width;
        }}
        onLayout={(e) => {
          this.elHeight = e.nativeEvent.layout.height;
        }}        
        refreshControl={
          <RefreshControl
            refreshing={this.loading}
            onRefresh={this.reload}
            tintColor="#000000"
            colors={['#000000', '#000000', '#000000']}
            progressBackgroundColor="#ffffff"
          />
        }
      />);
    }

    return (
      <View style={{ backgroundColor: 'white', flex: 1 }}>
        {commentsEl}
        <View style={[styles.commentInputParent]}>
          <TextInput
            style={[styles.commentInput, styles.font15]}
            placeholder="Enter comment..."
            multiline={false}
            onChangeText={comment => this.setState({ comment })}
            value={this.state.comment}
            returnKeyType="done"
          />
          <TouchableHighlight
            underlayColor={'transparent'}
            style={[styles.commentSubmit]}
            onPress={() => this.createComment()}
          >
            <Text style={[styles.font15, styles.active]}>Submit</Text>
          </TouchableHighlight>
        </View>
        <CustomSpinner visible={!this.dataSource} />
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  commentInputParent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  commentInput: {
    height: 50,
    flex: 0.75,
    padding: 10,
  },
  commentSubmit: {
    flex: 0.25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

styles = { ...localStyles, ...globalStyles };

function mapStateToProps(state) {
  return {
    auth: state.auth,
    comments: state.comments,
    posts: state.posts
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...postActions,
      },
      dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Comments);

