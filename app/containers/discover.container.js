'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
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
  TouchableHighlight,
  RecyclerViewBackedScrollView,
  InteractionManager
} from 'react-native';
import { connect } from 'react-redux';
import Button from 'react-native-button';
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as userActions from '../actions/user.actions';
import * as postActions from '../actions/post.actions';
import * as tagActions from '../actions/tag.actions';
import * as viewActions from '../actions/view.actions';
import * as animationActions from '../actions/animation.actions';
import * as investActions from '../actions/invest.actions';
import * as notifActions from '../actions/notif.actions';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Post from '../components/post.component';
import DiscoverUser from '../components/discoverUser.component';
import Notification from '../components/notification.component';
import InvestAnimation from '../components/investAnimation.component';
import Spinner from 'react-native-loading-spinner-overlay';

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
      searchHeight: new Animated.Value(0),
      searchPadding: new Animated.Value(0),
      disableSearchAni: false,
      setScroll: true
    };
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      var self = this;
      if (self.props.posts.comments) this.props.actions.setComments(null);
      if (!self.props.posts.discoverTags) this.props.actions.getDiscoverTags();
      if (self.props.posts.tag && self.props.posts.index) self.props.actions.clearPosts('index');
      if (self.props.posts.index.length > 0) {
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        self.setState({dataSource: ds.cloneWithRows(self.props.posts.index)});
      }
      if (self.props.posts.index.length == 0) self.props.actions.getPosts(0, self.props.posts.tag, null, 5);
    });

  }

  componentWillUpdate(next) {
    var self = this;
    if (next.posts.index != self.props.posts.index) {
      var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      self.setState({dataSource: ds.cloneWithRows(next.posts.index)});
      // if(next.posts.index.length > 0) {
      //   console.log("STOP LOADING")
      //   console.log(next.posts.index)
      //   console.log(self.props.posts.index)
      //   this.loading = false;
      //   // console.log(next.posts)
      // }
    }
    if (self.props.posts.tag != next.posts.tag && next.posts.tag) {
      self.setTag(next.posts.tag);
    }
    if (self.props.posts.newPostsAvailable != next.posts.newPostsAvailable) {
      if (next.posts.newPostsAvailable) console.log('newPostsAvailable');
    }
  }

  clearTag() {
    var self = this;
    self.props.actions.setTag(null);
    self.changeView(self.props.view.discover);
  }

  changeView(view) {
    var self = this;
    if (view < 3) self.props.actions.clearPosts('index');
    self.props.actions.setView('discover', view);
    if (!self.state.disableLayout) self.setState({disableLayout: true})

    switch(view) {
      case 1:
        self.setState({dataSource: null})
        self.props.actions.getPosts(0, self.props.posts.tag, null, 5);
        break;

      case 2:
        self.setState({dataSource: null})
        self.props.actions.getPosts(0, self.props.posts.tag, 'rank', 5);
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
    self.props.actions.clearPosts('index');
    self.setState({dataSource: null});
    switch(self.props.view.discover) {
      case 1:
        self.props.actions.getPosts(0, tag, null, 5);
        break;

      case 2:
        self.props.actions.getPosts(0, tag, 'rank', 5);
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
        AlertIOS.alert("Search error");
      } else {
        if (foundTags.data.length) {
          self.props.actions.setTag(foundTags.data);
          self.props.actions.clearPosts('index');
          switch(self.props.view.discover) {
            case 1:
              self.props.actions.getPosts(0, foundTags.data, null, 5);
              break;

            case 2:
              self.props.actions.getPosts(0, foundTags.data, 'rank', 5);
              break;

            default:
              return;
          }
        } else {
          self.setState({noResults: true});
          AlertIOS.alert("No results");
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

    //check whether we are in the process of requesting new posts
    // console.log("LOADING, ", this.props.posts.loading)
    if (this.props.posts.loading) return;

    if (self.props.view.discover == 3) return;
    if (self.refs.listview.scrollProperties.offset < -100) {
      if(self.props.posts.newPostsAvailable == true) {
        self.loading = true;
        console.log("LOADING NEW")
        self.props.actions.clearPosts('index');
        self.props.actions.getPosts(0, self.props.posts.tag, null, 5);
      }
    }
    if (self.refs.listview.scrollProperties.offset + self.refs.listview.scrollProperties.visibleLength >= self.refs.listview.scrollProperties.contentLength) {
      self.loadMore();
    }
  }

  loadMore() {
    var self = this;
    var length = self.props.posts.index.length;
    switch(self.props.view.discover) {
      case 1:
         self.props.actions.getPosts(length, self.props.posts.tag, null, 5);
        break;

      case 2:
         self.props.actions.getPosts(length, self.props.posts.tag, 'rank', 5);
        break;

      default:
        return;
    }
  }

  showSearch() {
    var self = this;
    Animated.timing(
      self.state.searchHeight,
      {
        toValue: 35,
        duration: 200
      }
    ).start();
    Animated.timing(
      self.state.searchPadding,
      {
        toValue: 5,
        duration: 200
      }
    ).start();
  }

  hideSearch() {
    var self = this;
    Animated.timing(
      self.state.searchHeight,
      {
        toValue: 0,
        duration: 200
      }
    ).start();
    Animated.timing(
      self.state.searchPadding,
      {
        toValue: 0,
        duration: 200
      }
    ).start();
  }

    renderHeader() {
      var self = this;
      var tags = null;
      var view = self.props.view.discover;
      var tagsEl = null;
      var id = null;
      if (self.props.posts.tag) id = self.props.posts.tag._id;
      if (self.props.posts.discoverTags) {
        tags = self.props.posts.discoverTags;
        if (tags.length > 0) {
          tagsEl = tags.map(function(data, i) {
            return (
              <Text style={[styles.tagBox, {backgroundColor: data._id == id ? '#007aff' : '#F0F0F0', color: data._id == id ? 'white' : '#808080'}]} onPress={data._id == id ? self.clearTag.bind(self) : self.setTag.bind(self, data)} key={i}>{data.name}</Text>
              )
          })
        }
      }

      var el = (
          <View style={[styles.transformContainer], {backgroundColor: 'white'}}>
            {/*<Text style={{padding: 5}} onPress={self.clearTag.bind(self)}>Reset</Text>*/}
            <View style={[styles.searchParent]}>
              <TextInput onSubmitEditing={self.search.bind(self)} style={[styles.searchInput, styles.font15]} placeholder={'Search'} multiline={false} onChangeText={(term) => this.setState({tagSearchTerm: term})} value={self.state.tagSearchTerm} returnKeyType='done' />
            </View>
             <View>
              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} automaticallyAdjustContentInsets={false} contentContainerStyle={styles.tags}>{tagsEl}</ScrollView>
            </View>
             <View style={[styles.row, {width: fullWidth}]}>
            <TouchableHighlight  underlayColor={'transparent'} style={[styles.typeParent, view == 1 ? styles.activeBorder : null]} onPress={self.changeView.bind(self, 1)}>
              <Text style={[styles.type, styles.darkGray, styles.font15, view == 1 ? styles.active : null]}>New</Text>
            </TouchableHighlight>
            <TouchableHighlight  underlayColor={'transparent'} style={[styles.typeParent, view == 2 ? styles.activeBorder : null]} onPress={self.changeView.bind(self, 2)}>
              <Text style={[styles.type, styles.darkGray, styles.font15, view == 2 ? styles.active : null]}>Top</Text>
            </TouchableHighlight>
            <TouchableHighlight  underlayColor={'transparent'} style={[styles.typeParent, view == 3 ? styles.activeBorder : null]} onPress={self.changeView.bind(self, 3)}>
              <Text style={[styles.type, styles.darkGray, styles.font15, view == 3 ? styles.active : null]}>People</Text>
            </TouchableHighlight>
          </View>
          </View>);
      return el;
    }

  render() {
    var self = this;
    var _scrollView: ScrollView;
    var usersEl = null;
    var view = self.props.view.discover;
    var postsEl = null;
    var posts = null;
    var paginationEl = null;
    var pages = null;
    var tagsEl = null;
    var tags = null;
    var typeEl = null;

    typeEl = (<View style={[styles.row, {width: fullWidth}]}>
            <TouchableHighlight  underlayColor={'transparent'} style={[styles.typeParent, view == 1 ? styles.activeBorder : null]} onPress={self.changeView.bind(self, 1)}>
              <Text style={[styles.type, styles.darkGray, styles.font15, view == 1 ? styles.active : null]}>New</Text>
            </TouchableHighlight>
            <TouchableHighlight  underlayColor={'transparent'} style={[styles.typeParent, view == 2 ? styles.activeBorder : null]} onPress={self.changeView.bind(self, 2)}>
              <Text style={[styles.type, styles.darkGray, styles.font15, view == 2 ? styles.active : null]}>Top</Text>
            </TouchableHighlight>
            <TouchableHighlight  underlayColor={'transparent'} style={[styles.typeParent, view == 3 ? styles.activeBorder : null]} onPress={self.changeView.bind(self, 3)}>
              <Text style={[styles.type, styles.darkGray, styles.font15, view == 3 ? styles.active : null]}>People</Text>
            </TouchableHighlight>
          </View>)


    if (self.state.dataSource) {
      postsEl = (
        <ListView ref="listview"
          enableEmptySections={true}
          removeClippedSubviews={true}
          pageSize={1}
          initialListSize={1}
          dataSource={self.state.dataSource}
          renderHeader={self.renderHeader.bind(self)}
          renderRow={self.renderRow.bind(self)}
          contentOffset={{x: 0, y: 35}}
          renderScrollComponent={
            props => <ScrollView {...props} />} onScroll={self.onScroll.bind(self)
          } />)
    }
    var userIndex = null;
    var usersParent = null;

    if (this.props.auth.userIndex) {
      userIndex = this.props.auth.userIndex;
      usersEl = userIndex.map(function(user, i) {
        if (user.name != 'Admin') {
          return (
            <DiscoverUser key={i} {...self.props} user={user} styles={styles} />
          );
        }
      });
      usersParent = (<ScrollView>{usersEl}</ScrollView>)
    }


    return (
      <View style={[styles.fullContainer, {backgroundColor: 'white'}]}>
        <Spinner color='rgba(0,0,0,1)' overlayColor='rgba(0,0,0,0)' visible={!self.state.dataSource} />
        {view != 3 ? postsEl : null}
        {view == 3 ? typeEl : null}
        {view == 3 ? usersParent : null}
      </View>
    );
  }
}

export default Discover

const localStyles = StyleSheet.create({
padding20: {
  padding: 20
},
transformContainer: {
  overflow: 'hidden',
},
listStyle: {
  height: 100,
},
listScroll: {
  height: 100,
  borderWidth: 1,
  borderColor: 'red'
},
searchParent: {
  width: fullWidth,
  backgroundColor: '#F0F0F0',
  overflow: 'hidden',
  padding: 5
},
scrollPadding: {
  marginTop: 300
},
searchInput: {
  flex: 1,
  paddingTop: 5,
  height: 25,
  textAlign: 'center',
  paddingBottom: 5,
  paddingLeft: 5,
  paddingRight: 5,
  backgroundColor: 'white',
  borderRadius: 5
}
});

var styles = {...localStyles, ...globalStyles};

