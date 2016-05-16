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
  Picker
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as userActions from '../actions/user.actions';
import * as postActions from '../actions/post.actions';
import * as investActions from '../actions/invest.actions';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Post from '../components/post.component';
import DiscoverUser from '../components/discoverUser.component';
import Notification from '../components/notification.component';

class Discover extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      currentView: 1,
    }
  }

  componentDidMount() {
    this.props.actions.userIndex();
    this.props.actions.getPosts(0);
    this.props.actions.getPostsByRank(0);
  }

  componentDidUpdate() {
    //console.log(this.props, 'new props')
  }

  changeView(view) {
    this.setState({currentView: view});
  }

  switchPageNormal(page) {
    this.props.actions.getPosts(page);
  }

  switchPageRanked(page) {
    this.props.actions.getPostsByRank(page);
  }


  render() {
    var self = this;
    var usersEl = null;
    var currentView = self.state.currentView;

    var postsEl = null;
    var posts = null;
    var paginationEl = null;
    var pages = null;

    // var postsEl = null;
    // var posts = null;
    // var paginationElNormal = null;
    // var pages = null;
    if (self.state.currentView == 1) {
      if (self.props.posts.normalSort.pages) {
        pages = self.props.posts.normalSort.pages;
        paginationEl = [];
        for (var i = 0; i < pages; i++) {
            paginationEl.push(<Text onPress={self.switchPageNormal.bind(self, i)}>Page {i+1}</Text>);
        }
      }
      if (self.props.posts.normalSort.index) {
        posts = self.props.posts.normalSort.index;
        postsEl = posts.map(function(post, i) {
          return (
            <Post key={i} post={post} {...self.props} styles={styles} />
          );
        });
      }
    }

    if (self.state.currentView == 2) {
      if (self.props.posts.ranked.pages) {
        pages = self.props.posts.ranked.pages;
        paginationEl = [];
        for (var i = 0; i < pages; i++) {
            paginationEl.push(<Text onPress={self.switchPageRanked.bind(self, i)}>Page {i+1}</Text>);
        }
      }
      if (self.props.posts.ranked.index) {
        posts = self.props.posts.ranked.index;
        postsEl = posts.map(function(post, i) {
          return (
            <Post key={i} post={post} {...self.props} styles={styles} />
          );
        });
      }
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
        <ScrollView style={styles.fullContainer}>
          <View style={[styles.row, styles.discoverBar]}>
            <Text onPress={self.changeView.bind(self, 1)} style={[styles.font20, styles.category, currentView == 1? styles.active : null]}>New</Text>
            <Text onPress={self.changeView.bind(self, 2)} style={[styles.font20, styles.category, currentView == 2? styles.active : null]}>Top</Text>
            <Text onPress={self.changeView.bind(self, 3)} style={[styles.font20, styles.category, currentView == 3? styles.active : null]}>People</Text>
          </View>
          <View style={styles.pagination}>{paginationEl}</View>
          <View>
            {currentView == 1 || !currentView ? postsEl : null}
            {currentView == 2 ? postsEl : null}
            {currentView == 3 ? usersEl : null}
          </View>
        </ScrollView>
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
    actions: bindActionCreators({...investActions, ...authActions, ...userActions, ...postActions}, dispatch)
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
discoverBar: {
  width: fullWidth,
  paddingTop: 20,
  paddingBottom: 20
}
});

var styles = {...localStyles, ...globalStyles};

