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
import * as messageActions from '../actions/message.actions';
require('../publicenv');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Post from '../components/post.component';
import * as investActions from '../actions/invest.actions';
import Notification from '../components/notification.component';

class Read extends Component {
  constructor (props, context) {
    super(props, context)
    var fd = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    var md = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      tag: null,
      enabled: true,
      feedData: fd.cloneWithRows([]),
      messagesData: md.cloneWithRows([]),
      view: 1
    }
  }

  componentDidMount() {
    var self = this;
    this.props.actions.clearPosts();
    this.props.actions.setComments(null);
    this.props.actions.getFeed(self.props.auth.token, 0, null);
    this.props.actions.getMessages(self.props.auth.user._id);
  }

  componentDidUpdate() {
    var self = this;
  }

  componentWillUpdate(next) {
    var self = this;
    if (next.posts.feed != self.props.posts.feed) {
      var fd = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      self.setState({feedData: fd.cloneWithRows(next.posts.feed)});
    }
    if (next.messages.index != self.props.messages.index) {
      var md = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      self.setState({messagesData: md.cloneWithRows(next.messages.index)});
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
        <Text><Text style={styles.active} onPress={self.props.actions.getSelectedUser.bind(self, rowData.from._id, self.props.auth.token)}>👅💦 {rowData.from.name}</Text> is thirsty 4 u:</Text>
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
    if (view == 2) self.props.actions.markMessagesRead(self.props.auth.token, self.props.auth.user._id);
    self.setState({view: view});
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

    if (self.props.posts.feed) {
      postsEl = (<ListView ref="feedlist" renderScrollComponent={props => <ScrollView {...props} />} onScroll={self.onScroll.bind(self)} dataSource={self.state.feedData} renderRow={self.renderFeedRow.bind(self)} />)
    }

    if (self.props.messages.index) {
      messagesEl = (<ListView ref="messageslist" renderScrollComponent={props => <ScrollView {...props} />} dataSource={self.state.messagesData} renderRow={self.renderMessageRow.bind(self)} />);
    }

    if (self.props.messages.count) {
       messagesCount = (<View style={styles.messagesCount}><Text style={styles.white}>{self.props.messages.count}</Text></View>)
    }


    return (
      <View style={styles.fullContainer}>
        <View style={[styles.row, styles.categoryBar]}>
          <TouchableHighlight style={styles.category} underlayColor={'transparent'} onPress={self.changeView.bind(self, 1)}>
            <View style={styles.categoryView}>
              <Text style={[styles.font20,  self.state.view == 1 ? styles.active : null]}>Posts</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight style={styles.category} underlayColor={'transparent'} onPress={self.changeView.bind(self, 2)}>
            <View style={styles.categoryView}>
              <Text style={[styles.font20, self.state.view == 2 ? styles.active : null]}>Inbox</Text>
              {messagesCount}
            </View>
          </TouchableHighlight>
        </View>
       {self.state.view == 1 ? postsEl : null}
       {self.state.view == 2 ? messagesEl : null}
        <View pointerEvents={'none'} style={styles.notificationContainer}>
          <Notification />
        </View>
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
    messages: state.messages
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...messageActions, ...investActions, ...authActions, ...postActions, ...userActions, ...tagActions}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Read)

const localStyles = StyleSheet.create({
  categoryView: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center'
  },
  messagesCount: {
    position: 'absolute',
    backgroundColor: 'red',
    marginLeft: 5,
    height: 20,
    width: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  message: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'black'
  },
  readHeader: {
    marginBottom: 10
  },
  categoryBar: {
  width: fullWidth,
  paddingTop: 20,
  paddingBottom: 20
},
});

var styles = {...localStyles, ...globalStyles};

