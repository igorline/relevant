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
  ListView
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as userActions from '../actions/user.actions';
require('../publicenv');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Post from '../components/post.component';
import * as investActions from '../actions/invest.actions';
import Notification from '../components/notification.component';

class Read extends Component {
  constructor (props, context) {
    super(props, context)
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      tag: null,
      enabled: true,
      dataSource: ds.cloneWithRows([]),
    }
  }

  componentDidMount() {
    var self = this;
    this.props.actions.clearPosts();
    this.props.actions.getFeed(self.props.auth.token, 0, null);
  }

  componentDidUpdate() {
    var self = this;
  }

  componentWillUpdate(next) {
    var self = this;
    if (next.posts.feed != self.props.posts.feed) {
      console.log(next.posts.feed, 'feed')
      var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      self.setState({dataSource: ds.cloneWithRows(next.posts.feed)});
    }
  }

  setTag(tag) {
    var self = this;
    self.setState({tag: tag});
    self.props.actions.clearPosts();
    self.props.actions.getFeed(self.props.auth.token, 0, self.state.tag);
  }

  renderRow(rowData) {
    var self = this;
      return (
        <Post post={rowData} {...self.props} styles={styles} />
      );
  }

  onScroll() {
    var self = this;
    if (self.refs.listview.scrollProperties.offset + self.refs.listview.scrollProperties.visibleLength >= self.refs.listview.scrollProperties.contentLength) {
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

    console.log(self.props.posts.feed, 'feed')

    if (self.props.posts.feed) {

      //self.props.posts.feed.forEach(function(post, i) {
      //   post.tags.forEach(function(tag, j) {
      //     var exists = false;
      //     tags.forEach(function(innerTag, i) {
      //       if (innerTag.tag._id == tag._id) {
      //         innerTag.quantity += 1;
      //         exists = true;
      //       }
      //     })
      //     if (!exists) tags.push({tag: tag, quantity: 1});
      //   })
      // })

      // tags.sort(function(a, b) {
      //   return b.quantity - a.quantity
      // });

      // tagsEl = tags.map(function(data, i) {
      //   return (
      //     <Text style={styles.tagBox} onPress={self.setTag.bind(self, data.tag)} key={i}>{data.tag.name}</Text>
      //     )
      // })

      postsEl = (<ListView ref="listview" renderScrollComponent={props => <ScrollView {...props} />} onScroll={self.onScroll.bind(self)} dataSource={self.state.dataSource} renderRow={self.renderRow.bind(self)} />)
    }


    return (
      <View style={styles.fullContainer}>
       {/*<View>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} automaticallyAdjustContentInsets={false} contentContainerStyle={styles.tags}>{tagsEl}</ScrollView>
        </View>*/}
       {postsEl}
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
    router: state.routerReducer
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...investActions, ...authActions, ...postActions, ...userActions}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Read)

const localStyles = StyleSheet.create({
  readContainer: {
  },
  readHeader: {
    marginBottom: 10
  }
});

var styles = {...localStyles, ...globalStyles};

