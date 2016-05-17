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
  Linking
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
    this.state = {
      page: 0
    }
  }

  componentDidMount() {
    var self = this;
    this.props.actions.getFeed(self.props.auth.user._id);
  }

  componentDidUpdate() {
    var self = this;
  }

  componentWillUpdate(nextProps) {
    var self = this;
  }

  switchPage(page) {
    var self = this;
    self.setState({page: page});
  }

  render() {
    var self = this;
    var postsEl = null;
    var posts = null;
    var paginationEl = null;
    var page = self.state.page;

    if (self.props.posts.feed) {
      posts = self.props.posts.feed.slice(page*10, (page*10)+10);
      var pages = Math.ceil(self.props.posts.feed.length / 10);

      paginationEl = [];
      for (var i = 0; i < pages; i++) {
          paginationEl.push(<Text onPress={self.switchPage.bind(self, i)}>Page {i+1}</Text>);
      }

      postsEl = posts.map(function(post, i) {
        return (
          <Post post={post} key={i} {...self.props} styles={styles} />
        );
      });
    }


    return (
      <ScrollView style={[styles.readContainer]}>
      <View style={styles.pagination}>{paginationEl}</View>
       {postsEl}
       <View pointerEvents={'none'} style={styles.notificationContainer}>
          <Notification />
        </View>
      </ScrollView>
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
   // padding: 20,
   // borderWidth: 1,
   // borderColor: 'red'
  },
  readHeader: {
    marginBottom: 10
  }
});

var styles = {...localStyles, ...globalStyles};

