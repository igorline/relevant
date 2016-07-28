'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ScrollView,
  Linking,
  ListView,
  TouchableHighlight
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as userActions from '../actions/user.actions';
import * as tagActions from '../actions/tag.actions';
import * as animationActions from '../actions/animation.actions';
import * as messageActions from '../actions/message.actions';
require('../publicenv');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Post from '../components/post.component';
import * as investActions from '../actions/invest.actions';
import * as viewActions from '../actions/view.actions';
import Notification from '../components/notification.component';
import Spinner from 'react-native-loading-spinner-overlay';
var animations = require("../animation");

class Read extends Component {
  constructor (props, context) {
    super(props, context)
    var fd = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    var md = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      tag: null,
      enabled: true,
      feedData: null,
      messagesData: md.cloneWithRows([]),
      investAni: [],
    }
  }

  componentDidMount() {
    var self = this;
    self.props.actions.getMessages(self.props.auth.user._id);
    if (self.props.posts.feed && self.props.posts.tag) this.props.actions.clearPosts();
    if (self.props.posts.comments) this.props.actions.setComments(null);
    if (self.props.posts.feed) {
      if (self.props.posts.feed.length > 0) {
        var fd = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        self.setState({feedData: fd.cloneWithRows(self.props.posts.feed)});
      }
      if (self.props.posts.feed.length == 0) {
        this.props.actions.getFeed(self.props.auth.token, 0, null);
      }
    }
  }

  componentDidUpdate() {
    var self = this;
  }

  componentWillReceiveProps(next) {
    var self = this;
    if (next.posts.feed != self.props.posts.feed) {
      var fd = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      self.setState({feedData: fd.cloneWithRows(next.posts.feed)});
    }
    if (next.messages.index != self.props.messages.index) {
      var md = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      self.setState({messagesData: md.cloneWithRows(next.messages.index)});
    }
    if (self.props.animation != next.animation) {
      if (next.animation.bool) {
        if (next.animation.type == 'invest') {
          animations.investAni(self);
        }
      }
    }
  }

  setTag(tag) {
    var self = this;
    self.setState({tag: tag});
    self.props.actions.clearPosts();
    self.props.actions.getFeed(self.props.auth.token, 0, self.state.tag);
  }

  renderFeedRow(rowData) {
    var self = this;
      return (
        <Post post={rowData} {...self.props} styles={styles} />
      );
  }

  setTagAndRoute(tag) {
    var self = this;
    self.props.actions.setTag(tag);
    self.props.routes.Discover();
  }

  renderMessageRow(rowData) {
    var self = this;
    if (rowData.type == 'thirst') {
      return (<View style={styles.message}>
        <Text><Text style={styles.active} onPress={self.props.actions.getSelectedUser.bind(self, rowData.from._id)}>👅💦 {rowData.from.name}</Text> is thirsty 4 u:</Text>
        <Text>{rowData.text}</Text>
        </View>
      );
    } else {
      return (
        <Text>Message</Text>
      );
    }
  }

  onScroll() {
    var self = this;
    if (self.refs.feedlist.scrollProperties.offset + self.refs.feedlist.scrollProperties.visibleLength >= self.refs.feedlist.scrollProperties.contentLength) {
      self.loadMore();
    }
  }

  loadMore() {
    var self = this;
    var length = self.props.posts.feed.length;
     console.log('load more, skip: ', length);
    if (self.state.enabled) {
      self.setState({enabled: false});
        self.props.actions.getFeed(self.props.auth.token, length, self.state.tag);
      setTimeout(function() {
        self.setState({enabled: true})
      }, 1000);
    }
  }

  changeView(view) {
    var self = this;
    self.props.actions.setView('read', view);
  }

  render() {
    var self = this;
    var postsEl = null;
    var posts = null;
    var pages = null;
    var paginationEl = null;
    var tags = [];
    var tagsEl = null;
    var page = self.state.page;
    var taggedPosts = null;
    var messages = null;
    var messagesEl = null;
    var messagesCount = null;
    var recentMessages = [];
    var thirstyHeader = null;

    if (self.state.feedData) {
      if (self.state.feedData.length > 0) {
        postsEl = (<ListView ref="feedlist" renderScrollComponent={props => <ScrollView {...props} />} onScroll={self.onScroll.bind(self)} dataSource={self.state.feedData} renderRow={self.renderFeedRow.bind(self)} />)
      } else {
        postsEl = (<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}><Text>Nothing in yr feed bruh</Text></View>)
      }
    }

    if (self.props.messages.index.length > 0) {
      messagesEl = (<ListView ref="messageslist" renderScrollComponent={props => <ScrollView {...props} />} dataSource={self.state.messagesData} renderRow={self.renderMessageRow.bind(self)} />);
      for (var x = 0; x < 4; x++) {
        recentMessages.push(<Text style={styles.recentName}>{x < 3 ? self.props.messages.index[x].from.name+', ' : self.props.messages.index[x].from.name}</Text>);
      }
    } else {
      messagesEl = (<View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'red'}}><Text style={styles.darkGray}>Nothing in yr feed bruh</Text></View>)
    }

    if (self.props.auth.user.messages) {
       messagesCount = (<Text style={[styles.white, styles.messagesCount]}>{self.props.auth.user.messages+' New'}</Text>)
    }

    if (self.props.view.read == 1) {
      thirstyHeader = (<TouchableHighlight underlayColor={'transparent'} onPress={self.changeView.bind(self, 2)}>
            <View style={[styles.thirstyHeader]}>
              <View style={{paddingRight: 5}}>
                <Text>👅💦</Text>
              </View>
              <View>
                <Text style={[{fontWeight: '500'}, styles.darkGray]}>Thirsty responses</Text>
                <View style={styles.recentNames}>
                  {recentMessages}
                </View>
              </View>
              <View style={{justifyContent: 'flex-end',flex: 1}}>
                {messagesCount}
              </View>
            </View>
          </TouchableHighlight>);
    }

    return (
      <View style={styles.fullContainer}>
        {thirstyHeader}
        <Spinner color='rgba(0,0,0,1)' overlayColor='rgba(0,0,0,0)' visible={!self.state.feedData} />
       {self.props.view.read == 1 ? postsEl : null}
       {self.props.view.read == 2 ? messagesEl : null}
        <View pointerEvents={'none'} style={styles.notificationContainer}>
          <Notification />
        </View>
        {self.state.investAni}
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    user: state.user,
    router: state.routerReducer,
    messages: state.messages,
    animation: state.animation,
    view: state.view
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...messageActions, ...investActions, ...authActions, ...postActions, ...userActions, ...tagActions, ...animationActions, ...viewActions}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Read)

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
  message: {
    padding: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0'
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

var styles = {...localStyles, ...globalStyles};

