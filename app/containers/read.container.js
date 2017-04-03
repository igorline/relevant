import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { globalStyles } from '../styles/global';
import Post from '../components/post/post.component';
import * as postActions from '../actions/post.actions';
import * as createPostActions from '../actions/createPost.actions';
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
    this.renderHeader = this.renderHeader.bind(this);
    this.tooltipParent = {};
    this.toggleTooltip = this.toggleTooltip.bind(this);
    this.initTooltips = this.initTooltips.bind(this);
    this.tabs = [
      { id: 0, title: 'Feed', type: 'feed' },
    ];
  }

  componentWillMount() {
    if (this.props.auth.user && this.props.posts.feedUnread) {
      this.props.actions.markFeedRead();
    }
  }

  componentWillReceiveProps(next) {
    if (this.props.refresh !== next.refresh) {
      this.scrollToTop();
    }
    if (this.props.reload !== next.reload) {
      this.needsReload = new Date().getTime();
    }
    if (this.props.auth.user && this.props.posts.feedUnread) {
      this.props.actions.markFeedRead();
    }
  }

  shouldComponentUpdate(next) {
    let tab = next.tabs.routes[next.tabs.index];
    if (tab.key !== 'read') return false;

    // console.log('updating read');
    // for (let p in next) {
    //   if (next[p] !== this.props[p]) {
    //     console.log(p);
    //     for (let pp in next[p]) {
    //       if (next[p][pp] !== this.props[p][pp]) console.log('--> ',pp);
    //     }
    //   }
    // }

    return true;
  }

  initTooltips() {
    ['subscriptions'].forEach(name => {
      this.props.actions.setTooltipData({
        name,
        toggle: () => this.toggleTooltip(name)
      });
    });
  }

  toggleTooltip(name) {
    if (!this.tooltipParent[name]) return;
    this.tooltipParent[name].measureInWindow((x, y, w, h) => {
      let parent = { x, y, w, h };
      // console.log(parent);
      if (x + y + w + h === 0) return;
      this.props.actions.setTooltipData({
        name,
        parent
      });
      this.props.actions.showTooltip(name);
    });
  }


  scrollToTop() {
    let view = this.listview;
    if (view) view.listview.scrollTo({ y: 0, animated: true });
  }

  load(view, length) {
    const tag = this.props.posts.tag;

    if (!view) view = 0;
    if (!length) length = 0;

    if (length === 0) this.props.actions.getSubscriptions();

    this.props.actions.getFeed(length, tag);
  }

  goTo(view) {
    this.props.navigator.push({
      key: view.name,
      title: view.name,
      back: true
    });
  }

  renderHeader() {
    let { total, totalUsers } = this.props.subscriptions;
    if (!total) return null;
    setTimeout(this.initTooltips, 1000);

    return (
      <View
        style={styles.feedHeader}
        ref={c => this.tooltipParent.subscriptions = c}
      >
        <Text
          onPress={() => this.toggleTooltip('subscriptions')}
          style={[styles.font12, styles.greyText]}
        >
          You are subscribed to {total} post{total > 1 ? 's' : ''} from {totalUsers} user{totalUsers > 1 ? 's' : ''}
        </Text>
      </View>
    );
  }

  renderRow(rowData) {
    return (
      <Post post={rowData} {...this.props} styles={styles} />
    );
  }

  render() {
    // let messagesCount = null;
    // let recentMessages = [];
    // let thirstyHeader = null;
    // let messages = null;
    let feedEl = [];
    let filler;

    // if (this.props.messages.index.length > 0) {
    //   messages = this.props.messages.index;
    //   for (let x = 0; x < 4; x++) {
    //     recentMessages.push(
    //       <Text
    //         key={x}
    //         style={styles.recentName}
    //       >
    //         {x < 3 ? `${this.props.messages.index[x].from.name} ` : `${this.props.messages.index[x].from.name}`}
    //       </Text>
    //     );
    //   }
    // }

    if (!this.props.subscriptions.total) {
      filler = (
        <View>
          <Text style={[styles.libre, { fontSize: 40, textAlign: 'center' }]}>
            Upovote posts to subscribe to users
          </Text>
          <Text
            style={[styles.georgia, styles.discoverLink, styles.quarterLetterSpacing]}
            onPress={() => { this.props.actions.changeTab('discover'); }}
          >Click on 🔮<Text style={styles.active}> Discover</Text>
            &nbsp;to find the most relevant content & people
          </Text>
        </View>
      );
    } else {
      filler = (
        <View>
          <Text style={[styles.libre, { fontSize: 40, textAlign: 'center' }]}>
            Check back in a little while for new content
          </Text>
        </View>
      );
    }


    this.tabs.forEach((tab) => {
      let tabData = this.props.posts.feed;
      let loaded = this.props.posts.loaded.feed;
      let active = true;

      feedEl.push(
        <CustomListView
          ref={(c) => { this.listview = c; }}
          key={tab.id}
          data={tabData}
          loaded={loaded}
          renderRow={this.renderRow}
          renderHeader={this.renderHeader}
          load={this.load}
          view={tab.id}
          type={'posts'}
          parent={'feed'}
          active={active}
          needsReload={this.needsReload}
          actions={this.props.actions}
        >
          {filler}
        </CustomListView>
      );
    });

    if (this.props.messages.count > 0) {
      messagesCount = (
        <Text style={[styles.white, styles.messagesCount]}>
          {this.props.messages.count + ' New'}
        </Text>
      );
    }

    // if (this.props.messages.index && !this.props.error.read) {
    //   thirstyHeader = (
    //     <TouchableHighlight
    //       underlayColor={'transparent'}
    //       onPress={messages ? () => this.goTo({ name: 'messages' })
    //       : null}
    //     >
    //       <View style={[styles.thirstyHeader]}>
    //         <View style={{ paddingRight: 5 }}>
    //           <Text>👅💦</Text>
    //         </View>
    //         <View>
    //           <Text style={[{ fontWeight: '500' }, styles.darkGray]}>{messages ? 'Thirsty messages' : 'No messages'}</Text>
    //           <View style={styles.recentNames}>
    //             {recentMessages}
    //           </View>
    //         </View>
    //         <View style={{ justifyContent: 'flex-end', flex: 1, flexDirection: 'row' }}>
    //           {messagesCount}
    //         </View>
    //       </View>
    //     </TouchableHighlight>
    //   );
    // }

    return (
      <View style={[styles.fullContainer, { backgroundColor: 'hsl(0,0%,90%)' }]}>
        {/* thirstyHeader */}
        {feedEl}
        <ErrorComponent parent={'read'} reloadFunction={this.load} />
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  feedHeader: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'lightgrey',
    // marginHorizontal: 30,
    // borderBottomWidth: 8,
    // borderBottomColor: 'lightgrey',
  },
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
  discoverLink: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20
  }
});

styles = { ...localStyles, ...globalStyles };

function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    messages: state.messages,
    refresh: state.navigation.read.refresh,
    reload: state.navigation.read.reload,
    error: state.error.read,
    tabs: state.navigation.tabs,
    subscriptions: state.subscriptions,
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
      ...createPostActions
    }, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Read);
