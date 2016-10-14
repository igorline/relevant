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
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Post from '../components/post.component';
import DiscoverUser from '../components/discoverUser.component';
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
      setScroll: true,
      transY: new Animated.Value(0),
      headerHeight: 0,
      layout: false,
      showHeader: true
    };
  }

  componentDidMount() {
    // InteractionManager.runAfterInteractions(() => {
      var self = this;
      this.offset = 0;

      if (self.props.posts.comments) this.props.actions.setComments(null);
      if (!self.props.posts.discoverTags) this.props.actions.getDiscoverTags();

      if (self.props.posts.tag && self.props.posts.index) self.props.actions.clearPosts('index');

      if (self.props.posts.index.length > 0) {
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        self.setState({dataSource: ds.cloneWithRows(self.props.posts.index)});
      }
      if (self.props.posts.index.length == 0) this.loadMore();

    // });

  }

  componentWillReceiveProps(next) {
    var self = this;
    if (next.posts.index != self.props.posts.index) {
      var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      self.setState({dataSource: ds.cloneWithRows(next.posts.index)});
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

    switch (view) {
      case 1:
        self.props.actions.getPosts(0, self.props.posts.tag, null, 5);
        break;

      case 2:
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
    self.loadPosts(0, tag);
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
          self.loadPosts(0, foundTags.data);
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

  hideHeader() {
    var self = this;
    var moveHeader = self.state.headerHeight * -1;
    self.setState({showHeader: false})
    Animated.timing(          // Uses easing functions
       this.state.transY,    // The value to drive
       {toValue: moveHeader}            // Configuration
     ).start();
  }

  showHeader() {
    var self = this;
    self.setState({showHeader: true})
    Animated.timing(          // Uses easing functions
       this.state.transY,    // The value to drive
       {toValue: 0}            // Configuration
     ).start();
  }

  onScroll(e) {
    var self = this;

    var currentOffset = self.refs.listview.scrollProperties.offset;
    var down = null;
    if (currentOffset != this.offset)
      down = currentOffset > this.offset ? true : false;
    if (self.refs.listview.scrollProperties.offset < 50)
      down = false;
    if (down == true && self.state.showHeader)
      self.hideHeader();
    if (down == false && !self.state.showHeader)
      self.showHeader();
    this.offset = currentOffset;

    if (self.props.view.discover == 3) return;

    if (self.refs.listview.scrollProperties.offset < -100) {
      self.reload();
    }
    if (self.refs.listview.scrollProperties.offset > 100 && self.refs.listview.scrollProperties.offset + self.refs.listview.scrollProperties.visibleLength > self.refs.listview.scrollProperties.contentLength + 5) {
      this.loadMore();
    }
  }

  reload() {
    console.log("REALOAD")
    this.props.actions.clearPosts('index');
    this.loadPosts(0);
  }

  loadMore() {
    console.log("LOAD MORE")
    var length = this.props.posts.index.length;
    this.loadPosts(length);
  }

  loadPosts(length, _tag) {

    if (this.props.posts.loading) return;

    var self = this;
    var tag = _tag ? _tag : self.props.posts.tag
    switch(self.props.view.discover) {
      case 1:
         self.props.actions.getPosts(length, tag, null, 5);
        break;

      case 2:
         self.props.actions.getPosts(length, tag, 'rank', 5);
        break;

      default:
        return;
    }
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
    var id = null;
    var headerEl = null;
    //console.log(self.state.transY)

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

    headerEl = (
      <Animated.View style={[styles.transformContainer], {position:'absolute', top: 0, backgroundColor: 'white', transform: [{translateY: self.state.transY}]}} onLayout={(event) => {var {x, y, width, height} = event.nativeEvent.layout; if (!self.state.layout) { self.setState({headerHeight: height, layout: true})} }}>
        {/*<Text style={{padding: 5}} onPress={self.clearTag.bind(self)}>Reset</Text>*/}
          <View style={[styles.searchParent]}>
            <TextInput onSubmitEditing={self.search.bind(self)}
              style={[styles.searchInput, styles.font15]}
              placeholder={'Search'}
              multiline={false}
              onChangeText={(term) => this.setState({tagSearchTerm: term})}
              value={self.state.tagSearchTerm} returnKeyType='done' />
          </View>
          <View>
            <ScrollView horizontal={true} 
              showsHorizontalScrollIndicator={false}
              automaticallyAdjustContentInsets={false}
              contentContainerStyle={styles.tags}>
                {tagsEl}
            </ScrollView>
          </View>
           <View style={[styles.row, {width: fullWidth}]}>
          <TouchableHighlight 
            underlayColor={'transparent'}
            style={[styles.typeParent, view == 1 ? styles.activeBorder : null]}
            onPress={self.changeView.bind(self, 1)}>
            <Text style={[styles.type, styles.darkGray, styles.font15, view == 1 ? styles.active : null]}>New</Text>
          </TouchableHighlight>
          <TouchableHighlight 
            underlayColor={'transparent'}
            style={[styles.typeParent, view == 2 ? styles.activeBorder : null]}
            onPress={self.changeView.bind(self, 2)}>
            <Text style={[styles.type, styles.darkGray, styles.font15, view == 2 ? styles.active : null]}>Top</Text>
          </TouchableHighlight>
          <TouchableHighlight 
            underlayColor={'transparent'}
            style={[styles.typeParent, view == 3 ? styles.activeBorder : null]}
            onPress={self.changeView.bind(self, 3)}>
            <Text style={[styles.type, styles.darkGray, styles.font15, view == 3 ? styles.active : null]}>People</Text>
          </TouchableHighlight>
        </View>
      </Animated.View>);


    if (self.state.dataSource) {
      postsEl = (
        <ListView ref="listview"
          enableEmptySections={true}
          removeClippedSubviews={true}
          pageSize={1}
          initialListSize={3}
          scrollEventThrottle={16}
          onScroll={self.onScroll.bind(self)}
          dataSource={self.state.dataSource}
          renderRow={self.renderRow.bind(self)}
          contentContainerStyle={{position: 'absolute', top: self.state.headerHeight}}
          renderScrollComponent={props => <ScrollView {...props} />}
        />)
    }

    var userIndex = null;
    var usersParent = null;

    if (this.props.auth.userIndex) {
      userIndex = this.props.auth.userIndex;
      usersEl = userIndex.map(function(user, i) {
        if (user.name != 'Admin') return (<DiscoverUser key={i} {...self.props} user={user} styles={styles} />);
      });
      usersParent = (<ScrollView>{usersEl}</ScrollView>)
    }

    return (
      <View style={[styles.fullContainer, {backgroundColor: 'white'}]}>
        <Spinner color='rgba(0,0,0,1)' overlayColor='rgba(0,0,0,0)' visible={!self.state.dataSource} />
        {view != 3 ? postsEl : null}
        {view == 3 ? usersParent : null}
        {headerEl}
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

