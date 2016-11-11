import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Post from '../components/post.component';
import * as postActions from '../actions/post.actions';
import * as animationActions from '../actions/animation.actions';
import * as investActions from '../actions/invest.actions';
import * as authActions from '../actions/auth.actions';
import * as userActions from '../actions/user.actions';
import * as tagActions from '../actions/tag.actions';
import * as navigationActions from '../actions/navigation.actions';
import ErrorComponent from '../components/error.component';
import CustomListView from '../components/customList.component';

let styles;

class Read extends Component {
  constructor(props, context) {
    super(props, context);
    this.renderRow = this.renderRow.bind(this);
    this.load = this.load.bind(this);
    this.needsReload = new Date().getTime();

    this.tabs = [
      { id: 0, title: 'Feed', type: 'feed' },
    ];
  }

  componentWillReceiveProps(next) {
    // if (next.error) this.loading = false;
    if (this.props.refresh !== next.refresh) {
      this.scrollToTop();
    }
  }

  scrollToTop() {
    let view = this.listview;
    if (view) view.listview.scrollTo({ y: 0, animated: true });
  }

  load(view, length) {
    if (!view) view = 0;
    if (!length) length = 0;
    const tag = this.props.posts.tag;
    this.props.actions.getFeed(length, tag);
  }

  goTo(view) {
    this.props.navigator.push({
      key: view.name,
      title: view.name,
      back: true
    });
  }

  renderRow(rowData) {
    if (rowData.fakePost){
      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: -50,
            width: fullWidth,
            height: fullHeight,
          }}>
          <Text
            style={[
              { fontWeight: '500' },
              styles.darkGray
            ]}>
            Nothing in yr feed bruh
          </Text>
        </View>
      );
    }
    return (
      <Post post={rowData} {...this.props} styles={styles} />
    );
  }

  render() {
    let messagesCount = null;
    let recentMessages = [];
    let thirstyHeader = null;
    let messages = null;
    let noPosts = null;

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

    let postsEl = this.tabs.map((tab) => {
      let tabData = this.props.posts.feed;
      let active = true;
      return (
        <CustomListView
          ref={(c) => { this.listview = c; }}
          key={tab.id}
          data={tabData}
          renderRow={this.renderRow}
          load={this.load}
          view={tab.id}
          active={active}
          needsReload={this.needsReload}
        />
      );
    });

    if (this.props.messages.count > 0) {
      messagesCount = (
        <Text style={[styles.white, styles.messagesCount]}>
          {this.props.messages.count + ' New'}
        </Text>
      );
    }

    if (this.props.messages.index && this.feedData && !this.props.error.read) {
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
       <ErrorComponent parent={'read'} reloadFunction={this.load} />
      </View>
    );
  }
}

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

styles = { ...localStyles, ...globalStyles };

function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    messages: state.messages,
    users: state.user,
    refresh: state.navigation.read.refresh,
    error: state.error,
    navigation: state.navigation.tabs
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

