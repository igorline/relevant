import React, { Component } from 'react';
import {
  Text,
  View,
  ListView,
  StyleSheet,
  TouchableHighlight,
  InteractionManager,
  RefreshControl
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { globalStyles } from '../styles/global';
import Post from '../components/post.component';
import * as postActions from '../actions/post.actions';
import * as animationActions from '../actions/animation.actions';
import * as investActions from '../actions/invest.actions';
import * as authActions from '../actions/auth.actions';
import CustomSpinner from '../components/CustomSpinner.component';
import * as userActions from '../actions/user.actions';
import * as tagActions from '../actions/tag.actions';
import * as navigationActions from '../actions/navigation.actions';
import ErrorComponent from '../components/error.component';

const localStyles = StyleSheet.create({
  thirstyHeader: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
    padding: 10,
    flexDirection: 'row'
  },
  messagesCount: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  recentNames: {
    flexDirection: 'row',
  },
  recentName: {
    color: 'gray'
  },
  readHeader: {
    marginBottom: 10
  },
});

let styles = { ...localStyles, ...globalStyles };

class Read extends Component {
  constructor(props, context) {
    super(props, context);
    this.renderFeedRow = this.renderFeedRow.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.reload = this.reload.bind(this);
  }

  componentWillMount() {
    InteractionManager.runAfterInteractions(() => {
      this.reload();
    });
  }

  componentWillReceiveProps(next) {
    if (next.posts.feed !== this.props.posts.feed) {
      let fd = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      this.feedData = fd.cloneWithRows(next.posts.feed);
      this.loading = false;
      this.refresh = false;
    }

    if (next.error) this.loading = false;

    if (this.props.refresh !== next.refresh) {
      this.triggerReload();
    }

    // if (this.props.posts.newFeedAvailable !== next.posts.newFeedAvailable) {
    //   if (next.posts.newFeedAvailable) console.log('newFeedAvailable');
    // }
  }

  triggerReload() {
    // setTimeout(() => this.reload(), 100);
    if (this.listview) this.listview.scrollTo({ y: 0, animated: true });
    this.setState({});
  }

  reload() {
    const self = this;
    console.log('refresh', this);

    if (this.props.error) {
      this.props.actions.getUser((data) => {
        console.log(data, 'reload getUser response');
        if (data) self.loadPosts(0);
      })
    } else {
      this.loadPosts(0);
    }
  }

  loadMore() {
    const length = this.props.posts.feed.length;
    this.loadPosts(length);
  }

  loadPosts(length, _tag) {
    if (this.loading) return;
    this.loading = true;
    if (length === 0) this.refresh = true;
    const tag = typeof _tag !== 'undefined' ? _tag : this.props.posts.tag;
    this.props.actions.getFeed(length, tag);
  }

  goTo(view) {
    this.props.navigator.push({
      key: view.name,
      title: view.name,
      back: true
    });
  }

  renderFeedRow(rowData) {
    return (
      <Post post={rowData} {...this.props} styles={styles} />
    );
  }

  render() {
    let postsEl = null;
    let messagesCount = null;
    let recentMessages = [];
    let thirstyHeader = null;
    let messages = null;

    if (this.props.messages.index.length > 0) {
      messages = this.props.messages.index;
      for (let x = 0; x < 4; x++) {
        recentMessages.push(
          <Text
            key={x}
            style={styles.recentName}
          >
            {x < 3 ? `${this.props.messages.index[x].from.name} ` : `${this.props.messages.index[x].from.name}`}
          </Text>
        );
      }
    }

    if (this.feedData && this.props.posts.feed.length && !this.props.error) {
      postsEl = (
        <ListView
          ref={(c) => { this.listview = c; }}
          enableEmptySections
          removeClippedSubviews={false}
          pageSize={3}
          initialListSize={3}
          dataSource={this.feedData}
          renderRow={this.renderFeedRow}
          onEndReached={this.loadMore}
          onEndReachedThreshold={100}
          refreshControl={
            <RefreshControl
              refreshing={this.refresh}
              onRefresh={this.reload}
              tintColor="#000000"
              colors={['#000000', '#000000', '#000000']}
              progressBackgroundColor="#ffffff"
            />
          }
        />
      );
    }

    if (this.feedData && this.props.posts.feed.length === 0) {
      postsEl = (<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={[{ fontWeight: '500' }, styles.darkGray]}>Nothing in yr feed bruh</Text></View>);
    }

    if (this.props.messages.count > 0) {
      messagesCount = (
        <Text style={[styles.white, styles.messagesCount]}>
          {this.props.messages.count + ' New'}
        </Text>
      );
    }

    if (this.props.messages.index && this.feedData && !this.props.error) {
      thirstyHeader = (
        <TouchableHighlight
          underlayColor={'transparent'}
          onPress={messages ? () => this.goTo({ name: 'messages' })
          : null}
        >
        <View style={[styles.thirstyHeader]}>
          <View style={{ paddingRight: 5 }}>
            <Text>👅💦</Text>
          </View>
          <View>
            <Text style={[{ fontWeight: '500' }, styles.darkGray]}>{messages ? 'Thirsty messages' : 'No messages'}</Text>
            <View style={styles.recentNames}>
              {recentMessages}
            </View>
          </View>
          <View style={{ justifyContent: 'flex-end', flex: 1, flexDirection: 'row' }}>
            {messagesCount}
          </View>
        </View>
      </TouchableHighlight>);
    }

    return (
      <View style={[styles.fullContainer, { backgroundColor: 'white' }]}>
        {thirstyHeader}
        {postsEl}
        <CustomSpinner visible={!this.feedData && !this.props.error} />
        <ErrorComponent reloadFunction={this.reload} />
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    messages: state.messages,
    users: state.user,
    refresh: state.navigation.read.refresh,
    error: state.error,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...postActions,
      ...animationActions,
      ...investActions,
      ...userActions,
      ...tagActions,
      ...navigationActions,
      ...authActions,
    }, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Read);

