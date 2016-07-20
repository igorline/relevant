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
  Animated,
  Easing,
  RecyclerViewBackedScrollView
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as userActions from '../actions/user.actions';
import * as postActions from '../actions/post.actions';
import * as tagActions from '../actions/tag.actions';
import * as animationActions from '../actions/animation.actions';
import * as investActions from '../actions/invest.actions';
import * as notifActions from '../actions/notif.actions';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Post from '../components/post.component';
import DiscoverUser from '../components/discoverUser.component';
import Notification from '../components/notification.component';
import Spinner from 'react-native-loading-spinner-overlay';
var animations = require("../animation");

class Discover extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      view: 1,
      dataSource: null,
      enabled: true,
      tagSearchTerm: null,
      disableLayout: false,
      lastOffset: 0,
      transformHeight: null,
      height: null,
      investAni: [],
    }
  }

  componentDidMount() {
    var self = this;
    if (self.props.posts.comments) this.props.actions.setComments(null);
    if (!self.props.posts.discoverTags) this.props.actions.getDiscoverTags();
    if (self.props.posts.tag && self.props.posts.index) self.props.actions.clearPosts();
    if (self.props.posts.index.length > 0) {
      var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      self.setState({dataSource: ds.cloneWithRows(self.props.posts.index)});
    }
    if (self.props.posts.index.length == 0) self.props.actions.getPosts(0, self.props.posts.tag, null);
    if (self.props.posts.tag) self.props.actions.getPosts(0, self.props.posts.tag, null);
  }

  componentWillReceiveProps(next) {
    var self = this;
    if (next.posts.index != self.props.posts.index) {
      var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      self.setState({dataSource: ds.cloneWithRows(next.posts.index)});
    }
    if (self.props.animation != next.animation) {
      if (next.animation.bool) {
        if (next.animation.type == 'invest') {
          animations.investAni(self);
        }
      }
    }
  }

  clearTag() {
    var self = this;
    self.props.actions.setTag(null);
    self.changeView(self.state.view);
  }

  changeView(view) {
    var self = this;
    self.props.actions.clearPosts();
    self.setState({view: view});

    switch(view) {
      case 1:
        self.setState({dataSource: null})
        self.props.actions.getPosts(0, self.props.posts.tag, null);
        break;

      case 2:
        self.setState({dataSource: null})
        self.props.actions.getPosts(0, self.props.posts.tag, 'rank');
        break;

      case 3:
        if (!self.props.auth.userIndex) this.props.actions.userIndex();
        break;

      default:
        return;
    }
  }

  setTag(tag) {
    var self = this;
    self.props.actions.setTag(tag);
    self.props.actions.clearPosts();
    self.setState({dataSource: null});
    switch(self.state.view) {
      case 1:
        self.props.actions.getPosts(0, tag, null);
        break;

      case 2:
        self.props.actions.getPosts(0, tag, 'rank');
        break;

      default:
        return;
    }
  }

  search() {
    var self = this;
    var length = self.props.posts.index.length;
    self.props.actions.searchTags(self.state.tagSearchTerm).then(function(foundTags) {
      console.log(foundTags, 'foundTags')
      if (!foundTags.status) {
        self.props.actions.setNotif(true, 'Search error', false)
      } else {
        if (foundTags.data.length) {
          self.props.actions.setTag(foundTags.data);
          self.props.actions.clearPosts();
          switch(self.state.view) {
            case 1:
              self.props.actions.getPosts(0, foundTags.data, null);
              break;

            case 2:
              self.props.actions.getPosts(0, foundTags.data, 'rank');
              break;

            default:
              return;
          }
        } else {
          self.setState({noResults: true});
          self.props.actions.setNotif(true, 'No results', false)
        }
      }
    })
    self.setState({tagSearchTerm: null})
  }

  renderRow(rowData) {
    var self = this;
    return (
      <Post post={rowData} {...self.props} styles={styles} />
    );
  }

  onScroll(e) {
    var self = this;
    if (!self.state.disableLayout) self.setState({disableLayout: true})
    if (self.refs.listview.scrollProperties.offset + self.refs.listview.scrollProperties.visibleLength >= self.refs.listview.scrollProperties.contentLength) {
      self.loadMore();
    }
    if (self.refs.listview.scrollProperties.offset < 0) return;
    if (self.refs.listview.scrollProperties.offset > self.state.lastOffset && self.refs.listview.scrollProperties.offset > 20) {
      Animated.timing(
        self.state.transformHeight,
        {
          toValue: 0,
          duration: 200
        }
      ).start();
    } else {
      Animated.timing(
        self.state.transformHeight,
        {
          toValue: self.state.height,
          duration: 200
        }
      ).start();
    }
     self.setState({lastOffset: self.refs.listview.scrollProperties.offset});
  }

  loadMore() {
    var self = this;
    var length = self.props.posts.index.length;
     console.log('load more, skip: ', length, self.props.posts.tag);
    if (self.state.enabled) {
      self.setState({enabled: false});
      switch(self.state.view) {
        case 1:
           self.props.actions.getPosts(length, self.props.posts.tag, null);
          break;

        case 2:
           self.props.actions.getPosts(length, self.props.posts.tag, 'rank');
          break;

        default:
          return;
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
      if (tags.length > 0) {
        tagsEl = tags.map(function(data, i) {
          return (
            <Text style={styles.tagBox} onPress={self.setTag.bind(self, data)} key={i}>{data.name}</Text>
            )
        })
      }
    }

    if (self.state.dataSource) {
      postsEl = (<ListView ref="listview" renderScrollComponent={props => <ScrollView {...props} />} onScroll={self.onScroll.bind(self)} dataSource={self.state.dataSource} renderRow={self.renderRow.bind(self)} />)
    }


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
        <Animated.View style={[{height: self.state.transformHeight}, styles.transformContainer]}  onLayout={(event) => {
          var {x, y, width, height} = event.nativeEvent.layout;
          if (!self.state.disableLayout && self.props.posts.discoverTags) {
              self.setState({height: height, transformHeight: new Animated.Value(height)})
          }
        }}>
          <Text style={{padding: 5}} onPress={self.clearTag.bind(self)}>Reset</Text>
          <View style={styles.searchParent}>
            <TextInput onSubmitEditing={self.search.bind(self)} style={[styles.searchInput, styles.font15]} placeholder={'Search'} multiline={false} onChangeText={(term) => this.setState({tagSearchTerm: term})} value={self.state.tagSearchTerm} returnKeyType='done' />
          </View>
          <View>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} automaticallyAdjustContentInsets={false} contentContainerStyle={styles.tags}>{tagsEl}</ScrollView>
          </View>
          </Animated.View>
        <View style={[styles.row, styles.discoverBar]}>
          <Text onPress={self.changeView.bind(self, 1)} style={[styles.font20, styles.category, view == 1? styles.active : null]}>New</Text>
          <Text onPress={self.changeView.bind(self, 2)} style={[styles.font20, styles.category, view == 2? styles.active : null]}>Top</Text>
          <Text onPress={self.changeView.bind(self, 3)} style={[styles.font20, styles.category, view == 3? styles.active : null]}>People</Text>
        </View>

        <Spinner color='rgba(0,0,0,1)' overlayColor='rgba(0,0,0,0)' visible={!self.state.dataSource} />

        {view != 3 ? postsEl : null}
        {view == 3 ? usersEl : null}

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
    router: state.routerReducer,
    users: state.user,
    posts: state.posts,
    notif: state.notif,
    animation: state.animation
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...investActions, ...authActions, ...userActions, ...postActions, ...tagActions, ...notifActions, ...animationActions}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Discover)

const localStyles = StyleSheet.create({
padding20: {
  padding: 20
},
transformContainer: {
  overflow: 'hidden',
  // position: 'absolute',
  // top: 0,
  // left: 0
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
},
searchParent: {
  // display: 'flex',
  width: fullWidth,
  height: 30,
},
scrollPadding: {
  marginTop: 300
},
searchInput: {
  display: 'flex',
  flex: 1,
  paddingTop: 2,
  paddingBottom: 2,
  paddingLeft: 5,
  paddingRight: 5
}
});

var styles = {...localStyles, ...globalStyles};

