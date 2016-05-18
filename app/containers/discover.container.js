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
  Picker,
  ListView,
  RecyclerViewBackedScrollView
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as userActions from '../actions/user.actions';
import * as postActions from '../actions/post.actions';
import * as tagActions from '../actions/tag.actions';
import * as investActions from '../actions/invest.actions';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Post from '../components/post.component';
import DiscoverUser from '../components/discoverUser.component';
import Notification from '../components/notification.component';

class Discover extends Component {
  constructor (props, context) {
    super(props, context)
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      view: 1,
      dataSource: ds.cloneWithRows([]),
      enabled: true,
      tag: null
    }
  }

  componentDidMount() {
    this.props.actions.userIndex();
    this.props.actions.clearPosts();
    this.props.actions.getDiscoverTags();
    this.props.actions.getPosts(0, null);
  }

  componentWillUpdate(next) {
    var self = this;
    if (next.posts.index != self.props.posts.index) {
      console.log(next.posts.index, 'index')
      var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      self.setState({dataSource: ds.cloneWithRows(next.posts.index)});
    }
  }

  changeView(view) {
    var self = this;
    self.setState({view: view, tag: null});
    self.props.actions.clearPosts();

    switch(view) {
      case 1:
        self.props.actions.getPosts(0, null);
        break;

      case 2:
        self.props.actions.getPostsByRank(0, null);
        break;

      default:
        return;
    }
  }

  setTag(tag) {
    var self = this;
    self.setState({tag: tag})
    self.props.actions.clearPosts();
    if (self.state.view == 1) self.props.actions.getPosts(0, self.state.tag);
    if (self.state.view == 2) self.props.actions.getPostsByRank(0, self.state.tag);
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
    var length = self.props.posts.index.length;
     console.log('load more, skip: ', length);
    if (self.state.enabled) {
      self.setState({enabled: false});
      if (self.state.view == 1) {
        self.props.actions.getPosts(length, self.state.tag);
      }
      if (self.state.view == 2) {
        self.props.actions.getPostsByRank(length, self.state.tag);
      }
      setTimeout(function() {
        self.setState({enabled: true})
      }, 1000);
    }
  }

  render() {
    var self = this;
    var usersEl = null;
    var view = self.state.view;
    var postsEl = null;
    var posts = null;
    var paginationEl = null;
    var pages = null;
    var tagsEl = null;
    var tags = null;

    if (self.props.posts.discoverTags) {
      tags = self.props.posts.discoverTags;
      console.log(tags, 'tags')
      if (tags.length > 0) {
        tagsEl = tags.map(function(data, i) {
          return (
            <Text style={styles.tagBox} onPress={self.setTag.bind(self, data)} key={i}>{data.name}</Text>
            )
        })
      }
    }

    postsEl = (<ListView ref="listview" renderScrollComponent={props => <ScrollView {...props} />} onScroll={self.onScroll.bind(self)} dataSource={self.state.dataSource} renderRow={self.renderRow.bind(self)} />)

    var userIndex = null;
    if (this.props.auth.userIndex) {
      userIndex = this.props.auth.userIndex;
      usersEl = userIndex.map(function(user, i) {
        if (user.name != 'Admin') {
          return (
            <DiscoverUser key={i} {...self.props} user={user} styles={styles} />
          );
        }
      });
    }

    return (
      <View style={styles.fullContainer}>
        <View>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} automaticallyAdjustContentInsets={false} contentContainerStyle={styles.tags}>{tagsEl}</ScrollView>
        </View>
        <View style={[styles.row, styles.discoverBar]}>
          <Text onPress={self.changeView.bind(self, 1)} style={[styles.font20, styles.category, view == 1? styles.active : null]}>New</Text>
          <Text onPress={self.changeView.bind(self, 2)} style={[styles.font20, styles.category, view == 2? styles.active : null]}>Top</Text>
          <Text onPress={self.changeView.bind(self, 3)} style={[styles.font20, styles.category, view == 3? styles.active : null]}>People</Text>
        </View>
        {/*<View style={styles.fullContainer}>*/}
          {/*<View>*/}
            {view != 3 ? postsEl : null}
            {view == 3 ? usersEl : null}
          {/*</View>*/}
      {/*</View>*/}
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
    router: state.routerReducer,
    users: state.user,
    posts: state.posts
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...investActions, ...authActions, ...userActions, ...postActions, ...tagActions}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Discover)

const localStyles = StyleSheet.create({
category: {
  flex: 1,
  textAlign: 'center'
},
padding20: {
  padding: 20
},
listStyle: {
  height: 100,
},
discoverBar: {
  width: fullWidth,
  paddingTop: 20,
  paddingBottom: 20
},
listScroll: {
  height: 100,
  borderWidth: 1,
  borderColor: 'red'
}
});

var styles = {...localStyles, ...globalStyles};

