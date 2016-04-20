'use strict';
import React, {
    AppRegistry,
    Component,
    StyleSheet,
    Text,
    View,
    Image,
    TextInput,
    Dimensions,
    ScrollView
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
var FileUpload = require('NativeModules').FileUpload;
import { connect } from 'react-redux';
var Button = require('react-native-button');
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import { bindActionCreators } from 'redux';
var ImagePickerManager = require('NativeModules').ImagePickerManager;
require('../publicenv');
import * as utils from '../utils';
import Post from '../components/post.component';

class User extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {}
    }

    componentDidMount() {}

    render() {
      var self = this;
      var user = null;
      var userImage = null;
      var name = null;
      var relevance = 0;
      var balance = 0;
      var followers = 0;
      var following = 0;
      const {actions} = this.props;
      var userImageEl = null;
      var postsEl = null;

      if (this.props.users.selectedUser) {
          user = this.props.users.selectedUser;
          if (user.name) name = user.name;
          if (user.image) userImage = user.image;
          if (user.relevance) relevance = user.relevance;
          if (user.balance) balance = user.balance;
          if (user.followers) followers = user.followers;
          if (user.following) following = user.following;
      }

      if (userImage) {
        userImageEl = (<Image source={{uri: userImage}} style={styles.uploadAvatar} /> );
      }


      if (self.props.users.posts) {
        if (self.props.users.posts.length > 0) {
          postsEl = self.props.users.posts.map(function(post, i) {
            return (<Post post={post} {...self.props} styles={styles} />);
          });
        } else {
          postsEl = (<View><Text>0 Posts</Text></View>);
        }
      } else {
        postsEl = (<View><Text>0 Posts</Text></View>);
      }

      return (
        <ScrollView style={styles.fullContainer}>
          <View style={styles.row}>
            <View>{userImageEl}</View>
            <View style={[styles.insideRow, styles.insidePadding]}>
              <Text>Relevance: <Text style={styles.active}>{relevance}</Text ></Text>
              <Text>Balance: <Text style={styles.active}>{balance}</Text></Text>

            </View>
          </View>
          <View>
            <Text style={[styles.font20, styles.postsHeader]}>Posts</Text>
            {postsEl}
          </View>
        </ScrollView>
      );
  }
}


function mapStateToProps(state) {
  return {
    auth: state.auth,
    posts: state.posts,
    users: state.user,
    router: state.routerReducer
   }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...authActions, ...postActions}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(User)

const localStyles = StyleSheet.create({
    postsHeader: {
    padding: 20
  },
  uploadAvatar: {
    height: 100,
    width: 100,
    resizeMode: 'cover'
  },
  profileContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: 'white',
  },
  row: {
    flexDirection: 'row',
    width: fullWidth,
    padding: 20
  },
  column: {
    flexDirection: 'column',
    width: fullWidth,
    paddingRight: 20,
    paddingLeft: 20,
    paddingBottom: 20,
  },
  insideRow: {
    flex: 1,
  },
  insidePadding: {
    paddingLeft: 10,
    paddingRight: 10
  },
  pictureWidth: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'nowrap'
  },
});
var styles = {...localStyles, ...globalStyles};