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
  ListView
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
      view: 1,
    }
  }

  componentDidMount() {
    this.props.actions.userIndex();
    this.props.actions.getTopTags();
    this.props.actions.getPosts(0);
  }

  componentDidUpdate() {
  }

  changeView(view) {
    var self = this;
    self.setState({view: view});

    switch(view) {
      case 1:
        self.props.actions.getPosts(0);
        break;

      case 2:
        self.props.actions.getPostsByRank(0, null);
        break;

      default:
        return;
    }
  }

  switchPage(page) {
    var self = this;

    switch(self.state.view) {
      case 1:
        self.props.actions.getPosts(page);
        break;

      case 2:
        self.props.actions.getPostsByRank(page, self.state.tag);
        break;

      default:
        return;
    }
  }

  setTag(tag) {
    var self = this;
    self.setState({tag: tag})
    self.props.actions.getPostsByRank(0, self.state.tag);
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

    if (self.props.posts.topTags) {
      tags = [];

      self.props.posts.topTags.forEach(function(tag, i) {

        var exists = false;
        tags.forEach(function(innerTag, j) {
          if (innerTag.tag._id == tag._id) {
            innerTag.quantity += 1;
            exists = true;
          }
        })
        if (!exists) tags.push({tag: tag, quantity: 1});
      });

      tags.sort(function(a, b) {
        return b.quantity - a.quantity
      });

      tagsEl = tags.map(function(data, i) {
        return (
          <Text style={styles.tagBox} onPress={self.setTag.bind(self, data.tag)} key={i}>{data.tag.name}</Text>
          )
      })
    }

    if (self.props.posts.pages) {
      pages = self.props.posts.pages;
      paginationEl = [];
      for (var i = 0; i < pages; i++) {
          paginationEl.push(<Text onPress={self.switchPage.bind(self, i)}>Page {i+1}</Text>);
      }
    }
    if (self.props.posts.index) {
      posts = self.props.posts.index;
      var mock = ['xxx', 'xxy'];
      var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      ds.cloneWithRows(mock);
      postsEl = (<ListView contentContainerStyle={styles.listStyle} dataSource={ds} renderRow={(post) => <Text>row</Text>} />)
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
        <View>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} automaticallyAdjustContentInsets={false} contentContainerStyle={styles.tags}>{tagsEl}</ScrollView>
        </View>
        <View style={[styles.row, styles.discoverBar]}>
          <Text onPress={self.changeView.bind(self, 1)} style={[styles.font20, styles.category, view == 1? styles.active : null]}>New</Text>
          <Text onPress={self.changeView.bind(self, 2)} style={[styles.font20, styles.category, view == 2? styles.active : null]}>Top</Text>
          <Text onPress={self.changeView.bind(self, 3)} style={[styles.font20, styles.category, view == 3? styles.active : null]}>People</Text>
        </View>
        <ScrollView style={styles.fullContainer}>
          {view != 3 ? <View style={styles.pagination}>{paginationEl}</View> : null}
          <View>
            {view != 3 ? postsEl : null}
            {view == 3 ? usersEl : null}
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
listStyle: {
  flex: 1,
  height: 100,
  borderWidth: 1,
  borderColor: 'red'
},
discoverBar: {
  width: fullWidth,
  paddingTop: 20,
  paddingBottom: 20
}
});

var styles = {...localStyles, ...globalStyles};

